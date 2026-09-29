package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.UserResponseDto;
import com.mohiuddin.HireConnect.Model.Dto.UserStatusUpdateDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Service.AdminService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;

    @GetMapping("/users")
    public ResponseEntity<PageResponseDto<UserResponseDto>> getAllUsers(Pageable pageable) {
        PageResponseDto<UserResponseDto> users = adminService.getAllUsers(pageable);
        return ResponseEntity.ok(users);
    }

    @PatchMapping("/users/{id}/status")
    public ResponseEntity<UserResponseDto> updateUserStatus(
            @PathVariable Long id,
            @Valid @RequestBody UserStatusUpdateDto request) {
        UserResponseDto updatedUser = adminService.updateUserStatus(id, request);
        return ResponseEntity.ok(updatedUser);
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPlatformStats() {
        Map<String, Object> stats = adminService.getPlatformStats();
        return ResponseEntity.ok(stats);
    }
}
