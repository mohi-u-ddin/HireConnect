package com.mohiuddin.HireConnect.Model.Dto;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class AuthResponseDto {

    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    private UserResponseDto user;
}
