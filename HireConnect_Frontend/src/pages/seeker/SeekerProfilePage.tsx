import { useState, type FormEvent } from 'react';
import { X, Plus, Camera } from 'lucide-react';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { FileUpload } from '../../components/ui/FileUpload';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { userService } from '../../services/userService';
import { formatDate } from '../../utils/format';

export function SeekerProfilePage() {
  const { currentUser, updateCurrentUser } = useAuth();
  const { showToast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  const [form, setForm] = useState({
    fullName: currentUser?.fullName ?? '',
    phone: currentUser?.phone ?? '',
    location: currentUser?.location ?? '',
    headline: currentUser?.headline ?? '',
    about: currentUser?.about ?? '',
  });
  const [skills, setSkills] = useState<string[]>(currentUser?.skills ?? []);
  const [resume, setResume] = useState(currentUser?.resume);

  if (!currentUser) return <DashboardLayout title="Profile"><ProfileSkeleton /></DashboardLayout>;

  const addSkill = () => {
    const trimmed = skillInput.trim();
    if (trimmed && !skills.includes(trimmed)) {
      setSkills([...skills, trimmed]);
    }
    setSkillInput('');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const updated = await userService.updateMe(currentUser.id, { ...form, skills, resume });
      updateCurrentUser(updated);
      showToast('Profile updated.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <DashboardLayout title="Profile">
      <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
        <Card>
          <div className="flex items-center gap-5">
            <div className="relative">
              <Avatar name={form.fullName} size="xl" />
              <button
                type="button"
                aria-label="Change profile photo"
                className="absolute -bottom-1 -right-1 flex items-center justify-center w-7 h-7 rounded-full bg-primary text-white shadow-card"
              >
                <Camera size={13} />
              </button>
            </div>
            <div>
              <h2 className="font-semibold text-slate-900 dark:text-white">{form.fullName || 'Your name'}</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">{currentUser.email}</p>
              {currentUser.profileCompletion != null && (
                <div className="mt-2 flex items-center gap-2">
                  <div className="w-32 h-1.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <div className="h-full bg-success rounded-full" style={{ width: `${currentUser.profileCompletion}%` }} />
                  </div>
                  <span className="text-xs text-slate-400">{currentUser.profileCompletion}% complete</span>
                </div>
              )}
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Personal Information</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <Input label="Full name" value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
            <Input label="Email" value={currentUser.email} disabled hint="Email cannot be changed" />
            <Input label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="+92 300 1234567" />
            <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Professional Information</h2>
          <div className="space-y-4">
            <Input
              label="Professional headline"
              value={form.headline}
              onChange={(e) => setForm({ ...form, headline: e.target.value })}
              placeholder="e.g. Backend Engineer | Java & Spring Boot"
            />
            <Textarea
              label="About"
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
              placeholder="Tell employers a bit about yourself..."
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Skills</label>
              <div className="flex flex-wrap gap-2 mb-2.5">
                {skills.map((skill) => (
                  <Badge key={skill} color="primary">
                    {skill}
                    <button
                      type="button"
                      onClick={() => setSkills(skills.filter((s) => s !== skill))}
                      aria-label={`Remove ${skill}`}
                      className="ml-0.5"
                    >
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
                  placeholder="Add a skill and press Enter"
                />
                <Button type="button" variant="outline" onClick={addSkill}>
                  <Plus size={15} />
                </Button>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Resume</h2>
          {resume ? (
            <div className="flex items-center justify-between rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{resume.fileName}</p>
                <p className="text-xs text-slate-400">Uploaded {formatDate(resume.uploadedAt)}</p>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs font-medium text-primary hover:underline cursor-pointer">
                  Replace
                  <input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) setResume({ fileName: file.name, uploadedAt: new Date().toISOString() });
                    }}
                  />
                </label>
                <button type="button" className="text-xs font-medium text-slate-500 hover:underline">
                  Download
                </button>
                <button type="button" onClick={() => setResume(undefined)} className="text-xs font-medium text-danger hover:underline">
                  Delete
                </button>
              </div>
            </div>
          ) : (
            <FileUpload
              accept=".pdf,.doc,.docx"
              onFileSelect={(file) => setResume({ fileName: file.name, uploadedAt: new Date().toISOString() })}
              hint="PDF or Word document, up to 5MB"
            />
          )}
        </Card>

        <div className="flex justify-end gap-3">
          <Button type="submit" isLoading={isSaving}>
            Save Changes
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
}
