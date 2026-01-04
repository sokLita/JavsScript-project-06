// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize category data
  loadCategories();
  setupEventListeners();

  // Check user permissions
  if (userRole === "staff") {
    document.getElementById("importCategoriesBtn").style.display = "none";
    document.getElementById("exportCategoriesBtn").style.display = "none";
  }
});

// Sample category data with hierarchical structure
let categories = [
  {
    id: "CAT001",
    name: "Electronics",
    code: "ELEC",
    description: "All electronic devices and accessories",
    parentId: null,
    icon: "fas fa-laptop",
    color: "#3498db",
    status: "active",
    productCount: 125,
    createdAt: "2023-01-15",
    children: [
      {
        id: "CAT002",
        name: "Mobile Phones",
        code: "MOBP",
        description: "Smartphones and feature phones",
        parentId: "CAT001",
        icon: "fas fa-mobile-alt",
        color: "#3498db",
        status: "active",
        productCount: 45,
        createdAt: "2023-01-20",
        children: [],
      },
      {
        id: "CAT003",
        name: "Computers & Laptops",
        code: "COMP",
        description: "Desktops, laptops, and accessories",
        parentId: "CAT001",
        icon: "fas fa-laptop",
        color: "#3498db",
        status: "active",
        productCount: 32,
        createdAt: "2023-01-25",
        children: [],
      },
      {
        id: "CAT004",
        name: "Audio & Headphones",
        code: "AUDI",
        description: "Speakers, headphones, and audio equipment",
        parentId: "CAT001",
        icon: "fas fa-headphones",
        color: "#3498db",
        status: "active",
        productCount: 28,
        createdAt: "2023-02-10",
        children: [],
      },
    ],
  },
  {
    id: "CAT005",
    name: "Home & Kitchen",
    code: "HOME",
    description: "Home appliances and kitchenware",
    parentId: null,
    icon: "fas fa-home",
    color: "#e74c3c",
    status: "active",
    productCount: 89,
    createdAt: "2023-01-18",
    children: [
      {
        id: "CAT006",
        name: "Kitchen Appliances",
        code: "KITC",
        description: "Blenders, microwaves, and kitchen tools",
        parentId: "CAT005",
        icon: "fas fa-utensils",
        color: "#e74c3c",
        status: "active",
        productCount: 42,
        createdAt: "2023-02-05",
        children: [],
      },
      {
        id: "CAT007",
        name: "Home Decor",
        code: "DECO",
        description: "Decorative items for home",
        parentId: "CAT005",
        icon: "fas fa-couch",
        color: "#e74c3c",
        status: "active",
        productCount: 31,
        createdAt: "2023-02-15",
        children: [],
      },
    ],
  },
  {
    id: "CAT008",
    name: "Clothing & Fashion",
    code: "CLOT",
    description: "Men, women, and kids clothing",
    parentId: null,
    icon: "fas fa-tshirt",
    color: "#2ecc71",
    status: "active",
    productCount: 156,
    createdAt: "2023-01-20",
    children: [
      {
        id: "CAT009",
        name: "Men's Clothing",
        code: "MEN",
        description: "Clothing for men",
        parentId: "CAT008",
        icon: "fas fa-male",
        color: "#2ecc71",
        status: "active",
        productCount: 67,
        createdAt: "2023-02-01",
        children: [],
      },
      {
        id: "CAT010",
        name: "Women's Clothing",
        code: "WOMN",
        description: "Clothing for women",
        parentId: "CAT008",
        icon: "fas fa-female",
        color: "#2ecc71",
        status: "active",
        productCount: 73,
        createdAt: "2023-02-01",
        children: [],
      },
    ],
  },
  {
    id: "CAT011",
    name: "Sports & Outdoors",
    code: "SPRT",
    description: "Sports equipment and outdoor gear",
    parentId: null,
    icon: "fas fa-dumbbell",
    color: "#f39c12",
    status: "active",
    productCount: 54,
    createdAt: "2023-02-05",
    children: [],
  },
  {
    id: "CAT012",
    name: "Books & Media",
    code: "BOOK",
    description: "Books, magazines, and media",
    parentId: null,
    icon: "fas fa-book",
    color: "#9b59b6",
    status: "active",
    productCount: 98,
    createdAt: "2023-02-10",
    children: [],
  },
  {
    id: "CAT013",
    name: "Health & Beauty",
    code: "HLTH",
    description: "Health products and beauty items",
    parentId: null,
    icon: "fas fa-heart",
    color: "#e67e22",
    status: "inactive",
    productCount: 0,
    createdAt: "2023-02-20",
    children: [],
  },
];

