🔐 1. Phishing Detection and Prevention
Checks loaded URLs against a list of known phishing sites.

If a match is found:

Displays a Chrome notification warning.

Redirects the user to about:blank (in background script) or a safe site (in content script).

🧠 Malware Detection
Scans all <script> tags on the page for known malicious script URLs.

If detected:

Sends a warning message.

Displays a notification to the user.

🕓 Session Timeout Handling
Monitors user inactivity (mouse/keyboard).

After a set timeout (default 30s for background, 10 mins in content):

Shows a session timeout notification.

Redirects the user to about:blank (background) or login page (https://your-website.com/login) from the content script.

🔒 HTTPS Enforcement
If the page is not loaded over HTTPS, it redirects the user to the HTTPS version of the site.

📸 Anti Screen Capture (Anti-Capture Overlay)
On sensitive pages (containing payment, transaction, checkout, etc. in the URL):

Displays a semi-transparent overlay to obscure screen content.

Auto-hides after 10 seconds.

📟 Floating Security Status Box
Displays on every page:

Security status (static: "Secure").

Session timeout value (from storage or default).

2FA status (from storage).

Gives a visual cue of protection status.

📬 Cross-Component Communication
Background and content scripts communicate via chrome.runtime.sendMessage() to:

Report user activity.

Alert about phishing or malware.

Trigger actions like timeout or notification display.

📦 Other Features (from Manifest)
2FA toggle and session timeout settings are stored using chrome.storage.sync.

Popup (popup.html) and options page (options.html) for user interaction (though not included in your current files).

Handles permissions like tabs, cookies, webNavigation, browsingData, etc., suggesting future extensibility.