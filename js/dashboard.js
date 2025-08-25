// Dashboard functionality for Bank Loan Management System

function loadDashboard(container) {
    const user = auth.getCurrentUser();
    const stats = dataManager.getStatistics();
    
    // Get recent activities based on user role
    const recentActivities = getRecentActivities(user.role);
    
    const dashboardHtml = `
        <div class="row mb-4">
            <div class="col-12">
                <h2><i class="fas fa-tachometer-alt me-2"></i>Dashboard</h2>
                <p class="text-muted">Welcome back, ${user.name}! Here's your overview.</p>
            </div>
        </div>

        <!-- Quick Actions -->
        <div class="quick-actions mb-4">
            ${getQuickActions(user.role)}
        </div>

        <!-- Statistics Cards -->
        <div class="row mb-4">
            ${getStatsCards(stats, user.role)}
        </div>

        <!-- Main Content Grid -->
        <div class="row">
            <!-- Recent Activities -->
            <div class="col-lg-8">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-clock me-2"></i>Recent Activities</h5>
                    </div>
                    <div class="card-body">
                        ${getRecentActivitiesHtml(recentActivities)}
                    </div>
                </div>
            </div>

            <!-- Quick Stats & Charts -->
            <div class="col-lg-4">
                <div class="card mb-3">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Application Status</h6>
                    </div>
                    <div class="card-body">
                        ${getApplicationStatusChart(stats)}
                    </div>
                </div>

                <div class="card">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-trending-up me-2"></i>Monthly Trend</h6>
                    </div>
                    <div class="card-body">
                        ${getMonthlyTrendChart()}
                    </div>
                </div>
            </div>
        </div>

        <!-- Recent Applications Table -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-file-alt me-2"></i>Recent Applications</h5>
                        <button class="btn btn-sm btn-outline-primary" onclick="showPage('applications')">
                            View All
                        </button>
                    </div>
                    <div class="card-body">
                        ${getRecentApplicationsTable()}
                    </div>
                </div>
            </div>
        </div>
    `;
    
    container.innerHTML = dashboardHtml;
    
    // Initialize any interactive components
    initializeDashboardComponents();
}

function getQuickActions(userRole) {
    const actions = {
        admin: [
            { icon: 'fas fa-users', text: 'Manage Users', action: 'showPage("customers")', color: 'primary' },
            { icon: 'fas fa-cog', text: 'System Settings', action: 'showSettings()', color: 'secondary' },
            { icon: 'fas fa-chart-bar', text: 'View Reports', action: 'showPage("reports")', color: 'info' },
            { icon: 'fas fa-download', text: 'Export Data', action: 'exportData()', color: 'success' }
        ],
        manager: [
            { icon: 'fas fa-check-circle', text: 'Approve Loans', action: 'showPendingApprovals()', color: 'success' },
            { icon: 'fas fa-chart-line', text: 'View Reports', action: 'showPage("reports")', color: 'info' },
            { icon: 'fas fa-users', text: 'Team Performance', action: 'showTeamPerformance()', color: 'warning' },
            { icon: 'fas fa-cog', text: 'Loan Products', action: 'showPage("loans")', color: 'primary' }
        ],
        loan_officer: [
            { icon: 'fas fa-plus', text: 'New Customer', action: 'addNewCustomer()', color: 'primary' },
            { icon: 'fas fa-file-plus', text: 'New Application', action: 'newLoanApplication()', color: 'success' },
            { icon: 'fas fa-search', text: 'Search Customer', action: 'showCustomerSearch()', color: 'info' },
            { icon: 'fas fa-calculator', text: 'EMI Calculator', action: 'showPage("calculator")', color: 'warning' }
        ],
        customer: [
            { icon: 'fas fa-plus', text: 'Apply for Loan', action: 'newLoanApplication()', color: 'primary' },
            { icon: 'fas fa-file-alt', text: 'My Applications', action: 'showMyApplications()', color: 'info' },
            { icon: 'fas fa-calculator', text: 'EMI Calculator', action: 'showPage("calculator")', color: 'warning' },
            { icon: 'fas fa-user', text: 'My Profile', action: 'showProfile()', color: 'secondary' }
        ]
    };

    const userActions = actions[userRole] || actions.customer;
    
    return userActions.map(action => `
        <a href="#" class="quick-action-btn bg-${action.color}" onclick="${action.action}">
            <i class="${action.icon}"></i>
            <span>${action.text}</span>
        </a>
    `).join('');
}

