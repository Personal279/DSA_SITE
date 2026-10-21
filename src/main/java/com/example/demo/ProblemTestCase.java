package com.example.demo;

import jakarta.persistence.Embeddable;
import jakarta.persistence.Column;

@Embeddable
public class ProblemTestCase {

    @Column(columnDefinition = "TEXT")
    private String input;      // JSON string e.g. {"nums":[2,7,11,15],"target":9}

    @Column(columnDefinition = "TEXT")
    private String expected;   // e.g. "0 1"

    public ProblemTestCase() {}

    public ProblemTestCase(String input, String expected) {
        this.input = input;
        this.expected = expected;
    }

    public String getInput() { return input; }
    public void setInput(String input) { this.input = input; }

    public String getExpected() { return expected; }
    public void setExpected(String expected) { this.expected = expected; }
}