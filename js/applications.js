// Loan Applications Management functionality for Bank Loan Management System

function loadApplicationsPage(container) {
    if (!auth.requirePermission('applications')) return;
    
    const user = auth.getCurrentUser();
    const canCreateApplication = user.role === 'customer' || user.role === 'loan_officer' || user.role === 'admin';
    const canApprove = user.role === 'bank_manager' || user.role === 'admin';
    
    const applicationsHtml = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-file-alt me-2"></i>Loan Applications</h2>
                        <p class="text-muted">Manage and process loan applications. Role: ${user.role.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    ${canCreateApplication ? `
                    <button class="btn btn-primary" onclick="showNewApplicationModal()">
                        <i class="fas fa-plus me-2"></i>New Application
                    </button>
                    ` : ''}
                </div>
            </div>
        </div>
        
        <!-- Role-specific Action Tabs -->
        ${canApprove ? `
        <div class="row mb-4">
            <div class="col-12">
                <div class="card bg-warning text-dark">
                    <div class="card-body">
                        <h5><i class="fas fa-exclamation-triangle me-2"></i>Pending Approvals</h5>
                        <p class="mb-2">You have applications waiting for your approval.</p>
                        <button class="btn btn-dark btn-sm" onclick="showPendingApprovals()">
                            <i class="fas fa-gavel me-1"></i>Review Pending (${getPendingApprovalsCount()})
                        </button>
                    </div>
                </div>
            </div>
        </div>
        ` : ''}

        <!-- Application Statistics -->
        <div class="row mb-4">
            ${getApplicationStats()}
        </div>

        <!-- Filters and Search -->
        <div class="row mb-4">
            <div class="col-lg-4">
                <div class="input-group">
                    <span class="input-group-text"><i class="fas fa-search"></i></span>
                    <input type="text" class="form-control" id="applicationSearch" 
                           placeholder="Search by ID, customer name..."
                           oninput="searchApplications(this.value)">
                </div>
            </div>
            <div class="col-lg-2">
                <select class="form-select" id="statusFilter" onchange="filterApplications()">
                    <option value="">All Status</option>
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="approved">Approved</option>
                    <option value="rejected">Rejected</option>
                    <option value="disbursed">Disbursed</option>
                </select>
            </div>
            <div class="col-lg-2">
                <select class="form-select" id="loanTypeFilter" onchange="filterApplications()">
                    <option value="">All Types</option>
                    <option value="personal">Personal</option>
                    <option value="home">Home</option>
                    <option value="vehicle">Vehicle</option>
                    <option value="business">Business</option>
                    <option value="education">Education</option>
                </select>
            </div>
            <div class="col-lg-2">
                <input type="date" class="form-control" id="fromDate" onchange="filterApplications()" 
                       title="From Date">
            </div>
            <div class="col-lg-2">
                <input type="date" class="form-control" id="toDate" onchange="filterApplications()" 
                       title="To Date">
            </div>
        </div>

        <!-- Applications Table -->
        <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
                <h5 class="mb-0">Applications List</h5>
                <div class="btn-group" role="group">
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="exportApplications()">
                        <i class="fas fa-download me-1"></i>Export
                    </button>
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="refreshApplications()">
                        <i class="fas fa-sync me-1"></i>Refresh
                    </button>
                </div>
            </div>
            <div class="card-body">
                <div class="table-responsive">
                    <table class="table table-hover" id="applicationsTable">
                        <thead>
                            <tr>
                                <th>Application ID</th>
                                <th>Customer</th>
                                <th>Loan Type</th>
                                <th>Amount</th>
                                <th>EMI</th>
                                <th>Status</th>
                                <th>Applied Date</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody id="applicationsTableBody">
                            <!-- Application data will be loaded here -->
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = applicationsHtml;
    loadApplicationsTable();
}

function getApplicationStats() {
    const applications = dataManager.getApplications();
    const totalApplications = applications.length;
    const pendingApplications = applications.filter(app => 
        app.status === 'submitted' || app.status === 'under_review'
    ).length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const totalAmount = applications
        .filter(app => app.status === 'approved')
        .reduce((sum, app) => sum + app.amount, 0);

    return `
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card primary">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Total Applications</h6>
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
                            <h6 class="text-white-50 mb-1">Pending Review</h6>
                            <div class="stat-number">${pendingApplications}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-clock"></i>
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
                            <h6 class="text-white-50 mb-1">Approved</h6>
                            <div class="stat-number">${approvedApplications}</div>
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
                            <h6 class="text-white-50 mb-1">Approved Amount</h6>
                            <div class="stat-number" style="font-size: 1.2rem;">${utils.formatCurrency(totalAmount)}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-rupee-sign"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function loadApplicationsTable(applications = null) {
    if (!applications) {
        applications = dataManager.getApplications();
    }

    const tableBody = document.getElementById('applicationsTableBody');
    
    if (applications.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="8" class="text-center py-4 text-muted">
                    <i class="fas fa-file-alt fa-3x mb-3"></i><br>
                    No applications found
                </td>
            </tr>
        `;
        return;
    }

    tableBody.innerHTML = applications.map(app => {
        const customer = dataManager.getCustomerById(app.customerId);
        const loan = dataManager.getLoanById(app.loanProductId);
        
        return `
            <tr>
                <td><code>${app.id}</code></td>
                <td>
                    ${customer ? `
                        <div>
                            <div class="fw-bold">${customer.firstName} ${customer.lastName}</div>
                            <small class="text-muted">${customer.email}</small>
                        </div>
                    ` : 'Unknown Customer'}
                </td>
                <td>
                    <div class="d-flex align-items-center">
                        ${loan ? getLoanTypeIcon(loan.type) : ''}
                        <span class="ms-2">${loan ? loan.name : 'Unknown'}</span>
                    </div>
                </td>
                <td class="fw-bold">${utils.formatCurrency(app.amount)}</td>
                <td>${utils.formatCurrency(app.emi)}</td>
                <td>
                    <span class="status-badge ${getApplicationStatusClass(app.status)}">
                        ${app.status.replace('_', ' ').toUpperCase()}
                    </span>
                </td>
                <td>${utils.formatDate(app.applicationDate)}</td>
                <td>
                    <div class="btn-group" role="group">
                        <button class="btn btn-sm btn-outline-primary" onclick="viewApplicationDetails('${app.id}')" 
                                data-bs-toggle="tooltip" title="View Details">
                            <i class="fas fa-eye"></i>
                        </button>
                        ${getApplicationActions(app)}
                    </div>
                </td>
            </tr>
        `;
    }).join('');

    // Re-initialize tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });
}

