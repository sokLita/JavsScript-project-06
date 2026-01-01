// Sales Management JavaScript
document.addEventListener("DOMContentLoaded", function () {
  initializeSalesDashboard();
  loadSalesData();
  setupCharts();
  updateGeneratedDate();
  populateCustomerFilter();
});

// Global variables
let salesData = [];
let currentTimeRange = 30;
let currentPage = 1;
let itemsPerPage = 10;
let charts = {};
let saleItems = [];

// Sample product data
const products = [
  {
    id: 1,
    name: "Laptop Dell",
    code: "DL-001",
    price: 1200,
    category: "Electronics",
    stock: 85,
  },
  {
    id: 2,
    name: "Mouse Logitech",
    code: "MS-002",
    price: 25,
    category: "Accessories",
    stock: 58,
  },
  {
    id: 3,
    name: "Keyboard Mechanical",
    code: "KB-003",
    price: 80,
    category: "Accessories",
    stock: 72,
  },
  {
    id: 4,
    name: 'Monitor 27"',
    code: "MN-004",
    price: 300,
    category: "Electronics",
    stock: 42,
  },
  {
    id: 5,
    name: "Webcam HD",
    code: "WC-005",
    price: 50,
    category: "Electronics",
    stock: 95,
  },
  {
    id: 6,
    name: "Desk Chair",
    code: "DC-006",
    price: 150,
    category: "Furniture",
    stock: 38,
  },
  {
    id: 7,
    name: "Office Desk",
    code: "OD-007",
    price: 250,
    category: "Furniture",
    stock: 25,
  },
  {
    id: 8,
    name: "Printer",
    code: "PR-008",
    price: 180,
    category: "Electronics",
    stock: 65,
  },
];

// Sample customers
const customers = [
  { id: 1, name: "John Smith", email: "john@example.com" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com" },
  { id: 3, name: "Mike Wilson", email: "mike@example.com" },
  { id: 4, name: "Emily Davis", email: "emily@example.com" },
  { id: 5, name: "Robert Brown", email: "robert@example.com" },
  { id: 6, name: "Tech Solutions Inc.", email: "tech@example.com" },
  { id: 7, name: "Office Supplies Co.", email: "office@example.com" },
];

// Initialize dashboard
function initializeSalesDashboard() {
  console.log("Initializing Sales Dashboard...");
  // Load any saved settings from localStorage
  const savedTimeRange = localStorage.getItem("salesTimeRange");
  if (savedTimeRange) {
    currentTimeRange = parseInt(savedTimeRange);
    document.getElementById("timeRange").value = savedTimeRange;
  }
}

// Load sales data
function loadSalesData() {
  // Generate sample sales data
  generateSampleSalesData();

  // Update summary cards
  updateSummaryCards();

  // Render sales table
  renderSalesTable();

  // Update product performance
  updateProductPerformance();

  showToast("Sales data loaded successfully", "success");
}

// Generate sample sales data
function generateSampleSalesData() {
  salesData = [];
  const statuses = ["paid", "pending", "refunded"];
  const recordedBy = ["Admin", "Manager", "Sales Agent", "System"];

  // Generate 30 days of sales data
  for (let i = 0; i < 30; i++) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const customer = customers[Math.floor(Math.random() * customers.length)];
    const itemCount = Math.floor(Math.random() * 5) + 1;
    const totalAmount = Math.floor(Math.random() * 5000) + 100;
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const recorded = recordedBy[Math.floor(Math.random() * recordedBy.length)];

    salesData.push({
      id: i + 1,
      invoiceNo: `INV-${1000 + i}`,
      customer: customer.name,
      date: date.toISOString().split("T")[0],
      items: itemCount,
      totalAmount: totalAmount,
      status: status,
      recordedBy: recorded,
      customerEmail: customer.email,
      itemsDetails: generateRandomItems(itemCount),
    });
  }
}

