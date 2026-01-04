// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize transaction data
  initializeCharts();
  loadTransactionData();
  setupEventListeners();
});

// Sample transaction data
let transactionData = {
  transactions: [
    {
      id: "TXN-2023-001",
      date: "2023-10-18 14:30",
      type: "sale",
      product: "Wireless Bluetooth Headphones",
      quantity: 2,
      amount: 179.98,
      user: "Admin",
      reference: "ORD-2023-001",
      customer: "John Smith",
      paymentStatus: "paid",
      details: "Sale completed through online store",
    },
    {
      id: "TXN-2023-002",
      date: "2023-10-18 11:15",
      type: "purchase",
      product: "Ergonomic Office Chair",
      quantity: 5,
      amount: -1249.95,
      user: "Manager",
      reference: "PO-2023-045",
      supplier: "Supplier ABC",
      status: "received",
      details: "Purchase order from supplier",
    },
    {
      id: "TXN-2023-003",
      date: "2023-10-17 16:45",
      type: "stock-in",
      product: "Smart Fitness Watch",
      quantity: 20,
      amount: 0,
      user: "Admin",
      reference: "STK-IN-023",
      source: "Supplier XYZ",
      details: "Stock received from supplier",
    },
    {
      id: "TXN-2023-004",
      date: "2023-10-17 10:20",
      type: "stock-out",
      product: "Premium Notebook Set",
      quantity: -15,
      amount: 0,
      user: "Staff",
      reference: "STK-OUT-128",
      destination: "Warehouse A",
      details: "Stock transferred to warehouse",
    },
    {
      id: "TXN-2023-005",
      date: "2023-10-16 09:30",
      type: "adjustment",
      product: "Desk Lamp with Wireless Charger",
      quantity: -3,
      amount: 0,
      user: "Admin",
      reference: "ADJ-2023-012",
      reason: "Damaged during handling",
      details: "Stock adjustment due to damaged goods",
    },
    {
      id: "TXN-2023-006",
      date: "2023-10-15 13:10",
      type: "sale",
      product: "Bluetooth Portable Speaker",
      quantity: 1,
      amount: 59.99,
      user: "Manager",
      reference: "ORD-2023-004",
      customer: "Emily Davis",
      paymentStatus: "paid",
      details: "In-store purchase",
    },
    {
      id: "TXN-2023-007",
      date: "2023-10-14 15:45",
      type: "transfer",
      product: "Stainless Steel Water Bottle",
      quantity: 25,
      amount: 0,
      user: "Staff",
      reference: "TRF-2023-008",
      from: "Main Warehouse",
      to: "Retail Store",
      details: "Stock transfer between locations",
    },
    {
      id: "TXN-2023-008",
      date: "2023-10-14 12:30",
      type: "return",
      product: "Wireless Gaming Mouse",
      quantity: 1,
      amount: -79.99,
      user: "Admin",
      reference: "RET-2023-005",
      customer: "Robert Wilson",
      reason: "Defective product",
      details: "Customer return with refund",
    },
    {
      id: "TXN-2023-009",
      date: "2023-10-13 09:15",
      type: "purchase",
      product: "Wireless Bluetooth Headphones",
      quantity: 50,
      amount: -2249.5,
      user: "Manager",
      reference: "PO-2023-044",
      supplier: "Global Supplies Inc.",
      status: "pending",
      details: "Bulk purchase order",
    },
    {
      id: "TXN-2023-010",
      date: "2023-10-12 16:20",
      type: "sale",
      product: "Smart Fitness Watch",
      quantity: 1,
      amount: 199.99,
      user: "Staff",
      reference: "ORD-2023-003",
      customer: "Michael Chen",
      paymentStatus: "pending",
      details: "Online order, payment pending",
    },
    {
      id: "TXN-2023-011",
      date: "2023-10-11 11:45",
      type: "adjustment",
      product: "Premium Notebook Set",
      quantity: 10,
      amount: 0,
      user: "Admin",
      reference: "ADJ-2023-011",
      reason: "Found during inventory count",
      details: "Positive adjustment after inventory count",
    },
    {
      id: "TXN-2023-012",
      date: "2023-10-10 14:10",
      type: "stock-in",
      product: "Bluetooth Portable Speaker",
      quantity: 30,
      amount: 0,
      user: "Manager",
      reference: "STK-IN-022",
      source: "Prime Distributors",
      details: "New stock received",
    },
  ],
  activities: [
    {
      timestamp: "2023-10-18 15:30",
      activity: "User login",
      user: "Admin",
      ip: "192.168.1.100",
      details: "Successful login from office network",
    },
    {
      timestamp: "2023-10-18 14:45",
      activity: "Product added",
      user: "Manager",
      ip: "192.168.1.105",
      details: "Added new product: Wireless Keyboard",
    },
    {
      timestamp: "2023-10-18 13:20",
      activity: "Stock adjustment",
      user: "Admin",
      ip: "192.168.1.100",
      details: "Adjusted stock for damaged items",
    },
    {
      timestamp: "2023-10-18 11:30",
      activity: "Report generated",
      user: "Staff",
      ip: "192.168.1.110",
      details: "Monthly sales report generated",
    },
    {
      timestamp: "2023-10-18 10:15",
      activity: "User permission changed",
      user: "Admin",
      ip: "192.168.1.100",
      details: "Updated permissions for staff user",
    },
    {
      timestamp: "2023-10-18 09:45",
      activity: "Backup created",
      user: "System",
      ip: "192.168.1.1",
      details: "Daily system backup completed",
    },
  ],
};

