
package com.example.demo.DTO;

import java.util.List;

import com.example.demo.ProblemTestCase;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PublicProblemDTO {

    private Long id;
    private String title;
    private String description;
    private List<String> topics;
    private List<ProblemTestCase> testCases;
    private boolean solved;
    private String timeSpent;
    private String methodName;
    private String returnType;
    private String parametersJson;
    private String difficulty;
}
