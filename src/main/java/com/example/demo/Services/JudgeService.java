package com.example.demo.Services;

import com.example.demo.Problem;
import com.example.demo.ProblemHiddenCase;
import com.example.demo.ProblemTestCase;
import com.example.demo.UserSubmission;
import com.example.demo.Users;
import com.example.demo.DTO.RunRequest;
import com.example.demo.Repository.Problem_repo;
import com.example.demo.Repository.UserRepository;
import com.example.demo.Repository.UserSubmissionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.stream.Collectors;

@Service
public class JudgeService {
    public static final Map<Long, List<Map<String, String>>> recentSubmissionsCache = new java.util.concurrent.ConcurrentHashMap<>();
    private static final int    TIMEOUT_SECONDS = 15;
    private static final String MEM_LIMIT       = "256m";
    private static final String CPU_LIMIT       = "0.5";
    private static final int MAX_CAPTURE_CHARS = 64 * 1024;

    private final Problem_repo problemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    @Autowired
    private UserSubmissionRepository userSubmissionRepository;
    private final UserRepository userRepository;

    public JudgeService(Problem_repo problemRepository, UserRepository userRepository) {
        this.problemRepository = problemRepository;
        this.userRepository = userRepository; // <-- ADD THIS
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ called by /api/run (sample test cases only) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    public String run(RunRequest request) throws Exception {
        if (request.getProblemId() == null)
            return "INVALID_REQUEST: problemId is missing";

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        List<ProblemTestCase> testCases = problem.getTestCases();
        if (testCases == null || testCases.isEmpty())
            return "NO_TESTCASES_FOUND";

        Path jobDir = createJobDir(request.getLanguage(), request.getCode(), problem);
        try {
            StringBuilder sb = new StringBuilder();
            int idx = 1;
            for (ProblemTestCase tc : testCases) {
                String result = runOneCase(jobDir, request.getLanguage(),
                        tc.getInput(), tc.getExpected(), problem.getValidator(), idx);
                sb.append(result).append("\n");
                idx++;
            }
            return sb.toString().trim();
        } finally {
            deleteDir(jobDir);
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ called by /api/submit (hidden test cases) Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    public String judge(RunRequest request) throws Exception {
        if (request.getUserId() == null)
            return "USER_NOT_LOGGED_IN";

        if (request.getProblemId() == null)
            return "INVALID_REQUEST: problemId is missing";

        Problem problem = problemRepository.findById(request.getProblemId())
                .orElseThrow(() -> new RuntimeException("Problem not found"));

        List<ProblemHiddenCase> hiddenCases = problem.getHiddenCases();
        if (hiddenCases == null || hiddenCases.isEmpty())
            return "NO_HIDDEN_CASES_FOUND";

        Path jobDir = createJobDir(request.getLanguage(), request.getCode(), problem);
        try {
            int idx = 1;
            for (ProblemHiddenCase tc : hiddenCases) {
                String result = runOneCase(jobDir, request.getLanguage(),
                        tc.getInput(), tc.getExpected(), problem.getValidator(), idx);
                if (!result.startsWith("Test " + idx + ": PASSED"))
                    return result;
                idx++;
            }
            updateUserDashboardMetrics(request.getUserId(), problem);
            return "ALL_TESTS_PASSED";
        } finally {
            deleteDir(jobDir);
        }
    }


    private void updateUserDashboardMetrics(Long userId, Problem problem) {
        try {
            Optional<Users> userOpt = userRepository.findById(userId);
            if (userOpt.isPresent()) {
                Users user = userOpt.get();

                user.setTotalSolved(user.getTotalSolved() + 1);

                if (problem.getDifficulty() != null) {
                    String diff = problem.getDifficulty().trim().toUpperCase();
                    switch (diff) {
                        case "EASY":
                            user.setEasySolved(user.getEasySolved() + 1);
                            break;
                        case "MEDIUM":
                            user.setMediumSolved(user.getMediumSolved() + 1);
                            break;
                        case "HARD":
                            user.setHardSolved(user.getHardSolved() + 1);
                            break;
                    }
                }

                userRepository.save(user);
                UserSubmission submission = new UserSubmission(userId, problem.getTitle(), "ACCEPTED");
                userSubmissionRepository.save(submission);
            }
        } catch (Exception e) {
            System.err.println("Error updating profile submission metrics: " + e.getMessage());
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ create job directory with user code + generated wrapper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private Path createJobDir(String language, String code, Problem problem) throws Exception {
        Path jobDir = Files.createTempDirectory("judge-");
        if ("java".equalsIgnoreCase(language)) {
            String wrapped = generateJavaWrapper(code, problem);
            Files.writeString(jobDir.resolve("Main.java"), wrapped);
        } else {
            String wrapped = generateCppWrapper(code, problem);
            Files.writeString(jobDir.resolve("main.cpp"), wrapped);
        }
        return jobDir;
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ C++ wrapper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String generateCppWrapper(String userCode, Problem problem) throws Exception {
        String parametersJson = problem.getParametersJson();
        String methodName     = problem.getMethodName();
        String returnType     = problem.getReturnType();

        List<Map<String, String>> params = objectMapper.readValue(
                parametersJson,
                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
        );

        StringBuilder sb = new StringBuilder();
        sb.append(userCode).append("\n\n");

        sb.append("int main() {\n");
        sb.append("    ios::sync_with_stdio(false);\n");
        sb.append("    cin.tie(NULL);\n");
        sb.append("    Solution sol;\n\n");

        for (Map<String, String> param : params) {
            sb.append(cppParseParam(param.get("name"), param.get("type")));
        }

        sb.append("\n    auto result = sol.").append(methodName).append("(");
        sb.append(params.stream().map(p -> p.get("name")).collect(Collectors.joining(", ")));
        sb.append(");\n\n");

        sb.append(cppPrintResult(returnType));
        sb.append("    return 0;\n");
        sb.append("}\n");

        return sb.toString();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ C++ helper: parse a single param from stdin Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String cppParseParam(String name, String type) {
        switch (type) {
            case "int":
                return "    int " + name + "; cin >> " + name + ";\n";
            case "long":
                return "    long long " + name + "; cin >> " + name + ";\n";
            case "double":
            case "float":
                return "    double " + name + "; cin >> " + name + ";\n";
            case "String":
            case "string":
                return "    string " + name + "; cin >> " + name + ";\n";
            case "boolean":
                return "    bool " + name + "; cin >> " + name + ";\n";
            case "int[]":
            case "List<Integer>":
                return "    int _n_" + name + "; cin >> _n_" + name + ";\n"
                     + "    vector<int> " + name + "(_n_" + name + ");\n"
                     + "    for(int i=0;i<_n_" + name + ";i++) cin >> " + name + "[i];\n";
            case "long[]":
                return "    int _n_" + name + "; cin >> _n_" + name + ";\n"
                     + "    vector<long long> " + name + "(_n_" + name + ");\n"
                     + "    for(int i=0;i<_n_" + name + ";i++) cin >> " + name + "[i];\n";
            case "double[]":
                return "    int _n_" + name + "; cin >> _n_" + name + ";\n"
                     + "    vector<double> " + name + "(_n_" + name + ");\n"
                     + "    for(int i=0;i<_n_" + name + ";i++) cin >> " + name + "[i];\n";
            case "String[]":
            case "string[]":
            case "List<String>":
                return "    int _n_" + name + "; cin >> _n_" + name + ";\n"
                     + "    vector<string> " + name + "(_n_" + name + ");\n"
                     + "    for(int i=0;i<_n_" + name + ";i++) cin >> " + name + "[i];\n";
            case "int[][]":
                return "    int _r_" + name + "; cin >> _r_" + name + ";\n"
                     + "    vector<vector<int>> " + name + "(_r_" + name + ");\n"
                     + "    for(int i=0;i<_r_" + name + ";i++){\n"
                     + "        int _c_" + name + "; cin >> _c_" + name + ";\n"
                     + "        " + name + "[i].resize(_c_" + name + ");\n"
                     + "        for(int j=0;j<_c_" + name + ";j++) cin >> " + name + "[i][j];\n"
                     + "    }\n";
            default:
                return "    // unsupported type: " + type + "\n";
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ C++ helper: print result Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String cppPrintResult(String returnType) {
        switch (returnType) {
            case "int":
            case "long":
            case "double":
            case "float":
            case "String":
            case "string":
                return "    cout << result << endl;\n";
            case "boolean":
            case "bool":
                return "    cout << (result ? \"true\" : \"false\") << endl;\n";
            case "int[]":
            case "long[]":
            case "double[]":
            case "String[]":
            case "string[]":
            case "List<Integer>":
            case "List<String>":
                return "    for(int i=0;i<(int)result.size();i++){\n"
                     + "        if(i>0) cout << \" \";\n"
                     + "        cout << result[i];\n"
                     + "    }\n"
                     + "    cout << endl;\n";
            case "int[][]":
                return "    for(int i=0;i<(int)result.size();i++){\n"
                     + "        for(int j=0;j<(int)result[i].size();j++){\n"
                     + "            if(j>0) cout << \" \";\n"
                     + "            cout << result[i][j];\n"
                     + "        }\n"
                     + "        cout << endl;\n"
                     + "    }\n";
            default:
                return "    cout << result << endl;\n";
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Java wrapper Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String generateJavaWrapper(String userCode, Problem problem) throws Exception {
        String parametersJson = problem.getParametersJson();
        String methodName     = problem.getMethodName();
        String returnType     = problem.getReturnType();

        List<Map<String, String>> params = objectMapper.readValue(
                parametersJson,
                objectMapper.getTypeFactory().constructCollectionType(List.class, Map.class)
        );

        StringBuilder sb = new StringBuilder();
        sb.append("import java.util.*;\n");
        sb.append("import java.util.stream.*;\n\n");

        sb.append(userCode).append("\n\n");

        sb.append("public class Main {\n");
        sb.append("    public static void main(String[] args) throws Exception {\n");
        sb.append("        Scanner sc = new Scanner(System.in);\n");
        sb.append("        Solution sol = new Solution();\n\n");

        for (Map<String, String> param : params) {
            sb.append(javaParseParam(param.get("name"), param.get("type")));
        }

        sb.append("\n        var result = sol.").append(methodName).append("(");
        sb.append(params.stream().map(p -> p.get("name")).collect(Collectors.joining(", ")));
        sb.append(");\n\n");

        sb.append(javaPrintResult(returnType));
        sb.append("    }\n}\n");

        return sb.toString();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Java helper: parse a single param from stdin Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String javaParseParam(String name, String type) {
        switch (type) {
            case "int":
                return "        int " + name + " = sc.nextInt();\n";
            case "long":
                return "        long " + name + " = sc.nextLong();\n";
            case "double":
            case "float":
                return "        double " + name + " = sc.nextDouble();\n";
            case "String":
            case "string":
                return "        String " + name + " = sc.next();\n";
            case "boolean":
                return "        boolean " + name + " = sc.nextBoolean();\n";
            case "int[]":
                return "        int _n_" + name + " = sc.nextInt();\n"
                     + "        int[] " + name + " = new int[_n_" + name + "];\n"
                     + "        for(int i=0;i<_n_" + name + ";i++) " + name + "[i] = sc.nextInt();\n";
            case "long[]":
                return "        int _n_" + name + " = sc.nextInt();\n"
                     + "        long[] " + name + " = new long[_n_" + name + "];\n"
                     + "        for(int i=0;i<_n_" + name + ";i++) " + name + "[i] = sc.nextLong();\n";
            case "double[]":
                return "        int _n_" + name + " = sc.nextInt();\n"
                     + "        double[] " + name + " = new double[_n_" + name + "];\n"
                     + "        for(int i=0;i<_n_" + name + ";i++) " + name + "[i] = sc.nextDouble();\n";
            case "String[]":
            case "string[]":
                return "        int _n_" + name + " = sc.nextInt();\n"
                     + "        String[] " + name + " = new String[_n_" + name + "];\n"
                     + "        for(int i=0;i<_n_" + name + ";i++) " + name + "[i] = sc.next();\n";
            case "int[][]":
                // Fixed: read each row size separately to match jsonToStdin format
                return "        int _r_" + name + " = sc.nextInt();\n"
                     + "        int[][] " + name + " = new int[_r_" + name + "][];\n"
                     + "        for(int i=0;i<_r_" + name + ";i++) {\n"
                     + "            int _c_" + name + " = sc.nextInt();\n"
                     + "            " + name + "[i] = new int[_c_" + name + "];\n"
                     + "            for(int j=0;j<_c_" + name + ";j++) " + name + "[i][j] = sc.nextInt();\n"
                     + "        }\n";
            case "List<Integer>":
                return "        int _n_" + name + " = sc.nextInt();\n"
                     + "        List<Integer> " + name + " = new ArrayList<>();\n"
                     + "        for(int i=0;i<_n_" + name + ";i++) " + name + ".add(sc.nextInt());\n";
            case "List<String>":
                return "        int _n_" + name + " = sc.nextInt();\n"
                     + "        List<String> " + name + " = new ArrayList<>();\n"
                     + "        for(int i=0;i<_n_" + name + ";i++) " + name + ".add(sc.next());\n";
            default:
                return "        // unsupported type: " + type + "\n";
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ Java helper: print result Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String javaPrintResult(String returnType) {
        switch (returnType) {
            case "int":
            case "long":
            case "double":
            case "float":
            case "String":
            case "string":
            case "boolean":
            case "bool":
                return "        System.out.println(result);\n";
            case "int[]":
            case "long[]":
                return "        StringBuilder sb = new StringBuilder();\n"
                     + "        for(int i=0;i<result.length;i++){\n"
                     + "            if(i>0) sb.append(\" \");\n"
                     + "            sb.append(result[i]);\n"
                     + "        }\n"
                     + "        System.out.println(sb);\n";
            case "String[]":
            case "string[]":
                return "        System.out.println(String.join(\" \", result));\n";
            case "int[][]":
                return "        for(int[] row : result){\n"
                     + "            StringBuilder sb = new StringBuilder();\n"
                     + "            for(int i=0;i<row.length;i++){\n"
                     + "                if(i>0) sb.append(\" \");\n"
                     + "                sb.append(row[i]);\n"
                     + "            }\n"
                     + "            System.out.println(sb);\n"
                     + "        }\n";
            case "List<Integer>":
            case "List<String>":
                return "        System.out.println(String.join(\" \", result.stream()"
                     + ".map(Object::toString).collect(Collectors.toList())));\n";
            case "void":
                return "";
            default:
                return "        System.out.println(result);\n";
        }
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ run one test case Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private String runOneCase(Path jobDir, String language,
                              String inputJson, String expected,
                              String validator, int idx) throws Exception {

        String image = "java".equalsIgnoreCase(language) ? "judge-java" : "judge-cpp";
        String containerName = "judge-" + UUID.randomUUID().toString().replace("-", "");

        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run",
                "--name", containerName,
                "--network", "none",
                "--memory", MEM_LIMIT,
                "--memory-swap", MEM_LIMIT,
                "--cpus", CPU_LIMIT,
                "--pids-limit", "64",
                "--read-only",
                "--tmpfs", "/tmp:rw,nosuid,size=128m",
                "--cap-drop", "ALL",
                "--security-opt", "no-new-privileges",
                "-i",
                "-v", jobDir.toAbsolutePath() + ":/app:ro",
                image
        );

        Process p = pb.start();
        StringBuilder stdout = new StringBuilder();
        StringBuilder stderr = new StringBuilder();
        AtomicBoolean outputLimitExceeded = new AtomicBoolean(false);

        Thread outThread = new Thread(
                () -> drainStream(p.getInputStream(), stdout, outputLimitExceeded),
                "judge-stdout-" + idx
        );
        Thread errThread = new Thread(
                () -> drainStream(p.getErrorStream(), stderr, outputLimitExceeded),
                "judge-stderr-" + idx
        );
        outThread.start();
        errThread.start();

        try {
            String stdinInput = jsonToStdin(inputJson);
            if (stdinInput != null && !stdinInput.isEmpty()) {
                p.getOutputStream().write(stdinInput.getBytes(StandardCharsets.UTF_8));
            }
            p.getOutputStream().close();

            long deadline = System.nanoTime() + TimeUnit.SECONDS.toNanos(TIMEOUT_SECONDS);
            while (p.isAlive()) {
                if (outputLimitExceeded.get()) {
                    stopContainer(p, containerName);
                    joinReader(outThread);
                    joinReader(errThread);
                    return "Test " + idx + ": OUTPUT_LIMIT_EXCEEDED";
                }

                long remaining = deadline - System.nanoTime();
                if (remaining <= 0) {
                    stopContainer(p, containerName);
                    joinReader(outThread);
                    joinReader(errThread);
                    return "Test " + idx + ": TIME_LIMIT_EXCEEDED (>" + TIMEOUT_SECONDS + "s)";
                }

                p.waitFor(Math.min(100L, Math.max(1L,
                        TimeUnit.NANOSECONDS.toMillis(remaining))), TimeUnit.MILLISECONDS);
            }

            joinReader(outThread);
            joinReader(errThread);

            if (outputLimitExceeded.get()) {
                return "Test " + idx + ": OUTPUT_LIMIT_EXCEEDED";
            }

            int exit = p.exitValue();
            String out = stdout.toString().trim();
            String err = stderr.toString().trim();

            // Inspect Docker's recorded state before removing the completed container.
            // Exit code 137 alone is not enough to prove an out-of-memory kill.
            if (isContainerOomKilled(containerName)) {
                return "Test " + idx + ": MEMORY_LIMIT_EXCEEDED";
            }

            boolean compileError = exit != 0 && Arrays.stream(out.split("\\R"))
                    .anyMatch(line -> line.trim().equals("COMPILE_ERROR"));
            if (compileError) {
                String details = Arrays.stream(out.split("\\R"))
                        .filter(line -> !line.trim().equals("COMPILE_ERROR"))
                        .collect(Collectors.joining("\n")).trim();
                if (details.isEmpty()) {
                    details = err;
                }
                return "Test " + idx + ": COMPILE_ERROR\n" + details;
            }

            if (exit != 0) {
                return "Test " + idx + ": RUNTIME_ERROR\n" + (err.isEmpty() ? out : err);
            }
            if (out.isEmpty()) {
                return "Test " + idx + ": NO_OUTPUT";
            }
            if (validate(out, expected, validator)) {
                return "Test " + idx + ": PASSED";
            }
            return "Test " + idx + ": WRONG_ANSWER\n"
                    + "Expected: " + expected.trim() + "\n"
                    + "Got:      " + out;

        } catch (Exception e) {
            stopContainer(p, containerName);
            throw e;
        } finally {
            // We intentionally do not use `docker run --rm`: the container state
            // must remain available long enough to inspect State.OOMKilled.
            removeContainer(containerName);
        }
    }

    private boolean isContainerOomKilled(String containerName) {
        Process inspect = null;
        try {
            inspect = new ProcessBuilder(
                    "docker", "inspect", "--format={{.State.OOMKilled}}", containerName
            ).redirectErrorStream(true).start();

            if (!inspect.waitFor(3, TimeUnit.SECONDS)) {
                inspect.destroyForcibly();
                return false;
            }
            if (inspect.exitValue() != 0) {
                return false;
            }

            try (InputStreamReader reader = new InputStreamReader(
                    inspect.getInputStream(), StandardCharsets.UTF_8)) {
                StringBuilder result = new StringBuilder();
                char[] buffer = new char[128];
                int count;
                while ((count = reader.read(buffer)) != -1) {
                    result.append(buffer, 0, count);
                }
                return "true".equalsIgnoreCase(result.toString().trim());
            }
        } catch (Exception ignored) {
            return false;
        } finally {
            if (inspect != null && inspect.isAlive()) {
                inspect.destroyForcibly();
            }
        }
    }

    private void removeContainer(String containerName) {
        Process cleanup = null;
        try {
            cleanup = new ProcessBuilder("docker", "rm", "-f", containerName)
                    .redirectErrorStream(true)
                    .start();
            if (!cleanup.waitFor(3, TimeUnit.SECONDS)) {
                cleanup.destroyForcibly();
            }
        } catch (Exception ignored) {
            // Best-effort cleanup; Docker may already have removed the container.
        } finally {
            if (cleanup != null && cleanup.isAlive()) {
                cleanup.destroyForcibly();
            }
        }
    }

    private void drainStream(InputStream stream, StringBuilder captured,
                             AtomicBoolean outputLimitExceeded) {
        try (InputStreamReader reader = new InputStreamReader(stream, StandardCharsets.UTF_8)) {
            char[] buffer = new char[4096];
            int count;
            while ((count = reader.read(buffer)) != -1) {
                int remaining = MAX_CAPTURE_CHARS - captured.length();
                int toStore = Math.min(Math.max(0, remaining), count);
                if (toStore > 0) {
                    captured.append(buffer, 0, toStore);
                }
                if (toStore < count) {
                    outputLimitExceeded.set(true);
                }
            }
        } catch (Exception ignored) {
            // The stream can close while the Docker process is being terminated.
        }
    }

    private void joinReader(Thread thread) {
        try {
            thread.join(1000);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
        }
    }

    private void stopContainer(Process dockerProcess, String containerName) {
        try {
            Process cleanup = new ProcessBuilder("docker", "rm", "-f", containerName)
                    .redirectErrorStream(true)
                    .start();
            if (!cleanup.waitFor(3, TimeUnit.SECONDS)) {
                cleanup.destroyForcibly();
            }
        } catch (Exception ignored) {
            // Best-effort container cleanup; still terminate the Docker CLI below.
        }

        if (dockerProcess.isAlive()) {
            dockerProcess.destroyForcibly();
            try {
                dockerProcess.waitFor(2, TimeUnit.SECONDS);
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
            }
        }
    }

    private String jsonToStdin(String inputJson) throws Exception {
        JsonNode root = objectMapper.readTree(inputJson);
        StringBuilder sb = new StringBuilder();
        Iterator<Map.Entry<String, JsonNode>> fields = root.fields();
        while (fields.hasNext()) {
            Map.Entry<String, JsonNode> entry = fields.next();
            JsonNode val = entry.getValue();
            if (val.isArray()) {
                sb.append(val.size()).append("\n");
                List<String> items = new ArrayList<>();
                for (JsonNode item : val) {
                    if (item.isArray()) {
                        List<String> row = new ArrayList<>();
                        for (JsonNode cell : item) row.add(cell.asText());
                        sb.append(row.size()).append("\n");
                        sb.append(String.join(" ", row)).append("\n");
                    } else {
                        items.add(item.asText());
                    }
                }
                if (!items.isEmpty()) sb.append(String.join(" ", items)).append("\n");
            } else {
                sb.append(val.asText()).append("\n");
            }
        }
        return sb.toString();
    }

    // Ã¢â€â‚¬Ã¢â€â‚¬ validators Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬Ã¢â€â‚¬
    private boolean validate(String actual, String expected, String validator) {
        if (validator == null) validator = "EXACT";
        switch (validator.toUpperCase()) {
            case "ANY_ORDER": {
                String[] a = normalize(actual).split(" ");
                String[] e = normalize(expected).split(" ");
                Arrays.sort(a);
                Arrays.sort(e);
                return Arrays.equals(a, e);
            }
            case "SET_MATCH": {
                Set<String> a = new HashSet<>(Arrays.asList(normalize(actual).split(" ")));
                Set<String> e = new HashSet<>(Arrays.asList(normalize(expected).split(" ")));
                return a.equals(e);
            }
            case "FLOAT_EPSILON": {
                try {
                    double a = Double.parseDouble(actual.trim());
                    double e = Double.parseDouble(expected.trim());
                    return Math.abs(a - e) < 1e-5;
                } catch (NumberFormatException ex) {
                    return false;
                }
            }
            case "STRING_EXACT":
                return actual.trim().equals(expected.trim());
            case "EXACT":
            default:
                return normalize(actual).equals(normalize(expected));
        }
    }

    private String normalize(String s) {
        return s == null ? "" : s.trim().replaceAll("\\s+", " ");
    }

    private void deleteDir(Path dir) {
        try {
            Files.walk(dir)
                    .sorted(Comparator.reverseOrder())
                    .map(Path::toFile)
                    .forEach(java.io.File::delete);
        } catch (Exception ignored) {}
    }


    
public String judgeQueuedSubmission(RunRequest request) throws Exception {
    if (request.getUserId() == null) {
        return "USER_NOT_LOGGED_IN";
    }

    if (request.getProblemId() == null) {
        return "INVALID_REQUEST: problemId is missing";
    }

    Problem problem = problemRepository.findById(request.getProblemId())
            .orElseThrow(() -> new RuntimeException("Problem not found"));

    List<ProblemHiddenCase> hiddenCases = problem.getHiddenCases();

    if (hiddenCases == null || hiddenCases.isEmpty()) {
        return "NO_HIDDEN_CASES_FOUND";
    }

    Path jobDir = createJobDir(
            request.getLanguage(),
            request.getCode(),
            problem
    );

    try {
        int idx = 1;

        for (ProblemHiddenCase tc : hiddenCases) {
            String result = runOneCase(
                    jobDir,
                    request.getLanguage(),
                    tc.getInput(),
                    tc.getExpected(),
                    problem.getValidator(),
                    idx
            );

            if (!result.startsWith("Test " + idx + ": PASSED")) {
                return result;
            }

            idx++;
        }

        // Intentionally do not update dashboard metrics here.
        // The existing submission row is updated by SubmissionWorker.
        return "ALL_TESTS_PASSED";

    } finally {
        deleteDir(jobDir);
    }
}

}
