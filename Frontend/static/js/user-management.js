// Check authentication on page load
document.addEventListener("DOMContentLoaded", function () {
  // Get user info from localStorage
  const userRole = localStorage.getItem("userRole") || "admin";
  const userName = localStorage.getItem("userName") || "Administrator";

  // Update UI with user info
  document.getElementById("userAvatar").textContent = userName
    .charAt(0)
    .toUpperCase();

  // Initialize user data
  loadUserData();
  setupEventListeners();

  // Hide permissions section for staff by default
  updatePermissionVisibility();
});

// Sample user data
let usersData = {
  users: [
    {
      id: "U001",
      firstName: "John",
      lastName: "Smith",
      email: "john.smith@inventorypro.com",
      username: "john.smith",
      role: "admin",
      status: "active",
      phone: "+91 9876543210",
      department: "admin",
      lastLogin: "2023-10-18 14:30",
      joinDate: "2023-01-15",
      permissions: [
        "dashboard",
        "products",
        "stock",
        "sales",
        "users",
        "reports",
        "settings",
        "export",
      ],
      notes: "System administrator with full access",
    },
    {
      id: "U002",
      firstName: "Sarah",
      lastName: "Johnson",
      email: "sarah.johnson@inventorypro.com",
      username: "sarah.j",
      role: "manager",
      status: "active",
      phone: "+91 9876543211",
      department: "sales",
      lastLogin: "2023-10-18 11:15",
      joinDate: "2023-03-20",
      permissions: [
        "dashboard",
        "products",
        "stock",
        "sales",
        "reports",
        "export",
      ],
      notes: "Sales department manager",
    },
    {
      id: "U003",
      firstName: "Michael",
      lastName: "Chen",
      email: "michael.chen@inventorypro.com",
      username: "michael.c",
      role: "staff",
      status: "active",
      phone: "+91 9876543212",
      department: "inventory",
      lastLogin: "2023-10-17 16:45",
      joinDate: "2023-05-10",
      permissions: ["dashboard", "products", "stock"],
      notes: "Inventory control specialist",
    },
    {
      id: "U004",
      firstName: "Emily",
      lastName: "Davis",
      email: "emily.davis@inventorypro.com",
      username: "emily.d",
      role: "staff",
      status: "active",
      phone: "+91 9876543213",
      department: "sales",
      lastLogin: "2023-10-17 10:20",
      joinDate: "2023-06-15",
      permissions: ["dashboard", "sales"],
      notes: "Sales representative",
    },
    {
      id: "U005",
      firstName: "Robert",
      lastName: "Wilson",
      email: "robert.wilson@inventorypro.com",
      username: "robert.w",
      role: "manager",
      status: "active",
      phone: "+91 9876543214",
      department: "inventory",
      lastLogin: "2023-10-16 09:30",
      joinDate: "2023-02-28",
      permissions: ["dashboard", "products", "stock", "reports"],
      notes: "Inventory manager",
    },
    {
      id: "U006",
      firstName: "Lisa",
      lastName: "Thompson",
      email: "lisa.thompson@inventorypro.com",
      username: "lisa.t",
      role: "staff",
      status: "inactive",
      phone: "+91 9876543215",
      department: "purchasing",
      lastLogin: "2023-09-15 13:10",
      joinDate: "2023-04-05",
      permissions: ["dashboard"],
      notes: "On leave until further notice",
    },
    {
      id: "U007",
      firstName: "David",
      lastName: "Brown",
      email: "david.brown@inventorypro.com",
      username: "david.b",
      role: "staff",
      status: "pending",
      phone: "+91 9876543216",
      department: "finance",
      lastLogin: "Never",
      joinDate: "2023-10-01",
      permissions: ["dashboard"],
      notes: "New hire, pending training",
    },
  ],
  activity: [
    {
      id: "A001",
      type: "login",
      user: "John Smith",
      text: "User logged into the system",
      time: "Today, 14:30",
    },
    {
      id: "A002",
      type: "update",
      user: "Sarah Johnson",
      text: "Updated sales report settings",
      time: "Today, 11:15",
    },
    {
      id: "A003",
      type: "create",
      user: "Michael Chen",
      text: "Added new product to inventory",
      time: "Yesterday, 16:45",
    },
    {
      id: "A004",
      type: "update",
      user: "Emily Davis",
      text: "Processed new sales order",
      time: "Yesterday, 10:20",
    },
    {
      id: "A005",
      type: "delete",
      user: "Robert Wilson",
      text: "Removed expired products from stock",
      time: "2 days ago, 09:30",
    },
  ],
};

