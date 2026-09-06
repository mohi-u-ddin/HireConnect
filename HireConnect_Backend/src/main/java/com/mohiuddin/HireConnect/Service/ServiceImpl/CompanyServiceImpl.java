package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Exceptions.ResourceNotFoundException;
import com.mohiuddin.HireConnect.Model.Dto.CompanyRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.CompanyResponseDto;
import com.mohiuddin.HireConnect.Model.Entities.Company;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Model.Enums.Role;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Repository.CompanyRepository;
import com.mohiuddin.HireConnect.Repository.JobRepository;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Service.CompanyService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Year;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
@Service
public class CompanyServiceImpl implements CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Override
    @Transactional
    public CompanyResponseDto createCompany(String employerEmail, CompanyRequestDto request) {
        validateEmployerEmail(employerEmail, "Company creation");
        validateCompanyRequest(request, "Company creation");

        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with email: " + employerEmail));

        if (employer.getRole() != Role.EMPLOYER) {
            log.warn("Company creation failed: user {} does not have EMPLOYER role", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can register a company");
        }

        if (companyRepository.existsByEmployerId(employer.getId())) {
            log.warn("Company creation failed: employer {} already owns a company", employerEmail);
            throw new BadRequestException("Employer already owns a registered company");
        }

        String companyName = request.getName().trim();
        if (companyRepository.existsByName(companyName)) {
            log.warn("Company creation failed: company name '{}' already exists", companyName);
            throw new BadRequestException("Company with name '" + companyName + "' already exists");
        }

        log.info("Creating company '{}' for employer: {}", companyName, employerEmail);

        Company company = Company.builder()
                .name(companyName)
                .description(request.getDescription().trim())
                .website(request.getWebsite() != null ? request.getWebsite().trim() : null)
                .logoUrl(request.getLogoUrl() != null ? request.getLogoUrl().trim() : null)
                .industry(request.getIndustry().trim())
                .companySize(request.getCompanySize() != null ? request.getCompanySize().trim() : null)
                .location(request.getLocation().trim())
                .foundedYear(request.getFoundedYear())
                .employer(employer)
                .build();

        Company savedCompany = companyRepository.save(company);
        log.info("Company '{}' created successfully with id {} for employer: {}", companyName, savedCompany.getId(), employerEmail);

        return mapToResponseDto(savedCompany, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getCompanyById(Long companyId) {
        if (companyId == null || companyId <= 0) {
            log.warn("Get company failed: companyId is null or invalid");
            throw new BadRequestException("Company ID must not be null and must be a positive number");
        }
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + companyId));

        Long count = jobRepository.countByCompanyId(company.getId());
        long jobsCount = count != null ? count : 0L;

        return mapToResponseDto(company, jobsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getMyCompany(String employerEmail) {
        validateEmployerEmail(employerEmail, "Get my company");

        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with email: " + employerEmail));

        if (employer.getRole() != Role.EMPLOYER) {
            log.warn("Get my company failed: user {} does not have EMPLOYER role", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can view their company profile");
        }

        Company company = companyRepository.findByEmployerId(employer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for employer with email: " + employerEmail));

        Long count = jobRepository.countByCompanyId(company.getId());
        long jobsCount = count != null ? count : 0L;

        return mapToResponseDto(company, jobsCount);
    }

    @Override
    @Transactional
    public CompanyResponseDto updateCompany(long id, String employerEmail, CompanyRequestDto request) {
        if (id <= 0) {
            log.warn("Update company failed: companyId is invalid");
            throw new BadRequestException("Company ID must be a positive number");
        }
        validateEmployerEmail(employerEmail, "Update company");
        validateCompanyRequest(request, "Update company");

        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with email: " + employerEmail));

        if (employer.getRole() != Role.EMPLOYER) {
            log.warn("Update company failed: user {} does not have EMPLOYER role", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can update a company");
        }

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company not found with id: " + id));

        if (company.getEmployer() == null || !company.getEmployer().getId().equals(employer.getId())) {
            log.warn("Update company failed: employer {} does not own company with id {}", employerEmail, id);
            throw new BadRequestException("You are not authorized to update this company");
        }

        String updatedName = request.getName().trim();
        if (!company.getName().equalsIgnoreCase(updatedName) && companyRepository.existsByName(updatedName)) {
            log.warn("Update company failed: company name '{}' already exists", updatedName);
            throw new BadRequestException("Company with name '" + updatedName + "' already exists");
        }

        log.info("Updating company id {} ('{}') for employer: {}", id, updatedName, employerEmail);

        company.setName(updatedName);
        company.setDescription(request.getDescription().trim());
        company.setWebsite(request.getWebsite() != null ? request.getWebsite().trim() : null);
        company.setLogoUrl(request.getLogoUrl() != null ? request.getLogoUrl().trim() : null);
        company.setIndustry(request.getIndustry().trim());
        company.setCompanySize(request.getCompanySize() != null ? request.getCompanySize().trim() : null);
        company.setLocation(request.getLocation().trim());
        company.setFoundedYear(request.getFoundedYear());

        Company savedCompany = companyRepository.save(company);
        Long count = jobRepository.countByCompanyId(savedCompany.getId());
        long jobsCount = count != null ? count : 0L;

        return mapToResponseDto(savedCompany, jobsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<CompanyResponseDto> getAllCompanies(Pageable page) {
        if (page == null) {
            log.warn("Get all companies failed: pageable is null");
            throw new BadRequestException("Pageable must not be null");
        }

        Page<Company> companiesPage = companyRepository.findAll(page);
        List<CompanyResponseDto> companyDtos = companiesPage.getContent().stream()
                .map(company -> {
                    Long count = jobRepository.countByCompanyId(company.getId());
                    return mapToResponseDto(company, count != null ? count : 0L);
                })
                .toList();

        return new PageResponseDto<>(
                companyDtos,
                companiesPage.getNumber(),
                companiesPage.getSize(),
                companiesPage.getTotalElements(),
                companiesPage.getTotalPages(),
                companiesPage.isLast()
        );
    }

    private void validateEmployerEmail(String employerEmail, String action) {
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.warn("{} failed: employerEmail is null or empty", action);
            throw new BadRequestException("Employer email must not be null or empty");
        }
    }

    private void validateCompanyRequest(CompanyRequestDto request, String action) {
        if (request == null) {
            log.warn("{} failed: request is null", action);
            throw new BadRequestException("Company data must not be null");
        }
        if (request.getName() == null || request.getName().trim().isEmpty() || request.getName().trim().length() > 150) {
            log.warn("{} failed: company name is null, empty or exceeds 150 characters", action);
            throw new BadRequestException("Company name must not be null or empty and must not exceed 150 characters");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            log.warn("{} failed: company description is null or empty", action);
            throw new BadRequestException("Company description must not be null or empty");
        }
        if (request.getWebsite() != null && request.getWebsite().trim().length() > 255) {
            log.warn("{} failed: company website exceeds 255 characters", action);
            throw new BadRequestException("Company website must not exceed 255 characters");
        }
        if (request.getLogoUrl() != null && request.getLogoUrl().trim().length() > 255) {
            log.warn("{} failed: company logo URL exceeds 255 characters", action);
            throw new BadRequestException("Company logo URL must not exceed 255 characters");
        }
        if (request.getIndustry() == null || request.getIndustry().trim().isEmpty() || request.getIndustry().trim().length() > 100) {
            log.warn("{} failed: company industry is null, empty or exceeds 100 characters", action);
            throw new BadRequestException("Company industry must not be null or empty and must not exceed 100 characters");
        }
        if (request.getCompanySize() != null && request.getCompanySize().trim().length() > 50) {
            log.warn("{} failed: company size exceeds 50 characters", action);
            throw new BadRequestException("Company size must not exceed 50 characters");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty() || request.getLocation().trim().length() > 150) {
            log.warn("{} failed: company location is null, empty or exceeds 150 characters", action);
            throw new BadRequestException("Company location must not be null or empty and must not exceed 150 characters");
        }
        if (request.getFoundedYear() != null) {
            int currentYear = Year.now().getValue();
            if (request.getFoundedYear() < 1800 || request.getFoundedYear() > currentYear) {
                log.warn("{} failed: company founded year {} is invalid", action, request.getFoundedYear());
                throw new BadRequestException("Company founded year must be between 1800 and " + currentYear);
            }
        }
    }

    private CompanyResponseDto mapToResponseDto(Company company, long jobsCount) {
        if (company == null) {
            return null;
        }
        return CompanyResponseDto.builder()
                .id(company.getId())
                .name(company.getName())
                .description(company.getDescription())
                .website(company.getWebsite())
                .logoUrl(company.getLogoUrl())
                .industry(company.getIndustry())
                .companySize(company.getCompanySize())
                .location(company.getLocation())
                .foundedYear(company.getFoundedYear())
                .employerId(company.getEmployer() != null ? company.getEmployer().getId() : null)
                .employerName(company.getEmployer() != null ? company.getEmployer().getName() : null)
                .jobsCount(jobsCount)
                .createdAt(company.getCreatedAt())
                .updatedAt(company.getUpdatedAt())
                .build();
    }
}