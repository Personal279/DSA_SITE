package com.example.demo.Services;

import java.time.Duration;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import com.example.demo.Problem;
import com.example.demo.ProblemDTO;
import com.example.demo.Repository.Problem_repo;

import jakarta.transaction.Transactional;
import jakarta.annotation.PostConstruct;

@Service
public class ProblemService {

    @Autowired
    private Problem_repo problem_repo;

    @Autowired
    private RedisTemplate<String, Object> redisTemplate;

    private static final String PROBLEM_CACHE_KEY = "allProblems";

    @PostConstruct
    public void clearCorruptedCache() {
        // Clear any corrupted cache on startup
        redisTemplate.delete(PROBLEM_CACHE_KEY);
    }

    @Transactional
    public List<Problem> getAll() {
        List<ProblemDTO> cachedDTOs = (List<ProblemDTO>) redisTemplate.opsForValue().get(PROBLEM_CACHE_KEY);

        if (cachedDTOs != null) {
            return cachedDTOs.stream().map(dto -> {
                Problem problem = new Problem();
                problem.setId(dto.getId());
                problem.setTitle(dto.getTitle());
                problem.setDescription(dto.getDescription());
                problem.setTopics(dto.getTopics());
                problem.setTestCases(dto.getTestCases());
                problem.setHiddenCases(dto.getHiddenCases());
                problem.setSolved(dto.isSolved());
                problem.setTimeSpent(dto.getTimeSpent());
                problem.setDifficulty(dto.getDifficulty());
                return problem;
            }).collect(Collectors.toList());
        }

        List<Problem> dbProblems = problem_repo.findAll();

        List<ProblemDTO> dtoList = dbProblems.stream().map(p -> {
            ProblemDTO dto = new ProblemDTO();
            dto.setId(p.getId());
            dto.setTitle(p.getTitle());
            dto.setDescription(p.getDescription());
            dto.setTopics(new ArrayList<>(p.getTopics() != null ? p.getTopics() : new ArrayList<>()));
            dto.setTestCases(new ArrayList<>(p.getTestCases() != null ? p.getTestCases() : new ArrayList<>()));
            dto.setHiddenCases(new ArrayList<>(p.getHiddenCases() != null ? p.getHiddenCases() : new ArrayList<>()));
            dto.setSolved(p.isSolved());
            dto.setTimeSpent(p.getTimeSpent());
            dto.setMethodName(p.getMethodName());
            dto.setReturnType(p.getReturnType());
            dto.setParametersJson(p.getParametersJson());
            dto.setDifficulty(p.getDifficulty());
            return dto;
        }).collect(Collectors.toList());

          redisTemplate.opsForValue().set(PROBLEM_CACHE_KEY, dtoList, Duration.ofHours(1));

        return dbProblems;
    }
}