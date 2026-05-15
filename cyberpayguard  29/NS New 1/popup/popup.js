document.addEventListener("DOMContentLoaded", () => {
  updatePopupDisplay();

  const settingsBtn = document.getElementById("settings-button");
  if (settingsBtn) {
    settingsBtn.addEventListener("click", () => {
      chrome.runtime.openOptionsPage();
    });
  }

  // Listen for storage changes to update OTP instantly
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === "local" || area === "sync") {
      updatePopupDisplay();
    }
  });
});

function updatePopupDisplay() {
  chrome.storage.sync.get(
    ["sessionTimeout", "enable2FA", "twoFAMethod"],
    (syncData) => {
      chrome.storage.local.get(["activeOTP"], (localData) => {
        // 1. Display OTP
        const otpDisplay = document.getElementById("otp-display");
        if (otpDisplay) {
          otpDisplay.textContent = localData.activeOTP || "LOCKED";
        }

        // 2. Display 2FA Method
        const twoFAElement = document.getElementById("2fa-method");
        if (twoFAElement) {
          if (syncData.twoFAMethod === "email") {
            twoFAElement.textContent = "Email OTP";
            twoFAElement.className = "card-data color-blue";
          } else {
            twoFAElement.textContent = "Authenticator";
            twoFAElement.className = "card-data color-purple";
          }
        }

        // 3. Display Session Timeout
        const timeoutElement = document.getElementById("session-timeout");
        if (timeoutElement) {
          timeoutElement.textContent = `${syncData.sessionTimeout || 30}s`;
          timeoutElement.className = "card-data color-blue";
        }

        // 4. Calculate Safety Score and Analyze Tab
        analyzeCurrentTab();
      });
    },
  );
}

function analyzeCurrentTab() {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (!tabs[0] || !tabs[0].url) return;

    const url = tabs[0].url.toLowerCase();
    let score = 50; // Base score
    let connectionText = "Insecure (HTTP)";
    let connectionClass = "card-data color-red";
    let categoryText = "Standard Browsing";
    let categoryClass = "card-data color-blue";

    // --- SAFETY LOGIC CALCULATIONS ---

    // A. HTTPS Check
    if (url.startsWith("https://")) {
      score += 30;
      connectionText = "Secure (HTTPS)";
      connectionClass = "card-data color-green";
    } else if (url.startsWith("http://")) {
      score -= 50; // HTTP is very dangerous for payments
      connectionText = "Insecure (HTTP)";
      connectionClass = "card-data color-red";
    } else {
      // chrome:// or file:// pages
      score += 10;
      connectionText = "Internal Page";
      connectionClass = "card-data color-blue";
    }

    // B. Payment / Banking Site Check
    const paymentKeywords = [
      "sampathvishwa",
      "combankdigital",
      "peoplesbank",
      "paypal",
      "stripe",
      "daraz",
      "checkout",
      "payment",
      "bank",
    ];
    const isPaymentSite = paymentKeywords.some((keyword) =>
      url.includes(keyword),
    );

    if (isPaymentSite) {
      score += 20;
      categoryText = "Financial / Payment";
      categoryClass = "card-data color-green";
    }

    // Cap score between 0 and 100
    if (score > 100) score = 100;
    if (score < 0) score = 0;

    // --- UPDATE UI WITH SCORE & COLORS ---

    // Score Value
    const scoreValue = document.getElementById("score-value");
    scoreValue.textContent = `${score}%`;

    // Progress Bar
    const progressBar = document.getElementById("progress-bar");
    progressBar.style.width = `${score}%`;

    // Dynamic Colors based on score
    if (score >= 80) {
      scoreValue.style.color = "#00ff88";
      scoreValue.style.textShadow = "0 0 20px rgba(0, 255, 136, 0.5)";
      progressBar.style.background = "#00ff88";
      progressBar.style.boxShadow = "0 0 10px rgba(0, 255, 136, 0.5)";
      document.getElementById("score-label").textContent = "Highly Secure";
    } else if (score >= 50) {
      scoreValue.style.color = "#ffaa00";
      scoreValue.style.textShadow = "0 0 20px rgba(255, 170, 0, 0.5)";
      progressBar.style.background = "#ffaa00";
      progressBar.style.boxShadow = "0 0 10px rgba(255, 170, 0, 0.5)";
      document.getElementById("score-label").textContent = "Moderate Security";
    } else {
      scoreValue.style.color = "#ff0044";
      scoreValue.style.textShadow = "0 0 20px rgba(255, 0, 68, 0.5)";
      progressBar.style.background = "#ff0044";
      progressBar.style.boxShadow = "0 0 10px rgba(255, 0, 68, 0.5)";
      document.getElementById("score-label").textContent = "Danger / Insecure";
    }

    // Update Cards
    document.getElementById("connection-status").textContent = connectionText;
    document.getElementById("connection-status").className = connectionClass;

    document.getElementById("site-category").textContent = categoryText;
    document.getElementById("site-category").className = categoryClass;
  });
}
