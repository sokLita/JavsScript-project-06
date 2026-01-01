// stockmanagement.js - Stock Management System

document.addEventListener("DOMContentLoaded", function () {
  initializeStockManagement();
  setupEventListeners();
  loadStockData();
  updateStockStats();
  setupSidebarNavigation();
});

// Global variables
let stockData = [];
let filteredStockData = [];
let selectedProducts = new Set();
let currentTab = "all";
let currentFilters = {
  search: "",
  category: "all",
  status: "all",
};

// Sample stock data
const sampleStockData = [
  {
    id: 1,
    name: "Laptop Dell",
    code: "DL-001",
    category: "Electronics",
    stock: 85,
    minStock: 20,
    price: 1200,
    status: "in_stock",
    supplier: "Dell Cambodia",
    lastUpdated: "2024-03-15T10:30:00",
    totalValue: 102000,
    history: [
      {
        date: "2024-03-15T10:30:00",
        type: "stock_in",
        quantity: 10,
        user: "Admin",
        reason: "purchase",
        notes: "Monthly restock",
      },
      {
        date: "2024-03-10T14:20:00",
        type: "stock_out",
        quantity: 5,
        user: "Sales",
        reason: "sale",
        notes: "Customer order #456",
      },
    ],
  },
  {
    id: 2,
    name: "Mouse Logitech",
    code: "MS-002",
    category: "Accessories",
    stock: 58,
    minStock: 30,
    price: 25,
    status: "low_stock",
    supplier: "Logitech",
    lastUpdated: "2024-03-14T14:20:00",
    totalValue: 1450,
    history: [
      {
        date: "2024-03-14T14:20:00",
        type: "stock_out",
        quantity: 15,
        user: "Sales",
        reason: "sale",
        notes: "Bulk order",
      },
    ],
  },
  {
    id: 3,
    name: "Keyboard Mechanical",
    code: "KB-003",
    category: "Accessories",
    stock: 72,
    minStock: 25,
    price: 80,
    status: "in_stock",
    supplier: "Razer",
    lastUpdated: "2024-03-14T11:15:00",
    totalValue: 5760,
    history: [],
  },
  {
    id: 4,
    name: 'Monitor 27"',
    code: "MN-004",
    category: "Electronics",
    stock: 42,
    minStock: 15,
    price: 300,
    status: "in_stock",
    supplier: "Samsung",
    lastUpdated: "2024-03-13T09:45:00",
    totalValue: 12600,
    history: [
      {
        date: "2024-03-13T09:45:00",
        type: "stock_in",
        quantity: 20,
        user: "Admin",
        reason: "purchase",
        notes: "New shipment",
      },
    ],
  },
  {
    id: 5,
    name: "Webcam HD",
    code: "WC-005",
    category: "Electronics",
    stock: 95,
    minStock: 20,
    price: 50,
    status: "in_stock",
    supplier: "Logitech",
    lastUpdated: "2024-03-12T16:30:00",
    totalValue: 4750,
    history: [],
  },
  {
    id: 6,
    name: "Desk Chair",
    code: "DC-006",
    category: "Furniture",
    stock: 38,
    minStock: 10,
    price: 150,
    status: "in_stock",
    supplier: "OfficePro",
    lastUpdated: "2024-03-11T13:20:00",
    totalValue: 5700,
    history: [],
  },
  {
    id: 7,
    name: "Office Desk",
    code: "OD-007",
    category: "Furniture",
    stock: 25,
    minStock: 5,
    price: 400,
    status: "in_stock",
    supplier: "OfficePro",
    lastUpdated: "2024-03-10T11:45:00",
    totalValue: 10000,
    history: [],
  },
  {
    id: 8,
    name: "Printer",
    code: "PR-008",
    category: "Electronics",
    stock: 0,
    minStock: 5,
    price: 200,
    status: "out_of_stock",
    supplier: "HP",
    lastUpdated: "2024-03-09T15:30:00",
    totalValue: 0,
    history: [
      {
        date: "2024-03-09T15:30:00",
        type: "stock_out",
        quantity: 8,
        user: "Sales",
        reason: "sale",
        notes: "Last unit sold",
      },
    ],
  },
  {
    id: 9,
    name: "Paper A4",
    code: "PA-009",
    category: "Office Supplies",
    stock: 15,
    minStock: 50,
    price: 5,
    status: "low_stock",
    supplier: "PaperCo",
    lastUpdated: "2024-03-08T10:15:00",
    totalValue: 75,
    history: [],
  },
  {
    id: 10,
    name: "Ink Cartridge",
    code: "IC-010",
    category: "Office Supplies",
    stock: 8,
    minStock: 25,
    price: 30,
    status: "low_stock",
    supplier: "HP",
    lastUpdated: "2024-03-07T14:50:00",
    totalValue: 240,
    history: [],
  },
];

