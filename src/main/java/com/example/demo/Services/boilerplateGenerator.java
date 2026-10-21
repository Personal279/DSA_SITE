package com.example.demo.Services;

import com.example.demo.DTO.MethodParam;
import java.util.List;

public class boilerplateGenerator {

    // ── Java boilerplate shown to user (NO main) ──────────────────────────────
    public static String generateJava(String methodName,
                                      String returnType,
                                      List<MethodParam> params) {
        StringBuilder sb = new StringBuilder();

        sb.append("import java.util.*;\n");
        sb.append("import java.util.stream.*;\n\n");
        sb.append("class Solution {\n\n");
        sb.append("    // Write your solution here\n");
        sb.append("    public ").append(returnType).append(" ")
          .append(methodName).append("(");
        for (int i = 0; i < params.size(); i++) {
            MethodParam p = params.get(i);
            sb.append(p.getType()).append(" ").append(p.getName());
            if (i < params.size() - 1) sb.append(", ");
        }
        sb.append(") {\n");
        sb.append("        // TODO: implement\n");
        if (!"void".equals(returnType)) {
            sb.append("        return ").append(defaultReturnJava(returnType)).append(";\n");
        }
        sb.append("    }\n");
        sb.append("}\n");

        return sb.toString();
    }

    // ── C++ boilerplate shown to user (NO main) ───────────────────────────────
    public static String generateCpp(String methodName,
                                     String returnType,
                                     List<MethodParam> params) {
        StringBuilder sb = new StringBuilder();

        sb.append("#include <iostream>\n");
        sb.append("#include <vector>\n");
        sb.append("#include <string>\n");
        sb.append("#include <sstream>\n");
        sb.append("#include <algorithm>\n");
        sb.append("#include <unordered_map>\n");
        sb.append("using namespace std;\n\n");

        sb.append("class Solution {\n");
        sb.append("public:\n");
        sb.append("    // Write your solution here\n");
        sb.append("    ").append(javaToCppType(returnType)).append(" ")
          .append(methodName).append("(");
        for (int i = 0; i < params.size(); i++) {
            MethodParam p = params.get(i);
            sb.append(javaToCppType(p.getType())).append(" ").append(p.getName());
            if (i < params.size() - 1) sb.append(", ");
        }
        sb.append(") {\n");
        sb.append("        // TODO: implement\n");
        if (!"void".equals(returnType)) {
            sb.append("        return ").append(defaultReturnCpp(returnType)).append(";\n");
        }
        sb.append("    }\n");
        sb.append("};\n");

        return sb.toString();
    }

    // ── Java type → C++ type ──────────────────────────────────────────────────
    public static String javaToCppType(String type) {
        switch (type.trim()) {
            case "int":             return "int";
            case "long":            return "long long";
            case "double":          return "double";
            case "float":           return "float";
            case "boolean":         return "bool";
            case "String":          return "string";
            case "int[]":           return "vector<int>";
            case "long[]":          return "vector<long long>";
            case "double[]":        return "vector<double>";
            case "String[]":        return "vector<string>";
            case "int[][]":         return "vector<vector<int>>";
            case "List<Integer>":   return "vector<int>";
            case "List<String>":    return "vector<string>";
            default:                return type;
        }
    }

    // ── default return values ─────────────────────────────────────────────────
    public static String defaultReturnJava(String type) {
        switch (type.trim()) {
            case "int":             return "0";
            case "long":            return "0L";
            case "double":          return "0.0";
            case "boolean":         return "false";
            case "void":            return "";
            case "String":          return "\"\"";
            case "int[]":           return "new int[0]";
            case "long[]":          return "new long[0]";
            case "int[][]":         return "new int[0][0]";
            case "List<Integer>":   return "new ArrayList<>()";
            case "List<String>":    return "new ArrayList<>()";
            default:                return "null";
        }
    }

    public static String defaultReturnCpp(String type) {
        switch (type.trim()) {
            case "int":             return "0";
            case "long":            return "0LL";
            case "double":
            case "float":           return "0.0";
            case "boolean":         return "false";
            case "String":          return "\"\"";
            case "int[]":
            case "List<Integer>":   return "{}";
            case "long[]":          return "{}";
            case "double[]":        return "{}";
            case "String[]":
            case "List<String>":    return "{}";
            case "int[][]":         return "{}";
            case "void":            return "";
            default:                return "{}";
        }
    }
}