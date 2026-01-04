// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load categories
  loadCategories();
  setupEventListeners();
  setupColorOptions();

  // Check role for permissions
  if (currentUser.role === "staff") {
    document.getElementById("addCategoryBtn").style.display = "none";
  }
});

// Available colors for categories
const categoryColors = [
  { name: "Blue", value: "#3498db", class: "electronics" },
  { name: "Purple", value: "#9b59b6", class: "furniture" },
  { name: "Red", value: "#e74c3c", class: "clothing" },
  { name: "Orange", value: "#f39c12", class: "home" },
  { name: "Green", value: "#27ae60", class: "sports" },
  { name: "Teal", value: "#1abc9c", class: "teal" },
  { name: "Navy", value: "#2c3e50", class: "navy" },
  { name: "Yellow", value: "#f1c40f", class: "yellow" },
];

// Icon mapping
const iconMapping = {
  tag: "fas fa-tag",
  mobile: "fas fa-mobile-alt",
  laptop: "fas fa-laptop",
  tshirt: "fas fa-tshirt",
  chair: "fas fa-chair",
  utensils: "fas fa-utensils",
  dumbbell: "fas fa-dumbbell",
  book: "fas fa-book",
  car: "fas fa-car",
  tools: "fas fa-tools",
  heart: "fas fa-heart",
  gamepad: "fas fa-gamepad",
};

// Load categories from localStorage
function loadCategories() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const categories = systemData?.categories || [];
  const products = systemData?.products || [];

  // Update statistics
  updateStatistics(categories, products);

  // Display categories
  displayCategories(categories, products);
}

// Update statistics
function updateStatistics(categories, products) {
  const totalCategories = categories.length;
  const totalProducts = products.length;

  // Calculate products per category
  let largestCategoryCount = 0;
  let largestCategoryName = "None";
  let emptyCategories = 0;

  categories.forEach((category) => {
    const categoryProducts = products.filter(
      (p) => p.category === category.name
    ).length;
    if (categoryProducts > largestCategoryCount) {
      largestCategoryCount = categoryProducts;
      largestCategoryName = category.name;
    }
    if (categoryProducts === 0) {
      emptyCategories++;
    }
  });

  // Update UI
  document.getElementById("totalCategories").textContent = totalCategories;
  document.getElementById("totalProductsInCategories").textContent =
    totalProducts;
  document.getElementById("largestCategory").textContent = largestCategoryName;
  document.getElementById("emptyCategories").textContent = emptyCategories;
}

// Display categories in grid
function displayCategories(categories, products) {
  const categoriesGrid = document.getElementById("categoriesGrid");

  if (categories.length === 0) {
    categoriesGrid.innerHTML = `
                    <div class="empty-state">
                        <div class="empty-icon">
                            <i class="fas fa-tags"></i>
                        </div>
                        <h3 style="margin-bottom: 10px; color: var(--primary-color);">No Categories Found</h3>
                        <p style="color: #7f8c8d; margin-bottom: 20px;">Get started by creating your first product category</p>
                        <button class="btn btn-primary" id="createFirstCategoryBtn">
                            <i class="fas fa-plus"></i> Create Your First Category
                        </button>
                    </div>
                `;

    document
      .getElementById("createFirstCategoryBtn")
      ?.addEventListener("click", () => {
        document.getElementById("addCategoryBtn").click();
      });
    return;
  }

  categoriesGrid.innerHTML = "";

  categories.forEach((category) => {
    // Count products in this category
    const productCount = products.filter(
      (p) => p.category === category.name
    ).length;

    // Get color class
    const colorClass = getColorClass(category.color);

    // Get icon
    const iconClass = iconMapping[category.icon] || "fas fa-tag";

    const categoryCard = document.createElement("div");
    categoryCard.className = `category-card ${colorClass}`;
    categoryCard.innerHTML = `
                    <div class="category-header">
                        <div>
                            <div class="category-icon">
                                <i class="${iconClass}"></i>
                            </div>
                            <h3 class="category-name">${category.name}</h3>
                        </div>
                        <div class="category-actions">
                            <button class="btn btn-warning btn-sm" onclick="editCategory(${
                              category.id
                            })" style="padding: 8px 12px; font-size: 13px;">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-danger btn-sm" onclick="deleteCategory(${
                              category.id
                            })" style="padding: 8px 12px; font-size: 13px;">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <p class="category-description">${
                      category.description || "No description provided"
                    }</p>
                    
                    <div class="category-meta">
                        <div class="category-count">
                            <div>
                                <div class="count-number">${productCount}</div>
                                <div class="product-count">Products</div>
                            </div>
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d;">
                            Created: ${formatDate(category.createdAt)}
                        </div>
                    </div>
                `;

    categoriesGrid.appendChild(categoryCard);
  });
}

