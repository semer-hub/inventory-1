// ============================================
// INVENTORY MANAGEMENT SYSTEM
// ============================================

// Global State
let products = [];
let stockTransactions = [];
let stockOutHistory = [];
let lowStockThreshold = 5;
let editingProductId = null;
let confirmCallback = null;

// Initialize on DOM Ready
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    initializeElements();
    setupEventListeners();
    updateDashboard();
});

// ============================================
// INITIALIZE DOM ELEMENTS
// ============================================

let elements = {};

function initializeElements() {
    // Navigation
    elements.sidebar = document.querySelector('.sidebar');
    elements.sidebarNav = document.querySelector('.sidebar-nav');
    elements.toggleSidebarBtn = document.getElementById('toggleSidebarBtn');
    elements.navLinks = document.querySelectorAll('.nav-link');
    elements.sections = document.querySelectorAll('.section');
    elements.pageTitle = document.getElementById('pageTitle');

    // Header & Buttons
    elements.addProductBtn = document.getElementById('addProductBtn');
    elements.globalSearch = document.getElementById('globalSearch');

    // Modals
    elements.productModal = document.getElementById('productModal');
    elements.stockActionModal = document.getElementById('stockActionModal');
    elements.confirmModal = document.getElementById('confirmModal');

    // Product Form
    elements.productForm = document.getElementById('productForm');
    elements.productName = document.getElementById('productName');
    elements.productImage = document.getElementById('productImage');
    elements.imagePreview = document.getElementById('imagePreview');
    elements.noImagePlaceholder = document.getElementById('noImagePlaceholder');
    elements.productImageData = document.getElementById('productImageData');
    elements.sku = document.getElementById('sku');
    elements.category = document.getElementById('category');
    elements.quantity = document.getElementById('quantity');
    elements.costPrice = document.getElementById('costPrice');
    elements.sellingPrice = document.getElementById('sellingPrice');
    elements.supplier = document.getElementById('supplier');
    elements.modalCloseBtn = document.getElementById('modalCloseBtn');
    elements.cancelBtn = document.getElementById('cancelBtn');
    elements.modalTitle = document.getElementById('modalTitle');

    // Products Table
    elements.productsTableBody = document.getElementById('productsTableBody');
    elements.productSearch = document.getElementById('productSearch');
    elements.categoryFilter = document.getElementById('categoryFilter');
    elements.statusFilter = document.getElementById('statusFilter');

    // Stock Action Modal
    elements.stockActionTitle = document.getElementById('stockActionTitle');
    elements.restockBtn = document.getElementById('restockBtn');
    elements.saleBtn = document.getElementById('saleBtn');
    elements.stockQuantity = document.getElementById('stockQuantity');
    elements.confirmStockBtn = document.getElementById('confirmStockBtn');
    elements.stockActionCloseBtn = document.getElementById('stockActionCloseBtn');
    elements.stockActionForm = document.getElementById('stockActionForm');
    elements.actionButtons = document.querySelector('.action-buttons');

    // Confirm Modal
    elements.confirmMessage = document.getElementById('confirmMessage');
    elements.confirmYesBtn = document.getElementById('confirmYesBtn');
    elements.confirmNoBtn = document.getElementById('confirmNoBtn');

    // Stock Out Form
    elements.stockOutForm = document.getElementById('stockOutForm');
    elements.stockOutProduct = document.getElementById('stockOutProduct');
    elements.stockOutQuantity = document.getElementById('stockOutQuantity');
    elements.stockOutReason = document.getElementById('stockOutReason');
    elements.stockOutDate = document.getElementById('stockOutDate');
    elements.stockOutNotes = document.getElementById('stockOutNotes');
    elements.stockOutHistory = document.getElementById('stockOutHistory');

    // Reports
    elements.lowStockReport = document.getElementById('lowStockReport');
    elements.outOfStockReport = document.getElementById('outOfStockReport');
    elements.stockMovementHistory = document.getElementById('stockMovementHistory');
    elements.inventorySummary = document.getElementById('inventorySummary');
    elements.exportCsvBtn = document.getElementById('exportCsvBtn');
    elements.printReportBtn = document.getElementById('printReportBtn');

    // Dashboard
    elements.totalProducts = document.getElementById('totalProducts');
    elements.totalStock = document.getElementById('totalStock');
    elements.lowStockCount = document.getElementById('lowStockCount');
    elements.outOfStockCount = document.getElementById('outOfStockCount');
    elements.inventoryValue = document.getElementById('inventoryValue');
    elements.estimatedProfit = document.getElementById('estimatedProfit');
    elements.activityList = document.getElementById('activityList');
    elements.stockChart = document.getElementById('stockChart');
    elements.toastContainer = document.getElementById('toastContainer');

    // Settings
    elements.lowStockThresholdInput = document.getElementById('lowStockThreshold');
    elements.clearDataBtn = document.getElementById('clearDataBtn');
    elements.exportDataBtn = document.getElementById('exportDataBtn');
    elements.importDataFile = document.getElementById('importDataFile');

    // Set initial date for stock out form
    const today = new Date().toISOString().split('T')[0];
    if (elements.stockOutDate) elements.stockOutDate.value = today;
}

