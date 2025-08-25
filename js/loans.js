// Loan Products Management functionality for Bank Loan Management System

function loadLoansPage(container) {
    if (!auth.requirePermission('loan_processing')) return;
    
    const loansHtml = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-money-bill-wave me-2"></i>Loan Products</h2>
                        <p class="text-muted">Manage loan products and their configurations.</p>
                    </div>
                    ${auth.hasPermission('all') ? `
                        <button class="btn btn-primary" onclick="showAddLoanModal()">
                            <i class="fas fa-plus me-2"></i>Add Loan Product
                        </button>
                    ` : ''}
                </div>
            </div>
        </div>

        <!-- Loan Product Statistics -->
        <div class="row mb-4">
            ${getLoanProductStats()}
        </div>

        <!-- Loan Products Grid -->
        <div class="row" id="loanProductsGrid">
            ${getLoanProductsGrid()}
        </div>
    `;

    container.innerHTML = loansHtml;
    initializeLoanProducts();
}

function getLoanProductStats() {
    const loans = dataManager.getLoans();
    const activeLoans = loans.filter(loan => loan.isActive).length;
    const totalApplications = dataManager.getApplications().length;
    const avgInterestRate = loans.reduce((sum, loan) => sum + loan.interestRate, 0) / loans.length;

    return `
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card primary">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Total Products</h6>
                            <div class="stat-number">${loans.length}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-list"></i>
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
                            <h6 class="text-white-50 mb-1">Active Products</h6>
                            <div class="stat-number">${activeLoans}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-check-circle"></i>
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
                            <h6 class="text-white-50 mb-1">Applications</h6>
                            <div class="stat-number">${totalApplications}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-file-alt"></i>
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
                            <h6 class="text-white-50 mb-1">Avg. Interest</h6>
                            <div class="stat-number">${avgInterestRate.toFixed(1)}%</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getLoanProductsGrid() {
    const loans = dataManager.getLoans();
    
    if (loans.length === 0) {
        return `
            <div class="col-12">
                <div class="text-center py-5">
                    <i class="fas fa-money-bill-wave fa-5x text-muted mb-4"></i>
                    <h4>No Loan Products Found</h4>
                    <p class="text-muted">Add loan products to get started.</p>
                </div>
            </div>
        `;
    }

    return loans.map(loan => `
        <div class="col-xl-4 col-lg-6 mb-4">
            <div class="card h-100 ${!loan.isActive ? 'opacity-75' : ''}">
                <div class="card-header d-flex justify-content-between align-items-center">
                    <h5 class="mb-0">${loan.name}</h5>
                    <div>
                        <span class="badge ${loan.isActive ? 'bg-success' : 'bg-secondary'}">
                            ${loan.isActive ? 'Active' : 'Inactive'}
                        </span>
                        ${getLoanTypeIcon(loan.type)}
                    </div>
                </div>
                <div class="card-body">
                    <p class="card-text text-muted">${loan.description}</p>
                    
                    <!-- Loan Details -->
                    <div class="row mb-3">
                        <div class="col-6">
                            <small class="text-muted">Interest Rate</small>
                            <div class="fw-bold text-primary">${loan.interestRate}% p.a.</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Processing Fee</small>
                            <div class="fw-bold">${loan.processingFee}%</div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-6">
                            <small class="text-muted">Min Amount</small>
                            <div class="fw-bold">${utils.formatCurrency(loan.minAmount)}</div>
                        </div>
                        <div class="col-6">
                            <small class="text-muted">Max Amount</small>
                            <div class="fw-bold">${utils.formatCurrency(loan.maxAmount)}</div>
                        </div>
                    </div>
                    
                    <div class="row mb-3">
                        <div class="col-12">
                            <small class="text-muted">Max Tenure</small>
                            <div class="fw-bold">${loan.maxTenure} months</div>
                        </div>
                    </div>
                    
                    <!-- Eligibility Criteria -->
                    <div class="mb-3">
                        <small class="text-muted">Eligibility</small>
                        <div class="small">
                            <div>Age: ${loan.eligibility.minAge}-${loan.eligibility.maxAge} years</div>
                            <div>Min Income: ${utils.formatCurrency(loan.eligibility.minIncome)}</div>
                            <div>Min Credit Score: ${loan.eligibility.minCreditScore}</div>
                        </div>
                    </div>
                    
                    <!-- Required Documents -->
                    <div class="mb-3">
                        <small class="text-muted">Required Documents</small>
                        <div class="mt-1">
                            ${loan.documents.slice(0, 3).map(doc => 
                                `<span class="badge bg-light text-dark me-1">${doc}</span>`
                            ).join('')}
                            ${loan.documents.length > 3 ? 
                                `<span class="badge bg-secondary">+${loan.documents.length - 3} more</span>` : ''
                            }
                        </div>
                    </div>
                </div>
                <div class="card-footer bg-transparent">
                    <div class="d-flex justify-content-between align-items-center">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewLoanDetails('${loan.id}')">
                            <i class="fas fa-eye me-1"></i>View
                        </button>
                        <div class="btn-group">
                            ${auth.hasPermission('all') ? `
                                <button class="btn btn-sm btn-outline-success" onclick="editLoan('${loan.id}')">
                                    <i class="fas fa-edit"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-${loan.isActive ? 'warning' : 'success'}" 
                                        onclick="toggleLoanStatus('${loan.id}')">
                                    <i class="fas fa-${loan.isActive ? 'pause' : 'play'}"></i>
                                </button>
                                <button class="btn btn-sm btn-outline-danger" onclick="deleteLoan('${loan.id}')">
                                    <i class="fas fa-trash"></i>
                                </button>
                            ` : ''}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getLoanTypeIcon(type) {
    const icons = {
        personal: 'fas fa-user',
        home: 'fas fa-home',
        vehicle: 'fas fa-car',
        business: 'fas fa-briefcase',
        education: 'fas fa-graduation-cap'
    };
    
    return `<i class="${icons[type] || 'fas fa-money-bill-wave'} text-muted ms-2"></i>`;
}

function initializeLoanProducts() {
    // Initialize any interactive components
    console.log('Loan products page initialized');
}

function showAddLoanModal() {
    const modalHtml = `
        <div class="modal fade" id="addLoanModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-plus me-2"></i>Add New Loan Product
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${getLoanProductForm()}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveLoanProduct()">
                            <i class="fas fa-save me-2"></i>Save Product
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('addLoanModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('addLoanModal'));
    modal.show();
}

function getLoanProductForm(loan = null) {
    const isEdit = loan !== null;
    
    return `
        <form id="loanProductForm">
            <div class="row">
                <!-- Basic Information -->
                <div class="col-12">
                    <h6 class="fw-bold mb-3">Basic Information</h6>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="loanName" class="form-label">Product Name *</label>
                        <input type="text" class="form-control" id="loanName" required
                               value="${loan ? loan.name : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="loanType" class="form-label">Loan Type *</label>
                        <select class="form-select" id="loanType" required>
                            <option value="">Select Type</option>
                            <option value="personal" ${loan && loan.type === 'personal' ? 'selected' : ''}>Personal Loan</option>
                            <option value="home" ${loan && loan.type === 'home' ? 'selected' : ''}>Home Loan</option>
                            <option value="vehicle" ${loan && loan.type === 'vehicle' ? 'selected' : ''}>Vehicle Loan</option>
                            <option value="business" ${loan && loan.type === 'business' ? 'selected' : ''}>Business Loan</option>
                            <option value="education" ${loan && loan.type === 'education' ? 'selected' : ''}>Education Loan</option>
                        </select>
                    </div>
                </div>
                
                <div class="col-12">
                    <div class="mb-3">
                        <label for="loanDescription" class="form-label">Description *</label>
                        <textarea class="form-control" id="loanDescription" rows="3" required>${loan ? loan.description : ''}</textarea>
                    </div>
                </div>
                
                <!-- Financial Terms -->
                <div class="col-12 mt-3">
                    <h6 class="fw-bold mb-3">Financial Terms</h6>
                </div>
                
                <div class="col-md-4">
                    <div class="mb-3">
                        <label for="minAmount" class="form-label">Minimum Amount (₹) *</label>
                        <input type="number" class="form-control" id="minAmount" required min="1000"
                               value="${loan ? loan.minAmount : ''}">
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="mb-3">
                        <label for="maxAmount" class="form-label">Maximum Amount (₹) *</label>
                        <input type="number" class="form-control" id="maxAmount" required min="10000"
                               value="${loan ? loan.maxAmount : ''}">
                    </div>
                </div>
                
                <div class="col-md-4">
                    <div class="mb-3">
                        <label for="interestRate" class="form-label">Interest Rate (% p.a.) *</label>
                        <input type="number" class="form-control" id="interestRate" required min="1" max="50" step="0.1"
                               value="${loan ? loan.interestRate : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="maxTenure" class="form-label">Maximum Tenure (Months) *</label>
                        <input type="number" class="form-control" id="maxTenure" required min="1" max="360"
                               value="${loan ? loan.maxTenure : ''}">
                    </div>
                </div>
                
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="processingFee" class="form-label">Processing Fee (%) *</label>
                        <input type="number" class="form-control" id="processingFee" required min="0" max="10" step="0.1"
                               value="${loan ? loan.processingFee : ''}">
                    </div>
                </div>
                
                <!-- Eligibility Criteria -->
                <div class="col-12 mt-3">
                    <h6 class="fw-bold mb-3">Eligibility Criteria</h6>
                </div>
                
                <div class="col-md-3">
                    <div class="mb-3">
                        <label for="minAge" class="form-label">Min Age *</label>
                        <input type="number" class="form-control" id="minAge" required min="18" max="65"
                               value="${loan ? loan.eligibility.minAge : ''}">
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="mb-3">
                        <label for="maxAge" class="form-label">Max Age *</label>
                        <input type="number" class="form-control" id="maxAge" required min="25" max="75"
                               value="${loan ? loan.eligibility.maxAge : ''}">
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="mb-3">
                        <label for="minIncome" class="form-label">Min Income (₹) *</label>
                        <input type="number" class="form-control" id="minIncome" required min="10000"
                               value="${loan ? loan.eligibility.minIncome : ''}">
                    </div>
                </div>
                
                <div class="col-md-3">
                    <div class="mb-3">
                        <label for="minCreditScore" class="form-label">Min Credit Score *</label>
                        <input type="number" class="form-control" id="minCreditScore" required min="300" max="850"
                               value="${loan ? loan.eligibility.minCreditScore : ''}">
                    </div>
                </div>
                
                <!-- Required Documents -->
                <div class="col-12 mt-3">
                    <h6 class="fw-bold mb-3">Required Documents</h6>
                </div>
                
                <div class="col-12">
                    <div class="mb-3">
                        <label class="form-label">Select Required Documents *</label>
                        <div class="row">
                            ${getDocumentCheckboxes(loan ? loan.documents : [])}
                        </div>
                    </div>
                </div>
                
                <!-- Status -->
                <div class="col-12 mt-3">
                    <div class="form-check form-switch">
                        <input class="form-check-input" type="checkbox" id="isActive" 
                               ${loan ? (loan.isActive ? 'checked' : '') : 'checked'}>
                        <label class="form-check-label" for="isActive">
                            Active Product
                        </label>
                    </div>
                </div>
            </div>
        </form>
    `;
}

function getDocumentCheckboxes(selectedDocs = []) {
    const documents = [
        'Identity Proof',
        'Address Proof',
        'Income Proof',
        'Bank Statements',
        'Property Documents',
        'Vehicle Documents',
        'Business Registration',
        'Financial Statements',
        'Admission Letter',
        'Fee Structure',
        'Co-applicant Documents'
    ];
    
    return documents.map(doc => `
        <div class="col-md-4">
            <div class="form-check">
                <input class="form-check-input" type="checkbox" id="doc_${doc.replace(/\s+/g, '_')}" 
                       value="${doc}" ${selectedDocs.includes(doc) ? 'checked' : ''}>
                <label class="form-check-label" for="doc_${doc.replace(/\s+/g, '_')}">
                    ${doc}
                </label>
            </div>
        </div>
    `).join('');
}

function saveLoanProduct() {
    const form = document.getElementById('loanProductForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    // Collect selected documents
    const selectedDocs = [];
    document.querySelectorAll('#loanProductForm input[type="checkbox"]:checked:not(#isActive)').forEach(checkbox => {
        selectedDocs.push(checkbox.value);
    });
    
    if (selectedDocs.length === 0) {
        auth.showAlert('Please select at least one required document', 'warning');
        return;
    }
    
    // Collect form data
    const loanData = {
        name: document.getElementById('loanName').value,
        type: document.getElementById('loanType').value,
        description: document.getElementById('loanDescription').value,
        minAmount: parseInt(document.getElementById('minAmount').value),
        maxAmount: parseInt(document.getElementById('maxAmount').value),
        interestRate: parseFloat(document.getElementById('interestRate').value),
        maxTenure: parseInt(document.getElementById('maxTenure').value),
        processingFee: parseFloat(document.getElementById('processingFee').value),
        eligibility: {
            minAge: parseInt(document.getElementById('minAge').value),
            maxAge: parseInt(document.getElementById('maxAge').value),
            minIncome: parseInt(document.getElementById('minIncome').value),
            minCreditScore: parseInt(document.getElementById('minCreditScore').value)
        },
        documents: selectedDocs,
        isActive: document.getElementById('isActive').checked
    };
    
    // Validate amounts
    if (loanData.minAmount >= loanData.maxAmount) {
        auth.showAlert('Maximum amount must be greater than minimum amount', 'warning');
        return;
    }
    
    // Validate ages
    if (loanData.eligibility.minAge >= loanData.eligibility.maxAge) {
        auth.showAlert('Maximum age must be greater than minimum age', 'warning');
        return;
    }
    
    // Save loan product
    if (dataManager.addLoan(loanData)) {
        auth.showAlert('Loan product added successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('addLoanModal')).hide();
        loadLoansPage(document.getElementById('contentArea'));
    } else {
        auth.showAlert('Error adding loan product. Please try again.', 'danger');
    }
}

function viewLoanDetails(loanId) {
    const loan = dataManager.getLoanById(loanId);
    if (!loan) {
        auth.showAlert('Loan product not found', 'danger');
        return;
    }
    
    // Implementation would show loan details modal
    auth.showAlert(`Viewing details for ${loan.name}`, 'info');
}

function editLoan(loanId) {
    const loan = dataManager.getLoanById(loanId);
    if (!loan) {
        auth.showAlert('Loan product not found', 'danger');
        return;
    }
    
    // Implementation would show edit modal with loan data
    auth.showAlert(`Edit functionality for ${loan.name} would be implemented here`, 'info');
}

function toggleLoanStatus(loanId) {
    const loan = dataManager.getLoanById(loanId);
    if (!loan) {
        auth.showAlert('Loan product not found', 'danger');
        return;
    }
    
    const newStatus = !loan.isActive;
    if (dataManager.updateLoan(loanId, { isActive: newStatus })) {
        auth.showAlert(`Loan product ${newStatus ? 'activated' : 'deactivated'} successfully!`, 'success');
        loadLoansPage(document.getElementById('contentArea'));
    } else {
        auth.showAlert('Error updating loan product status', 'danger');
    }
}

function deleteLoan(loanId) {
    const loan = dataManager.getLoanById(loanId);
    if (!loan) {
        auth.showAlert('Loan product not found', 'danger');
        return;
    }
    
    if (confirm(`Are you sure you want to delete the loan product "${loan.name}"? This action cannot be undone.`)) {
        if (dataManager.deleteLoan(loanId)) {
            auth.showAlert('Loan product deleted successfully!', 'success');
            loadLoansPage(document.getElementById('contentArea'));
        } else {
            auth.showAlert('Error deleting loan product. Please try again.', 'danger');
        }
    }
} 