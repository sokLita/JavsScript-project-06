// transaction-history.js - Transaction History Management

document.addEventListener('DOMContentLoaded', function () {
    // Initialize transaction history
    initializeTransactionHistory();
    setupEventListeners();
    loadTransactionData();
    updateStatsCards();
    setupSidebarNavigation();
});

// Global variables
let transactions = [];
let filteredTransactions = [];
let currentPage = 1;
const itemsPerPage = 10;
let currentFilters = {
    type: 'all',
    item: '',
    dateFrom: '',
    dateTo: ''
};

// Initialize transaction history
function initializeTransactionHistory() {
    // Load saved filters from localStorage
    loadSavedFilters();

    // Set default date range to last 30 days
    setDefaultDateRange();
}

// Load saved filters from localStorage
function loadSavedFilters() {
    const savedFilters = localStorage.getItem('transactionFilters');
    if (savedFilters) {
        currentFilters = JSON.parse(savedFilters);

        // Apply saved filters to form controls
        document.getElementById('transactionType').value = currentFilters.type;
        document.getElementById('itemFilter').value = currentFilters.item;
        document.getElementById('dateFrom').value = currentFilters.dateFrom;
        document.getElementById('dateTo').value = currentFilters.dateTo;
    }
}

// Save filters to localStorage
function saveFilters() {
    localStorage.setItem('transactionFilters', JSON.stringify(currentFilters));
}

// Set default date range (last 30 days)
function setDefaultDateRange() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);

    const dateFromInput = document.getElementById('dateFrom');
    const dateToInput = document.getElementById('dateTo');

    if (!currentFilters.dateFrom) {
        dateFromInput.valueAsDate = thirtyDaysAgo;
        currentFilters.dateFrom = formatDateForInput(thirtyDaysAgo);
    }

    if (!currentFilters.dateTo) {
        dateToInput.valueAsDate = today;
        currentFilters.dateTo = formatDateForInput(today);
    }
}

