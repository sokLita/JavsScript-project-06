// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load backup data
  loadBackupData();
  loadBackupHistory();
  setupEventListeners();

  // Set default backup name with date
  const now = new Date();
  const dateStr = now.toISOString().split("T")[0].replace(/-/g, "");
  document.getElementById("backupName").value = `Backup-${dateStr}`;
});

// Backup data structure
let backupData = {
  backups: [],
  settings: {
    autoBackup: false,
    autoBackupFrequency: "disabled",
    lastAutoBackup: null,
    maxBackups: 10,
    backupRetentionDays: 30,
  },
};

// Load backup data from localStorage
function loadBackupData() {
  const savedBackupData = localStorage.getItem("inventoryBackupData");
  if (savedBackupData) {
    backupData = JSON.parse(savedBackupData);
  }

  // Update UI with backup data
  updateBackupUI();
}

// Save backup data to localStorage
function saveBackupData() {
  localStorage.setItem("inventoryBackupData", JSON.stringify(backupData));
}

// Update backup UI
function updateBackupUI() {
  const settings = backupData.settings;

  // Update auto backup settings
  document.getElementById("autoBackupFrequency").value =
    settings.autoBackupFrequency;

  // Update auto backup button
  const autoBackupBtn = document.getElementById("toggleAutoBackupBtn");
  if (settings.autoBackup) {
    autoBackupBtn.innerHTML =
      '<i class="fas fa-power-off"></i> Disable Auto Backup';
    autoBackupBtn.className = "btn btn-danger";
  } else {
    autoBackupBtn.innerHTML =
      '<i class="fas fa-power-off"></i> Enable Auto Backup';
    autoBackupBtn.className = "btn btn-success";
  }

  // Update last backup time
  if (backupData.backups.length > 0) {
    const latestBackup = backupData.backups[backupData.backups.length - 1];
    const backupDate = new Date(latestBackup.timestamp);
    document.getElementById("lastBackupTime").textContent =
      formatDate(backupDate);

    // Calculate backup size
    const backupSize = calculateBackupSize(latestBackup);
    document.getElementById("backupSize").textContent = backupSize;
  }

  // Update storage indicator
  updateStorageIndicator();
}

// Calculate backup size
function calculateBackupSize(backup) {
  const jsonStr = JSON.stringify(backup);
  const bytes = new Blob([jsonStr]).size;
  const mb = bytes / (1024 * 1024);
  return mb.toFixed(2) + " MB";
}

// Format date
function formatDate(date) {
  const options = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  };
  return date.toLocaleDateString("en-US", options);
}

// Update storage indicator
function updateStorageIndicator() {
  // Calculate total storage used
  let totalSize = 0;
  backupData.backups.forEach((backup) => {
    const jsonStr = JSON.stringify(backup);
    totalSize += new Blob([jsonStr]).size;
  });

  const totalMB = totalSize / (1024 * 1024);
  const maxStorage = 10; // 10 MB max storage
  const percentUsed = (totalMB / maxStorage) * 100;

  document.getElementById("storageFill").style.width =
    Math.min(percentUsed, 100) + "%";
  document.getElementById("storageText").textContent =
    totalMB.toFixed(2) + " MB used";
}

// Load backup history table
function loadBackupHistory() {
  const tableBody = document.getElementById("backupTableBody");
  tableBody.innerHTML = "";

  if (backupData.backups.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-database" style="font-size: 40px; margin-bottom: 15px; display: block;"></i>
                            <h4>No backups found</h4>
                            <p>Create your first backup to get started</p>
                        </td>
                    </tr>
                `;
    return;
  }

  // Sort backups by date (newest first)
  const sortedBackups = [...backupData.backups].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  sortedBackups.forEach((backup) => {
    const row = document.createElement("tr");
    const backupDate = new Date(backup.timestamp);
    const backupSize = calculateBackupSize(backup);

    // Determine status
    let statusClass = "status-success";
    let statusText = "Complete";

    // Check if backup is old (30+ days)
    const today = new Date();
    const daysDiff = Math.floor((today - backupDate) / (1000 * 60 * 60 * 24));
    if (daysDiff > 30) {
      statusClass = "status-warning";
      statusText = "Old";
    }

    row.innerHTML = `
                    <td>
                        <strong>${backup.name}</strong><br>
                        <small style="color: #7f8c8d;">${
                          backup.description || "No description"
                        }</small>
                    </td>
                    <td>${formatDate(backupDate)}</td>
                    <td>${backupSize}</td>
                    <td>${backup.type || "Manual"}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="downloadBackup('${
                          backup.id
                        }')" style="margin-right: 5px;">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="restoreBackupPrompt('${
                          backup.id
                        }')" style="margin-right: 5px;">
                            <i class="fas fa-history"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBackup('${
                          backup.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });

  // Populate restore backup select
  populateRestoreSelect();
}

