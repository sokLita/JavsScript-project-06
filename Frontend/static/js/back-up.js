// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize backup data
  loadExportData();
  loadBackupHistory();
  setupEventListeners();

  // Check user permissions - only admin can access backup
  if (userRole !== "admin") {
    alert("Access denied. This section requires administrator privileges.");
    window.location.href = "dashboard.html";
  }
});

// Sample backup data
let backupData = {
  exportOptions: [
    {
      id: "products",
      name: "Products",
      records: 1245,
      lastUpdated: "2023-10-18",
      size: "4.2 MB",
      selected: true,
    },
    {
      id: "customers",
      name: "Customers",
      records: 856,
      lastUpdated: "2023-10-18",
      size: "1.8 MB",
      selected: true,
    },
    {
      id: "orders",
      name: "Sales Orders",
      records: 348,
      lastUpdated: "2023-10-18",
      size: "2.1 MB",
      selected: true,
    },
    {
      id: "suppliers",
      name: "Suppliers",
      records: 42,
      lastUpdated: "2023-10-17",
      size: "0.3 MB",
      selected: false,
    },
    {
      id: "categories",
      name: "Categories",
      records: 18,
      lastUpdated: "2023-10-16",
      size: "0.1 MB",
      selected: false,
    },
    {
      id: "inventory",
      name: "Inventory",
      records: 1245,
      lastUpdated: "2023-10-18",
      size: "3.5 MB",
      selected: true,
    },
    {
      id: "transactions",
      name: "Transactions",
      records: 2150,
      lastUpdated: "2023-10-18",
      size: "5.7 MB",
      selected: false,
    },
    {
      id: "users",
      name: "Users",
      records: 12,
      lastUpdated: "2023-10-15",
      size: "0.2 MB",
      selected: false,
    },
  ],
  backupHistory: [
    {
      id: "backup_001",
      name: "Full Backup Oct 18",
      date: "2023-10-18 02:00",
      type: "Full",
      size: "245 MB",
      status: "success",
    },
    {
      id: "backup_002",
      name: "Incremental Oct 17",
      date: "2023-10-17 02:00",
      type: "Incremental",
      size: "45 MB",
      status: "success",
    },
    {
      id: "backup_003",
      name: "Full Backup Oct 10",
      date: "2023-10-10 02:00",
      type: "Full",
      size: "230 MB",
      status: "success",
    },
    {
      id: "backup_004",
      name: "Incremental Oct 09",
      date: "2023-10-09 02:00",
      type: "Incremental",
      size: "38 MB",
      status: "success",
    },
    {
      id: "backup_005",
      name: "Manual Backup Oct 05",
      date: "2023-10-05 14:30",
      type: "Full",
      size: "225 MB",
      status: "success",
    },
    {
      id: "backup_006",
      name: "Failed Backup Oct 03",
      date: "2023-10-03 02:00",
      type: "Full",
      size: "0 MB",
      status: "failed",
    },
    {
      id: "backup_007",
      name: "Incremental Oct 02",
      date: "2023-10-02 02:00",
      type: "Incremental",
      size: "42 MB",
      status: "success",
    },
    {
      id: "backup_008",
      name: "Full Backup Sep 25",
      date: "2023-09-25 02:00",
      type: "Full",
      size: "210 MB",
      status: "success",
    },
  ],
  backupFiles: [
    {
      id: "backup_001",
      name: "Full Backup Oct 18",
      date: "2023-10-18",
      size: "245 MB",
    },
    {
      id: "backup_002",
      name: "Incremental Oct 17",
      date: "2023-10-17",
      size: "45 MB",
    },
    {
      id: "backup_003",
      name: "Full Backup Oct 10",
      date: "2023-10-10",
      size: "230 MB",
    },
    {
      id: "backup_005",
      name: "Manual Backup Oct 05",
      date: "2023-10-05",
      size: "225 MB",
    },
  ],
};

// Current export format
let currentExportFormat = "excel";

