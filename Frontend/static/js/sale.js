// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
    document.getElementById("salesPersonDisplay").textContent =
      currentUser.name;
  }

  // Load sales data
  loadSalesData();
  initializeCharts();
  setupEventListeners();

  // Set default dates for filter
  const today = new Date().toISOString().split("T")[0];
  const firstDayOfMonth = new Date();
  firstDayOfMonth.setDate(1);
  const firstDayStr = firstDayOfMonth.toISOString().split("T")[0];

  document.getElementById("startDate").value = firstDayStr;
  document.getElementById("endDate").value = today;

  // Generate invoice number
  generateInvoiceNumber();

  // Set invoice date
  document.getElementById("invoiceDateDisplay").textContent = formatDate(today);
});

// Generate invoice number
function generateInvoiceNumber() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const sales = systemData?.sales || [];
  const invoiceNumber = `INV-${(sales.length + 1).toString().padStart(4, "0")}`;
  document.getElementById("invoiceNumberDisplay").textContent = invoiceNumber;
  return invoiceNumber;
}

// Format date
function formatDate(dateString) {
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString("en-US", options);
}

// Load sales data from localStorage
function loadSalesData() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const sales = systemData?.sales || [];
  const products = systemData?.products || [];

  // Update overview cards
  updateOverviewCards(sales);

  // Display sales table
  displaySalesTable(sales);

  // Populate product dropdown
  populateProductDropdown(products);
}

// Update overview cards
function updateOverviewCards(sales) {
  const today = new Date().toISOString().split("T")[0];

  // Today's sales
  const todaySales = sales
    .filter((sale) => sale.date === today && sale.status === "completed")
    .reduce((sum, sale) => sum + sale.total, 0);

  // Weekly sales (last 7 days)
  const weekAgo = new Date();
  weekAgo.setDate(weekAgo.getDate() - 7);
  const weekAgoStr = weekAgo.toISOString().split("T")[0];

  const weeklySales = sales
    .filter((sale) => sale.date >= weekAgoStr && sale.status === "completed")
    .reduce((sum, sale) => sum + sale.total, 0);

  // Count by status
  const completedSales = sales.filter(
    (sale) => sale.status === "completed"
  ).length;
  const pendingSales = sales.filter((sale) => sale.status === "pending").length;

  // Update display
  document.getElementById("todaySales").textContent = `₹${todaySales.toFixed(
    2
  )}`;
  document.getElementById("weeklySales").textContent = `₹${weeklySales.toFixed(
    2
  )}`;
  document.getElementById("completedSales").textContent = completedSales;
  document.getElementById("pendingSales").textContent = pendingSales;
}

// Display sales table
function displaySalesTable(sales) {
  const salesTable = document.getElementById("salesTable");
  salesTable.innerHTML = "";

  // Apply filters
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const statusFilter = document.getElementById("statusFilter").value;
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();

  let filteredSales = sales.filter((sale) => {
    // Date filter
    if (startDate && sale.date < startDate) return false;
    if (endDate && sale.date > endDate) return false;

    // Status filter
    if (statusFilter && sale.status !== statusFilter) return false;

    // Search filter
    if (searchTerm) {
      const matchesInvoice = sale.invoiceNumber
        ?.toLowerCase()
        .includes(searchTerm);
      const matchesCustomer = sale.customerName
        ?.toLowerCase()
        .includes(searchTerm);
      return matchesInvoice || matchesCustomer;
    }

    return true;
  });

  // Sort by date (newest first)
  filteredSales.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (filteredSales.length === 0) {
    salesTable.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-receipt" style="font-size: 50px; margin-bottom: 15px; display: block;"></i>
                            <h3>No sales found</h3>
                            <p>Try adjusting your filters or create a new sale</p>
                        </td>
                    </tr>
                `;
    return;
  }

  // Display sales
  filteredSales.forEach((sale) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (sale.status === "completed") {
      statusClass = "status-completed";
      statusText = "Completed";
    } else if (sale.status === "pending") {
      statusClass = "status-pending";
      statusText = "Pending";
    } else {
      statusClass = "status-cancelled";
      statusText = "Cancelled";
    }

    // Count items
    const itemCount = sale.items ? sale.items.length : 0;

    row.innerHTML = `
                    <td><strong>${sale.invoiceNumber || "N/A"}</strong></td>
                    <td>${formatDate(sale.date)}</td>
                    <td>${sale.customerName || "Walk-in Customer"}</td>
                    <td>${itemCount} item${itemCount !== 1 ? "s" : ""}</td>
                    <td><strong>₹${sale.total.toFixed(2)}</strong></td>
                    <td>${sale.paymentMethod || "Cash"}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewSaleDetails('${
                          sale.id
                        }')" style="padding: 5px 10px; margin-right: 5px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editSale('${
                          sale.id
                        }')" style="padding: 5px 10px; margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSale('${
                          sale.id
                        }')" style="padding: 5px 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    salesTable.appendChild(row);
  });
}

