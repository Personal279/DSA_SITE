/* eslint-disable no-unused-vars */

import React, { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowUp,
  CheckCircle2,
  ChevronDown,
  Code2,
  FlaskConical,
  Loader2,
  Play,
  RotateCcw,
  Terminal,
  Target,
  XCircle,
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../api/api";

/* -------------------- Result parsing -------------------- */

function parseTestResults(raw) {
  if (raw == null) return null;

  let data = raw;

  if (typeof data === "string") {
    try {
      data = JSON.parse(data);
    } catch {
      const value = data.trim().toUpperCase();

      if (value === "ALL_TESTS_PASSED") {
        return { status: "PASSED", cases: [], message: "" };
      }

      if (
        value.includes("ALL_TESTS_FAILED") ||
        value === "WRONG_ANSWER"
      ) {
        return { status: "FAILED", cases: [], message: data };
      }

      if (
        value.startsWith("ERROR") ||
        value === "USER_NOT_LOGGED_IN"
      ) {
        return { status: "ERROR", cases: [], message: data };
      }

      return { status: "UNKNOWN", cases: [], message: data };
    }
  }

  if (!data || typeof data !== "object") {
    return {
      status: "UNKNOWN",
      cases: [],
      message: String(data),
    };
  }

  const rawCases =
    data.testCases ??
    data.results ??
    data.cases ??
    data.testCaseResults ??
    [];

  const cases = Array.isArray(rawCases)
    ? rawCases.map((test, index) => {
        const status = String(
          test.status ?? test.result ?? ""
        ).toUpperCase();

        let passed = null;

        if (
          test.passed === true ||
          test.success === true ||
          ["PASSED", "PASS", "ACCEPTED"].includes(status)
        ) {
          passed = true;
        } else if (
          test.passed === false ||
          test.success === false ||
          ["FAILED", "FAIL", "WRONG_ANSWER", "ERROR"].includes(status)
        ) {
          passed = false;
        }

        return {
          id: test.id ?? test.testCaseId ?? index + 1,
          name: test.name ?? `Test case ${index + 1}`,
          input: test.input ?? test.stdin ?? "Not provided",
          expected:
            test.expectedOutput ??
            test.expected ??
            "Not provided",
          actual:
            test.actualOutput ??
            test.actual ??
            test.output ??
            "Not provided",
          passed,
          message: test.error ?? test.message ?? "",
        };
      })
    : [];

  const overall = String(
    data.status ?? data.result ?? data.message ?? ""
  ).toUpperCase();

  let resultStatus = "UNKNOWN";

  if (
    data.success === true ||
    ["ALL_TESTS_PASSED", "PASSED", "ACCEPTED", "SUCCESS"].includes(
      overall
    )
  ) {
    resultStatus = "PASSED";
  } else if (
    data.success === false ||
    [
      "ALL_TESTS_FAILED",
      "FAILED",
      "WRONG_ANSWER",
      "ERROR",
    ].includes(overall)
  ) {
    resultStatus = "FAILED";
  }

  // Derive the overall result from cases only when every case
  // has an explicit pass/fail status.
  if (resultStatus === "UNKNOWN" && cases.length > 0) {
    if (cases.every((test) => test.passed === true)) {
      resultStatus = "PASSED";
    } else if (cases.some((test) => test.passed === false)) {
      resultStatus = "FAILED";
    }
  }

  return {
    status: resultStatus,
    cases,
    message: data.error ?? data.message ?? "",
  };
}

/* -------------------- Test results panel -------------------- */

function TestResultsPanel({ results, title = "Test results" }) {
  const [expanded, setExpanded] = useState({});

  if (results == null) {
    return (
      <div className="flex h-full min-h-48 flex-col items-center justify-center gap-3 text-slate-500">
        <Terminal size={28} />
        <p className="text-sm">Run your code to see the results.</p>
        <p className="text-xs">Your test output will appear here.</p>
      </div>
    );
  }

  const parsed = parseTestResults(results);

  if (!parsed) return null;

  const passedCount = parsed.cases.filter(
    (test) => test.passed === true
  ).length;

  const failedCount = parsed.cases.filter(
    (test) => test.passed === false
  ).length;

  const isPassed = parsed.status === "PASSED";
  const isError = parsed.status === "ERROR";

  return (
    <div className="space-y-4">
      <div
        className={`rounded-xl border p-4 ${
          isPassed
            ? "border-emerald-500/30 bg-emerald-500/5"
            : isError
              ? "border-amber-500/30 bg-amber-500/5"
              : "border-rose-500/30 bg-rose-500/5"
        }`}
      >
        <div className="flex items-start gap-3">
          {isPassed ? (
            <CheckCircle2
              size={23}
              className="mt-0.5 shrink-0 text-emerald-400"
            />
          ) : isError ? (
            <XCircle
              size={23}
              className="mt-0.5 shrink-0 text-amber-400"
            />
          ) : (
            <XCircle
              size={23}
              className="mt-0.5 shrink-0 text-rose-400"
            />
          )}

          <div className="min-w-0 flex-1">
            <h3
              className={`font-semibold ${
                isPassed
                  ? "text-emerald-300"
                  : isError
                    ? "text-amber-300"
                    : "text-rose-300"
              }`}
            >
              {isPassed
                ? "Accepted"
                : isError
                  ? "Execution error"
                  : parsed.status === "FAILED"
                    ? "Tests failed"
                    : "Execution response"}
            </h3>

            <p className="mt-1 text-xs text-slate-400">
              {parsed.cases.length > 0
                ? `${passedCount} passed · ${failedCount} failed · ${parsed.cases.length} total`
                : isPassed
                  ? "All tests passed."
                  : "The API did not provide individual test-case details."}
            </p>
          </div>
        </div>
      </div>

      {parsed.message && (
        <div>
          <h4 className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            Output / details
          </h4>

          <pre className="max-h-64 overflow-auto whitespace-pre-wrap break-words rounded-xl border border-slate-800 bg-slate-950 p-4 font-mono text-xs leading-5 text-slate-300">
            {String(parsed.message)}
          </pre>
        </div>
      )}

      {parsed.cases.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-200">
            {title}
          </h4>

          {parsed.cases.map((test, index) => {
            const key = `${test.id}-${index}`;
            const open = expanded[key] ?? index === 0;

            return (
              <div
                key={key}
                className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900/50"
              >
                <button
                  type="button"
                  onClick={() =>
                    setExpanded((previous) => ({
                      ...previous,
                      [key]: !open,
                    }))
                  }
                  className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-slate-800/60"
                >
                  {test.passed === true ? (
                    <CheckCircle2
                      size={18}
                      className="shrink-0 text-emerald-400"
                    />
                  ) : test.passed === false ? (
                    <XCircle
                      size={18}
                      className="shrink-0 text-rose-400"
                    />
                  ) : (
                    <Terminal
                      size={18}
                      className="shrink-0 text-slate-500"
                    />
                  )}

                  <span className="flex-1 text-sm font-medium text-slate-200">
                    {test.name}
                  </span>

                  <span
                    className={`text-xs ${
                      test.passed === true
                        ? "text-emerald-400"
                        : test.passed === false
                          ? "text-rose-400"
                          : "text-slate-500"
                    }`}
                  >
                    {test.passed === true
                      ? "Passed"
                      : test.passed === false
                        ? "Failed"
                        : "Details"}
                  </span>

                  <ChevronDown
                    size={16}
                    className={`shrink-0 text-slate-500 transition-transform ${
                      open ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {open && (
                  <div className="space-y-3 border-t border-slate-800 p-4">
                    {[
                      ["Input", test.input],
                      ["Expected output", test.expected],
                      ["Actual output", test.actual],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <p className="mb-1.5 text-xs font-semibold text-slate-400">
                          {label}
                        </p>

                        <pre className="overflow-x-auto whitespace-pre-wrap break-words rounded-lg bg-slate-950 p-3 font-mono text-xs leading-5 text-slate-200">
                          {String(value)}
                        </pre>
                      </div>
                    ))}

                    {test.message && (
                      <p className="whitespace-pre-wrap text-xs text-rose-300">
                        {test.message}
                      </p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

/* -------------------- Main coding workspace -------------------- */

export default function HomePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const problem = location.state;

  const [language, setLanguage] = useState("java");
  const [code, setCode] = useState("");
  const [isLoadingCode, setIsLoadingCode] = useState(false);
  const [codeError, setCodeError] = useState("");

  const [testResults, setTestResults] = useState(null);
  const [submissionResults, setSubmissionResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const [leftWidth, setLeftWidth] = useState(40);
  const [isDragging, setIsDragging] = useState(false);

  const [activeLeftTab, setActiveLeftTab] = useState("description");
  const [activeRightTab, setActiveRightTab] = useState("tests");

  const containerRef = useRef(null);

  /* Fetch language boilerplate when problem or language changes. */
  useEffect(() => {
    if (!problem?.id) return;

    let cancelled = false;

    async function fetchBoilerplate() {
      setIsLoadingCode(true);
      setCodeError("");

      try {
        const response = await api.get(
          `/api/problems/${problem.id}/boilerplate/${language}`
        );

        if (!cancelled) {
          setCode(
            typeof response.data === "string"
              ? response.data
              : String(response.data ?? "")
          );
        }
      } catch (error) {
        if (!cancelled) {
          setCodeError("Could not load the starter code.");
          setCode("// Failed to load boilerplate template");
        }
      } finally {
        if (!cancelled) {
          setIsLoadingCode(false);
        }
      }
    }

    fetchBoilerplate();

    return () => {
      cancelled = true;
    };
  }, [problem?.id, language]);

  /* Resizable left/right panels. */
  useEffect(() => {
    if (!isDragging) return;

    const handleMove = (event) => {
      if (!containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const width = ((event.clientX - rect.left) / rect.width) * 100;

      if (width >= 25 && width <= 75) {
        setLeftWidth(width);
      }
    };

    const handleUp = () => setIsDragging(false);

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseup", handleUp);

    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseup", handleUp);
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
  }, [isDragging]);

  function getUserIdFromToken() {
    const token = localStorage.getItem("token");

    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  }

  async function handleRunTests() {
    if (!problem?.id || isRunning) return;

    setIsRunning(true);
    setTestResults(null);
    setActiveRightTab("tests");

    try {
      const response = await api.post("/api/run", {
        problemId: problem.id,
        language,
        code,
        showDiff: true,
      });

      setTestResults(response.data);
    } catch (error) {
      const message =
        error.response?.data?.message ??
        error.response?.data ??
        error.message ??
        "Unable to contact the execution service.";

      setTestResults({
        status: "ERROR",
        message:
          typeof message === "string"
            ? message
            : JSON.stringify(message, null, 2),
      });
    } finally {
      setIsRunning(false);
    }
  }


async function handleSubmit() {
  if (!problem?.id || isRunning) return;

  setIsRunning(true);
  setSubmissionResults(null);
  setActiveLeftTab("results");
  setActiveRightTab("submission");

  try {
    // Step 1: Submit the solution to the backend queue.
    const response = await api.post("/api/submit", {
      problemId: problem.id,
      language,
      code,
    });

    const submission = response.data;
    const submissionId = submission?.id;

    if (!submissionId) {
      throw new Error("The server did not return a submission ID.");
    }

    // Step 2: Show the initial queued response.
    setSubmissionResults({
      status: submission.status ?? "QUEUED",
      message: submission.resultMessage ?? "Waiting in judge queue",
    });

    // Step 3: Poll until the worker finishes judging.
    const terminalStatuses = new Set([
      "ACCEPTED",
      "JUDGE_ERROR",
      "QUEUE_ERROR",
      "WRONG_ANSWER",
      "COMPILATION_ERROR",
      "RUNTIME_ERROR",
      "TIME_LIMIT_EXCEEDED",
      "MEMORY_LIMIT_EXCEEDED",
    ]);

    const deadline = Date.now() + 120_000;

    while (Date.now() < deadline) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const statusResponse = await api.get(
        `/api/submissions/${submissionId}`
      );

      const result = statusResponse.data;
      const status = String(result?.status ?? "").toUpperCase();

      // Continue waiting while the worker is processing the submission.
      if (status === "QUEUED" || status === "RUNNING") {
        setSubmissionResults({
          status,
          message:
            result.resultMessage ??
            (status === "QUEUED"
              ? "Waiting in judge queue"
              : "Judging in progress"),
        });

        continue;
      }

      // Stop polling when a terminal result is received.
      if (terminalStatuses.has(status) || status !== "") {
        setSubmissionResults(
          result.resultMessage || status
        );
        return;
      }
    }

    // The request may still be processing; do not submit it again.
    setSubmissionResults({
      status: "RUNNING",
      message:
        "Judging is taking longer than expected. Check the submission status again shortly.",
    });
  } catch (error) {
    const message =
      error.response?.data?.message ??
      error.response?.data ??
      error.message ??
      "Unable to submit your solution.";

    setSubmissionResults(
      typeof message === "string"
        ? message
        : JSON.stringify(message, null, 2)
    );
  } finally {
    setIsRunning(false);
  }
}


  function handleLanguageChange(nextLanguage) {
    if (nextLanguage === language || isRunning) return;

    setLanguage(nextLanguage);
    setTestResults(null);
    setSubmissionResults(null);
    setCodeError("");
  }

  function resetCode() {
    if (!problem?.id || isLoadingCode || isRunning) return;

    // Re-fetching the boilerplate avoids losing the backend's
    // language-specific starter template.
    setLanguage((currentLanguage) =>
      currentLanguage === "java" ? "cpp" : "java"
    );

    setTestResults(null);
    setSubmissionResults(null);

    // Switch back to the original language so the effect fetches
    // a fresh template for it.
    setLanguage(language);
  }

  if (!problem?.id) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-[#0B0F19] px-6 text-center text-slate-200">
        <Code2 size={42} className="mb-4 text-amber-400" />

        <h1 className="text-lg font-semibold">
          No problem selected
        </h1>

        <p className="mt-2 max-w-sm text-sm text-slate-400">
          Open a problem from your problems page to start coding.
        </p>

        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mt-6 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-amber-400"
        >
          Go back
        </button>
      </div>
    );
  }

  const difficulty = String(problem.difficulty ?? "").toLowerCase();

  const difficultyClass =
    difficulty === "easy"
      ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
      : difficulty === "medium"
        ? "border-amber-500/30 bg-amber-500/10 text-amber-400"
        : difficulty === "hard"
          ? "border-rose-500/30 bg-rose-500/10 text-rose-400"
          : "border-slate-700 bg-slate-800/60 text-slate-400";

  return (
    <div className="flex h-screen min-h-[500px] flex-col overflow-hidden bg-[#0B0F19] font-sans text-slate-200">
      {/* Header */}
      <header className="relative z-10 flex shrink-0 flex-wrap items-center justify-between gap-3 border-b border-slate-800 bg-[#0B0F19] px-4 py-3 sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            title="Back"
            className="rounded-lg p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            <ArrowLeft size={18} />
          </button>

          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-amber-500">
            <Code2 size={19} className="text-slate-950" />
          </div>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-bold text-slate-100 sm:text-base">
              {problem.title ?? "Coding Workspace"}
            </h1>

            <div className="mt-1 flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-slate-500">
                Coding Master
              </span>

              {problem.difficulty && (
                <span
                  className={`rounded-md border px-2 py-0.5 text-[10px] font-semibold capitalize ${difficultyClass}`}
                >
                  {problem.difficulty}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Language selector */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-900 p-1">
            {[
              { id: "java", label: "Java" },
              { id: "cpp", label: "C++" },
            ].map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleLanguageChange(item.id)}
                disabled={isRunning || isLoadingCode}
                className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
                  language === item.id
                    ? "bg-amber-500 text-slate-950"
                    : "text-slate-400 hover:text-white"
                } disabled:cursor-not-allowed disabled:opacity-50`}
              >
                {item.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={resetCode}
            disabled={isRunning || isLoadingCode}
            title="Reload starter code"
            className="flex items-center gap-2 rounded-xl border border-slate-700 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RotateCcw size={14} />
            <span className="hidden sm:inline">Reset</span>
          </button>

          <button
            type="button"
            onClick={handleRunTests}
            disabled={isRunning || isLoadingCode}
            className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/20 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            {isRunning ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <Play size={15} />
            )}
            Run
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isRunning || isLoadingCode}
            className="flex items-center gap-2 rounded-xl bg-amber-500 px-3 py-2 text-xs font-bold text-slate-950 transition hover:bg-amber-400 disabled:cursor-not-allowed disabled:opacity-50 sm:px-4"
          >
            {isRunning ? (
              <Loader2 size={15} className="animate-spin" />
            ) : (
              <ArrowUp size={15} />
            )}
            Submit
          </button>
        </div>
      </header>

      {/* Main workspace */}
      <main
        ref={containerRef}
        className="relative flex min-h-0 flex-1 overflow-hidden"
      >
        {/* Left pane */}
        <section
          className="flex min-w-0 flex-col border-r border-slate-800 bg-[#111722]"
          style={{ width: `${leftWidth}%` }}
        >
          <div className="flex shrink-0 border-b border-slate-800 bg-[#0E1420]">
            {[
              {
                id: "description",
                label: "Problem",
                Icon: Target,
              },
              {
                id: "results",
                label: "Submission",
                Icon: FlaskConical,
              },
            ].map(({ id, label, Icon }) => (
              <button
                key={id}
                type="button"
                onClick={() => setActiveLeftTab(id)}
                className={`flex items-center gap-2 border-b-2 px-4 py-3 text-xs font-semibold transition sm:px-5 ${
                  activeLeftTab === id
                    ? "border-amber-400 text-amber-300"
                    : "border-transparent text-slate-500 hover:text-slate-300"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {activeLeftTab === "description" ? (
              <div className="space-y-5">
                <div>
                  <p className="mb-2 text-[10px] font-semibold uppercase tracking-widest text-slate-500">
                    Problem statement
                  </p>

                  <h2 className="text-xl font-bold leading-snug text-slate-100">
                    {problem.title ?? "Untitled problem"}
                  </h2>
                </div>

                {problem.difficulty && (
                  <span
                    className={`inline-flex rounded-md border px-2.5 py-1 text-xs font-medium capitalize ${difficultyClass}`}
                  >
                    {problem.difficulty}
                  </span>
                )}

                <div className="whitespace-pre-wrap break-words text-sm leading-7 text-slate-300">
                  {problem.description ||
                    "No problem description is available."}
                </div>

                {Array.isArray(problem.examples) &&
                  problem.examples.length > 0 && (
                    <div className="space-y-4 pt-2">
                      <h3 className="text-sm font-semibold text-slate-100">
                        Examples
                      </h3>

                      {problem.examples.map((example, index) => (
                        <div
                          key={index}
                          className="rounded-xl border border-slate-800 bg-slate-950/60 p-4"
                        >
                          <p className="mb-3 text-xs font-semibold text-slate-400">
                            Example {index + 1}
                          </p>

                          {[
                            ["Input", example.input],
                            ["Output", example.output],
                            ["Explanation", example.explanation],
                          ]
                            .filter(([, value]) => value != null)
                            .map(([label, value]) => (
                              <div key={label} className="mb-3 last:mb-0">
                                <p className="mb-1 text-xs font-medium text-slate-500">
                                  {label}
                                </p>

                                <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-5 text-slate-200">
                                  {String(value)}
                                </pre>
                              </div>
                            ))}
                        </div>
                      ))}
                    </div>
                  )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h2 className="text-base font-bold text-slate-100">
                    Submission result
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Result returned by the submission service.
                  </p>
                </div>

                {submissionResults == null ? (
                  <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-slate-500">
                    <FlaskConical size={28} />
                    <p className="text-sm">No submission yet.</p>
                  </div>
                ) : (
                  <TestResultsPanel
                    results={submissionResults}
                    title="Submission test cases"
                  />
                )}
              </div>
            )}
          </div>
        </section>

        {/* Resizable divider */}
        <button
          type="button"
          aria-label="Resize panels"
          onMouseDown={() => setIsDragging(true)}
          className="z-20 -ml-0.5 w-1 shrink-0 cursor-col-resize bg-slate-800 transition hover:bg-amber-500"
        />

        {/* Right pane */}
        <section
          className="flex min-w-0 flex-1 flex-col bg-[#0B0F19]"
          style={{ width: `${100 - leftWidth}%` }}
        >
          {/* Editor toolbar */}
          <div className="flex shrink-0 items-center justify-between border-b border-slate-800 bg-[#0E1420] px-4 py-3">
            <div className="flex items-center gap-2">
              <Code2 size={15} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Solution
              </span>
              <span className="rounded-md border border-slate-800 bg-slate-900 px-2 py-1 text-[10px] uppercase text-slate-400">
                {language === "java" ? "Java" : "C++"}
              </span>
            </div>

            <span className="text-[10px] text-slate-500">
              {code.split("\n").length} lines
            </span>
          </div>

          {/* Editor */}
          <div className="relative flex min-h-0 flex-1 flex-col">
            {isLoadingCode && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#0B0F19]/80">
                <div className="flex items-center gap-2 text-sm text-slate-400">
                  <Loader2 size={18} className="animate-spin" />
                  Loading starter code...
                </div>
              </div>
            )}

            {codeError && (
              <div className="border-b border-amber-500/20 bg-amber-500/5 px-4 py-2 text-xs text-amber-300">
                {codeError}
              </div>
            )}

            <div className="flex min-h-0 flex-1 overflow-hidden">
              <div
                aria-hidden="true"
                className="hidden select-none overflow-hidden border-r border-slate-800/70 bg-[#0E1420] px-3 py-4 text-right font-mono text-xs leading-6 text-slate-600 sm:block"
              >
                {Array.from(
                  { length: Math.max(1, code.split("\n").length) },
                  (_, index) => (
                    <div key={index}>{index + 1}</div>
                  )
                )}
              </div>

              <textarea
                aria-label="Code editor"
                spellCheck={false}
                autoCapitalize="off"
                autoCorrect="off"
                value={code}
                onChange={(event) => setCode(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Tab") {
                    event.preventDefault();

                    const textarea = event.currentTarget;
                    const start = textarea.selectionStart;
                    const end = textarea.selectionEnd;

                    const nextCode =
                      code.substring(0, start) +
                      "    " +
                      code.substring(end);

                    setCode(nextCode);

                    requestAnimationFrame(() => {
                      textarea.selectionStart = textarea.selectionEnd =
                        start + 4;
                    });
                  }

                  if (
                    (event.ctrlKey || event.metaKey) &&
                    event.key === "Enter"
                  ) {
                    event.preventDefault();
                    handleRunTests();
                  }
                }}
                placeholder="Write your solution here..."
                className="min-h-0 min-w-0 flex-1 resize-none overflow-auto bg-transparent p-4 font-mono text-xs leading-6 text-amber-100 outline-none placeholder:text-slate-700 focus:ring-0 sm:p-5"
              />
            </div>
          </div>

          {/* Results section */}
          <div className="flex min-h-0 flex-[0_0_42%] flex-col border-t border-slate-800 bg-[#0E1420]">
            <div className="flex shrink-0 items-center justify-between border-b border-slate-800 px-4">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setActiveRightTab("tests")}
                  className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold ${
                    activeRightTab === "tests"
                      ? "border-amber-400 text-amber-300"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <Terminal size={14} />
                  Run results
                </button>

                <button
                  type="button"
                  onClick={() => setActiveRightTab("submission")}
                  className={`flex items-center gap-2 border-b-2 px-3 py-3 text-xs font-semibold ${
                    activeRightTab === "submission"
                      ? "border-amber-400 text-amber-300"
                      : "border-transparent text-slate-500 hover:text-slate-300"
                  }`}
                >
                  <FlaskConical size={14} />
                  Last submission
                </button>
              </div>

              <button
                type="button"
                title="Clear displayed run results"
                onClick={() => {
                  setTestResults(null);
                }}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-800 hover:text-slate-200"
              >
                <RotateCcw size={14} />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto p-4">
              {activeRightTab === "tests" ? (
                <TestResultsPanel results={testResults} />
              ) : (
                <TestResultsPanel
                  results={submissionResults}
                  title="Submission test cases"
                />
              )}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="flex shrink-0 items-center justify-between border-t border-slate-800 bg-[#0B0F19] px-4 py-2 text-[10px] text-slate-500 sm:px-6">
        <span className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Coding workspace
        </span>

        <span>Ctrl + Enter to run</span>
      </footer>
    </div>
  );
}