// Initialize stock management
function initializeStockManagement() {
  // Load stock data from localStorage or use sample data
  const savedData = localStorage.getItem("stockData");
  if (savedData) {
    try {
      stockData = JSON.parse(savedData);
    } catch (error) {
      console.error("Error loading stock data:", error);
      stockData = [...sampleStockData];
    }
  } else {
    stockData = [...sampleStockData];
  }

  // Load filters from localStorage
  loadSavedFilters();
}

// Load saved filters
function loadSavedFilters() {
  const savedFilters = localStorage.getItem("stockFilters");
  if (savedFilters) {
    currentFilters = JSON.parse(savedFilters);
    document.getElementById("searchInput").value = currentFilters.search;
    document.getElementById("categoryFilter").value = currentFilters.category;
    document.getElementById("statusFilter").value = currentFilters.status;
  }
}

// Save filters
function saveFilters() {
  localStorage.setItem("stockFilters", JSON.stringify(currentFilters));
}

// Setup event listeners
function setupEventListeners() {
  // Stock In/Out buttons
  document
    .getElementById("stockInBtn")
    .addEventListener("click", () => openStockModal("in"));
  document
    .getElementById("stockOutBtn")
    .addEventListener("click", () => openStockModal("out"));
  document
    .getElementById("refreshBtn")
    .addEventListener("click", refreshStockData);

  // Filter controls
  document
    .getElementById("searchInput")
    .addEventListener("input", updateSearchFilter);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", updateCategoryFilter);
  document
    .getElementById("statusFilter")
    .addEventListener("change", updateStatusFilter);
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", applyFilters);

  // Modal controls
  document
    .getElementById("closeModalBtn")
    .addEventListener("click", closeStockModal);
  document
    .getElementById("cancelModalBtn")
    .addEventListener("click", closeStockModal);
  document
    .getElementById("saveAdjustmentBtn")
    .addEventListener("click", saveStockAdjustment);
  document
    .getElementById("closeBulkModalBtn")
    .addEventListener("click", closeBulkModal);
  document
    .getElementById("cancelBulkModalBtn")
    .addEventListener("click", closeBulkModal);
  document
    .getElementById("saveBulkAdjustmentBtn")
    .addEventListener("click", saveBulkAdjustment);

  // Product select change
  document
    .getElementById("productSelect")
    .addEventListener("change", updateProductDetails);

  // Bulk actions
  document
    .getElementById("bulkStockInBtn")
    .addEventListener("click", () => openBulkModal("in"));
  document
    .getElementById("bulkStockOutBtn")
    .addEventListener("click", () => openBulkModal("out"));
  document
    .getElementById("bulkAdjustmentType")
    .addEventListener("change", updateBulkHelpText);

  // History modal
  document
    .getElementById("closeHistoryModalBtn")
    .addEventListener("click", closeHistoryModal);
  document
    .getElementById("closeHistoryBtn")
    .addEventListener("click", closeHistoryModal);
  document
    .getElementById("applyHistoryFilterBtn")
    .addEventListener("click", applyHistoryFilter);
  document
    .getElementById("exportHistoryBtn")
    .addEventListener("click", exportStockHistory);

  // Select all checkbox
  document
    .getElementById("selectAll")
    .addEventListener("change", toggleSelectAll);

  // Tab navigation
  document.querySelectorAll(".stock-tabs li").forEach((tab) => {
    tab.addEventListener("click", () => switchTab(tab.dataset.tab));
  });

  // Close modals on outside click
  document.querySelectorAll(".modal-overlay").forEach((modal) => {
    modal.addEventListener("click", function (e) {
      if (e.target === this) {
        if (this.id === "stockModal") closeStockModal();
        if (this.id === "bulkStockModal") closeBulkModal();
        if (this.id === "historyModal") closeHistoryModal();
      }
    });
  });
}

