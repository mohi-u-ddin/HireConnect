import { useEffect, useState, type FormEvent } from 'react';
import { Globe, MapPin, Users, Calendar, BadgeCheck, Building2 } from 'lucide-react';
import type { Company } from '../../types';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Card } from '../../components/ui/Card';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { ProfileSkeleton } from '../../components/ui/Skeleton';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { companyService } from '../../services/companyService';

const sizeOptions = ['1-10 employees', '11-50 employees', '51-200 employees', '201-500 employees', '501-1000 employees', '1000+ employees'].map((v) => ({ value: v, label: v }));

export function CompanyProfilePage() {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [company, setCompany] = useState<Company | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    website: '',
    industry: '',
    companySize: '11-50 employees',
    location: '',
    foundedYear: '',
  });

  useEffect(() => {
    if (!currentUser) return;
    companyService.getCompanyByEmployer(currentUser.id).then((data) => {
      if (data) {
        setCompany(data);
        setForm({
          name: data.name,
          description: data.description,
          website: data.website ?? '',
          industry: data.industry,
          companySize: data.companySize,
          location: data.location,
          foundedYear: data.foundedYear ? String(data.foundedYear) : '',
        });
      }
      setIsLoading(false);
    });
  }, [currentUser]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    setIsSaving(true);
    try {
      const payload = {
        name: form.name,
        description: form.description,
        website: form.website,
        industry: form.industry,
        companySize: form.companySize,
        location: form.location,
        foundedYear: form.foundedYear ? Number(form.foundedYear) : undefined,
        employerId: currentUser.id,
      };
      if (company) {
        const updated = await companyService.updateCompany(company.id, payload);
        setCompany(updated);
      } else {
        const created = await companyService.createCompany(payload);
        setCompany(created);
      }
      showToast('Company profile updated.', 'success');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout title="Company Profile">
        <ProfileSkeleton />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout title="Company Profile">
      <div className="grid lg:grid-cols-[1fr_320px] gap-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <Card>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-4">Company Information</h2>
            <div className="space-y-4">
              <Input label="Company name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. TechNova Solutions" />
              <Textarea label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Tell candidates about your company..." />
              <Input label="Website" value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://yourcompany.com" />
              <div className="grid sm:grid-cols-2 gap-4">
                <Input label="Industry" value={form.industry} onChange={(e) => setForm({ ...form, industry: e.target.value })} placeholder="e.g. Information Technology" />
                <Select label="Company size" options={sizeOptions} value={form.companySize} onChange={(e) => setForm({ ...form, companySize: e.target.value })} />
                <Input label="Location" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, Country" />
                <Input label="Founded year" type="number" value={form.foundedYear} onChange={(e) => setForm({ ...form, foundedYear: e.target.value })} placeholder="2020" />
              </div>
            </div>
          </Card>
          <div className="flex justify-end">
            <Button type="submit" isLoading={isSaving}>
              Save Changes
            </Button>
          </div>
        </form>

        <div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3 uppercase tracking-wide">Preview</p>
          <Card>
            <div className="flex items-start gap-3">
              <Avatar name={form.name || 'Company'} shape="square" size="lg" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-semibold text-slate-900 dark:text-white truncate">{form.name || 'Your Company'}</h3>
                  {company?.verified && <BadgeCheck size={14} className="text-secondary flex-shrink-0" />}
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 truncate">{form.industry || 'Industry'}</p>
              </div>
            </div>
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 line-clamp-3">
              {form.description || 'Your company description will appear here.'}
            </p>
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs text-slate-400">
              <p className="flex items-center gap-1.5">
                <MapPin size={12} /> {form.location || 'Location'}
              </p>
              <p className="flex items-center gap-1.5">
                <Users size={12} /> {form.companySize}
              </p>
              {form.foundedYear && (
                <p className="flex items-center gap-1.5">
                  <Calendar size={12} /> Founded {form.foundedYear}
                </p>
              )}
              {form.website && (
                <p className="flex items-center gap-1.5">
                  <Globe size={12} /> {form.website}
                </p>
              )}
            </div>
          </Card>
          {!company && (
            <p className="mt-3 text-xs text-slate-400 flex items-center gap-1.5">
              <Building2 size={12} /> Save to create your company profile.
            </p>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
