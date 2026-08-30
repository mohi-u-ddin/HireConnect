import { useState, type FormEvent } from 'react';
import { X, Plus } from 'lucide-react';
import type { EmploymentType, ExperienceLevel, Job, WorkArrangement } from '../../types';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import { jobCategories } from '../../data/mock/jobs';
import { formatEmploymentType, formatExperienceLevel, formatWorkArrangement } from '../../utils/format';
import { errorMessages } from '../../utils/validation';

export interface JobFormValues {
  title: string;
  category: string;
  description: string;
  responsibilities: string;
  requirements: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  location: string;
  workArrangement: WorkArrangement;
  salaryMin: string;
  salaryMax: string;
  currency: string;
  skills: string[];
  applicationDeadline: string;
  applicationEmail: string;
  resumeRequired: boolean;
}

const employmentTypeOptions = (['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP', 'TEMPORARY'] as EmploymentType[]).map((v) => ({
  value: v,
  label: formatEmploymentType(v),
}));
const experienceLevelOptions = (
  ['ENTRY_LEVEL', 'MID_LEVEL', 'MID_SENIOR_LEVEL', 'SENIOR_LEVEL', 'LEAD', 'DIRECTOR'] as ExperienceLevel[]
).map((v) => ({ value: v, label: formatExperienceLevel(v) }));
const workArrangementOptions = (['ON_SITE', 'REMOTE', 'HYBRID'] as WorkArrangement[]).map((v) => ({
  value: v,
  label: formatWorkArrangement(v),
}));
const categoryOptions = jobCategories.map((c) => ({ value: c, label: c }));

export function defaultJobFormValues(job?: Job): JobFormValues {
  if (!job) {
    return {
      title: '',
      category: '',
      description: '',
      responsibilities: '',
      requirements: '',
      employmentType: 'FULL_TIME',
      experienceLevel: 'MID_LEVEL',
      location: '',
      workArrangement: 'ON_SITE',
      salaryMin: '',
      salaryMax: '',
      currency: 'USD',
      skills: [],
      applicationDeadline: '',
      applicationEmail: '',
      resumeRequired: true,
    };
  }
  return {
    title: job.title,
    category: job.category,
    description: job.description,
    responsibilities: job.responsibilities.join('\n'),
    requirements: job.requirements.join('\n'),
    employmentType: job.employmentType,
    experienceLevel: job.experienceLevel,
    location: job.location,
    workArrangement: job.workArrangement,
    salaryMin: String(job.salaryMin),
    salaryMax: String(job.salaryMax),
    currency: job.currency,
    skills: job.skills,
    applicationDeadline: job.applicationDeadline?.slice(0, 10) ?? '',
    applicationEmail: job.applicationEmail ?? '',
    resumeRequired: job.resumeRequired,
  };
}

interface JobFormProps {
  initialValues: JobFormValues;
  onSubmit: (values: JobFormValues, action: 'draft' | 'publish') => Promise<void>;
  onCancel: () => void;
  isSubmitting: boolean;
  submitLabel?: { draft: string; publish: string };
}

