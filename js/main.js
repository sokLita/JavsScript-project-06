// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userName").textContent = currentUser.name;
    document.getElementById("userRole").textContent =
      currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1);
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
    document.getElementById("welcomeUserName").textContent = currentUser.name;
  }

  // Load dashboard data
  loadDashboardData();
  initializeCharts();
  setupEventListeners();

  // Check role for permissions
  if (currentUser.role === "staff") {
    // Hide admin features
    document.querySelector('[href="users.html"]').style.display = "none";
  }
});

// Load dashboard data from localStorage
function loadDashboardData() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  if (!systemData) return;

  const products = systemData.products || [];
  const sales = systemData.sales || [];
  const stockMovements = systemData.stockMovements || [];

  // Calculate statistics
  const totalProducts = products.length;
  const lowStockItems = products.filter(
    (p) => p.currentStock <= p.minStock && p.currentStock > 0
  ).length;
  const outOfStockItems = products.filter((p) => p.currentStock === 0).length;

  // Today's sales
  const today = new Date().toISOString().split("T")[0];
  const todaysSales = sales
    .filter((s) => s.date === today)
    .reduce((sum, sale) => sum + sale.total, 0);

  // Pending orders (sales with status 'pending')
  const pendingOrders = sales.filter((s) => s.status === "pending").length;

  // Update dashboard cards
  document.getElementById("totalProducts").textContent = totalProducts;
  document.getElementById("lowStockItems").textContent = lowStockItems;
  document.getElementById("todaysSales").textContent = `₹${todaysSales.toFixed(
    2
  )}`;
  document.getElementById("pendingOrders").textContent = pendingOrders;

  // Calculate changes (simplified - in real app would compare with previous period)
  const productChange = totalProducts > 0 ? "+12%" : "0%";
  const lowStockChange = lowStockItems > 0 ? "+5%" : "0%";
  const salesChange = todaysSales > 0 ? "+18%" : "0%";
  const ordersChange = pendingOrders > 0 ? "+8%" : "0%";

  document.getElementById("productChange").textContent = productChange;
  document.getElementById("lowStockChange").textContent = lowStockChange;
  document.getElementById("salesChange").textContent = salesChange;
  document.getElementById("ordersChange").textContent = ordersChange;

  // Load recent activity
  loadRecentActivity(stockMovements, sales);
}

// Load recent activity
function loadRecentActivity(stockMovements, sales) {
  const activityList = document.getElementById("activityList");
  activityList.innerHTML = "";

  // Combine and sort activities by date
  const activities = [];

  // Add stock movements
  stockMovements.slice(-5).forEach((movement) => {
    activities.push({
      type: "stock",
      text: `${movement.type === "in" ? "Stock In" : "Stock Out"} - ${
        movement.productName
      } (${movement.quantity} units)`,
      time: formatTimeAgo(movement.date),
      icon:
        movement.type === "in" ? "fas fa-plus-circle" : "fas fa-minus-circle",
    });
  });

  // Add sales
  sales.slice(-5).forEach((sale) => {
    activities.push({
      type: "sale",
      text: `New Sale - ${sale.customerName || "Walk-in Customer"} (₹${
        sale.total
      })`,
      time: formatTimeAgo(sale.date),
      icon: "fas fa-shopping-cart",
    });
  });

  // Sort by date (newest first)
  activities.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Display only the 5 most recent
  activities.slice(0, 5).forEach((activity) => {
    const item = document.createElement("li");
    item.className = "activity-item";
    item.innerHTML = `
                    <div class="activity-icon">
                        <i class="${activity.icon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-text">${activity.text}</div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                `;
    activityList.appendChild(item);
  });

  // If no activities
  if (activities.length === 0) {
    activityList.innerHTML = `
                    <li class="activity-item">
                        <div class="activity-details">
                            <div class="activity-text">No recent activity</div>
                            <div class="activity-time">Get started by adding products or making sales</div>
                        </div>
                    </li>
                `;
  }
}

// Format time ago
function formatTimeAgo(dateString) {
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
  } else {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }
}

// Initialize charts
function initializeCharts() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];
  const sales = systemData?.sales || [];

  // Sales Chart
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  const salesData = getLast7DaysSales(sales);

  new Chart(salesCtx, {
    type: "line",
    data: {
      labels: salesData.days,
      datasets: [
        {
          label: "Sales (₹)",
          data: salesData.amounts,
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
          display: true,
          position: "top",
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value;
            },
          },
        },
      },
    },
  });

  // Inventory Chart
  const inventoryCtx = document
    .getElementById("inventoryChart")
    .getContext("2d");
  const stockData = getStockDistribution(products);

  new Chart(inventoryCtx, {
    type: "doughnut",
    data: {
      labels: stockData.labels,
      datasets: [
        {
          data: stockData.values,
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

// Get last 7 days sales data
function getLast7DaysSales(sales) {
  const days = [];
  const amounts = [];

  for (let i = 6; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split("T")[0];

    const daySales = sales
      .filter((s) => s.date === dateStr)
      .reduce((sum, sale) => sum + sale.total, 0);

    days.push(date.toLocaleDateString("en-US", { weekday: "short" }));
    amounts.push(daySales);
  }

  return { days, amounts };
}

// Get stock distribution
function getStockDistribution(products) {
  const inStock = products.filter((p) => p.currentStock > p.minStock).length;
  const lowStock = products.filter(
    (p) => p.currentStock <= p.minStock && p.currentStock > 0
  ).length;
  const outOfStock = products.filter((p) => p.currentStock === 0).length;

  return {
    labels: ["In Stock", "Low Stock", "Out of Stock"],
    values: [inStock, lowStock, outOfStock],
  };
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
    window.location.href = "../index.html";
  }
}

// Add sample data if empty (for demo purposes)
function addSampleDataIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (systemData.products.length === 0) {
    // Add sample products
    systemData.products = [
      {
        id: 1,
        name: "Wireless Bluetooth Headphones",
        sku: "WH-001",
        category: "Electronics",
        price: 89.99,
        cost: 45.5,
        currentStock: 45,
        minStock: 10,
        maxStock: 100,
        supplierId: 1,
        description: "High-quality wireless headphones with noise cancellation",
        status: "active",
      },
      {
        id: 2,
        name: "Ergonomic Office Chair",
        sku: "OC-002",
        category: "Furniture",
        price: 249.99,
        cost: 150.0,
        currentStock: 12,
        minStock: 5,
        maxStock: 30,
        supplierId: 2,
        description: "Adjustable office chair with lumbar support",
        status: "active",
      },
      {
        id: 3,
        name: "Smart Fitness Watch",
        sku: "FW-003",
        category: "Electronics",
        price: 199.99,
        cost: 120.0,
        currentStock: 3,
        minStock: 10,
        maxStock: 50,
        supplierId: 1,
        description: "Waterproof fitness tracker with heart rate monitor",
        status: "active",
      },
    ];

    // Add sample sales
    const today = new Date().toISOString().split("T")[0];
    systemData.sales = [
      {
        id: 1,
        date: today,
        customerName: "John Doe",
        items: [{ productId: 1, quantity: 2, price: 89.99 }],
        total: 179.98,
        status: "completed",
      },
    ];

    // Add sample stock movements
    systemData.stockMovements = [
      {
        id: 1,
        date: today,
        type: "in",
        productId: 1,
        productName: "Wireless Bluetooth Headphones",
        quantity: 20,
        reference: "PO-001",
        userId: 1,
      },
    ];

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

    // Reload dashboard
    loadDashboardData();
    initializeCharts();
  }
}

// Call this function on first load
addSampleDataIfEmpty();
