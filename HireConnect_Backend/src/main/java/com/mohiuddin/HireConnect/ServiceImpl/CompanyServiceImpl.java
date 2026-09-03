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
        if (request.getName() == null || request.getName().trim().isEmpty()) {
            log.warn("Company creation failed: company name is null or empty");
            throw new BadRequestException("Company name must not be null or empty");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            log.warn("Company creation failed: company description is null or empty");
            throw new BadRequestException("Company description must not be null or empty");
        }
        if (request.getIndustry() == null || request.getIndustry().trim().isEmpty()) {
            log.warn("Company creation failed: company industry is null or empty");
            throw new BadRequestException("Company industry must not be null or empty");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty()) {
            log.warn("Company creation failed: company location is null or empty");
            throw new BadRequestException("Company location must not be null or empty");
        }
        if (request.getDescription().length() > 1000) {
            log.warn("Company creation failed: company description exceeds 1000 characters");
            throw new BadRequestException("Company description must not exceed 1000 characters");
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