// Populate restore backup select
function populateRestoreSelect() {
  const select = document.getElementById("restoreBackupSelect");
  select.innerHTML = '<option value="">Select a backup</option>';

  // Sort backups by date (newest first)
  const sortedBackups = [...backupData.backups].sort(
    (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
  );

  sortedBackups.forEach((backup) => {
    const option = document.createElement("option");
    option.value = backup.id;
    option.textContent = `${backup.name} (${formatDate(
      new Date(backup.timestamp)
    )})`;
    select.appendChild(option);
  });
}

// Create a new backup
function createBackup() {
  const backupName =
    document.getElementById("backupName").value.trim() ||
    `Backup-${new Date().toISOString().split("T")[0]}`;
  const backupDescription = document.getElementById("backupDescription").value;

  // Get included data options
  const includeProducts = document.getElementById("includeProducts").checked;
  const includeSales = document.getElementById("includeSales").checked;
  const includePurchases = document.getElementById("includePurchases").checked;
  const includeUsers = document.getElementById("includeUsers").checked;
  const encryptBackup = document.getElementById("encryptBackup").checked;

  // Get system data
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  if (!systemData) {
    showNotification("No data found to backup!", "error");
    return;
  }

  // Create backup object
  const backup = {
    id: "backup_" + Date.now(),
    name: backupName,
    description: backupDescription,
    timestamp: new Date().toISOString(),
    type: "manual",
    encrypted: encryptBackup,
    data: {
      // Only include selected data
      products: includeProducts ? systemData.products : [],
      categories: includeProducts ? systemData.categories : [],
      suppliers: includePurchases ? systemData.suppliers : [],
      sales: includeSales ? systemData.sales : [],
      purchases: includePurchases ? systemData.purchases : [],
      stockMovements: includeProducts ? systemData.stockMovements : [],
      users: includeUsers ? systemData.users : [],
      settings: includeUsers ? systemData.settings : {},
    },
    metadata: {
      productCount: includeProducts ? systemData.products.length : 0,
      saleCount: includeSales ? systemData.sales.length : 0,
      purchaseCount: includePurchases ? systemData.purchases.length : 0,
      userCount: includeUsers ? systemData.users.length : 0,
    },
  };

  // Encrypt if selected (simplified - in real app would use proper encryption)
  if (encryptBackup) {
    backup.data = btoa(JSON.stringify(backup.data)); // Simple base64 encoding
  }

  // Add to backups
  backupData.backups.push(backup);

  // Limit number of backups
  if (backupData.backups.length > backupData.settings.maxBackups) {
    backupData.backups.shift(); // Remove oldest backup
  }

  // Save backup data
  saveBackupData();

  // Update UI
  updateBackupUI();
  loadBackupHistory();

  // Close modal
  document.getElementById("backupModal").classList.remove("active");

  // Show success notification
  showNotification(`Backup "${backupName}" created successfully!`, "success");

  // Simulate backup progress
  simulateBackupProgress();
}

// Simulate backup progress
function simulateBackupProgress() {
  const progressContainer = document.getElementById("progressContainer");
  const progressFill = document.getElementById("progressFill");
  const progressPercent = document.getElementById("progressPercent");

  progressContainer.style.display = "block";

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = progress + "%";
    progressPercent.textContent = progress + "%";

    if (progress >= 100) {
      clearInterval(interval);
      setTimeout(() => {
        progressContainer.style.display = "none";
        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
      }, 1000);
    }
  }, 100);
}

