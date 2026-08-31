package com.mohiuddin.HireConnect.Model.Dto;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyResponseDto {

    private Long id;
    private String name;
    private String description;
    private String website;
    private String logoUrl;
    private String industry;
    private String companySize;
    private String location;
    private Integer foundedYear;
    private Long employerId;
    private String employerName;
    private long jobsCount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
