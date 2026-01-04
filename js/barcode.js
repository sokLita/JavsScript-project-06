// Global variables
let html5QrCode = null;
let currentProduct = null;
let selectedCameraId = null;
let scanHistory = [];

// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load scan history from localStorage
  loadScanHistory();

  // Update scanner stats
  updateScannerStats();

  // Setup event listeners
  setupEventListeners();

  // Check for camera permissions
  checkCameraPermissions();

  // Initialize QR code scanner
  initializeScanner();
});

// Initialize QR code scanner
function initializeScanner() {
  // html5QrCode will be initialized when starting the scanner
}

// Start scanner
async function startScanner() {
  try {
    // Get camera ID
    const cameras = await Html5Qrcode.getCameras();

    if (cameras && cameras.length === 0) {
      showNotification("No cameras found!", "error");
      return;
    }

    // Use selected camera or first available camera
    let cameraId = selectedCameraId;
    if (!cameraId && cameras.length > 0) {
      cameraId = cameras[0].id;
    }

    // Initialize scanner
    html5QrCode = new Html5Qrcode("reader");

    // Scanner configuration
    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      rememberLastUsedCamera: true,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA],
    };

    // Start scanning
    await html5QrCode.start(cameraId, config, onScanSuccess, onScanFailure);

    // Update UI
    document.getElementById("scannerPlaceholder").style.display = "none";
    document.getElementById("reader").style.display = "block";
    document.getElementById("scannerOverlay").style.display = "block";
    document.getElementById("startScannerBtn").style.display = "none";
    document.getElementById("stopScannerBtn").style.display = "flex";
    document.getElementById("cameraSelectBtn").style.display = "none";

    // Update status
    updateScannerStatus("active", "Scanner active");

    // Show notification
    showNotification("Scanner started successfully!", "success");
  } catch (error) {
    console.error("Error starting scanner:", error);
    showNotification("Failed to start scanner: " + error.message, "error");
    updateScannerStatus("error", "Scanner error");
  }
}

// Stop scanner
function stopScanner() {
  if (html5QrCode) {
    html5QrCode
      .stop()
      .then(() => {
        // Update UI
        document.getElementById("reader").style.display = "none";
        document.getElementById("scannerOverlay").style.display = "none";
        document.getElementById("scannerPlaceholder").style.display = "flex";
        document.getElementById("startScannerBtn").style.display = "flex";
        document.getElementById("stopScannerBtn").style.display = "none";
        document.getElementById("cameraSelectBtn").style.display = "flex";

        // Update status
        updateScannerStatus("inactive", "Scanner inactive");

        // Show notification
        showNotification("Scanner stopped.", "info");

        html5QrCode = null;
      })
      .catch((error) => {
        console.error("Error stopping scanner:", error);
        showNotification("Error stopping scanner", "error");
      });
  }
}

// Handle successful scan
function onScanSuccess(decodedText, decodedResult) {
  // Play scan sound
  playScanSound();

  // Stop scanner temporarily
  if (html5QrCode) {
    html5QrCode.pause();
  }

  // Process scanned barcode
  processScannedBarcode(decodedText);

  // Resume scanning after 2 seconds
  setTimeout(() => {
    if (html5QrCode) {
      html5QrCode.resume();
    }
  }, 2000);
}

// Handle scan failure
function onScanFailure(error) {
  // Optional: handle scan errors
  console.log("Scan error:", error);
}

// Process scanned barcode
function processScannedBarcode(barcode) {
  // Get system data
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];

  // Update scan stats
  updateScanStats("total");

  // Find product by SKU or barcode
  const product = products.find(
    (p) => p.sku === barcode || (p.barcode && p.barcode === barcode)
  );

  if (product) {
    // Product found
    currentProduct = product;
    displayProductResult(product);
    updateScanStats("success");

    // Add to scan history
    addToScanHistory(product, barcode, "found");

    // Show notification
    showNotification(`Product found: ${product.name}`, "success");
  } else {
    // Product not found
    displayProductNotFound(barcode);
    updateScanStats("notfound");

    // Add to scan history
    addToScanHistory(null, barcode, "notfound");

    // Show notification
    showNotification("Product not found in inventory", "warning");
  }

  // Update scanner stats
  updateScannerStats();
}