// Current page for pagination
let currentPage = 1;
const itemsPerPage = 10;
let filteredTransactions = [...transactionData.transactions];

// Initialize charts
function initializeCharts() {
  // Transaction Trend Chart
  const trendCtx = document
    .getElementById("transactionTrendChart")
    .getContext("2d");
  const trendChart = new Chart(trendCtx, {
    type: "line",
    data: {
      labels: [
        "Oct 1",
        "Oct 5",
        "Oct 10",
        "Oct 15",
        "Oct 20",
        "Oct 25",
        "Oct 30",
      ],
      datasets: [
        {
          label: "Sales",
          data: [12, 18, 15, 22, 25, 20, 28],
          borderColor: "#27ae60",
          backgroundColor: "rgba(39, 174, 96, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Purchases",
          data: [8, 10, 12, 15, 14, 16, 18],
          borderColor: "#3498db",
          backgroundColor: "rgba(52, 152, 219, 0.1)",
          borderWidth: 2,
          fill: true,
          tension: 0.4,
        },
        {
          label: "Stock Movements",
          data: [5, 8, 6, 10, 12, 9, 11],
          borderColor: "#9b59b6",
          backgroundColor: "rgba(155, 89, 182, 0.1)",
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
          title: {
            display: true,
            text: "Number of Transactions",
          },
        },
      },
    },
  });

  // Transaction Type Chart
  const typeCtx = document
    .getElementById("transactionTypeChart")
    .getContext("2d");
  const typeChart = new Chart(typeCtx, {
    type: "doughnut",
    data: {
      labels: [
        "Sales",
        "Purchases",
        "Stock In",
        "Stock Out",
        "Adjustments",
        "Transfers",
        "Returns",
      ],
      datasets: [
        {
          data: [35, 25, 15, 10, 8, 5, 2],
          backgroundColor: [
            "#27ae60",
            "#3498db",
            "#9b59b6",
            "#f39c12",
            "#e74c3c",
            "#1abc9c",
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
          position: "bottom",
        },
      },
    },
  });

  // Update chart on period change
  document
    .getElementById("trendPeriod")
    .addEventListener("change", function () {
      // In a real app, you would fetch new data based on the selected period
      trendChart.update();
      typeChart.update();
    });
}

// Load transaction data into tables
function loadTransactionData() {
  updateTransactionOverview();
  loadAllTransactionsTable();
  loadSalesTransactionsTable();
  loadActivitiesTable();
  renderPagination();
}

// Update transaction overview statistics
function updateTransactionOverview() {
  const totalTransactions = transactionData.transactions.length;
  const salesTransactions = transactionData.transactions.filter(
    (t) => t.type === "sale"
  ).length;
  const purchaseTransactions = transactionData.transactions.filter(
    (t) => t.type === "purchase"
  ).length;
  const stockTransactions = transactionData.transactions.filter(
    (t) =>
      t.type === "stock-in" || t.type === "stock-out" || t.type === "transfer"
  ).length;

  document.getElementById("totalTransactions").textContent = totalTransactions;
  document.getElementById("salesTransactions").textContent = salesTransactions;
  document.getElementById("purchaseTransactions").textContent =
    purchaseTransactions;
  document.getElementById("stockTransactions").textContent = stockTransactions;
}

// Load all transactions table
function loadAllTransactionsTable() {
  const allTransactionsTable = document.getElementById("allTransactionsTable");
  allTransactionsTable.innerHTML = "";

  // Get transactions for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

  if (pageTransactions.length === 0) {
    allTransactionsTable.innerHTML = `
                    <tr>
                        <td colspan="9" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-search" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <div>No transactions found</div>
                            <div style="font-size: 14px; margin-top: 10px;">Try adjusting your filters</div>
                        </td>
                    </tr>
                `;
    return;
  }

  pageTransactions.forEach((transaction) => {
    const row = document.createElement("tr");

    // Determine type badge
    let typeClass = "";
    let typeText = "";
    switch (transaction.type) {
      case "sale":
        typeClass = "status-sale";
        typeText = "Sale";
        break;
      case "purchase":
        typeClass = "status-purchase";
        typeText = "Purchase";
        break;
      case "stock-in":
        typeClass = "status-stock-in";
        typeText = "Stock In";
        break;
      case "stock-out":
        typeClass = "status-stock-out";
        typeText = "Stock Out";
        break;
      case "adjustment":
        typeClass = "status-adjustment";
        typeText = "Adjustment";
        break;
      case "transfer":
        typeClass = "status-transfer";
        typeText = "Transfer";
        break;
      case "return":
        typeClass = "status-return";
        typeText = "Return";
        break;
    }

    // Format amount
    let amountDisplay = "";
    if (transaction.amount > 0) {
      amountDisplay = `<span style="color: var(--success-color); font-weight: 600;">$${transaction.amount.toFixed(
        2
      )}</span>`;
    } else if (transaction.amount < 0) {
      amountDisplay = `<span style="color: var(--accent-color); font-weight: 600;">$${Math.abs(
        transaction.amount
      ).toFixed(2)}</span>`;
    } else {
      amountDisplay = '<span style="color: #7f8c8d;">-</span>';
    }

    // Format quantity
    let quantityDisplay = transaction.quantity;
    if (
      transaction.type === "stock-out" ||
      transaction.type === "adjustment" ||
      transaction.type === "return"
    ) {
      quantityDisplay = `<span style="color: var(--accent-color);">${transaction.quantity}</span>`;
    } else if (
      transaction.type === "stock-in" ||
      transaction.type === "transfer"
    ) {
      quantityDisplay = `<span style="color: var(--success-color);">+${transaction.quantity}</span>`;
    }

    row.innerHTML = `
                    <td><strong>${transaction.id}</strong></td>
                    <td>${transaction.date}</td>
                    <td><span class="status-badge ${typeClass}">${typeText}</span></td>
                    <td>${transaction.product}</td>
                    <td>${quantityDisplay}</td>
                    <td>${amountDisplay}</td>
                    <td>${transaction.user}</td>
                    <td>${transaction.reference}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewTransactionDetails('${transaction.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="printTransaction('${transaction.id}')">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                `;
    allTransactionsTable.appendChild(row);
  });
}

// Load sales transactions table
function loadSalesTransactionsTable() {
  const salesTransactionsTable = document.getElementById(
    "salesTransactionsTable"
  );
  salesTransactionsTable.innerHTML = "";

  const salesTransactions = transactionData.transactions.filter(
    (t) => t.type === "sale"
  );

  if (salesTransactions.length === 0) {
    salesTransactionsTable.innerHTML = `
                    <tr>
                        <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-shopping-cart" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <div>No sales transactions found</div>
                        </td>
                    </tr>
                `;
    return;
  }

  salesTransactions.forEach((transaction) => {
    const row = document.createElement("tr");

    // Calculate total items
    const totalItems = transaction.quantity;

    // Determine payment status
    let paymentStatus = "";
    if (transaction.paymentStatus === "paid") {
      paymentStatus =
        '<span style="color: var(--success-color); font-weight: 600;">Paid</span>';
    } else {
      paymentStatus =
        '<span style="color: var(--warning-color); font-weight: 600;">Pending</span>';
    }

    row.innerHTML = `
                    <td><strong>${transaction.id}</strong></td>
                    <td>${transaction.date}</td>
                    <td>${transaction.customer || "N/A"}</td>
                    <td>${totalItems} items</td>
                    <td><strong>₹${transaction.amount.toFixed(2)}</strong></td>
                    <td>${paymentStatus}</td>
                    <td>${transaction.user}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewTransactionDetails('${
                          transaction.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-outline" onclick="printTransaction('${
                          transaction.id
                        }')">
                            <i class="fas fa-print"></i>
                        </button>
                    </td>
                `;
    salesTransactionsTable.appendChild(row);
  });
}

// Load activities table
function loadActivitiesTable() {
  const activitiesTable = document.getElementById("activitiesTable");
  activitiesTable.innerHTML = "";

  transactionData.activities.forEach((activity) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                    <td>${activity.timestamp}</td>
                    <td><strong>${activity.activity}</strong></td>
                    <td>${activity.user}</td>
                    <td><code>${activity.ip}</code></td>
                    <td>${activity.details}</td>
                `;
    activitiesTable.appendChild(row);
  });
}

// Filter transactions
function filterTransactions() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const typeFilter = document.getElementById("transactionTypeFilter").value;
  const userFilter = document.getElementById("userFilter").value;
  const searchTerm = document
    .getElementById("transactionSearch")
    .value.toLowerCase();

  filteredTransactions = transactionData.transactions.filter((transaction) => {
    // Date filter
    const transactionDate = transaction.date.split(" ")[0];
    let matchesDate = true;
    if (startDate && endDate) {
      matchesDate = transactionDate >= startDate && transactionDate <= endDate;
    }

    // Type filter
    const matchesType = !typeFilter || transaction.type === typeFilter;

    // User filter
    const matchesUser =
      !userFilter ||
      transaction.user.toLowerCase().includes(userFilter.toLowerCase());

    // Search filter
    const matchesSearch =
      !searchTerm ||
      transaction.id.toLowerCase().includes(searchTerm) ||
      transaction.product.toLowerCase().includes(searchTerm) ||
      transaction.reference.toLowerCase().includes(searchTerm) ||
      (transaction.customer &&
        transaction.customer.toLowerCase().includes(searchTerm)) ||
      (transaction.supplier &&
        transaction.supplier.toLowerCase().includes(searchTerm));

    return matchesDate && matchesType && matchesUser && matchesSearch;
  });

  // Reset to first page
  currentPage = 1;

  // Reload tables
  loadAllTransactionsTable();
  loadSalesTransactionsTable();
  renderPagination();
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);

  if (totalPages <= 1) return;

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = `page-btn ${currentPage === 1 ? "disabled" : ""}`;
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadAllTransactionsTable();
      renderPagination();
    }
  };
  pagination.appendChild(prevBtn);

  // Page buttons
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  // Adjust start page if we're near the end
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `page-btn ${i === currentPage ? "active" : ""}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      loadAllTransactionsTable();
      renderPagination();
    };
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = `page-btn ${
    currentPage === totalPages ? "disabled" : ""
  }`;
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadAllTransactionsTable();
      renderPagination();
    }
  };
  pagination.appendChild(nextBtn);
}

