package com.mohiuddin.HireConnect.Model.Dto;

import com.mohiuddin.HireConnect.Model.Enums.ApplicationStatus;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobApplicationResponseDto {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long companyId;
    private String companyName;
    private String companyLogoUrl;
    private Long applicantId;
    private String applicantName;
    private String applicantEmail;
    private String applicantPhone;
    private String resumeUrl;
    private String coverLetter;
    private String portfolioUrl;
    private String linkedInUrl;
    private ApplicationStatus status;
    private LocalDateTime appliedAt;
    private LocalDateTime updatedAt;
}
