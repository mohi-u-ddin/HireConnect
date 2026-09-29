package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.JobApplicationResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.JobCreateRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.JobStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobUpdateRequestDto;
import com.mohiuddin.HireConnect.Model.Enums.EmploymentType;
import com.mohiuddin.HireConnect.Model.Enums.ExperienceLevel;
import com.mohiuddin.HireConnect.Model.Enums.WorkArrangement;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Service.JobApplicationService;
import com.mohiuddin.HireConnect.Service.JobService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.security.Principal;

@RequiredArgsConstructor
@RequestMapping("/api/jobs")
@RestController
public class JobController {

    private final JobService jobService;
    private final JobApplicationService jobApplicationService;

    @GetMapping
    public ResponseEntity<PageResponseDto<JobResponseDto>> getAllActiveJobs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) EmploymentType jobType,
            @RequestParam(required = false) ExperienceLevel experienceLevel,
            @RequestParam(required = false) WorkArrangement workArrangement,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false) String sortBy,
            Pageable pageable) {
        EmploymentType resolvedEmploymentType = employmentType != null ? employmentType : jobType;
        if (sortBy != null && !sortBy.isBlank() && !pageable.getSort().isSorted()) {
            pageable = PageRequest.of(pageable.getPageNumber(), pageable.getPageSize(), Sort.by(Sort.Direction.DESC, sortBy));
        }
        return ResponseEntity.ok(jobService.getAllActiveJobs(
                keyword, location, category, resolvedEmploymentType, experienceLevel, workArrangement, minSalary, maxSalary, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<JobResponseDto> getJobById(@PathVariable long id) {
        JobResponseDto jobResponseDto = jobService.getJobById(id);
        return ResponseEntity.ok(jobResponseDto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public ResponseEntity<JobResponseDto> createJob(
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @Valid @RequestBody JobCreateRequestDto jobRequestDto) {
        String email = resolveEmail(principal, employerEmail);
        JobResponseDto created = jobService.createJobService(email, jobRequestDto);
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping("/{id}")
    public ResponseEntity<JobResponseDto> updateJob(
            @PathVariable long id,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @Valid @RequestBody JobUpdateRequestDto jobRequestDto) {
        String email = resolveEmail(principal, employerEmail);
        JobResponseDto updated = jobService.updateJob(id, email, jobRequestDto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponseDto> updateJobStatus(
            @PathVariable long id,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @Valid @RequestBody JobStatusUpdateDto status) {
        String email = resolveEmail(principal, employerEmail);
        JobResponseDto updated = jobService.updateJobStatus(id, email, status);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(
            @PathVariable long id,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @RequestParam(defaultValue = "false") boolean isAdmin) {
        String email = resolveEmail(principal, employerEmail);
        jobService.deleteJob(id, email, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/my-postings")
    public ResponseEntity<PageResponseDto<JobResponseDto>> getMyJobPostings(
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            Pageable page) {
        String email = resolveEmail(principal, employerEmail);
        return ResponseEntity.ok(jobService.getMYJobs(email, page));
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @GetMapping("/{jobId}/applications")
    public ResponseEntity<PageResponseDto<JobApplicationResponseDto>> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            Pageable pageable) {
        String email = resolveEmail(principal, employerEmail);
        return ResponseEntity.ok(jobApplicationService.getApplicationsForJob(jobId, email, pageable));
    }

    private String resolveEmail(Principal principal, String emailParam) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName().trim();
        }
        return emailParam != null ? emailParam.trim() : null;
    }
}
