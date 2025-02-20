// Import Firebase configuration and functions
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
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

// Create notification element
const notification = document.createElement("div");
notification.className = "notification";
notification.style.display = "none";
document.body.appendChild(notification);

// Add styles for notification
const style = document.createElement("style");
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    background: linear-gradient(145deg, #36b54a, #00c1d4);
    color: white;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    font-family: 'Inter', sans-serif;
    font-size: 14px;
    z-index: 1000;
    opacity: 0;
    transform: translateY(-20px);
    transition: all 0.3s ease;
  }

  .notification.show {
    opacity: 1;
    transform: translateY(0);
  }

  .notification.hide {
    opacity: 0;
    transform: translateY(-20px);
  }
`;
document.head.appendChild(style);

// Function to show notification
const showNotification = (message, duration = 3000) => {
  notification.textContent = message;
  notification.style.display = "block";
  setTimeout(() => notification.classList.add("show"), 10);

  setTimeout(() => {
    notification.classList.add("hide");
    notification.classList.remove("show");
    setTimeout(() => {
      notification.style.display = "none";
      notification.classList.remove("hide");
    }, 300);
  }, duration);
};

// Get form elements
const incidentForm = document.getElementById("incidentForm");
const storeNumberInput = document.getElementById("storeNumber");
const detailsInput = document.getElementById("details");
const checkboxes = document.querySelectorAll('input[name="incidentType"]');

// Set initial store number value and position cursor at the end
storeNumberInput.addEventListener("focus", function () {
  const len = this.value.length;
  this.setSelectionRange(len, len);
});

// Form validation functions
const validateStoreNumber = (value) => {
  const storeNumberRegex = /^\d{7}$/; // Must be exactly 7 digits
  return storeNumberRegex.test(value.trim());
};
// Real-time validation for store number
storeNumberInput.addEventListener("input", (e) => {
  // Only allow digits
  e.target.value = e.target.value.replace(/\D/g, '');

  // Limit to 7 digits
  if (e.target.value.length > 7) {
    e.target.value = e.target.value.slice(0, 7);
  }

  if (!validateStoreNumber(storeNumberInput.value)) {
    showError(storeNumberInput, "Please enter a 7-digit store number");
  } else {
    clearError(storeNumberInput);
  }
});
const validateIncidentTypes = () => {
  return Array.from(checkboxes).some((checkbox) => checkbox.checked);
};
// Add this function after your other validation functions


// Clear warning message function


// Add event listener for details input

// Show error message
const showError = (element, message) => {
  let errorDiv = element.nextElementSibling;
  if (!errorDiv || !errorDiv.classList.contains("error-message")) {
    errorDiv = document.createElement("div");
    errorDiv.classList.add("error-message");
    errorDiv.style.color = "#ff4444";
    errorDiv.style.fontSize = "12px";
    errorDiv.style.marginTop = "4px";
    element.parentNode.insertBefore(errorDiv, element.nextSibling);
  }
  errorDiv.textContent = message;
  element.style.borderColor = "#ff4444";
};

// Clear error message
const clearError = (element) => {
  const errorDiv = element.nextElementSibling;
  if (errorDiv && errorDiv.classList.contains("error-message")) {
    errorDiv.remove();
  }
  element.style.borderColor = "#414141";
};

// Real-time validation for store number only

// Prevent user from deleting "274"


// Form submission handler
// Add styles for the confirmation dialog
const modalStyle = document.createElement("style");
modalStyle.textContent = `
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .modal-overlay.show {
    opacity: 1;
  }

  .modal-content {
    background: linear-gradient(#212121, #212121) padding-box,
                linear-gradient(145deg, transparent 35%, #e81cff, #40c9ff) border-box;
    border: 2px solid transparent;
    border-radius: 16px;
    padding: 24px;
    width: 90%;
    max-width: 400px;
    color: white;
    transform: translateY(-20px);
    transition: transform 0.3s ease;
  }

  .modal-overlay.show .modal-content {
    transform: translateY(0);
  }

  .modal-title {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 16px;
    color: #fff;
  }

  .modal-message {
    font-size: 14px;
    margin-bottom: 24px;
    color: #9e9e9e;
  }

  .modal-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
  }

  .modal-button {
    padding: 10px 20px;
    border-radius: 8px;
    font-size: 14px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.3s ease;
    background: #313131;
    border: 1px solid #414141;
    color: #9e9e9e;
  }

  .modal-button:hover {
    background: #e81cff;
    border-color: #e81cff;
    color: #fff;
    box-shadow: 0 0 15px rgba(232, 28, 255, 0.3);
  }

  .modal-button.confirm {
    background: linear-gradient(135deg, #36b54a, #00c1d4);
    border: none;
    color: white;
  }
`;
document.head.appendChild(modalStyle);

// Create modal elements
const createModal = () => {
  const modal = document.createElement('div');
  modal.className = 'modal-overlay';
  modal.innerHTML = `
    <div class="modal-content">
      <div class="modal-title">Confirm Submission</div>
      <div class="modal-message">You haven't provided any details. Are you sure you want to continue?</div>
      <div class="modal-buttons">
        <button class="modal-button" data-action="cancel">Cancel</button>
        <button class="modal-button confirm" data-action="confirm">Continue</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);
  return modal;
};