// Format date for input field
function formatDateForInput(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// Setup event listeners
function setupEventListeners() {
    // Filter controls
    document.getElementById('transactionType').addEventListener('change', updateFilters);
    document.getElementById('itemFilter').addEventListener('input', updateFilters);
    document.getElementById('dateFrom').addEventListener('change', updateFilters);
    document.getElementById('dateTo').addEventListener('change', updateFilters);

    // Apply filters button
    document.querySelector('.btn-apply[onclick="applyFilters()"]').addEventListener('click', applyFilters);

    // Export button
    document.querySelector('.btn-apply[onclick="exportTransactionHistory()"]').addEventListener('click', exportTransactionHistory);

    // Close modal button
    document.querySelector('.close-modal').addEventListener('click', closeModal);

    // Modal close on outside click
    document.getElementById('transactionModal').addEventListener('click', function (e) {
        if (e.target === this) closeModal();
    });

    // Print button in modal
    document.querySelector('.btn-apply[onclick="printTransaction()"]').addEventListener('click', printTransaction);
}

// Update filters from form controls
function updateFilters() {
    currentFilters.type = document.getElementById('transactionType').value;
    currentFilters.item = document.getElementById('itemFilter').value.toLowerCase();
    currentFilters.dateFrom = document.getElementById('dateFrom').value;
    currentFilters.dateTo = document.getElementById('dateTo').value;

    // Validate date range
    if (currentFilters.dateFrom && currentFilters.dateTo) {
        const fromDate = new Date(currentFilters.dateFrom);
        const toDate = new Date(currentFilters.dateTo);

        if (fromDate > toDate) {
            showNotification('Start date cannot be after end date', 'error');
            return;
        }
    }
}

// Apply filters and refresh table
function applyFilters() {
    updateFilters();
    saveFilters();
    filterTransactions();
    updateStatsCards();
    renderTransactionTable();
    showNotification('Filters applied successfully', 'success');
}

// Load transaction data
function loadTransactionData() {
    // Sample transaction data for demonstration
    // In a real application, this would come from an API
    transactions = generateSampleTransactions(100);
    filterTransactions();
    renderTransactionTable();
}

// Generate sample transactions
function generateSampleTransactions(count) {
    const transactionTypes = ['restock', 'sale', 'return', 'adjustment'];
    const items = [
        { name: 'Laptop Dell', category: 'Electronics', price: 1200 },
        { name: 'Mouse Logitech', category: 'Accessories', price: 25 },
        { name: 'Keyboard Mechanical', category: 'Accessories', price: 80 },
        { name: 'Monitor 27"', category: 'Electronics', price: 300 },
        { name: 'Webcam HD', category: 'Electronics', price: 50 },
        { name: 'Desk Chair', category: 'Furniture', price: 150 },
        { name: 'Office Desk', category: 'Furniture', price: 400 },
        { name: 'Printer', category: 'Electronics', price: 200 },
        { name: 'Paper A4', category: 'Office Supplies', price: 5 },
        { name: 'Ink Cartridge', category: 'Office Supplies', price: 30 }
    ];

    const users = ['Admin User', 'Manager John', 'Sales Sarah', 'Warehouse Mike'];

    const transactions = [];
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 60); // Last 60 days

    for (let i = 0; i < count; i++) {
        const transactionType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];
        const item = items[Math.floor(Math.random() * items.length)];
        const quantity = transactionType === 'sale' ?
            Math.floor(Math.random() * 5) + 1 :
            transactionType === 'restock' ?
                Math.floor(Math.random() * 20) + 5 :
                Math.floor(Math.random() * 3) + 1;

        // Different pricing logic based on transaction type
        let unitPrice = item.price;
        let totalValue;

        if (transactionType === 'sale') {
            unitPrice = item.price * 1.2; // Sales are 20% more expensive
            totalValue = unitPrice * quantity;
        } else if (transactionType === 'restock') {
            unitPrice = item.price * 0.9; // Restock at 90% of price
            totalValue = unitPrice * quantity;
        } else {
            totalValue = unitPrice * quantity;
        }

        // Random date within the last 60 days
        const randomDays = Math.floor(Math.random() * 60);
        const transactionDate = new Date(startDate);
        transactionDate.setDate(transactionDate.getDate() + randomDays);

        // Random time
        const hours = Math.floor(Math.random() * 24);
        const minutes = Math.floor(Math.random() * 60);
        transactionDate.setHours(hours, minutes);

        transactions.push({
            id: `TRX-${String(i + 1).padStart(5, '0')}`,
            type: transactionType,
            date: transactionDate.toISOString(),
            item: item.name,
            category: item.category,
            quantity: quantity,
            unitPrice: parseFloat(unitPrice.toFixed(2)),
            totalValue: parseFloat(totalValue.toFixed(2)),
            user: users[Math.floor(Math.random() * users.length)],
            notes: getTransactionNotes(transactionType, item.name, quantity)
        });
    }

    // Sort by date (newest first)
    return transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
}

// Get transaction notes based on type
function getTransactionNotes(type, item, quantity) {
    const notes = {
        restock: `Restocked ${quantity} units of ${item}`,
        sale: `Sold ${quantity} units of ${item}`,
        return: `Returned ${quantity} units of ${item}`,
        adjustment: `Adjusted inventory by ${quantity} units for ${item}`
    };
    return notes[type] || 'Transaction completed';
}

// Filter transactions based on current filters
function filterTransactions() {
    filteredTransactions = transactions.filter(transaction => {
        // Filter by type
        if (currentFilters.type !== 'all' && transaction.type !== currentFilters.type) {
            return false;
        }

        // Filter by item name
        if (currentFilters.item && !transaction.item.toLowerCase().includes(currentFilters.item)) {
            return false;
        }

        // Filter by date range
        const transactionDate = new Date(transaction.date);
        if (currentFilters.dateFrom) {
            const fromDate = new Date(currentFilters.dateFrom);
            if (transactionDate < fromDate) return false;
        }

        if (currentFilters.dateTo) {
            const toDate = new Date(currentFilters.dateTo);
            toDate.setHours(23, 59, 59, 999); // End of day
            if (transactionDate > toDate) return false;
        }

        return true;
    });

    // Update total transactions count
    document.getElementById('totalTransactions').textContent =
        `${filteredTransactions.length} transaction${filteredTransactions.length !== 1 ? 's' : ''} found`;
}

