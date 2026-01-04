// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load suppliers
  loadSuppliers();
  setupEventListeners();

  // Check role for permissions
  if (currentUser.role === "staff") {
    document.getElementById("addSupplierBtn").style.display = "none";
  }

  // Add sample data if empty
  addSampleSuppliersIfEmpty();
});

// Load suppliers from localStorage
function loadSuppliers() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const suppliers = systemData?.suppliers || [];
  const purchases = systemData?.purchases || [];

  // Calculate statistics
  updateStatistics(suppliers, purchases);

  // Display suppliers
  displaySuppliers(suppliers);
}

// Update statistics
function updateStatistics(suppliers, purchases) {
  const totalSuppliers = suppliers.length;
  const activeSuppliers = suppliers.filter((s) => s.status === "active").length;

  // Calculate pending orders from purchases
  const pendingOrders = purchases.filter((p) => p.status === "ordered").length;

  // Calculate overdue payments (simplified)
  const overduePayments = purchases
    .filter((p) => {
      if (!p.dueDate) return false;
      const dueDate = new Date(p.dueDate);
      const today = new Date();
      return p.status === "received" && dueDate < today && p.balanceDue > 0;
    })
    .reduce((sum, p) => sum + (p.balanceDue || 0), 0);

  document.getElementById("totalSuppliers").textContent = totalSuppliers;
  document.getElementById("activeSuppliers").textContent = activeSuppliers;
  document.getElementById("pendingOrders").textContent = pendingOrders;
  document.getElementById(
    "overduePayments"
  ).textContent = `₹${overduePayments.toLocaleString()}`;
}

// Display suppliers in grid and table
function displaySuppliers(suppliers) {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const ratingFilter = document.getElementById("ratingFilter").value;

  // Filter suppliers
  let filteredSuppliers = suppliers.filter((supplier) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      supplier.name.toLowerCase().includes(searchTerm) ||
      (supplier.contactPerson &&
        supplier.contactPerson.toLowerCase().includes(searchTerm)) ||
      supplier.email.toLowerCase().includes(searchTerm) ||
      (supplier.phone && supplier.phone.toLowerCase().includes(searchTerm));

    // Status filter
    const matchesStatus = !statusFilter || supplier.status === statusFilter;

    // Rating filter
    const matchesRating = !ratingFilter || supplier.rating == ratingFilter;

    return matchesSearch && matchesStatus && matchesRating;
  });

  // Display in grid view
  displayGridSuppliers(filteredSuppliers);

  // Display in table view
  displayTableSuppliers(filteredSuppliers);

  // Update pagination
  updatePagination(filteredSuppliers.length);
}

// Display suppliers in grid view
function displayGridSuppliers(suppliers) {
  const suppliersGrid = document.getElementById("suppliersGrid");

  if (suppliers.length === 0) {
    suppliersGrid.innerHTML = `
                    <div style="grid-column: 1 / -1; text-align: center; padding: 50px; color: #7f8c8d;">
                        <i class="fas fa-truck" style="font-size: 60px; margin-bottom: 20px;"></i>
                        <h3>No suppliers found</h3>
                        <p>Try adjusting your search or filters</p>
                        ${
                          suppliers.length === 0
                            ? '<button class="btn btn-primary" id="addFirstSupplierBtn" style="margin-top: 20px;"><i class="fas fa-plus"></i> Add Your First Supplier</button>'
                            : ""
                        }
                    </div>
                `;

    if (suppliers.length === 0) {
      document
        .getElementById("addFirstSupplierBtn")
        ?.addEventListener("click", () => {
          document.getElementById("addSupplierBtn").click();
        });
    }
    return;
  }

  suppliersGrid.innerHTML = "";

  suppliers.forEach((supplier) => {
    const supplierCard = createSupplierCard(supplier);
    suppliersGrid.appendChild(supplierCard);
  });
}