// Populate product dropdown
function populateProductDropdown(products) {
  const productSelect = document.getElementById("productSelect");
  productSelect.innerHTML = '<option value="">Choose a product</option>';

  // Filter only products with stock
  const availableProducts = products.filter((p) => p.currentStock > 0);

  if (availableProducts.length === 0) {
    productSelect.innerHTML = '<option value="">No products available</option>';
    return;
  }

  availableProducts.forEach((product) => {
    const option = document.createElement("option");
    option.value = product.id;
    option.textContent = `${product.name} (Stock: ${product.currentStock}) - ₹${product.price}`;
    option.dataset.price = product.price;
    productSelect.appendChild(option);
  });

  // Set default price when product is selected
  productSelect.addEventListener("change", function () {
    const selectedOption = this.options[this.selectedIndex];
    const price = selectedOption.dataset.price;
    if (price) {
      document.getElementById("productPrice").value = price;
    } else {
      document.getElementById("productPrice").value = "";
    }
  });
}

// Initialize charts
function initializeCharts() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const sales = systemData?.sales || [];

  // Sales Trend Chart
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  const salesData = getLast7DaysSales(sales);

  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: salesData.days,
      datasets: [
        {
          label: "Sales (₹)",
          data: salesData.amounts,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value;
            },
          },
        },
      },
    },
  });

  // Sales Status Chart
  const statusCtx = document
    .getElementById("salesStatusChart")
    .getContext("2d");
  const statusData = getSalesStatusData(sales);

  new Chart(statusCtx, {
    type: "doughnut",
    data: {
      labels: statusData.labels,
      datasets: [
        {
          data: statusData.values,
          backgroundColor: ["#27ae60", "#f39c12", "#e74c3c"],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "bottom",
        },
      },
    },
  });
}

// Get last 7 days sales data
function getLast7DaysSales(sales) {
  const days = [];
  const amounts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const daySales = sales
      .filter((s) => s.date === dateStr && s.status === "completed")
      .reduce((sum, sale) => sum + sale.total, 0);

    days.push(date.toLocaleDateString("en-US", { weekday: "short" }));
    amounts.push(daySales);
  }

  return { days, amounts };
}

// Get sales status data
function getSalesStatusData(sales) {
  const completed = sales.filter((s) => s.status === "completed").length;
  const pending = sales.filter((s) => s.status === "pending").length;
  const cancelled = sales.filter((s) => s.status === "cancelled").length;

  return {
    labels: ["Completed", "Pending", "Cancelled"],
    values: [completed, pending, cancelled],
  };
}

// Sale items array
let saleItems = [];

