
package com.example.demo.services;

import com.example.demo.Repository.UserSubmissionRepository;
import com.example.demo.Services.SubmissionQueueService;
import com.example.demo.Services.SubmissionRecovery;
import com.example.demo.UserSubmission;

import org.junit.jupiter.api.Test;

import java.util.List;

import static org.mockito.Mockito.*;

class SubmissionRecoveryTest {

    @Test
    void shouldRequeueSubmissionInterruptedWhileRunning() {
        UserSubmissionRepository repository =
                mock(UserSubmissionRepository.class);
        SubmissionQueueService queueService =
                mock(SubmissionQueueService.class);

        UserSubmission submission = mock(UserSubmission.class);
        when(submission.getId()).thenReturn(42L);

        when(repository.findByStatusOrderBySubmittedAtAsc("RUNNING"))
                .thenReturn(List.of(submission));
        when(repository.findByStatusOrderBySubmittedAtAsc("QUEUED"))
                .thenReturn(List.of(submission));

        SubmissionRecovery recovery =
                new SubmissionRecovery(repository, queueService);

        recovery.recoverSubmissions();

        verify(submission).setStatus("QUEUED");
        verify(submission).setResultMessage(
                "Requeued after an interrupted judging attempt");
        verify(repository).save(submission);
        verify(queueService).clearQueue();
        verify(queueService).enqueue(42L);
    }

    @Test
    void shouldRecoverMultipleInterruptedSubmissions() {
        UserSubmissionRepository repository =
                mock(UserSubmissionRepository.class);
        SubmissionQueueService queueService =
                mock(SubmissionQueueService.class);

        UserSubmission first = mock(UserSubmission.class);
        UserSubmission second = mock(UserSubmission.class);

        when(first.getId()).thenReturn(10L);
        when(second.getId()).thenReturn(20L);

        when(repository.findByStatusOrderBySubmittedAtAsc("RUNNING"))
                .thenReturn(List.of(first, second));
        when(repository.findByStatusOrderBySubmittedAtAsc("QUEUED"))
                .thenReturn(List.of(first, second));

        SubmissionRecovery recovery =
                new SubmissionRecovery(repository, queueService);

        recovery.recoverSubmissions();

        verify(first).setStatus("QUEUED");
        verify(second).setStatus("QUEUED");
        verify(repository).save(first);
        verify(repository).save(second);
        verify(queueService).enqueue(10L);
        verify(queueService).enqueue(20L);
    }

    @Test
    void shouldRestoreAlreadyQueuedSubmissions() {
        UserSubmissionRepository repository =
                mock(UserSubmissionRepository.class);
        SubmissionQueueService queueService =
                mock(SubmissionQueueService.class);

        UserSubmission first = mock(UserSubmission.class);
        UserSubmission second = mock(UserSubmission.class);

        when(first.getId()).thenReturn(101L);
        when(second.getId()).thenReturn(102L);

        when(repository.findByStatusOrderBySubmittedAtAsc("RUNNING"))
                .thenReturn(List.of());
        when(repository.findByStatusOrderBySubmittedAtAsc("QUEUED"))
                .thenReturn(List.of(first, second));

        SubmissionRecovery recovery =
                new SubmissionRecovery(repository, queueService);

        recovery.recoverSubmissions();

        verify(queueService).clearQueue();
        verify(queueService).enqueue(101L);
        verify(queueService).enqueue(102L);
        verify(repository, never()).save(first);
        verify(repository, never()).save(second);
    }

    @Test
    void shouldContinueWhenOneEnqueueFails() {
        UserSubmissionRepository repository =
                mock(UserSubmissionRepository.class);
        SubmissionQueueService queueService =
                mock(SubmissionQueueService.class);

        UserSubmission first = mock(UserSubmission.class);
        UserSubmission second = mock(UserSubmission.class);

        when(first.getId()).thenReturn(201L);
        when(second.getId()).thenReturn(202L);

        when(repository.findByStatusOrderBySubmittedAtAsc("RUNNING"))
                .thenReturn(List.of());
        when(repository.findByStatusOrderBySubmittedAtAsc("QUEUED"))
                .thenReturn(List.of(first, second));

        doThrow(new RuntimeException("Redis unavailable"))
                .when(queueService).enqueue(201L);

        SubmissionRecovery recovery =
                new SubmissionRecovery(repository, queueService);

        recovery.recoverSubmissions();

        verify(queueService).enqueue(201L);
        verify(queueService).enqueue(202L);
    }

    @Test
    void shouldRecoverInterruptedSubmissionAndRestoreQueue() {
        UserSubmissionRepository repository =
                mock(UserSubmissionRepository.class);
        SubmissionQueueService queueService =
                mock(SubmissionQueueService.class);

        UserSubmission interrupted = mock(UserSubmission.class);
        when(interrupted.getId()).thenReturn(303L);

        // Simulate a submission left RUNNING when the worker crashed.
        when(repository.findByStatusOrderBySubmittedAtAsc("RUNNING"))
                .thenReturn(List.of(interrupted));

        // Simulate the submission appearing in the QUEUED query
        // after recovery updates its status.
        when(repository.findByStatusOrderBySubmittedAtAsc("QUEUED"))
                .thenReturn(List.of(interrupted));

        SubmissionRecovery recovery =
                new SubmissionRecovery(repository, queueService);

        recovery.recoverSubmissions();

        verify(interrupted).setStatus("QUEUED");
        verify(interrupted).setResultMessage(
                "Requeued after an interrupted judging attempt");
        verify(repository).save(interrupted);

        verify(queueService).clearQueue();
        verify(queueService).enqueue(303L);
    }
}