// Create supplier card element
function createSupplierCard(supplier) {
  const card = document.createElement("div");
  card.className = "supplier-card";

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  switch (supplier.status) {
    case "active":
      statusClass = "status-active";
      statusText = "Active";
      break;
    case "inactive":
      statusClass = "status-inactive";
      statusText = "Inactive";
      break;
    case "pending":
      statusClass = "status-pending";
      statusText = "Pending";
      break;
  }

  // Create rating stars
  const rating = supplier.rating || 3;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  // Get purchase history
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const purchases = systemData?.purchases || [];
  const supplierPurchases = purchases.filter(
    (p) => p.supplierId === supplier.id
  );
  const totalPurchases = supplierPurchases.length;
  const totalSpent = supplierPurchases.reduce((sum, p) => sum + p.total, 0);

  card.innerHTML = `
                <div class="supplier-header">
                    <div class="supplier-avatar">
                        ${supplier.name.charAt(0).toUpperCase()}
                    </div>
                    <div class="supplier-info">
                        <div class="supplier-name">${supplier.name}</div>
                        <div class="supplier-category">${
                          supplier.category || "Uncategorized"
                        }</div>
                    </div>
                </div>
                <div class="supplier-body">
                    <div class="supplier-contact">
                        <div class="contact-item">
                            <i class="fas fa-user"></i>
                            <span>${supplier.contactPerson || "N/A"}</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-envelope"></i>
                            <span>${supplier.email}</span>
                        </div>
                        <div class="contact-item">
                            <i class="fas fa-phone"></i>
                            <span>${supplier.phone || "N/A"}</span>
                        </div>
                    </div>
                    
                    <div class="supplier-stats">
                        <div class="stat-item">
                            <div class="stat-number">${totalPurchases}</div>
                            <div class="stat-label-small">Total Orders</div>
                        </div>
                        <div class="stat-item">
                            <div class="stat-number">₹${totalSpent.toLocaleString()}</div>
                            <div class="stat-label-small">Total Spent</div>
                        </div>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
                            <span style="font-size: 14px; color: #7f8c8d;">Rating:</span>
                            <span style="color: #f39c12; font-size: 16px;">${stars}</span>
                        </div>
                        <div style="display: flex; justify-content: space-between; align-items: center;">
                            <span style="font-size: 14px; color: #7f8c8d;">Status:</span>
                            <span class="status-badge ${statusClass}">${statusText}</span>
                        </div>
                    </div>
                    
                    <div class="supplier-actions">
                        <button class="btn btn-primary" onclick="viewSupplierDetails(${
                          supplier.id
                        })">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-warning" onclick="editSupplier(${
                          supplier.id
                        })">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="btn btn-danger" onclick="deleteSupplier(${
                          supplier.id
                        })">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;

  return card;
}

// Display suppliers in table view
function displayTableSuppliers(suppliers) {
  const tableBody = document.getElementById("suppliersTable");
  tableBody.innerHTML = "";

  if (suppliers.length === 0) {
    const row = document.createElement("tr");
    row.innerHTML = `
                    <td colspan="8" style="text-align: center; padding: 40px; color: #7f8c8d;">
                        <i class="fas fa-truck" style="font-size: 40px; margin-bottom: 10px;"></i>
                        <p>No suppliers found</p>
                    </td>
                `;
    tableBody.appendChild(row);
    return;
  }

  suppliers.forEach((supplier) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    switch (supplier.status) {
      case "active":
        statusClass = "status-active";
        statusText = "Active";
        break;
      case "inactive":
        statusClass = "status-inactive";
        statusText = "Inactive";
        break;
      case "pending":
        statusClass = "status-pending";
        statusText = "Pending";
        break;
    }

    // Create rating stars
    const rating = supplier.rating || 3;
    const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

    // Get product count from products
    const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
    const products = systemData?.products || [];
    const productCount = products.filter(
      (p) => p.supplierId === supplier.id
    ).length;

    row.innerHTML = `
                    <td><strong>${supplier.name}</strong></td>
                    <td>${supplier.contactPerson || "N/A"}</td>
                    <td>${supplier.email}</td>
                    <td>${supplier.phone || "N/A"}</td>
                    <td>${productCount}</td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td><span style="color: #f39c12;">${stars}</span></td>
                    <td>
                        <button class="btn btn-primary btn-sm" onclick="viewSupplierDetails(${
                          supplier.id
                        })">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-warning btn-sm" onclick="editSupplier(${
                          supplier.id
                        })">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-danger btn-sm" onclick="deleteSupplier(${
                          supplier.id
                        })">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    tableBody.appendChild(row);
  });
}

