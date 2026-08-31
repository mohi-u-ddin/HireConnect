package com.mohiuddin.HireConnect.Model.Dto;

import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserStatusUpdateDto {

    @NotNull(message = "Account status (enabled) is required")
    private Boolean enabled;
}
