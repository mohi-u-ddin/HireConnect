package com.mohiuddin.HireConnect.Service;

import com.mohiuddin.HireConnect.Model.Dto.UserResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.UserUpdateRequestDto;

public interface UserService {

    UserResponseDto getCurrentUserProfile(String currentUserEmail);

    UserResponseDto updateUserProfile(String currentUserEmail, UserUpdateRequestDto request);

    UserResponseDto getUserById(Long id);
}
