package com.mohiuddin.HireConnect.Model.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobApplicationRequestDto {

    @NotNull(message = "Job ID is required")
    private Long jobId;

    @NotBlank(message = "Resume URL is required")
    @Size(max = 255, message = "Resume URL must not exceed 255 characters")
    private String resumeUrl;

    private String coverLetter;

    @Size(max = 255, message = "Portfolio URL must not exceed 255 characters")
    private String portfolioUrl;

    @Size(max = 255, message = "LinkedIn URL must not exceed 255 characters")
    private String linkedInUrl;
}
