import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from 'lucide-react';
import type { Job, JobFilters } from '../../types';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { SearchBar } from '../../components/ui/SearchBar';
import { FilterPanel } from '../../components/jobs/FilterPanel';
import { JobCard } from '../../components/jobs/JobCard';
import { JobCardSkeleton } from '../../components/ui/Skeleton';
import { Pagination } from '../../components/ui/Pagination';
import { Select } from '../../components/ui/Select';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { SearchX } from 'lucide-react';

const sortOptions = [
  { value: 'relevant', label: 'Most Relevant' },
  { value: 'newest', label: 'Newest' },
  { value: 'salary_desc', label: 'Salary: High to Low' },
  { value: 'salary_asc', label: 'Salary: Low to High' },
];

export function JobsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [savedJobIds, setSavedJobIds] = useState<string[]>([]);

  const { isAuthenticated, currentUser, role } = useAuth();
  const { showToast } = useToast();

  const filters: JobFilters = useMemo(
    () => ({
      keyword: searchParams.get('keyword') ?? undefined,
      location: searchParams.get('location') ?? undefined,
      category: searchParams.get('category') ? [searchParams.get('category')!] : undefined,
      sort: (searchParams.get('sort') as JobFilters['sort']) ?? 'relevant',
      page: Number(searchParams.get('page') ?? 1),
      pageSize: 9,
    }),
    [searchParams]
  );

  const load = useCallback(() => {
    setStatus('loading');
    jobService
      .getJobs(filters)
      .then((res) => {
        setJobs(res.items);
        setTotal(res.total);
        setTotalPages(res.totalPages);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  }, [filters]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (isAuthenticated && role === 'JOB_SEEKER' && currentUser) {
      userService.getSavedJobIds(currentUser.id).then(setSavedJobIds);
    }
  }, [isAuthenticated, role, currentUser]);

  const updateParams = (updates: Record<string, string | undefined>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => {
      if (value) next.set(key, value);
      else next.delete(key);
    });
    next.delete('page');
    setSearchParams(next);
  };

  const handleFilterChange = (newFilters: JobFilters) => {
    const next = new URLSearchParams(searchParams);
    next.delete('employmentType');
    next.delete('experienceLevel');
    next.delete('workArrangement');
    next.delete('category');
    newFilters.employmentType?.forEach((v) => next.append('employmentType', v));
    newFilters.experienceLevel?.forEach((v) => next.append('experienceLevel', v));
    newFilters.workArrangement?.forEach((v) => next.append('workArrangement', v));
    newFilters.category?.forEach((v) => next.append('category', v));
    next.delete('page');
    setSearchParams(next);
  };

  const clearFilters = () => {
    setSearchParams(
      new URLSearchParams({
        ...(filters.keyword ? { keyword: filters.keyword } : {}),
        ...(filters.location ? { location: filters.location } : {}),
      })
    );
  };

  const handleToggleSave = async (jobId: string) => {
    if (!isAuthenticated || !currentUser) {
      showToast('Log in as a job seeker to save jobs.', 'info');
      return;
    }
    const saved = await userService.toggleSavedJob(currentUser.id, jobId);
    setSavedJobIds((prev) => (saved ? [...prev, jobId] : prev.filter((id) => id !== jobId)));
    showToast(saved ? 'Job saved.' : 'Job removed from saved jobs.', 'success');
  };

  const activeFilters: JobFilters = {
    employmentType: searchParams.getAll('employmentType') as JobFilters['employmentType'],
    experienceLevel: searchParams.getAll('experienceLevel') as JobFilters['experienceLevel'],
    workArrangement: searchParams.getAll('workArrangement') as JobFilters['workArrangement'],
    category: searchParams.getAll('category'),
  };

  return (
    <PublicLayout>
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-6">
        <div className="container-page">
          <SearchBar
            initialKeyword={filters.keyword}
            initialLocation={filters.location}
            onSearch={(keyword, location) => updateParams({ keyword, location })}
          />
        </div>
      </div>

      <div className="container-page py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {status === 'loading' ? 'Searching...' : `${total} job${total !== 1 ? 's' : ''} found`}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileFiltersOpen(true)}
              className="lg:hidden flex items-center gap-1.5 text-sm font-medium text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-700 rounded-lg px-3 py-2"
            >
              <SlidersHorizontal size={14} /> Filters
            </button>
            <Select
              options={sortOptions}
              value={filters.sort}
              onChange={(e) => updateParams({ sort: e.target.value })}
              className="w-48"
            />
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <FilterPanel filters={activeFilters} onChange={handleFilterChange} onClear={clearFilters} />
            </div>
          </aside>

          <div>
            {status === 'error' && <ErrorState onRetry={load} />}

            {status === 'loading' && (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <JobCardSkeleton key={i} />
                ))}
              </div>
            )}

            {status === 'success' && jobs.length === 0 && (
              <EmptyState
                icon={SearchX}
                title="No jobs found"
                description="Try adjusting your search or filters to find more opportunities."
                actionLabel="Clear Filters"
                onAction={clearFilters}
              />
            )}

            {status === 'success' && jobs.length > 0 && (
              <>
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {jobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      isSaved={savedJobIds.includes(job.id)}
                      onToggleSave={role === 'JOB_SEEKER' || !isAuthenticated ? handleToggleSave : undefined}
                    />
                  ))}
                </div>
                <div className="mt-10">
                  <Pagination
                    page={filters.page ?? 1}
                    totalPages={totalPages}
                    onPageChange={(p) => updateParams({ page: String(p) })}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <Modal isOpen={mobileFiltersOpen} onClose={() => setMobileFiltersOpen(false)} title="Filters" size="sm">
        <FilterPanel filters={activeFilters} onChange={handleFilterChange} onClear={clearFilters} />
        <div className="mt-6 flex gap-3">
          <Button variant="outline" fullWidth onClick={() => setMobileFiltersOpen(false)}>
            <X size={14} className="mr-1" /> Close
          </Button>
          <Button fullWidth onClick={() => setMobileFiltersOpen(false)}>
            Show Results
          </Button>
        </div>
      </Modal>
    </PublicLayout>
  );
}