// Load stock data
function loadStockData() {
  filterStockData();
  renderStockTable();
  populateProductSelect();
}

// Filter stock data
function filterStockData() {
  let filtered = [...stockData];

  // Apply tab filter
  switch (currentTab) {
    case "low":
      filtered = filtered.filter((item) => item.status === "low_stock");
      break;
    case "out":
      filtered = filtered.filter((item) => item.status === "out_of_stock");
      break;
    case "history":
      // For history tab, show all items
      break;
  }

  // Apply search filter
  if (currentFilters.search) {
    const searchTerm = currentFilters.search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(searchTerm) ||
        item.code.toLowerCase().includes(searchTerm) ||
        item.category.toLowerCase().includes(searchTerm)
    );
  }

  // Apply category filter
  if (currentFilters.category !== "all") {
    filtered = filtered.filter(
      (item) => item.category === currentFilters.category
    );
  }

  // Apply status filter
  if (currentFilters.status !== "all") {
    filtered = filtered.filter((item) => item.status === currentFilters.status);
  }

  filteredStockData = filtered;
}

// Render stock table
function renderStockTable() {
  const tableBody = document.getElementById("stockTableBody");

  if (filteredStockData.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="9" class="empty-table">
                            <i class="bx bx-package"></i>
                            <p>No products found matching your filters</p>
                        </td>
                    </tr>
                `;
    return;
  }

  tableBody.innerHTML = filteredStockData
    .map(
      (product) => `
                <tr class="stock-row ${product.status}" data-id="${product.id}">
                    <td>
                        <input type="checkbox" class="product-checkbox" data-id="${
                          product.id
                        }" 
                               ${
                                 selectedProducts.has(product.id)
                                   ? "checked"
                                   : ""
                               }>
                    </td>
                    <td>
                        <div class="product-name">${product.name}</div>
                        <div class="product-supplier">${product.supplier}</div>
                    </td>
                    <td>
                        <div class="product-code">${product.code}</div>
                    </td>
                    <td>
                        <span class="category-badge category-${product.category
                          .toLowerCase()
                          .replace(/\s+/g, "-")}">
                            ${product.category}
                        </span>
                    </td>
                    <td>
                        <div class="stock-level">
                            <div class="stock-bar">
                                <div class="stock-fill" style="width: ${Math.min(
                                  (product.stock / (product.minStock * 3)) *
                                    100,
                                  100
                                )}%"></div>
                            </div>
                            <span class="stock-value ${
                              product.stock < product.minStock ? "low" : ""
                            }">
                                ${product.stock} units
                            </span>
                        </div>
                    </td>
                    <td>
                        <div class="product-price">$${product.price.toFixed(
                          2
                        )}</div>
                    </td>
                    <td>
                        <div class="total-value">$${product.totalValue.toFixed(
                          2
                        )}</div>
                    </td>
                    <td>
                        <span class="status-badge status-${product.status}">
                            <i class="bx bx-${getStatusIcon(
                              product.status
                            )}"></i>
                            ${getStatusText(product.status)}
                        </span>
                    </td>
                    <td>
                        <div class="action-buttons">
                            <button class="btn-action stock-in" onclick="adjustStock(${
                              product.id
                            }, 'in')">
                                <i class="bx bx-plus"></i>
                            </button>
                            <button class="btn-action stock-out" onclick="adjustStock(${
                              product.id
                            }, 'out')">
                                <i class="bx bx-minus"></i>
                            </button>
                            <button class="btn-action history" onclick="viewStockHistory(${
                              product.id
                            })">
                                <i class="bx bx-history"></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
    )
    .join("");

  // Add event listeners to checkboxes
  document.querySelectorAll(".product-checkbox").forEach((checkbox) => {
    checkbox.addEventListener("change", function () {
      const productId = parseInt(this.dataset.id);
      if (this.checked) {
        selectedProducts.add(productId);
      } else {
        selectedProducts.delete(productId);
        document.getElementById("selectAll").checked = false;
      }
      updateSelectedCount();
    });
  });
}

