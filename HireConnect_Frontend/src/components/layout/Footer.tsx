import { Link } from 'react-router-dom';
import { Logo } from './Logo';

const columns = [
  {
    title: 'For Job Seekers',
    links: [
      { label: 'Browse Jobs', to: '/jobs' },
      { label: 'Browse Companies', to: '/companies' },
      { label: 'Create Account', to: '/register' },
    ],
  },
  {
    title: 'For Employers',
    links: [
      { label: 'Post a Job', to: '/register' },
      { label: 'Employer Login', to: '/login' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', to: '/about' },
      { label: 'Contact', to: '/about' },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 mt-auto">
      <div className="container-page py-12">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-8">
          <div className="col-span-2 sm:col-span-1">
            <Logo />
            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400 max-w-xs">
              The modern platform connecting great talent with great teams.
            </p>
          </div>
          {columns.map((col) => (
            <div key={col.title}>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">{col.title}</h4>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link to={link.to} className="text-sm text-slate-500 dark:text-slate-400 hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 pt-6 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>&copy; {new Date().getFullYear()} HireConnect. All rights reserved.</p>
          <p>Built as a frontend project.</p>
        </div>
      </div>
    </footer>
  );
}
