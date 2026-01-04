// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize scanner data
  initializeScanner();
  loadScanHistory();
  setupEventListeners();

  // Check user permissions
  if (userRole === "staff") {
    document.getElementById("updateStockBtn").style.display = "none";
  }
});

// Scanner state
let scannerState = {
  isActive: false,
  torchOn: false,
  scannedToday: 0,
  currentProduct: null,
  scanHistory: [],
};

// Sample product database (barcode -> product)
const productDatabase = {
  5901234123457: {
    id: "P001",
    name: "Wireless Bluetooth Headphones",
    sku: "WH-2023-001",
    category: "Electronics",
    price: 89.99,
    cost: 45.5,
    stock: 45,
    minStock: 10,
    description: "High-quality wireless headphones with noise cancellation",
    status: "in-stock",
  },
  5901234123458: {
    id: "P002",
    name: "Ergonomic Office Chair",
    sku: "OC-2023-002",
    category: "Furniture",
    price: 249.99,
    cost: 150.0,
    stock: 12,
    minStock: 5,
    description: "Adjustable office chair with lumbar support",
    status: "in-stock",
  },
  5901234123459: {
    id: "P003",
    name: "Smart Fitness Watch",
    sku: "FW-2023-003",
    category: "Electronics",
    price: 199.99,
    cost: 120.0,
    stock: 3,
    minStock: 10,
    description: "Waterproof fitness tracker with heart rate monitor",
    status: "low-stock",
  },
  5901234123460: {
    id: "P004",
    name: "Desk Lamp with Wireless Charger",
    sku: "DL-2023-004",
    category: "Home",
    price: 49.99,
    cost: 25.0,
    stock: 0,
    minStock: 15,
    description: "LED desk lamp with built-in wireless charging pad",
    status: "out-of-stock",
  },
  5901234123461: {
    id: "P005",
    name: "Premium Notebook Set",
    sku: "NS-2023-005",
    category: "Stationery",
    price: 24.99,
    cost: 12.5,
    stock: 120,
    minStock: 30,
    description: "Set of 3 premium hardcover notebooks",
    status: "in-stock",
  },
  5901234123462: {
    id: "P006",
    name: "Wireless Gaming Mouse",
    sku: "GM-2023-006",
    category: "Electronics",
    price: 79.99,
    cost: 40.0,
    stock: 5,
    minStock: 10,
    description: "High-precision wireless gaming mouse",
    status: "low-stock",
  },
};

// Initialize scanner
function initializeScanner() {
  // Load scanned count from localStorage
  const today = new Date().toDateString();
  const storedCount = localStorage.getItem(`scannedCount_${today}`);
  scannerState.scannedToday = storedCount ? parseInt(storedCount) : 0;

  // Update UI
  updateScannedCount();

  // Load scan history from localStorage
  const storedHistory = localStorage.getItem("scanHistory");
  if (storedHistory) {
    scannerState.scanHistory = JSON.parse(storedHistory);
  }
}

// Start scanner
function startScanner() {
  if (scannerState.isActive) return;

  scannerState.isActive = true;

  // Update UI
  document.getElementById("scannerStatus").textContent = "Scanner Online";
  document.getElementById("scannerStatus").className =
    "status-badge status-success";
  document.getElementById("scannerPlaceholder").style.display = "none";
  document.getElementById("scannerOverlay").style.display = "flex";
  document.getElementById("startScannerBtn").disabled = true;
  document.getElementById("stopScannerBtn").disabled = false;

  // Show scanning animation
  showNotification(
    "Scanner started. Position barcode within the frame.",
    "success"
  );

  // In a real app, this would initialize the camera
  // For demo, we'll simulate with a timer that auto-scans occasionally
  simulateAutoScan();
}

