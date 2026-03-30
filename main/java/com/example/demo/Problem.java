package com.example.demo;

import jakarta.persistence.*;

import java.io.Serializable;
import java.util.List;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@Entity
@Table(name = "problems")
@JsonIgnoreProperties(ignoreUnknown = true)
public class Problem implements Serializable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String title;
    private String description;

    @Version
    private Integer version;

    @ElementCollection
    private List<String> topics;

    @Column(columnDefinition = "TEXT")
    private String parametersJson;   

    private String methodName;       
    private String returnType;       
    private String validator;
    private String difficulty;       

    @ElementCollection
    @CollectionTable(name = "problem_test_cases", joinColumns = @JoinColumn(name = "problem_id"))
    private List<ProblemTestCase> testCases;

    @ElementCollection
    @CollectionTable(name = "problem_hidden_cases", joinColumns = @JoinColumn(name = "problem_id"))
    private List<ProblemHiddenCase> hiddenCases;

    private boolean solved;
    private String timeSpent;


    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public Integer getVersion() { return version; }
    public void setVersion(Integer version) { this.version = version; }

    public List<String> getTopics() { return topics; }
    public void setTopics(List<String> topics) { this.topics = topics; }

    public String getParametersJson() { return parametersJson; }
    public void setParametersJson(String parametersJson) { this.parametersJson = parametersJson; }

    public String getMethodName() { return methodName; }
    public void setMethodName(String methodName) { this.methodName = methodName; }

    public String getReturnType() { return returnType; }
    public void setReturnType(String returnType) { this.returnType = returnType; }

    public String getValidator() { return validator; }
    public void setValidator(String validator) { this.validator = validator; }

    public String getDifficulty() { return difficulty; }
    public void setDifficulty(String difficulty) { this.difficulty = difficulty; }

    public List<ProblemTestCase> getTestCases() { return testCases; }
    public void setTestCases(List<ProblemTestCase> testCases) { this.testCases = testCases; }

    public List<ProblemHiddenCase> getHiddenCases() { return hiddenCases; }
    public void setHiddenCases(List<ProblemHiddenCase> hiddenCases) { this.hiddenCases = hiddenCases; }

    public boolean isSolved() { return solved; }
    public void setSolved(boolean solved) { this.solved = solved; }

    public String getTimeSpent() { return timeSpent; }
    public void setTimeSpent(String timeSpent) { this.timeSpent = timeSpent; }
}