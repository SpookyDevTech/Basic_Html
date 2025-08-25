// Reports and Analytics functionality for Bank Loan Management System

function loadReportsPage(container) {
    if (!auth.requirePermission('reports')) return;
    
    const user = auth.getCurrentUser();
    const role = user.role;
    
    const reportsHtml = `
        <div class="row mb-4">
            <div class="col-12">
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h2><i class="fas fa-chart-bar me-2"></i>Reports & Analytics</h2>
                        <p class="text-muted">Comprehensive business intelligence and reporting dashboard. Role: ${role.replace('_', ' ').toUpperCase()}</p>
                    </div>
                    <div class="btn-group" role="group">
                        <button type="button" class="btn btn-outline-primary" onclick="refreshReports()">
                            <i class="fas fa-sync me-1"></i>Refresh
                        </button>
                        <button type="button" class="btn btn-primary" onclick="generateFullReport()">
                            <i class="fas fa-file-pdf me-1"></i>Generate Report
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <!-- Role-specific Report Tabs -->
        <div class="row mb-4">
            <div class="col-12">
                <ul class="nav nav-tabs" id="reportTabs" role="tablist">
                    <li class="nav-item" role="presentation">
                        <button class="nav-link active" id="overview-tab" data-bs-toggle="tab" data-bs-target="#overview" type="button" role="tab">
                            <i class="fas fa-chart-pie me-1"></i>Overview
                        </button>
                    </li>
                    ${getRoleSpecificTabs(role)}
                </ul>
                <div class="tab-content" id="reportTabContent">
                    <div class="tab-pane fade show active" id="overview" role="tabpanel">
                        ${getOverviewReports()}
                    </div>
                    ${getRoleSpecificTabContent(role)}
                </div>
            </div>
        </div>

        <!-- Date Range Filter -->
        <div class="row mb-4">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-body">
                        <div class="row align-items-center">
                            <div class="col-md-3">
                                <label class="form-label">Date Range:</label>
                            </div>
                            <div class="col-md-3">
                                <input type="date" class="form-control" id="reportFromDate" onchange="updateReports()">
                            </div>
                            <div class="col-md-3">
                                <input type="date" class="form-control" id="reportToDate" onchange="updateReports()">
                            </div>
                            <div class="col-md-3">
                                <select class="form-select" id="reportPeriod" onchange="setReportPeriod()">
                                    <option value="custom">Custom Range</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month" selected>This Month</option>
                                    <option value="quarter">This Quarter</option>
                                    <option value="year">This Year</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card bg-primary text-white">
                    <div class="card-body text-center">
                        <h5>Total Portfolio Value</h5>
                        <h2 id="portfolioValue">${utils.formatCurrency(getPortfolioValue())}</h2>
                    </div>
                </div>
            </div>
        </div>

        <!-- Key Metrics -->
        <div class="row mb-4">
            ${getKeyMetrics()}
        </div>

        <!-- Charts Row -->
        <div class="row mb-4">
            <!-- Application Trends -->
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Application Trends</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="applicationTrendsChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>

            <!-- Loan Distribution -->
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Loan Distribution by Type</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="loanDistributionChart" width="400" height="200"></canvas>
                        <div class="mt-3" id="loanDistributionLegend">
                            <!-- Legend will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Reports Row -->
        <div class="row mb-4">
            <!-- Top Performing Products -->
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-trophy me-2"></i>Top Performing Products</h5>
                    </div>
                    <div class="card-body">
                        ${getTopPerformingProducts()}
                    </div>
                </div>
            </div>

            <!-- Application Status Summary -->
            <div class="col-lg-6">
                <div class="card h-100">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-tasks me-2"></i>Application Status Summary</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="statusSummaryChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
        </div>

        <!-- Detailed Tables -->
        <div class="row">
            <!-- Monthly Performance -->
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-calendar-alt me-2"></i>Monthly Performance</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-striped">
                                <thead>
                                    <tr>
                                        <th>Month</th>
                                        <th>Applications</th>
                                        <th>Approved</th>
                                        <th>Approval Rate</th>
                                        <th>Amount Disbursed</th>
                                    </tr>
                                </thead>
                                <tbody id="monthlyPerformanceTable">
                                    ${getMonthlyPerformanceData()}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Quick Stats -->
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Quick Statistics</h5>
                    </div>
                    <div class="card-body">
                        ${getQuickStatistics()}
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = reportsHtml;
    initializeReports();
}

function getPortfolioValue() {
    const applications = dataManager.getApplications();
    return applications
        .filter(app => app.status === 'approved' || app.status === 'disbursed')
        .reduce((total, app) => total + app.amount, 0);
}

function getKeyMetrics() {
    const applications = dataManager.getApplications();
    const customers = dataManager.getCustomers();
    const loans = dataManager.getLoans();
    
    const totalApplications = applications.length;
    const approvedApplications = applications.filter(app => app.status === 'approved').length;
    const approvalRate = totalApplications > 0 ? ((approvedApplications / totalApplications) * 100).toFixed(1) : 0;
    const avgLoanAmount = approvedApplications > 0 ? 
        applications.filter(app => app.status === 'approved')
                  .reduce((sum, app) => sum + app.amount, 0) / approvedApplications : 0;

    return `
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card success">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Approval Rate</h6>
                            <div class="stat-number">${approvalRate}%</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-percentage"></i>
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
                            <h6 class="text-white-50 mb-1">Avg Loan Amount</h6>
                            <div class="stat-number" style="font-size: 1.2rem;">${utils.formatCurrency(avgLoanAmount)}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-calculator"></i>
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
                            <h6 class="text-white-50 mb-1">Active Customers</h6>
                            <div class="stat-number">${customers.filter(c => c.isActive).length}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-lg-3 col-md-6 mb-3">
            <div class="card stat-card primary">
                <div class="card-body">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="text-white-50 mb-1">Active Products</h6>
                            <div class="stat-number">${loans.filter(l => l.isActive).length}</div>
                        </div>
                        <div class="stat-icon">
                            <i class="fas fa-list"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getTopPerformingProducts() {
    const applications = dataManager.getApplications();
    const loans = dataManager.getLoans();
    
    // Count applications by loan product
    const productStats = {};
    applications.forEach(app => {
        if (!productStats[app.loanProductId]) {
            productStats[app.loanProductId] = {
                total: 0,
                approved: 0,
                amount: 0
            };
        }
        productStats[app.loanProductId].total++;
        if (app.status === 'approved') {
            productStats[app.loanProductId].approved++;
            productStats[app.loanProductId].amount += app.amount;
        }
    });
    
    // Sort by approval count
    const sortedProducts = Object.entries(productStats)
        .sort(([,a], [,b]) => b.approved - a.approved)
        .slice(0, 5);
    
    if (sortedProducts.length === 0) {
        return '<p class="text-muted text-center py-4">No data available</p>';
    }
    
    return `
        <div class="list-group list-group-flush">
            ${sortedProducts.map(([productId, stats]) => {
                const loan = loans.find(l => l.id === productId);
                const approvalRate = stats.total > 0 ? ((stats.approved / stats.total) * 100).toFixed(1) : 0;
                
                return `
                    <div class="list-group-item d-flex justify-content-between align-items-center">
                        <div>
                            <h6 class="mb-1">${loan ? loan.name : 'Unknown'}</h6>
                            <small class="text-muted">
                                ${stats.approved} approved / ${stats.total} total (${approvalRate}%)
                            </small>
                        </div>
                        <div class="text-end">
                            <div class="fw-bold">${utils.formatCurrency(stats.amount)}</div>
                            <small class="text-muted">Total Amount</small>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `;
}

function getMonthlyPerformanceData() {
    // Generate last 6 months performance data
    const months = [];
    const now = new Date();
    
    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthName = date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        
        // Simulate data (in real app, this would be calculated from actual data)
        const applications = Math.floor(Math.random() * 50) + 20;
        const approved = Math.floor(applications * (0.6 + Math.random() * 0.3));
        const approvalRate = ((approved / applications) * 100).toFixed(1);
        const disbursed = approved * (50000 + Math.random() * 200000);
        
        months.push(`
            <tr>
                <td>${monthName}</td>
                <td>${applications}</td>
                <td>${approved}</td>
                <td><span class="badge bg-${approvalRate > 70 ? 'success' : approvalRate > 50 ? 'warning' : 'danger'}">${approvalRate}%</span></td>
                <td>${utils.formatCurrency(disbursed)}</td>
            </tr>
        `);
    }
    
    return months.join('');
}

function getQuickStatistics() {
    const applications = dataManager.getApplications();
    const customers = dataManager.getCustomers();
    
    const avgProcessingTime = '3.2 days'; // Simulated
    const customerSatisfaction = '4.8/5'; // Simulated
    const avgCreditScore = customers.length > 0 ? 
        Math.round(customers.reduce((sum, c) => sum + c.financial.creditScore, 0) / customers.length) : 0;
    
    return `
        <div class="row text-center">
            <div class="col-12 mb-3">
                <h4 class="text-primary">${avgProcessingTime}</h4>
                <small class="text-muted">Avg Processing Time</small>
            </div>
            <div class="col-12 mb-3">
                <h4 class="text-success">${customerSatisfaction}</h4>
                <small class="text-muted">Customer Satisfaction</small>
            </div>
            <div class="col-12 mb-3">
                <h4 class="text-info">${avgCreditScore}</h4>
                <small class="text-muted">Avg Credit Score</small>
            </div>
            <div class="col-12">
                <h4 class="text-warning">${applications.filter(a => a.status === 'under_review').length}</h4>
                <small class="text-muted">Pending Reviews</small>
            </div>
        </div>
    `;
}

function initializeReports() {
    // Set default date range to current month
    setReportPeriod();
    
    // Initialize charts
    setTimeout(() => {
        drawApplicationTrendsChart();
        drawLoanDistributionChart();
        drawStatusSummaryChart();
    }, 100);
}

function setReportPeriod() {
    const period = document.getElementById('reportPeriod').value;
    const fromDate = document.getElementById('reportFromDate');
    const toDate = document.getElementById('reportToDate');
    const now = new Date();
    
    let startDate, endDate;
    
    switch (period) {
        case 'today':
            startDate = endDate = new Date();
            break;
        case 'week':
            startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
            endDate = now;
            break;
        case 'month':
            startDate = new Date(now.getFullYear(), now.getMonth(), 1);
            endDate = now;
            break;
        case 'quarter':
            startDate = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
            endDate = now;
            break;
        case 'year':
            startDate = new Date(now.getFullYear(), 0, 1);
            endDate = now;
            break;
        default:
            return; // Custom range - don't update fields
    }
    
    fromDate.value = startDate.toISOString().split('T')[0];
    toDate.value = endDate.toISOString().split('T')[0];
    
    updateReports();
}

function updateReports() {
    // This would filter data based on selected date range
    console.log('Updating reports with date range...');
    
    // Redraw charts with filtered data
    drawApplicationTrendsChart();
    drawLoanDistributionChart();
    drawStatusSummaryChart();
}

function drawApplicationTrendsChart() {
    const canvas = document.getElementById('applicationTrendsChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Sample data for last 6 months
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const applications = [25, 35, 30, 45, 55, 60];
    const approved = [20, 28, 24, 36, 44, 48];
    
    const maxValue = Math.max(...applications) + 10;
    const chartWidth = canvas.width - 80;
    const chartHeight = canvas.height - 80;
    const startX = 50;
    const startY = canvas.height - 40;
    
    // Draw axes
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX + chartWidth, startY);
    ctx.moveTo(startX, startY);
    ctx.lineTo(startX, startY - chartHeight);
    ctx.stroke();
    
    // Draw applications line
    ctx.strokeStyle = '#0d6efd';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    applications.forEach((value, index) => {
        const x = startX + (index * (chartWidth / (applications.length - 1)));
        const y = startY - ((value / maxValue) * chartHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#0d6efd';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.stroke();
    
    // Draw approved line
    ctx.strokeStyle = '#198754';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    approved.forEach((value, index) => {
        const x = startX + (index * (chartWidth / (approved.length - 1)));
        const y = startY - ((value / maxValue) * chartHeight);
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        
        // Draw point
        ctx.fillStyle = '#198754';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, 2 * Math.PI);
        ctx.fill();
    });
    ctx.stroke();
    
    // Add labels
    ctx.fillStyle = '#666';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    months.forEach((month, index) => {
        const x = startX + (index * (chartWidth / (months.length - 1)));
        ctx.fillText(month, x, startY + 20);
    });
    
    // Add legend
    ctx.textAlign = 'left';
    ctx.fillStyle = '#0d6efd';
    ctx.fillRect(startX + chartWidth - 150, 20, 15, 3);
    ctx.fillStyle = '#666';
    ctx.fillText('Applications', startX + chartWidth - 130, 25);
    
    ctx.fillStyle = '#198754';
    ctx.fillRect(startX + chartWidth - 150, 35, 15, 3);
    ctx.fillStyle = '#666';
    ctx.fillText('Approved', startX + chartWidth - 130, 40);
}

function drawLoanDistributionChart() {
    const canvas = document.getElementById('loanDistributionChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const applications = dataManager.getApplications();
    const loans = dataManager.getLoans();
    
    // Count applications by loan type
    const typeCount = {};
    applications.forEach(app => {
        const loan = loans.find(l => l.id === app.loanProductId);
        const type = loan ? loan.type : 'other';
        typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    const data = Object.entries(typeCount);
    const colors = ['#0d6efd', '#198754', '#ffc107', '#dc3545', '#6f42c1'];
    const total = data.reduce((sum, [, count]) => sum + count, 0);
    
    if (total === 0) {
        ctx.fillStyle = '#666';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('No data available', canvas.width / 2, canvas.height / 2);
        return;
    }
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    let currentAngle = 0;
    
    // Draw pie slices
    data.forEach(([type, count], index) => {
        const sliceAngle = (count / total) * 2 * Math.PI;
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        ctx.closePath();
        ctx.fillStyle = colors[index % colors.length];
        ctx.fill();
        
        currentAngle += sliceAngle;
    });
    
    // Update legend
    const legend = document.getElementById('loanDistributionLegend');
    if (legend) {
        legend.innerHTML = data.map(([type, count], index) => {
            const percentage = ((count / total) * 100).toFixed(1);
            return `
                <div class="d-flex align-items-center justify-content-between mb-2">
                    <div class="d-flex align-items-center">
                        <div class="me-2" style="width: 12px; height: 12px; background-color: ${colors[index % colors.length]}; border-radius: 2px;"></div>
                        <span class="text-capitalize">${type} Loan</span>
                    </div>
                    <span class="fw-bold">${count} (${percentage}%)</span>
                </div>
            `;
        }).join('');
    }
}

function drawStatusSummaryChart() {
    const canvas = document.getElementById('statusSummaryChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const applications = dataManager.getApplications();
    const statusCount = {
        submitted: 0,
        under_review: 0,
        approved: 0,
        rejected: 0
    };
    
    applications.forEach(app => {
        if (statusCount.hasOwnProperty(app.status)) {
            statusCount[app.status]++;
        }
    });
    
    const data = Object.entries(statusCount);
    const colors = {
        submitted: '#6c757d',
        under_review: '#ffc107',
        approved: '#198754',
        rejected: '#dc3545'
    };
    
    const barWidth = 40;
    const barSpacing = 60;
    const maxValue = Math.max(...Object.values(statusCount)) || 1;
    const chartHeight = canvas.height - 80;
    const startY = canvas.height - 40;
    
    data.forEach(([status, count], index) => {
        const x = 50 + (index * barSpacing);
        const barHeight = (count / maxValue) * chartHeight;
        const y = startY - barHeight;
        
        // Draw bar
        ctx.fillStyle = colors[status];
        ctx.fillRect(x, y, barWidth, barHeight);
        
        // Draw value on top
        ctx.fillStyle = '#666';
        ctx.font = '12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(count.toString(), x + barWidth / 2, y - 5);
        
        // Draw label
        ctx.save();
        ctx.translate(x + barWidth / 2, startY + 15);
        ctx.rotate(-Math.PI / 4);
        ctx.textAlign = 'right';
        ctx.fillText(status.replace('_', ' '), 0, 0);
        ctx.restore();
    });
}

function refreshReports() {
    loadReportsPage(document.getElementById('contentArea'));
    auth.showAlert('Reports refreshed successfully!', 'success');
}

function generateFullReport() {
    // In a real application, this would generate a PDF report
    auth.showAlert('Full report generation would be implemented here. This would create a comprehensive PDF report with all analytics.', 'info');
}

function getRoleSpecificTabs(role) {
    const tabs = {
        admin: [
            '<li class="nav-item" role="presentation"><button class="nav-link" id="admin-tab" data-bs-toggle="tab" data-bs-target="#admin" type="button" role="tab"><i class="fas fa-user-shield me-1"></i>Admin Reports</button></li>',
            '<li class="nav-item" role="presentation"><button class="nav-link" id="performance-tab" data-bs-toggle="tab" data-bs-target="#performance" type="button" role="tab"><i class="fas fa-chart-line me-1"></i>Performance</button></li>',
            '<li class="nav-item" role="presentation"><button class="nav-link" id="audit-tab" data-bs-toggle="tab" data-bs-target="#audit" type="button" role="tab"><i class="fas fa-clipboard-list me-1"></i>Audit Trail</button></li>'
        ],
        bank_manager: [
            '<li class="nav-item" role="presentation"><button class="nav-link" id="manager-tab" data-bs-toggle="tab" data-bs-target="#manager" type="button" role="tab"><i class="fas fa-briefcase me-1"></i>Manager Reports</button></li>',
            '<li class="nav-item" role="presentation"><button class="nav-link" id="portfolio-tab" data-bs-toggle="tab" data-bs-target="#portfolio" type="button" role="tab"><i class="fas fa-folder-open me-1"></i>Portfolio</button></li>',
            '<li class="nav-item" role="presentation"><button class="nav-link" id="risk-tab" data-bs-toggle="tab" data-bs-target="#risk" type="button" role="tab"><i class="fas fa-exclamation-triangle me-1"></i>Risk Analysis</button></li>'
        ],
        loan_officer: [
            '<li class="nav-item" role="presentation"><button class="nav-link" id="officer-tab" data-bs-toggle="tab" data-bs-target="#officer" type="button" role="tab"><i class="fas fa-user-tie me-1"></i>Officer Reports</button></li>',
            '<li class="nav-item" role="presentation"><button class="nav-link" id="activity-tab" data-bs-toggle="tab" data-bs-target="#activity" type="button" role="tab"><i class="fas fa-clock me-1"></i>My Activity</button></li>'
        ],
        customer: [
            '<li class="nav-item" role="presentation"><button class="nav-link" id="customer-tab" data-bs-toggle="tab" data-bs-target="#customer" type="button" role="tab"><i class="fas fa-user me-1"></i>My Reports</button></li>'
        ]
    };
    
    return tabs[role] ? tabs[role].join('') : '';
}

function getRoleSpecificTabContent(role) {
    const content = {
        admin: `
            <div class="tab-pane fade" id="admin" role="tabpanel">
                ${getAdminReports()}
            </div>
            <div class="tab-pane fade" id="performance" role="tabpanel">
                ${getPerformanceReports()}
            </div>
            <div class="tab-pane fade" id="audit" role="tabpanel">
                ${getAuditReports()}
            </div>
        `,
        bank_manager: `
            <div class="tab-pane fade" id="manager" role="tabpanel">
                ${getManagerReports()}
            </div>
            <div class="tab-pane fade" id="portfolio" role="tabpanel">
                ${getPortfolioReports()}
            </div>
            <div class="tab-pane fade" id="risk" role="tabpanel">
                ${getRiskAnalysisReports()}
            </div>
        `,
        loan_officer: `
            <div class="tab-pane fade" id="officer" role="tabpanel">
                ${getOfficerReports()}
            </div>
            <div class="tab-pane fade" id="activity" role="tabpanel">
                ${getActivityReports()}
            </div>
        `,
        customer: `
            <div class="tab-pane fade" id="customer" role="tabpanel">
                ${getCustomerReports()}
            </div>
        `
    };
    
    return content[role] || '';
}

function getOverviewReports() {
    return `
        <div class="row mt-3">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>Application Trends</h5>
                    </div>
                    <div class="card-body">
                        <canvas id="overviewTrendsChart" width="400" height="200"></canvas>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-info-circle me-2"></i>Quick Stats</h5>
                    </div>
                    <div class="card-body">
                        ${getQuickStatistics()}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getAdminReports() {
    return `
        <div class="row mt-3">
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-users me-2"></i>User Activity Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>User Role</th>
                                        <th>Active Users</th>
                                        <th>Actions Today</th>
                                        <th>Performance</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Bank Managers</td>
                                        <td>3</td>
                                        <td>12</td>
                                        <td><span class="badge bg-success">Excellent</span></td>
                                    </tr>
                                    <tr>
                                        <td>Loan Officers</td>
                                        <td>8</td>
                                        <td>45</td>
                                        <td><span class="badge bg-success">Good</span></td>
                                    </tr>
                                    <tr>
                                        <td>Customers</td>
                                        <td>156</td>
                                        <td>23</td>
                                        <td><span class="badge bg-warning">Average</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-cogs me-2"></i>System Health</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Database Performance</label>
                            <div class="progress">
                                <div class="progress-bar bg-success" style="width: 95%">95%</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Application Response Time</label>
                            <div class="progress">
                                <div class="progress-bar bg-info" style="width: 88%">88%</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Security Score</label>
                            <div class="progress">
                                <div class="progress-bar bg-warning" style="width: 92%">92%</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getManagerReports() {
    return `
        <div class="row mt-3">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-bar me-2"></i>Team Performance</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Officer</th>
                                        <th>Applications Processed</th>
                                        <th>Approval Rate</th>
                                        <th>Avg Processing Time</th>
                                        <th>Rating</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>John Smith</td>
                                        <td>45</td>
                                        <td>82%</td>
                                        <td>2.3 days</td>
                                        <td><span class="badge bg-success">Excellent</span></td>
                                    </tr>
                                    <tr>
                                        <td>Sarah Johnson</td>
                                        <td>38</td>
                                        <td>78%</td>
                                        <td>2.8 days</td>
                                        <td><span class="badge bg-success">Good</span></td>
                                    </tr>
                                    <tr>
                                        <td>Mike Wilson</td>
                                        <td>33</td>
                                        <td>75%</td>
                                        <td>3.1 days</td>
                                        <td><span class="badge bg-warning">Average</span></td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-bullseye me-2"></i>Monthly Targets</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Applications Target: 150</label>
                            <div class="progress">
                                <div class="progress-bar bg-primary" style="width: 78%">117/150</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Revenue Target: $2M</label>
                            <div class="progress">
                                <div class="progress-bar bg-success" style="width: 85%">$1.7M</div>
                            </div>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Customer Satisfaction: 4.5</label>
                            <div class="progress">
                                <div class="progress-bar bg-info" style="width: 96%">4.8/5.0</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getOfficerReports() {
    const user = auth.getCurrentUser();
    return `
        <div class="row mt-3">
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-chart-line me-2"></i>My Performance</h5>
                    </div>
                    <div class="card-body">
                        <div class="row text-center">
                            <div class="col-4">
                                <h3 class="text-primary">23</h3>
                                <small class="text-muted">Applications This Month</small>
                            </div>
                            <div class="col-4">
                                <h3 class="text-success">87%</h3>
                                <small class="text-muted">Approval Rate</small>
                            </div>
                            <div class="col-4">
                                <h3 class="text-info">2.1</h3>
                                <small class="text-muted">Avg Days</small>
                            </div>
                        </div>
                        <hr>
                        <div class="mb-3">
                            <label class="form-label">Monthly Target Progress</label>
                            <div class="progress">
                                <div class="progress-bar bg-primary" style="width: 76%">23/30</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-6">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-tasks me-2"></i>My Applications</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Status</th>
                                        <th>Count</th>
                                        <th>This Week</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td><span class="badge bg-warning">Pending</span></td>
                                        <td>5</td>
                                        <td>+2</td>
                                    </tr>
                                    <tr>
                                        <td><span class="badge bg-success">Approved</span></td>
                                        <td>18</td>
                                        <td>+6</td>
                                    </tr>
                                    <tr>
                                        <td><span class="badge bg-danger">Rejected</span></td>
                                        <td>2</td>
                                        <td>+1</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getCustomerReports() {
    const user = auth.getCurrentUser();
    return `
        <div class="row mt-3">
            <div class="col-lg-8">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-history me-2"></i>My Application History</h5>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-hover">
                                <thead>
                                    <tr>
                                        <th>Application ID</th>
                                        <th>Loan Type</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Applied Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>#APP001</td>
                                        <td>Personal Loan</td>
                                        <td>$15,000</td>
                                        <td><span class="badge bg-success">Approved</span></td>
                                        <td>2024-01-15</td>
                                    </tr>
                                    <tr>
                                        <td>#APP002</td>
                                        <td>Vehicle Loan</td>
                                        <td>$25,000</td>
                                        <td><span class="badge bg-warning">Under Review</span></td>
                                        <td>2024-01-18</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-lg-4">
                <div class="card">
                    <div class="card-header">
                        <h5 class="mb-0"><i class="fas fa-credit-card me-2"></i>My Financial Summary</h5>
                    </div>
                    <div class="card-body">
                        <div class="mb-3">
                            <label class="form-label">Total Borrowed</label>
                            <h4 class="text-primary">$40,000</h4>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Outstanding Balance</label>
                            <h4 class="text-warning">$32,500</h4>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Credit Score</label>
                            <h4 class="text-success">750</h4>
                        </div>
                        <div class="mb-3">
                            <label class="form-label">Next EMI Due</label>
                            <h5 class="text-info">Jan 25, 2024</h5>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function getPerformanceReports() {
    return `<div class="mt-3"><p class="text-muted">Performance analytics would be displayed here...</p></div>`;
}

function getAuditReports() {
    return `<div class="mt-3"><p class="text-muted">Audit trail reports would be displayed here...</p></div>`;
}

function getPortfolioReports() {
    return `<div class="mt-3"><p class="text-muted">Portfolio analysis would be displayed here...</p></div>`;
}

function getRiskAnalysisReports() {
    return `<div class="mt-3"><p class="text-muted">Risk analysis reports would be displayed here...</p></div>`;
}

function getActivityReports() {
    return `<div class="mt-3"><p class="text-muted">Detailed activity reports would be displayed here...</p></div>`;
} 