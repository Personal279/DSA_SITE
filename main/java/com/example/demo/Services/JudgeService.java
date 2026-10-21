package com.example.demo.Services;

import com.example.demo.Problem;
import com.example.demo.ProblemHiddenCase;
import com.example.demo.ProblemTestCase;
import com.example.demo.DTO.RunRequest;
import com.example.demo.Repository.Problem_repo;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.springframework.stereotype.Service;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.*;
import java.util.concurrent.TimeUnit;
import java.util.stream.Collectors;

@Service
public class JudgeService {

    private static final int    TIMEOUT_SECONDS = 15;
    private static final String MEM_LIMIT       = "256m";
    private static final String CPU_LIMIT       = "0.5";

    private final Problem_repo problemRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public JudgeService(Problem_repo problemRepository) {
        this.problemRepository = problemRepository;
    }

    // ── called by /api/run (sample test cases only) ───────────────────────────
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

    // ── called by /api/submit (hidden test cases) ─────────────────────────────
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
            return "ALL_TESTS_PASSED";
        } finally {
            deleteDir(jobDir);
        }
    }

    // ── create job directory with user code + generated wrapper ──────────────
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

    // ── C++ wrapper ───────────────────────────────────────────────────────────
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

    // ── C++ helper: parse a single param from stdin ───────────────────────────
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

    // ── C++ helper: print result ──────────────────────────────────────────────
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

    // ── Java wrapper ──────────────────────────────────────────────────────────
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

    // ── Java helper: parse a single param from stdin ──────────────────────────
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

    // ── Java helper: print result ─────────────────────────────────────────────
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

    // ── run one test case ─────────────────────────────────────────────────────
    private String runOneCase(Path jobDir, String language,
                              String inputJson, String expected,
                              String validator, int idx) throws Exception {

        String image = "java".equalsIgnoreCase(language) ? "judge-java" : "judge-cpp";

        ProcessBuilder pb = new ProcessBuilder(
                "docker", "run", "--rm",
                "--network", "none",
                "--memory", MEM_LIMIT,
                "--cpus", CPU_LIMIT,
                "-i",
                "-v", jobDir.toAbsolutePath() + ":/app:ro",
                image
        );
        pb.redirectErrorStream(false);

        Process p = pb.start();

        String stdinInput = jsonToStdin(inputJson);
        if (stdinInput != null && !stdinInput.isEmpty()) {
            p.getOutputStream().write(stdinInput.getBytes());
        }
        p.getOutputStream().close();

        final StringBuilder stdout = new StringBuilder();
        final StringBuilder stderr = new StringBuilder();

        Thread outThread = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(
                    new InputStreamReader(p.getInputStream()))) {
                r.lines().forEach(l -> stdout.append(l).append("\n"));
            } catch (Exception ignored) {}
        });
        Thread errThread = new Thread(() -> {
            try (BufferedReader r = new BufferedReader(
                    new InputStreamReader(p.getErrorStream()))) {
                r.lines().forEach(l -> stderr.append(l).append("\n"));
            } catch (Exception ignored) {}
        });
        outThread.start();
        errThread.start();

        boolean finished = p.waitFor(TIMEOUT_SECONDS, TimeUnit.SECONDS);

        if (!finished) {
            p.destroyForcibly();
            outThread.interrupt();
            errThread.interrupt();
            return "Test " + idx + ": TIME_LIMIT_EXCEEDED (>" + TIMEOUT_SECONDS + "s)";
        }

        outThread.join(1000);
        errThread.join(1000);

        int exit = p.exitValue();
        String out = stdout.toString().trim();
        String err = stderr.toString().trim();

        if (out.equals("COMPILE_ERROR") || (exit == 1 && out.startsWith("COMPILE_ERROR"))) {
            return "Test " + idx + ": COMPILE_ERROR\n" + err;
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
    }

    // ── convert JSON input to stdin string ────────────────────────────────────
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

    // ── validators ────────────────────────────────────────────────────────────
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
}