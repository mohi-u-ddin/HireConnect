import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { JobForm, defaultJobFormValues, type JobFormValues } from '../../components/jobs/JobForm';
import { jobService } from '../../services/jobService';
import { companyService } from '../../services/companyService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export function CreateJobPage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (values: JobFormValues, action: 'draft' | 'publish') => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const company = await companyService.getCompanyByEmployer(currentUser.id);
      await jobService.createJob({
        title: values.title,
        companyId: company?.id ?? 'c1',
        companyName: company?.name ?? 'Your Company',
        companyVerified: company?.verified,
        category: values.category,
        description: values.description,
        responsibilities: values.responsibilities.split('\n').filter(Boolean),
        requirements: values.requirements.split('\n').filter(Boolean),
        benefits: [],
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
        employerId: currentUser.id,
      });
      showToast(action === 'draft' ? 'Job saved as draft.' : 'Job published successfully.', 'success');
      navigate('/employer/jobs');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Post a Job">
      <div className="max-w-3xl">
        <JobForm
          initialValues={defaultJobFormValues()}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/employer/jobs')}
          isSubmitting={isSubmitting}
        />
      </div>
    </DashboardLayout>
  );
}
