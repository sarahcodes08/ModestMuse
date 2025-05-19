// Firebase Imports
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-auth.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc 
} from "https://www.gstatic.com/firebasejs/11.3.0/firebase-firestore.js";

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", function () {
  // Firebase Configuration
  const firebaseConfig = {
    apiKey: "AIzaSyB9wxrHyVi1LZYW2PbA-WN_6RFoEPjnXEE",
    authDomain: "e-commerce-xnutech.firebaseapp.com",
    projectId: "e-commerce-xnutech",
    storageBucket: "e-commerce-xnutech.appspot.com",
    messagingSenderId: "123436379643",
    appId: "1:123436379643:web:787528c59585c310a36f5e"
  };

  // Initialize Firebase, Auth, and Firestore
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  const db = getFirestore(app);

  /*====================================
  =            Login Code              =
  ====================================*/
  const submitBtn = document.getElementById('submit');
  if (submitBtn) {
    submitBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      
      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Fetch user's name from Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          const userName = userDoc.data().name;
          // Store both name and email in localStorage
          localStorage.setItem("userName", userName);
          localStorage.setItem("userEmail", user.email);
          console.log("Stored Name:", userName);
        } else {
          console.error("User data not found in Firestore.");
          localStorage.setItem("userEmail", user.email);
        }
        
        // alert("Logging in...");
        window.location.href = "hom.html";
      } catch (error) {
        alert(error.message);
      }
    });
  }

  /*====================================
  =          Registration Code         =
  ====================================*/
  const registerBtn = document.getElementById('_submit');
  if (registerBtn) {
    registerBtn.addEventListener("click", async function (event) {
      event.preventDefault();
      
      const name = document.getElementById('_name').value; // Ensure this input exists in your form
      const email = document.getElementById('_email').value;
      const password = document.getElementById('_password').value;
      
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Store user data in Firestore (create a document under "users" collection)
        await setDoc(doc(db, "users", user.uid), { 
          name: name, 
          email: email 
        });
        
        // alert("Account created successfully! Please log in.");
        // If your login and registration are in one page, you might switch the form view here.
        document.getElementById("login").click();
      } catch (error) {
        alert(error.message);
      }
    });
  }

  /*====================================
  =          Logout Code               =
  ====================================*/
  const logoutLink = document.getElementById("logout");
  if (logoutLink) {
    logoutLink.onclick = function (event) {
      event.preventDefault();
      signOut(auth).then(() => {
        localStorage.removeItem("userName");
        localStorage.removeItem("userEmail");
        updateNavbar(); // Update immediately if needed
        window.location.href = "hom.html";
      }).catch((error) => {
        console.error("Logout Error:", error);
      });
    };
  }

  /*====================================
  =       Navbar Update Function       =
  ====================================*/
  function updateNavbar() {
    // Retrieve stored name (and email as fallback)
    const storedName = localStorage.getItem("userName");
    const storedEmail = localStorage.getItem("userEmail");
    
    // Get navbar elements (ensure these IDs exist in both login.html and hom.html)
    const userInfoElement = document.getElementById("user-info");
    const loginLink = document.getElementById("login-link");
    const logoutElement = document.getElementById("logout");
    
    if (userInfoElement) {
      if (storedName) {
        userInfoElement.textContent = storedName;
        userInfoElement.style.display = "block";
        if (logoutElement) logoutElement.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
      } else if (storedEmail) {
        // Fallback (should not occur if name is stored properly)
        userInfoElement.textContent = storedEmail;
        userInfoElement.style.display = "block";
        if (logoutElement) logoutElement.style.display = "block";
        if (loginLink) loginLink.style.display = "none";
      } else {
        userInfoElement.textContent = "Guest";
        userInfoElement.style.display = "none";
        if (logoutElement) logoutElement.style.display = "none";
        if (loginLink) loginLink.style.display = "block";
      }
    }
  }

  /*====================================
  =       Password Reset Function       =
  ====================================*/
  // Select the "Forgot Password?" link
  const forgotPasswordLink = document.getElementById("forgot-password");

  if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener("click", function (event) {
          event.preventDefault();

          // Ask the user to enter their email
          const email = prompt("Enter your email to reset password:");

          if (email) {
              sendPasswordResetEmail(auth, email)
                  .then(() => {
                      alert("A password reset link has been sent to your email.");
                  })
                  .catch((error) => {
                      alert("Error: " + error.message);
                  });
          } else {
              alert("Please enter a valid email address.");
          }
      });
  }

  // If the navbar element exists on the page (e.g., hom.html), update it.
  if (document.getElementById("user-info")) {
    updateNavbar();
  }

  /*====================================
  =    Optional: Login/Registration Toggle    =
  ====================================*/
  // If you have a container that toggles between login and registration,
  // attach event listeners to switch views (this code runs only if the element exists).
  const container = document.getElementById("container");
  const regToggle = document.getElementById("register");
  const loginToggle = document.getElementById("login");
  if (container && regToggle && loginToggle) {
    regToggle.addEventListener("click", () => container.classList.add("active"));
    loginToggle.addEventListener("click", () => container.classList.remove("active"));
  }
});
