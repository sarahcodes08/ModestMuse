// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  deleteDoc, 
  doc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

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
const tbody = document.querySelector("#cart table tbody");
const cartSubtotalElement = document.querySelector("#subtotal table tr:nth-child(1) td:nth-child(2)");
const shippingElement = document.querySelector("#subtotal table tr:nth-child(2) td:nth-child(2)");
const totalElement = document.querySelector("#subtotal table tr:nth-child(3) td:nth-child(2)");
const couponInput = document.querySelector("#coupon input");
const couponButton = document.querySelector("#coupon button");
const clearCartBtn = document.querySelector("#subtotal button");
const appliedCouponDiv = document.getElementById("appliedCoupon");

let userId = null;
let cartTotal = 0;
let appliedCoupon = "";

// Detect user authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    userId = user.uid;
    loadCartItems(userId);
    
    // Retrieve stored coupon from localStorage
    const savedCoupon = localStorage.getItem("appliedCoupon");
    if (savedCoupon) {
      appliedCoupon = savedCoupon;
      showCouponBadge(savedCoupon);
      updateCartTotal();
    }
    
  } else {
    userId = null;
    tbody.innerHTML = "";
    localStorage.removeItem("appliedCoupon"); // Remove coupon on logout
    updateCartTotal();
  }
});


// Load cart items from Firestore
async function loadCartItems(userId) {
  const querySnapshot = await getDocs(collection(db, "cartItems", userId, "items"));
  tbody.innerHTML = "";
  cartTotal = 0;
  
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const tr = document.createElement("tr");
    let numericPrice = parseInt(data.productPrice.replace(/[^0-9]/g, ""), 10);
    let subtotal = numericPrice * data.quantity;
    
    tr.innerHTML = `
      <td><a href="#" data-id="${docSnap.id}" class="remove-item"><i class="fa fa-times-circle"></i></a></td>
      <td><img src="${data.productImage}" style="width: 80px;"></td>
      <td>${data.productName}</td>
      <td>${data.productSize}</td>
      <td>Rs. ${numericPrice.toLocaleString()} PKR</td>
      <td>${data.quantity}</td>
      <td>Rs. ${subtotal.toLocaleString()} PKR</td>
    `;
    tbody.appendChild(tr);
    cartTotal += subtotal;
  });
  updateCartTotal();

  // Remove item event listener
  document.querySelectorAll(".remove-item").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.preventDefault();
      const itemId = e.target.closest("a").dataset.id;
      await deleteDoc(doc(db, "cartItems", userId, "items", itemId));
      loadCartItems(userId);
    });
  });
}

// Update Cart Total
function updateCartTotal() {
  let finalTotal = cartTotal;
  let shippingCost = cartTotal === 0 ? 0 : (cartTotal >= 2500 ? 0 : 250);
  shippingElement.textContent = `Rs. ${shippingCost.toLocaleString()} PKR`;

  let discount = 0;
  if (appliedCoupon === "WELCOME10") {
      discount = cartTotal * 0.10;
  } else if (appliedCoupon === "SAVE500") {
      discount = Math.min(500, cartTotal);
  }

  let discountRow = document.querySelector("#discountRow");
  if (discount > 0) {
      if (!discountRow) {
          discountRow = document.createElement("tr");
          discountRow.id = "discountRow";
          discountRow.innerHTML = `<td>Discount</td><td>- Rs. ${discount.toLocaleString()} PKR</td>`;
          
          // Ensure totalElement's parent exists before inserting
          if (totalElement && totalElement.parentNode) {
              totalElement.parentNode.insertAdjacentElement("beforebegin", discountRow);
          }
      } else {
          discountRow.innerHTML = `<td>Discount</td><td>- Rs. ${discount.toLocaleString()} PKR</td>`;
      }
  } else if (discountRow) {
      discountRow.remove();
  }

  finalTotal = Math.max(0, cartTotal - discount + shippingCost);
  cartSubtotalElement.textContent = `Rs. ${cartTotal.toLocaleString()} PKR`;
  totalElement.textContent = `Rs. ${finalTotal.toLocaleString()} PKR`;
}



// Apply Coupon Event
couponButton.addEventListener("click", () => {
  const couponCode = couponInput.value.trim().toUpperCase();
  if (["WELCOME10", "SAVE500"].includes(couponCode)) {
      appliedCoupon = couponCode;
      localStorage.setItem("appliedCoupon", appliedCoupon); // Store in localStorage
      showCouponBadge(couponCode);
      updateCartTotal();
  } else {
      alert("Invalid Coupon Code");
  }
});


