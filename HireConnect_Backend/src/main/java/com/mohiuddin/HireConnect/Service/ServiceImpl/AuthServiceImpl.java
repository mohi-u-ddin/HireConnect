package com.mohiuddin.HireConnect.Service.ServiceImpl;

import com.mohiuddin.HireConnect.Exceptions.BadRequestException;
import com.mohiuddin.HireConnect.Model.Dto.*;
import com.mohiuddin.HireConnect.Model.Entities.User;
import com.mohiuddin.HireConnect.Model.Enums.Role;
import com.mohiuddin.HireConnect.Repository.UserRepository;
import com.mohiuddin.HireConnect.Security.JwtService;
import com.mohiuddin.HireConnect.Service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.regex.Pattern;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[A-Za-z0-9+_.-]+@(.+)$");

    private final UserRepository userRepository;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public AuthResponseDto register(RegisterRequestDto request) {
        if (request == null) {
            log.error("Register failed: request body is null");
            throw new BadRequestException("RegisterRequestDto cannot be null");
        }

        if (request.getName() == null || request.getName().trim().length() < 2 || request.getName().trim().length() > 100) {
            log.error("Register failed: Name is null, empty, or not between 2 and 100 characters");
            throw new BadRequestException("Name cannot be null or empty or must be in 2 to 100 characters");
        }

        String rawEmail = request.getEmail();
        if (rawEmail == null || rawEmail.trim().isEmpty()
                || !EMAIL_PATTERN.matcher(rawEmail.trim()).matches()
                || rawEmail.trim().length() > 255) {
            log.error("Register failed: Email is null, empty, invalid format, or exceeds 255 characters");
            throw new BadRequestException("Email cannot be null or empty or invalid format or must be less than 255 characters");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6 || request.getPassword().length() > 100) {
            log.error("Register failed: Password is null, empty, or not between 6 and 100 characters");
            throw new BadRequestException("Password cannot be null or empty or must be in 6 to 100 characters");
        }

        if (request.getRole() == null) {
            log.error("Register failed: Role is null");
            throw new BadRequestException("Role cannot be null");
        }

        if (request.getRole() != Role.JOB_SEEKER && request.getRole() != Role.EMPLOYER) {
            log.error("Registration failed: Invalid role for registration: {}", request.getRole());
            throw new BadRequestException("Only JOB_SEEKER and EMPLOYER roles are permitted to register");
        }

        String phone = (request.getPhone() != null && !request.getPhone().trim().isEmpty())
                ? request.getPhone().trim()
                : null;
        if (phone != null && phone.length() > 20) {
            log.error("Register failed: Phone number exceeds 20 characters");
            throw new BadRequestException("Phone number must be less than 20 characters");
        }

        String location = (request.getLocation() != null && !request.getLocation().trim().isEmpty())
                ? request.getLocation().trim()
                : null;
        if (location != null && location.length() > 100) {
            log.error("Register failed: Location exceeds 100 characters");
            throw new BadRequestException("Location must be less than 100 characters");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            log.error("Registration failed: Email already registered: {}", email);
            throw new BadRequestException("Email is already registered");
        }

        String name = request.getName().trim();
        String encodedPassword = passwordEncoder.encode(request.getPassword().trim());

        User user = User.builder()
                .name(name)
                .email(email)
                .password(encodedPassword)
                .role(request.getRole())
                .phone(phone)
                .location(location)
                .enabled(true)
                .build();

        User savedUser = userRepository.save(user);
        log.info("User registered successfully with ID: {} and email: {}", savedUser.getId(), savedUser.getEmail());

        String token = jwtService.generateToken(savedUser.getEmail(), savedUser.getRole().name());

        return AuthResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(mapToUserResponseDto(savedUser))
                .build();
    }

    @Transactional(readOnly = true)
    @Override
    public AuthResponseDto login(LoginRequestDto request) {
        if (request == null) {
            log.error("Login failed: request body is null");
            throw new BadRequestException("Login request cannot be null");
        }

        String rawEmail = request.getEmail();
        if (rawEmail == null || rawEmail.trim().isEmpty()
                || !EMAIL_PATTERN.matcher(rawEmail.trim()).matches()
                || rawEmail.trim().length() > 255) {
            log.error("Login failed: Email is null, empty, invalid format, or exceeds 255 characters");
            throw new BadRequestException("Email cannot be null or empty or invalid format or must be less than 255 characters");
        }

        if (request.getPassword() == null || request.getPassword().trim().length() < 6 || request.getPassword().length() > 100) {
            log.error("Login failed: Password is null, empty, or not between 6 and 100 characters");
            throw new BadRequestException("Password cannot be null or empty or must be in 6 to 100 characters");
        }

        String email = rawEmail.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Login failed: User not found with email: {}", email);
                    return new BadRequestException("Invalid email or password");
                });

        if (!user.isEnabled()) {
            log.error("Login failed: User account is disabled for email: {}", email);
            throw new BadRequestException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getPassword().trim(), user.getPassword())) {
            log.error("Login failed: Invalid password for email: {}", email);
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtService.generateToken(user.getEmail(), user.getRole().name());
        log.info("User logged in successfully with ID: {} and email: {}", user.getId(), user.getEmail());

        return AuthResponseDto.builder()
                .accessToken(token)
                .tokenType("Bearer")
                .user(mapToUserResponseDto(user))
                .build();
    }

    @Transactional
    @Override
    public void changePassword(String currentUserEmail, ChangePasswordRequestDto request) {
        if (currentUserEmail == null || currentUserEmail.trim().isEmpty()) {
            log.error("Change password failed: Current user email is null or empty");
            throw new BadRequestException("Current user email cannot be null or empty");
        }

        if (request == null) {
            log.error("Change password failed: request body is null");
            throw new BadRequestException("Change password request cannot be null");
        }

        if (request.getCurrentPassword() == null || request.getCurrentPassword().trim().isEmpty()) {
            log.error("Change password failed: Current password is null or empty");
            throw new BadRequestException("Current password cannot be null or empty");
        }

        if (request.getNewPassword() == null || request.getNewPassword().trim().length() < 6 || request.getNewPassword().length() > 100) {
            log.error("Change password failed: New password must be between 6 and 100 characters");
            throw new BadRequestException("New password must be between 6 and 100 characters");
        }

        String email = currentUserEmail.trim().toLowerCase(Locale.ROOT);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("Change password failed: User not found with email: {}", email);
                    return new BadRequestException("User not found");
                });

        if (!user.isEnabled()) {
            log.error("Change password failed: User account is disabled for email: {}", email);
            throw new BadRequestException("User account is disabled");
        }

        if (!passwordEncoder.matches(request.getCurrentPassword().trim(), user.getPassword())) {
            log.error("Change password failed: Current password does not match for email: {}", email);
            throw new BadRequestException("Current password does not match");
        }

        if (passwordEncoder.matches(request.getNewPassword().trim(), user.getPassword())) {
            log.error("Change password failed: New password cannot be the same as the old password for email: {}", email);
            throw new BadRequestException("New password cannot be the same as the old password");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        userRepository.save(user);
        log.info("Password changed successfully for user with ID: {} and email: {}", user.getId(), user.getEmail());
    }

    private UserResponseDto mapToUserResponseDto(User user) {
        if (user == null) {
            return null;
        }
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