// Stop scanner
function stopScanner() {
  if (!scannerState.isActive) return;

  scannerState.isActive = false;

  // Update UI
  document.getElementById("scannerStatus").textContent = "Scanner Offline";
  document.getElementById("scannerStatus").className =
    "status-badge status-danger";
  document.getElementById("scannerPlaceholder").style.display = "flex";
  document.getElementById("scannerOverlay").style.display = "none";
  document.getElementById("startScannerBtn").disabled = false;
  document.getElementById("stopScannerBtn").disabled = true;

  // Turn off torch if on
  if (scannerState.torchOn) {
    toggleTorch();
  }

  showNotification("Scanner stopped.", "info");
}

// Toggle torch
function toggleTorch() {
  scannerState.torchOn = !scannerState.torchOn;
  const torchBtn = document.getElementById("toggleTorchBtn");

  if (scannerState.torchOn) {
    torchBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Torch On';
    torchBtn.classList.remove("btn-outline");
    torchBtn.classList.add("btn-warning");
    showNotification("Torch turned on", "info");
  } else {
    torchBtn.innerHTML = '<i class="fas fa-lightbulb"></i> Torch';
    torchBtn.classList.remove("btn-warning");
    torchBtn.classList.add("btn-outline");
    showNotification("Torch turned off", "info");
  }
}

// Simulate auto scanning (for demo purposes)
function simulateAutoScan() {
  if (!scannerState.isActive) return;

  // 10% chance to auto-scan every 5 seconds
  if (Math.random() < 0.1) {
    setTimeout(() => {
      if (scannerState.isActive) {
        performScan(getRandomBarcode());
      }
    }, 2000);
  }

  // Schedule next check
  setTimeout(simulateAutoScan, 5000);
}

// Perform a scan
function performScan(barcode) {
  if (!scannerState.isActive) {
    showNotification("Please start the scanner first.", "warning");
    return;
  }

  // Update scanned count
  scannerState.scannedToday++;
  const today = new Date().toDateString();
  localStorage.setItem(
    `scannedCount_${today}`,
    scannerState.scannedToday.toString()
  );
  updateScannedCount();

  // Update barcode display
  document.getElementById("barcodeDisplay").textContent = barcode;

  // Lookup product
  const product = productDatabase[barcode];

  if (product) {
    // Product found
    scannerState.currentProduct = product;
    displayProductInfo(product);
    addToScanHistory(product, barcode);

    // Play success sound (in a real app)
    showNotification(`Product found: ${product.name}`, "success");
  } else {
    // Product not found
    scannerState.currentProduct = null;
    document.getElementById("productResult").innerHTML = `
                    <div style="text-align: center; padding: 20px;">
                        <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #f39c12; margin-bottom: 15px;"></i>
                        <h4 style="color: #f39c12; margin-bottom: 10px;">Product Not Found</h4>
                        <p>No product found for barcode: ${barcode}</p>
                        <button class="btn btn-primary" onclick="addNewProduct('${barcode}')" style="margin-top: 15px;">
                            <i class="fas fa-plus"></i> Add New Product
                        </button>
                    </div>
                `;
    document.getElementById("productInfo").style.display = "none";

    // Add to history anyway
    addToScanHistory(null, barcode);

    showNotification("Product not found in database.", "warning");
  }
}

// Test scan with random product
function testScan() {
  const barcodes = Object.keys(productDatabase);
  if (barcodes.length === 0) return;

  const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
  performScan(randomBarcode);
}

// Display product information
function displayProductInfo(product) {
  const productInfo = document.getElementById("productInfo");
  const productResult = document.getElementById("productResult");

  // Update product info
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productSKU").textContent = product.sku;
  document.getElementById(
    "productPrice"
  ).textContent = `₹${product.price.toFixed(2)}`;
  document.getElementById(
    "productStock"
  ).textContent = `${product.stock} units`;

  // Update status badge
  const statusBadge = document.getElementById("productStatus");
  statusBadge.textContent =
    product.status === "in-stock"
      ? "In Stock"
      : product.status === "low-stock"
      ? "Low Stock"
      : "Out of Stock";
  statusBadge.className =
    product.status === "in-stock"
      ? "status-badge status-success"
      : product.status === "low-stock"
      ? "status-badge status-warning"
      : "status-badge status-danger";

  // Show product info and hide result message
  productInfo.style.display = "block";
  productResult.innerHTML = "";

  // Update product image (in a real app, this would be the actual product image)
  document.querySelector(".product-image i").className = getProductIcon(
    product.category
  );
}