function getLoanTypeIcon(type) {
    const icons = {
        personal: 'fas fa-user text-primary',
        home: 'fas fa-home text-success',
        vehicle: 'fas fa-car text-info',
        business: 'fas fa-briefcase text-warning',
        education: 'fas fa-graduation-cap text-secondary'
    };
    
    return `<i class="${icons[type] || 'fas fa-money-bill-wave'}"></i>`;
}

function getApplicationStatusClass(status) {
    switch (status) {
        case 'submitted': return 'status-pending';
        case 'under_review': return 'status-pending';
        case 'approved': return 'status-approved';
        case 'rejected': return 'status-rejected';
        case 'disbursed': return 'status-active';
        default: return 'status-pending';
    }
}

function canProcessApplication(status) {
    return auth.hasPermission('loan_approval') && 
           (status === 'submitted' || status === 'under_review');
}

function searchApplications(query) {
    const applications = dataManager.getApplications().filter(app => {
        const customer = dataManager.getCustomerById(app.customerId);
        return app.id.toLowerCase().includes(query.toLowerCase()) ||
               (customer && 
                (customer.firstName.toLowerCase().includes(query.toLowerCase()) ||
                 customer.lastName.toLowerCase().includes(query.toLowerCase()) ||
                 customer.email.toLowerCase().includes(query.toLowerCase())));
    });
    
    loadApplicationsTable(applications);
}

