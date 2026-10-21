
package com.example.demo.Services;

import com.example.demo.DTO.RunRequest;
import com.example.demo.Repository.UserSubmissionRepository;
import com.example.demo.UserSubmission;

import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class SubmissionWorker {

    private static final int MAX_ATTEMPTS = 3;

    private final SubmissionQueueService queueService;
    private final UserSubmissionRepository submissionRepository;
    private final JudgeService judgeService;

    public SubmissionWorker(
            SubmissionQueueService queueService,
            UserSubmissionRepository submissionRepository,
            JudgeService judgeService) {
        this.queueService = queueService;
        this.submissionRepository = submissionRepository;
        this.judgeService = judgeService;
    }

    @Scheduled(fixedDelay = 1000)
    public void processNextSubmission() {
        Long submissionId;

        try {
            submissionId = queueService.dequeue();
        } catch (Exception e) {
            System.err.println(
                    "Failed to read judge queue: " + e.getMessage());
            return;
        }

        if (submissionId == null) {
            return;
        }

        System.out.println("Processing submission: " + submissionId);

        try {
            UserSubmission submission = submissionRepository
                    .findById(submissionId)
                    .orElse(null);

            if (submission == null) {
                System.err.println(
                        "Submission not found: " + submissionId);
                queueService.acknowledge(submissionId);
                return;
            }

            // Ignore stale or duplicate queue entries.
            if (!"QUEUED".equals(submission.getStatus())) {
                System.out.println(
                        "Skipping submission " + submissionId
                                + " with status " + submission.getStatus());
                queueService.acknowledge(submissionId);
                return;
            }

            // Persist the attempt before starting the judge.
            submission.setAttemptCount(submission.getAttemptCount() + 1);
            submission.setStatus("RUNNING");
            submission.setResultMessage(
                    "Judging attempt " + submission.getAttemptCount()
                            + " of " + MAX_ATTEMPTS);
            submissionRepository.save(submission);

            System.out.println(
                    "Attempt " + submission.getAttemptCount()
                            + "/" + MAX_ATTEMPTS
                            + " for submission " + submissionId);

            RunRequest request = new RunRequest();
            request.setUserId(submission.getUserId());
            request.setProblemId(submission.getProblemId());
            request.setLanguage(submission.getLanguage());
            request.setCode(submission.getSourceCode());

            // Does not create another submission or update dashboard metrics.
            String verdict = judgeService.judgeQueuedSubmission(request);

            String finalStatus;

            if ("ALL_TESTS_PASSED".equals(verdict)) {
                finalStatus = "ACCEPTED";
            } else if (verdict != null && verdict.startsWith("Test ")) {
                if (verdict.contains("COMPILE_ERROR")) {
                    finalStatus = "COMPILATION_ERROR";
                } else if (verdict.contains("RUNTIME_ERROR")) {
                    finalStatus = "RUNTIME_ERROR";
                } else if (verdict.contains("TIME_LIMIT_EXCEEDED")) {
                    finalStatus = "TIME_LIMIT_EXCEEDED";
                } else if (verdict.contains("MEMORY_LIMIT_EXCEEDED")) {
                    finalStatus = "MEMORY_LIMIT_EXCEEDED";
                } else if (verdict.contains("WRONG_ANSWER")) {
                    finalStatus = "WRONG_ANSWER";
                } else {
                    finalStatus = "JUDGE_ERROR";
                }
            } else {
                finalStatus = "JUDGE_ERROR";
            }

            if ("JUDGE_ERROR".equals(finalStatus)) {
                retryOrFail(submission, verdict);
                return;
            }

            // Persist the final verdict before acknowledging the job.
            submission.setStatus(finalStatus);
            submission.setResultMessage(verdict);
            submissionRepository.save(submission);
            queueService.acknowledge(submissionId);

            System.out.println(
                    "Submission " + submissionId
                            + " finished: " + finalStatus);

        } catch (Exception e) {
            System.err.println(
                    "Failed to judge submission " + submissionId);
            e.printStackTrace();

            try {
                submissionRepository.findById(submissionId)
                        .filter(s -> "RUNNING".equals(s.getStatus()))
                        .ifPresent(s -> retryOrFail(
                                s, "Internal judge error"));
            } catch (Exception updateError) {
                // Leave the processing entry for recovery.
                System.err.println(
                        "Failed to handle judge failure: "
                                + updateError.getMessage());
            }
        }
    }

    private void retryOrFail(
            UserSubmission submission,
            String failureMessage) {

        Long submissionId = submission.getId();

        if (submission.getAttemptCount() < MAX_ATTEMPTS) {
            submission.setStatus("QUEUED");
            submission.setResultMessage(
                    "Internal judge failure. Retrying attempt "
                            + (submission.getAttemptCount() + 1)
                            + " of " + MAX_ATTEMPTS + ".");

            submissionRepository.save(submission);

            try {
                // Enqueue the retry before acknowledging the current job.
                queueService.enqueue(submissionId);
                queueService.acknowledge(submissionId);

                System.out.println(
                        "Requeued submission " + submissionId
                                + " after attempt "
                                + submission.getAttemptCount());

            } catch (Exception queueError) {
                // Preserve the current processing entry for recovery.
                System.err.println(
                        "Failed to requeue submission " + submissionId
                                + ": " + queueError.getMessage());
            }

        } else {
            submission.setStatus("JUDGE_ERROR");
            submission.setResultMessage(
                    "Judge failed after " + MAX_ATTEMPTS
                            + " attempts. Last result: "
                            + (failureMessage == null
                                    ? "Unknown internal error"
                                    : failureMessage));

            submissionRepository.save(submission);
            queueService.acknowledge(submissionId);

            System.err.println(
                    "Submission " + submissionId
                            + " exhausted all " + MAX_ATTEMPTS
                            + " attempts.");
        }
    }
}
