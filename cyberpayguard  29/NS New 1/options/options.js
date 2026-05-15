const default_settings = {
  sessionTimeout: 30,
  enable2FA: true,
  twoFAMethod: "email",
  email1: "",
  email2: "",
  totpSecret: "",
};

document.addEventListener("DOMContentLoaded", restore_options);
document.getElementById("save").addEventListener("click", save_options);
document.getElementById("defaults").addEventListener("click", restore_defaults);

document.getElementById("2fa-method").addEventListener("change", (e) => {
  if (e.target.value === "email") {
    document.getElementById("email-settings").style.display = "block";
    document.getElementById("totp-settings").style.display = "none";
  } else {
    document.getElementById("email-settings").style.display = "none";
    document.getElementById("totp-settings").style.display = "block";
  }
});

function save_options() {
  const timeoutValue = document.getElementById("lock_after_idle_seconds").value;
  const twoFAMethodValue = document.getElementById("2fa-method").value;
  const email1Value = document.getElementById("email1").value;
  const email2Value = document.getElementById("email2").value;

  const settings = {
    sessionTimeout: Number(timeoutValue),
    enable2FA: true,
    twoFAMethod: twoFAMethodValue,
    email1: email1Value,
    email2: email2Value,
  };

  if (
    isNaN(settings.sessionTimeout) ||
    settings.sessionTimeout < 15 ||
    settings.sessionTimeout > 1209600
  ) {
    showStatus("Value must be between 15 and 1,209,600 seconds.", "error");
    return;
  }

  if (twoFAMethodValue === "email" && !email1Value) {
    showStatus("Please enter a primary email for OTP.", "error");
    return;
  }

  chrome.storage.sync.set(settings, function () {
    showStatus("Settings saved successfully!", "success");
    chrome.runtime.sendMessage({ type: "UPDATE_STATUS", ...settings });
  });
}

function restore_defaults() {
  default_settings.totpSecret = "";
  chrome.storage.sync.set(default_settings, function () {
    restore_options();
    showStatus("Default settings restored.", "success");
  });
}

function restore_options() {
  chrome.storage.sync.get(default_settings, function (items) {
    document.getElementById("lock_after_idle_seconds").value =
      items.sessionTimeout;
    document.getElementById("2fa-method").value = items.twoFAMethod;
    document.getElementById("email1").value = items.email1;
    document.getElementById("email2").value = items.email2;
    document.getElementById("2fa-method").dispatchEvent(new Event("change"));
  });
}

function showStatus(message, type) {
  let status = document.getElementById("status");
  status.textContent = message;
  status.style.color = type === "error" ? "#ff4444" : "#00ff88";
  setTimeout(() => {
    status.textContent = "";
  }, 4000);
}

// --- TOTP & QR CODE LOGIC ---

function generateBase32Secret() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  let secret = "";
  for (let i = 0; i < 16; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return secret;
}

function generateQRCode() {
  // FIX: Check if we already have a secret key saved
  chrome.storage.sync.get(["totpSecret"], (data) => {
    let secretToUse = data.totpSecret;

    // Only generate a NEW secret if one doesn't exist yet
    if (!secretToUse) {
      secretToUse = generateBase32Secret();
      chrome.storage.sync.set({ totpSecret: secretToUse });
      showStatus(
        "New QR Code generated! Scan with your Authenticator App.",
        "success",
      );
    } else {
      showStatus("Displaying existing QR Code.", "success");
    }

    const otpauthUrl = `otpauth://totp/CYBERPAYGUARD:User?secret=${secretToUse}&issuer=CYBERPAYGUARD`;

    const qrContainer = document.getElementById("qr-code-container");
    qrContainer.innerHTML = "";

    qrContainer.style.display = "flex";
    qrContainer.style.flexDirection = "column";
    qrContainer.style.alignItems = "center";
    qrContainer.style.gap = "15px";

    new QRCode(qrContainer, {
      text: otpauthUrl,
      width: 180,
      height: 180,
      colorDark: "#000000",
      colorLight: "#ffffff",
      correctLevel: QRCode.CorrectLevel.H,
    });

    const infoDiv = document.createElement("div");
    infoDiv.style.fontFamily = "'Courier New', monospace";
    infoDiv.style.color = "#000";
    infoDiv.style.textAlign = "center";

    infoDiv.innerHTML = `
      <p style="font-size: 11px; margin-bottom: 5px; color: #555;">Manual Entry Key:</p>
      <p style="word-wrap: break-word; font-size: 14px; letter-spacing: 1px; color: #000; font-weight: bold; margin:0;">${secretToUse}</p>
    `;

    qrContainer.appendChild(infoDiv);
  });

  showStatus("QR Code generated! Scan with your Authenticator App.", "success");
}

document
  .getElementById("generate-qr")
  .addEventListener("click", generateQRCode);
