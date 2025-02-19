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

// Get form elements
const incidentForm = document.getElementById("incidentForm");
const storeNumberInput = document.getElementById("storeNumber");
const detailsInput = document.getElementById("details");
const checkboxes = document.querySelectorAll('input[name="incidentType"]');

// Form validation functions
const validateStoreNumber = (value) => {
  const storeNumberRegex = /^\d{1,5}$/; // Accepts 1-5 digits
  return storeNumberRegex.test(value.trim());
};

const validateDetails = (value) => {
  return value.trim().length >= 10; // Minimum 10 characters
};

const validateIncidentTypes = () => {
  return Array.from(checkboxes).some((checkbox) => checkbox.checked);
};

// Show error message
const showError = (element, message) => {
  // Create error div if it doesn't exist
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

// Real-time validation
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

detailsInput.addEventListener("input", () => {
  if (!validateDetails(detailsInput.value)) {
    showError(detailsInput, "Please enter at least 10 characters");
  } else {
    clearError(detailsInput);
  }
});

// Form submission handler
incidentForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  console.log("Form submitted"); // Debug log

  // Validate all fields
  let isValid = true;

  if (!validateStoreNumber(storeNumberInput.value)) {
    showError(
      storeNumberInput,
      "Please enter a valid store number (1-5 digits)"
    );
    isValid = false;
  }

  if (!validateDetails(detailsInput.value)) {
    showError(detailsInput, "Please enter at least 10 characters");
    isValid = false;
  }

  if (!validateIncidentTypes()) {
    // Show error near the incident type section
    const incidentTypeSection = document.querySelector(".checkbox-container");
    showError(incidentTypeSection, "Please select at least one incident type");
    isValid = false;
  }

  if (!isValid) {
    console.log("Validation failed"); // Debug log
    return;
  }

  // Get selected incident types
  const selectedIncidentTypes = Array.from(checkboxes)
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.value);

  try {
    console.log("Preparing data for submission"); // Debug log

    // Prepare the data
    const incidentData = {
      storeNumber: storeNumberInput.value.trim(),
      incidentTypes: selectedIncidentTypes,
      details: detailsInput.value.trim(),
      status: "pending", // Default status
      timestamp: serverTimestamp(),
    };

    console.log("Data to be submitted:", incidentData); // Debug log

    // Add to Firebase
    const docRef = await addDoc(
      collection(db, "incident-reports"),
      incidentData
    );
    console.log("Document written with ID: ", docRef.id); // Debug log

    // Show success message
    alert("Incident report submitted successfully!");
    // Reset form
    incidentForm.reset();
    // Clear any existing error messages
    document
      .querySelectorAll(".error-message")
      .forEach((error) => error.remove());
  } catch (error) {
    console.error("Error submitting report:", error);
    alert("Error submitting report. Please try again. Error: " + error.message);
  }
});