// Display product result
function displayProductResult(product) {
  const resultsDiv = document.getElementById("scanResults");
  const notFoundDiv = document.getElementById("productNotFound");

  // Show results, hide not found
  resultsDiv.style.display = "block";
  notFoundDiv.style.display = "none";

  // Update product details
  document.getElementById("productName").textContent = product.name;
  document.getElementById("productSku").textContent = `SKU: ${product.sku}`;
  document.getElementById("productCategory").textContent =
    product.category || "Uncategorized";
  document.getElementById("productPrice").textContent = `₹${
    product.price ? product.price.toFixed(2) : "0.00"
  }`;
  document.getElementById("productStock").textContent = `${
    product.currentStock || 0
  } units`;
  document.getElementById("productMinStock").textContent = `${
    product.minStock || 0
  } units`;

  // Calculate stock percentage
  const maxStock = product.maxStock || 100;
  const currentStock = product.currentStock || 0;
  const stockPercentage = Math.min((currentStock / maxStock) * 100, 100);

  // Update stock bar
  const stockFill = document.getElementById("stockFill");
  stockFill.style.width = `${stockPercentage}%`;
  document.getElementById("stockPercentage").textContent = `${Math.round(
    stockPercentage
  )}%`;

  // Set stock bar color based on level
  if (currentStock === 0) {
    stockFill.className = "stock-fill critical";
  } else if (currentStock <= product.minStock) {
    stockFill.className = "stock-fill warning";
  } else {
    stockFill.className = "stock-fill good";
  }
}

// Display product not found
function displayProductNotFound(barcode) {
  const resultsDiv = document.getElementById("scanResults");
  const notFoundDiv = document.getElementById("productNotFound");

  // Show not found, hide results
  notFoundDiv.style.display = "block";
  resultsDiv.style.display = "none";

  // Update barcode
  document.getElementById("scannedBarcode").textContent = barcode;
}

// Add to scan history
function addToScanHistory(product, barcode, status) {
  const scan = {
    id: Date.now(),
    timestamp: new Date().toISOString(),
    barcode: barcode,
    product: product,
    status: status,
  };

  scanHistory.unshift(scan);

  // Keep only last 20 scans
  if (scanHistory.length > 20) {
    scanHistory = scanHistory.slice(0, 20);
  }

  // Save to localStorage
  localStorage.setItem("scanHistory", JSON.stringify(scanHistory));

  // Update UI
  updateScanHistoryDisplay();
}

// Load scan history
function loadScanHistory() {
  const storedHistory = localStorage.getItem("scanHistory");
  if (storedHistory) {
    scanHistory = JSON.parse(storedHistory);
    updateScanHistoryDisplay();
  }
}

// Update scan history display
function updateScanHistoryDisplay() {
  const scansList = document.getElementById("scansList");
  const noScansMessage = document.getElementById("noScansMessage");

  if (scanHistory.length === 0) {
    scansList.innerHTML = "";
    noScansMessage.style.display = "block";
    return;
  }

  noScansMessage.style.display = "none";
  scansList.innerHTML = "";

  scanHistory.forEach((scan) => {
    const scanItem = document.createElement("div");
    scanItem.className = "scan-item";

    let icon = "fa-barcode";
    let color = "#3498db";
    let productName = "Unknown Product";
    let statusText = "Scanned";

    if (scan.status === "found" && scan.product) {
      icon = "fa-check-circle";
      color = "#27ae60";
      productName = scan.product.name;
      statusText = "Product Found";
    } else if (scan.status === "notfound") {
      icon = "fa-exclamation-triangle";
      color = "#f39c12";
      productName = `Barcode: ${scan.barcode}`;
      statusText = "Not Found";
    }

    const time = new Date(scan.timestamp);
    const timeString = time.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });

    scanItem.innerHTML = `
                    <div class="scan-icon" style="background: rgba(${hexToRgb(
                      color
                    )}, 0.1); color: ${color};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="scan-details">
                        <div class="scan-product">${productName}</div>
                        <div class="scan-time">${statusText} • ${timeString}</div>
                    </div>
                `;

    scansList.appendChild(scanItem);
  });
}