// View transaction details
function viewTransactionDetails(transactionId) {
  const transaction = transactionData.transactions.find(
    (t) => t.id === transactionId
  );
  if (!transaction) return;

  document.getElementById(
    "detailsTitle"
  ).textContent = `Transaction: ${transaction.id}`;

  // Determine type badge
  let typeClass = "";
  let typeText = "";
  let typeIcon = "";
  switch (transaction.type) {
    case "sale":
      typeClass = "status-sale";
      typeText = "Sale";
      typeIcon = "fa-shopping-cart";
      break;
    case "purchase":
      typeClass = "status-purchase";
      typeText = "Purchase";
      typeIcon = "fa-truck";
      break;
    case "stock-in":
      typeClass = "status-stock-in";
      typeText = "Stock In";
      typeIcon = "fa-arrow-down";
      break;
    case "stock-out":
      typeClass = "status-stock-out";
      typeText = "Stock Out";
      typeIcon = "fa-arrow-up";
      break;
    case "adjustment":
      typeClass = "status-adjustment";
      typeText = "Adjustment";
      typeIcon = "fa-exchange-alt";
      break;
    case "transfer":
      typeClass = "status-transfer";
      typeText = "Transfer";
      typeIcon = "fa-truck-moving";
      break;
    case "return":
      typeClass = "status-return";
      typeText = "Return";
      typeIcon = "fa-undo";
      break;
  }

  // Generate details content based on transaction type
  let detailsContent = "";

  if (transaction.type === "sale") {
    detailsContent = `
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h4 style="margin-bottom: 15px;">Transaction Information</h4>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Transaction ID:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.id
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Date & Time:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.date
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Type:</td>
                                    <td style="padding: 8px 0;"><span class="status-badge ${typeClass}"><i class="fas ${typeIcon}"></i> ${typeText}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Reference:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.reference
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">User:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.user
                                    }</td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 15px;">Customer Information</h4>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Customer:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.customer || "N/A"
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Payment Status:</td>
                                    <td style="padding: 8px 0;">
                                        ${
                                          transaction.paymentStatus === "paid"
                                            ? '<span style="color: var(--success-color); font-weight: 600;">Paid</span>'
                                            : '<span style="color: var(--warning-color); font-weight: 600;">Pending</span>'
                                        }
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h4 style="margin-bottom: 15px;">Transaction Details</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Price</th>
                                        <th>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${transaction.product}</td>
                                        <td>${transaction.quantity}</td>
                                        <td>$${(
                                          transaction.amount /
                                          transaction.quantity
                                        ).toFixed(2)}</td>
                                        <td><strong>₹${transaction.amount.toFixed(
                                          2
                                        )}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 15px;">Additional Information</h4>
                        <p style="color: #7f8c8d; font-style: italic;">${
                          transaction.details
                        }</p>
                    </div>
                `;
  } else if (transaction.type === "purchase") {
    detailsContent = `
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h4 style="margin-bottom: 15px;">Transaction Information</h4>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Transaction ID:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.id
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Date & Time:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.date
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Type:</td>
                                    <td style="padding: 8px 0;"><span class="status-badge ${typeClass}"><i class="fas ${typeIcon}"></i> ${typeText}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Reference:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.reference
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">User:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.user
                                    }</td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 15px;">Supplier Information</h4>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Supplier:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.supplier || "N/A"
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Status:</td>
                                    <td style="padding: 8px 0;">
                                        ${
                                          transaction.status === "received"
                                            ? '<span style="color: var(--success-color); font-weight: 600;">Received</span>'
                                            : '<span style="color: var(--warning-color); font-weight: 600;">Pending</span>'
                                        }
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 30px;">
                        <h4 style="margin-bottom: 15px;">Transaction Details</h4>
                        <div class="table-container">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Product</th>
                                        <th>Quantity</th>
                                        <th>Unit Cost</th>
                                        <th>Total Cost</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>${transaction.product}</td>
                                        <td>${transaction.quantity}</td>
                                        <td>$${(
                                          Math.abs(transaction.amount) /
                                          transaction.quantity
                                        ).toFixed(2)}</td>
                                        <td><strong style="color: var(--accent-color);">$${Math.abs(
                                          transaction.amount
                                        ).toFixed(2)}</strong></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 15px;">Additional Information</h4>
                        <p style="color: #7f8c8d; font-style: italic;">${
                          transaction.details
                        }</p>
                    </div>
                `;
  } else {
    // Generic transaction details for other types
    detailsContent = `
                    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                        <div>
                            <h4 style="margin-bottom: 15px;">Transaction Information</h4>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Transaction ID:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.id
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Date & Time:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.date
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Type:</td>
                                    <td style="padding: 8px 0;"><span class="status-badge ${typeClass}"><i class="fas ${typeIcon}"></i> ${typeText}</span></td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Reference:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.reference
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">User:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.user
                                    }</td>
                                </tr>
                            </table>
                        </div>
                        <div>
                            <h4 style="margin-bottom: 15px;">Transaction Summary</h4>
                            <table style="width: 100%;">
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Product:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">${
                                      transaction.product
                                    }</td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Quantity:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">
                                        ${transaction.quantity > 0 ? "+" : ""}${
      transaction.quantity
    }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #7f8c8d;">Amount:</td>
                                    <td style="padding: 8px 0; font-weight: 600;">
                                        ${
                                          transaction.amount !== 0
                                            ? transaction.amount > 0
                                              ? `<span style="color: var(--success-color);">$${transaction.amount.toFixed(
                                                  2
                                                )}</span>`
                                              : `<span style="color: var(--accent-color);">$${Math.abs(
                                                  transaction.amount
                                                ).toFixed(2)}</span>`
                                            : "-"
                                        }
                                    </td>
                                </tr>
                            </table>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 15px;">Additional Information</h4>
                        <p style="color: #7f8c8d; font-style: italic;">${
                          transaction.details
                        }</p>
                        ${
                          transaction.reason
                            ? `<p><strong>Reason:</strong> ${transaction.reason}</p>`
                            : ""
                        }
                        ${
                          transaction.source
                            ? `<p><strong>Source:</strong> ${transaction.source}</p>`
                            : ""
                        }
                        ${
                          transaction.destination
                            ? `<p><strong>Destination:</strong> ${transaction.destination}</p>`
                            : ""
                        }
                        ${
                          transaction.from && transaction.to
                            ? `<p><strong>Transfer:</strong> From ${transaction.from} to ${transaction.to}</p>`
                            : ""
                        }
                    </div>
                `;
  }

  const detailsContainer = document.getElementById("transactionDetailsContent");
  detailsContainer.innerHTML = detailsContent;

  // Show the details panel
  document.getElementById("transactionDetails").classList.add("active");

  // Scroll to the details panel
  document
    .getElementById("transactionDetails")
    .scrollIntoView({ behavior: "smooth" });
}

