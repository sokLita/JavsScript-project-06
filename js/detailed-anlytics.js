// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Set default dates
  setDefaultDateRange();

  // Load analytics data
  loadAnalyticsData();
  initializeCharts();
  setupEventListeners();

  // Check role for permissions
  if (currentUser.role === "staff") {
    // Staff might have limited access to certain reports
    document.getElementById("scheduleReportBtn").style.display = "none";
  }
});

// Set default date range (last 7 days)
function setDefaultDateRange() {
  const endDate = new Date();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 7);

  document.getElementById("startDate").valueAsDate = startDate;
  document.getElementById("endDate").valueAsDate = endDate;
}

// Load analytics data from localStorage
function loadAnalyticsData() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];
  const sales = systemData?.sales || [];
  const stockMovements = systemData?.stockMovements || [];

  // Calculate KPIs
  calculateKPIs(sales, products);

  // Load tables
  loadTopProductsTable(products, sales);
  loadLowStockTable(products);
}

// Calculate Key Performance Indicators
function calculateKPIs(sales, products) {
  // Total Revenue
  const totalRevenue = sales.reduce((sum, sale) => sum + sale.total, 0);

  // Total Orders
  const totalOrders = sales.length;

  // Profit Margin (simplified calculation)
  const totalCost = products.reduce(
    (sum, product) => sum + (product.cost || 0) * product.currentStock,
    0
  );
  const totalValue = products.reduce(
    (sum, product) => sum + product.price * product.currentStock,
    0
  );
  const profitMargin =
    totalValue > 0
      ? (((totalValue - totalCost) / totalValue) * 100).toFixed(1)
      : 0;

  // Stock Turnover Ratio (simplified)
  const stockTurnover =
    sales.length > 0 ? (totalRevenue / products.length).toFixed(1) : 0;

  // Update KPI cards
  document.getElementById(
    "totalRevenue"
  ).textContent = `₹${totalRevenue.toLocaleString()}`;
  document.getElementById("totalOrders").textContent = totalOrders;
  document.getElementById("profitMargin").textContent = `${profitMargin}%`;
  document.getElementById("stockTurnover").textContent = stockTurnover;
}