// Get color class from hex value
function getColorClass(colorHex) {
  const color = categoryColors.find((c) => c.value === colorHex);
  return color ? color.class : "electronics";
}

// Format date
function formatDate(dateString) {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Setup color options
function setupColorOptions() {
  const colorOptions = document.getElementById("colorOptions");
  colorOptions.innerHTML = "";

  categoryColors.forEach((color, index) => {
    const colorOption = document.createElement("div");
    colorOption.className = `color-option ${index === 0 ? "selected" : ""}`;
    colorOption.style.backgroundColor = color.value;
    colorOption.title = color.name;
    colorOption.innerHTML = index === 0 ? '<i class="fas fa-check"></i>' : "";
    colorOption.dataset.color = color.value;

    colorOption.addEventListener("click", function () {
      // Remove selected from all options
      document.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("selected");
        opt.innerHTML = "";
      });

      // Add selected to clicked option
      this.classList.add("selected");
      this.innerHTML = '<i class="fas fa-check"></i>';

      // Update hidden input
      document.getElementById("categoryColor").value = this.dataset.color;
    });

    colorOptions.appendChild(colorOption);
  });
}

// Add new category
function addCategory() {
  document.getElementById("modalTitle").textContent = "Add New Category";
  document.getElementById("categoryModal").classList.add("active");
  document.getElementById("categoryForm").reset();

  // Reset color selection
  document.querySelectorAll(".color-option").forEach((opt, index) => {
    opt.classList.remove("selected");
    opt.innerHTML = "";
    if (index === 0) {
      opt.classList.add("selected");
      opt.innerHTML = '<i class="fas fa-check"></i>';
    }
  });
  document.getElementById("categoryColor").value = "#3498db";

  delete document.getElementById("saveCategoryBtn").dataset.categoryId;
}

// Edit category
function editCategory(categoryId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const category = systemData.categories.find((c) => c.id === categoryId);

  if (!category) return;

  document.getElementById("modalTitle").textContent = "Edit Category";
  document.getElementById("categoryModal").classList.add("active");

  // Fill form with category data
  document.getElementById("categoryName").value = category.name;
  document.getElementById("categoryDescription").value =
    category.description || "";
  document.getElementById("categoryIcon").value = category.icon || "tag";
  document.getElementById("categoryColor").value = category.color || "#3498db";

  // Update color selection
  document.querySelectorAll(".color-option").forEach((opt) => {
    opt.classList.remove("selected");
    opt.innerHTML = "";
    if (opt.dataset.color === (category.color || "#3498db")) {
      opt.classList.add("selected");
      opt.innerHTML = '<i class="fas fa-check"></i>';
    }
  });

  // Store category ID for update
  document.getElementById("saveCategoryBtn").dataset.categoryId = categoryId;
}

