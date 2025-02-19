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
storeNumberInput.value = "274";
storeNumberInput.addEventListener("focus", function () {
  const len = this.value.length;
  this.setSelectionRange(len, len);
});

// Form validation functions
const validateStoreNumber = (value) => {
  const storeNumberRegex = /^\d{1,8}$/; // Accepts 1-8 digits
  return storeNumberRegex.test(value.trim());
};

const validateIncidentTypes = () => {
  return Array.from(checkboxes).some((checkbox) => checkbox.checked);
};

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
storeNumberInput.addEventListener("input", () => {
  if (!validateStoreNumber(storeNumberInput.value)) {
    showError(
      storeNumberInput,
      "Please enter a valid store number (1-5 digits)"
    );
  } else {
    clearError(storeNumberInput);
  }
});

// Form submission handler
incidentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submitted");

  // Validate fields
  let isValid = true;

  if (!validateStoreNumber(storeNumberInput.value)) {
    showError(
      storeNumberInput,
      "Please enter a valid store number (1-5 digits)"
    );
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

  // Get selected incident types
  const selectedIncidentTypes = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  try {
    console.log("Preparing data for submission");

    // Prepare the data
    const incidentData = {
      storeNumber: storeNumberInput.value.trim(),
      incidentTypes: selectedIncidentTypes,
      details: detailsInput.value.trim(),
      status: "pending",
      timestamp: serverTimestamp(),
    };

    console.log("Data to be submitted:", incidentData);

    // Add to Firebase
    const docRef = await addDoc(
      collection(db, "incident-reports"),
      incidentData
    );
    console.log("Document written with ID: ", docRef.id);

    // Show success notification
    showNotification("Incident report submitted successfully");

    // Reset form while preserving store number
    const storeNumber = storeNumberInput.value;
    incidentForm.reset();
    storeNumberInput.value = storeNumber;
    // Clear any existing error messages
    document
      .querySelectorAll(".error-message")
      .forEach((error) => error.remove());
  } catch (error) {
    console.error("Error submitting report:", error);
    showNotification("Error submitting report. Please try again.", 5000);
  }
});
