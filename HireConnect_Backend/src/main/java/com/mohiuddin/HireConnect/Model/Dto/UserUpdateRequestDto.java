package com.mohiuddin.HireConnect.Model.Dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserUpdateRequestDto {

    @NotBlank(message = "Name cannot be blank")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String name;

    @Size(max = 20, message = "Phone number cannot exceed 20 characters")
    private String phone;

    @Size(max = 100, message = "Location cannot exceed 100 characters")
    private String location;

    @Size(max = 255, message = "Profile image URL cannot exceed 255 characters")
    private String profileImage;

    @Size(max = 150, message = "Headline cannot exceed 150 characters")
    private String headline;

    private String about;

    @Size(max = 255, message = "Resume URL cannot exceed 255 characters")
    private String resumeUrl;
}
