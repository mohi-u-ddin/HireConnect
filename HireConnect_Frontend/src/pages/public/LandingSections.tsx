import { Link, useNavigate } from 'react-router-dom';
import {
  Code2,
  Palette,
  Megaphone,
  LineChart,
  Handshake,
  Database,
  Cloud,
  Headphones,
  Compass,
  Send,
  Award,
} from 'lucide-react';
import { SearchBar } from '../../components/ui/SearchBar';
import { popularSearches } from '../../data/mock/jobs';
import { platformStats } from '../../data/mock/dashboard';

const categories = [
  { label: 'Software Development', icon: Code2, count: '3,240' },
  { label: 'Design', icon: Palette, count: '890' },
  { label: 'Marketing', icon: Megaphone, count: '1,120' },
  { label: 'Finance', icon: LineChart, count: '640' },
  { label: 'Sales', icon: Handshake, count: '980' },
  { label: 'Data Science', icon: Database, count: '560' },
  { label: 'DevOps', icon: Cloud, count: '410' },
  { label: 'Customer Support', icon: Headphones, count: '720' },
];

const steps = [
  { number: '01', title: 'Discover', description: 'Find opportunities that match your skills.', icon: Compass },
  { number: '02', title: 'Apply', description: 'Submit your application easily.', icon: Send },
  { number: '03', title: 'Get Hired', description: 'Connect with companies and start your next chapter.', icon: Award },
];

const stats = [
  { value: platformStats.activeJobs, label: 'Active Jobs' },
  { value: platformStats.companies, label: 'Companies' },
  { value: platformStats.jobSeekers, label: 'Job Seekers' },
  { value: platformStats.successfulHires, label: 'Successful Hires' },
];

export function Hero() {
  const navigate = useNavigate();

  const handleSearch = (keyword: string, location: string) => {
    const params = new URLSearchParams();
    if (keyword) params.set('keyword', keyword);
    if (location) params.set('location', location);
    navigate(`/jobs?${params.toString()}`);
  };

  return (
    <section className="relative overflow-hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
      <div className="absolute inset-0 bg-gradient-to-br from-primary-light/60 dark:from-primary/10 via-transparent to-transparent" />
      <div className="container-page relative py-16 sm:py-24">
        <div className="max-w-3xl">
          <span className="inline-flex items-center rounded-full bg-primary-light dark:bg-primary/15 text-primary-700 dark:text-primary-100 text-xs font-semibold px-3 py-1 mb-5">
            Trusted by 4,000+ companies
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 dark:text-white leading-tight text-balance">
            Find your next opportunity.
            <br />
            <span className="text-primary">Build your next great team.</span>
          </h1>
          <p className="mt-5 text-lg text-slate-600 dark:text-slate-300 max-w-xl">
            HireConnect connects ambitious job seekers with companies that are hiring right now &mdash; no clutter, no noise.
          </p>
        </div>

        <div className="mt-8 max-w-2xl">
          <SearchBar onSearch={handleSearch} size="large" />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">Popular:</span>
          {popularSearches.map((term) => (
            <Link
              key={term}
              to={`/jobs?keyword=${encodeURIComponent(term)}`}
              className="text-sm px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-primary hover:text-primary transition-colors bg-white dark:bg-slate-900"
            >
              {term}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function CategoriesSection() {
  return (
    <section className="container-page py-16">
      <div className="flex items-end justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Categories</h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Explore jobs by category</p>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.label}
            to={`/jobs?category=${encodeURIComponent(cat.label)}`}
            className="group flex flex-col gap-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 transition-shadow hover:shadow-card-hover"
          >
            <span className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary-light dark:bg-primary/15 text-primary-700 dark:text-primary-100 group-hover:bg-primary group-hover:text-white transition-colors">
              <cat.icon size={18} />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-white">{cat.label}</p>
              <p className="text-xs text-slate-400">{cat.count} jobs</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 py-16">
      <div className="container-page">
        <div className="text-center max-w-xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">How HireConnect Works</h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">Three simple steps to your next role</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-8">
          {steps.map((step) => (
            <div key={step.number} className="text-center px-4">
              <div className="mx-auto flex items-center justify-center w-14 h-14 rounded-full bg-primary-light dark:bg-primary/15 text-primary-700 dark:text-primary-100 mb-4">
                <step.icon size={22} />
              </div>
              <p className="text-xs font-bold text-primary tracking-wider">{step.number}</p>
              <h3 className="mt-1 text-lg font-semibold text-slate-900 dark:text-white">{step.title}</h3>
              <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function StatsSection() {
  return (
    <section className="bg-primary-dark py-16">
      <div className="container-page grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
        {stats.map((stat) => (
          <div key={stat.label}>
            <p className="text-3xl sm:text-4xl font-extrabold text-white">{stat.value}</p>
            <p className="mt-1 text-sm text-indigo-200">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

export function CtaSection() {
  return (
    <section className="container-page py-16">
      <div className="rounded-2xl bg-primary-light dark:bg-slate-900 border border-primary/10 dark:border-slate-800 px-6 sm:px-16 py-14 text-center">
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white text-balance">
          Ready to take the next step?
        </h2>
        <p className="mt-3 text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Find opportunities that match your ambition.
        </p>
        <div className="mt-7 flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link to="/jobs">
            <button className="w-full sm:w-auto px-6 py-3 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary-700 transition-colors">
              Find Jobs
            </button>
          </Link>
          <Link to="/register">
            <button className="w-full sm:w-auto px-6 py-3 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors">
              Post a Job
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}
