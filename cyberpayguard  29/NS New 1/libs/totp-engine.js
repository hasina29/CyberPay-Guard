/**
 * CYBERPAYGUARD TOTP ENGINE (With Grace Period)
 */

const Base32 = {
  chars: "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567",
  decode: function (str) {
    str = str.replace(/=+$/, "");
    let bits = "";
    for (let i = 0; i < str.length; i++) {
      const val = this.chars.indexOf(str.charAt(i).toUpperCase());
      if (val === -1) throw new Error("Invalid base32 character");
      bits += val.toString(2).padStart(5, "0");
    }
    const bytes = new Uint8Array(Math.floor(bits.length / 8));
    for (let i = 0; i < bytes.length; i++) {
      bytes[i] = parseInt(bits.substr(i * 8, 8), 2);
    }
    return bytes.buffer;
  },
};

// Generates the TOTP code for a specific time counter
async function generateHMAC(secretBase32, counter) {
  const counterBytes = new ArrayBuffer(8);
  const counterView = new DataView(counterBytes);
  counterView.setBigUint64(0, BigInt(counter));

  const keyBuffer = Base32.decode(secretBase32);
  const key = await crypto.subtle.importKey(
    "raw",
    keyBuffer,
    { name: "HMAC", hash: "SHA-1" },
    false,
    ["sign"],
  );

  const hmac = await crypto.subtle.sign("HMAC", key, counterBytes);
  const hmacArray = new Uint8Array(hmac);

  const offset = hmacArray[hmacArray.length - 1] & 0x0f;
  const binary =
    ((hmacArray[offset] & 0x7f) << 24) |
    ((hmacArray[offset + 1] & 0xff) << 16) |
    ((hmacArray[offset + 2] & 0xff) << 8) |
    (hmacArray[offset + 3] & 0xff);

  const otp = binary % 1000000;
  return otp.toString().padStart(6, "0");
}

// Standard generator (used for live display)
async function generateTOTP(secretBase32) {
  const epoch = Math.floor(Date.now() / 1000);
  const counter = Math.floor(epoch / 30);
  return generateHMAC(secretBase32, counter);
}

// NEW: Verifier with GRACE PERIOD (checks previous, current, and next 30s windows)
async function verifyTOTP(secretBase32, userInputCode) {
  const epoch = Math.floor(Date.now() / 1000);
  const currentCounter = Math.floor(epoch / 30);

  // Check 1 step behind, current, and 1 step ahead (-1, 0, +1)
  for (let offset = -1; offset <= 1; offset++) {
    const counterToCheck = currentCounter + offset;
    const generatedCode = await generateHMAC(secretBase32, counterToCheck);

    if (generatedCode === userInputCode) {
      return true; // The code matches!
    }
  }

  return false; // The code does not match any window
}
