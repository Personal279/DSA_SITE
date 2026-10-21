
package com.example.demo.Repository;

import com.example.demo.UserSubmission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserSubmissionRepository
        extends JpaRepository<UserSubmission, Long> {

    List<UserSubmission> findTop5ByUserIdOrderBySubmittedAtDesc(
            Long userId);

    Optional<UserSubmission> findByIdAndUserId(
            Long id, Long userId);

    List<UserSubmission> findByStatusOrderBySubmittedAtAsc(
            String status);

    boolean existsByUserIdAndProblemIdAndStatus(
            Long userId, Long problemId, String status);
}