// Download backup
function downloadBackup(backupId) {
  const backup = backupData.backups.find((b) => b.id === backupId);
  if (!backup) {
    showNotification("Backup not found!", "error");
    return;
  }

  // Prepare data for download
  let downloadData;
  if (backup.encrypted) {
    // Decrypt data (simplified)
    try {
      const decrypted = atob(backup.data);
      downloadData = JSON.parse(decrypted);
    } catch (error) {
      showNotification("Failed to decrypt backup!", "error");
      return;
    }
  } else {
    downloadData = backup.data;
  }

  // Create downloadable JSON
  const jsonStr = JSON.stringify(
    {
      ...backup,
      data: downloadData,
    },
    null,
    2
  );

  // Create download link
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${backup.name.replace(/\s+/g, "-")}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification(`Backup "${backup.name}" downloaded!`, "success");
}

// Restore backup prompt
function restoreBackupPrompt(backupId) {
  const backup = backupData.backups.find((b) => b.id === backupId);
  if (!backup) return;

  // Set backup details
  const backupDate = new Date(backup.timestamp);
  const backupSize = calculateBackupSize(backup);

  const details = document.getElementById("backupDetails");
  details.innerHTML = `
                <strong>${backup.name}</strong><br>
                <small>Created: ${formatDate(backupDate)}</small><br>
                <small>Size: ${backupSize}</small><br>
                <small>Type: ${backup.type || "Manual"}</small><br>
                <small>Products: ${
                  backup.metadata?.productCount || 0
                }</small><br>
                <small>Sales: ${backup.metadata?.saleCount || 0}</small>
            `;

  // Set select value
  document.getElementById("restoreBackupSelect").value = backupId;

  // Show modal
  document.getElementById("restoreModal").classList.add("active");
}

// Restore backup
function restoreBackup() {
  const backupId = document.getElementById("restoreBackupSelect").value;
  const backup = backupData.backups.find((b) => b.id === backupId);

  if (!backup) {
    showNotification("Backup not found!", "error");
    return;
  }

  // Get backup data
  let backupDataToRestore;
  if (backup.encrypted) {
    try {
      const decrypted = atob(backup.data);
      backupDataToRestore = JSON.parse(decrypted);
    } catch (error) {
      showNotification("Failed to decrypt backup!", "error");
      return;
    }
  } else {
    backupDataToRestore = backup.data;
  }

  // Create complete system data from backup
  const restoredSystemData = {
    products: backupDataToRestore.products || [],
    categories: backupDataToRestore.categories || [],
    suppliers: backupDataToRestore.suppliers || [],
    sales: backupDataToRestore.sales || [],
    purchases: backupDataToRestore.purchases || [],
    stockMovements: backupDataToRestore.stockMovements || [],
    users: backupDataToRestore.users || [],
    settings: backupDataToRestore.settings || {},
  };

  // Save to localStorage
  localStorage.setItem(
    "inventorySystemData",
    JSON.stringify(restoredSystemData)
  );

  // Close modal
  document.getElementById("restoreModal").classList.remove("active");

  // Show success notification
  showNotification(`Backup "${backup.name}" restored successfully!`, "success");

  // Reload page after 2 seconds
  setTimeout(() => {
    alert("System data has been restored. The page will now reload.");
    window.location.reload();
  }, 2000);
}

// Delete backup
function deleteBackup(backupId) {
  if (
    !confirm(
      "Are you sure you want to delete this backup? This action cannot be undone."
    )
  ) {
    return;
  }

  backupData.backups = backupData.backups.filter((b) => b.id !== backupId);
  saveBackupData();
  loadBackupHistory();
  updateBackupUI();

  showNotification("Backup deleted successfully!", "success");
}

