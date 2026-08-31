package com.mohiuddin.HireConnect.Model.Dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class CompanyRequestDto {

    @NotBlank(message = "Company name is required")
    @Size(max = 150, message = "Company name must not exceed 150 characters")
    private String name;

    @NotBlank(message = "Company description is required")
    private String description;

    @Size(max = 255, message = "Company website must not exceed 255 characters")
    private String website;

    @Size(max = 255, message = "Company logo URL must not exceed 255 characters")
    private String logoUrl;

    @NotBlank(message = "Company industry is required")
    @Size(max = 100, message = "Company industry must not exceed 100 characters")
    private String industry;

    @Size(max = 50, message = "Company size must not exceed 50 characters")
    private String companySize;

    @NotBlank(message = "Company location is required")
    @Size(max = 150, message = "Company location must not exceed 150 characters")
    private String location;

    @Min(value = 1800, message = "Company founded year must be 1800 or later")
    private Integer foundedYear;
}
