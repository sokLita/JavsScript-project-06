// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize supplier data
  initializeCharts();
  loadSupplierData();
  setupEventListeners();
});

// Sample supplier data
let supplierData = {
  suppliers: [
    {
      id: "SUP-001",
      code: "ABC-001",
      name: "ElectroTech Solutions",
      contactPerson: "Rajesh Kumar",
      contactTitle: "Sales Manager",
      phone: "+91 9876543210",
      email: "rajesh@electrotech.com",
      address: "123 Industrial Area",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400001",
      country: "India",
      taxId: "GSTIN27ABCET1234N1",
      paymentTerms: "net30",
      category: "electronics",
      productsSupplied: [
        "Wireless Headphones",
        "Smart Watches",
        "Bluetooth Speakers",
        "Charging Cables",
      ],
      rating: 4.5,
      status: "active",
      totalSpend: 1250000,
      totalOrders: 45,
      onTimeRate: 96,
      avgDeliveryTime: 2.5,
      notes: "Reliable supplier with good quality products",
      joinDate: "2022-03-15",
      lastOrder: "2023-10-15",
    },
    {
      id: "SUP-002",
      code: "XYZ-002",
      name: "Global Furniture Inc.",
      contactPerson: "Priya Sharma",
      contactTitle: "Account Manager",
      phone: "+91 9876543211",
      email: "priya@globalfurniture.com",
      address: "456 Corporate Park",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110001",
      country: "India",
      taxId: "GSTIN07XYZGF4567N2",
      paymentTerms: "net60",
      category: "furniture",
      productsSupplied: [
        "Office Chairs",
        "Desks",
        "Conference Tables",
        "Storage Cabinets",
      ],
      rating: 4.2,
      status: "active",
      totalSpend: 850000,
      totalOrders: 28,
      onTimeRate: 92,
      avgDeliveryTime: 5.2,
      notes: "Bulk orders get 10% discount",
      joinDate: "2022-06-22",
      lastOrder: "2023-10-10",
    },
    {
      id: "SUP-003",
      code: "RMP-003",
      name: "Prime Raw Materials",
      contactPerson: "Vikram Singh",
      contactTitle: "Director",
      phone: "+91 9876543212",
      email: "vikram@primeraw.com",
      address: "789 Factory Zone",
      city: "Ahmedabad",
      state: "Gujarat",
      zipCode: "380001",
      country: "India",
      taxId: "GSTIN24PRM7890N3",
      paymentTerms: "cod",
      category: "raw_materials",
      productsSupplied: [
        "Plastic Granules",
        "Metal Sheets",
        "Electronic Components",
        "Packaging Materials",
      ],
      rating: 3.8,
      status: "active",
      totalSpend: 2150000,
      totalOrders: 67,
      onTimeRate: 88,
      avgDeliveryTime: 3.8,
      notes: "Sometimes delayed in monsoon season",
      joinDate: "2021-11-10",
      lastOrder: "2023-10-05",
    },
    {
      id: "SUP-004",
      code: "PKG-004",
      name: "Packaging Masters",
      contactPerson: "Anita Desai",
      contactTitle: "Sales Executive",
      phone: "+91 9876543213",
      email: "anita@packagingmasters.com",
      address: "101 Logistics Park",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India",
      taxId: "GSTIN29PKGM5678N4",
      paymentTerms: "net15",
      category: "packaging",
      productsSupplied: ["Cardboard Boxes", "Bubble Wrap", "Tape", "Labels"],
      rating: 4.7,
      status: "active",
      totalSpend: 320000,
      totalOrders: 89,
      onTimeRate: 98,
      avgDeliveryTime: 1.5,
      notes: "Excellent quality and fast delivery",
      joinDate: "2023-01-15",
      lastOrder: "2023-10-18",
    },
    {
      id: "SUP-005",
      code: "OFS-005",
      name: "Office Supply Co.",
      contactPerson: "Mohan Lal",
      contactTitle: "Owner",
      phone: "+91 9876543214",
      email: "mohan@officesupply.co",
      address: "202 Stationery Market",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600001",
      country: "India",
      taxId: "GSTIN33OFS9012N5",
      paymentTerms: "net30",
      category: "office_supplies",
      productsSupplied: ["Notebooks", "Pens", "Printers", "Toner Cartridges"],
      rating: 4.0,
      status: "inactive",
      totalSpend: 185000,
      totalOrders: 23,
      onTimeRate: 85,
      avgDeliveryTime: 4.0,
      notes: "No orders in last 4 months",
      joinDate: "2022-08-05",
      lastOrder: "2023-06-20",
    },
    {
      id: "SUP-006",
      code: "SVC-006",
      name: "Tech Services Ltd.",
      contactPerson: "Sanjay Patel",
      contactTitle: "Service Manager",
      phone: "+91 9876543215",
      email: "sanjay@techservices.com",
      address: "303 Tech Park",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500001",
      country: "India",
      taxId: "GSTIN36TSVC3456N6",
      paymentTerms: "advance",
      category: "services",
      productsSupplied: [
        "IT Support",
        "Equipment Maintenance",
        "Software Licenses",
        "Consulting",
      ],
      rating: 4.3,
      status: "pending",
      totalSpend: 450000,
      totalOrders: 12,
      onTimeRate: 90,
      avgDeliveryTime: 0,
      notes: "New supplier, pending approval",
      joinDate: "2023-09-10",
      lastOrder: null,
    },
  ],
  purchases: [
    {
      poNumber: "PO-2023-101",
      supplierId: "SUP-001",
      supplierName: "ElectroTech Solutions",
      date: "2023-10-15",
      products: ["Wireless Headphones (50 units)", "Smart Watches (25 units)"],
      totalAmount: 87500,
      status: "delivered",
      deliveryDate: "2023-10-17",
    },
    {
      poNumber: "PO-2023-102",
      supplierId: "SUP-002",
      supplierName: "Global Furniture Inc.",
      date: "2023-10-10",
      products: ["Office Chairs (20 units)"],
      totalAmount: 125000,
      status: "in_transit",
      deliveryDate: "2023-10-18",
    },
    {
      poNumber: "PO-2023-103",
      supplierId: "SUP-004",
      supplierName: "Packaging Masters",
      date: "2023-10-12",
      products: ["Cardboard Boxes (500 units)", "Bubble Wrap (100 rolls)"],
      totalAmount: 28500,
      status: "delivered",
      deliveryDate: "2023-10-13",
    },
    {
      poNumber: "PO-2023-104",
      supplierId: "SUP-003",
      supplierName: "Prime Raw Materials",
      date: "2023-10-05",
      products: ["Plastic Granules (1000 kg)", "Metal Sheets (200 sheets)"],
      totalAmount: 185000,
      status: "processing",
      deliveryDate: "2023-10-20",
    },
    {
      poNumber: "PO-2023-105",
      supplierId: "SUP-001",
      supplierName: "ElectroTech Solutions",
      date: "2023-09-28",
      products: [
        "Bluetooth Speakers (30 units)",
        "Charging Cables (100 units)",
      ],
      totalAmount: 42500,
      status: "delivered",
      deliveryDate: "2023-09-30",
    },
  ],
};

