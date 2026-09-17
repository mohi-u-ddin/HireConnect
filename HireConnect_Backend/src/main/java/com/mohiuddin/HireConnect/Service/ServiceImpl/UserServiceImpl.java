package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Exceptions.ResourceNotFoundException;
import com.mohiuddin.HireConnect.Model.Dto.UserResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.UserUpdateRequestDto;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Service.UserService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getCurrentUserProfile(String currentUserEmail) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            log.warn("Email is null or blank");
            throw new BadRequestException("Current user email must not be null or blank");
        }
        User user = userRepository.findByEmail(currentUserEmail.trim())
                .orElseThrow(() -> {
                    log.warn("User against id not found with email: {}", currentUserEmail);
                    return new ResourceNotFoundException("User not found with email: " + currentUserEmail);
                });
        log.info("Fetched user profile for email: {}", currentUserEmail);
        return mapToUserResponseDto(user);
    }

    @Override
    @Transactional
    public UserResponseDto updateUserProfile(String currentUserEmail, UserUpdateRequestDto updateRequest) {
        if (currentUserEmail == null || currentUserEmail.isBlank()) {
            log.warn("Current user email is null or blank");
            throw new BadRequestException("Current user email must not be null or blank");
        }
        if (updateRequest == null) {
            log.warn("Update request is null");
            throw new BadRequestException("Update request body must not be null");
        }

        User user = userRepository.findByEmail(currentUserEmail.trim())
                .orElseThrow(() -> {
                    log.warn("User not found with email: {}", currentUserEmail);
                    return new ResourceNotFoundException("User not found with email: " + currentUserEmail);
                });

        if (updateRequest.getName() == null || updateRequest.getName().isBlank() || updateRequest.getName().trim().length() > 100) {
            log.warn("Name is null, blank, or exceeds 100 characters");
            throw new BadRequestException("Name must not be null or blank, and cannot exceed 100 characters");
        }
        if (updateRequest.getPhone() != null && updateRequest.getPhone().length() > 20) {
            log.warn("Phone exceeds 20 characters");
            throw new BadRequestException("Phone must not exceed 20 characters");
        }
        if (updateRequest.getLocation() != null && updateRequest.getLocation().length() > 100) {
            log.warn("Location exceeds 100 characters");
            throw new BadRequestException("Location must not exceed 100 characters");
        }
        if (updateRequest.getProfileImage() != null && updateRequest.getProfileImage().length() > 255) {
            log.warn("Profile image URL exceeds 255 characters");
            throw new BadRequestException("Profile image URL must not exceed 255 characters");
        }
        if (updateRequest.getHeadline() != null && updateRequest.getHeadline().length() > 150) {
            log.warn("Headline exceeds 150 characters");
            throw new BadRequestException("Headline must not exceed 150 characters");
        }
        if (updateRequest.getResumeUrl() != null && updateRequest.getResumeUrl().length() > 255) {
            log.warn("Resume URL exceeds 255 characters");
            throw new BadRequestException("Resume URL must not exceed 255 characters");
        }

        user.setName(updateRequest.getName().trim());
        user.setPhone(updateRequest.getPhone());
        user.setLocation(updateRequest.getLocation());
        user.setProfileImage(updateRequest.getProfileImage());
        user.setHeadline(updateRequest.getHeadline());
        user.setAbout(updateRequest.getAbout());
        user.setResumeUrl(updateRequest.getResumeUrl());

        User savedUser = userRepository.save(user);
        log.info("Updated user profile for email: {}", currentUserEmail);
        return mapToUserResponseDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDto getUserById(Long userId) {
        if (userId == null || userId <= 0) {
            log.warn("User ID is null or invalid: {}", userId);
            throw new BadRequestException("User ID must not be null or invalid");
        }
        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with ID: " + userId);
                });
        log.info("Fetched user profile for ID: {}", userId);
        return mapToUserResponseDto(user);
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        return UserResponseDto.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .role(user.getRole())
                .phone(user.getPhone())
                .location(user.getLocation())
                .profileImage(user.getProfileImage())
                .headline(user.getHeadline())
                .about(user.getAbout())
                .resumeUrl(user.getResumeUrl())
                .enabled(user.isEnabled())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}