// Load user data into tables
function loadUserData() {
  loadUsersTable();
  loadActivityList();
  updateUserStats();
}

// Load users table
function loadUsersTable() {
  const usersTable = document.getElementById("usersTable");
  usersTable.innerHTML = "";

  // Apply filters if any
  let filteredUsers = filterUsers();

  if (filteredUsers.length === 0) {
    usersTable.innerHTML = `
                    <tr>
                        <td colspan="7" style="text-align: center; padding: 40px; color: #7f8c8d;">
                            <i class="fas fa-user-slash" style="font-size: 40px; margin-bottom: 15px;"></i>
                            <div>No users found</div>
                        </td>
                    </tr>
                `;
    return;
  }

  filteredUsers.forEach((user) => {
    const row = document.createElement("tr");

    // Determine status badge
    let statusClass = "";
    let statusText = "";
    switch (user.status) {
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

    // Determine role badge
    let roleClass = "";
    let roleText = "";
    switch (user.role) {
      case "admin":
        roleClass = "role-admin";
        roleText = "Administrator";
        break;
      case "manager":
        roleClass = "role-manager";
        roleText = "Manager";
        break;
      case "staff":
        roleClass = "role-staff";
        roleText = "Staff";
        break;
    }

    // Create permission indicators
    const permissionCount = user.permissions.length;
    const permissionIndicators = Array(8)
      .fill(0)
      .map((_, i) => {
        return `<div class="permission-dot ${
          i < permissionCount ? "active" : ""
        }"></div>`;
      })
      .join("");

    row.innerHTML = `
                    <td><strong>${user.id}</strong></td>
                    <td>
                        <div style="display: flex; align-items: center; gap: 10px;">
                            <div style="width: 40px; height: 40px; border-radius: 50%; background: linear-gradient(135deg, var(--secondary-color), var(--primary-color)); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">
                                ${user.firstName.charAt(
                                  0
                                )}${user.lastName.charAt(0)}
                            </div>
                            <div>
                                <div style="font-weight: 600;">${
                                  user.firstName
                                } ${user.lastName}</div>
                                <div style="font-size: 14px; color: #7f8c8d;">${
                                  user.email
                                }</div>
                            </div>
                        </div>
                    </td>
                    <td><span class="role-badge ${roleClass}">${roleText}</span></td>
                    <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                    <td>${user.lastLogin}</td>
                    <td>
                        <div class="permission-indicators">
                            ${permissionIndicators}
                        </div>
                        <div style="font-size: 12px; color: #7f8c8d; margin-top: 5px;">${permissionCount} permissions</div>
                    </td>
                    <td>
                        <button class="btn btn-sm btn-primary" onclick="viewUserDetails('${
                          user.id
                        }')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-warning" onclick="editUser('${
                          user.id
                        }')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" onclick="deleteUser('${
                          user.id
                        }')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                `;
    usersTable.appendChild(row);
  });
}

// Load activity list
function loadActivityList() {
  const activityList = document.getElementById("activityList");
  activityList.innerHTML = "";

  usersData.activity.forEach((activity) => {
    const item = document.createElement("li");
    item.className = "activity-item";

    // Determine activity icon
    let activityIcon = "";
    switch (activity.type) {
      case "login":
        activityIcon = "fa-sign-in-alt";
        break;
      case "logout":
        activityIcon = "fa-sign-out-alt";
        break;
      case "create":
        activityIcon = "fa-plus-circle";
        break;
      case "update":
        activityIcon = "fa-edit";
        break;
      case "delete":
        activityIcon = "fa-trash";
        break;
      default:
        activityIcon = "fa-info-circle";
    }

    item.innerHTML = `
                    <div class="activity-icon">
                        <i class="fas ${activityIcon}"></i>
                    </div>
                    <div class="activity-details">
                        <div class="activity-text">
                            <strong>${activity.user}</strong> ${activity.text}
                        </div>
                        <div class="activity-time">${activity.time}</div>
                    </div>
                `;
    activityList.appendChild(item);
  });
}

// Update user statistics
function updateUserStats() {
  const totalUsers = usersData.users.length;
  const adminUsers = usersData.users.filter(
    (user) => user.role === "admin"
  ).length;
  const managerUsers = usersData.users.filter(
    (user) => user.role === "manager"
  ).length;
  const staffUsers = usersData.users.filter(
    (user) => user.role === "staff"
  ).length;

  document.getElementById("totalUsers").textContent = totalUsers;
  document.getElementById("adminUsers").textContent = adminUsers;
  document.getElementById("managerUsers").textContent = managerUsers;
  document.getElementById("staffUsers").textContent = staffUsers;
}

// Filter users based on search criteria
function filterUsers() {
  const searchTerm = document.getElementById("userSearch").value.toLowerCase();
  const roleFilter = document.getElementById("roleFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  return usersData.users.filter((user) => {
    // Search filter
    const matchesSearch =
      !searchTerm ||
      user.firstName.toLowerCase().includes(searchTerm) ||
      user.lastName.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      user.username.toLowerCase().includes(searchTerm) ||
      `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm);

    // Role filter
    const matchesRole = !roleFilter || user.role === roleFilter;

    // Status filter
    const matchesStatus = !statusFilter || user.status === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });
}

// View user details
function viewUserDetails(userId) {
  const user = usersData.users.find((u) => u.id === userId);
  if (!user) return;

  document.getElementById(
    "userDetailsTitle"
  ).textContent = `User Details: ${user.firstName} ${user.lastName}`;

  // Determine status badge
  let statusClass = "";
  let statusText = "";
  switch (user.status) {
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

  // Determine role badge
  let roleClass = "";
  let roleText = "";
  switch (user.role) {
    case "admin":
      roleClass = "role-admin";
      roleText = "Administrator";
      break;
    case "manager":
      roleClass = "role-manager";
      roleText = "Manager";
      break;
    case "staff":
      roleClass = "role-staff";
      roleText = "Staff";
      break;
  }

  // Get department name
  const departmentNames = {
    sales: "Sales",
    inventory: "Inventory",
    purchasing: "Purchasing",
    finance: "Finance",
    admin: "Administration",
  };
  const departmentName = departmentNames[user.department] || user.department;

  // Get permissions list
  const permissionNames = {
    dashboard: "Dashboard Access",
    products: "Product Management",
    stock: "Stock Management",
    sales: "Sales Management",
    users: "User Management",
    reports: "Reports & Analytics",
    settings: "System Settings",
    export: "Export Data",
  };

  let permissionsHtml = "";
  user.permissions.forEach((perm) => {
    permissionsHtml += `<div>✓ ${permissionNames[perm] || perm}</div>`;
  });

  const detailsContent = document.getElementById("userDetailsContent");
  detailsContent.innerHTML = `
                <div class="user-profile-display">
                    <div class="user-avatar-large">
                        ${user.firstName.charAt(0)}${user.lastName.charAt(0)}
                    </div>
                    <div class="user-info">
                        <div class="user-name">${user.firstName} ${
    user.lastName
  }</div>
                        <div class="user-role"><span class="role-badge ${roleClass}">${roleText}</span></div>
                        <div style="margin-top: 10px; color: #7f8c8d;">${
                          user.email
                        }</div>
                    </div>
                </div>
                
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 30px; margin-bottom: 30px;">
                    <div>
                        <h4 style="margin-bottom: 15px;">Account Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">User ID:</td>
                                <td style="padding: 8px 0; font-weight: 600;">${
                                  user.id
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Username:</td>
                                <td style="padding: 8px 0;">${
                                  user.username
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Status:</td>
                                <td style="padding: 8px 0;"><span class="status-badge ${statusClass}">${statusText}</span></td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Department:</td>
                                <td style="padding: 8px 0;">${departmentName}</td>
                            </tr>
                        </table>
                    </div>
                    <div>
                        <h4 style="margin-bottom: 15px;">Contact Information</h4>
                        <table style="width: 100%;">
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Phone:</td>
                                <td style="padding: 8px 0;">${user.phone}</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Last Login:</td>
                                <td style="padding: 8px 0;">${
                                  user.lastLogin
                                }</td>
                            </tr>
                            <tr>
                                <td style="padding: 8px 0; color: #7f8c8d;">Join Date:</td>
                                <td style="padding: 8px 0;">${
                                  user.joinDate
                                }</td>
                            </tr>
                        </table>
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Permissions</h4>
                    <div style="background: #f8f9fa; border-radius: 10px; padding: 20px;">
                        ${
                          permissionsHtml ||
                          '<div style="color: #7f8c8d; font-style: italic;">No specific permissions assigned</div>'
                        }
                    </div>
                </div>
                
                <div style="margin-bottom: 30px;">
                    <h4 style="margin-bottom: 15px;">Notes</h4>
                    <p style="color: #7f8c8d; font-style: italic;">${
                      user.notes || "No notes available"
                    }</p>
                </div>
                
                <div style="display: flex; justify-content: flex-end; gap: 15px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee;">
                    <button class="btn" onclick="closeUserDetailsModal()">Close</button>
                    <button class="btn btn-warning" onclick="editUser('${
                      user.id
                    }')">
                        <i class="fas fa-edit"></i> Edit User
                    </button>
                    <button class="btn btn-primary" onclick="resetUserPassword('${
                      user.id
                    }')">
                        <i class="fas fa-key"></i> Reset Password
                    </button>
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
  const user = usersData.users.find((u) => u.id === userId);
  if (!user) return;

  document.getElementById("modalTitle").textContent = "Edit User";
  document.getElementById("userModal").classList.add("active");

  // Fill form with user data
  document.getElementById("userFirstName").value = user.firstName;
  document.getElementById("userLastName").value = user.lastName;
  document.getElementById("userEmail").value = user.email;
  document.getElementById("userUsername").value = user.username;
  document.getElementById("userRole").value = user.role;
  document.getElementById("userStatus").value = user.status;
  document.getElementById("userPhone").value = user.phone || "";
  document.getElementById("userDepartment").value = user.department || "";
  document.getElementById("userNotes").value = user.notes || "";

  // Clear password fields for editing
  document.getElementById("userPassword").value = "";
  document.getElementById("userConfirmPassword").value = "";

  // Set permissions
  const permissions = user.permissions || [];
  document.getElementById("permDashboard").checked =
    permissions.includes("dashboard");
  document.getElementById("permProducts").checked =
    permissions.includes("products");
  document.getElementById("permStock").checked = permissions.includes("stock");
  document.getElementById("permSales").checked = permissions.includes("sales");
  document.getElementById("permUsers").checked = permissions.includes("users");
  document.getElementById("permReports").checked =
    permissions.includes("reports");
  document.getElementById("permSettings").checked =
    permissions.includes("settings");
  document.getElementById("permExport").checked =
    permissions.includes("export");

  // Store user ID for update
  document.getElementById("saveUserBtn").dataset.userId = userId;

  // Update permission visibility based on role
  updatePermissionVisibility();
}

// Add new user
function addNewUser() {
  document.getElementById("modalTitle").textContent = "Add New User";
  document.getElementById("userModal").classList.add("active");

  // Clear form
  document.getElementById("userForm").reset();

  // Set default permissions
  document.getElementById("permDashboard").checked = true;
  document.getElementById("permProducts").checked = false;
  document.getElementById("permStock").checked = false;
  document.getElementById("permSales").checked = false;
  document.getElementById("permUsers").checked = false;
  document.getElementById("permReports").checked = false;
  document.getElementById("permSettings").checked = false;
  document.getElementById("permExport").checked = false;

  // Remove stored user ID
  delete document.getElementById("saveUserBtn").dataset.userId;

  // Update permission visibility based on role
  updatePermissionVisibility();
}

// Delete user
function deleteUser(userId) {
  const user = usersData.users.find((u) => u.id === userId);
  if (!user) return;

  // Don't allow deleting your own account
  const currentUser = localStorage.getItem("userName");
  if (`${user.firstName} ${user.lastName}` === currentUser) {
    alert("You cannot delete your own account!");
    return;
  }

  if (
    !confirm(
      `Are you sure you want to delete user ${user.firstName} ${user.lastName}? This action cannot be undone.`
    )
  ) {
    return;
  }

  // In a real app, you would send a delete request to the server
  usersData.users = usersData.users.filter((u) => u.id !== userId);

  // Reload data
  loadUserData();

  // Show success notification
  showNotification(
    `User ${user.firstName} ${user.lastName} deleted successfully!`,
    "success"
  );
}

// Reset user password
function resetUserPassword(userId) {
  const user = usersData.users.find((u) => u.id === userId);
  if (!user) return;

  if (
    confirm(
      `Reset password for ${user.firstName} ${user.lastName}? A temporary password will be generated and sent to their email.`
    )
  ) {
    showNotification(`Password reset email sent to ${user.email}`, "success");
  }
}

// Save user (add or update)
function saveUser(event) {
  event.preventDefault();

  // Get form values
  const firstName = document.getElementById("userFirstName").value;
  const lastName = document.getElementById("userLastName").value;
  const email = document.getElementById("userEmail").value;
  const username = document.getElementById("userUsername").value;
  const password = document.getElementById("userPassword").value;
  const confirmPassword = document.getElementById("userConfirmPassword").value;
  const role = document.getElementById("userRole").value;
  const status = document.getElementById("userStatus").value;
  const phone = document.getElementById("userPhone").value;
  const department = document.getElementById("userDepartment").value;
  const notes = document.getElementById("userNotes").value;

  // Validate passwords if adding new user
  const userId = document.getElementById("saveUserBtn").dataset.userId;
  if (!userId) {
    if (password.length < 6) {
      alert("Password must be at least 6 characters long!");
      return;
    }

    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }
  }

  // Collect permissions
  const permissions = [];
  if (document.getElementById("permDashboard").checked)
    permissions.push("dashboard");
  if (document.getElementById("permProducts").checked)
    permissions.push("products");
  if (document.getElementById("permStock").checked) permissions.push("stock");
  if (document.getElementById("permSales").checked) permissions.push("sales");
  if (document.getElementById("permUsers").checked) permissions.push("users");
  if (document.getElementById("permReports").checked)
    permissions.push("reports");
  if (document.getElementById("permSettings").checked)
    permissions.push("settings");
  if (document.getElementById("permExport").checked) permissions.push("export");

  // Check if we're editing or adding
  if (userId) {
    // Update existing user
    const userIndex = usersData.users.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      usersData.users[userIndex] = {
        ...usersData.users[userIndex],
        firstName: firstName,
        lastName: lastName,
        email: email,
        username: username,
        role: role,
        status: status,
        phone: phone,
        department: department,
        permissions: permissions,
        notes: notes,
      };

      // Update password only if provided
      if (password) {
        // In a real app, you would hash the password before saving
        console.log("Password updated for user:", userId);
      }

      showNotification("User updated successfully!", "success");
    }
  } else {
    // Add new user
    const newUser = {
      id: "U" + (usersData.users.length + 1).toString().padStart(3, "0"),
      firstName: firstName,
      lastName: lastName,
      email: email,
      username: username,
      role: role,
      status: status,
      phone: phone,
      department: department,
      lastLogin: "Never",
      joinDate: new Date().toISOString().split("T")[0],
      permissions: permissions,
      notes: notes,
    };

    usersData.users.push(newUser);
    showNotification("User added successfully!", "success");
  }

  // Close modal
  document.getElementById("userModal").classList.remove("active");

  // Reset form
  document.getElementById("userForm").reset();

  // Reload data
  loadUserData();
}

