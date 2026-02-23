/**
 * SAMAAN Clarifier — Background Service Worker
 * ==============================================
 * Manages the side panel lifecycle, context menu, and message routing.
 */

// ── Open side panel on extension icon click ──────────────────────────────
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error("[SAMAAN] Side panel setup error:", err));

// ── Context menu: "Clarify Selected Text" ────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "samaan-clarify",
    title: "SAMAAN: Clarify Selected Text",
    contexts: ["selection"],
  });
  console.log("[SAMAAN] Extension installed, context menu created.");
});

// ── Handle context menu clicks ───────────────────────────────────────────
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "samaan-clarify" || !tab?.id) return;

  try {
    // Open the side panel for this tab
    await chrome.sidePanel.open({ tabId: tab.id });

    // Give the panel time to initialize, then send the text
    setTimeout(() => {
      chrome.runtime.sendMessage({
        type: "CLARIFY_TEXT",
        text: info.selectionText || "",
      });
    }, 600);
  } catch (err) {
    console.error("[SAMAAN] Error opening side panel:", err);
  }
});

// ── Forward messages from content script to side panel ───────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "CONTENT_SELECTION") {
    // Re-broadcast as CLARIFY_TEXT so the side panel picks it up
    chrome.runtime.sendMessage({
      type: "CLARIFY_TEXT",
      text: message.text,
    });
  }
  return false; // no async response
});