// Delete old backups
function deleteOldBackups() {
  if (!confirm("Delete all backups older than 30 days?")) {
    return;
  }

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const oldBackups = backupData.backups.filter((backup) => {
    return new Date(backup.timestamp) < thirtyDaysAgo;
  });

  if (oldBackups.length === 0) {
    showNotification("No old backups found!", "info");
    return;
  }

  backupData.backups = backupData.backups.filter((backup) => {
    return new Date(backup.timestamp) >= thirtyDaysAgo;
  });

  saveBackupData();
  loadBackupHistory();
  updateBackupUI();

  showNotification(`${oldBackups.length} old backups deleted!`, "success");
}

// Export data in various formats
function exportData(format, type) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  if (!systemData) {
    showNotification("No data to export!", "error");
    return;
  }

  let dataToExport;
  let fileName;
  let mimeType;

  switch (type) {
    case "products":
      dataToExport = systemData.products;
      fileName = "products-export";
      break;
    case "sales":
      dataToExport = systemData.sales;
      fileName = "sales-export";
      break;
    case "inventory":
      dataToExport = systemData.products.map((p) => ({
        name: p.name,
        sku: p.sku,
        category: p.category,
        currentStock: p.currentStock,
        minStock: p.minStock || 0,
        price: p.price,
        status:
          p.currentStock === 0
            ? "Out of Stock"
            : p.currentStock <= (p.minStock || 10)
            ? "Low Stock"
            : "In Stock",
      }));
      fileName = "inventory-export";
      break;
    case "report":
      // Generate report data
      dataToExport = {
        summary: {
          totalProducts: systemData.products.length,
          totalSales: systemData.sales.length,
          totalValue: systemData.products.reduce(
            (sum, p) => sum + p.price * p.currentStock,
            0
          ),
          lowStockItems: systemData.products.filter(
            (p) => p.currentStock <= (p.minStock || 10) && p.currentStock > 0
          ).length,
          outOfStockItems: systemData.products.filter(
            (p) => p.currentStock === 0
          ).length,
        },
        generated: new Date().toISOString(),
      };
      fileName = "inventory-report";
      break;
    default: // 'all'
      dataToExport = systemData;
      fileName = "inventory-full-backup";
      break;
  }

  switch (format) {
    case "json":
      exportAsJSON(dataToExport, fileName);
      break;
    case "csv":
      exportAsCSV(dataToExport, fileName, type);
      break;
    case "pdf":
      showNotification("PDF export feature coming soon!", "info");
      break;
    case "excel":
      showNotification("Excel export feature coming soon!", "info");
      break;
  }
}

// Export as JSON
function exportAsJSON(data, fileName) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Data exported as JSON!", "success");
}

