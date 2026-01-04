// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load products
  loadProducts();
  setupEventListeners();

  // Check role for permissions
  if (currentUser.role === "staff") {
    document.getElementById("addProductBtn").style.display = "none";
  }
});

// Load products from localStorage
function loadProducts() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const products = systemData?.products || [];
  const categories = systemData?.categories || [];
  const suppliers = systemData?.suppliers || [];

  // Populate category filter
  populateCategoryFilter(categories);

  // Populate supplier dropdown
  populateSupplierDropdown(suppliers);

  // Populate category dropdown in modal
  populateCategoryDropdown(categories);

  // Display products
  displayProducts(products);
}

// Populate category filter
function populateCategoryFilter(categories) {
  const categoryFilter = document.getElementById("categoryFilter");
  categoryFilter.innerHTML = '<option value="">All Categories</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categoryFilter.appendChild(option);
  });
}

// Populate category dropdown
function populateCategoryDropdown(categories) {
  const categorySelect = document.getElementById("productCategory");
  categorySelect.innerHTML = '<option value="">Select Category</option>';

  categories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.name;
    option.textContent = category.name;
    categorySelect.appendChild(option);
  });
}

// Populate supplier dropdown
function populateSupplierDropdown(suppliers) {
  const supplierSelect = document.getElementById("productSupplier");
  supplierSelect.innerHTML = '<option value="">Select Supplier</option>';

  suppliers.forEach((supplier) => {
    const option = document.createElement("option");
    option.value = supplier.id;
    option.textContent = supplier.name;
    supplierSelect.appendChild(option);
  });
}

