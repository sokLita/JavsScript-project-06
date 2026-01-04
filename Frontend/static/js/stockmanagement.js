  
      // Check if user is logged in
      if (
        !localStorage.getItem("loggedIn") ||
        localStorage.getItem("loggedIn") !== "true"
      ) {
        // Redirect to login page if not logged in
        window.location.href = "login.html";
      }
    
// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize stock data
  loadStockData();
  initializeCharts();
  setupEventListeners();

  // Check user permissions
  if (userRole === "staff") {
    document.getElementById("stockAdjustBtn").style.display = "none";
    document.getElementById("stockTransferBtn").style.display = "none";
  }
});

// Sample stock data
let stockData = {
  products: [
    {
      id: "P001",
      name: "Wireless Bluetooth Headphones",
      sku: "WH-2023-001",
      category: "electronics",
      currentStock: 45,
      minStock: 10,
      maxStock: 100,
      unitPrice: 89.99,
      stockValue: 4049.55,
      status: "in-stock",
      lastUpdated: "2023-10-15",
    },
    {
      id: "P002",
      name: "Ergonomic Office Chair",
      sku: "OC-2023-002",
      category: "furniture",
      currentStock: 12,
      minStock: 5,
      maxStock: 30,
      unitPrice: 249.99,
      stockValue: 2999.88,
      status: "in-stock",
      lastUpdated: "2023-10-14",
    },
    {
      id: "P003",
      name: "Smart Fitness Watch",
      sku: "FW-2023-003",
      category: "electronics",
      currentStock: 3,
      minStock: 10,
      maxStock: 50,
      unitPrice: 199.99,
      stockValue: 599.97,
      status: "low-stock",
      lastUpdated: "2023-10-16",
    },
    {
      id: "P004",
      name: "Desk Lamp with Wireless Charger",
      sku: "DL-2023-004",
      category: "home",
      currentStock: 0,
      minStock: 15,
      maxStock: 60,
      unitPrice: 49.99,
      stockValue: 0,
      status: "out-of-stock",
      lastUpdated: "2023-10-10",
    },
    {
      id: "P005",
      name: "Premium Notebook Set",
      sku: "NS-2023-005",
      category: "stationery",
      currentStock: 120,
      minStock: 50,
      maxStock: 200,
      unitPrice: 24.99,
      stockValue: 2998.8,
      status: "in-stock",
      lastUpdated: "2023-10-12",
    },
    {
      id: "P006",
      name: "Wireless Gaming Mouse",
      sku: "GM-2023-006",
      category: "electronics",
      currentStock: 5,
      minStock: 10,
      maxStock: 50,
      unitPrice: 79.99,
      stockValue: 399.95,
      status: "low-stock",
      lastUpdated: "2023-10-17",
    },
    {
      id: "P007",
      name: "Stainless Steel Water Bottle",
      sku: "WB-2023-007",
      category: "sports",
      currentStock: 65,
      minStock: 20,
      maxStock: 100,
      unitPrice: 29.99,
      stockValue: 1949.35,
      status: "in-stock",
      lastUpdated: "2023-10-13",
    },
    {
      id: "P008",
      name: "Bluetooth Portable Speaker",
      sku: "BS-2023-008",
      category: "electronics",
      currentStock: 18,
      minStock: 10,
      maxStock: 50,
      unitPrice: 59.99,
      stockValue: 1079.82,
      status: "in-stock",
      lastUpdated: "2023-10-11",
    },
  ],
  movements: [
    {
      id: "M001",
      date: "2023-10-18 09:30",
      productId: "P001",
      productName: "Wireless Bluetooth Headphones",
      type: "stock-in",
      quantity: 20,
      previousStock: 25,
      newStock: 45,
      reference: "PO-2023-045",
      user: "Admin",
    },
    {
      id: "M002",
      date: "2023-10-18 11:15",
      productId: "P003",
      productName: "Smart Fitness Watch",
      type: "stock-out",
      quantity: 2,
      previousStock: 5,
      newStock: 3,
      reference: "SO-2023-128",
      user: "Manager",
    },
    {
      id: "M003",
      date: "2023-10-17 14:45",
      productId: "P006",
      productName: "Wireless Gaming Mouse",
      type: "adjustment",
      quantity: -3,
      previousStock: 8,
      newStock: 5,
      reference: "ADJ-2023-023",
      user: "Admin",
    },
    {
      id: "M004",
      date: "2023-10-17 10:20",
      productId: "P002",
      productName: "Ergonomic Office Chair",
      type: "stock-in",
      quantity: 5,
      previousStock: 7,
      newStock: 12,
      reference: "PO-2023-044",
      user: "Admin",
    },
    {
      id: "M005",
      date: "2023-10-16 16:30",
      productId: "P005",
      productName: "Premium Notebook Set",
      type: "stock-out",
      quantity: 15,
      previousStock: 135,
      newStock: 120,
      reference: "SO-2023-127",
      user: "Staff",
    },
    {
      id: "M006",
      date: "2023-10-15 13:10",
      productId: "P007",
      productName: "Stainless Steel Water Bottle",
      type: "stock-in",
      quantity: 25,
      previousStock: 40,
      newStock: 65,
      reference: "PO-2023-043",
      user: "Manager",
    },
  ],
  alerts: [
    {
      id: "A001",
      type: "critical",
      message: "Desk Lamp with Wireless Charger is out of stock (0 units)",
      productId: "P004",
      time: "2 days ago",
      action: "reorder",
    },
    {
      id: "A002",
      type: "warning",
      message:
        "Smart Fitness Watch is running low (3 units left, minimum is 10)",
      productId: "P003",
      time: "1 day ago",
      action: "reorder",
    },
    {
      id: "A003",
      type: "warning",
      message:
        "Wireless Gaming Mouse is running low (5 units left, minimum is 10)",
      productId: "P006",
      time: "Today",
      action: "reorder",
    },
    {
      id: "A004",
      type: "warning",
      message:
        "Ergonomic Office Chair stock is near minimum (12 units left, minimum is 5)",
      productId: "P002",
      time: "3 days ago",
      action: "monitor",
    },
  ],
};

