/**
 * SAMAAN Clarifier — Content Script
 * ===================================
 * Runs on every page. Shows a floating "Clarify" button when the user
 * selects text longer than 20 characters, allowing one-click
 * simplification via the side panel.
 */

(function () {
    "use strict";

    const MIN_SELECTION_LENGTH = 20;
    let floatingBtn = null;

    // ── Create floating button ─────────────────────────────────────────────
    function createFloatingBtn() {
        const btn = document.createElement("button");
        btn.id = "samaan-clarify-fab";
        btn.textContent = "⚖️ Clarify";
        btn.setAttribute("aria-label", "Clarify selected text with SAMAAN");

        Object.assign(btn.style, {
            position: "fixed",
            zIndex: "2147483647",
            padding: "6px 14px",
            borderRadius: "100px",
            border: "none",
            background: "linear-gradient(135deg, #2563eb, #7c3aed)",
            color: "#ffffff",
            fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            fontSize: "13px",
            fontWeight: "700",
            cursor: "pointer",
            boxShadow: "0 4px 16px rgba(37, 99, 235, 0.35)",
            display: "none",
            transition: "opacity 0.2s ease, transform 0.2s ease",
            opacity: "0",
            transform: "translateY(4px) scale(0.95)",
            pointerEvents: "auto",
        });

        document.body.appendChild(btn);
        return btn;
    }

    // ── Show near selection ────────────────────────────────────────────────
    function showButton(x, y) {
        if (!floatingBtn) floatingBtn = createFloatingBtn();

        // Position above the selection point, clamped to viewport
        const btnWidth = 110;
        const btnHeight = 32;
        const left = Math.min(Math.max(x - btnWidth / 2, 8), window.innerWidth - btnWidth - 8);
        const top = Math.max(y - btnHeight - 12, 8);

        floatingBtn.style.left = `${left}px`;
        floatingBtn.style.top = `${top}px`;
        floatingBtn.style.display = "block";

        // Trigger animation
        requestAnimationFrame(() => {
            floatingBtn.style.opacity = "1";
            floatingBtn.style.transform = "translateY(0) scale(1)";
        });
    }

    function hideButton() {
        if (!floatingBtn) return;
        floatingBtn.style.opacity = "0";
        floatingBtn.style.transform = "translateY(4px) scale(0.95)";
        setTimeout(() => {
            if (floatingBtn) floatingBtn.style.display = "none";
        }, 200);
    }

    // ── Selection handler ──────────────────────────────────────────────────
    document.addEventListener("mouseup", (e) => {
        // Small delay so the selection is finalized
        setTimeout(() => {
            const selection = window.getSelection().toString().trim();
            if (selection.length >= MIN_SELECTION_LENGTH) {
                showButton(e.clientX, e.clientY);
            } else {
                hideButton();
            }
        }, 50);
    });

    // Hide on click elsewhere
    document.addEventListener("mousedown", (e) => {
        if (floatingBtn && e.target !== floatingBtn) {
            hideButton();
        }
    });

    // ── FAB click: send to side panel ──────────────────────────────────────
    document.addEventListener("click", (e) => {
        if (!floatingBtn || e.target !== floatingBtn) return;
        e.preventDefault();
        e.stopPropagation();

        const selection = window.getSelection().toString().trim();
        if (selection.length < MIN_SELECTION_LENGTH) return;

        // Send to background → side panel
        chrome.runtime.sendMessage({
            type: "CONTENT_SELECTION",
            text: selection,
        });

        hideButton();
    });

    console.log("[SAMAAN] Content script loaded.");
})();
