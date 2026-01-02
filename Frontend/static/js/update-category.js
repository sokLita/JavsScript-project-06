let data = [
  {id:"P56503", type:"Graphic Cards", category:"Gaming", subcategory:"High-end", name:"GTX 1070 Ti", qty:45},
  {id:"P56504", type:"Graphic Cards", category:"Gaming", subcategory:"Mid-range", name:"RX 580", qty:54}
];
let itemTypes = ["Graphic Cards"];
let categories = ["Gaming"];
let subcategories = ["High-end","Mid-range"];

let editIndex = null;
let currentModal = "";

/* DRAW TABLE */
function draw(filter=""){
  const rowsEl = document.getElementById('rows');
  rowsEl.innerHTML = "";
  data.filter(d => d.id.includes(filter) || d.name.toLowerCase().includes(filter.toLowerCase()))
      .forEach((d,i)=>{
    rowsEl.innerHTML += `
      <tr class="${d.qty>30?'low':''}">
        <td>${d.id}</td>
        <td>${d.type}</td>
        <td>${d.name}</td>
        <td>${d.qty}</td>
        <td><span class="badge ${d.qty>30?'yes':'no'}">${d.qty>30?'Yes':'No'}</span></td>
        <td class="actions">
          <button class="edit" onclick="editItem(${i})"><i class="fa fa-edit"></i></button>
          <button class="delete" onclick="del(${i})"><i class="fa fa-trash"></i></button>
        </td>
      </tr>`;
  });
}
draw();

/* OPEN MODAL */
function openModal(type, isEdit=false){
  currentModal = type;
  if(!isEdit) editIndex = null;

  modalTitle.innerText = type==='item' ? (isEdit?"Edit Item":"Add Inventory Item") :
                         type==='type' ? "Add Item Type" :
                         type==='category' ? "Add Item Category" :
                         "Add Item Subcategory";

  const content = document.getElementById('modalContent');
  if(type==='item'){
    content.innerHTML = `
      <input id="id" placeholder="Item ID">
      <select id="type">${itemTypes.map(t=>`<option>${t}</option>`).join("")}</select>
      <select id="category">${categories.map(c=>`<option>${c}</option>`).join("")}</select>
      <select id="subcategory">${subcategories.map(s=>`<option>${s}</option>`).join("")}</select>
      <input id="name" placeholder="Item Name">
      <input id="qty" placeholder="Remaining QTY" type="number">`;
    if(isEdit && editIndex!==null){
      const item = data[editIndex];
      document.getElementById('id').value = item.id;
      document.getElementById('type').value = item.type;
      document.getElementById('category').value = item.category;
      document.getElementById('subcategory').value = item.subcategory;
      document.getElementById('name').value = item.name;
      document.getElementById('qty').value = item.qty;
    }
  } else {
    content.innerHTML = `<input id="nameField" placeholder="Enter ${modalTitle.innerText}">`;
  }
  modal.style.display="flex";
}

/* EDIT ITEM */
function editItem(i){
  editIndex = i;
  openModal('item', true);
}

/* SAVE */
function save(){
  if(currentModal==='item'){
    const obj = {
      id: document.getElementById('id').value,
      type: document.getElementById('type').value,
      category: document.getElementById('category').value,
      subcategory: document.getElementById('subcategory').value,
      name: document.getElementById('name').value,
      qty: +document.getElementById('qty').value
    };
    if(editIndex===null){ data.push(obj); } 
    else { data[editIndex] = obj; }
    draw();
  } else if(currentModal==='type'){
    itemTypes.push(document.getElementById('nameField').value);
    alert("Item Type added!");
  } else if(currentModal==='category'){
    categories.push(document.getElementById('nameField').value);
    alert("Category added!");
  } else {
    subcategories.push(document.getElementById('nameField').value);
    alert("Subcategory added!");
  }
  closeModal();
}

/* DELETE */
function del(i){
  if(confirm("Delete this item?")){
    data.splice(i,1);
    draw();
  }
}

/* SEARCH */
function searchItem(){
  draw(document.getElementById('search').value);
}

/* CLOSE MODAL */
function closeModal(){
  modal.style.display = "none";
  editIndex = null;
}
window.onclick = e => { if(e.target==modal) closeModal(); }
document.getElementById('saveBtn').onclick = save;