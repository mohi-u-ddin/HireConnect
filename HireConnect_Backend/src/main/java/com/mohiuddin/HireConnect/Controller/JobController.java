package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.JobCreateRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.JobStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobUpdateRequestDto;
import com.mohiuddin.HireConnect.Model.Enums.EmploymentType;
import com.mohiuddin.HireConnect.Model.Enums.ExperienceLevel;
import com.mohiuddin.HireConnect.Model.Enums.WorkArrangement;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Service.JobService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@AllArgsConstructor
@RequestMapping("/api/jobs")
@RestController
public class JobController {
    private final JobService jobService;

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
    public ResponseEntity<JobResponseDto> createJob(@RequestParam String employerEmail,
                                                    @Valid @RequestBody JobCreateRequestDto jobRequestDto) {
        JobResponseDto created = jobService.createJobService(employerEmail, jobRequestDto);
        return ResponseEntity.ok(created);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping("/{id}")
    public ResponseEntity<JobResponseDto> updateJob(@PathVariable long id,
                                                    @RequestParam String employerEmail,
                                                    @Valid @RequestBody JobUpdateRequestDto jobRequestDto) {
        JobResponseDto updated = jobService.updateJob(id, employerEmail, jobRequestDto);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PatchMapping("/{id}/status")
    public ResponseEntity<JobResponseDto> updateJobStatus(@PathVariable long id,
                                                          @RequestParam String employerEmail,
                                                          @Valid @RequestBody JobStatusUpdateDto status) {
        JobResponseDto updated = jobService.updateJobStatus(id, employerEmail, status);
        return ResponseEntity.ok(updated);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteJob(@PathVariable long id,
                                          @RequestParam String employerEmail,
                                          @RequestParam(defaultValue = "false") boolean isAdmin) {
        jobService.deleteJob(id, employerEmail, isAdmin);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/my-postings")
    public ResponseEntity<PageResponseDto<JobResponseDto>> getMyJobPostings(@RequestParam String employerEmail,
                                                                            Pageable page) {
        return ResponseEntity.ok(jobService.getMYJobs(employerEmail, page));
    }

}