// Generate random items for a sale
function generateRandomItems(count) {
  const items = [];
  for (let i = 0; i < count; i++) {
    const product = products[Math.floor(Math.random() * products.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    items.push({
      productId: product.id,
      productName: product.name,
      quantity: quantity,
      price: product.price,
      total: product.price * quantity,
    });
  }
  return items;
}

// Update summary cards
function updateSummaryCards() {
  const filteredData = filterDataByTimeRange(salesData, currentTimeRange);

  // Calculate totals
  const totalSales = filteredData.length;
  const totalRevenue = filteredData.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );
  const itemsSold = filteredData.reduce((sum, sale) => sum + sale.items, 0);
  const averageOrder = totalSales > 0 ? totalRevenue / totalSales : 0;

  // Update DOM elements
  document.getElementById("totalSales").textContent = totalSales;
  document.getElementById(
    "totalRevenue"
  ).textContent = `$${totalRevenue.toFixed(2)}`;
  document.getElementById("itemsSold").textContent = itemsSold;
  document.getElementById(
    "averageOrder"
  ).textContent = `$${averageOrder.toFixed(2)}`;

  // Calculate trends (compared to previous period)
  updateTrends();
}

// Update trends
function updateTrends() {
  const currentPeriod = filterDataByTimeRange(salesData, currentTimeRange);
  const previousPeriod = filterDataByTimeRange(
    salesData,
    currentTimeRange,
    true
  );

  // Sales trend
  const salesChange = calculatePercentageChange(
    currentPeriod.length,
    previousPeriod.length
  );
  document.getElementById("salesTrend").innerHTML = getTrendHTML(
    salesChange,
    "sales"
  );

  // Revenue trend
  const currentRevenue = currentPeriod.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );
  const previousRevenue = previousPeriod.reduce(
    (sum, sale) => sum + sale.totalAmount,
    0
  );
  const revenueChange = calculatePercentageChange(
    currentRevenue,
    previousRevenue
  );
  document.getElementById("revenueTrend").innerHTML = getTrendHTML(
    revenueChange,
    "revenue"
  );

  // Items trend
  const currentItems = currentPeriod.reduce((sum, sale) => sum + sale.items, 0);
  const previousItems = previousPeriod.reduce(
    (sum, sale) => sum + sale.items,
    0
  );
  const itemsChange = calculatePercentageChange(currentItems, previousItems);
  document.getElementById("itemsTrend").innerHTML = getTrendHTML(
    itemsChange,
    "items"
  );

  // AOV trend
  const currentAOV =
    currentPeriod.length > 0 ? currentRevenue / currentPeriod.length : 0;
  const previousAOV =
    previousPeriod.length > 0 ? previousRevenue / previousPeriod.length : 0;
  const aovChange = calculatePercentageChange(currentAOV, previousAOV);
  document.getElementById("aovTrend").innerHTML = getTrendHTML(
    aovChange,
    "AOV"
  );
}

// Filter data by time range
function filterDataByTimeRange(data, days, previous = false) {
  const endDate = new Date();
  let startDate = new Date();

  if (previous) {
    startDate.setDate(startDate.getDate() - days * 2);
    endDate.setDate(endDate.getDate() - days);
  } else {
    startDate.setDate(startDate.getDate() - days);
  }

  return data.filter((sale) => {
    const saleDate = new Date(sale.date);
    return saleDate >= startDate && saleDate <= endDate;
  });
}

// Calculate percentage change
function calculatePercentageChange(current, previous) {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}

// Get trend HTML
function getTrendHTML(change, type) {
  const absChange = Math.abs(change).toFixed(1);
  const icon = change >= 0 ? "bx-up-arrow-alt" : "bx-down-arrow-alt";
  const color = change >= 0 ? "#2ecc71" : "#e74c3c";
  const text = change >= 0 ? "increase" : "decrease";

  return `
                <span style="color: ${color}; font-size: 14px;">
                    <i class='bx ${icon}'></i> ${absChange}% ${text} vs previous period
                </span>
            `;
}

