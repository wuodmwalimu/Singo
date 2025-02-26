document.addEventListener('DOMContentLoaded', function() {
  updateBloodGroupCounts();
});

// Blood groups to track
const bloodGroups = ['A (+)', 'A (-)', 'B (+)', 'B (-)', 'AB (+)', 'AB (-)', 'O (+)', 'O (-)'];

// Update blood group counts and display cards
function updateBloodGroupCounts() {
  const confirmedDonations = getConfirmedDonations();
  const countsSection = document.getElementById('countsSection');
  countsSection.innerHTML = '';

  // Initialize all blood groups to zero
  const bloodGroupCounts = bloodGroups.reduce((counts, group) => {
    counts[group] = 0;
    return counts;
  }, {});

  // Count donations by blood group
  confirmedDonations.forEach(donation => {
    const group = `${donation.bloodGroup} (${donation.rhFactor})`;
    if (bloodGroupCounts.hasOwnProperty(group)) {
      bloodGroupCounts[group]++;
    }
  });

  // Display cards for each blood group
  Object.entries(bloodGroupCounts).forEach(([group, count]) => {
    const card = document.createElement('div');
    card.className = 'count-card';
    card.innerHTML = `
      <h3>${group}</h3>
      <p>${count} Donations</p>
    `;
    countsSection.appendChild(card);
  });
}

// Get confirmed donations from localStorage or return an empty array
function getConfirmedDonations() {
  return JSON.parse(localStorage.getItem('confirmedDonations')) || [];
}

// Add some sample data if localStorage is empty (for testing)
if (!localStorage.getItem('confirmedDonations')) {
  const sampleDonations = [
    { bloodGroup: 'A', rhFactor: '+', hospital: 'City Hospital' },
    { bloodGroup: 'B', rhFactor: '-', hospital: 'County Medical' }
  ];
  localStorage.setItem('confirmedDonations', JSON.stringify(sampleDonations));
}