// Export as CSV
function exportAsCSV(data, fileName, type) {
  let csvContent = "";

  if (Array.isArray(data)) {
    // Extract headers
    if (data.length > 0) {
      const headers = Object.keys(data[0]);
      csvContent += headers.join(",") + "\n";

      // Add rows
      data.forEach((item) => {
        const row = headers.map((header) => {
          let value = item[header];
          // Handle special cases
          if (typeof value === "object") {
            value = JSON.stringify(value);
          }
          // Escape commas and quotes
          value = String(value).replace(/"/g, '""');
          if (
            value.includes(",") ||
            value.includes('"') ||
            value.includes("\n")
          ) {
            value = `"${value}"`;
          }
          return value;
        });
        csvContent += row.join(",") + "\n";
      });
    }
  } else {
    // For non-array data (like report)
    csvContent = "Key,Value\n";
    Object.entries(data).forEach(([key, value]) => {
      if (typeof value === "object") {
        csvContent += `${key},"${JSON.stringify(value).replace(/"/g, '""')}"\n`;
      } else {
        csvContent += `${key},${value}\n`;
      }
    });
  }

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${fileName}-${new Date().toISOString().split("T")[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showNotification("Data exported as CSV!", "success");
}

// Handle file upload
function handleFileUpload(file) {
  const fileList = document.getElementById("fileList");

  // Create file item
  const fileItem = document.createElement("div");
  fileItem.className = "file-item";
  fileItem.innerHTML = `
                <div class="file-icon">
                    <i class="fas fa-file-${
                      file.name.endsWith(".json") ? "code" : "csv"
                    }"></i>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${(file.size / 1024).toFixed(
                      2
                    )} KB</div>
                </div>
                <button class="file-remove" onclick="this.parentElement.remove(); document.getElementById('startImportBtn').disabled = true;">
                    <i class="fas fa-times"></i>
                </button>
            `;

  fileList.appendChild(fileItem);

  // Enable import button
  document.getElementById("startImportBtn").disabled = false;

  // Store file reference
  fileItem.dataset.fileName = file.name;
  fileItem.dataset.fileType = file.name.endsWith(".json") ? "json" : "csv";

  // Store file object
  fileItem.file = file;
}

// Import data from file
function importData() {
  const fileItem = document.querySelector(".file-item");
  if (!fileItem || !fileItem.file) {
    showNotification("No file selected!", "error");
    return;
  }

  const file = fileItem.file;
  const fileType = file.name.endsWith(".json") ? "json" : "csv";
  const importOption = document.querySelector(
    'input[name="importOption"]:checked'
  ).value;

  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      if (fileType === "json") {
        const importedData = JSON.parse(e.target.result);

        if (importOption === "replace") {
          // Replace all data
          localStorage.setItem(
            "inventorySystemData",
            JSON.stringify(importedData)
          );
          showNotification(
            "Data imported successfully! System will reload.",
            "success"
          );

          setTimeout(() => {
            window.location.reload();
          }, 2000);
        } else {
          // Merge data
          const currentData = JSON.parse(
            localStorage.getItem("inventorySystemData")
          );
          const mergedData = {
            products: [
              ...(currentData?.products || []),
              ...(importedData.products || []),
            ],
            categories: [
              ...(currentData?.categories || []),
              ...(importedData.categories || []),
            ],
            suppliers: [
              ...(currentData?.suppliers || []),
              ...(importedData.suppliers || []),
            ],
            sales: [
              ...(currentData?.sales || []),
              ...(importedData.sales || []),
            ],
            purchases: [
              ...(currentData?.purchases || []),
              ...(importedData.purchases || []),
            ],
            stockMovements: [
              ...(currentData?.stockMovements || []),
              ...(importedData.stockMovements || []),
            ],
            users: [
              ...(currentData?.users || []),
              ...(importedData.users || []),
            ],
            settings: importedData.settings || currentData?.settings || {},
          };

          localStorage.setItem(
            "inventorySystemData",
            JSON.stringify(mergedData)
          );
          showNotification("Data merged successfully!", "success");
        }
      } else {
        // CSV import - would need more complex parsing
        showNotification(
          "CSV import is not fully implemented in this demo",
          "info"
        );
      }

      // Clear file list
      document.getElementById("fileList").innerHTML = "";
      document.getElementById("startImportBtn").disabled = true;
    } catch (error) {
      showNotification("Error importing file: " + error.message, "error");
    }
  };

  reader.readAsText(file);
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

  // Create backup button
  document
    .getElementById("createBackupBtn")
    .addEventListener("click", function () {
      document.getElementById("backupModal").classList.add("active");
    });

  // Close backup modal
  document
    .getElementById("closeBackupModal")
    .addEventListener("click", function () {
      document.getElementById("backupModal").classList.remove("active");
    });

  // Cancel backup button
  document
    .getElementById("cancelBackupBtn")
    .addEventListener("click", function () {
      document.getElementById("backupModal").classList.remove("active");
    });

  // Confirm backup button
  document
    .getElementById("confirmBackupBtn")
    .addEventListener("click", createBackup);

  // Auto backup frequency change
  document
    .getElementById("autoBackupFrequency")
    .addEventListener("change", function () {
      backupData.settings.autoBackupFrequency = this.value;
      saveBackupData();
      updateBackupUI();
    });

  // Toggle auto backup
  document
    .getElementById("toggleAutoBackupBtn")
    .addEventListener("click", function () {
      backupData.settings.autoBackup = !backupData.settings.autoBackup;
      saveBackupData();
      updateBackupUI();

      if (backupData.settings.autoBackup) {
        showNotification("Auto backup enabled!", "success");
      } else {
        showNotification("Auto backup disabled!", "info");
      }
    });

  // Manage storage button
  document
    .getElementById("manageStorageBtn")
    .addEventListener("click", function () {
      showNotification("Storage management feature coming soon!", "info");
    });

  // Export all button
  document
    .getElementById("exportAllBtn")
    .addEventListener("click", function () {
      exportData("json", "all");
    });

  // Export options
  document.querySelectorAll(".export-option").forEach((option) => {
    option.addEventListener("click", function () {
      const format = this.dataset.format;
      const type = this.dataset.type;
      exportData(format, type);
    });
  });

  // Refresh backups button
  document
    .getElementById("refreshBackupsBtn")
    .addEventListener("click", function () {
      loadBackupHistory();
      showNotification("Backup list refreshed!", "success");
    });

  // Delete old backups button
  document
    .getElementById("deleteOldBackupsBtn")
    .addEventListener("click", deleteOldBackups);

  // File upload area
  const uploadArea = document.getElementById("uploadArea");
  const fileInput = document.getElementById("fileInput");

  uploadArea.addEventListener("click", () => fileInput.click());

  uploadArea.addEventListener("dragover", (e) => {
    e.preventDefault();
    uploadArea.classList.add("dragover");
  });

  uploadArea.addEventListener("dragleave", () => {
    uploadArea.classList.remove("dragover");
  });

  uploadArea.addEventListener("drop", (e) => {
    e.preventDefault();
    uploadArea.classList.remove("dragover");

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  fileInput.addEventListener("change", (e) => {
    if (e.target.files.length > 0) {
      handleFileUpload(e.target.files[0]);
    }
  });

  // Start import button
  document
    .getElementById("startImportBtn")
    .addEventListener("click", importData);

  // Restore backup modal
  document
    .getElementById("closeRestoreModal")
    .addEventListener("click", function () {
      document.getElementById("restoreModal").classList.remove("active");
    });

  document
    .getElementById("cancelRestoreBtn")
    .addEventListener("click", function () {
      document.getElementById("restoreModal").classList.remove("active");
    });

  // Confirm restore checkbox
  document
    .getElementById("confirmRestore")
    .addEventListener("change", function () {
      document.getElementById("confirmRestoreBtn").disabled = !this.checked;
    });

  // Confirm restore button
  document
    .getElementById("confirmRestoreBtn")
    .addEventListener("click", restoreBackup);

  // Restore backup select change
  document
    .getElementById("restoreBackupSelect")
    .addEventListener("change", function () {
      const backupId = this.value;
      if (backupId) {
        const backup = backupData.backups.find((b) => b.id === backupId);
        if (backup) {
          const backupDate = new Date(backup.timestamp);
          const backupSize = calculateBackupSize(backup);

          const details = document.getElementById("backupDetails");
          details.innerHTML = `
                            <strong>${backup.name}</strong><br>
                            <small>Created: ${formatDate(
                              backupDate
                            )}</small><br>
                            <small>Size: ${backupSize}</small><br>
                            <small>Type: ${backup.type || "Manual"}</small><br>
                            <small>Products: ${
                              backup.metadata?.productCount || 0
                            }</small><br>
                            <small>Sales: ${
                              backup.metadata?.saleCount || 0
                            }</small>
                        `;
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
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

// Add sample backups if empty
function addSampleBackupsIfEmpty() {
  if (backupData.backups.length === 0) {
    // Add a sample backup
    const sampleBackup = {
      id: "backup_sample",
      name: "Initial Backup",
      description: "Initial system backup",
      timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
      type: "manual",
      encrypted: false,
      data: "{}", // Empty data for sample
      metadata: {
        productCount: 0,
        saleCount: 0,
        purchaseCount: 0,
        userCount: 3,
      },
    };

    backupData.backups.push(sampleBackup);
    saveBackupData();
    updateBackupUI();
    loadBackupHistory();
  }
}

// Call this function on first load
addSampleBackupsIfEmpty();