// Variables for selection and filtering
let selectedCategories = new Set();
let filteredCategories = [];

// Load categories into different views
function loadCategories() {
  updateCategoryStats();
  renderGridView();
  renderTableView();
  renderTreeView();
  populateParentCategoryDropdown();
  checkEmptyState();
}

// Update category statistics
function updateCategoryStats() {
  const totalCategories = categories.length;
  const activeCategories = categories.filter(
    (cat) => cat.status === "active"
  ).length;
  const parentCategories = categories.filter((cat) => !cat.parentId).length;

  // Count uncategorized products (simulated)
  const uncategorizedProducts = 15;

  document.getElementById("totalCategories").textContent = totalCategories;
  document.getElementById("activeCategories").textContent = activeCategories;
  document.getElementById("parentCategories").textContent = parentCategories;
  document.getElementById("uncategorizedProducts").textContent =
    uncategorizedProducts;
}

// Render grid view
function renderGridView() {
  const categoriesGrid = document.getElementById("categoriesGrid");
  categoriesGrid.innerHTML = "";

  filteredCategories = getFilteredCategories();

  if (filteredCategories.length === 0) {
    document.getElementById("gridView").style.display = "none";
    return;
  }

  document.getElementById("gridView").style.display = "block";

  filteredCategories.forEach((category) => {
    const categoryCard = createCategoryCard(category);
    categoriesGrid.appendChild(categoryCard);
  });
}

// Create category card for grid view
function createCategoryCard(category) {
  const card = document.createElement("div");
  card.className = "category-card";
  card.dataset.categoryId = category.id;

  // Get parent category name
  const parentName = category.parentId
    ? getCategoryName(category.parentId)
    : "None";

  // Determine status badge
  const statusClass =
    category.status === "active" ? "status-active" : "status-inactive";
  const statusText = category.status === "active" ? "Active" : "Inactive";

  // Count subcategories
  const subcategoryCount = category.children ? category.children.length : 0;

  card.innerHTML = `
                <div class="category-badge">${category.code}</div>
                <div class="category-header">
                    <div class="category-icon" style="background-color: ${
                      category.color
                    }20; color: ${category.color};">
                        <i class="${category.icon}"></i>
                    </div>
                </div>
                <h3 class="category-name">${category.name}</h3>
                <p class="category-description">${
                  category.description || "No description"
                }</p>
                <div class="category-meta">
                    <div class="category-count">
                        <i class="fas fa-box"></i> ${
                          category.productCount
                        } products
                        ${
                          subcategoryCount > 0
                            ? `<br><i class="fas fa-folder"></i> ${subcategoryCount} subcategories`
                            : ""
                        }
                    </div>
                    <div class="category-status ${statusClass}">${statusText}</div>
                </div>
                <div class="category-actions">
                    <button class="btn btn-primary" onclick="viewCategory('${
                      category.id
                    }')">
                        <i class="fas fa-eye"></i> View
                    </button>
                    <button class="btn btn-warning" onclick="editCategory('${
                      category.id
                    }')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn btn-danger" onclick="deleteCategory('${
                      category.id
                    }')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            `;

  return card;
}

