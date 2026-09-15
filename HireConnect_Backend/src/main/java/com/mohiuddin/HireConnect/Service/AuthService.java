package com.mohiuddin.HireConnect.Service;

import com.mohiuddin.HireConnect.Model.Dto.AuthResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.ChangePasswordRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.LoginRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.RegisterRequestDto;

public interface AuthService {

    AuthResponseDto register(RegisterRequestDto request);

    AuthResponseDto login(LoginRequestDto request);

    void changePassword(String currentUserEmail, ChangePasswordRequestDto request);
}
