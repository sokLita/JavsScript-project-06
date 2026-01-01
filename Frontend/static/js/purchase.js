
        // purchase.js - Purchase Management System

        document.addEventListener('DOMContentLoaded', function () {
            // Initialize the purchase management system
            initializePurchaseSystem();
            setupEventListeners();
            loadPurchaseData();
            loadSuppliers();
            setupFormValidation();
            initializeModal();
        });

        // Global variables
        let purchaseData = [];
        let suppliersData = [];
        let currentPage = 1;
        const itemsPerPage = 10;
        let filters = {
            status: ['completed', 'pending'],
            startDate: null,
            endDate: null,
            supplier: '',
            minAmount: null,
            maxAmount: null
        };

        // Initialize the purchase system
        function initializePurchaseSystem() {
            // Set today's date as default for purchase date
            const today = new Date().toISOString().split('T')[0];
            document.getElementById('purchaseDate').value = today;

            // Generate a new reference number
            generateReferenceNumber();
        }

        // Setup all event listeners
        function setupEventListeners() {
            // Modal open/close buttons
            document.getElementById('newPurchaseBtn').addEventListener('click', openPurchaseModal);
            document.getElementById('closeModal').addEventListener('click', closePurchaseModal);
            document.getElementById('cancelPurchase').addEventListener('click', closePurchaseModal);

            document.getElementById('addSupplierBtn').addEventListener('click', openSupplierModal);
            document.getElementById('closeSupplierModal').addEventListener('click', closeSupplierModal);
            document.getElementById('cancelSupplier').addEventListener('click', closeSupplierModal);

            document.getElementById('filterBtn').addEventListener('click', openFilterModal);
            document.getElementById('closeFilterModal').addEventListener('click', closeFilterModal);
            document.getElementById('resetFilters').addEventListener('click', resetFilters);
            document.getElementById('applyFilters').addEventListener('click', applyFilters);

            // Quick action buttons
            document.getElementById('quickPurchaseBtn').addEventListener('click', quickPurchase);
            document.getElementById('reorderBtn').addEventListener('click', reorderItems);
            document.getElementById('bulkUploadBtn').addEventListener('click', bulkUpload);
            document.getElementById('reportsBtn').addEventListener('click', showReports);

            // Table actions
            document.getElementById('selectAll').addEventListener('change', toggleSelectAll);
            document.getElementById('exportBtn').addEventListener('click', exportPurchases);
            document.getElementById('refreshBtn').addEventListener('click', refreshData);

            // Pagination
            document.getElementById('prevPage').addEventListener('click', previousPage);
            document.getElementById('nextPage').addEventListener('click', nextPage);

            // Form submission
            document.getElementById('purchaseForm').addEventListener('submit', submitPurchase);
            document.getElementById('supplierForm').addEventListener('submit', saveSupplier);
            document.getElementById('saveDraftBtn').addEventListener('click', saveAsDraft);

            // Search functionality
            document.getElementById('searchInput').addEventListener('input', debounce(searchPurchases, 300));

            // Dynamic item addition in purchase form
            document.getElementById('addItemBtn').addEventListener('click', addItemRow);

            // Recalculate totals when item values change
            document.addEventListener('input', function (e) {
                if (e.target.matches('.item-quantity, .item-price, #taxRate, #discount')) {
                    calculateTotals();
                }
            });

            // Setup sidebar navigation
            setupSidebarNavigation();
        }

        // Load sample purchase data
        function loadPurchaseData() {
            purchaseData = [
                {
                    id: 1,
                    reference: 'PO-2024-001',
                    supplier: 'Dell Cambodia',
                    date: '2024-03-15',
                    items: [
                        { name: 'Laptop Dell XPS 13', quantity: 5, price: 1200, total: 6000 }
                    ],
                    status: 'completed',
                    total: 6000,
                    tax: 600,
                    discount: 0,
                    finalTotal: 6600,
                    recordedBy: 'Admin User',
                    notes: 'Regular inventory replenishment'
                },
                {
                    id: 2,
                    reference: 'PO-2024-002',
                    supplier: 'Logitech Inc.',
                    date: '2024-03-14',
                    items: [
                        { name: 'Wireless Mouse MX Master', quantity: 20, price: 25, total: 500 },
                        { name: 'Mechanical Keyboard', quantity: 10, price: 80, total: 800 }
                    ],
                    status: 'completed',
                    total: 1300,
                    tax: 130,
                    discount: 50,
                    finalTotal: 1380,
                    recordedBy: 'Admin User',
                    notes: 'Office equipment upgrade'
                },
                {
                    id: 3,
                    reference: 'PO-2024-003',
                    supplier: 'Samsung Electronics',
                    date: '2024-03-10',
                    items: [
                        { name: '27" 4K Monitor', quantity: 8, price: 300, total: 2400 }
                    ],
                    status: 'pending',
                    total: 2400,
                    tax: 240,
                    discount: 100,
                    finalTotal: 2540,
                    recordedBy: 'John Doe',
                    notes: 'Pending approval from management'
                },
                {
                    id: 4,
                    reference: 'PO-2024-004',
                    supplier: 'Razer Inc.',
                    date: '2024-03-05',
                    items: [
                        { name: 'Gaming Mouse', quantity: 15, price: 60, total: 900 },
                        { name: 'Gaming Keyboard', quantity: 10, price: 120, total: 1200 }
                    ],
                    status: 'completed',
                    total: 2100,
                    tax: 210,
                    discount: 0,
                    finalTotal: 2310,
                    recordedBy: 'Jane Smith',
                    notes: 'For gaming department'
                },
                {
                    id: 5,
                    reference: 'PO-2024-005',
                    supplier: 'Apple Inc.',
                    date: '2024-03-01',
                    items: [
                        { name: 'MacBook Pro 16"', quantity: 3, price: 2400, total: 7200 },
                        { name: 'Magic Mouse', quantity: 5, price: 80, total: 400 }
                    ],
                    status: 'cancelled',
                    total: 7600,
                    tax: 760,
                    discount: 200,
                    finalTotal: 8160,
                    recordedBy: 'Admin User',
                    notes: 'Cancelled due to budget constraints'
                },
                {
                    id: 6,
                    reference: 'PO-2024-006',
                    supplier: 'HP Inc.',
                    date: '2024-02-28',
                    items: [
                        { name: 'HP LaserJet Printer', quantity: 4, price: 400, total: 1600 }
                    ],
                    status: 'draft',
                    total: 1600,
                    tax: 160,
                    discount: 0,
                    finalTotal: 1760,
                    recordedBy: 'Admin User',
                    notes: 'Draft - awaiting supplier confirmation'
                },
                {
                    id: 7,
                    reference: 'PO-2024-007',
                    supplier: 'Microsoft',
                    date: '2024-02-25',
                    items: [
                        { name: 'Surface Laptop 5', quantity: 6, price: 1300, total: 7800 },
                        { name: 'Surface Pen', quantity: 10, price: 60, total: 600 }
                    ],
                    status: 'completed',
                    total: 8400,
                    tax: 840,
                    discount: 300,
                    finalTotal: 8940,
                    recordedBy: 'John Doe',
                    notes: 'For executive team'
                },
                {
                    id: 8,
                    reference: 'PO-2024-008',
                    supplier: 'Lenovo',
                    date: '2024-02-20',
                    items: [
                        { name: 'ThinkPad X1 Carbon', quantity: 8, price: 1500, total: 12000 }
                    ],
                    status: 'pending',
                    total: 12000,
                    tax: 1200,
                    discount: 500,
                    finalTotal: 12700,
                    recordedBy: 'Jane Smith',
                    notes: 'For IT department upgrade'
                }
            ];

            renderPurchaseTable();
            updateTableSummary();
        }

        // Load sample suppliers data
        function loadSuppliers() {
            suppliersData = [
                {
                    id: 1,
                    name: 'Dell Cambodia',
                    contactPerson: 'John Doe',
                    email: 'john@dellcambodia.com',
                    phone: '+855 12 345 678',
                    address: 'Phnom Penh, Cambodia',
                    category: 'Electronics',
                    paymentTerms: 'Net 30 Days',
                    totalPurchases: 5,
                    lastOrder: '2024-03-15'
                },
                {
                    id: 2,
                    name: 'Logitech Inc.',
                    contactPerson: 'Jane Smith',
                    email: 'jane@logitech.com',
                    phone: '+855 98 765 432',
                    address: 'Phnom Penh, Cambodia',
                    category: 'Accessories',
                    paymentTerms: 'Net 60 Days',
                    totalPurchases: 3,
                    lastOrder: '2024-03-14'
                },
                {
                    id: 3,
                    name: 'Samsung Electronics',
                    contactPerson: 'Robert Chen',
                    email: 'robert@samsung.com',
                    phone: '+855 11 222 333',
                    address: 'Seoul, South Korea',
                    category: 'Electronics',
                    paymentTerms: 'Immediate',
                    totalPurchases: 2,
                    lastOrder: '2024-03-10'
                },
                {
                    id: 4,
                    name: 'Razer Inc.',
                    contactPerson: 'Mike Johnson',
                    email: 'mike@razer.com',
                    phone: '+855 44 555 666',
                    address: 'Singapore',
                    category: 'Gaming',
                    paymentTerms: 'Net 30 Days',
                    totalPurchases: 1,
                    lastOrder: '2024-03-05'
                }
            ];

            renderSuppliers();
        }

        // Render purchase table
        function renderPurchaseTable() {
            const tableBody = document.getElementById('purchasesTableBody');
            const filteredData = filterPurchases(purchaseData);
            const paginatedData = paginateData(filteredData);

            if (paginatedData.length === 0) {
                tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="empty-table">
                    <div class="empty-state">
                        <i class="fas fa-shopping-cart"></i>
                        <p>No purchase orders found</p>
                        <button class="btn-primary" id="createFirstPurchase">Create Your First Purchase</button>
                    </div>
                </td>
            </tr>
        `;

                document.getElementById('createFirstPurchase')?.addEventListener('click', openPurchaseModal);
                return;
            }

            tableBody.innerHTML = paginatedData.map(purchase => `
        <tr data-id="${purchase.id}">
            <td class="checkbox-col">
                <input type="checkbox" class="row-checkbox" value="${purchase.id}">
            </td>
            <td>
                <div class="reference-number">
                    <strong>${purchase.reference}</strong>
                    <div class="reference-actions">
                        <button class="action-btn view" onclick="viewPurchase(${purchase.id})" title="View">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="action-btn copy" onclick="copyReference('${purchase.reference}')" title="Copy Reference">
                            <i class="fas fa-copy"></i>
                        </button>
                    </div>
                </div>
            </td>
            <td>
                <div class="supplier-info">
                    <strong>${purchase.supplier}</strong>
                    <small>${formatDate(purchase.date)}</small>
                </div>
            </td>
            <td>${formatDate(purchase.date)}</td>
            <td>
                <div class="items-count">
                    <i class="fas fa-box"></i>
                    ${purchase.items.length} item${purchase.items.length > 1 ? 's' : ''}
                    <div class="items-preview">
                        ${purchase.items.map(item => `${item.name} (${item.quantity})`).join(', ')}
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge status-${purchase.status}">
                    ${purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                </span>
            </td>
            <td>
                <div class="amount-cell">
                    <strong>$${purchase.finalTotal.toLocaleString()}</strong>
                    <small>Subtotal: $${purchase.total.toLocaleString()}</small>
                </div>
            </td>
            <td>${purchase.recordedBy}</td>
            <td class="actions-cell">
                <button class="action-btn view" onclick="viewPurchase(${purchase.id})" title="View Details">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn edit" onclick="editPurchase(${purchase.id})" title="Edit">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete" onclick="deletePurchase(${purchase.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');

            updatePaginationControls(filteredData.length);
        }

        // Filter purchases based on active filters
        function filterPurchases(data) {
            return data.filter(purchase => {
                // Filter by status
                if (filters.status.length > 0 && !filters.status.includes(purchase.status)) {
                    return false;
                }

                // Filter by date range
                if (filters.startDate && new Date(purchase.date) < new Date(filters.startDate)) {
                    return false;
                }
                if (filters.endDate && new Date(purchase.date) > new Date(filters.endDate)) {
                    return false;
                }

                // Filter by supplier
                if (filters.supplier && purchase.supplier.toLowerCase() !== filters.supplier.toLowerCase()) {
                    return false;
                }

                // Filter by amount range
                if (filters.minAmount !== null && purchase.finalTotal < filters.minAmount) {
                    return false;
                }
                if (filters.maxAmount !== null && purchase.finalTotal > filters.maxAmount) {
                    return false;
                }

                return true;
            });
        }

        // Paginate data
        function paginateData(data) {
            const startIndex = (currentPage - 1) * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            return data.slice(startIndex, endIndex);
        }

        // Update pagination controls
        function updatePaginationControls(totalItems) {
            const totalPages = Math.ceil(totalItems / itemsPerPage);

            document.getElementById('currentPage').textContent = currentPage;
            document.getElementById('totalPages').textContent = totalPages;
            document.getElementById('prevPage').disabled = currentPage === 1;
            document.getElementById('nextPage').disabled = currentPage === totalPages;

            document.getElementById('showingCount').textContent = Math.min(totalItems, currentPage * itemsPerPage);
            document.getElementById('totalCount').textContent = totalItems;

            // Calculate total amount for current page
            const filteredData = filterPurchases(purchaseData);
            const paginatedData = paginateData(filteredData);
            const pageTotal = paginatedData.reduce((sum, purchase) => sum + purchase.finalTotal, 0);

            document.getElementById('tableTotal').textContent = `$${pageTotal.toLocaleString()}`;
        }

        // Previous page
        function previousPage() {
            if (currentPage > 1) {
                currentPage--;
                renderPurchaseTable();
            }
        }

        // Next page
        function nextPage() {
            const filteredData = filterPurchases(purchaseData);
            const totalPages = Math.ceil(filteredData.length / itemsPerPage);

            if (currentPage < totalPages) {
                currentPage++;
                renderPurchaseTable();
            }
        }

        // Render suppliers
        function renderSuppliers() {
            const suppliersGrid = document.getElementById('suppliersGrid');

            suppliersGrid.innerHTML = suppliersData.map(supplier => `
        <div class="supplier-card" data-id="${supplier.id}">
            <div class="supplier-header">
                <div class="supplier-name">${supplier.name}</div>
                <span class="supplier-category">${supplier.category}</span>
            </div>
            <div class="supplier-info">
                <div><i class="fas fa-user"></i> ${supplier.contactPerson}</div>
                <div><i class="fas fa-envelope"></i> ${supplier.email}</div>
                <div><i class="fas fa-phone"></i> ${supplier.phone}</div>
                <div><i class="fas fa-map-marker-alt"></i> ${supplier.address}</div>
                <div><i class="fas fa-file-invoice-dollar"></i> ${supplier.paymentTerms}</div>
                <div><i class="fas fa-shopping-cart"></i> ${supplier.totalPurchases} purchases</div>
                <div><i class="fas fa-calendar"></i> Last order: ${formatDate(supplier.lastOrder)}</div>
            </div>
        </div>
    `).join('');
        }

        // Open purchase modal
        function openPurchaseModal() {
            document.getElementById('purchaseModal').classList.add('show');
            document.body.style.overflow = 'hidden';

            // Initialize with one empty item row
            const itemsTableBody = document.getElementById('itemsTableBody');
            itemsTableBody.innerHTML = createItemRow();
            calculateTotals();
        }

        // Close purchase modal
        function closePurchaseModal() {
            document.getElementById('purchaseModal').classList.remove('show');
            document.body.style.overflow = 'auto';

            // Reset form
            document.getElementById('purchaseForm').reset();
            generateReferenceNumber();

            // Reset items table
            const itemsTableBody = document.getElementById('itemsTableBody');
            itemsTableBody.innerHTML = createItemRow();
            calculateTotals();
        }

        // Open supplier modal
        function openSupplierModal() {
            document.getElementById('supplierModal').classList.add('show');
            document.body.style.overflow = 'hidden';
        }

        // Close supplier modal
        function closeSupplierModal() {
            document.getElementById('supplierModal').classList.remove('show');
            document.body.style.overflow = 'auto';
            document.getElementById('supplierForm').reset();
        }

        // Open filter modal
        function openFilterModal() {
            document.getElementById('filterModal').classList.add('show');
            document.body.style.overflow = 'hidden';

            // Set default date range (last 30 days)
            const endDate = new Date();
            const startDate = new Date();
            startDate.setDate(startDate.getDate() - 30);

            document.getElementById('startDate').value = startDate.toISOString().split('T')[0];
            document.getElementById('endDate').value = endDate.toISOString().split('T')[0];
        }

        // Close filter modal
        function closeFilterModal() {
            document.getElementById('filterModal').classList.remove('show');
            document.body.style.overflow = 'auto';
        }

        // Reset filters
        function resetFilters() {
            filters = {
                status: ['completed', 'pending'],
                startDate: null,
                endDate: null,
                supplier: '',
                minAmount: null,
                maxAmount: null
            };

            // Reset form inputs
            document.querySelectorAll('#filterModal input[type="checkbox"]').forEach(checkbox => {
                checkbox.checked = ['completed', 'pending'].includes(checkbox.value);
            });

            document.getElementById('startDate').value = '';
            document.getElementById('endDate').value = '';
            document.getElementById('filterSupplier').value = '';
            document.getElementById('minAmount').value = '';
            document.getElementById('maxAmount').value = '';

            applyFilters();
        }

        // Apply filters
        function applyFilters() {
            // Get status filters
            const statusCheckboxes = document.querySelectorAll('#filterModal input[name="status"]:checked');
            filters.status = Array.from(statusCheckboxes).map(cb => cb.value);

            // Get date range
            filters.startDate = document.getElementById('startDate').value || null;
            filters.endDate = document.getElementById('endDate').value || null;

            // Get supplier filter
            filters.supplier = document.getElementById('filterSupplier').value || '';

            // Get amount range
            filters.minAmount = document.getElementById('minAmount').value ? parseFloat(document.getElementById('minAmount').value) : null;
            filters.maxAmount = document.getElementById('maxAmount').value ? parseFloat(document.getElementById('maxAmount').value) : null;

            // Reset to first page
            currentPage = 1;

            // Re-render table
            renderPurchaseTable();

            // Close modal
            closeFilterModal();

            showToast('Filters applied successfully', 'success');
        }

        // Create item row for purchase form
        function createItemRow(index = 0) {
            return `
        <tr>
            <td>
                <input type="text" class="item-name" placeholder="Item name" required>
            </td>
            <td>
                <input type="number" class="item-quantity" value="1" min="1" step="1" required>
            </td>
            <td>
                <input type="number" class="item-price" value="0" min="0" step="0.01" required>
            </td>
            <td>
                <input type="text" class="item-total" value="$0.00" readonly>
            </td>
            <td>
                <button type="button" class="btn-remove-item" onclick="removeItemRow(this)" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;
        }

        // Add item row to purchase form
        function addItemRow() {
            const itemsTableBody = document.getElementById('itemsTableBody');
            const rows = itemsTableBody.querySelectorAll('tr');
            const newRow = createItemRow(rows.length);

            itemsTableBody.insertAdjacentHTML('beforeend', newRow);
            calculateTotals();
        }

        // Remove item row from purchase form
        function removeItemRow(button) {
            const row = button.closest('tr');
            row.remove();
            calculateTotals();
        }

        // Calculate totals for purchase form
        function calculateTotals() {
            const itemsTableBody = document.getElementById('itemsTableBody');
            const rows = itemsTableBody.querySelectorAll('tr');

            let subtotal = 0;

            rows.forEach(row => {
                const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = quantity * price;

                row.querySelector('.item-total').value = `$${total.toFixed(2)}`;
                subtotal += total;
            });

            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const discount = parseFloat(document.getElementById('discount').value) || 0;

            const taxAmount = subtotal * (taxRate / 100);
            const totalAmount = subtotal + taxAmount - discount;

            // Update summary
            document.getElementById('subtotal').textContent = `$${subtotal.toFixed(2)}`;
            document.getElementById('taxAmount').textContent = `$${taxAmount.toFixed(2)}`;
            document.getElementById('discountAmount').textContent = `$${discount.toFixed(2)}`;
            document.getElementById('totalAmount').textContent = `$${totalAmount.toFixed(2)}`;
        }

        // Generate reference number
        function generateReferenceNumber() {
            const today = new Date();
            const year = today.getFullYear();
            const month = String(today.getMonth() + 1).padStart(2, '0');
            const day = String(today.getDate()).padStart(2, '0');

            // Count existing purchases for today
            const todayPurchases = purchaseData.filter(p => {
                const purchaseDate = new Date(p.date);
                return purchaseDate.toDateString() === today.toDateString();
            });

            const nextNumber = todayPurchases.length + 1;
            const reference = `PO-${year}${month}${day}-${String(nextNumber).padStart(3, '0')}`;

            document.getElementById('referenceNo').value = reference;
        }

        // Submit purchase form
        function submitPurchase(event) {
            event.preventDefault();

            // Get form data
            const reference = document.getElementById('referenceNo').value;
            const date = document.getElementById('purchaseDate').value;
            const supplier = document.getElementById('supplier').value;
            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const discount = parseFloat(document.getElementById('discount').value) || 0;
            const notes = document.getElementById('notes').value;

            // Get items
            const items = [];
            let subtotal = 0;

            document.querySelectorAll('#itemsTableBody tr').forEach(row => {
                const name = row.querySelector('.item-name').value;
                const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = quantity * price;

                if (name && quantity > 0 && price > 0) {
                    items.push({ name, quantity, price, total });
                    subtotal += total;
                }
            });

            if (items.length === 0) {
                showToast('Please add at least one item', 'error');
                return;
            }

            // Calculate totals
            const taxAmount = subtotal * (taxRate / 100);
            const totalAmount = subtotal + taxAmount - discount;

            // Create new purchase object
            const newPurchase = {
                id: purchaseData.length + 1,
                reference,
                supplier: document.querySelector(`#supplier option[value="${supplier}"]`).textContent,
                date,
                items,
                status: 'pending',
                total: subtotal,
                tax: taxAmount,
                discount,
                finalTotal: totalAmount,
                recordedBy: 'Admin User',
                notes
            };

            // Add to purchase data
            purchaseData.unshift(newPurchase);

            // Save to localStorage (in a real app, this would be an API call)
            localStorage.setItem('purchaseData', JSON.stringify(purchaseData));

            // Close modal and refresh table
            closePurchaseModal();
            renderPurchaseTable();
            updateTableSummary();

            // Show success message
            showToast('Purchase order created successfully!', 'success');
        }

        // Save as draft
        function saveAsDraft() {
            // Similar to submit but with draft status
            const reference = document.getElementById('referenceNo').value;
            const date = document.getElementById('purchaseDate').value;
            const supplier = document.getElementById('supplier').value;
            const taxRate = parseFloat(document.getElementById('taxRate').value) || 0;
            const discount = parseFloat(document.getElementById('discount').value) || 0;
            const notes = document.getElementById('notes').value;

            const items = [];
            let subtotal = 0;

            document.querySelectorAll('#itemsTableBody tr').forEach(row => {
                const name = row.querySelector('.item-name').value;
                const quantity = parseFloat(row.querySelector('.item-quantity').value) || 0;
                const price = parseFloat(row.querySelector('.item-price').value) || 0;
                const total = quantity * price;

                if (name && quantity > 0 && price > 0) {
                    items.push({ name, quantity, price, total });
                    subtotal += total;
                }
            });

            const taxAmount = subtotal * (taxRate / 100);
            const totalAmount = subtotal + taxAmount - discount;

            const draftPurchase = {
                id: purchaseData.length + 1,
                reference,
                supplier: document.querySelector(`#supplier option[value="${supplier}"]`).textContent,
                date,
                items,
                status: 'draft',
                total: subtotal,
                tax: taxAmount,
                discount,
                finalTotal: totalAmount,
                recordedBy: 'Admin User',
                notes
            };

            purchaseData.unshift(draftPurchase);
            localStorage.setItem('purchaseData', JSON.stringify(purchaseData));

            closePurchaseModal();
            renderPurchaseTable();
            updateTableSummary();

            showToast('Purchase order saved as draft', 'success');
        }

        // Save supplier
        function saveSupplier(event) {
            event.preventDefault();

            const newSupplier = {
                id: suppliersData.length + 1,
                name: document.getElementById('supplierName').value,
                contactPerson: document.getElementById('contactPerson').value,
                email: document.getElementById('email').value,
                phone: document.getElementById('phone').value,
                address: document.getElementById('address').value,
                paymentTerms: document.getElementById('paymentTerms').value,
                category: document.getElementById('category').value,
                totalPurchases: 0,
                lastOrder: null
            };

            suppliersData.push(newSupplier);
            localStorage.setItem('suppliersData', JSON.stringify(suppliersData));

            closeSupplierModal();
            renderSuppliers();

            // Update supplier dropdown in purchase form
            const supplierSelect = document.getElementById('supplier');
            const option = document.createElement('option');
            option.value = newSupplier.name.toLowerCase().replace(/\s+/g, '-');
            option.textContent = newSupplier.name;
            supplierSelect.appendChild(option);

            showToast('Supplier added successfully', 'success');
        }

        // View purchase details
        function viewPurchase(purchaseId) {
            const purchase = purchaseData.find(p => p.id === purchaseId);
            if (!purchase) return;

            // In a real app, this would open a detailed view modal
            const message = `
        <strong>${purchase.reference}</strong><br>
        Supplier: ${purchase.supplier}<br>
        Date: ${formatDate(purchase.date)}<br>
        Status: ${purchase.status}<br>
        Total: $${purchase.finalTotal.toLocaleString()}<br><br>
        Items:<br>
        ${purchase.items.map(item => `• ${item.name} (${item.quantity} × $${item.price}) = $${item.total}`).join('<br>')}
    `;

            showToast(message, 'info', 5000);
        }

        // Edit purchase
        function editPurchase(purchaseId) {
            const purchase = purchaseData.find(p => p.id === purchaseId);
            if (!purchase) return;

            // Open modal with purchase data
            openPurchaseModal();

            // Populate form with purchase data
            document.getElementById('referenceNo').value = purchase.reference;
            document.getElementById('purchaseDate').value = purchase.date;
            document.getElementById('supplier').value = purchase.supplier.toLowerCase().replace(/\s+/g, '-');
            document.getElementById('taxRate').value = (purchase.tax / purchase.total * 100) || 0;
            document.getElementById('discount').value = purchase.discount || 0;
            document.getElementById('notes').value = purchase.notes || '';

            // Populate items
            const itemsTableBody = document.getElementById('itemsTableBody');
            itemsTableBody.innerHTML = '';

            purchase.items.forEach((item, index) => {
                const row = document.createElement('tr');
                row.innerHTML = `
            <td>
                <input type="text" class="item-name" value="${item.name}" required>
            </td>
            <td>
                <input type="number" class="item-quantity" value="${item.quantity}" min="1" step="1" required>
            </td>
            <td>
                <input type="number" class="item-price" value="${item.price}" min="0" step="0.01" required>
            </td>
            <td>
                <input type="text" class="item-total" value="$${item.total.toFixed(2)}" readonly>
            </td>
            <td>
                <button type="button" class="btn-remove-item" onclick="removeItemRow(this)" ${index === 0 ? 'disabled' : ''}>
                    <i class="fas fa-times"></i>
                </button>
            </td>
        `;
                itemsTableBody.appendChild(row);
            });

            calculateTotals();

            // Change submit button text
            document.getElementById('submitPurchaseBtn').innerHTML = '<i class="fas fa-save"></i> Update Purchase Order';

            // Store purchase ID for update
            document.getElementById('purchaseForm').dataset.editId = purchaseId;
        }

        // Delete purchase
        function deletePurchase(purchaseId) {
            if (!confirm('Are you sure you want to delete this purchase order?')) {
                return;
            }

            const index = purchaseData.findIndex(p => p.id === purchaseId);
            if (index !== -1) {
                const deleted = purchaseData.splice(index, 1)[0];
                localStorage.setItem('purchaseData', JSON.stringify(purchaseData));

                renderPurchaseTable();
                updateTableSummary();

                showToast(`Purchase order ${deleted.reference} deleted`, 'success');
            }
        }

        // Copy reference number
        function copyReference(reference) {
            navigator.clipboard.writeText(reference)
                .then(() => showToast('Reference copied to clipboard', 'success'))
                .catch(() => showToast('Failed to copy reference', 'error'));
        }

        // Toggle select all checkbox
        function toggleSelectAll() {
            const selectAll = document.getElementById('selectAll').checked;
            document.querySelectorAll('.row-checkbox').forEach(checkbox => {
                checkbox.checked = selectAll;
            });
        }

        // Export purchases
        function exportPurchases() {
            const selectedRows = Array.from(document.querySelectorAll('.row-checkbox:checked'))
                .map(checkbox => parseInt(checkbox.value));

            let dataToExport;
            if (selectedRows.length > 0) {
                dataToExport = purchaseData.filter(p => selectedRows.includes(p.id));
            } else {
                dataToExport = purchaseData;
            }

            // Create CSV content
            const headers = ['Reference', 'Supplier', 'Date', 'Status', 'Total Amount', 'Recorded By'];
            const csvRows = [
                headers.join(','),
                ...dataToExport.map(purchase => [
                    purchase.reference,
                    `"${purchase.supplier}"`,
                    purchase.date,
                    purchase.status,
                    `$${purchase.finalTotal}`,
                    purchase.recordedBy
                ].join(','))
            ];

            const csvString = csvRows.join('\n');
            const blob = new Blob([csvString], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);

            const a = document.createElement('a');
            a.href = url;
            a.download = `purchases_export_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);

            showToast('Purchases exported successfully', 'success');
        }

        // Refresh data
        function refreshData() {
            // In a real app, this would fetch from server
            showToast('Refreshing purchase data...', 'info');

            // Simulate API call
            setTimeout(() => {
                loadPurchaseData();
                showToast('Purchase data refreshed', 'success');
            }, 1000);
        }

        // Quick purchase action
        function quickPurchase() {
            openPurchaseModal();

            // Pre-fill with common items
            const itemsTableBody = document.getElementById('itemsTableBody');
            itemsTableBody.innerHTML = `
        <tr>
            <td>
                <input type="text" class="item-name" placeholder="Item name" required>
            </td>
            <td>
                <input type="number" class="item-quantity" value="1" min="1" step="1" required>
            </td>
            <td>
                <input type="number" class="item-price" value="0" min="0" step="0.01" required>
            </td>
            <td>
                <input type="text" class="item-total" value="$0.00" readonly>
            </td>
            <td>
                <button type="button" class="btn-remove-item" onclick="removeItemRow(this)" disabled>
                    <i class="fas fa-times"></i>
                </button>
            </td>
        </tr>
    `;

            calculateTotals();
        }

        // Reorder items
        function reorderItems() {
            // In a real app, this would show low stock items
            showToast('Loading low stock items...', 'info');
        }

        // Bulk upload
        function bulkUpload() {
            // In a real app, this would open file upload dialog
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = '.csv,.xlsx,.xls';
            input.onchange = function (e) {
                showToast('File selected. Processing upload...', 'info');
                // Process file here
            };
            input.click();
        }

        // Show reports
        function showReports() {
            showToast('Opening purchase reports...', 'info');
            // In a real app, this would navigate to reports page
        }

        // Search purchases
        function searchPurchases() {
            const searchTerm = document.getElementById('searchInput').value.toLowerCase();

            const filtered = purchaseData.filter(purchase => {
                return (
                    purchase.reference.toLowerCase().includes(searchTerm) ||
                    purchase.supplier.toLowerCase().includes(searchTerm) ||
                    purchase.recordedBy.toLowerCase().includes(searchTerm) ||
                    purchase.items.some(item => item.name.toLowerCase().includes(searchTerm))
                );
            });

            // Update display
            purchaseData = filtered;
            currentPage = 1;
            renderPurchaseTable();
        }

        // Update table summary
        function updateTableSummary() {
            const totalPurchases = purchaseData.length;
            const totalAmount = purchaseData.reduce((sum, p) => sum + p.finalTotal, 0);
            const pendingOrders = purchaseData.filter(p => p.status === 'pending').length;

            // Update stats cards (in a real app, these would be calculated)
            document.querySelector('.stat-card:nth-child(1) .stat-value').textContent = `$${totalAmount.toLocaleString()}`;
            document.querySelector('.stat-card:nth-child(2) .stat-value').textContent = pendingOrders;
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

        // Debounce function for search
        function debounce(func, wait) {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }

        // Setup sidebar navigation
        function setupSidebarNavigation() {
            const sidebarItems = document.querySelectorAll('.sidebar li');
            sidebarItems.forEach(item => {
                item.addEventListener('click', function () {
                    sidebarItems.forEach(li => li.classList.remove('active'));
                    this.classList.add('active');

                    const pageName = this.textContent.trim();
                    showToast(`Navigating to ${pageName}`, 'info');
                });
            });
        }

        // Show toast notification
        function showToast(message, type = 'info', duration = 3000) {
            const toast = document.getElementById('notificationToast');
            const toastMessage = document.getElementById('toastMessage');

            // Set message
            toastMessage.innerHTML = message;

            // Set type
            toast.className = 'toast';
            toast.classList.add(type);

            // Show toast
            toast.classList.add('show');

            // Auto hide
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
        }

        // Setup form validation
        function setupFormValidation() {
            const forms = document.querySelectorAll('form');
            forms.forEach(form => {
                form.addEventListener('submit', function (e) {
                    if (!form.checkValidity()) {
                        e.preventDefault();
                        e.stopPropagation();

                        // Add validation styles
                        const invalidFields = form.querySelectorAll(':invalid');
                        invalidFields.forEach(field => {
                            field.style.borderColor = '#f44336';
                            field.style.boxShadow = '0 0 0 3px rgba(244, 67, 54, 0.1)';

                            // Reset on next input
                            field.addEventListener('input', function () {
                                this.style.borderColor = '';
                                this.style.boxShadow = '';
                            }, { once: true });
                        });

                        showToast('Please fill in all required fields correctly', 'error');
                    }
                });
            });
        }

        // Initialize modal
        function initializeModal() {
            // Close modal when clicking outside
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                modal.addEventListener('click', function (e) {
                    if (e.target === this) {
                        this.classList.remove('show');
                        document.body.style.overflow = 'auto';
                    }
                });
            });

            // Prevent modal body clicks from closing modal
            document.querySelectorAll('.modal-content').forEach(content => {
                content.addEventListener('click', function (e) {
                    e.stopPropagation();
                });
            });
        }
 