/**
 * SAMAAN Clarifier — Side Panel Logic
 * ====================================
 * State management, API calls, theming, and event handling.
 */

(function () {
    "use strict";

    // ── Configuration ──────────────────────────────────────────────────────
    const API_BASE = "http://localhost:8000";
    const API_ENDPOINT = `${API_BASE}/api/clarify`;
    const MAX_CHARS = 5000;

    // ── DOM References ─────────────────────────────────────────────────────
    const $ = (id) => document.getElementById(id);
    const inputEl = $("input-text");
    const charCounter = $("char-counter");
    const clarifyBtn = $("clarify-btn");
    const langToggle = $("lang-toggle");
    const langLabel = $("lang-label");
    const modeToggle = $("mode-toggle");
    const modeLabel = $("mode-label");
    const themeToggle = $("theme-toggle");
    const loaderEl = $("loader");
    const resultPanel = $("result-panel");
    const resultCard = $("result-card");
    const resultTitle = $("result-title");
    const resultText = $("result-text");
    const copyBtn = $("copy-btn");
    const copyIcon = $("copy-icon");
    const copyLabel = $("copy-label");
    const emptyState = $("empty-state");

    // ── State ──────────────────────────────────────────────────────────────
    let state = {
        language: "en", // "en" | "hi"
        mode: "prose", // "prose" | "bullets"
        theme: "light", // "light" | "dark"
        loading: false,
        lastResult: "",
    };

    // ── Theme ──────────────────────────────────────────────────────────────
    function initTheme() {
        const saved = localStorage.getItem("samaan-theme") || "light";
        setTheme(saved);
    }

    function setTheme(theme) {
        state.theme = theme;
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("samaan-theme", theme);
        themeToggle.textContent = theme === "dark" ? "☀️" : "🌙";
        themeToggle.setAttribute(
            "aria-label",
            theme === "dark" ? "Switch to light mode" : "Switch to dark mode"
        );
    }

    themeToggle.addEventListener("click", () => {
        setTheme(state.theme === "dark" ? "light" : "dark");
    });

    // ── Language Toggle ────────────────────────────────────────────────────
    langToggle.addEventListener("click", () => {
        state.language = state.language === "en" ? "hi" : "en";
        langLabel.textContent = state.language.toUpperCase();
        langToggle.classList.toggle("active", state.language === "hi");
        langToggle.setAttribute(
            "aria-pressed",
            String(state.language === "hi")
        );
    });

    // ── Mode Toggle ────────────────────────────────────────────────────────
    modeToggle.addEventListener("click", () => {
        state.mode = state.mode === "prose" ? "bullets" : "prose";
        modeLabel.textContent = state.mode === "bullets" ? "Bullets" : "Prose";
        modeToggle.classList.toggle("active", state.mode === "bullets");
        modeToggle.setAttribute(
            "aria-pressed",
            String(state.mode === "bullets")
        );
    });

    // ── Character Counter ──────────────────────────────────────────────────
    function updateCharCounter() {
        const len = inputEl.value.length;
        charCounter.textContent = `${len} / ${MAX_CHARS}`;
        charCounter.classList.toggle("warning", len > MAX_CHARS * 0.9);
    }

    inputEl.addEventListener("input", updateCharCounter);

    // ── UI State Transitions ───────────────────────────────────────────────
    function setLoading(loading) {
        state.loading = loading;
        clarifyBtn.disabled = loading;
        clarifyBtn.classList.toggle("loading", loading);
        loaderEl.classList.toggle("visible", loading);

        if (loading) {
            resultPanel.classList.remove("visible");
            emptyState.style.display = "none";
        }
    }

    function showResult(text, isError = false) {
        resultCard.classList.toggle("error", isError);
        resultTitle.innerHTML = isError
            ? "<span>❌</span> Error"
            : "<span>✅</span> Simplified Explanation";
        resultText.textContent = text;
        resultPanel.classList.add("visible");
        emptyState.style.display = "none";
        state.lastResult = isError ? "" : text;

        // Scroll to result
        resultPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }

    // ── Copy Button ────────────────────────────────────────────────────────
    copyBtn.addEventListener("click", async () => {
        if (!state.lastResult) return;

        try {
            await navigator.clipboard.writeText(state.lastResult);
            copyIcon.textContent = "✅";
            copyLabel.textContent = "Copied!";
            copyBtn.classList.add("copied");

            setTimeout(() => {
                copyIcon.textContent = "📋";
                copyLabel.textContent = "Copy";
                copyBtn.classList.remove("copied");
            }, 2000);
        } catch (err) {
            console.error("Copy failed:", err);
        }
    });

    // ── API Call ───────────────────────────────────────────────────────────
    async function clarify(text) {
        const trimmed = (text || "").trim();
        if (!trimmed) {
            inputEl.focus();
            return;
        }
        if (trimmed.length > MAX_CHARS) {
            showResult(
                `Text is too long (${trimmed.length} chars). Maximum is ${MAX_CHARS} characters.`,
                true
            );
            return;
        }

        setLoading(true);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 45000);

            const response = await fetch(API_ENDPOINT, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text: trimmed,
                    language: state.language,
                    mode: state.mode,
                }),
                signal: controller.signal,
            });

            clearTimeout(timeoutId);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                const detail =
                    errData.detail ||
                    errData.error ||
                    `Server error (${response.status})`;
                showResult(detail, true);
                return;
            }

            const data = await response.json();
            showResult(data.simplified);
        } catch (err) {
            if (err.name === "AbortError") {
                showResult(
                    "Request timed out. Please check if the backend is running and try again.",
                    true
                );
            } else {
                showResult(
                    "Could not connect to the backend. Ensure the server is running on localhost:8000.",
                    true
                );
            }
            console.error("Clarify error:", err);
        } finally {
            setLoading(false);
        }
    }

    // ── Event: Clarify Button ──────────────────────────────────────────────
    clarifyBtn.addEventListener("click", () => clarify(inputEl.value));

    // ── Event: Keyboard Shortcut (Ctrl+Enter) ──────────────────────────────
    inputEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
            e.preventDefault();
            clarify(inputEl.value);
        }
    });

    // ── Event: Messages from Background / Content Script ───────────────────
    if (typeof chrome !== "undefined" && chrome.runtime) {
        chrome.runtime.onMessage.addListener((message) => {
            if (message.type === "CLARIFY_TEXT" || message.type === "SIMPLIFY_TEXT") {
                inputEl.value = message.text;
                updateCharCounter();
                clarify(message.text);
            }
        });
    }

    // ── Init ───────────────────────────────────────────────────────────────
    initTheme();
    updateCharCounter();
    inputEl.focus();
})();
