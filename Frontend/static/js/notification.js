// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load notifications
  loadNotifications();
  loadNotificationSettings();
  setupEventListeners();

  // Initialize notification badge
  updateNotificationBadge();
});

// Load notifications from localStorage
function loadNotifications(filter = "all") {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  let notifications = systemData?.notifications || [];
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  // Filter notifications for current user (in a real system, notifications would be user-specific)
  // For now, we'll show all notifications to all users

  // Apply filter
  let filteredNotifications = notifications;

  if (filter === "unread") {
    filteredNotifications = notifications.filter((n) => !n.read);
  } else if (filter === "stock") {
    filteredNotifications = notifications.filter(
      (n) => n.type === "stock_alert"
    );
  } else if (filter === "system") {
    filteredNotifications = notifications.filter((n) => n.type === "system");
  } else if (filter === "sales") {
    filteredNotifications = notifications.filter((n) => n.type === "sales");
  }

  // Sort by date (newest first)
  filteredNotifications.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  // Display notifications
  displayNotifications(filteredNotifications);

  // Update statistics
  updateNotificationStats(notifications);
}

// Display notifications in the list
function displayNotifications(notifications) {
  const notificationsList = document.getElementById("notificationsList");

  if (notifications.length === 0) {
    notificationsList.innerHTML = `
                    <div class="empty-state">
                        <i class="fas fa-bell-slash"></i>
                        <h3>No notifications</h3>
                        <p>You're all caught up! No notifications to display.</p>
                    </div>
                `;
    return;
  }

  notificationsList.innerHTML = "";

  notifications.forEach((notification) => {
    const notificationItem = createNotificationItem(notification);
    notificationsList.appendChild(notificationItem);
  });
}

