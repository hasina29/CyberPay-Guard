// --- 1. Phishing & Malware Prevention Logic ---

// Fast local list
const phishingSites = [
  "malicious-site.com",
  "phishingsite.org",
  "fakebank.com",
  "iphone-giveaway.com",
  "prize-survey.com",
  "giveaway-win.com",
  "winners-zone.com",
  "sweepstakes-win.com",
  "survey-promo.com",
  "free-iphone-win.com",
  "example.com",
];

// Your Google Safe Browsing API Key
const GOOGLE_API_KEY = "AIzaSyCR7ThdAsakItYzztfmNGWlACfEruXvAcY";

/**
 * Monitor URL changes to block phishing, check Google API, and warn about HTTP.
 */
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url) {
    const currentUrl = tab.url.toLowerCase();

    // 1. Fast Local Phishing Check
    const isLocalPhishing = phishingSites.some((site) =>
      currentUrl.includes(site.toLowerCase()),
    );

    if (isLocalPhishing) {
      chrome.tabs.remove(tabId, () => {
        console.warn(
          "CyberPayGuard: Blocked and closed a locally known phishing site.",
        );
      });
      showNotification(
        "Phishing Blocked!",
        "This website was closed because it is flagged as a local threat.",
      );
      return;
    }

    // 2. Deep Google Safe Browsing API Check
    checkGoogleSafeBrowsing(currentUrl, tabId);

    // 3. NEW: HTTP Insecure Warning Injection
    if (currentUrl.startsWith("http://")) {
      injectHTTPWarning(tabId);
    }
  }
});

/**
 * NEW: Function to inject a red warning banner into HTTP sites
 */
function injectHTTPWarning(tabId) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    function: createWarningBanner,
  });
}

// This function runs IN the webpage, not the background script!
function createWarningBanner() {
  // Prevent duplicate banners if the page updates
  if (document.getElementById("cyberpayguard-http-warning")) return;

  const banner = document.createElement("div");
  banner.id = "cyberpayguard-http-warning";

  // Cyberpunk Red Warning Styling
  Object.assign(banner.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    backgroundColor: "#ff0044",
    color: "white",
    padding: "15px",
    textAlign: "center",
    fontFamily: "Arial, sans-serif",
    fontWeight: "bold",
    fontSize: "16px",
    zIndex: "2147483647", // Highest possible layer
    borderBottom: "4px solid #990022",
    boxShadow: "0 4px 6px rgba(0,0,0,0.9)",
    textShadow: "1px 1px 2px black",
    letterSpacing: "1px",
  });

  banner.innerHTML = `🚨 CYBERPAYGUARD: INSECURE CONNECTION (HTTP). DO NOT ENTER PASSWORDS OR PAYMENT INFO! 🚨`;

  document.body.appendChild(banner);

  // Push the website content down so the banner doesn't cover the top of the page
  document.body.style.marginTop = "60px";
}

/**
 * Function to check a URL against the Google Safe Browsing API
 */
async function checkGoogleSafeBrowsing(url, tabId) {
  if (!url.startsWith("http")) return;

  const apiUrl = `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${GOOGLE_API_KEY}`;

  const requestBody = {
    client: {
      clientId: "cyberpayguard-extension",
      clientVersion: "1.0.0",
    },
    threatInfo: {
      threatTypes: [
        "MALWARE",
        "SOCIAL_ENGINEERING",
        "UNWANTED_SOFTWARE",
        "POTENTIALLY_HARMFUL_APPLICATION",
      ],
      platformTypes: ["ANY_PLATFORM"],
      threatEntryTypes: ["URL"],
      threatEntries: [{ url: url }],
    },
  };

  try {
    const response = await fetch(apiUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });

    const data = await response.json();

    if (data.matches && data.matches.length > 0) {
      const threatType = data.matches[0].threatType;

      chrome.tabs.remove(tabId, () => {
        console.warn(
          `CyberPayGuard: Blocked by Google API. Threat: ${threatType}`,
        );
      });

      showNotification(
        "🚨 Dangerous Site Blocked!",
        `Google Safe Browsing flagged this site as ${threatType}. Tab closed for safety.`,
      );
    }
  } catch (error) {
    console.error("CyberPayGuard: Safe Browsing API Error", error);
  }
}

// --- 2. Message Listener for Extension Communication ---
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "MALWARE_DETECTED") {
    if (sender.tab && sender.tab.id) {
      chrome.tabs.remove(sender.tab.id);
      showNotification(
        "Malware Detected!",
        "A malicious script was blocked, and the tab has been closed for safety.",
      );
    }
  }

  if (message.action === "showNotification") {
    showNotification(
      "🛡️ CYBERPAYGUARD",
      "Your session has timed out! Please enter the OTP to resume.",
    );
  }

  if (message.type === "USER_ACTIVITY") {
    chrome.storage.local.set({ lastActivity: Date.now() });
  }

  if (message.type === "UPDATE_STATUS") {
    chrome.storage.sync.set(
      { sessionTimeout: message.sessionTimeout, enable2FA: message.enable2FA },
      () => {
        console.log("CyberPayGuard: Settings updated via popup.");
      },
    );
  }

  // Send OTP Email using EmailJS API
  if (message.action === "sendOTPEmail") {
    const { otp, email1, email2 } = message;

    let recipients = email1;
    if (email2 && email2.trim().length > 0) {
      recipients += `, ${email2}`;
    }

    const emailData = {
      service_id: "service_3fqksjr",
      template_id: "template_bkx623k",
      user_id: "bl_cAQe1M3LlLE4FI",
      template_params: {
        to_email: recipients,
        otp_code: otp,
      },
    };

    fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(emailData),
    })
      .then((response) => {
        if (response.ok) {
          console.log(
            "CYBERPAYGUARD: OTP Email sent successfully to " + recipients,
          );
        } else {
          console.error("CYBERPAYGUARD: EmailJS Error", response.statusText);
        }
      })
      .catch((error) => {
        console.error("CYBERPAYGUARD: Fetch Error", error);
      });
  }
});

// --- 3. Initialization Logic ---
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set(
    {
      sessionTimeout: 30,
      enable2FA: true,
      twoFAMethod: "email",
      email1: "",
      email2: "",
    },
    () => {
      console.log("CyberPayGuard: Default session settings initialized.");
    },
  );
});

function showNotification(title, message) {
  chrome.notifications.create(
    {
      type: "basic",
      iconUrl: "/assets/icon128.png",
      title: title,
      message: message,
      priority: 2,
    },
    (id) => {
      if (chrome.runtime.lastError) {
        console.error("Notification Error: ", chrome.runtime.lastError.message);
      }
    },
  );
}
