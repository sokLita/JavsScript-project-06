// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize analytics
  initializeCharts();
  loadPredictionsTable();
  setupEventListeners();
});

// Chart instances
let salesForecastChart,
  revenueCategoryChart,
  inventoryTurnoverChart,
  forecastAccuracyChart,
  detailedForecastChart;

// Initialize charts
function initializeCharts() {
  // Sales Forecast Chart
  const salesCtx = document
    .getElementById("salesForecastChart")
    .getContext("2d");
  salesForecastChart = new Chart(salesCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      datasets: [
        {
          label: "Actual Sales",
          data: [
            65000, 72000, 81000, 78000, 92000, 89000, 95000, 98000, 101000,
            105000, 110000, 115000,
          ],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Forecast",
          data: [
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            null,
            110000,
            115000,
            120000,
            125000,
            130000,
          ],
          borderColor: "#e74c3c",
          borderDash: [5, 5],
          borderWidth: 2,
          fill: false,
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
        tooltip: {
          callbacks: {
            label: function (context) {
              let label = context.dataset.label || "";
              if (label) {
                label += ": ";
              }
              label += "$" + context.raw.toLocaleString();
              return label;
            },
          },
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

  // Revenue by Category Chart
  const revenueCtx = document
    .getElementById("revenueCategoryChart")
    .getContext("2d");
  revenueCategoryChart = new Chart(revenueCtx, {
    type: "doughnut",
    data: {
      labels: [
        "Electronics",
        "Furniture",
        "Home & Kitchen",
        "Sports",
        "Stationery",
        "Other",
      ],
      datasets: [
        {
          data: [45, 20, 15, 10, 5, 5],
          backgroundColor: [
            "#3498db",
            "#9b59b6",
            "#e74c3c",
            "#1abc9c",
            "#f39c12",
            "#95a5a6",
          ],
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "right",
        },
        tooltip: {
          callbacks: {
            label: function (context) {
              const label = context.label || "";
              const value = context.raw || 0;
              const total = context.dataset.data.reduce((a, b) => a + b, 0);
              const percentage = Math.round((value / total) * 100);
              return `${label}: ${percentage}% ($${(
                value * 10000
              ).toLocaleString()})`;
            },
          },
        },
      },
    },
  });

  // Inventory Turnover Chart
  const turnoverCtx = document
    .getElementById("inventoryTurnoverChart")
    .getContext("2d");
  inventoryTurnoverChart = new Chart(turnoverCtx, {
    type: "bar",
    data: {
      labels: ["Q1", "Q2", "Q3", "Q4"],
      datasets: [
        {
          label: "Turnover Rate",
          data: [3.2, 3.8, 4.1, 4.2],
          backgroundColor: "rgba(52, 152, 219, 0.7)",
          borderColor: "#3498db",
          borderWidth: 1,
        },
        {
          label: "Industry Average",
          data: [3.0, 3.1, 3.3, 3.5],
          backgroundColor: "rgba(149, 165, 166, 0.5)",
          borderColor: "#95a5a6",
          borderWidth: 1,
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
          title: {
            display: true,
            text: "Turnover Rate (times)",
          },
        },
      },
    },
  });

  // Forecast Accuracy Chart
  const accuracyCtx = document
    .getElementById("forecastAccuracyChart")
    .getContext("2d");
  forecastAccuracyChart = new Chart(accuracyCtx, {
    type: "line",
    data: {
      labels: [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
      ],
      datasets: [
        {
          label: "Forecast Accuracy (MAPE)",
          data: [15, 12, 10, 11, 9, 8, 7, 6, 5, 4],
          borderColor: "#27ae60",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
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
        tooltip: {
          callbacks: {
            label: function (context) {
              return `Accuracy: ${context.raw}%`;
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          reverse: true,
          title: {
            display: true,
            text: "Forecast Error (%)",
          },
          ticks: {
            callback: function (value) {
              return value + "%";
            },
          },
        },
      },
    },
  });

  // Detailed Forecast Chart (will be populated when forecast is run)
  const detailedCtx = document
    .getElementById("detailedForecastChart")
    .getContext("2d");
  detailedForecastChart = new Chart(detailedCtx, {
    type: "bar",
    data: {
      labels: [],
      datasets: [],
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
      },
    },
  });
}

// Load predictions table
function loadPredictionsTable() {
  const predictionsTable = document.getElementById("predictionsTable");
  predictionsTable.innerHTML = "";

  const predictions = [
    {
      product: "Wireless Bluetooth Headphones",
      category: "Electronics",
      currentStock: 45,
      predictedDemand: 68,
      recommendedOrder: 30,
      confidence: 92,
      risk: "Low",
    },
    {
      product: "Ergonomic Office Chair",
      category: "Furniture",
      currentStock: 12,
      predictedDemand: 18,
      recommendedOrder: 10,
      confidence: 85,
      risk: "Medium",
    },
    {
      product: "Smart Fitness Watch",
      category: "Electronics",
      currentStock: 3,
      predictedDemand: 25,
      recommendedOrder: 25,
      confidence: 78,
      risk: "High",
    },
    {
      product: "Desk Lamp with Wireless Charger",
      category: "Home",
      currentStock: 0,
      predictedDemand: 15,
      recommendedOrder: 20,
      confidence: 82,
      risk: "High",
    },
    {
      product: "Premium Notebook Set",
      category: "Stationery",
      currentStock: 120,
      predictedDemand: 85,
      recommendedOrder: 0,
      confidence: 91,
      risk: "Low",
    },
    {
      product: "Wireless Gaming Mouse",
      category: "Electronics",
      currentStock: 5,
      predictedDemand: 22,
      recommendedOrder: 20,
      confidence: 76,
      risk: "High",
    },
    {
      product: "Stainless Steel Water Bottle",
      category: "Sports",
      currentStock: 65,
      predictedDemand: 45,
      recommendedOrder: 0,
      confidence: 88,
      risk: "Low",
    },
    {
      product: "Bluetooth Portable Speaker",
      category: "Electronics",
      currentStock: 18,
      predictedDemand: 25,
      recommendedOrder: 12,
      confidence: 83,
      risk: "Medium",
    },
  ];

  predictions.forEach((prediction) => {
    const row = document.createElement("tr");

    // Determine risk color
    let riskColor = "";
    let riskIcon = "";
    if (prediction.risk === "Low") {
      riskColor = "var(--success-color)";
      riskIcon = "fa-check-circle";
    } else if (prediction.risk === "Medium") {
      riskColor = "var(--warning-color)";
      riskIcon = "fa-exclamation-circle";
    } else {
      riskColor = "var(--accent-color)";
      riskIcon = "fa-times-circle";
    }

    // Determine stock status
    let stockStatus = "";
    if (prediction.currentStock < prediction.predictedDemand * 0.5) {
      stockStatus =
        '<span style="color: var(--accent-color); font-weight: 600;">Critical</span>';
    } else if (prediction.currentStock < prediction.predictedDemand) {
      stockStatus =
        '<span style="color: var(--warning-color); font-weight: 600;">Warning</span>';
    } else {
      stockStatus =
        '<span style="color: var(--success-color); font-weight: 600;">Adequate</span>';
    }

    row.innerHTML = `
                    <td><strong>${prediction.product}</strong></td>
                    <td>${prediction.category}</td>
                    <td>${prediction.currentStock} units ${stockStatus}</td>
                    <td>${prediction.predictedDemand} units</td>
                    <td><strong>${
                      prediction.recommendedOrder
                    } units</strong></td>
                    <td>
                        <div class="trend-indicator">
                            <span>${prediction.confidence}%</span>
                            <div style="width: 60px; height: 6px; background: #e1e8ed; border-radius: 3px; overflow: hidden;">
                                <div style="height: 100%; width: ${
                                  prediction.confidence
                                }%; background: ${
      prediction.confidence > 80
        ? "var(--success-color)"
        : prediction.confidence > 70
        ? "var(--warning-color)"
        : "var(--accent-color)"
    };"></div>
                            </div>
                        </div>
                    </td>
                    <td style="color: ${riskColor};">
                        <i class="fas ${riskIcon}"></i> ${prediction.risk}
                    </td>
                `;
    predictionsTable.appendChild(row);
  });
}

// Run forecast analysis
function runForecastAnalysis() {
  const forecastMethod = document.getElementById("forecastMethod").value;
  const forecastPeriod = parseInt(
    document.getElementById("forecastPeriod").value
  );
  const forecastCategory = document.getElementById("forecastCategory").value;

  // Show loading spinner
  document.getElementById("forecastLoading").style.display = "block";
  document.getElementById("forecastResults").style.display = "none";

  // Simulate forecast calculation (in real app, this would call an API)
  setTimeout(() => {
    // Hide loading spinner
    document.getElementById("forecastLoading").style.display = "none";

    // Show results
    document.getElementById("forecastResults").style.display = "block";

    // Update detailed forecast chart
    updateDetailedForecastChart(
      forecastMethod,
      forecastPeriod,
      forecastCategory
    );

    // Show success notification
    showNotification("Forecast analysis completed successfully!", "success");
  }, 2000);
}

// Update detailed forecast chart
function updateDetailedForecastChart(method, period, category) {
  // Generate forecast data based on parameters
  const months = ["Nov", "Dec", "Jan", "Feb", "Mar", "Apr"];
  const forecastData = [110000, 115000, 120000, 125000, 130000, 135000];
  const confidenceIntervals = [
    [105000, 115000],
    [110000, 120000],
    [115000, 125000],
    [120000, 130000],
    [125000, 135000],
    [130000, 140000],
  ];

  // Update chart data
  detailedForecastChart.data.labels = months.slice(0, period);
  detailedForecastChart.data.datasets = [
    {
      label: "Forecast",
      data: forecastData.slice(0, period),
      backgroundColor: "rgba(52, 152, 219, 0.7)",
      borderColor: "#3498db",
      borderWidth: 1,
    },
    {
      label: "Confidence Interval (Upper)",
      data: confidenceIntervals.slice(0, period).map((interval) => interval[1]),
      backgroundColor: "rgba(52, 152, 219, 0.2)",
      borderColor: "rgba(52, 152, 219, 0.2)",
      borderWidth: 0,
      type: "line",
      fill: "+1",
    },
    {
      label: "Confidence Interval (Lower)",
      data: confidenceIntervals.slice(0, period).map((interval) => interval[0]),
      backgroundColor: "rgba(52, 152, 219, 0.2)",
      borderColor: "rgba(52, 152, 219, 0.2)",
      borderWidth: 0,
      type: "line",
      fill: false,
    },
  ];

  detailedForecastChart.update();

  // Update forecast metrics based on category
  let expectedRevenue = 1245680;
  let growthProjection = 12.5;
  let recommendedStock = 1450;
  let confidenceLevel = 87;

  if (category === "electronics") {
    expectedRevenue = 856420;
    growthProjection = 18.2;
    recommendedStock = 820;
    confidenceLevel = 91;
  } else if (category === "furniture") {
    expectedRevenue = 245680;
    growthProjection = 8.5;
    recommendedStock = 180;
    confidenceLevel = 82;
  } else if (category === "home") {
    expectedRevenue = 184520;
    growthProjection = 6.8;
    recommendedStock = 220;
    confidenceLevel = 79;
  } else if (category === "sports") {
    expectedRevenue = 128450;
    growthProjection = 15.3;
    recommendedStock = 150;
    confidenceLevel = 85;
  }

  // Update metrics display
  document
    .querySelectorAll(".forecast-metric")[0]
    .querySelector(
      ".metric-value"
    ).textContent = `₹${expectedRevenue.toLocaleString()}`;
  document
    .querySelectorAll(".forecast-metric")[1]
    .querySelector(".metric-value").textContent = `+${growthProjection}%`;
  document
    .querySelectorAll(".forecast-metric")[2]
    .querySelector(".metric-value").textContent = `${recommendedStock} units`;
  document
    .querySelectorAll(".forecast-metric")[3]
    .querySelector(".metric-value").textContent = `${confidenceLevel}%`;
}

// Generate AI insights
function generateAIInsights() {
  // Show loading
  const insightsBtn = document.getElementById("generateInsightsBtn");
  const originalText = insightsBtn.innerHTML;
  insightsBtn.innerHTML =
    '<i class="fas fa-spinner fa-spin"></i> Generating...';
  insightsBtn.disabled = true;

  // Simulate AI processing (in real app, this would call an API)
  setTimeout(() => {
    // Restore button
    insightsBtn.innerHTML = originalText;
    insightsBtn.disabled = false;

    // Show success notification
    showNotification("New AI insights generated successfully!", "success");

    // Update insights with new data
    const insightCards = document.querySelectorAll(".insight-content p");

    // New insights based on latest data
    const newInsights = [
      "AI analysis shows that bundling headphones with phone cases could increase average order value by 28%.",
      "Seasonal pattern detected: Office furniture sales peak in September (back-to-school/office season).",
      "Machine learning model predicts a 15% increase in smart home device sales next quarter.",
    ];

    insightCards.forEach((card, index) => {
      if (newInsights[index]) {
        card.textContent = newInsights[index];
      }
    });
  }, 3000);
}

// Generate report
function generateReport() {
  // Show loading
  const reportBtn = document.getElementById("generateReportBtn");
  const originalText = reportBtn.innerHTML;
  reportBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Generating...';
  reportBtn.disabled = true;

  // Simulate report generation (in real app, this would generate and download a PDF)
  setTimeout(() => {
    // Restore button
    reportBtn.innerHTML = originalText;
    reportBtn.disabled = false;

    // Show success notification
    showNotification(
      "Analytics report generated and downloaded successfully!",
      "success"
    );

    // In a real app, this would trigger a download
    // For now, show a preview alert
    alert(
      "Analytics Report Generated!\n\nReport includes:\n- KPI Dashboard\n- Sales Trends & Forecasts\n- Inventory Turnover Analysis\n- Demand Predictions\n- AI Insights\n\nReport has been saved to your downloads folder."
    );
  }, 2000);
}

// Refresh data
function refreshData() {
  // Show loading
  const refreshBtn = document.getElementById("refreshDataBtn");
  const originalText = refreshBtn.innerHTML;
  refreshBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Refreshing...';
  refreshBtn.disabled = true;

  // Simulate data refresh (in real app, this would fetch latest data from server)
  setTimeout(() => {
    // Restore button
    refreshBtn.innerHTML = originalText;
    refreshBtn.disabled = false;

    // Update charts with "refreshed" data
    salesForecastChart.update();
    revenueCategoryChart.update();
    inventoryTurnoverChart.update();
    forecastAccuracyChart.update();

    // Show success notification
    showNotification(
      "Data refreshed successfully with latest information!",
      "success"
    );
  }, 1500);
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

// Handle period selection
function handlePeriodSelection(period) {
  // Update active period button
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.classList.remove("active");
  });
  event.target.classList.add("active");

  // Update charts based on selected period
  // In a real app, this would fetch new data for the selected period
  if (period === "week") {
    salesForecastChart.data.labels = [
      "Mon",
      "Tue",
      "Wed",
      "Thu",
      "Fri",
      "Sat",
      "Sun",
    ];
    salesForecastChart.data.datasets[0].data = [
      12500, 13200, 14100, 12800, 15200, 14800, 16200,
    ];
  } else if (period === "month") {
    salesForecastChart.data.labels = ["Week 1", "Week 2", "Week 3", "Week 4"];
    salesForecastChart.data.datasets[0].data = [52000, 58000, 61000, 68000];
  } else if (period === "quarter") {
    salesForecastChart.data.labels = ["Month 1", "Month 2", "Month 3"];
    salesForecastChart.data.datasets[0].data = [245000, 268000, 285000];
  } else if (period === "year") {
    salesForecastChart.data.labels = ["Q1", "Q2", "Q3", "Q4"];
    salesForecastChart.data.datasets[0].data = [798000, 856000, 912000, 984000];
  }

  salesForecastChart.update();
  showNotification(`Data period updated to ${period}`, "info");
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

  // Period selector buttons
  document.querySelectorAll(".period-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const period = this.getAttribute("data-period");
      handlePeriodSelection(period);
    });
  });

  // Forecast controls
  document
    .getElementById("runForecastBtn")
    .addEventListener("click", runForecastAnalysis);

  // Generate insights button
  document
    .getElementById("generateInsightsBtn")
    .addEventListener("click", generateAIInsights);

  // Generate report button
  document
    .getElementById("generateReportBtn")
    .addEventListener("click", generateReport);

  // Refresh data button
  document
    .getElementById("refreshDataBtn")
    .addEventListener("click", refreshData);

  // Export predictions button
  document
    .getElementById("exportPredictionsBtn")
    .addEventListener("click", function () {
      showNotification(
        "Product demand predictions exported to CSV!",
        "success"
      );
    });

  // Chart option changes
  document
    .getElementById("salesChartType")
    .addEventListener("change", function () {
      const type = this.value;
      // Update sales forecast chart based on type
      salesForecastChart.update();
      showNotification(`Sales chart updated to ${type} view`, "info");
    });

  document
    .getElementById("revenuePeriod")
    .addEventListener("change", function () {
      const period = this.value;
      // Update revenue chart based on period
      revenueCategoryChart.update();
      showNotification(`Revenue chart updated for ${period}`, "info");
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
