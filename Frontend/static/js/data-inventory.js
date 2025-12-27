document.addEventListener('DOMContentLoaded', function () {
    initializeDataTable();
    setupBackupButtons();
    setupExportButtons();
    setupSystemSettings();
})

function initializeDataTable() {
    const simpleData = [
        {
            name: "Laptop Dell",
            code: "DL -001",
            category: "Electronics",
            supplier: "Dell Cambodia",
            price: 1200,
            cost: 1000,
            quantity: 5,
            totalValue: 6000,
            description: "Business Laptop"
        },
        {
            name: "Mouse Logitech",
            code: "MS-002",
            category: "Accessories",
            supplier: "Logitech",
            price: 25,
            cost: 18,
            quantity: 20,
            totalValue: 500,
            description: "Wireless Mouse"
        },
        {
            name: "Keyboard Mechanical",
            code: "KB-003",
            category: "Accessories",
            supplier: "Razer",
            price: 80,
            cost: 60,
            quantity: 15,
            totalValue: 1200,
            description: "Gaming Keyboard"
        },
        {
            name: "Monitor 27\"",
            code: "MN-004",
            category: "Electronics",
            supplier: "Samsung",
            price: 300,
            cost: 250,
            quantity: 8,
            totalValue: 2400,
            description: "4K Monitor"
        },
        {
            name: "Webcam HD",
            code: "WC-005",
            category: "Electronics",
            supplier: "Logitech",
            price: 50,
            cost: 35,
            quantity: 25,
            totalValue: 1250,
            description: "1080p Webcam"
        }
    ]
    window.inventoryData = simpleData;
}

function setupBackupButtons() {
    const backupBtn = document.querySelector('.btn-backup-left');
    const restoreBtn = document.querySelector('.btn-backup-right');
    const backupFileInput = document.querySelector('.btn-backup-left input[type="file"]');
    const restoreFileInput = document.querySelector('.btn-backup-right input[type="file"]');

    backupBtn.addEventListener('click', function (e) {
        e.preventDefault();
        backupData();
    });

    backupFileInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            alert('Backup file selected:' + e.target.files[0].name);
        }
    });
    restoreFileInput.addEventListener('change', function (e) {
        if (e.target.files.length > 0) {
            const fileName = e.target.files[0].name;
            if (confirm('Are you sure you want to restore data from' + fileName + '?\nThis will overwrite existing data.')) {
                restoreData(e.target.files[0]);
            }

        }
    });
}

function backupData() {
    try {
        const dataStr = JSON.stringify(window.inventoryData, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });

        const url = URL.createObjectURL(dataBlob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('Backup completed successfully!', 'success');
    } catch (error) {
        console.error('Backup error:', error);
        showNotification('Backup failed. Please try again.', 'error');
    }
}


function restoreData(file) {
    const reader = new FileReader();

    reader.onload = function (e) {
        try {
            const restoreData = JSON.parse(e.target.result);

            if (Array.isArray(restoreData)) {
                window.inventoryData = restoreData;

                showNotification('Data restored successfully!' + restoreData.length + 'item loaded', 'success');

                updateExportTable();
            } else {
                throw new Error('Invalid data format');
            }
        } catch (error) {
            console.error('Restore error:', error);
            showNotification('Failed to restore data. Invalid file format.', 'error')
        };
    }
    reader.onerror = function () {
        showNotification('Error reading file. Please try again.', 'error');
    };

    reader.readAsText(file);
}

function setupExportButtons() {
    // The export buttons already have onclick handlers in HTML
    // We'll just make sure the functions exist
}

function exportData(format) {
    switch (format) {
        case 'excel':
            exportToExcel();
            break;
        case 'pdf':
            exportToPDF();
            break;
        case 'csv':
            exportToCSV();
            break;
        default:
            console.error('Unknown export format:', format);
    }
}

function exportToExcel() {
    try {
        const ws = XLSX.utils.json_to_sheet(window.inventoryData.map(item => ({
            Name: item.name,
            Code: item.code,
            Category: item.category,
            Supplier: item.supplier,
            Price: `$${item.price}`,
            Cost: `$${item.cost}`,
            Quantity: item.quantity,
            'Total Value': `$${item.totalValue}`,
            Description: item.description
        })));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

        XLSX.writeFile(wb, `inventory_export_${new Date().toISOString().split('T')[0]}.xlsx`);

        showNotification('Excel export completed successfully!', 'success');
    } catch (error) {
        console.error('Excel export error:', error);
        showNotification('Excel export failed. Please try again.', 'error');
    }
}

function exportToPDF() {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();

        doc.setFontSize(16);
        doc.text('Inventory Report', 14, 15);
        doc.setFontSize(10);
        doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 22);

        const tableData = window.inventoryData.map(item => [
            item.name,
            item.code,
            item.category,
            item.supplier,
            `$${item.price}`,
            `$${item.cost}`,
            item.quantity,
            `$${item.totalValue}`,
            item.description
        ]);

        doc.autoTable({
            head: [['Name', 'Code', 'Category', 'Supplier', 'Price', 'Cost', 'Quantity', 'Total Value', 'Description']],
            body: tableData,
            startY: 30,
            theme: 'grid',
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });

        doc.save(`inventory_export_${new Date().toISOString().split('T')[0]}.pdf`);

        showNotification('PDF export completed successfully!', 'success');
    } catch (error) {
        console.error('PDF export error:', error);
        showNotification('PDF export failed. Please try again.', 'error');
    }
}


