import { useEffect, useState } from 'react';
import { Search, Building2 } from 'lucide-react';
import type { Company } from '../../types';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { CompanyCard } from '../../components/jobs/CompanyCard';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState, ErrorState } from '../../components/ui/EmptyState';
import { companyService } from '../../services/companyService';

export function CompaniesPage() {
  const [companies, setCompanies] = useState<Company[]>([]);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [keyword, setKeyword] = useState('');

  const load = () => {
    setStatus('loading');
    companyService
      .getCompanies()
      .then((data) => {
        setCompanies(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, []);

  const filtered = companies.filter(
    (c) =>
      c.name.toLowerCase().includes(keyword.toLowerCase()) ||
      c.industry.toLowerCase().includes(keyword.toLowerCase())
  );

  return (
    <PublicLayout>
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-10">
        <div className="container-page">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Explore Companies</h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Discover companies that are actively hiring on HireFlow
          </p>
          <div className="mt-5 max-w-md">
            <Input
              icon={<Search size={16} />}
              placeholder="Search companies by name or industry"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="container-page py-10">
        {status === 'error' && <ErrorState onRetry={load} />}

        {status === 'loading' && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        )}

        {status === 'success' && filtered.length === 0 && (
          <EmptyState icon={Building2} title="No companies found" description="Try a different search term." />
        )}

        {status === 'success' && filtered.length > 0 && (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </div>
    </PublicLayout>
  );
}