// ============================================
// EVENT LISTENERS SETUP
// ============================================

function setupEventListeners() {
    // Navigation
    elements.toggleSidebarBtn?.addEventListener('click', toggleSidebar);
    elements.navLinks?.forEach(link => {
        link.addEventListener('click', handleNavigation);
    });

    // Product Modal
    elements.addProductBtn?.addEventListener('click', openProductModal);
    elements.modalCloseBtn?.addEventListener('click', closeProductModal);
    elements.cancelBtn?.addEventListener('click', closeProductModal);
    elements.productModal?.addEventListener('click', (e) => {
        if (e.target === elements.productModal) closeProductModal();
    });

    // Product Form
    elements.productForm?.addEventListener('submit', handleProductSubmit);
    elements.productImage?.addEventListener('change', handleImageUpload);

    // Search & Filter
    elements.globalSearch?.addEventListener('input', filterProducts);
    elements.productSearch?.addEventListener('input', filterProducts);
    elements.categoryFilter?.addEventListener('change', filterProducts);
    elements.statusFilter?.addEventListener('change', filterProducts);

    // Stock Out Form
    elements.stockOutForm?.addEventListener('submit', handleStockOut);

    // Stock Action Modal
    elements.restockBtn?.addEventListener('click', () => openStockAction('restock'));
    elements.saleBtn?.addEventListener('click', () => openStockAction('sale'));
    elements.confirmStockBtn?.addEventListener('click', confirmStockAction);
    elements.stockActionCloseBtn?.addEventListener('click', closeStockActionModal);
    elements.stockActionModal?.addEventListener('click', (e) => {
        if (e.target === elements.stockActionModal) closeStockActionModal();
    });

    // Reports
    elements.exportCsvBtn?.addEventListener('click', exportToCSV);
    elements.printReportBtn?.addEventListener('click', printReport);

    // Settings
    elements.lowStockThresholdInput?.addEventListener('change', updateLowStockThreshold);
    elements.clearDataBtn?.addEventListener('click', confirmClearData);
    elements.exportDataBtn?.addEventListener('click', exportData);
    elements.importDataFile?.addEventListener('change', importData);

    // Confirm Modal
    elements.confirmYesBtn?.addEventListener('click', handleConfirm);
    elements.confirmNoBtn?.addEventListener('click', closeConfirmModal);
    elements.confirmModal?.addEventListener('click', (e) => {
        if (e.target === elements.confirmModal) closeConfirmModal();
    });
}

// ============================================
// NAVIGATION
// ============================================

function toggleSidebar() {
    elements.sidebarNav?.classList.toggle('active');
}

function handleNavigation(e) {
    e.preventDefault();
    const section = e.currentTarget.getAttribute('data-section');
    if (!section) return;

    showSection(section);
    
    elements.navLinks?.forEach(link => link.classList.remove('active'));
    e.currentTarget.classList.add('active');
    
    elements.sidebarNav?.classList.remove('active');
}

function showSection(sectionId) {
    elements.sections?.forEach(section => section.classList.remove('active'));
    document.getElementById(sectionId)?.classList.add('active');
    
    const sectionNames = {
        dashboard: 'Dashboard',
        products: 'Products',
        'stock-out': 'Stock Out',
        reports: 'Reports',
        settings: 'Settings'
    };
    
    if (elements.pageTitle) elements.pageTitle.textContent = sectionNames[sectionId] || 'Dashboard';
    
    if (sectionId === 'reports') updateReports();
    if (sectionId === 'stock-out') updateStockOutProductDropdown();
    if (sectionId === 'products') renderProducts();
}