// Update pagination
function updatePagination(totalItems) {
  const pagination = document.getElementById("pagination");
  pagination.innerHTML = "";

  // For now, we'll just show a simple pagination info
  if (totalItems > 0) {
    pagination.innerHTML = `
                    <div style="color: #7f8c8d; font-size: 14px;">
                        Showing ${totalItems} supplier${
      totalItems !== 1 ? "s" : ""
    }
                    </div>
                `;
  }
}

// View supplier details
function viewSupplierDetails(supplierId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const supplier = systemData.suppliers.find((s) => s.id === supplierId);
  const purchases = systemData.purchases || [];
  const products = systemData.products || [];

  if (!supplier) return;

  document.getElementById("detailsModalTitle").textContent = supplier.name;

  // Calculate statistics
  const supplierPurchases = purchases.filter(
    (p) => p.supplierId === supplierId
  );
  const totalOrders = supplierPurchases.length;
  const totalSpent = supplierPurchases.reduce((sum, p) => sum + p.total, 0);
  const avgOrderValue = totalOrders > 0 ? totalSpent / totalOrders : 0;

  // Get products from this supplier
  const supplierProducts = products.filter((p) => p.supplierId === supplierId);

  // Create rating stars
  const rating = supplier.rating || 3;
  const stars = "★".repeat(rating) + "☆".repeat(5 - rating);

  const detailsContent = document.getElementById("supplierDetailsContent");
  detailsContent.innerHTML = `
                <div style="display: grid; grid-template-columns: 1fr 2fr; gap: 30px; margin-bottom: 30px;">
                    <div style="text-align: center;">
                        <div style="width: 100px; height: 100px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)); color: white; display: flex; align-items: center; justify-content: center; font-size: 36px; font-weight: bold; margin: 0 auto 20px;">
                            ${supplier.name.charAt(0).toUpperCase()}
                        </div>
                        <h3 style="margin-bottom: 10px;">${supplier.name}</h3>
                        <div style="margin-bottom: 10px;">
                            <span class="status-badge ${
                              supplier.status === "active"
                                ? "status-active"
                                : supplier.status === "pending"
                                ? "status-pending"
                                : "status-inactive"
                            }">
                                ${
                                  supplier.status.charAt(0).toUpperCase() +
                                  supplier.status.slice(1)
                                }
                            </span>
                        </div>
                        <div style="color: #f39c12; font-size: 20px; margin-bottom: 20px;">
                            ${stars}
                        </div>
                        <div style="color: #7f8c8d; font-size: 14px;">
                            ${supplier.category || "No category specified"}
                        </div>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px; color: var(--primary-color);">Supplier Statistics</h4>
                        <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 30px;">
                            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${totalOrders}</div>
                                <div style="font-size: 12px; color: #7f8c8d;">Total Orders</div>
                            </div>
                            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">₹${totalSpent.toLocaleString()}</div>
                                <div style="font-size: 12px; color: #7f8c8d;">Total Spent</div>
                            </div>
                            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">₹${avgOrderValue.toFixed(
                                  2
                                )}</div>
                                <div style="font-size: 12px; color: #7f8c8d;">Avg Order Value</div>
                            </div>
                            <div style="background: #f8f9fa; border-radius: 8px; padding: 15px; text-align: center;">
                                <div style="font-size: 24px; font-weight: 700; color: var(--primary-color);">${
                                  supplierProducts.length
                                }</div>
                                <div style="font-size: 12px; color: #7f8c8d;">Products</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px; color: var(--primary-color);">Contact Information</h4>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #7f8c8d;">Contact Person</div>
                                <div style="font-weight: 600;">${
                                  supplier.contactPerson || "N/A"
                                }</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #7f8c8d;">Email</div>
                                <div style="font-weight: 600;">${
                                  supplier.email
                                }</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #7f8c8d;">Phone</div>
                                <div style="font-weight: 600;">${
                                  supplier.phone || "N/A"
                                }</div>
                            </div>
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #7f8c8d;">Website</div>
                                <div style="font-weight: 600;">${
                                  supplier.website || "N/A"
                                }</div>
                            </div>
                        </div>
                    </div>
                    
                    <div>
                        <h4 style="margin-bottom: 15px; color: var(--primary-color);">Address & Payment</h4>
                        <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
                            <div style="margin-bottom: 15px;">
                                <div style="font-size: 12px; color: #7f8c8d;">Address</div>
                                <div style="font-weight: 600;">${
                                  supplier.address || "N/A"
                                }</div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">City</div>
                                    <div style="font-weight: 600;">${
                                      supplier.city || "N/A"
                                    }</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Country</div>
                                    <div style="font-weight: 600;">${
                                      supplier.country || "N/A"
                                    }</div>
                                </div>
                            </div>
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-bottom: 15px;">
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Payment Terms</div>
                                    <div style="font-weight: 600;">${
                                      supplier.paymentTerms || 30
                                    } days</div>
                                </div>
                                <div>
                                    <div style="font-size: 12px; color: #7f8c8d;">Credit Limit</div>
                                    <div style="font-weight: 600;">${
                                      supplier.creditLimit
                                        ? "₹" +
                                          supplier.creditLimit.toLocaleString()
                                        : "No limit"
                                    }</div>
                                </div>
                            </div>
                            <div>
                                <div style="font-size: 12px; color: #7f8c8d;">Tax ID</div>
                                <div style="font-weight: 600;">${
                                  supplier.taxId || "N/A"
                                }</div>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div>
                    <h4 style="margin-bottom: 15px; color: var(--primary-color);">Description</h4>
                    <div style="background: #f8f9fa; border-radius: 8px; padding: 20px; color: #7f8c8d; line-height: 1.6;">
                        ${supplier.description || "No description available."}
                    </div>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closeSupplierDetailsModal()">Close</button>
                    <button class="btn btn-warning" onclick="editSupplier(${
                      supplier.id
                    })">
                        <i class="fas fa-edit"></i> Edit Supplier
                    </button>
                    <button class="btn btn-primary" onclick="createNewPurchase(${
                      supplier.id
                    })">
                        <i class="fas fa-shopping-cart"></i> New Purchase Order
                    </button>
                </div>
            `;

  document.getElementById("supplierDetailsModal").classList.add("active");
}