// Setup charts
function setupCharts() {
  // Sales Trend Chart
  const salesCtx = document.getElementById("salesTrendChart").getContext("2d");
  charts.salesTrendChart = new Chart(salesCtx, {
    type: "line",
    data: generateSalesTrendData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: {
            display: false,
          },
        },
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Sales Revenue ($)",
          },
          grid: {
            color: "rgba(0, 0, 0, 0.05)",
          },
        },
      },
      plugins: {
        legend: {
          display: false,
        },
      },
    },
  });

  // Category Chart
  const categoryCtx = document.getElementById("categoryChart").getContext("2d");
  charts.categoryChart = new Chart(categoryCtx, {
    type: "doughnut",
    data: generateCategoryData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: "70%",
      plugins: {
        legend: {
          position: "right",
        },
      },
    },
  });
}

// Generate sales trend data
function generateSalesTrendData() {
  const filteredData = filterDataByTimeRange(salesData, currentTimeRange);

  // Group by date
  const dailyData = {};
  filteredData.forEach((sale) => {
    if (!dailyData[sale.date]) {
      dailyData[sale.date] = 0;
    }
    dailyData[sale.date] += sale.totalAmount;
  });

  const dates = Object.keys(dailyData).sort();
  const amounts = dates.map((date) => dailyData[date]);

  return {
    labels: dates.map((date) => formatDate(date)),
    datasets: [
      {
        label: "Daily Revenue",
        data: amounts,
        borderColor: "#3498db",
        backgroundColor: "rgba(52, 152, 219, 0.1)",
        borderWidth: 2,
        fill: true,
        tension: 0.4,
      },
    ],
  };
}

// Generate category data
function generateCategoryData() {
  const categoryRevenue = {};

  salesData.forEach((sale) => {
    sale.itemsDetails.forEach((item) => {
      const product = products.find((p) => p.id === item.productId);
      if (product) {
        if (!categoryRevenue[product.category]) {
          categoryRevenue[product.category] = 0;
        }
        categoryRevenue[product.category] += item.total;
      }
    });
  });

  const categories = Object.keys(categoryRevenue);
  const revenues = categories.map((cat) => categoryRevenue[cat]);

  const colors = [
    "#3498db",
    "#2ecc71",
    "#e74c3c",
    "#f39c12",
    "#9b59b6",
    "#1abc9c",
  ];

  return {
    labels: categories,
    datasets: [
      {
        data: revenues,
        backgroundColor: colors.slice(0, categories.length),
        borderWidth: 1,
        borderColor: "#fff",
      },
    ],
  };
}