// ============================================
// PRODUCT MANAGEMENT
// ============================================

function openProductModal() {
    editingProductId = null;
    elements.productForm?.reset();
    if (elements.imagePreview) elements.imagePreview.style.display = 'none';
    if (elements.noImagePlaceholder) elements.noImagePlaceholder.style.display = 'flex';
    if (elements.productImageData) elements.productImageData.value = '';
    if (elements.modalTitle) elements.modalTitle.textContent = 'Add Product';
    generateSKU();
    elements.productModal?.classList.add('active');
    elements.productName?.focus();
}

function closeProductModal() {
    elements.productModal?.classList.remove('active');
    elements.productForm?.reset();
    editingProductId = null;
}

function generateSKU() {
    const prefix = 'SKU';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    if (elements.sku) elements.sku.value = `${prefix}${timestamp}${random}`;
}

function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        const base64 = event.target.result;
        if (elements.productImageData) elements.productImageData.value = base64;
        if (elements.imagePreview) {
            elements.imagePreview.src = base64;
            elements.imagePreview.style.display = 'block';
        }
        if (elements.noImagePlaceholder) elements.noImagePlaceholder.style.display = 'none';
    };
    reader.readAsDataURL(file);
}

function handleProductSubmit(e) {
    e.preventDefault();
    
    if (!elements.productName?.value.trim()) {
        showToast('Please enter product name', 'error');
        return;
    }

    const product = {
        id: editingProductId || Date.now().toString(),
        name: elements.productName.value,
        sku: elements.sku?.value || '',
        category: elements.category?.value || '',
        quantity: parseInt(elements.quantity?.value) || 0,
        costPrice: parseFloat(elements.costPrice?.value) || 0,
        sellingPrice: parseFloat(elements.sellingPrice?.value) || 0,
        supplier: elements.supplier?.value || '',
        image: elements.productImageData?.value || '',
        dateAdded: new Date().toISOString(),
        status: getProductStatus(parseInt(elements.quantity?.value) || 0)
    };

    if (editingProductId) {
        const index = products.findIndex(p => p.id === editingProductId);
        if (index >= 0) {
            products[index] = product;
            addActivity(`Updated product: ${product.name}`, 'edit');
            showToast('Product updated successfully', 'success');
        }
    } else {
        products.push(product);
        addActivity(`Added new product: ${product.name}`, 'add');
        showToast('Product added successfully', 'success');
    }

    saveData();
    renderProducts();
    updateDashboard();
    closeProductModal();
}

function editProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    editingProductId = id;
    if (elements.productName) elements.productName.value = product.name;
    if (elements.sku) elements.sku.value = product.sku;
    if (elements.category) elements.category.value = product.category;
    if (elements.quantity) elements.quantity.value = product.quantity;
    if (elements.costPrice) elements.costPrice.value = product.costPrice;
    if (elements.sellingPrice) elements.sellingPrice.value = product.sellingPrice;
    if (elements.supplier) elements.supplier.value = product.supplier;
    if (elements.productImageData) elements.productImageData.value = product.image || '';

    if (product.image) {
        if (elements.imagePreview) {
            elements.imagePreview.src = product.image;
            elements.imagePreview.style.display = 'block';
        }
        if (elements.noImagePlaceholder) elements.noImagePlaceholder.style.display = 'none';
    } else {
        if (elements.imagePreview) elements.imagePreview.style.display = 'none';
        if (elements.noImagePlaceholder) elements.noImagePlaceholder.style.display = 'flex';
    }

    if (elements.modalTitle) elements.modalTitle.textContent = 'Edit Product';
    elements.productModal?.classList.add('active');
    elements.productName?.focus();
}

function deleteProduct(id) {
    const product = products.find(p => p.id === id);
    if (!product) return;

    confirmCallback = () => {
        products = products.filter(p => p.id !== id);
        addActivity(`Deleted product: ${product.name}`, 'delete');
        saveData();
        renderProducts();
        updateDashboard();
        showToast('Product deleted successfully', 'success');
    };

    if (elements.confirmMessage) elements.confirmMessage.textContent = `Are you sure you want to delete "${product.name}"?`;
    elements.confirmModal?.classList.add('active');
}

// ============================================
// RENDER PRODUCTS TABLE
// ============================================