// Render table view
function renderTableView() {
  const categoriesTable = document.getElementById("categoriesTable");
  categoriesTable.innerHTML = "";

  filteredCategories = getFilteredCategories();

  if (filteredCategories.length === 0) {
    categoriesTable.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-tags" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <div>No categories found</div>
                        </td>
                    </tr>
                `;
    return;
  }

  filteredCategories.forEach((category) => {
    const row = document.createElement("tr");
    row.dataset.categoryId = category.id;

    // Get parent category name
    const parentName = category.parentId
      ? getCategoryName(category.parentId)
      : "-";

    // Determine status badge
    const statusClass =
      category.status === "active" ? "status-active" : "status-inactive";
    const statusText = category.status === "active" ? "Active" : "Inactive";

    // Check if this category is selected
    const isSelected = selectedCategories.has(category.id);

    row.innerHTML = `
                    <td>
                        <input type="checkbox" class="category-checkbox" data-category-id="${
                          category.id
                        }" ${
      isSelected ? "checked" : ""
    } onchange="toggleCategorySelection('${category.id}')">
                    </td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 30px; height: 30px; border-radius: 6px; background-color: ${
                              category.color
                            }20; color: ${
      category.color
    }; display: flex; align-items: center; justify-content: center;">
                                <i class="${category.icon}"></i>
                            </div>
                            <strong>${category.name}</strong>
                        </div>
                    </td>
                    <td>${parentName}</td>
                    <td>${category.productCount}</td>
                    <td><span class="category-status ${statusClass}">${statusText}</span></td>
                    <td>${category.createdAt}</td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewCategory('${
                          category.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editCategory('${
                          category.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteCategory('${
                          category.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    categoriesTable.appendChild(row);
  });

  // Update select all checkbox
  updateSelectAllCheckbox();
}

// Render tree view
function renderTreeView() {
  const categoryTree = document.getElementById("categoryTree");
  categoryTree.innerHTML = "";

  // Get only parent categories
  const parentCategories = categories.filter((cat) => !cat.parentId);

  if (parentCategories.length === 0) {
    categoryTree.innerHTML = `
                    <div style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <i class="fas fa-sitemap" style="font-size: 40px; margin-bottom: 15px;"></i>
                        <div>No categories found</div>
                    </div>
                `;
    return;
  }

  parentCategories.forEach((category) => {
    const treeNode = createTreeNode(category);
    categoryTree.appendChild(treeNode);
  });
}

// Create tree node for tree view
function createTreeNode(category, level = 0) {
  const node = document.createElement("div");
  node.className = "tree-node";

  // Determine if this node has children
  const hasChildren = category.children && category.children.length > 0;

  // Determine status badge
  const statusClass =
    category.status === "active" ? "status-active" : "status-inactive";
  const statusText = category.status === "active" ? "Active" : "Inactive";

  node.innerHTML = `
                <div class="tree-item" data-category-id="${
                  category.id
                }" style="margin-left: ${level * 20}px;">
                    ${
                      hasChildren
                        ? `
                        <div class="tree-toggle" onclick="toggleTreeNode('${category.id}')">
                            <i class="fas fa-chevron-right"></i>
                        </div>
                    `
                        : '<div style="width: 24px; margin-right: 10px;"></div>'
                    }
                    <div class="tree-content">
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 30px; height: 30px; border-radius: 6px; background-color: ${
                              category.color
                            }20; color: ${
    category.color
  }; display: flex; align-items: center; justify-content: center;">
                                <i class="${category.icon}"></i>
                            </div>
                            <div>
                                <div class="tree-name">${category.name}</div>
                                <div style="font-size: 12px; color: #7f8c8d;">${
                                  category.productCount
                                } products</div>
                            </div>
                        </div>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <span class="tree-badge">${category.code}</span>
                            <span class="category-status ${statusClass}">${statusText}</span>
                            <div class="tree-actions">
                                <button class="btn btn-sm btn-primary" onclick="viewCategory('${
                                  category.id
                                }')">
                                    <i class="fas fa-eye"></i>
                                </button>
                                <button class="btn btn-sm btn-warning" onclick="editCategory('${
                                  category.id
                                }')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-danger" onclick="deleteCategory('${
                                  category.id
                                }')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            `;

  // Add children if they exist
  if (hasChildren) {
    const subTree = document.createElement("div");
    subTree.className = "sub-tree";
    subTree.id = `subtree-${category.id}`;

    category.children.forEach((child) => {
      const childNode = createTreeNode(child, level + 1);
      subTree.appendChild(childNode);
    });

    node.appendChild(subTree);
  }

  return node;
}

// Toggle tree node expansion
function toggleTreeNode(categoryId) {
  const subTree = document.getElementById(`subtree-${categoryId}`);
  const toggleIcon = document.querySelector(
    `.tree-item[data-category-id="${categoryId}"] .tree-toggle i`
  );

  if (subTree.classList.contains("expanded")) {
    subTree.classList.remove("expanded");
    toggleIcon.className = "fas fa-chevron-right";
  } else {
    subTree.classList.add("expanded");
    toggleIcon.className = "fas fa-chevron-down";
  }
}

