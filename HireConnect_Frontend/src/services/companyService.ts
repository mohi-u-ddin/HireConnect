import type { Company } from '../types';
import { mockCompanies } from '../data/mock/companies';
import { simulateLatency, ApiError } from './apiClient';

const companies: Company[] = [...mockCompanies];

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    await simulateLatency();
    return [...companies];
  },

  async getCompanyById(id: string): Promise<Company> {
    await simulateLatency();
    const company = companies.find((c) => c.id === id);
    if (!company) throw new ApiError('Company not found.', 404);
    return company;
  },

  async getCompanyByEmployer(employerId: string): Promise<Company | null> {
    await simulateLatency();
    return companies.find((c) => c.employerId === employerId) ?? null;
  },

  async createCompany(payload: Omit<Company, 'id' | 'createdAt' | 'verified' | 'status'>): Promise<Company> {
    await simulateLatency();
    const newCompany: Company = {
      ...payload,
      id: `c${companies.length + 1}`,
      verified: false,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    companies.push(newCompany);
    return newCompany;
  },

  async updateCompany(id: string, payload: Partial<Company>): Promise<Company> {
    await simulateLatency();
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new ApiError('Company not found.', 404);
    companies[idx] = { ...companies[idx], ...payload };
    return companies[idx];
  },

  async deleteCompany(id: string): Promise<void> {
    await simulateLatency();
    const idx = companies.findIndex((c) => c.id === id);
    if (idx === -1) throw new ApiError('Company not found.', 404);
    companies.splice(idx, 1);
  },
};
