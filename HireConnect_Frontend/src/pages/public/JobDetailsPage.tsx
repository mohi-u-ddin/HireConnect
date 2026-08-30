import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Bookmark,
  BadgeCheck,
  Calendar,
  DollarSign,
  Briefcase,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import type { Job } from '../../types';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { Breadcrumbs } from '../../components/layout/Breadcrumbs';
import { Avatar } from '../../components/ui/Avatar';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ErrorState } from '../../components/ui/EmptyState';
import { Skeleton } from '../../components/ui/Skeleton';
import { ApplicationModal } from '../../components/jobs/ApplicationModal';
import { jobService } from '../../services/jobService';
import { userService } from '../../services/userService';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import {
  formatSalary,
  formatRelativeTime,
  formatDate,
  formatEmploymentType,
  formatExperienceLevel,
  formatWorkArrangement,
} from '../../utils/format';

export function JobDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, currentUser, role } = useAuth();
  const { showToast } = useToast();

  const [job, setJob] = useState<Job | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [isSaved, setIsSaved] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [applyModalOpen, setApplyModalOpen] = useState(false);

  const load = () => {
    if (!id) return;
    setStatus('loading');
    jobService
      .getJobById(id)
      .then((data) => {
        setJob(data);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
  };

  useEffect(load, [id]);

  useEffect(() => {
    if (isAuthenticated && role === 'JOB_SEEKER' && currentUser && id) {
      userService.getSavedJobIds(currentUser.id).then((ids) => setIsSaved(ids.includes(id)));
      applicationService.hasApplied(id, currentUser.id).then(setHasApplied);
    }
  }, [isAuthenticated, role, currentUser, id]);

  const handleToggleSave = async () => {
    if (!isAuthenticated || !currentUser) {
      showToast('Log in as a job seeker to save jobs.', 'info');
      return;
    }
    const saved = await userService.toggleSavedJob(currentUser.id, id!);
    setIsSaved(saved);
    showToast(saved ? 'Job saved.' : 'Job removed from saved jobs.', 'success');
  };

  const handleApplyClick = () => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: `/jobs/${id}` } });
      return;
    }
    if (role !== 'JOB_SEEKER') {
      showToast('Only job seekers can apply for jobs.', 'info');
      return;
    }
    setApplyModalOpen(true);
  };

  const isOwner = role === 'EMPLOYER' && currentUser && job && currentUser.id === job.employerId;

  if (status === 'loading') {
    return (
      <PublicLayout>
        <div className="container-page py-10 space-y-6">
          <Skeleton className="h-4 w-64" />
          <div className="grid lg:grid-cols-[1fr_320px] gap-8">
            <div className="space-y-4">
              <Skeleton className="h-8 w-2/3" />
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-40 w-full" />
            </div>
            <Skeleton className="h-64 w-full" />
          </div>
        </div>
      </PublicLayout>
    );
  }

  if (status === 'error' || !job) {
    return (
      <PublicLayout>
        <div className="container-page py-10">
          <ErrorState onRetry={load} />
        </div>
      </PublicLayout>
    );
  }

  return (
    <PublicLayout>
      <div className="container-page py-6">
        <Breadcrumbs items={[{ label: 'Jobs', to: '/jobs' }, { label: job.title }]} />
      </div>

      <div className="container-page pb-16">
        <div className="grid lg:grid-cols-[1fr_320px] gap-8">
          <div className="min-w-0">
            <Card>
              <div className="flex items-start gap-4">
                <Avatar name={job.companyName} imageUrl={job.companyLogoUrl} shape="square" size="xl" />
                <div className="min-w-0 flex-1">
                  <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">{job.title}</h1>
                  <div className="flex flex-wrap items-center gap-1.5 mt-1.5 text-slate-500 dark:text-slate-400">
                    <Link to={`/companies/${job.companyId}`} className="font-medium hover:text-primary transition-colors">
                      {job.companyName}
                    </Link>
                    {job.companyVerified && (
                      <span title="Verified company">
                        <BadgeCheck size={15} className="text-secondary" />
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <Badge color="primary" icon={<Briefcase size={11} />}>
                      {formatEmploymentType(job.employmentType)}
                    </Badge>
                    <Badge color="neutral">{formatExperienceLevel(job.experienceLevel)}</Badge>
                    <Badge color="secondary">{formatWorkArrangement(job.workArrangement)}</Badge>
                  </div>
                </div>
                <button
                  onClick={handleToggleSave}
                  aria-label={isSaved ? 'Remove from saved jobs' : 'Save job'}
                  className={`hidden sm:flex p-2.5 rounded-lg flex-shrink-0 ${isSaved ? 'text-primary bg-primary-light' : 'text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                >
                  <Bookmark size={20} fill={isSaved ? 'currentColor' : 'none'} />
                </button>
              </div>
            </Card>

            <Card className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Job Description</h2>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{job.description}</p>
            </Card>

            <Card className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Responsibilities</h2>
              <ul className="space-y-2.5">
                {job.responsibilities.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            <Card className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Requirements</h2>
              <ul className="space-y-2.5">
                {job.requirements.map((item, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                    <CheckCircle2 size={16} className="text-primary flex-shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
            </Card>

            {job.benefits.length > 0 && (
              <Card className="mt-6">
                <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Benefits</h2>
                <ul className="space-y-2.5">
                  {job.benefits.map((item, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                      <CheckCircle2 size={16} className="text-success flex-shrink-0 mt-0.5" />
                      {item}
                    </li>
                  ))}
                </ul>
              </Card>
            )}

            <Card className="mt-6">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">Skills</h2>
              <div className="flex flex-wrap gap-2">
                {job.skills.map((skill) => (
                  <Badge key={skill} color="neutral">
                    {skill}
                  </Badge>
                ))}
              </div>
            </Card>
          </div>

          <aside>
            <div className="sticky top-24 space-y-4">
              <Card>
                {isOwner ? (
                  <div className="flex flex-col gap-2.5">
                    <Link to={`/employer/jobs/${job.id}/edit`}>
                      <Button fullWidth>Edit Job</Button>
                    </Link>
                    <Link to="/employer/applications">
                      <Button fullWidth variant="outline">
                        View Applications
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="flex flex-col gap-2.5">
                    <Button fullWidth size="lg" onClick={handleApplyClick} disabled={hasApplied}>
                      {hasApplied ? 'Application Submitted' : 'Apply Now'}
                    </Button>
                    <Button fullWidth variant="outline" onClick={handleToggleSave}>
                      <Bookmark size={16} className="mr-1.5" fill={isSaved ? 'currentColor' : 'none'} />
                      {isSaved ? 'Saved' : 'Save Job'}
                    </Button>
                  </div>
                )}
              </Card>

              <Card>
                <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Job Overview</h3>
                <dl className="space-y-3.5 text-sm">
                  <OverviewRow icon={Briefcase} label="Company" value={job.companyName} />
                  <OverviewRow icon={MapPin} label="Location" value={job.location} />
                  <OverviewRow icon={Clock} label="Employment Type" value={formatEmploymentType(job.employmentType)} />
                  <OverviewRow icon={Briefcase} label="Experience" value={formatExperienceLevel(job.experienceLevel)} />
                  <OverviewRow icon={DollarSign} label="Salary" value={formatSalary(job.salaryMin, job.salaryMax, job.currency)} />
                  <OverviewRow icon={Calendar} label="Posted" value={formatRelativeTime(job.postedAt)} />
                  {job.applicationDeadline && (
                    <OverviewRow icon={Calendar} label="Deadline" value={formatDate(job.applicationDeadline)} />
                  )}
                </dl>
              </Card>
            </div>
          </aside>
        </div>
      </div>

      {job && (
        <ApplicationModal
          job={job}
          isOpen={applyModalOpen}
          onClose={() => setApplyModalOpen(false)}
          onSuccess={() => {
            setHasApplied(true);
            setApplyModalOpen(false);
            showToast('Application submitted successfully.', 'success');
          }}
        />
      )}
    </PublicLayout>
  );
}

function OverviewRow({ icon: Icon, label, value }: { icon: typeof MapPin; label: string; value: string }) {
  return (
    <div className="flex items-start gap-2.5">
      <Icon size={15} className="text-slate-400 mt-0.5 flex-shrink-0" />
      <div>
        <dt className="text-xs text-slate-400">{label}</dt>
        <dd className="text-slate-700 dark:text-slate-200 font-medium">{value}</dd>
      </div>
    </div>
  );
}
