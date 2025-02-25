document.addEventListener("DOMContentLoaded", () => {
  const dbName = "BloodRequestDB";
  const dbVersion = 9;
  let requestsData = [];
  let filteredData = [];
  let db;
  
  const locationFilter = document.getElementById("locationFilter");
  const exportCSVButton = document.getElementById("exportCSV");
  const tableBody = document.getElementById("requestsBody");
  
  // Open IndexedDB
  const openDB = () => {
    const request = indexedDB.open(dbName, dbVersion);
    
    request.onsuccess = (event) => {
      db = event.target.result;
      fetchRequests();
    };
    
    request.onerror = (event) => {
      console.error("Database error:", event.target.errorCode);
    };
  };
  
  // Fetch Requests from IndexedDB
  const fetchRequests = () => {
    if (!db) return;
    const transaction = db.transaction("requests", "readonly");
    const store = transaction.objectStore("requests");
    const getAllRequest = store.getAll();
    
    getAllRequest.onsuccess = (event) => {
      requestsData = event.target.result;
      filteredData = [...requestsData];
      populateLocationFilter();
      displayRequests();
    };
  };
  
  // Populate Location Filter
  const populateLocationFilter = () => {
    const uniqueLocations = [...new Set(requestsData.map(req => req.location))];
    locationFilter.innerHTML = '<option value="">All</option>';
    uniqueLocations.forEach(loc => {
      if (loc) {
        const option = document.createElement("option");
        option.value = loc;
        option.textContent = loc;
        locationFilter.appendChild(option);
      }
    });
  };
  
  // Display Requests in the Table
  const displayRequests = () => {
    tableBody.innerHTML = "";
    
    if (filteredData.length === 0) {
      tableBody.innerHTML = "<tr><td colspan='7'>No requests found.</td></tr>";
      return;
    }
    
    filteredData.forEach(item => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${item.id || "N/A"}</td>
        <td>${item.bloodType}</td>
        <td>${item.units}</td>
        <td>${item.gender}</td>
        <td>${item.hospital}</td>
        <td>${item.doctor}</td>
        <td>${item.contactHospital}</td>
        <td>${item.location}</td>
      `;
      tableBody.appendChild(row);
    });
  };
  
  // Filter Requests by Location
  locationFilter.addEventListener("change", () => {
    const selectedLocation = locationFilter.value;
    filteredData = selectedLocation ?
      requestsData.filter(req => req.location === selectedLocation) :
      [...requestsData];
    displayRequests();
  });
  
  // Sort Table Columns
  document.querySelectorAll("th").forEach(th => {
    th.addEventListener("click", () => {
      const column = th.getAttribute("data-column");
      if (!column) return;
      
      const order = th.dataset.order === "asc" ? "desc" : "asc";
      th.dataset.order = order;
      
      filteredData.sort((a, b) => {
        if (a[column] < b[column]) return order === "asc" ? -1 : 1;
        if (a[column] > b[column]) return order === "asc" ? 1 : -1;
        return 0;
      });
      
      displayRequests();
    });
  });
  
  // Export Table to CSV
  exportCSVButton.addEventListener("click", () => {
    const headers = [
      "ID", "Blood Type", "Units", "Gender", "Hospital", "Doctor", "Contact", "Location"
    ];
    
    const csvRows = [headers.join(",")];
    
    filteredData.forEach(item => {
      csvRows.push([
        item.id, item.bloodType, item.units, item.gender, item.hospital,
        item.doctor, item.contactHospital, item.location
      ].join(","));
    });
    
    const csvContent = "data:text/csv;charset=utf-8," + csvRows.join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "blood_requests.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
  
  // Open IndexedDB
  openDB();
});