export function JobForm({ initialValues, onSubmit, onCancel, isSubmitting, submitLabel }: JobFormProps) {
  const [values, setValues] = useState<JobFormValues>(initialValues);
  const [skillInput, setSkillInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const set = <K extends keyof JobFormValues>(key: K, val: JobFormValues[K]) => setValues((v) => ({ ...v, [key]: val }));

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !values.skills.includes(trimmed)) set('skills', [...values.skills, trimmed]);
    setSkillInput('');
  };

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!values.title.trim()) next.title = errorMessages.required;
    if (!values.category) next.category = errorMessages.required;
    if (!values.description.trim()) next.description = errorMessages.required;
    if (!values.location.trim()) next.location = errorMessages.required;
    if (!values.salaryMin) next.salaryMin = errorMessages.required;
    if (!values.salaryMax) next.salaryMax = errorMessages.required;
    if (values.salaryMin && values.salaryMax && Number(values.salaryMax) <= Number(values.salaryMin)) {
      next.salaryMax = errorMessages.salaryOrder;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = (e: FormEvent, action: 'draft' | 'publish') => {
    e.preventDefault();
    if (action === 'publish' && !validate()) return;
    onSubmit(values, action);
  };

  return (
    <form className="space-y-6">
      <Card>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Basic Information</h2>
        <div className="space-y-4">
          <Input label="Job title" value={values.title} onChange={(e) => set('title', e.target.value)} error={errors.title} placeholder="e.g. Senior Java Developer" />
          <Select label="Category" options={categoryOptions} value={values.category} onChange={(e) => set('category', e.target.value)} placeholder="Select a category" error={errors.category} />
          <Textarea label="Description" value={values.description} onChange={(e) => set('description', e.target.value)} error={errors.description} placeholder="Describe the role..." />
          <Textarea
            label="Responsibilities"
            value={values.responsibilities}
            onChange={(e) => set('responsibilities', e.target.value)}
            hint="One responsibility per line"
            placeholder={'Design and implement REST APIs\nCollaborate with cross-functional teams'}
          />
          <Textarea
            label="Requirements"
            value={values.requirements}
            onChange={(e) => set('requirements', e.target.value)}
            hint="One requirement per line"
            placeholder={'3+ years of experience with Java\nStrong understanding of SQL'}
          />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Job Details</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Select label="Employment type" options={employmentTypeOptions} value={values.employmentType} onChange={(e) => set('employmentType', e.target.value as EmploymentType)} />
          <Select label="Experience level" options={experienceLevelOptions} value={values.experienceLevel} onChange={(e) => set('experienceLevel', e.target.value as ExperienceLevel)} />
          <Input label="Location" value={values.location} onChange={(e) => set('location', e.target.value)} error={errors.location} placeholder="City, Country" />
          <Select label="Work arrangement" options={workArrangementOptions} value={values.workArrangement} onChange={(e) => set('workArrangement', e.target.value as WorkArrangement)} />
          <Input label="Salary minimum" type="number" value={values.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} error={errors.salaryMin} placeholder="1000" />
          <Input label="Salary maximum" type="number" value={values.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} error={errors.salaryMax} placeholder="1800" />
          <Select label="Currency" options={[{ value: 'USD', label: 'USD' }, { value: 'PKR', label: 'PKR' }, { value: 'EUR', label: 'EUR' }]} value={values.currency} onChange={(e) => set('currency', e.target.value)} />
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Skills</h2>
        <div className="flex flex-wrap gap-2 mb-2.5">
          {values.skills.map((skill) => (
            <Badge key={skill} color="primary">
              {skill}
              <button type="button" onClick={() => set('skills', values.skills.filter((s) => s !== skill))} aria-label={`Remove ${skill}`} className="ml-0.5">
                <X size={11} />
              </button>
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="e.g. Java, Spring Boot, PostgreSQL"
          />
          <Button type="button" variant="outline" onClick={addSkill}>
            <Plus size={15} />
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Application Settings</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          <Input label="Application deadline" type="date" value={values.applicationDeadline} onChange={(e) => set('applicationDeadline', e.target.value)} />
          <Input label="Application email" type="email" value={values.applicationEmail} onChange={(e) => set('applicationEmail', e.target.value)} placeholder="hiring@company.com" />
        </div>
        <label className="flex items-center gap-2.5 text-sm text-slate-600 dark:text-slate-300 mt-4 cursor-pointer">
          <input
            type="checkbox"
            checked={values.resumeRequired}
            onChange={(e) => set('resumeRequired', e.target.checked)}
            className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-primary focus:ring-primary/30"
          />
          Require resume upload for applicants
        </label>
      </Card>

      <div className="flex flex-col sm:flex-row justify-end gap-3">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="button" variant="outline" onClick={(e) => handleSubmit(e as any, 'draft')} isLoading={isSubmitting}>
          {submitLabel?.draft ?? 'Save Draft'}
        </Button>
        <Button type="button" onClick={(e) => handleSubmit(e as any, 'publish')} isLoading={isSubmitting}>
          {submitLabel?.publish ?? 'Publish Job'}
        </Button>
      </div>
    </form>
  );
}
