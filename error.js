document.addEventListener('DOMContentLoaded', function() {
  loadHospitalFilter();
  displayConfirmedDonations();
  updateBloodGroupCounts();
});

// Load hospital filter options
function loadHospitalFilter() {
  const confirmedDonations = getConfirmedDonations();
  const hospitalFilter = document.getElementById('hospitalFilter');
  const hospitals = [...new Set(confirmedDonations.map(d => d.hospital))];
  
  hospitalFilter.innerHTML = '<option value="all">All Hospitals</option>';
  hospitals.forEach(hospital => {
    hospitalFilter.innerHTML += `<option value="${hospital}">${hospital}</option>`;
  });
  
  hospitalFilter.addEventListener('change', () => {
    const selectedHospital = hospitalFilter.value;
    updatePageTitle(selectedHospital);
    displayConfirmedDonations(selectedHospital);
    updateBloodGroupCounts(selectedHospital);
  });
}

// Update the page title based on the selected hospital
function updatePageTitle(hospital) {
  const title = document.getElementById('pageTitle');
  title.innerHTML = hospital === 'all' ?
    '<i class="fas fa-hospital"></i> Viewing Summaries for All Hospitals' :
    `<i class="fas fa-hospital-alt"></i> Viewing Summaries for ${hospital}`;
}

// Display confirmed donations in the table
function displayConfirmedDonations(selectedHospital = 'all') {
  const confirmedDonations = getConfirmedDonations();
  const confirmedTable = document.querySelector('#confirmedTable tbody');
  confirmedTable.innerHTML = '';
  
  const filteredDonations = selectedHospital === 'all' ?
    confirmedDonations :
    confirmedDonations.filter(d => d.hospital === selectedHospital);
  
  if (filteredDonations.length === 0) {
    confirmedTable.innerHTML = '<tr><td colspan="9"><i class="fas fa-info-circle"></i> No confirmed donations found for this hospital.</td></tr>';
  } else {
    filteredDonations.forEach((donation, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
                <td>${index + 1}</td>
                <td><i class="fas fa-barcode"></i> ${donation.unitNumber}</td>
                <td><i class="fas fa-calendar-day"></i> ${donation.donationDate}</td>
                <td><i class="fas fa-tint"></i> ${donation.componentType}</td>
                <td><i class="fas fa-droplet"></i> ${donation.bloodGroup} (${donation.rhFactor})</td>
                <td><i class="fas fa-vial"></i> ${donation.volumeCollected} mL</td>
                <td><i class="fas fa-thermometer-half"></i> ${donation.storageTemperature}</td>
                <td><i class="fas fa-clock"></i> ${calculateExpirationDate(donation.donationDate)}</td>
                <td><i class="fas fa-clinic-medical"></i> ${donation.hospital}</td>
            `;
      confirmedTable.appendChild(row);
    });
  }
}

// Calculate expiration date (30 days from donation date)
function calculateExpirationDate(donationDate) {
  const date = new Date(donationDate);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0]; // Returns YYYY-MM-DD format
}

// Calculate and display blood group counts
function updateBloodGroupCounts(selectedHospital = 'all') {
  const confirmedDonations = getConfirmedDonations();
  const countsSection = document.getElementById('countsSection');
  countsSection.innerHTML = '';
  
  const filteredDonations = selectedHospital === 'all' ?
    confirmedDonations :
    confirmedDonations.filter(d => d.hospital === selectedHospital);
  
  const bloodGroupCounts = filteredDonations.reduce((counts, donation) => {
    const group = `${donation.bloodGroup} (${donation.rhFactor})`;
    counts[group] = (counts[group] || 0) + 1;
    return counts;
  }, {});
  
  if (Object.keys(bloodGroupCounts).length === 0) {
    countsSection.innerHTML = '<p><i class="fas fa-exclamation-circle"></i> No confirmed donations for this hospital.</p>';
  } else {
    Object.entries(bloodGroupCounts).forEach(([group, count]) => {
      const card = document.createElement('div');
      card.className = 'count-card';
      card.innerHTML = `
                <h3><i class="fas fa-heartbeat"></i> ${group}</h3>
                <p><i class="fas fa-hand-holding-water"></i> ${count} Donations</p>
            `;
      countsSection.appendChild(card);
    });
    
    renderBloodGroupChart(bloodGroupCounts);
  }
}

// Render the blood group chart
function renderBloodGroupChart(counts) {
  const ctx = document.getElementById('bloodGroupChart').getContext('2d');
  const labels = Object.keys(counts);
  const data = Object.values(counts);
  
  const backgroundColors = [
    '#FF5733', '#33FF57', '#3357FF', '#FF33A1', '#FFD700', '#FF6F61',
    '#6F61FF', '#61FF6F', '#FF8C33', '#33FFF6', '#FF3333', '#9933FF'
  ];
  const colors = labels.map((_, index) => backgroundColors[index % backgroundColors.length]);
  
  if (window.bloodGroupChart instanceof Chart) {
    window.bloodGroupChart.destroy();
  }
  
  window.bloodGroupChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Confirmed Donations per Blood Group',
        data: data,
        backgroundColor: colors,
        borderColor: colors.map(color => color.replace(/[^,]+(?=\))/, '1')),
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            stepSize: 1
          }
        }
      },
      plugins: {
        legend: {
          display: false
        }
      }
    }
  });
}

// Retrieve confirmed donations from localStorage
function getConfirmedDonations() {
  return JSON.parse(localStorage.getItem('confirmedDonations')) || [];
}

// Test: Add sample data if localStorage is empty (for debugging)
if (!localStorage.getItem('confirmedDonations')) {
  const sampleDonations = [
    { unitNumber: '001', donationDate: '2025-02-20', componentType: 'Whole Blood', bloodGroup: 'A', rhFactor: '+', volumeCollected: 450, storageTemperature: '4°C', hospital: 'City Hospital' },
    { unitNumber: '002', donationDate: '2025-02-21', componentType: 'Plasma', bloodGroup: 'B', rhFactor: '-', volumeCollected: 300, storageTemperature: 'Frozen', hospital: 'County Medical' },
    { unitNumber: '003', donationDate: '2025-02-22', componentType: 'Platelets', bloodGroup: 'O', rhFactor: '+', volumeCollected: 250, storageTemperature: '22°C', hospital: 'General Hospital' },
    { unitNumber: '004', donationDate: '2025-02-23', componentType: 'Whole Blood', bloodGroup: 'A', rhFactor: '+', volumeCollected: 450, storageTemperature: '4°C', hospital: 'City Hospital' }
  ];
  localStorage.setItem('confirmedDonations', JSON.stringify(sampleDonations));
}