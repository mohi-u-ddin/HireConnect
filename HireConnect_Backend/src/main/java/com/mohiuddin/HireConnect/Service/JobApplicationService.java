package com.mohiuddin.HireConnect.Service;

import com.mohiuddin.HireConnect.Model.Dto.ApplicationStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobApplicationResponseDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import org.springframework.data.domain.Pageable;

public interface JobApplicationService {

    JobApplicationResponseDto applyForJob(String seekerEmail, JobApplicationRequestDto request);

    PageResponseDto<JobApplicationResponseDto> getMyApplications(String seekerEmail, Pageable pageable);

    JobApplicationResponseDto getApplicationById(Long id, String currentUserEmail);

    PageResponseDto<JobApplicationResponseDto> getApplicationsForJob(Long jobId, String employerEmail, Pageable pageable);

    JobApplicationResponseDto updateApplicationStatus(Long id, String employerEmail, ApplicationStatusUpdateDto request);
}
