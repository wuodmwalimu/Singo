document.addEventListener('DOMContentLoaded', function() {
  initializeApp();
});

// Initialize the app
function initializeApp() {
  populateHospitalDropdown();
  displayConfirmedDonations();
  displayGroupedHospitals();
}

// Sample data for hospitals, regions, and countries
const locationData = {
  "Kenya": {
    "Nairobi": ["Nairobi Hospital", "City Hospital", "Royal Hospital", "General Hospital"],
    "Mombasa": ["Mombasa Hospital", "Coast Hospital", "Beachside Hospital", "Seaside Hospital"],
    "Kisumu": ["Kisumu Hospital", "Lakeview Hospital", "Western Hospital", "Sunrise Hospital"],
    "Nakuru": ["Nakuru Hospital", "Rift Valley Hospital", "Central Hospital", "Premier Hospital"],
    "Eldoret": ["Eldoret Hospital", "Referral Hospital", "County Hospital", "Medical Center"],
    "Machakos": ["Machakos Hospital", "Eastern Hospital", "Valley Hospital", "Central Hospital"],
    "Meru": ["Meru Hospital", "Highland Hospital", "Regional Hospital", "City Hospital"],
    "Nyeri": ["Nyeri Hospital", "Central Hospital", "Highland Hospital", "County Hospital"],
    "Thika": ["Thika Hospital", "East Hospital", "Royal Hospital", "General Hospital"],
    "Kitale": ["Kitale Hospital", "County Hospital", "Regional Hospital", "City Hospital"]
  },
  "Cameroon": {
    "Center": ["HGOPY", "HCY", "HGY", "CHRACERH", "Hop Caisse", "Hop Biyem Assi"],
    "Littoral": ["LAQUINTINIE", "Hop Gem Douala", "HGOPED", "Notre Dame"],
    "Adamawa": ["Coming Soon"],
    "East": ["Coming Soon"],
    "Far North": ["Coming Soon"],
    "North": ["Coming Soon"],
    "North-West": ["Coming Soon"],
    "South": ["Coming Soon"]
  
  }
};
const sampleDonations = [
    {
        unitNumber: "A001",
        donationDate: "2025-02-20",
        componentType: "Whole Blood",
        bloodGroup: "A",
        rhFactor: "+",
        volumeCollected: 450,
        storageTemperature: "1-6°C",
        shelfLife: "35 days"
    },
    {
        unitNumber: "B002",
        donationDate: "2025-02-18",
        componentType: "Plasma",
        bloodGroup: "B",
        rhFactor: "-",
        volumeCollected: 600,
        storageTemperature: "-30°C",
        shelfLife: "1 year"
    },
    {
        unitNumber: "O003",
        donationDate: "2025-02-15",
        componentType: "Platelets",
        bloodGroup: "O",
        rhFactor: "+",
        volumeCollected: 250,
        storageTemperature: "20-24°C",
        shelfLife: "5 days"
    },
    {
        unitNumber: "AB004",
        donationDate: "2025-02-22",
        componentType: "Red Cells",
        bloodGroup: "AB",
        rhFactor: "-",
        volumeCollected: 300,
        storageTemperature: "1-6°C",
        shelfLife: "42 days"
    },
    {
        unitNumber: "A005",
        donationDate: "2025-02-10",
        componentType: "Whole Blood",
        bloodGroup: "A",
        rhFactor: "-",
        volumeCollected: 500,
        storageTemperature: "1-6°C",
        shelfLife: "35 days"
    },
    {
        unitNumber: "B006",
        donationDate: "2025-02-05",
        componentType: "Plasma",
        bloodGroup: "B",
        rhFactor: "+",
        volumeCollected: 550,
        storageTemperature: "-30°C",
        shelfLife: "1 year"
    },
    {
        unitNumber: "O007",
        donationDate: "2025-02-12",
        componentType: "Platelets",
        bloodGroup: "O",
        rhFactor: "-",
        volumeCollected: 200,
        storageTemperature: "20-24°C",
        shelfLife: "5 days"
    },
    {
        unitNumber: "AB008",
        donationDate: "2025-02-08",
        componentType: "Red Cells",
        bloodGroup: "AB",
        rhFactor: "+",
        volumeCollected: 320,
        storageTemperature: "1-6°C",
        shelfLife: "42 days"
    },
    {
        unitNumber: "A009",
        donationDate: "2025-02-14",
        componentType: "Whole Blood",
        bloodGroup: "A",
        rhFactor: "+",
        volumeCollected: 480,
        storageTemperature: "1-6°C",
        shelfLife: "35 days"
    },
    {
        unitNumber: "O010",
        donationDate: "2025-02-16",
        componentType: "Plasma",
        bloodGroup: "O",
        rhFactor: "+",
        volumeCollected: 620,
        storageTemperature: "-30°C",
        shelfLife: "1 year"
    }
];

localStorage.setItem('confirmedDonations', JSON.stringify(sampleDonations));
alert("Sample donation records have been saved to localStorage!");