function exportToCSV() {
    try {
        const headers = ['Name', 'Code', 'Category', 'Supplier', 'Price', 'Cost', 'Quantity', 'Total Value', 'Description'];
        const csvRows = [headers.join(',')];

        window.inventoryData.forEach(item => {
            const row = [
                `"${item.name}"`,
                `"${item.code}"`,
                `"${item.category}"`,
                `"${item.supplier}"`,
                `$${item.price}`,
                `$${item.cost}`,
                item.quantity,
                `$${item.totalValue}`,
                `"${item.description}"`
            ];
            csvRows.push(row.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `inventory_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification('CSV export completed successfully!', 'success');
    } catch (error) {
        console.error('CSV export error:', error);
        showNotification('CSV export failed. Please try again.', 'error');
    }
}

function setupSystemSettings() {
    const saveBtn = document.querySelector('.btn-backup-left[type="button"]');
    const thresholdInput = document.querySelector('input[type="number"]');

    const savedThreshold = localStorage.getItem('lowStockThreshold');
    if (savedThreshold) {
        thresholdInput.value = savedThreshold;
    }

    saveBtn.addEventListener('click', function () {
        const threshold = parseInt(thresholdInput.value);

        if (isNaN(threshold) || threshold < 0) {
            showNotification('Please enter a valid number for low stock threshold.', 'error');
            return;
        }

        localStorage.setItem('lowStockThreshold', threshold);

        updateLowStockIndicators(threshold);

        showNotification(`Low stock threshold saved to ${threshold}`, 'success');
    });
}


function updateLowStockIndicators(threshold) {
    console.log(`Low stock threshold set to: ${threshold}`);
}

function updateExportTable() {
    const tbody = document.querySelector('#dataTable tbody');
    tbody.innerHTML = '';

    window.inventoryData.forEach(item => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.name}</td>
            <td>${item.code}</td>
            <td>${item.category}</td>
            <td>${item.supplier}</td>
            <td>${item.price}</td>
            <td>${item.cost}</td>
            <td>${item.quantity}</td>
            <td>${item.totalValue}</td>
            <td>${item.description}</td>
        `;
        tbody.appendChild(row);
    });
}


function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button onclick="this.parentElement.remove()">&times;</button>
    `;

    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 5px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 300px;
                max-width: 400px;
                z-index: 1000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            }
            .notification-success { background-color: #4CAF50; }
            .notification-error { background-color: #f44336; }
            .notification-info { background-color: #2196F3; }
            .notification button {
                background: none;
                border: none;
                color: white;
                font-size: 20px;
                cursor: pointer;
                margin-left: 15px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

document.querySelectorAll('.sidebar li').forEach(item => {
    item.addEventListener('click', function () {
        document.querySelectorAll('.sidebar li').forEach(li => li.classList.remove('active'));
        this.classList.add('active');

        const itemText = this.textContent.trim();
        showNotification(`Navigating to ${itemText}`, 'info');
    });
});

const userInfo = document.querySelector('.user-info');
userInfo.addEventListener('click', function () {
    if (!document.querySelector('.user-dropdown')) {
        const dropdown = document.createElement('div');
        dropdown.className = 'user-dropdown';
        dropdown.innerHTML = `
            <div class="dropdown-item">Profile</div>
            <div class="dropdown-item">Settings</div>
            <div class="dropdown-item">Logout</div>
        `;

        // Add styles
        const style = document.createElement('style');
        style.textContent = `
            .user-dropdown {
                position: absolute;
                top: 50px;
                right: 20px;
                background: white;
                border-radius: 5px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                min-width: 150px;
                z-index: 100;
                display: none;
            }
            .user-dropdown.show {
                display: block;
            }
            .dropdown-item {
                padding: 12px 20px;
                cursor: pointer;
                transition: background 0.3s;
            }
            .dropdown-item:hover {
                background: #f5f5f5;
            }
            .dropdown-item:not(:last-child) {
                border-bottom: 1px solid #eee;
            }
        `;
        document.head.appendChild(style);

        document.body.appendChild(dropdown);

        dropdown.querySelectorAll('.dropdown-item').forEach(item => {
            item.addEventListener('click', function () {
                showNotification(`${this.textContent} clicked`, 'info');
                dropdown.classList.remove('show');
            });
        });

        dropdown.classList.toggle('show');

        document.addEventListener('click', function closeDropdown(e) {
            if (!userInfo.contains(e.target) && !dropdown.contains(e.target)) {
                dropdown.classList.remove('show');
                document.removeEventListener('click', closeDropdown);
            }
        });
    } else {
        const dropdown = document.querySelector('.user-dropdown');
        dropdown.classList.toggle('show');
    }
});