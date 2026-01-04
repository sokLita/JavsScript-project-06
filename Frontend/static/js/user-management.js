// Initialize on page load
document.addEventListener("DOMContentLoaded", function () {
  // Set user info
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser) {
    document.getElementById("userAvatar").textContent = currentUser.name
      .charAt(0)
      .toUpperCase();
  }

  // Load users
  loadUsers();
  loadUserActivity();
  setupEventListeners();
});

// Load users from localStorage
function loadUsers() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const users = systemData?.users || [];

  // Update statistics
  updateUserStatistics(users);

  // Display users in table
  displayUsers(users);
}

// Update user statistics
function updateUserStatistics(users) {
  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "active").length;
  const adminUsers = users.filter((u) => u.role === "admin").length;
  const managerUsers = users.filter((u) => u.role === "manager").length;

  document.getElementById("totalUsers").textContent = totalUsers;
  document.getElementById("activeUsers").textContent = activeUsers;
  document.getElementById("adminUsers").textContent = adminUsers;
  document.getElementById("managerUsers").textContent = managerUsers;
}

// Display users in table
function displayUsers(users) {
  const usersTableBody = document.getElementById("usersTableBody");
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const roleFilter = document.getElementById("roleFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  // Filter users
  let filteredUsers = users.filter((user) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm);

    // Role filter
    const matchesRole = !roleFilter || user.role === roleFilter;

    // Status filter
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Display users
  if (filteredUsers.length === 0) {
    usersTableBody.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-users" style="font-size: 60px; margin-bottom: 20px; opacity: 0.3;"></i>
                            <h3>No users found</h3>
                            <p>Try adjusting your search or filters</p>
                        </td>
                    </tr>
                `;
    return;
  }

  usersTableBody.innerHTML = "";

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr");

    // Determine role badge
    let roleBadge = "";
    if (user.role === "admin") {
      roleBadge = '<span class="role-badge role-admin">Administrator</span>';
    } else if (user.role === "manager") {
      roleBadge = '<span class="role-badge role-manager">Manager</span>';
    } else {
      roleBadge = '<span class="role-badge role-staff">Staff</span>';
    }

    // Determine status badge
    let statusBadge = "";
    if (user.status === "active") {
      statusBadge = '<span class="status-badge status-active">Active</span>';
    } else if (user.status === "inactive") {
      statusBadge =
        '<span class="status-badge status-inactive">Inactive</span>';
    } else {
      statusBadge =
        '<span class="status-badge status-suspended">Suspended</span>';
    }

    // Format last login
    let lastLogin = user.lastLogin ? formatDate(user.lastLogin) : "Never";

    row.innerHTML = `
                    <td>${user.id}</td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, #3498db, #2c3e50); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div style="font-weight: 600;">${
                                  user.name
                                }</div>
                                <div style="font-size: 12px; color: #7f8c8d;">@${
                                  user.username
                                }</div>
                            </div>
                        </div>
                    </td>
                    <td>${user.email}</td>
                    <td>${roleBadge}</td>
                    <td>${statusBadge}</td>
                    <td>${lastLogin}</td>
                    <td>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-sm btn-primary" onclick="viewUserDetails(${
                              user.id
                            })">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button class="btn btn-sm btn-warning" onclick="editUser(${
                              user.id
                            })">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn btn-sm btn-danger" onclick="deleteUser(${
                              user.id
                            })" ${user.id === 1 ? "disabled" : ""}>
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </td>
                `;
    usersTableBody.appendChild(row);
  });
}

// Format date
function formatDate(dateString) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// View user details
function viewUserDetails(userId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const user = systemData.users.find((u) => u.id === userId);

  if (!user) return;

  document.getElementById(
    "detailsModalTitle"
  ).textContent = `${user.name}'s Profile`;

  // Determine role text
  let roleText = "";
  if (user.role === "admin") {
    roleText = "Administrator";
  } else if (user.role === "manager") {
    roleText = "Manager";
  } else {
    roleText = "Staff";
  }

  // Determine status text
  let statusText = "";
  let statusColor = "";
  if (user.status === "active") {
    statusText = "Active";
    statusColor = "var(--success-color)";
  } else if (user.status === "inactive") {
    statusText = "Inactive";
    statusColor = "#7f8c8d";
  } else {
    statusText = "Suspended";
    statusColor = "var(--accent-color)";
  }

  // Get permissions based on role
  let permissions = [];
  if (user.role === "admin") {
    permissions = [
      "Full system access",
      "User management",
      "Product management",
      "Stock management",
      "Sales management",
      "Reports",
    ];
  } else if (user.role === "manager") {
    permissions = [
      "Product management",
      "Stock management",
      "Sales management",
      "Reports",
    ];
  } else {
    permissions = ["View products", "View stock", "Process sales"];
  }

  const detailsContent = document.getElementById("userDetailsContent");
  detailsContent.innerHTML = `
                <div class="profile-card">
                    <div class="profile-header">
                        <div class="profile-avatar">
                            ${user.name.charAt(0).toUpperCase()}
                        </div>
                        <div class="profile-info">
                            <h3>${user.name}</h3>
                            <p>${roleText} • ${statusText}</p>
                        </div>
                    </div>
                    <div class="profile-body">
                        <div class="info-grid">
                            <div class="info-item">
                                <div class="info-label">Username</div>
                                <div class="info-value">@${user.username}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Email Address</div>
                                <div class="info-value">${user.email}</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Phone Number</div>
                                <div class="info-value">${
                                  user.phone || "Not provided"
                                }</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Department</div>
                                <div class="info-value">${
                                  user.department || "Not specified"
                                }</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Account Created</div>
                                <div class="info-value">${
                                  user.createdAt
                                    ? formatDate(user.createdAt)
                                    : "Unknown"
                                }</div>
                            </div>
                            <div class="info-item">
                                <div class="info-label">Last Login</div>
                                <div class="info-value">${
                                  user.lastLogin
                                    ? formatDate(user.lastLogin)
                                    : "Never"
                                }</div>
                            </div>
                        </div>
                        
                        <div style="margin-top: 30px;">
                            <h4 style="margin-bottom: 15px; color: var(--primary-color);">User Permissions</h4>
                            <div style="display: flex; flex-wrap: wrap; gap: 10px;">
                                ${permissions
                                  .map(
                                    (permission) => `
                                    <span style="padding: 5px 10px; background: rgba(52, 152, 219, 0.1); border-radius: 5px; font-size: 14px; color: var(--secondary-color);">
                                        <i class="fas fa-check"></i> ${permission}
                                    </span>
                                `
                                  )
                                  .join("")}
                            </div>
                        </div>
                        
                        ${
                          user.notes
                            ? `
                            <div style="margin-top: 30px;">
                                <h4 style="margin-bottom: 10px; color: var(--primary-color);">Notes</h4>
                                <p style="color: #7f8c8d; line-height: 1.6; padding: 15px; background: #f8f9fa; border-radius: 8px;">${user.notes}</p>
                            </div>
                        `
                            : ""
                        }
                        
                        <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                            <button class="btn" onclick="closeUserDetailsModal()">Close</button>
                            <button class="btn btn-warning" onclick="editUser(${
                              user.id
                            })">
                                <i class="fas fa-edit"></i> Edit User
                            </button>
                            ${
                              user.id !== 1
                                ? `
                                <button class="btn btn-danger" onclick="deleteUser(${user.id})">
                                    <i class="fas fa-trash"></i> Delete User
                                </button>
                            `
                                : ""
                            }
                        </div>
                    </div>
                </div>
            `;

  document.getElementById("userDetailsModal").classList.add("active");
}