// Get filtered categories based on search and filters
function getFilteredCategories() {
  const searchTerm = document
    .getElementById("categorySearch")
    .value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const typeFilter = document.getElementById("typeFilter").value;

  // Flatten the category tree for filtering
  const allCategories = flattenCategories(categories);

  return allCategories.filter((category) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      category.name.toLowerCase().includes(searchTerm) ||
      category.description.toLowerCase().includes(searchTerm) ||
      category.code.toLowerCase().includes(searchTerm);

    // Status filter
    const matchesStatus = !statusFilter || category.status === statusFilter;

    // Type filter
    let matchesType = true;
    if (typeFilter === "parent") {
      matchesType = !category.parentId;
    } else if (typeFilter === "child") {
      matchesType = !!category.parentId;
    }

    return matchesSearch && matchesStatus && matchesType;
  });
}

// Flatten hierarchical categories into a flat array
function flattenCategories(categoryList, result = []) {
  categoryList.forEach((category) => {
    result.push(category);
    if (category.children && category.children.length > 0) {
      flattenCategories(category.children, result);
    }
  });
  return result;
}

// Get category name by ID
function getCategoryName(categoryId) {
  const allCategories = flattenCategories(categories);
  const category = allCategories.find((cat) => cat.id === categoryId);
  return category ? category.name : "Unknown";
}

// Populate parent category dropdown
function populateParentCategoryDropdown() {
  const parentSelect = document.getElementById("parentCategory");

  // Clear existing options except the first one
  while (parentSelect.options.length > 1) parentSelect.remove(1);

  // Get only parent categories (no parentId)
  const parentCategories = categories.filter((cat) => !cat.parentId);

  parentCategories.forEach((category) => {
    const option = document.createElement("option");
    option.value = category.id;
    option.textContent = category.name;
    parentSelect.appendChild(option);
  });
}

// View category details
function viewCategory(categoryId) {
  const allCategories = flattenCategories(categories);
  const category = allCategories.find((cat) => cat.id === categoryId);

  if (!category) return;

  // Get parent category name
  const parentName = category.parentId
    ? getCategoryName(category.parentId)
    : "None";

  // Count subcategories
  const subcategoryCount = category.children ? category.children.length : 0;

  alert(
    `Category Details:\n\n` +
      `Name: ${category.name}\n` +
      `Code: ${category.code}\n` +
      `Description: ${category.description || "No description"}\n` +
      `Parent Category: ${parentName}\n` +
      `Status: ${category.status === "active" ? "Active" : "Inactive"}\n` +
      `Products: ${category.productCount}\n` +
      `Subcategories: ${subcategoryCount}\n` +
      `Created: ${category.createdAt}`
  );
}

// Edit category
function editCategory(categoryId) {
  const allCategories = flattenCategories(categories);
  const category = allCategories.find((cat) => cat.id === categoryId);

  if (!category) return;

  document.getElementById("modalTitle").textContent = "Edit Category";
  document.getElementById("categoryModal").classList.add("active");

  // Fill form with category data
  document.getElementById("categoryName").value = category.name;
  document.getElementById("categoryCode").value = category.code || "";
  document.getElementById("categoryDescription").value =
    category.description || "";
  document.getElementById("categoryStatus").value = category.status;
  document.getElementById("categoryIcon").value = category.icon;

  // Set parent category
  const parentSelect = document.getElementById("parentCategory");
  parentSelect.value = category.parentId || "";

  // Set color
  const color = category.color || "#3498db";
  document.getElementById("categoryColor").value = color;

  // Update color picker
  document.querySelectorAll(".color-option").forEach((option) => {
    option.classList.remove("selected");
    if (option.dataset.color === color) {
      option.classList.add("selected");
    }
  });

  // Store category ID for update
  document.getElementById("saveCategoryBtn").dataset.categoryId = categoryId;
}

