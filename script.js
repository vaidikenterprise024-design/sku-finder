/************* 🔥 FIREBASE CONFIG *************/
/* 🔴 REPLACE THIS WITH YOUR OWN FIREBASE CONFIG */
const firebaseConfig = {
  apiKey: "AIzaSyD-DvWQKy0Zfp8WecOpuLdal4V0mIdXgVw",
  authDomain: "sku-finder-abd77.firebaseapp.com",
  projectId: "sku-finder-abd77",
  storageBucket: "sku-finder-abd77.firebasestorage.app",
  messagingSenderId: "1025694868300",
  appId: "1:1025694868300:web:10a0090ff07296f64a25e9"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();
/*********************************************/

let skuData = [];
let editIndex = null;
let scanTarget = "";

/* REAL-TIME LOAD */
db.collection("skus").onSnapshot(snapshot => {
  skuData = [];
  snapshot.forEach(doc => {
    skuData.push({ id: doc.id, ...doc.data() });
  });
  renderList();
});

/* RENDER */
function renderList(data = skuData) {
  list.innerHTML = "";
  data.forEach((item, index) => {
    list.innerHTML += `
      <div class="card">
        <img src="${item.image}" onclick="viewImage('${item.image}')">
        <div class="card-text">
          <b>${item.sku}</b>
          <small>${item.product}</small>
        </div>
        <div class="card-actions">
          <button onclick="editSKU(${index})">✏️</button>
          <button onclick="deleteSKU(${index})">🗑</button>
        </div>
      </div>
    `;
  });
}

/* SEARCH */
function searchSKU() {
  const val = searchInput.value.toLowerCase();
  renderList(
    skuData.filter(i =>
      i.sku.toLowerCase().includes(val) ||
      i.product.toLowerCase().includes(val)
    )
  );
}

/* IMAGE VIEW */
function viewImage(src) {
  popupImg.src = src;
  imagePopup.classList.remove("hidden");
}
function closeImage() {
  imagePopup.classList.add("hidden");
}

/* ADD / EDIT */
function openAdd() {
  editIndex = null;
  popupTitle.innerText = "Add SKU";
  skuInput.value = "";
  productInput.value = "";
  imageInput.value = "";
  addPopup.classList.remove("hidden");
}
function closeAdd() {
  addPopup.classList.add("hidden");
}
function editSKU(index) {
  editIndex = index;
  popupTitle.innerText = "Edit SKU";
  skuInput.value = skuData[index].sku;
  productInput.value = skuData[index].product;
  addPopup.classList.remove("hidden");
}

/* SAVE */
function saveSKU() {
  const sku = skuInput.value;
  const product = productInput.value;
  const img = imageInput.files[0];

  if (editIndex !== null) {
    if (img) {
      const r = new FileReader();
      r.onload = () => {
        db.collection("skus").doc(skuData[editIndex].id).update({
          sku, product, image: r.result
        });
        closeAdd();
      };
      r.readAsDataURL(img);
    } else {
      db.collection("skus").doc(skuData[editIndex].id).update({ sku, product });
      closeAdd();
    }
  } else {
    if (!img) return alert("Select image");
    const r = new FileReader();
    r.onload = () => {
      db.collection("skus").add({ sku, product, image: r.result });
      closeAdd();
    };
    r.readAsDataURL(img);
  }
}

/* DELETE */
function deleteSKU(index) {
  if (confirm("Delete this SKU?")) {
    db.collection("skus").doc(skuData[index].id).delete();
  }
}

/* OCR SCAN */
function scanText(target) {
  scanTarget = target;
  ocrCamera.click();
}

ocrCamera.onchange = e => {
  const file = e.target.files[0];
  if (!file) return;

  Tesseract.recognize(file, "eng").then(res => {
    const text = res.data.text.replace(/\n/g, " ").trim();
    if (scanTarget === "sku") skuInput.value = text;
    if (scanTarget === "product") productInput.value = text;
  });
};