// Close user details modal
function closeUserDetailsModal() {
  document.getElementById("userDetailsModal").classList.remove("active");
}

// Edit user
function editUser(userId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const user = systemData.users.find((u) => u.id === userId);

  if (!user) return;

  document.getElementById("modalTitle").textContent = "Edit User";
  document.getElementById("userModal").classList.add("active");

  // Split name into first and last
  const nameParts = user.name.split(" ");
  const firstName = nameParts[0];
  const lastName = nameParts.slice(1).join(" ");

  // Fill form with user data
  document.getElementById("firstName").value = firstName;
  document.getElementById("lastName").value = lastName;
  document.getElementById("username").value = user.username;
  document.getElementById("email").value = user.email;
  document.getElementById("phone").value = user.phone || "";
  document.getElementById("department").value = user.department || "";
  document.getElementById("role").value = user.role;
  document.getElementById("status").value = user.status;
  document.getElementById("notes").value = user.notes || "";

  // Remove password requirement for editing
  document.getElementById("password").required = false;
  document.getElementById("confirmPassword").required = false;

  // Store user ID for update
  document.getElementById("saveUserBtn").dataset.userId = userId;
}

// Add new user
function addNewUser() {
  document.getElementById("modalTitle").textContent = "Add New User";
  document.getElementById("userModal").classList.add("active");

  // Clear form
  document.getElementById("userForm").reset();

  // Add password requirement for new user
  document.getElementById("password").required = true;
  document.getElementById("confirmPassword").required = true;

  // Set default status
  document.getElementById("status").value = "active";

  delete document.getElementById("saveUserBtn").dataset.userId;
}

