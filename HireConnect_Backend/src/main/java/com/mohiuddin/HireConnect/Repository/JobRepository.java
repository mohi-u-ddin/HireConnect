package com.mohiuddin.HireConnect.Repository;

import com.mohiuddin.HireConnect.Model.Entities.Job;
import com.mohiuddin.HireConnect.Model.Enums.JobStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {
    Page<Job> findByStatus(JobStatus status, Pageable pageable);
    Page<Job> findByCompanyId(Long companyId, Pageable pageable);
    Page<Job> findByCreatedById(Long employerId, Pageable pageable);
    Long countByCompanyId(Long companyId);
}
