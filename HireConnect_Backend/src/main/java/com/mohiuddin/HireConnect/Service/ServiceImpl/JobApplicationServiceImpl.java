package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Exceptions.ResourceNotFoundException;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationResponseDto;
import com.mohiuddin.HireConnect.Model.Entities.Job;
import com.mohiuddin.HireConnect.Model.Entities.JobApplication;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Model.Enums.ApplicationStatus;
import com.mohiuddin.HireConnect.Model.Enums.JobStatus;
import com.mohiuddin.HireConnect.Model.Enums.Role;
import com.mohiuddin.HireConnect.Repository.JobApplicationRepository;
import com.mohiuddin.HireConnect.Repository.JobRepository;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Service.JobApplicationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@RequiredArgsConstructor
@Service
public abstract class JobApplicationServiceImpl implements JobApplicationService {

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
        if (!seeker.getRole().equals(Role.JOB_SEEKER)) {
            log.error("User with email {} is not a seeker", seekerEmail);
            throw new BadRequestException("Only job seekers can apply for jobs");
        }
        if (request == null) {
            log.error("Job application request is null");
            throw new BadRequestException("Job application request cannot be null");
        }
        if (request.getJobId() == null) {
            log.error("Job ID is null in the request");
            throw new BadRequestException("Job ID cannot be null");
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

    private JobApplicationResponseDto mapToJobApplicationResponse(JobApplication application) {
        if (application == null) {
            log.error("Job application is null");
            throw new BadRequestException("Job application cannot be null");
        }
        return JobApplicationResponseDto.builder()
                .id(application.getId())
                .jobId(application.getJob().getId())
                .jobTitle(application.getJob().getTitle())
                .companyId(application.getJob().getCompany().getId())
                .companyName(application.getJob().getCompany().getName())
                .companyLogoUrl(application.getJob().getCompany().getLogoUrl())
                .applicantId(application.getApplicant().getId())
                .applicantName(application.getApplicant().getName())
                .applicantEmail(application.getApplicant().getEmail())
                .applicantPhone(application.getApplicant().getPhone())
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