// Clear Cart
clearCartBtn.addEventListener("click", async () => {
  if (!userId) return;
  const querySnapshot = await getDocs(collection(db, "cartItems", userId, "items"));
  querySnapshot.forEach(async (docSnap) => {
      await deleteDoc(doc(db, "cartItems", userId, "items", docSnap.id));
  });
  tbody.innerHTML = "";
  cartTotal = 0;
  appliedCoupon = "";
  appliedCouponDiv.innerHTML = "";
  localStorage.removeItem("appliedCoupon"); // Clear coupon on cart reset
  updateCartTotal();
});
// Function to Show Applied Coupon and Allow Removal
function showCouponBadge(couponCode) {
  appliedCoupon = couponCode;
  appliedCouponDiv.innerHTML = `
      <div class="coupon-badge">
          <i class="fa fa-tag"></i> ${couponCode}
          <span class="remove-coupon">&times;</span>
      </div>
  `;

  // Add event listener to remove coupon
  document.querySelector(".remove-coupon").addEventListener("click", () => {
      appliedCoupon = "";
      appliedCouponDiv.innerHTML = "";
      localStorage.removeItem("appliedCoupon"); // Remove from localStorage
      updateCartTotal();
  });
}

// Apply Coupon Event
couponButton.addEventListener("click", () => {
  const couponCode = couponInput.value.trim().toUpperCase();
  if (["WELCOME10", "SAVE500"].includes(couponCode)) {
      appliedCoupon = couponCode;
      localStorage.setItem("appliedCoupon", appliedCoupon); // Store in localStorage
      showCouponBadge(couponCode); // Ensure function is now defined before being called
      updateCartTotal();
  } else {
      alert("Invalid Coupon Code");
  }
});


// Clear Cart on Logout
document.querySelector("#logoutBtn").addEventListener("click", () => {
  tbody.innerHTML = "";
  auth.signOut();
});
function waitForElement(selector, callback) {
    const element = document.querySelector(selector);
    if (element) {
        callback(element);
    } else {
        setTimeout(() => waitForElement(selector, callback), 500);
    }
}


  document.addEventListener("DOMContentLoaded", function () {
      console.log("✅ DOM Loaded!");

      const confirmOrderBtn = document.getElementById("confirmOrderBtn");
      
      if (!confirmOrderBtn) {
          console.error("❌ Confirm Order Button NOT FOUND!");
          return;
      }

      console.log("✅ Confirm Order Button FOUND!");

      confirmOrderBtn.addEventListener("click", function () {
          console.log("🛒 Confirm Order Button Clicked!");
          alert("Button Clicked! 🚀");
      });
  });


document.addEventListener("DOMContentLoaded", function () {
  console.log("🚀 DOM fully loaded!");

  const confirmOrderBtn = document.getElementById("confirmOrderBtn");

  if (!confirmOrderBtn) {
      console.error("❌ Confirm Order button NOT FOUND! Check your HTML.");
      return; // Stop execution if the button is missing
  }

  console.log("✅ Confirm Order button found!");

  confirmOrderBtn.addEventListener("click", async (event) => {
      event.preventDefault();
      console.log("🛒 Confirm Order Button Clicked");
      alert("Order is being placed... Please wait.");

      // Get user email
      const userEmail = localStorage.getItem("userEmail") || "test@example.com";
      console.log("📧 User Email:", userEmail);

      if (!userEmail) {
          alert("⚠️ No email found. Please log in.");
          return;
      }

      // Send request to Google Apps Script
      try {
          console.log("📤 Sending request to Google Apps Script...");
          const response = await fetch("https://script.google.com/macros/s/AKfycbzd_mbeCGTPvxA44mm56pXDFU_dCzFP2oXppH2-YknrXFr6y0_EDQm3dLz6uWbSWNKPpg/exec", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ email: userEmail }),
          });

          console.log("⏳ Awaiting response...");
          const result = await response.json();
          console.log("✅ Server Response:", result);

          if (result.status === "success") {
              alert("🎉 Order confirmed! A confirmation email has been sent.");
          } else {
              alert("❌ Order failed. Please try again.");
          }
      } catch (error) {
          console.error("❌ Error:", error);
          alert("⚠️ Network error. Please try again.");
      }
  });
});