// Load export data table
function loadExportData() {
  const exportDataTable = document.getElementById("exportDataTable");
  exportDataTable.innerHTML = "";

  backupData.exportOptions.forEach((item) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                    <td><strong>${item.name}</strong></td>
                    <td>${item.records.toLocaleString()} records</td>
                    <td>${item.lastUpdated}</td>
                    <td>${item.size}</td>
                    <td>
                        <input type="checkbox" class="data-checkbox" data-id="${
                          item.id
                        }" ${item.selected ? "checked" : ""}>
                    </td>
                `;
    exportDataTable.appendChild(row);
  });

  // Update select all checkbox
  updateSelectAllCheckbox();
}

// Load backup history
function loadBackupHistory() {
  const backupHistoryTable = document.getElementById("backupHistoryTable");
  backupHistoryTable.innerHTML = "";

  backupData.backupHistory.forEach((backup) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (backup.status === "success") {
      statusClass = "status-success";
      statusText = "Completed";
    } else {
      statusClass = "status-danger";
      statusText = "Failed";
    }

    row.innerHTML = `
                    <td><strong>${backup.name}</strong></td>
                    <td>${backup.date}</td>
                    <td>${backup.type}</td>
                    <td>${backup.size}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="downloadBackup('${backup.id}')">
                            <i class="fas fa-download"></i>
                        </button>
                        <button class="btn btn-sm btn-success" onclick="restoreBackup('${backup.id}')">
                            <i class="fas fa-redo"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteBackup('${backup.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    backupHistoryTable.appendChild(row);
  });

  // Populate restore backup dropdown
  populateRestoreBackupDropdown();
}

// Populate restore backup dropdown
function populateRestoreBackupDropdown() {
  const selectBackupFile = document.getElementById("selectBackupFile");
  // Clear existing options except the first one
  while (selectBackupFile.options.length > 1) selectBackupFile.remove(1);

  backupData.backupFiles.forEach((backup) => {
    const option = document.createElement("option");
    option.value = backup.id;
    option.textContent = `${backup.name} (${backup.date}, ${backup.size})`;
    selectBackupFile.appendChild(option);
  });
}

// Update select all checkbox
function updateSelectAllCheckbox() {
  const checkboxes = document.querySelectorAll(".data-checkbox");
  const selectAllCheckbox = document.getElementById("selectAllData");

  const allChecked = Array.from(checkboxes).every((cb) => cb.checked);
  const someChecked = Array.from(checkboxes).some((cb) => cb.checked);

  selectAllCheckbox.checked = allChecked;
  selectAllCheckbox.indeterminate = someChecked && !allChecked;
}

// Select all data for export
function selectAllData() {
  const checkboxes = document.querySelectorAll(".data-checkbox");
  const selectAllCheckbox = document.getElementById("selectAllData");

  checkboxes.forEach((cb) => {
    cb.checked = selectAllCheckbox.checked;
  });

  // Update the backupData
  backupData.exportOptions.forEach((item) => {
    item.selected = selectAllCheckbox.checked;
  });
}

// Handle export type selection
function selectExportType(format) {
  currentExportFormat = format;

  // Update UI
  document.querySelectorAll(".export-type").forEach((type) => {
    type.classList.remove("selected");
  });
  document
    .querySelector(`.export-type[data-format="${format}"]`)
    .classList.add("selected");
}

// Create full backup
function createFullBackup() {
  document.getElementById("backupModalTitle").textContent =
    "Creating Full Backup";
  document.getElementById("backupStatusMessage").textContent =
    "Starting full database backup...";
  document.getElementById("backupDetails").style.display = "block";

  // Show modal
  document.getElementById("backupProgressModal").classList.add("active");

  // Start backup simulation
  simulateBackupProcess("full");
}

// Create quick backup
function createQuickBackup() {
  document.getElementById("backupModalTitle").textContent =
    "Creating Quick Backup";
  document.getElementById("backupStatusMessage").textContent =
    "Starting quick backup...";
  document.getElementById("backupDetails").style.display = "none";

  // Show modal
  document.getElementById("backupProgressModal").classList.add("active");

  // Start backup simulation
  simulateBackupProcess("quick");
}