// Close supplier details modal
function closeSupplierDetailsModal() {
  document.getElementById("supplierDetailsModal").classList.remove("active");
}

// Create new purchase order for supplier
function createNewPurchase(supplierId) {
  closeSupplierDetailsModal();
  // In a real app, this would redirect to the purchase management page
  // or open a purchase order modal
  showNotification("Redirecting to create new purchase order...", "info");
  setTimeout(() => {
    // Simulate redirect
    window.location.href = "purchases.html";
  }, 1000);
}

// Edit supplier
function editSupplier(supplierId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const supplier = systemData.suppliers.find((s) => s.id === supplierId);

  if (!supplier) return;

  document.getElementById("modalTitle").textContent = "Edit Supplier";
  document.getElementById("supplierModal").classList.add("active");

  // Fill form with supplier data
  document.getElementById("supplierName").value = supplier.name;
  document.getElementById("supplierCode").value = supplier.code || "";
  document.getElementById("supplierCategory").value = supplier.category || "";
  document.getElementById("supplierStatus").value = supplier.status || "active";
  document.getElementById("supplierDescription").value =
    supplier.description || "";

  // Contact tab
  document.getElementById("contactPerson").value = supplier.contactPerson || "";
  document.getElementById("contactPosition").value =
    supplier.contactPosition || "";
  document.getElementById("supplierEmail").value = supplier.email || "";
  document.getElementById("supplierPhone").value = supplier.phone || "";
  document.getElementById("supplierMobile").value = supplier.mobile || "";
  document.getElementById("supplierFax").value = supplier.fax || "";
  document.getElementById("supplierWebsite").value = supplier.website || "";

  // Additional info tab
  document.getElementById("supplierAddress").value = supplier.address || "";
  document.getElementById("supplierCity").value = supplier.city || "";
  document.getElementById("supplierState").value = supplier.state || "";
  document.getElementById("supplierZip").value = supplier.zip || "";
  document.getElementById("supplierCountry").value = supplier.country || "";
  document.getElementById("supplierTaxId").value = supplier.taxId || "";
  document.getElementById("paymentTerms").value = supplier.paymentTerms || 30;
  document.getElementById("creditLimit").value = supplier.creditLimit || "";
  document.getElementById("supplierRating").value = supplier.rating || 3;
  document.getElementById("supplierNotes").value = supplier.notes || "";

  // Store supplier ID for update
  document.getElementById("saveSupplierBtn").dataset.supplierId = supplierId;
}

