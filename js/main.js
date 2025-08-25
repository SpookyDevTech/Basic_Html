// Main Application Controller for Bank Loan Management System

// Current page tracking
let currentPage = 'dashboard';

// Initialize application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Initialize tooltips and other Bootstrap components
    initializeBootstrapComponents();
    
    // Setup role-based navigation
    setupRoleBasedNavigation();
    
    // Set up global event listeners
    setupGlobalEventListeners();
    
    // Update navigation
    updateNavigation();
    
    // Update user display name
    const user = auth.getCurrentUser();
    if (user) {
        const userDisplayElement = document.getElementById('userDisplayName');
        if (userDisplayElement) {
            userDisplayElement.textContent = user.name;
        }
    }
}

function setupRoleBasedNavigation() {
    const user = auth.getCurrentUser();
    if (!user) return;
    
    const role = user.role;
    const navItems = document.querySelectorAll('.navbar-nav .nav-item');
    
    // Define permissions for each role
    const rolePermissions = {
        admin: ['dashboard', 'customers', 'loans', 'applications', 'calculator', 'reports'],
        bank_manager: ['dashboard', 'customers', 'loans', 'applications', 'reports'],
        loan_officer: ['dashboard', 'customers', 'applications', 'calculator'],
        customer: ['dashboard', 'calculator']
    };
    
    const allowedPages = rolePermissions[role] || ['dashboard'];
    
    navItems.forEach(item => {
        const link = item.querySelector('.nav-link');
        if (link && link.onclick) {
            const onclickStr = link.onclick.toString();
            const pageMatch = onclickStr.match(/showPage\('([^']+)'\)/);
            
            if (pageMatch) {
                const pageName = pageMatch[1];
                if (!allowedPages.includes(pageName)) {
                    item.style.display = 'none';
                } else {
                    item.style.display = 'block';
                }
            }
        }
    });
}

function initializeBootstrapComponents() {
    // Initialize Bootstrap tooltips
    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    // Initialize Bootstrap popovers
    const popoverTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="popover"]'));
    popoverTriggerList.map(function (popoverTriggerEl) {
        return new bootstrap.Popover(popoverTriggerEl);
    });
}

function setupGlobalEventListeners() {
    // Global search functionality
    const globalSearch = document.getElementById('globalSearch');
    if (globalSearch) {
        globalSearch.addEventListener('input', handleGlobalSearch);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboardShortcuts);
}

function handleKeyboardShortcuts(event) {
    // Ctrl/Cmd + shortcuts
    if (event.ctrlKey || event.metaKey) {
        switch (event.key) {
            case 'd':
                event.preventDefault();
                showPage('dashboard');
                break;
            case 'c':
                event.preventDefault();
                showPage('customers');
                break;
            case 'l':
                event.preventDefault();
                showPage('loans');
                break;
            case 'a':
                event.preventDefault();
                showPage('applications');
                break;
        }
    }
}

function handleGlobalSearch(event) {
    const query = event.target.value.trim();
    if (query.length >= 2) {
        performGlobalSearch(query);
    }
}

function performGlobalSearch(query) {
    const results = {
        customers: dataManager.searchCustomers(query),
        applications: dataManager.getApplications().filter(app => 
            app.id.toLowerCase().includes(query.toLowerCase()) ||
            app.purpose.toLowerCase().includes(query.toLowerCase())
        )
    };
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    // This would show search results in a dropdown or modal
    console.log('Search results:', results);
}

// Page navigation system
function showPage(pageName) {
    if (!auth.requireAuth()) return;
    
    // Update current page
    currentPage = pageName;
    
    // Update navigation
    updateNavigation();
    
    // Load page content
    const contentArea = document.getElementById('contentArea');
    if (!contentArea) return;
    
    // Show loading spinner
    showLoadingSpinner(contentArea);
    
    // Load page content after brief delay to show loading
    setTimeout(() => {
        switch (pageName) {
            case 'dashboard':
                loadDashboard(contentArea);
                break;
            case 'customers':
                loadCustomersPage(contentArea);
                break;
            case 'loans':
                loadLoansPage(contentArea);
                break;
            case 'applications':
                loadApplicationsPage(contentArea);
                break;
            case 'calculator':
                loadCalculatorPage(contentArea);
                break;
            case 'reports':
                loadReportsPage(contentArea);
                break;
            default:
                load404Page(contentArea);
        }
    }, 300);
}

function updateNavigation() {
    // Update active nav link
    const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
    navLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    // Find and activate current page link
    const currentLink = document.querySelector(`.nav-link[onclick*="${currentPage}"]`);
    if (currentLink) {
        currentLink.classList.add('active');
    }
    
    // Update page title
    updatePageTitle();
}

function updatePageTitle() {
    const pageTitles = {
        dashboard: 'Dashboard',
        customers: 'Customer Management',
        loans: 'Loan Products',
        applications: 'Loan Applications',
        calculator: 'EMI Calculator',
        reports: 'Reports & Analytics'
    };
    
    document.title = `${pageTitles[currentPage] || 'Page'} - Bank Loan Management System`;
}

