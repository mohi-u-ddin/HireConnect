package com.mohiuddin.HireConnect.Model.Dto;

import com.mohiuddin.HireConnect.Model.Enums.JobStatus;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class JobStatusUpdateDto {

    @NotNull(message = "Job status is required")
    private JobStatus status;
}