// Delete supplier
function deleteSupplier(supplierId) {
  if (
    !confirm(
      "Are you sure you want to delete this supplier? This action cannot be undone."
    )
  ) {
    return;
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check if supplier has associated products or purchases
  const products = systemData.products.filter(
    (p) => p.supplierId === supplierId
  );
  const purchases = systemData.purchases.filter(
    (p) => p.supplierId === supplierId
  );

  if (products.length > 0 || purchases.length > 0) {
    alert(
      "Cannot delete supplier. There are products or purchase orders associated with this supplier."
    );
    return;
  }

  // Remove supplier
  systemData.suppliers = systemData.suppliers.filter(
    (s) => s.id !== supplierId
  );

  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Show notification
  showNotification("Supplier deleted successfully!", "success");

  // Reload suppliers
  loadSuppliers();
}

// Save supplier (add or update)
function saveSupplier(event) {
  event.preventDefault();

  // Get form values
  const supplierName = document.getElementById("supplierName").value;
  const supplierCode =
    document.getElementById("supplierCode").value || generateSupplierCode();
  const supplierCategory = document.getElementById("supplierCategory").value;
  const supplierStatus = document.getElementById("supplierStatus").value;
  const supplierDescription = document.getElementById(
    "supplierDescription"
  ).value;

  // Contact details
  const contactPerson = document.getElementById("contactPerson").value;
  const contactPosition = document.getElementById("contactPosition").value;
  const supplierEmail = document.getElementById("supplierEmail").value;
  const supplierPhone = document.getElementById("supplierPhone").value;
  const supplierMobile = document.getElementById("supplierMobile").value;
  const supplierFax = document.getElementById("supplierFax").value;
  const supplierWebsite = document.getElementById("supplierWebsite").value;

  // Additional info
  const supplierAddress = document.getElementById("supplierAddress").value;
  const supplierCity = document.getElementById("supplierCity").value;
  const supplierState = document.getElementById("supplierState").value;
  const supplierZip = document.getElementById("supplierZip").value;
  const supplierCountry = document.getElementById("supplierCountry").value;
  const supplierTaxId = document.getElementById("supplierTaxId").value;
  const paymentTerms =
    parseInt(document.getElementById("paymentTerms").value) || 30;
  const creditLimit = document.getElementById("creditLimit").value
    ? parseFloat(document.getElementById("creditLimit").value)
    : null;
  const supplierRating =
    parseInt(document.getElementById("supplierRating").value) || 3;
  const supplierNotes = document.getElementById("supplierNotes").value;

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check if we're editing or adding
  const supplierId =
    document.getElementById("saveSupplierBtn").dataset.supplierId;

  if (supplierId) {
    // Update existing supplier
    const supplierIndex = systemData.suppliers.findIndex(
      (s) => s.id === parseInt(supplierId)
    );
    if (supplierIndex !== -1) {
      systemData.suppliers[supplierIndex] = {
        ...systemData.suppliers[supplierIndex],
        name: supplierName,
        code: supplierCode,
        category: supplierCategory,
        status: supplierStatus,
        description: supplierDescription,
        contactPerson: contactPerson,
        contactPosition: contactPosition,
        email: supplierEmail,
        phone: supplierPhone,
        mobile: supplierMobile,
        fax: supplierFax,
        website: supplierWebsite,
        address: supplierAddress,
        city: supplierCity,
        state: supplierState,
        zip: supplierZip,
        country: supplierCountry,
        taxId: supplierTaxId,
        paymentTerms: paymentTerms,
        creditLimit: creditLimit,
        rating: supplierRating,
        notes: supplierNotes,
        updatedAt: new Date().toISOString(),
      };

      showNotification("Supplier updated successfully!", "success");
    }
  } else {
    // Add new supplier
    const newSupplier = {
      id: generateId(systemData.suppliers),
      name: supplierName,
      code: supplierCode,
      category: supplierCategory,
      status: supplierStatus,
      description: supplierDescription,
      contactPerson: contactPerson,
      contactPosition: contactPosition,
      email: supplierEmail,
      phone: supplierPhone,
      mobile: supplierMobile,
      fax: supplierFax,
      website: supplierWebsite,
      address: supplierAddress,
      city: supplierCity,
      state: supplierState,
      zip: supplierZip,
      country: supplierCountry,
      taxId: supplierTaxId,
      paymentTerms: paymentTerms,
      creditLimit: creditLimit,
      rating: supplierRating,
      notes: supplierNotes,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    systemData.suppliers.push(newSupplier);
    showNotification("Supplier added successfully!", "success");
  }

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("supplierModal").classList.remove("active");
  document.getElementById("supplierForm").reset();
  delete document.getElementById("saveSupplierBtn").dataset.supplierId;

  // Reset tabs to first tab
  document
    .querySelectorAll(".tab-btn")
    .forEach((btn) => btn.classList.remove("active"));
  document
    .querySelectorAll(".tab-content")
    .forEach((content) => content.classList.remove("active"));
  document.querySelector('[data-tab="basic"]').classList.add("active");
  document.getElementById("basicTab").classList.add("active");

  // Reload suppliers
  loadSuppliers();
}

// Generate supplier code
function generateSupplierCode() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const suppliers = systemData.suppliers || [];
  const count = suppliers.length + 1;
  return `SUP-${count.toString().padStart(4, "0")}`;
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
    .addEventListener("input", () => loadSuppliers());
  document
    .getElementById("statusFilter")
    .addEventListener("change", () => loadSuppliers());
  document
    .getElementById("ratingFilter")
    .addEventListener("change", () => loadSuppliers());

  // Add supplier button
  document
    .getElementById("addSupplierBtn")
    .addEventListener("click", function () {
      document.getElementById("modalTitle").textContent = "Add New Supplier";
      document.getElementById("supplierModal").classList.add("active");
      document.getElementById("supplierForm").reset();
      delete document.getElementById("saveSupplierBtn").dataset.supplierId;

      // Generate supplier code
      document.getElementById("supplierCode").value = generateSupplierCode();

      // Reset tabs to first tab
      document
        .querySelectorAll(".tab-btn")
        .forEach((btn) => btn.classList.remove("active"));
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));
      document.querySelector('[data-tab="basic"]').classList.add("active");
      document.getElementById("basicTab").classList.add("active");
    });

  // Tab switching
  document.querySelectorAll(".tab-btn").forEach((btn) => {
    btn.addEventListener("click", function () {
      const tabId = this.getAttribute("data-tab");

      // Update active tab button
      document
        .querySelectorAll(".tab-btn")
        .forEach((b) => b.classList.remove("active"));
      this.classList.add("active");

      // Update active tab content
      document
        .querySelectorAll(".tab-content")
        .forEach((content) => content.classList.remove("active"));
      document.getElementById(tabId + "Tab").classList.add("active");
    });
  });

  // Add contact person button
  document
    .getElementById("addContactBtn")
    .addEventListener("click", function () {
      const additionalContacts = document.getElementById("additionalContacts");
      const contactIndex = additionalContacts.children.length + 1;

      const contactDiv = document.createElement("div");
      contactDiv.className = "contact-person-item";
      contactDiv.innerHTML = `
                    <div class="contact-person-info">
                        <div class="contact-person-avatar">${contactIndex}</div>
                        <div>
                            <input type="text" class="form-control" style="margin-bottom: 5px;" placeholder="Contact Person Name">
                            <input type="text" class="form-control" placeholder="Position">
                        </div>
                    </div>
                    <button type="button" class="btn btn-danger btn-sm" onclick="this.parentElement.remove()">
                        <i class="fas fa-trash"></i>
                    </button>
                `;

      additionalContacts.appendChild(contactDiv);
    });

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("supplierModal").classList.remove("active");
  });

  document
    .getElementById("closeDetailsModal")
    .addEventListener("click", closeSupplierDetailsModal);

  // Cancel button
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("supplierModal").classList.remove("active");
  });

  // Supplier form submission
  document
    .getElementById("supplierForm")
    .addEventListener("submit", saveSupplier);

  // Close modals when clicking outside
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

