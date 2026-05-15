/**
 * --- 1. Global Malware & Phishing Protection ---
 */
const suspiciousDomains = [
  "malicious-resource.com",
  "evil.com",
  "unsafe-site.net",
  "malicious-site.com",
];

const DEFAULT_REDIRECT_URL = "https://www.google.com";

function checkMalwareRedirection() {
  const currentHost = window.location.hostname.toLowerCase();
  if (
    suspiciousDomains.some((domain) =>
      currentHost.includes(domain.toLowerCase()),
    )
  ) {
    window.location.href = DEFAULT_REDIRECT_URL;
  }
}
checkMalwareRedirection();

/**
 * --- 2. Malware Script Scanning & Automatic Redirect ---
 */
function scanForMalware(scriptTag) {
  if (scriptTag.src && chrome.runtime?.id) {
    if (
      suspiciousDomains.some((domain) =>
        scriptTag.src.toLowerCase().includes(domain.toLowerCase()),
      )
    ) {
      scriptTag.remove();
      showCyberToast(
        "danger",
        "🚨 MALWARE BLOCKED!",
        "Suspicious script detected. Redirecting for safety...",
      );
      setTimeout(() => {
        window.location.assign(DEFAULT_REDIRECT_URL);
      }, 3000);
    }
  }
}

const malwareObserver = new MutationObserver((mutations) => {
  mutations.forEach((m) =>
    m.addedNodes.forEach(
      (node) => node.nodeName === "SCRIPT" && scanForMalware(node),
    ),
  );
});
malwareObserver.observe(document.documentElement, {
  childList: true,
  subtree: true,
});
document.querySelectorAll("script").forEach(scanForMalware);

/**
 * --- 3. CYBERPUNK TOAST NOTIFICATION SYSTEM ---
 */
function injectToastStyles() {
  if (document.getElementById("cyber-toast-styles")) return;
  const style = document.createElement("style");
  style.id = "cyber-toast-styles";
  style.textContent = `
    .cyber-toast {
      position: fixed; top: 20px; right: 20px; min-width: 300px;
      padding: 15px 20px; border-radius: 8px; background: rgba(10, 10, 10, 0.95);
      backdrop-filter: blur(10px); color: white; font-family: 'Segoe UI', Arial, sans-serif;
      z-index: 2147483646; box-shadow: 0 0 20px rgba(0,0,0,0.8); border-left: 5px solid #00ff88;
      transform: translateX(120%); animation: slideIn 0.5s forwards, slideOut 0.5s 4.5s forwards;
    }
    .cyber-toast.danger { border-color: #ff0044; box-shadow: 0 0 20px rgba(255, 0, 68, 0.3); }
    .cyber-toast.success { border-color: #00ff88; box-shadow: 0 0 20px rgba(0, 255, 136, 0.3); }
    .cyber-toast.info { border-color: #00b3ff; box-shadow: 0 0 20px rgba(0, 179, 255, 0.3); }
    .toast-title { font-weight: bold; font-size: 14px; margin-bottom: 5px; }
    .toast-message { font-size: 12px; color: #ccc; }
    @keyframes slideIn { to { transform: translateX(0); } }
    @keyframes slideOut { to { transform: translateX(120%); opacity: 0; } }
  `;
  document.head.appendChild(style);
}

