package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Exceptions.ResourceNotFoundException;
import com.mohiuddin.HireConnect.Model.Dto.UserResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.UserStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Repository.CompanyRepository;
import com.mohiuddin.HireConnect.Repository.JobApplicationRepository;
import com.mohiuddin.HireConnect.Repository.JobRepository;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Service.AdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
@Service
public class AdminServiceImpl implements AdminService {

    private final UserRepository userRepository;
    private final CompanyRepository companyRepository;
    private final JobRepository jobRepository;
    private final JobApplicationRepository jobApplicationRepository;

    @Override
    @Transactional(readOnly = true)
    public PageResponseDto<UserResponseDto> getAllUsers(Pageable pageable) {
        if (pageable == null) {
            log.warn("Get all users failed: pageable is null");
            throw new BadRequestException("Pageable must not be null");
        }

        Page<User> usersPage = userRepository.findAll(pageable);
        List<UserResponseDto> userDtos = usersPage.getContent().stream()
                .map(this::mapToUserResponseDto)
                .toList();

        return new PageResponseDto<>(
                userDtos,
                usersPage.getNumber(),
                usersPage.getSize(),
                usersPage.getTotalElements(),
                usersPage.getTotalPages(),
                usersPage.isLast()
        );
    }

    @Override
    @Transactional
    public UserResponseDto updateUserStatus(Long userId, UserStatusUpdateDto request) {
        if (userId == null || userId <= 0) {
            log.warn("Update user status failed: invalid user ID {}", userId);
            throw new BadRequestException("User ID must not be null or invalid");
        }
        if (request == null || request.getEnabled() == null) {
            log.warn("Update user status failed: request or enabled status is null");
            throw new BadRequestException("Request body and enabled status must not be null");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> {
                    log.warn("User not found with ID: {}", userId);
                    return new ResourceNotFoundException("User not found with ID: " + userId);
                });

        user.setEnabled(request.getEnabled());
        User savedUser = userRepository.save(user);
        log.info("Updated user status for ID {}: enabled={}", userId, request.getEnabled());
        return mapToUserResponseDto(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public Map<String, Object> getPlatformStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("totalJobs", jobRepository.count());
        stats.put("totalApplications", jobApplicationRepository.count());

        log.info("Fetched platform statistics: {}", stats);
        return stats;
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
