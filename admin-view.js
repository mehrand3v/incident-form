import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCXQZFYZfq4um2FiGn8EVzzBbzu64S6TqA",
  authDomain: "signin-azeem.firebaseapp.com",
  projectId: "signin-azeem",
  storageBucket: "signin-azeem.firebaseapp.com",
  messagingSenderId: "761268740990",
  appId: "1:761268740990:web:45df375c4fd2332133492f",
  measurementId: "G-23PRYF0YR6",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const tableContainer = document.querySelector(".table-container");
const loader = document.createElement("div");
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
const confirmModal = document.getElementById("confirmModal");
const confirmYesBtn = document.getElementById("confirmYes");
const confirmNoBtn = document.getElementById("confirmNo");
let currentPage = 1;
const itemsPerPage = 10;
let allIncidents = [];
// Modal handlers
closeModal.onclick = () => (modal.style.display = "none");
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
  }
  if (event.target === confirmModal) {
    confirmModal.style.display = "none";
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
  if (!Array.isArray(types)) {
    console.error("Invalid incident types:", types);
    return "";
  }
  return types
    .map((type) => {
      // Keep the type exactly as it is in the database for data-type attribute
      return `<div class="incident-type" data-type="${type.toLowerCase()}">${type}</div>`;
    })
    .join("");
};