function showLoadingSpinner(container) {
    container.innerHTML = `
        <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
            <div class="text-center">
                <div class="loading-spinner mb-3"></div>
                <p class="text-muted">Loading...</p>
            </div>
        </div>
    `;
}

// Profile and settings functions
function showProfile() {
    const user = auth.getCurrentUser();
    if (!user) return;
    
    const modalHtml = `
        <div class="modal fade" id="profileModal" tabindex="-1">
            <div class="modal-dialog">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-user me-2"></i>User Profile
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-4 text-center mb-3">
                                <i class="fas fa-user-circle fa-5x text-primary mb-2"></i>
                                <h6>${user.name}</h6>
                                <span class="badge bg-primary">${user.role.replace('_', ' ').toUpperCase()}</span>
                            </div>
                            <div class="col-md-8">
                                <table class="table table-borderless">
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td>${user.email}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Role:</strong></td>
                                        <td>${user.role.replace('_', ' ').toUpperCase()}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Login Time:</strong></td>
                                        <td>${formatDateTime(user.loginTime)}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Permissions:</strong></td>
                                        <td>
                                            ${user.permissions.map(p => 
                                                `<span class="badge bg-secondary me-1">${p.replace('_', ' ')}</span>`
                                            ).join('')}
                                        </td>
                                    </tr>
                                </table>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        <button type="button" class="btn btn-primary" onclick="editProfile()">Edit Profile</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('profileModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('profileModal'));
    modal.show();
}

function editProfile() {
    auth.showAlert('Profile editing functionality would be implemented here.', 'info');
}

function showSettings() {
    const modalHtml = `
        <div class="modal fade" id="settingsModal" tabindex="-1">
            <div class="modal-dialog modal-lg">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title">
                            <i class="fas fa-cog me-2"></i>Settings
                        </h5>
                        <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body">
                        <div class="row">
                            <div class="col-md-3">
                                <div class="nav flex-column nav-pills" role="tablist">
                                    <button class="nav-link active" data-bs-toggle="pill" data-bs-target="#general-settings">
                                        <i class="fas fa-sliders-h me-2"></i>General
                                    </button>
                                    <button class="nav-link" data-bs-toggle="pill" data-bs-target="#security-settings">
                                        <i class="fas fa-shield-alt me-2"></i>Security
                                    </button>
                                    <button class="nav-link" data-bs-toggle="pill" data-bs-target="#notification-settings">
                                        <i class="fas fa-bell me-2"></i>Notifications
                                    </button>
                                </div>
                            </div>
                            <div class="col-md-9">
                                <div class="tab-content">
                                    <div class="tab-pane fade show active" id="general-settings">
                                        <h6>General Settings</h6>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="darkMode" checked>
                                            <label class="form-check-label" for="darkMode">Dark Mode</label>
                                        </div>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="autoSave" checked>
                                            <label class="form-check-label" for="autoSave">Auto Save</label>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="security-settings">
                                        <h6>Security Settings</h6>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="twoFactor">
                                            <label class="form-check-label" for="twoFactor">Two-Factor Authentication</label>
                                        </div>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="sessionTimeout" checked>
                                            <label class="form-check-label" for="sessionTimeout">Auto Logout</label>
                                        </div>
                                    </div>
                                    <div class="tab-pane fade" id="notification-settings">
                                        <h6>Notification Settings</h6>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="emailNotifications" checked>
                                            <label class="form-check-label" for="emailNotifications">Email Notifications</label>
                                        </div>
                                        <div class="form-check form-switch mb-3">
                                            <input class="form-check-input" type="checkbox" id="browserNotifications">
                                            <label class="form-check-label" for="browserNotifications">Browser Notifications</label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
                        <button type="button" class="btn btn-primary" onclick="saveSettings()">Save Changes</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Remove existing modal
    const existingModal = document.getElementById('settingsModal');
    if (existingModal) existingModal.remove();
    
    // Add modal to body
    document.body.insertAdjacentHTML('beforeend', modalHtml);
    
    // Show modal
    const modal = new bootstrap.Modal(document.getElementById('settingsModal'));
    modal.show();
}

function saveSettings() {
    auth.showAlert('Settings saved successfully!', 'success');
    bootstrap.Modal.getInstance(document.getElementById('settingsModal')).hide();
}

function load404Page(container) {
    container.innerHTML = `
        <div class="text-center py-5">
            <i class="fas fa-exclamation-triangle fa-5x text-warning mb-4"></i>
            <h2>Page Not Found</h2>
            <p class="lead">The requested page could not be found.</p>
            <button class="btn btn-primary" onclick="showPage('dashboard')">
                <i class="fas fa-home me-2"></i>Return to Dashboard
            </button>
        </div>
    `;
}

// Utility functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-IN').format(number);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('en-IN');
}

function formatDateTime(dateString) {
    return new Date(dateString).toLocaleString('en-IN');
}

function calculateAge(dateOfBirth) {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    
    return age;
}

function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone) {
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

function generateRandomId() {
    return Math.random().toString(36).substr(2, 9);
}

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

// Export utility functions
window.utils = {
    formatCurrency,
    formatNumber,
    formatDate,
    formatDateTime,
    calculateAge,
    validateEmail,
    validatePhone,
    generateRandomId,
    debounce
}; 