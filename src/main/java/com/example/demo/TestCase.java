package com.example.demo;

import java.io.Serializable;

import jakarta.persistence.Embeddable;

@Embeddable
public class TestCase implements Serializable {
    private String input;
    private String expected;

    public TestCase() {}

    public TestCase(String input, String expected) {
        this.input = input;
        this.expected = expected;
    }

    public String getInput() {
        return input;
    }

    public void setInput(String input) {
        this.input = input;
    }

    public String getExpected() {
        return expected;
    }

    public void setExpected(String expected) {
        this.expected = expected;
    }
}
