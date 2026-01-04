// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load purchases
  loadPurchases();
  setupEventListeners();

  // Set today's date as default
  const today = new Date().toISOString().split("T")[0];
  document.getElementById("purchaseDate").value = today;
  document.getElementById("dateFilter").value = today;

  // Check role for permissions
  if (currentUser.role === "staff") {
    // Staff can only view, not create purchases
    document.getElementById("newPurchaseBtn").style.display = "none";
  }
});

// Global variables
let purchaseItems = [];
let currentPurchaseId = null;

// Load purchases from localStorage
function loadPurchases() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const purchases = systemData?.purchases || [];
  const suppliers = systemData?.suppliers || [];

  // Populate supplier filter
  populateSupplierFilter(suppliers);

  // Populate supplier dropdown in modal
  populateSupplierDropdown(suppliers);

  // Calculate statistics
  updatePurchaseStatistics(purchases);

  // Display purchases
  displayPurchases(purchases);
}

// Populate supplier filter
function populateSupplierFilter(suppliers) {
  const supplierFilter = document.getElementById("supplierFilter");
  supplierFilter.innerHTML = '<option value="">All Suppliers</option>';

  suppliers.forEach((supplier) => {
    const option = document.createElement("option");
    option.value = supplier.id;
    option.textContent = supplier.name;
    supplierFilter.appendChild(option);
  });
}

// Populate supplier dropdown
function populateSupplierDropdown(suppliers) {
  const supplierSelect = document.getElementById("supplier");
  supplierSelect.innerHTML = '<option value="">Select Supplier</option>';

  suppliers.forEach((supplier) => {
    const option = document.createElement("option");
    option.value = supplier.id;
    option.textContent = supplier.name;
    supplierSelect.appendChild(option);
  });
}

// Update purchase statistics
function updatePurchaseStatistics(purchases) {
  const totalPurchases = purchases.length;
  const pendingPurchases = purchases.filter(
    (p) => p.status === "pending"
  ).length;
  const receivedPurchases = purchases.filter(
    (p) => p.status === "received"
  ).length;
  const totalPurchaseValue = purchases.reduce(
    (sum, purchase) => sum + purchase.totalAmount,
    0
  );

  document.getElementById("totalPurchases").textContent = totalPurchases;
  document.getElementById("pendingPurchases").textContent = pendingPurchases;
  document.getElementById("receivedPurchases").textContent = receivedPurchases;
  document.getElementById(
    "totalPurchaseValue"
  ).textContent = `₹${totalPurchaseValue.toLocaleString()}`;
}

