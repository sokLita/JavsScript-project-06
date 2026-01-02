const modal = document.getElementById("modal");
      const categoriesEl = document.getElementById("categories");
      const addBtn = document.getElementById("addBtn");
      const saveBtn = document.getElementById("saveBtn");
      const closeModal = document.querySelector(".close-modal");

      const nameInput = document.getElementById("name");
      const iconInput = document.getElementById("iconInput");
      const iconPreview = document.getElementById("iconPreview");
      const colorInput = document.getElementById("color");
      const descInput = document.getElementById("desc");
      const countInput = document.getElementById("count");
      const modalTitle = document.getElementById("modalTitle");

      let editIndex = null;
      let selectedIcon = "fa-tv";

      /* STORAGE */
      const getData = () =>
        JSON.parse(localStorage.getItem("categories") || "[]");
      const saveData = (d) =>
        localStorage.setItem("categories", JSON.stringify(d));

      /* RENDER */
      function render() {
        categoriesEl.innerHTML = "";
        getData().forEach((c, i) => {
          categoriesEl.innerHTML += `
      <div class="category-card">
        <div class="card-header" style="color:${c.color}">
          <i class="fas ${c.icon}"></i>
        </div>
        <h3>${c.name}</h3>
        <p>${c.desc}</p>
        <div class="card-footer">
          <span class="product-count">${c.count} Products</span>
          <div class="buttons">
            <button onclick="editCat(${i})"><i class="fas fa-pen"></i></button>
            <button onclick="delCat(${i})"><i class="fas fa-trash"></i></button>
          </div>
        </div>
      </div>
    `;
        });
      }
      render();

      /* ADD */
      addBtn.onclick = () => {
        modal.style.display = "block";
        modalTitle.textContent = "Add Category";
        nameInput.value = "";
        iconInput.value = "fa-tv";
        iconPreview.className = "fas fa-tv";
        colorInput.value = "#3b82f6";
        descInput.value = "";
        countInput.value = "";
        selectedIcon = "fa-tv";
        editIndex = null;
      };

      /* ICON PREVIEW */
      iconInput.addEventListener("input", () => {
        selectedIcon = iconInput.value.trim();
        iconPreview.className = "fas " + selectedIcon;
      });

      /* SAVE */
      saveBtn.onclick = () => {
        if (!nameInput.value || !descInput.value || !countInput.value) {
          alert("Please fill all fields");
          return;
        }

        const data = getData();
        const obj = {
          name: nameInput.value,
          icon: selectedIcon,
          color: colorInput.value,
          desc: descInput.value,
          count: countInput.value,
        };

        editIndex === null ? data.push(obj) : (data[editIndex] = obj);
        saveData(data);
        modal.style.display = "none";
        render();
      };

      /* EDIT */
      window.editCat = (i) => {
        const c = getData()[i];
        nameInput.value = c.name;
        iconInput.value = c.icon;
        iconPreview.className = "fas " + c.icon;
        colorInput.value = c.color;
        descInput.value = c.desc;
        countInput.value = c.count;
        editIndex = i;
        modalTitle.textContent = "Edit Category";
        modal.style.display = "block";
      };

      /* DELETE */
      window.delCat = (i) => {
        const d = getData();
        if (confirm("Delete this category?")) {
          d.splice(i, 1);
          saveData(d);
          render();
        }
      };

      closeModal.onclick = () => (modal.style.display = "none");
      window.onclick = (e) => {
        if (e.target === modal) modal.style.display = "none";
      };