// Add item to sale
function addSaleItem() {
  const productSelect = document.getElementById("productSelect");
  const productId = parseInt(productSelect.value);
  const quantity = parseInt(document.getElementById("productQuantity").value);
  const price = parseFloat(document.getElementById("productPrice").value);
  const discount = parseFloat(document.getElementById("productDiscount").value);

  if (!productId || !quantity || !price) {
    alert("Please fill all required fields");
    return;
  }

  // Get product details
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const product = systemData.products.find((p) => p.id === productId);

  if (!product) {
    alert("Product not found");
    return;
  }

  // Check stock availability
  if (product.currentStock < quantity) {
    alert(`Only ${product.currentStock} units available in stock`);
    return;
  }

  // Calculate item total
  const itemTotal = price * quantity;
  const discountAmount = itemTotal * (discount / 100);
  const finalTotal = itemTotal - discountAmount;

  // Add to sale items
  saleItems.push({
    productId,
    productName: product.name,
    price,
    quantity,
    discount,
    discountAmount,
    total: finalTotal,
  });

  // Update display
  updateSaleItemsTable();
  updateSaleSummary();

  // Reset form
  productSelect.value = "";
  document.getElementById("productQuantity").value = 1;
  document.getElementById("productPrice").value = "";
  document.getElementById("productDiscount").value = 0;
}

// Remove item from sale
function removeSaleItem(index) {
  saleItems.splice(index, 1);
  updateSaleItemsTable();
  updateSaleSummary();
}