// Get status icon
function getStatusIcon(status) {
  const icons = {
    in_stock: "check-circle",
    low_stock: "low-vision",
    out_of_stock: "x-circle",
  };
  return icons[status] || "circle";
}

// Get status text
function getStatusText(status) {
  const texts = {
    in_stock: "In Stock",
    low_stock: "Low Stock",
    out_of_stock: "Out of Stock",
  };
  return texts[status] || "Unknown";
}

// Update stock stats
function updateStockStats() {
  const totalItems = stockData.length;
  const lowStockItems = stockData.filter(
    (item) => item.status === "low_stock"
  ).length;
  const outOfStockItems = stockData.filter(
    (item) => item.status === "out_of_stock"
  ).length;
  const totalValue = stockData.reduce((sum, item) => sum + item.totalValue, 0);

  document.getElementById("totalItems").textContent = totalItems;
  document.getElementById("lowStockItems").textContent = lowStockItems;
  document.getElementById("outOfStockItems").textContent = outOfStockItems;
  document.getElementById("totalValue").textContent = `$${totalValue.toFixed(
    2
  )}`;
}

// Update selected count
function updateSelectedCount() {
  const count = selectedProducts.size;
  document.getElementById("selectedItemsCount").textContent = count;

  // Enable/disable bulk action buttons
  const bulkButtons = document.querySelectorAll(".btn-bulk");
  bulkButtons.forEach((btn) => {
    btn.disabled = count === 0;
  });
}

// Toggle select all
function toggleSelectAll() {
  const selectAll = document.getElementById("selectAll");
  const checkboxes = document.querySelectorAll(".product-checkbox");

  checkboxes.forEach((checkbox) => {
    checkbox.checked = selectAll.checked;
    const productId = parseInt(checkbox.dataset.id);

    if (selectAll.checked) {
      selectedProducts.add(productId);
    } else {
      selectedProducts.delete(productId);
    }
  });

  updateSelectedCount();
}

// Update search filter
function updateSearchFilter() {
  currentFilters.search = document.getElementById("searchInput").value;
}

// Update category filter
function updateCategoryFilter() {
  currentFilters.category = document.getElementById("categoryFilter").value;
}

// Update status filter
function updateStatusFilter() {
  currentFilters.status = document.getElementById("statusFilter").value;
}

// Apply filters
function applyFilters() {
  saveFilters();
  filterStockData();
  renderStockTable();
  showNotification("Filters applied successfully");
}

// Switch tab
function switchTab(tab) {
  currentTab = tab;

  // Update active tab
  document.querySelectorAll(".stock-tabs li").forEach((li) => {
    li.classList.remove("active");
    if (li.dataset.tab === tab) {
      li.classList.add("active");
    }
  });

  // Update status filter for low/out tabs
  if (tab === "low") {
    document.getElementById("statusFilter").value = "low_stock";
    currentFilters.status = "low_stock";
  } else if (tab === "out") {
    document.getElementById("statusFilter").value = "out_of_stock";
    currentFilters.status = "out_of_stock";
  } else {
    document.getElementById("statusFilter").value = "all";
    currentFilters.status = "all";
  }

  filterStockData();
  renderStockTable();
}

