// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize purchase data
  initializeCharts();
  loadPurchaseData();
  setupEventListeners();

  // Check user permissions
  if (userRole === "staff") {
    document.getElementById("importPurchasesBtn").style.display = "none";
    document.getElementById("generateReorderBtn").style.display = "none";
  }
});

// Sample purchase data
let purchaseData = {
  orders: [
    {
      id: "PO-2023-001",
      date: "2023-10-18",
      supplier: "Supplier ABC",
      supplierId: "supplier1",
      items: [
        {
          name: "Wireless Bluetooth Headphones",
          quantity: 50,
          unitPrice: 45.5,
          total: 2275.0,
        },
        {
          name: "Smart Fitness Watch",
          quantity: 25,
          unitPrice: 120.0,
          total: 3000.0,
        },
      ],
      subtotal: 5275.0,
      tax: 949.5,
      shipping: 150.0,
      total: 6374.5,
      status: "received",
      expectedDelivery: "2023-10-25",
      actualDelivery: "2023-10-24",
      paymentTerms: "net30",
      notes: "Priority order for holiday season",
      timeline: [
        {
          date: "2023-10-18",
          status: "Ordered",
          description: "Purchase order submitted",
        },
        {
          date: "2023-10-20",
          status: "Confirmed",
          description: "Supplier confirmed order",
        },
        {
          date: "2023-10-24",
          status: "Received",
          description: "Order delivered and verified",
        },
      ],
    },
    {
      id: "PO-2023-002",
      date: "2023-10-15",
      supplier: "Supplier XYZ",
      supplierId: "supplier2",
      items: [
        {
          name: "Ergonomic Office Chair",
          quantity: 20,
          unitPrice: 150.0,
          total: 3000.0,
        },
      ],
      subtotal: 3000.0,
      tax: 540.0,
      shipping: 200.0,
      total: 3740.0,
      status: "ordered",
      expectedDelivery: "2023-10-30",
      actualDelivery: null,
      paymentTerms: "net45",
      notes: "New office setup",
      timeline: [
        {
          date: "2023-10-15",
          status: "Ordered",
          description: "Purchase order submitted",
        },
        {
          date: "2023-10-16",
          status: "Confirmed",
          description: "Supplier confirmed order",
        },
      ],
    },
    {
      id: "PO-2023-003",
      date: "2023-10-10",
      supplier: "Global Supplies Inc.",
      supplierId: "supplier3",
      items: [
        {
          name: "Desk Lamp with Wireless Charger",
          quantity: 100,
          unitPrice: 25.0,
          total: 2500.0,
        },
        {
          name: "Stainless Steel Water Bottle",
          quantity: 200,
          unitPrice: 15.0,
          total: 3000.0,
        },
      ],
      subtotal: 5500.0,
      tax: 990.0,
      shipping: 300.0,
      total: 6790.0,
      status: "pending",
      expectedDelivery: "2023-11-05",
      actualDelivery: null,
      paymentTerms: "net30",
      notes: "Bulk order for Q4",
      timeline: [
        {
          date: "2023-10-10",
          status: "Draft",
          description: "Purchase order created",
        },
      ],
    },
    {
      id: "PO-2023-004",
      date: "2023-10-05",
      supplier: "Prime Distributors",
      supplierId: "supplier4",
      items: [
        {
          name: "Premium Notebook Set",
          quantity: 500,
          unitPrice: 12.5,
          total: 6250.0,
        },
        {
          name: "Bluetooth Portable Speaker",
          quantity: 100,
          unitPrice: 30.0,
          total: 3000.0,
        },
      ],
      subtotal: 9250.0,
      tax: 1665.0,
      shipping: 450.0,
      total: 11365.0,
      status: "received",
      expectedDelivery: "2023-10-20",
      actualDelivery: "2023-10-18",
      paymentTerms: "cod",
      notes: "Early delivery requested",
      timeline: [
        {
          date: "2023-10-05",
          status: "Ordered",
          description: "Purchase order submitted",
        },
        {
          date: "2023-10-06",
          status: "Confirmed",
          description: "Supplier confirmed order",
        },
        {
          date: "2023-10-18",
          status: "Received",
          description: "Order delivered 2 days early",
        },
      ],
    },
    {
      id: "PO-2023-005",
      date: "2023-10-01",
      supplier: "Supplier ABC",
      supplierId: "supplier1",
      items: [
        {
          name: "Wireless Gaming Mouse",
          quantity: 75,
          unitPrice: 40.0,
          total: 3000.0,
        },
      ],
      subtotal: 3000.0,
      tax: 540.0,
      shipping: 100.0,
      total: 3640.0,
      status: "cancelled",
      expectedDelivery: "2023-10-15",
      actualDelivery: null,
      paymentTerms: "net30",
      notes: "Cancelled due to quality concerns",
      timeline: [
        {
          date: "2023-10-01",
          status: "Ordered",
          description: "Purchase order submitted",
        },
        {
          date: "2023-10-10",
          status: "Cancelled",
          description: "Order cancelled after quality review",
        },
      ],
    },
    {
      id: "PO-2023-006",
      date: "2023-09-28",
      supplier: "Supplier XYZ",
      supplierId: "supplier2",
      items: [
        {
          name: "Ergonomic Office Chair",
          quantity: 15,
          unitPrice: 155.0,
          total: 2325.0,
        },
        {
          name: "Desk Accessories Set",
          quantity: 50,
          unitPrice: 35.0,
          total: 1750.0,
        },
      ],
      subtotal: 4075.0,
      tax: 733.5,
      shipping: 180.0,
      total: 4988.5,
      status: "overdue",
      expectedDelivery: "2023-10-10",
      actualDelivery: null,
      paymentTerms: "net45",
      notes: "Follow up required - delayed shipment",
      timeline: [
        {
          date: "2023-09-28",
          status: "Ordered",
          description: "Purchase order submitted",
        },
        {
          date: "2023-09-30",
          status: "Confirmed",
          description: "Supplier confirmed order",
        },
      ],
    },
  ],
  suppliers: [
    {
      id: "supplier1",
      name: "Supplier ABC",
      contact: "John Smith",
      email: "john@supplierabc.com",
      phone: "+91 98765 43210",
      orders: 24,
      totalSpent: 245680.5,
      rating: 4.5,
      leadTime: "3-5 days",
      status: "active",
    },
    {
      id: "supplier2",
      name: "Supplier XYZ",
      contact: "Sarah Johnson",
      email: "sarah@supplierxyz.com",
      phone: "+91 98765 43211",
      orders: 18,
      totalSpent: 189450.75,
      rating: 4.2,
      leadTime: "5-7 days",
      status: "active",
    },
    {
      id: "supplier3",
      name: "Global Supplies Inc.",
      contact: "Michael Chen",
      email: "michael@globalsupplies.com",
      phone: "+91 98765 43212",
      orders: 12,
      totalSpent: 156820.3,
      rating: 4.7,
      leadTime: "7-10 days",
      status: "active",
    },
    {
      id: "supplier4",
      name: "Prime Distributors",
      contact: "Emily Davis",
      email: "emily@primedistributors.com",
      phone: "+91 98765 43213",
      orders: 8,
      totalSpent: 98450.6,
      rating: 4.0,
      leadTime: "10-14 days",
      status: "active",
    },
  ],
  reorderSuggestions: [
    {
      product: "Smart Fitness Watch",
      currentStock: 3,
      minStock: 10,
      reorderQty: 25,
      lastPurchase: "2023-10-18",
      suggestedSupplier: "Supplier ABC",
      leadTime: "3-5 days",
    },
    {
      product: "Wireless Gaming Mouse",
      currentStock: 5,
      minStock: 10,
      reorderQty: 50,
      lastPurchase: "2023-10-01",
      suggestedSupplier: "Supplier ABC",
      leadTime: "3-5 days",
    },
    {
      product: "Desk Lamp with Wireless Charger",
      currentStock: 0,
      minStock: 15,
      reorderQty: 100,
      lastPurchase: "2023-10-10",
      suggestedSupplier: "Global Supplies Inc.",
      leadTime: "7-10 days",
    },
    {
      product: "Ergonomic Office Chair",
      currentStock: 12,
      minStock: 5,
      reorderQty: 20,
      lastPurchase: "2023-10-15",
      suggestedSupplier: "Supplier XYZ",
      leadTime: "5-7 days",
    },
  ],
  products: [
    {
      id: "P001",
      name: "Wireless Bluetooth Headphones",
      price: 45.5,
      stock: 45,
    },
    {
      id: "P002",
      name: "Ergonomic Office Chair",
      price: 150.0,
      stock: 12,
    },
    { id: "P003", name: "Smart Fitness Watch", price: 120.0, stock: 3 },
    {
      id: "P004",
      name: "Desk Lamp with Wireless Charger",
      price: 25.0,
      stock: 0,
    },
    { id: "P005", name: "Premium Notebook Set", price: 12.5, stock: 120 },
    { id: "P006", name: "Wireless Gaming Mouse", price: 40.0, stock: 5 },
    {
      id: "P007",
      name: "Stainless Steel Water Bottle",
      price: 15.0,
      stock: 65,
    },
    {
      id: "P008",
      name: "Bluetooth Portable Speaker",
      price: 30.0,
      stock: 18,
    },
    { id: "P009", name: "Desk Accessories Set", price: 35.0, stock: 25 },
  ],
};

