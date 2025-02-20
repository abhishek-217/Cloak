document.addEventListener("DOMContentLoaded", async () => {
    const privacyToggle = document.getElementById("privacyToggle");
    const dataSummary = document.getElementById("dataSummary");

 
    const { detectedItems = 0, privacyMode = false } = await chrome.storage.sync.get([
        "detectedItems",
        "privacyMode",
    ]);

    
    dataSummary.textContent = detectedItems;
    privacyToggle.checked = privacyMode; 

   
    privacyToggle.addEventListener("change", async (event) => {
        const enabled = event.target.checked;

        await chrome.storage.sync.set({ privacyMode: enabled });

   
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs.length > 0) {
                chrome.tabs.sendMessage(tabs[0].id, {
                    action: "togglePrivacyMode",
                    enabled,
                });
            }
        });

      
        chrome.runtime.sendMessage({
            action: enabled ? "privacyModeEnabled" : "privacyModeDisabled",
        });
    });

    
    chrome.runtime.onMessage.addListener(async (request) => {
        if (request.action === "updateDetectedCount") {
        
            dataSummary.textContent = request.count || 0;

            await chrome.storage.sync.set({ detectedItems: request.count });
        }
    });
});

