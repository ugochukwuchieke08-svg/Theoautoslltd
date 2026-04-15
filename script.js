console.log("JS LOADED");

// ===============================
// FIREBASE INIT (SAFE + CLEAN)
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAtllt4jfm3CFJfBY-SxQhZkyfLeP3M8P4",
  authDomain: "theo-autos.firebaseapp.com",
  projectId: "theo-autos",
  storageBucket: "theo-autos.firebasestorage.app",
  messagingSenderId: "168232129815",
  appId: "1:168232129815:web:8cb6094b1f461564671352",
  measurementId: "G-QL8T9KP457"
};

// Prevent duplicate init
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();

// ===============================
// GLOBAL STATE
// ===============================
let allCars = [];
let currentCar = null;
let currentIndex = 0;

// ===============================
// REALTIME FETCH (BEST METHOD)
// ===============================
function loadCars() {
  const container = document.getElementById("cars");
  container.innerHTML = "<p>Loading cars...</p>";

  db.collection("cars").onSnapshot(
    (snapshot) => {
      allCars = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      displayCars(allCars);
    },
    (error) => {
      console.error("Firestore error:", error);
      container.innerHTML = "<p>Failed to load cars.</p>";
    }
  );
}

// ===============================
// DISPLAY CARS
// ===============================
function displayCars(data) {
  const container = document.getElementById("cars");
  container.innerHTML = "";

  if (!data.length) {
    container.innerHTML = "<p>No cars available.</p>";
    return;
  }

  data.forEach(car => {
    const image = car.images?.[0] || "";

    const div = document.createElement("div");
    div.className = "car";

    div.innerHTML = `
      <img src="${image}" alt="${car.make} ${car.model}">
      <h3>${car.make} ${car.model}</h3>
      <p>Year: ${car.year}</p>
      <p>downpayment: ${car.downpayment}</p>
      <p>$${Number(car.price || 0).toLocaleString()}</p>
    `;

    div.onclick = () => openModal(car);
    container.appendChild(div);
  });
}

// ===============================
// OPEN MODAL
// ===============================
function openModal(car) {
  const modal = document.getElementById("car-modal");
  modal.classList.add("show");
  document.body.classList.add("no-scroll");

  currentCar = car;
  currentIndex = 0;

  const images = car.images?.length ? car.images : [""];

  document.getElementById("modal-title").innerText = `${car.make} ${car.model}`;
  document.getElementById("modal-year").innerText = `Year: ${car.year}`;
  document.getElementById("modal-price").innerText = `$${Number(car.price).toLocaleString()}`;
  document.getElementById("modal-downpaymnet").innerText = `$${Number(car.downpayment).toLocaleString()}`;
  document.getElementById("modal-mileage").innerText = `Mileage: ${car.mileage || "N/A"}`;
  document.getElementById("modal-fuel").innerText = `Fuel: ${car.fuel || "N/A"}`;
  document.getElementById("modal-transmission").innerText = `Transmission: ${car.transmission || "N/A"}`;

  const mainImage = document.getElementById("main-image");
  mainImage.src = images[0];

  const leftArrow = document.querySelector(".arrow.left");
  const rightArrow = document.querySelector(".arrow.right");

  leftArrow.onclick = () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    mainImage.src = images[currentIndex];
  };

  rightArrow.onclick = () => {
    currentIndex = (currentIndex + 1) % images.length;
    mainImage.src = images[currentIndex];
  };

  mainImage.ontouchstart = (e) => {
    mainImage.dataset.startX = e.touches[0].clientX;
  };

  mainImage.ontouchend = (e) => {
    const startX = Number(mainImage.dataset.startX);
    const endX = e.changedTouches[0].clientX;

    const diff = startX - endX;

    if (Math.abs(diff) > 50) {
      currentIndex = diff > 0
        ? (currentIndex + 1) % images.length
        : (currentIndex - 1 + images.length) % images.length;

      mainImage.src = images[currentIndex];
    }
  };

  document.getElementById("whatsapp-btn").onclick = () => {
    contactDealer(car);
  };
}

// ===============================
// CLOSE MODAL
// ===============================
function closeModal() {
  document.getElementById("car-modal").classList.remove("show");
  document.body.classList.remove("no-scroll");
}

// ===============================
// FILTER
// ===============================
function filterCars() {
  const min = Number(document.getElementById("min").value) || 0;
  const max = Number(document.getElementById("max").value) || Infinity;

  const filtered = allCars.filter(car => {
    return Number(car.price) >= min && Number(car.price) <= max;
  });

  displayCars(filtered);
}

// ===============================
// WHATSAPP
// ===============================
function contactDealer(car) {
  const text = `
🚗 CAR ENQUIRY

🚘 ${car.make} ${car.model} (${car.year})
💰 $${Number(car.price).toLocaleString()}
  `;

  window.open(
    `https://wa.me/17042615400?text=${encodeURIComponent(text)}`,
    "_blank"
  );
}

// ===============================
// MENU
// ===============================
function toggleMenu() {
  document.querySelector(".nav-links").classList.toggle("active");
}

// ===============================
// SCROLL EFFECT
// ===============================
window.addEventListener("scroll", () => {
  const header = document.querySelector("header");
  header.style.boxShadow =
    window.scrollY > 10 ? "0 5px 20px rgba(0,0,0,0.3)" : "none";
});

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  const closeBtn = document.querySelector(".close-btn");
  if (closeBtn) closeBtn.onclick = closeModal;

  window.onclick = (e) => {
    const modal = document.getElementById("car-modal");
    if (e.target === modal) closeModal();
  };

  const form = document.getElementById("booking-form");

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();

      const name = document.getElementById("name").value;
      const phone = document.getElementById("phone").value;
      const message = document.getElementById("message").value;

      const carText = currentCar
        ? `${currentCar.make} ${currentCar.model}`
        : "No car selected";

      const text = `
🚗 BOOKING REQUEST

👤 ${name}
📞 ${phone}
🚘 ${carText}
💬 ${message || "None"}
      `;

      window.open(
        `https://wa.me/17042615400?text=${encodeURIComponent(text)}`,
        "_blank"
      );
    });
  }

  loadCars();
});

 const faqItems = document.querySelectorAll(".faq-item");

  faqItems.forEach(item => {
    item.querySelector(".faq-question").addEventListener("click", () => {
      item.classList.toggle("active");

      faqItems.forEach(other => {
        if (other !== item) {
          other.classList.remove("active");
        }
      });
    });
  });

 function searchCars() {
  const input = document.getElementById("searchInput").value.toLowerCase().trim();

  if (!input) {
    displayCars(allCars);
    return;
  }

  const results = allCars.filter(car => {
    const make = (car.make || "").toLowerCase();
    const model = (car.model || "").toLowerCase();

    return make.includes(input) || model.includes(input);
  });

  displayCars(results);
}

function revealOnScroll() {
  const reveals = document.querySelectorAll(".reveal");

  reveals.forEach((el) => {
    const windowHeight = window.innerHeight;
    const elementTop = el.getBoundingClientRect().top;

    const visiblePoint = 100;

    if (elementTop < windowHeight - visiblePoint) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", revealOnScroll);

// run once on load
revealOnScroll();
