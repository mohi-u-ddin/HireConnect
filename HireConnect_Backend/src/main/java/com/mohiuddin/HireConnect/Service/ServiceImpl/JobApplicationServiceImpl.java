package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Exceptions.ResourceNotFoundException;
import com.mohiuddin.HireConnect.Model.Dto.ApplicationStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationResponseDto;
import com.mohiuddin.HireConnect.Model.Entities.Company;
import com.mohiuddin.HireConnect.Model.Entities.Job;
import com.mohiuddin.HireConnect.Model.Entities.JobApplication;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Model.Enums.ApplicationStatus;
import com.mohiuddin.HireConnect.Model.Enums.JobStatus;
import com.mohiuddin.HireConnect.Model.Enums.Role;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Repository.JobApplicationRepository;
import com.mohiuddin.HireConnect.Repository.JobRepository;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Service.JobApplicationService;
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
public class JobApplicationServiceImpl implements JobApplicationService {

    private final JobApplicationRepository jobApplicationRepository;
    private final UserRepository userRepository;
    private final JobRepository jobRepository;

    @Transactional
    @Override
    public JobApplicationResponseDto applyForJob(String seekerEmail, JobApplicationRequestDto request) {
        if (seekerEmail == null || seekerEmail.trim().isEmpty()) {
            log.error("Seeker email is null or empty");
            throw new BadRequestException("Seeker email cannot be null or empty");
        }
        User seeker = userRepository.findByEmail(seekerEmail.trim())
                .orElseThrow(() -> {
                    log.error("User with email {} not found", seekerEmail);
                    return new ResourceNotFoundException("User not found with email: " + seekerEmail);
                });
        if (seeker.getRole() != Role.JOB_SEEKER) {
            log.error("User with email {} is not a seeker", seekerEmail);
            throw new BadRequestException("Only job seekers can apply for jobs");
        }
        if (request == null) {
            log.error("Job application request is null");
            throw new BadRequestException("Job application request cannot be null");
        }
        if (request.getJobId() == null || request.getJobId() <= 0) {
            log.error("Job ID is null or invalid in the request");
            throw new BadRequestException("Job ID must be a positive number");
        }
        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> {
                    log.error("Job with ID {} not found", request.getJobId());
                    return new ResourceNotFoundException("Job not found with id: " + request.getJobId());
                });
        if (job.getStatus() != JobStatus.ACTIVE) {
            log.error("Job with ID {} is not active", job.getId());
            throw new BadRequestException("Cannot apply to a job that is not active");
        }
        if (jobApplicationRepository.existsByApplicantIdAndJobId(seeker.getId(), job.getId())) {
            log.error("User {} has already applied for job with ID {}", seekerEmail, job.getId());
            throw new BadRequestException("You have already applied for this job");
        }
        if (request.getResumeUrl() == null || request.getResumeUrl().trim().isEmpty()) {
            log.error("Resume URL is null or empty in the request");
            throw new BadRequestException("Resume URL cannot be null or empty");
        }
        if (request.getResumeUrl().trim().length() > 255) {
            log.error("Resume URL exceeds maximum length of 255 characters");
            throw new BadRequestException("Resume URL must not exceed 255 characters");
        }
        if (request.getPortfolioUrl() != null && request.getPortfolioUrl().trim().length() > 255) {
            log.error("Portfolio URL exceeds maximum length of 255 characters");
            throw new BadRequestException("Portfolio URL must not exceed 255 characters");
        }
        if (request.getLinkedInUrl() != null && request.getLinkedInUrl().trim().length() > 255) {
            log.error("LinkedIn URL exceeds maximum length of 255 characters");
            throw new BadRequestException("LinkedIn URL must not exceed 255 characters");
        }

        log.info("User with email {} is applying for job with ID {}", seekerEmail, request.getJobId());

        JobApplication jobApplication = JobApplication.builder()
                .job(job)
                .applicant(seeker)
                .resumeUrl(request.getResumeUrl().trim())
                .coverLetter(request.getCoverLetter() != null ? request.getCoverLetter().trim() : null)
                .portfolioUrl(request.getPortfolioUrl() != null ? request.getPortfolioUrl().trim() : null)
                .linkedInUrl(request.getLinkedInUrl() != null ? request.getLinkedInUrl().trim() : null)
                .status(ApplicationStatus.APPLIED)
                .build();