// Load top products table
function loadTopProductsTable(products, sales) {
  const tableBody = document.getElementById("topProductsTable");
  tableBody.innerHTML = "";

  // Calculate sales for each product
  const productSales = {};
  sales.forEach((sale) => {
    if (sale.items) {
      sale.items.forEach((item) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            quantity: 0,
            revenue: 0,
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.quantity * item.price;
      });
    }
  });

  // Create array of products with sales data
  const productsWithSales = products.map((product) => {
    const salesData = productSales[product.id] || { quantity: 0, revenue: 0 };
    return {
      ...product,
      unitsSold: salesData.quantity,
      revenue: salesData.revenue,
    };
  });

  // Sort by revenue (descending)
  productsWithSales.sort((a, b) => b.revenue - a.revenue);

  // Display top 10 products
  const topProducts = productsWithSales.slice(0, 10);

  topProducts.forEach((product, index) => {
    const row = document.createElement("tr");

    // Determine trend (random for demo)
    const trend = Math.random() > 0.5 ? "up" : "down";
    const trendValue = (Math.random() * 15 + 5).toFixed(1);

    row.innerHTML = `
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 30px; height: 30px; border-radius: 6px; background: #f8f9fa; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; color: #3498db;">
                                ${index + 1}
                            </div>
                            <div>
                                <div style="font-weight: 600;">${
                                  product.name
                                }</div>
                                <div style="font-size: 12px; color: #7f8c8d;">SKU: ${
                                  product.sku
                                }</div>
                            </div>
                        </div>
                    </td>
                    <td>${product.category || "Uncategorized"}</td>
                    <td>${product.unitsSold}</td>
                    <td>₹${product.revenue.toLocaleString()}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 5px;">
                            <i class="fas fa-arrow-${trend}" style="color: ${
      trend === "up" ? "#27ae60" : "#e74c3c"
    };"></i>
                            <span class="${
                              trend === "up" ? "trend-up" : "trend-down"
                            }">${trendValue}%</span>
                        </div>
                    </td>
                `;
    tableBody.appendChild(row);
  });

  // If no products
  if (topProducts.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
                            <i class="fas fa-chart-bar" style="font-size: 40px; margin-bottom: 10px;"></i>
                            <div>No sales data available</div>
                        </td>
                    </tr>
                `;
  }
}

// Load low stock table
function loadLowStockTable(products) {
  const tableBody = document.getElementById("lowStockTable");
  tableBody.innerHTML = "";

  // Filter low stock products
  const lowStockProducts = products.filter(
    (product) =>
      product.currentStock <= product.minStock && product.currentStock > 0
  );

  // Filter out of stock products
  const outOfStockProducts = products.filter(
    (product) => product.currentStock === 0
  );

  // Combine and sort by stock level
  const criticalProducts = [...lowStockProducts, ...outOfStockProducts]
    .sort((a, b) => a.currentStock - b.currentStock)
    .slice(0, 10);

  criticalProducts.forEach((product) => {
    const row = document.createElement("tr");

    // Calculate days to out of stock (based on average daily sales)
    const daysToOut =
      product.currentStock === 0
        ? 0
        : Math.floor(product.currentStock / (product.minStock / 30)); // Simplified calculation

    // Determine action needed
    let action = "";
    let actionClass = "";

    if (product.currentStock === 0) {
      action = "Urgent Reorder";
      actionClass = "btn-danger";
    } else if (daysToOut <= 7) {
      action = "Reorder Now";
      actionClass = "btn-warning";
    } else if (daysToOut <= 14) {
      action = "Plan Reorder";
      actionClass = "btn-primary";
    } else {
      action = "Monitor";
      actionClass = "btn-outline";
    }

    row.innerHTML = `
                    <td>
                        <div style="font-weight: 600;">${product.name}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">${
                          product.category || "Uncategorized"
                        }</div>
                    </td>
                    <td>
                        <div style="font-weight: 600; color: ${
                          product.currentStock === 0 ? "#e74c3c" : "#f39c12"
                        };">${product.currentStock}</div>
                    </td>
                    <td>${product.minStock || "Not set"}</td>
                    <td>
                        ${
                          product.currentStock === 0
                            ? '<span style="color: #e74c3c; font-weight: 600;">Out of Stock</span>'
                            : `${daysToOut} days`
                        }
                    </td>
                    <td>
                        <button class="btn ${actionClass}" style="padding: 5px 10px; font-size: 12px;" onclick="reorderProduct(${
      product.id
    })">
                            ${action}
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });

  // If no critical products
  if (criticalProducts.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 30px; color: #7f8c8d;">
                            <i class="fas fa-check-circle" style="font-size: 40px; margin-bottom: 10px; color: #27ae60;"></i>
                            <div>All products are sufficiently stocked</div>
                        </td>
                    </tr>
                `;
  }
}

// Initialize charts
function initializeCharts() {
  // Get data for charts
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const sales = systemData?.sales || [];
  const products = systemData?.products || [];

  // Sales Trend Chart
  const salesCtx = document.getElementById("salesTrendChart").getContext("2d");
  const salesData = getSalesTrendData(sales);

  window.salesChart = new Chart(salesCtx, {
    type: "line",
    data: {
      labels: salesData.labels,
      datasets: [
        {
          label: "Sales Revenue (₹)",
          data: salesData.values,
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointBackgroundColor: "#3498db",
          pointRadius: 4,
          pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: true,
          position: "top",
        },
        tooltip: {
          mode: "index",
          intersect: false,
          callbacks: {
            label: function (context) {
              return `Sales: ₹${context.raw.toLocaleString()}`;
            },
          },
        },
      },
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            callback: function (value) {
              return "₹" + value.toLocaleString();
            },
          },
          grid: {
            borderDash: [5, 5],
          },
        },
      },
      interaction: {
        intersect: false,
        mode: "nearest",
      },
    },
  });

  // Category Chart
  const categoryCtx = document.getElementById("categoryChart").getContext("2d");
  const categoryData = getCategoryData(products, sales);

  window.categoryChart = new Chart(categoryCtx, {
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
            "#d35400",
            "#7f8c8d",
          ],
          borderWidth: 1,
          hoverOffset: 15,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: {
            padding: 20,
            usePointStyle: true,
            pointStyle: "circle",
          },
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ₹${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
      cutout: "60%",
    },
  });

  // Update charts when type changes
  document
    .getElementById("salesChartType")
    .addEventListener("change", function () {
      updateSalesChart(this.value);
    });

  document
    .getElementById("categoryChartType")
    .addEventListener("change", function () {
      updateCategoryChart(this.value);
    });
}

// Get sales trend data
function getSalesTrendData(sales) {
  // For demo, generate last 30 days of data
  const labels = [];
  const values = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);
    const dateStr = date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });

    // Calculate sales for this day (random for demo)
    const dailySales = Math.floor(Math.random() * 5000) + 1000;

    labels.push(dateStr);
    values.push(dailySales);
  }

  return { labels, values };
}

// Get category data
function getCategoryData(products, sales) {
  // Get unique categories
  const categories = [
    ...new Set(products.map((p) => p.category).filter(Boolean)),
  ];

  // Calculate revenue per category
  const categoryRevenue = {};
  categories.forEach((category) => {
    categoryRevenue[category] = 0;
  });

  // Add uncategorized if any products don't have category
  if (products.some((p) => !p.category)) {
    categories.push("Uncategorized");
    categoryRevenue["Uncategorized"] = 0;
  }

  // Calculate revenue from sales
  sales.forEach((sale) => {
    if (sale.items) {
      sale.items.forEach((item) => {
        const product = products.find((p) => p.id === item.productId);
        if (product) {
          const category = product.category || "Uncategorized";
          categoryRevenue[category] =
            (categoryRevenue[category] || 0) + item.quantity * item.price;
        }
      });
    }
  });

  // Convert to arrays
  const labels = Object.keys(categoryRevenue);
  const values = Object.values(categoryRevenue);

  return { labels, values };
}

// Update sales chart based on selected type
function updateSalesChart(type) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const sales = systemData?.sales || [];

  let labels, values;

  if (type === "weekly") {
    // Weekly data
    labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    values = [15000, 18000, 22000, 19000];
  } else if (type === "monthly") {
    // Monthly data
    labels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    values = [45000, 52000, 61000, 58000, 67000, 72000];
  } else {
    // Daily data (default)
    labels = [];
    values = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString("en-US", { weekday: "short" }));
      values.push(Math.floor(Math.random() * 5000) + 1000);
    }
  }

  window.salesChart.data.labels = labels;
  window.salesChart.data.datasets[0].data = values;
  window.salesChart.update();
}

// Update category chart based on selected type
function updateCategoryChart(type) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];
  const sales = systemData?.sales || [];

  let labels, values;

  if (type === "quantity") {
    // By quantity sold
    const categoryQuantity = {};

    sales.forEach((sale) => {
      if (sale.items) {
        sale.items.forEach((item) => {
          const product = products.find((p) => p.id === item.productId);
          if (product) {
            const category = product.category || "Uncategorized";
            categoryQuantity[category] =
              (categoryQuantity[category] || 0) + item.quantity;
          }
        });
      }
    });

    labels = Object.keys(categoryQuantity);
    values = Object.values(categoryQuantity);
  } else {
    // By revenue (default)
    const data = getCategoryData(products, sales);
    labels = data.labels;
    values = data.values;
  }

  window.categoryChart.data.labels = labels;
  window.categoryChart.data.datasets[0].data = values;
  window.categoryChart.update();
}

// Reorder product function
function reorderProduct(productId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const product = systemData.products.find((p) => p.id === productId);

  if (product) {
    // In a real app, this would create a purchase order
    alert(
      `Purchase order created for ${product.name}. Recommended quantity: ${
        product.minStock * 2
      }`
    );

    // Show notification
    showNotification(`Reorder initiated for ${product.name}`, "success");
  }
}

// Export functions
function exportTopProducts() {
  showNotification("Top products data exported successfully!", "success");
}

function exportLowStock() {
  showNotification("Low stock report exported successfully!", "success");
}

function generateSalesReport() {
  showNotification(
    "Sales report is being generated. You will receive it shortly.",
    "info"
  );
}

function generateInventoryReport() {
  showNotification("Inventory report exported as Excel file.", "success");
}

function generatePerformanceReport() {
  showNotification("Performance report is being prepared.", "info");
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

  // Quick date buttons
  document.querySelectorAll(".quick-date-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      document
        .querySelectorAll(".quick-date-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      const period = this.dataset.period;
      setQuickDateRange(period);
    });
  });

  // Time period change
  document.getElementById("timePeriod").addEventListener("change", function () {
    if (this.value === "custom") {
      document.getElementById("startDate").disabled = false;
      document.getElementById("endDate").disabled = false;
    } else {
      setQuickDateRange(this.value);
    }
  });

  // Report buttons
  document
    .getElementById("generateReportBtn")
    .addEventListener("click", function () {
      document.getElementById("reportModal").classList.add("active");
    });

  document
    .getElementById("exportDataBtn")
    .addEventListener("click", function () {
      exportAllData();
    });

  document
    .getElementById("scheduleReportBtn")
    .addEventListener("click", function () {
      alert(
        "Schedule report feature would allow you to set up automated report delivery."
      );
    });

  // Modal close buttons
  document
    .getElementById("closeReportModal")
    .addEventListener("click", function () {
      document.getElementById("reportModal").classList.remove("active");
    });

  // Cancel button
  document
    .getElementById("cancelReportBtn")
    .addEventListener("click", function () {
      document.getElementById("reportModal").classList.remove("active");
    });

  // Report form submission
  document
    .getElementById("reportForm")
    .addEventListener("submit", function (e) {
      e.preventDefault();
      showNotification(
        "Report generation started. You will be notified when it's ready.",
        "success"
      );
      document.getElementById("reportModal").classList.remove("active");
    });

  // Date range changes
  document.getElementById("startDate").addEventListener("change", function () {
    document.getElementById("timePeriod").value = "custom";
    document
      .querySelectorAll(".quick-date-btn")
      .forEach((b) => b.classList.remove("active"));
  });

  document.getElementById("endDate").addEventListener("change", function () {
    document.getElementById("timePeriod").value = "custom";
    document
      .querySelectorAll(".quick-date-btn")
      .forEach((b) => b.classList.remove("active"));
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

// Set quick date range
function setQuickDateRange(period) {
  const endDate = new Date();
  const startDate = new Date();

  switch (period) {
    case "today":
      startDate.setDate(endDate.getDate());
      break;
    case "yesterday":
      startDate.setDate(endDate.getDate() - 1);
      endDate.setDate(endDate.getDate() - 1);
      break;
    case "week":
      startDate.setDate(endDate.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(endDate.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(endDate.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(endDate.getFullYear() - 1);
      break;
  }

  document.getElementById("startDate").valueAsDate = startDate;
  document.getElementById("endDate").valueAsDate = endDate;
  document.getElementById("timePeriod").value = period;

  // Reload data with new date range
  loadAnalyticsData();
}

// Export all data
function exportAllData() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Create downloadable JSON file
  const dataStr = JSON.stringify(systemData, null, 2);
  const dataUri =
    "data:application/json;charset=utf-8," + encodeURIComponent(dataStr);

  const exportFileDefaultName = `inventory_data_${
    new Date().toISOString().split("T")[0]
  }.json`;

  const linkElement = document.createElement("a");
  linkElement.setAttribute("href", dataUri);
  linkElement.setAttribute("download", exportFileDefaultName);
  linkElement.click();

  showNotification("All data exported successfully!", "success");
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

  if (!systemData.sales || systemData.sales.length === 0) {
    // Add sample sales data for analytics
    const categories = [
      "Electronics",
      "Furniture",
      "Clothing",
      "Home",
      "Sports",
    ];
    const today = new Date();

    systemData.sales = [];

    // Generate 30 days of sales data
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateStr = date.toISOString().split("T")[0];

      // Random number of sales per day (1-5)
      const salesCount = Math.floor(Math.random() * 5) + 1;

      for (let j = 0; j < salesCount; j++) {
        const sale = {
          id: systemData.sales.length + 1,
          date: dateStr,
          customerName: `Customer ${Math.floor(Math.random() * 1000) + 1}`,
          items: [],
          total: 0,
          status: "completed",
        };

        // Add 1-3 items per sale
        const itemCount = Math.floor(Math.random() * 3) + 1;
        for (let k = 0; k < itemCount; k++) {
          const productId =
            Math.floor(Math.random() * systemData.products.length) + 1;
          const product = systemData.products.find((p) => p.id === productId);

          if (product) {
            const quantity = Math.floor(Math.random() * 3) + 1;
            sale.items.push({
              productId: product.id,
              quantity: quantity,
              price: product.price,
            });
            sale.total += quantity * product.price;
          }
        }

        systemData.sales.push(sale);
      }
    }

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

    // Reload analytics
    loadAnalyticsData();

    // Update charts
    if (window.salesChart) {
      updateSalesChart("daily");
    }
    if (window.categoryChart) {
      updateCategoryChart("revenue");
    }
  }
}

// Call this function on first load
addSampleDataIfEmpty();