// Show modal function
const showConfirmationDialog = () => {
  return new Promise((resolve) => {
    const modal = createModal();

    // Animation frame for smooth transition
    requestAnimationFrame(() => {
      modal.classList.add('show');
    });

    const handleClick = (e) => {
      const action = e.target.dataset.action;
      if (action) {
        modal.classList.remove('show');
        setTimeout(() => {
          modal.remove();
        }, 300);
        resolve(action === 'confirm');
      }
    };

    modal.addEventListener('click', handleClick);
  });
};

// Modify the validateDetails function
const validateDetails = async (details) => {
  if (!details.trim()) {
    return await showConfirmationDialog();
  }
  return true;
};

// Update form submission handler
incidentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submitted");
  document.querySelectorAll(".error-message").forEach((msg) => msg.remove());

  // Validate fields
  let isValid = true;

  if (!validateStoreNumber(storeNumberInput.value)) {
    showError(storeNumberInput, "Please enter 7 digits for the store number");
    isValid = false;
  }

  if (!validateIncidentTypes()) {
    const incidentTypeSection = document.querySelector(".checkbox-container");
    showError(incidentTypeSection, "Please select at least one incident type");
    isValid = false;
  }

  if (!isValid) {
    console.log("Validation failed");
    return;
  }

  // Check details with confirmation dialog
  const shouldProceed = await validateDetails(detailsInput.value);
  if (!shouldProceed) {
    return;
  }

  try {
    console.log("Preparing data for submission");

    // Prepare the data
    const incidentData = {
      storeNumber: storeNumberInput.value.trim(),
      incidentTypes: Array.from(checkboxes)
        .filter((checkbox) => checkbox.checked)
        .map((checkbox) => checkbox.value),
      details: detailsInput.value.trim(),
      status: "pending",
      timestamp: serverTimestamp(),
    };

    console.log("Data to be submitted:", incidentData);

    // Add to Firebase
    const docRef = await addDoc(collection(db, "incident-reports"), incidentData);
    console.log("Document written with ID: ", docRef.id);

    // Show success notification
    showNotification("Incident report submitted successfully");

    // Reset form while preserving store number
    const storeNumber = storeNumberInput.value;
    incidentForm.reset();
    storeNumberInput.value = storeNumber;

    // Clear any existing error messages
    document.querySelectorAll(".error-message").forEach(error => error.remove());
  } catch (error) {
    console.error("Error submitting report:", error);
    showNotification("Error submitting report. Please try again.", 5000);
  }
});
