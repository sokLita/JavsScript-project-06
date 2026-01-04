document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize product data
  loadProducts();
  setupEventListeners();

  // Check if user has permission to add products
  if (userRole === "staff") {
    document.getElementById("addProductBtn").style.display = "none";
  }
});

// Sample product data
let products = [
  {
    id: "P001",
    name: "Wireless Bluetooth Headphones",
    sku: "WH-2023-001",
    category: "electronics",
    brand: "SoundMax",
    price: 89.99,
    cost: 45.5,
    stock: 45,
    minStock: 10,
    supplier: "supplier1",
    description:
      "High-quality wireless headphones with noise cancellation and 30-hour battery life.",
    image: "headphones.jpg",
    status: "in-stock",
  },
  {
    id: "P002",
    name: "Ergonomic Office Chair",
    sku: "OC-2023-002",
    category: "furniture",
    brand: "ComfortPro",
    price: 249.99,
    cost: 150.0,
    stock: 12,
    minStock: 5,
    supplier: "supplier2",
    description:
      "Adjustable office chair with lumbar support and breathable mesh back.",
    image: "office-chair.jpg",
    status: "in-stock",
  },
  {
    id: "P003",
    name: "Smart Fitness Watch",
    sku: "FW-2023-003",
    category: "electronics",
    brand: "FitTrack",
    price: 199.99,
    cost: 120.0,
    stock: 3,
    minStock: 10,
    supplier: "supplier1",
    description: "Waterproof fitness tracker with heart rate monitor and GPS.",
    image: "fitness-watch.jpg",
    status: "low-stock",
  },
  {
    id: "P004",
    name: "Desk Lamp with Wireless Charger",
    sku: "DL-2023-004",
    category: "home",
    brand: "LumiTech",
    price: 49.99,
    cost: 25.0,
    stock: 0,
    minStock: 15,
    supplier: "supplier3",
    description:
      "LED desk lamp with built-in wireless charging pad for smartphones.",
    image: "desk-lamp.jpg",
    status: "out-of-stock",
  },
  {
    id: "P005",
    name: "Premium Notebook Set",
    sku: "NS-2023-005",
    category: "stationery",
    brand: "PaperCraft",
    price: 24.99,
    cost: 12.5,
    stock: 120,
    minStock: 30,
    supplier: "supplier4",
    description: "Set of 3 premium hardcover notebooks with dotted pages.",
    image: "notebooks.jpg",
    status: "in-stock",
  },
  {
    id: "P006",
    name: "Wireless Gaming Mouse",
    sku: "GM-2023-006",
    category: "electronics",
    brand: "GamePro",
    price: 79.99,
    cost: 40.0,
    stock: 5,
    minStock: 10,
    supplier: "supplier1",
    description: "High-precision wireless gaming mouse with RGB lighting.",
    image: "gaming-mouse.jpg",
    status: "low-stock",
  },
  {
    id: "P007",
    name: "Stainless Steel Water Bottle",
    sku: "WB-2023-007",
    category: "sports",
    brand: "HydroFlow",
    price: 29.99,
    cost: 15.0,
    stock: 65,
    minStock: 20,
    supplier: "supplier3",
    description:
      "Insulated stainless steel water bottle, keeps drinks cold for 24 hours.",
    image: "water-bottle.jpg",
    status: "in-stock",
  },
  {
    id: "P008",
    name: "Bluetooth Portable Speaker",
    sku: "BS-2023-008",
    category: "electronics",
    brand: "SoundWave",
    price: 59.99,
    cost: 30.0,
    stock: 18,
    minStock: 10,
    supplier: "supplier1",
    description:
      "Compact waterproof Bluetooth speaker with 12-hour battery life.",
    image: "speaker.jpg",
    status: "in-stock",
  },
];

// Current page for pagination
let currentPage = 1;
const itemsPerPage = 8;
let filteredProducts = [...products];

// Load products into the grid and table
function loadProducts() {
  // Calculate statistics
  updateStatistics();

  // Render products in grid view
  renderGridProducts();

  // Render products in table view
  renderTableProducts();

  // Render pagination
  renderPagination();
}