function getStatsCards(stats, userRole) {
    const cards = [];
    
    // Common stats for all users
    cards.push({
        title: 'Total Applications',
        value: stats.totalApplications,
        icon: 'fas fa-file-alt',
        color: 'primary'
    });

    cards.push({
        title: 'Approved Loans',
        value: stats.approvedApplications,
        icon: 'fas fa-check-circle',
        color: 'success'
    });

    // Role-specific stats
    if (userRole === 'admin' || userRole === 'manager') {
        cards.push({
            title: 'Total Customers',
            value: stats.totalCustomers,
            icon: 'fas fa-users',
            color: 'info'
        });

        cards.push({
            title: 'Loan Amount',
            value: utils.formatCurrency(stats.totalLoanAmount),
            icon: 'fas fa-rupee-sign',
            color: 'warning',
            isAmount: true
        });
    } else {
        cards.push({
            title: 'Pending Reviews',
            value: stats.pendingApplications,
            icon: 'fas fa-clock',
            color: 'warning'
        });

        cards.push({
            title: 'Rejected Applications',
            value: stats.rejectedApplications,
            icon: 'fas fa-times-circle',
            color: 'danger'
        });
    }

    return cards.map(card => `
        <div class="col-lg-3 col-md-6">
            <div class="card stat-card ${card.color}">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">${card.title}</h6>
                            <div class="stat-number">${card.value}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="${card.icon}"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `).join('');
}

function getRecentActivities(userRole) {
    const activities = [
        {
            type: 'application',
            title: 'New loan application submitted',
            description: 'Personal loan application by Rajesh Kumar',
            time: '2 hours ago',
            icon: 'fas fa-file-plus',
            color: 'primary'
        },
        {
            type: 'approval',
            title: 'Loan application approved',
            description: 'Home loan for ₹25,00,000 approved',
            time: '4 hours ago',
            icon: 'fas fa-check-circle',
            color: 'success'
        },
        {
            type: 'customer',
            title: 'New customer registered',
            description: 'Priya Sharma completed KYC verification',
            time: '6 hours ago',
            icon: 'fas fa-user-plus',
            color: 'info'
        },
        {
            type: 'document',
            title: 'Documents uploaded',
            description: 'Income proof uploaded for APP002',
            time: '1 day ago',
            icon: 'fas fa-upload',
            color: 'warning'
        },
        {
            type: 'payment',
            title: 'EMI payment received',
            description: 'Monthly payment of ₹10,432 received',
            time: '2 days ago',
            icon: 'fas fa-money-bill-wave',
            color: 'success'
        }
    ];

    // Filter activities based on user role
    if (userRole === 'customer') {
        return activities.filter(activity => 
            activity.type === 'application' || 
            activity.type === 'approval' || 
            activity.type === 'payment'
        );
    }

    return activities;
}

