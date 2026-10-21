
package com.example.demo.Controllers;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.DTO.PublicProblemDTO;
import com.example.demo.Services.BoilerplateService;
import com.example.demo.Services.JudgeService;
import com.example.demo.Services.ProblemService;

@RestController
@RequestMapping("/api/problems")
@CrossOrigin("http://localhost:5173")
public class ProblemsController {

    @Autowired
    private BoilerplateService boilerplateService;

    @Autowired
    private ProblemService problemService;

    @Autowired
    private JudgeService judgeService;

    @GetMapping
    public List<PublicProblemDTO> getAllProblems() {
        return problemService.getAll().stream()
                .map(problem -> new PublicProblemDTO(
                        problem.getId(),
                        problem.getTitle(),
                        problem.getDescription(),
                        problem.getTopics(),
                        problem.getTestCases(),
                        problem.isSolved(),
                        problem.getTimeSpent(),
                        problem.getMethodName(),
                        problem.getReturnType(),
                        problem.getParametersJson(),
                        problem.getDifficulty()
                ))
                .collect(Collectors.toList());
    }

    @GetMapping("/{id}/boilerplate/{language}")
    public String getBoilerplate(
            @PathVariable Long id,
            @PathVariable String language) throws Exception {

        return boilerplateService.generateBoilerplate(id, language);
    }
}
