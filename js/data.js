// Data Management System for Bank Loan Management

// Mock data storage keys
const STORAGE_KEYS = {
    CUSTOMERS: 'blms_customers',
    LOANS: 'blms_loans',
    APPLICATIONS: 'blms_applications',
    SETTINGS: 'blms_settings'
};

// Default loan products
const DEFAULT_LOAN_PRODUCTS = [
    {
        id: 'LP001',
        name: 'Personal Loan',
        type: 'personal',
        minAmount: 10000,
        maxAmount: 500000,
        interestRate: 12.5,
        maxTenure: 60,
        processingFee: 2.5,
        description: 'Quick personal loans for various needs',
        eligibility: {
            minAge: 21,
            maxAge: 65,
            minIncome: 25000,
            minCreditScore: 650
        },
        documents: ['Identity Proof', 'Address Proof', 'Income Proof', 'Bank Statements'],
        isActive: true
    },
    {
        id: 'LP002',
        name: 'Home Loan',
        type: 'home',
        minAmount: 500000,
        maxAmount: 10000000,
        interestRate: 8.75,
        maxTenure: 300,
        processingFee: 0.5,
        description: 'Affordable home loans with competitive rates',
        eligibility: {
            minAge: 21,
            maxAge: 70,
            minIncome: 50000,
            minCreditScore: 700
        },
        documents: ['Identity Proof', 'Address Proof', 'Income Proof', 'Property Documents', 'Bank Statements'],
        isActive: true
    },
    {
        id: 'LP003',
        name: 'Car Loan',
        type: 'vehicle',
        minAmount: 100000,
        maxAmount: 2000000,
        interestRate: 9.5,
        maxTenure: 84,
        processingFee: 1.5,
        description: 'Easy car loans with quick approval',
        eligibility: {
            minAge: 21,
            maxAge: 65,
            minIncome: 30000,
            minCreditScore: 650
        },
        documents: ['Identity Proof', 'Address Proof', 'Income Proof', 'Vehicle Documents'],
        isActive: true
    },
    {
        id: 'LP004',
        name: 'Business Loan',
        type: 'business',
        minAmount: 250000,
        maxAmount: 5000000,
        interestRate: 11.0,
        maxTenure: 120,
        processingFee: 2.0,
        description: 'Flexible business loans for growth',
        eligibility: {
            minAge: 25,
            maxAge: 65,
            minIncome: 100000,
            minCreditScore: 700
        },
        documents: ['Identity Proof', 'Business Registration', 'Financial Statements', 'Bank Statements'],
        isActive: true
    },
    {
        id: 'LP005',
        name: 'Education Loan',
        type: 'education',
        minAmount: 50000,
        maxAmount: 1500000,
        interestRate: 10.5,
        maxTenure: 180,
        processingFee: 1.0,
        description: 'Education loans for bright futures',
        eligibility: {
            minAge: 18,
            maxAge: 35,
            minIncome: 20000,
            minCreditScore: 600
        },
        documents: ['Identity Proof', 'Admission Letter', 'Fee Structure', 'Co-applicant Documents'],
        isActive: true
    }
];

// Default customers data
const DEFAULT_CUSTOMERS = [
    {
        id: 'CUST001',
        firstName: 'Rajesh',
        lastName: 'Kumar',
        email: 'rajesh.kumar@email.com',
        phone: '+91 9876543210',
        dateOfBirth: '1985-03-15',
        address: {
            street: '123 MG Road',
            city: 'Bangalore',
            state: 'Karnataka',
            pincode: '560001',
            country: 'India'
        },
        employment: {
            type: 'Salaried',
            company: 'Tech Solutions Pvt Ltd',
            designation: 'Senior Software Engineer',
            monthlyIncome: 85000,
            workExperience: 8
        },
        financial: {
            creditScore: 750,
            bankAccount: '1234567890',
            ifscCode: 'HDFC0001234',
            panNumber: 'ABCDE1234F'
        },
        kyc: {
            status: 'Verified',
            documents: ['Aadhaar Card', 'PAN Card', 'Salary Slip']
        },
        createdAt: '2024-01-15T10:30:00Z',
        isActive: true
    },
    {
        id: 'CUST002',
        firstName: 'Priya',
        lastName: 'Sharma',
        email: 'priya.sharma@email.com',
        phone: '+91 9876543211',
        dateOfBirth: '1990-07-22',
        address: {
            street: '456 Park Street',
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001',
            country: 'India'
        },
        employment: {
            type: 'Business',
            company: 'Sharma Enterprises',
            designation: 'Owner',
            monthlyIncome: 120000,
            workExperience: 5
        },
        financial: {
            creditScore: 780,
            bankAccount: '0987654321',
            ifscCode: 'ICIC0001234',
            panNumber: 'FGHIJ5678K'
        },
        kyc: {
            status: 'Verified',
            documents: ['Aadhaar Card', 'PAN Card', 'Business Registration']
        },
        createdAt: '2024-02-10T14:20:00Z',
        isActive: true
    },
    {
        id: 'CUST003',
        firstName: 'Amit',
        lastName: 'Patel',
        email: 'amit.patel@email.com',
        phone: '+91 9876543212',
        dateOfBirth: '1988-11-05',
        address: {
            street: '789 Gandhi Nagar',
            city: 'Ahmedabad',
            state: 'Gujarat',
            pincode: '380001',
            country: 'India'
        },
        employment: {
            type: 'Salaried',
            company: 'Gujarat Industries Ltd',
            designation: 'Manager',
            monthlyIncome: 65000,
            workExperience: 6
        },
        financial: {
            creditScore: 720,
            bankAccount: '1122334455',
            ifscCode: 'SBIN0001234',
            panNumber: 'KLMNO9012P'
        },
        kyc: {
            status: 'Pending',
            documents: ['Aadhaar Card', 'PAN Card']
        },
        createdAt: '2024-03-05T09:15:00Z',
        isActive: true
    }
];

