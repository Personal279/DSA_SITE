package com.example.demo;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProblemDTO {
    private Long id;
    private String title;
    private String description;
    private List<String> topics;
    private List<TestCase> testCases;
    private List<TestCase> hiddenCases;
    private boolean solved;
    private String timeSpent;
}