// Delete category
function deleteCategory(categoryId) {
  const allCategories = flattenCategories(categories);
  const category = allCategories.find((cat) => cat.id === categoryId);

  if (!category) return;

  // Check if category has products
  if (category.productCount > 0) {
    document.getElementById("deleteMessage").innerHTML = `
                    <strong>${category.name}</strong> has ${category.productCount} products assigned to it.<br><br>
                    Are you sure you want to delete this category? All products will become uncategorized.
                `;
  } else {
    document.getElementById("deleteMessage").innerHTML = `
                    Are you sure you want to delete the category <strong>${category.name}</strong>?
                `;
  }

  document.getElementById("deleteModal").classList.add("active");
  document.getElementById("confirmDeleteBtn").dataset.categoryId = categoryId;
}

// Confirm category deletion
function confirmDeleteCategory() {
  const categoryId =
    document.getElementById("confirmDeleteBtn").dataset.categoryId;

  // Find and remove category from tree
  removeCategoryFromTree(categories, categoryId);

  // Close modal
  document.getElementById("deleteModal").classList.remove("active");

  // Reload categories
  loadCategories();

  // Show success notification
  showNotification("Category deleted successfully!", "success");
}

// Remove category from tree recursively
function removeCategoryFromTree(categoryList, categoryId) {
  for (let i = 0; i < categoryList.length; i++) {
    if (categoryList[i].id === categoryId) {
      categoryList.splice(i, 1);
      return true;
    }
    if (categoryList[i].children && categoryList[i].children.length > 0) {
      if (removeCategoryFromTree(categoryList[i].children, categoryId)) {
        return true;
      }
    }
  }
  return false;
}

// Add new category
function addNewCategory() {
  document.getElementById("modalTitle").textContent = "Add New Category";
  document.getElementById("categoryModal").classList.add("active");

  // Clear form
  document.getElementById("categoryForm").reset();

  // Reset color to default
  document.getElementById("categoryColor").value = "#3498db";
  document.querySelectorAll(".color-option").forEach((option) => {
    option.classList.remove("selected");
    if (option.dataset.color === "#3498db") {
      option.classList.add("selected");
    }
  });

  // Clear stored category ID
  delete document.getElementById("saveCategoryBtn").dataset.categoryId;
}

// Save category (add or update)
function saveCategory(event) {
  event.preventDefault();

  // Get form values
  const categoryName = document.getElementById("categoryName").value;
  const categoryCode = document.getElementById("categoryCode").value;
  const parentCategory = document.getElementById("parentCategory").value;
  const categoryDescription = document.getElementById(
    "categoryDescription"
  ).value;
  const categoryStatus = document.getElementById("categoryStatus").value;
  const categoryColor = document.getElementById("categoryColor").value;
  const categoryIcon = document.getElementById("categoryIcon").value;

  // Check if we're editing or adding
  const categoryId =
    document.getElementById("saveCategoryBtn").dataset.categoryId;

  if (categoryId) {
    // Update existing category
    const allCategories = flattenCategories(categories);
    const categoryIndex = allCategories.findIndex(
      (cat) => cat.id === categoryId
    );

    if (categoryIndex !== -1) {
      // Find category in tree and update it
      updateCategoryInTree(categories, categoryId, {
        name: categoryName,
        code: categoryCode,
        parentId: parentCategory || null,
        description: categoryDescription,
        status: categoryStatus,
        color: categoryColor,
        icon: categoryIcon,
      });

      showNotification("Category updated successfully!", "success");
    }
  } else {
    // Add new category
    const newCategory = {
      id: "CAT" + (categories.length + 1).toString().padStart(3, "0"),
      name: categoryName,
      code: categoryCode,
      description: categoryDescription,
      parentId: parentCategory || null,
      icon: categoryIcon,
      color: categoryColor,
      status: categoryStatus,
      productCount: 0,
      createdAt: new Date().toISOString().split("T")[0],
      children: [],
    };

    // Add to appropriate place in tree
    if (parentCategory) {
      addCategoryToParent(categories, parentCategory, newCategory);
    } else {
      categories.push(newCategory);
    }

    showNotification("Category added successfully!", "success");
  }

  // Close modal
  document.getElementById("categoryModal").classList.remove("active");

  // Reset form
  document.getElementById("categoryForm").reset();

  // Reload categories
  loadCategories();
}

// Update category in tree recursively
function updateCategoryInTree(categoryList, categoryId, updates) {
  for (let i = 0; i < categoryList.length; i++) {
    if (categoryList[i].id === categoryId) {
      // Update category
      Object.assign(categoryList[i], updates);
      return true;
    }
    if (categoryList[i].children && categoryList[i].children.length > 0) {
      if (updateCategoryInTree(categoryList[i].children, categoryId, updates)) {
        return true;
      }
    }
  }
  return false;
}

