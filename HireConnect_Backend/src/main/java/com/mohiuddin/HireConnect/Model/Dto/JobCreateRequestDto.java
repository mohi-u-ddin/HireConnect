package com.mohiuddin.HireConnect.Model.Dto;

import com.mohiuddin.HireConnect.Model.Enums.EmploymentType;
import com.mohiuddin.HireConnect.Model.Enums.ExperienceLevel;
import com.mohiuddin.HireConnect.Model.Enums.WorkArrangement;
import jakarta.validation.constraints.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobCreateRequestDto {

    @NotBlank(message = "Job title is required")
    @Size(min = 2, max = 150, message = "Job title must be between 2 and 150 characters")
    private String title;

    @NotBlank(message = "Job description is required")
    private String description;

    @NotBlank(message = "Job responsibilities are required")
    private String responsibilities;

    @NotBlank(message = "Job requirements are required")
    private String requirements;

    @DecimalMin(value = "0.0", message = "Minimum salary must be greater than or equal to 0")
    private BigDecimal salaryMin;

    @DecimalMin(value = "0.0", message = "Maximum salary must be greater than or equal to 0")
    private BigDecimal salaryMax;

    @Size(min = 3, max = 3, message = "Currency must be a 3-letter ISO code (e.g. USD)")
    private String currency;

    @NotBlank(message = "Job location is required")
    @Size(max = 150, message = "Location must be less than 150 characters")
    private String location;

    @NotBlank(message = "Job category is required")
    @Size(max = 100, message = "Job category must be less than 100 characters")
    private String category;

    @NotNull(message = "Employment type is required")
    private EmploymentType employmentType;

    @NotNull(message = "Experience level is required")
    private ExperienceLevel experienceLevel;

    @NotNull(message = "Work arrangement is required")
    private WorkArrangement workArrangement;

    @Future(message = "Application deadline must be a future date")
    private LocalDate applicationDeadline;
}