// Open stock modal
function openStockModal(type) {
  const modal = document.getElementById("stockModal");
  const title = document.getElementById("modalTitle");
  const helpText = document.getElementById("adjustmentHelpText");

  if (type === "in") {
    title.textContent = "Stock In (Add Items)";
    helpText.textContent = "Enter quantity to add to stock";
    document.getElementById("adjustmentQuantity").min = 1;
  } else {
    title.textContent = "Stock Out (Remove Items)";
    helpText.textContent = "Enter quantity to remove from stock";
    document.getElementById("adjustmentQuantity").min = 0;
  }

  modal.style.display = "flex";
  document.getElementById("adjustmentQuantity").focus();
}

// Close stock modal
function closeStockModal() {
  document.getElementById("stockModal").style.display = "none";
  document.getElementById("stockAdjustmentForm").reset();
}

// Populate product select
function populateProductSelect() {
  const select = document.getElementById("productSelect");
  select.innerHTML =
    '<option value="">Select a product</option>' +
    stockData
      .map(
        (product) =>
          `<option value="${product.id}">${product.name} (${product.code})</option>`
      )
      .join("");
}

// Update product details
function updateProductDetails() {
  const productId = document.getElementById("productSelect").value;
  if (!productId) {
    document.getElementById("currentQuantity").value = "";
    document.getElementById("minStock").value = "";
    return;
  }

  const product = stockData.find((p) => p.id == productId);
  if (product) {
    document.getElementById("currentQuantity").value = `${product.stock} units`;
    document.getElementById("minStock").value = `${product.minStock} units`;
  }
}

// Save stock adjustment
function saveStockAdjustment() {
  const form = document.getElementById("stockAdjustmentForm");
  if (!form.checkValidity()) {
    form.reportValidity();
    return;
  }

  const productId = document.getElementById("productSelect").value;
  const adjustment = parseInt(
    document.getElementById("adjustmentQuantity").value
  );
  const reason = document.getElementById("reason").value;
  const notes = document.getElementById("notes").value;
  const isStockIn = document
    .getElementById("modalTitle")
    .textContent.includes("Stock In");

  if (!productId) {
    showNotification("Please select a product", "error");
    return;
  }

  const product = stockData.find((p) => p.id == productId);
  if (!product) {
    showNotification("Product not found", "error");
    return;
  }

  // Calculate new stock
  let newStock;
  if (isStockIn) {
    newStock = product.stock + adjustment;
  } else {
    if (adjustment > product.stock) {
      showNotification(
        `Cannot remove ${adjustment} units. Only ${product.stock} units available.`,
        "error"
      );
      return;
    }
    newStock = product.stock - adjustment;
  }

  // Update product
  const oldStock = product.stock;
  product.stock = newStock;
  product.totalValue = newStock * product.price;
  product.status = getStockStatus(newStock, product.minStock);
  product.lastUpdated = new Date().toISOString();

  // Add to history
  product.history.unshift({
    date: new Date().toISOString(),
    type: isStockIn ? "stock_in" : "stock_out",
    quantity: adjustment,
    user: "Admin User",
    reason: reason,
    notes: notes,
  });

  // Save data
  saveStockData();

  // Update UI
  updateStockStats();
  filterStockData();
  renderStockTable();

  // Close modal and show notification
  closeStockModal();
  showNotification(
    `Stock ${isStockIn ? "added to" : "removed from"} ${
      product.name
    } successfully`
  );
}

// Get stock status
function getStockStatus(stock, minStock) {
  if (stock === 0) return "out_of_stock";
  if (stock <= minStock) return "low_stock";
  return "in_stock";
}