// Get product icon based on category
function getProductIcon(category) {
  switch (category.toLowerCase()) {
    case "electronics":
      return "fas fa-headphones";
    case "furniture":
      return "fas fa-chair";
    case "home":
      return "fas fa-home";
    case "stationery":
      return "fas fa-pen";
    case "sports":
      return "fas fa-running";
    default:
      return "fas fa-box";
  }
}

// Add to scan history
function addToScanHistory(product, barcode) {
  const scanRecord = {
    id: Date.now(),
    timestamp: new Date().toLocaleString(),
    barcode: barcode,
    product: product ? product.name : "Unknown Product",
    sku: product ? product.sku : "N/A",
    status: product ? "found" : "not_found",
  };

  scannerState.scanHistory.unshift(scanRecord);

  // Keep only last 50 records
  if (scannerState.scanHistory.length > 50) {
    scannerState.scanHistory.pop();
  }

  // Save to localStorage
  localStorage.setItem("scanHistory", JSON.stringify(scannerState.scanHistory));

  // Update history display
  loadScanHistory();
}

// Load scan history
function loadScanHistory() {
  const historyList = document.getElementById("scanHistoryList");
  historyList.innerHTML = "";

  if (scannerState.scanHistory.length === 0) {
    historyList.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <i class="fas fa-history" style="font-size: 40px; margin-bottom: 15px;"></i>
                        <div>No scan history yet</div>
                        <div style="font-size: 14px; margin-top: 10px;">Scan products to see history here</div>
                    </div>
                `;
    return;
  }

  scannerState.scanHistory.forEach((record) => {
    const historyItem = document.createElement("div");
    historyItem.className = "history-item";

    const icon =
      record.status === "found" ? "fa-check-circle" : "fa-exclamation-circle";
    const iconColor =
      record.status === "found"
        ? "var(--success-color)"
        : "var(--warning-color)";

    historyItem.innerHTML = `
                    <div class="history-icon" style="background: ${
                      record.status === "found"
                        ? "rgba(39, 174, 96, 0.1)"
                        : "rgba(243, 156, 18, 0.1)"
                    }; color: ${iconColor}">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="history-details">
                        <div class="history-product">${record.product}</div>
                        <div class="history-time">${record.timestamp} • ${
      record.barcode
    }</div>
                    </div>
                    <div class="history-action">
                        <button class="btn btn-sm btn-outline" onclick="rescanBarcode('${
                          record.barcode
                        }')">
                            <i class="fas fa-redo"></i>
                        </button>
                    </div>
                `;

    historyList.appendChild(historyItem);
  });
}

// Clear scan history
function clearScanHistory() {
  if (
    confirm(
      "Are you sure you want to clear all scan history? This cannot be undone."
    )
  ) {
    scannerState.scanHistory = [];
    localStorage.removeItem("scanHistory");
    loadScanHistory();
    showNotification("Scan history cleared.", "success");
  }
}

// Clear scan results
function clearResults() {
  document.getElementById("barcodeDisplay").textContent =
    "No barcode scanned yet";
  document.getElementById("productResult").innerHTML = `
                <p style="text-align: center; color: #7f8c8d;">Scan a barcode to see product details</p>
            `;
  document.getElementById("productInfo").style.display = "none";
  scannerState.currentProduct = null;
  showNotification("Results cleared.", "info");
}

// Update scanned count display
function updateScannedCount() {
  document.getElementById(
    "scannedCount"
  ).textContent = `Scanned today: ${scannerState.scannedToday} items`;
}

// Get random barcode for testing
function getRandomBarcode() {
  const barcodes = Object.keys(productDatabase);
  return barcodes[Math.floor(Math.random() * barcodes.length)];
}

// Enter barcode manually
function enterBarcode(barcode) {
  document.getElementById("manualBarcode").value = barcode;
}

// Manual barcode lookup
function manualLookup() {
  const barcode = document.getElementById("manualBarcode").value.trim();

  if (!barcode) {
    showNotification("Please enter a barcode.", "warning");
    return;
  }

  if (barcode.length < 12 || barcode.length > 13) {
    showNotification("Barcode should be 12-13 digits.", "warning");
    return;
  }

  // If scanner is active, use it, otherwise just look up
  if (scannerState.isActive) {
    performScan(barcode);
  } else {
    // Just look up without scanner
    const product = productDatabase[barcode];
    document.getElementById("barcodeDisplay").textContent = barcode;

    if (product) {
      scannerState.currentProduct = product;
      displayProductInfo(product);
      addToScanHistory(product, barcode);
      showNotification(`Product found: ${product.name}`, "success");
    } else {
      scannerState.currentProduct = null;
      document.getElementById("productResult").innerHTML = `
                        <div style="text-align: center; padding: 20px;">
                            <i class="fas fa-exclamation-triangle" style="font-size: 40px; color: #f39c12; margin-bottom: 15px;"></i>
                            <h4 style="color: #f39c12; margin-bottom: 10px;">Product Not Found</h4>
                            <p>No product found for barcode: ${barcode}</p>
                            <button class="btn btn-primary" onclick="addNewProduct('${barcode}')" style="margin-top: 15px;">
                                <i class="fas fa-plus"></i> Add New Product
                            </button>
                        </div>
                    `;
      document.getElementById("productInfo").style.display = "none";
      addToScanHistory(null, barcode);
      showNotification("Product not found in database.", "warning");
    }
  }

  // Clear input
  document.getElementById("manualBarcode").value = "";
}

// Rescan barcode from history
function rescanBarcode(barcode) {
  // Start scanner if not active
  if (!scannerState.isActive) {
    startScanner();
    setTimeout(() => performScan(barcode), 1000);
  } else {
    performScan(barcode);
  }
}

// Add new product
function addNewProduct(barcode) {
  alert(
    `This would open a form to add a new product with barcode: ${barcode}\n\nIn a real application, this would redirect to the product management page with the barcode pre-filled.`
  );
}

// View current product
function viewCurrentProduct() {
  if (!scannerState.currentProduct) {
    showNotification("No product selected.", "warning");
    return;
  }

  alert(
    `Viewing product: ${scannerState.currentProduct.name}\n\nIn a real application, this would open the product details page.`
  );
}

// Update stock for current product
function updateStock() {
  if (!scannerState.currentProduct) {
    showNotification("No product selected.", "warning");
    return;
  }

  document.getElementById("updateProductName").textContent =
    scannerState.currentProduct.name;
  document.getElementById("currentStockValue").textContent =
    scannerState.currentProduct.stock;
  document.getElementById("updateQuantity").value = 1;
  document.getElementById("updateNotes").value = "";

  document.getElementById("stockUpdateModal").classList.add("active");
}

// Process stock update
function processStockUpdate(event) {
  event.preventDefault();

  if (!scannerState.currentProduct) return;

  const updateType = document.getElementById("updateType").value;
  const quantity = parseInt(document.getElementById("updateQuantity").value);
  const reason = document.getElementById("updateReason").value;
  const notes = document.getElementById("updateNotes").value;

  if (quantity <= 0) {
    showNotification("Please enter a valid quantity.", "warning");
    return;
  }

  // Update product stock
  if (updateType === "add") {
    scannerState.currentProduct.stock += quantity;
  } else if (updateType === "remove") {
    scannerState.currentProduct.stock -= quantity;
    if (scannerState.currentProduct.stock < 0) {
      scannerState.currentProduct.stock = 0;
    }
  } else if (updateType === "set") {
    scannerState.currentProduct.stock = quantity;
  }

  // Update status
  if (scannerState.currentProduct.stock === 0) {
    scannerState.currentProduct.status = "out-of-stock";
  } else if (
    scannerState.currentProduct.stock <= scannerState.currentProduct.minStock
  ) {
    scannerState.currentProduct.status = "low-stock";
  } else {
    scannerState.currentProduct.status = "in-stock";
  }

  // Update database (in a real app, this would be saved to server)
  productDatabase[
    Object.keys(productDatabase).find(
      (key) => productDatabase[key].id === scannerState.currentProduct.id
    )
  ] = scannerState.currentProduct;

  // Close modal
  document.getElementById("stockUpdateModal").classList.remove("active");

  // Update display
  displayProductInfo(scannerState.currentProduct);

  // Add to history
  addToScanHistory(
    scannerState.currentProduct,
    Object.keys(productDatabase).find(
      (key) => productDatabase[key].id === scannerState.currentProduct.id
    )
  );

  showNotification(
    `Stock updated successfully. New stock: ${scannerState.currentProduct.stock} units`,
    "success"
  );
}

// Sell current product
function sellProduct() {
  if (!scannerState.currentProduct) {
    showNotification("No product selected.", "warning");
    return;
  }

  if (scannerState.currentProduct.stock <= 0) {
    showNotification("Product is out of stock.", "warning");
    return;
  }

  document.getElementById("saleProductName").textContent =
    scannerState.currentProduct.name;
  document.getElementById("availableStock").textContent =
    scannerState.currentProduct.stock;
  document.getElementById("saleQuantity").value = 1;
  document.getElementById("saleQuantity").max =
    scannerState.currentProduct.stock;
  document.getElementById("salePrice").value =
    scannerState.currentProduct.price;
  document.getElementById("saleCustomer").value = "";

  updateSaleSummary();
  document.getElementById("quickSaleModal").classList.add("active");
}

// Update sale summary
function updateSaleSummary() {
  const quantity = parseInt(document.getElementById("saleQuantity").value) || 0;
  const price = parseFloat(document.getElementById("salePrice").value) || 0;
  const subtotal = quantity * price;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  document.getElementById("saleSubtotal").textContent = `₹${subtotal.toFixed(
    2
  )}`;
  document.getElementById("saleTax").textContent = `₹${tax.toFixed(2)}`;
  document.getElementById("saleTotal").textContent = `₹${total.toFixed(2)}`;
}

// Process quick sale
function processQuickSale(event) {
  event.preventDefault();

  if (!scannerState.currentProduct) return;

  const quantity = parseInt(document.getElementById("saleQuantity").value);
  const price = parseFloat(document.getElementById("salePrice").value);
  const customer = document.getElementById("saleCustomer").value;

  if (quantity <= 0) {
    showNotification("Please enter a valid quantity.", "warning");
    return;
  }

  if (quantity > scannerState.currentProduct.stock) {
    showNotification(
      `Insufficient stock. Only ${scannerState.currentProduct.stock} units available.`,
      "warning"
    );
    return;
  }

  if (price <= 0) {
    showNotification("Please enter a valid price.", "warning");
    return;
  }

  // Update product stock
  scannerState.currentProduct.stock -= quantity;

  // Update status
  if (scannerState.currentProduct.stock === 0) {
    scannerState.currentProduct.status = "out-of-stock";
  } else if (
    scannerState.currentProduct.stock <= scannerState.currentProduct.minStock
  ) {
    scannerState.currentProduct.status = "low-stock";
  }

  // Update database
  productDatabase[
    Object.keys(productDatabase).find(
      (key) => productDatabase[key].id === scannerState.currentProduct.id
    )
  ] = scannerState.currentProduct;

  // Close modal
  document.getElementById("quickSaleModal").classList.remove("active");

  // Update display
  displayProductInfo(scannerState.currentProduct);

  // Show success message
  const subtotal = quantity * price;
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  showNotification(
    `Sale processed successfully! ${quantity} x ${
      scannerState.currentProduct.name
    } = ₹${total.toFixed(2)}`,
    "success"
  );

  // In a real app, this would create a sales record
  console.log(
    `Sale recorded: ${quantity} x ${scannerState.currentProduct.name} to ${
      customer || "Walk-in Customer"
    } for ₹${total.toFixed(2)}`
  );
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
  } else if (type === "warning") {
    notification.style.backgroundColor = "var(--warning-color)";
    notification.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
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

  // Scanner buttons
  document
    .getElementById("startScannerBtn")
    .addEventListener("click", startScanner);
  document
    .getElementById("stopScannerBtn")
    .addEventListener("click", stopScanner);
  document.getElementById("scanNowBtn").addEventListener("click", function () {
    if (scannerState.isActive) {
      performScan(getRandomBarcode());
    } else {
      showNotification("Please start the scanner first.", "warning");
    }
  });
  document.getElementById("testScanBtn").addEventListener("click", testScan);
  document
    .getElementById("toggleTorchBtn")
    .addEventListener("click", toggleTorch);

  // Clear buttons
  document
    .getElementById("clearResultsBtn")
    .addEventListener("click", clearResults);
  document
    .getElementById("clearHistoryBtn")
    .addEventListener("click", clearScanHistory);

  // Product action buttons
  document
    .getElementById("viewProductBtn")
    .addEventListener("click", viewCurrentProduct);
  document
    .getElementById("updateStockBtn")
    .addEventListener("click", updateStock);
  document
    .getElementById("sellProductBtn")
    .addEventListener("click", sellProduct);

  // Manual lookup
  document
    .getElementById("manualScanBtn")
    .addEventListener("click", manualLookup);
  document
    .getElementById("manualBarcode")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        manualLookup();
      }
    });

  // Modal close buttons
  document
    .getElementById("closeStockUpdateModal")
    .addEventListener("click", function () {
      document.getElementById("stockUpdateModal").classList.remove("active");
    });
  document
    .getElementById("closeQuickSaleModal")
    .addEventListener("click", function () {
      document.getElementById("quickSaleModal").classList.remove("active");
    });

  // Cancel buttons
  document
    .getElementById("cancelStockUpdateBtn")
    .addEventListener("click", function () {
      document.getElementById("stockUpdateModal").classList.remove("active");
    });
  document
    .getElementById("cancelQuickSaleBtn")
    .addEventListener("click", function () {
      document.getElementById("quickSaleModal").classList.remove("active");
    });

  // Form submissions
  document
    .getElementById("stockUpdateForm")
    .addEventListener("submit", processStockUpdate);
  document
    .getElementById("quickSaleForm")
    .addEventListener("submit", processQuickSale);

  // Sale form updates
  document
    .getElementById("saleQuantity")
    .addEventListener("input", updateSaleSummary);
  document
    .getElementById("salePrice")
    .addEventListener("input", updateSaleSummary);

  // Close modals when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
  });

  // Keyboard shortcuts
  document.addEventListener("keydown", function (e) {
    // Ctrl+S to start scanner
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      if (!scannerState.isActive) {
        startScanner();
      }
    }
    // Ctrl+E to stop scanner
    if (e.ctrlKey && e.key === "e") {
      e.preventDefault();
      if (scannerState.isActive) {
        stopScanner();
      }
    }
    // Space to scan (when scanner is active)
    if (e.key === " " && scannerState.isActive) {
      e.preventDefault();
      performScan(getRandomBarcode());
    }
    // Escape to clear results
    if (e.key === "Escape") {
      clearResults();
    }
  });
}

// Logout function
function logout() {
  if (confirm("Are you sure you want to logout?")) {
    // Stop scanner if active
    if (scannerState.isActive) {
      stopScanner();
    }

    // Clear authentication data
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    // Redirect to login page
    window.location.href = "login.html";
  }
}
