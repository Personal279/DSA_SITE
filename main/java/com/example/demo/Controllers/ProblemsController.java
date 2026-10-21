package com.example.demo.Controllers;

import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import com.example.demo.Problem;
import com.example.demo.Services.ProblemService;
import com.example.demo.Services.BoilerplateService;
import com.example.demo.Services.JudgeService;

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
    public List<Problem> getAllProblems() {
        return problemService.getAll();
    }
    

    @GetMapping("/{id}/boilerplate/{language}")
    public String getBoilerplate(@PathVariable Long id,
                                 @PathVariable String language) throws Exception {
        return boilerplateService.generateBoilerplate(id, language);
    }
}