// Create notification item element
function createNotificationItem(notification) {
  const item = document.createElement("div");
  item.className = `notification-item ${notification.read ? "read" : "unread"}`;
  item.dataset.id = notification.id;

  // Get icon based on type
  let iconClass = "";
  let iconWrapperClass = "";
  let tagClass = "";

  switch (notification.type) {
    case "stock_alert":
      iconClass = "fas fa-exclamation-triangle";
      iconWrapperClass = "stock";
      tagClass = "tag-stock";
      break;
    case "system":
      iconClass = "fas fa-cogs";
      iconWrapperClass = "system";
      tagClass = "tag-system";
      break;
    case "sales":
      iconClass = "fas fa-shopping-cart";
      iconWrapperClass = "sales";
      tagClass = "tag-sales";
      break;
    case "security":
      iconClass = "fas fa-shield-alt";
      iconWrapperClass = "security";
      tagClass = "tag-security";
      break;
    case "user_activity":
      iconClass = "fas fa-user-plus";
      iconWrapperClass = "user";
      tagClass = "tag-user";
      break;
    default:
      iconClass = "fas fa-bell";
      iconWrapperClass = "system";
      tagClass = "tag-system";
  }

  // Format time
  const timeAgo = getTimeAgo(notification.createdAt);

  item.innerHTML = `
                <div class="notification-item-content">
                    <div class="notification-icon-wrapper ${iconWrapperClass}">
                        <i class="${iconClass}"></i>
                    </div>
                    
                    <div class="notification-details">
                        <div class="notification-header-row">
                            <div class="notification-title">${
                              notification.title
                            }</div>
                            <div class="notification-time">${timeAgo}</div>
                        </div>
                        
                        <div class="notification-message">${
                          notification.message
                        }</div>
                        
                        <div class="notification-meta">
                            <span class="notification-tag ${tagClass}">${notification.type
    .replace("_", " ")
    .toUpperCase()}</span>
                            ${
                              notification.priority === "high"
                                ? '<span class="notification-tag tag-security">HIGH PRIORITY</span>'
                                : ""
                            }
                        </div>
                        
                        ${
                          notification.actions
                            ? `
                        <div class="notification-actions">
                            ${notification.actions
                              .map(
                                (action) => `
                                <button class="action-btn ${action.type}" onclick="handleNotificationAction(${notification.id}, '${action.type}')">
                                    ${action.label}
                                </button>
                            `
                              )
                              .join("")}
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
                
                <div class="notification-item-options">
                    <button class="options-btn" onclick="toggleOptionsMenu(${
                      notification.id
                    })">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="options-menu" id="optionsMenu-${
                      notification.id
                    }">
                        <div class="options-item" onclick="markAsRead(${
                          notification.id
                        })">
                            <i class="fas fa-check"></i> Mark as Read
                        </div>
                        <div class="options-item delete" onclick="deleteNotification(${
                          notification.id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </div>
                    </div>
                </div>
            `;

  // Add click event to mark as read
  if (!notification.read) {
    item.addEventListener("click", function (e) {
      if (
        !e.target.closest(".notification-actions") &&
        !e.target.closest(".options-btn") &&
        !e.target.closest(".options-menu")
      ) {
        markAsRead(notification.id);
      }
    });
  }

  return item;
}

// Get time ago format
function getTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now - date;
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 60) {
    return `${diffMins} minute${diffMins !== 1 ? "s" : ""} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours !== 1 ? "s" : ""} ago`;
  } else if (diffDays < 7) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  } else {
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  }
}

// Update notification statistics
function updateNotificationStats(notifications) {
  const total = notifications.length;
  const unread = notifications.filter((n) => !n.read).length;
  const stockAlerts = notifications.filter(
    (n) => n.type === "stock_alert"
  ).length;

  document.getElementById("totalNotifications").textContent = total;
  document.getElementById("unreadNotifications").textContent = unread;
  document.getElementById("stockNotifications").textContent = stockAlerts;

  // Update badge on all pages
  updateNotificationBadge();
}

// Update notification badge
function updateNotificationBadge() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const notifications = systemData?.notifications || [];
  const unreadCount = notifications.filter((n) => !n.read).length;

  // Update badge in current page
  const badge = document.getElementById("notificationBadge");
  if (badge) {
    badge.textContent = unreadCount;
    badge.style.display = unreadCount > 0 ? "flex" : "none";
  }

  // Also update page title if there are unread notifications
  if (unreadCount > 0) {
    document.title = `(${unreadCount}) InventoryPro | Notifications`;
  } else {
    document.title = "InventoryPro | Notifications";
  }
}

// Mark notification as read
function markAsRead(notificationId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const notification = systemData.notifications.find(
    (n) => n.id === notificationId
  );

  if (notification && !notification.read) {
    notification.read = true;
    notification.readAt = new Date().toISOString();

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

    // Update UI
    const notificationItem = document.querySelector(
      `.notification-item[data-id="${notificationId}"]`
    );
    if (notificationItem) {
      notificationItem.classList.remove("unread");
      notificationItem.classList.add("read");
    }

    // Update stats
    updateNotificationStats(systemData.notifications);

    showToast("Notification marked as read", "success");
  }
}

// Mark all notifications as read
function markAllAsRead() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  systemData.notifications.forEach((notification) => {
    if (!notification.read) {
      notification.read = true;
      notification.readAt = new Date().toISOString();
    }
  });

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Update UI
  document.querySelectorAll(".notification-item.unread").forEach((item) => {
    item.classList.remove("unread");
    item.classList.add("read");
  });

  // Update stats
  updateNotificationStats(systemData.notifications);

  showToast("All notifications marked as read", "success");
}

// Delete notification
function deleteNotification(notificationId) {
  if (!confirm("Are you sure you want to delete this notification?")) {
    return;
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  systemData.notifications = systemData.notifications.filter(
    (n) => n.id !== notificationId
  );

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Remove from UI
  const notificationItem = document.querySelector(
    `.notification-item[data-id="${notificationId}"]`
  );
  if (notificationItem) {
    notificationItem.remove();
  }

  // Update stats
  updateNotificationStats(systemData.notifications);

  showToast("Notification deleted", "success");
}

// Delete all notifications
function deleteAllNotifications() {
  if (
    !confirm(
      "Are you sure you want to delete all notifications? This action cannot be undone."
    )
  ) {
    return;
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  systemData.notifications = [];

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Clear UI
  document.getElementById("notificationsList").innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-bell-slash"></i>
                    <h3>No notifications</h3>
                    <p>You're all caught up! No notifications to display.</p>
                </div>
            `;

  // Update stats
  updateNotificationStats([]);

  showToast("All notifications cleared", "success");
}

// Handle notification action
function handleNotificationAction(notificationId, actionType) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const notification = systemData.notifications.find(
    (n) => n.id === notificationId
  );

  if (!notification) return;

  switch (actionType) {
    case "view":
      if (notification.link) {
        window.location.href = notification.link;
      }
      break;
    case "acknowledge":
      markAsRead(notificationId);
      showToast("Notification acknowledged", "success");
      break;
    default:
      console.log("Unknown action type:", actionType);
  }
}

// Toggle options menu
function toggleOptionsMenu(notificationId) {
  const menu = document.getElementById(`optionsMenu-${notificationId}`);
  const allMenus = document.querySelectorAll(".options-menu");

  allMenus.forEach((m) => {
    if (m !== menu) {
      m.classList.remove("active");
    }
  });

  menu.classList.toggle("active");

  // Close menu when clicking outside
  document.addEventListener("click", function closeMenu(e) {
    if (
      !menu.contains(e.target) &&
      !e.target.closest(`#optionsMenu-${notificationId}`)
    ) {
      menu.classList.remove("active");
      document.removeEventListener("click", closeMenu);
    }
  });
}