// Display purchases in table
function displayPurchases(purchases) {
  const purchasesTable = document.getElementById("purchasesTable");
  const emptyState = document.getElementById("emptyState");
  const tableContainer = document.querySelector(".table-container");

  // Get filter values
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const supplierFilter = document.getElementById("supplierFilter").value;
  const dateFilter = document.getElementById("dateFilter").value;

  // Filter purchases
  let filteredPurchases = purchases.filter((purchase) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      purchase.poNumber.toLowerCase().includes(searchTerm) ||
      purchase.supplierName.toLowerCase().includes(searchTerm) ||
      purchase.items.some((item) =>
        item.productName.toLowerCase().includes(searchTerm)
      );

    // Status filter
    const matchesStatus = !statusFilter || purchase.status === statusFilter;

    // Supplier filter
    const matchesSupplier =
      !supplierFilter || purchase.supplierId.toString() === supplierFilter;

    // Date filter
    let matchesDate = true;
    if (dateFilter) {
      matchesDate = purchase.date === dateFilter;
    }

    return matchesSearch && matchesStatus && matchesSupplier && matchesDate;
  });

  // Show empty state if no purchases
  if (filteredPurchases.length === 0) {
    tableContainer.style.display = "none";
    emptyState.style.display = "block";
    document.getElementById("pagination").innerHTML = "";
    return;
  }

  // Show table
  tableContainer.style.display = "block";
  emptyState.style.display = "none";

  // Display purchases
  purchasesTable.innerHTML = "";

  filteredPurchases.forEach((purchase) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    switch (purchase.status) {
      case "pending":
        statusClass = "status-pending";
        statusText = "Pending";
        break;
      case "ordered":
        statusClass = "status-ordered";
        statusText = "Ordered";
        break;
      case "received":
        statusClass = "status-received";
        statusText = "Received";
        break;
      case "cancelled":
        statusClass = "status-cancelled";
        statusText = "Cancelled";
        break;
    }

    // Count total items
    const totalItems = purchase.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    row.innerHTML = `
                    <td><strong>${purchase.poNumber}</strong></td>
                    <td>${purchase.supplierName}</td>
                    <td>${formatDate(purchase.date)}</td>
                    <td>${totalItems} items</td>
                    <td><strong>₹${purchase.totalAmount.toLocaleString()}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewPurchase(${
                          purchase.id
                        })" style="padding: 5px 10px; margin-right: 5px;">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editPurchase(${
                          purchase.id
                        })" style="padding: 5px 10px; margin-right: 5px;">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deletePurchase(${
                          purchase.id
                        })" style="padding: 5px 10px;">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    purchasesTable.appendChild(row);
  });
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Add item to purchase form
function addPurchaseItem() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];

  if (products.length === 0) {
    alert("No products available. Please add products first.");
    return;
  }

  const itemId = Date.now(); // Unique ID for the item

  const itemRow = document.createElement("tr");
  itemRow.id = `item-${itemId}`;
  itemRow.innerHTML = `
                <td>
                    <select class="form-control item-product" onchange="updateItemPrice(${itemId})" style="width: 100%;">
                        <option value="">Select Product</option>
                        ${products
                          .map(
                            (product) => `
                            <option value="${product.id}" data-price="${product.price}">
                                ${product.name} (Stock: ${product.currentStock})
                            </option>
                        `
                          )
                          .join("")}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control item-quantity" value="1" min="1" onchange="calculateItemTotal(${itemId})" style="width: 100px;">
                </td>
                <td>
                    <input type="number" class="form-control item-price" value="0" min="0" step="0.01" onchange="calculateItemTotal(${itemId})" style="width: 120px;">
                </td>
                <td>
                    <span class="item-total">₹0.00</span>
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removePurchaseItem(${itemId})">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;

  document.getElementById("itemsTableBody").appendChild(itemRow);

  // Add to purchaseItems array
  purchaseItems.push({
    id: itemId,
    productId: "",
    productName: "",
    quantity: 1,
    unitPrice: 0,
    total: 0,
  });

  // Update totals
  updatePurchaseTotals();
}

// Update item price when product is selected
function updateItemPrice(itemId) {
  const productSelect = document.querySelector(`#item-${itemId} .item-product`);
  const priceInput = document.querySelector(`#item-${itemId} .item-price`);
  const selectedOption = productSelect.options[productSelect.selectedIndex];

  if (selectedOption.value) {
    const price = parseFloat(selectedOption.dataset.price);
    priceInput.value = price.toFixed(2);

    // Update purchaseItems array
    const itemIndex = purchaseItems.findIndex((item) => item.id === itemId);
    if (itemIndex !== -1) {
      purchaseItems[itemIndex].productId = selectedOption.value;
      purchaseItems[itemIndex].productName = selectedOption.text.split(" (")[0];
      purchaseItems[itemIndex].unitPrice = price;
    }

    calculateItemTotal(itemId);
  }
}

// Calculate item total
function calculateItemTotal(itemId) {
  const quantityInput = document.querySelector(
    `#item-${itemId} .item-quantity`
  );
  const priceInput = document.querySelector(`#item-${itemId} .item-price`);
  const totalSpan = document.querySelector(`#item-${itemId} .item-total`);

  const quantity = parseInt(quantityInput.value) || 0;
  const price = parseFloat(priceInput.value) || 0;
  const total = quantity * price;

  totalSpan.textContent = `₹${total.toFixed(2)}`;

  // Update purchaseItems array
  const itemIndex = purchaseItems.findIndex((item) => item.id === itemId);
  if (itemIndex !== -1) {
    purchaseItems[itemIndex].quantity = quantity;
    purchaseItems[itemIndex].unitPrice = price;
    purchaseItems[itemIndex].total = total;
  }

  updatePurchaseTotals();
}

// Remove item from purchase form
function removePurchaseItem(itemId) {
  const itemRow = document.getElementById(`item-${itemId}`);
  if (itemRow) {
    itemRow.remove();
  }

  // Remove from purchaseItems array
  purchaseItems = purchaseItems.filter((item) => item.id !== itemId);

  updatePurchaseTotals();
}

