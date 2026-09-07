package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Exceptions.ResourceNotFoundException;
import com.mohiuddin.HireConnect.Model.Dto.JobCreateRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.JobStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobUpdateRequestDto;
import com.mohiuddin.HireConnect.Model.Entities.Company;
import com.mohiuddin.HireConnect.Model.Entities.Job;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Model.Enums.EmploymentType;
import com.mohiuddin.HireConnect.Model.Enums.ExperienceLevel;
import com.mohiuddin.HireConnect.Model.Enums.JobStatus;
import com.mohiuddin.HireConnect.Model.Enums.Role;
import com.mohiuddin.HireConnect.Model.Enums.WorkArrangement;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Repository.CompanyRepository;
import com.mohiuddin.HireConnect.Repository.JobApplicationRepository;
import com.mohiuddin.HireConnect.Repository.JobRepository;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Service.JobService;
import jakarta.persistence.EntityManager;
import jakarta.persistence.TypedQuery;
import jakarta.persistence.criteria.CriteriaBuilder;
import jakarta.persistence.criteria.CriteriaQuery;
import jakarta.persistence.criteria.Order;
import jakarta.persistence.criteria.Predicate;
import jakarta.persistence.criteria.Root;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class JobServiceImpl implements JobService {

    private final JobRepository jobRepository;
    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobApplicationRepository jobApplicationRepository;
    private final EntityManager entityManager;

    @Transactional
    @Override
    public JobResponseDto createJobService(String employerEmail, JobCreateRequestDto jobCreateRequestDto) {
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.error("Job creation failed: employer email is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }
        if (jobCreateRequestDto == null) {
            log.error("Job creation failed: request data is null");
            throw new BadRequestException("Job data must not be null");
        }
        if (jobCreateRequestDto.getTitle() == null || jobCreateRequestDto.getTitle().trim().length() < 2 || jobCreateRequestDto.getTitle().trim().length() > 150) {
            log.error("Job creation failed: job title is null, empty or invalid length");
            throw new BadRequestException("Job title must be between 2 and 150 characters");
        }
        if (jobCreateRequestDto.getDescription() == null || jobCreateRequestDto.getDescription().trim().isEmpty()) {
            log.error("Job creation failed: job description is null or empty");
            throw new BadRequestException("Job description must not be null or empty");
        }
        if (jobCreateRequestDto.getResponsibilities() == null || jobCreateRequestDto.getResponsibilities().trim().isEmpty()) {
            log.error("Job creation failed: job responsibilities are null or empty");
            throw new BadRequestException("Job responsibilities must not be null or empty");
        }
        if (jobCreateRequestDto.getRequirements() == null || jobCreateRequestDto.getRequirements().trim().isEmpty()) {
            log.error("Job creation failed: job requirements are null or empty");
            throw new BadRequestException("Job requirements must not be null or empty");
        }
        if (jobCreateRequestDto.getSalaryMin() != null && jobCreateRequestDto.getSalaryMin().compareTo(BigDecimal.ZERO) < 0) {
            log.error("Job creation failed: minimum salary is less than 0");
            throw new BadRequestException("Minimum salary must be greater than or equal to 0");
        }
        if (jobCreateRequestDto.getSalaryMax() != null && jobCreateRequestDto.getSalaryMax().compareTo(BigDecimal.ZERO) < 0) {
            log.error("Job creation failed: maximum salary is less than 0");
            throw new BadRequestException("Maximum salary must be greater than or equal to 0");
        }
        if (jobCreateRequestDto.getSalaryMin() != null && jobCreateRequestDto.getSalaryMax() != null
                && jobCreateRequestDto.getSalaryMin().compareTo(jobCreateRequestDto.getSalaryMax()) > 0) {
            log.error("Job creation failed: minimum salary exceeds maximum salary");
            throw new BadRequestException("Minimum salary cannot be greater than maximum salary");
        }
        if (jobCreateRequestDto.getCurrency() != null && jobCreateRequestDto.getCurrency().trim().length() != 3) {
            log.error("Job creation failed: currency is not a 3-letter ISO code");
            throw new BadRequestException("Currency must be a 3-letter ISO code (e.g. USD)");
        }
        if (jobCreateRequestDto.getLocation() == null || jobCreateRequestDto.getLocation().trim().isEmpty() || jobCreateRequestDto.getLocation().trim().length() > 150) {
            log.error("Job creation failed: job location is null, empty or exceeds 150 characters");
            throw new BadRequestException("Job location is required and must not exceed 150 characters");
        }
        if (jobCreateRequestDto.getCategory() == null || jobCreateRequestDto.getCategory().trim().isEmpty() || jobCreateRequestDto.getCategory().trim().length() > 100) {
            log.error("Job creation failed: job category is null, empty or exceeds 100 characters");
            throw new BadRequestException("Job category is required and must not exceed 100 characters");
        }
        if (jobCreateRequestDto.getEmploymentType() == null) {
            log.error("Job creation failed: employment type is null");
            throw new BadRequestException("Employment type is required");
        }
        if (jobCreateRequestDto.getExperienceLevel() == null) {
            log.error("Job creation failed: experience level is null");
            throw new BadRequestException("Experience level is required");
        }
        if (jobCreateRequestDto.getWorkArrangement() == null) {
            log.error("Job creation failed: work arrangement is null");
            throw new BadRequestException("Work arrangement is required");
        }
        if (jobCreateRequestDto.getApplicationDeadline() != null && jobCreateRequestDto.getApplicationDeadline().isBefore(LocalDate.now())) {
            log.error("Job creation failed: application deadline is not a future date");
            throw new BadRequestException("Application deadline must be a future date");
        }

        User employer = userRepository.findByEmail(employerEmail).orElseThrow(() -> {
            log.error("Job creation failed: employer with email {} not found", employerEmail);
            return new ResourceNotFoundException("Employer not found with email: " + employerEmail);
        });

        if (employer.getRole() != Role.EMPLOYER) {
            log.error("Job creation failed: user with email {} is not an employer", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can create jobs");
        }

        Company company = companyRepository.findByEmployerId(employer.getId()).orElseThrow(() -> {
            log.error("Job creation failed: employer {} does not have a registered company", employerEmail);
            return new BadRequestException("Employer must have a registered company before creating a job");
        });

        log.info("Creating job for employer '{}' and company '{}'", employerEmail, company.getName());

        Job job = Job.builder()
                .title(jobCreateRequestDto.getTitle().trim())
                .description(jobCreateRequestDto.getDescription().trim())
                .responsibilities(jobCreateRequestDto.getResponsibilities().trim())
                .requirements(jobCreateRequestDto.getRequirements().trim())
                .salaryMin(jobCreateRequestDto.getSalaryMin())
                .salaryMax(jobCreateRequestDto.getSalaryMax())
                .currency(jobCreateRequestDto.getCurrency() != null ? jobCreateRequestDto.getCurrency().trim().toUpperCase() : null)
                .location(jobCreateRequestDto.getLocation().trim())
                .category(jobCreateRequestDto.getCategory().trim())
                .employmentType(jobCreateRequestDto.getEmploymentType())
                .experienceLevel(jobCreateRequestDto.getExperienceLevel())
                .workArrangement(jobCreateRequestDto.getWorkArrangement())
                .status(JobStatus.ACTIVE)
                .applicationDeadline(jobCreateRequestDto.getApplicationDeadline())
                .company(company)
                .createdBy(employer)
                .build();

        Job savedJob = jobRepository.save(job);
        log.info("Job created successfully with id {}", savedJob.getId());

        return mapToJobResponseDto(savedJob, 0L);
    }

    @Override
    @Transactional(readOnly = true)
    public JobResponseDto getJobById(Long id) {
        if (id == null || id <= 0) {
            log.error("Job retrieval failed: invalid job id {}", id);
            throw new BadRequestException("Job ID must be a positive number");
        }

        Job job = jobRepository.findById(id).orElseThrow(() -> {
            log.error("Job retrieval failed: job with id {} not found", id);
            return new ResourceNotFoundException("Job not found with id: " + id);
        });

        Long count = jobApplicationRepository.countByJobId(id);
        long applicationsCount = count != null ? count : 0L;
        log.info("Retrieved job with id {} and applications count {}", id, applicationsCount);

        return mapToJobResponseDto(job, applicationsCount);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<JobResponseDto> getAllActiveJobs(String keyword, String location, String category,
                                                             EmploymentType employmentType, ExperienceLevel experienceLevel,
                                                             WorkArrangement workArrangement, BigDecimal minSalary, BigDecimal maxSalary,
                                                             Pageable pageable) {
        if (keyword != null && keyword.trim().length() > 100) {
            log.error("Job retrieval failed: keyword exceeds 100 characters");
            throw new BadRequestException("Keyword must not exceed 100 characters");
        }
        if (location != null && location.trim().length() > 150) {
            log.error("Job retrieval failed: location exceeds 150 characters");
            throw new BadRequestException("Location must not exceed 150 characters");
        }
        if (category != null && category.trim().length() > 100) {
            log.error("Job retrieval failed: category exceeds 100 characters");
            throw new BadRequestException("Category must not exceed 100 characters");
        }
        if (minSalary != null && minSalary.compareTo(BigDecimal.ZERO) < 0) {
            log.error("Job retrieval failed: minimum salary is less than 0");
            throw new BadRequestException("Minimum salary must be greater than or equal to 0");
        }
        if (maxSalary != null && maxSalary.compareTo(BigDecimal.ZERO) < 0) {
            log.error("Job retrieval failed: maximum salary is less than 0");
            throw new BadRequestException("Maximum salary must be greater than or equal to 0");
        }
        if (minSalary != null && maxSalary != null && minSalary.compareTo(maxSalary) > 0) {
            log.error("Job retrieval failed: minimum salary exceeds maximum salary");
            throw new BadRequestException("Minimum salary cannot be greater than maximum salary");
        }
        if (pageable == null) {
            log.error("Job retrieval failed: pageable is null");
            throw new BadRequestException("Pageable must not be null");
        }

        boolean hasFilters = (keyword != null && !keyword.trim().isEmpty())
                || (location != null && !location.trim().isEmpty())
                || (category != null && !category.trim().isEmpty())
                || employmentType != null
                || experienceLevel != null
                || workArrangement != null
                || minSalary != null
                || maxSalary != null;

        Page<Job> jobPage;
        if (!hasFilters) {
            jobPage = jobRepository.findByStatus(JobStatus.ACTIVE, pageable);
        } else {
            CriteriaBuilder cb = entityManager.getCriteriaBuilder();

            CriteriaQuery<Job> query = cb.createQuery(Job.class);
            Root<Job> root = query.from(Job.class);
            List<Predicate> predicates = buildFilterPredicates(cb, root, keyword, location, category,
                    employmentType, experienceLevel, workArrangement, minSalary, maxSalary);
            query.where(predicates.toArray(new Predicate[0]));

            if (pageable.getSort().isSorted()) {
                List<Order> orders = new ArrayList<>();
                for (org.springframework.data.domain.Sort.Order order : pageable.getSort()) {
                    try {
                        String property = order.getProperty();
                        if ("postedAt".equalsIgnoreCase(property)) {
                            property = "createdAt";
                        }
                        orders.add(order.isAscending() ? cb.asc(root.get(property)) : cb.desc(root.get(property)));
                    } catch (IllegalArgumentException e) {
                        log.warn("Invalid sort property: {}, ignoring", order.getProperty());
                    }
                }
                if (!orders.isEmpty()) {
                    query.orderBy(orders);
                } else {
                    query.orderBy(cb.desc(root.get("createdAt")));
                }
            } else {
                query.orderBy(cb.desc(root.get("createdAt")));
            }

            TypedQuery<Job> typedQuery = entityManager.createQuery(query);
            typedQuery.setFirstResult((int) pageable.getOffset());
            typedQuery.setMaxResults(pageable.getPageSize());
            List<Job> jobs = typedQuery.getResultList();

            CriteriaQuery<Long> countQuery = cb.createQuery(Long.class);
            Root<Job> countRoot = countQuery.from(Job.class);
            List<Predicate> countPredicates = buildFilterPredicates(cb, countRoot, keyword, location, category,
                    employmentType, experienceLevel, workArrangement, minSalary, maxSalary);
            countQuery.select(cb.count(countRoot)).where(countPredicates.toArray(new Predicate[0]));
            Long total = entityManager.createQuery(countQuery).getSingleResult();

            jobPage = new PageImpl<>(jobs, pageable, total != null ? total : 0L);
        }

        List<JobResponseDto> jobResponseDtos = jobPage.getContent().stream()
                .map(job -> {
                    Long count = jobApplicationRepository.countByJobId(job.getId());
                    return mapToJobResponseDto(job, count != null ? count : 0L);
                })
                .toList();

        return new PageResponseDto<>(
                jobResponseDtos,
                jobPage.getNumber(),
                jobPage.getSize(),
                jobPage.getTotalElements(),
                jobPage.getTotalPages(),
                jobPage.isLast()
        );
    }

    private List<Predicate> buildFilterPredicates(
            CriteriaBuilder cb,
            Root<Job> root,
            String keyword,
            String location,
            String category,
            EmploymentType employmentType,
            ExperienceLevel experienceLevel,
            WorkArrangement workArrangement,
            BigDecimal minSalary,
            BigDecimal maxSalary) {
        List<Predicate> predicates = new ArrayList<>();
        predicates.add(cb.equal(root.get("status"), JobStatus.ACTIVE));

        if (keyword != null && !keyword.trim().isEmpty()) {
            String pattern = "%" + keyword.trim().toLowerCase() + "%";
            Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
            Predicate descMatch = cb.like(cb.lower(root.get("description")), pattern);
            Predicate companyMatch = cb.like(cb.lower(root.get("company").get("name")), pattern);
            predicates.add(cb.or(titleMatch, descMatch, companyMatch));
        }

        if (location != null && !location.trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.trim().toLowerCase() + "%"));
        }

        if (category != null && !category.trim().isEmpty()) {
            predicates.add(cb.like(cb.lower(root.get("category")), "%" + category.trim().toLowerCase() + "%"));
        }

        if (employmentType != null) {
            predicates.add(cb.equal(root.get("employmentType"), employmentType));
        }

        if (experienceLevel != null) {
            predicates.add(cb.equal(root.get("experienceLevel"), experienceLevel));
        }

        if (workArrangement != null) {
            predicates.add(cb.equal(root.get("workArrangement"), workArrangement));
        }

        if (minSalary != null) {
            predicates.add(cb.or(
                    cb.greaterThanOrEqualTo(root.get("salaryMax"), minSalary),
                    cb.greaterThanOrEqualTo(root.get("salaryMin"), minSalary)
            ));
        }

        if (maxSalary != null) {
            predicates.add(cb.or(
                    cb.lessThanOrEqualTo(root.get("salaryMin"), maxSalary),
                    cb.lessThanOrEqualTo(root.get("salaryMax"), maxSalary)
            ));
        }

        return predicates;
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<JobResponseDto> getMYJobs(String employerEmail, Pageable pageable) {
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.error("Job retrieval failed: employer email is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }
        if (pageable == null) {
            log.error("Job retrievaled failed: pageable is null");
            throw new BadRequestException("Pageable must not be null");
        }
        User employer = userRepository.findByEmail(employerEmail).orElseThrow(() -> {
            log.error("Job retrieval failed: employer with the email {} not found", employerEmail);
            return new ResourceNotFoundException("Employer not found with email: " + employerEmail);
        });
        if (employer.getRole() != Role.EMPLOYER) {
            log.error("Job retrieval failed: user with email {} is not an employer", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can retrieve their jobs");
        }
        Page<Job> jobs = jobRepository.findByCreatedById(employer.getId(), pageable);
        List<JobResponseDto> jobResponseDtos = jobs.getContent().stream()
                .map(job -> {
                    Long count = jobApplicationRepository.countByJobId(job.getId());
                    return mapToJobResponseDto(job, count != null ? count : 0L);
                })
                .toList();
        return new PageResponseDto<>(
                jobResponseDtos,
                jobs.getNumber(),
                jobs.getSize(),
                jobs.getTotalElements(),
                jobs.getTotalPages(),
                jobs.isLast()
        );
    }

    @Transactional
    @Override
    public JobResponseDto updateJob(long id, String employerEmail, JobUpdateRequestDto request) {
        if (id <= 0) {
            log.error("Job update failed: invalid job id {}", id);
            throw new BadRequestException("Job ID must be a positive number");
        }
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.error("Job update failed: employer email is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }
        if (request == null) {
            log.error("Job update failed: request data is null");
            throw new BadRequestException("Job data must not be null");
        }
        if (request.getTitle() == null || request.getTitle().trim().length() < 2 || request.getTitle().trim().length() > 150) {
            log.error("Job update failed: job title is null, empty or invalid length");
            throw new BadRequestException("Job title must be between 2 and 150 characters");
        }
        if (request.getDescription() == null || request.getDescription().trim().isEmpty()) {
            log.error("Job update failed: job description is null or empty");
            throw new BadRequestException("Job description must not be null or empty");
        }
        if (request.getResponsibilities() == null || request.getResponsibilities().trim().isEmpty()) {
            log.error("Job update failed: job responsibilities are null or empty");
            throw new BadRequestException("Job responsibilities must not be null or empty");
        }
        if (request.getRequirements() == null || request.getRequirements().trim().isEmpty()) {
            log.error("Job update failed: job requirements are null or empty");
            throw new BadRequestException("Job requirements must not be null or empty");
        }
        if (request.getSalaryMin() != null && request.getSalaryMin().compareTo(BigDecimal.ZERO) < 0) {
            log.error("Job update failed: minimum salary is less than 0");
            throw new BadRequestException("Minimum salary must be greater than or equal to 0");
        }
        if (request.getSalaryMax() != null && request.getSalaryMax().compareTo(BigDecimal.ZERO) < 0) {
            log.error("Job update failed: maximum salary is less than 0");
            throw new BadRequestException("Maximum salary must be greater than or equal to 0");
        }
        if (request.getSalaryMin() != null && request.getSalaryMax() != null
                && request.getSalaryMin().compareTo(request.getSalaryMax()) > 0) {
            log.error("Job update failed: minimum salary exceeds maximum salary");
            throw new BadRequestException("Minimum salary cannot be greater than maximum salary");
        }
        if (request.getCurrency() != null && request.getCurrency().trim().length() != 3) {
            log.error("Job update failed: currency is not a 3-letter ISO code");
            throw new BadRequestException("Currency must be a 3-letter ISO code (e.g. USD)");
        }
        if (request.getLocation() == null || request.getLocation().trim().isEmpty() || request.getLocation().trim().length() > 150) {
            log.error("Job update failed: job location is null, empty or exceeds 150 characters");
            throw new BadRequestException("Job location is required and must not exceed 150 characters");
        }
        if (request.getCategory() == null || request.getCategory().trim().isEmpty() || request.getCategory().trim().length() > 100) {
            log.error("Job update failed: job category is null, empty or exceeds 100 characters");
            throw new BadRequestException("Job category is required and must not exceed 100 characters");
        }
        if (request.getEmploymentType() == null) {
            log.error("Job update failed: employment type is null");
            throw new BadRequestException("Employment type is required");
        }
        if (request.getExperienceLevel() == null) {
            log.error("Job update failed: experience level is null");
            throw new BadRequestException("Experience level is required");
        }
        if (request.getWorkArrangement() == null) {
            log.error("Job update failed: work arrangement is null");
            throw new BadRequestException("Work arrangement is required");
        }
        if (request.getApplicationDeadline() != null && request.getApplicationDeadline().isBefore(LocalDate.now())) {
            log.error("Job update failed: application deadline is not a future date");
            throw new BadRequestException("Application deadline must be a future date");
        }

        User employer = userRepository.findByEmail(employerEmail).orElseThrow(() -> {
            log.error("Job update failed: employer with email {} not found", employerEmail);
            return new ResourceNotFoundException("Employer not found with email: " + employerEmail);
        });

        if (employer.getRole() != Role.EMPLOYER) {
            log.error("Job update failed: user with email {} is not an employer", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can update jobs");
        }

        Job job = jobRepository.findById(id).orElseThrow(() -> {
            log.error("Job update failed: job with id {} not found", id);
            return new ResourceNotFoundException("Job not found with id: " + id);
        });

        if (!isOwner(job, employer)) {
            log.error("Job update failed: employer {} is not authorized to update job with id {}", employerEmail, id);
            throw new BadRequestException("You are not authorized to update this job");
        }

        log.info("Updating job with id {} for employer {}", id, employerEmail);

        job.setTitle(request.getTitle().trim());
        job.setDescription(request.getDescription().trim());
        job.setResponsibilities(request.getResponsibilities().trim());
        job.setRequirements(request.getRequirements().trim());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setCurrency(request.getCurrency() != null ? request.getCurrency().trim().toUpperCase() : null);
        job.setLocation(request.getLocation().trim());
        job.setCategory(request.getCategory().trim());
        job.setEmploymentType(request.getEmploymentType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setWorkArrangement(request.getWorkArrangement());
        job.setApplicationDeadline(request.getApplicationDeadline());
        if (request.getStatus() != null) {
            job.setStatus(request.getStatus());
        }

        Job updatedJob = jobRepository.save(job);
        log.info("Job with id {} updated successfully", updatedJob.getId());

        Long count = jobApplicationRepository.countByJobId(updatedJob.getId());
        return mapToJobResponseDto(updatedJob, count != null ? count : 0L);
    }

    @Transactional
    @Override
    public JobResponseDto updateJobStatus(long id, String employerEmail, JobStatusUpdateDto request) {
        if (id <= 0) {
            log.error("Job status update failed: invalid job id {}", id);
            throw new BadRequestException("Job ID must be a positive number");
        }
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.error("Job status update failed: employer email is null or empty");
            throw new BadRequestException("Employer email must not be null or empty");
        }
        if (request == null || request.getStatus() == null) {
            log.error("Job status update failed: request or status is null");
            throw new BadRequestException("Job status must not be null");
        }

        User employer = userRepository.findByEmail(employerEmail).orElseThrow(() -> {
            log.error("Job status update failed: employer with email {} not found", employerEmail);
            return new ResourceNotFoundException("Employer not found with email: " + employerEmail);
        });

        if (employer.getRole() != Role.EMPLOYER) {
            log.error("Job status update failed: user with email {} is not an employer", employerEmail);
            throw new BadRequestException("Only users with role EMPLOYER can update job status");
        }

        Job job = jobRepository.findById(id).orElseThrow(() -> {
            log.error("Job status update failed: job with id {} not found", id);
            return new ResourceNotFoundException("Job not found with id: " + id);
        });

        if (!isOwner(job, employer)) {
            log.error("Job status update failed: employer with emaial {} is not authorized to update job with id {}", employerEmail, id);
            throw new BadRequestException("You are not authorized to update this job");
        }

        log.info("Updating status of job with id {} to {} by employer {}", id, request.getStatus(), employerEmail);

        job.setStatus(request.getStatus());
        Job updatedJob = jobRepository.save(job);
        log.info("Job with the id {} status updated successfully to {}", updatedJob.getId(), updatedJob.getStatus());

        Long count = jobApplicationRepository.countByJobId(updatedJob.getId());
        return mapToJobResponseDto(updatedJob, count != null ? count : 0L);
    }

    @Transactional
    @Override
    public void deleteJob(long id, String userEmail, boolean isAdmin) {
        if (id <= 0) {
            log.error("Job deletion failed: invalid job id {}", id);
            throw new BadRequestException("Job ID must be a positive number");
        }
        if (userEmail == null || userEmail.trim().isEmpty()) {
            log.error("Job deletion failed: user email is null or empty");
            throw new BadRequestException("User email must not be null or empty");
        }

        User user = userRepository.findByEmail(userEmail).orElseThrow(() -> {
            log.error("Job deletion failed: user with email {} not found", userEmail);
            return new ResourceNotFoundException("User not found with email: " + userEmail);
        });

        Job job = jobRepository.findById(id).orElseThrow(() -> {
            log.error("Job deletion failed: job with id {} not found", id);
            return new ResourceNotFoundException("Job not found with id: " + id);
        });

        if (!isAdmin && user.getRole() != Role.ADMIN) {
            if (user.getRole() != Role.EMPLOYER) {
                log.error("Job deletion failed: user with email {} is not an employer or admin", userEmail);
                throw new BadRequestException("Only employers or admins can delete jobs");
            }

            if (!isOwner(job, user)) {
                log.error("Job deletion failed: employer {} is not authorized to delete job with id {}", userEmail, id);
                throw new BadRequestException("You are not authorized to delete this job");
            }
        }

        log.info("Deleting job with id {} by user {}", id, userEmail);
        jobRepository.delete(job);
        log.info("Job with id {} deleted successfully", id);
    }

    private boolean isOwner(Job job, User user) {
        if (job == null || user == null) {
            return false;
        }
        return (job.getCreatedBy() != null && job.getCreatedBy().getId().equals(user.getId()))
                || (job.getCompany() != null && job.getCompany().getEmployer() != null && job.getCompany().getEmployer().getId().equals(user.getId()));
    }

    private JobResponseDto mapToJobResponseDto(Job savedJob, long applicationsCount) {
        if (savedJob == null) {
            return null;
        }
        return JobResponseDto.builder()
                .id(savedJob.getId())
                .title(savedJob.getTitle())
                .description(savedJob.getDescription())
                .responsibilities(savedJob.getResponsibilities())
                .requirements(savedJob.getRequirements())
                .salaryMin(savedJob.getSalaryMin())
                .salaryMax(savedJob.getSalaryMax())
                .currency(savedJob.getCurrency())
                .location(savedJob.getLocation())
                .category(savedJob.getCategory())
                .employmentType(savedJob.getEmploymentType())
                .experienceLevel(savedJob.getExperienceLevel())
                .workArrangement(savedJob.getWorkArrangement())
                .status(savedJob.getStatus())
                .applicationDeadline(savedJob.getApplicationDeadline())
                .companyId(savedJob.getCompany() != null ? savedJob.getCompany().getId() : null)
                .companyName(savedJob.getCompany() != null ? savedJob.getCompany().getName() : null)
                .companyLogoUrl(savedJob.getCompany() != null ? savedJob.getCompany().getLogoUrl() : null)
                .employerId(savedJob.getCreatedBy() != null ? savedJob.getCreatedBy().getId() : null)
                .applicationsCount(applicationsCount)
                .createdAt(savedJob.getCreatedAt())
                .updatedAt(savedJob.getUpdatedAt())
                .build();
    }
}
