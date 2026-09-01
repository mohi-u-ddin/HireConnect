package com.mohiuddin.HireConnect.Repository;



import com.mohiuddin.HireConnect.Model.Entities.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface JobApplicationRepository extends JpaRepository<JobApplication, Long> {
    Page<JobApplication> findByApplicantId(Long applicantId, Pageable pageable);
    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);
    boolean existsByApplicantIdAndJobId(Long applicantId, Long jobId);
    Long countByJobId(Long jobId);
}
