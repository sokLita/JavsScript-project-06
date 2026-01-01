// supplier-management.js - Supplier Management System

document.addEventListener("DOMContentLoaded", function () {
  // Initialize supplier management
  initializeSupplierManagement();
  setupEventListeners();
  loadSuppliers();
  setupModal();
});

// Global variables
let suppliers = [];
let currentSupplierId = null;
let isEditing = false;

// Initialize supplier management
function initializeSupplierManagement() {
  // Load suppliers from localStorage if available
  const savedSuppliers = localStorage.getItem("suppliers");
  if (savedSuppliers) {
    try {
      suppliers = JSON.parse(savedSuppliers);
    } catch (error) {
      console.error("Error loading suppliers:", error);
      loadSampleSuppliers();
    }
  } else {
    loadSampleSuppliers();
  }
}

// Load sample suppliers
function loadSampleSuppliers() {
  suppliers = [
    {
      id: 1,
      name: "Tech Supplies Inc.",
      contactPerson: "John Smith",
      phone: "012 345 678",
      email: "john@techsupplies.com",
      products: "Electronics, Computers, Accessories",
      address: "123 Tech Street, Phnom Penh",
      website: "www.techsupplies.com",
      rating: 4.5,
      lastOrder: "2024-03-15",
      status: "active",
      notes: "Reliable supplier for electronic components",
    },
    {
      id: 2,
      name: "Fashion Wholesale Co.",
      contactPerson: "Sarah Johnson",
      phone: "023 456 789",
      email: "sarah@fashionwholesale.com",
      products: "Clothing, Accessories, Textiles",
      address: "456 Fashion Avenue, Phnom Penh",
      website: "www.fashionwholesale.com",
      rating: 4.2,
      lastOrder: "2024-03-10",
      status: "active",
      notes: "Bulk clothing supplier with good prices",
    },
    {
      id: 3,
      name: "Food Distributors Ltd.",
      contactPerson: "Robert Chen",
      phone: "034 567 890",
      email: "robert@fooddistributors.com",
      products: "Food, Beverages, Groceries",
      address: "789 Food Court, Phnom Penh",
      website: "www.fooddistributors.com",
      rating: 4.8,
      lastOrder: "2024-03-18",
      status: "active",
      notes: "Premium food supplier with organic options",
    },
    {
      id: 4,
      name: "Office Equipment Co.",
      contactPerson: "Michael Brown",
      phone: "045 678 901",
      email: "michael@officeequipment.com",
      products: "Office Furniture, Supplies, Equipment",
      address: "101 Office Road, Phnom Penh",
      website: "www.officeequipment.com",
      rating: 4.0,
      lastOrder: "2024-02-28",
      status: "active",
      notes: "Office furniture and supplies specialist",
    },
    {
      id: 5,
      name: "Automotive Parts Ltd.",
      contactPerson: "David Wilson",
      phone: "056 789 012",
      email: "david@autoparts.com",
      products: "Auto Parts, Tools, Accessories",
      address: "202 Auto Street, Phnom Penh",
      website: "www.autoparts.com",
      rating: 3.8,
      lastOrder: "2024-01-20",
      status: "inactive",
      notes: "Currently on hold due to shipping delays",
    },
  ];

  saveSuppliers();
}

// Save suppliers to localStorage
function saveSuppliers() {
  localStorage.setItem("suppliers", JSON.stringify(suppliers));
}

// Setup event listeners
function setupEventListeners() {
  // Add New Supplier button
  const addBtn = document.querySelector(".btn-add");
  if (addBtn) {
    addBtn.addEventListener("click", showAddSupplierModal);
  }

  // Setup sidebar navigation (if sidebar exists)
  setupSidebarNavigation();
}

