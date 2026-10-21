package com.example.demo.Services;

import com.example.demo.DTO.MethodParam;
import com.example.demo.Problem;
import com.example.demo.Repository.Problem_repo;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;

import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class BoilerplateService {

    
    private final Problem_repo problemRepo;

    public BoilerplateService(Problem_repo problemRepo) {
        this.problemRepo = problemRepo;
    }

    public String generateBoilerplate(Long problemId, String language) throws Exception {

        Problem problem = problemRepo.findById(problemId)
            .orElseThrow(() -> new RuntimeException("Problem not found"));

        ObjectMapper mapper = new ObjectMapper();

        List<MethodParam> params =
            mapper.readValue(
                problem.getParametersJson(),
                new TypeReference<List<MethodParam>>() {}
            );

        if ("cpp".equalsIgnoreCase(language)) {
            return boilerplateGenerator.generateCpp(
                problem.getMethodName(),
                problem.getReturnType(),
                params
            );
        }

        return boilerplateGenerator.generateJava(
            problem.getMethodName(),
            problem.getReturnType(),
            params
        );
    }
}