// Render transaction table
function renderTransactionTable() {
    const tableBody = document.getElementById('transactionTableBody');

    if (filteredTransactions.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table">
                    <i class="bx bx-search"></i>
                    <p>No transactions found matching your filters</p>
                </td>
            </tr>
        `;
        updatePagination();
        return;
    }

    // Calculate pagination
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, filteredTransactions.length);
    const pageTransactions = filteredTransactions.slice(startIndex, endIndex);

    // Render table rows
    tableBody.innerHTML = pageTransactions.map(transaction => `
        <tr class="transaction-row ${transaction.type}" 
            data-id="${transaction.id}"
            onclick="showTransactionDetails('${transaction.id}')">
            <td>
                <div class="transaction-date">${formatDate(transaction.date)}</div>
                <div class="transaction-time">${formatTime(transaction.date)}</div>
            </td>
            <td>
                <div class="transaction-id">${transaction.id}</div>
            </td>
            <td>
                <span class="transaction-type type-${transaction.type}">
                    <i class="bx bx-${getTransactionTypeIcon(transaction.type)}"></i>
                    ${capitalizeFirstLetter(transaction.type)}
                </span>
            </td>
            <td>
                <div class="transaction-item">${transaction.item}</div>
                <div class="transaction-category">${transaction.category}</div>
            </td>
            <td>
                <div class="transaction-quantity ${transaction.quantity > 10 ? 'quantity-high' : transaction.quantity < 0 ? 'quantity-negative' : ''}">
                    ${transaction.quantity > 0 ? '+' : ''}${transaction.quantity}
                </div>
            </td>
            <td>
                <div class="transaction-price">$${transaction.unitPrice.toFixed(2)}</div>
            </td>
            <td>
                <div class="transaction-total">$${transaction.totalValue.toFixed(2)}</div>
            </td>
            <td>
                <div class="transaction-user">${transaction.user}</div>
            </td>
            <td>
                <div class="transaction-actions">
                    <button class="btn-action view" onclick="event.stopPropagation(); showTransactionDetails('${transaction.id}')">
                        <i class="bx bx-show"></i>
                    </button>
                    <button class="btn-action print" onclick="event.stopPropagation(); printSpecificTransaction('${transaction.id}')">
                        <i class="bx bx-printer"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    updatePagination();
}

// Update pagination controls
function updatePagination() {
    const totalPages = Math.ceil(filteredTransactions.length / itemsPerPage);
    const paginationContainer = document.querySelector('.pagination');

    if (totalPages <= 1) {
        paginationContainer.style.display = 'none';
        return;
    }

    paginationContainer.style.display = 'flex';

    // Clear existing buttons
    paginationContainer.innerHTML = '';

    // Previous button
    const prevButton = document.createElement('button');
    prevButton.className = 'pagination-btn';
    prevButton.innerHTML = '<i class="bx bx-chevron-left"></i>';
    prevButton.disabled = currentPage === 1;
    prevButton.onclick = () => changePage(currentPage - 1);
    paginationContainer.appendChild(prevButton);

    // Page buttons
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
        const pageButton = document.createElement('button');
        pageButton.className = `pagination-btn ${i === currentPage ? 'active' : ''}`;
        pageButton.textContent = i;
        pageButton.onclick = () => changePage(i);
        paginationContainer.appendChild(pageButton);
    }

    // Next button
    const nextButton = document.createElement('button');
    nextButton.className = 'pagination-btn';
    nextButton.innerHTML = '<i class="bx bx-chevron-right"></i>';
    nextButton.disabled = currentPage === totalPages;
    nextButton.onclick = () => changePage(currentPage + 1);
    paginationContainer.appendChild(nextButton);
}

