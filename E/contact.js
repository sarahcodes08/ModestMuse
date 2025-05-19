

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
firebase.initializeApp(firebaseConfig);

// Contact Form Submission Handler
document.querySelector('.contact-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Prevent default form submission

  // Get form data
  const formData = {
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    message: document.getElementById('message').value
  };

  // Validate form data (optional)
  if (!formData.name || !formData.email || !formData.phone || !formData.message) {
    alert("Please fill out all fields.");
    return;
  }

  // Send data to Firebase Function
  fetch('https://us-central1-e-commerce-xnutech.cloudfunctions.net/sendContactForm', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(formData),
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === '200') {
      alert('Your message has been sent!');
      document.querySelector('.contact-form').reset(); // Reset form
    } else {
      alert('Error: ' + data.message);
    }
  })
  .catch(error => {
    alert('Error: ' + error.message);
  });
});