// Render sales table
function renderSalesTable() {
  const tableBody = document.getElementById("salesTableBody");
  const filteredData = filterDataByTimeRange(salesData, currentTimeRange);
  const statusFilter = document.getElementById("statusFilter").value;

  let dataToDisplay = filteredData;

  // Apply status filter
  if (statusFilter !== "all") {
    dataToDisplay = dataToDisplay.filter(
      (sale) => sale.status === statusFilter
    );
  }

  // Apply customer filter
  const customerFilter = document.getElementById("customerFilter").value;
  if (customerFilter !== "all") {
    dataToDisplay = dataToDisplay.filter(
      (sale) => sale.customer === customerFilter
    );
  }

  // Pagination
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageData = dataToDisplay.slice(startIndex, endIndex);

  if (pageData.length === 0) {
    tableBody.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class='bx bx-package' style="font-size: 48px; margin-bottom: 10px; display: block;"></i>
                            No sales found for the selected filters
                        </td>
                    </tr>
                `;
    return;
  }

  tableBody.innerHTML = pageData
    .map(
      (sale) => `
                <tr>
                    <td>
                        <strong>${sale.invoiceNo}</strong>
                        <div style="font-size: 12px; color: #7f8c8d;">#${
                          sale.id
                        }</div>
                    </td>
                    <td>
                        <div>${sale.customer}</div>
                        <div style="font-size: 12px; color: #7f8c8d;">${
                          sale.customerEmail
                        }</div>
                    </td>
                    <td>${formatDate(sale.date)}</td>
                    <td>
                        <div>${sale.items} items</div>
                        <button onclick="viewSaleItems(${
                          sale.id
                        })" style="font-size: 12px; color: #3498db; background: none; border: none; cursor: pointer; padding: 0;">
                            View Details
                        </button>
                    </td>
                    <td><strong>$${sale.totalAmount.toFixed(2)}</strong></td>
                    <td>
                        <span class="status ${sale.status}">
                            ${
                              sale.status.charAt(0).toUpperCase() +
                              sale.status.slice(1)
                            }
                        </span>
                    </td>
                    <td>${sale.recordedBy}</td>
                    <td>
                        <div style="display: flex; gap: 8px;">
                            <button onclick="editSale(${
                              sale.id
                            })" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                                <i class='bx bx-edit'></i>
                            </button>
                            <button onclick="deleteSale(${
                              sale.id
                            })" class="btn btn-secondary" style="padding: 6px 12px; font-size: 12px;">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </td>
                </tr>
            `
    )
    .join("");
}

// Update product performance
function updateProductPerformance() {
  const performanceContainer = document.getElementById("productPerformance");
  const productSales = {};

  // Calculate sales for each product
  salesData.forEach((sale) => {
    sale.itemsDetails.forEach((item) => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          quantity: 0,
          revenue: 0,
        };
      }
      productSales[item.productId].quantity += item.quantity;
      productSales[item.productId].revenue += item.total;
    });
  });

  // Convert to array and sort by revenue
  const topProducts = Object.keys(productSales)
    .map((productId) => {
      const product = products.find((p) => p.id === parseInt(productId));
      if (!product) return null;

      return {
        ...product,
        sales: productSales[productId].quantity,
        revenue: productSales[productId].revenue,
      };
    })
    .filter((p) => p !== null)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 4);

  const colors = ["#3498db", "#2ecc71", "#e74c3c", "#f39c12"];

  performanceContainer.innerHTML = topProducts
    .map(
      (product, index) => `
                <div class="performance-item">
                    <div class="product-icon" style="background: ${
                      colors[index % colors.length]
                    }">
                        <i class='bx bx-${
                          product.category === "Electronics"
                            ? "desktop"
                            : product.category === "Accessories"
                            ? "mouse"
                            : product.category === "Furniture"
                            ? "chair"
                            : "cube"
                        }'></i>
                    </div>
                    <div class="product-info">
                        <div class="product-name">${product.name}</div>
                        <div class="product-stats">
                            <span>${product.sales} sold</span>
                            <span class="product-revenue">$${product.revenue.toFixed(
                              2
                            )}</span>
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">
                            ${product.category} • ${product.stock} in stock
                        </div>
                    </div>
                </div>
            `
    )
    .join("");
}

// Filter sales table
function filterSalesTable() {
  currentPage = 1;
  renderSalesTable();
}

// Update sales data
function updateSalesData() {
  currentTimeRange = parseInt(document.getElementById("timeRange").value);
  localStorage.setItem("salesTimeRange", currentTimeRange);

  // Update summary
  updateSummaryCards();

  // Update charts
  if (charts.salesTrendChart) {
    charts.salesTrendChart.data = generateSalesTrendData();
    charts.salesTrendChart.update();
  }

  if (charts.categoryChart) {
    charts.categoryChart.data = generateCategoryData();
    charts.categoryChart.update();
  }

  // Update table
  renderSalesTable();

  // Update product performance
  updateProductPerformance();

  showToast("Sales data updated", "success");
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

// Update generated date
function updateGeneratedDate() {
  const now = new Date();
  const formattedDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  document.getElementById(
    "generatedDate"
  ).textContent = `Generated on ${formattedDate}`;
}

// Populate customer filter
function populateCustomerFilter() {
  const customerFilter = document.getElementById("customerFilter");

  // Clear existing options (keeping "All Customers")
  while (customerFilter.options.length > 1) {
    customerFilter.remove(1);
  }

  // Add customer options
  customers.forEach((customer) => {
    const option = document.createElement("option");
    option.value = customer.name;
    option.textContent = customer.name;
    customerFilter.appendChild(option);
  });
}

// Load more sales
function loadMoreSales() {
  currentPage++;
  renderSalesTable();
  showToast(`Loaded page ${currentPage}`, "info");
}

// Refresh sales data
function refreshSalesData() {
  // In a real app, this would fetch from API
  // For demo, just regenerate sample data
  generateSampleSalesData();
  updateSummaryCards();
  renderSalesTable();
  updateProductPerformance();
  showToast("Sales data refreshed", "success");
}

// Export sales report
function exportSalesReport() {
  const dataStr = JSON.stringify(salesData, null, 2);
  const dataBlob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(dataBlob);
  const a = document.createElement("a");

  a.href = url;
  a.download = `sales_report_${new Date().toISOString().split("T")[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  showToast("Sales report exported successfully", "success");
}

// New Sale Modal Functions
function openNewSaleModal() {
  document.getElementById("newSaleModal").style.display = "flex";
  saleItems = [];
  updateSaleTotal();
}

function closeNewSaleModal() {
  document.getElementById("newSaleModal").style.display = "none";
  document.getElementById("newSaleForm").reset();
  saleItems = [];
}

function addSaleItem() {
  const container = document.getElementById("saleItemsContainer");
  const index = saleItems.length;

  const itemHtml = `
                <div class="sale-item" style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                    <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: end;">
                        <div>
                            <label style="font-size: 13px;">Product *</label>
                            <select class="form-control product-select" data-index="${index}" onchange="updateSaleItem(${index}, 'product', this.value)" required>
                                <option value="">Select product</option>
                                ${products
                                  .map(
                                    (p) =>
                                      `<option value="${p.id}">${p.name} - $${p.price}</option>`
                                  )
                                  .join("")}
                            </select>
                        </div>
                        <div>
                            <label style="font-size: 13px;">Quantity *</label>
                            <input type="number" class="form-control quantity-input" data-index="${index}" 
                                   min="1" value="1" onchange="updateSaleItem(${index}, 'quantity', this.value)" required>
                        </div>
                        <div>
                            <label style="font-size: 13px;">Price</label>
                            <input type="number" class="form-control price-input" data-index="${index}" 
                                   step="0.01" onchange="updateSaleItem(${index}, 'price', this.value)" readonly>
                        </div>
                        <div>
                            <label style="font-size: 13px;">Total</label>
                            <input type="text" class="form-control total-input" data-index="${index}" readonly>
                        </div>
                        <div>
                            <button type="button" class="btn btn-secondary" onclick="removeSaleItem(${index})" style="padding: 10px;">
                                <i class='bx bx-trash'></i>
                            </button>
                        </div>
                    </div>
                </div>
            `;

  container.insertAdjacentHTML("beforeend", itemHtml);
  saleItems.push({
    productId: "",
    quantity: 1,
    price: 0,
    total: 0,
  });
}

function updateSaleItem(index, field, value) {
  if (!saleItems[index]) return;

  if (field === "product") {
    const product = products.find((p) => p.id === parseInt(value));
    if (product) {
      saleItems[index].productId = product.id;
      saleItems[index].price = product.price;

      // Update price input
      const priceInput = document.querySelector(
        `.price-input[data-index="${index}"]`
      );
      if (priceInput) priceInput.value = product.price;

      // Update total
      updateItemTotal(index);
    }
  } else if (field === "quantity") {
    saleItems[index].quantity = parseInt(value) || 1;
    updateItemTotal(index);
  } else if (field === "price") {
    saleItems[index].price = parseFloat(value) || 0;
    updateItemTotal(index);
  }

  updateSaleTotal();
}

function updateItemTotal(index) {
  const item = saleItems[index];
  item.total = item.quantity * item.price;

  const totalInput = document.querySelector(
    `.total-input[data-index="${index}"]`
  );
  if (totalInput) totalInput.value = `$${item.total.toFixed(2)}`;
}

function removeSaleItem(index) {
  saleItems.splice(index, 1);

  // Re-render items
  const container = document.getElementById("saleItemsContainer");
  container.innerHTML = "";

  saleItems.forEach((item, idx) => {
    // Recreate HTML for each item
    const product = products.find((p) => p.id === item.productId);
    container.insertAdjacentHTML(
      "beforeend",
      `
                    <div class="sale-item" style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: end;">
                            <div>
                                <label style="font-size: 13px;">Product *</label>
                                <select class="form-control product-select" data-index="${idx}" onchange="updateSaleItem(${idx}, 'product', this.value)" required>
                                    <option value="">Select product</option>
                                    ${products
                                      .map(
                                        (p) =>
                                          `<option value="${p.id}" ${
                                            p.id === item.productId
                                              ? "selected"
                                              : ""
                                          }>${p.name} - $${p.price}</option>`
                                      )
                                      .join("")}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 13px;">Quantity *</label>
                                <input type="number" class="form-control quantity-input" data-index="${idx}" 
                                       min="1" value="${
                                         item.quantity
                                       }" onchange="updateSaleItem(${idx}, 'quantity', this.value)" required>
                            </div>
                            <div>
                                <label style="font-size: 13px;">Price</label>
                                <input type="number" class="form-control price-input" data-index="${idx}" 
                                       step="0.01" value="${
                                         item.price
                                       }" onchange="updateSaleItem(${idx}, 'price', this.value)" readonly>
                            </div>
                            <div>
                                <label style="font-size: 13px;">Total</label>
                                <input type="text" class="form-control total-input" data-index="${idx}" value="$${item.total.toFixed(
        2
      )}" readonly>
                            </div>
                            <div>
                                <button type="button" class="btn btn-secondary" onclick="removeSaleItem(${idx})" style="padding: 10px;">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
    );
  });

  updateSaleTotal();
}

function updateSaleTotal() {
  const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1; // 10% tax
  const total = subtotal + tax;

  document.getElementById("subtotalAmount").textContent = `$${subtotal.toFixed(
    2
  )}`;
  document.getElementById("taxAmount").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("totalAmount").textContent = `$${total.toFixed(2)}`;
}

function processNewSale() {
  const customerName = document.getElementById("customerName").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const paymentMethod = document.getElementById("paymentMethod").value;
  const status = document.getElementById("saleStatus").value;
  const notes = document.getElementById("notes").value;

  // Validation
  if (!customerName) {
    showToast("Please enter customer name", "error");
    return;
  }

  if (saleItems.length === 0) {
    showToast("Please add at least one item to the sale", "error");
    return;
  }

  // Calculate totals
  const subtotal = saleItems.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  // Create new sale
  const newSale = {
    id: salesData.length + 1,
    invoiceNo: `INV-${1000 + salesData.length}`,
    customer: customerName,
    date: new Date().toISOString().split("T")[0],
    items: saleItems.length,
    totalAmount: total,
    status: status,
    recordedBy: "Admin",
    customerEmail: customerEmail,
    itemsDetails: saleItems.map((item) => ({
      productId: item.productId,
      productName:
        products.find((p) => p.id === item.productId)?.name || "Unknown",
      quantity: item.quantity,
      price: item.price,
      total: item.total,
    })),
    paymentMethod: paymentMethod,
    notes: notes,
    subtotal: subtotal,
    tax: tax,
  };

  // Add to sales data
  salesData.unshift(newSale);

  // Update UI
  updateSummaryCards();
  renderSalesTable();
  updateProductPerformance();

  // Close modal
  closeNewSaleModal();

  // Show success message
  showToast(
    `Sale completed successfully! Invoice: ${newSale.invoiceNo}`,
    "success"
  );

  // In a real app, you might want to print the invoice
  console.log("New sale created:", newSale);
}

// View sale items
function viewSaleItems(saleId) {
  const sale = salesData.find((s) => s.id === saleId);
  if (!sale) return;

  let itemsHtml = `<h3 style="margin-bottom: 15px;">Invoice ${sale.invoiceNo}</h3>`;
  itemsHtml += `<table style="width: 100%; border-collapse: collapse;">`;
  itemsHtml += `
                <thead>
                    <tr>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: left;">Product</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Qty</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Price</th>
                        <th style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">Total</th>
                    </tr>
                </thead>
                <tbody>
            `;

  sale.itemsDetails.forEach((item) => {
    itemsHtml += `
                    <tr>
                        <td style="padding: 10px; border-bottom: 1px solid #eee;">${
                          item.productName
                        }</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${
                          item.quantity
                        }</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.price.toFixed(
                          2
                        )}</td>
                        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">$${item.total.toFixed(
                          2
                        )}</td>
                    </tr>
                `;
  });

  itemsHtml += `
                </tbody>
                <tfoot>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Subtotal:</td>
                        <td style="padding: 10px; text-align: right;">$${sale.totalAmount.toFixed(
                          2
                        )}</td>
                    </tr>
                    <tr>
                        <td colspan="3" style="padding: 10px; text-align: right; font-weight: bold;">Status:</td>
                        <td style="padding: 10px; text-align: right;">
                            <span class="status ${sale.status}">${
    sale.status
  }</span>
                        </td>
                    </tr>
                </tfoot>
            </table>`;

  alertDialog("Sale Items", itemsHtml);
}

// Edit sale
function editSale(saleId) {
  const sale = salesData.find((s) => s.id === saleId);
  if (!sale) return;

  openNewSaleModal();

  // Pre-fill form with sale data
  document.getElementById("customerName").value = sale.customer;
  document.getElementById("customerEmail").value = sale.customerEmail || "";
  document.getElementById("paymentMethod").value = sale.paymentMethod || "cash";
  document.getElementById("saleStatus").value = sale.status;
  document.getElementById("notes").value = sale.notes || "";

  // Clear existing items and add sale items
  saleItems = sale.itemsDetails.map((item) => ({
    productId: item.productId,
    quantity: item.quantity,
    price: item.price,
    total: item.total,
  }));

  // Re-render items
  const container = document.getElementById("saleItemsContainer");
  container.innerHTML = "";

  saleItems.forEach((item, index) => {
    const product = products.find((p) => p.id === item.productId);
    container.insertAdjacentHTML(
      "beforeend",
      `
                    <div class="sale-item" style="background: #f8f9fa; padding: 15px; border-radius: 6px; margin-bottom: 10px;">
                        <div style="display: grid; grid-template-columns: 2fr 1fr 1fr 1fr auto; gap: 10px; align-items: end;">
                            <div>
                                <label style="font-size: 13px;">Product *</label>
                                <select class="form-control product-select" data-index="${index}" onchange="updateSaleItem(${index}, 'product', this.value)" required>
                                    <option value="">Select product</option>
                                    ${products
                                      .map(
                                        (p) =>
                                          `<option value="${p.id}" ${
                                            p.id === item.productId
                                              ? "selected"
                                              : ""
                                          }>${p.name} - $${p.price}</option>`
                                      )
                                      .join("")}
                                </select>
                            </div>
                            <div>
                                <label style="font-size: 13px;">Quantity *</label>
                                <input type="number" class="form-control quantity-input" data-index="${index}" 
                                       min="1" value="${
                                         item.quantity
                                       }" onchange="updateSaleItem(${index}, 'quantity', this.value)" required>
                            </div>
                            <div>
                                <label style="font-size: 13px;">Price</label>
                                <input type="number" class="form-control price-input" data-index="${index}" 
                                       step="0.01" value="${
                                         item.price
                                       }" onchange="updateSaleItem(${index}, 'price', this.value)" readonly>
                            </div>
                            <div>
                                <label style="font-size: 13px;">Total</label>
                                <input type="text" class="form-control total-input" data-index="${index}" value="$${item.total.toFixed(
        2
      )}" readonly>
                            </div>
                            <div>
                                <button type="button" class="btn btn-secondary" onclick="removeSaleItem(${index})" style="padding: 10px;">
                                    <i class='bx bx-trash'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                `
    );
  });

  updateSaleTotal();
  showToast(`Editing sale ${sale.invoiceNo}`, "info");
}

// Delete sale
function deleteSale(saleId) {
  if (
    !confirm(
      "Are you sure you want to delete this sale? This action cannot be undone."
    )
  ) {
    return;
  }

  const saleIndex = salesData.findIndex((s) => s.id === saleId);
  if (saleIndex !== -1) {
    const deletedSale = salesData[saleIndex];
    salesData.splice(saleIndex, 1);

    // Update UI
    updateSummaryCards();
    renderSalesTable();
    updateProductPerformance();

    showToast(`Sale ${deletedSale.invoiceNo} deleted successfully`, "success");
  }
}

// Toggle chart type
function toggleChartType(chartId) {
  const chart = charts[chartId];
  if (!chart) return;

  const currentType = chart.config.type;
  const newType =
    currentType === "line"
      ? "bar"
      : currentType === "bar"
      ? "pie"
      : currentType === "pie"
      ? "doughnut"
      : "line";

  chart.config.type = newType;
  chart.update();

  showToast(`Chart changed to ${newType}`, "info");
}

// Download chart
function downloadChart(chartId) {
  const chart = charts[chartId];
  if (!chart) return;

  const link = document.createElement("a");
  link.download = `${chartId}_${new Date().toISOString().split("T")[0]}.png`;
  link.href = chart.toBase64Image();
  link.click();

  showToast("Chart downloaded", "success");
}

// Show toast notification
function showToast(message, type = "success") {
  const toast = document.getElementById("notificationToast");
  const toastMessage = document.getElementById("toastMessage");

  // Set message and type
  toastMessage.textContent = message;
  toast.className = `toast ${
    type === "success"
      ? "toast-success"
      : type === "error"
      ? "toast-error"
      : "toast-warning"
  } show`;

  // Update icon
  const icon = toast.querySelector(".toast-icon i");
  icon.className =
    type === "success"
      ? "bx bx-check-circle"
      : type === "error"
      ? "bx bx-x-circle"
      : "bx bx-error-circle";

  // Auto hide after 3 seconds
  setTimeout(hideToast, 3000);
}

function hideToast() {
  document.getElementById("notificationToast").classList.remove("show");
}

// Alert dialog (simple replacement for modal)
function alertDialog(title, content) {
  const dialog = document.createElement("div");
  dialog.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
            `;

  dialog.innerHTML = `
                <div style="background: white; padding: 25px; border-radius: 12px; max-width: 600px; max-height: 80vh; overflow-y: auto;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h3 style="margin: 0;">${title}</h3>
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="background: none; border: none; font-size: 24px; cursor: pointer; color: #7f8c8d;">
                            &times;
                        </button>
                    </div>
                    <div>${content}</div>
                    <div style="text-align: right; margin-top: 20px;">
                        <button onclick="this.parentElement.parentElement.parentElement.remove()" 
                                style="padding: 10px 20px; background: #3498db; color: white; border: none; border-radius: 6px; cursor: pointer;">
                            Close
                        </button>
                    </div>
                </div>
            `;

  document.body.appendChild(dialog);
}

// Make functions available globally
window.openNewSaleModal = openNewSaleModal;
window.closeNewSaleModal = closeNewSaleModal;
window.addSaleItem = addSaleItem;
window.updateSaleItem = updateSaleItem;
window.removeSaleItem = removeSaleItem;
window.processNewSale = processNewSale;
window.viewSaleItems = viewSaleItems;
window.editSale = editSale;
window.deleteSale = deleteSale;
window.exportSalesReport = exportSalesReport;
window.refreshSalesData = refreshSalesData;
window.loadMoreSales = loadMoreSales;
window.updateSalesData = updateSalesData;
window.filterSalesTable = filterSalesTable;
window.toggleChartType = toggleChartType;
window.downloadChart = downloadChart;
window.hideToast = hideToast;
