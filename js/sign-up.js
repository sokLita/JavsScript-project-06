// Initialize data storage if not exists
if (!localStorage.getItem("inventorySystemData")) {
  const initialData = {
    users: [
      {
        id: 1,
        username: "admin",
        password: "admin123",
        name: "Administrator",
        role: "admin",
        email: "admin@inventorypro.com",
      },
      {
        id: 2,
        username: "manager",
        password: "manager123",
        name: "Manager User",
        role: "manager",
        email: "manager@inventorypro.com",
      },
      {
        id: 3,
        username: "staff",
        password: "staff123",
        name: "Staff User",
        role: "staff",
        email: "staff@inventorypro.com",
      },
    ],
    products: [],
    categories: [
      {
        id: 1,
        name: "Electronics",
        description: "Electronic devices and accessories",
      },
      { id: 2, name: "Furniture", description: "Office and home furniture" },
      { id: 3, name: "Clothing", description: "Apparel and clothing items" },
      {
        id: 4,
        name: "Home & Kitchen",
        description: "Home and kitchen supplies",
      },
    ],
    suppliers: [
      {
        id: 1,
        name: "Supplier ABC",
        email: "contact@supplierabc.com",
        phone: "+1-234-567-8901",
      },
      {
        id: 2,
        name: "Supplier XYZ",
        email: "info@supplierxyz.com",
        phone: "+1-987-654-3210",
      },
    ],
    stockMovements: [],
    sales: [],
    purchases: [],
    settings: {
      companyName: "InventoryPro",
      currency: "₹",
      taxRate: 18,
    },
  };
  localStorage.setItem("inventorySystemData", JSON.stringify(initialData));
}

// DOM elements
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
const roleOptions = document.querySelectorAll(".role-option");

// Check for remembered credentials
document.addEventListener("DOMContentLoaded", function () {
  const rememberedUser = localStorage.getItem("rememberedUser");
  if (rememberedUser) {
    const user = JSON.parse(rememberedUser);
    usernameInput.value = user.username;
    roleOptions.forEach((option) => {
      if (option.getAttribute("data-role") === user.role) {
        option.classList.add("selected");
        roleInput.value = user.role;
      }
    });
    document.getElementById("remember").checked = true;
  }
});

// Role selection
roleOptions.forEach((option) => {
  option.addEventListener("click", () => {
    roleOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    roleInput.value = option.getAttribute("data-role");
    document.getElementById("roleError").style.display = "none";
  });
});

// Form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleInput.value;
  const rememberMe = document.getElementById("remember").checked;

  // Reset errors
  document.getElementById("usernameError").style.display = "none";
  document.getElementById("passwordError").style.display = "none";
  document.getElementById("roleError").style.display = "none";

  // Validation
  if (!username || !password || !role) {
    if (!username)
      document.getElementById("usernameError").style.display = "block";
    if (!password)
      document.getElementById("passwordError").style.display = "block";
    if (!role) document.getElementById("roleError").style.display = "block";
    return;
  }

  // Get stored data
  const systemData = JSON.parse(localStorage.getItem("inventorySystemData"));
  const users = systemData.users;

  // Find user
  const user = users.find(
    (u) => u.username === username && u.password === password && u.role === role
  );

  if (user) {
    // Store session
    localStorage.setItem("currentUser", JSON.stringify(user));
    localStorage.setItem("isLoggedIn", "true");

    // Remember user if checked
    if (rememberMe) {
      localStorage.setItem(
        "rememberedUser",
        JSON.stringify({ username, role })
      );
    } else {
      localStorage.removeItem("rememberedUser");
    }

    // Show success and redirect
    const loginBtn = document.querySelector(".login-btn");
    loginBtn.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
    loginBtn.style.background = "linear-gradient(to right, #27ae60, #219653)";
    loginBtn.disabled = true;

    setTimeout(() => {
      window.location.href = "pages/dashboard.html";
    }, 1500);
  } else {
    document.getElementById("passwordError").textContent =
      "Invalid credentials";
    document.getElementById("passwordError").style.display = "block";
  }
});

// Forgot password
document
  .querySelector(".forgot-password")
  .addEventListener("click", function (e) {
    e.preventDefault();
    alert(
      "Password reset email would be sent to your registered email address."
    );
  });
