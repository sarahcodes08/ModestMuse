// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  getDoc, 
  setDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";
import { 
  getAuth, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9wxrHyVi1LZYW2PbA-WN_6RFoEPjnXEE",
  authDomain: "e-commerce-xnutech.firebaseapp.com",
  projectId: "e-commerce-xnutech",
  storageBucket: "e-commerce-xnutech.appspot.com",
  messagingSenderId: "123436379643",
  appId: "1:123436379643:web:787528c59585c310a36f5e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// DOM Elements
const accountContainer = document.getElementById("account-container");

// Function to get user details from Firestore
async function getUserDetails(userId) {
  const userDoc = doc(db, "users", userId);
  const userSnap = await getDoc(userDoc);
  return userSnap.exists() ? userSnap.data() : null;
}

// Function to display user details as text
function displayUserDetails(userData) {
  accountContainer.innerHTML = `
    <p><strong>Email:</strong> ${userData.email}</p>
    <p><strong>Name:</strong> ${userData.name || "Not Provided"}</p>
    <p><strong>Address:</strong> ${userData.address || "Not Provided"}</p>
    <p><strong>Phone:</strong> ${userData.phone || "Not Provided"}</p>
    <p><strong>City:</strong> ${userData.city || "Not Provided"}</p>
    <p><strong>Country:</strong> ${userData.country || "Not Provided"}</p>
    <p><strong>Payment Method:</strong> ${userData.payment || "Cash on Delivery"}</p>
    <button id="edit-btn">Edit</button>
  `;

  document.getElementById("edit-btn").addEventListener("click", () => {
    displayEditForm(userData);
  });
}

// Function to display an editable form
function displayEditForm(userData) {
  accountContainer.innerHTML = `
    <form id="account-form">
      <label>Email:</label>
      <input type="email" id="email" value="${userData.email}" disabled>
      
      <label>Name:</label>
      <input type="text" id="name" value="${userData.name || ""}" required>
      
      <label>Address:</label>
      <input type="text" id="address" value="${userData.address || ""}" required>
      
      <label>Phone:</label>
      <input type="tel" id="phone" value="${userData.phone || ""}" required>
      
      <label>City:</label>
      <input type="text" id="city" value="${userData.city || ""}" required>
      
      <label>Country:</label>
      <input type="text" id="country" value="${userData.country || ""}" required>
      
      <label>Payment Method:</label>
      <select id="payment">
        <option value="Cash on Delivery" selected>Cash on Delivery</option>
      </select>
      
      <button type="submit">Save</button>
    </form>
  `;

  // Save data on form submission
  document.getElementById("account-form").addEventListener("submit", async (e) => {
    e.preventDefault();

    const user = auth.currentUser;
    if (!user) return;

    const userId = user.uid;
    const updatedData = {
      email: user.email,
      name: document.getElementById("name").value,
      address: document.getElementById("address").value,
      phone: document.getElementById("phone").value,
      city: document.getElementById("city").value,
      country: document.getElementById("country").value,
      payment: document.getElementById("payment").value,
    };

    try {
      // Save to Firestore
      await setDoc(doc(db, "users", userId), updatedData, { merge: true });

      // ✅ Fetch updated data and display it
      const newUserData = await getUserDetails(userId);
      displayUserDetails(newUserData);
    } catch (error) {
      console.error("Error saving user details:", error);
    }
  });
}

// Listen for authentication state
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const userId = user.uid;

    // Fetch user details from Firestore
    const userData = await getUserDetails(userId);

    if (userData) {
      displayUserDetails(userData);
    } else {
      displayEditForm({ email: user.email });
    }
  }
});