function renderProducts() {
    if (!elements.productsTableBody) return;

    elements.productsTableBody.innerHTML = '';

    if (products.length === 0) {
        elements.productsTableBody.innerHTML = '<tr class="empty-row"><td colspan="11" class="empty-message">No products found</td></tr>';
        return;
    }

    products.forEach(product => {
        const row = document.createElement('tr');
        const status = getProductStatus(product.quantity);
        const imageCell = product.image 
            ? `<img src="${product.image}" class="product-thumbnail" alt="${product.name}" style="max-width: 40px; max-height: 40px; border-radius: 4px;">`
            : '<div style="width: 40px; height: 40px; background: #334155; display: flex; align-items: center; justify-content: center; border-radius: 4px;"><i class="fas fa-image" style="font-size: 20px;"></i></div>';

        row.innerHTML = `
            <td>${imageCell}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td><span class="status-badge status-${status.toLowerCase().replace(' ', '-')}">${status}</span></td>
            <td>$${product.costPrice.toFixed(2)}</td>
            <td>$${product.sellingPrice.toFixed(2)}</td>
            <td>${product.supplier}</td>
            <td>${formatDate(product.dateAdded)}</td>
            <td>
                <button onclick="editProduct('${product.id}')" style="padding: 4px 8px; margin: 2px; font-size: 12px; cursor: pointer;"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteProduct('${product.id}')" style="padding: 4px 8px; margin: 2px; font-size: 12px; cursor: pointer;"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        elements.productsTableBody.appendChild(row);
    });
}

function filterProducts() {
    const searchTerm = elements.productSearch?.value.toLowerCase() || '';
    const globalSearchTerm = elements.globalSearch?.value.toLowerCase() || '';
    const category = elements.categoryFilter?.value || '';
    const status = elements.statusFilter?.value || '';

    const filtered = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm) || 
                            product.sku.toLowerCase().includes(searchTerm) ||
                            product.name.toLowerCase().includes(globalSearchTerm);
        const matchesCategory = !category || product.category === category;
        const matchesStatus = !status || getProductStatus(product.quantity) === status;
        return matchesSearch && matchesCategory && matchesStatus;
    });

    if (!elements.productsTableBody) return;
    elements.productsTableBody.innerHTML = '';

    if (filtered.length === 0) {
        elements.productsTableBody.innerHTML = '<tr class="empty-row"><td colspan="11" class="empty-message">No products found</td></tr>';
        return;
    }

    filtered.forEach(product => {
        const row = document.createElement('tr');
        const status = getProductStatus(product.quantity);
        const imageCell = product.image 
            ? `<img src="${product.image}" class="product-thumbnail" alt="${product.name}" style="max-width: 40px; max-height: 40px; border-radius: 4px;">`
            : '<div style="width: 40px; height: 40px; background: #334155; display: flex; align-items: center; justify-content: center; border-radius: 4px;"><i class="fas fa-image"></i></div>';

        row.innerHTML = `
            <td>${imageCell}</td>
            <td><strong>${product.name}</strong></td>
            <td>${product.sku}</td>
            <td>${product.category}</td>
            <td>${product.quantity}</td>
            <td><span class="status-badge status-${status.toLowerCase().replace(' ', '-')}">${status}</span></td>
            <td>$${product.costPrice.toFixed(2)}</td>
            <td>$${product.sellingPrice.toFixed(2)}</td>
            <td>${product.supplier}</td>
            <td>${formatDate(product.dateAdded)}</td>
            <td>
                <button onclick="editProduct('${product.id}')" style="padding: 4px 8px; margin: 2px; font-size: 12px; cursor: pointer;"><i class="fas fa-edit"></i> Edit</button>
                <button onclick="deleteProduct('${product.id}')" style="padding: 4px 8px; margin: 2px; font-size: 12px; cursor: pointer;"><i class="fas fa-trash"></i> Delete</button>
            </td>
        `;
        elements.productsTableBody.appendChild(row);
    });
}

// ============================================
// STOCK MANAGEMENT
// ============================================

let currentStockActionProductId = null;
let currentStockActionType = null;

function openStockActionModal(productId) {
    currentStockActionProductId = productId;
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (elements.stockActionTitle) elements.stockActionTitle.textContent = `Update Stock - ${product.name}`;
    if (elements.stockQuantity) elements.stockQuantity.value = '1';
    if (elements.stockActionForm) elements.stockActionForm.style.display = 'none';
    if (elements.actionButtons) elements.actionButtons.style.display = 'grid';
    currentStockActionType = null;
    elements.stockActionModal?.classList.add('active');
}

function openStockAction(type) {
    currentStockActionType = type;
    if (elements.stockActionForm) elements.stockActionForm.style.display = 'flex';
    if (elements.actionButtons) elements.actionButtons.style.display = 'none';
}

function confirmStockAction() {
    if (!currentStockActionProductId || !currentStockActionType) return;

    const product = products.find(p => p.id === currentStockActionProductId);
    if (!product) return;

    const quantity = parseInt(elements.stockQuantity?.value) || 1;
    if (quantity <= 0) {
        showToast('Please enter a valid quantity', 'error');
        return;
    }

    if (currentStockActionType === 'restock') {
        product.quantity += quantity;
        addActivity(`Restocked ${product.name}: +${quantity} units`, 'restock');
        showToast(`Added ${quantity} units to ${product.name}`, 'success');
    } else if (currentStockActionType === 'sale') {
        if (product.quantity < quantity) {
            showToast('Insufficient stock', 'error');
            return;
        }
        product.quantity -= quantity;
        addActivity(`Sold ${product.name}: -${quantity} units`, 'sale');
        showToast(`Removed ${quantity} units from ${product.name}`, 'success');
    }

    product.status = getProductStatus(product.quantity);
    recordTransaction(product.id, currentStockActionType, quantity);
    saveData();
    renderProducts();
    updateDashboard();
    closeStockActionModal();
}

function closeStockActionModal() {
    elements.stockActionModal?.classList.remove('active');
    currentStockActionProductId = null;
    currentStockActionType = null;
    if (elements.actionButtons) elements.actionButtons.style.display = 'grid';
    if (elements.stockActionForm) elements.stockActionForm.style.display = 'none';
}

// ============================================
// STOCK OUT FORM
// ============================================

function updateStockOutProductDropdown() {
    if (!elements.stockOutProduct) return;
    elements.stockOutProduct.innerHTML = '<option value="">Select Product</option>';
    products.forEach(product => {
        const option = document.createElement('option');
        option.value = product.id;
        option.textContent = `${product.name} (Stock: ${product.quantity})`;
        elements.stockOutProduct.appendChild(option);
    });
}

function handleStockOut(e) {
    e.preventDefault();

    if (!elements.stockOutProduct?.value || !elements.stockOutQuantity?.value || !elements.stockOutReason?.value) {
        showToast('Please fill all required fields', 'error');
        return;
    }

    const product = products.find(p => p.id === elements.stockOutProduct.value);
    if (!product) return;

    const quantity = parseInt(elements.stockOutQuantity.value);
    if (quantity <= 0 || quantity > product.quantity) {
        showToast('Invalid quantity', 'error');
        return;
    }

    product.quantity -= quantity;
    product.status = getProductStatus(product.quantity);

    const transaction = {
        id: Date.now().toString(),
        productId: product.id,
        productName: product.name,
        quantity: quantity,
        reason: elements.stockOutReason.value,
        date: elements.stockOutDate?.value || new Date().toISOString().split('T')[0],
        notes: elements.stockOutNotes?.value || '',
        timestamp: new Date().toISOString()
    };

    stockOutHistory.push(transaction);
    recordTransaction(product.id, 'stock-out', quantity, elements.stockOutReason.value);
    addActivity(`Stock out: ${product.name} - ${quantity} units (${elements.stockOutReason.value})`, 'stock-out');

    saveData();
    renderProducts();
    updateDashboard();
    renderStockOutHistory();
    
    elements.stockOutForm?.reset();
    const today = new Date().toISOString().split('T')[0];
    if (elements.stockOutDate) elements.stockOutDate.value = today;
    showToast('Stock out recorded successfully', 'success');
}

function renderStockOutHistory() {
    if (!elements.stockOutHistory) return;
    elements.stockOutHistory.innerHTML = '';

    if (stockOutHistory.length === 0) {
        elements.stockOutHistory.innerHTML = '<p class="empty-message">No stock out transactions yet</p>';
        return;
    }

    const recent = [...stockOutHistory].reverse().slice(0, 10);
    recent.forEach(transaction => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; border-bottom: 1px solid #334155; background: #1a2744; margin-bottom: 8px; border-radius: 4px;';
        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 4px;">
                <strong>${transaction.productName}</strong>
                <span style="color: #ef4444;">-${transaction.quantity}</span>
            </div>
            <div style="font-size: 12px; color: #94a3b8;">${transaction.reason}</div>
            ${transaction.notes ? `<div style="font-size: 12px; color: #94a3b8;">Notes: ${transaction.notes}</div>` : ''}
            <div style="font-size: 11px; color: #64748b; margin-top: 4px;">${formatDate(transaction.timestamp)}</div>
        `;
        elements.stockOutHistory.appendChild(item);
    });
}