// Update purchase totals
function updatePurchaseTotals() {
  const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18; // 18% tax
  const shipping =
    parseFloat(document.getElementById("shippingCost").value) || 0;
  const grandTotal = subtotal + tax + shipping;

  document.getElementById("subtotalDisplay").textContent = `₹${subtotal.toFixed(
    2
  )}`;
  document.getElementById("taxDisplay").textContent = `₹${tax.toFixed(2)}`;
  document.getElementById(
    "grandTotalDisplay"
  ).textContent = `₹${grandTotal.toFixed(2)}`;
}

// View purchase details
function viewPurchase(purchaseId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const purchase = systemData.purchases.find((p) => p.id === purchaseId);

  if (!purchase) return;

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  switch (purchase.status) {
    case "pending":
      statusClass = "status-pending";
      statusText = "Pending";
      break;
    case "ordered":
      statusClass = "status-ordered";
      statusText = "Ordered";
      break;
    case "received":
      statusClass = "status-received";
      statusText = "Received";
      break;
    case "cancelled":
      statusClass = "status-cancelled";
      statusText = "Cancelled";
      break;
  }

  const purchaseDetails = document.getElementById("purchaseDetailsContent");
  purchaseDetails.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 10px;">Purchase Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">PO Number:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  purchase.poNumber
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Supplier:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  purchase.supplierName
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Date:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${formatDate(
                                  purchase.date
                                )}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Status:</td>
                                <td style="padding: 8px 0; font-weight: 600;">
                                    <span class="status-badge ${statusClass}">${statusText}</span>
                                </td>
                            </tr>
                            ${
                              purchase.expectedDate
                                ? `
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Expected Delivery:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${formatDate(
                                  purchase.expectedDate
                                )}</td>
                            </tr>
                            `
                                : ""
                            }
                        </table>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 10px;">Order Summary</h4>
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Subtotal:</span>
                                <span style="font-weight: 600;">₹${purchase.subtotal.toFixed(
                                  2
                                )}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Tax (18%):</span>
                                <span style="font-weight: 600;">₹${purchase.tax.toFixed(
                                  2
                                )}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Shipping:</span>
                                <span style="font-weight: 600;">₹${purchase.shipping.toFixed(
                                  2
                                )}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-top: 15px; padding-top: 15px; border-top: 2px solid #ddd; font-size: 18px; font-weight: 700;">
                                <span>Grand Total:</span>
                                <span>₹${purchase.totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Purchase Items</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>Product</th>
                                    <th>Quantity</th>
                                    <th>Unit Price</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${purchase.items
                                  .map(
                                    (item) => `
                                    <tr>
                                        <td>${item.productName}</td>
                                        <td>${item.quantity}</td>
                                        <td>₹${item.unitPrice.toFixed(2)}</td>
                                        <td><strong>₹${item.total.toFixed(
                                          2
                                        )}</strong></td>
                                    </tr>
                                `
                                  )
                                  .join("")}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                ${
                  purchase.notes
                    ? `
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 10px;">Notes</h4>
                    <p style="background: #f8f9fa; padding: 15px; border-radius: 8px; color: #7f8c8d;">${purchase.notes}</p>
                </div>
                `
                    : ""
                }
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closeViewPurchaseModal()">Close</button>
                    ${
                      purchase.status === "pending"
                        ? `
                    <button class="btn btn-warning" onclick="updatePurchaseStatus(${purchase.id}, 'ordered')">
                        <i class="fas fa-check"></i> Mark as Ordered
                    </button>
                    `
                        : ""
                    }
                    ${
                      purchase.status === "ordered"
                        ? `
                    <button class="btn btn-success" onclick="receivePurchase(${purchase.id})">
                        <i class="fas fa-check-circle"></i> Mark as Received
                    </button>
                    `
                        : ""
                    }
                    ${
                      purchase.status !== "cancelled" &&
                      purchase.status !== "received"
                        ? `
                    <button class="btn btn-danger" onclick="cancelPurchase(${purchase.id})">
                        <i class="fas fa-times"></i> Cancel Order
                    </button>
                    `
                        : ""
                    }
                </div>
            `;

  document.getElementById("viewPurchaseModal").classList.add("active");
}

// Close view purchase modal
function closeViewPurchaseModal() {
  document.getElementById("viewPurchaseModal").classList.remove("active");
}

// Edit purchase
function editPurchase(purchaseId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const purchase = systemData.purchases.find((p) => p.id === purchaseId);

  if (!purchase) return;

  // Check if purchase can be edited (only pending purchases can be edited)
  if (purchase.status !== "pending") {
    alert("Only pending purchases can be edited.");
    return;
  }

  currentPurchaseId = purchaseId;
  document.getElementById("modalTitle").textContent = "Edit Purchase Order";
  document.getElementById("purchaseModal").classList.add("active");

  // Fill form with purchase data
  document.getElementById("poNumber").value = purchase.poNumber;
  document.getElementById("purchaseDate").value = purchase.date;
  document.getElementById("supplier").value = purchase.supplierId;
  document.getElementById("expectedDate").value = purchase.expectedDate || "";
  document.getElementById("purchaseNotes").value = purchase.notes || "";
  document.getElementById("shippingCost").value = purchase.shipping;

  // Clear existing items
  purchaseItems = [];
  document.getElementById("itemsTableBody").innerHTML = "";

  // Add items from purchase
  purchase.items.forEach((item) => {
    const itemId = Date.now() + Math.random();
    const itemRow = document.createElement("tr");
    itemRow.id = `item-${itemId}`;
    itemRow.innerHTML = `
                    <td>
                        <select class="form-control item-product" onchange="updateItemPrice(${itemId})" style="width: 100%;">
                            <option value="">Select Product</option>
                            ${getProductOptions(
                              item.productId,
                              item.productName,
                              item.unitPrice
                            )}
                        </select>
                    </td>
                    <td>
                        <input type="number" class="form-control item-quantity" value="${
                          item.quantity
                        }" min="1" onchange="calculateItemTotal(${itemId})" style="width: 100px;">
                    </td>
                    <td>
                        <input type="number" class="form-control item-price" value="${
                          item.unitPrice
                        }" min="0" step="0.01" onchange="calculateItemTotal(${itemId})" style="width: 120px;">
                    </td>
                    <td>
                        <span class="item-total">₹${item.total.toFixed(
                          2
                        )}</span>
                    </td>
                    <td>
                        <button type="button" class="btn btn-danger btn-sm" onclick="removePurchaseItem(${itemId})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;

    document.getElementById("itemsTableBody").appendChild(itemRow);

    // Add to purchaseItems array
    purchaseItems.push({
      id: itemId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    });
  });

  // Update totals
  updatePurchaseTotals();
}

