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

// Get elements
const incidentsTable = document.getElementById("incidentsTable");
const dateFilter = document.getElementById("dateFilter");
const statusFilter = document.getElementById("statusFilter");
const storeFilter = document.getElementById("storeFilter");
const incidentTypeFilter = document.getElementById("incidentTypeFilter");
const modal = document.getElementById("detailsModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.querySelector(".close-modal");

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
    .map((type) => `<span class="incident-type">${type}</span>`)
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
    const tbody = incidentsTable.querySelector("tbody");
    tbody.innerHTML = "";

    // Populate incident type filter
    populateIncidentTypeFilter(snapshot.docs);

    snapshot.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${formatDate(data.timestamp)}</td>
                <td>${data.storeNumber}</td>
                <td class="incident-types">${createIncidentTypeBadges(
                  data.incidentTypes
                )}</td>
                <td class="details-cell" onclick="window.showDetails('${encodeURIComponent(
                  data.details
                )}')">${data.details}</td>
                <td class="status-${data.status}">${data.status}</td>
                <td class="actions">
                    <button onclick="window.updateStatus('${doc.id}', '${
        data.status === "pending" ? "resolved" : "pending"
      }')" class="status-button">
                        ${
                          data.status === "pending"
                            ? "Mark Resolved"
                            : "Mark Pending"
                        }
                    </button>
                </td>
            `;

      tbody.appendChild(tr);
    });

    applyFilters();
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
  const rows = incidentsTable.querySelectorAll("tbody tr");
  const dateValue = dateFilter.value;
  const statusValue = statusFilter.value;
  const storeValue = storeFilter.value.toLowerCase();
  const typeValue = incidentTypeFilter.value;

  rows.forEach((row) => {
    let show = true;
    const date = new Date(row.cells[0].textContent);
    const status = row.cells[4].textContent;
    const store = row.cells[1].textContent.toLowerCase();
    const types = row.cells[2].textContent;

    // Date filter
    if (dateValue !== "all") {
      const today = new Date();
      if (
        dateValue === "today" &&
        date.toDateString() !== today.toDateString()
      ) {
        show = false;
      } else if (
        dateValue === "week" &&
        date < new Date(today - 7 * 24 * 60 * 60 * 1000)
      ) {
        show = false;
      } else if (
        dateValue === "month" &&
        date < new Date(today - 30 * 24 * 60 * 60 * 1000)
      ) {
        show = false;
      }
    }

    // Status filter
    if (statusValue !== "all" && status !== statusValue) {
      show = false;
    }

    // Store filter
    if (storeValue && !store.includes(storeValue)) {
      show = false;
    }

    // Incident type filter
    if (typeValue !== "all" && !types.includes(typeValue)) {
      show = false;
    }

    row.style.display = show ? "" : "none";
  });
};

// Add filter event listeners
dateFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);
storeFilter.addEventListener("input", applyFilters);
incidentTypeFilter.addEventListener("change", applyFilters);

// Initialize the dashboard
loadIncidents();
