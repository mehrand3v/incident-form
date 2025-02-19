import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXQZFYZfq4um2FiGn8EVzzBbzu64S6TqA",
  authDomain: "signin-azeem.firebaseapp.com",
  projectId: "signin-azeem",
  storageBucket: "signin-azeem.firebasestorage.app",
  messagingSenderId: "761268740990",
  appId: "1:761268740990:web:45df375c4fd2332133492f",
  measurementId: "G-23PRYF0YR6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tableContainer = document.querySelector('.table-container');
const loader = document.createElement('div');
loader.innerHTML = `
    <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 40px;
    ">
        <div style="
            width: 50px;
            height: 50px;
            border: 5px solid #f3f3f3;
            border-top: 5px solid #e81cff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
        "></div>
    </div>
    <style>
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
`;
// Show loader before loading data
tableContainer.appendChild(loader);
// Get elements
const incidentsTable = document.getElementById("incidentsTable");
const dateFilter = document.getElementById("dateFilter");
const statusFilter = document.getElementById("statusFilter");
const storeFilter = document.getElementById("storeFilter");
const incidentTypeFilter = document.getElementById("incidentTypeFilter");
const modal = document.getElementById("detailsModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.querySelector(".close-modal");
let currentPage = 1;
const itemsPerPage = 10;
let allIncidents = [];
// Modal handlers
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
};

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Create incident type spans
const createIncidentTypeBadges = (types) => {
  return types
    .map((type) => {
      // Keep the type exactly as it is in the database
      return `<span class="incident-type" data-type="${type}">${type}</span>`;
    })
    .join("");
};

// Populate incident type filter
const populateIncidentTypeFilter = (incidents) => {
  const types = new Set();
  incidents.forEach((doc) => {
    const data = doc.data();
    data.incidentTypes.forEach((type) => types.add(type));
  });

  incidentTypeFilter.innerHTML = '<option value="all">All Types</option>';
  [...types].sort().forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    incidentTypeFilter.appendChild(option);
  });
};

// Load and display incidents
const loadIncidents = () => {
  const q = query(
    collection(db, "incident-reports"),
    orderBy("timestamp", "desc")
  );

  onSnapshot(q, (snapshot) => {
    // Remove loader once data is loaded
    loader.remove();

    allIncidents = snapshot.docs;
    populateIncidentTypeFilter(snapshot.docs);
    displayCurrentPage();
  });
};
const displayCurrentPage = () => {
    const tbody = incidentsTable.querySelector("tbody");
    tbody.innerHTML = "";

    const filteredIncidents = filterIncidents(allIncidents);
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);

    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevPage').disabled = currentPage === 1;
    document.getElementById('nextPage').disabled = currentPage === totalPages;

    const start = (currentPage - 1) * itemsPerPage;
    const paginatedIncidents = filteredIncidents.slice(start, start + itemsPerPage);

    paginatedIncidents.forEach((doc) => {
        const data = doc.data();
        const tr = document.createElement("tr");

        tr.innerHTML = `
            <td>${formatDate(data.timestamp)}</td>
            <td>${data.storeNumber}</td>
            <td class="incident-types">${createIncidentTypeBadges(data.incidentTypes)}</td>
            <td class="details-cell" onclick="window.showDetails('${encodeURIComponent(data.details)}')">${data.details}</td>
            <td class="status-${data.status}">${data.status}</td>
            <td class="actions">
                <button onclick="window.updateStatus('${doc.id}', '${data.status === "pending" ? "resolved" : "pending"}')" class="status-button">
                    ${data.status === "pending" ? "Mark Resolved" : "Mark Pending"}
                </button>
            </td>
        `;

        tbody.appendChild(tr);
    });
};

