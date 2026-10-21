
package com.example.demo;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "user_submissions")
public class UserSubmission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "problem_title", nullable = false)
    private String problemTitle;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @Column(name = "problem_id")
    private Long problemId;

    @Column(name = "language")
    private String language;

    @Column(name = "source_code", columnDefinition = "TEXT")
    private String sourceCode;

    @Column(name = "result_message", columnDefinition = "TEXT")
    private String resultMessage;

    @PrePersist
    protected void onCreate() {
        if (this.submittedAt == null) {
            this.submittedAt = LocalDateTime.now();
        }
    }

    public UserSubmission() {}

    // Preserve the existing constructor used by JudgeService.
    public UserSubmission(Long userId, String problemTitle, String status) {
        this.userId = userId;
        this.problemTitle = problemTitle;
        this.status = status;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getProblemTitle() { return problemTitle; }
    public void setProblemTitle(String problemTitle) {
        this.problemTitle = problemTitle;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime submittedAt) {
        this.submittedAt = submittedAt;
    }

    public Long getProblemId() { return problemId; }
    public void setProblemId(Long problemId) { this.problemId = problemId; }

    public String getLanguage() { return language; }
    public void setLanguage(String language) { this.language = language; }

    public String getSourceCode() { return sourceCode; }
    public void setSourceCode(String sourceCode) {
        this.sourceCode = sourceCode;
    }

    @Column(nullable = false)
    private int attemptCount = 0;

    public int getAttemptCount() {
    return attemptCount;
}

public void setAttemptCount(int attemptCount) {
    this.attemptCount = attemptCount;
}

    public String getResultMessage() { return resultMessage; }
    public void setResultMessage(String resultMessage) {
        this.resultMessage = resultMessage;
    }
}