// Add sample suppliers if empty
function addSampleSuppliersIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (!systemData.suppliers || systemData.suppliers.length === 0) {
    systemData.suppliers = [
      {
        id: 1,
        name: "Electronics Wholesale Ltd.",
        code: "SUP-0001",
        category: "electronics",
        status: "active",
        description:
          "Leading wholesale supplier of electronic components and devices",
        contactPerson: "John Smith",
        contactPosition: "Sales Manager",
        email: "john@ewl.com",
        phone: "+1-234-567-8901",
        mobile: "+1-234-567-8902",
        website: "https://ewl.com",
        address: "123 Tech Street, Silicon Valley",
        city: "San Jose",
        state: "CA",
        zip: "95101",
        country: "USA",
        taxId: "TAX-EWL-001",
        paymentTerms: 30,
        creditLimit: 50000,
        rating: 4,
        notes: "Reliable supplier with good quality products",
        createdAt: "2023-01-15",
        updatedAt: "2023-10-18",
      },
      {
        id: 2,
        name: "Furniture Manufacturers Inc.",
        code: "SUP-0002",
        category: "furniture",
        status: "active",
        description: "Manufacturer of office and home furniture",
        contactPerson: "Sarah Johnson",
        contactPosition: "Account Executive",
        email: "sarah@fmi.com",
        phone: "+1-987-654-3210",
        mobile: "+1-987-654-3211",
        website: "https://fmi.com",
        address: "456 Industrial Road",
        city: "Chicago",
        state: "IL",
        zip: "60601",
        country: "USA",
        taxId: "TAX-FMI-002",
        paymentTerms: 45,
        creditLimit: 75000,
        rating: 5,
        notes: "Excellent quality, slightly longer delivery times",
        createdAt: "2023-02-20",
        updatedAt: "2023-10-15",
      },
      {
        id: 3,
        name: "Global Textiles Corp.",
        code: "SUP-0003",
        category: "clothing",
        status: "pending",
        description: "Supplier of fabrics and clothing materials",
        contactPerson: "Michael Chen",
        contactPosition: "Export Manager",
        email: "michael@gtc.com",
        phone: "+86-10-1234-5678",
        mobile: "+86-138-0013-8000",
        website: "https://gtc.cn",
        address: "789 Textile Avenue, Shanghai",
        city: "Shanghai",
        state: "",
        zip: "200000",
        country: "China",
        taxId: "CHN-GTC-003",
        paymentTerms: 60,
        creditLimit: 30000,
        rating: 3,
        notes: "New supplier, requires verification",
        createdAt: "2023-10-01",
        updatedAt: "2023-10-18",
      },
    ];

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
    loadSuppliers();
  }
}