// Default loan applications
const DEFAULT_APPLICATIONS = [
    {
        id: 'APP001',
        customerId: 'CUST001',
        loanProductId: 'LP001',
        amount: 300000,
        tenure: 36,
        purpose: 'Home renovation',
        status: 'approved',
        applicationDate: '2024-03-01T10:00:00Z',
        approvalDate: '2024-03-05T14:30:00Z',
        emi: 10432,
        interestRate: 12.5,
        documents: [
            { name: 'Identity Proof', status: 'verified' },
            { name: 'Income Proof', status: 'verified' },
            { name: 'Bank Statements', status: 'verified' }
        ],
        workflow: [
            { step: 'Application Submitted', date: '2024-03-01T10:00:00Z', status: 'completed' },
            { step: 'Document Verification', date: '2024-03-02T11:00:00Z', status: 'completed' },
            { step: 'Credit Assessment', date: '2024-03-03T12:00:00Z', status: 'completed' },
            { step: 'Manager Approval', date: '2024-03-05T14:30:00Z', status: 'completed' },
            { step: 'Disbursement', date: null, status: 'pending' }
        ],
        notes: 'Good credit history. Approved with standard terms.'
    },
    {
        id: 'APP002',
        customerId: 'CUST002',
        loanProductId: 'LP002',
        amount: 2500000,
        tenure: 240,
        purpose: 'Property purchase',
        status: 'under_review',
        applicationDate: '2024-03-10T11:30:00Z',
        approvalDate: null,
        emi: 23850,
        interestRate: 8.75,
        documents: [
            { name: 'Identity Proof', status: 'verified' },
            { name: 'Income Proof', status: 'verified' },
            { name: 'Property Documents', status: 'pending' },
            { name: 'Bank Statements', status: 'verified' }
        ],
        workflow: [
            { step: 'Application Submitted', date: '2024-03-10T11:30:00Z', status: 'completed' },
            { step: 'Document Verification', date: '2024-03-11T10:00:00Z', status: 'in_progress' },
            { step: 'Credit Assessment', date: null, status: 'pending' },
            { step: 'Manager Approval', date: null, status: 'pending' },
            { step: 'Disbursement', date: null, status: 'pending' }
        ],
        notes: 'Waiting for property documents.'
    },
    {
        id: 'APP003',
        customerId: 'CUST003',
        loanProductId: 'LP003',
        amount: 800000,
        tenure: 60,
        purpose: 'Vehicle purchase',
        status: 'rejected',
        applicationDate: '2024-02-20T15:45:00Z',
        approvalDate: null,
        emi: 17245,
        interestRate: 9.5,
        documents: [
            { name: 'Identity Proof', status: 'verified' },
            { name: 'Income Proof', status: 'insufficient' },
            { name: 'Vehicle Documents', status: 'verified' }
        ],
        workflow: [
            { step: 'Application Submitted', date: '2024-02-20T15:45:00Z', status: 'completed' },
            { step: 'Document Verification', date: '2024-02-21T10:00:00Z', status: 'completed' },
            { step: 'Credit Assessment', date: '2024-02-22T12:00:00Z', status: 'completed' },
            { step: 'Manager Approval', date: '2024-02-23T09:00:00Z', status: 'rejected' }
        ],
        notes: 'Income documents insufficient. DTI ratio too high.'
    }
];

// Data management functions
class DataManager {
    constructor() {
        this.initializeData();
    }

    initializeData() {
        // Initialize with default data if not exists
        if (!this.getLoans().length) {
            this.setLoans(DEFAULT_LOAN_PRODUCTS);
        }
        if (!this.getCustomers().length) {
            this.setCustomers(DEFAULT_CUSTOMERS);
        }
        if (!this.getApplications().length) {
            this.setApplications(DEFAULT_APPLICATIONS);
        }
    }

