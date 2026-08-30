import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { JobForm, defaultJobFormValues, type JobFormValues } from '../../components/jobs/JobForm';
import { Skeleton } from '../../components/ui/Skeleton';
import { ErrorState } from '../../components/ui/EmptyState';
import { jobService } from '../../services/jobService';
import { useToast } from '../../context/ToastContext';
import type { Job } from '../../types';

export function EditJobPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [status, setStatus] = useState<'loading' | 'error' | 'success'>('loading');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async (values: JobFormValues, action: 'draft' | 'publish') => {
    if (!id) return;
    setIsSubmitting(true);
    try {
      await jobService.updateJob(id, {
        title: values.title,
        category: values.category,
        description: values.description,
        responsibilities: values.responsibilities.split('\n').filter(Boolean),
        requirements: values.requirements.split('\n').filter(Boolean),
        skills: values.skills,
        employmentType: values.employmentType,
        experienceLevel: values.experienceLevel,
        location: values.location,
        workArrangement: values.workArrangement,
        salaryMin: Number(values.salaryMin) || 0,
        salaryMax: Number(values.salaryMax) || 0,
        currency: values.currency,
        status: action === 'draft' ? 'DRAFT' : 'ACTIVE',
        applicationDeadline: values.applicationDeadline || undefined,
        applicationEmail: values.applicationEmail || undefined,
        resumeRequired: values.resumeRequired,
      });
      showToast('Job updated successfully.', 'success');
      navigate('/employer/jobs');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (status === 'loading') {
    return (
      <DashboardLayout title="Edit Job">
        <div className="max-w-3xl space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (status === 'error' || !job) {
    return (
      <DashboardLayout title="Edit Job">
        <ErrorState onRetry={load} />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Edit Job">
      <div className="max-w-3xl">
        <JobForm
          initialValues={defaultJobFormValues(job)}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/employer/jobs')}
          isSubmitting={isSubmitting}
          submitLabel={{ draft: 'Save as Draft', publish: 'Save Changes' }}
        />
      </div>
    </DashboardLayout>
  );
}