// Close transaction details
function closeTransactionDetails() {
  document.getElementById("transactionDetails").classList.remove("active");
}

// Print transaction
function printTransaction(transactionId) {
  alert(`Printing transaction: ${transactionId}`);
  // In a real app, this would open a print dialog with the transaction details
}

// Show export modal
function showExportModal() {
  document.getElementById("exportModal").classList.add("active");
}

// Handle export date range change
function handleExportDateRangeChange() {
  const dateRange = document.getElementById("exportDateRange").value;
  const customDateRange = document.getElementById("customDateRange");

  if (dateRange === "custom") {
    customDateRange.style.display = "grid";
  } else {
    customDateRange.style.display = "none";
  }
}

// Process export
function processExport(event) {
  event.preventDefault();

  const format = document.getElementById("exportFormat").value;
  const dateRange = document.getElementById("exportDateRange").value;
  const transactionType = document.getElementById(
    "exportTransactionType"
  ).value;

  // Show success notification
  showNotification(
    `Transaction history exported as ${format.toUpperCase()} file!`,
    "success"
  );

  // Close modal
  document.getElementById("exportModal").classList.remove("active");

  // Reset form
  document.getElementById("exportForm").reset();
  document.getElementById("customDateRange").style.display = "none";
}

// Clear all filters
function clearFilters() {
  document.getElementById("startDate").value = "2023-10-01";
  document.getElementById("endDate").value = "2023-10-31";
  document.getElementById("transactionTypeFilter").value = "";
  document.getElementById("userFilter").value = "";
  document.getElementById("transactionSearch").value = "";

  filteredTransactions = [...transactionData.transactions];
  currentPage = 1;

  loadAllTransactionsTable();
  loadSalesTransactionsTable();
  renderPagination();

  showNotification("All filters cleared!", "success");
}

