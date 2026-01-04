// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load stock data
  loadStockData();
  setupEventListeners();

  // Initialize charts
  initializeCharts();

  // Check role for permissions
  if (currentUser.role === "staff") {
    document.getElementById("stockAdjustBtn").style.display = "none";
    document.getElementById("stockTransferBtn").style.display = "none";
  }
});

// Load stock data from localStorage
function loadStockData() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  if (!systemData) return;

  const products = systemData.products || [];
  const stockMovements = systemData.stockMovements || [];
  const categories = systemData.categories || [];
  const suppliers = systemData.suppliers || [];

  // Calculate statistics
  calculateStockStatistics(products);

  // Load alerts
  loadStockAlerts(products);

  // Load stock movements
  loadStockMovements(stockMovements);

  // Load inventory table
  loadInventoryTable(products);

  // Populate filters
  populateFilters(categories);

  // Populate dropdowns in modals
  populateModalDropdowns(products, suppliers);
}

// Calculate stock statistics
function calculateStockStatistics(products) {
  let totalStockValue = 0;
  let inStockCount = 0;
  let lowStockCount = 0;
  let outOfStockCount = 0;

  products.forEach((product) => {
    // Calculate stock value
    const stockValue = product.currentStock * (product.price || 0);
    totalStockValue += stockValue;

    // Count stock status
    if (product.currentStock === 0) {
      outOfStockCount++;
    } else if (product.currentStock <= (product.minStock || 10)) {
      lowStockCount++;
    } else {
      inStockCount++;
    }
  });

  // Calculate percentages
  const totalProducts = products.length;
  const inStockPercent =
    totalProducts > 0 ? Math.round((inStockCount / totalProducts) * 100) : 0;
  const lowStockPercent =
    totalProducts > 0 ? Math.round((lowStockCount / totalProducts) * 100) : 0;
  const outStockPercent =
    totalProducts > 0 ? Math.round((outOfStockCount / totalProducts) * 100) : 0;

  // Update UI
  document.getElementById(
    "totalStockValue"
  ).textContent = `₹${totalStockValue.toFixed(2)}`;
  document.getElementById("inStockItems").textContent = inStockCount;
  document.getElementById("lowStockItems").textContent = lowStockCount;
  document.getElementById("outOfStockItems").textContent = outOfStockCount;

  document.getElementById("stockValuePercent").textContent = "85%"; // Simulated
  document.getElementById("inStockPercent").textContent = `${inStockPercent}%`;
  document.getElementById(
    "lowStockPercent"
  ).textContent = `${lowStockPercent}%`;
  document.getElementById(
    "outStockPercent"
  ).textContent = `${outStockPercent}%`;

  // Update progress bars
  document.querySelector(
    ".overview-card.success .stock-fill"
  ).style.width = `${inStockPercent}%`;
  document.querySelector(
    ".overview-card.warning .stock-fill"
  ).style.width = `${lowStockPercent}%`;
  document.querySelector(
    ".overview-card.critical .stock-fill"
  ).style.width = `${outStockPercent}%`;
}