// Get product options for dropdown
function getProductOptions(
  selectedProductId,
  selectedProductName,
  selectedPrice
) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];

  let options = '<option value="">Select Product</option>';
  products.forEach((product) => {
    const selected = product.id === selectedProductId ? "selected" : "";
    options += `<option value="${product.id}" data-price="${product.price}" ${selected}>
                    ${product.name} (Stock: ${product.currentStock})
                </option>`;
  });

  return options;
}

// Delete purchase
function deletePurchase(purchaseId) {
  if (
    !confirm(
      "Are you sure you want to delete this purchase order? This action cannot be undone."
    )
  ) {
    return;
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  systemData.purchases = systemData.purchases.filter(
    (p) => p.id !== purchaseId
  );

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Show notification
  showNotification("Purchase order deleted successfully!", "success");

  // Reload purchases
  loadPurchases();
}

// Save purchase (add or update)
function savePurchase(event) {
  event.preventDefault();

  // Validate items
  if (purchaseItems.length === 0) {
    alert("Please add at least one item to the purchase order.");
    return;
  }

  // Validate all items have products selected
  const invalidItems = purchaseItems.filter((item) => !item.productId);
  if (invalidItems.length > 0) {
    alert("Please select a product for all items.");
    return;
  }

  // Get form values
  const poNumber = document.getElementById("poNumber").value;
  const purchaseDate = document.getElementById("purchaseDate").value;
  const supplierId = parseInt(document.getElementById("supplier").value);
  const expectedDate = document.getElementById("expectedDate").value || null;
  const notes = document.getElementById("purchaseNotes").value || "";
  const shipping =
    parseFloat(document.getElementById("shippingCost").value) || 0;

  // Get supplier name
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const supplier = systemData.suppliers.find((s) => s.id === supplierId);
  if (!supplier) {
    alert("Please select a valid supplier.");
    return;
  }

  // Calculate totals
  const subtotal = purchaseItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18; // 18% tax
  const totalAmount = subtotal + tax + shipping;

  const purchaseData = {
    poNumber,
    date: purchaseDate,
    supplierId,
    supplierName: supplier.name,
    expectedDate,
    notes,
    items: purchaseItems.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      total: item.total,
    })),
    subtotal,
    tax,
    shipping,
    totalAmount,
    status: "pending",
  };

  // Save to localStorage
  if (currentPurchaseId) {
    // Update existing purchase
    const purchaseIndex = systemData.purchases.findIndex(
      (p) => p.id === currentPurchaseId
    );
    if (purchaseIndex !== -1) {
      purchaseData.id = currentPurchaseId;
      systemData.purchases[purchaseIndex] = purchaseData;
    }
  } else {
    // Add new purchase
    purchaseData.id = generateId(systemData.purchases);
    purchaseData.createdBy = currentUser.name;
    purchaseData.createdAt = new Date().toISOString();
    systemData.purchases.push(purchaseData);
  }

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("purchaseModal").classList.remove("active");
  resetPurchaseForm();

  // Show notification
  showNotification(
    `Purchase order ${currentPurchaseId ? "updated" : "created"} successfully!`,
    "success"
  );

  // Reload purchases
  loadPurchases();
}