function getRecentActivitiesHtml(activities) {
    if (activities.length === 0) {
        return '<p class="text-muted text-center py-4">No recent activities</p>';
    }

    return `
        <div class="timeline">
            ${activities.map(activity => `
                <div class="timeline-item">
                    <div class="d-flex align-items-start">
                        <div class="flex-shrink-0 me-3">
                            <div class="bg-${activity.color} text-white rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                                <i class="${activity.icon}"></i>
                            </div>
                        </div>
                        <div class="flex-grow-1">
                            <h6 class="mb-1">${activity.title}</h6>
                            <p class="text-muted mb-1">${activity.description}</p>
                            <small class="text-muted">${activity.time}</small>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function getApplicationStatusChart(stats) {
    const total = stats.totalApplications;
    const approved = stats.approvedApplications;
    const pending = stats.pendingApplications;
    const rejected = stats.rejectedApplications;

    const approvedPercent = total > 0 ? Math.round((approved / total) * 100) : 0;
    const pendingPercent = total > 0 ? Math.round((pending / total) * 100) : 0;
    const rejectedPercent = total > 0 ? Math.round((rejected / total) * 100) : 0;

    return `
        <div class="text-center">
            <div class="mb-3">
                <div class="d-inline-flex align-items-center justify-content-center bg-success text-white rounded-circle" style="width: 80px; height: 80px;">
                    <span class="h4 mb-0">${approvedPercent}%</span>
                </div>
            </div>
            <div class="row text-center">
                <div class="col-4">
                    <div class="text-success">
                        <i class="fas fa-check-circle"></i>
                        <div class="small">Approved</div>
                        <div class="fw-bold">${approved}</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="text-warning">
                        <i class="fas fa-clock"></i>
                        <div class="small">Pending</div>
                        <div class="fw-bold">${pending}</div>
                    </div>
                </div>
                <div class="col-4">
                    <div class="text-danger">
                        <i class="fas fa-times-circle"></i>
                        <div class="small">Rejected</div>
                        <div class="fw-bold">${rejected}</div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getMonthlyTrendChart() {
    // Simulated monthly data
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const applications = [45, 52, 48, 67, 73, 81];

    return `
        <div class="text-center">
            <canvas id="monthlyTrendChart" width="100" height="80"></canvas>
            <div class="mt-2">
                <small class="text-muted">Applications growth: <span class="text-success">+23%</span></small>
            </div>
        </div>
    `;
}

function getRecentApplicationsTable() {
    const applications = dataManager.getApplications().slice(0, 5);
    
    if (applications.length === 0) {
        return '<p class="text-muted text-center py-4">No applications found</p>';
    }

    return `
        <div class="table-responsive">
            <table class="table table-hover">
                <thead>
                    <tr>
                        <th>Application ID</th>
                        <th>Customer</th>
                        <th>Loan Type</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${applications.map(app => {
                        const customer = dataManager.getCustomerById(app.customerId);
                        const loan = dataManager.getLoanById(app.loanProductId);
                        
                        return `
                            <tr>
                                <td><code>${app.id}</code></td>
                                <td>${customer ? `${customer.firstName} ${customer.lastName}` : 'Unknown'}</td>
                                <td>${loan ? loan.name : 'Unknown'}</td>
                                <td>${utils.formatCurrency(app.amount)}</td>
                                <td>
                                    <span class="status-badge status-${app.status.replace('_', '-')}">
                                        ${app.status.replace('_', ' ').toUpperCase()}
                                    </span>
                                </td>
                                <td>${utils.formatDate(app.applicationDate)}</td>
                                <td>
                                    <button class="btn btn-sm btn-outline-primary" onclick="viewApplication('${app.id}')">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        </div>
    `;
}

function initializeDashboardComponents() {
    // Initialize any charts or interactive components
    initializeMonthlyChart();
}

function initializeMonthlyChart() {
    // Simple ASCII chart representation for demo
    const canvas = document.getElementById('monthlyTrendChart');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        
        // Simple line chart simulation
        ctx.strokeStyle = '#0d6efd';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        const points = [
            {x: 10, y: 60},
            {x: 30, y: 45},
            {x: 50, y: 50},
            {x: 70, y: 25},
            {x: 90, y: 15},
            {x: 110, y: 10}
        ];
        
        ctx.moveTo(points[0].x, points[0].y);
        points.forEach(point => {
            ctx.lineTo(point.x, point.y);
        });
        
        ctx.stroke();
        
        // Add dots
        ctx.fillStyle = '#0d6efd';
        points.forEach(point => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });
    }
}

// Dashboard action functions
function showPendingApprovals() {
    if (!auth.requirePermission('loan_approval')) return;
    
    const pendingApps = dataManager.getApplications().filter(app => 
        app.status === 'submitted' || app.status === 'under_review'
    );
    
    // This would open a modal or navigate to approvals page
    auth.showAlert(`${pendingApps.length} applications pending approval`, 'info');
}

function showTeamPerformance() {
    if (!auth.requirePermission('reports')) return;
    auth.showAlert('Team performance report would be displayed here', 'info');
}

function addNewCustomer() {
    if (!auth.requirePermission('customer_management')) return;
    showPage('customers');
    // Would trigger add customer modal
}

function newLoanApplication() {
    showPage('applications');
    // Would trigger new application modal
}

function showCustomerSearch() {
    auth.showAlert('Customer search functionality would be implemented here', 'info');
}

function showMyApplications() {
    const user = auth.getCurrentUser();
    if (user.role === 'customer') {
        showPage('applications');
    }
}

function exportData() {
    if (!auth.requirePermission('all')) return;
    auth.showAlert('Data export functionality would be implemented here', 'info');
}

function viewApplication(applicationId) {
    // This would open application details modal
    const app = dataManager.getApplicationById(applicationId);
    if (app) {
        auth.showAlert(`Viewing application ${applicationId}`, 'info');
        // Implementation would show application details
    }
} 