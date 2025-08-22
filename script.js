// --- LOGIN ---
function login() {
  let user = document.getElementById("username").value;
  let pass = document.getElementById("password").value;
  if(user === "admin" && pass === "1234") {
    document.getElementById("loginPage").classList.add("hidden");
    document.getElementById("appPage").classList.remove("hidden");
    addRow();
  } else {
    alert("Invalid credentials! Try admin / 1234");
  }
}

// --- ADD/REMOVE ROW ---
function addRow() {
  let tbody = document.getElementById("itemsBody");
  let row = document.createElement("tr");
  row.innerHTML = `
    <td><input placeholder="Description"></td>
    <td><input type="number" value="1" min="1"></td>
    <td><input type="number" value="0" step="0.01"></td>
    <td>0</td>
    <td><button onclick="removeRow(this)">❌</button></td>`;
  tbody.appendChild(row);
}
function removeRow(btn) {
  btn.parentElement.parentElement.remove();
  updateTotals();
}

// --- CALCULATE TOTALS ---
function updateTotals() {
  let rows = document.querySelectorAll("#itemsBody tr");
  let subtotal = 0;
  rows.forEach(r => {
    let qty = parseFloat(r.cells[1].children[0].value) || 0;
    let price = parseFloat(r.cells[2].children[0].value) || 0;
    let total = qty * price;
    r.cells[3].textContent = total.toFixed(2);
    subtotal += total;
  });
  let tax = parseFloat(document.getElementById("tax").value) || 0;
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("taxDisplay").textContent = tax.toFixed(2);
  document.getElementById("grandTotal").textContent = (subtotal + tax).toFixed(2);
}
document.addEventListener("input", updateTotals);

// --- SAVE INVOICE (localStorage) ---
function saveInvoice() {
  let invoice = collectInvoice();
  let invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
  invoices.push(invoice);
  localStorage.setItem("invoices", JSON.stringify(invoices));
  alert("Invoice saved!");
}
function collectInvoice() {
  let invoiceNumber = "INV-" + Math.floor(Math.random()*10000);
  let date = new Date().toLocaleDateString();
  let items = [];
  document.querySelectorAll("#itemsBody tr").forEach(r => {
    items.push({
      desc: r.cells[0].children[0].value,
      qty: r.cells[1].children[0].value,
      price: r.cells[2].children[0].value,
      total: r.cells[3].textContent
    });
  });
  return {
    invoiceNumber, date,
    clientName: document.getElementById("clientName").value,
    clientEmail: document.getElementById("clientEmail").value,
    clientAddress: document.getElementById("clientAddress").value,
    items,
    subtotal: document.getElementById("subtotal").textContent,
    tax: document.getElementById("taxDisplay").textContent,
    grandTotal: document.getElementById("grandTotal").textContent
  };
}

// --- VIEW HISTORY ---
function viewHistory() {
  let invoices = JSON.parse(localStorage.getItem("invoices") || "[]");
  let tbody = document.getElementById("historyTable");
  tbody.innerHTML = "";
  invoices.forEach(inv => {
    let row = document.createElement("tr");
    row.innerHTML = `<td>${inv.invoiceNumber}</td><td>${inv.date}</td><td>${inv.clientName}</td><td>${inv.grandTotal}</td>`;
    tbody.appendChild(row);
  });
  document.getElementById("historyPage").classList.remove("hidden");
}

// --- PDF GENERATION ---
function generateInvoice() {
  const { jsPDF } = window.jspdf;
  let doc = new jsPDF();
  let inv = collectInvoice();

  doc.setFontSize(18);
  doc.text("Invoice", 90, 15);

  doc.setFontSize(11);
  doc.text(`Invoice No: ${inv.invoiceNumber}`, 14, 25);
  doc.text(`Date: ${inv.date}`, 150, 25);

  doc.text("Bill To:", 14, 40);
  doc.text(inv.clientName, 14, 47);
  doc.text(inv.clientEmail, 14, 54);
  doc.text(inv.clientAddress, 14, 61);

  let startY = 75;
  doc.text("Description", 14, startY);
  doc.text("Qty", 100, startY);
  doc.text("Price", 125, startY);
  doc.text("Total", 160, startY);

  let y = startY + 7;
  inv.items.forEach(it => {
    doc.text(it.desc, 14, y);
    doc.text(it.qty, 100, y);
    doc.text(it.price, 125, y);
    doc.text(it.total, 160, y);
    y += 7;
  });

  y += 10;
  doc.text(`Subtotal: ${inv.subtotal}`, 125, y); y += 7;
  doc.text(`Tax: ${inv.tax}`, 125, y); y += 7;
  doc.text(`Grand Total: ${inv.grandTotal}`, 125, y);

  doc.save(inv.invoiceNumber + ".pdf");
}
