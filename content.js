// Helper function to blur detected elements
function blurSensitiveData(elements) {
    elements.forEach((element) => {
        element.style.filter = "blur(5px)";
        element.style.backgroundColor = "#f0f0f0";
        element.style.textDecoration = "underline"; // Add underline
        element.style.textDecorationColor = "red";  // Red underline
        element.style.textDecorationStyle = "solid"; // Solid line
        element.style.textDecorationThickness = "2px"; // Thickness of underline
    });
}

// Helper function to clear blur
function clearBlur() {
    document.body.querySelectorAll("*").forEach((node) => {
        node.style.filter = "";
        node.style.backgroundColor = "";
        node.style.textDecoration = "";
        node.style.textDecorationColor = "";
        node.style.textDecorationStyle = "";
        node.style.textDecorationThickness = "";
    });
}

// Function to detect and blur sensitive data
async function detectAndBlur() {
    // Regex patterns
    const phoneRegex = /\b\d{10}\b|(\(\d{3}\)\s*\d{3}-\d{4})/g; // Phone numbers (e.g., 1234567890, (123) 456-7890)
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g; // Emails (e.g., example@gmail.com)
    const addressRegex = /\d{1,5}\s\w+(\s\w+)*,\s\w+,\s\w+\s\d{5}/g; // Addresses (e.g., 123 Main St, City, State 12345)
    const visaRegex = /\b\d{4}(\s?\d{4}){3}\b/g; // Visa numbers (e.g., 4111 1111 1111 1111)
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g; // Social Security Numbers (e.g., 123-45-6789)
    const postalRegex = /\b\d{5}(-\d{4})?\b/g; // Postal/Zip codes (e.g., 12345 or 12345-6789)

    const regexPatterns = [phoneRegex, emailRegex, addressRegex, visaRegex, ssnRegex, postalRegex];

    // Get all text nodes in the document
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    const elementsToBlur = [];
    let detectedCount = 0;

    while ((node = walker.nextNode())) {
        const parentElement = node.parentElement;
        if (parentElement && parentElement.tagName !== "SCRIPT" && parentElement.tagName !== "STYLE") {
            const textContent = node.textContent;

            // Check for all sensitive data patterns
            if (regexPatterns.some((regex) => regex.test(textContent))) {
                elementsToBlur.push(parentElement);
                detectedCount++; // Increment for each match
            }
        }
    }

    // Blur the detected elements
    blurSensitiveData(elementsToBlur);

    // Store the detected count in Chrome Storage
    await chrome.storage.sync.set({ detectedItems: detectedCount });

    // Notify the popup about the update
    chrome.runtime.sendMessage({
        action: "updateDetectedCount",
        count: detectedCount,
    });

    // Send a notification message to the background script
    chrome.runtime.sendMessage({
        action: "detectedItemsUpdate",
        count: detectedCount,
    });
}

// Listen for messages from popup.js
chrome.runtime.onMessage.addListener(async (request) => {
    if (request.action === "togglePrivacyMode") {
        if (request.enabled) {
            console.log("Privacy Mode Enabled: Detecting sensitive data...");
            await detectAndBlur(); // Start detecting and blurring sensitive information
        } else {
            console.log("Privacy Mode Disabled: Clearing blurred elements...");
            clearBlur(); // Remove all blurring
            await chrome.storage.sync.set({ detectedItems: 0 }); // Reset the count
            chrome.runtime.sendMessage({
                action: "updateDetectedCount",
                count: 0,
            });
        }
    }
});

// Apply state on initial page load
chrome.storage.sync.get("privacyMode", ({ privacyMode }) => {
    if (privacyMode) {
        detectAndBlur(); // Apply blur if privacy mode is already on
    }
});

 