// Update sale items table
function updateSaleItemsTable() {
  const tableBody = document.getElementById("saleItemsTable");
  tableBody.innerHTML = "";

  if (saleItems.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 20px; color: #7f8c8d;">
                            No items added. Add products to create a sale.
                        </td>
                    </tr>
                `;
    return;
  }

  saleItems.forEach((item, index) => {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td>${item.productName}</td>
                    <td>₹${item.price.toFixed(2)}</td>
                    <td>${item.quantity}</td>
                    <td>${item.discount}%</td>
                    <td>₹${item.total.toFixed(2)}</td>
                    <td>
                        <button class="btn btn-sm btn-danger" onclick="removeSaleItem(${index})" style="padding: 3px 8px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

// Update sale summary
function updateSaleSummary() {
  const subtotal = saleItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );
  const totalDiscount = saleItems.reduce(
    (sum, item) => sum + item.discountAmount,
    0
  );
  const taxableAmount = subtotal - totalDiscount;
  const tax = taxableAmount * 0.18; // Assuming 18% tax
  const total = taxableAmount + tax;

  document.getElementById("subtotalDisplay").textContent = `₹${subtotal.toFixed(
    2
  )}`;
  document.getElementById(
    "discountDisplay"
  ).textContent = `₹${totalDiscount.toFixed(2)}`;
  document.getElementById("taxDisplay").textContent = `₹${tax.toFixed(2)}`;
  document.getElementById("totalDisplay").textContent = `₹${total.toFixed(2)}`;

  return { subtotal, totalDiscount, tax, total };
}

// Save sale
function saveSale() {
  if (saleItems.length === 0) {
    alert("Please add at least one item to the sale");
    return;
  }

  const customerName =
    document.getElementById("customerName").value.trim() || "Walk-in Customer";
  const customerPhone = document.getElementById("customerPhone").value.trim();
  const customerEmail = document.getElementById("customerEmail").value.trim();
  const customerAddress = document
    .getElementById("customerAddress")
    .value.trim();
  const paymentMethod = document.getElementById("paymentMethod").value;
  const saleStatus = document.getElementById("saleStatus").value;
  const saleNotes = document.getElementById("saleNotes").value.trim();

  const summary = updateSaleSummary();
  const invoiceNumber = document.getElementById(
    "invoiceNumberDisplay"
  ).textContent;
  const today = new Date().toISOString().split("T")[0];

  // Get system data
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check stock availability again
  for (const item of saleItems) {
    const product = systemData.products.find((p) => p.id === item.productId);
    if (!product || product.currentStock < item.quantity) {
      alert(`Insufficient stock for ${item.productName}`);
      return;
    }
  }

  // Create sale object
  const sale = {
    id: generateId(systemData.sales),
    invoiceNumber,
    date: today,
    customerName,
    customerPhone,
    customerEmail,
    customerAddress,
    items: [...saleItems],
    subtotal: summary.subtotal,
    discount: summary.totalDiscount,
    tax: summary.tax,
    total: summary.total,
    paymentMethod,
    status: saleStatus,
    notes: saleNotes,
    createdAt: new Date().toISOString(),
    createdBy: JSON.parse(localStorage.getItem("currentUser")).id,
  };

  // Update product stock
  saleItems.forEach((item) => {
    const productIndex = systemData.products.findIndex(
      (p) => p.id === item.productId
    );
    if (productIndex !== -1) {
      systemData.products[productIndex].currentStock -= item.quantity;

      // Update status if stock is low
      if (
        systemData.products[productIndex].currentStock <=
        systemData.products[productIndex].minStock
      ) {
        systemData.products[productIndex].status = "low-stock";
      }
    }
  });

  // Add sale to system data
  systemData.sales.push(sale);

  // Add stock movement record
  saleItems.forEach((item) => {
    const movement = {
      id: generateId(systemData.stockMovements),
      date: today,
      type: "out",
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      reference: invoiceNumber,
      userId: JSON.parse(localStorage.getItem("currentUser")).id,
    };
    systemData.stockMovements.push(movement);
  });

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Show success message
  showNotification("Sale created successfully!", "success");

  // Close modal and reset
  document.getElementById("newSaleModal").classList.remove("active");
  resetSaleForm();

  // Reload data
  loadSalesData();
}

// Generate unique ID
function generateId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

// Reset sale form
function resetSaleForm() {
  saleItems = [];
  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("customerEmail").value = "";
  document.getElementById("customerAddress").value = "";
  document.getElementById("paymentMethod").value = "cash";
  document.getElementById("saleStatus").value = "completed";
  document.getElementById("saleNotes").value = "";

  updateSaleItemsTable();
  updateSaleSummary();
  generateInvoiceNumber();
}

// View sale details
function viewSaleDetails(saleId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const sale = systemData.sales.find((s) => s.id === parseInt(saleId));

  if (!sale) {
    alert("Sale not found");
    return;
  }

  const detailsContent = document.getElementById("saleDetailsContent");

  // Create invoice preview
  let itemsHtml = "";
  if (sale.items && sale.items.length > 0) {
    sale.items.forEach((item) => {
      itemsHtml += `
                        <tr>
                            <td>${item.productName}</td>
                            <td>₹${item.price.toFixed(2)}</td>
                            <td>${item.quantity}</td>
                            <td>${item.discount}%</td>
                            <td>₹${(item.price * item.quantity).toFixed(2)}</td>
                            <td>₹${item.total.toFixed(2)}</td>
                        </tr>
                    `;
    });
  }

  detailsContent.innerHTML = `
                <div class="invoice-preview">
                    <div class="invoice-header">
                        <div class="invoice-company">
                            <h2>InventoryPro</h2>
                            <p>123 Business Street, City, State 12345</p>
                            <p>Phone: +1-234-567-890 | Email: info@inventorypro.com</p>
                        </div>
                        <div class="invoice-details">
                            <div class="invoice-title">INVOICE</div>
                            <div class="invoice-number">${
                              sale.invoiceNumber
                            }</div>
                            <div style="margin-top: 10px;">
                                <div>Date: ${formatDate(sale.date)}</div>
                                <div>Status: <span class="status-badge ${
                                  sale.status === "completed"
                                    ? "status-completed"
                                    : sale.status === "pending"
                                    ? "status-pending"
                                    : "status-cancelled"
                                }">${sale.status}</span></div>
                            </div>
                        </div>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h4>Bill To:</h4>
                            <p><strong>${sale.customerName}</strong></p>
                            ${
                              sale.customerPhone
                                ? `<p>Phone: ${sale.customerPhone}</p>`
                                : ""
                            }
                            ${
                              sale.customerEmail
                                ? `<p>Email: ${sale.customerEmail}</p>`
                                : ""
                            }
                            ${
                              sale.customerAddress
                                ? `<p>Address: ${sale.customerAddress}</p>`
                                : ""
                            }
                        </div>
                        <div>
                            <h4>Payment Details:</h4>
                            <p>Method: ${sale.paymentMethod || "Cash"}</p>
                            <p>Date: ${formatDate(sale.date)}</p>
                        </div>
                    </div>
                    
                    <table class="invoice-table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Price</th>
                                <th>Qty</th>
                                <th>Discount</th>
                                <th>Subtotal</th>
                                <th>Total</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${itemsHtml}
                        </tbody>
                    </table>
                    
                    <div class="invoice-totals">
                        <div class="summary-row">
                            <span>Subtotal:</span>
                            <span>₹${sale.subtotal.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Discount:</span>
                            <span>₹${sale.discount.toFixed(2)}</span>
                        </div>
                        <div class="summary-row">
                            <span>Tax (18%):</span>
                            <span>₹${sale.tax.toFixed(2)}</span>
                        </div>
                        <div class="summary-row total">
                            <span>Total:</span>
                            <span>₹${sale.total.toFixed(2)}</span>
                        </div>
                    </div>
                    
                    ${
                      sale.notes
                        ? `
                    <div style="margin-top: 30px;">
                        <h4>Notes:</h4>
                        <p>${sale.notes}</p>
                    </div>
                    `
                        : ""
                    }
                    
                    <div class="invoice-footer">
                        <p>Thank you for your business!</p>
                        <p>This is a computer-generated invoice and does not require a signature.</p>
                    </div>
                </div>
                
                <div style="display: flex; gap: 15px; margin-top: 20px;">
                    <button class="btn btn-outline" onclick="closeViewModal()">
                        Close
                    </button>
                    <button class="btn btn-primary" onclick="printInvoice('${
                      sale.id
                    }')">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                </div>
            `;

  document.getElementById("viewSaleModal").classList.add("active");
}

// Edit sale
function editSale(saleId) {
  // In a real application, this would open the sale in edit mode
  alert("Edit sale functionality would be implemented here.");
}

// Delete sale
function deleteSale(saleId) {
  if (
    !confirm(
      "Are you sure you want to delete this sale? This action cannot be undone."
    )
  ) {
    return;
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const saleIndex = systemData.sales.findIndex(
    (s) => s.id === parseInt(saleId)
  );

  if (saleIndex === -1) {
    alert("Sale not found");
    return;
  }

  // Restore stock if sale is completed
  const sale = systemData.sales[saleIndex];
  if (sale.status === "completed" && sale.items) {
    sale.items.forEach((item) => {
      const productIndex = systemData.products.findIndex(
        (p) => p.id === item.productId
      );
      if (productIndex !== -1) {
        systemData.products[productIndex].currentStock += item.quantity;
      }
    });
  }

  // Remove sale
  systemData.sales.splice(saleIndex, 1);

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Show notification
  showNotification("Sale deleted successfully!", "success");

  // Reload data
  loadSalesData();
}

// Print invoice
function printInvoice(saleId) {
  const printContent = document.getElementById("saleDetailsContent").innerHTML;
  const originalContent = document.body.innerHTML;

  document.body.innerHTML = printContent;
  window.print();
  document.body.innerHTML = originalContent;

  // Reload the page to restore functionality
  location.reload();
}

// Close view modal
function closeViewModal() {
  document.getElementById("viewSaleModal").classList.remove("active");
}

// Show notification
function showNotification(message, type) {
  const notification = document.createElement("div");
  notification.style.position = "fixed";
  notification.style.top = "20px";
  notification.style.right = "20px";
  notification.style.padding = "15px 20px";
  notification.style.borderRadius = "8px";
  notification.style.color = "white";
  notification.style.fontWeight = "600";
  notification.style.zIndex = "10000";
  notification.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
  notification.style.display = "flex";
  notification.style.alignItems = "center";
  notification.style.gap = "10px";

  if (type === "success") {
    notification.style.backgroundColor = "var(--success-color)";
    notification.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  } else if (type === "error") {
    notification.style.backgroundColor = "var(--accent-color)";
    notification.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  } else {
    notification.style.backgroundColor = "var(--secondary-color)";
    notification.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  }

  document.body.appendChild(notification);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Setup event listeners
function setupEventListeners() {
  // Sidebar toggle
  document
    .getElementById("sidebarToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("collapsed");
    });

  // Mobile menu toggle
  document
    .getElementById("mobileMenuToggle")
    .addEventListener("click", function () {
      document.getElementById("sidebar").classList.toggle("active");
    });

  // Logout buttons
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document
    .getElementById("logoutSidebar")
    .addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });

  // New sale button
  document.getElementById("newSaleBtn").addEventListener("click", function () {
    document.getElementById("newSaleModal").classList.add("active");
  });

  // Export sales button
  document
    .getElementById("exportSalesBtn")
    .addEventListener("click", function () {
      showNotification("Sales data exported successfully!", "success");
    });

  // Print report button
  document
    .getElementById("printReportBtn")
    .addEventListener("click", function () {
      window.print();
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      loadSalesData();
    });

  // Add item button
  document.getElementById("addItemBtn").addEventListener("click", addSaleItem);

  // Save sale button
  document.getElementById("saveSaleBtn").addEventListener("click", saveSale);

  // Modal close buttons
  document
    .getElementById("closeSaleModal")
    .addEventListener("click", function () {
      document.getElementById("newSaleModal").classList.remove("active");
    });

  document
    .getElementById("closeViewModal")
    .addEventListener("click", closeViewModal);

  // Cancel sale button
  document
    .getElementById("cancelSaleBtn")
    .addEventListener("click", function () {
      document.getElementById("newSaleModal").classList.remove("active");
      resetSaleForm();
    });

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });

  // Make sidebar menu items active on click
  document.querySelectorAll(".menu-item").forEach((item) => {
    item.addEventListener("click", function () {
      document
        .querySelectorAll(".menu-item")
        .forEach((i) => i.classList.remove("active"));
      this.classList.add("active");
    });
  });
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

// Add sample data if empty
function addSampleDataIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (systemData.sales.length === 0) {
    const today = new Date().toISOString().split("T")[0];

    systemData.sales = [
      {
        id: 1,
        invoiceNumber: "INV-0001",
        date: today,
        customerName: "John Doe",
        customerPhone: "+1-234-567-8901",
        customerEmail: "john@example.com",
        customerAddress: "123 Main St, City, State 12345",
        items: [
          {
            productId: 1,
            productName: "Wireless Bluetooth Headphones",
            price: 89.99,
            quantity: 2,
            discount: 10,
            discountAmount: 17.998,
            total: 161.982,
          },
        ],
        subtotal: 179.98,
        discount: 17.998,
        tax: 29.15676,
        total: 191.13876,
        paymentMethod: "card",
        status: "completed",
        notes: "Customer requested express shipping",
        createdAt: new Date().toISOString(),
        createdBy: 1,
      },
      {
        id: 2,
        invoiceNumber: "INV-0002",
        date: today,
        customerName: "Jane Smith",
        customerPhone: "+1-987-654-3210",
        items: [
          {
            productId: 2,
            productName: "Ergonomic Office Chair",
            price: 249.99,
            quantity: 1,
            discount: 0,
            discountAmount: 0,
            total: 249.99,
          },
        ],
        subtotal: 249.99,
        discount: 0,
        tax: 44.9982,
        total: 294.9882,
        paymentMethod: "cash",
        status: "pending",
        notes: "Customer will pick up tomorrow",
        createdAt: new Date().toISOString(),
        createdBy: 1,
      },
    ];

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
    loadSalesData();
    initializeCharts();
  }
}

// Call this function on first load
addSampleDataIfEmpty();