function showCyberToast(type, title, message) {
  injectToastStyles();
  const toast = document.createElement("div");
  toast.className = `cyber-toast ${type}`;
  toast.innerHTML = `<div class="toast-title">${title}</div><div class="toast-message">${message}</div>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    if (toast.parentNode) toast.remove();
  }, 5500);
}

/**
 * --- 4. Payment Page Detection & UI Logic ---
 */
function detectPaymentPage() {
  const keywords = [
    "sampathvishwa",
    "combankdigital",
    "peoplesbank",
    "ceypay",
    "password",
    "daraz",
    "checkout",
    "payment",
  ];
  return (
    keywords.some((k) => document.body.innerText.toLowerCase().includes(k)) ||
    document.querySelector('input[type="password"]')
  );
}

let uiInjected = false;
function initializeSecurity() {
  if (uiInjected || !detectPaymentPage()) return;
  uiInjected = true;

  let idleTime = 0,
    isLocked = false,
    currentEmailOTP = "";

  // --- Holographic Transparent Status Box ---
  const statusBox = document.createElement("div");
  Object.assign(statusBox.style, {
    position: "fixed",
    top: "100px",
    right: "15px",
    backgroundColor: "rgba(5, 15, 25, 0.85)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    color: "#ffffff",
    padding: "15px",
    borderRadius: "12px",
    zIndex: "2147483647",
    border: "1px solid rgba(0, 255, 255, 0.4)",
    minWidth: "220px",
    lineHeight: "1.8",
    boxShadow: "0 0 20px rgba(0, 255, 255, 0.15)",
    fontFamily: "'Segoe UI', Arial, sans-serif",
    textShadow: "0 0 5px rgba(0,0,0,0.8)",
  });
  statusBox.innerHTML = `
    <div style="color:#00FFFF; border-bottom:1px solid rgba(0, 255, 255, 0.4); margin-bottom:8px; text-align:center; font-weight:bold; text-transform:uppercase; letter-spacing:2px; text-shadow: 0 0 10px rgba(0,255,255,0.5);">🛡️ CYBERPAYGUARD</div>
    <div><span style="color:#aaa;">Status:</span> <span style="color:#00ff88; font-weight:bold; text-shadow:0 0 5px rgba(0,255,136,0.5);">SECURE</span></div>
    <div><span style="color:#aaa;">Timer:</span> <span id="lock-timer" style="color:#00FFFF; font-weight:bold;">0</span>s</div>
    <div><span style="color:#aaa;">2FA:</span> <span style="color:#bc13fe; font-weight:bold; text-shadow:0 0 5px rgba(188,19,254,0.5);">ACTIVE</span></div>
    <div><span style="color:#aaa;">Mode:</span> <span id="2fa-type-display" style="color:#00FFFF; font-weight:bold;">Loading...</span></div>
  `;
  document.body.appendChild(statusBox);

  // --- Holographic OTP Lock Screen ---
  const blurOverlay = document.createElement("div");
  Object.assign(blurOverlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100%",
    height: "100%",
    backgroundColor: "rgba(0, 5, 10, 0.95)",
    zIndex: "9999999",
    display: "none",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
  });
  blurOverlay.innerHTML = `
    <div style="text-align:center; border:2px solid #00FFFF; padding:50px; border-radius:20px; background:rgba(0, 10, 20, 0.9); box-shadow: 0 0 40px rgba(0, 255, 255, 0.2);">
      <h2 style="color:#00FFFF; text-shadow: 0 0 10px rgba(0, 255, 255, 0.5); margin-bottom: 20px; letter-spacing:3px;">🛡️ SESSION LOCKED</h2>
      <p id="lock-instruction" style="color:#aaa; font-size:14px; margin-bottom:30px;">Verify your identity to continue</p>
      <input type="text" id="cyber-otp-input" maxlength="6" placeholder="• • • • • •" style="padding:18px; font-size:28px; text-align:center; width:260px; background:rgba(0,0,0,0.5); color:#00FFFF; border:2px solid rgba(0, 255, 255, 0.4); border-radius:12px; box-shadow: 0 0 15px rgba(0, 255, 255, 0.2) inset; letter-spacing: 10px; outline: none;">
      <br><br>
      <button id="unlock-btn" style="padding:15px 40px; background: linear-gradient(90deg, #00FFFF, #00ff88); color:#000; font-weight:800; cursor:pointer; border:none; border-radius:8px; font-size:16px; text-transform:uppercase; letter-spacing: 2px; box-shadow: 0 0 25px rgba(0, 255, 255, 0.4); transition: 0.3s ease;">VERIFY & UNLOCK</button>
    </div>
  `;
  document.body.appendChild(blurOverlay);

  // Update 2FA Type Display on Status Box
  chrome.storage.sync.get(["twoFAMethod"], (data) => {
    const typeDisplay = document.getElementById("2fa-type-display");
    if (typeDisplay) {
      typeDisplay.textContent =
        data.twoFAMethod === "email" ? "EMAIL OTP" : "AUTH APP";
    }
  });

  function lockSession() {
    if (isLocked) return;
    isLocked = true;
    blurOverlay.style.display = "flex";

    const otpInput = document.getElementById("cyber-otp-input");
    if (otpInput) otpInput.value = "";

    const instructionText = document.getElementById("lock-instruction");

    chrome.storage.sync.get(
      ["enable2FA", "twoFAMethod", "email1", "email2"],
      (data) => {
        if (data.enable2FA) {
          // --- EMAIL OTP LOGIC ---
          if (data.twoFAMethod === "email" && data.email1) {
            currentEmailOTP = Math.floor(
              100000 + Math.random() * 900000,
            ).toString();
            chrome.storage.local.set({ activeOTP: currentEmailOTP });

            if (instructionText)
              instructionText.textContent =
                "Check your email for the OTP code.";
            showCyberToast(
              "info",
              "🔒 SESSION LOCKED",
              "Check your email for the OTP.",
            );

            chrome.runtime.sendMessage({ action: "showNotification" });
            chrome.runtime.sendMessage({
              action: "sendOTPEmail",
              otp: currentEmailOTP,
              email1: data.email1,
              email2: data.email2 || "",
            });
          }

          // --- AUTHENTICATOR APP (TOTP) LOGIC ---
          else {
            if (instructionText)
              instructionText.textContent =
                "Enter the code from your Authenticator App.";
            showCyberToast(
              "info",
              "🔒 SESSION LOCKED",
              "Enter the code from your Authenticator App.",
            );
            chrome.runtime.sendMessage({ action: "showNotification" });
          }
        }
      },
    );
  }

  // --- VERIFY BUTTON LOGIC (DYNAMIC CHECK WITH GRACE PERIOD) ---
  document.getElementById("unlock-btn").onclick = async () => {
    const otpInput = document.getElementById("cyber-otp-input");
    const enteredCode = otpInput.value;
    let isValid = false;

    // Fetch current settings
    const data = await new Promise((resolve) =>
      chrome.storage.sync.get(["twoFAMethod", "totpSecret"], resolve),
    );

    if (data.twoFAMethod === "totp" && data.totpSecret) {
      // TOTP CHECK: Uses the Grace Period verifier from totp-engine.js
      isValid = await verifyTOTP(data.totpSecret, enteredCode);
    } else {
      // EMAIL OTP CHECK: Compare against the saved random code
      if (enteredCode === currentEmailOTP) {
        isValid = true;
      }
    }

    // Handle Result
    if (isValid) {
      isLocked = false;
      idleTime = 0;
      blurOverlay.style.display = "none";
      otpInput.value = "";
      showCyberToast(
        "success",
        "🔓 SESSION UNLOCKED",
        "Identity verified. You may proceed.",
      );
    } else {
      otpInput.value = "";
      showCyberToast(
        "danger",
        "❌ WRONG OTP",
        "Incorrect code entered. Redirecting for safety...",
      );
      setTimeout(() => {
        window.location.href = DEFAULT_REDIRECT_URL;
      }, 2000);
    }
  };

  // --- AUTO-VERIFY: Instantly unlock when 6 digits are typed ---
  document.getElementById("cyber-otp-input").addEventListener("input", (e) => {
    if (e.target.value.length === 6) {
      document.getElementById("unlock-btn").click();
    }
  });

  const resetTimer = () => {
    if (!isLocked) {
      idleTime = 0;
      const timerDisplay = document.getElementById("lock-timer");
      if (timerDisplay) timerDisplay.textContent = "0";
    }
  };

  window.addEventListener("mousemove", resetTimer, true);
  window.addEventListener("mousedown", resetTimer, true);
  window.addEventListener("keydown", resetTimer, true);
  window.addEventListener("scroll", resetTimer, true);

  setInterval(() => {
    if (!isLocked) {
      idleTime++;
      const timerDisplay = document.getElementById("lock-timer");
      if (timerDisplay) timerDisplay.textContent = idleTime;

      chrome.storage.sync.get(["sessionTimeout"], (d) => {
        if (idleTime >= (d.sessionTimeout || 30)) lockSession();
      });
    }
  }, 1000);
}

window.addEventListener("load", initializeSecurity);
setInterval(initializeSecurity, 3000);