    // Generic storage methods
    getData(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error(`Error retrieving data for key ${key}:`, error);
            return [];
        }
    }

    setData(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`Error storing data for key ${key}:`, error);
            return false;
        }
    }

    // Customer management
    getCustomers() {
        return this.getData(STORAGE_KEYS.CUSTOMERS);
    }

    setCustomers(customers) {
        return this.setData(STORAGE_KEYS.CUSTOMERS, customers);
    }

    getCustomerById(id) {
        const customers = this.getCustomers();
        return customers.find(customer => customer.id === id);
    }

    addCustomer(customer) {
        const customers = this.getCustomers();
        customer.id = this.generateId('CUST');
        customer.createdAt = new Date().toISOString();
        customer.isActive = true;
        customers.push(customer);
        return this.setCustomers(customers);
    }

    updateCustomer(id, updates) {
        const customers = this.getCustomers();
        const index = customers.findIndex(customer => customer.id === id);
        if (index !== -1) {
            customers[index] = { ...customers[index], ...updates };
            return this.setCustomers(customers);
        }
        return false;
    }

    deleteCustomer(id) {
        const customers = this.getCustomers();
        const filteredCustomers = customers.filter(customer => customer.id !== id);
        return this.setCustomers(filteredCustomers);
    }

    // Loan product management
    getLoans() {
        return this.getData(STORAGE_KEYS.LOANS);
    }

    setLoans(loans) {
        return this.setData(STORAGE_KEYS.LOANS, loans);
    }

    getLoanById(id) {
        const loans = this.getLoans();
        return loans.find(loan => loan.id === id);
    }

    addLoan(loan) {
        const loans = this.getLoans();
        loan.id = this.generateId('LP');
        loan.isActive = true;
        loans.push(loan);
        return this.setLoans(loans);
    }

    updateLoan(id, updates) {
        const loans = this.getLoans();
        const index = loans.findIndex(loan => loan.id === id);
        if (index !== -1) {
            loans[index] = { ...loans[index], ...updates };
            return this.setLoans(loans);
        }
        return false;
    }

    deleteLoan(id) {
        const loans = this.getLoans();
        const filteredLoans = loans.filter(loan => loan.id !== id);
        return this.setLoans(filteredLoans);
    }

    // Application management
    getApplications() {
        return this.getData(STORAGE_KEYS.APPLICATIONS);
    }

    setApplications(applications) {
        return this.setData(STORAGE_KEYS.APPLICATIONS, applications);
    }

    getApplicationById(id) {
        const applications = this.getApplications();
        return applications.find(app => app.id === id);
    }

    addApplication(application) {
        const applications = this.getApplications();
        application.id = this.generateId('APP');
        application.applicationDate = new Date().toISOString();
        application.status = 'submitted';
        applications.push(application);
        return this.setApplications(applications);
    }

    updateApplication(id, updates) {
        const applications = this.getApplications();
        const index = applications.findIndex(app => app.id === id);
        if (index !== -1) {
            applications[index] = { ...applications[index], ...updates };
            return this.setApplications(applications);
        }
        return false;
    }

    deleteApplication(id) {
        const applications = this.getApplications();
        const filteredApplications = applications.filter(app => app.id !== id);
        return this.setApplications(filteredApplications);
    }

    // Utility methods
    generateId(prefix) {
        const timestamp = Date.now();
        const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
        return `${prefix}${timestamp.toString().slice(-6)}${random}`;
    }

    // Statistics and analytics
    getStatistics() {
        const customers = this.getCustomers();
        const loans = this.getLoans();
        const applications = this.getApplications();

        return {
            totalCustomers: customers.length,
            activeCustomers: customers.filter(c => c.isActive).length,
            totalLoanProducts: loans.length,
            activeLoanProducts: loans.filter(l => l.isActive).length,
            totalApplications: applications.length,
            pendingApplications: applications.filter(a => a.status === 'submitted' || a.status === 'under_review').length,
            approvedApplications: applications.filter(a => a.status === 'approved').length,
            rejectedApplications: applications.filter(a => a.status === 'rejected').length,
            totalLoanAmount: applications
                .filter(a => a.status === 'approved')
                .reduce((sum, a) => sum + a.amount, 0)
        };
    }

    // Search and filter methods
    searchCustomers(query) {
        const customers = this.getCustomers();
        return customers.filter(customer => 
            customer.firstName.toLowerCase().includes(query.toLowerCase()) ||
            customer.lastName.toLowerCase().includes(query.toLowerCase()) ||
            customer.email.toLowerCase().includes(query.toLowerCase()) ||
            customer.phone.includes(query)
        );
    }

    filterApplications(filters) {
        let applications = this.getApplications();
        
        if (filters.status) {
            applications = applications.filter(app => app.status === filters.status);
        }
        
        if (filters.loanType) {
            applications = applications.filter(app => {
                const loan = this.getLoanById(app.loanProductId);
                return loan && loan.type === filters.loanType;
            });
        }
        
        if (filters.dateFrom) {
            applications = applications.filter(app => 
                new Date(app.applicationDate) >= new Date(filters.dateFrom)
            );
        }
        
        if (filters.dateTo) {
            applications = applications.filter(app => 
                new Date(app.applicationDate) <= new Date(filters.dateTo)
            );
        }
        
        return applications;
    }
}

// Create global data manager instance
const dataManager = new DataManager();

// Export for use in other modules
window.dataManager = dataManager; 