// ============================================
// REPORTS
// ============================================

function updateReports() {
    updateLowStockReport();
    updateOutOfStockReport();
    updateStockMovementHistory();
    updateInventorySummary();
}

function updateLowStockReport() {
    if (!elements.lowStockReport) return;
    elements.lowStockReport.innerHTML = '';
    const lowStockItems = products.filter(p => p.quantity > 0 && p.quantity <= lowStockThreshold);

    if (lowStockItems.length === 0) {
        elements.lowStockReport.innerHTML = '<p class="empty-message">No low stock items</p>';
        return;
    }

    lowStockItems.forEach(product => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 8px; display: flex; justify-content: space-between; border-bottom: 1px solid #334155;';
        item.innerHTML = `
            <span>${product.name} (${product.sku})</span>
            <span style="color: #f59e0b;">${product.quantity} units</span>
        `;
        elements.lowStockReport.appendChild(item);
    });
}

function updateOutOfStockReport() {
    if (!elements.outOfStockReport) return;
    elements.outOfStockReport.innerHTML = '';
    const outOfStockItems = products.filter(p => p.quantity === 0);

    if (outOfStockItems.length === 0) {
        elements.outOfStockReport.innerHTML = '<p class="empty-message">No out of stock items</p>';
        return;
    }

    outOfStockItems.forEach(product => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 8px; display: flex; justify-content: space-between; border-bottom: 1px solid #334155;';
        item.innerHTML = `
            <span>${product.name} (${product.sku})</span>
            <span style="color: #ef4444;">Out of Stock</span>
        `;
        elements.outOfStockReport.appendChild(item);
    });
}

