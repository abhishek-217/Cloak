document.addEventListener("DOMContentLoaded", async () => {
    const privacyToggle = document.getElementById("privacyToggle");
    const dataSummary = document.getElementById("dataSummary");

    // Load initial detected items count and privacy mode state from storage
    const { detectedItems = 0, privacyMode = false } = await chrome.storage.sync.get([
        "detectedItems",
        "privacyMode",
    ]);

    // Set initial values in the popup
    dataSummary.textContent = detectedItems; // Display detected sensitive data count
    privacyToggle.checked = privacyMode; // Set toggle state

    // Event listener for the privacy mode toggle
    privacyToggle.addEventListener("change", async (event) => {
        const enabled = event.target.checked;

        // Update privacy mode state in Chrome Storage
        await chrome.storage.sync.set({ privacyMode: enabled });

        // Send a message to the content script to enable/disable privacy mode
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "togglePrivacyMode",
                    enabled,
                });
            }
        });

        // Notify the background script to show a notification
        chrome.runtime.sendMessage({
            action: enabled ? "privacyModeEnabled" : "privacyModeDisabled",
        });
    });

    // Listen for updates from the content script about detected items count
    chrome.runtime.onMessage.addListener(async (request) => {
        if (request.action === "updateDetectedCount") {
            // Update the displayed count in the popup
            dataSummary.textContent = request.count || 0;

            // Update the count in Chrome Storage
            await chrome.storage.sync.set({ detectedItems: request.count });
        }
    });
});

