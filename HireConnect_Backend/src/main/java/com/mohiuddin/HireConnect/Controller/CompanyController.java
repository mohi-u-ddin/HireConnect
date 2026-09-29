package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.CompanyRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.CompanyResponseDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;

@RestController
@RequestMapping("/api/companies")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public ResponseEntity<CompanyResponseDto> createCompany(
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @Valid @RequestBody CompanyRequestDto companyRequestDto) {
        String email = resolveEmail(principal, employerEmail);
        CompanyResponseDto created = companyService.createCompany(email, companyRequestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDto> getCompanyById(@PathVariable long id) {
        CompanyResponseDto companyResponseDto = companyService.getCompanyById(id);
        return ResponseEntity.ok(companyResponseDto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/my")
    public ResponseEntity<CompanyResponseDto> getMyCompanies(
            @RequestParam(required = false) String employerEmail,
            Principal principal) {
        String email = resolveEmail(principal, employerEmail);
        CompanyResponseDto companyResponseDto = companyService.getMyCompany(email);
        return ResponseEntity.ok(companyResponseDto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDto> updateCompany(
            @PathVariable long id,
            @RequestParam(required = false) String employerEmail,
            Principal principal,
            @Valid @RequestBody CompanyRequestDto companyRequestDto) {
        String email = resolveEmail(principal, employerEmail);
        CompanyResponseDto updated = companyService.updateCompany(id, email, companyRequestDto);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    public ResponseEntity<PageResponseDto<CompanyResponseDto>> getAllCompanies(Pageable pageable) {
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }

    private String resolveEmail(Principal principal, String emailParam) {
        if (principal != null && principal.getName() != null && !principal.getName().isBlank()) {
            return principal.getName().trim();
        }
        return emailParam != null ? emailParam.trim() : null;
    }
}