        JobApplication savedApplication = jobApplicationRepository.save(jobApplication);
        log.info("Job application with ID {} saved successfully for user with email {}", savedApplication.getId(), seekerEmail);
        return mapToJobApplicationResponse(savedApplication);
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponseDto<JobApplicationResponseDto> getMyApplications(String seekerEmail, Pageable pageable) {
        if (seekerEmail == null || seekerEmail.trim().isEmpty()) {
            log.error("Seeker email is null or empty");
            throw new BadRequestException("Seeker email cannot be null or empty");
        }
        User seeker = userRepository.findByEmail(seekerEmail.trim())
                .orElseThrow(() -> {
                    log.error("User with email {} not found", seekerEmail);
                    return new ResourceNotFoundException("User not found with email: " + seekerEmail);
                });
        if (seeker.getRole() != Role.JOB_SEEKER) {
            log.error("User with email {} is not a seeker", seekerEmail);
            throw new BadRequestException("Only job seekers can view their applications");
        }
        if (pageable == null) {
            log.error("Pageable parameter is null");
            throw new BadRequestException("Pageable parameter cannot be null");
        }
        log.info("Fetching applications for user with email {}", seekerEmail);
        Page<JobApplication> applicationsPage = jobApplicationRepository.findByApplicantId(seeker.getId(), pageable);
        List<JobApplicationResponseDto> applicationDtos = applicationsPage.stream()
                .map(this::mapToJobApplicationResponse)
                .toList();

        return new PageResponseDto<>(
                applicationDtos,
                applicationsPage.getNumber(),
                applicationsPage.getSize(),
                applicationsPage.getTotalElements(),
                applicationsPage.getTotalPages(),
                applicationsPage.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public JobApplicationResponseDto getApplicationById(Long id, String currentUserEmail) {
        if (id == null || id <= 0) {
            log.error("Application ID is null or invalid: {}", id);
            throw new BadRequestException("Application ID must be a positive number");
        }
        if (currentUserEmail == null || currentUserEmail.trim().isEmpty()) {
            log.error("Current user email is null or empty");
            throw new BadRequestException("Current user email cannot be null or empty");
        }
        User currentUser = userRepository.findByEmail(currentUserEmail.trim())
                .orElseThrow(() -> {
                    log.error("User with email {} not found", currentUserEmail);
                    return new ResourceNotFoundException("User not found with email: " + currentUserEmail);
                });
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Job application with ID {} not found", id);
                    return new ResourceNotFoundException("Job application not found with id: " + id);
                });

        boolean isApplicant = application.getApplicant() != null && application.getApplicant().getId().equals(currentUser.getId());
        boolean isOwner = isOwner(application.getJob(), currentUser);
        boolean isAdmin = currentUser.getRole() == Role.ADMIN;

        if (!isApplicant && !isOwner && !isAdmin) {
            log.error("User with email {} is not authorized to view application with ID {}", currentUserEmail, id);
            throw new BadRequestException("You are not authorized to view this application");
        }

        log.info("Returning application with ID {} for user with email {}", id, currentUserEmail);
        return mapToJobApplicationResponse(application);
    }

