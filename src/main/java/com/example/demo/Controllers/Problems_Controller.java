package com.example.demo.Controllers;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import com.example.demo.Problem;
import com.example.demo.Repository.Problem_repo;
import com.example.demo.Services.ProblemService;


@RestController
public class Problems_Controller {
    @Autowired
    private ProblemService problems_Service;

     @Autowired
    private Problem_repo problem_repo;
    
    @GetMapping("/problems")
    public List<Problem> serach(){
        return problems_Service.get();
    }

    @PostMapping("/PostProblem")

     public ResponseEntity<Problem> createProblem(@RequestBody Problem problem) {
        Problem saved = problem_repo.save(problem);
        return ResponseEntity.ok(saved);
    }
    
}
