// Customer Management functionality for Bank Loan Management System

function loadCustomersPage(container) {
    if (!auth.requirePermission('customer_management')) return;
    
    const customersHtml = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-users me-2"></i>Customer Management</h2>
                        <p class="text-muted">Manage customer information and KYC verification.</p>
                    </div>
                    <button class="btn btn-primary" onclick="showAddCustomerModal()">
                        <i class="fas fa-plus me-2"></i>Add New Customer
                    </button>
                </div>
            </div>
        </div>

        <!-- Search and Filters -->
        <div class="row mb-4">
            <div class="col-lg-6">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="customerSearch" 
                           placeholder="Search customers by name, email, or phone..."
                           oninput="searchCustomers(this.value)">
                </div>
            </div>
            <div class="col-lg-3">
                <select class="form-select" id="kycStatusFilter" onchange="filterCustomers()">
                    <option value="">All KYC Status</option>
                    <option value="Verified">Verified</option>
                    <option value="Pending">Pending</option>
                    <option value="Rejected">Rejected</option>
                </select>
            </div>
            <div class="col-lg-3">
                <select class="form-select" id="statusFilter" onchange="filterCustomers()">
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>
        </div>

        <!-- Customer Statistics -->
        <div class="row mb-4">
            ${getCustomerStats()}
        </div>

        <!-- Customers Table -->
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Customer List</h5>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="exportCustomers()">
                        <i class="fas fa-download me-1"></i>Export
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="refreshCustomers()">
                        <i class="fas fa-sync me-1"></i>Refresh
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="customersTable">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>Email</th>
                                <th>Phone</th>
                                <th>KYC Status</th>
                                <th>Credit Score</th>
                                <th>Status</th>
                                <th>Joined</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="customersTableBody">
                            <!-- Customer data will be loaded here -->
                        </tbody>
                    </table>
                </div>
                
                <!-- Pagination -->
                <nav aria-label="Customer pagination" id="customersPagination">
                    <!-- Pagination will be loaded here -->
                </nav>
            </div>
        </div>
    `;

    container.innerHTML = customersHtml;
    loadCustomersTable();
}

function getCustomerStats() {
    const customers = dataManager.getCustomers();
    const totalCustomers = customers.length;
    const activeCustomers = customers.filter(c => c.isActive).length;
    const verifiedCustomers = customers.filter(c => c.kyc.status === 'Verified').length;
    const pendingKyc = customers.filter(c => c.kyc.status === 'Pending').length;

    return `
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card primary">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Total Customers</h6>
                            <div class="stat-number">${totalCustomers}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card success">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Active Customers</h6>
                            <div class="stat-number">${activeCustomers}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-user-check"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card info">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">KYC Verified</h6>
                            <div class="stat-number">${verifiedCustomers}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-shield-alt"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card warning">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Pending KYC</h6>
                            <div class="stat-number">${pendingKyc}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadCustomersTable(customers = null) {
    if (!customers) {
        customers = dataManager.getCustomers();
    }

    const tableBody = document.getElementById('customersTableBody');
    
    if (customers.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="9" class="text-center py-4 text-muted">
                    <i class="fas fa-users fa-3x mb-3"></i><br>
                    No customers found
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = customers.map(customer => `
        <tr>
            <td><code>${customer.id}</code></td>
            <td>
                <div class="d-flex align-items-center">
                    <div class="avatar me-2">
                        <div class="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center" 
                             style="width: 32px; height: 32px; font-size: 12px;">
                            ${customer.firstName.charAt(0)}${customer.lastName.charAt(0)}
                        </div>
                    </div>
                    <div>
                        <div class="fw-bold">${customer.firstName} ${customer.lastName}</div>
                        <small class="text-muted">Age: ${utils.calculateAge(customer.dateOfBirth)}</small>
                    </div>
                </div>
            </td>
            <td>
                <a href="mailto:${customer.email}" class="text-decoration-none">
                    ${customer.email}
                </a>
            </td>
            <td>
                <a href="tel:${customer.phone}" class="text-decoration-none">
                    ${customer.phone}
                </a>
            </td>
            <td>
                <span class="status-badge ${getKycStatusClass(customer.kyc.status)}">
                    ${customer.kyc.status}
                </span>
            </td>
            <td>
                <div class="d-flex align-items-center">
                    <span class="me-2">${customer.financial.creditScore}</span>
                    <div class="progress" style="width: 60px; height: 6px;">
                        <div class="progress-bar ${getCreditScoreColor(customer.financial.creditScore)}" 
                             style="width: ${(customer.financial.creditScore / 850) * 100}%"></div>
                    </div>
                </div>
            </td>
            <td>
                <span class="status-badge ${customer.isActive ? 'status-active' : 'status-rejected'}">
                    ${customer.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>${utils.formatDate(customer.createdAt)}</td>
            <td>
                <div class="btn-group" role="group">
                    <button class="btn btn-sm btn-outline-primary" onclick="viewCustomer('${customer.id}')" 
                            data-bs-toggle="tooltip" title="View Details">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-success" onclick="editCustomer('${customer.id}')"
                            data-bs-toggle="tooltip" title="Edit Customer">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-info" onclick="manageKyc('${customer.id}')"
                            data-bs-toggle="tooltip" title="Manage KYC">
                        <i class="fas fa-shield-alt"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="deleteCustomer('${customer.id}')"
                            data-bs-toggle="tooltip" title="Delete Customer">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Re-initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function getKycStatusClass(status) {
    switch (status) {
        case 'Verified': return 'status-approved';
        case 'Pending': return 'status-pending';
        case 'Rejected': return 'status-rejected';
        default: return 'status-pending';
    }
}

function getCreditScoreColor(score) {
    if (score >= 750) return 'bg-success';
    if (score >= 650) return 'bg-warning';
    return 'bg-danger';
}

function searchCustomers(query) {
    const customers = dataManager.searchCustomers(query);
    loadCustomersTable(customers);
}

function filterCustomers() {
    const kycStatus = document.getElementById('kycStatusFilter').value;
    const status = document.getElementById('statusFilter').value;
    
    let customers = dataManager.getCustomers();
    
    if (kycStatus) {
        customers = customers.filter(customer => customer.kyc.status === kycStatus);
    }
    
    if (status !== '') {
        const isActive = status === 'true';
        customers = customers.filter(customer => customer.isActive === isActive);
    }
    
    loadCustomersTable(customers);
}

function refreshCustomers() {
    loadCustomersTable();
    auth.showAlert('Customer list refreshed', 'success');
}

function exportCustomers() {
    const customers = dataManager.getCustomers();
    
    // Generate CSV content
    let csvContent = 'ID,First Name,Last Name,Email,Phone,Date of Birth,KYC Status,Credit Score,Status,Joined Date\n';
    
    customers.forEach(customer => {
        csvContent += `${customer.id},"${customer.firstName}","${customer.lastName}",${customer.email},${customer.phone},${customer.dateOfBirth},${customer.kyc.status},${customer.financial.creditScore},${customer.isActive ? 'Active' : 'Inactive'},${customer.createdAt}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'customers_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    auth.showAlert('Customer data exported successfully!', 'success');
}

function showAddCustomerModal() {
    const modalHtml = `
        <div class="modal fade" id="addCustomerModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user-plus me-2"></i>Add New Customer
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${getCustomerForm()}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveCustomer()">
                            <i class="fas fa-save me-2"></i>Save Customer
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('addCustomerModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addCustomerModal'));
    modal.show();
}

function getCustomerForm(customer = null) {
    const isEdit = customer !== null;
    
    return `
        <form id="customerForm">
            <div class="row">
                <!-- Personal Information -->
                <div class="col-12">
                    <h6 class="fw-bold mb-3">Personal Information</h6>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="firstName" class="form-label">First Name *</label>
                        <input type="text" class="form-control" id="firstName" required
                               value="${customer ? customer.firstName : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="lastName" class="form-label">Last Name *</label>
                        <input type="text" class="form-control" id="lastName" required
                               value="${customer ? customer.lastName : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="email" class="form-label">Email Address *</label>
                        <input type="email" class="form-control" id="email" required
                               value="${customer ? customer.email : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="phone" class="form-label">Phone Number *</label>
                        <input type="tel" class="form-control" id="phone" required
                               value="${customer ? customer.phone : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="dateOfBirth" class="form-label">Date of Birth *</label>
                        <input type="date" class="form-control" id="dateOfBirth" required
                               value="${customer ? customer.dateOfBirth : ''}">
                    </div>
                </div>
                
                <!-- Address Information -->
                <div class="col-12 mt-3">
                    <h6 class="fw-bold mb-3">Address Information</h6>
                </div>
                
                <div class="col-12">
                    <div class="mb-3">
                        <label for="street" class="form-label">Street Address *</label>
                        <input type="text" class="form-control" id="street" required
                               value="${customer ? customer.address.street : ''}">
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="mb-3">
                        <label for="city" class="form-label">City *</label>
                        <input type="text" class="form-control" id="city" required
                               value="${customer ? customer.address.city : ''}">
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="mb-3">
                        <label for="state" class="form-label">State *</label>
                        <input type="text" class="form-control" id="state" required
                               value="${customer ? customer.address.state : ''}">
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="mb-3">
                        <label for="pincode" class="form-label">Pincode *</label>
                        <input type="text" class="form-control" id="pincode" required
                               value="${customer ? customer.address.pincode : ''}">
                    </div>
                </div>
                
                <!-- Employment Information -->
                <div class="col-12 mt-3">
                    <h6 class="fw-bold mb-3">Employment Information</h6>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="employmentType" class="form-label">Employment Type *</label>
                        <select class="form-select" id="employmentType" required>
                            <option value="">Select Type</option>
                            <option value="Salaried" ${customer && customer.employment.type === 'Salaried' ? 'selected' : ''}>Salaried</option>
                            <option value="Business" ${customer && customer.employment.type === 'Business' ? 'selected' : ''}>Business</option>
                            <option value="Professional" ${customer && customer.employment.type === 'Professional' ? 'selected' : ''}>Professional</option>
                            <option value="Other" ${customer && customer.employment.type === 'Other' ? 'selected' : ''}>Other</option>
                        </select>
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="company" class="form-label">Company/Organization *</label>
                        <input type="text" class="form-control" id="company" required
                               value="${customer ? customer.employment.company : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="designation" class="form-label">Designation *</label>
                        <input type="text" class="form-control" id="designation" required
                               value="${customer ? customer.employment.designation : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="monthlyIncome" class="form-label">Monthly Income (₹) *</label>
                        <input type="number" class="form-control" id="monthlyIncome" required min="0"
                               value="${customer ? customer.employment.monthlyIncome : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="workExperience" class="form-label">Work Experience (Years) *</label>
                        <input type="number" class="form-control" id="workExperience" required min="0"
                               value="${customer ? customer.employment.workExperience : ''}">
                    </div>
                </div>
                
                <!-- Financial Information -->
                <div class="col-12 mt-3">
                    <h6 class="fw-bold mb-3">Financial Information</h6>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="creditScore" class="form-label">Credit Score</label>
                        <input type="number" class="form-control" id="creditScore" min="300" max="850"
                               value="${customer ? customer.financial.creditScore : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="bankAccount" class="form-label">Bank Account Number *</label>
                        <input type="text" class="form-control" id="bankAccount" required
                               value="${customer ? customer.financial.bankAccount : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="ifscCode" class="form-label">IFSC Code *</label>
                        <input type="text" class="form-control" id="ifscCode" required
                               value="${customer ? customer.financial.ifscCode : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="panNumber" class="form-label">PAN Number *</label>
                        <input type="text" class="form-control" id="panNumber" required
                               value="${customer ? customer.financial.panNumber : ''}">
                    </div>
                </div>
            </div>
        </form>
    `;
}

function saveCustomer() {
    const form = document.getElementById('customerForm');
    const formData = new FormData(form);
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect form data
    const customerData = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        dateOfBirth: document.getElementById('dateOfBirth').value,
        address: {
            street: document.getElementById('street').value,
            city: document.getElementById('city').value,
            state: document.getElementById('state').value,
            pincode: document.getElementById('pincode').value,
            country: 'India'
        },
        employment: {
            type: document.getElementById('employmentType').value,
            company: document.getElementById('company').value,
            designation: document.getElementById('designation').value,
            monthlyIncome: parseInt(document.getElementById('monthlyIncome').value),
            workExperience: parseInt(document.getElementById('workExperience').value)
        },
        financial: {
            creditScore: parseInt(document.getElementById('creditScore').value) || 650,
            bankAccount: document.getElementById('bankAccount').value,
            ifscCode: document.getElementById('ifscCode').value,
            panNumber: document.getElementById('panNumber').value
        },
        kyc: {
            status: 'Pending',
            documents: []
        }
    };
    
    // Save customer
    if (dataManager.addCustomer(customerData)) {
        auth.showAlert('Customer added successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addCustomerModal')).hide();
        loadCustomersTable();
    } else {
        auth.showAlert('Error adding customer. Please try again.', 'danger');
    }
}

function viewCustomer(customerId) {
    const customer = dataManager.getCustomerById(customerId);
    if (!customer) {
        auth.showAlert('Customer not found', 'danger');
        return;
    }
    
    // Implementation would show customer details modal
    auth.showAlert(`Viewing customer: ${customer.firstName} ${customer.lastName}`, 'info');
}

function editCustomer(customerId) {
    const customer = dataManager.getCustomerById(customerId);
    if (!customer) {
        auth.showAlert('Customer not found', 'danger');
        return;
    }
    
    // Implementation would show edit modal with customer data
    auth.showAlert(`Edit functionality for ${customer.firstName} ${customer.lastName} would be implemented here`, 'info');
}

function manageKyc(customerId) {
    const customer = dataManager.getCustomerById(customerId);
    if (!customer) {
        auth.showAlert('Customer not found', 'danger');
        return;
    }
    
    // Implementation would show KYC management modal
    auth.showAlert(`KYC management for ${customer.firstName} ${customer.lastName} would be implemented here`, 'info');
}

function deleteCustomer(customerId) {
    const customer = dataManager.getCustomerById(customerId);
    if (!customer) {
        auth.showAlert('Customer not found', 'danger');
        return;
    }
    
    if (confirm(`Are you sure you want to delete customer ${customer.firstName} ${customer.lastName}? This action cannot be undone.`)) {
        if (dataManager.deleteCustomer(customerId)) {
            auth.showAlert('Customer deleted successfully!', 'success');
            loadCustomersTable();
        } else {
            auth.showAlert('Error deleting customer. Please try again.', 'danger');
        }
    }
} 