// Update permission visibility based on role
function updatePermissionVisibility() {
  const role = document.getElementById("userRole").value;
  const permissionsSection = document.getElementById("permissionsSection");

  if (role === "admin") {
    // Admin has all permissions by default
    document.getElementById("permDashboard").checked = true;
    document.getElementById("permProducts").checked = true;
    document.getElementById("permStock").checked = true;
    document.getElementById("permSales").checked = true;
    document.getElementById("permUsers").checked = true;
    document.getElementById("permReports").checked = true;
    document.getElementById("permSettings").checked = true;
    document.getElementById("permExport").checked = true;
    permissionsSection.style.display = "none";
  } else {
    permissionsSection.style.display = "block";

    // Set default permissions based on role
    if (role === "manager") {
      document.getElementById("permDashboard").checked = true;
      document.getElementById("permProducts").checked = true;
      document.getElementById("permStock").checked = true;
      document.getElementById("permSales").checked = true;
      document.getElementById("permUsers").checked = false;
      document.getElementById("permReports").checked = true;
      document.getElementById("permSettings").checked = false;
      document.getElementById("permExport").checked = true;
    } else if (role === "staff") {
      document.getElementById("permDashboard").checked = true;
      document.getElementById("permProducts").checked = true;
      document.getElementById("permStock").checked = true;
      document.getElementById("permSales").checked = true;
      document.getElementById("permUsers").checked = false;
      document.getElementById("permReports").checked = false;
      document.getElementById("permSettings").checked = false;
      document.getElementById("permExport").checked = false;
    }
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
  document.getElementById("addUserBtn").addEventListener("click", addNewUser);
  document
    .getElementById("exportUsersBtn")
    .addEventListener("click", function () {
      showNotification("User list exported successfully!", "success");
    });

  document
    .getElementById("importUsersBtn")
    .addEventListener("click", function () {
      alert("Import Users feature would allow importing users from CSV/Excel.");
    });

  // Apply filters button
  document
    .getElementById("applyFiltersBtn")
    .addEventListener("click", function () {
      loadUsersTable();
      showNotification("Filters applied successfully!", "success");
    });

  // View all activity button
  document
    .getElementById("viewAllActivityBtn")
    .addEventListener("click", function () {
      alert("This would show all user activity in a separate page/modal.");
    });

  // Modal close buttons
  document
    .getElementById("closeUserModal")
    .addEventListener("click", function () {
      document.getElementById("userModal").classList.remove("active");
    });

  document
    .getElementById("closeUserDetailsModal")
    .addEventListener("click", closeUserDetailsModal);

  // Cancel button
  document
    .getElementById("cancelUserBtn")
    .addEventListener("click", function () {
      document.getElementById("userModal").classList.remove("active");
    });

  // User form submission
  document.getElementById("userForm").addEventListener("submit", saveUser);

  // Role change event
  document
    .getElementById("userRole")
    .addEventListener("change", updatePermissionVisibility);

  // Search input with debounce
  let searchTimeout;
  document.getElementById("userSearch").addEventListener("input", function () {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      loadUsersTable();
    }, 500);
  });

  // Filter change events
  document.getElementById("roleFilter").addEventListener("change", function () {
    loadUsersTable();
  });

  document
    .getElementById("statusFilter")
    .addEventListener("change", function () {
      loadUsersTable();
    });

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