// Change page
function changePage(page) {
    if (page < 1 || page > Math.ceil(filteredTransactions.length / itemsPerPage)) {
        return;
    }

    currentPage = page;
    renderTransactionTable();

    // Scroll to top of table
    document.querySelector('.transaction-table-container').scrollIntoView({
        behavior: 'smooth',
        block: 'start'
    });
}

// Update stats cards
function updateStatsCards() {
    const stats = {
        restock: 0,
        sale: 0,
        return: 0,
        adjustment: 0
    };

    // Count transactions by type for the current month
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    filteredTransactions.forEach(transaction => {
        const transactionDate = new Date(transaction.date);
        if (transactionDate.getMonth() === currentMonth &&
            transactionDate.getFullYear() === currentYear) {
            stats[transaction.type]++;
        }
    });

    // Update stats cards
    document.querySelectorAll('.stat-card').forEach((card, index) => {
        const statName = ['restock', 'sale', 'return', 'adjustment'][index];
        card.querySelector('h3').textContent = stats[statName];
    });
}

// Show transaction details in modal
function showTransactionDetails(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (!transaction) return;

    const modal = document.getElementById('transactionModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');

    modalTitle.textContent = `Transaction Details - ${transaction.id}`;

    modalBody.innerHTML = `
        <div class="transaction-detail">
            <div class="detail-header detail-${transaction.type}">
                <div class="detail-type">
                    <i class="bx bx-${getTransactionTypeIcon(transaction.type)}"></i>
                    <span>${capitalizeFirstLetter(transaction.type)}</span>
                </div>
                <div class="detail-id">${transaction.id}</div>
            </div>
            
            <div class="detail-body">
                <div class="detail-row">
                    <div class="detail-label">Date & Time</div>
                    <div class="detail-value">${formatDateTime(transaction.date)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Item</div>
                    <div class="detail-value">${transaction.item}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Category</div>
                    <div class="detail-value">${transaction.category}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Quantity</div>
                    <div class="detail-value ${transaction.quantity > 0 ? 'positive' : 'negative'}">
                        ${transaction.quantity > 0 ? '+' : ''}${transaction.quantity} units
                    </div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Unit Price</div>
                    <div class="detail-value">$${transaction.unitPrice.toFixed(2)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Total Value</div>
                    <div class="detail-value">$${transaction.totalValue.toFixed(2)}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Processed By</div>
                    <div class="detail-value">${transaction.user}</div>
                </div>
                
                <div class="detail-row">
                    <div class="detail-label">Notes</div>
                    <div class="detail-value">${transaction.notes}</div>
                </div>
            </div>
            
            <div class="detail-footer">
                <div class="detail-summary">
                    <strong>Summary:</strong> ${getTransactionSummary(transaction)}
                </div>
            </div>
        </div>
    `;

    modal.style.display = 'block';
}

// Get transaction type icon
function getTransactionTypeIcon(type) {
    const icons = {
        restock: 'box',
        sale: 'cart',
        return: 'refresh',
        adjustment: 'edit'
    };
    return icons[type] || 'receipt';
}

// Get transaction summary
function getTransactionSummary(transaction) {
    switch (transaction.type) {
        case 'restock':
            return `Added ${transaction.quantity} units of ${transaction.item} to inventory`;
        case 'sale':
            return `Sold ${transaction.quantity} units of ${transaction.item}`;
        case 'return':
            return `Returned ${transaction.quantity} units of ${transaction.item}`;
        case 'adjustment':
            return `Adjusted inventory by ${transaction.quantity} units`;
        default:
            return 'Transaction completed';
    }
}

// Close modal
function closeModal() {
    document.getElementById('transactionModal').style.display = 'none';
}