// Simulate backup process
function simulateBackupProcess(type) {
  const progressFill = document.getElementById("progressFill");
  const progressPercentage = document.getElementById("progressPercentage");
  const currentTable = document.getElementById("currentTable");
  const recordsProcessed = document.getElementById("recordsProcessed");
  const estimatedTime = document.getElementById("estimatedTime");

  let progress = 0;
  const totalSteps = type === "full" ? 8 : 4;
  const tables = [
    "Products",
    "Customers",
    "Orders",
    "Suppliers",
    "Categories",
    "Inventory",
    "Transactions",
    "Users",
  ];

  let currentStep = 0;
  let totalRecords = 0;

  const interval = setInterval(
    () => {
      if (type === "full" || currentStep < 4) {
        progress += 100 / totalSteps;
        currentStep++;

        // Update progress bar
        progressFill.style.width = `${progress}%`;
        progressPercentage.textContent = `${Math.round(progress)}%`;

        // Update details
        if (type === "full") {
          const tableName = tables[currentStep - 1];
          const tableRecords =
            backupData.exportOptions.find((item) =>
              item.name.toLowerCase().includes(tableName.toLowerCase())
            )?.records || 100;

          currentTable.textContent = tableName;
          totalRecords += tableRecords;
          recordsProcessed.textContent = totalRecords.toLocaleString();

          // Update estimated time
          const remainingTime = Math.round((100 - progress) / 2);
          estimatedTime.textContent = `${remainingTime} seconds`;
        }

        // Complete the process
        if (progress >= 100) {
          clearInterval(interval);

          // Update UI to show completion
          document.getElementById("backupStatusMessage").textContent =
            "Backup completed successfully!";
          document.getElementById("backupStatusMessage").style.color =
            "var(--success-color)";

          // Add to backup history
          const backupId =
            "backup_" +
            (backupData.backupHistory.length + 1).toString().padStart(3, "0");
          const backupName =
            type === "full"
              ? "Full Backup " +
                new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })
              : "Quick Backup " +
                new Date().toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
          const backupSize = type === "full" ? "245 MB" : "120 MB";

          const newBackup = {
            id: backupId,
            name: backupName,
            date: new Date().toLocaleString("en-US", {
              year: "numeric",
              month: "2-digit",
              day: "2-digit",
              hour: "2-digit",
              minute: "2-digit",
            }),
            type: type === "full" ? "Full" : "Quick",
            size: backupSize,
            status: "success",
          };

          backupData.backupHistory.unshift(newBackup);

          // Also add to backup files if successful
          if (type === "full") {
            backupData.backupFiles.unshift({
              id: backupId,
              name: backupName,
              date: new Date().toISOString().split("T")[0],
              size: backupSize,
            });
          }

          // Reload backup history
          loadBackupHistory();

          // Close modal after 2 seconds
          setTimeout(() => {
            document
              .getElementById("backupProgressModal")
              .classList.remove("active");

            // Reset modal
            progressFill.style.width = "0%";
            progressPercentage.textContent = "0%";
            document.getElementById("backupStatusMessage").textContent =
              "Preparing backup process...";
            document.getElementById("backupStatusMessage").style.color = "";

            // Show success notification
            showNotification(
              `${
                type === "full" ? "Full" : "Quick"
              } backup created successfully!`,
              "success"
            );
          }, 2000);
        }
      }
    },
    type === "full" ? 500 : 300
  );
}

// Start export process
function startExport() {
  // Get selected data
  const selectedData = backupData.exportOptions.filter((item) => item.selected);

  if (selectedData.length === 0) {
    alert("Please select at least one data type to export.");
    return;
  }

  // Get format
  const format = currentExportFormat;

  // Show backup modal for export
  document.getElementById(
    "backupModalTitle"
  ).textContent = `Exporting Data (${format.toUpperCase()})`;
  document.getElementById(
    "backupStatusMessage"
  ).textContent = `Preparing ${format.toUpperCase()} export...`;
  document.getElementById("backupDetails").style.display = "none";

  // Show modal
  document.getElementById("backupProgressModal").classList.add("active");

  // Simulate export process
  const progressFill = document.getElementById("progressFill");
  const progressPercentage = document.getElementById("progressPercentage");

  let progress = 0;
  const interval = setInterval(() => {
    progress += 10;
    progressFill.style.width = `${progress}%`;
    progressPercentage.textContent = `${progress}%`;

    if (progress >= 100) {
      clearInterval(interval);

      // Update UI to show completion
      document.getElementById(
        "backupStatusMessage"
      ).textContent = `Export completed! Downloading ${format.toUpperCase()} file...`;
      document.getElementById("backupStatusMessage").style.color =
        "var(--success-color)";

      // Simulate file download
      setTimeout(() => {
        // Create download link
        const dataStr =
          "data:text/json;charset=utf-8," +
          encodeURIComponent(
            JSON.stringify({
              exportedData: selectedData,
              format: format,
              timestamp: new Date().toISOString(),
            })
          );

        const downloadAnchor = document.createElement("a");
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute(
          "download",
          `inventory_export_${new Date().toISOString().split("T")[0]}.${format}`
        );
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();

        // Close modal
        document
          .getElementById("backupProgressModal")
          .classList.remove("active");

        // Reset modal
        progressFill.style.width = "0%";
        progressPercentage.textContent = "0%";
        document.getElementById("backupStatusMessage").textContent =
          "Preparing backup process...";
        document.getElementById("backupStatusMessage").style.color = "";

        // Show success notification
        showNotification(
          `Data exported successfully as ${format.toUpperCase()}!`,
          "success"
        );
      }, 1000);
    }
  }, 100);
}

