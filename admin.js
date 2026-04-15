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


async function uploadCar() {
  const btn = document.getElementById("uploadBtn");
  const status = document.getElementById("uploadStatus");

  btn.disabled = true;
  status.innerText = "Uploading...";

  try {
    const make = document.getElementById("make").value.trim();
    const model = document.getElementById("model").value.trim();
    const year = document.getElementById("year").value;
    const price = document.getElementById("price").value;
    const downpayment = document.getElementById("downpayment").value;
    const mileage = document.getElementById("mileage").value;
    const fuel = document.getElementById("fuel").value;
    const transmission = document.getElementById("transmission").value;
    const files = document.getElementById("images").files;

    // ✅ STRONG VALIDATION
    if (!make || !model || !year || !price || !downpayment) {
      throw new Error("Fill all required fields");
    }

    if (isNaN(price) || isNaN(downpayment)) {
      throw new Error("Price and down payment must be numbers");
    }

    if (Number(price) <= 0 || Number(downpayment) <= 0) {
      throw new Error("Values must be greater than 0");
    }

    if (!auth.currentUser) {
      throw new Error("Login first");
    }

    if (!files || files.length === 0) {
      throw new Error("Select at least one image");
    }

    // ✅ PARALLEL IMAGE UPLOAD (FAST)
    const uploadPromises = Array.from(files).map(file => uploadImage(file));
    const results = await Promise.all(uploadPromises);

    const imageUrls = results.filter(url => url);

    if (imageUrls.length === 0) {
      throw new Error("All image uploads failed");
    }

    if (imageUrls.length < files.length) {
      console.warn("Some images failed but continuing...");
    }

    // ✅ SAVE TO FIRESTORE
    await db.collection("cars").add({
      make,
      model,
      year: Number(year),
      price: Number(price),
      downpayment: Number(downpayment),
      mileage: mileage || "",
      fuel: fuel || "",
      transmission: transmission || "",
      images: imageUrls,
      createdAt: new Date()
    });

    alert("Car uploaded successfully");
    status.innerText = "Upload complete!";

    // ✅ CLEAN RESET (ONLY WHAT YOU NEED)
    document.getElementById("make").value = "";
    document.getElementById("model").value = "";
    document.getElementById("year").value = "";
    document.getElementById("price").value = "";
    document.getElementById("downpayment").value = "";
    document.getElementById("mileage").value = "";
    document.getElementById("fuel").value = "";
    document.getElementById("transmission").value = "";
    document.getElementById("images").value = "";

  } catch (err) {
    console.error(err);
    alert(err.message);
    status.innerText = "Upload failed";
  } finally {
    // ✅ ALWAYS RE-ENABLE BUTTON (NO MATTER WHAT)
    btn.disabled = false;
  }
}
window.login = login;
