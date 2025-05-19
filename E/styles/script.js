const bar = document.getElementById('bar');
const close = document.getElementById('close');
const navbar = document.getElementById('navbar'); // Corrected selector

if (bar) {
    bar.addEventListener('click', () => {
        navbar.classList.add('active'); // Show navbar
    });
}

if (close) {
    close.addEventListener('click', () => {
        navbar.classList.remove('active'); // Hide navbar
    });
}



/* Product Page */
document.addEventListener("DOMContentLoaded", function() {
  // Select the main image by its class
  var MainImg = document.querySelector(".MainImg");
  var smallimg = document.getElementsByClassName("small-img");

  if (!MainImg) {
    console.error("MainImg element not found!");
    return;
  }

  if (smallimg.length === 0) {
    console.error("No small images found!");
    return;
  }

  // Loop over each small image and attach a click listener
  for (let i = 0; i < smallimg.length; i++) {
    smallimg[i].addEventListener("click", function() {
      MainImg.src = this.src;
    });
  }
});





  document.addEventListener("DOMContentLoaded", function () {
    function updateNavbar() {
      const userEmail = localStorage.getItem("userEmail"); // Get logged-in email

      const signupLink = document.getElementById("signup-link");
      const loginLink = document.getElementById("login-link");
      const userInfoElement = document.getElementById("user-info");
      const logoutButton = document.getElementById("logout");

      if (userEmail) {
        userInfoElement.textContent = userEmail; // Show email in navbar
        userInfoElement.style.display = "block"; 
        logoutButton.style.display = "block"; 
        if (signupLink) signupLink.style.display = "none";
        if (loginLink) loginLink.style.display = "none";
      } else {
        userInfoElement.textContent = "Guest";
        userInfoElement.style.display = "none"; 
        logoutButton.style.display = "none"; 
        if (signupLink) signupLink.style.display = "block";
        if (loginLink) loginLink.style.display = "block";
      }
    }

    updateNavbar(); // Run function when page loads
  });