    @Transactional(readOnly = true)
    @Override
    public PageResponseDto<JobApplicationResponseDto> getApplicationsForJob(Long jobId, String employerEmail, Pageable pageable) {
        if (jobId == null || jobId <= 0) {
            log.error("Job ID is null or invalid: {}", jobId);
            throw new BadRequestException("Job ID must be a positive number");
        }
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.error("Employer email is null or empty");
            throw new BadRequestException("Employer email cannot be null or empty");
        }
        if (pageable == null) {
            log.error("Pageable parameter is null");
            throw new BadRequestException("Pageable parameter cannot be null");
        }
        User employer = userRepository.findByEmail(employerEmail.trim())
                .orElseThrow(() -> {
                    log.error("User with email {} not found", employerEmail);
                    return new ResourceNotFoundException("User not found with email: " + employerEmail);
                });
        if (employer.getRole() != Role.EMPLOYER && employer.getRole() != Role.ADMIN) {
            log.error("User with email {} is not an employer or admin", employerEmail);
            throw new BadRequestException("Only employers can view applications for their jobs");
        }
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> {
                    log.error("Job with ID {} not found", jobId);
                    return new ResourceNotFoundException("Job not found with id: " + jobId);
                });
        if (!isOwner(job, employer) && employer.getRole() != Role.ADMIN) {
            log.error("User with email {} is not authorized to view applications for job with ID {}", employerEmail, jobId);
            throw new BadRequestException("You are not authorized to view applications for this job");
        }
        Page<JobApplication> applicationsPage = jobApplicationRepository.findByJobId(jobId, pageable);
        List<JobApplicationResponseDto> applicationDtos = applicationsPage.stream()
                .map(this::mapToJobApplicationResponse)
                .toList();
        return new PageResponseDto<>(
                applicationDtos,
                applicationsPage.getNumber(),
                applicationsPage.getSize(),
                applicationsPage.getTotalElements(),
                applicationsPage.getTotalPages(),
                applicationsPage.isLast()
        );
    }

    @Transactional
    @Override
    public JobApplicationResponseDto updateApplicationStatus(Long id, String employerEmail, ApplicationStatusUpdateDto request) {
        if (id == null || id <= 0) {
            log.error("Application ID is null or invalid: {}", id);
            throw new BadRequestException("Application ID must be a positive number");
        }
        if (employerEmail == null || employerEmail.trim().isEmpty()) {
            log.error("Employer email is null or empty");
            throw new BadRequestException("Employer email cannot be null or empty");
        }
        if (request == null || request.getStatus() == null) {
            log.error("Request or status is null");
            throw new BadRequestException("Request and status cannot be null");
        }
        User employer = userRepository.findByEmail(employerEmail.trim())
                .orElseThrow(() -> {
                    log.error("User with email {} not found", employerEmail);
                    return new ResourceNotFoundException("User not found with email: " + employerEmail);
                });
        if (employer.getRole() != Role.EMPLOYER && employer.getRole() != Role.ADMIN) {
            log.error("User with email {} is not an employer or admin", employerEmail);
            throw new BadRequestException("Only employers can update application status");
        }
        JobApplication application = jobApplicationRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Job application with ID {} not found", id);
                    return new ResourceNotFoundException("Job application not found with id: " + id);
                });
        if (!isOwner(application.getJob(), employer) && employer.getRole() != Role.ADMIN) {
            log.error("User with email {} is not authorized to update application with ID {}", employerEmail, id);
            throw new BadRequestException("You are not authorized to update this application");
        }
        application.setStatus(request.getStatus());
        JobApplication updatedApplication = jobApplicationRepository.save(application);
        log.info("Updated status of application with ID {} to {} by user with email {}", id, request.getStatus(), employerEmail);
        return mapToJobApplicationResponse(updatedApplication);
    }

    private boolean isOwner(Job job, User user) {
        if (job == null || user == null) {
            return false;
        }
        return (job.getCreatedBy() != null && job.getCreatedBy().getId().equals(user.getId()))
                || (job.getCompany() != null && job.getCompany().getEmployer() != null && job.getCompany().getEmployer().getId().equals(user.getId()));
    }

    private JobApplicationResponseDto mapToJobApplicationResponse(JobApplication application) {
        if (application == null) {
            log.error("Job application is null");
            throw new BadRequestException("Job application cannot be null");
        }
        Job job = application.getJob();
        Company company = job != null ? job.getCompany() : null;
        User applicant = application.getApplicant();

        return JobApplicationResponseDto.builder()
                .id(application.getId())
                .jobId(job != null ? job.getId() : null)
                .jobTitle(job != null ? job.getTitle() : null)
                .companyId(company != null ? company.getId() : null)
                .companyName(company != null ? company.getName() : null)
                .companyLogoUrl(company != null ? company.getLogoUrl() : null)
                .applicantId(applicant != null ? applicant.getId() : null)
                .applicantName(applicant != null ? applicant.getName() : null)
                .applicantEmail(applicant != null ? applicant.getEmail() : null)
                .applicantPhone(applicant != null ? applicant.getPhone() : null)
                .resumeUrl(application.getResumeUrl())
                .coverLetter(application.getCoverLetter())
                .portfolioUrl(application.getPortfolioUrl())
                .linkedInUrl(application.getLinkedInUrl())
                .status(application.getStatus())
                .appliedAt(application.getAppliedAt())
                .updatedAt(application.getUpdatedAt())
                .build();
    }
}
