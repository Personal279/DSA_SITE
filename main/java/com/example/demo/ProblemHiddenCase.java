package com.example.demo;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;

@Embeddable
public class ProblemHiddenCase {

    @Column(columnDefinition = "TEXT")
    private String input;

    @Column(columnDefinition = "TEXT")
    private String expected;

    public ProblemHiddenCase() {}

    public ProblemHiddenCase(String input, String expected) {
        this.input = input;
        this.expected = expected;
    }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public String getExpected() { return expected; }
    public void setExpected(String expected) { this.expected = expected; }
}