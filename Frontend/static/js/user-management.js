
document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const openBtn = document.getElementById('open-modal');
    const overlay = document.getElementById('modal-overlay');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');
    const form = document.getElementById('add-user-form');
    const tbody = document.querySelector('table tbody');

    // Today's date: 2026-01-02 format
    const todayDate = () => {
        const d = new Date();
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
    };

    // Open modal
    openBtn.onclick = () => {
        overlay.style.display = 'flex';
        form.reset();
    };

    // Close modal
    const closeModal = () => {
        overlay.style.display = 'none';
    };

    closeBtn.onclick = closeModal;
    cancelBtn.onclick = closeModal;
    overlay.onclick = (e) => {
        if (e.target === overlay) closeModal();
    };

    // Add new user when form submitted
    form.onsubmit = (e) => {
        e.preventDefault();

        const fullName = document.getElementById('full-name').value.trim();
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const role = document.getElementById('role').value;

        if (!fullName || !username || !email || !role) {
            alert('Please fill all fields.');
            return;
        }

        const roleClass = role === 'admin' ? 'admin' : role === 'manager' ? 'manager' : 'staff';
        const roleText = role.charAt(0).toUpperCase() + role.slice(1);

        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${fullName}</td>
            <td>${username}</td>
            <td>${email}</td>
            <td><span class="role-badge ${roleClass}">${roleText}</span></td>
            <td>${todayDate()}</td>
            <td class="actions">
                <button class="btn-edit" title="Edit"><i class="fa-solid fa-pen-to-square"></i></button>
                <button class="btn-delete" title="Delete"><i class="fa-solid fa-trash"></i></button>
            </td>
        `;

        tbody.appendChild(row);
        alert(`User "${fullName}" added successfully!`);
        closeModal();
        form.reset();
    };

    // Delete user when trash icon clicked
    tbody.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn && confirm('Are you sure you want to delete this user?')) {
            deleteBtn.closest('tr').remove();
        }
    });
});
