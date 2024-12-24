chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "privacyModeEnabled") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "Data/Icons/128.png", // Adjust the path to your icon file
            title: "Privacy Mode Enabled",
            message: "Sensitive data detection is now active.",
            priority: 2,
        });
    } else if (request.action === "privacyModeDisabled") {
        chrome.notifications.create({
            type: "basic",
            iconUrl: "Data/Icons/128.png",
            title: "Privacy Mode Disabled",
            message: "Sensitive data detection is now inactive.",
            priority: 2,
        });
    }
});


chrome.runtime.sendMessage({
    action: "showNotification",
    message: "Sensitive data detected and blurred successfully."
});