// Delete user
function deleteUser(userId) {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const user = systemData.users.find((u) => u.id === userId);

  if (!user) return;

  // Prevent deletion of default admin (id: 1)
  if (userId === 1) {
    showNotification(
      "Cannot delete the default administrator account.",
      "error"
    );
    return;
  }

  // Get current user
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (currentUser.id === userId) {
    showNotification("You cannot delete your own account.", "error");
    return;
  }

  document.getElementById(
    "deleteMessage"
  ).textContent = `Are you sure you want to delete ${user.name}?`;
  document.getElementById("deleteModal").classList.add("active");
  document.getElementById("confirmDeleteBtn").dataset.userId = userId;
}

// Confirm delete user
function confirmDeleteUser() {
  const userId = parseInt(
    document.getElementById("confirmDeleteBtn").dataset.userId
  );

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const userIndex = systemData.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    showNotification("User not found!", "error");
    return;
  }

  const userName = systemData.users[userIndex].name;

  // Remove user
  systemData.users.splice(userIndex, 1);

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal
  document.getElementById("deleteModal").classList.remove("active");

  // Show notification
  showNotification(`User ${userName} deleted successfully!`, "success");

  // Reload users
  loadUsers();
}

// Save user (add or update)
function saveUser(event) {
  event.preventDefault();

  // Get form values
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const phone = document.getElementById("phone").value.trim();
  const department = document.getElementById("department").value.trim();
  const role = document.getElementById("role").value;
  const status = document.getElementById("status").value;
  const notes = document.getElementById("notes").value.trim();

  // Validation
  if (!firstName || !lastName || !username || !email || !role || !status) {
    showNotification("Please fill in all required fields.", "error");
    return;
  }

  // Check if editing or adding new user
  const userId = document.getElementById("saveUserBtn").dataset.userId;

  if (!userId) {
    // Adding new user - password is required
    if (!password || !confirmPassword) {
      showNotification("Password is required for new users.", "error");
      return;
    }

    if (password.length < 6) {
      showNotification("Password must be at least 6 characters.", "error");
      return;
    }

    if (password !== confirmPassword) {
      showNotification("Passwords do not match.", "error");
      return;
    }
  } else {
    // Editing existing user - password is optional
    if (password && password.length > 0) {
      if (password.length < 6) {
        showNotification("Password must be at least 6 characters.", "error");
        return;
      }

      if (password !== confirmPassword) {
        showNotification("Passwords do not match.", "error");
        return;
      }
    }
  }

  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  // Check if username already exists (for new user)
  if (!userId) {
    const existingUser = systemData.users.find((u) => u.username === username);
    if (existingUser) {
      showNotification(
        "Username already exists. Please choose a different username.",
        "error"
      );
      return;
    }
  }

  // Check if email already exists (for new user)
  if (!userId) {
    const existingEmail = systemData.users.find((u) => u.email === email);
    if (existingEmail) {
      showNotification(
        "Email already exists. Please use a different email address.",
        "error"
      );
      return;
    }
  }

  if (userId) {
    // Update existing user
    const userIndex = systemData.users.findIndex(
      (u) => u.id === parseInt(userId)
    );
    if (userIndex !== -1) {
      const updatedUser = {
        ...systemData.users[userIndex],
        name: `${firstName} ${lastName}`,
        username: username,
        email: email,
        phone: phone || null,
        department: department || null,
        role: role,
        status: status,
        notes: notes || null,
      };

      // Update password if provided
      if (password && password.length > 0) {
        updatedUser.password = password;
      }

      systemData.users[userIndex] = updatedUser;

      showNotification("User updated successfully!", "success");
    }
  } else {
    // Add new user
    const newUser = {
      id: generateId(systemData.users),
      name: `${firstName} ${lastName}`,
      username: username,
      email: email,
      password: password,
      phone: phone || null,
      department: department || null,
      role: role,
      status: status,
      notes: notes || null,
      createdAt: new Date().toISOString(),
      lastLogin: null,
    };

    systemData.users.push(newUser);
    showNotification("User added successfully!", "success");
  }

  // Save to localStorage
  localStorage.setItem("inventorySystemData", JSON.stringify(systemData));

  // Close modal and reset form
  document.getElementById("userModal").classList.remove("active");
  document.getElementById("userForm").reset();
  delete document.getElementById("saveUserBtn").dataset.userId;

  // Reload users
  loadUsers();
}

