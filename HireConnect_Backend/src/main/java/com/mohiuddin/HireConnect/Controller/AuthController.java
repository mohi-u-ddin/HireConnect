package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.AuthResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.ChangePasswordRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.LoginRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.RegisterRequestDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.ApiResponse;
import com.mohiuddin.HireConnect.Service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponseDto> register(@Valid @RequestBody RegisterRequestDto request) {
        AuthResponseDto response = authService.register(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> login(@Valid @RequestBody LoginRequestDto request) {
        AuthResponseDto response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PreAuthorize("isAuthenticated()")
    @PutMapping("/change-password")
    public ResponseEntity<ApiResponse<Void>> changePassword(
            @RequestParam(required = false) String currentUserEmail,
            Principal principal,
            @Valid @RequestBody ChangePasswordRequestDto request) {
        String email = resolveEmail(principal, currentUserEmail);
        authService.changePassword(email, request);
        return ResponseEntity.ok(ApiResponse.success("Password changed successfully"));
    }

    private String resolveEmail(Principal principal, String emailParam) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName().trim();
        }
        return emailParam != null ? emailParam.trim() : null;
    }
}
