// Applies the user's display mode (side panel or popup) to the toolbar icon and the shortcut.
const MODE_KEY = "displayMode";

async function applyDisplayMode(mode) {
  const usePopup = mode === "popup";
  await chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: !usePopup });
  await chrome.action.setPopup({ popup: usePopup ? "popup.html" : "" });
}

async function syncDisplayMode() {
  const { [MODE_KEY]: mode } = await chrome.storage.local.get(MODE_KEY);
  await applyDisplayMode(mode);
}

// action.setPopup does not persist across browser restarts, so re-apply on every worker start.
syncDisplayMode().catch(console.error);

chrome.storage.onChanged.addListener((changes, area) => {
  if (area === "local" && changes[MODE_KEY]) {
    applyDisplayMode(changes[MODE_KEY].newValue).catch(console.error);
  }
});