// Save stock data
function saveStockData() {
  localStorage.setItem("stockData", JSON.stringify(stockData));
}

// Adjust stock (quick action)
function adjustStock(productId, type) {
  const product = stockData.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("productSelect").value = productId;
  updateProductDetails();

  if (type === "in") {
    openStockModal("in");
  } else {
    openStockModal("out");
  }
}

// Open bulk modal
function openBulkModal(type) {
  if (selectedProducts.size === 0) {
    showNotification("Please select at least one product", "error");
    return;
  }

  const modal = document.getElementById("bulkStockModal");
  const title = document.getElementById("bulkModalTitle");
  const count = document.getElementById("bulkItemsCount");
  const helpText = document.getElementById("bulkHelpText");

  if (type === "in") {
    title.textContent = "Bulk Stock In";
    helpText.textContent = "Enter quantity to add to all selected products";
  } else {
    title.textContent = "Bulk Stock Out";
    helpText.textContent =
      "Enter quantity to remove from all selected products";
  }

  count.textContent = selectedProducts.size;
  updateSelectedItemsList();

  modal.style.display = "flex";
}

// Close bulk modal
function closeBulkModal() {
  document.getElementById("bulkStockModal").style.display = "none";
  document.getElementById("bulkAdjustmentType").value = "";
  document.getElementById("bulkAdjustmentValue").value = "";
  document.getElementById("bulkReason").value = "";
  document.getElementById("bulkNotes").value = "";
}

// Update selected items list
function updateSelectedItemsList() {
  const list = document.getElementById("selectedItemsList");
  const selectedItems = Array.from(selectedProducts).map((id) => {
    const product = stockData.find((p) => p.id === id);
    return product;
  });

  list.innerHTML = selectedItems
    .map(
      (product) => `
                <div class="selected-item">
                    <span class="item-name">${product.name}</span>
                    <span class="item-stock">${product.stock} units</span>
                </div>
            `
    )
    .join("");
}

// Update bulk help text
function updateBulkHelpText() {
  const type = document.getElementById("bulkAdjustmentType").value;
  const helpText = document.getElementById("bulkHelpText");

  switch (type) {
    case "add":
      helpText.textContent = "Enter quantity to add to all selected products";
      break;
    case "remove":
      helpText.textContent =
        "Enter quantity to remove from all selected products";
      break;
    case "set":
      helpText.textContent =
        "Enter the exact stock level to set for all selected products";
      break;
  }
}

// Save bulk adjustment
function saveBulkAdjustment() {
  const type = document.getElementById("bulkAdjustmentType").value;
  const value = parseInt(document.getElementById("bulkAdjustmentValue").value);
  const reason = document.getElementById("bulkReason").value;
  const notes = document.getElementById("bulkNotes").value;

  if (!type || !value || value < 1 || !reason) {
    showNotification("Please fill all required fields", "error");
    return;
  }

  const updatedProducts = [];
  const errors = [];

  Array.from(selectedProducts).forEach((productId) => {
    const product = stockData.find((p) => p.id === productId);
    if (!product) return;

    let newStock;
    switch (type) {
      case "add":
        newStock = product.stock + value;
        break;
      case "remove":
        if (value > product.stock) {
          errors.push(
            `Cannot remove ${value} units from ${product.name}. Only ${product.stock} available.`
          );
          return;
        }
        newStock = product.stock - value;
        break;
      case "set":
        newStock = value;
        break;
    }

    const oldStock = product.stock;
    product.stock = newStock;
    product.totalValue = newStock * product.price;
    product.status = getStockStatus(newStock, product.minStock);
    product.lastUpdated = new Date().toISOString();

    // Add to history
    product.history.unshift({
      date: new Date().toISOString(),
      type: type === "add" ? "stock_in" : "stock_out",
      quantity: Math.abs(newStock - oldStock),
      user: "Admin User",
      reason: reason,
      notes: `${notes} (Bulk operation)`,
    });

    updatedProducts.push(product.name);
  });

  if (errors.length > 0) {
    showNotification(errors[0], "error");
    return;
  }

  if (updatedProducts.length > 0) {
    saveStockData();
    updateStockStats();
    filterStockData();
    renderStockTable();
    selectedProducts.clear();
    updateSelectedCount();

    closeBulkModal();
    showNotification(`Stock updated for ${updatedProducts.length} products`);
  }
}