// Add category to parent recursively
function addCategoryToParent(categoryList, parentId, newCategory) {
  for (let i = 0; i < categoryList.length; i++) {
    if (categoryList[i].id === parentId) {
      if (!categoryList[i].children) {
        categoryList[i].children = [];
      }
      categoryList[i].children.push(newCategory);
      return true;
    }
    if (categoryList[i].children && categoryList[i].children.length > 0) {
      if (
        addCategoryToParent(categoryList[i].children, parentId, newCategory)
      ) {
        return true;
      }
    }
  }
  return false;
}

// Toggle category selection for bulk actions
function toggleCategorySelection(categoryId) {
  if (selectedCategories.has(categoryId)) {
    selectedCategories.delete(categoryId);
  } else {
    selectedCategories.add(categoryId);
  }

  updateBulkActions();
  updateSelectAllCheckbox();
}

// Update bulk actions UI
function updateBulkActions() {
  const selectedCount = selectedCategories.size;
  const bulkActions = document.getElementById("bulkActions");

  if (selectedCount > 0) {
    bulkActions.classList.add("active");
    document.getElementById(
      "selectedCount"
    ).textContent = `${selectedCount} categories selected`;
  } else {
    bulkActions.classList.remove("active");
  }
}

// Update select all checkbox
function updateSelectAllCheckbox() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const allCheckboxes = document.querySelectorAll(".category-checkbox");
  const allChecked =
    allCheckboxes.length > 0 &&
    Array.from(allCheckboxes).every((cb) => cb.checked);

  selectAllCheckbox.checked = allChecked;
  selectAllCheckbox.indeterminate =
    !allChecked && Array.from(allCheckboxes).some((cb) => cb.checked);
}

// Select all categories
function selectAllCategories() {
  const selectAllCheckbox = document.getElementById("selectAllCheckbox");
  const allCheckboxes = document.querySelectorAll(".category-checkbox");

  if (selectAllCheckbox.checked) {
    // Select all
    filteredCategories.forEach((category) => {
      selectedCategories.add(category.id);
    });
    allCheckboxes.forEach((cb) => (cb.checked = true));
  } else {
    // Deselect all
    selectedCategories.clear();
    allCheckboxes.forEach((cb) => (cb.checked = false));
  }

  updateBulkActions();
}

// Apply bulk action
function applyBulkAction() {
  const action = document.getElementById("bulkActionSelect").value;

  if (!action) {
    alert("Please select an action first!");
    return;
  }

  if (selectedCategories.size === 0) {
    alert("Please select at least one category!");
    return;
  }

  let message = "";
  switch (action) {
    case "activate":
      selectedCategories.forEach((categoryId) => {
        updateCategoryInTree(categories, categoryId, {
          status: "active",
        });
      });
      message = "Categories activated successfully!";
      break;
    case "deactivate":
      selectedCategories.forEach((categoryId) => {
        updateCategoryInTree(categories, categoryId, {
          status: "inactive",
        });
      });
      message = "Categories deactivated successfully!";
      break;
    case "delete":
      if (
        confirm(
          `Are you sure you want to delete ${selectedCategories.size} categories? This action cannot be undone.`
        )
      ) {
        selectedCategories.forEach((categoryId) => {
          removeCategoryFromTree(categories, categoryId);
        });
        selectedCategories.clear();
        message = "Categories deleted successfully!";
      } else {
        return;
      }
      break;
    case "move":
      alert("Move to parent feature would open a modal to select new parent.");
      return;
  }

  // Clear selection
  selectedCategories.clear();
  document.getElementById("bulkActionSelect").value = "";

  // Reload categories
  loadCategories();

  // Show notification
  showNotification(message, "success");
}

// Clear selection
function clearSelection() {
  selectedCategories.clear();
  document
    .querySelectorAll(".category-checkbox")
    .forEach((cb) => (cb.checked = false));
  updateBulkActions();
  updateSelectAllCheckbox();
}

