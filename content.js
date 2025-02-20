
function blurSensitiveData(elements) {
    elements.forEach((element) => {
        element.style.filter = "blur(5px)";
        element.style.backgroundColor = "#f0f0f0";
        element.style.textDecoration = "underline"; 
        element.style.textDecorationColor = "red";  
        element.style.textDecorationStyle = "solid";
        element.style.textDecorationThickness = "2px"; 
    });
}

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

async function detectAndBlur() {
    // Regex patterns
    const phoneRegex = /\b\d{10}\b|(\(\d{3}\)\s*\d{3}-\d{4})/g; 
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g; 
    const addressRegex = /\d{1,5}\s\w+(\s\w+)*,\s\w+,\s\w+\s\d{5}/g; 
    const visaRegex = /\b\d{4}(\s?\d{4}){3}\b/g; 
    const ssnRegex = /\b\d{3}-\d{2}-\d{4}\b/g; 
    const postalRegex = /\b\d{5}(-\d{4})?\b/g; 

    const regexPatterns = [phoneRegex, emailRegex, addressRegex, visaRegex, ssnRegex, postalRegex];

   
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    let node;
    const elementsToBlur = [];
    let detectedCount = 0;

    while ((node = walker.nextNode())) {
        const parentElement = node.parentElement;
        if (parentElement && parentElement.tagName !== "SCRIPT" && parentElement.tagName !== "STYLE") {
            const textContent = node.textContent;

          
            if (regexPatterns.some((regex) => regex.test(textContent))) {
                elementsToBlur.push(parentElement);
                detectedCount++;
            }
        }
    }

   
    blurSensitiveData(elementsToBlur);


    await chrome.storage.sync.set({ detectedItems: detectedCount });

  
    chrome.runtime.sendMessage({
        action: "updateDetectedCount",
        count: detectedCount,
    });

    chrome.runtime.sendMessage({
        action: "detectedItemsUpdate",
        count: detectedCount,
    });
}

chrome.runtime.onMessage.addListener(async (request) => {
    if (request.action === "togglePrivacyMode") {
        if (request.enabled) {
            console.log("Privacy Mode Enabled: Detecting sensitive data...");
            await detectAndBlur(); 
        } else {
            console.log("Privacy Mode Disabled: Clearing blurred elements...");
            clearBlur(); 
            await chrome.storage.sync.set({ detectedItems: 0 }); 
            chrome.runtime.sendMessage({
                action: "updateDetectedCount",
                count: 0,
            });
        }
    }
});


chrome.storage.sync.get("privacyMode", ({ privacyMode }) => {
    if (privacyMode) {
        detectAndBlur(); 
    }
});

 
