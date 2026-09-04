package com.mohiuddin.HireConnect.Controller;

import com.mohiuddin.HireConnect.Model.Dto.CompanyRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.CompanyResponseDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;
import com.mohiuddin.HireConnect.Service.CompanyService;
import jakarta.validation.Valid;
import lombok.AllArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/companies")
@AllArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PreAuthorize("hasRole('EMPLOYER')")
    @PostMapping
    public ResponseEntity<CompanyResponseDto> createCompany(@RequestParam String employerEmail,
                                                            @Valid @RequestBody
                                                            CompanyRequestDto companyRequestDto) {

        CompanyResponseDto created = companyService.createCompany(employerEmail, companyRequestDto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<CompanyResponseDto> getCompanyById(@PathVariable long id) {
        CompanyResponseDto companyResponseDto = companyService.getCompanyById(id);
        return ResponseEntity.ok(companyResponseDto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @GetMapping("/my")
    public ResponseEntity<CompanyResponseDto> getMyCompanies(@RequestParam String employerEmail) {
        CompanyResponseDto companyResponseDto = companyService.getMyCompany(employerEmail);
        return ResponseEntity.ok(companyResponseDto);
    }

    @PreAuthorize("hasRole('EMPLOYER')")
    @PutMapping("/{id}")
    public ResponseEntity<CompanyResponseDto> updateCompany(@PathVariable long id,
                                                  @RequestParam String employerEmail,
                                                  @Valid @RequestBody CompanyRequestDto companyRequestDto) {
        CompanyResponseDto updated = companyService.updateCompany(id, employerEmail, companyRequestDto);
        return ResponseEntity.ok(updated);
    }


    @GetMapping
    public ResponseEntity<PageResponseDto<CompanyResponseDto>> getAllCompanies(Pageable pageable) {
        return ResponseEntity.ok(companyService.getAllCompanies(pageable));
    }
}