// Load stock alerts
function loadStockAlerts(products) {
  const alertsList = document.getElementById("alertsList");
  alertsList.innerHTML = "";

  // Find products with low or out of stock
  const alerts = [];

  products.forEach((product) => {
    if (product.currentStock === 0) {
      alerts.push({
        type: "critical",
        message: `${product.name} is out of stock (0 units left)`,
        productId: product.id,
        productName: product.name,
        time: "Needs attention",
      });
    } else if (product.currentStock <= (product.minStock || 10)) {
      alerts.push({
        type: "warning",
        message: `${product.name} is running low (${
          product.currentStock
        } units left, minimum is ${product.minStock || 10})`,
        productId: product.id,
        productName: product.name,
        time: "Monitor closely",
      });
    }
  });

  // Display alerts (limit to 3)
  alerts.slice(0, 3).forEach((alert) => {
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
                        }" onclick="handleStockAlert(${alert.productId})">
                            ${
                              alert.type === "critical"
                                ? "Reorder Now"
                                : "View Details"
                            }
                        </button>
                    </div>
                `;

    alertsList.appendChild(alertItem);
  });

  // If no alerts
  if (alerts.length === 0) {
    alertsList.innerHTML = `
                    <div class="alert-item" style="background: #e8f5e9; border-left-color: #27ae60;">
                        <div class="alert-icon" style="background: rgba(39, 174, 96, 0.1); color: #27ae60;">
                            <i class="fas fa-check-circle"></i>
                        </div>
                        <div class="alert-details">
                            <div class="alert-message">All stock levels are healthy</div>
                            <div class="alert-time">No stock alerts at this time</div>
                        </div>
                    </div>
                `;
  }
}

// Load stock movements
function loadStockMovements(stockMovements) {
  const movementsTable = document.getElementById("movementsTable");
  movementsTable.innerHTML = "";

  // Sort by date (newest first)
  const sortedMovements = [...stockMovements].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  );

  // Display only recent movements (limit to 10)
  sortedMovements.slice(0, 10).forEach((movement) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (movement.type === "in") {
      statusClass = "status-in";
      statusText = "Stock In";
    } else if (movement.type === "out") {
      statusClass = "status-out";
      statusText = "Stock Out";
    } else {
      statusClass = "status-adjusted";
      statusText = "Adjusted";
    }

    // Format date
    const movementDate = new Date(movement.date);
    const formattedDate = movementDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

    // Determine quantity display
    let quantityDisplay = movement.quantity;
    if (movement.type === "in" && movement.quantity > 0) {
      quantityDisplay = `+${movement.quantity}`;
    }

    row.innerHTML = `
                    <td>${formattedDate}</td>
                    <td><strong>${movement.productName}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${quantityDisplay}</td>
                    <td>${movement.previousStock}</td>
                    <td>${movement.newStock}</td>
                    <td>${movement.reference || "N/A"}</td>
                    <td>${movement.user || "System"}</td>
                `;
    movementsTable.appendChild(row);
  });

  // If no movements
  if (stockMovements.length === 0) {
    movementsTable.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 30px; color: #7f8c8d;">
                            <i class="fas fa-history" style="font-size: 40px; margin-bottom: 15px; display: block;"></i>
                            <h3>No stock movements yet</h3>
                            <p>Stock movements will appear here when you add or adjust stock</p>
                        </td>
                    </tr>
                `;
  }
}