// Setup modal
function setupModal() {
  // Create modal HTML structure
  const modalHTML = `
        <div class="modal" id="supplierModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="modalTitle">Add New Supplier</h3>
                    <button class="close-modal" onclick="closeModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <form id="supplierForm">
                        <div class="form-group">
                            <label for="supplierName">Supplier Name *</label>
                            <input type="text" id="supplierName" required placeholder="Enter supplier name">
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="contactPerson">Contact Person</label>
                                <input type="text" id="contactPerson" placeholder="Enter contact person">
                            </div>
                            <div class="form-group">
                                <label for="phone">Phone Number</label>
                                <input type="tel" id="phone" placeholder="012 345 678">
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="email">Email Address</label>
                            <input type="email" id="email" placeholder="supplier@example.com">
                        </div>
                        
                        <div class="form-group">
                            <label for="products">Products Supplied</label>
                            <textarea id="products" rows="2" placeholder="List products supplied (comma-separated)"></textarea>
                        </div>
                        
                        <div class="form-group">
                            <label for="address">Address</label>
                            <textarea id="address" rows="2" placeholder="Enter supplier address"></textarea>
                        </div>
                        
                        <div class="form-row">
                            <div class="form-group">
                                <label for="website">Website</label>
                                <input type="url" id="website" placeholder="www.example.com">
                            </div>
                            <div class="form-group">
                                <label for="status">Status</label>
                                <select id="status">
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="pending">Pending</option>
                                </select>
                            </div>
                        </div>
                        
                        <div class="form-group">
                            <label for="notes">Notes</label>
                            <textarea id="notes" rows="3" placeholder="Additional notes about the supplier"></textarea>
                        </div>
                        
                        <div class="form-actions">
                            <button type="button" class="btn-secondary" onclick="closeModal()">Cancel</button>
                            <button type="submit" class="btn-primary">Save Supplier</button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
        
        <!-- Delete Confirmation Modal -->
        <div class="modal" id="deleteModal">
            <div class="modal-content delete-modal">
                <div class="modal-header">
                    <h3>Confirm Delete</h3>
                    <button class="close-modal" onclick="closeDeleteModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <p id="deleteMessage">Are you sure you want to delete this supplier?</p>
                    <p class="warning-text">This action cannot be undone.</p>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeDeleteModal()">Cancel</button>
                    <button class="btn-danger" onclick="confirmDelete()">Delete</button>
                </div>
            </div>
        </div>
        
        <!-- Success Notification -->
        <div class="notification" id="successNotification">
            <div class="notification-content">
                <i class='bx bx-check-circle'></i>
                <span id="notificationMessage">Supplier saved successfully!</span>
            </div>
        </div>
    `;

  // Add modal to body
  document.body.insertAdjacentHTML("beforeend", modalHTML);

  // Setup form submission
  const form = document.getElementById("supplierForm");
  form.addEventListener("submit", handleFormSubmit);
}

// Load suppliers and render views
function loadSuppliers() {
  renderCards();
  renderTable();
}

