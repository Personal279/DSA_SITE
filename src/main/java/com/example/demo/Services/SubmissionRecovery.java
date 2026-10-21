
package com.example.demo.Services;

import com.example.demo.Repository.UserSubmissionRepository;
import com.example.demo.UserSubmission;

import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class SubmissionRecovery {

    private final UserSubmissionRepository submissionRepository;
    private final SubmissionQueueService queueService;

    public SubmissionRecovery(
            UserSubmissionRepository submissionRepository,
            SubmissionQueueService queueService) {
        this.submissionRepository = submissionRepository;
        this.queueService = queueService;
    }

    @PostConstruct
    public void recoverSubmissions() {
        System.out.println("Starting submission queue recovery");

        // Rebuild Redis from the database.
        queueService.clearQueue();

        // Requeue submissions interrupted while RUNNING.
        List<UserSubmission> interrupted =
                submissionRepository.findByStatusOrderBySubmittedAtAsc(
                        "RUNNING");

        for (UserSubmission submission : interrupted) {
            submission.setStatus("QUEUED");
            submission.setResultMessage(
                    "Requeued after an interrupted judging attempt");

            submissionRepository.save(submission);
        }

        // Restore all pending submissions to Redis.
        List<UserSubmission> queued =
                submissionRepository.findByStatusOrderBySubmittedAtAsc(
                        "QUEUED");

        int requeued = 0;

        for (UserSubmission submission : queued) {
            try {
                queueService.enqueue(submission.getId());
                requeued++;
            } catch (Exception e) {
                System.err.println(
                        "Failed to enqueue submission "
                                + submission.getId() + ": "
                                + e.getMessage());
            }
        }

        System.out.println(
                "Submission recovery complete. Requeued "
                        + requeued + " of " + queued.size()
                        + " submissions.");
    }
}