// Populate incident type filter
const populateIncidentTypeFilter = (incidents) => {
  const types = new Set();
  incidents.forEach((doc) => {
    const data = doc.data();
    if (Array.isArray(data.incidentTypes)) {
      data.incidentTypes.forEach((type) => {
        // Skip harassment type
        if (type && type.toLowerCase() !== "harassment") {
          types.add(type.trim());
        }
      });
    }
  });

  incidentTypeFilter.innerHTML = '<option value="all">All Types</option>';
  [...types].sort().forEach((type) => {
    const option = document.createElement("option");
    option.value = type.toLowerCase();
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
  // Update record count display
  const recordCountElement = document.getElementById("recordCount");
  if (recordCountElement) {
    recordCountElement.textContent = filteredIncidents.length;
  }
  document.getElementById("currentPage").textContent = currentPage;
  document.getElementById("totalPages").textContent = totalPages;
  document.getElementById("prevPage").disabled = currentPage === 1;
  document.getElementById("nextPage").disabled = currentPage === totalPages;

  const start = (currentPage - 1) * itemsPerPage;
  const paginatedIncidents = filteredIncidents.slice(
    start,
    start + itemsPerPage
  );

 paginatedIncidents.forEach((doc) => {
   const data = doc.data();
   const tr = document.createElement("tr");

tr.innerHTML = `
    <td>${formatDate(data.timestamp)}</td>
    <td style="color:#c587cc;">${data.storeNumber}</td>
    <td class="incident-types">${createIncidentTypeBadges(
      data.incidentTypes
    )}</td>
    <td class="details-cell" onclick="window.showDetails('${encodeURIComponent(
      data.details
    )}')">${data.details}</td>
    <td>${data.status}</td>
    <td class="police-report-cell"></td>
`;

   tbody.appendChild(tr);

   // Initialize police report cell
   const policeReportCell = tr.querySelector(".police-report-cell");
   makePoliceReportEditable(policeReportCell, doc.id, data.policeReport);
 });
};

const filterIncidents = (incidents) => {
  const dateValue = dateFilter.value;
  const statusValue = statusFilter.value;
  const storeValue = storeFilter.value.toLowerCase();
  const typeValue = incidentTypeFilter.value.toLowerCase();

  return incidents.filter((doc) => {
    const data = doc.data();
    const date = data.timestamp.toDate();
    let show = true;

    // Date filter
    if (dateValue !== "all") {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      switch (dateValue) {
        case "today":
          const todayEnd = new Date(today);
          todayEnd.setHours(23, 59, 59, 999);
          show = date >= today && date <= todayEnd;
          break;
        case "week":
          const weekAgo = new Date(today);
          weekAgo.setDate(weekAgo.getDate() - 7);
          show = date >= weekAgo;
          break;
        case "month":
          const monthAgo = new Date(today);
          monthAgo.setDate(monthAgo.getDate() - 30);
          show = date >= monthAgo;
          break;
      }
    }

    // Status filter
    if (statusValue !== "all" && data.status !== statusValue) {
      show = false;
    }

    // Store filter
    if (
      storeValue &&
      !data.storeNumber.toString().toLowerCase().includes(storeValue)
    ) {
      show = false;
    }

    // Incident type filter
    if (typeValue !== "all") {
      show =
        Array.isArray(data.incidentTypes) &&
        data.incidentTypes.some((type) => type.toLowerCase() === typeValue);
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


// Confirm delete operation


// Delete incident record


// Create and show notification
// Close notification with animation


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
document.getElementById("prevPage").addEventListener("click", () => {
  if (currentPage > 1) {
    currentPage--;
    displayCurrentPage();
  }
});

document.getElementById("nextPage").addEventListener("click", () => {
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

// Custom select implementation
function createCustomSelect(originalSelect) {
  const wrapper = document.createElement("div");
  wrapper.className = "custom-select-wrapper";

  const customSelect = document.createElement("div");
  customSelect.className = "custom-select";

  const trigger = document.createElement("div");
  trigger.className = "custom-select__trigger";
  trigger.innerHTML = `<span>${
    originalSelect.options[originalSelect.selectedIndex].text
  }</span><div class="arrow"></div>`;

  const optionsList = document.createElement("div");
  optionsList.className = "custom-options";

  // Create custom options
  Array.from(originalSelect.options).forEach((option) => {
    const customOption = document.createElement("span");
    customOption.className = "custom-option";
    customOption.setAttribute("data-value", option.value);
    customOption.textContent = option.text;

    if (option.selected) {
      customOption.classList.add("selected");
    }

    customOption.addEventListener("click", (e) => {
      // Update original select
      originalSelect.value = e.target.getAttribute("data-value");

      // Update custom select
      trigger.querySelector("span").textContent = e.target.textContent;
      optionsList.querySelector(".selected")?.classList.remove("selected");
      e.target.classList.add("selected");

      // Close dropdown
      customSelect.classList.remove("open");

      // Trigger change event on original select
      const event = new Event("change");
      originalSelect.dispatchEvent(event);
    });

    optionsList.appendChild(customOption);
  });

  // Toggle dropdown
  trigger.addEventListener("click", () => {
    customSelect.classList.toggle("open");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", (e) => {
    if (!wrapper.contains(e.target)) {
      customSelect.classList.remove("open");
    }
  });

  customSelect.appendChild(trigger);
  customSelect.appendChild(optionsList);
  wrapper.appendChild(customSelect);

  // Hide original select
  originalSelect.style.display = "none";
  originalSelect.parentNode.insertBefore(wrapper, originalSelect);

  return wrapper;
}

// Observer to handle dynamically added options
const setupSelectObservers = () => {
  const selects = document.querySelectorAll("select");
  selects.forEach((select) => {
    // First create the custom select
    const customSelectWrapper = createCustomSelect(select);

    // Then observe changes to the original select
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.type === "childList") {
          // Rebuild the custom select
          customSelectWrapper.parentNode.removeChild(customSelectWrapper);
          createCustomSelect(select);
        }
      });
    });

    observer.observe(select, { childList: true });
  });
};
// PDF Report Generation
const setupPdfGeneration = () => {
  const pdfButton = document.getElementById("generatePdfBtn");
  if (!pdfButton) return;

  pdfButton.addEventListener("click", generatePdfReport);
};

const generatePdfReport = () => {
  // Apply current filters to get the data we want in the report
  const filteredData = filterIncidents(allIncidents);

  // Get current filter values for the report header
  const dateFilterText = dateFilter.options[dateFilter.selectedIndex].text;
  const statusFilterText =
    statusFilter.options[statusFilter.selectedIndex].text;
  const typeFilterText =
    incidentTypeFilter.options[incidentTypeFilter.selectedIndex].text;
  const storeFilterText = storeFilter.value || "All Stores";

  // Create PDF document
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF();

  // Add title
  doc.setFontSize(18);
  doc.setTextColor(128, 0, 128); // Purple color to match your theme
  doc.text("Incident Reports Dashboard", 14, 20);

  // Add filter information
  doc.setFontSize(10);
  doc.setTextColor(100, 100, 100);
  doc.text(`Generated on: ${new Date().toLocaleString()}`, 14, 30);
  doc.text(
    `Filters: ${dateFilterText} | ${statusFilterText} | ${typeFilterText} | Store: ${storeFilterText}`,
    14,
    35
  );
  doc.text(`Total Records: ${filteredData.length}`, 14, 40);

  // Convert data for the table
  const tableData = filteredData.map((doc) => {
    const data = doc.data();
    return [
      formatDate(data.timestamp),
      data.storeNumber,
      Array.isArray(data.incidentTypes) ? data.incidentTypes.join(", ") : "",
      data.details,
      data.policeReport || "N/A",
      data.status,
    ];
  });

  // Generate table
  doc.autoTable({
    head: [
      [
        "Date",
        "Store",
        "Incident Type",
        "Details",
        "Status",
        "Police Report #",
      ],
    ],
    body: tableData,
    startY: 45,
    styles: {
      fontSize: 8,
      cellPadding: 3,
    },
    columnStyles: {
      0: { cellWidth: 30 }, // Date
      1: { cellWidth: 20, overflow: "linebreak" }, // Store
      2: { cellWidth: 30 }, // Incident Types
      3: { cellWidth: 75 }, // Details
      4: { cellWidth: 20 }, // Status
    },
    headStyles: {
      fillColor: [232, 28, 255], // Your purple theme color
      textColor: [255, 255, 255],
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    rowPageBreak: "avoid",
    didDrawPage: function (data) {
      // Add page number
      doc.setFontSize(8);
      doc.text(
        `Page ${doc.internal.getNumberOfPages()}`,
        data.settings.margin.left,
        doc.internal.pageSize.height - 10
      );
    },
  });

  // Save the PDF
  doc.save(`incident-report-${new Date().toISOString().slice(0, 10)}.pdf`);
};
// Initialize the dashboard and custom selects when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  setupSelectObservers();
  loadIncidents();
  setupPdfGeneration();
});
// Add this function to handle police report editing
const makePoliceReportEditable = (cell, docId, currentValue) => {
    const text = currentValue || 'N/A';
    cell.innerHTML = `
        <div class="police-report-container">
            <span class="police-report-text" style="color: ${currentValue ? '#c587cc' : '#666'}">${text}</span>
            <button class="edit-button">Edit</button>
        </div>
    `;

    const editButton = cell.querySelector('.edit-button');
    editButton.onclick = (e) => {
        e.stopPropagation();
        const currentText = cell.querySelector('.police-report-text').textContent;

        cell.innerHTML = `
            <div class="police-report-container">
                <input type="text"
                    value="${currentText === 'N/A' ? '' : currentText}"
                    class="police-report-input"
                    placeholder="Enter report #">
                <button class="save-button">Save</button>
            </div>
        `;

        const input = cell.querySelector('.police-report-input');
        input.focus();

        const saveButton = cell.querySelector('.save-button');
        const saveChanges = async () => {
            const newValue = input.value.trim();

            try {
                const docRef = doc(db, "incident-reports", docId);
                await updateDoc(docRef, {
                    policeReport: newValue
                });

                createNotification('Police report number updated successfully', 'success');
                makePoliceReportEditable(cell, docId, newValue);
            } catch (error) {
                console.error("Error updating police report number:", error);
                createNotification('Failed to update police report number', 'error');
            }
        };

        saveButton.onclick = (e) => {
            e.stopPropagation();
            saveChanges();
        };

        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                saveChanges();
            }
        });
    };
};

// Add this function to create notifications
const createNotification = (message, type = 'success') => {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">${message}</div>
        <button class="notification-close">&times;</button>
    `;

    document.body.appendChild(notification);
    setTimeout(() => notification.classList.add('show'), 10);

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    }, 3000);

    notification.querySelector('.notification-close').onclick = () => {
        notification.classList.remove('show');
        setTimeout(() => notification.remove(), 300);
    };
};