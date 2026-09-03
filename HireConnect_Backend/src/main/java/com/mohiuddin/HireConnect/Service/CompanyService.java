package com.mohiuddin.HireConnect.Service;

import com.mohiuddin.HireConnect.Model.Dto.CompanyRequestDto;
import com.mohiuddin.HireConnect.Model.Dto.CompanyResponseDto;
import com.mohiuddin.HireConnect.Model.EnvelopeDto.PageResponseDto;

import org.springframework.data.domain.Pageable;

public interface CompanyService {
   CompanyResponseDto createCompany(String employerEmail, CompanyRequestDto request);

   CompanyResponseDto getCompanyById(Long companyId);

   CompanyResponseDto getMyCompany(String employerEmail);

   CompanyResponseDto updateCompany(long id, String employerEmail, CompanyRequestDto request);

   PageResponseDto<CompanyResponseDto> getAllCompanies(Pageable page);


}