// Generate unique ID
function generateId(items) {
  if (items.length === 0) return 1;
  return Math.max(...items.map((item) => item.id)) + 1;
}

// Load user activity
function loadUserActivity() {
  const activityList = document.getElementById("activityList");

  // Sample activity data (in a real app, this would come from the server)
  const activities = [
    {
      user: "Administrator",
      action: "Logged in to the system",
      time: "10 minutes ago",
    },
    {
      user: "Manager User",
      action: "Updated stock levels for Wireless Headphones",
      time: "45 minutes ago",
    },
    {
      user: "Staff User",
      action: "Processed a new sale order #SO-1024",
      time: "2 hours ago",
    },
    {
      user: "Administrator",
      action: 'Added new user "John Doe"',
      time: "1 day ago",
    },
    {
      user: "Manager User",
      action: "Generated monthly sales report",
      time: "2 days ago",
    },
  ];

  activityList.innerHTML = "";

  activities.forEach((activity) => {
    const item = document.createElement("div");
    item.className = "activity-item";
    item.style.cssText =
      "display: flex; padding: 15px 0; border-bottom: 1px solid #eee;";
    item.innerHTML = `
                    <div class="activity-icon" style="width: 40px; height: 40px; border-radius: 50%; background: rgba(52, 152, 219, 0.1); display: flex; align-items: center; justify-content: center; margin-right: 15px; color: var(--secondary-color);">
                        <i class="fas fa-user"></i>
                    </div>
                    <div class="activity-details" style="flex: 1;">
                        <div class="activity-text" style="margin-bottom: 5px;">
                            <strong>${activity.user}</strong> ${activity.action}
                        </div>
                        <div class="activity-time" style="font-size: 13px; color: #7f8c8d;">
                            ${activity.time}
                        </div>
                    </div>
                `;
    activityList.appendChild(item);
  });
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

  // Add user button
  document.getElementById("addUserBtn").addEventListener("click", addNewUser);

  // Search and filter events
  document
    .getElementById("searchInput")
    .addEventListener("input", () => loadUsers());
  document
    .getElementById("roleFilter")
    .addEventListener("change", () => loadUsers());
  document
    .getElementById("statusFilter")
    .addEventListener("change", () => loadUsers());

  // Modal close buttons
  document.getElementById("closeModal").addEventListener("click", function () {
    document.getElementById("userModal").classList.remove("active");
  });

  document
    .getElementById("closeDetailsModal")
    .addEventListener("click", closeUserDetailsModal);

  document
    .getElementById("closeDeleteModal")
    .addEventListener("click", function () {
      document.getElementById("deleteModal").classList.remove("active");
    });

  // Cancel buttons
  document.getElementById("cancelBtn").addEventListener("click", function () {
    document.getElementById("userModal").classList.remove("active");
  });

  document
    .getElementById("cancelDeleteBtn")
    .addEventListener("click", function () {
      document.getElementById("deleteModal").classList.remove("active");
    });

  // Form submissions
  document.getElementById("userForm").addEventListener("submit", saveUser);

  // Delete confirmation
  document
    .getElementById("confirmDeleteBtn")
    .addEventListener("click", confirmDeleteUser);

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
    localStorage.removeItem("isLoggedIn");
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
  }
}

// Add sample users if empty (for demo purposes)
function addSampleUsersIfEmpty() {
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));

  if (systemData.users.length === 0) {
    systemData.users = [
      {
        id: 1,
        name: "Administrator",
        username: "admin",
        password: "admin123",
        email: "admin@inventorypro.com",
        phone: "+1-234-567-8901",
        department: "IT",
        role: "admin",
        status: "active",
        createdAt: "2023-01-01",
        lastLogin: new Date().toISOString(),
      },
      {
        id: 2,
        name: "Manager User",
        username: "manager",
        password: "manager123",
        email: "manager@inventorypro.com",
        phone: "+1-987-654-3210",
        department: "Operations",
        role: "manager",
        status: "active",
        createdAt: "2023-02-15",
        lastLogin: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: 3,
        name: "Staff User",
        username: "staff",
        password: "staff123",
        email: "staff@inventorypro.com",
        phone: "+1-555-123-4567",
        department: "Sales",
        role: "staff",
        status: "active",
        createdAt: "2023-03-20",
        lastLogin: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      },
    ];

    localStorage.setItem("inventorySystemData", JSON.stringify(systemData));
    loadUsers();
  }
}

// Call this function on first load
addSampleUsersIfEmpty();
