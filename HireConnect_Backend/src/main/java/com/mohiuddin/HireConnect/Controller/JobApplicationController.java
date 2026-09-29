package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.ApplicationStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationResponseDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Service.JobApplicationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/applications")
@RequiredArgsConstructor
public class JobApplicationController {

    private final JobApplicationService jobApplicationService;

    @PreAuthorize("hasRole('JOB_SEEKER')")
    @PostMapping
    public ResponseEntity<JobApplicationResponseDto> applyForJob(
            @RequestParam(required = false) String seekerEmail,
            Principal principal,
            @Valid @RequestBody JobApplicationRequestDto request) {
        String email = resolveEmail(principal, seekerEmail);
        JobApplicationResponseDto created = jobApplicationService.applyForJob(email, request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PreAuthorize("hasRole('JOB_SEEKER')")
    @GetMapping("/my")
    public ResponseEntity<PageResponseDto<JobApplicationResponseDto>> getMyApplications(
            @RequestParam(required = false) String seekerEmail,
            Principal principal,
            Pageable pageable) {
        String email = resolveEmail(principal, seekerEmail);
        return ResponseEntity.ok(jobApplicationService.getMyApplications(email, pageable));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<JobApplicationResponseDto> getApplicationById(
            @PathVariable Long id,
            @RequestParam(required = false) String currentUserEmail,
            Principal principal) {
        String email = resolveEmail(principal, currentUserEmail);
        return ResponseEntity.ok(jobApplicationService.getApplicationById(id, email));
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @GetMapping({"/job/{jobId}", "/jobs/{jobId}"})
    public ResponseEntity<PageResponseDto<JobApplicationResponseDto>> getApplicationsForJob(
            @PathVariable Long jobId,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            Pageable pageable) {
        String email = resolveEmail(principal, employerEmail);
        return ResponseEntity.ok(jobApplicationService.getApplicationsForJob(jobId, email, pageable));
    }

    @PreAuthorize("hasAnyRole('EMPLOYER', 'ADMIN')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobApplicationResponseDto> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @Valid @RequestBody ApplicationStatusUpdateDto request) {
        String email = resolveEmail(principal, employerEmail);
        JobApplicationResponseDto updated = jobApplicationService.updateApplicationStatus(id, email, request);
        return ResponseEntity.ok(updated);
    }

    private String resolveEmail(Principal principal, String emailParam) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName().trim();
        }
        return emailParam != null ? emailParam.trim() : null;
    }
}