// Populate the hospital dropdown
function populateHospitalDropdown() {
  const hospitalSelect = document.getElementById('hospitalSelect');
  hospitalSelect.innerHTML = '<option value="">-- Select a Hospital --</option>';
  
  for (const country in locationData) {
    for (const region in locationData[country]) {
      locationData[country][region].forEach(hospital => {
        const option = document.createElement('option');
        option.value = hospital;
        option.textContent = hospital;
        hospitalSelect.appendChild(option);
      });
    }
  }
}

// Display confirmed donations with a move button
function displayConfirmedDonations() {
  const confirmedDonations = JSON.parse(localStorage.getItem('confirmedDonations')) || [];
  const confirmedTable = document.getElementById('confirmedTable').getElementsByTagName('tbody')[0];
  confirmedTable.innerHTML = '';
  
  if (confirmedDonations.length === 0) {
    confirmedTable.innerHTML = '<tr><td colspan="9">No confirmed donations yet.</td></tr>';
    return;
  }
  
  confirmedDonations.forEach((donation, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${donation.unitNumber}</td>
            <td>${donation.donationDate}</td>
            <td>${donation.componentType}</td>
            <td>${donation.bloodGroup} (${donation.rhFactor})</td>
            <td>${donation.volumeCollected} mL</td>
            <td>${donation.storageTemperature}</td>
            <td>${donation.shelfLife}</td>
            <td><button class="action-btn" onclick="openConfirmationModal(${index})"><i class="fas fa-arrow-right"></i> Move</button></td>
        `;
    confirmedTable.appendChild(row);
  });
}

// Display grouped hospitals
function displayGroupedHospitals() {
  const groupedHospitals = JSON.parse(localStorage.getItem('groupedHospitals')) || [];
  const groupedTable = document.getElementById('groupedTable').getElementsByTagName('tbody')[0];
  groupedTable.innerHTML = '';
  
  if (groupedHospitals.length === 0) {
    groupedTable.innerHTML = '<tr><td colspan="12">No grouped hospitals yet.</td></tr>';
    return;
  }
  
  groupedHospitals.forEach((group, index) => {
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${group.unitNumber}</td>
            <td>${group.donationDate}</td>
            <td>${group.componentType}</td>
            <td>${group.bloodGroup} (${group.rhFactor})</td>
            <td>${group.volumeCollected} mL</td>
            <td>${group.storageTemperature}</td>
            <td>${group.shelfLife}</td>
            <td>${group.hospital}</td>
            <td>${group.region}</td>
            <td>${group.country}</td>
        `;
    groupedTable.appendChild(row);
  });
}

// Open confirmation modal
function openConfirmationModal(index) {
  const modal = document.getElementById('confirmationModal');
  const modalOverlay = document.getElementById('modalOverlay');
  const confirmBtn = document.getElementById('confirmBtn');
  const cancelBtn = document.getElementById('cancelBtn');
  
  // Store the index of the donation to be moved
  modal.dataset.index = index;
  
  // Show the modal
  modal.style.display = 'block';
  modalOverlay.style.display = 'block';
  
  // Confirm button logic
  confirmBtn.onclick = function() {
    const selectedHospital = document.getElementById('hospitalSelect').value;
    if (!selectedHospital) {
      alert('Please select a hospital from the dropdown.');
      return;
    }
    
    moveToGrouped(index, selectedHospital);
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
  };
  
  // Cancel button logic
  cancelBtn.onclick = function() {
    modal.style.display = 'none';
    modalOverlay.style.display = 'none';
  };
}

// Function to move a donation to the grouped hospitals table
function moveToGrouped(index, selectedHospital) {
  const confirmedDonations = JSON.parse(localStorage.getItem('confirmedDonations')) || [];
  const groupedHospitals = JSON.parse(localStorage.getItem('groupedHospitals')) || [];
  
  if (index >= 0 && index < confirmedDonations.length) {
    const donation = confirmedDonations[index];
    
    // Find the region and country for the selected hospital
    const hospitalInfo = findHospital(selectedHospital);
    if (!hospitalInfo) {
      alert('Hospital not found in the system!');
      return;
    }
    
    // Add the donation to the grouped hospitals table
    const groupedDonation = {
      ...donation,
      hospital: selectedHospital,
      region: hospitalInfo.region,
      country: hospitalInfo.country
    };
    
    groupedHospitals.push(groupedDonation);
    localStorage.setItem('groupedHospitals', JSON.stringify(groupedHospitals));
    
    // Remove the donation from the confirmed donations table
    confirmedDonations.splice(index, 1);
    localStorage.setItem('confirmedDonations', JSON.stringify(confirmedDonations));
    
    // Refresh the tables
    displayConfirmedDonations();
    displayGroupedHospitals();
    alert(`Moved donation ${donation.unitNumber} to ${selectedHospital}.`);
  }
}

// Function to find hospital details
function findHospital(hospital) {
  for (const country in locationData) {
    for (const region in locationData[country]) {
      if (locationData[country][region].includes(hospital)) {
        return { hospital, region, country };
      }
    }
  }
  return null;
}