// Load inventory table
function loadInventoryTable(products) {
  const inventoryTable = document.getElementById("inventoryTable");
  inventoryTable.innerHTML = "";

  // Get filter values
  const productFilter = document
    .getElementById("productFilter")
    .value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  // Filter products
  let filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      !productFilter ||
      product.name.toLowerCase().includes(productFilter) ||
      (product.sku && product.sku.toLowerCase().includes(productFilter));

    // Category filter
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "in-stock") {
      matchesStatus = product.currentStock > (product.minStock || 10);
    } else if (statusFilter === "low-stock") {
      matchesStatus =
        product.currentStock <= (product.minStock || 10) &&
        product.currentStock > 0;
    } else if (statusFilter === "out-of-stock") {
      matchesStatus = product.currentStock === 0;
    }

    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Display products
  if (filteredProducts.length === 0) {
    inventoryTable.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 30px; color: #7f8c8d;">
                            <i class="fas fa-box-open" style="font-size: 40px; margin-bottom: 15px; display: block;"></i>
                            <h3>No products found</h3>
                            <p>Try adjusting your search or filters</p>
                            ${
                              products.length === 0
                                ? '<button class="btn btn-primary" onclick="window.location.href=\'products.html\'" style="margin-top: 15px;"><i class="fas fa-plus"></i> Add Products</button>'
                                : ""
                            }
                        </td>
                    </tr>
                `;
    return;
  }

  filteredProducts.forEach((product) => {
    const row = document.createElement("tr");

    // Determine status
    let statusBadge = "";
    if (product.currentStock === 0) {
      statusBadge =
        '<span class="status-badge" style="background: rgba(231, 76, 60, 0.1); color: #e74c3c;">Out of Stock</span>';
    } else if (product.currentStock <= (product.minStock || 10)) {
      statusBadge =
        '<span class="status-badge" style="background: rgba(243, 156, 18, 0.1); color: #f39c12;">Low Stock</span>';
    } else {
      statusBadge =
        '<span class="status-badge" style="background: rgba(39, 174, 96, 0.1); color: #27ae60;">In Stock</span>';
    }

    // Calculate stock level percentage
    const maxStock = product.maxStock || 100;
    const stockPercentage = Math.min(
      (product.currentStock / maxStock) * 100,
      100
    );

    // Determine stock level color
    let stockLevelClass = "good";
    if (product.currentStock === 0) {
      stockLevelClass = "critical";
    } else if (product.currentStock <= (product.minStock || 10)) {
      stockLevelClass = "warning";
    }

    // Calculate stock value
    const stockValue = product.currentStock * (product.price || 0);

    row.innerHTML = `
                    <td>${product.sku || "N/A"}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${product.category || "Uncategorized"}</td>
                    <td>
                        <div class="stock-level">
                            <div class="stock-bar">
                                <div class="stock-fill ${stockLevelClass}" style="width: ${stockPercentage}%"></div>
                            </div>
                            <span>${product.currentStock}</span>
                        </div>
                    </td>
                    <td>${product.minStock || 10}</td>
                    <td>${product.maxStock || 100}</td>
                    <td>₹${stockValue.toFixed(2)}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="adjustStock(${
                          product.id
                        })" style="margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="viewStockHistory(${
                          product.id
                        })">
                            <i class="fas fa-history"></i>
                        </button>
                    </td>
                `;
    inventoryTable.appendChild(row);
  });
}

// Populate filters
function populateFilters(categories) {
  const categoryFilter = document.getElementById("categoryFilter");

  // Clear existing options except the first one
  while (categoryFilter.options.length > 1) categoryFilter.remove(1);

  // Get unique categories from products
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];
  const uniqueCategories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Add category options
  uniqueCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category;
    option.textContent = category;
    categoryFilter.appendChild(option);
  });
}

// Populate modal dropdowns
function populateModalDropdowns(products, suppliers) {
  const stockInProduct = document.getElementById("stockInProduct");
  const adjustProduct = document.getElementById("adjustProduct");
  const stockInSupplier = document.getElementById("stockInSupplier");

  // Clear existing options
  stockInProduct.innerHTML = '<option value="">Choose a product</option>';
  adjustProduct.innerHTML = '<option value="">Choose a product</option>';
  stockInSupplier.innerHTML = '<option value="">Select Supplier</option>';

  // Add product options
  products.forEach((product) => {
    const option1 = document.createElement("option");
    option1.value = product.id;
    option1.textContent = `${product.name} (Current: ${product.currentStock})`;
    stockInProduct.appendChild(option1);

    const option2 = document.createElement("option");
    option2.value = product.id;
    option2.textContent = `${product.name} (Current: ${product.currentStock})`;
    adjustProduct.appendChild(option2);
  });

  // Add supplier options
  suppliers.forEach((supplier) => {
    const option = document.createElement("option");
    option.value = supplier.id;
    option.textContent = supplier.name;
    stockInSupplier.appendChild(option);
  });
}

// Initialize charts
function initializeCharts() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const stockMovements = systemData?.stockMovements || [];
  const products = systemData?.products || [];

  // Movement Chart
  const movementCtx = document.getElementById("movementChart").getContext("2d");
  const movementData = getMovementChartData(stockMovements);

  const movementChart = new Chart(movementCtx, {
    type: "line",
    data: {
      labels: movementData.labels,
      datasets: [
        {
          label: "Stock In",
          data: movementData.stockIn,
          borderColor: "#27ae60",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Stock Out",
          data: movementData.stockOut,
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
  const categoryData = getCategoryChartData(products);

  new Chart(categoryCtx, {
    type: "doughnut",
    data: {
      labels: categoryData.labels,
      datasets: [
        {
          data: categoryData.values,
          backgroundColor: [
            "#3498db",
            "#9b59b6",
            "#e74c3c",
            "#f39c12",
            "#1abc9c",
            "#34495e",
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
              return `${label}: ${value} items`;
            },
          },
        },
      },
    },
  });

  // Update chart when period changes
  document
    .getElementById("movementPeriod")
    .addEventListener("change", function () {
      const newData = getMovementChartData(stockMovements, this.value);
      movementChart.data.labels = newData.labels;
      movementChart.data.datasets[0].data = newData.stockIn;
      movementChart.data.datasets[1].data = newData.stockOut;
      movementChart.update();
    });
}

// Get movement chart data
function getMovementChartData(stockMovements, period = "week") {
  let days = 7;
  if (period === "month") days = 30;
  if (period === "quarter") days = 90;

  const labels = [];
  const stockIn = [];
  const stockOut = [];

  // Initialize arrays with zeros
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    labels.push(
      date.toLocaleDateString("en-US", { month: "short", day: "numeric" })
    );
    stockIn.push(0);
    stockOut.push(0);
  }

  // Fill with actual data
  stockMovements.forEach((movement) => {
    const movementDate = new Date(movement.date).toISOString().split("T")[0];
    const today = new Date();
    const startDate = new Date();
    startDate.setDate(today.getDate() - days);

    if (new Date(movementDate) >= startDate) {
      // Find the index for this date
      const dateIndex = labels.findIndex((label) => {
        const labelDate = new Date();
        const [month, day] = label.split(" ");
        labelDate.setMonth(new Date(`${month} 1`).getMonth());
        labelDate.setDate(parseInt(day));
        return labelDate.toISOString().split("T")[0] === movementDate;
      });

      if (dateIndex !== -1) {
        if (movement.type === "in") {
          stockIn[dateIndex] += movement.quantity;
        } else if (movement.type === "out") {
          stockOut[dateIndex] += Math.abs(movement.quantity);
        }
      }
    }
  });

  return { labels, stockIn, stockOut };
}

// Get category chart data
function getCategoryChartData(products) {
  const categoryMap = {};

  products.forEach((product) => {
    const category = product.category || "Uncategorized";
    categoryMap[category] = (categoryMap[category] || 0) + 1;
  });

  const labels = Object.keys(categoryMap);
  const values = Object.values(categoryMap);

  return { labels, values };
}

// Handle stock alert action
function handleStockAlert(productId) {
  // In a real application, this would open a reorder modal or view details
  adjustStock(productId);
}

// Adjust stock
function adjustStock(productId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const product = systemData.products.find((p) => p.id === productId);

  if (!product) return;

  // Set current stock display
  document.getElementById("currentStockDisplay").textContent =
    product.currentStock;

  // Set the product in dropdown
  const adjustSelect = document.getElementById("adjustProduct");
  adjustSelect.value = productId;

  // Show modal
  document.getElementById("stockAdjustModal").classList.add("active");
}

// View stock history
function viewStockHistory(productId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const product = systemData.products.find((p) => p.id === productId);
  const movements = systemData.stockMovements.filter(
    (m) => m.productId === productId
  );

  if (!product) return;

  let historyHTML = `
                <h3>Stock History for ${product.name}</h3>
                <p><strong>SKU:</strong> ${product.sku || "N/A"}</p>
                <p><strong>Current Stock:</strong> ${
                  product.currentStock
                } units</p>
                <p><strong>Min Stock:</strong> ${
                  product.minStock || 10
                } units</p>
                <p><strong>Max Stock:</strong> ${
                  product.maxStock || 100
                } units</p>
                <hr>
                <h4>Stock Movements</h4>
            `;

  if (movements.length === 0) {
    historyHTML += "<p>No stock movements recorded for this product.</p>";
  } else {
    historyHTML +=
      '<table style="width: 100%; border-collapse: collapse; margin-top: 10px;">';
    historyHTML += `
                    <thead>
                        <tr style="background: #f8f9fa;">
                            <th style="padding: 10px; text-align: left;">Date</th>
                            <th style="padding: 10px; text-align: left;">Type</th>
                            <th style="padding: 10px; text-align: left;">Quantity</th>
                            <th style="padding: 10px; text-align: left;">Reference</th>
                        </tr>
                    </thead>
                    <tbody>
                `;

    movements.forEach((movement) => {
      const movementDate = new Date(movement.date);
      const formattedDate = movementDate.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });

      historyHTML += `
                        <tr style="border-bottom: 1px solid #eee;">
                            <td style="padding: 10px;">${formattedDate}</td>
                            <td style="padding: 10px;">
                                <span style="padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: 600; 
                                      background: ${
                                        movement.type === "in"
                                          ? "rgba(39, 174, 96, 0.1)"
                                          : movement.type === "out"
                                          ? "rgba(52, 152, 219, 0.1)"
                                          : "rgba(243, 156, 18, 0.1)"
                                      }; 
                                      color: ${
                                        movement.type === "in"
                                          ? "#27ae60"
                                          : movement.type === "out"
                                          ? "#3498db"
                                          : "#f39c12"
                                      }">
                                    ${
                                      movement.type === "in"
                                        ? "Stock In"
                                        : movement.type === "out"
                                        ? "Stock Out"
                                        : "Adjusted"
                                    }
                                </span>
                            </td>
                            <td style="padding: 10px;">${
                              movement.type === "in" ? "+" : ""
                            }${movement.quantity}</td>
                            <td style="padding: 10px;">${
                              movement.reference || "N/A"
                            }</td>
                        </tr>
                    `;
    });

    historyHTML += "</tbody></table>";
  }

  alert(historyHTML);
}

// Process stock in
function processStockIn(event) {
  event.preventDefault();

  const productId = parseInt(document.getElementById("stockInProduct").value);
  const quantity = parseInt(document.getElementById("stockInQuantity").value);
  const unitPrice = document.getElementById("stockInUnitPrice").value
    ? parseFloat(document.getElementById("stockInUnitPrice").value)
    : null;
  const supplierId = document.getElementById("stockInSupplier").value
    ? parseInt(document.getElementById("stockInSupplier").value)
    : null;
  const reference = document.getElementById("stockInReference").value;
  const notes = document.getElementById("stockInNotes").value;

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Find product
  const productIndex = systemData.products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    showNotification("Product not found!", "error");
    return;
  }

  const product = systemData.products[productIndex];
  const previousStock = product.currentStock;

  // Update product stock
  product.currentStock += quantity;

  // Update product price if unit price is provided and different
  if (unitPrice && unitPrice !== product.price) {
    product.price = unitPrice;
  }

  // Update product status based on stock
  updateProductStockStatus(product);

  // Create stock movement record
  const movementId =
    systemData.stockMovements.length > 0
      ? Math.max(...systemData.stockMovements.map((m) => m.id)) + 1
      : 1;

  const movement = {
    id: movementId,
    date: new Date().toISOString(),
    type: "in",
    productId: product.id,
    productName: product.name,
    quantity: quantity,
    previousStock: previousStock,
    newStock: product.currentStock,
    reference: reference,
    notes: notes,
    userId: currentUser.id,
    user: currentUser.name,
    supplierId: supplierId,
    unitPrice: unitPrice,
  };

  systemData.stockMovements.push(movement);

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("stockInModal").classList.remove("active");
  document.getElementById("stockInForm").reset();

  // Show notification
  showNotification(`${quantity} units added to ${product.name}`, "success");

  // Reload data
  loadStockData();
  initializeCharts();
}

// Process stock adjustment
function processStockAdjustment(event) {
  event.preventDefault();

  const productId = parseInt(document.getElementById("adjustProduct").value);
  const adjustType = document.getElementById("adjustType").value;
  const quantity = parseInt(document.getElementById("adjustQuantity").value);
  const setValue = parseInt(document.getElementById("adjustSetValue").value);
  const reason = document.getElementById("adjustReason").value;
  const notes = document.getElementById("adjustNotes").value;

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Find product
  const productIndex = systemData.products.findIndex((p) => p.id === productId);
  if (productIndex === -1) {
    showNotification("Product not found!", "error");
    return;
  }

  const product = systemData.products[productIndex];
  const previousStock = product.currentStock;
  let newStock = previousStock;
  let adjustmentQuantity = 0;

  // Calculate new stock based on adjustment type
  if (adjustType === "add") {
    newStock = previousStock + quantity;
    adjustmentQuantity = quantity;
  } else if (adjustType === "remove") {
    newStock = previousStock - quantity;
    if (newStock < 0) newStock = 0;
    adjustmentQuantity = -quantity;
  } else if (adjustType === "set") {
    adjustmentQuantity = setValue - previousStock;
    newStock = setValue;
    if (newStock < 0) newStock = 0;
  }

  // Update product stock
  product.currentStock = newStock;

  // Update product status based on stock
  updateProductStockStatus(product);

  // Create stock movement record
  const movementId =
    systemData.stockMovements.length > 0
      ? Math.max(...systemData.stockMovements.map((m) => m.id)) + 1
      : 1;

  const movement = {
    id: movementId,
    date: new Date().toISOString(),
    type: "adjustment",
    productId: product.id,
    productName: product.name,
    quantity: adjustmentQuantity,
    previousStock: previousStock,
    newStock: newStock,
    reference: `ADJ-${reason.toUpperCase()}`,
    notes: notes,
    userId: currentUser.id,
    user: currentUser.name,
    reason: reason,
  };

  systemData.stockMovements.push(movement);

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("stockAdjustModal").classList.remove("active");
  document.getElementById("stockAdjustForm").reset();

  // Reset adjustment type fields
  document.getElementById("adjustQuantityGroup").style.display = "block";
  document.getElementById("adjustSetGroup").style.display = "none";

  // Show notification
  showNotification(
    `Stock adjusted for ${product.name}. New stock: ${newStock} units`,
    "success"
  );

  // Reload data
  loadStockData();
  initializeCharts();
}

// Update product stock status
function updateProductStockStatus(product) {
  if (product.currentStock === 0) {
    product.status = "out-of-stock";
  } else if (product.currentStock <= (product.minStock || 10)) {
    product.status = "low-stock";
  } else {
    product.status = "in-stock";
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
  document.getElementById("stockInBtn").addEventListener("click", function () {
    document.getElementById("stockInModal").classList.add("active");
  });

  document
    .getElementById("stockAdjustBtn")
    .addEventListener("click", function () {
      document.getElementById("stockAdjustModal").classList.add("active");
    });

  // Stock out button
  document.getElementById("stockOutBtn").addEventListener("click", function () {
    // For simplicity, we'll use the stock adjustment modal for stock out
    document.getElementById("stockAdjustModal").classList.add("active");
    document.getElementById("adjustType").value = "remove";
    document.getElementById("adjustReason").value = "sale";
  });

  // Stock transfer button
  document
    .getElementById("stockTransferBtn")
    .addEventListener("click", function () {
      showNotification(
        "Stock transfer feature would open a transfer modal",
        "info"
      );
    });

  // View all alerts button
  document
    .getElementById("viewAllAlertsBtn")
    .addEventListener("click", function () {
      // In a full implementation, this would show all alerts in a modal or separate page
      const systemData = JSON.parse(
        localStorage.getItem("inventorySystemData")
      );
      const products = systemData.products || [];

      let allAlerts = "";
      products.forEach((product) => {
        if (product.currentStock === 0) {
          allAlerts += `• ${product.name} is OUT OF STOCK (0 units)\n`;
        } else if (product.currentStock <= (product.minStock || 10)) {
          allAlerts += `• ${product.name} is LOW STOCK (${
            product.currentStock
          } units, min: ${product.minStock || 10})\n`;
        }
      });

      if (allAlerts === "") {
        allAlerts = "No stock alerts at this time.";
      }

      alert("STOCK ALERTS:\n\n" + allAlerts);
    });

  // Filter buttons
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      loadStockData();
    });

  document
    .getElementById("productFilter")
    .addEventListener("keyup", function (e) {
      if (e.key === "Enter") {
        loadStockData();
      }
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
  document.getElementById("adjustType").addEventListener("change", function () {
    const adjustType = this.value;
    const quantityGroup = document.getElementById("adjustQuantityGroup");
    const setGroup = document.getElementById("adjustSetGroup");

    if (adjustType === "set") {
      quantityGroup.style.display = "none";
      setGroup.style.display = "block";
    } else {
      quantityGroup.style.display = "block";
      setGroup.style.display = "none";
    }
  });

  // Product selection change in adjustment modal
  document
    .getElementById("adjustProduct")
    .addEventListener("change", function () {
      const productId = parseInt(this.value);
      const systemData = JSON.parse(
        localStorage.getItem("inventorySystemData")
      );
      const product = systemData.products.find((p) => p.id === productId);

      if (product) {
        document.getElementById("currentStockDisplay").textContent =
          product.currentStock;
      }
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

  if (!systemData.stockMovements || systemData.stockMovements.length === 0) {
    // Add sample stock movements
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const twoDaysAgo = new Date(today);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    systemData.stockMovements = [
      {
        id: 1,
        date: today.toISOString(),
        type: "in",
        productId: 1,
        productName: "Wireless Bluetooth Headphones",
        quantity: 20,
        previousStock: 25,
        newStock: 45,
        reference: "PO-2023-001",
        userId: 1,
        user: "Admin",
      },
      {
        id: 2,
        date: yesterday.toISOString(),
        type: "out",
        productId: 3,
        productName: "Smart Fitness Watch",
        quantity: 2,
        previousStock: 5,
        newStock: 3,
        reference: "SO-2023-001",
        userId: 2,
        user: "Manager",
      },
      {
        id: 3,
        date: twoDaysAgo.toISOString(),
        type: "adjustment",
        productId: 2,
        productName: "Ergonomic Office Chair",
        quantity: -3,
        previousStock: 15,
        newStock: 12,
        reference: "ADJ-COUNT-ERROR",
        userId: 1,
        user: "Admin",
        reason: "count_error",
      },
    ];

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
  }
}

// Call this function on first load
addSampleDataIfEmpty();