// Convert hex color to RGB
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(
        result[3],
        16
      )}`
    : "52, 152, 219";
}

// Update scanner stats
function updateScannerStats() {
  const today = new Date().toISOString().split("T")[0];

  // Count scans by type
  let totalScansToday = 0;
  let successfulScans = 0;
  let notFoundScans = 0;
  let failedScans = 0;

  scanHistory.forEach((scan) => {
    const scanDate = new Date(scan.timestamp).toISOString().split("T")[0];
    if (scanDate === today) {
      totalScansToday++;
    }

    if (scan.status === "found") successfulScans++;
    else if (scan.status === "notfound") notFoundScans++;
  });

  // Update display
  document.getElementById("totalScansToday").textContent = totalScansToday;
  document.getElementById("successfulScans").textContent = successfulScans;
  document.getElementById("notFoundScans").textContent = notFoundScans;
  document.getElementById("failedScans").textContent = failedScans;
}

// Update scan stats
function updateScanStats(type) {
  // This would update counters that persist across sessions
  const stats = JSON.parse(localStorage.getItem("scanStats")) || {
    total: 0,
    success: 0,
    notfound: 0,
    failed: 0,
  };

  if (type === "total") stats.total++;
  else if (type === "success") stats.success++;
  else if (type === "notfound") stats.notfound++;
  else if (type === "failed") stats.failed++;

  localStorage.setItem("scanStats", JSON.stringify(stats));
}

// Update scanner status
function updateScannerStatus(status, text) {
  const indicator = document.getElementById("statusIndicator");
  const statusText = document.getElementById("statusText");

  indicator.className = "status-indicator";

  if (status === "active") {
    indicator.classList.add("status-active");
  } else if (status === "error") {
    indicator.classList.add("status-error");
  } else {
    indicator.classList.add("status-inactive");
  }

  statusText.textContent = text;
}

// Check camera permissions
async function checkCameraPermissions() {
  try {
    // Try to get cameras to check permissions
    const cameras = await Html5Qrcode.getCameras();
    if (cameras && cameras.length > 0) {
      // Cameras available
      updateScannerStatus("inactive", "Scanner ready");
    } else {
      updateScannerStatus("error", "No cameras available");
    }
  } catch (error) {
    console.error("Camera permission error:", error);
    updateScannerStatus("error", "Camera access denied");
  }
}

// Show camera selection modal
async function showCameraSelection() {
  try {
    const cameras = await Html5Qrcode.getCameras();
    const cameraList = document.getElementById("cameraList");
    cameraList.innerHTML = "";

    if (cameras.length === 0) {
      cameraList.innerHTML =
        '<div style="padding: 20px; text-align: center; color: #7f8c8d;">No cameras found</div>';
      return;
    }

    cameras.forEach((camera) => {
      const cameraOption = document.createElement("div");
      cameraOption.className = `camera-option ${
        camera.id === selectedCameraId ? "selected" : ""
      }`;
      cameraOption.dataset.cameraId = camera.id;

      cameraOption.innerHTML = `
                        <div style="font-weight: 600;">${
                          camera.label || "Camera"
                        }</div>
                        <div style="font-size: 12px; color: #7f8c8d;">${
                          camera.id
                        }</div>
                    `;

      cameraOption.addEventListener("click", () => {
        document.querySelectorAll(".camera-option").forEach((opt) => {
          opt.classList.remove("selected");
        });
        cameraOption.classList.add("selected");
        selectedCameraId = camera.id;
      });

      cameraList.appendChild(cameraOption);
    });

    document.getElementById("cameraModal").classList.add("active");
  } catch (error) {
    console.error("Error getting cameras:", error);
    showNotification("Error accessing cameras", "error");
  }
}

// Play scan sound
function playScanSound() {
  try {
    // Create audio context for beep sound
    const audioContext = new (window.AudioContext ||
      window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.value = 800;
    oscillator.type = "sine";

    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(
      0.01,
      audioContext.currentTime + 0.1
    );

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
  } catch (error) {
    console.error("Error playing scan sound:", error);
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

  // Scanner controls
  document
    .getElementById("startScannerBtn")
    .addEventListener("click", startScanner);
  document
    .getElementById("stopScannerBtn")
    .addEventListener("click", stopScanner);
  document
    .getElementById("cameraSelectBtn")
    .addEventListener("click", showCameraSelection);

  // Clear results
  document
    .getElementById("clearResultBtn")
    .addEventListener("click", function () {
      document.getElementById("scanResults").style.display = "none";
    });

  document
    .getElementById("clearNotFoundBtn")
    .addEventListener("click", function () {
      document.getElementById("productNotFound").style.display = "none";
    });

  // Clear history
  document
    .getElementById("clearHistoryBtn")
    .addEventListener("click", function () {
      if (confirm("Clear all scan history?")) {
        scanHistory = [];
        localStorage.removeItem("scanHistory");
        updateScanHistoryDisplay();
        updateScannerStats();
        showNotification("Scan history cleared", "info");
      }
    });

  // Product actions
  document
    .getElementById("viewProductBtn")
    .addEventListener("click", function () {
      if (currentProduct) {
        // In a real app, this would redirect to product page
        alert(`View product: ${currentProduct.name}\nID: ${currentProduct.id}`);
      }
    });

  document.getElementById("stockInBtn").addEventListener("click", function () {
    if (currentProduct) {
      showStockModal("in");
    }
  });

  document.getElementById("stockOutBtn").addEventListener("click", function () {
    if (currentProduct) {
      showStockModal("out");
    }
  });

  document
    .getElementById("adjustStockBtn")
    .addEventListener("click", function () {
      if (currentProduct) {
        showStockModal("set");
      }
    });

  // Product not found actions
  document
    .getElementById("addNewProductBtn")
    .addEventListener("click", function () {
      const barcode = document.getElementById("scannedBarcode").textContent;
      alert(
        `This would open a form to add new product with barcode: ${barcode}`
      );
      // In a real app, redirect to product creation with pre-filled barcode
    });

  document.getElementById("tryAgainBtn").addEventListener("click", function () {
    document.getElementById("productNotFound").style.display = "none";
  });

  // Manual lookup
  document
    .getElementById("manualLookupBtn")
    .addEventListener("click", function () {
      const barcode = document.getElementById("manualBarcode").value.trim();
      if (barcode) {
        processScannedBarcode(barcode);
        document.getElementById("manualBarcode").value = "";
      } else {
        showNotification("Please enter a barcode", "warning");
      }
    });

  // Enter key for manual lookup
  document
    .getElementById("manualBarcode")
    .addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        document.getElementById("manualLookupBtn").click();
      }
    });

  // Camera modal
  document
    .getElementById("closeCameraModal")
    .addEventListener("click", function () {
      document.getElementById("cameraModal").classList.remove("active");
    });

  document
    .getElementById("cancelCameraBtn")
    .addEventListener("click", function () {
      document.getElementById("cameraModal").classList.remove("active");
    });

  document
    .getElementById("selectCameraBtn")
    .addEventListener("click", function () {
      if (selectedCameraId) {
        document.getElementById("cameraModal").classList.remove("active");
        showNotification("Camera selected", "success");

        // Restart scanner if it's running
        if (html5QrCode) {
          stopScanner();
          setTimeout(() => startScanner(), 500);
        }
      } else {
        showNotification("Please select a camera", "warning");
      }
    });

  // Stock modal
  document
    .getElementById("closeStockModal")
    .addEventListener("click", function () {
      document.getElementById("stockModal").classList.remove("active");
    });

  document
    .getElementById("cancelStockBtn")
    .addEventListener("click", function () {
      document.getElementById("stockModal").classList.remove("active");
    });

  document.getElementById("stockForm").addEventListener("submit", function (e) {
    e.preventDefault();
    processStockAdjustment();
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

// Show stock adjustment modal
function showStockModal(type) {
  if (!currentProduct) return;

  const modal = document.getElementById("stockModal");
  const title = document.getElementById("stockModalTitle");
  const productName = document.getElementById("adjustProductName");
  const adjustType = document.getElementById("adjustType");
  const quantity = document.getElementById("adjustQuantity");

  // Set modal title based on type
  if (type === "in") {
    title.textContent = "Stock In";
    adjustType.value = "in";
  } else if (type === "out") {
    title.textContent = "Stock Out";
    adjustType.value = "out";
  } else {
    title.textContent = "Adjust Stock";
    adjustType.value = "set";
    quantity.value = currentProduct.currentStock || 0;
  }

  // Set product name
  productName.value = currentProduct.name;

  // Show modal
  modal.classList.add("active");
}

// Process stock adjustment
function processStockAdjustment() {
  const adjustType = document.getElementById("adjustType").value;
  const quantity = parseInt(document.getElementById("adjustQuantity").value);
  const reason = document.getElementById("adjustReason").value;
  const notes = document.getElementById("adjustNotes").value;

  if (!reason) {
    showNotification("Please select a reason", "warning");
    return;
  }

  // Get system data
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const productIndex = systemData.products.findIndex(
    (p) => p.id === currentProduct.id
  );

  if (productIndex === -1) {
    showNotification("Product not found in database", "error");
    return;
  }

  const product = systemData.products[productIndex];
  const previousStock = product.currentStock || 0;
  let newStock = previousStock;

  // Calculate new stock
  if (adjustType === "in") {
    newStock = previousStock + quantity;
  } else if (adjustType === "out") {
    newStock = previousStock - quantity;
    if (newStock < 0) newStock = 0;
  } else if (adjustType === "set") {
    newStock = quantity;
  }

  // Update product stock
  product.currentStock = newStock;

  // Add stock movement record
  const movement = {
    id: systemData.stockMovements ? systemData.stockMovements.length + 1 : 1,
    date: new Date().toISOString(),
    type:
      adjustType === "in" ? "in" : adjustType === "out" ? "out" : "adjustment",
    productId: product.id,
    productName: product.name,
    quantity:
      adjustType === "set"
        ? newStock - previousStock
        : adjustType === "in"
        ? quantity
        : -quantity,
    previousStock: previousStock,
    newStock: newStock,
    reference: `SCAN-${reason.toUpperCase()}`,
    userId: currentUser ? currentUser.id : 1,
    notes: notes,
  };

  if (!systemData.stockMovements) systemData.stockMovements = [];
  systemData.stockMovements.unshift(movement);

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Update current product
  currentProduct.currentStock = newStock;

  // Update UI
  displayProductResult(currentProduct);

  // Close modal
  document.getElementById("stockModal").classList.remove("active");
  document.getElementById("stockForm").reset();

  // Show notification
  showNotification(
    `Stock updated: ${product.name} (${newStock} units)`,
    "success"
  );
}

// Logout function
function logout() {
  // Stop scanner if running
  if (html5QrCode) {
    stopScanner();
  }

  if (confirm("Are you sure you want to logout?")) {
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

// Add sample scan history if empty
function addSampleScanHistory() {
  const storedHistory = localStorage.getItem("scanHistory");
  if (!storedHistory) {
    // Add some sample scans for demonstration
    const sampleProducts = [
      {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        sku: "WH-001",
        currentStock: 45,
      },
      {
        id: 2,
        name: "Ergonomic Office Chair",
        sku: "OC-002",
        currentStock: 12,
      },
      { id: 3, name: "Smart Fitness Watch", sku: "FW-003", currentStock: 3 },
    ];

    const now = new Date();
    const sampleScans = [
      {
        id: Date.now() - 3600000,
        timestamp: new Date(now.getTime() - 3600000).toISOString(),
        barcode: "WH-001",
        product: sampleProducts[0],
        status: "found",
      },
      {
        id: Date.now() - 7200000,
        timestamp: new Date(now.getTime() - 7200000).toISOString(),
        barcode: "OC-002",
        product: sampleProducts[1],
        status: "found",
      },
      {
        id: Date.now() - 10800000,
        timestamp: new Date(now.getTime() - 10800000).toISOString(),
        barcode: "UNKNOWN-123",
        product: null,
        status: "notfound",
      },
    ];

    localStorage.setItem("scanHistory", JSON.stringify(sampleScans));
    loadScanHistory();
    updateScannerStats();
  }
}

// Call this function on first load
addSampleScanHistory();