// Update statistics
function updateStatistics() {
  const total = products.length;
  const inStock = products.filter((p) => p.status === "in-stock").length;
  const lowStock = products.filter((p) => p.status === "low-stock").length;
  const outOfStock = products.filter((p) => p.status === "out-of-stock").length;

  document.getElementById("totalProducts").textContent = total;
  document.getElementById("inStockProducts").textContent = inStock;
  document.getElementById("lowStockProducts").textContent = lowStock;
  document.getElementById("outOfStockProducts").textContent = outOfStock;
}

// Render products in grid view
function renderGridProducts() {
  const productsGrid = document.getElementById("productsGrid");
  productsGrid.innerHTML = "";

  // Get products for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);

  if (pageProducts.length === 0) {
    productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #7f8c8d;">
                        <i class="fas fa-box-open" style="font-size: 60px; margin-bottom: 20px;"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters</p>
                    </div>
                `;
    return;
  }

  pageProducts.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  // Determine badge class based on status
  let badgeClass = "";
  let badgeText = "";
  if (product.status === "in-stock") {
    badgeClass = "badge-instock";
    badgeText = "In Stock";
  } else if (product.status === "low-stock") {
    badgeClass = "badge-lowstock";
    badgeText = "Low Stock";
  } else {
    badgeClass = "badge-outstock";
    badgeText = "Out of Stock";
  }

  // Determine stock class
  let stockClass = "";
  if (product.status === "in-stock") {
    stockClass = "stock-instock";
  } else if (product.status === "low-stock") {
    stockClass = "stock-lowstock";
  } else {
    stockClass = "stock-outstock";
  }

  card.innerHTML = `
                <div class="product-image">
                    <i class="fas fa-box" style="font-size: 60px; color: #bdc3c7;"></i>
                    <div class="product-badge ${badgeClass}">${badgeText}</div>
                </div>
                <div class="product-details">
                    <div class="product-category">${getCategoryName(
                      product.category
                    )}</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <div class="product-meta">
                        <div class="product-price">$${product.price.toFixed(
                          2
                        )}</div>
                        <div class="product-stock ${stockClass}">${
    product.stock
  } units</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary" onclick="viewProductDetails('${
                          product.id
                        }')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-warning" onclick="editProduct('${
                          product.id
                        }')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteProduct('${
                          product.id
                        }')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

  return card;
}

// Render products in table view
function renderTableProducts() {
  const tableBody = document.getElementById("productsTable");
  tableBody.innerHTML = "";

  // Get products for current page
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const pageProducts = filteredProducts.slice(startIndex, endIndex);

  pageProducts.forEach((product) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusBadge = "";
    if (product.status === "in-stock") {
      statusBadge =
        '<span class="badge-instock" style="padding: 5px 10px; border-radius: 20px; font-size: 12px;">In Stock</span>';
    } else if (product.status === "low-stock") {
      statusBadge =
        '<span class="badge-lowstock" style="padding: 5px 10px; border-radius: 20px; font-size: 12px;">Low Stock</span>';
    } else {
      statusBadge =
        '<span class="badge-outstock" style="padding: 5px 10px; border-radius: 20px; font-size: 12px;">Out of Stock</span>';
    }

    row.innerHTML = `
                    <td>${product.sku}</td>
                    <td><strong>${product.name}</strong></td>
                    <td>${getCategoryName(product.category)}</td>
                    <td>$${product.price.toFixed(2)}</td>
                    <td>${product.stock}</td>
                    <td>${statusBadge}</td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewProductDetails('${
                          product.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editProduct('${
                          product.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteProduct('${
                          product.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

// Render pagination
function renderPagination() {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

  if (totalPages <= 1) return;

  // Previous button
  const prevBtn = document.createElement("button");
  prevBtn.className = "page-btn";
  prevBtn.innerHTML = '<i class="fas fa-chevron-left"></i>';
  prevBtn.disabled = currentPage === 1;
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      loadProducts();
    }
  };
  pagination.appendChild(prevBtn);

  // Page buttons
  for (let i = 1; i <= totalPages; i++) {
    const pageBtn = document.createElement("button");
    pageBtn.className = `page-btn ${i === currentPage ? "active" : ""}`;
    pageBtn.textContent = i;
    pageBtn.onclick = () => {
      currentPage = i;
      loadProducts();
    };
    pagination.appendChild(pageBtn);
  }

  // Next button
  const nextBtn = document.createElement("button");
  nextBtn.className = "page-btn";
  nextBtn.innerHTML = '<i class="fas fa-chevron-right"></i>';
  nextBtn.disabled = currentPage === totalPages;
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      loadProducts();
    }
  };
  pagination.appendChild(nextBtn);
}

// Get category name from value
function getCategoryName(categoryValue) {
  const categories = {
    electronics: "Electronics",
    furniture: "Furniture",
    clothing: "Clothing",
    home: "Home & Kitchen",
    sports: "Sports & Outdoors",
    stationery: "Stationery",
    books: "Books & Media",
    beauty: "Beauty & Personal Care",
    toys: "Toys & Games",
  };
  return categories[categoryValue] || categoryValue;
}

// Filter and search products
function filterProducts() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;
  const stockFilter = document.getElementById("stockFilter").value;
  const sortFilter = document.getElementById("sortFilter").value;

  filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      product.description.toLowerCase().includes(searchTerm) ||
      getCategoryName(product.category).toLowerCase().includes(searchTerm);

    // Category filter
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;

    // Stock filter
    let matchesStock = true;
    if (stockFilter === "in-stock") {
      matchesStock = product.status === "in-stock";
    } else if (stockFilter === "low-stock") {
      matchesStock = product.status === "low-stock";
    } else if (stockFilter === "out-of-stock") {
      matchesStock = product.status === "out-of-stock";
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Sort products
  sortProducts(sortFilter);

  // Reset to first page
  currentPage = 1;

  // Reload products
  loadProducts();
}

// Sort products based on selected option
function sortProducts(sortOption) {
  filteredProducts.sort((a, b) => {
    switch (sortOption) {
      case "name-asc":
        return a.name.localeCompare(b.name);
      case "name-desc":
        return b.name.localeCompare(a.name);
      case "price-asc":
        return a.price - b.price;
      case "price-desc":
        return b.price - a.price;
      case "stock-asc":
        return a.stock - b.stock;
      case "stock-desc":
        return b.stock - a.stock;
      default:
        return 0;
    }
  });
}

// View product details
function viewProductDetails(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("detailsModalTitle").textContent = product.name;

  // Determine status text and class
  let statusText = "";
  let statusClass = "";
  if (product.status === "in-stock") {
    statusText = "In Stock";
    statusClass = "badge-instock";
  } else if (product.status === "low-stock") {
    statusText = "Low Stock";
    statusClass = "badge-lowstock";
  } else {
    statusText = "Out of Stock";
    statusClass = "badge-outstock";
  }

  // Get supplier name
  const supplierName = getSupplierName(product.supplier);

  const detailsContent = document.getElementById("productDetailsContent");
  detailsContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-bottom: 30px;">
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 20px; display: flex; align-items: center; justify-content: center;">
                        <i class="fas fa-box" style="font-size: 80px; color: #bdc3c7;"></i>
                    </div>
                    <div>
                        <h3 style="margin-bottom: 10px;">${product.name}</h3>
                        <div style="display: flex; align-items: center; gap: 15px; margin-bottom: 20px;">
                            <span class="${statusClass}" style="padding: 5px 15px; border-radius: 20px; font-size: 14px;">${statusText}</span>
                            <span style="color: #7f8c8d;">SKU: ${
                              product.sku
                            }</span>
                        </div>
                        <div style="font-size: 28px; font-weight: 700; color: var(--primary-color); margin-bottom: 20px;">
                            $${product.price.toFixed(2)}
                        </div>
                        <div style="display: flex; gap: 30px; margin-bottom: 20px;">
                            <div>
                                <div style="font-size: 12px; color: #7f8c8d;">Brand</div>
                                <div style="font-weight: 600;">${
                                  product.brand || "Not specified"
                                }</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #7f8c8d;">Category</div>
                                <div style="font-weight: 600;">${getCategoryName(
                                  product.category
                                )}</div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #7f8c8d;">Stock</div>
                                <div style="font-weight: 600;">${
                                  product.stock
                                } units</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 10px;">Product Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Cost Price:</td>
                                <td style="padding: 8px 0; font-weight: 600;">$${
                                  product.cost ? product.cost.toFixed(2) : "N/A"
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Profit Margin:</td>
                                <td style="padding: 8px 0; font-weight: 600; color: var(--success-color);">
                                    ${
                                      product.cost
                                        ? (
                                            ((product.price - product.cost) /
                                              product.cost) *
                                            100
                                          ).toFixed(1) + "%"
                                        : "N/A"
                                    }
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Minimum Stock:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  product.minStock
                                } units</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Supplier:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${supplierName}</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 10px;">Stock Status</h4>
                        <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
                            <div style="margin-bottom: 10px;">
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Current Stock</span>
                                    <span style="font-weight: 600;">${
                                      product.stock
                                    } units</span>
                                </div>
                                <div style="height: 10px; background: #e1e8ed; border-radius: 5px; overflow: hidden;">
                                    <div style="height: 100%; background: var(--secondary-color); width: ${Math.min(
                                      (product.stock / 100) * 100,
                                      100
                                    )}%;"></div>
                                </div>
                            </div>
                            <div>
                                <div style="display: flex; justify-content: space-between; margin-bottom: 5px;">
                                    <span>Minimum Required</span>
                                    <span style="font-weight: 600;">${
                                      product.minStock
                                    } units</span>
                                </div>
                                <div style="height: 10px; background: #e1e8ed; border-radius: 5px; overflow: hidden;">
                                    <div style="height: 100%; background: ${
                                      product.stock > product.minStock
                                        ? "var(--success-color)"
                                        : "var(--warning-color)"
                                    }; width: ${Math.min(
    (product.minStock / 100) * 100,
    100
  )}%;"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 10px;">Description</h4>
                    <p style="color: #7f8c8d; line-height: 1.6;">${
                      product.description
                    }</p>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closeProductDetailsModal()">Close</button>
                    <button class="btn btn-warning" onclick="editProduct('${
                      product.id
                    }')">
                        <i class="fas fa-edit"></i> Edit Product
                    </button>
                </div>
            `;

  document.getElementById("productDetailsModal").classList.add("active");
}

// Close product details modal
function closeProductDetailsModal() {
  document.getElementById("productDetailsModal").classList.remove("active");
}

// Get supplier name from value
function getSupplierName(supplierValue) {
  const suppliers = {
    supplier1: "Supplier ABC",
    supplier2: "Supplier XYZ",
    supplier3: "Global Supplies Inc.",
    supplier4: "Prime Distributors",
  };
  return suppliers[supplierValue] || supplierValue;
}

// Edit product
function editProduct(productId) {
  const product = products.find((p) => p.id === productId);
  if (!product) return;

  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("productModal").classList.add("active");

  // Fill form with product data
  document.getElementById("productName").value = product.name;
  document.getElementById("productSku").value = product.sku;
  document.getElementById("productCategory").value = product.category;
  document.getElementById("productBrand").value = product.brand || "";
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCost").value = product.cost || "";
  document.getElementById("productStock").value = product.stock;
  document.getElementById("productMinStock").value = product.minStock;
  document.getElementById("productSupplier").value = product.supplier || "";
  document.getElementById("productDescription").value =
    product.description || "";

  // Store product ID for update
  document.getElementById("saveProductBtn").dataset.productId = productId;
}

// Delete product
function deleteProduct(productId) {
  if (
    !confirm(
      "Are you sure you want to delete this product? This action cannot be undone."
    )
  ) {
    return;
  }

  // Remove product from array
  products = products.filter((p) => p.id !== productId);

  // Update filtered products
  filterProducts();

  // Show success message
  showNotification("Product deleted successfully!", "success");
}

// Add new product
function addNewProduct() {
  document.getElementById("modalTitle").textContent = "Add New Product";
  document.getElementById("productModal").classList.add("active");

  // Clear form
  document.getElementById("productForm").reset();
  delete document.getElementById("saveProductBtn").dataset.productId;
}

// Save product (add or update)
function saveProduct(event) {
  event.preventDefault();

  // Get form values
  const productName = document.getElementById("productName").value;
  const productSku = document.getElementById("productSku").value;
  const productCategory = document.getElementById("productCategory").value;
  const productBrand = document.getElementById("productBrand").value;
  const productPrice = parseFloat(
    document.getElementById("productPrice").value
  );
  const productCost = document.getElementById("productCost").value
    ? parseFloat(document.getElementById("productCost").value)
    : null;
  const productStock = parseInt(document.getElementById("productStock").value);
  const productMinStock = parseInt(
    document.getElementById("productMinStock").value
  );
  const productSupplier = document.getElementById("productSupplier").value;
  const productDescription =
    document.getElementById("productDescription").value;

  // Determine stock status
  let status = "in-stock";
  if (productStock === 0) {
    status = "out-of-stock";
  } else if (productStock <= productMinStock) {
    status = "low-stock";
  }

  // Check if we're editing or adding
  const productId = document.getElementById("saveProductBtn").dataset.productId;

  if (productId) {
    // Update existing product
    const productIndex = products.findIndex((p) => p.id === productId);
    if (productIndex !== -1) {
      products[productIndex] = {
        ...products[productIndex],
        name: productName,
        sku: productSku,
        category: productCategory,
        brand: productBrand,
        price: productPrice,
        cost: productCost,
        stock: productStock,
        minStock: productMinStock,
        supplier: productSupplier,
        description: productDescription,
        status: status,
      };

      showNotification("Product updated successfully!", "success");
    }
  } else {
    // Add new product
    const newProduct = {
      id: "P" + (products.length + 1).toString().padStart(3, "0"),
      name: productName,
      sku: productSku,
      category: productCategory,
      brand: productBrand,
      price: productPrice,
      cost: productCost,
      stock: productStock,
      minStock: productMinStock,
      supplier: productSupplier,
      description: productDescription,
      image: "default-product.jpg",
      status: status,
    };

    products.push(newProduct);
    showNotification("Product added successfully!", "success");
  }

  // Close modal
  document.getElementById("productModal").classList.remove("active");

  // Reset form
  document.getElementById("productForm").reset();

  // Update products list
  filterProducts();
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

  // View toggle buttons
  document.getElementById("gridViewBtn").addEventListener("click", function () {
    document.getElementById("gridViewBtn").classList.add("active");
    document.getElementById("tableViewBtn").classList.remove("active");
    document.getElementById("gridView").classList.add("active");
    document.getElementById("tableView").classList.remove("active");
  });

  document
    .getElementById("tableViewBtn")
    .addEventListener("click", function () {
      document.getElementById("tableViewBtn").classList.add("active");
      document.getElementById("gridViewBtn").classList.remove("active");
      document.getElementById("tableView").classList.add("active");
      document.getElementById("gridView").classList.remove("active");
    });

  // Search and filter events
  document
    .getElementById("searchInput")
    .addEventListener("input", filterProducts);
  document
    .getElementById("categoryFilter")
    .addEventListener("change", filterProducts);
  document
    .getElementById("stockFilter")
    .addEventListener("change", filterProducts);
  document
    .getElementById("sortFilter")
    .addEventListener("change", filterProducts);

  // Add product button
  document
    .getElementById("addProductBtn")
    .addEventListener("click", addNewProduct);

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("productModal").classList.remove("active");
  });

  document
    .getElementById("closeDetailsModal")
    .addEventListener("click", closeProductDetailsModal);

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("productModal").classList.remove("active");
  });

  // Product form submission
  document
    .getElementById("productForm")
    .addEventListener("submit", saveProduct);

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
    window.location.href = "sign-up.html";
  }
}
