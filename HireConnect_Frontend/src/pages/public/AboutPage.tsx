import { Target, Users, Sparkles } from 'lucide-react';
import { PublicLayout } from '../../components/layout/PublicLayout';
import { platformStats } from '../../data/mock/dashboard';

const values = [
  { icon: Target, title: 'Focused', description: 'We help you find roles that actually match your skills and goals, without the noise.' },
  { icon: Users, title: 'People-first', description: 'Behind every application and job post is a person. We design for that.' },
  { icon: Sparkles, title: 'Modern', description: 'A clean, fast platform built with the same care as the products you use every day.' },
];

export function AboutPage() {
  return (
    <PublicLayout>
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 py-16">
        <div className="container-page max-w-2xl">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">About HireConnect</h1>
          <p className="mt-4 text-slate-600 dark:text-slate-300">
            HireConnect is a modern recruitment platform built to connect ambitious job seekers with companies
            that are hiring right now. We believe finding your next role &mdash; or your next hire &mdash;
            shouldn&apos;t feel like a chore.
          </p>
        </div>
      </div>

      <div className="container-page py-16">
        <div className="grid sm:grid-cols-3 gap-6">
          {values.map((v) => (
            <div key={v.title} className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6">
              <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light dark:bg-primary/15 text-primary-700 dark:text-primary-100 mb-4">
                <v.icon size={18} />
              </div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{v.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{v.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8 text-center border-t border-slate-200 dark:border-slate-800 pt-12">
          {[
            [platformStats.activeJobs, 'Active Jobs'],
            [platformStats.companies, 'Companies'],
            [platformStats.jobSeekers, 'Job Seekers'],
            [platformStats.successfulHires, 'Successful Hires'],
          ].map(([value, label]) => (
            <div key={label}>
              <p className="text-2xl font-bold text-primary">{value}</p>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{label}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
