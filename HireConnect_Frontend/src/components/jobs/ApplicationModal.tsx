import { useState, type FormEvent } from 'react';
import { CheckCircle2 } from 'lucide-react';
import type { Job } from '../../types';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Textarea } from '../ui/Textarea';
import { Input } from '../ui/Input';
import { FileUpload } from '../ui/FileUpload';
import { applicationService } from '../../services/applicationService';
import { useAuth } from '../../context/AuthContext';
import { errorMessages } from '../../utils/validation';
import { ApiError } from '../../services/apiClient';

interface ApplicationModalProps {
  job: Job;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ApplicationModal({ job, isOpen, onClose, onSuccess }: ApplicationModalProps) {
  const { currentUser } = useAuth();
  const [resumeFileName, setResumeFileName] = useState<string | undefined>(currentUser?.resume?.fileName);
  const [coverLetter, setCoverLetter] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const reset = () => {
    setCoverLetter('');
    setPortfolioUrl('');
    setLinkedinUrl('');
    setErrors({});
    setSubmitted(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (job.resumeRequired && !resumeFileName) next.resume = errorMessages.resumeRequired;
    setErrors(next);
    if (Object.keys(next).length > 0) return;

    if (!currentUser) return;

    setIsLoading(true);
    try {
      await applicationService.apply(
        { jobId: job.id, coverLetter, portfolioUrl, linkedinUrl, resumeFileName },
        { id: currentUser.id, name: currentUser.fullName, email: currentUser.email }
      );
      setSubmitted(true);
    } catch (err) {
      const message = err instanceof ApiError ? err.message : 'Something went wrong. Please try again.';
      setErrors({ form: message });
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <Modal isOpen={isOpen} onClose={handleClose} size="sm">
        <div className="flex flex-col items-center text-center py-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-full bg-success-light text-success mb-4">
            <CheckCircle2 size={26} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Application submitted!</h3>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Your application for {job.title} at {job.companyName} has been sent.
          </p>
          <Button
            className="mt-6"
            fullWidth
            onClick={() => {
              onSuccess();
              reset();
            }}
          >
            Done
          </Button>
        </div>
      </Modal>
    );
  }

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title={`Apply to ${job.title}`} size="md">
      {errors.form && <div className="mb-4 rounded-lg bg-danger-light text-danger text-sm px-4 py-3">{errors.form}</div>}
      <form onSubmit={handleSubmit} className="space-y-5">
        <FileUpload
          label={`Resume${job.resumeRequired ? '' : ' (optional)'}`}
          accept=".pdf,.doc,.docx"
          currentFileName={resumeFileName}
          onFileSelect={(file) => setResumeFileName(file.name)}
          onRemove={() => setResumeFileName(undefined)}
          hint="PDF or Word document, up to 5MB"
          error={errors.resume}
        />
        <Textarea
          label="Cover letter (optional)"
          value={coverLetter}
          onChange={(e) => setCoverLetter(e.target.value)}
          placeholder="Tell the employer why you're a great fit for this role..."
        />
        <Input
          label="Portfolio URL (optional)"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          placeholder="https://yourportfolio.com"
        />
        <Input
          label="LinkedIn URL (optional)"
          value={linkedinUrl}
          onChange={(e) => setLinkedinUrl(e.target.value)}
          placeholder="https://linkedin.com/in/yourname"
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="outline" fullWidth onClick={handleClose}>
            Cancel
          </Button>
          <Button type="submit" fullWidth isLoading={isLoading}>
            Submit Application
          </Button>
        </div>
      </form>
    </Modal>
  );
}
