// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userName").textContent = userName;
  document.getElementById("userRole").textContent =
    userRole.charAt(0).toUpperCase() + userRole.slice(1);
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();
  document.getElementById(
    "welcomeMessage"
  ).textContent = `Welcome back, ${userName}!`;

  // Update date and time
  updateDateTime();
  setInterval(updateDateTime, 60000); // Update time every minute

  // Initialize charts
  initializeCharts();

  // Load dashboard data
  loadDashboardData();

  // Set up event listeners
  setupEventListeners();

  // Check for new notifications periodically
  setInterval(checkNewNotifications, 30000); // Check every 30 seconds
});

// Update date and time display
function updateDateTime() {
  const now = new Date();

  // Format date
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  document.getElementById("currentDate").textContent = now.toLocaleDateString(
    "en-US",
    options
  );

  // Format time
  let hours = now.getHours();
  let minutes = now.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  minutes = minutes < 10 ? "0" + minutes : minutes;
  document.getElementById(
    "currentTime"
  ).textContent = `${hours}:${minutes} ${ampm}`;
}

// Initialize charts
function initializeCharts() {
  // Sales Performance Chart
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: [
        "Oct 17",
        "Oct 18",
        "Oct 19",
        "Oct 20",
        "Oct 21",
        "Oct 22",
        "Oct 23",
      ],
      datasets: [
        {
          label: "Sales ($)",
          data: [45000, 52000, 61000, 58000, 72000, 68000, 84520],
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
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Inventory Distribution Chart
  const inventoryCtx = document
    .getElementById("inventoryChart")
    .getContext("2d");
  new Chart(inventoryCtx, {
    type: "doughnut",
    data: {
      labels: ["In Stock", "Low Stock", "Out of Stock"],
      datasets: [
        {
          data: [85, 12, 3],
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

// Load dashboard data
function loadDashboardData() {
  loadActivities();
  loadNotifications();
  loadRecentOrders();
  updateMetrics();
}

// Sample activities data
const activities = [
  {
    icon: "shopping-cart",
    text: "New order #ORD-2023-125 from John Smith",
    time: "10 minutes ago",
  },
  {
    icon: "box",
    text: 'Product "Wireless Headphones" stock updated (45 units added)',
    time: "45 minutes ago",
  },
  {
    icon: "user",
    text: 'New staff member "Jane Doe" added to the system',
    time: "2 hours ago",
  },
  {
    icon: "chart-line",
    text: "Monthly sales report generated for October 2023",
    time: "5 hours ago",
  },
  {
    icon: "exclamation-triangle",
    text: 'Low stock alert for "Wireless Mouse" (only 5 units left)',
    time: "1 day ago",
  },
];

// Sample notifications data
let notifications = [
  {
    id: 1,
    icon: "exclamation-triangle",
    text: 'Product "Desk Lamp" is out of stock',
    time: "2 hours ago",
    read: false,
  },
  {
    id: 2,
    icon: "shopping-cart",
    text: "New order #ORD-2023-124 requires processing",
    time: "3 hours ago",
    read: false,
  },
  {
    id: 3,
    icon: "truck",
    text: "Shipment from Supplier ABC has arrived",
    time: "1 day ago",
    read: true,
  },
  {
    id: 4,
    icon: "chart-line",
    text: "Sales target achieved for this week",
    time: "2 days ago",
    read: true,
  },
  {
    id: 5,
    icon: "user",
    text: "Customer feedback received for order #ORD-2023-120",
    time: "3 days ago",
    read: true,
  },
];

// Sample orders data
const recentOrders = [
  {
    id: "ORD-2023-125",
    customer: "John Smith",
    date: "2023-10-23 14:30",
    amount: 448.36,
    status: "processing",
  },
  {
    id: "ORD-2023-124",
    customer: "Sarah Johnson",
    date: "2023-10-23 11:15",
    amount: 294.99,
    status: "pending",
  },
  {
    id: "ORD-2023-123",
    customer: "Michael Chen",
    date: "2023-10-22 16:45",
    amount: 159.24,
    status: "completed",
  },
  {
    id: "ORD-2023-122",
    customer: "Emily Davis",
    date: "2023-10-22 10:20",
    amount: 165.18,
    status: "completed",
  },
  {
    id: "ORD-2023-121",
    customer: "Robert Wilson",
    date: "2023-10-21 09:30",
    amount: 58.99,
    status: "cancelled",
  },
];

// Load activities
function loadActivities() {
  const activityList = document.getElementById("activityList");
  activityList.innerHTML = "";

  activities.forEach((activity) => {
    const item = document.createElement("li");
    item.className = "activity-item";
    item.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas fa-${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-text">${activity.text}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                `;
    activityList.appendChild(item);
  });
}

// Load notifications
function loadNotifications() {
  const notificationsList = document.getElementById("notificationsList");
  const allNotificationsList = document.getElementById("allNotificationsList");

  // Clear existing notifications
  notificationsList.innerHTML = "";
  allNotificationsList.innerHTML = "";

  // Calculate unread count
  const unreadCount = notifications.filter((n) => !n.read).length;
  document.getElementById("notificationCount").textContent = unreadCount;

  // Display recent notifications (max 3)
  const recentNotifications = notifications.slice(0, 3);

  recentNotifications.forEach((notification) => {
    const item = document.createElement("div");
    item.className = `notification-item ${notification.read ? "" : "unread"}`;
    item.dataset.id = notification.id;
    item.innerHTML = `
                    <div class="notification-icon">
                        <i class="fas fa-${notification.icon}"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-text">${notification.text}</div>
                        <div class="notification-time">${notification.time}</div>
                    </div>
                `;
    notificationsList.appendChild(item);

    // Add click event to mark as read
    item.addEventListener("click", function () {
      markNotificationAsRead(notification.id);
    });
  });

  // Display all notifications in modal
  notifications.forEach((notification) => {
    const item = document.createElement("div");
    item.className = `notification-item ${notification.read ? "" : "unread"}`;
    item.dataset.id = notification.id;
    item.innerHTML = `
                    <div class="notification-icon">
                        <i class="fas fa-${notification.icon}"></i>
                    </div>
                    <div class="notification-details">
                        <div class="notification-text">${
                          notification.text
                        }</div>
                        <div class="notification-time">${
                          notification.time
                        }</div>
                    </div>
                    ${
                      !notification.read
                        ? '<div class="badge" style="position: relative; top: 0; right: 0;">New</div>'
                        : ""
                    }
                `;
    allNotificationsList.appendChild(item);

    // Add click event to mark as read
    item.addEventListener("click", function () {
      markNotificationAsRead(notification.id);
    });
  });
}

// Load recent orders
function loadRecentOrders() {
  const recentOrdersTable = document.getElementById("recentOrdersTable");
  recentOrdersTable.innerHTML = "";

  recentOrders.forEach((order) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (order.status === "completed") {
      statusClass = "status-completed";
      statusText = "Completed";
    } else if (order.status === "pending") {
      statusClass = "status-pending";
      statusText = "Pending";
    } else if (order.status === "processing") {
      statusClass = "status-processing";
      statusText = "Processing";
    } else {
      statusClass = "status-cancelled";
      statusText = "Cancelled";
    }

    row.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${order.customer}</td>
                    <td>${order.date}</td>
                    <td><strong>$${order.amount.toFixed(2)}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="icon-btn" style="font-size: 14px;" onclick="viewOrder('${
                          order.id
                        }')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </td>
                `;
    recentOrdersTable.appendChild(row);
  });
}

// Update metrics
function updateMetrics() {
  // In a real app, these would come from an API
  // For now, we'll use sample data
  const conversionRate = 3.8 + (Math.random() * 0.5 - 0.25); // Random variation
  const customerSatisfaction = 94 + (Math.random() * 2 - 1);
  const orderFulfillment = 98.5 + (Math.random() * 0.5 - 0.25);
  const returnRate = 2.1 + (Math.random() * 0.3 - 0.15);

  document.getElementById("conversionRate").textContent =
    conversionRate.toFixed(1) + "%";
  document.getElementById("customerSatisfaction").textContent =
    customerSatisfaction.toFixed(0) + "%";
  document.getElementById("orderFulfillment").textContent =
    orderFulfillment.toFixed(1) + "%";
  document.getElementById("returnRate").textContent =
    returnRate.toFixed(1) + "%";
}

// Mark notification as read
function markNotificationAsRead(id) {
  const notification = notifications.find((n) => n.id === id);
  if (notification && !notification.read) {
    notification.read = true;
    loadNotifications();

    // Show confirmation
    showToast("Notification marked as read", "success");
  }
}

// Mark all notifications as read
function markAllNotificationsAsRead() {
  notifications.forEach((notification) => {
    notification.read = true;
  });
  loadNotifications();

  // Show confirmation
  showToast("All notifications marked as read", "success");
}

// Check for new notifications
function checkNewNotifications() {
  // In a real app, this would check with an API
  // For demo, we'll randomly add new notifications
  if (Math.random() > 0.7) {
    // 30% chance
    const newNotification = {
      id: notifications.length + 1,
      icon: "info-circle",
      text: "System maintenance scheduled for tonight",
      time: "Just now",
      read: false,
    };

    notifications.unshift(newNotification);

    // Keep only last 10 notifications
    if (notifications.length > 10) {
      notifications.pop();
    }

    loadNotifications();

    // Show toast notification
    showToast("New notification received", "info");
  }
}

// View order details
function viewOrder(orderId) {
  alert(
    `Viewing order: ${orderId}\nIn a real app, this would open the order details page.`
  );
}

// Show toast notification
function showToast(message, type) {
  const toast = document.createElement("div");
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "15px 20px";
  toast.style.borderRadius = "8px";
  toast.style.color = "white";
  toast.style.fontWeight = "600";
  toast.style.zIndex = "10000";
  toast.style.boxShadow = "0 5px 15px rgba(0,0,0,0.2)";
  toast.style.display = "flex";
  toast.style.alignItems = "center";
  toast.style.gap = "10px";
  toast.style.animation = "slideIn 0.3s ease";

  // Add animation
  const style = document.createElement("style");
  style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
  document.head.appendChild(style);

  if (type === "success") {
    toast.style.backgroundColor = "var(--success-color)";
    toast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
  } else if (type === "error") {
    toast.style.backgroundColor = "var(--accent-color)";
    toast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
  } else if (type === "info") {
    toast.style.backgroundColor = "var(--secondary-color)";
    toast.innerHTML = `<i class="fas fa-info-circle"></i> ${message}`;
  } else {
    toast.style.backgroundColor = "var(--warning-color)";
    toast.innerHTML = `<i class="fas fa-exclamation-triangle"></i> ${message}`;
  }

  document.body.appendChild(toast);

  // Remove toast after 3 seconds
  setTimeout(() => {
    toast.style.animation = "slideOut 0.3s ease";
    setTimeout(() => {
      toast.remove();
    }, 300);
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

  // User profile dropdown
  document.getElementById("userProfile").addEventListener("click", function () {
    document.getElementById("userDropdown").classList.toggle("active");
  });

  // Close dropdown when clicking outside
  document.addEventListener("click", function (event) {
    if (!event.target.closest("#userProfile")) {
      document.getElementById("userDropdown").classList.remove("active");
    }
  });

  // Logout buttons
  document.getElementById("logoutBtn").addEventListener("click", logout);
  document
    .getElementById("logoutSidebar")
    .addEventListener("click", function (e) {
      e.preventDefault();
      logout();
    });

  // Notification button
  document
    .getElementById("notificationBtn")
    .addEventListener("click", function () {
      document.getElementById("notificationModal").classList.add("active");
    });

  // Mark all as read button
  document
    .getElementById("markAllReadBtn")
    .addEventListener("click", markAllNotificationsAsRead);

  // Close notification modal
  document
    .getElementById("closeNotificationModal")
    .addEventListener("click", function () {
      document.getElementById("notificationModal").classList.remove("active");
    });

  // Messages button
  document.getElementById("messagesBtn").addEventListener("click", function () {
    showToast("Messages feature coming soon!", "info");
  });

  // Settings button
  document.getElementById("settingsBtn").addEventListener("click", function () {
    showToast("Settings page coming soon!", "info");
  });

  // Search functionality
  const searchInput = document.querySelector(".search-input");
  searchInput.addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
      const query = this.value.trim();
      if (query) {
        showToast(`Searching for: ${query}`, "info");
        // In a real app, this would perform a search
      }
    }
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
    // Clear authentication data
    localStorage.removeItem("loggedIn");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");

    // Redirect to login page
    window.location.href = "login.html";
  }
}
