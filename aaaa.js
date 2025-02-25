document.addEventListener("DOMContentLoaded", function() {
  const dbName = "PamojaDokitaDB";
  const dbVersion = 2;
  let db;

  // Open IndexedDB
  const request = indexedDB.open(dbName, dbVersion);

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("sysuser3")) {
      const store = db.createObjectStore("sysuser3", { keyPath: "recordid" });
      store.createIndex("email", "email", { unique: true });
      store.createIndex("role", "role", { unique: false });
    }
  };

  request.onsuccess = function(event) {
    db = event.target.result;
  };

  request.onerror = function(event) {
    console.error("❌ Database error:", event.target.error);
  };

  // Form Elements
  const loginForm = document.getElementById("loginForm");

  // Login Form Submission
  loginForm.addEventListener("submit", function(event) {
    event.preventDefault();

    const email = document.getElementById("loginEmail").value.trim().toLowerCase();
    const password = document.getElementById("loginPassword").value.trim();

    if (!email || !password) {
      showMessage("⚠️ Enter email and password!", "warning");
      return;
    }

    const transaction = db.transaction("sysuser3", "readonly");
    const store = transaction.objectStore("sysuser3");
    const emailIndex = store.index("email");
    const request = emailIndex.get(email);

    request.onsuccess = function() {
      const user = request.result;
      if (user && user.password === password) {
        showMessage(`🎉 Welcome, ${user.firstName} ${user.lastName}!`, "success");
        localStorage.setItem("loggedInUser", JSON.stringify(user)); // ✅ Changed key to "loggedInUser"
        setTimeout(() => window.location.href = "karibu.html", 1500);
      } else {
        showMessage("❌ Incorrect email or password!", "error");
      }
    };

    request.onerror = function() {
      showMessage("❌ User not found!", "error");
    };
  });

  // Show Message Function
  function showMessage(message, type) {
    const messageBox = document.createElement("div");
    messageBox.className = `message ${type}`;
    messageBox.innerHTML = message;
    document.body.appendChild(messageBox);

    setTimeout(() => {
      messageBox.remove();
    }, 3000);
  }
});