// Reset purchase form
function resetPurchaseForm() {
  document.getElementById("purchaseForm").reset();
  purchaseItems = [];
  document.getElementById("itemsTableBody").innerHTML = "";
  currentPurchaseId = null;

  // Set default values
  document.getElementById("purchaseDate").value = new Date()
    .toISOString()
    .split("T")[0];
  document.getElementById("shippingCost").value = 0;

  updatePurchaseTotals();
}

// Generate unique ID
function generateId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

// Update purchase status
function updatePurchaseStatus(purchaseId, status) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const purchaseIndex = systemData.purchases.findIndex(
    (p) => p.id === purchaseId
  );

  if (purchaseIndex === -1) return;

  systemData.purchases[purchaseIndex].status = status;
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  showNotification(`Purchase order marked as ${status}!`, "success");
  closeViewPurchaseModal();
  loadPurchases();
}

// Receive purchase (update inventory)
function receivePurchase(purchaseId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const purchaseIndex = systemData.purchases.findIndex(
    (p) => p.id === purchaseId
  );

  if (purchaseIndex === -1) return;

  const purchase = systemData.purchases[purchaseIndex];

  // Update inventory for each item
  purchase.items.forEach((item) => {
    const productIndex = systemData.products.findIndex(
      (p) => p.id === item.productId
    );
    if (productIndex !== -1) {
      systemData.products[productIndex].currentStock += item.quantity;

      // Update product status based on new stock level
      if (systemData.products[productIndex].currentStock === 0) {
        systemData.products[productIndex].status = "out-of-stock";
      } else if (
        systemData.products[productIndex].currentStock <=
        systemData.products[productIndex].minStock
      ) {
        systemData.products[productIndex].status = "low-stock";
      } else {
        systemData.products[productIndex].status = "in-stock";
      }
    }
  });

  // Update purchase status
  systemData.purchases[purchaseIndex].status = "received";
  systemData.purchases[purchaseIndex].receivedDate = new Date()
    .toISOString()
    .split("T")[0];

  // Add stock movement record
  const movementId = systemData.stockMovements
    ? generateId(systemData.stockMovements)
    : 1;
  const stockMovement = {
    id: movementId,
    date: new Date().toISOString().split("T")[0],
    type: "in",
    purchaseId: purchaseId,
    items: purchase.items.map((item) => ({
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
    })),
    reference: purchase.poNumber,
    userId: currentUser.id,
  };

  if (!systemData.stockMovements) {
    systemData.stockMovements = [];
  }
  systemData.stockMovements.push(stockMovement);

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  showNotification(
    "Purchase received and inventory updated successfully!",
    "success"
  );
  closeViewPurchaseModal();
  loadPurchases();
}

