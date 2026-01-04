// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize sales data
  initializeCharts();
  loadSalesData();
  setupEventListeners();

  // Check user permissions
  if (userRole === "staff") {
    document.getElementById("importOrdersBtn").style.display = "none";
  }
});

// Sample sales data
let salesData = {
  orders: [
    {
      id: "ORD-2023-001",
      date: "2023-10-18 14:30",
      customer: "John Smith",
      customerEmail: "john@example.com",
      customerPhone: "+91 9876543210",
      items: [
        {
          name: "Wireless Bluetooth Headphones",
          quantity: 2,
          price: 89.99,
          total: 179.98,
        },
        {
          name: "Smart Fitness Watch",
          quantity: 1,
          price: 199.99,
          total: 199.99,
        },
      ],
      subtotal: 379.97,
      tax: 68.39,
      total: 448.36,
      paymentStatus: "paid",
      orderStatus: "completed",
      shippingAddress: "123 Main St, Mumbai, India",
      notes: "Gift wrapping requested",
    },
    {
      id: "ORD-2023-002",
      date: "2023-10-18 11:15",
      customer: "Sarah Johnson",
      customerEmail: "sarah@example.com",
      customerPhone: "+91 9876543211",
      items: [
        {
          name: "Ergonomic Office Chair",
          quantity: 1,
          price: 249.99,
          total: 249.99,
        },
      ],
      subtotal: 249.99,
      tax: 45.0,
      total: 294.99,
      paymentStatus: "paid",
      orderStatus: "processing",
      shippingAddress: "456 Park Ave, Delhi, India",
      notes: "Delivery after 5 PM",
    },
    {
      id: "ORD-2023-003",
      date: "2023-10-17 16:45",
      customer: "Michael Chen",
      customerEmail: "michael@example.com",
      customerPhone: "+91 9876543212",
      items: [
        {
          name: "Premium Notebook Set",
          quantity: 3,
          price: 24.99,
          total: 74.97,
        },
        {
          name: "Stainless Steel Water Bottle",
          quantity: 2,
          price: 29.99,
          total: 59.98,
        },
      ],
      subtotal: 134.95,
      tax: 24.29,
      total: 159.24,
      paymentStatus: "pending",
      orderStatus: "pending",
      shippingAddress: "789 Oak St, Bangalore, India",
      notes: "",
    },
    {
      id: "ORD-2023-004",
      date: "2023-10-17 10:20",
      customer: "Emily Davis",
      customerEmail: "emily@example.com",
      customerPhone: "+91 9876543213",
      items: [
        {
          name: "Bluetooth Portable Speaker",
          quantity: 1,
          price: 59.99,
          total: 59.99,
        },
        {
          name: "Wireless Gaming Mouse",
          quantity: 1,
          price: 79.99,
          total: 79.99,
        },
      ],
      subtotal: 139.98,
      tax: 25.2,
      total: 165.18,
      paymentStatus: "paid",
      orderStatus: "completed",
      shippingAddress: "101 Pine Rd, Chennai, India",
      notes: "Express shipping",
    },
    {
      id: "ORD-2023-005",
      date: "2023-10-16 09:30",
      customer: "Robert Wilson",
      customerEmail: "robert@example.com",
      customerPhone: "+91 9876543214",
      items: [
        {
          name: "Desk Lamp with Wireless Charger",
          quantity: 1,
          price: 49.99,
          total: 49.99,
        },
      ],
      subtotal: 49.99,
      tax: 9.0,
      total: 58.99,
      paymentStatus: "cancelled",
      orderStatus: "cancelled",
      shippingAddress: "202 Elm St, Kolkata, India",
      notes: "Customer requested cancellation",
    },
    {
      id: "ORD-2023-006",
      date: "2023-10-15 13:10",
      customer: "Lisa Thompson",
      customerEmail: "lisa@example.com",
      customerPhone: "+91 9876543215",
      items: [
        {
          name: "Wireless Bluetooth Headphones",
          quantity: 1,
          price: 89.99,
          total: 89.99,
        },
        {
          name: "Smart Fitness Watch",
          quantity: 1,
          price: 199.99,
          total: 199.99,
        },
        {
          name: "Premium Notebook Set",
          quantity: 2,
          price: 24.99,
          total: 49.98,
        },
      ],
      subtotal: 339.96,
      tax: 61.19,
      total: 401.15,
      paymentStatus: "refunded",
      orderStatus: "refunded",
      shippingAddress: "303 Maple Ave, Hyderabad, India",
      notes: "Product damaged during shipping",
    },
  ],
  customers: [
    {
      id: "CUST-001",
      name: "John Smith",
      email: "john@example.com",
      phone: "+91 9876543210",
      orders: 12,
      totalSpent: 5480.5,
      lastOrder: "2023-10-18",
    },
    {
      id: "CUST-002",
      name: "Sarah Johnson",
      email: "sarah@example.com",
      phone: "+91 9876543211",
      orders: 8,
      totalSpent: 2950.25,
      lastOrder: "2023-10-18",
    },
    {
      id: "CUST-003",
      name: "Michael Chen",
      email: "michael@example.com",
      phone: "+91 9876543212",
      orders: 5,
      totalSpent: 1250.75,
      lastOrder: "2023-10-17",
    },
    {
      id: "CUST-004",
      name: "Emily Davis",
      email: "emily@example.com",
      phone: "+91 9876543213",
      orders: 3,
      totalSpent: 650.4,
      lastOrder: "2023-10-17",
    },
    {
      id: "CUST-005",
      name: "Robert Wilson",
      email: "robert@example.com",
      phone: "+91 9876543214",
      orders: 6,
      totalSpent: 2100.8,
      lastOrder: "2023-10-16",
    },
  ],
  products: [
    {
      id: "P001",
      name: "Wireless Bluetooth Headphones",
      price: 89.99,
      stock: 45,
    },
    { id: "P002", name: "Ergonomic Office Chair", price: 249.99, stock: 12 },
    { id: "P003", name: "Smart Fitness Watch", price: 199.99, stock: 3 },
    {
      id: "P004",
      name: "Desk Lamp with Wireless Charger",
      price: 49.99,
      stock: 0,
    },
    { id: "P005", name: "Premium Notebook Set", price: 24.99, stock: 120 },
    { id: "P006", name: "Wireless Gaming Mouse", price: 79.99, stock: 5 },
    {
      id: "P007",
      name: "Stainless Steel Water Bottle",
      price: 29.99,
      stock: 65,
    },
    { id: "P008", name: "Bluetooth Portable Speaker", price: 59.99, stock: 18 },
  ],
};