// Generate report
function generateReport() {
  // In a real app, this would generate a comprehensive report
  showNotification("Transaction report generated successfully!", "success");
}

// Handle tab switching
function switchTab(tabName) {
  // Hide all tabs
  document.getElementById("allTab").style.display = "none";
  document.getElementById("salesTab").style.display = "none";

  // Show selected tab
  if (tabName === "all") {
    document.getElementById("allTab").style.display = "block";
  } else if (tabName === "sales") {
    document.getElementById("salesTab").style.display = "block";
  }

  // Update tab buttons
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
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
    .getElementById("exportAllBtn")
    .addEventListener("click", showExportModal);
  document
    .getElementById("generateReportBtn")
    .addEventListener("click", generateReport);
  document
    .getElementById("clearFiltersBtn")
    .addEventListener("click", clearFilters);

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", filterTransactions);

  // View all activities button
  document
    .getElementById("viewAllActivitiesBtn")
    .addEventListener("click", function () {
      alert("This would show all system activities in a separate page.");
    });

  // Tab buttons
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");
      switchTab(tabName);
    });
  });

  // Close details button
  document
    .getElementById("closeDetailsBtn")
    .addEventListener("click", closeTransactionDetails);

  // Modal close buttons
  document
    .getElementById("closeExportModal")
    .addEventListener("click", function () {
      document.getElementById("exportModal").classList.remove("active");
    });

  // Cancel export button
  document
    .getElementById("cancelExportBtn")
    .addEventListener("click", function () {
      document.getElementById("exportModal").classList.remove("active");
    });

  // Export date range change
  document
    .getElementById("exportDateRange")
    .addEventListener("change", handleExportDateRangeChange);

  // Export form submission
  document
    .getElementById("exportForm")
    .addEventListener("submit", processExport);

  // Search input (real-time filtering)
  document
    .getElementById("transactionSearch")
    .addEventListener("input", function () {
      // Add delay for better performance
      clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        filterTransactions();
      }, 500);
    });

  // Other filter changes
  document
    .getElementById("transactionTypeFilter")
    .addEventListener("change", filterTransactions);
  document
    .getElementById("userFilter")
    .addEventListener("change", filterTransactions);
  document
    .getElementById("startDate")
    .addEventListener("change", filterTransactions);
  document
    .getElementById("endDate")
    .addEventListener("change", filterTransactions);

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