// Delete category
function deleteCategory(categoryId) {
  if (
    !confirm(
      "Are you sure you want to delete this category? Products in this category will become uncategorized."
    )
  ) {
    return;
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check if category has products
  const category = systemData.categories.find((c) => c.id === categoryId);
  const productsInCategory = systemData.products.filter(
    (p) => p.category === category?.name
  ).length;

  if (productsInCategory > 0) {
    if (
      !confirm(
        `This category contains ${productsInCategory} product(s). They will become uncategorized. Continue?`
      )
    ) {
      return;
    }
  }

  // Remove category
  systemData.categories = systemData.categories.filter(
    (c) => c.id !== categoryId
  );

  // Update products that belonged to this category
  systemData.products.forEach((product) => {
    if (product.category === category?.name) {
      product.category = "";
    }
  });

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Show notification
  showNotification("Category deleted successfully!", "success");

  // Reload categories
  loadCategories();
}

// Save category (add or update)
function saveCategory(event) {
  event.preventDefault();

  // Get form values
  const categoryName = document.getElementById("categoryName").value;
  const categoryDescription = document.getElementById(
    "categoryDescription"
  ).value;
  const categoryIcon = document.getElementById("categoryIcon").value;
  const categoryColor = document.getElementById("categoryColor").value;

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check if category name already exists (for new categories)
  const categoryId =
    document.getElementById("saveCategoryBtn").dataset.categoryId;

  if (!categoryId) {
    // Check if category name already exists
    const existingCategory = systemData.categories.find(
      (c) => c.name.toLowerCase() === categoryName.toLowerCase()
    );
    if (existingCategory) {
      showNotification("A category with this name already exists!", "error");
      return;
    }
  }

  if (categoryId) {
    // Update existing category
    const categoryIndex = systemData.categories.findIndex(
      (c) => c.id === parseInt(categoryId)
    );
    if (categoryIndex !== -1) {
      const oldCategoryName = systemData.categories[categoryIndex].name;

      systemData.categories[categoryIndex] = {
        ...systemData.categories[categoryIndex],
        name: categoryName,
        description: categoryDescription,
        icon: categoryIcon,
        color: categoryColor,
        updatedAt: new Date().toISOString(),
      };

      // Update products that belonged to the old category name
      systemData.products.forEach((product) => {
        if (product.category === oldCategoryName) {
          product.category = categoryName;
        }
      });

      showNotification("Category updated successfully!", "success");
    }
  } else {
    // Add new category
    const newCategory = {
      id: generateId(systemData.categories),
      name: categoryName,
      description: categoryDescription,
      icon: categoryIcon,
      color: categoryColor,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    systemData.categories.push(newCategory);
    showNotification("Category added successfully!", "success");
  }

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("categoryModal").classList.remove("active");
  document.getElementById("categoryForm").reset();
  delete document.getElementById("saveCategoryBtn").dataset.categoryId;

  // Reload categories
  loadCategories();
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

  // Add category button
  document
    .getElementById("addCategoryBtn")
    .addEventListener("click", addCategory);

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("categoryModal").classList.remove("active");
  });

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("categoryModal").classList.remove("active");
  });

  // Category form submission
  document
    .getElementById("categoryForm")
    .addEventListener("submit", saveCategory);

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

// Add sample categories if empty
function addSampleCategoriesIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (systemData.categories.length === 0) {
    systemData.categories = [
      {
        id: 1,
        name: "Electronics",
        description: "Electronic devices and accessories",
        icon: "mobile",
        color: "#3498db",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Furniture",
        description: "Office and home furniture",
        icon: "chair",
        color: "#9b59b6",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 3,
        name: "Clothing",
        description: "Apparel and clothing items",
        icon: "tshirt",
        color: "#e74c3c",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 4,
        name: "Home & Kitchen",
        description: "Home and kitchen supplies",
        icon: "utensils",
        color: "#f39c12",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      {
        id: 5,
        name: "Sports & Outdoors",
        description: "Sports equipment and outdoor gear",
        icon: "dumbbell",
        color: "#27ae60",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
    loadCategories();
  }
}

// Call this function on first load
addSampleCategoriesIfEmpty();
