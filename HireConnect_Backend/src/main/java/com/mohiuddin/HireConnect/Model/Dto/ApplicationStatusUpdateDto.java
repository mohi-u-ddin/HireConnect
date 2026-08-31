package com.mohiuddin.HireConnect.Model.Dto;

import com.mohiuddin.HireConnect.Model.Enums.ApplicationStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ApplicationStatusUpdateDto {

    @NotNull(message = "Application status is required")
    private ApplicationStatus status;
}
