package com.mohiuddin.HireConnect.Model.Dto;

import com.mohiuddin.HireConnect.Model.Enums.EmploymentType;
import com.mohiuddin.HireConnect.Model.Enums.ExperienceLevel;
import com.mohiuddin.HireConnect.Model.Enums.JobStatus;
import com.mohiuddin.HireConnect.Model.Enums.WorkArrangement;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobResponseDto {

    private Long id;
    private String title;
    private String description;
    private String responsibilities;
    private String requirements;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String currency;
    private String location;
    private String category;
    private EmploymentType employmentType;
    private ExperienceLevel experienceLevel;
    private WorkArrangement workArrangement;
    private JobStatus status;
    private LocalDate applicationDeadline;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private Long employerId;
    private long applicationsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
