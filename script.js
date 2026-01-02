let skuData = JSON.parse(localStorage.getItem("skuData")) || [];
let editIndex = null;
let scanTarget = "";

renderList();

// RENDER LIST
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

// SEARCH
function searchSKU() {
  const val = searchInput.value.toLowerCase();
  renderList(
    skuData.filter(i =>
      i.sku.toLowerCase().includes(val) ||
      i.product.toLowerCase().includes(val)
    )
  );
}

// IMAGE VIEW
function viewImage(src) {
  popupImg.src = src;
  imagePopup.classList.remove("hidden");
}

function closeImage() {
  imagePopup.classList.add("hidden");
}

// ADD / EDIT
function openAdd() {
  editIndex = null;
  popupTitle.innerText = "Add SKU";
  skuInput.value = "";
  productInput.value = "";
  imageInput.value = "";
  addPopup.classList.remove("hidden");
}

function editSKU(index) {
  editIndex = index;
  popupTitle.innerText = "Edit SKU";
  skuInput.value = skuData[index].sku;
  productInput.value = skuData[index].product;
  addPopup.classList.remove("hidden");
}

function closeAdd() {
  addPopup.classList.add("hidden");
}

// SAVE
function saveSKU() {
  const sku = skuInput.value;
  const product = productInput.value;
  const img = imageInput.files[0];

  if (editIndex !== null) {
    skuData[editIndex].sku = sku;
    skuData[editIndex].product = product;

    if (img) {
      const r = new FileReader();
      r.onload = () => {
        skuData[editIndex].image = r.result;
        finishSave();
      };
      r.readAsDataURL(img);
      return;
    }
    finishSave();
  } else {
    if (!img) return alert("Select image");
    const r = new FileReader();
    r.onload = () => {
      skuData.push({ sku, product, image: r.result });
      finishSave();
    };
    r.readAsDataURL(img);
  }
}

function finishSave() {
  localStorage.setItem("skuData", JSON.stringify(skuData));
  renderList();
  closeAdd();
}

// DELETE
function deleteSKU(index) {
  if (confirm("Delete this SKU?")) {
    skuData.splice(index, 1);
    localStorage.setItem("skuData", JSON.stringify(skuData));
    renderList();
  }
}

// OCR TEXT SCAN
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
