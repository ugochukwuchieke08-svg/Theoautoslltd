// ===============================
// FIREBASE INIT
// ===============================
const firebaseConfig = {
  apiKey: "AIzaSyAtllt4jfm3CFJfBY-SxQhZkyfLeP3M8P4",
  authDomain: "theo-autos.firebaseapp.com",
  projectId: "theo-autos",
  storageBucket: "theo-autos.firebasestorage.app",
  messagingSenderId: "168232129815",
  appId: "1:168232129815:web:8cb6094b1f461564671352",
};

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

const auth = firebase.auth();
const db = firebase.firestore();


// ===============================
// LOGIN
// ===============================
function login() {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  if (!email || !password) {
    alert("Enter email and password");
    return;
  }

  auth.signInWithEmailAndPassword(email, password)
    .then(() => {
      document.getElementById("login-box").style.display = "none";
      document.getElementById("admin-panel").style.display = "block";
      console.log("Logged in");
    })
    .catch(err => {
      console.error(err);
      alert(err.message);
    });
}


// ===============================
// CLOUDINARY UPLOAD
// ===============================
async function uploadImage(file) {
  try {
    const formData = new FormData();

    formData.append("file", file);
    formData.append("upload_preset", "theo-upload");

    const response = await fetch(
      "https://api.cloudinary.com/v1_1/du6e7pzwg/image/upload",
      {
        method: "POST",
        body: formData
      }
    );

    const data = await response.json();

    console.log("Cloudinary:", data);

    if (!data.secure_url) {
      throw new Error("Image upload failed");
    }

    return data.secure_url;

  } catch (error) {
    console.error("Upload error:", error);
    return null;
  }
}


// ===============================
// UPLOAD CAR
// ===============================
async function uploadCar() {
    const btn = document.getElementById("uploadBtn");
const status = document.getElementById("uploadStatus");

btn.disabled = true;
status.innerText = "Uploading...";
  console.log("UPLOAD STARTED");

  const make = document.getElementById("make").value.trim();
  const model = document.getElementById("model").value.trim();
  const year = document.getElementById("year").value;
  const price = document.getElementById("price").value;
  const DownPayment = document.getElementById("down payment").value;
  const mileage = document.getElementById("mileage").value;
  const fuel = document.getElementById("fuel").value;
  const transmission = document.getElementById("transmission").value;
  const files = document.getElementById("images").files;

  // VALIDATION
  if (!make || !model || !year || !price || !DownPayment) {
    alert("Fill all required fields");
    return;
  }

  if (!auth.currentUser) {
    alert("Login first");
    return;
  }

  if (!files || files.length === 0) {
    alert("Select at least one image");
    return;
  }

  let imageUrls = [];

  for (let file of files) {
    const url = await uploadImage(file);

    if (url) {
      imageUrls.push(url);
    }
  }

  if (imageUrls.length === 0) {
    alert("All image uploads failed");
    return;
  }

  try {
    await db.collection("cars").add({
      make,
      model,
      year: Number(year),
      price: Number(price),
      DownPayment: Number(DownPayment),
      mileage: mileage || "",
      fuel: fuel || "",
      transmission: transmission || "",
      images: imageUrls,
      createdAt: new Date()
    });

    alert("Car uploaded successfully");

    btn.disabled = false;
    status.innerText = "Upload complete!";

    // RESET FORM
    document.querySelectorAll("input").forEach(input => input.value = "");

  } catch (err) {
    console.error("Firestore error:", err);
    alert("Failed to save car");
  }
}


// ===============================
// GLOBAL ACCESS (IMPORTANT)
// ===============================
window.login = login;
window.uploadCar = uploadCar;