// Cancel purchase
function cancelPurchase(purchaseId) {
  if (!confirm("Are you sure you want to cancel this purchase order?")) {
    return;
  }

  updatePurchaseStatus(purchaseId, "cancelled");
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

  // New purchase button
  document
    .getElementById("newPurchaseBtn")
    .addEventListener("click", function () {
      document.getElementById("modalTitle").textContent = "New Purchase Order";
      document.getElementById("purchaseModal").classList.add("active");
      resetPurchaseForm();

      // Generate PO number
      const poNumber = `PO-${new Date().getFullYear()}-${Math.floor(
        Math.random() * 1000
      )
        .toString()
        .padStart(3, "0")}`;
      document.getElementById("poNumber").value = poNumber;
    });

  // Create first purchase button
  document
    .getElementById("createFirstPurchaseBtn")
    .addEventListener("click", function () {
      document.getElementById("newPurchaseBtn").click();
    });

  // Export button
  document
    .getElementById("exportPurchasesBtn")
    .addEventListener("click", function () {
      showNotification("Purchase data exported successfully!", "success");
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      loadPurchases();
    });

  // Search input
  document.getElementById("searchInput").addEventListener("input", function () {
    loadPurchases();
  });

  // Filter change events
  document
    .getElementById("statusFilter")
    .addEventListener("change", function () {
      loadPurchases();
    });

  document
    .getElementById("supplierFilter")
    .addEventListener("change", function () {
      loadPurchases();
    });

  document.getElementById("dateFilter").addEventListener("change", function () {
    loadPurchases();
  });

  // Add item button
  document
    .getElementById("addItemBtn")
    .addEventListener("click", addPurchaseItem);

  // Shipping cost change
  document
    .getElementById("shippingCost")
    .addEventListener("input", updatePurchaseTotals);

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("purchaseModal").classList.remove("active");
    resetPurchaseForm();
  });

  document
    .getElementById("closeViewModal")
    .addEventListener("click", closeViewPurchaseModal);

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("purchaseModal").classList.remove("active");
    resetPurchaseForm();
  });

  // Purchase form submission
  document
    .getElementById("purchaseForm")
    .addEventListener("submit", savePurchase);

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
      if (e.target.id === "purchaseModal") {
        resetPurchaseForm();
      }
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

  // Add sample suppliers if empty
  if (!systemData.suppliers || systemData.suppliers.length === 0) {
    systemData.suppliers = [
      {
        id: 1,
        name: "Supplier ABC",
        email: "contact@supplierabc.com",
        phone: "+1-234-567-8901",
        address: "123 Business Ave, City, State 12345",
        contactPerson: "John Smith",
      },
      {
        id: 2,
        name: "Supplier XYZ",
        email: "info@supplierxyz.com",
        phone: "+1-987-654-3210",
        address: "456 Commerce St, City, State 67890",
        contactPerson: "Sarah Johnson",
      },
    ];
  }

  // Add sample purchases if empty
  if (!systemData.purchases || systemData.purchases.length === 0) {
    systemData.purchases = [
      {
        id: 1,
        poNumber: "PO-2023-001",
        date: new Date().toISOString().split("T")[0],
        supplierId: 1,
        supplierName: "Supplier ABC",
        items: [
          {
            productId: 1,
            productName: "Wireless Bluetooth Headphones",
            quantity: 20,
            unitPrice: 45.5,
            total: 910.0,
          },
          {
            productId: 2,
            productName: "Ergonomic Office Chair",
            quantity: 5,
            unitPrice: 150.0,
            total: 750.0,
          },
        ],
        subtotal: 1660.0,
        tax: 298.8,
        shipping: 50.0,
        totalAmount: 2008.8,
        status: "received",
        notes: "Initial stock order",
        createdBy: "Administrator",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        poNumber: "PO-2023-002",
        date: new Date().toISOString().split("T")[0],
        supplierId: 2,
        supplierName: "Supplier XYZ",
        items: [
          {
            productId: 3,
            productName: "Smart Fitness Watch",
            quantity: 10,
            unitPrice: 120.0,
            total: 1200.0,
          },
        ],
        subtotal: 1200.0,
        tax: 216.0,
        shipping: 25.0,
        totalAmount: 1441.0,
        status: "ordered",
        expectedDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
        notes: "Backorder for fitness watches",
        createdBy: "Manager",
        createdAt: new Date().toISOString(),
      },
    ];
  }

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
  loadPurchases();
}

// Call this function on first load
addSampleDataIfEmpty();