function updateStockMovementHistory() {
    if (!elements.stockMovementHistory) return;
    elements.stockMovementHistory.innerHTML = '';

    if (stockTransactions.length === 0) {
        elements.stockMovementHistory.innerHTML = '<p class="empty-message">No stock movements yet</p>';
        return;
    }

    const recent = [...stockTransactions].reverse().slice(0, 20);
    recent.forEach(transaction => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 8px; display: flex; justify-content: space-between; border-bottom: 1px solid #334155;';
        const symbol = transaction.type === 'restock' ? '+' : '-';
        const color = transaction.type === 'restock' ? '#10b981' : '#ef4444';
        item.innerHTML = `
            <span>${transaction.productName}</span>
            <span style="color: ${color};">${symbol}${transaction.quantity} (${transaction.type})</span>
        `;
        elements.stockMovementHistory.appendChild(item);
    });
}

function updateInventorySummary() {
    if (!elements.inventorySummary) return;
    const totalProducts = products.length;
    const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
    const totalValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const estimatedProfit = products.reduce((sum, p) => sum + (p.quantity * (p.sellingPrice - p.costPrice)), 0);

    elements.inventorySummary.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 16px;">
            <div style="background: #1a2744; padding: 16px; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 14px;">Total Products</div>
                <div style="font-size: 24px; font-weight: bold; color: #3b82f6;">${totalProducts}</div>
            </div>
            <div style="background: #1a2744; padding: 16px; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 14px;">Total Quantity</div>
                <div style="font-size: 24px; font-weight: bold; color: #10b981;">${totalQuantity}</div>
            </div>
            <div style="background: #1a2744; padding: 16px; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 14px;">Inventory Value</div>
                <div style="font-size: 24px; font-weight: bold; color: #8b5cf6;">$${totalValue.toFixed(2)}</div>
            </div>
            <div style="background: #1a2744; padding: 16px; border-radius: 8px;">
                <div style="color: #94a3b8; font-size: 14px;">Est. Profit</div>
                <div style="font-size: 24px; font-weight: bold; color: #ec4899;">$${estimatedProfit.toFixed(2)}</div>
            </div>
        </div>
    `;
}

// ============================================
// EXPORT & PRINT
// ============================================

function exportToCSV() {
    if (products.length === 0) {
        showToast('No products to export', 'warning');
        return;
    }

    let csv = 'Product Name,SKU,Category,Quantity,Status,Cost Price,Selling Price,Supplier,Date Added\n';
    products.forEach(product => {
        const status = getProductStatus(product.quantity);
        csv += `"${product.name}","${product.sku}","${product.category}",${product.quantity},"${status}",${product.costPrice},${product.sellingPrice},"${product.supplier}","${formatDate(product.dateAdded)}"\n`;
    });

    const blob = new Blob([csv], { type: 'text/csv' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `inventory_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Inventory exported to CSV', 'success');
}