function filterApplications() {
    const status = document.getElementById('statusFilter').value;
    const loanType = document.getElementById('loanTypeFilter').value;
    const fromDate = document.getElementById('fromDate').value;
    const toDate = document.getElementById('toDate').value;
    
    const filters = {};
    if (status) filters.status = status;
    if (loanType) filters.loanType = loanType;
    if (fromDate) filters.dateFrom = fromDate;
    if (toDate) filters.dateTo = toDate;
    
    const filteredApplications = dataManager.filterApplications(filters);
    loadApplicationsTable(filteredApplications);
}

function refreshApplications() {
    // Clear filters
    document.getElementById('statusFilter').value = '';
    document.getElementById('loanTypeFilter').value = '';
    document.getElementById('fromDate').value = '';
    document.getElementById('toDate').value = '';
    document.getElementById('applicationSearch').value = '';
    
    loadApplicationsTable();
    auth.showAlert('Applications list refreshed', 'success');
}

function exportApplications() {
    const applications = dataManager.getApplications();
    
    // Generate CSV content
    let csvContent = 'Application ID,Customer Name,Customer Email,Loan Type,Amount,EMI,Tenure,Interest Rate,Status,Application Date,Approval Date\n';
    
    applications.forEach(app => {
        const customer = dataManager.getCustomerById(app.customerId);
        const loan = dataManager.getLoanById(app.loanProductId);
        
        csvContent += `${app.id},"${customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}",${customer ? customer.email : ''},${loan ? loan.name : 'Unknown'},${app.amount},${app.emi},${app.tenure},${app.interestRate},${app.status},${app.applicationDate},${app.approvalDate || ''}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'loan_applications_export.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    auth.showAlert('Applications data exported successfully!', 'success');
}

function showNewApplicationModal() {
    const modalHtml = `
        <div class="modal fade" id="newApplicationModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-plus me-2"></i>New Loan Application
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        ${getApplicationForm()}
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="submitApplication()">
                            <i class="fas fa-paper-plane me-2"></i>Submit Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('newApplicationModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('newApplicationModal'));
    modal.show();
}

function getApplicationForm() {
    const customers = dataManager.getCustomers().filter(c => c.isActive);
    const loans = dataManager.getLoans().filter(l => l.isActive);
    
    return `
        <form id="applicationForm">
            <div class="row">
                <!-- Customer Selection -->
                <div class="col-12">
                    <div class="mb-3">
                        <label for="customerId" class="form-label">Select Customer *</label>
                        <select class="form-select" id="customerId" required onchange="updateCustomerInfo()">
                            <option value="">Choose Customer</option>
                            ${customers.map(customer => 
                                `<option value="${customer.id}">${customer.firstName} ${customer.lastName} - ${customer.email}</option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Customer Info Display -->
                <div class="col-12" id="customerInfo" style="display: none;">
                    <div class="alert alert-info">
                        <div id="customerDetails"></div>
                    </div>
                </div>
                
                <!-- Loan Product Selection -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="loanProductId" class="form-label">Loan Product *</label>
                        <select class="form-select" id="loanProductId" required onchange="updateLoanInfo()">
                            <option value="">Choose Loan Product</option>
                            ${loans.map(loan => 
                                `<option value="${loan.id}" data-min="${loan.minAmount}" data-max="${loan.maxAmount}" 
                                         data-rate="${loan.interestRate}" data-tenure="${loan.maxTenure}">
                                    ${loan.name} (${loan.interestRate}% p.a.)
                                </option>`
                            ).join('')}
                        </select>
                    </div>
                </div>
                
                <!-- Loan Amount -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="loanAmount" class="form-label">Loan Amount (₹) *</label>
                        <input type="number" class="form-control" id="loanAmount" required 
                               min="10000" max="50000000" oninput="calculateApplicationEMI()">
                        <div class="form-text" id="amountLimits">Enter loan amount</div>
                    </div>
                </div>
                
                <!-- Tenure -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="tenure" class="form-label">Tenure (Months) *</label>
                        <input type="number" class="form-control" id="tenure" required 
                               min="12" max="360" oninput="calculateApplicationEMI()">
                        <div class="form-text" id="tenureLimits">Maximum tenure will be set based on loan product</div>
                    </div>
                </div>
                
                <!-- Purpose -->
                <div class="col-md-6">
                    <div class="mb-3">
                        <label for="purpose" class="form-label">Loan Purpose *</label>
                        <input type="text" class="form-control" id="purpose" required 
                               placeholder="e.g., Home renovation, Vehicle purchase">
                    </div>
                </div>
                
                <!-- EMI Display -->
                <div class="col-12">
                    <div class="alert alert-primary" id="emiDisplay" style="display: none;">
                        <h6>Calculated EMI: <span id="calculatedEMI">₹0</span></h6>
                        <small>Interest Rate: <span id="appliedRate">0%</span> | Total Amount: <span id="totalPayment">₹0</span></small>
                    </div>
                </div>
                
                <!-- Eligibility Check -->
                <div class="col-12" id="eligibilityCheck" style="display: none;">
                    <div class="alert" id="eligibilityResult">
                        <div id="eligibilityMessage"></div>
                    </div>
                </div>
            </div>
        </form>
    `;
}

function updateCustomerInfo() {
    const customerId = document.getElementById('customerId').value;
    const customerInfo = document.getElementById('customerInfo');
    const customerDetails = document.getElementById('customerDetails');
    
    if (customerId) {
        const customer = dataManager.getCustomerById(customerId);
        if (customer) {
            customerDetails.innerHTML = `
                <strong>${customer.firstName} ${customer.lastName}</strong><br>
                Email: ${customer.email} | Phone: ${customer.phone}<br>
                Monthly Income: ${utils.formatCurrency(customer.employment.monthlyIncome)} | 
                Credit Score: ${customer.financial.creditScore} | 
                KYC: ${customer.kyc.status}
            `;
            customerInfo.style.display = 'block';
            checkEligibility();
        }
    } else {
        customerInfo.style.display = 'none';
    }
}

function updateLoanInfo() {
    const loanSelect = document.getElementById('loanProductId');
    const selectedOption = loanSelect.options[loanSelect.selectedIndex];
    const amountLimits = document.getElementById('amountLimits');
    const tenureLimits = document.getElementById('tenureLimits');
    const amountField = document.getElementById('loanAmount');
    const tenureField = document.getElementById('tenure');
    
    if (selectedOption.value) {
        const minAmount = selectedOption.dataset.min;
        const maxAmount = selectedOption.dataset.max;
        const maxTenure = selectedOption.dataset.tenure;
        
        amountLimits.textContent = `Amount range: ${utils.formatCurrency(minAmount)} - ${utils.formatCurrency(maxAmount)}`;
        tenureLimits.textContent = `Maximum tenure: ${maxTenure} months`;
        
        amountField.min = minAmount;
        amountField.max = maxAmount;
        tenureField.max = maxTenure;
        
        calculateApplicationEMI();
        checkEligibility();
    }
}

function calculateApplicationEMI() {
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    const tenure = parseInt(document.getElementById('tenure').value) || 0;
    const loanSelect = document.getElementById('loanProductId');
    const selectedOption = loanSelect.options[loanSelect.selectedIndex];
    
    if (amount > 0 && tenure > 0 && selectedOption.value) {
        const rate = parseFloat(selectedOption.dataset.rate);
        const monthlyRate = rate / 12 / 100;
        
        const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
                   (Math.pow(1 + monthlyRate, tenure) - 1);
        const totalAmount = emi * tenure;
        
        document.getElementById('calculatedEMI').textContent = utils.formatCurrency(Math.round(emi));
        document.getElementById('appliedRate').textContent = `${rate}%`;
        document.getElementById('totalPayment').textContent = utils.formatCurrency(Math.round(totalAmount));
        document.getElementById('emiDisplay').style.display = 'block';
        
        checkEligibility();
    } else {
        document.getElementById('emiDisplay').style.display = 'none';
    }
}

function checkEligibility() {
    const customerId = document.getElementById('customerId').value;
    const loanProductId = document.getElementById('loanProductId').value;
    const amount = parseFloat(document.getElementById('loanAmount').value) || 0;
    
    if (!customerId || !loanProductId || amount <= 0) {
        document.getElementById('eligibilityCheck').style.display = 'none';
        return;
    }
    
    const customer = dataManager.getCustomerById(customerId);
    const loan = dataManager.getLoanById(loanProductId);
    
    if (!customer || !loan) return;
    
    const eligibilityResult = document.getElementById('eligibilityResult');
    const eligibilityMessage = document.getElementById('eligibilityMessage');
    
    // Check eligibility criteria
    const age = utils.calculateAge(customer.dateOfBirth);
    const issues = [];
    
    if (age < loan.eligibility.minAge || age > loan.eligibility.maxAge) {
        issues.push(`Age must be between ${loan.eligibility.minAge}-${loan.eligibility.maxAge} years`);
    }
    
    if (customer.employment.monthlyIncome < loan.eligibility.minIncome) {
        issues.push(`Minimum income required: ${utils.formatCurrency(loan.eligibility.minIncome)}`);
    }
    
    if (customer.financial.creditScore < loan.eligibility.minCreditScore) {
        issues.push(`Minimum credit score required: ${loan.eligibility.minCreditScore}`);
    }
    
    if (amount < loan.minAmount || amount > loan.maxAmount) {
        issues.push(`Amount must be between ${utils.formatCurrency(loan.minAmount)} - ${utils.formatCurrency(loan.maxAmount)}`);
    }
    
    if (customer.kyc.status !== 'Verified') {
        issues.push('KYC verification required');
    }
    
    if (issues.length === 0) {
        eligibilityResult.className = 'alert alert-success';
        eligibilityMessage.innerHTML = '<i class="fas fa-check-circle me-2"></i>Customer is eligible for this loan product';
    } else {
        eligibilityResult.className = 'alert alert-warning';
        eligibilityMessage.innerHTML = `
            <i class="fas fa-exclamation-triangle me-2"></i>Eligibility Issues:
            <ul class="mb-0 mt-2">
                ${issues.map(issue => `<li>${issue}</li>`).join('')}
            </ul>
        `;
    }
    
    document.getElementById('eligibilityCheck').style.display = 'block';
}

function submitApplication() {
    const form = document.getElementById('applicationForm');
    
    // Validate form
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }
    
    const customerId = document.getElementById('customerId').value;
    const loanProductId = document.getElementById('loanProductId').value;
    const amount = parseFloat(document.getElementById('loanAmount').value);
    const tenure = parseInt(document.getElementById('tenure').value);
    const purpose = document.getElementById('purpose').value;
    
    // Get loan product details for EMI calculation
    const loan = dataManager.getLoanById(loanProductId);
    const monthlyRate = loan.interestRate / 12 / 100;
    const emi = amount * monthlyRate * Math.pow(1 + monthlyRate, tenure) / 
               (Math.pow(1 + monthlyRate, tenure) - 1);
    
    // Create application data
    const applicationData = {
        customerId: customerId,
        loanProductId: loanProductId,
        amount: amount,
        tenure: tenure,
        purpose: purpose,
        emi: Math.round(emi),
        interestRate: loan.interestRate,
        documents: loan.documents.map(doc => ({ name: doc, status: 'pending' })),
        workflow: [
            { step: 'Application Submitted', date: new Date().toISOString(), status: 'completed' },
            { step: 'Document Verification', date: null, status: 'pending' },
            { step: 'Credit Assessment', date: null, status: 'pending' },
            { step: 'Manager Approval', date: null, status: 'pending' },
            { step: 'Disbursement', date: null, status: 'pending' }
        ],
        notes: ''
    };
    
    // Save application
    if (dataManager.addApplication(applicationData)) {
        auth.showAlert('Loan application submitted successfully!', 'success');
        bootstrap.Modal.getInstance(document.getElementById('newApplicationModal')).hide();
        loadApplicationsTable();
    } else {
        auth.showAlert('Error submitting application. Please try again.', 'danger');
    }
}

function viewApplication(applicationId) {
    const app = dataManager.getApplicationById(applicationId);
    if (!app) {
        auth.showAlert('Application not found', 'danger');
        return;
    }
    
    // Implementation would show detailed application modal
    auth.showAlert(`Viewing application ${applicationId}`, 'info');
}

function processApplication(applicationId) {
    if (!auth.requirePermission('loan_approval')) return;
    
    const app = dataManager.getApplicationById(applicationId);
    if (!app) {
        auth.showAlert('Application not found', 'danger');
        return;
    }
    
    // Implementation would show processing modal with approval/rejection options
    auth.showAlert(`Processing application ${applicationId}`, 'info');
}

function updateApplicationStatus(applicationId, newStatus) {
    if (!auth.requirePermission('loan_processing')) return;
    
    if (dataManager.updateApplication(applicationId, { status: newStatus })) {
        auth.showAlert(`Application status updated to ${newStatus.replace('_', ' ')}`, 'success');
        loadApplicationsTable();
    } else {
        auth.showAlert('Error updating application status', 'danger');
    }
}

function getPendingApprovalsCount() {
    const applications = dataManager.getApplications();
    return applications.filter(app => app.status === 'under_review').length;
}

function showPendingApprovals() {
    const applications = dataManager.getApplications();
    const pendingApps = applications.filter(app => app.status === 'under_review');
    
    if (pendingApps.length === 0) {
        auth.showAlert('No applications pending approval.', 'info');
        return;
    }
    
    const modalHtml = `
        <div class="modal fade" id="pendingApprovalsModal" tabindex="-1">
            <div class="modal-dialog modal-xl">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-gavel me-2"></i>Pending Approvals (${pendingApps.length})
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>App ID</th>
                                        <th>Customer</th>
                                        <th>Loan Type</th>
                                        <th>Amount</th>
                                        <th>Applied</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${pendingApps.map(app => {
                                        const customer = dataManager.getCustomers().find(c => c.id === app.customerId);
                                        const loan = dataManager.getLoans().find(l => l.id === app.loanProductId);
                                        return `
                                            <tr>
                                                <td>#${app.id.slice(-6)}</td>
                                                <td>${customer ? customer.name : 'Unknown'}</td>
                                                <td>${loan ? loan.name : 'Unknown'}</td>
                                                <td>${utils.formatCurrency(app.amount)}</td>
                                                <td>${utils.formatDate(app.submittedDate)}</td>
                                                <td>
                                                    <button class="btn btn-success btn-sm me-1" onclick="approveApplication('${app.id}')">
                                                        <i class="fas fa-check me-1"></i>Approve
                                                    </button>
                                                    <button class="btn btn-danger btn-sm me-1" onclick="rejectApplication('${app.id}')">
                                                        <i class="fas fa-times me-1"></i>Reject
                                                    </button>
                                                    <button class="btn btn-info btn-sm" onclick="viewApplicationDetails('${app.id}')">
                                                        <i class="fas fa-eye me-1"></i>Details
                                                    </button>
                                                </td>
                                            </tr>
                                        `;
                                    }).join('')}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('pendingApprovalsModal'));
    modal.show();
    
    // Clean up modal after hiding
    document.getElementById('pendingApprovalsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function approveApplication(applicationId) {
    const applications = dataManager.getApplications();
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
        auth.showAlert('Application not found!', 'error');
        return;
    }
    
    // Update application status
    application.status = 'approved';
    application.approvedDate = new Date().toISOString();
    application.approvedBy = auth.getCurrentUser().id;
    
    // Save updated data
    dataManager.updateApplication(application);
    
    // Show success message
    auth.showAlert(`Application #${applicationId.slice(-6)} has been approved successfully!`, 'success');
    
    // Refresh the current view
    refreshApplications();
    
    // Close modal if open
    const modal = bootstrap.Modal.getInstance(document.getElementById('pendingApprovalsModal'));
    if (modal) {
        modal.hide();
    }
}

function rejectApplication(applicationId) {
    const applications = dataManager.getApplications();
    const application = applications.find(app => app.id === applicationId);
    
    if (!application) {
        auth.showAlert('Application not found!', 'error');
        return;
    }
    
    // Show rejection reason modal
    const reasonModalHtml = `
        <div class="modal fade" id="rejectionReasonModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">Reject Application #${applicationId.slice(-6)}</h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="mb-3">
                            <label class="form-label">Rejection Reason *</label>
                            <select class="form-select" id="rejectionReason" required>
                                <option value="">Select reason...</option>
                                <option value="insufficient_income">Insufficient Income</option>
                                <option value="poor_credit_score">Poor Credit Score</option>
                                <option value="incomplete_documents">Incomplete Documents</option>
                                <option value="high_debt_ratio">High Debt-to-Income Ratio</option>
                                <option value="employment_verification">Employment Verification Failed</option>
                                <option value="other">Other</option>
                            </select>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Additional Comments</label>
                            <textarea class="form-control" id="rejectionComments" rows="3" 
                                    placeholder="Additional details about the rejection..."></textarea>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-danger" onclick="confirmRejection('${applicationId}')">
                            <i class="fas fa-times me-1"></i>Reject Application
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', reasonModalHtml);
    const modal = new bootstrap.Modal(document.getElementById('rejectionReasonModal'));
    modal.show();
    
    // Clean up modal after hiding
    document.getElementById('rejectionReasonModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function confirmRejection(applicationId) {
    const reason = document.getElementById('rejectionReason').value;
    const comments = document.getElementById('rejectionComments').value;
    
    if (!reason) {
        auth.showAlert('Please select a rejection reason.', 'warning');
        return;
    }
    
    const applications = dataManager.getApplications();
    const application = applications.find(app => app.id === applicationId);
    
    // Update application status
    application.status = 'rejected';
    application.rejectedDate = new Date().toISOString();
    application.rejectedBy = auth.getCurrentUser().id;
    application.rejectionReason = reason;
    application.rejectionComments = comments;
    
    // Save updated data
    dataManager.updateApplication(application);
    
    // Show success message
    auth.showAlert(`Application #${applicationId.slice(-6)} has been rejected.`, 'info');
    
    // Refresh the current view
    refreshApplications();
    
    // Close modals
    const rejectionModal = bootstrap.Modal.getInstance(document.getElementById('rejectionReasonModal'));
    if (rejectionModal) {
        rejectionModal.hide();
    }
    
    const pendingModal = bootstrap.Modal.getInstance(document.getElementById('pendingApprovalsModal'));
    if (pendingModal) {
        pendingModal.hide();
    }
}

function viewApplicationDetails(applicationId) {
    const application = dataManager.getApplications().find(app => app.id === applicationId);
    const customer = dataManager.getCustomers().find(c => c.id === application.customerId);
    const loan = dataManager.getLoans().find(l => l.id === application.loanProductId);
    
    if (!application) {
        auth.showAlert('Application not found!', 'error');
        return;
    }
    
    const modalHtml = `
        <div class="modal fade" id="applicationDetailsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-file-alt me-2"></i>Application Details #${applicationId.slice(-6)}
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-6">
                                <h6>Application Information</h6>
                                <p><strong>Application ID:</strong> ${application.id}</p>
                                <p><strong>Status:</strong> <span class="badge bg-${getStatusColor(application.status)}">${application.status.replace('_', ' ').toUpperCase()}</span></p>
                                <p><strong>Amount:</strong> ${utils.formatCurrency(application.amount)}</p>
                                <p><strong>EMI:</strong> ${utils.formatCurrency(application.emi)}</p>
                                <p><strong>Applied Date:</strong> ${utils.formatDate(application.submittedDate)}</p>
                            </div>
                            <div class="col-md-6">
                                <h6>Customer Information</h6>
                                <p><strong>Name:</strong> ${customer ? customer.name : 'Unknown'}</p>
                                <p><strong>Email:</strong> ${customer ? customer.email : 'Unknown'}</p>
                                <p><strong>Phone:</strong> ${customer ? customer.phone : 'Unknown'}</p>
                                <p><strong>Credit Score:</strong> ${customer ? customer.financial.creditScore : 'Unknown'}</p>
                            </div>
                        </div>
                        <hr>
                        <div class="row">
                            <div class="col-12">
                                <h6>Loan Product Details</h6>
                                <p><strong>Product:</strong> ${loan ? loan.name : 'Unknown'}</p>
                                <p><strong>Type:</strong> ${loan ? loan.type : 'Unknown'}</p>
                                <p><strong>Interest Rate:</strong> ${loan ? loan.interestRate : 'Unknown'}%</p>
                                <p><strong>Term:</strong> ${application.term} months</p>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    const modal = new bootstrap.Modal(document.getElementById('applicationDetailsModal'));
    modal.show();
    
    // Clean up modal after hiding
    document.getElementById('applicationDetailsModal').addEventListener('hidden.bs.modal', function() {
        this.remove();
    });
}

function getStatusColor(status) {
    const colors = {
        'submitted': 'secondary',
        'under_review': 'warning',
        'approved': 'success',
        'rejected': 'danger',
        'disbursed': 'info'
    };
    return colors[status] || 'secondary';
}

function getApplicationActions(app) {
    const user = auth.getCurrentUser();
    const userRole = user.role;
    const appStatus = app.status;
    
    let actions = '';
    
    // Role-based actions
    switch (userRole) {
        case 'admin':
            // Admin can do everything
            if (appStatus === 'under_review') {
                actions += `
                    <button class="btn btn-sm btn-success" onclick="approveApplication('${app.id}')"
                            data-bs-toggle="tooltip" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectApplication('${app.id}')"
                            data-bs-toggle="tooltip" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            } else if (appStatus === 'submitted') {
                actions += `
                    <button class="btn btn-sm btn-warning" onclick="updateApplicationStatus('${app.id}', 'under_review')"
                            data-bs-toggle="tooltip" title="Mark Under Review">
                        <i class="fas fa-clock"></i>
                    </button>
                `;
            }
            break;
            
        case 'bank_manager':
            // Bank managers can approve/reject applications
            if (appStatus === 'under_review') {
                actions += `
                    <button class="btn btn-sm btn-success" onclick="approveApplication('${app.id}')"
                            data-bs-toggle="tooltip" title="Approve">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="rejectApplication('${app.id}')"
                            data-bs-toggle="tooltip" title="Reject">
                        <i class="fas fa-times"></i>
                    </button>
                `;
            }
            break;
            
        case 'loan_officer':
            // Loan officers can process applications and mark them for review
            if (appStatus === 'submitted') {
                actions += `
                    <button class="btn btn-sm btn-warning" onclick="updateApplicationStatus('${app.id}', 'under_review')"
                            data-bs-toggle="tooltip" title="Send for Review">
                        <i class="fas fa-share"></i>
                    </button>
                `;
            }
            break;
            
        case 'customer':
            // Customers can only view their own applications
            if (app.customerId === user.id) {
                // No additional actions beyond view for customers
            }
            break;
    }
    
    return actions;
} 