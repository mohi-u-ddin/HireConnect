package com.mohiuddin.HireConnect.Service;


import com.mohiuddin.HireConnect.Model.Dto.JobCreateRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.JobResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.JobStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Dto.JobUpdateRequestDto;
import com.mohiuddin.HireConnect.Model.Enums.EmploymentType;
import com.mohiuddin.HireConnect.Model.Enums.ExperienceLevel;
import com.mohiuddin.HireConnect.Model.Enums.WorkArrangement;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import org.springframework.data.domain.Pageable;


import java.math.BigDecimal;

public interface JobService {

    JobResponseDto createJobService(String employerEmail, JobCreateRequestDto jobCreateRequestDto);
    JobResponseDto getJobById(Long id);
    PageResponseDto<JobResponseDto> getAllActiveJobs(String keyword, String location, String category,
                                                     EmploymentType employmentType, ExperienceLevel experienceLevel,
                                                     WorkArrangement workArrangement, BigDecimal minSalary, BigDecimal maxSalary,
                                                     Pageable pageable);
    PageResponseDto<JobResponseDto> getMYJobs(String employerEmail, Pageable pageable);
    JobResponseDto updateJob(long id,String employerEmail, JobUpdateRequestDto request);
    JobResponseDto updateJobStatus(long id, String employerEmail, JobStatusUpdateDto request);
    void deleteJob(long id, String userEmail, boolean isAdmin);

}