const filterIncidents = (incidents) => {
    const dateValue = dateFilter.value;
    const statusValue = statusFilter.value;
    const storeValue = storeFilter.value.toLowerCase();
    const typeValue = incidentTypeFilter.value;

    return incidents.filter((doc) => {
        const data = doc.data();
        const date = data.timestamp.toDate();
        let show = true;

        if (dateValue !== "all") {
            const today = new Date();
            if (dateValue === "today" && date.toDateString() !== today.toDateString()) {
                show = false;
            } else if (dateValue === "week" && date < new Date(today - 7 * 24 * 60 * 60 * 1000)) {
                show = false;
            } else if (dateValue === "month" && date < new Date(today - 30 * 24 * 60 * 60 * 1000)) {
                show = false;
            }
        }

        if (statusValue !== "all" && data.status !== statusValue) {
            show = false;
        }

        if (storeValue && !data.storeNumber.toLowerCase().includes(storeValue)) {
            show = false;
        }

        if (typeValue !== "all" && !data.incidentTypes.includes(typeValue)) {
            show = false;
        }

        return show;
    });
};
// Show details modal
window.showDetails = (details) => {
  modalContent.textContent = decodeURIComponent(details);
  modal.style.display = "block";
};

// Update incident status
window.updateStatus = async (docId, newStatus) => {
  try {
    await updateDoc(doc(db, "incident-reports", docId), {
      status: newStatus,
    });
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Error updating status. Please try again.");
  }
};

// Filter handlers
const applyFilters = () => {
  currentPage = 1;
  displayCurrentPage();
};

// Add filter event listeners
dateFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);
storeFilter.addEventListener("input", applyFilters);
incidentTypeFilter.addEventListener("change", applyFilters);
document.getElementById('prevPage').addEventListener('click', () => {
    if (currentPage > 1) {
        currentPage--;
        displayCurrentPage();
    }
});

document.getElementById('nextPage').addEventListener('click', () => {
    const filteredIncidents = filterIncidents(allIncidents);
    const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
    if (currentPage < totalPages) {
        currentPage++;
        displayCurrentPage();
    }
});
// Add logout functionality
const logoutButton = document.createElement("button");
logoutButton.className = "button";
logoutButton.innerHTML = "<span>Logout</span>";
logoutButton.style.marginLeft = "10px";
logoutButton.onclick = () => {
  sessionStorage.removeItem("adminAuthenticated");
  window.location.href = "index.html"; // Changed from admin-login.html to index.html
};

// Add logout button to navbar
document.querySelector(".navbar").appendChild(logoutButton);

// Add logout button to navbar
document.querySelector('.navbar').appendChild(logoutButton);
function createCustomSelect(originalSelect) {
    const wrapper = document.createElement('div');
    wrapper.className = 'custom-select-wrapper';

    const customSelect = document.createElement('div');
    customSelect.className = 'custom-select';

    const trigger = document.createElement('div');
    trigger.className = 'custom-select__trigger';
    trigger.innerHTML = `<span>${originalSelect.options[originalSelect.selectedIndex].text}</span><div class="arrow"></div>`;

    const optionsList = document.createElement('div');
    optionsList.className = 'custom-options';

    // Create custom options
    Array.from(originalSelect.options).forEach(option => {
        const customOption = document.createElement('span');
        customOption.className = 'custom-option';
        customOption.setAttribute('data-value', option.value);
        customOption.textContent = option.text;

        if (option.selected) {
            customOption.classList.add('selected');
        }

        customOption.addEventListener('click', (e) => {
            // Update original select
            originalSelect.value = e.target.getAttribute('data-value');

            // Update custom select
            trigger.querySelector('span').textContent = e.target.textContent;
            optionsList.querySelector('.selected')?.classList.remove('selected');
            e.target.classList.add('selected');

            // Close dropdown
            customSelect.classList.remove('open');

            // Trigger change event on original select
            const event = new Event('change');
            originalSelect.dispatchEvent(event);
        });

        optionsList.appendChild(customOption);
    });

    // Toggle dropdown
    trigger.addEventListener('click', () => {
        customSelect.classList.toggle('open');
    });

    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        if (!wrapper.contains(e.target)) {
            customSelect.classList.remove('open');
        }
    });

    customSelect.appendChild(trigger);
    customSelect.appendChild(optionsList);
    wrapper.appendChild(customSelect);

    // Hide original select
    originalSelect.style.display = 'none';
    originalSelect.parentNode.insertBefore(wrapper, originalSelect);

    return wrapper;
}

// Initialize custom selects
document.addEventListener('DOMContentLoaded', () => {
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        createCustomSelect(select);
    });
});
// Initialize the dashboard
loadIncidents();
