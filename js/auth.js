// Authentication System for Bank Loan Management System

// Demo users database
const DEMO_USERS = {
    'admin': {
        password: 'admin123',
        role: 'admin',
        name: 'Bank Administrator',
        id: 'admin-001',
        permissions: ['all']
    },
    'manager': {
        password: 'manager123',
        role: 'bank_manager',
        name: 'Branch Manager',
        id: 'manager-001',
        permissions: ['dashboard', 'customers', 'loans', 'applications', 'reports', 'loan_approval']
    },
    'officer': {
        password: 'officer123',
        role: 'loan_officer',
        name: 'Loan Officer',
        id: 'officer-001',
        permissions: ['dashboard', 'customers', 'applications', 'calculator', 'loan_processing']
    },
    'customer': {
        password: 'customer123',
        role: 'customer',
        name: 'John Customer',
        id: 'customer-001',
        permissions: ['dashboard', 'calculator', 'applications']
    }
};

// Authentication state
let currentUser = null;

// Initialize authentication
document.addEventListener('DOMContentLoaded', function() {
    initializeAuth();
    setupEventListeners();
});

function initializeAuth() {
    // Check if user is already logged in
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginPage();
    }
}

function setupEventListeners() {
    // Login form submission
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }

    // Toggle password visibility
    const togglePassword = document.getElementById('togglePassword');
    if (togglePassword) {
        togglePassword.addEventListener('click', function() {
            const passwordField = document.getElementById('password');
            const icon = this.querySelector('i');
            
            if (passwordField.type === 'password') {
                passwordField.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                passwordField.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    }
}

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    
    // Validate input
    if (!username || !password) {
        showAlert('Please enter both username and password', 'danger');
        return;
    }
    
    // Check credentials
    const user = DEMO_USERS[username];
    if (!user || user.password !== password) {
        showAlert('Invalid username or password', 'danger');
        return;
    }
    
    // Successful login
    currentUser = {
        id: user.id,
        username: username,
        name: user.name,
        role: user.role,
        permissions: user.permissions,
        loginTime: new Date().toISOString()
    };
    
    // Store user session
    if (rememberMe) {
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    } else {
        sessionStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
    
    showAlert('Login successful! Welcome back.', 'success');
    
    // Redirect to main app after brief delay
    setTimeout(() => {
        showMainApp();
    }, 1000);
}

function logout() {
    // Clear user session
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
    currentUser = null;
    
    // Show login page
    showLoginPage();
    showAlert('You have been logged out successfully', 'info');
}

function showLoginPage() {
    document.getElementById('loginPage').classList.remove('d-none');
    document.getElementById('mainApp').classList.add('d-none');
    
    // Clear form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.reset();
    }
}

function showMainApp() {
    document.getElementById('loginPage').classList.add('d-none');
    document.getElementById('mainApp').classList.remove('d-none');
    
    // Update user display name
    const userDisplayName = document.getElementById('userDisplayName');
    if (userDisplayName && currentUser) {
        userDisplayName.textContent = currentUser.name;
    }
    
    // Load dashboard by default
    showPage('dashboard');
}

function showForgotPassword() {
    showAlert('For demo purposes, use the provided demo credentials.', 'info');
}

function hasPermission(permission) {
    if (!currentUser) return false;
    return currentUser.permissions.includes('all') || currentUser.permissions.includes(permission);
}

function requireAuth() {
    if (!currentUser) {
        showLoginPage();
        showAlert('Please log in to access this feature', 'warning');
        return false;
    }
    return true;
}

function requirePermission(permission) {
    if (!requireAuth()) return false;
    
    if (!hasPermission(permission)) {
        showAlert('You do not have permission to access this feature', 'danger');
        return false;
    }
    return true;
}

function getCurrentUser() {
    return currentUser;
}

function getUserRole() {
    return currentUser ? currentUser.role : null;
}

function showAlert(message, type = 'info', duration = 3000) {
    // Remove existing alerts
    const existingAlerts = document.querySelectorAll('.alert-custom');
    existingAlerts.forEach(alert => alert.remove());
    
    // Create new alert
    const alertDiv = document.createElement('div');
    alertDiv.className = `alert alert-${type} alert-dismissible fade show alert-custom`;
    alertDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    alertDiv.innerHTML = `
        <i class="fas fa-${getAlertIcon(type)} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(alertDiv);
    
    // Auto-remove after duration
    if (duration > 0) {
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, duration);
    }
}

function getAlertIcon(type) {
    switch (type) {
        case 'success': return 'check-circle';
        case 'danger': return 'exclamation-triangle';
        case 'warning': return 'exclamation-circle';
        case 'info': return 'info-circle';
        default: return 'info-circle';
    }
}

// Quick login helpers for demo
function quickLogin(userType) {
    const username = userType; // Now usernames are simple: admin, manager, officer, customer
    
    if (DEMO_USERS[username]) {
        document.getElementById('email').value = username;
        document.getElementById('password').value = DEMO_USERS[username].password;
        
        // Optional: Auto-submit the form
        document.getElementById('loginForm').dispatchEvent(new Event('submit'));
    }
}

// Export functions for use in other modules
window.auth = {
    getCurrentUser,
    getUserRole,
    hasPermission,
    requireAuth,
    requirePermission,
    logout,
    showAlert,
    quickLogin
}; 