// Initialize charts
function initializeCharts() {
  // Movement Chart
  const movementCtx = document.getElementById("movementChart").getContext("2d");
  const movementChart = new Chart(movementCtx, {
    type: "line",
    data: {
      labels: [
        "Oct 12",
        "Oct 13",
        "Oct 14",
        "Oct 15",
        "Oct 16",
        "Oct 17",
        "Oct 18",
      ],
      datasets: [
        {
          label: "Stock In",
          data: [25, 15, 30, 20, 10, 25, 35],
          borderColor: "#27ae60",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Stock Out",
          data: [18, 22, 15, 25, 30, 20, 15],
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
          title: {
            display: true,
            text: "Quantity",
          },
        },
      },
    },
  });

  // Category Distribution Chart
  const categoryCtx = document.getElementById("categoryChart").getContext("2d");
  const categoryChart = new Chart(categoryCtx, {
    type: "doughnut",
    data: {
      labels: ["Electronics", "Furniture", "Home", "Stationery", "Sports"],
      datasets: [
        {
          data: [6128.29, 2999.88, 0, 2998.8, 1949.35],
          backgroundColor: [
            "#3498db",
            "#9b59b6",
            "#e74c3c",
            "#f39c12",
            "#1abc9c",
          ],
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
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              return `${label}: $${value.toLocaleString()}`;
            },
          },
        },
      },
    },
  });

  // Update chart on period change
  document
    .getElementById("movementPeriod")
    .addEventListener("change", function () {
      // In a real app, you would fetch new data based on the selected period
      movementChart.update();
    });
}

// Load stock data into tables
function loadStockData() {
  loadAlerts();
  loadMovements();
  loadInventory();
  updateStockOverview();
}