// Initialize charts
function initializeCharts() {
  // Sales Performance Chart
  const salesCtx = document.getElementById("salesChart").getContext("2d");
  const salesChart = new Chart(salesCtx, {
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

  // Category Sales Chart
  const categoryCtx = document.getElementById("categoryChart").getContext("2d");
  const categoryChart = new Chart(categoryCtx, {
    type: "doughnut",
    data: {
      labels: ["Electronics", "Furniture", "Home", "Stationery", "Sports"],
      datasets: [
        {
          data: [65, 15, 5, 10, 5],
          backgroundColor: [
            "#3498db",
            "#9b59b6",
            "#e74c3c",
            "#f39c12",
            "#1abc9c",
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
    .getElementById("salesPeriod")
    .addEventListener("change", function () {
      // In a real app, you would fetch new data based on the selected period
      salesChart.update();
      categoryChart.update();
    });
}

// Load sales data into tables
function loadSalesData() {
  loadOrdersTable();
  loadPendingTable();
  loadCustomersTable();
}

// Load orders table
function loadOrdersTable() {
  const ordersTable = document.getElementById("ordersTable");
  ordersTable.innerHTML = "";

  salesData.orders.forEach((order) => {
    const row = document.createElement("tr");

    // Calculate total items
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Determine order status badge
    let statusClass = "";
    let statusText = "";
    switch (order.orderStatus) {
      case "pending":
        statusClass = "status-pending";
        statusText = "Pending";
        break;
      case "processing":
        statusClass = "status-processing";
        statusText = "Processing";
        break;
      case "completed":
        statusClass = "status-completed";
        statusText = "Completed";
        break;
      case "cancelled":
        statusClass = "status-cancelled";
        statusText = "Cancelled";
        break;
      case "refunded":
        statusClass = "status-refunded";
        statusText = "Refunded";
        break;
    }

    // Determine payment status
    let paymentStatus = "";
    if (order.paymentStatus === "paid") {
      paymentStatus =
        '<span style="color: var(--success-color); font-weight: 600;">Paid</span>';
    } else if (order.paymentStatus === "pending") {
      paymentStatus =
        '<span style="color: var(--warning-color); font-weight: 600;">Pending</span>';
    } else {
      paymentStatus =
        '<span style="color: var(--accent-color); font-weight: 600;">' +
        order.paymentStatus.charAt(0).toUpperCase() +
        order.paymentStatus.slice(1) +
        "</span>";
    }

    row.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${order.date}</td>
                    <td>${order.customer}<br><small>${
      order.customerEmail
    }</small></td>
                    <td>${totalItems} items</td>
                    <td><strong>$${order.total.toFixed(2)}</strong></td>
                    <td>${paymentStatus}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewOrderDetails('${
                          order.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editOrder('${
                          order.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteOrder('${
                          order.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    ordersTable.appendChild(row);
  });
}

// Load pending orders table
function loadPendingTable() {
  const pendingTable = document.getElementById("pendingTable");
  pendingTable.innerHTML = "";

  const pendingOrders = salesData.orders.filter(
    (order) => order.orderStatus === "pending"
  );

  if (pendingOrders.length === 0) {
    pendingTable.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-clock" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <div>No pending orders found</div>
                        </td>
                    </tr>
                `;
    return;
  }

  pendingOrders.forEach((order) => {
    const row = document.createElement("tr");

    // Calculate total items
    const totalItems = order.items.reduce(
      (sum, item) => sum + item.quantity,
      0
    );

    // Determine payment status
    let paymentStatus = "";
    if (order.paymentStatus === "paid") {
      paymentStatus =
        '<span style="color: var(--success-color); font-weight: 600;">Paid</span>';
    } else {
      paymentStatus =
        '<span style="color: var(--warning-color); font-weight: 600;">Pending</span>';
    }

    row.innerHTML = `
                    <td><strong>${order.id}</strong></td>
                    <td>${order.date}</td>
                    <td>${order.customer}</td>
                    <td>${totalItems} items</td>
                    <td><strong>$${order.total.toFixed(2)}</strong></td>
                    <td>${paymentStatus}</td>
                    <td>
                        <button class="btn btn-sm btn-success" onclick="processOrder('${
                          order.id
                        }')">
                            <i class="fas fa-check"></i> Process
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="cancelOrder('${
                          order.id
                        }')">
                            <i class="fas fa-times"></i> Cancel
                        </button>
                    </td>
                `;
    pendingTable.appendChild(row);
  });
}

// Load customers table
function loadCustomersTable() {
  const customersTable = document.getElementById("customersTable");
  customersTable.innerHTML = "";

  salesData.customers.forEach((customer) => {
    const row = document.createElement("tr");

    row.innerHTML = `
                    <td>${customer.id}</td>
                    <td><strong>${customer.name}</strong></td>
                    <td>${customer.email}</td>
                    <td>${customer.phone}</td>
                    <td>${customer.orders}</td>
                    <td><strong>$${customer.totalSpent.toLocaleString()}</strong></td>
                    <td>${customer.lastOrder}</td>
                `;
    customersTable.appendChild(row);
  });
}

// View order details
function viewOrderDetails(orderId) {
  const order = salesData.orders.find((o) => o.id === orderId);
  if (!order) return;

  document.getElementById(
    "orderDetailsTitle"
  ).textContent = `Order Details: ${order.id}`;

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  switch (order.orderStatus) {
    case "pending":
      statusClass = "status-pending";
      statusText = "Pending";
      break;
    case "processing":
      statusClass = "status-processing";
      statusText = "Processing";
      break;
    case "completed":
      statusClass = "status-completed";
      statusText = "Completed";
      break;
    case "cancelled":
      statusClass = "status-cancelled";
      statusText = "Cancelled";
      break;
    case "refunded":
      statusClass = "status-refunded";
      statusText = "Refunded";
      break;
  }

  // Generate items list HTML
  let itemsHtml = "";
  order.items.forEach((item, index) => {
    itemsHtml += `
                    <tr>
                        <td>${index + 1}</td>
                        <td>${item.name}</td>
                        <td>$${item.price.toFixed(2)}</td>
                        <td>${item.quantity}</td>
                        <td>₹${item.total.toFixed(2)}</td>
                    </tr>
                `;
  });

  // Determine payment status color
  let paymentStatusColor = "";
  if (order.paymentStatus === "paid") {
    paymentStatusColor = "var(--success-color)";
  } else if (order.paymentStatus === "pending") {
    paymentStatusColor = "var(--warning-color)";
  } else {
    paymentStatusColor = "var(--accent-color)";
  }

  const detailsContent = document.getElementById("orderDetailsContent");
  detailsContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Order Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Order ID:</td>
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
                                <td style="padding: 8px 0; color: #7f8c8d;">Payment Status:</td>
                                <td style="padding: 8px 0; font-weight: 600; color: ${paymentStatusColor}">
                                    ${
                                      order.paymentStatus
                                        .charAt(0)
                                        .toUpperCase() +
                                      order.paymentStatus.slice(1)
                                    }
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Customer Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Name:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  order.customer
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Email:</td>
                                <td style="padding: 8px 0;">${
                                  order.customerEmail
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Phone:</td>
                                <td style="padding: 8px 0;">${
                                  order.customerPhone
                                }</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Shipping Address</h4>
                    <p>${order.shippingAddress}</p>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Order Items</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>Product</th>
                                    <th>Price</th>
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
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-top: 10px; border-top: 1px solid #ddd; font-weight: 600; font-size: 18px;">
                                <span>Total:</span>
                                <span>$${order.total.toFixed(2)}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closeOrderDetailsModal()">Close</button>
                    <button class="btn btn-primary" onclick="printOrder('${
                      order.id
                    }')">
                        <i class="fas fa-print"></i> Print Invoice
                    </button>
                    ${
                      order.orderStatus === "pending"
                        ? `
                        <button class="btn btn-success" onclick="processOrder('${order.id}')">
                            <i class="fas fa-check"></i> Process Order
                        </button>
                    `
                        : ""
                    }
                </div>
            `;

  document.getElementById("orderDetailsModal").classList.add("active");
}

// Close order details modal
function closeOrderDetailsModal() {
  document.getElementById("orderDetailsModal").classList.remove("active");
}

// Edit order
function editOrder(orderId) {
  alert(`Editing order: ${orderId}\nThis would open an order editor.`);
}

// Delete order
function deleteOrder(orderId) {
  if (
    !confirm(
      `Are you sure you want to delete order ${orderId}? This action cannot be undone.`
    )
  ) {
    return;
  }

  // In a real app, you would send a delete request to the server
  salesData.orders = salesData.orders.filter((order) => order.id !== orderId);
  loadOrdersTable();
  loadPendingTable();

  showNotification(`Order ${orderId} deleted successfully!`, "success");
}

// Process order
function processOrder(orderId) {
  const order = salesData.orders.find((o) => o.id === orderId);
  if (!order) return;

  if (order.orderStatus === "pending") {
    order.orderStatus = "processing";
    loadOrdersTable();
    loadPendingTable();
    showNotification(`Order ${orderId} marked as processing!`, "success");
  } else if (order.orderStatus === "processing") {
    order.orderStatus = "completed";
    loadOrdersTable();
    showNotification(`Order ${orderId} marked as completed!`, "success");
  }
}

// Cancel order
function cancelOrder(orderId) {
  const order = salesData.orders.find((o) => o.id === orderId);
  if (!order) return;

  if (confirm(`Are you sure you want to cancel order ${orderId}?`)) {
    order.orderStatus = "cancelled";
    loadOrdersTable();
    loadPendingTable();
    showNotification(`Order ${orderId} cancelled!`, "success");
  }
}

// Print order invoice
function printOrder(orderId) {
  alert(`Printing invoice for order: ${orderId}`);
  // In a real app, this would open a print dialog with the invoice
}

// Show new order modal
function showNewOrderModal() {
  document.getElementById("newOrderModal").classList.add("active");
  // Clear any existing items
  document.getElementById("orderItems").innerHTML = "";
  // Add one empty row
  addOrderItemRow();
  updateOrderSummary();
}

// Add order item row
function addOrderItemRow() {
  const orderItems = document.getElementById("orderItems");
  const rowCount = orderItems.children.length;

  const row = document.createElement("tr");
  row.innerHTML = `
                <td>
                    <select class="form-control product-select" onchange="updateProductPrice(this, ${rowCount})">
                        <option value="">Select Product</option>
                        ${salesData.products
                          .map(
                            (product) => `
                            <option value="${product.id}" data-price="${product.price}">${product.name} (Stock: ${product.stock})</option>
                        `
                          )
                          .join("")}
                    </select>
                </td>
                <td>
                    <input type="number" class="form-control price-input" data-index="${rowCount}" value="0.00" min="0" step="0.01" readonly>
                </td>
                <td>
                    <input type="number" class="form-control quantity-input" data-index="${rowCount}" value="1" min="1" onchange="updateItemTotal(${rowCount})">
                </td>
                <td>
                    <input type="text" class="form-control total-input" data-index="${rowCount}" value="0.00" readonly>
                </td>
                <td>
                    <button type="button" class="btn btn-danger btn-sm" onclick="removeOrderItemRow(this)">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
  orderItems.appendChild(row);
}

// Update product price when selected
function updateProductPrice(selectElement, index) {
  const selectedOption = selectElement.options[selectElement.selectedIndex];
  const price = selectedOption.getAttribute("data-price") || "0";

  const priceInput = document.querySelector(
    `.price-input[data-index="${index}"]`
  );
  const quantityInput = document.querySelector(
    `.quantity-input[data-index="${index}"]`
  );

  priceInput.value = parseFloat(price).toFixed(2);
  updateItemTotal(index);
}

// Update item total
function updateItemTotal(index) {
  const priceInput = document.querySelector(
    `.price-input[data-index="${index}"]`
  );
  const quantityInput = document.querySelector(
    `.quantity-input[data-index="${index}"]`
  );
  const totalInput = document.querySelector(
    `.total-input[data-index="${index}"]`
  );

  const price = parseFloat(priceInput.value) || 0;
  const quantity = parseInt(quantityInput.value) || 0;
  const total = price * quantity;

  totalInput.value = total.toFixed(2);
  updateOrderSummary();
}

// Remove order item row
function removeOrderItemRow(button) {
  const row = button.closest("tr");
  row.remove();
  updateOrderSummary();
}

// Update order summary
function updateOrderSummary() {
  let subtotal = 0;
  const totalInputs = document.querySelectorAll(".total-input");

  totalInputs.forEach((input) => {
    subtotal += parseFloat(input.value) || 0;
  });

  const tax = subtotal * 0.18; // 18% tax
  const total = subtotal + tax;

  document.getElementById("orderSubtotal").textContent = `$${subtotal.toFixed(
    2
  )}`;
  document.getElementById("orderTax").textContent = `$${tax.toFixed(2)}`;
  document.getElementById("orderTotal").textContent = `$${total.toFixed(2)}`;
}

// Process new order
function processNewOrder() {
  const customerName = document.getElementById("customerName").value;
  const customerPhone = document.getElementById("customerPhone").value;
  const customerEmail = document.getElementById("customerEmail").value;
  const customerAddress = document.getElementById("customerAddress").value;
  const orderNotes = document.getElementById("orderNotes").value;

  if (!customerName) {
    alert("Please enter customer name!");
    return;
  }

  // Collect order items
  const items = [];
  const productSelects = document.querySelectorAll(".product-select");
  const quantityInputs = document.querySelectorAll(".quantity-input");

  let hasItems = false;

  for (let i = 0; i < productSelects.length; i++) {
    const productSelect = productSelects[i];
    const productId = productSelect.value;
    const productName =
      productSelect.options[productSelect.selectedIndex].text.split(" (")[0];
    const price =
      parseFloat(
        document.querySelector(`.price-input[data-index="${i}"]`).value
      ) || 0;
    const quantity = parseInt(quantityInputs[i].value) || 0;

    if (productId && quantity > 0) {
      hasItems = true;
      items.push({
        name: productName,
        quantity: quantity,
        price: price,
        total: price * quantity,
      });
    }
  }

  if (!hasItems) {
    alert("Please add at least one product to the order!");
    return;
  }

  // Calculate totals
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const tax = subtotal * 0.18;
  const total = subtotal + tax;

  // Generate new order ID
  const orderId =
    "ORD-" +
    new Date().getFullYear() +
    "-" +
    (salesData.orders.length + 1).toString().padStart(3, "0");

  // Create new order
  const newOrder = {
    id: orderId,
    date: new Date().toLocaleString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    }),
    customer: customerName,
    customerEmail: customerEmail,
    customerPhone: customerPhone,
    items: items,
    subtotal: subtotal,
    tax: tax,
    total: total,
    paymentStatus: "pending",
    orderStatus: "pending",
    shippingAddress: customerAddress,
    notes: orderNotes,
  };

  // Add to orders array
  salesData.orders.unshift(newOrder);

  // Add to customers if new
  const existingCustomer = salesData.customers.find(
    (c) => c.email === customerEmail
  );
  if (!existingCustomer && customerEmail) {
    const newCustomer = {
      id:
        "CUST-" + (salesData.customers.length + 1).toString().padStart(3, "0"),
      name: customerName,
      email: customerEmail,
      phone: customerPhone,
      orders: 1,
      totalSpent: total,
      lastOrder: new Date().toISOString().split("T")[0],
    };
    salesData.customers.push(newCustomer);
  } else if (existingCustomer) {
    existingCustomer.orders += 1;
    existingCustomer.totalSpent += total;
    existingCustomer.lastOrder = new Date().toISOString().split("T")[0];
  }

  // Close modal and reset form
  document.getElementById("newOrderModal").classList.remove("active");
  document.getElementById("customerName").value = "";
  document.getElementById("customerPhone").value = "";
  document.getElementById("customerEmail").value = "";
  document.getElementById("customerAddress").value = "";
  document.getElementById("orderNotes").value = "";

  // Reload data
  loadOrdersTable();
  loadPendingTable();
  loadCustomersTable();

  // Show success notification
  showNotification(`New order ${orderId} created successfully!`, "success");
}

// Save order as draft
function saveOrderAsDraft() {
  showNotification("Order saved as draft!", "success");
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
  document.getElementById("ordersTab").style.display = "none";
  document.getElementById("pendingTab").style.display = "none";

  // Show selected tab
  if (tabName === "orders") {
    document.getElementById("ordersTab").style.display = "block";
  } else if (tabName === "pending") {
    document.getElementById("pendingTab").style.display = "block";
    loadPendingTable();
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
    .getElementById("newOrderBtn")
    .addEventListener("click", showNewOrderModal);
  document
    .getElementById("quickInvoiceBtn")
    .addEventListener("click", function () {
      alert("Quick Invoice feature would generate an instant invoice.");
    });
  document
    .getElementById("importOrdersBtn")
    .addEventListener("click", function () {
      alert(
        "Import Orders feature would allow importing orders from CSV/Excel."
      );
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      // In a real app, this would filter the orders table
      showNotification("Filters applied successfully!", "success");
    });

  // View all customers button
  document
    .getElementById("viewAllCustomersBtn")
    .addEventListener("click", function () {
      alert("This would show all customers in a separate page/modal.");
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
    .getElementById("closeNewOrderModal")
    .addEventListener("click", function () {
      document.getElementById("newOrderModal").classList.remove("active");
    });

  document
    .getElementById("closeOrderDetailsModal")
    .addEventListener("click", closeOrderDetailsModal);

  // Cancel order button
  document
    .getElementById("cancelOrderBtn")
    .addEventListener("click", function () {
      document.getElementById("newOrderModal").classList.remove("active");
    });

  // Add item button
  document
    .getElementById("addItemBtn")
    .addEventListener("click", addOrderItemRow);

  // Save draft button
  document
    .getElementById("saveDraftBtn")
    .addEventListener("click", saveOrderAsDraft);

  // Process order button
  document
    .getElementById("processOrderBtn")
    .addEventListener("click", processNewOrder);

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
