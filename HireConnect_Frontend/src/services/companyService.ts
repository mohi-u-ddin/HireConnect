import type { Company } from '../types';
import { mockCompanies } from '../data/mock/companies';
import { apiClient, simulateLatency, ApiError } from './apiClient';
import { mapBackendCompanyToCompany } from './adapters';

const fallbackCompanies: Company[] = [...mockCompanies];

export const companyService = {
  async getCompanies(): Promise<Company[]> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/companies?page=0&size=50');
      if (res && Array.isArray(res.content)) {
        return res.content.map(mapBackendCompanyToCompany);
      }
      if (Array.isArray(res)) {
        return res.map(mapBackendCompanyToCompany);
      }
    } catch (err) {
      console.warn('[companyService.getCompanies] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return [...fallbackCompanies];
  },

  async getCompanyById(id: string): Promise<Company> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>(`/companies/${id}`);
      if (res && (res.id != null || res.name)) {
        return mapBackendCompanyToCompany(res);
      }
    } catch (err) {
      console.warn(`[companyService.getCompanyById] Backend request for company ${id} failed, falling back to mock:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const company = fallbackCompanies.find((c) => String(c.id) === String(id));
    if (!company) throw new ApiError('Company not found.', 404);
    return company;
  },

  async getCompanyByEmployer(employerId: string): Promise<Company | null> {
    // 1. Try real backend
    try {
      const res = await apiClient.get<any>('/companies/my');
      if (res && (res.id != null || res.name)) {
        return mapBackendCompanyToCompany(res);
      }
    } catch (err) {
      console.warn('[companyService.getCompanyByEmployer] Backend request failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    return fallbackCompanies.find((c) => String(c.employerId) === String(employerId)) ?? null;
  },

  async createCompany(payload: Omit<Company, 'id' | 'createdAt' | 'verified' | 'status'>): Promise<Company> {
    // 1. Try real backend
    try {
      const body = {
        name: payload.name,
        description: payload.description,
        website: payload.website || null,
        logoUrl: payload.logoUrl || null,
        industry: payload.industry,
        companySize: payload.companySize,
        location: payload.location,
        foundedYear: payload.foundedYear ? Number(payload.foundedYear) : null,
      };

      const res = await apiClient.post<any>('/companies', body);
      if (res && res.id) {
        const created = mapBackendCompanyToCompany(res);
        fallbackCompanies.push(created);
        return created;
      }
    } catch (err) {
      console.warn('[companyService.createCompany] Backend create company failed, falling back to mock:', err);
    }

    // 2. Fallback
    await simulateLatency();
    const newCompany: Company = {
      ...payload,
      id: `c${fallbackCompanies.length + 1}`,
      verified: false,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
    };
    fallbackCompanies.push(newCompany);
    return newCompany;
  },

  async updateCompany(id: string, payload: Partial<Company>): Promise<Company> {
    // 1. Try real backend
    try {
      const body = {
        name: payload.name,
        description: payload.description,
        website: payload.website,
        logoUrl: payload.logoUrl,
        industry: payload.industry,
        companySize: payload.companySize,
        location: payload.location,
        foundedYear: payload.foundedYear ? Number(payload.foundedYear) : undefined,
      };

      const res = await apiClient.put<any>(`/companies/${id}`, body);
      if (res && res.id) {
        return mapBackendCompanyToCompany(res);
      }
    } catch (err) {
      console.warn(`[companyService.updateCompany] Backend update company ${id} failed, falling back to mock:`, err);
    }

    // 2. Fallback
    await simulateLatency();
    const idx = fallbackCompanies.findIndex((c) => String(c.id) === String(id));
    if (idx === -1) throw new ApiError('Company not found.', 404);
    fallbackCompanies[idx] = { ...fallbackCompanies[idx], ...payload };
    return fallbackCompanies[idx];
  },

  async deleteCompany(id: string): Promise<void> {
    await simulateLatency();
    const idx = fallbackCompanies.findIndex((c) => String(c.id) === String(id));
    if (idx === -1) throw new ApiError('Company not found.', 404);
    fallbackCompanies.splice(idx, 1);
  },
};
