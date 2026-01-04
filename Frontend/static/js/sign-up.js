// DOM elements
const loginForm = document.getElementById("loginForm");
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const roleInput = document.getElementById("role");
const roleOptions = document.querySelectorAll(".role-option");
const usernameError = document.getElementById("usernameError");
const passwordError = document.getElementById("passwordError");
const roleError = document.getElementById("roleError");

// Demo credentials for each role
const credentials = {
  admin: {
    username: "admin",
    password: "admin123",
    name: "Administrator",
  },
  manager: {
    username: "manager",
    password: "manager123",
    name: "Manager User",
  },
  staff: {
    username: "staff",
    password: "staff123",
    name: "Staff User",
  },
};

// Check if user is already logged in (for "Remember me")
document.addEventListener("DOMContentLoaded", function () {
  const savedUsername = localStorage.getItem("rememberedUsername");
  const savedRole = localStorage.getItem("rememberedRole");

  if (savedUsername && savedRole) {
    usernameInput.value = savedUsername;

    // Select the saved role
    roleOptions.forEach((option) => {
      if (option.getAttribute("data-role") === savedRole) {
        option.classList.add("selected");
        roleInput.value = savedRole;
      }
    });

    document.getElementById("remember").checked = true;
  }
});

// Role selection functionality
roleOptions.forEach((option) => {
  option.addEventListener("click", () => {
    // Remove selected class from all options
    roleOptions.forEach((opt) => opt.classList.remove("selected"));

    // Add selected class to clicked option
    option.classList.add("selected");

    // Set the role value
    const selectedRole = option.getAttribute("data-role");
    roleInput.value = selectedRole;

    // Clear role error if any
    roleError.style.display = "none";
  });
});

// Form submission
loginForm.addEventListener("submit", function (e) {
  e.preventDefault();

  // Reset errors
  usernameError.style.display = "none";
  passwordError.style.display = "none";
  roleError.style.display = "none";

  // Get form values
  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();
  const role = roleInput.value;
  const rememberMe = document.getElementById("remember").checked;

  // Validation flags
  let isValid = true;

  // Validate username
  if (!username) {
    usernameError.textContent = "Please enter your username";
    usernameError.style.display = "block";
    isValid = false;
  }

  // Validate password
  if (!password) {
    passwordError.textContent = "Please enter your password";
    passwordError.style.display = "block";
    isValid = false;
  }

  // Validate role
  if (!role) {
    roleError.style.display = "block";
    isValid = false;
  }

  // If form is valid, check credentials
  if (isValid) {
    // Check if credentials match the selected role
    if (
      credentials[role] &&
      username === credentials[role].username &&
      password === credentials[role].password
    ) {
      // Store user data in localStorage
      localStorage.setItem("loggedIn", "true");
      localStorage.setItem("userRole", role);
      localStorage.setItem("userName", credentials[role].name);

      // Store for "Remember me" if checked
      if (rememberMe) {
        localStorage.setItem("rememberedUsername", username);
        localStorage.setItem("rememberedRole", role);
      } else {
        localStorage.removeItem("rememberedUsername");
        localStorage.removeItem("rememberedRole");
      }

      // Successful login
      showLoginSuccess(role);
    } else {
      // Failed login
      if (credentials[role] && username === credentials[role].username) {
        // Username is correct but password is wrong
        passwordError.textContent = "Incorrect password for this role";
        passwordError.style.display = "block";
      } else {
        // Username doesn't match the selected role
        usernameError.textContent = `Username doesn't match ${role} role`;
        usernameError.style.display = "block";
      }
    }
  }
});

// Function to show login success and redirect
function showLoginSuccess(role) {
  // Change button text and color
  const loginBtn = document.querySelector(".login-btn");
  loginBtn.innerHTML = '<i class="fas fa-check"></i> Login Successful!';
  loginBtn.style.background = "linear-gradient(to right, #27ae60, #219653)";

  // Disable the button
  loginBtn.disabled = true;

  // Show success message
  const formTitle = document.querySelector(".form-title");
  const originalTitle = formTitle.textContent;
  formTitle.textContent = `Welcome, ${role.toUpperCase()}!`;
  formTitle.style.color = "#27ae60";

  // Create and show success message
  const successMsg = document.createElement("div");
  successMsg.className = "demo-credentials";
  successMsg.style.backgroundColor = "#d5f4e6";
  successMsg.style.borderLeftColor = "#27ae60";
  successMsg.innerHTML = `
                <div class="demo-title">Login Successful!</div>
                <div class="demo-list">
                    <p>You are logged in as <strong>${role}</strong>.</p>
                    <p>Redirecting to dashboard...</p>
                </div>
            `;

  // Insert success message after the form
  loginForm.parentNode.insertBefore(successMsg, loginForm.nextSibling);

  // Redirect to dashboard after 2 seconds
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 2000);
}

// Forgot password functionality
document
  .querySelector(".forgot-password")
  .addEventListener("click", function (e) {
    e.preventDefault();
    alert(
      "Password reset feature would be implemented here. In a real application, this would send a reset link to the user's email."
    );
  });

// Auto-fill demo credentials on click
document.querySelectorAll(".demo-list div").forEach((item) => {
  if (
    item.textContent.includes("Admin:") ||
    item.textContent.includes("Manager:") ||
    item.textContent.includes("Staff:")
  ) {
    item.style.cursor = "pointer";
    item.addEventListener("click", function () {
      const text = this.textContent;
      const parts = text.split(": ");
      const roleName = parts[0].toLowerCase();
      const creds = parts[1].split(" / ");

      // Fill the form
      usernameInput.value = creds[0];
      passwordInput.value = creds[1];

      // Select the corresponding role
      roleOptions.forEach((opt) => {
        opt.classList.remove("selected");
        if (opt.getAttribute("data-role") === roleName) {
          opt.classList.add("selected");
          roleInput.value = roleName;
        }
      });

      // Show a brief notification
      const notification = document.createElement("div");
      notification.textContent = `Demo ${roleName} credentials filled`;
      notification.style.position = "fixed";
      notification.style.top = "20px";
      notification.style.right = "20px";
      notification.style.backgroundColor = "#3498db";
      notification.style.color = "white";
      notification.style.padding = "10px 20px";
      notification.style.borderRadius = "5px";
      notification.style.zIndex = "1000";
      notification.style.boxShadow = "0 3px 10px rgba(0,0,0,0.2)";
      document.body.appendChild(notification);

      setTimeout(() => {
        notification.remove();
      }, 2000);
    });
  }
});
