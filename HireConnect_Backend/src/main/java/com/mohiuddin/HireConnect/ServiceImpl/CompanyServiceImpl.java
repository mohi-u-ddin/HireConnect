package com.mohiuddin.HireConnect.ServiceImpl;

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
        if (request == null) {
            log.warn("Company creation failed: request is null");
            throw new BadRequestException("Company data must not be null");
        }
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.warn("Company creation failed: employerEmail is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }
        if (request.getName() == null || request.getName().trim().isEmpty() || request.getName().length() > 150) {
            log.warn("Company creation failed: company name is null or empty or exceeds 150 characters");
            throw new BadRequestException("Company name must not be null or empty and must not exceed 150 characters");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            log.warn("Company creation failed: company description is null or empty");
            throw new BadRequestException("Company description must not be null or empty");
        }
        if (request.getWebsite() != null && request.getWebsite().length() > 255) {
            log.warn("Company creation failed: company website is null or empty or exceeds 255 characters");
            throw new BadRequestException("Company website must not be null or empty and must not exceed 255 characters");
        }
        if (request.getIndustry() == null || request.getIndustry().trim().isEmpty() || request.getIndustry().length() > 100) {
            log.warn("Company creation failed: company industry is null or empty");
            throw new BadRequestException("Company industry must not be null or empty and must not exceed 100 characters");
        }
        if (request.getCompanySize() == null || request.getCompanySize().trim().isEmpty() || request.getCompanySize().length() > 50) {
            log.warn("Company creation failed: company size is null or empty or exceeds 50 characters");
            throw new BadRequestException("Company size must not be null or empty and must not exceed 50 characters");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty() || request.getLocation().length() > 150) {
            log.warn("Company creation failed: company location is null or empty");
            throw new BadRequestException("Company location must not be null or empty and must not exceed 150 characters");
        }
        if (request.getFoundedYear() != null && request.getFoundedYear() < 1800) {
            log.warn("Company creation failed: company founded year is less than 1800");
            throw new BadRequestException("Company founded year must be 1800 or later");
        }

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

        if (companyRepository.existsByName(request.getName().trim())) {
            log.warn("Company creation failed: company name '{}' already exists", request.getName());
            throw new BadRequestException("Company with name '" + request.getName() + "' already exists");
        }

        log.info("Creating company '{}' for employer: {}", request.getName(), employerEmail);

        Company company = Company.builder()
                .name(request.getName().trim())
                .description(request.getDescription())
                .website(request.getWebsite())
                .logoUrl(request.getLogoUrl())
                .industry(request.getIndustry())
                .companySize(request.getCompanySize())
                .location(request.getLocation())
                .foundedYear(request.getFoundedYear())
                .employer(employer)
                .build();

        Company savedCompany = companyRepository.save(company);

        return mapToResponseDto(savedCompany, 0);
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

        long jobsCount = jobRepository.countByCompanyId(company.getId());

        return mapToResponseDto(company, jobsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponseDto getMyCompany(String employerEmail) {
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.warn("Get my company failed: employerEmail is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }

        User employer = userRepository.findByEmail(employerEmail)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with email: " + employerEmail));

        Company company = companyRepository.findByEmployerId(employer.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Company not found for employer with email: " + employerEmail));

        long jobsCount = jobRepository.countByCompanyId(company.getId());

        return mapToResponseDto(company, jobsCount);
    }

    @Override
    @Transactional
    public CompanyResponseDto updateCompany(long id, String employerEmail, CompanyRequestDto request) {
        if (id <= 0) {
            log.warn("Update company failed: companyId is null or invalid");
            throw new BadRequestException("Company ID must not be null and must be a positive number");
        }
        if (request == null) {
            log.warn("Update company failed: request is null");
            throw new BadRequestException("Company data must not be null");
        }
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.warn("Update company failed: employerEmail is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }
        if (request.getName() == null || request.getName().trim().isEmpty() || request.getName().length() > 150) {
            log.warn("Update company failed: company name is null or empty or exceeds 150 characters");
            throw new BadRequestException("Company name must not be null or empty and must not exceed 150 characters");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            log.warn("Update company failed: company description is null or empty");
            throw new BadRequestException("Company description must not be null or empty");
        }
        if (request.getWebsite() != null && request.getWebsite().length() > 255) {
            log.warn("Update company failed: company website is null or empty or exceeds 255 characters");
            throw new BadRequestException("Company website must not be null or empty and must not exceed 255 characters");
        }
        if (request.getIndustry() == null || request.getIndustry().trim().isEmpty() || request.getIndustry().length() > 100) {
            log.warn("Update company failed: company industry is null or empty");
            throw new BadRequestException("Company industry must not be null or empty and must not exceed 100 characters");
        }
        if (request.getCompanySize() == null || request.getCompanySize().trim().isEmpty() || request.getCompanySize().length() > 50) {
            log.warn("Update company failed: company size is null or empty or exceeds 50 characters");
            throw new BadRequestException("Company size must not be null or empty and must not exceed 50 characters");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty() || request.getLocation().length() > 150) {
            log.warn("Update company failed: company location is null or empty");
            throw new BadRequestException("Company location must not be null or empty and must not exceed 150 characters");
        }
        if (request.getFoundedYear() != null && request.getFoundedYear() < 1800) {
            log.warn("Update company failed: company founded year is less than 1800");
            throw new BadRequestException("Company founded year must be 1800 or later");
        }

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
            log.warn("Update company failed: company name '{}' already exists", request.getName());
            throw new BadRequestException("Company with name '" + request.getName() + "' already exists");
        }

        log.info("Updating company id {} ('{}') for employer: {}", id, updatedName, employerEmail);

        company.setName(updatedName);
        company.setDescription(request.getDescription());
        company.setWebsite(request.getWebsite());
        company.setLogoUrl(request.getLogoUrl());
        company.setIndustry(request.getIndustry());
        company.setCompanySize(request.getCompanySize());
        company.setLocation(request.getLocation());
        company.setFoundedYear(request.getFoundedYear());

        Company savedCompany = companyRepository.save(company);
        long jobsCount = jobRepository.countByCompanyId(savedCompany.getId());

        return mapToResponseDto(savedCompany, jobsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<CompanyResponseDto> getAllCompanies(Pageable page) {
        Page<Company> companiesPage = companyRepository.findAll(page);
        List<CompanyResponseDto> companyDtos = companiesPage.getContent().stream()
                .map(company -> mapToResponseDto(company, jobRepository.countByCompanyId(company.getId())))
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

    private CompanyResponseDto mapToResponseDto(Company company, long jobsCount) {
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