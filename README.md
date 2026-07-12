# 🔒 VaultBite

**VaultBite** is a premium, client-side password manager and secure recipe box for your credentials. Designed with visual excellence and user experience in mind, VaultBite runs entirely in your web browser, ensuring your sensitive data never leaves your device.

---

## ✨ Features

- **Local-First Security:** All user accounts and vault entries are stored directly in your browser using **IndexedDB**.
- **Master Password Protection:** Cryptographically secure password hashing using **SHA-256** (`SubtleCrypto` API).
- **Password Strength Analyzer:** Interactive live password analysis providing real-time feedback on password complexity.
- **Biometric & Key Recovery:** Simulated device login support:
  - 🫆 **Passkey / Fingerprint / Face ID** authentication simulation.
  - 🔑 **Device PIN** (Windows Hello style PIN fallback).
  - 🔒 **Security Key** (Hardware security key style authentication).
- **Password & Passphrase Generator:**
  - Standard customizable password generator (length, uppercase, numbers, symbols).
  - Multi-word passphrase generator for easy-to-remember yet secure credentials.
- **Beautiful & Modern UI:** Styled using responsive vanilla CSS, complete with ambient backgrounds, subtle animations, and glassmorphism.

---

## 🛠️ Technology Stack

- **Frontend:** HTML5, CSS3 (Vanilla CSS, custom typography), and ES6+ JavaScript.
- **Database:** Browser-based IndexedDB for secure, structured local storage.
- **Cryptography:** Web Crypto API (`window.crypto.subtle`) for hashing.

---

## 📂 Project Structure

```text
├── index.html     # Auth Page (Sign In, Registration, Passkey options)
├── vault.html     # Vault Dashboard (Entry lists, Password/Passphrase Generator)
├── main.css       # Core styling, layouts, variables, animations
├── core.js        # Logic (IndexedDB, Authentication, Crypto, Generator utilities)
└── .gitignore     # Standard git exclusion configurations
```

---

## 🚀 Getting Started

Since VaultBite is entirely client-side, running it is simple:

1. Clone this repository:
   ```bash
   git clone https://github.com/NishankChauhan3/Vaultbite.git
   ```
2. Open `index.html` in any modern web browser.
3. Register a new account with a strong master password, optionally set up a passkey or PIN, and begin storing your credentials securely!
