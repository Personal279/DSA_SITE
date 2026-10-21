
package com.example.demo.Services;

import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Service
public class SubmissionQueueService {

    public static final String QUEUE_KEY = "judge:submissions";
    public static final String PROCESSING_QUEUE_KEY =
            "judge:submissions:processing";

    private final StringRedisTemplate redisTemplate;

    public SubmissionQueueService(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    public void enqueue(Long submissionId) {
        if (submissionId == null) {
            throw new IllegalArgumentException(
                    "Submission ID cannot be null");
        }

        redisTemplate.opsForList().rightPush(
                QUEUE_KEY, submissionId.toString());
    }

    /**
     * Atomically moves a job from the waiting queue
     * into the processing queue.
     */
    public Long dequeue() {
        String value = redisTemplate.opsForList().rightPopAndLeftPush(
                QUEUE_KEY,
                PROCESSING_QUEUE_KEY,
                Duration.ofSeconds(5));

        if (value == null) {
            return null;
        }

        try {
            return Long.parseLong(value);
        } catch (NumberFormatException e) {
            // Malformed entries should not remain in processing forever.
            redisTemplate.opsForList().remove(
                    PROCESSING_QUEUE_KEY, 1, value);

            throw new IllegalStateException(
                    "Invalid submission ID in Redis queue: " + value, e);
        }
    }

    /**
     * Acknowledge a job after its result has been persisted.
     */
    public void acknowledge(Long submissionId) {
        if (submissionId == null) {
            return;
        }

        redisTemplate.opsForList().remove(
                PROCESSING_QUEUE_KEY, 1, submissionId.toString());
    }

    public void clearQueue() {
        redisTemplate.delete(QUEUE_KEY);
        redisTemplate.delete(PROCESSING_QUEUE_KEY);
    }
}
