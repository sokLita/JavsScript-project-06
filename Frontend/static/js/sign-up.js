let container = document.getElementById("container");
      let roleScreen = document.getElementById("roleScreen");
      let roleInput = document.getElementById("roleInput");
      let roleIcon = document.getElementById("roleIcon");

      function chooseRole(role, iconClass) {
        roleScreen.style.display = "none";
        container.style.display = "block";
        roleInput.value = role;
        roleIcon.className = "fa " + iconClass;
        container.classList.add("sign-in");
      }

      function toggle() {
        container.classList.toggle("sign-in");
        container.classList.toggle("sign-up");
      }

      // Go back to role selection
      function goBack() {
        container.style.display = "none";
        roleScreen.style.display = "flex";
        // Reset form state
        container.classList.remove("sign-in", "sign-up");
      }