// Initialize charts
function initializeCharts() {
  // Supplier Performance Chart
  const performanceCtx = document
    .getElementById("performanceChart")
    .getContext("2d");
  const performanceChart = new Chart(performanceCtx, {
    type: "bar",
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
          label: "On-Time Delivery %",
          data: [92, 94, 91, 95, 93, 96, 94, 95, 96, 94],
          backgroundColor: "rgba(52, 152, 219, 0.7)",
          borderColor: "#3498db",
          borderWidth: 1,
        },
        {
          label: "Avg Rating",
          data: [4.1, 4.2, 4.0, 4.3, 4.2, 4.3, 4.1, 4.2, 4.3, 4.2],
          backgroundColor: "rgba(39, 174, 96, 0.7)",
          borderColor: "#27ae60",
          borderWidth: 1,
          type: "line",
          yAxisID: "y1",
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
          beginAtZero: false,
          min: 85,
          max: 100,
          title: {
            display: true,
            text: "On-Time %",
          },
        },
        y1: {
          position: "right",
          beginAtZero: false,
          min: 3.5,
          max: 5,
          title: {
            display: true,
            text: "Avg Rating",
          },
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    },
  });

  // Spend by Category Chart
  const spendCtx = document.getElementById("spendChart").getContext("2d");
  const spendChart = new Chart(spendCtx, {
    type: "pie",
    data: {
      labels: [
        "Electronics",
        "Furniture",
        "Raw Materials",
        "Packaging",
        "Office Supplies",
        "Services",
      ],
      datasets: [
        {
          data: [1250000, 850000, 2150000, 320000, 185000, 450000],
          backgroundColor: [
            "#3498db",
            "#9b59b6",
            "#e74c3c",
            "#f39c12",
            "#1abc9c",
            "#34495e",
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
              return `${label}: $${value.toLocaleString()} (${percentage}%)`;
            },
          },
        },
      },
    },
  });

  // Update chart on period change
  document
    .getElementById("performancePeriod")
    .addEventListener("change", function () {
      // In a real app, you would fetch new data based on the selected period
      performanceChart.update();
      spendChart.update();
    });
}

