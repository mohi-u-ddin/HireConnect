package com.mohiuddin.HireConnect.Service;

import com.mohiuddin.HireConnect.Model.Dto.UserResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.UserStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import org.springframework.data.domain.Pageable;

import java.util.Map;

public interface AdminService {

    PageResponseDto<UserResponseDto> getAllUsers(Pageable pageable);

    UserResponseDto updateUserStatus(Long userId, UserStatusUpdateDto request);

    Map<String, Object> getPlatformStats();
}