// Print transaction
function printTransaction() {
    const modalContent = document.querySelector('.transaction-detail').cloneNode(true);

    // Create print window
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
        <html>
        <head>
            <title>Transaction Receipt</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .receipt-header { text-align: center; margin-bottom: 30px; }
                .receipt-header h1 { color: #333; }
                .receipt-info { margin-bottom: 20px; }
                .receipt-row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .receipt-label { font-weight: bold; }
                .receipt-footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
                .positive { color: #4CAF50; }
                .negative { color: #f44336; }
                .type-restock { color: #2196F3; }
                .type-sale { color: #4CAF50; }
                .type-return { color: #FF9800; }
                .type-adjustment { color: #9C27B0; }
                @media print {
                    body { padding: 0; }
                    .no-print { display: none; }
                }
            </style>
        </head>
        <body>
            <div class="receipt-header">
                <h1>InventoryPro Transaction Receipt</h1>
                <p>Transaction Details</p>
            </div>
            ${modalContent.innerHTML}
            <div class="receipt-footer">
                <p>Printed on ${new Date().toLocaleString()}</p>
                <p>InventoryPro Transaction System © ${new Date().getFullYear()}</p>
            </div>
        </body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
}

// Print specific transaction
function printSpecificTransaction(transactionId) {
    const transaction = transactions.find(t => t.id === transactionId);
    if (transaction) {
        showTransactionDetails(transactionId);
        setTimeout(() => {
            printTransaction();
            closeModal();
        }, 500);
    }
}

// Export transaction history
function exportTransactionHistory() {
    try {
        // Create export data
        const exportData = filteredTransactions.map(transaction => ({
            'Transaction ID': transaction.id,
            'Date': formatDateTime(transaction.date),
            'Type': capitalizeFirstLetter(transaction.type),
            'Item': transaction.item,
            'Category': transaction.category,
            'Quantity': transaction.quantity,
            'Unit Price': `$${transaction.unitPrice.toFixed(2)}`,
            'Total Value': `$${transaction.totalValue.toFixed(2)}`,
            'User': transaction.user,
            'Notes': transaction.notes
        }));

        // Convert to CSV
        const headers = Object.keys(exportData[0]);
        const csvRows = [headers.join(',')];

        exportData.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Escape quotes and wrap in quotes if contains comma
                const escaped = String(value).replace(/"/g, '""');
                return escaped.includes(',') ? `"${escaped}"` : escaped;
            });
            csvRows.push(values.join(','));
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');

        a.href = url;
        a.download = `transaction_history_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showNotification(`Exported ${exportData.length} transactions to CSV`, 'success');

    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export transaction history', 'error');
    }
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
}

// Format time
function formatTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Format date and time
function formatDateTime(dateString) {
    return `${formatDate(dateString)} ${formatTime(dateString)}`;
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function () {
            // Remove active class from all items
            sidebarItems.forEach(li => li.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');

            // In a real application, you would navigate to different pages here
            const pageName = this.textContent.trim();
            showNotification(`Navigating to ${pageName}`, 'info');
        });
    });
}

// Show notification
function showNotification(message, type = 'info') {
    // Check if notification element exists
    let notification = document.querySelector('.notification');

    if (!notification) {
        notification = document.createElement('div');
        notification.className = `notification notification-${type}`;

        const style = document.createElement('style');
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            }
            .notification-success { 
                background: linear-gradient(135deg, #4CAF50, #45a049);
                border-left: 4px solid #2E7D32;
            }
            .notification-error { 
                background: linear-gradient(135deg, #f44336, #e53935);
                border-left: 4px solid #c62828;
            }
            .notification-info { 
                background: linear-gradient(135deg, #2196F3, #1E88E5);
                border-left: 4px solid #1565C0;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-content i {
                font-size: 20px;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
        document.body.appendChild(notification);
    }

    // Set notification content
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bx bx-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
    `;

    // Show notification
    notification.style.display = 'flex';

    // Auto hide after 3 seconds
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// Make functions available globally
window.applyFilters = applyFilters;
window.exportTransactionHistory = exportTransactionHistory;
window.closeModal = closeModal;
window.printTransaction = printTransaction;
window.changePage = changePage;
window.showTransactionDetails = showTransactionDetails;
window.printSpecificTransaction = printSpecificTransaction;