// Load supplier data into tables
function loadSupplierData() {
  loadSuppliersTable();
  loadSupplierCards();
  loadTopSuppliersTable();
  loadNeedsAttentionTable();
  loadRecentPurchasesTable();
  updateOverviewStats();
}

// Load suppliers table
function loadSuppliersTable() {
  const suppliersTable = document.getElementById("suppliersTable");
  suppliersTable.innerHTML = "";

  supplierData.suppliers.forEach((supplier) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (supplier.status === "active") {
      statusClass = "status-active";
      statusText = "Active";
    } else if (supplier.status === "inactive") {
      statusClass = "status-inactive";
      statusText = "Inactive";
    } else {
      statusClass = "status-pending";
      statusText = "Pending";
    }

    // Generate rating stars
    const ratingStars = generateRatingStars(supplier.rating);

    row.innerHTML = `
                    <td><strong>${supplier.code}</strong></td>
                    <td><strong>${supplier.name}</strong></td>
                    <td>${supplier.contactPerson}<br><small>${
      supplier.contactTitle
    }</small></td>
                    <td>${supplier.phone}</td>
                    <td>${supplier.email}</td>
                    <td>
                        <div class="product-list">
                            ${supplier.productsSupplied
                              .slice(0, 2)
                              .map(
                                (product) =>
                                  `<span class="product-tag">${product}</span>`
                              )
                              .join("")}
                            ${
                              supplier.productsSupplied.length > 2
                                ? `<span class="product-tag">+${
                                    supplier.productsSupplied.length - 2
                                  } more</span>`
                                : ""
                            }
                        </div>
                    </td>
                    <td>
                        <div class="rating-badge">
                            ${ratingStars}
                            <span>${supplier.rating.toFixed(1)}</span>
                        </div>
                    </td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewSupplierDetails('${
                          supplier.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editSupplier('${
                          supplier.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteSupplier('${
                          supplier.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    suppliersTable.appendChild(row);
  });
}

// Load supplier cards
function loadSupplierCards() {
  const cardsContainer = document.getElementById("cardsTab");
  cardsContainer.innerHTML = "";

  supplierData.suppliers.forEach((supplier) => {
    const card = createSupplierCard(supplier);
    cardsContainer.appendChild(card);
  });
}

// Create supplier card
function createSupplierCard(supplier) {
  const card = document.createElement("div");
  card.className = "supplier-card";

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  if (supplier.status === "active") {
    statusClass = "status-active";
    statusText = "Active";
  } else if (supplier.status === "inactive") {
    statusClass = "status-inactive";
    statusText = "Inactive";
  } else {
    statusClass = "status-pending";
    statusText = "Pending";
  }

  // Generate rating stars
  const ratingStars = generateRatingStars(supplier.rating);

  card.innerHTML = `
                <div class="supplier-header">
                    <div>
                        <div class="supplier-name">${supplier.name}</div>
                        <div class="supplier-category">${getCategoryName(
                          supplier.category
                        )}</div>
                    </div>
                    <div class="supplier-rating">
                        <i class="fas fa-star"></i>
                        <span>${supplier.rating.toFixed(1)}</span>
                    </div>
                </div>
                <div class="supplier-body">
                    <div class="supplier-info">
                        <div class="info-row">
                            <i class="fas fa-user"></i>
                            <span>${supplier.contactPerson} (${
    supplier.contactTitle
  })</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-phone"></i>
                            <span>${supplier.phone}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-envelope"></i>
                            <span>${supplier.email}</span>
                        </div>
                        <div class="info-row">
                            <i class="fas fa-map-marker-alt"></i>
                            <span>${supplier.city}, ${supplier.state}</span>
                        </div>
                    </div>
                    <div>
                        <div style="font-size: 12px; color: #7f8c8d; margin-bottom: 5px;">Products Supplied:</div>
                        <div class="product-list">
                            ${supplier.productsSupplied
                              .slice(0, 3)
                              .map(
                                (product) =>
                                  `<span class="product-tag">${product}</span>`
                              )
                              .join("")}
                            ${
                              supplier.productsSupplied.length > 3
                                ? `<span class="product-tag">+${
                                    supplier.productsSupplied.length - 3
                                  } more</span>`
                                : ""
                            }
                        </div>
                    </div>
                </div>
                <div class="supplier-footer">
                    <span class="status-badge ${statusClass}">${statusText}</span>
                    <div style="display: flex; gap: 10px;">
                        <button class="btn btn-sm btn-primary" onclick="viewSupplierDetails('${
                          supplier.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editSupplier('${
                          supplier.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </div>
                </div>
            `;

  return card;
}

// Load top suppliers table
function loadTopSuppliersTable() {
  const topTable = document.getElementById("topSuppliersTable");
  topTable.innerHTML = "";

  // Sort suppliers by total spend (descending)
  const topSuppliers = [...supplierData.suppliers]
    .sort((a, b) => b.totalSpend - a.totalSpend)
    .slice(0, 10);

  topSuppliers.forEach((supplier, index) => {
    const row = document.createElement("tr");

    // Generate rating stars
    const ratingStars = generateRatingStars(supplier.rating);

    row.innerHTML = `
                    <td>#${index + 1}</td>
                    <td><strong>${supplier.name}</strong></td>
                    <td>$${supplier.totalSpend.toLocaleString()}</td>
                    <td>${supplier.totalOrders}</td>
                    <td>
                        <div class="rating-badge">
                            ${ratingStars}
                            <span>${supplier.rating.toFixed(1)}</span>
                        </div>
                    </td>
                    <td>${supplier.onTimeRate}%</td>
                    <td>${supplier.avgDeliveryTime} days</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewSupplierDetails('${
                          supplier.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                    </td>
                `;
    topTable.appendChild(row);
  });
}

// Load needs attention table
function loadNeedsAttentionTable() {
  const needsTable = document.getElementById("needsAttentionTable");
  needsTable.innerHTML = "";

  // Find suppliers that need attention
  const needsAttention = supplierData.suppliers.filter((supplier) => {
    // Inactive for more than 90 days
    if (supplier.status === "inactive") return true;

    // Low rating (less than 3.5)
    if (supplier.rating < 3.5) return true;

    // Low on-time rate (less than 85%)
    if (supplier.onTimeRate < 85) return true;

    return false;
  });

  if (needsAttention.length === 0) {
    needsTable.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-check-circle" style="font-size: 40px; margin-bottom: 15px; color: var(--success-color);"></i>
                            <div>All suppliers are performing well!</div>
                        </td>
                    </tr>
                `;
    return;
  }

  needsAttention.forEach((supplier) => {
    const row = document.createElement("tr");

    // Determine issue
    let issue = "";
    let action = "";

    if (supplier.status === "inactive") {
      issue = "Inactive for 90+ days";
      action = "Contact to reactivate";
    } else if (supplier.rating < 3.5) {
      issue = `Low rating (${supplier.rating.toFixed(1)})`;
      action = "Review performance";
    } else if (supplier.onTimeRate < 85) {
      issue = `Low on-time rate (${supplier.onTimeRate}%)`;
      action = "Discuss delivery issues";
    }

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    if (supplier.status === "active") {
      statusClass = "status-active";
      statusText = "Active";
    } else if (supplier.status === "inactive") {
      statusClass = "status-inactive";
      statusText = "Inactive";
    } else {
      statusClass = "status-pending";
      statusText = "Pending";
    }

    // Generate rating stars
    const ratingStars = generateRatingStars(supplier.rating);

    row.innerHTML = `
                    <td><strong>${supplier.name}</strong></td>
                    <td><span style="color: var(--warning-color); font-weight: 600;">${issue}</span></td>
                    <td>${supplier.lastOrder || "No orders"}</td>
                    <td>
                        <div class="rating-badge">
                            ${ratingStars}
                            <span>${supplier.rating.toFixed(1)}</span>
                        </div>
                    </td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${action}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewSupplierDetails('${
                          supplier.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editSupplier('${
                          supplier.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                    </td>
                `;
    needsTable.appendChild(row);
  });
}

// Load recent purchases table
function loadRecentPurchasesTable() {
  const purchasesTable = document.getElementById("recentPurchasesTable");
  purchasesTable.innerHTML = "";

  supplierData.purchases.forEach((purchase) => {
    const row = document.createElement("tr");

    // Determine status
    let statusBadge = "";
    if (purchase.status === "delivered") {
      statusBadge = '<span class="status-badge status-active">Delivered</span>';
    } else if (purchase.status === "in_transit") {
      statusBadge =
        '<span class="status-badge status-pending">In Transit</span>';
    } else {
      statusBadge =
        '<span class="status-badge status-pending">Processing</span>';
    }

    row.innerHTML = `
                    <td><strong>${purchase.poNumber}</strong></td>
                    <td>${purchase.supplierName}</td>
                    <td>${purchase.date}</td>
                    <td>${purchase.products.join(", ")}</td>
                    <td><strong>$${purchase.totalAmount.toLocaleString()}</strong></td>
                    <td>${statusBadge}</td>
                    <td>${purchase.deliveryDate}</td>
                `;
    purchasesTable.appendChild(row);
  });
}

// Update overview statistics
function updateOverviewStats() {
  const totalSuppliers = supplierData.suppliers.length;
  const activeSuppliers = supplierData.suppliers.filter(
    (s) => s.status === "active"
  ).length;
  const pendingSuppliers = supplierData.suppliers.filter(
    (s) => s.status === "pending"
  ).length;
  const inactiveSuppliers = supplierData.suppliers.filter(
    (s) => s.status === "inactive"
  ).length;

  // Calculate average metrics
  const activeSuppliersData = supplierData.suppliers.filter(
    (s) => s.status === "active"
  );
  const avgDeliveryTime =
    activeSuppliersData.length > 0
      ? (
          activeSuppliersData.reduce((sum, s) => sum + s.avgDeliveryTime, 0) /
          activeSuppliersData.length
        ).toFixed(1)
      : 0;

  const avgRating =
    activeSuppliersData.length > 0
      ? (
          activeSuppliersData.reduce((sum, s) => sum + s.rating, 0) /
          activeSuppliersData.length
        ).toFixed(1)
      : 0;

  const onTimeRate =
    activeSuppliersData.length > 0
      ? Math.round(
          activeSuppliersData.reduce((sum, s) => sum + s.onTimeRate, 0) /
            activeSuppliersData.length
        )
      : 0;

  const totalSpend = supplierData.suppliers.reduce(
    (sum, s) => sum + s.totalSpend,
    0
  );

  // Update DOM
  document.getElementById("totalSuppliers").textContent = totalSuppliers;
  document.getElementById("activeSuppliers").textContent = activeSuppliers;
  document.getElementById("pendingSuppliers").textContent = pendingSuppliers;
  document.getElementById("inactiveSuppliers").textContent = inactiveSuppliers;
  document.getElementById("avgDeliveryTime").textContent = avgDeliveryTime;
  document.getElementById("avgRating").textContent = avgRating;
  document.getElementById("onTimeRate").textContent = onTimeRate + "%";
  document.getElementById("totalSpend").textContent =
    "$" + (totalSpend / 1000000).toFixed(1) + "M";
}

// Generate rating stars HTML
function generateRatingStars(rating) {
  let stars = "";
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;

  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fas fa-star"></i>';
  }

  if (halfStar) {
    stars += '<i class="fas fa-star-half-alt"></i>';
  }

  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="far fa-star"></i>';
  }

  return stars;
}

