// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { getFirestore, collection, addDoc, doc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyB9wxrHyVi1LZYW2PbA-WN_6RFoEPjnXEE",
  authDomain: "e-commerce-xnutech.firebaseapp.com",
  projectId: "e-commerce-xnutech",
  storageBucket: "e-commerce-xnutech.appspot.com",
  messagingSenderId: "123436379643",
  appId: "1:123436379643:web:787528c59585c310a36f5e"
};

// Initialize Firebase and Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM loaded. Running cart.js");

  let userId = null;

  // Detect login status and set userId
  onAuthStateChanged(auth, (user) => {
    if (user) {
      userId = user.uid;
      console.log("User logged in:", userId);
      loadCartItems(userId);
    } else {
      userId = null;
      console.log("User not logged in. Cart will be empty.");
      document.querySelector("#cart table tbody").innerHTML = "";
    }
  });

  // Handle Quantity Buttons
  document.querySelectorAll(".normal2").forEach((button) => {
    button.addEventListener("click", function () {
      let quantityInput = this.closest('.quantity-wrapper').querySelector("input[type='number']");
      let currentVal = parseInt(quantityInput.value) || 1;
  
      if (this.querySelector("i").classList.contains("fa-minus")) {
        if (currentVal > 1) {
          quantityInput.value = currentVal - 1;
        }
      } else if (this.querySelector("i").classList.contains("fa-plus")) {
        quantityInput.value = currentVal + 1;
      }

      updateMinusButtonState(quantityInput);  // Update button state after every change
    });
  });

  // Ensure Minus Button State Reflects Current Value
  const quantityInput = document.querySelector("input[type='number']");
  const buttons = document.querySelectorAll("button.normal2");

  if (buttons.length === 2 && quantityInput) {
    const minusBtn = buttons[0];
    const plusBtn = buttons[1];

    // Update the state of the minus button based on quantity
    function updateMinusButtonState() {
      let currentVal = parseInt(quantityInput.value) || 1;
      minusBtn.disabled = currentVal <= 1;
      minusBtn.style.opacity = currentVal <= 1 ? 0.5 : 1;
      minusBtn.style.cursor = currentVal <= 1 ? "not-allowed" : "pointer";
    }

    // Event listeners for minus and plus buttons
    minusBtn.addEventListener("click", function () {
      let currentVal = parseInt(quantityInput.value);
      if (currentVal > 1) {
        quantityInput.value = currentVal - 1;
        updateMinusButtonState();  // Update state after decrement
      }
    });

    plusBtn.addEventListener("click", function () {
      let currentVal = parseInt(quantityInput.value);
      quantityInput.value = currentVal + 1;  // Always increment by 1
      updateMinusButtonState();  // Update state after increment
    });

    // Mouseover event for the minus button
    minusBtn.addEventListener("mouseover", function () {
      if (minusBtn.disabled) {
        minusBtn.style.cursor = "not-allowed"; // Prevent mouse pointer on hover
      }
    });

    updateMinusButtonState();  // Initial update of the minus button state
  } else {
    console.error("Quantity buttons or input field not found.");
  }

  // Handle "Add to Cart" button
  const addToCartButton = document.querySelector("#prod-details .single-pro-details button.normal");

  if (addToCartButton) {
    addToCartButton.addEventListener("click", async () => {
      if (!userId) {
        alert("Please log in to add items to the cart.");
        return;
      }

      const productName = document.querySelector("#prod-details .single-pro-details h4").textContent.trim();
      const productPrice = document.querySelector("#prod-details .single-pro-details h2").textContent.trim();
      const productSize = document.querySelector("#prod-details .single-pro-details select").value;
      const quantity = parseInt(quantityInput.value);
      const mainImgSrc = document.getElementById("MainImg").src;

      if (!productSize || productSize === "Select Size" || quantity <= 0) {
        alert("Please select a valid size and quantity greater than 0.");
        return;
      }

      const cartItem = {
        productName,
        productPrice,
        productSize,
        quantity,
        productImage: mainImgSrc,
        addedAt: new Date()
      };

      try {
        await addDoc(collection(db, "cartItems", userId, "items"), cartItem);
        console.log("Item added to cart.");
        alert("Item added to cart successfully!");
        loadCartItems(userId);
      } catch (error) {
        console.error("Error adding cart item:", error);
        alert("Failed to add item to cart. Please try again later.");
      }
    });
  } else {
    console.error("Add to Cart button not found. Check your selector.");
  }

  // Load Cart Items
  async function loadCartItems(userId) {
    const querySnapshot = await getDocs(collection(db, "cartItems", userId, "items"));
    const tbody = document.querySelector("#cart table tbody");
    tbody.innerHTML = "";

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td><a href="#" data-id="${docSnap.id}" class="remove-item"><i class="fa fa-times-circle"></i></a></td>
        <td><img src="${data.productImage}" style="width: 80px;"></td>
        <td>${data.productName}</td>
        <td>${data.productSize}</td>
        <td>${data.productPrice}</td>
        <td>${data.quantity}</td>
        <td>Rs. ${(parseInt(data.productPrice.replace(/[^0-9]/g, "")) * data.quantity).toLocaleString()} PKR</td>
      `;
      tbody.appendChild(tr);
    });

    document.querySelectorAll(".remove-item").forEach((btn) => {
      btn.addEventListener("click", async (e) => {
        e.preventDefault();
        const itemId = e.target.closest("a").dataset.id;
        await deleteDoc(doc(db, "cartItems", userId, "items", itemId));
        loadCartItems(userId);
      });
    });
  }

  // Clear Cart on Logout
  document.querySelector("#logoutBtn").addEventListener("click", () => {
    document.querySelector("#cart table tbody").innerHTML = "";
    auth.signOut();
  });
});
