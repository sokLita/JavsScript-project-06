document.addEventListener('DOMContentLoaded', function () {

    let inventory = JSON.parse(localStorage.getItem('inventory')) || [];
    let recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
    let recentActivity = JSON.parse(localStorage.getItem('recentActivity')) || [];
    let scanner = null;
    let currentCamera = 'environment';
    let isScannerActive = false;

    const startScannerBtn = document.getElementById('startScannerBtn');
    const stopScannerBtn = document.getElementById('stopScannerBtn');
    const uploadImageBtn = document.getElementById('uploadImageBtn');
    const imageUpload = document.getElementById('imageUpload');
    const scannerVideo = document.getElementById('scannerVideo');
    const scannerCanvas = document.getElementById('scannerCanvas');
    const scannerPlaceholder = document.getElementById('scannerPlaceholder');

    const scannerModal = document.getElementById('scannerModal');
    const modalScannerVideo = document.getElementById('modalScannerVideo');
    const closeScannerModal = document.getElementById('closeScannerModal');
    const switchCameraBtn = document.getElementById('switchCameraBtn');
    const scanFromFileBtn = document.getElementById('scanFromFileBtn');

    const quickAddForm = document.getElementById('quickAddForm');
    const itemCodeInput = document.getElementById('itemCode');
    const itemNameInput = document.getElementById('itemName');
    const itemCategoryInput = document.getElementById('itemCategory');
    const itemQuantityInput = document.getElementById('itemQuantity');
    const itemPriceInput = document.getElementById('itemPrice');
    const itemDescriptionInput = document.getElementById('itemDescription');
    const clearFormBtn = document.getElementById('clearFormBtn');

    const recentScansContainer = document.getElementById('recentScans');
    const activityList = document.getElementById('activityList');
    const inventoryTableBody = document.getElementById('inventoryTableBody');
    const itemDetails = document.getElementById('itemDetails');
    const exportBtn = document.getElementById('exportBtn');

    const searchInput = document.querySelector('.search-box input');
    const refreshBtn = document.querySelector('.refresh');

    const totalScansEl = document.querySelector('.div1 .total-scan p:first-child');
    const totalItemsEl = document.querySelector('.div2 .total-scan p:first-child');
    const todayScansEl = document.querySelector('.div3 .total-scan p:first-child');
    const lowStockEl = document.querySelector('.div4 .total-scan p:first-child');

    const toast = document.getElementById('notificationToast');
    const toastMessage = document.getElementById('toastMessage');

    initApp();

    function initApp() {
        updateMetrics();
        loadRecentScans();
        loadRecentActivity();
        loadInventoryTable();
        setupEventListeners();

        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            showToast('Camera not supported in your browser', 'error');
            startScannerBtn.disabled = true;
        }
    }

    function setupEventListeners() {
        startScannerBtn.addEventListener('click', startQuickScanner);
        stopScannerBtn.addEventListener('click', stopQuickScanner);
        uploadImageBtn.addEventListener('click', () => imageUpload.click());
        imageUpload.addEventListener('change', handleImageUpload);

        closeScannerModal.addEventListener('click', closeModal);
        switchCameraBtn.addEventListener('click', switchCamera);
        scanFromFileBtn.addEventListener('click', () => imageUpload.click());

        quickAddForm.addEventListener('submit', handleFormSubmit);
        clearFormBtn.addEventListener('click', clearForm);

        exportBtn.addEventListener('click', exportToCSV);
        searchInput.addEventListener('input', handleSearch);
        refreshBtn.addEventListener('click', refreshData);

        scannerModal.addEventListener('click', (e) => {
            if (e.target === scannerModal) closeModal();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && scannerModal.classList.contains('active')) {
                closeModal();
            }
        });
    }

    async function startQuickScanner() {
        try {
            const constraints = {
                video: {
                    facingMode: currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            scannerVideo.srcObject = stream;

            scannerVideo.style.display = 'block';
            scannerPlaceholder.style.display = 'none';
            startScannerBtn.disabled = true;
            stopScannerBtn.disabled = false;
            isScannerActive = true;

            startScanDetection();

            showToast('Scanner started successfully');

        } catch (error) {
            console.error('Error accessing camera:', error);
            showToast('Failed to access camera. Please check permissions.', 'error');
        }
    }

    function stopQuickScanner() {
        if (scannerVideo.srcObject) {
            const tracks = scannerVideo.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            scannerVideo.srcObject = null;
        }

        scannerVideo.style.display = 'none';
        scannerPlaceholder.style.display = 'flex';
        startScannerBtn.disabled = false;
        stopScannerBtn.disabled = true;
        isScannerActive = false;

        showToast('Scanner stopped');
    }

    function startScanDetection() {
        const ctx = scannerCanvas.getContext('2d');
        scannerCanvas.width = scannerVideo.videoWidth;
        scannerCanvas.height = scannerVideo.videoHeight;

        function detectBarcode() {
            if (!isScannerActive) return;

            ctx.drawImage(scannerVideo, 0, 0, scannerCanvas.width, scannerCanvas.height);
            const imageData = ctx.getImageData(0, 0, scannerCanvas.width, scannerCanvas.height);

            if (Math.random() < 0.01) {
                simulateBarcodeScan();
            }

            requestAnimationFrame(detectBarcode);
        }

        detectBarcode();
    }

    function simulateBarcodeScan() {
        const barcodes = [
            'ITEM001', 'ITEM002', 'ITEM003', 'ITEM004',
            'ITEM005', 'ITEM006', 'ITEM007', 'ITEM008'
        ];

        const randomBarcode = barcodes[Math.floor(Math.random() * barcodes.length)];
        handleScanResult(randomBarcode);
    }

    function handleScanResult(code) {
        const existingItem = inventory.find(item => item.code === code);

        if (existingItem) {
            existingItem.lastScanned = new Date().toISOString();
            existingItem.quantity = (existingItem.quantity || 1) - 1;
            updateInventoryItem(existingItem);

            displayItemDetails(existingItem);
            showToast(`Item scanned: ${existingItem.name}`);
        } else {
            itemCodeInput.value = code;
            itemNameInput.focus();
            showToast(`New item detected: ${code}`, 'info');
        }

        addRecentScan(code);

        addActivity(`Scanned item: ${code}`, 'scan');

        updateMetrics();
    }

    function handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function (e) {
            const simulatedCode = 'IMG-' + Date.now().toString().slice(-6);
            handleScanResult(simulatedCode);

            event.target.value = '';
        };
        reader.readAsDataURL(file);
    }

    function openModal() {
        scannerModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        startModalScanner();
    }

    function closeModal() {
        scannerModal.classList.remove('active');
        document.body.style.overflow = '';
        stopModalScanner();
    }

    async function startModalScanner() {
        try {
            const constraints = {
                video: {
                    facingMode: currentCamera,
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                },
                audio: false
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            modalScannerVideo.srcObject = stream;

            startModalScanDetection();

        } catch (error) {
            console.error('Error accessing camera:', error);
            showToast('Failed to access camera', 'error');
        }
    }

    function stopModalScanner() {
        if (modalScannerVideo.srcObject) {
            const tracks = modalScannerVideo.srcObject.getTracks();
            tracks.forEach(track => track.stop());
            modalScannerVideo.srcObject = null;
        }
    }

    function startModalScanDetection() {
        // Similar to quick scanner detection
        // You would implement actual barcode scanning here
    }

    function switchCamera() {
        currentCamera = currentCamera === 'environment' ? 'user' : 'environment';
        stopModalScanner();
        startModalScanner();
        showToast(`Switched to ${currentCamera === 'environment' ? 'back' : 'front'} camera`);
    }

    function handleFormSubmit(event) {
        event.preventDefault();

        const newItem = {
            id: Date.now().toString(),
            code: itemCodeInput.value || 'ITEM' + Date.now().toString().slice(-6),
            name: itemNameInput.value,
            category: itemCategoryInput.value,
            quantity: parseInt(itemQuantityInput.value) || 1,
            price: parseFloat(itemPriceInput.value) || 0,
            description: itemDescriptionInput.value,
            lastScanned: new Date().toISOString(),
            createdAt: new Date().toISOString()
        };

        const existingIndex = inventory.findIndex(item => item.code === newItem.code);

        if (existingIndex > -1) {
            inventory[existingIndex] = { ...inventory[existingIndex], ...newItem };
            showToast(`Item updated: ${newItem.name}`);
        } else {
            inventory.push(newItem);
            showToast(`Item added: ${newItem.name}`);
        }

        localStorage.setItem('inventory', JSON.stringify(inventory));

        loadInventoryTable();
        updateMetrics();
        clearForm();

        addActivity(`${existingIndex > -1 ? 'Updated' : 'Added'} item: ${newItem.name}`, 'inventory');
    }

    function clearForm() {
        quickAddForm.reset();
        itemCodeInput.value = '';
        itemQuantityInput.value = '1';
    }

    function updateInventoryItem(updatedItem) {
        const index = inventory.findIndex(item => item.id === updatedItem.id || item.code === updatedItem.code);
        if (index > -1) {
            inventory[index] = updatedItem;
            localStorage.setItem('inventory', JSON.stringify(inventory));
            loadInventoryTable();
        }
    }

    function deleteInventoryItem(itemId) {
        if (confirm('Are you sure you want to delete this item?')) {
            const item = inventory.find(item => item.id === itemId);
            inventory = inventory.filter(item => item.id !== itemId);
            localStorage.setItem('inventory', JSON.stringify(inventory));

            showToast(`Item deleted: ${item?.name || 'Unknown'}`, 'warning');
            loadInventoryTable();
            updateMetrics();
            addActivity(`Deleted item: ${item?.name || 'Unknown'}`, 'delete');
        }
    }

    function editInventoryItem(itemId) {
        const item = inventory.find(item => item.id === itemId);
        if (item) {
            itemCodeInput.value = item.code;
            itemNameInput.value = item.name;
            itemCategoryInput.value = item.category;
            itemQuantityInput.value = item.quantity;
            itemPriceInput.value = item.price;
            itemDescriptionInput.value = item.description;

            document.querySelector('.quick-add-form').scrollIntoView({ behavior: 'smooth' });
            itemNameInput.focus();
        }
    }

    function loadInventoryTable() {
        if (!inventoryTableBody) return;

        inventoryTableBody.innerHTML = '';

        inventory.forEach(item => {
            const row = document.createElement('tr');

            let quantityClass = '';
            let quantityText = item.quantity;
            if (item.quantity <= 5) {
                quantityClass = 'badge-warning';
                if (item.quantity <= 2) {
                    quantityClass = 'badge-danger';
                }
            } else if (item.quantity > 20) {
                quantityClass = 'badge-success';
            }

            row.innerHTML = `
                <td><strong>${item.code}</strong></td>
                <td>${item.name}</td>
                <td><span class="badge">${item.category || 'Uncategorized'}</span></td>
                <td><span class="badge ${quantityClass}">${item.quantity}</span></td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${formatDate(item.lastScanned)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="window.editItem('${item.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="window.deleteItem('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                        <button class="action-btn view" onclick="window.viewItem('${item.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </td>
            `;

            inventoryTableBody.appendChild(row);
        });
    }

    function displayItemDetails(item) {
        if (!itemDetails) return;

        const lowStock = item.quantity <= 5;
        const outOfStock = item.quantity <= 0;

        itemDetails.innerHTML = `
            <div class="item-detail-view">
                <div class="item-header">
                    <h4>${item.name}</h4>
                    <span class="item-code">${item.code}</span>
                </div>
                
                <div class="item-info">
                    <div class="info-row">
                        <span class="label">Category:</span>
                        <span class="value">${item.category || 'N/A'}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Quantity:</span>
                        <span class="value ${outOfStock ? 'text-danger' : lowStock ? 'text-warning' : 'text-success'}">
                            ${item.quantity} ${outOfStock ? '(Out of Stock)' : lowStock ? '(Low Stock)' : ''}
                        </span>
                    </div>
                    <div class="info-row">
                        <span class="label">Price:</span>
                        <span class="value">$${parseFloat(item.price).toFixed(2)}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Last Scanned:</span>
                        <span class="value">${formatDate(item.lastScanned)}</span>
                    </div>
                </div>
                
                ${item.description ? `
                <div class="item-description">
                    <h5>Description</h5>
                    <p>${item.description}</p>
                </div>` : ''}
                
                <div class="item-actions">
                    <button class="btn btn-primary" onclick="window.editItem('${item.id}')">
                        <i class="fas fa-edit"></i> Edit Item
                    </button>
                    <button class="btn btn-secondary" onclick="window.scanAgain()">
                        <i class="fas fa-redo"></i> Scan Again
                    </button>
                </div>
            </div>
        `;
    }

    function loadRecentScans() {
        if (!recentScansContainer) return;

        recentScansContainer.innerHTML = '';

        const recent = recentScans.slice(0, 5);

        if (recent.length === 0) {
            recentScansContainer.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-search"></i>
                    <p>No recent scans</p>
                </div>
            `;
            return;
        }

        recent.forEach(scan => {
            const scanElement = document.createElement('div');
            scanElement.className = 'scan-item';
            scanElement.innerHTML = `
                <i class="fas fa-barcode"></i>
                <div class="scan-details">
                    <div class="code">${scan.code}</div>
                    <div class="time">${formatTime(scan.timestamp)}</div>
                </div>
            `;
            recentScansContainer.appendChild(scanElement);
        });
    }

    function loadRecentActivity() {
        if (!activityList) return;

        activityList.innerHTML = '';

        const recentActivityList = recentActivity.slice(0, 10); // Show last 10 activities

        if (recentActivityList.length === 0) {
            activityList.innerHTML = `
                <div class="empty-state">
                    <i class="fas fa-history"></i>
                    <p>No recent activity</p>
                </div>
            `;
            return;
        }

        recentActivityList.forEach(activity => {
            const activityElement = document.createElement('div');
            activityElement.className = 'activity-item';

            let icon = 'fas fa-info-circle';
            let color = '#4361ee';

            switch (activity.type) {
                case 'scan':
                    icon = 'fas fa-camera';
                    color = '#4361ee';
                    break;
                case 'inventory':
                    icon = 'fas fa-box';
                    color = '#10b981';
                    break;
                case 'delete':
                    icon = 'fas fa-trash';
                    color = '#ef4444';
                    break;
            }

            activityElement.innerHTML = `
                <i class="${icon}" style="color: ${color}"></i>
                <div class="activity-content">
                    <p>${activity.message}</p>
                    <div class="activity-time">${formatTime(activity.timestamp)}</div>
                </div>
            `;

            activityList.appendChild(activityElement);
        });
    }

    function addRecentScan(code) {
        const scan = {
            code,
            timestamp: new Date().toISOString()
        };

        recentScans.unshift(scan);
        if (recentScans.length > 20) recentScans.pop();

        localStorage.setItem('recentScans', JSON.stringify(recentScans));
        loadRecentScans();
    }

    function addActivity(message, type = 'info') {
        const activity = {
            message,
            type,
            timestamp: new Date().toISOString()
        };

        recentActivity.unshift(activity);
        if (recentActivity.length > 50) recentActivity.pop();

        localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
        loadRecentActivity();
    }

    function updateMetrics() {
        totalScansEl.textContent = recentScans.length;

        totalItemsEl.textContent = inventory.length;

        const today = new Date().toDateString();
        const todayScans = recentScans.filter(scan =>
            new Date(scan.timestamp).toDateString() === today
        ).length;
        todayScansEl.textContent = todayScans;

        const lowStockCount = inventory.filter(item => item.quantity <= 5).length;
        lowStockEl.textContent = lowStockCount;
    }

    function formatDate(dateString) {
        if (!dateString) return 'Never';

        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
            return 'Today';
        } else if (diffDays === 1) {
            return 'Yesterday';
        } else if (diffDays < 7) {
            return `${diffDays} days ago`;
        } else {
            return date.toLocaleDateString();
        }
    }

    function formatTime(dateString) {
        const date = new Date(dateString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    function showToast(message, type = 'success') {
        toastMessage.textContent = message;

        const icon = toast.querySelector('i');
        switch (type) {
            case 'error':
                icon.className = 'fas fa-exclamation-circle';
                toast.style.borderLeftColor = '#ef4444';
                break;
            case 'warning':
                icon.className = 'fas fa-exclamation-triangle';
                toast.style.borderLeftColor = '#f59e0b';
                break;
            case 'info':
                icon.className = 'fas fa-info-circle';
                toast.style.borderLeftColor = '#3b82f6';
                break;
            default:
                icon.className = 'fas fa-check-circle';
                toast.style.borderLeftColor = '#10b981';
        }

        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    function exportToCSV() {
        if (inventory.length === 0) {
            showToast('No data to export', 'warning');
            return;
        }

        const headers = ['Code', 'Name', 'Category', 'Quantity', 'Price', 'Description', 'Last Scanned'];
        const csvContent = [
            headers.join(','),
            ...inventory.map(item => [
                `"${item.code}"`,
                `"${item.name}"`,
                `"${item.category}"`,
                item.quantity,
                item.price,
                `"${item.description || ''}"`,
                `"${formatDate(item.lastScanned)}"`
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `inventory-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('Inventory exported as CSV');
        addActivity('Exported inventory to CSV', 'inventory');
    }

    function handleSearch(event) {
        const searchTerm = event.target.value.toLowerCase();

        if (!searchTerm) {
            loadInventoryTable();
            return;
        }

        const filtered = inventory.filter(item =>
            item.code.toLowerCase().includes(searchTerm) ||
            item.name.toLowerCase().includes(searchTerm) ||
            item.category.toLowerCase().includes(searchTerm)
        );

        inventoryTableBody.innerHTML = '';

        filtered.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td><strong>${item.code}</strong></td>
                <td>${item.name}</td>
                <td><span class="badge">${item.category || 'Uncategorized'}</span></td>
                <td><span class="badge">${item.quantity}</span></td>
                <td>$${parseFloat(item.price).toFixed(2)}</td>
                <td>${formatDate(item.lastScanned)}</td>
                <td>
                    <div class="action-buttons">
                        <button class="action-btn edit" onclick="window.editItem('${item.id}')">
                            <i class="fas fa-edit"></i> Edit
                        </button>
                        <button class="action-btn delete" onclick="window.deleteItem('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </td>
            `;
            inventoryTableBody.appendChild(row);
        });
    }

    function refreshData() {
        refreshBtn.style.transform = 'rotate(360deg)';
        setTimeout(() => {
            refreshBtn.style.transform = '';
        }, 500);

        inventory = JSON.parse(localStorage.getItem('inventory')) || [];
        recentScans = JSON.parse(localStorage.getItem('recentScans')) || [];
        recentActivity = JSON.parse(localStorage.getItem('recentActivity')) || [];

        loadInventoryTable();
        loadRecentScans();
        loadRecentActivity();
        updateMetrics();

        showToast('Data refreshed successfully');
    }

    window.editItem = editInventoryItem;
    window.deleteItem = deleteInventoryItem;

    window.viewItem = function (itemId) {
        const item = inventory.find(item => item.id === itemId);
        if (item) {
            displayItemDetails(item);
            document.querySelector('.item-details').scrollIntoView({ behavior: 'smooth' });
        }
    };

    window.scanAgain = function () {
        if (isScannerActive) {
            itemCodeInput.value = '';
            itemNameInput.focus();
        } else {
            startScannerBtn.click();
        }
    };

    if (inventory.length === 0) {
        const demoItems = [
            {
                id: '1',
                code: 'ITEM001',
                name: 'Wireless Mouse',
                category: 'electronics',
                quantity: 25,
                price: 29.99,
                description: 'Wireless optical mouse with USB receiver',
                lastScanned: new Date().toISOString(),
                createdAt: new Date().toISOString()
            },
            {
                id: '2',
                code: 'ITEM002',
                name: 'Keyboard',
                category: 'electronics',
                quantity: 18,
                price: 59.99,
                description: 'Mechanical gaming keyboard',
                lastScanned: new Date(Date.now() - 86400000).toISOString(), // Yesterday
                createdAt: new Date().toISOString()
            },
            {
                id: '3',
                code: 'ITEM003',
                name: 'Notebook',
                category: 'books',
                quantity: 3,
                price: 9.99,
                description: 'Hardcover notebook, 200 pages',
                lastScanned: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                createdAt: new Date().toISOString()
            }
        ];

        inventory = demoItems;
        localStorage.setItem('inventory', JSON.stringify(inventory));
        loadInventoryTable();
        updateMetrics();
    }

    if (recentActivity.length === 0) {
        const demoActivity = [
            { message: 'System initialized', type: 'info', timestamp: new Date().toISOString() },
            { message: 'Demo items loaded', type: 'inventory', timestamp: new Date().toISOString() }
        ];

        recentActivity = demoActivity;
        localStorage.setItem('recentActivity', JSON.stringify(recentActivity));
        loadRecentActivity();
    }
});