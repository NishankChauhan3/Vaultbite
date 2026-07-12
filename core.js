const DB_NAME = "vaultbite-db";
const DB_VERSION = 1;

let db;

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject("DB failed");

    request.onsuccess = () => {
      db = request.result;
      resolve(db);
    };

    request.onupgradeneeded = (e) => {
      const db = e.target.result;

      // USERS TABLE
      if (!db.objectStoreNames.contains("users")) {
        const users = db.createObjectStore("users", { keyPath: "email" });
        users.createIndex("email", "email", { unique: true });
      }

      // VAULT TABLE
      if (!db.objectStoreNames.contains("vault")) {
        const vault = db.createObjectStore("vault", { keyPath: "id", autoIncrement: true });
        vault.createIndex("email", "email");
      }

      // PASSKEY TABLE
      if (!db.objectStoreNames.contains("passkeys")) {
        const pk = db.createObjectStore("passkeys", { keyPath: "id", autoIncrement: true });
        pk.createIndex("email", "email");
      }
    };
  });
}

async function registerUser(name, email, password) {
  await openDB();

  const tx = db.transaction("users", "readwrite");
  const store = tx.objectStore("users");

  const existing = await store.get(email);

  return new Promise((resolve) => {
    existing.onsuccess = async () => {
      if (existing.result) {
        resolve({ ok: false, msg: "User already exists" });
        return;
      }

      const hashed = await hashPassword(password);

      store.add({
        name,
        email,
        password: hashed
      });

      resolve({ ok: true });
    };
  });
}

async function loginUser(email, password) {
  await openDB();

  const tx = db.transaction("users", "readonly");
  const store = tx.objectStore("users");

  return new Promise((resolve) => {
    const req = store.get(email);

    req.onsuccess = async () => {
      const user = req.result;

      if (!user) {
        resolve({ ok: false, msg: "User not found" });
        return;
      }

      const hashed = await hashPassword(password);

      if (hashed !== user.password) {
        resolve({ ok: false, msg: "Wrong password" });
        return;
      }

      // Save session
      sessionStorage.setItem("vb_user", JSON.stringify(user));

      resolve({ ok: true });
    };
  });
}

async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  const hashBuffer = await crypto.subtle.digest("SHA-256", data);

  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, "0"))
    .join("");
}

function getSession() {
  return JSON.parse(sessionStorage.getItem("vb_user"));
}

function clearSession() {
  sessionStorage.removeItem("vb_user");
}

async function addVaultEntry(entry) {
  await openDB();

  const user = getSession();
  if (!user) return;

  const tx = db.transaction("vault", "readwrite");
  const store = tx.objectStore("vault");

  store.add({
    ...entry,
    email: user.email,
    createdAt: Date.now(),
    updatedAt: Date.now()
  });
}

async function getUserVault() {
  await openDB();

  const user = getSession();
  if (!user) return [];

  const tx = db.transaction("vault", "readonly");
  const store = tx.objectStore("vault");
  const index = store.index("email");

  return new Promise((resolve) => {
    const req = index.getAll(user.email);
    req.onsuccess = () => resolve(req.result || []);
  });
}

async function updateVaultEntry(entry) {
  await openDB();

  const tx = db.transaction("vault", "readwrite");
  const store = tx.objectStore("vault");

  entry.updatedAt = Date.now();

  store.put(entry);
}

async function deleteVaultEntry(id) {
  await openDB();

  const tx = db.transaction("vault", "readwrite");
  const store = tx.objectStore("vault");

  store.delete(id);
}

// Toast function
function showToast(msg) {
  const t = document.getElementById("vb-toast");
  if (!t) return;
  t.textContent = msg;
  t.classList.add("show");
  setTimeout(() => t.classList.remove("show"), 2500);
}

