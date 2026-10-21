package com.example.demo.DTO;

import com.example.demo.UserSubmission;
import java.time.LocalDateTime;

public record SubmissionStatusResponse(
        Long id,
        String status,
        String resultMessage,
        LocalDateTime submittedAt
) {
    public static SubmissionStatusResponse from(UserSubmission submission) {
        return new SubmissionStatusResponse(
                submission.getId(),
                submission.getStatus(),
                submission.getResultMessage(),
                submission.getSubmittedAt()
        );
    }
}