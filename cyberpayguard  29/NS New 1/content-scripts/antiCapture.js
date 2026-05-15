let antiCaptureOverlay;
let isShieldActive = false;
let unblurTimeout;

/**
 * Creates the blur overlay element and appends it to the body.
 */
function createAntiCaptureOverlay() {
  if (antiCaptureOverlay) return; // Already created

  antiCaptureOverlay = document.createElement("div");
  antiCaptureOverlay.id = "cyberpayguard-anticapture";

  // Advanced Cyberpunk Blur Styling
  Object.assign(antiCaptureOverlay.style, {
    position: "fixed",
    top: "0",
    left: "0",
    width: "100vw",
    height: "100vh",
    backgroundColor: "rgba(0, 0, 0, 0.8)", // Dark tint
    backdropFilter: "blur(40px) saturate(180%)", // Heavy blur
    WebkitBackdropFilter: "blur(40px) saturate(180%)",
    zIndex: "2147483647", // Maximum layer
    display: "none", // Hidden by default
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    color: "#00ff88",
    fontFamily: "Arial, sans-serif",
    textAlign: "center",
    transition: "opacity 0.2s ease-in-out",
    cursor: "not-allowed",
  });

  // Warning message
  antiCaptureOverlay.innerHTML = `
    <div style="font-size: 60px; margin-bottom: 20px; filter: drop-shadow(0 0 15px rgba(0,255,136,0.8));">🛡️</div>
    <h1 style="margin: 0; font-size: 28px; color: #00ff88; text-shadow: 0 0 15px rgba(0,255,136,0.6); letter-spacing: 2px;">SCREEN PROTECTED</h1>
    <p style="color: #aaa; font-size: 14px; margin-top: 10px;">Content is hidden to prevent screen capture.</p>
  `;

  document.body.appendChild(antiCaptureOverlay);
  isShieldActive = true;
  console.log("CyberPayGuard: Anti-Capture Shield Activated.");
}

/**
 * Enables the blur overlay.
 */
function enableBlur() {
  if (isShieldActive && antiCaptureOverlay) {
    // If the user leaves, cancel any pending unblur from before
    clearTimeout(unblurTimeout);
    antiCaptureOverlay.style.display = "flex";
  }
}

/**
 * Disables the blur overlay AFTER a 1-SECOND DELAY.
 */
function disableBlur() {
  if (antiCaptureOverlay) {
    // Wait 1 second (1000ms) before removing the blur
    unblurTimeout = setTimeout(() => {
      antiCaptureOverlay.style.display = "none";
    }, 1000);
  }
}

// --- INITIALIZATION & EVENT LISTENERS ---

window.addEventListener("DOMContentLoaded", () => {
  createAntiCaptureOverlay();

  // 1. Tab Switch / Minimize (Triggers when the user leaves the tab)
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      enableBlur();
    } else {
      disableBlur();
    }
  });

  // 2. Window Lose Focus (User clicks on another app)
  window.addEventListener("blur", enableBlur);

  // 3. Window Gain Focus (User clicks back on the browser)
  window.addEventListener("focus", disableBlur);
});
