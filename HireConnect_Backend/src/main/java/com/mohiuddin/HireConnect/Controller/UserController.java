package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.UserResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.UserUpdateRequestDto;
import com.mohiuddin.HireConnect.Service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<UserResponseDto> getCurrentUserProfile(
            @RequestParam(required = false) String currentUserEmail,
            Principal principal) {
        String email = resolveEmail(principal, currentUserEmail);
        UserResponseDto user = userService.getCurrentUserProfile(email);
        return ResponseEntity.ok(user);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/me")
    public ResponseEntity<UserResponseDto> updateUserProfile(
            @RequestParam(required = false) String currentUserEmail,
            Principal principal,
            @Valid @RequestBody UserUpdateRequestDto request) {
        String email = resolveEmail(principal, currentUserEmail);
        UserResponseDto updatedUser = userService.updateUserProfile(email, request);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
        UserResponseDto user = userService.getUserById(id);
        return ResponseEntity.ok(user);
    }

    private String resolveEmail(Principal principal, String emailParam) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName().trim();
        }
        return emailParam != null ? emailParam.trim() : null;
    }
}