// Initialize charts
function initializeCharts() {
  // Purchase Trend Chart
  const purchaseCtx = document.getElementById("purchaseChart").getContext("2d");
  const purchaseChart = new Chart(purchaseCtx, {
    type: "bar",
    data: {
      labels: ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"],
      datasets: [
        {
          label: "Purchase Value (₹)",
          data: [125000, 156420, 142000, 168000, 135000, 152000],
          backgroundColor: "#3498db",
          borderColor: "#2980b9",
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
          ticks: {
            callback: function (value) {
              return "$" + value.toLocaleString();
            },
          },
        },
      },
    },
  });

  // Supplier Distribution Chart
  const supplierCtx = document.getElementById("supplierChart").getContext("2d");
  const supplierChart = new Chart(supplierCtx, {
    type: "doughnut",
    data: {
      labels: [
        "Supplier ABC",
        "Supplier XYZ",
        "Global Supplies",
        "Prime Distributors",
      ],
      datasets: [
        {
          data: [45, 25, 20, 10],
          backgroundColor: ["#3498db", "#9b59b6", "#2ecc71", "#f39c12"],
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
    .getElementById("purchasePeriod")
    .addEventListener("change", function () {
      // In a real app, you would fetch new data based on the selected period
      purchaseChart.update();
      supplierChart.update();
    });
}

// Load purchase data into tables
function loadPurchaseData() {
  loadPurchaseTable();
  loadDraftTable();
  loadReorderTable();
  loadSuppliersTable();
  updatePurchaseOverview();
}

// Load purchase orders table
function loadPurchaseTable() {
  const purchaseTable = document.getElementById("purchaseTable");
  purchaseTable.innerHTML = "";

  purchaseData.orders.forEach((order) => {
    const row = document.createElement("tr");

    // Calculate total items
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    switch (order.status) {
      case "draft":
        statusClass = "status-draft";
        statusText = "Draft";
        break;
      case "pending":
        statusClass = "status-pending";
        statusText = "Pending";
        break;
      case "ordered":
        statusClass = "status-ordered";
        statusText = "Ordered";
        break;
      case "received":
        statusClass = "status-received";
        statusText = "Received";
        break;
      case "cancelled":
        statusClass = "status-cancelled";
        statusText = "Cancelled";
        break;
      case "overdue":
        statusClass = "status-pending";
        statusText = "Overdue";
        break;
    }

    // Check if order is overdue
    const today = new Date();
    const expectedDate = new Date(order.expectedDelivery);
    let isOverdue = false;

    if (order.status === "ordered" || order.status === "pending") {
      if (today > expectedDate) {
        statusClass = "status-pending";
        statusText = "Overdue";
        isOverdue = true;
      }
    }

    row.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${order.date}</td>
                    <td>${order.supplier}</td>
                    <td>${totalItems} items</td>
                    <td><strong>$${order.total.toLocaleString()}</strong></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${order.expectedDelivery} ${
      isOverdue ? '<span style="color: var(--accent-color);">⚠️</span>' : ""
    }</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewPurchaseDetails('${
                          order.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editPurchaseOrder('${
                          order.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePurchaseOrder('${
                          order.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    purchaseTable.appendChild(row);
  });
}

// Load draft orders table
function loadDraftTable() {
  const draftTable = document.getElementById("draftTable");
  draftTable.innerHTML = "";

  const draftOrders = purchaseData.orders.filter(
    (order) => order.status === "pending"
  );

  if (draftOrders.length === 0) {
    draftTable.innerHTML = `
                    <tr>
                        <td colspan="6" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-edit" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <div>No draft orders found</div>
                        </td>
                    </tr>
                `;
    return;
  }

  draftOrders.forEach((order) => {
    const row = document.createElement("tr");

    // Calculate total items
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    row.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${order.date}</td>
                    <td>${order.supplier}</td>
                    <td>${totalItems} items</td>
                    <td><strong>$${order.total.toLocaleString()}</strong></td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="submitPurchaseOrder('${
                          order.id
                        }')">
                            <i class="fas fa-paper-plane"></i> Submit
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editPurchaseOrder('${
                          order.id
                        }')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deletePurchaseOrder('${
                          order.id
                        }')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </td>
                `;
    draftTable.appendChild(row);
  });
}

// Load reorder suggestions table
function loadReorderTable() {
  const reorderTable = document.getElementById("reorderTable");
  reorderTable.innerHTML = "";

  purchaseData.reorderSuggestions.forEach((suggestion) => {
    const row = document.createElement("tr");

    // Determine stock status
    let stockStatus = "";
    if (suggestion.currentStock === 0) {
      stockStatus =
        '<span style="color: var(--accent-color); font-weight: 600;">Out of Stock</span>';
    } else if (suggestion.currentStock <= suggestion.minStock) {
      stockStatus =
        '<span style="color: var(--warning-color); font-weight: 600;">Low Stock</span>';
    } else {
      stockStatus =
        '<span style="color: var(--success-color); font-weight: 600;">Adequate</span>';
    }

    row.innerHTML = `
                    <td><strong>${suggestion.product}</strong><br>${stockStatus}</td>
                    <td>${suggestion.currentStock}</td>
                    <td>${suggestion.minStock}</td>
                    <td>${suggestion.reorderQty}</td>
                    <td>${suggestion.lastPurchase}</td>
                    <td>${suggestion.suggestedSupplier}<br><small>${suggestion.leadTime}</small></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="createReorder('${suggestion.product}')">
                            <i class="fas fa-cart-plus"></i> Reorder
                        </button>
                    </td>
                `;
    reorderTable.appendChild(row);
  });
}

// Load suppliers table
function loadSuppliersTable() {
  const suppliersTable = document.getElementById("suppliersTable");
  suppliersTable.innerHTML = "";

  purchaseData.suppliers.forEach((supplier) => {
    const row = document.createElement("tr");

    // Generate star rating
    let stars = "";
    const fullStars = Math.floor(supplier.rating);
    const hasHalfStar = supplier.rating % 1 >= 0.5;

    for (let i = 0; i < fullStars; i++) {
      stars += '<i class="fas fa-star" style="color: #f39c12;"></i>';
    }

    if (hasHalfStar) {
      stars += '<i class="fas fa-star-half-alt" style="color: #f39c12;"></i>';
    }

    const emptyStars = 5 - Math.ceil(supplier.rating);
    for (let i = 0; i < emptyStars; i++) {
      stars += '<i class="far fa-star" style="color: #f39c12;"></i>';
    }

    row.innerHTML = `
                    <td><strong>${supplier.name}</strong><br><small>${
      supplier.contact
    }</small></td>
                    <td>${supplier.email}<br>${supplier.phone}</td>
                    <td>${supplier.orders}</td>
                    <td><strong>$${supplier.totalSpent.toLocaleString()}</strong></td>
                    <td>${stars}<br><small>${supplier.rating}/5</small></td>
                    <td>${supplier.leadTime}</td>
                    <td><span class="status-badge status-received">${
                      supplier.status
                    }</span></td>
                `;
    suppliersTable.appendChild(row);
  });
}

// Update purchase overview statistics
function updatePurchaseOverview() {
  const totalPurchaseValue = purchaseData.orders.reduce(
    (sum, order) => sum + order.total,
    0
  );
  const completedOrders = purchaseData.orders.filter(
    (order) => order.status === "received"
  ).length;
  const pendingOrders = purchaseData.orders.filter(
    (order) => order.status === "pending" || order.status === "draft"
  ).length;

  // Calculate overdue orders
  const today = new Date();
  const overdueOrders = purchaseData.orders.filter((order) => {
    if (order.status === "ordered" || order.status === "pending") {
      const expectedDate = new Date(order.expectedDelivery);
      return today > expectedDate;
    }
    return false;
  }).length;

  document.getElementById(
    "totalPurchaseValue"
  ).textContent = `$${totalPurchaseValue.toLocaleString()}`;
  document.getElementById("completedOrders").textContent = completedOrders;
  document.getElementById("pendingOrders").textContent = pendingOrders;
  document.getElementById("overdueOrders").textContent = overdueOrders;
}

// View purchase order details
function viewPurchaseDetails(orderId) {
  const order = purchaseData.orders.find((o) => o.id === orderId);
  if (!order) return;

  document.getElementById(
    "purchaseDetailsTitle"
  ).textContent = `Purchase Order: ${order.id}`;

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  switch (order.status) {
    case "draft":
      statusClass = "status-draft";
      statusText = "Draft";
      break;
    case "pending":
      statusClass = "status-pending";
      statusText = "Pending";
      break;
    case "ordered":
      statusClass = "status-ordered";
      statusText = "Ordered";
      break;
    case "received":
      statusClass = "status-received";
      statusText = "Received";
      break;
    case "cancelled":
      statusClass = "status-cancelled";
      statusText = "Cancelled";
      break;
  }

  // Check if order is overdue
  const today = new Date();
  const expectedDate = new Date(order.expectedDelivery);
  let isOverdue = false;

  if (order.status === "ordered" || order.status === "pending") {
    if (today > expectedDate) {
      statusClass = "status-pending";
      statusText = "Overdue";
      isOverdue = true;
    }
  }

  // Generate items list HTML
  let itemsHtml = "";
  order.items.forEach((item, index) => {
    itemsHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>$${item.unitPrice.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.total.toFixed(2)}</td>
                    </tr>
                `;
  });

  // Generate timeline HTML
  let timelineHtml = "";
  order.timeline.forEach((event, index) => {
    const isCompleted =
      index < order.timeline.length - 1 ||
      order.status === "received" ||
      order.status === "cancelled";
    const isActive =
      index === order.timeline.length - 1 &&
      (order.status === "ordered" || order.status === "pending");

    let timelineClass = "";
    if (isCompleted) {
      timelineClass = "completed";
    } else if (isActive) {
      timelineClass = "active";
    }

    timelineHtml += `
                    <div class="timeline-item ${timelineClass}">
                        <div class="timeline-content">
                            <div class="timeline-date">${event.date}</div>
                            <div class="timeline-text">${event.status}</div>
                            <div style="font-size: 14px; color: #7f8c8d;">${event.description}</div>
                        </div>
                    </div>
                `;
  });

  const detailsContent = document.getElementById("purchaseDetailsContent");
  detailsContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Order Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">PO Number:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  order.id
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Order Date:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  order.date
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Order Status:</td>
                                <td style="padding: 8px 0;"><span class="status-badge ${statusClass}">${statusText}</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Payment Terms:</td>
                                <td style="padding: 8px 0; font-weight: 600;">
                                    ${
                                      order.paymentTerms === "net30"
                                        ? "Net 30 Days"
                                        : order.paymentTerms === "net45"
                                        ? "Net 45 Days"
                                        : order.paymentTerms === "net60"
                                        ? "Net 60 Days"
                                        : order.paymentTerms === "cod"
                                        ? "Cash on Delivery"
                                        : "Prepaid"
                                    }
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Supplier Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Supplier:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  order.supplier
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Expected Delivery:</td>
                                <td style="padding: 8px 0; font-weight: 600; ${
                                  isOverdue ? "color: var(--accent-color);" : ""
                                }">
                                    ${order.expectedDelivery} ${
    isOverdue ? " (Overdue)" : ""
  }
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Actual Delivery:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  order.actualDelivery || "Not yet delivered"
                                }</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Order Timeline</h4>
                    <div class="timeline">
                        ${timelineHtml}
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Order Items</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Unit Price</th>
                                    <th>Quantity</th>
                                    <th>Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${itemsHtml}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Order Notes</h4>
                        <p style="color: #7f8c8d; font-style: italic;">${
                          order.notes || "No notes available"
                        }</p>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Order Summary</h4>
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Subtotal:</span>
                                <span>$${order.subtotal.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Tax (18%):</span>
                                <span>$${order.tax.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Shipping:</span>
                                <span>$${order.shipping.toFixed(2)}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-weight: 600; font-size: 18px;">
                                <span>Total:</span>
                                <span>$${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closePurchaseDetailsModal()">Close</button>
                    <button class="btn btn-primary" onclick="printPurchaseOrder('${
                      order.id
                    }')">
                        <i class="fas fa-print"></i> Print PO
                    </button>
                    ${
                      order.status === "pending" || order.status === "draft"
                        ? `
                        <button class="btn btn-success" onclick="submitPurchaseOrder('${order.id}')">
                            <i class="fas fa-paper-plane"></i> Submit Order
                        </button>
                    `
                        : ""
                    }
                    ${
                      order.status === "ordered"
                        ? `
                        <button class="btn btn-success" onclick="markAsReceived('${order.id}')">
                            <i class="fas fa-check"></i> Mark as Received
                        </button>
                    `
                        : ""
                    }
                </div>
            `;

  document.getElementById("purchaseDetailsModal").classList.add("active");
}

// Close purchase details modal
function closePurchaseDetailsModal() {
  document.getElementById("purchaseDetailsModal").classList.remove("active");
}

// Edit purchase order
function editPurchaseOrder(orderId) {
  const order = purchaseData.orders.find((o) => o.id === orderId);
  if (!order) return;

  alert(`Editing purchase order: ${orderId}\nThis would open an order editor.`);
}

// Delete purchase order
function deletePurchaseOrder(orderId) {
  if (
    !confirm(
      `Are you sure you want to delete purchase order ${orderId}? This action cannot be undone.`
    )
  ) {
    return;
  }

  // In a real app, you would send a delete request to the server
  purchaseData.orders = purchaseData.orders.filter(
    (order) => order.id !== orderId
  );
  loadPurchaseTable();
  loadDraftTable();

  showNotification(
    `Purchase order ${orderId} deleted successfully!`,
    "success"
  );
}

// Submit purchase order
function submitPurchaseOrder(orderId) {
  const order = purchaseData.orders.find((o) => o.id === orderId);
  if (!order) return;

  if (order.status === "pending" || order.status === "draft") {
    order.status = "ordered";

    // Add timeline event
    order.timeline.push({
      date: new Date().toISOString().split("T")[0],
      status: "Ordered",
      description: "Purchase order submitted to supplier",
    });

    loadPurchaseTable();
    loadDraftTable();
    showNotification(
      `Purchase order ${orderId} submitted successfully!`,
      "success"
    );
  }
}

// Mark as received
function markAsReceived(orderId) {
  const order = purchaseData.orders.find((o) => o.id === orderId);
  if (!order) return;

  if (order.status === "ordered") {
    order.status = "received";
    order.actualDelivery = new Date().toISOString().split("T")[0];

    // Add timeline event
    order.timeline.push({
      date: new Date().toISOString().split("T")[0],
      status: "Received",
      description: "Order delivered and verified",
    });

    loadPurchaseTable();
    showNotification(
      `Purchase order ${orderId} marked as received!`,
      "success"
    );
  }
}

// Print purchase order
function printPurchaseOrder(orderId) {
  alert(`Printing purchase order: ${orderId}`);
  // In a real app, this would open a print dialog with the purchase order
}

// Create reorder from suggestion
function createReorder(productName) {
  const suggestion = purchaseData.reorderSuggestions.find(
    (s) => s.product === productName
  );
  if (!suggestion) return;

  showNotification(`Creating reorder for ${productName}...`, "success");

  // In a real app, this would open the new purchase order form with the product pre-selected
  showNewPurchaseModal();
}

// Show new purchase order modal
function showNewPurchaseModal() {
  document.getElementById("newPurchaseModal").classList.add("active");
  // Clear any existing items
  document.getElementById("purchaseItems").innerHTML = "";
  // Add one empty row
  addPurchaseItemRow();
  updatePurchaseSummary();
}

// Add purchase item row
function addPurchaseItemRow() {
  const purchaseItems = document.getElementById("purchaseItems");
  const rowCount = purchaseItems.children.length;

  const row = document.createElement("tr");
  row.innerHTML = `
                <td>
                    <select class="form-control purchase-product-select" onchange="updatePurchaseProductPrice(this, ${rowCount})">
                        <option value="">Select Product</option>
                        ${purchaseData.products
                          .map(
                            (product) => `
                            <option value="${product.id}" data-price="${product.price}">${product.name} (Current: ${product.stock})</option>
                        `
                          )
                          .join("")}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control purchase-quantity-input" data-index="${rowCount}" value="1" min="1" onchange="updatePurchaseItemTotal(${rowCount})">
                </td>
                <td>
                    <input type="number" class="form-control purchase-price-input" data-index="${rowCount}" value="0.00" min="0" step="0.01" onchange="updatePurchaseItemTotal(${rowCount})">
                </td>
                <td>
                    <input type="text" class="form-control purchase-total-input" data-index="${rowCount}" value="0.00" readonly>
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removePurchaseItemRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
  purchaseItems.appendChild(row);
}

// Update purchase product price when selected
function updatePurchaseProductPrice(selectElement, index) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const price = selectedOption.getAttribute("data-price") || "0";

  const priceInput = document.querySelector(
    `.purchase-price-input[data-index="${index}"]`
  );
  priceInput.value = parseFloat(price).toFixed(2);
  updatePurchaseItemTotal(index);
}

// Update purchase item total
function updatePurchaseItemTotal(index) {
  const priceInput = document.querySelector(
    `.purchase-price-input[data-index="${index}"]`
  );
  const quantityInput = document.querySelector(
    `.purchase-quantity-input[data-index="${index}"]`
  );
  const totalInput = document.querySelector(
    `.purchase-total-input[data-index="${index}"]`
  );

  const price = parseFloat(priceInput.value) || 0;
  const quantity = parseInt(quantityInput.value) || 0;
  const total = price * quantity;

  totalInput.value = total.toFixed(2);
  updatePurchaseSummary();
}

// Remove purchase item row
function removePurchaseItemRow(button) {
  const row = button.closest("tr");
  row.remove();
  updatePurchaseSummary();
}

// Update purchase summary
function updatePurchaseSummary() {
  let subtotal = 0;
  const totalInputs = document.querySelectorAll(".purchase-total-input");

  totalInputs.forEach((input) => {
    subtotal += parseFloat(input.value) || 0;
  });

  const tax = subtotal * 0.18; // 18% tax
  const shipping = subtotal > 0 ? 150 : 0; // Example shipping calculation
  const total = subtotal + tax + shipping;

  document.getElementById(
    "purchaseSubtotal"
  ).textContent = `$${subtotal.toFixed(2)}`;
  document.getElementById("purchaseTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById(
    "purchaseShipping"
  ).textContent = `$${shipping.toFixed(2)}`;
  document.getElementById("purchaseTotal").textContent = `$${total.toFixed(2)}`;
}

// Process new purchase order
function processNewPurchaseOrder() {
  const supplier = document.getElementById("purchaseSupplier").value;
  const purchaseDate = document.getElementById("purchaseDate").value;
  const expectedDelivery = document.getElementById("expectedDelivery").value;
  const paymentTerms = document.getElementById("paymentTerms").value;
  const purchaseNotes = document.getElementById("purchaseNotes").value;

  if (!supplier) {
    alert("Please select a supplier!");
    return;
  }

  // Get supplier name
  const supplierName =
    purchaseData.suppliers.find((s) => s.id === supplier)?.name ||
    "Unknown Supplier";

  // Collect purchase items
  const items = [];
  const productSelects = document.querySelectorAll(".purchase-product-select");
  const quantityInputs = document.querySelectorAll(".purchase-quantity-input");

  let hasItems = false;

  for (let i = 0; i < productSelects.length; i++) {
    const productSelect = productSelects[i];
    const productId = productSelect.value;
    const productName =
      productSelect.options[productSelect.selectedIndex].text.split(" (")[0];
    const price =
      parseFloat(
        document.querySelector(`.purchase-price-input[data-index="${i}"]`).value
      ) || 0;
    const quantity = parseInt(quantityInputs[i].value) || 0;

    if (productId && quantity > 0 && price > 0) {
      hasItems = true;
      items.push({
        name: productName,
        quantity: quantity,
        unitPrice: price,
        total: price * quantity,
      });
    }
  }

  if (!hasItems) {
    alert("Please add at least one product to the purchase order!");
    return;
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18;
  const shipping = subtotal > 0 ? 150 : 0;
  const total = subtotal + tax + shipping;

  // Generate new purchase order ID
  const orderId =
    "PO-" +
    new Date().getFullYear() +
    "-" +
    (purchaseData.orders.length + 1).toString().padStart(3, "0");

  // Create new purchase order
  const newOrder = {
    id: orderId,
    date: purchaseDate,
    supplier: supplierName,
    supplierId: supplier,
    items: items,
    subtotal: subtotal,
    tax: tax,
    shipping: shipping,
    total: total,
    status: "pending",
    expectedDelivery: expectedDelivery,
    actualDelivery: null,
    paymentTerms: paymentTerms,
    notes: purchaseNotes,
    timeline: [
      {
        date: new Date().toISOString().split("T")[0],
        status: "Draft",
        description: "Purchase order created",
      },
    ],
  };

  // Add to orders array
  purchaseData.orders.unshift(newOrder);

  // Close modal and reset form
  document.getElementById("newPurchaseModal").classList.remove("active");
  document.getElementById("purchaseForm").reset();

  // Reload data
  loadPurchaseTable();
  loadDraftTable();

  // Show success notification
  showNotification(
    `New purchase order ${orderId} created successfully!`,
    "success"
  );
}

// Save purchase order as draft
function savePurchaseAsDraft() {
  showNotification("Purchase order saved as draft!", "success");
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

// Handle tab switching
function switchTab(tabName) {
  // Hide all tabs
  document.getElementById("allTab").style.display = "none";
  document.getElementById("draftTab").style.display = "none";

  // Show selected tab
  if (tabName === "all") {
    document.getElementById("allTab").style.display = "block";
  } else if (tabName === "draft") {
    document.getElementById("draftTab").style.display = "block";
    loadDraftTable();
  }

  // Update tab buttons
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.remove("active");
  });
  event.target.classList.add("active");
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
    .getElementById("newPurchaseBtn")
    .addEventListener("click", showNewPurchaseModal);
  document.getElementById("reorderBtn").addEventListener("click", function () {
    alert(
      "Auto Reorder feature would automatically create purchase orders for low-stock items."
    );
  });
  document
    .getElementById("importPurchasesBtn")
    .addEventListener("click", function () {
      alert(
        "Import Purchases feature would allow importing purchase orders from CSV/Excel."
      );
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      // In a real app, this would filter the purchase orders table
      showNotification("Filters applied successfully!", "success");
    });

  // View all suppliers button
  document
    .getElementById("viewAllSuppliersBtn")
    .addEventListener("click", function () {
      alert("This would show all suppliers in a separate page/modal.");
    });

  // Generate reorder suggestions button
  document
    .getElementById("generateReorderBtn")
    .addEventListener("click", function () {
      showNotification(
        "Reorder suggestions generated successfully!",
        "success"
      );
    });

  // Tab buttons
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", function () {
      const tabName = this.getAttribute("data-tab");
      switchTab(tabName);
    });
  });

  // Modal close buttons
  document
    .getElementById("closePurchaseModal")
    .addEventListener("click", function () {
      document.getElementById("newPurchaseModal").classList.remove("active");
    });

  document
    .getElementById("closePurchaseDetailsModal")
    .addEventListener("click", closePurchaseDetailsModal);

  // Cancel purchase button
  document
    .getElementById("cancelPurchaseBtn")
    .addEventListener("click", function () {
      document.getElementById("newPurchaseModal").classList.remove("active");
    });

  // Add purchase item button
  document
    .getElementById("addPurchaseItemBtn")
    .addEventListener("click", addPurchaseItemRow);

  // Save draft button
  document
    .getElementById("saveDraftBtn")
    .addEventListener("click", savePurchaseAsDraft);

  // Submit purchase button
  document
    .getElementById("submitPurchaseBtn")
    .addEventListener("click", processNewPurchaseOrder);

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