function printReport() {
    window.print();
}

function exportData() {
    const data = {
        products,
        stockTransactions,
        stockOutHistory,
        lowStockThreshold,
        exportDate: new Date().toISOString()
    };

    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.href = url;
    link.download = `inventory_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Data backed up successfully', 'success');
}

function importData(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            products = data.products || [];
            stockTransactions = data.stockTransactions || [];
            stockOutHistory = data.stockOutHistory || [];
            lowStockThreshold = data.lowStockThreshold || 5;
            
            if (elements.lowStockThresholdInput) elements.lowStockThresholdInput.value = lowStockThreshold;
            saveData();
            renderProducts();
            updateDashboard();
            showToast('Data imported successfully', 'success');
        } catch (error) {
            showToast('Error importing data', 'error');
        }
    };
    reader.readAsText(file);
    if (elements.importDataFile) elements.importDataFile.value = '';
}

// ============================================
// DASHBOARD
// ============================================

function updateDashboard() {
    const totalProducts = products.length;
    const totalStock = products.reduce((sum, p) => sum + p.quantity, 0);
    const lowStockCount = products.filter(p => p.quantity > 0 && p.quantity <= lowStockThreshold).length;
    const outOfStockCount = products.filter(p => p.quantity === 0).length;
    const inventoryValue = products.reduce((sum, p) => sum + (p.quantity * p.costPrice), 0);
    const estimatedProfit = products.reduce((sum, p) => sum + (p.quantity * (p.sellingPrice - p.costPrice)), 0);

    if (elements.totalProducts) elements.totalProducts.textContent = totalProducts;
    if (elements.totalStock) elements.totalStock.textContent = totalStock;
    if (elements.lowStockCount) elements.lowStockCount.textContent = lowStockCount;
    if (elements.outOfStockCount) elements.outOfStockCount.textContent = outOfStockCount;
    if (elements.inventoryValue) elements.inventoryValue.textContent = `$${inventoryValue.toFixed(2)}`;
    if (elements.estimatedProfit) elements.estimatedProfit.textContent = `$${estimatedProfit.toFixed(2)}`;

    renderActivityList();
    drawChart();
}

function renderActivityList() {
    if (!elements.activityList) return;
    elements.activityList.innerHTML = '';
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    if (activities.length === 0) {
        elements.activityList.innerHTML = '<p class="empty-message">No activity yet</p>';
        return;
    }

    const recent = activities.slice(-10).reverse();
    recent.forEach(activity => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; border-bottom: 1px solid #334155; display: flex; gap: 12px;';
        let icon = '📝';
        if (activity.type === 'add') icon = '➕';
        if (activity.type === 'edit') icon = '✏️';
        if (activity.type === 'delete') icon = '🗑️';
        if (activity.type === 'restock') icon = '📈';
        if (activity.type === 'sale') icon = '📉';
        if (activity.type === 'stock-out') icon = '↗️';

        item.innerHTML = `
            <span style="font-size: 18px;">${icon}</span>
            <div style="flex: 1;">
                <div>${activity.message}</div>
                <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${new Date(activity.timestamp).toLocaleString()}</div>
            </div>
        `;
        elements.activityList.appendChild(item);
    });
}

function drawChart() {
    if (!elements.stockChart) return;

    const ctx = elements.stockChart.getContext('2d');
    const width = elements.stockChart.clientWidth;
    const height = 300;
    elements.stockChart.width = width;
    elements.stockChart.height = height;

    const categories = {};
    products.forEach(p => {
        if (!categories[p.category]) categories[p.category] = 0;
        categories[p.category] += p.quantity;
    });

    const categoryNames = Object.keys(categories);
    const quantities = Object.values(categories);
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

    if (categoryNames.length === 0) {
        ctx.fillStyle = '#94a3b8';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data to display', width / 2, height / 2);
        return;
    }

    const maxQuantity = Math.max(...quantities, 1);
    const barWidth = width / (categoryNames.length * 1.5);
    const padding = 40;

    // Axes
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padding, height - padding);
    ctx.lineTo(padding, padding);
    ctx.lineTo(width - 20, height - padding);
    ctx.stroke();

    // Bars
    categoryNames.forEach((name, index) => {
        const barHeight = (quantities[index] / maxQuantity) * (height - 80);
        const x = padding + index * (barWidth * 1.5) + barWidth * 0.25;
        const y = height - padding - barHeight;

        ctx.fillStyle = colors[index % colors.length];
        ctx.fillRect(x, y, barWidth, barHeight);

        // Label
        ctx.fillStyle = '#cbd5e1';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(name, x + barWidth / 2, height - padding + 20);

        // Value
        ctx.fillText(quantities[index], x + barWidth / 2, y - 5);
    });
}

// ============================================
// SETTINGS
// ============================================

function updateLowStockThreshold() {
    lowStockThreshold = parseInt(elements.lowStockThresholdInput?.value) || 5;
    products.forEach(p => {
        p.status = getProductStatus(p.quantity);
    });
    saveData();
    renderProducts();
    updateDashboard();
    showToast('Low stock threshold updated', 'success');
}

function confirmClearData() {
    confirmCallback = clearAllData;
    if (elements.confirmMessage) elements.confirmMessage.textContent = 'Are you sure you want to delete ALL data? This cannot be undone.';
    elements.confirmModal?.classList.add('active');
}

function clearAllData() {
    products = [];
    stockTransactions = [];
    stockOutHistory = [];
    saveData();
    renderProducts();
    updateDashboard();
    showToast('All data cleared', 'success');
}

// ============================================
// UTILITIES
// ============================================

function getProductStatus(quantity) {
    if (quantity === 0) return 'Out of Stock';
    if (quantity <= lowStockThreshold) return 'Low Stock';
    return 'In Stock';
}

function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return 'N/A';
    }
}

function recordTransaction(productId, type, quantity, reason = '') {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    stockTransactions.push({
        id: Date.now().toString(),
        productId,
        productName: product.name,
        type,
        quantity,
        reason,
        timestamp: new Date().toISOString()
    });
}

function addActivity(message, type = 'default') {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    activities.push({
        message,
        type,
        timestamp: new Date().toISOString()
    });
    if (activities.length > 100) activities.shift();
    localStorage.setItem('activities', JSON.stringify(activities));
}

// ============================================
// MODALS
// ============================================

function closeConfirmModal() {
    elements.confirmModal?.classList.remove('active');
    confirmCallback = null;
}

function handleConfirm() {
    if (confirmCallback) {
        confirmCallback();
    }
    closeConfirmModal();
}

// ============================================
// TOAST NOTIFICATIONS
// ============================================

function showToast(message, type = 'info') {
    if (!elements.toastContainer) return;
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.style.cssText = `
        padding: 12px 16px;
        margin-bottom: 8px;
        border-radius: 4px;
        font-size: 14px;
        animation: slideInRight 0.3s ease;
        ${type === 'success' ? 'background: #10b981; color: white;' : ''}
        ${type === 'error' ? 'background: #ef4444; color: white;' : ''}
        ${type === 'warning' ? 'background: #f59e0b; color: white;' : ''}
        ${type === 'info' ? 'background: #3b82f6; color: white;' : ''}
    `;
    toast.textContent = message;
    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ============================================
// DATA PERSISTENCE
// ============================================

function saveData() {
    localStorage.setItem('products', JSON.stringify(products));
    localStorage.setItem('stockTransactions', JSON.stringify(stockTransactions));
    localStorage.setItem('stockOutHistory', JSON.stringify(stockOutHistory));
    localStorage.setItem('lowStockThreshold', lowStockThreshold.toString());
}

function loadData() {
    products = JSON.parse(localStorage.getItem('products') || '[]');
    stockTransactions = JSON.parse(localStorage.getItem('stockTransactions') || '[]');
    stockOutHistory = JSON.parse(localStorage.getItem('stockOutHistory') || '[]');
    lowStockThreshold = parseInt(localStorage.getItem('lowStockThreshold') || '5');
}