// Display products in grid
function displayProducts(products) {
  const productsGrid = document.getElementById("productsGrid");
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const categoryFilter = document.getElementById("categoryFilter").value;
  const stockFilter = document.getElementById("stockFilter").value;

  // Filter products
  let filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      product.name.toLowerCase().includes(searchTerm) ||
      product.sku.toLowerCase().includes(searchTerm) ||
      (product.description &&
        product.description.toLowerCase().includes(searchTerm));

    // Category filter
    const matchesCategory =
      !categoryFilter || product.category === categoryFilter;

    // Stock filter
    let matchesStock = true;
    if (stockFilter === "in-stock") {
      matchesStock = product.currentStock > product.minStock;
    } else if (stockFilter === "low-stock") {
      matchesStock =
        product.currentStock <= product.minStock && product.currentStock > 0;
    } else if (stockFilter === "out-of-stock") {
      matchesStock = product.currentStock === 0;
    }

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Display products
  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #7f8c8d;">
                        <i class="fas fa-box-open" style="font-size: 60px; margin-bottom: 20px;"></i>
                        <h3>No products found</h3>
                        <p>Try adjusting your search or filters</p>
                        ${
                          products.length === 0
                            ? '<button class="btn btn-primary" id="addFirstProductBtn" style="margin-top: 20px;"><i class="fas fa-plus"></i> Add Your First Product</button>'
                            : ""
                        }
                    </div>
                `;

    if (products.length === 0) {
      document
        .getElementById("addFirstProductBtn")
        ?.addEventListener("click", () => {
          document.getElementById("addProductBtn").click();
        });
    }
    return;
  }

  productsGrid.innerHTML = "";

  filteredProducts.forEach((product) => {
    const productCard = createProductCard(product);
    productsGrid.appendChild(productCard);
  });
}

// Create product card element
function createProductCard(product) {
  const card = document.createElement("div");
  card.className = "product-card";

  // Determine stock status
  let badgeClass = "";
  let badgeText = "";
  let stockClass = "";

  if (product.currentStock === 0) {
    badgeClass = "badge-outstock";
    badgeText = "Out of Stock";
    stockClass = "stock-outstock";
  } else if (product.currentStock <= product.minStock) {
    badgeClass = "badge-lowstock";
    badgeText = "Low Stock";
    stockClass = "stock-lowstock";
  } else {
    badgeClass = "badge-instock";
    badgeText = "In Stock";
    stockClass = "stock-instock";
  }

  card.innerHTML = `
                <div class="product-image" style="position: relative;">
                    <i class="fas fa-box" style="font-size: 60px; color: #bdc3c7;"></i>
                    <div class="product-badge ${badgeClass}">${badgeText}</div>
                </div>
                <div class="product-details">
                    <div style="font-size: 12px; color: #3498db; font-weight: 600; margin-bottom: 5px;">${
                      product.category || "Uncategorized"
                    }</div>
                    <h3 class="product-name">${product.name}</h3>
                    <p style="color: #7f8c8d; font-size: 14px; margin-bottom: 15px; min-height: 40px;">${
                      product.description || "No description available"
                    }</p>
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                        <div class="product-price">₹${product.price.toFixed(
                          2
                        )}</div>
                        <div class="product-stock ${stockClass}">${
    product.currentStock
  } units</div>
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary" style="flex: 1; padding: 8px 12px; font-size: 13px;" onclick="editProduct(${
                          product.id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" style="flex: 1; padding: 8px 12px; font-size: 13px;" onclick="deleteProduct(${
                          product.id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

  return card;
}

// Edit product
function editProduct(productId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const product = systemData.products.find((p) => p.id === productId);

  if (!product) return;

  document.getElementById("modalTitle").textContent = "Edit Product";
  document.getElementById("productModal").classList.add("active");

  // Fill form with product data
  document.getElementById("productName").value = product.name;
  document.getElementById("productSku").value = product.sku;
  document.getElementById("productCategory").value = product.category || "";
  document.getElementById("productBrand").value = product.brand || "";
  document.getElementById("productPrice").value = product.price;
  document.getElementById("productCost").value = product.cost || "";
  document.getElementById("productStock").value = product.currentStock;
  document.getElementById("productMinStock").value = product.minStock || 10;
  document.getElementById("productMaxStock").value = product.maxStock || "";
  document.getElementById("productSupplier").value = product.supplierId || "";
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

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  systemData.products = systemData.products.filter((p) => p.id !== productId);

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Show notification
  showNotification("Product deleted successfully!", "success");

  // Reload products
  loadProducts();
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
  const productMaxStock = document.getElementById("productMaxStock").value
    ? parseInt(document.getElementById("productMaxStock").value)
    : null;
  const productSupplier = document.getElementById("productSupplier").value
    ? parseInt(document.getElementById("productSupplier").value)
    : null;
  const productDescription =
    document.getElementById("productDescription").value;

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check if we're editing or adding
  const productId = document.getElementById("saveProductBtn").dataset.productId;

  if (productId) {
    // Update existing product
    const productIndex = systemData.products.findIndex(
      (p) => p.id === parseInt(productId)
    );
    if (productIndex !== -1) {
      systemData.products[productIndex] = {
        ...systemData.products[productIndex],
        name: productName,
        sku: productSku,
        category: productCategory,
        brand: productBrand,
        price: productPrice,
        cost: productCost,
        currentStock: productStock,
        minStock: productMinStock,
        maxStock: productMaxStock,
        supplierId: productSupplier,
        description: productDescription,
      };

      showNotification("Product updated successfully!", "success");
    }
  } else {
    // Add new product
    const newProduct = {
      id: generateId(systemData.products),
      name: productName,
      sku: productSku,
      category: productCategory,
      brand: productBrand,
      price: productPrice,
      cost: productCost,
      currentStock: productStock,
      minStock: productMinStock,
      maxStock: productMaxStock,
      supplierId: productSupplier,
      description: productDescription,
      status: "active",
      createdAt: new Date().toISOString(),
    };

    systemData.products.push(newProduct);
    showNotification("Product added successfully!", "success");
  }

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("productModal").classList.remove("active");
  document.getElementById("productForm").reset();
  delete document.getElementById("saveProductBtn").dataset.productId;

  // Reload products
  loadProducts();
}

// Generate unique ID
function generateId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
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

  // Add product button
  document
    .getElementById("addProductBtn")
    .addEventListener("click", function () {
      document.getElementById("modalTitle").textContent = "Add New Product";
      document.getElementById("productModal").classList.add("active");
      document.getElementById("productForm").reset();
      delete document.getElementById("saveProductBtn").dataset.productId;
    });

  // Search and filter events
  document
    .getElementById("searchInput")
    .addEventListener("input", () => loadProducts());
  document
    .getElementById("categoryFilter")
    .addEventListener("change", () => loadProducts());
  document
    .getElementById("stockFilter")
    .addEventListener("change", () => loadProducts());

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("productModal").classList.remove("active");
  });

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("productModal").classList.remove("active");
  });

  // Product form submission
  document
    .getElementById("productForm")
    .addEventListener("submit", saveProduct);

  // Close modal when clicking outside
  window.addEventListener("click", function (e) {
    if (e.target.classList.contains("modal")) {
      e.target.classList.remove("active");
    }
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
    window.location.href = "login.html";
  }
}

// Add sample products if empty
function addSampleProductsIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (systemData.products.length === 0) {
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

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
    loadProducts();
  }
}

// Call this function on first load
addSampleProductsIfEmpty();