// Render supplier cards
function renderCards() {
  const cardsContainer = document.querySelector(".cards");
  if (!cardsContainer) return;

  if (suppliers.length === 0) {
    cardsContainer.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-package'></i>
                <h3>No Suppliers</h3>
                <p>Add your first supplier to get started</p>
                <button class="btn-primary" onclick="showAddSupplierModal()">Add Supplier</button>
            </div>
        `;
    return;
  }

  cardsContainer.innerHTML = suppliers
    .map(
      (supplier) => `
        <div class="card" data-id="${supplier.id}">
            <div class="card-header">
                <h3>${supplier.name}</h3>
                <span class="status-badge status-${supplier.status}">${
        supplier.status
      }</span>
            </div>
            <div class="card-content">
                <p class="contact-info">
                    <i class='bx bx-user'></i>
                    ${supplier.contactPerson || "No contact person"}
                </p>
                <p class="contact-info">
                    <i class='bx bx-phone'></i>
                    ${supplier.phone || "No phone"}
                </p>
                <p class="contact-info">
                    <i class='bx bx-envelope'></i>
                    ${supplier.email || "No email"}
                </p>
                <p class="products">
                    <strong>Products:</strong> 
                    ${
                      supplier.products
                        ? supplier.products.substring(0, 50) +
                          (supplier.products.length > 50 ? "..." : "")
                        : "No products listed"
                    }
                </p>
                ${
                  supplier.rating
                    ? `
                <div class="rating">
                    <div class="stars">
                        ${getStarRating(supplier.rating)}
                    </div>
                    <span class="rating-value">${supplier.rating.toFixed(
                      1
                    )}</span>
                </div>
                `
                    : ""
                }
                ${
                  supplier.lastOrder
                    ? `
                <p class="last-order">
                    <i class='bx bx-calendar'></i>
                    Last order: ${formatDate(supplier.lastOrder)}
                </p>
                `
                    : ""
                }
            </div>
            <div class="card-actions">
                <button class="action-btn view" onclick="viewSupplier(${
                  supplier.id
                })" title="View Details">
                    <i class='bx bx-show'></i>
                </button>
                <button class="action-btn edit" onclick="editSupplier(${
                  supplier.id
                })" title="Edit">
                    <i class='bx bx-edit-alt'></i>
                </button>
                <button class="action-btn delete" onclick="showDeleteModal(${
                  supplier.id
                })" title="Delete">
                    <i class='bx bx-trash'></i>
                </button>
            </div>
        </div>
    `
    )
    .join("");
}

// Render supplier table
function renderTable() {
  const table = document.querySelector("table");
  if (!table) return;

  // Create tbody if it doesn't exist
  let tbody = table.querySelector("tbody");
  if (!tbody) {
    tbody = document.createElement("tbody");
    table.appendChild(tbody);
  }

  if (suppliers.length === 0) {
    tbody.innerHTML = `
            <tr>
                <td colspan="6" class="empty-table">
                    <i class='bx bx-package'></i>
                    <p>No suppliers found. Add your first supplier to get started.</p>
                </td>
            </tr>
        `;
    return;
  }

  tbody.innerHTML = suppliers
    .map(
      (supplier) => `
        <tr data-id="${supplier.id}">
            <td class="supplier-name">
                <div class="name-container">
                    <strong>${supplier.name}</strong>
                    <span class="status-badge status-${supplier.status}">${
        supplier.status
      }</span>
                </div>
                ${supplier.address ? `<small>${supplier.address}</small>` : ""}
            </td>
            <td>${supplier.contactPerson || "-"}</td>
            <td>${supplier.phone || "-"}</td>
            <td>${supplier.email || "-"}</td>
            <td>
                <div class="products-cell">
                    ${
                      supplier.products
                        ? supplier.products
                            .split(",")
                            .map(
                              (p) =>
                                `<span class="product-tag">${p.trim()}</span>`
                            )
                            .join("")
                        : "-"
                    }
                </div>
            </td>
            <td>
                <div class="table-actions">
                    <button class="action-btn view" onclick="viewSupplier(${
                      supplier.id
                    })" title="View Details">
                        <i class='bx bx-show'></i>
                    </button>
                    <button class="action-btn edit" onclick="editSupplier(${
                      supplier.id
                    })" title="Edit">
                        <i class='bx bx-edit-alt'></i>
                    </button>
                    <button class="action-btn delete" onclick="showDeleteModal(${
                      supplier.id
                    })" title="Delete">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </td>
        </tr>
    `
    )
    .join("");
}

// Get star rating HTML
function getStarRating(rating) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 >= 0.5;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  let stars = "";

  // Full stars
  for (let i = 0; i < fullStars; i++) {
    stars += '<i class="bx bxs-star"></i>';
  }

  // Half star
  if (halfStar) {
    stars += '<i class="bx bxs-star-half"></i>';
  }

  // Empty stars
  for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="bx bx-star"></i>';
  }

  return stars;
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

// Show add supplier modal
function showAddSupplierModal() {
  isEditing = false;
  currentSupplierId = null;

  const modal = document.getElementById("supplierModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("supplierForm");

  modalTitle.textContent = "Add New Supplier";
  form.reset();
  modal.style.display = "block";
}

// Show edit supplier modal
function editSupplier(supplierId) {
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  isEditing = true;
  currentSupplierId = supplierId;

  const modal = document.getElementById("supplierModal");
  const modalTitle = document.getElementById("modalTitle");
  const form = document.getElementById("supplierForm");

  modalTitle.textContent = "Edit Supplier";

  // Fill form with supplier data
  document.getElementById("supplierName").value = supplier.name || "";
  document.getElementById("contactPerson").value = supplier.contactPerson || "";
  document.getElementById("phone").value = supplier.phone || "";
  document.getElementById("email").value = supplier.email || "";
  document.getElementById("products").value = supplier.products || "";
  document.getElementById("address").value = supplier.address || "";
  document.getElementById("website").value = supplier.website || "";
  document.getElementById("status").value = supplier.status || "active";
  document.getElementById("notes").value = supplier.notes || "";

  modal.style.display = "block";
}

// View supplier details
function viewSupplier(supplierId) {
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  // Create view modal
  const viewModalHTML = `
        <div class="modal" id="viewModal">
            <div class="modal-content">
                <div class="modal-header">
                    <h3>Supplier Details</h3>
                    <button class="close-modal" onclick="closeViewModal()">&times;</button>
                </div>
                <div class="modal-body">
                    <div class="supplier-details">
                        <div class="detail-header">
                            <h2>${supplier.name}</h2>
                            <span class="status-badge status-${
                              supplier.status
                            }">${supplier.status}</span>
                        </div>
                        
                        <div class="detail-section">
                            <h4><i class='bx bx-contact'></i> Contact Information</h4>
                            <div class="detail-grid">
                                <div class="detail-item">
                                    <strong>Contact Person:</strong>
                                    <span>${
                                      supplier.contactPerson || "Not specified"
                                    }</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Phone:</strong>
                                    <span>${
                                      supplier.phone || "Not specified"
                                    }</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Email:</strong>
                                    <span>${
                                      supplier.email || "Not specified"
                                    }</span>
                                </div>
                                <div class="detail-item">
                                    <strong>Website:</strong>
                                    <span>${
                                      supplier.website
                                        ? `<a href="https://${supplier.website}" target="_blank">${supplier.website}</a>`
                                        : "Not specified"
                                    }</span>
                                </div>
                            </div>
                        </div>
                        
                        <div class="detail-section">
                            <h4><i class='bx bx-map'></i> Address</h4>
                            <p>${supplier.address || "Not specified"}</p>
                        </div>
                        
                        <div class="detail-section">
                            <h4><i class='bx bx-package'></i> Products Supplied</h4>
                            <div class="products-list">
                                ${
                                  supplier.products
                                    ? supplier.products
                                        .split(",")
                                        .map(
                                          (p) =>
                                            `<span class="product-tag">${p.trim()}</span>`
                                        )
                                        .join("")
                                    : "Not specified"
                                }
                            </div>
                        </div>
                        
                        ${
                          supplier.rating
                            ? `
                        <div class="detail-section">
                            <h4><i class='bx bx-star'></i> Rating</h4>
                            <div class="rating-display">
                                ${getStarRating(supplier.rating)}
                                <span class="rating-value">${supplier.rating.toFixed(
                                  1
                                )}/5.0</span>
                            </div>
                        </div>
                        `
                            : ""
                        }
                        
                        ${
                          supplier.lastOrder
                            ? `
                        <div class="detail-section">
                            <h4><i class='bx bx-history'></i> Order History</h4>
                            <p>Last order: ${formatDate(supplier.lastOrder)}</p>
                        </div>
                        `
                            : ""
                        }
                        
                        ${
                          supplier.notes
                            ? `
                        <div class="detail-section">
                            <h4><i class='bx bx-note'></i> Notes</h4>
                            <p>${supplier.notes}</p>
                        </div>
                        `
                            : ""
                        }
                    </div>
                </div>
                <div class="modal-footer">
                    <button class="btn-secondary" onclick="closeViewModal()">Close</button>
                    <button class="btn-primary" onclick="editSupplier(${
                      supplier.id
                    })">Edit Supplier</button>
                </div>
            </div>
        </div>
    `;

  // Remove existing view modal if present
  const existingViewModal = document.getElementById("viewModal");
  if (existingViewModal) {
    existingViewModal.remove();
  }

  // Add new view modal
  document.body.insertAdjacentHTML("beforeend", viewModalHTML);
  document.getElementById("viewModal").style.display = "block";
}

// Close view modal
function closeViewModal() {
  const viewModal = document.getElementById("viewModal");
  if (viewModal) {
    viewModal.remove();
  }
}

// Handle form submission
function handleFormSubmit(event) {
  event.preventDefault();

  // Get form values
  const supplierData = {
    name: document.getElementById("supplierName").value.trim(),
    contactPerson: document.getElementById("contactPerson").value.trim(),
    phone: document.getElementById("phone").value.trim(),
    email: document.getElementById("email").value.trim(),
    products: document.getElementById("products").value.trim(),
    address: document.getElementById("address").value.trim(),
    website: document.getElementById("website").value.trim(),
    status: document.getElementById("status").value,
    notes: document.getElementById("notes").value.trim(),
  };

  // Validate required fields
  if (!supplierData.name) {
    showNotification("Supplier name is required", "error");
    return;
  }

  if (isEditing) {
    // Update existing supplier
    const index = suppliers.findIndex((s) => s.id === currentSupplierId);
    if (index !== -1) {
      // Preserve existing rating and lastOrder
      supplierData.id = currentSupplierId;
      supplierData.rating = suppliers[index].rating || null;
      supplierData.lastOrder = suppliers[index].lastOrder || null;

      suppliers[index] = supplierData;
      showNotification("Supplier updated successfully", "success");
    }
  } else {
    // Add new supplier
    const newId =
      suppliers.length > 0 ? Math.max(...suppliers.map((s) => s.id)) + 1 : 1;
    supplierData.id = newId;
    supplierData.rating = 0; // New suppliers start with 0 rating
    supplierData.lastOrder = null; // No orders yet

    suppliers.push(supplierData);
    showNotification("Supplier added successfully", "success");
  }

  // Save and refresh
  saveSuppliers();
  loadSuppliers();
  closeModal();
}

// Show delete confirmation modal
function showDeleteModal(supplierId) {
  const supplier = suppliers.find((s) => s.id === supplierId);
  if (!supplier) return;

  currentSupplierId = supplierId;

  const deleteModal = document.getElementById("deleteModal");
  const deleteMessage = document.getElementById("deleteMessage");

  deleteMessage.textContent = `Are you sure you want to delete "${supplier.name}"?`;
  deleteModal.style.display = "block";
}

// Close delete modal
function closeDeleteModal() {
  document.getElementById("deleteModal").style.display = "none";
  currentSupplierId = null;
}

// Confirm delete
function confirmDelete() {
  if (!currentSupplierId) return;

  const index = suppliers.findIndex((s) => s.id === currentSupplierId);
  if (index !== -1) {
    const supplierName = suppliers[index].name;
    suppliers.splice(index, 1);

    showNotification(`"${supplierName}" has been deleted`, "success");
    saveSuppliers();
    loadSuppliers();
  }

  closeDeleteModal();
}

// Close modal
function closeModal() {
  document.getElementById("supplierModal").style.display = "none";
}

// Show notification
function showNotification(message, type = "success") {
  const notification = document.getElementById("successNotification");
  const notificationMessage = document.getElementById("notificationMessage");

  notification.className = `notification notification-${type}`;
  notificationMessage.textContent = message;

  notification.style.display = "flex";

  // Auto hide after 3 seconds
  setTimeout(() => {
    notification.style.display = "none";
  }, 3000);
}

// Setup sidebar navigation
function setupSidebarNavigation() {
  // This would be connected to your main navigation
  // For now, we'll just set up a simple example
  const sidebar = document.querySelector(".sidebar");
  if (sidebar) {
    const items = sidebar.querySelectorAll("li");
    items.forEach((item) => {
      item.addEventListener("click", function () {
        items.forEach((li) => li.classList.remove("active"));
        this.classList.add("active");
        showNotification(`Navigating to ${this.textContent.trim()}`, "info");
      });
    });
  }
}

// Make functions available globally
window.showAddSupplierModal = showAddSupplierModal;
window.editSupplier = editSupplier;
window.viewSupplier = viewSupplier;
window.showDeleteModal = showDeleteModal;
window.closeModal = closeModal;
window.closeDeleteModal = closeDeleteModal;
window.closeViewModal = closeViewModal;
window.confirmDelete = confirmDelete;
