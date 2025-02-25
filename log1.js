document.addEventListener("DOMContentLoaded", function() {
  const countrySelect = document.getElementById("signupCountry");
  const regionSelect = document.getElementById("signupRegion");
  const hospitalSelect = document.getElementById("signupHospital");

  // Load region and hospital data from embedded JSON scripts
  const regionsData = JSON.parse(document.getElementById("regionsData").textContent);
  const hospitalsData = JSON.parse(document.getElementById("hospitalsData").textContent);

  // Function to populate dropdown options
  function populateOptions(selectElement, options) {
    selectElement.innerHTML = '<option value="">Select</option>';
    options.forEach(option => {
      const opt = document.createElement("option");
      opt.value = option;
      opt.textContent = option;
      selectElement.appendChild(opt);
    });
  }

  // Handle country selection
  countrySelect.addEventListener("change", function() {
    const selectedCountry = this.value;
    if (selectedCountry && regionsData[selectedCountry]) {
      populateOptions(regionSelect, regionsData[selectedCountry]);
      regionSelect.disabled = false;
      hospitalSelect.innerHTML = '<option value="">Select Hospital</option>'; // Reset hospitals
      hospitalSelect.disabled = true;
    } else {
      regionSelect.innerHTML = '<option value="">Select Region</option>';
      regionSelect.disabled = true;
      hospitalSelect.innerHTML = '<option value="">Select Hospital</option>';
      hospitalSelect.disabled = true;
    }
  });

  // Handle region selection
  regionSelect.addEventListener("change", function() {
    const selectedRegion = this.value;
    if (selectedRegion && hospitalsData[selectedRegion]) {
      populateOptions(hospitalSelect, hospitalsData[selectedRegion]);
      hospitalSelect.disabled = false;
    } else {
      hospitalSelect.innerHTML = '<option value="">Select Hospital</option>';
      hospitalSelect.disabled = true;
    }
  });

  // Disable region and hospital selects initially
  regionSelect.disabled = true;
  hospitalSelect.disabled = true;

  // IndexedDB setup
  const dbName = "PamojaDokitaDB";
  const dbVersion = 2;
  let db;

  const request = indexedDB.open(dbName, dbVersion);

  request.onupgradeneeded = function(event) {
    db = event.target.result;
    if (!db.objectStoreNames.contains("sysuser3")) {
      const store = db.createObjectStore("sysuser3", { keyPath: "recordid", autoIncrement: true });
      store.createIndex("email", "email", { unique: true });
      store.createIndex("role", "role", { unique: false });
    }
  };

  request.onsuccess = function(event) {
    db = event.target.result;
    loadUsers(); // Load users after DB success
  };

  request.onerror = function(event) {
    console.error("❌ Database error:", event.target.error);
  };

  // Generate email from first and last name
  function generateEmail(firstName, lastName) {
    return `${firstName.toLowerCase()}.${lastName.toLowerCase()}@pamoja.com`;
  }

  function updateEmail() {
    const firstName = document.getElementById("signupFirstName").value.trim();
    const lastName = document.getElementById("signupLastName").value.trim();
    document.getElementById("signupEmail").value = firstName && lastName ? generateEmail(firstName, lastName) : "";
  }

  document.getElementById("signupFirstName").addEventListener("input", updateEmail);
  document.getElementById("signupLastName").addEventListener("input", updateEmail);

  // Handle form submission for new user
  document.getElementById("signupForm").addEventListener("submit", function(event) {
    event.preventDefault();

    const newUser = {
      recordid: Date.now(),
      prefix: document.getElementById("signupPrefix").value,
      firstName: document.getElementById("signupFirstName").value,
      lastName: document.getElementById("signupLastName").value,
      email: document.getElementById("signupEmail").value,
      country: document.getElementById("signupCountry").value,
      region: document.getElementById("signupRegion").value,
      hospital: document.getElementById("signupHospital").value,
      role: document.getElementById("signupRole").value,
      password: document.getElementById("signupPassword").value,
    };

    const transaction = db.transaction("sysuser3", "readwrite");
    const store = transaction.objectStore("sysuser3");
    store.add(newUser);

    transaction.oncomplete = function() {
      loadUsers(); // Refresh the list of users
      document.getElementById("signupForm").reset(); // Reset the form after submission
    };

    transaction.onerror = function(event) {
      console.error("❌ Error adding user:", event.target.error);
    };
  });

  // Load users from IndexedDB and display them
  function loadUsers() {
    const transaction = db.transaction("sysuser3", "readonly");
    const store = transaction.objectStore("sysuser3");
    const request = store.getAll();

    request.onsuccess = function() {
      const users = request.result;
      const userList = document.getElementById("userList");
      userList.innerHTML = ""; // Clear the existing user list

      users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
          <td>${user.prefix} ${user.firstName} ${user.lastName}</td>
          <td>${user.email}</td>
          <td>${user.role}</td>
          <td>${user.country}</td>
          <td>${user.region}</td>
          <td>${user.hospital}</td>
          <td><button onclick="editUser(${user.recordid})">Edit</button></td>
        `;
        userList.appendChild(row);
      });
    };

    request.onerror = function() {
      console.error("❌ Error loading users:", request.error);
    };
  }

  // Edit user functionality
  window.editUser = function(recordid) {
    const transaction = db.transaction("sysuser3", "readonly");
    const store = transaction.objectStore("sysuser3");
    const request = store.get(recordid);

    request.onsuccess = function() {
      const user = request.result;

      // Pre-fill the form with the user's current details
      document.getElementById("signupPrefix").value = user.prefix;
      document.getElementById("signupFirstName").value = user.firstName;
      document.getElementById("signupLastName").value = user.lastName;
      document.getElementById("signupEmail").value = user.email;
      document.getElementById("signupCountry").value = user.country;
      populateOptions(regionSelect, regionsData[user.country] || []);
      document.getElementById("signupRegion").value = user.region;
      populateOptions(hospitalSelect, hospitalsData[user.region] || []);
      document.getElementById("signupHospital").value = user.hospital;
      document.getElementById("signupRole").value = user.role;

      // Update email based on name input (if needed)
      updateEmail();

      // Change submit button to "Update" and set form action to update user
      const form = document.getElementById("signupForm");
      const submitButton = form.querySelector("button[type='submit']");
      submitButton.textContent = "Update";

      // Handle update submission
      form.onsubmit = function(event) {
        event.preventDefault();

        // Get updated user data
        const updatedUser = {
          recordid: user.recordid,
          prefix: document.getElementById("signupPrefix").value,
          firstName: document.getElementById("signupFirstName").value,
          lastName: document.getElementById("signupLastName").value,
          email: document.getElementById("signupEmail").value,
          country: document.getElementById("signupCountry").value,
          region: document.getElementById("signupRegion").value,
          hospital: document.getElementById("signupHospital").value,
          role: document.getElementById("signupRole").value,
          password: document.getElementById("signupPassword").value,
        };

        const updateTransaction = db.transaction("sysuser3", "readwrite");
        const updateStore = updateTransaction.objectStore("sysuser3");
        updateStore.put(updatedUser);

        updateTransaction.oncomplete = function() {
          loadUsers(); // Refresh the user list
          form.reset(); // Reset the form after update
          submitButton.textContent = "Submit"; // Reset button text to "Submit"
        };

        updateTransaction.onerror = function(event) {
          console.error("❌ Error updating user:", event.target.error);
        };
      };
    };

    request.onerror = function() {
      console.error("❌ Error fetching user for editing:", request.error);
    };
  };
});