// Download backup
function downloadBackup(backupId) {
  const backup = backupData.backupHistory.find((b) => b.id === backupId);
  if (!backup) return;

  // Simulate download
  showNotification(`Downloading backup: ${backup.name}`, "success");

  // In a real app, this would initiate a file download
  setTimeout(() => {
    showNotification(
      `Backup ${backup.name} downloaded successfully!`,
      "success"
    );
  }, 1500);
}

// Restore backup
function restoreBackup(backupId) {
  // Find backup
  const backup = backupData.backupFiles.find((b) => b.id === backupId);
  if (!backup) {
    // Try to find in history
    const historyBackup = backupData.backupHistory.find(
      (b) => b.id === backupId
    );
    if (!historyBackup) {
      alert("Backup file not found!");
      return;
    }
  }

  // Set the backup in dropdown
  const selectBackupFile = document.getElementById("selectBackupFile");
  for (let i = 0; i < selectBackupFile.options.length; i++) {
    if (selectBackupFile.options[i].value === backupId) {
      selectBackupFile.selectedIndex = i;
      break;
    }
  }

  // Show restore modal
  document.getElementById("restoreBackupModal").classList.add("active");
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

  // Remove from history
  backupData.backupHistory = backupData.backupHistory.filter(
    (b) => b.id !== backupId
  );

  // Remove from files
  backupData.backupFiles = backupData.backupFiles.filter(
    (b) => b.id !== backupId
  );

  // Reload tables
  loadBackupHistory();

  showNotification("Backup deleted successfully!", "success");
}

// Handle restore type change
function handleRestoreTypeChange() {
  const partialRestoreRadio = document.getElementById("partialRestore");
  const partialRestoreOptions = document.getElementById(
    "partialRestoreOptions"
  );

  partialRestoreOptions.style.display = partialRestoreRadio.checked
    ? "block"
    : "none";
}

// Confirm restore backup
function confirmRestoreBackup() {
  const backupId = document.getElementById("selectBackupFile").value;
  if (!backupId) {
    alert("Please select a backup file to restore.");
    return;
  }

  const fullRestore = document.getElementById("fullRestore").checked;
  const backupBeforeRestore = document.getElementById(
    "backupBeforeRestore"
  ).checked;

  if (
    confirm(
      `Are you sure you want to restore ${
        fullRestore ? "ALL" : "selected"
      } data from this backup? This will ${
        fullRestore ? "replace all current data" : "update selected tables"
      }.`
    )
  ) {
    // Close modal
    document.getElementById("restoreBackupModal").classList.remove("active");

    // Show backup modal for restore
    document.getElementById("backupModalTitle").textContent =
      "Restoring Backup";
    document.getElementById("backupStatusMessage").textContent =
      backupBeforeRestore
        ? "Creating backup before restore..."
        : "Starting restore process...";
    document.getElementById("backupDetails").style.display = "none";

    // Show modal
    document.getElementById("backupProgressModal").classList.add("active");

    // Simulate restore process
    const progressFill = document.getElementById("progressFill");
    const progressPercentage = document.getElementById("progressPercentage");

    let progress = 0;
    let step = backupBeforeRestore ? 0 : 1; // 0=backup, 1=restore

    const interval = setInterval(() => {
      if (step === 0) {
        // Creating backup phase
        progress += 2;
        if (progress >= 50) {
          step = 1;
          document.getElementById("backupStatusMessage").textContent =
            "Backup created. Starting restore...";
        }
      } else {
        // Restore phase
        progress += 2;
      }

      progressFill.style.width = `${progress}%`;
      progressPercentage.textContent = `${progress}%`;

      if (progress >= 100) {
        clearInterval(interval);

        // Update UI to show completion
        document.getElementById("backupStatusMessage").textContent =
          "Restore completed successfully!";
        document.getElementById("backupStatusMessage").style.color =
          "var(--success-color)";

        // Close modal after 2 seconds
        setTimeout(() => {
          document
            .getElementById("backupProgressModal")
            .classList.remove("active");

          // Reset modal
          progressFill.style.width = "0%";
          progressPercentage.textContent = "0%";
          document.getElementById("backupStatusMessage").textContent =
            "Preparing backup process...";
          document.getElementById("backupStatusMessage").style.color = "";

          // Show success notification
          showNotification(
            "Backup restored successfully! System will reload in 3 seconds...",
            "success"
          );

          // Simulate system reload
          setTimeout(() => {
            showNotification("System reloaded with restored data.", "success");
          }, 3000);
        }, 2000);
      }
    }, 50);
  }
}