// Load alerts
function loadAlerts() {
  const alertsList = document.getElementById("alertsList");
  alertsList.innerHTML = "";

  stockData.alerts.forEach((alert) => {
    const alertItem = document.createElement("div");
    alertItem.className = `alert-item ${alert.type}`;

    const icon =
      alert.type === "critical"
        ? "fa-exclamation-circle"
        : "fa-exclamation-triangle";

    alertItem.innerHTML = `
                    <div class="alert-icon">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="alert-details">
                        <div class="alert-message">${alert.message}</div>
                        <div class="alert-time">${alert.time}</div>
                    </div>
                    <div class="alert-action">
                        <button class="btn btn-sm ${
                          alert.type === "critical"
                            ? "btn-danger"
                            : "btn-warning"
                        }" onclick="handleAlertAction('${alert.id}')">
                            ${
                              alert.action === "reorder"
                                ? "Reorder Now"
                                : "View Details"
                            }
                        </button>
                    </div>
                `;

    alertsList.appendChild(alertItem);
  });
}

// Load stock movements
function loadMovements() {
  const movementsTable = document.getElementById("movementsTable");
  movementsTable.innerHTML = "";

  stockData.movements.forEach((movement) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (movement.type === "stock-in") {
      statusClass = "status-in";
      statusText = "Stock In";
    } else if (movement.type === "stock-out") {
      statusClass = "status-out";
      statusText = "Stock Out";
    } else {
      statusClass = "status-adjusted";
      statusText = "Adjusted";
    }

    // Determine quantity display
    let quantityDisplay =
      movement.quantity > 0 ? `+${movement.quantity}` : movement.quantity;

    row.innerHTML = `
                    <td>${movement.date}</td>
                    <td><strong>${movement.productName}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${quantityDisplay}</td>
                    <td>${movement.previousStock}</td>
                    <td>${movement.newStock}</td>
                    <td>${movement.reference}</td>
                    <td>${movement.user}</td>
                `;
    movementsTable.appendChild(row);
  });
}

