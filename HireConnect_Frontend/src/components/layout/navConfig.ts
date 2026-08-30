import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard,
  Search,
  Bookmark,
  FileText,
  User,
  Settings,
  Briefcase,
  PlusCircle,
  Users,
  Building2,
  ClipboardList,
  BarChart3,
} from 'lucide-react';
import type { Role } from '../../types';

export interface NavItem {
  label: string;
  to: string;
  icon: LucideIcon;
}

export const seekerNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/seeker/dashboard', icon: LayoutDashboard },
  { label: 'Find Jobs', to: '/jobs', icon: Search },
  { label: 'Saved Jobs', to: '/seeker/saved-jobs', icon: Bookmark },
  { label: 'My Applications', to: '/seeker/applications', icon: FileText },
  { label: 'Profile', to: '/seeker/profile', icon: User },
  { label: 'Settings', to: '/seeker/settings', icon: Settings },
];

export const employerNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/employer/dashboard', icon: LayoutDashboard },
  { label: 'My Jobs', to: '/employer/jobs', icon: Briefcase },
  { label: 'Post a Job', to: '/employer/jobs/create', icon: PlusCircle },
  { label: 'Applications', to: '/employer/applications', icon: ClipboardList },
  { label: 'Company Profile', to: '/employer/company', icon: Building2 },
  { label: 'Settings', to: '/employer/settings', icon: Settings },
];

export const adminNavItems: NavItem[] = [
  { label: 'Dashboard', to: '/admin/dashboard', icon: LayoutDashboard },
  { label: 'Users', to: '/admin/users', icon: Users },
  { label: 'Companies', to: '/admin/companies', icon: Building2 },
  { label: 'Jobs', to: '/admin/jobs', icon: Briefcase },
  { label: 'Applications', to: '/admin/applications', icon: ClipboardList },
  { label: 'Reports', to: '/admin/reports', icon: BarChart3 },
  { label: 'Settings', to: '/admin/settings', icon: Settings },
];

export function getNavItemsForRole(role: Role | null): NavItem[] {
  if (role === 'JOB_SEEKER') return seekerNavItems;
  if (role === 'EMPLOYER') return employerNavItems;
  if (role === 'ADMIN') return adminNavItems;
  return [];
}