// Load notification settings
function loadNotificationSettings() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const settings =
    systemData?.notificationSettings || getDefaultNotificationSettings();

  // Apply settings to switches
  document.getElementById("stockAlerts").checked = settings.stockAlerts;
  document.getElementById("outOfStockAlerts").checked =
    settings.outOfStockAlerts;
  document.getElementById("userAlerts").checked = settings.userAlerts;
  document.getElementById("salesAlerts").checked = settings.salesAlerts;
  document.getElementById("systemAlerts").checked = settings.systemAlerts;
  document.getElementById("emailNotifications").checked =
    settings.emailNotifications;
}

// Get default notification settings
function getDefaultNotificationSettings() {
  return {
    stockAlerts: true,
    outOfStockAlerts: true,
    userAlerts: true,
    salesAlerts: true,
    systemAlerts: true,
    emailNotifications: false,
  };
}

// Save notification settings
function saveNotificationSettings() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  systemData.notificationSettings = {
    stockAlerts: document.getElementById("stockAlerts").checked,
    outOfStockAlerts: document.getElementById("outOfStockAlerts").checked,
    userAlerts: document.getElementById("userAlerts").checked,
    salesAlerts: document.getElementById("salesAlerts").checked,
    systemAlerts: document.getElementById("systemAlerts").checked,
    emailNotifications: document.getElementById("emailNotifications").checked,
  };

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  showToast("Notification settings saved", "success");
}

// Show toast notification
function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 20px";
  toast.style.borderRadius = "8px";
  toast.style.color = "white";
  toast.style.fontWeight = "600";
  toast.style.zIndex = "10000";
  toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";

  if (type === "success") {
    toast.style.backgroundColor = "#27ae60";
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  } else if (type === "error") {
    toast.style.backgroundColor = "#e74c3c";
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  } else {
    toast.style.backgroundColor = "#3498db";
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  }

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.remove();
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

  // Filter buttons
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const filter = this.dataset.filter;
      loadNotifications(filter);
    });
  });

  // Action buttons
  document
    .getElementById("markAllReadBtn")
    .addEventListener("click", markAllAsRead);
  document
    .getElementById("clearAllBtn")
    .addEventListener("click", deleteAllNotifications);

  // Save settings when switches change
  document.querySelectorAll(".switch input").forEach((switchEl) => {
    switchEl.addEventListener("change", saveNotificationSettings);
  });

  // Close all options menus when clicking elsewhere
  document.addEventListener("click", function (e) {
    if (!e.target.closest(".options-btn")) {
      document.querySelectorAll(".options-menu").forEach((menu) => {
        menu.classList.remove("active");
      });
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

// Add sample notifications if empty
function addSampleNotificationsIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (!systemData.notifications || systemData.notifications.length === 0) {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    systemData.notifications = [
      {
        id: 1,
        title: "Low Stock Alert",
        message:
          'Product "Wireless Bluetooth Headphones" is running low (5 units left)',
        type: "stock_alert",
        read: false,
        priority: "high",
        createdAt: oneHourAgo.toISOString(),
        link: "products.html",
        actions: [
          { type: "view", label: "View Product" },
          { type: "acknowledge", label: "Acknowledge" },
        ],
      },
      {
        id: 2,
        title: "New User Registered",
        message:
          'A new staff user "John Doe" has been registered to the system',
        type: "user_activity",
        read: false,
        priority: "medium",
        createdAt: oneDayAgo.toISOString(),
        link: "users.html",
      },
      {
        id: 3,
        title: "System Backup Completed",
        message: "Daily system backup has been successfully completed",
        type: "system",
        read: true,
        priority: "low",
        createdAt: twoDaysAgo.toISOString(),
      },
      {
        id: 4,
        title: "Monthly Sales Target Achieved",
        message:
          "Congratulations! Monthly sales target of ₹50,000 has been achieved",
        type: "sales",
        read: true,
        priority: "medium",
        createdAt: twoDaysAgo.toISOString(),
        link: "analytics.html",
      },
      {
        id: 5,
        title: "Out of Stock Alert",
        message:
          'Product "Desk Lamp with Wireless Charger" is out of stock (0 units)',
        type: "stock_alert",
        read: false,
        priority: "high",
        createdAt: oneHourAgo.toISOString(),
        link: "products.html",
        actions: [
          { type: "view", label: "Reorder Now" },
          { type: "acknowledge", label: "Acknowledge" },
        ],
      },
    ];

    // Add default notification settings
    systemData.notificationSettings = getDefaultNotificationSettings();

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
    loadNotifications();
  }
}

// Call this function on first load
addSampleNotificationsIfEmpty();