// Load inventory table
function loadInventory() {
  const inventoryTable = document.getElementById("inventoryTable");
  inventoryTable.innerHTML = "";

  stockData.products.forEach((product) => {
    const row = document.createElement("tr");

    // Determine status
    let statusClass = "";
    let statusText = "";
    let stockPercentage = (product.currentStock / product.maxStock) * 100;

    if (product.status === "out-of-stock") {
      statusClass = "badge-outstock";
      statusText = "Out of Stock";
    } else if (product.status === "low-stock") {
      statusClass = "badge-lowstock";
      statusText = "Low Stock";
    } else {
      statusClass = "badge-instock";
      statusText = "In Stock";
    }

    // Calculate stock level indicator
    let stockLevelClass = "good";
    if (product.currentStock <= product.minStock) {
      stockLevelClass = "critical";
    } else if (product.currentStock <= product.minStock * 1.5) {
      stockLevelClass = "warning";
    }

    row.innerHTML = `
                    <td>${product.sku}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${getCategoryName(product.category)}</td>
                    <td>
                        <div class="stock-level">
                            <div class="stock-bar">
                                <div class="stock-fill ${stockLevelClass}" style="width: ${Math.min(
      stockPercentage,
      100
    )}%"></div>
                            </div>
                            <span>${product.currentStock}</span>
                        </div>
                    </td>
                    <td>${product.minStock}</td>
                    <td>${product.maxStock}</td>
                    <td>$${product.stockValue.toLocaleString()}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewProductStock('${
                          product.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="adjustProductStock('${
                          product.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
    inventoryTable.appendChild(row);
  });

  // Populate product dropdowns in modals
  populateProductDropdowns();
}

// Update stock overview statistics
function updateStockOverview() {
  const totalStockValue = stockData.products.reduce(
    (sum, product) => sum + product.stockValue,
    0
  );
  const inStockItems = stockData.products.filter(
    (p) => p.status === "in-stock"
  ).length;
  const lowStockItems = stockData.products.filter(
    (p) => p.status === "low-stock"
  ).length;
  const outOfStockItems = stockData.products.filter(
    (p) => p.status === "out-of-stock"
  ).length;

  document.getElementById(
    "totalStockValue"
  ).textContent = `$${totalStockValue.toLocaleString()}`;
  document.getElementById("inStockItems").textContent = inStockItems;
  document.getElementById("lowStockItems").textContent = lowStockItems;
  document.getElementById("outOfStockItems").textContent = outOfStockItems;
}

// Get category name from value
function getCategoryName(categoryValue) {
  const categories = {
    electronics: "Electronics",
    furniture: "Furniture",
    clothing: "Clothing",
    home: "Home & Kitchen",
    sports: "Sports & Outdoors",
    stationery: "Stationery",
  };
  return categories[categoryValue] || categoryValue;
}

// Populate product dropdowns in modals
function populateProductDropdowns() {
  const stockInSelect = document.getElementById("stockInProduct");
  const adjustSelect = document.getElementById("adjustProduct");

  // Clear existing options except the first one
  while (stockInSelect.options.length > 1) stockInSelect.remove(1);
  while (adjustSelect.options.length > 1) adjustSelect.remove(1);

  // Add product options
  stockData.products.forEach((product) => {
    const option1 = document.createElement("option");
    option1.value = product.id;
    option1.textContent = `${product.name} (Current: ${product.currentStock})`;
    stockInSelect.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = product.id;
    option2.textContent = `${product.name} (Current: ${product.currentStock})`;
    adjustSelect.appendChild(option2);
  });
}

// Handle alert action
function handleAlertAction(alertId) {
  const alert = stockData.alerts.find((a) => a.id === alertId);
  if (!alert) return;

  if (alert.action === "reorder") {
    // Show reorder modal or process
    showNotification(
      `Reorder initiated for product ${alert.productId}`,
      "success"
    );

    // Remove alert after action
    stockData.alerts = stockData.alerts.filter((a) => a.id !== alertId);
    loadAlerts();
  } else {
    // Show product details
    viewProductStock(alert.productId);
  }
}

// View product stock details
function viewProductStock(productId) {
  const product = stockData.products.find((p) => p.id === productId);
  if (!product) return;

  alert(
    `Product: ${product.name}\nCurrent Stock: ${product.currentStock}\nMin Stock: ${product.minStock}\nMax Stock: ${product.maxStock}\nStatus: ${product.status}`
  );
}

// Adjust product stock
function adjustProductStock(productId) {
  const product = stockData.products.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("adjustProduct").value = productId;
  document.getElementById("currentStockDisplay").textContent =
    product.currentStock;

  // Update dropdown to show current product
  const adjustSelect = document.getElementById("adjustProduct");
  for (let i = 0; i < adjustSelect.options.length; i++) {
    if (adjustSelect.options[i].value === productId) {
      adjustSelect.selectedIndex = i;
      break;
    }
  }

  document.getElementById("stockAdjustModal").classList.add("active");
}

// Show stock in modal
function showStockInModal() {
  document.getElementById("stockInModal").classList.add("active");
}

// Show stock adjustment modal
function showStockAdjustModal() {
  document.getElementById("stockAdjustModal").classList.add("active");
}

// Process stock in
function processStockIn(event) {
  event.preventDefault();

  const productId = document.getElementById("stockInProduct").value;
  const quantity = parseInt(document.getElementById("stockInQuantity").value);
  const unitPrice = document.getElementById("stockInUnitPrice").value
    ? parseFloat(document.getElementById("stockInUnitPrice").value)
    : null;
  const supplier = document.getElementById("stockInSupplier").value;
  const reference = document.getElementById("stockInReference").value;
  const notes = document.getElementById("stockInNotes").value;

  // Find product
  const productIndex = stockData.products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    showNotification("Product not found!", "error");
    return;
  }

  // Update product stock
  const product = stockData.products[productIndex];
  const previousStock = product.currentStock;
  product.currentStock += quantity;

  // Update stock value if unit price is provided
  if (unitPrice) {
    product.stockValue = product.currentStock * product.unitPrice;
  } else {
    product.stockValue = product.currentStock * product.unitPrice;
  }

  // Update status
  if (product.currentStock === 0) {
    product.status = "out-of-stock";
  } else if (product.currentStock <= product.minStock) {
    product.status = "low-stock";
  } else {
    product.status = "in-stock";
  }

  product.lastUpdated = new Date().toISOString().split("T")[0];

  // Add movement record
  const movement = {
    id: "M" + (stockData.movements.length + 1).toString().padStart(3, "0"),
    date: new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    productId: product.id,
    productName: product.name,
    type: "stock-in",
    quantity: quantity,
    previousStock: previousStock,
    newStock: product.currentStock,
    reference: reference || "N/A",
    user: localStorage.getItem("userName") || "System",
  };

  stockData.movements.unshift(movement);

  // Check for and remove related alerts
  stockData.alerts = stockData.alerts.filter((a) => a.productId !== productId);

  // Close modal and reset form
  document.getElementById("stockInModal").classList.remove("active");
  document.getElementById("stockInForm").reset();

  // Reload data
  loadStockData();

  // Show success notification
  showNotification(`${quantity} units added to ${product.name}`, "success");
}

// Process stock adjustment
function processStockAdjustment(event) {
  event.preventDefault();

  const productId = document.getElementById("adjustProduct").value;
  const adjustType = document.getElementById("adjustType").value;
  const quantity = parseInt(document.getElementById("adjustQuantity").value);
  const setValue = parseInt(document.getElementById("adjustSetValue").value);
  const reason = document.getElementById("adjustReason").value;
  const notes = document.getElementById("adjustNotes").value;

  // Find product
  const productIndex = stockData.products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    showNotification("Product not found!", "error");
    return;
  }

  const product = stockData.products[productIndex];
  const previousStock = product.currentStock;
  let newStock = previousStock;

  // Calculate new stock based on adjustment type
  if (adjustType === "add") {
    newStock = previousStock + quantity;
  } else if (adjustType === "remove") {
    newStock = previousStock - quantity;
    if (newStock < 0) newStock = 0;
  } else if (adjustType === "set") {
    newStock = setValue;
  }

  // Update product
  product.currentStock = newStock;
  product.stockValue = newStock * product.unitPrice;

  // Update status
  if (product.currentStock === 0) {
    product.status = "out-of-stock";
  } else if (product.currentStock <= product.minStock) {
    product.status = "low-stock";
  } else {
    product.status = "in-stock";
  }

  product.lastUpdated = new Date().toISOString().split("T")[0];

  // Add movement record
  const movement = {
    id: "M" + (stockData.movements.length + 1).toString().padStart(3, "0"),
    date: new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    productId: product.id,
    productName: product.name,
    type: "adjustment",
    quantity: newStock - previousStock,
    previousStock: previousStock,
    newStock: newStock,
    reference: `ADJ-${reason.toUpperCase()}`,
    user: localStorage.getItem("userName") || "System",
  };

  stockData.movements.unshift(movement);

  // Update alerts if needed
  if (newStock <= product.minStock && newStock > 0) {
    // Check if alert already exists
    const existingAlert = stockData.alerts.find(
      (a) => a.productId === productId
    );
    if (!existingAlert) {
      const alert = {
        id: "A" + (stockData.alerts.length + 1).toString().padStart(3, "0"),
        type: "warning",
        message: `${product.name} is running low (${newStock} units left, minimum is ${product.minStock})`,
        productId: product.id,
        time: "Just now",
        action: "reorder",
      };
      stockData.alerts.unshift(alert);
    }
  } else if (newStock === 0) {
    // Check if alert already exists
    const existingAlert = stockData.alerts.find(
      (a) => a.productId === productId
    );
    if (!existingAlert) {
      const alert = {
        id: "A" + (stockData.alerts.length + 1).toString().padStart(3, "0"),
        type: "critical",
        message: `${product.name} is out of stock (0 units)`,
        productId: product.id,
        time: "Just now",
        action: "reorder",
      };
      stockData.alerts.unshift(alert);
    }
  } else {
    // Remove any existing alerts for this product if stock is now sufficient
    stockData.alerts = stockData.alerts.filter(
      (a) => a.productId !== productId
    );
  }

  // Close modal and reset form
  document.getElementById("stockAdjustModal").classList.remove("active");
  document.getElementById("stockAdjustForm").reset();

  // Show adjustment type field by default
  document.getElementById("adjustQuantityGroup").style.display = "block";
  document.getElementById("adjustSetGroup").style.display = "none";

  // Reload data
  loadStockData();

  // Show success notification
  showNotification(
    `Stock adjusted for ${product.name}. New stock: ${newStock} units`,
    "success"
  );
}

// Handle adjustment type change
function handleAdjustTypeChange() {
  const adjustType = document.getElementById("adjustType").value;
  const quantityGroup = document.getElementById("adjustQuantityGroup");
  const setGroup = document.getElementById("adjustSetGroup");

  if (adjustType === "set") {
    quantityGroup.style.display = "none";
    setGroup.style.display = "block";
  } else {
    quantityGroup.style.display = "block";
    setGroup.style.display = "none";
  }
}

// Handle product selection in adjustment modal
function handleAdjustProductChange() {
  const productId = document.getElementById("adjustProduct").value;
  const product = stockData.products.find((p) => p.id === productId);

  if (product) {
    document.getElementById("currentStockDisplay").textContent =
      product.currentStock;
  }
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

  // Action buttons
  document
    .getElementById("stockInBtn")
    .addEventListener("click", showStockInModal);
  document
    .getElementById("stockAdjustBtn")
    .addEventListener("click", showStockAdjustModal);

  // Stock out button (simplified - would open a similar modal to stock in)
  document.getElementById("stockOutBtn").addEventListener("click", function () {
    alert(
      "Stock Out feature would open a modal similar to Stock In for recording stock reductions."
    );
  });

  // Stock transfer button
  document
    .getElementById("stockTransferBtn")
    .addEventListener("click", function () {
      alert(
        "Stock Transfer feature would allow transferring stock between locations."
      );
    });

  // View all alerts button
  document
    .getElementById("viewAllAlertsBtn")
    .addEventListener("click", function () {
      alert("This would show all stock alerts in a separate page/modal.");
    });

  // Export buttons
  document
    .getElementById("exportMovementsBtn")
    .addEventListener("click", function () {
      showNotification("Stock movements exported successfully!", "success");
    });

  document
    .getElementById("exportInventoryBtn")
    .addEventListener("click", function () {
      showNotification("Inventory report exported successfully!", "success");
    });

  document
    .getElementById("printInventoryBtn")
    .addEventListener("click", function () {
      window.print();
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      // In a real app, this would filter the inventory table
      showNotification("Filters applied successfully!", "success");
    });

  // Modal close buttons
  document
    .getElementById("closeStockInModal")
    .addEventListener("click", function () {
      document.getElementById("stockInModal").classList.remove("active");
    });

  document
    .getElementById("closeStockAdjustModal")
    .addEventListener("click", function () {
      document.getElementById("stockAdjustModal").classList.remove("active");
    });

  // Cancel buttons
  document
    .getElementById("cancelStockInBtn")
    .addEventListener("click", function () {
      document.getElementById("stockInModal").classList.remove("active");
    });

  document
    .getElementById("cancelAdjustBtn")
    .addEventListener("click", function () {
      document.getElementById("stockAdjustModal").classList.remove("active");
    });

  // Form submissions
  document
    .getElementById("stockInForm")
    .addEventListener("submit", processStockIn);
  document
    .getElementById("stockAdjustForm")
    .addEventListener("submit", processStockAdjustment);

  // Adjustment type change
  document
    .getElementById("adjustType")
    .addEventListener("change", handleAdjustTypeChange);

  // Product selection change in adjustment modal
  document
    .getElementById("adjustProduct")
    .addEventListener("change", handleAdjustProductChange);

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    // Clear authentication data
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    // Redirect to login page
    window.location.href = "login.html";
  }
}
