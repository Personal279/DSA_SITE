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
    
    // USE THE SPECIFIC ENTITY TYPES HERE:
    private List<ProblemTestCase> testCases; 
    private List<ProblemHiddenCase> hiddenCases; 
    
    private boolean solved;
    private String timeSpent;

    // Fields for your "Super Boilerplate"
    private String methodName;
    private String returnType;
    private String parametersJson;
    private String difficulty;
}