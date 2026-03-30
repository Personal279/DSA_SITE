package com.example.demo.DTO;

public class RunRequest {
    private Long problemId;
    private String language;
    private String code;
    private Long userId;
    private boolean showDiff;

    public Long getProblemId() { return problemId; }
    public String getLanguage() { return language; }
    public String getCode() { return code; }
    public Long getUserId() { return userId; }
    public boolean isShowDiff() { return showDiff; }

    public void setProblemId(Long problemId) { this.problemId = problemId; }
    public void setLanguage(String language) { this.language = language; }
    public void setCode(String code) { this.code = code; }
    public void setUserId(Long userId) { this.userId = userId; }
    public void setShowDiff(boolean showDiff) { this.showDiff = showDiff; }
}