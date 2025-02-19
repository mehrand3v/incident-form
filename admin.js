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

// Get table and filter elements
const incidentsTable = document.getElementById("incidentsTable");
const dateFilter = document.getElementById("dateFilter");
const statusFilter = document.getElementById("statusFilter");
const storeFilter = document.getElementById("storeFilter");

// Format date
const formatDate = (timestamp) => {
  if (!timestamp) return "N/A";
  const date = timestamp.toDate();
  return date.toLocaleDateString() + " " + date.toLocaleTimeString();
};

// Create incident type badges
const createIncidentTypeBadges = (types) => {
  return types
    .map((type) => `<span class="incident-type">${type}</span>`)
    .join("");
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

    snapshot.forEach((doc) => {
      const data = doc.data();
      const tr = document.createElement("tr");

      tr.innerHTML = `
                <td>${formatDate(data.timestamp)}</td>
                <td>${data.storeNumber}</td>
                <td class="incident-types">${createIncidentTypeBadges(
                  data.incidentTypes
                )}</td>
                <td>${data.details}</td>
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
  });
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

  rows.forEach((row) => {
    let show = true;
    const date = new Date(row.cells[0].textContent);
    const status = row.cells[4].textContent;
    const store = row.cells[1].textContent.toLowerCase();

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

    row.style.display = show ? "" : "none";
  });
};

// Add filter event listeners
dateFilter.addEventListener("change", applyFilters);
statusFilter.addEventListener("change", applyFilters);
storeFilter.addEventListener("input", applyFilters);

// Initialize the dashboard
loadIncidents();