// Setup cloud backup
function setupCloudBackup() {
  alert(
    "Cloud Backup Setup:\n\nThis would open a configuration wizard to connect to cloud storage providers like:\n- Google Drive\n- Dropbox\n- AWS S3\n- Microsoft OneDrive\n\nYou would configure API keys, select folders, and set up synchronization rules."
  );
}

// Save backup schedule
function saveBackupSchedule(event) {
  event.preventDefault();

  const frequency = document.getElementById("backupFrequency").value;
  const time = document.getElementById("backupTime").value;
  const type = document.getElementById("backupType").value;
  const retention = document.getElementById("retentionPeriod").value;

  const localStorageChecked = document.getElementById("localStorage").checked;
  const cloudStorageChecked = document.getElementById("cloudStorage").checked;
  const externalDriveChecked = document.getElementById("externalDrive").checked;

  if (!localStorageChecked && !cloudStorageChecked && !externalDriveChecked) {
    alert("Please select at least one backup destination.");
    return;
  }

  // Show success message
  showNotification(
    `Backup schedule saved: ${frequency} at ${time} (${type} backup, ${retention} days retention)`,
    "success"
  );

  // In a real app, this would save the schedule to the server
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
    .getElementById("quickBackupBtn")
    .addEventListener("click", createQuickBackup);
  document
    .getElementById("exportNowBtn")
    .addEventListener("click", startExport);
  document
    .getElementById("fullBackupBtn")
    .addEventListener("click", createFullBackup);
  document
    .getElementById("setupCloudBackupBtn")
    .addEventListener("click", setupCloudBackup);

  // Export type selection
  document.querySelectorAll(".export-type").forEach((type) => {
    type.addEventListener("click", function () {
      const format = this.getAttribute("data-format");
      selectExportType(format);
    });
  });

  // Data selection checkboxes
  document.addEventListener("change", function (e) {
    if (e.target.classList.contains("data-checkbox")) {
      const dataId = e.target.getAttribute("data-id");
      const dataItem = backupData.exportOptions.find(
        (item) => item.id === dataId
      );
      if (dataItem) {
        dataItem.selected = e.target.checked;
      }
      updateSelectAllCheckbox();
    }
  });

  // Select all data checkbox
  document
    .getElementById("selectAllData")
    .addEventListener("change", selectAllData);

  // Select all button
  document
    .getElementById("selectAllBtn")
    .addEventListener("click", function () {
      document.getElementById("selectAllData").checked = true;
      selectAllData();
    });

  // Export cancel button
  document
    .getElementById("cancelExportBtn")
    .addEventListener("click", function () {
      // Reset selections
      backupData.exportOptions.forEach((item) => {
        item.selected = false;
      });
      loadExportData();
    });

  // Start export button
  document
    .getElementById("startExportBtn")
    .addEventListener("click", startExport);

  // Refresh backups button
  document
    .getElementById("refreshBackupsBtn")
    .addEventListener("click", function () {
      loadBackupHistory();
      showNotification("Backup history refreshed!", "success");
    });

  // Clear schedule button
  document
    .getElementById("clearScheduleBtn")
    .addEventListener("click", function () {
      document.getElementById("scheduleForm").reset();
    });

  // Save schedule form
  document
    .getElementById("scheduleForm")
    .addEventListener("submit", saveBackupSchedule);

  // Modal close buttons
  document
    .getElementById("closeBackupModal")
    .addEventListener("click", function () {
      document.getElementById("backupProgressModal").classList.remove("active");
    });

  document
    .getElementById("closeRestoreModal")
    .addEventListener("click", function () {
      document.getElementById("restoreBackupModal").classList.remove("active");
    });

  // Restore type radio buttons
  document
    .getElementById("fullRestore")
    .addEventListener("change", handleRestoreTypeChange);
  document
    .getElementById("partialRestore")
    .addEventListener("change", handleRestoreTypeChange);

  // Cancel restore button
  document
    .getElementById("cancelRestoreBtn")
    .addEventListener("click", function () {
      document.getElementById("restoreBackupModal").classList.remove("active");
    });

  // Confirm restore button
  document
    .getElementById("confirmRestoreBtn")
    .addEventListener("click", confirmRestoreBackup);

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