// Get category name from value
function getCategoryName(categoryValue) {
  const categories = {
    electronics: "Electronics",
    furniture: "Furniture",
    raw_materials: "Raw Materials",
    packaging: "Packaging",
    office_supplies: "Office Supplies",
    services: "Services",
  };
  return categories[categoryValue] || categoryValue;
}

// Get payment terms name from value
function getPaymentTerms(termsValue) {
  const terms = {
    net30: "Net 30 Days",
    net60: "Net 60 Days",
    net15: "Net 15 Days",
    cod: "Cash on Delivery",
    advance: "Advance Payment",
  };
  return terms[termsValue] || termsValue;
}

// View supplier details
function viewSupplierDetails(supplierId) {
  const supplier = supplierData.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  document.getElementById(
    "supplierDetailsTitle"
  ).textContent = `Supplier Details: ${supplier.name}`;

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  if (supplier.status === "active") {
    statusClass = "status-active";
    statusText = "Active";
  } else if (supplier.status === "inactive") {
    statusClass = "status-inactive";
    statusText = "Inactive";
  } else {
    statusClass = "status-pending";
    statusText = "Pending";
  }

  // Generate rating stars
  const ratingStars = generateRatingStars(supplier.rating);

  // Get purchases for this supplier
  const supplierPurchases = supplierData.purchases.filter(
    (p) => p.supplierId === supplierId
  );

  // Generate purchases table rows
  let purchasesRows = "";
  if (supplierPurchases.length > 0) {
    supplierPurchases.forEach((purchase) => {
      purchasesRows += `
                        <tr>
                            <td>${purchase.poNumber}</td>
                            <td>${purchase.date}</td>
                            <td>${purchase.products.join(", ")}</td>
                            <td>$${purchase.totalAmount.toLocaleString()}</td>
                            <td>${purchase.deliveryDate}</td>
                        </tr>
                    `;
    });
  } else {
    purchasesRows = `
                    <tr>
                        <td colspan="5" style="text-align: center; padding: 20px; color: #7f8c8d;">
                            No purchase history available
                        </td>
                    </tr>
                `;
  }

  const detailsContent = document.getElementById("supplierDetailsContent");
  detailsContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Supplier Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Supplier ID:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  supplier.code
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Company Name:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  supplier.name
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Category:</td>
                                <td style="padding: 8px 0;">${getCategoryName(
                                  supplier.category
                                )}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Status:</td>
                                <td style="padding: 8px 0;"><span class="status-badge ${statusClass}">${statusText}</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Rating:</td>
                                <td style="padding: 8px 0;">
                                    <div class="rating-badge">
                                        ${ratingStars}
                                        <span>${supplier.rating.toFixed(
                                          1
                                        )}</span>
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Join Date:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.joinDate
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Last Order:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.lastOrder || "No orders yet"
                                }</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Performance Metrics</h4>
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Total Spend:</span>
                                <span style="font-weight: 600;">$${supplier.totalSpend.toLocaleString()}</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Total Orders:</span>
                                <span style="font-weight: 600;">${
                                  supplier.totalOrders
                                }</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>On-Time Delivery:</span>
                                <span style="font-weight: 600;">${
                                  supplier.onTimeRate
                                }%</span>
                            </div>
                            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
                                <span>Avg Delivery Time:</span>
                                <span style="font-weight: 600;">${
                                  supplier.avgDeliveryTime
                                } days</span>
                            </div>
                            <div style="display: flex; justify-content: space-between;">
                                <span>Payment Terms:</span>
                                <span style="font-weight: 600;">${getPaymentTerms(
                                  supplier.paymentTerms
                                )}</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Contact Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Contact Person:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.contactPerson
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Title:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.contactTitle
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Phone:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.phone
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Email:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.email
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Tax ID:</td>
                                <td style="padding: 8px 0;">${
                                  supplier.taxId
                                }</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Address</h4>
                        <p>${supplier.address}<br>
                        ${supplier.city}, ${supplier.state} ${
    supplier.zipCode
  }<br>
                        ${supplier.country}</p>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Products Supplied</h4>
                    <div class="product-list">
                        ${supplier.productsSupplied
                          .map(
                            (product) =>
                              `<span class="product-tag">${product}</span>`
                          )
                          .join("")}
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Purchase History</h4>
                    <div class="table-container">
                        <table class="data-table">
                            <thead>
                                <tr>
                                    <th>PO Number</th>
                                    <th>Date</th>
                                    <th>Products</th>
                                    <th>Amount</th>
                                    <th>Delivery Date</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${purchasesRows}
                            </tbody>
                        </table>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Notes</h4>
                    <p style="color: #7f8c8d; font-style: italic;">${
                      supplier.notes
                    }</p>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closeSupplierDetailsModal()">Close</button>
                    <button class="btn btn-warning" onclick="editSupplier('${
                      supplier.id
                    }')">
                        <i class="fas fa-edit"></i> Edit Supplier
                    </button>
                    <button class="btn btn-primary" onclick="createPurchaseOrder('${
                      supplier.id
                    }')">
                        <i class="fas fa-shopping-cart"></i> Create Purchase Order
                    </button>
                </div>
            `;

  document.getElementById("supplierDetailsModal").classList.add("active");
}

// Close supplier details modal
function closeSupplierDetailsModal() {
  document.getElementById("supplierDetailsModal").classList.remove("active");
}

// Create purchase order for supplier
function createPurchaseOrder(supplierId) {
  const supplier = supplierData.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  alert(
    `Creating purchase order for ${supplier.name}. This would open the purchase order form.`
  );
  closeSupplierDetailsModal();
}

// Edit supplier
function editSupplier(supplierId) {
  const supplier = supplierData.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  document.getElementById("modalTitle").textContent = "Edit Supplier";
  document.getElementById("supplierModal").classList.add("active");

  // Fill form with supplier data
  document.getElementById("supplierName").value = supplier.name;
  document.getElementById("supplierCode").value = supplier.code;
  document.getElementById("contactPerson").value = supplier.contactPerson;
  document.getElementById("contactTitle").value = supplier.contactTitle;
  document.getElementById("phone").value = supplier.phone;
  document.getElementById("email").value = supplier.email;
  document.getElementById("address").value = supplier.address;
  document.getElementById("city").value = supplier.city;
  document.getElementById("state").value = supplier.state;
  document.getElementById("zipCode").value = supplier.zipCode;
  document.getElementById("country").value = supplier.country;
  document.getElementById("taxId").value = supplier.taxId;
  document.getElementById("paymentTerms").value = supplier.paymentTerms;
  document.getElementById("supplierCategory").value = supplier.category;
  document.getElementById("productsSupplied").value =
    supplier.productsSupplied.join(", ");
  document.getElementById("notes").value = supplier.notes || "";

  // Store supplier ID for update
  document.getElementById("saveSupplierBtn").dataset.supplierId = supplierId;
}

// Delete supplier
function deleteSupplier(supplierId) {
  const supplier = supplierData.suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  if (
    !confirm(
      `Are you sure you want to delete supplier ${supplier.name}? This action cannot be undone.`
    )
  ) {
    return;
  }

  // Remove supplier from array
  supplierData.suppliers = supplierData.suppliers.filter(
    (s) => s.id !== supplierId
  );

  // Update overview stats
  updateOverviewStats();

  // Reload data
  loadSupplierData();

  // Show success message
  showNotification(
    `Supplier ${supplier.name} deleted successfully!`,
    "success"
  );
}

// Add new supplier
function addNewSupplier() {
  document.getElementById("modalTitle").textContent = "Add New Supplier";
  document.getElementById("supplierModal").classList.add("active");

  // Clear form
  document.getElementById("supplierForm").reset();

  // Set default country
  document.getElementById("country").value = "India";

  // Generate supplier code if empty
  const nextId = supplierData.suppliers.length + 1;
  document.getElementById("supplierCode").value = `SUP-${nextId
    .toString()
    .padStart(3, "0")}`;

  delete document.getElementById("saveSupplierBtn").dataset.supplierId;
}

// Save supplier (add or update)
function saveSupplier(event) {
  event.preventDefault();

  // Get form values
  const supplierName = document.getElementById("supplierName").value;
  const supplierCode = document.getElementById("supplierCode").value;
  const contactPerson = document.getElementById("contactPerson").value;
  const contactTitle = document.getElementById("contactTitle").value;
  const phone = document.getElementById("phone").value;
  const email = document.getElementById("email").value;
  const address = document.getElementById("address").value;
  const city = document.getElementById("city").value;
  const state = document.getElementById("state").value;
  const zipCode = document.getElementById("zipCode").value;
  const country = document.getElementById("country").value;
  const taxId = document.getElementById("taxId").value;
  const paymentTerms = document.getElementById("paymentTerms").value;
  const supplierCategory = document.getElementById("supplierCategory").value;
  const productsSupplied = document
    .getElementById("productsSupplied")
    .value.split(",")
    .map((p) => p.trim())
    .filter((p) => p);
  const notes = document.getElementById("notes").value;

  // Check if we're editing or adding
  const supplierId =
    document.getElementById("saveSupplierBtn").dataset.supplierId;

  if (supplierId) {
    // Update existing supplier
    const supplierIndex = supplierData.suppliers.findIndex(
      (s) => s.id === supplierId
    );
    if (supplierIndex !== -1) {
      supplierData.suppliers[supplierIndex] = {
        ...supplierData.suppliers[supplierIndex],
        name: supplierName,
        code: supplierCode,
        contactPerson: contactPerson,
        contactTitle: contactTitle,
        phone: phone,
        email: email,
        address: address,
        city: city,
        state: state,
        zipCode: zipCode,
        country: country,
        taxId: taxId,
        paymentTerms: paymentTerms,
        category: supplierCategory,
        productsSupplied: productsSupplied,
        notes: notes,
      };

      showNotification("Supplier updated successfully!", "success");
    }
  } else {
    // Add new supplier
    const newSupplier = {
      id:
        "SUP-" +
        (supplierData.suppliers.length + 1).toString().padStart(3, "0"),
      code: supplierCode,
      name: supplierName,
      contactPerson: contactPerson,
      contactTitle: contactTitle,
      phone: phone,
      email: email,
      address: address,
      city: city,
      state: state,
      zipCode: zipCode,
      country: country,
      taxId: taxId,
      paymentTerms: paymentTerms,
      category: supplierCategory,
      productsSupplied: productsSupplied,
      rating: 4.0, // Default rating
      status: "active",
      totalSpend: 0,
      totalOrders: 0,
      onTimeRate: 90, // Default on-time rate
      avgDeliveryTime: 3.0, // Default delivery time
      notes: notes,
      joinDate: new Date().toISOString().split("T")[0],
      lastOrder: null,
    };

    supplierData.suppliers.push(newSupplier);
    showNotification("Supplier added successfully!", "success");
  }

  // Close modal
  document.getElementById("supplierModal").classList.remove("active");

  // Reset form
  document.getElementById("supplierForm").reset();

  // Update overview stats and reload data
  updateOverviewStats();
  loadSupplierData();
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
  document.getElementById("listTab").style.display = "none";
  document.getElementById("cardsTab").style.display = "none";
  document.getElementById("topTab").style.display = "none";
  document.getElementById("needsTab").style.display = "none";

  // Show selected tab
  if (tabName === "list") {
    document.getElementById("listTab").style.display = "block";
  } else if (tabName === "cards") {
    document.getElementById("cardsTab").style.display = "grid";
    loadSupplierCards();
  } else if (tabName === "top") {
    document.getElementById("topTab").style.display = "block";
    loadTopSuppliersTable();
  } else if (tabName === "needs") {
    document.getElementById("needsTab").style.display = "block";
    loadNeedsAttentionTable();
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
    .getElementById("newSupplierBtn")
    .addEventListener("click", addNewSupplier);
  document
    .getElementById("importSuppliersBtn")
    .addEventListener("click", function () {
      alert(
        "Import Suppliers feature would allow importing suppliers from CSV/Excel."
      );
    });
  document
    .getElementById("exportSuppliersBtn")
    .addEventListener("click", function () {
      showNotification("Suppliers exported successfully!", "success");
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      // In a real app, this would filter the suppliers
      showNotification("Filters applied successfully!", "success");
    });

  // View all purchases button
  document
    .getElementById("viewAllPurchasesBtn")
    .addEventListener("click", function () {
      alert("This would show all purchase orders in a separate page.");
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
    .getElementById("closeSupplierModal")
    .addEventListener("click", function () {
      document.getElementById("supplierModal").classList.remove("active");
    });

  document
    .getElementById("closeSupplierDetailsModal")
    .addEventListener("click", closeSupplierDetailsModal);

  // Cancel supplier button
  document
    .getElementById("cancelSupplierBtn")
    .addEventListener("click", function () {
      document.getElementById("supplierModal").classList.remove("active");
    });

  // Form submission
  document
    .getElementById("supplierForm")
    .addEventListener("submit", saveSupplier);

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