// Check if we should show empty state
function checkEmptyState() {
  const allCategories = flattenCategories(categories);
  const emptyState = document.getElementById("emptyState");

  if (allCategories.length === 0) {
    emptyState.style.display = "block";
    document.getElementById("gridView").style.display = "none";
    document.getElementById("tableView").style.display = "none";
    document.getElementById("treeView").style.display = "none";
  } else {
    emptyState.style.display = "none";
  }
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
    .getElementById("addCategoryBtn")
    .addEventListener("click", addNewCategory);
  document
    .getElementById("createFirstCategoryBtn")
    .addEventListener("click", addNewCategory);
  document
    .getElementById("importCategoriesBtn")
    .addEventListener("click", function () {
      alert("Import Categories feature would allow importing from CSV/Excel.");
    });
  document
    .getElementById("exportCategoriesBtn")
    .addEventListener("click", function () {
      showNotification("Categories exported successfully!", "success");
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      loadCategories();
      showNotification("Filters applied successfully!", "success");
    });

  // View toggle buttons
  document.getElementById("gridViewBtn").addEventListener("click", function () {
    document.getElementById("gridViewBtn").classList.add("active");
    document.getElementById("tableViewBtn").classList.remove("active");
    document.getElementById("treeViewBtn").classList.remove("active");
    document.getElementById("gridView").classList.add("active");
    document.getElementById("tableView").classList.remove("active");
    document.getElementById("treeView").style.display = "none";
  });

  document
    .getElementById("tableViewBtn")
    .addEventListener("click", function () {
      document.getElementById("tableViewBtn").classList.add("active");
      document.getElementById("gridViewBtn").classList.remove("active");
      document.getElementById("treeViewBtn").classList.remove("active");
      document.getElementById("tableView").classList.add("active");
      document.getElementById("gridView").classList.remove("active");
      document.getElementById("treeView").style.display = "none";
    });

  document.getElementById("treeViewBtn").addEventListener("click", function () {
    document.getElementById("treeViewBtn").classList.add("active");
    document.getElementById("gridViewBtn").classList.remove("active");
    document.getElementById("tableViewBtn").classList.remove("active");
    document.getElementById("treeView").style.display = "block";
    document.getElementById("gridView").classList.remove("active");
    document.getElementById("tableView").classList.remove("active");
  });

  // Expand all button
  document
    .getElementById("expandAllBtn")
    .addEventListener("click", function () {
      const allSubTrees = document.querySelectorAll(".sub-tree");
      const allToggleIcons = document.querySelectorAll(".tree-toggle i");

      allSubTrees.forEach((subTree) => {
        subTree.classList.add("expanded");
      });

      allToggleIcons.forEach((icon) => {
        icon.className = "fas fa-chevron-down";
      });
    });

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("categoryModal").classList.remove("active");
  });

  document
    .getElementById("closeDeleteModal")
    .addEventListener("click", function () {
      document.getElementById("deleteModal").classList.remove("active");
    });

  // Cancel buttons
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("categoryModal").classList.remove("active");
  });

  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
      document.getElementById("deleteModal").classList.remove("active");
    });

  // Form submissions
  document
    .getElementById("categoryForm")
    .addEventListener("submit", saveCategory);

  // Confirm delete button
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", confirmDeleteCategory);

  // Color picker
  document.querySelectorAll(".color-option").forEach((option) => {
    option.addEventListener("click", function () {
      document.querySelectorAll(".color-option").forEach((opt) => {
        opt.classList.remove("selected");
      });
      this.classList.add("selected");
      document.getElementById("categoryColor").value = this.dataset.color;
    });
  });

  // Bulk actions
  document
    .getElementById("applyBulkActionBtn")
    .addEventListener("click", applyBulkAction);
  document
    .getElementById("clearSelectionBtn")
    .addEventListener("click", clearSelection);
  document
    .getElementById("selectAllCheckbox")
    .addEventListener("change", selectAllCategories);

  // Search input (live search)
  document
    .getElementById("categorySearch")
    .addEventListener("input", function () {
      // Debounce the search to avoid too many updates
      clearTimeout(this.searchTimeout);
      this.searchTimeout = setTimeout(() => {
        loadCategories();
      }, 300);
    });

  // Filter changes
  document
    .getElementById("statusFilter")
    .addEventListener("change", loadCategories);
  document
    .getElementById("typeFilter")
    .addEventListener("change", loadCategories);

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
