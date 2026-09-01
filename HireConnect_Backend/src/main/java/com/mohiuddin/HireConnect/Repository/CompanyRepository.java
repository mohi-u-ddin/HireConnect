package com.mohiuddin.HireConnect.Repository;

import com.mohiuddin.HireConnect.Model.Entities.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {
    Optional<Company> findByEmployerId(Long employerId);
    boolean existsByName(String name);
    boolean existsByEmployerId(Long employerId);
}