// View stock history
function viewStockHistory(productId) {
  const product = stockData.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("historyProductName").textContent = product.name;
  document.getElementById(
    "historyProductCode"
  ).textContent = `Code: ${product.code}`;
  document.getElementById(
    "historyProductCategory"
  ).textContent = `Category: ${product.category}`;

  renderStockHistory(product.history);

  document.getElementById("historyModal").style.display = "flex";
}

// Render stock history
function renderStockHistory(history) {
  const tableBody = document.getElementById("historyTableBody");

  if (history.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" class="empty-history">
                            <i class="bx bx-history"></i>
                            <p>No stock history available</p>
                        </td>
                    </tr>
                `;
    return;
  }

  tableBody.innerHTML = history
    .map(
      (record) => `
                <tr class="history-row ${record.type}">
                    <td>${formatDateTime(record.date)}</td>
                    <td>
                        <span class="history-type type-${record.type}">
                            <i class="bx bx-${
                              record.type === "stock_in" ? "plus" : "minus"
                            }"></i>
                            ${
                              record.type === "stock_in"
                                ? "Stock In"
                                : "Stock Out"
                            }
                        </span>
                    </td>
                    <td class="${
                      record.type === "stock_in" ? "positive" : "negative"
                    }">
                        ${record.type === "stock_in" ? "+" : "-"}${
        record.quantity
      }
                    </td>
                    <td>${
                      record.type === "stock_in" ? "N/A" : "Calculated"
                    }</td>
                    <td>${
                      record.type === "stock_in" ? "Calculated" : "N/A"
                    }</td>
                    <td>${record.user}</td>
                    <td>${getReasonText(record.reason)}</td>
                    <td>${record.notes || "-"}</td>
                </tr>
            `
    )
    .join("");
}

// Get reason text
function getReasonText(reason) {
  const reasons = {
    purchase: "Purchase Order",
    sale: "Sale",
    return: "Return",
    transfer: "Transfer",
    correction: "Stock Correction",
    other: "Other",
  };
  return reasons[reason] || reason;
}

// Apply history filter
function applyHistoryFilter() {
  // In a real app, this would filter the history data
  showNotification("History filters applied");
}

// Export stock history
function exportStockHistory() {
  showNotification("Stock history exported successfully");
}

// Close history modal
function closeHistoryModal() {
  document.getElementById("historyModal").style.display = "none";
}

// Refresh stock data
function refreshStockData() {
  filterStockData();
  renderStockTable();
  updateStockStats();
  showNotification("Stock data refreshed");
}

// Setup sidebar navigation
function setupSidebarNavigation() {
  const sidebarItems = document.querySelectorAll(".sidebar li");
  sidebarItems.forEach((item) => {
    item.addEventListener("click", function () {
      sidebarItems.forEach((li) => li.classList.remove("active"));
      this.classList.add("active");

      const pageName = this.textContent.trim();
      showNotification(`Navigating to ${pageName}`);
    });
  });
}

// Format date and time
function formatDateTime(dateString) {
  const date = new Date(dateString);
  return (
    date.toLocaleDateString() +
    " " +
    date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    })
  );
}

// Show notification
function showNotification(message, type = "success") {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");

  toastMessage.textContent = message;
  toast.className = `toast ${type}`;

  toast.classList.add("show");

  setTimeout(() => {
    toast.classList.remove("show");
  }, 3000);
}

// Make functions available globally
window.adjustStock = adjustStock;
window.viewStockHistory = viewStockHistory;
