document.addEventListener("DOMContentLoaded", () => {
  const dbName = "BloodRequestDB";
  const dbVersion = 9;
  let db;
  
  // Elements for displaying counts
  const requestCountElement = document.getElementById("requestCount");
  const approvedCountElement = document.getElementById("approvedRequestCount");
  
  // --- Open IndexedDB ---
  const openDB = () => {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onsuccess = (event) => {
      db = event.target.result;
      updateCounts();
    };
    
    request.onerror = (event) => {
      console.error("Error opening database:", event.target.errorCode);
    };
  };
  
  // --- Count Requests in a Store ---
  const countRequests = (storeName, callback) => {
    if (!db) return;
    
    const transaction = db.transaction(storeName, "readonly");
    const store = transaction.objectStore(storeName);
    const countRequest = store.count();
    
    countRequest.onsuccess = (event) => {
      callback(event.target.result);
    };
    
    countRequest.onerror = (event) => {
      console.error(`Error counting ${storeName}:`, event.target.error);
    };
  };
  
  // --- Update Request Counts ---
  const updateCounts = () => {
    countRequests("requests", (count) => {
      requestCountElement.textContent = `Total Requests: ${count}`;
    });
    
    countRequests("approvedRequests", (count) => {
      approvedCountElement.textContent = `Approved Requests: ${count}`;
    });
  };
  
  // --- Approve Request ---
  window.approveRequest = (requestId) => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser) return;
    
    const dbRequest = indexedDB.open(dbName, dbVersion);
    
    dbRequest.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["requests", "approvedRequests"], "readwrite");
      const requestsStore = transaction.objectStore("requests");
      const approvedStore = transaction.objectStore("approvedRequests");
      
      const getRequest = requestsStore.get(requestId);
      
      getRequest.onsuccess = () => {
        const data = getRequest.result;
        if (data) {
          data.approvedBy = loggedInUser.username || loggedInUser.email;
          data.approvedAt = new Date().toISOString();
          delete data.id; // Remove ID to generate a new one in approved store
          approvedStore.add(data);
          requestsStore.delete(requestId);
        }
      };
      
      transaction.oncomplete = () => {
        window.fetchRequests();
        updateCounts(); // Refresh counts
        showApprovalMessage();
      };
      
      transaction.onerror = (event) => {
        console.error("Error approving request:", event.target.error);
      };
    };
    
    dbRequest.onerror = (event) => {
      console.error("Error opening database for approval:", event.target.errorCode);
    };
  };
  
  // --- Show Approval Message ---
  const showApprovalMessage = () => {
    showMessage("Request approved successfully ✅", "success");
  };
  
  // --- Show Message ---
  const showMessage = (text, type) => {
    const message = document.createElement("div");
    message.classList.add("message", type);
    message.textContent = text;
    document.body.appendChild(message);
    setTimeout(() => message.remove(), 5000);
  };
  
  // --- Initialize Database ---
  openDB();
});