// Password strength function
function scorePassword(pwd) {
  let score = 0;

  if (!pwd) return { score: 0, label: "Weak", color: "red", level: "weak" };

  if (pwd.length >= 8) score += 20;
  if (pwd.length >= 12) score += 20;
  if (/[A-Z]/.test(pwd)) score += 20;
  if (/[0-9]/.test(pwd)) score += 20;
  if (/[^A-Za-z0-9]/.test(pwd)) score += 20;

  let label = "Weak", color = "red", level = "weak";

  if (score >= 80) {
    label = "Excellent";
    color = "green";
    level = "excellent";
  } 
  else if (score >= 60) {
    label = "Strong";
    color = "green";
    level = "strong";
  } 
  else if (score >= 40) {
    label = "Moderate";
    color = "orange";
    level = "moderate";
  }

  return { score, label, color, level }; // ✅ FIXED
}

function generatePassword(options = {}) {
  const length = options.length || 12;
  const upper = options.upper ?? true;
  const numbers = options.numbers ?? true;
  const symbols = options.symbols ?? true;

  let chars = "abcdefghijklmnopqrstuvwxyz";
  if (upper) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (numbers) chars += "0123456789";
  if (symbols) chars += "!@#$%^&*";

  let pwd = "";

  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }

  return pwd;
}

function generatePassphrase() {
  const words = ["apple", "river", "sun", "cloud", "stone", "tiger", "green", "light"];

  let phrase = "";

  for (let i = 0; i < 4; i++) {
    phrase += words[Math.floor(Math.random() * words.length)] + "-";
  }

  phrase += Math.floor(Math.random() * 100);

  // ✅ FIX: target the correct output box
  const output = document.querySelector(".generator-box, .generator-output, .gen-output");

  if (output) {
    output.textContent = phrase;
  } else {
    console.log("Output box not found");
  }

  showToast("Passphrase generated ✓");
}

// ===== PASSKEY (DEMO MODE) =====

async function registerPasskey(email) {
  // demo only
  return { ok: true };
}

async function authenticatePasskey() {
  // simulate success
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({ ok: true });
    }, 800);
  });
}

function handlePinLogin() {
  const email = document.getElementById("login-email")?.value;

  if (!email) {
    showToast("⚠ Enter email first");
    return;
  }

  const savedPin = localStorage.getItem("vb_pin_" + email);

  if (!savedPin) {
    showToast("⚠ No PIN set for this account");
    return;
  }

  const input = prompt("Enter your device PIN:");

  if (!input) {
    showToast("⚠ Cancelled");
    return;
  }

  if (input === savedPin) {
    sessionStorage.setItem("vb_user", JSON.stringify({
      email: email,
      name: email.split("@")[0]
    }));

    showToast("PIN verified ✅");

    setTimeout(() => {
      window.location.href = "vault.html";
    }, 800);

  } else {
    showToast("❌ Incorrect PIN");
  }
}

function handleSecurityKeyLogin() {
  const email = document.getElementById("login-email")?.value;

  if (!email) {
    showToast("⚠ Enter email first");
    return;
  }

  const savedKey = localStorage.getItem("vb_security_key_" + email);

  if (!savedKey) {
    showToast("⚠ No security key set for this account");
    return;
  }

  const input = prompt("Enter your security key:");

  if (!input) {
    showToast("⚠ Cancelled");
    return;
  }

  if (input === savedKey) {
    sessionStorage.setItem("vb_user", JSON.stringify({
      email: email,
      name: email.split("@")[0]
    }));

    showToast("Security key verified 🔐");

    setTimeout(() => {
      window.location.href = "vault.html";
    }, 800);

  } else {
    showToast("❌ Incorrect security key");
  }
}
function startFingerprintAuth() {
  alert("Fingerprint clicked"); // test

  showToast("Scanning fingerprint...");

  setTimeout(() => {
    sessionStorage.setItem("vb_user", JSON.stringify({
      email: "nishank.chauhan51@gmail.com",
      name: "Nishank"
    }));

    showToast("Fingerprint verified 🔓");
    window.location.href = "vault.html";
  }, 1200);
}

window.onload = () => {
  if (window.vbInit) vbInit();
};

