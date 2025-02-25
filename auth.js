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
    const role = document.getElementById("loginRole").value.trim();
    
    if (!email || !password || !role) {
      showMessage("⚠️ Enter email, password, and select a role!", "warning");
      return;
    }
    
    // Check if the user is the administrator
    if (email === "administrator.pamojadokitasupper@pamoja.com" && password === "12345689" && role === "Admin") {
      localStorage.setItem("loggedInUser", JSON.stringify({ email, role }));
      showMessage("🎉 Welcome, Administrator!", "success");
      setTimeout(() => window.location.href = "log1.html", 1500);
      return;
    }
    
    // Search for the user in IndexedDB
    const transaction = db.transaction("sysuser3", "readonly");
    const store = transaction.objectStore("sysuser3");
    const emailIndex = store.index("email");
    const request = emailIndex.get(email);
    
    request.onsuccess = function() {
      const user = request.result;
      if (user && user.password === password && user.role === role) {
        localStorage.setItem("loggedInUser", JSON.stringify(user));
        
        if (role === "Regional Manager") {
          showMessage("🎉 Welcome, Regional Manager!", "success");
          setTimeout(() => window.location.href = "fina.html", 1500);
        } else {
          showMessage(`🎉 Welcome, ${user.firstName} ${user.lastName} (${user.role})!`, "success");
          setTimeout(() => window.location.href = "karibu.html", 1500);
        }
      } else {
        showMessage("❌ Incorrect email, password, or role!", "error");
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