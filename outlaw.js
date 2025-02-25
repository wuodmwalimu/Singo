document.addEventListener('DOMContentLoaded', function() {
  updateUI();
  populateFilters();
});

function updateUI() {
  const groupedHospitals = JSON.parse(localStorage.getItem('groupedHospitals')) || [];
  const hospitalFilter = document.getElementById('hospitalSelect').value;
  const regionFilter = document.getElementById('regionSelect').value;
  
  const filteredData = groupedHospitals.filter(group => {
    return (!hospitalFilter || group.hospital === hospitalFilter) &&
      (!regionFilter || group.region === regionFilter);
  });
  
  // Update the header text based on the selected filters
  updateHeaderText(hospitalFilter, regionFilter);
  
  displayGroupedTable(filteredData);
  updateBloodGroupCounts(filteredData);
  updateBloodGroupChart(filteredData);
}

function updateHeaderText(hospital, region) {
  const headerText = document.getElementById('headerText');
  let text = '<i class="fas fa-tint"></i> Summary of Available Blood in the Bank';
  
  if (hospital && region) {
    text = `You are viewing summary for ${hospital} in ${region}`;
  } else if (hospital) {
    text = `You are viewing summary for ${hospital}`;
  } else if (region) {
    text = `You are viewing summary for ${region}`;
  }
  
  headerText.innerHTML = text;
}

function populateFilters() {
  const groupedHospitals = JSON.parse(localStorage.getItem('groupedHospitals')) || [];
  const hospitalSelect = document.getElementById('hospitalSelect');
  const regionSelect = document.getElementById('regionSelect');
  
  const hospitals = [...new Set(groupedHospitals.map(group => group.hospital))];
  const regions = [...new Set(groupedHospitals.map(group => group.region))];
  
  hospitalSelect.innerHTML = '<option value="">Select Hospital</option>' +
    hospitals.map(h => `<option value="${h}">${h}</option>`).join('');
  
  regionSelect.innerHTML = '<option value="">Select Region</option>' +
    regions.map(r => `<option value="${r}">${r}</option>`).join('');
}

function calculateExpirationDate(donationDate) {
  const date = new Date(donationDate);
  date.setDate(date.getDate() + 30);
  return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
}

function displayGroupedTable(groupedHospitals) {
  const tableBody = document.getElementById('groupedTable');
  tableBody.innerHTML = '';
  
  if (groupedHospitals.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="9">No grouped hospitals yet.</td></tr>';
    return;
  }
  
  groupedHospitals.forEach((group, index) => {
    const expirationDate = calculateExpirationDate(group.donationDate);
    const row = document.createElement('tr');
    row.innerHTML = `
            <td>${index + 1}</td>
            <td>${group.unitNumber}</td>
            <td>${group.donationDate}</td>
            <td>${group.componentType}</td>
            <td>${group.bloodGroup} (${group.rhFactor})</td>
            <td>${group.volumeCollected} mL</td>
            <td>${group.storageTemperature}</td>
            <td>${expirationDate}</td>
        `;
    tableBody.appendChild(row);
  });
}

function updateBloodGroupCounts(groupedHospitals) {
  const bloodGroupCounts = {};
  groupedHospitals.forEach(group => {
    const groupKey = `${group.bloodGroup} (${group.rhFactor})`;
    bloodGroupCounts[groupKey] = (bloodGroupCounts[groupKey] || 0) + 1;
  });
  
  const cardsContainer = document.getElementById('bloodGroupCards');
  cardsContainer.innerHTML = '';
  
  for (const [group, count] of Object.entries(bloodGroupCounts)) {
    const card = document.createElement('div');
    card.classList.add('card');
    card.innerHTML = `<h3>${group}</h3><p>${count} units</p>`;
    cardsContainer.appendChild(card);
  }
}

function updateBloodGroupChart(groupedHospitals) {
  const bloodGroupCounts = {};
  groupedHospitals.forEach(group => {
    const groupKey = `${group.bloodGroup} (${group.rhFactor})`;
    bloodGroupCounts[groupKey] = (bloodGroupCounts[groupKey] || 0) + 1;
  });
  
  const labels = Object.keys(bloodGroupCounts);
  const data = Object.values(bloodGroupCounts);
  
  const ctx = document.getElementById('bloodGroupChart').getContext('2d');
  if (window.bloodChart) window.bloodChart.destroy();
  window.bloodChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Available Units',
        data: data,
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1
      }]
    },
    options: {
      responsive: true,
      scales: { y: { beginAtZero: true } }
    }
  });
}