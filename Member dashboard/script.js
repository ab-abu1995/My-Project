// DOM Elements
const sidebar = document.getElementById('sidebar');
const mobileMenuToggle = document.getElementById('mobileMenuToggle');
const navItems = document.querySelectorAll('.nav-item');
const pageContents = document.querySelectorAll('.page-content');
const pageSubtitle = document.getElementById('pageSubtitle');
const profileToggle = document.getElementById('profileToggle');
const profileDropdown = document.getElementById('profileDropdown');
const notifications = document.querySelector('.notifications');

// Create mobile overlay
const mobileOverlay = document.createElement('div');
mobileOverlay.className = 'mobile-overlay';
document.body.appendChild(mobileOverlay);

// Page data for titles
const pageData = {
    dashboard: {
        subtitle: "Welcome back, Alex! Here's your financial overview."
    },
    savings: {
        subtitle: "Manage your savings accounts and deposits"
    },
    loans: {
        subtitle: "View, apply for, and manage your loans"
    },
    transactions: {
        subtitle: "View your transaction history and details"
    },
    reports: {
        subtitle: "Access and download your financial reports"
    },
    settings: {
        subtitle: "Manage your account preferences and security"
    }
};

// Mobile menu toggle
mobileMenuToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    sidebar.classList.toggle('mobile-open');
    mobileOverlay.classList.toggle('active');
    
    // Change icon
    const icon = this.querySelector('i');
    if (sidebar.classList.contains('mobile-open')) {
        icon.classList.remove('fa-bars');
        icon.classList.add('fa-times');
    } else {
        icon.classList.remove('fa-times');
        icon.classList.add('fa-bars');
    }
});

// Close menu when clicking overlay
mobileOverlay.addEventListener('click', function() {
    sidebar.classList.remove('mobile-open');
    this.classList.remove('active');
    mobileMenuToggle.querySelector('i').classList.remove('fa-times');
    mobileMenuToggle.querySelector('i').classList.add('fa-bars');
});

// Navigation click handler
navItems.forEach(item => {
    item.addEventListener('click', function() {
        // Remove active class from all nav items
        navItems.forEach(nav => nav.classList.remove('active'));
        
        // Add active class to clicked nav item
        this.classList.add('active');
        
        // Get the page to show
        const pageId = this.getAttribute('data-page');
        
        // Hide all page contents
        pageContents.forEach(page => page.classList.remove('active'));
        
        // Show the selected page content
        document.getElementById(`${pageId}-page`).classList.add('active');
        
        // Update page subtitle
        pageSubtitle.textContent = pageData[pageId].subtitle;
        
        // Load external content for savings and loans
        if (pageId === 'savings' || pageId === 'loans' || pageId === 'transactions') {
            loadExternalPage(pageId);
        }
        
        // Close mobile menu
        if (window.innerWidth <= 992) {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
            mobileMenuToggle.querySelector('i').classList.remove('fa-times');
            mobileMenuToggle.querySelector('i').classList.add('fa-bars');
        }
    });
});

// Load external HTML pages
function loadExternalPage(pageName) {
    const pageContainer = document.getElementById(`${pageName}-page`);
    
    // Check if content is already loaded
    if (pageContainer.getAttribute('data-loaded') === 'true') {
        return;
    }
    
    // Show loading message
    pageContainer.innerHTML = `
        <div class="loading-container" style="text-align: center; padding: 50px;">
            <i class="fas fa-spinner fa-spin fa-3x" style="color: var(--primary-color); margin-bottom: 20px;"></i>
            <h3>Loading ${pageName} page...</h3>
            <p>Please wait while we load the content</p>
        </div>
    `;
    
    // Simulate loading external content
    setTimeout(() => {
        let content = '';
        
        switch(pageName) {
            case 'savings':
                content = getSavingsPageContent();
                break;
            case 'loans':
                content = getLoansPageContent();
                break;
            case 'transactions':
                content = getTransactionsPageContent();
                break;
            default:
                content = '<div class="section-header"><h2 class="section-title">Coming Soon</h2></div><p>This page is under development.</p>';
        }
        
        pageContainer.innerHTML = content;
        pageContainer.setAttribute('data-loaded', 'true');
        
        // Initialize any buttons on the loaded page
        initializePageButtons(pageName);
    }, 500);
}

// Function to get savings page content
function getSavingsPageContent() {
    return `
        <div class="section-header">
            <h2 class="section-title">Savings Accounts</h2>
            <button class="view-all" id="addSavingsBtn">+ Create New Account</button>
        </div>
        <p class="section-description">Manage your savings accounts, track your deposits, and monitor interest earnings.</p>
        
        <div class="savings-grid">
            <div class="savings-card">
                <div class="savings-header">
                    <h3 class="savings-type">Emergency Fund</h3>
                    <span class="status-badge completed">Active</span>
                </div>
                <div class="savings-amount">$12,450.75</div>
                <div class="savings-details">
                    <div class="savings-detail">
                        <span class="savings-detail-label">Account Number:</span>
                        <span class="savings-detail-value">SAV-7823-4512</span>
                    </div>
                    <div class="savings-detail">
                        <span class="savings-detail-label">Interest Rate:</span>
                        <span class="savings-detail-value">3.5% APY</span>
                    </div>
                    <div class="savings-detail">
                        <span class="savings-detail-label">Monthly Deposit:</span>
                        <span class="savings-detail-value">$800.00</span>
                    </div>
                </div>
                <div class="loan-actions">
                    <button class="action-btn primary">Make Deposit</button>
                    <button class="action-btn secondary">Withdraw</button>
                </div>
            </div>
            
            <div class="savings-card">
                <div class="savings-header">
                    <h3 class="savings-type">Vacation Fund</h3>
                    <span class="status-badge completed">Active</span>
                </div>
                <div class="savings-amount">$4,820.50</div>
                <div class="savings-details">
                    <div class="savings-detail">
                        <span class="savings-detail-label">Account Number:</span>
                        <span class="savings-detail-value">SAV-1234-5678</span>
                    </div>
                    <div class="savings-detail">
                        <span class="savings-detail-label">Interest Rate:</span>
                        <span class="savings-detail-value">2.8% APY</span>
                    </div>
                    <div class="savings-detail">
                        <span class="savings-detail-label">Monthly Deposit:</span>
                        <span class="savings-detail-value">$300.00</span>
                    </div>
                </div>
                <div class="loan-actions">
                    <button class="action-btn primary">Make Deposit</button>
                    <button class="action-btn secondary">Withdraw</button>
                </div>
            </div>
        </div>
    `;
}

// Function to get loans page content
function getLoansPageContent() {
    return `
        <div class="section-header">
            <h2 class="section-title">Loan Management</h2>
            <button class="view-all" id="applyLoanBtn">Apply for New Loan</button>
        </div>
        <p class="section-description">View and manage your active loans, check repayment schedules, and apply for new loans.</p>
        
        <div class="loan-cards">
            <div class="loan-card">
                <div class="loan-header">
                    <h3 class="loan-type">Home Mortgage</h3>
                    <span class="status-badge completed">Active</span>
                </div>
                <div class="loan-amount">$245,000.00</div>
                <div class="loan-details">
                    <div>
                        <div class="loan-detail-label">Remaining Balance</div>
                        <div class="loan-detail-value">$198,750.00</div>
                    </div>
                    <div>
                        <div class="loan-detail-label">Interest Rate</div>
                        <div class="loan-detail-value">4.25%</div>
                    </div>
                </div>
                <div class="loan-details">
                    <div>
                        <div class="loan-detail-label">Monthly Payment</div>
                        <div class="loan-detail-value">$1,450.00</div>
                    </div>
                    <div>
                        <div class="loan-detail-label">Next Due Date</div>
                        <div class="loan-detail-value">June 5, 2023</div>
                    </div>
                </div>
                <div class="loan-actions">
                    <button class="action-btn primary">Make Payment</button>
                    <button class="action-btn secondary">View Details</button>
                </div>
            </div>
        </div>
    `;
}

// Function to get transactions page content
function getTransactionsPageContent() {
    return `
        <div class="section-header">
            <h2 class="section-title">Transaction History</h2>
            <button class="view-all" id="downloadStatementBtn">Download Statement</button>
        </div>
        <p class="section-description">View all your financial transactions, filter by date, type, or account.</p>
        
        <div class="filters">
            <div class="filter-group">
                <label class="filter-label">Transaction Type</label>
                <select id="typeFilter">
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="loan_payment">Loan Payments</option>
                </select>
            </div>
            
            <div class="filter-group">
                <label class="filter-label">Date Range</label>
                <select id="dateFilter">
                    <option value="30days">Last 30 Days</option>
                    <option value="90days">Last 90 Days</option>
                    <option value="2023">Year 2023</option>
                </select>
            </div>
        </div>
        
        <div class="recent-activity">
            <table>
                <thead>
                    <tr>
                        <th>Date</th>
                        <th>Description</th>
                        <th>Account</th>
                        <th>Amount</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>May 15, 2023</td>
                        <td>Auto Loan Payment</td>
                        <td>Loan Account</td>
                        <td>-$450.00</td>
                        <td><span class="status-badge completed">Completed</span></td>
                    </tr>
                    <tr>
                        <td>May 14, 2023</td>
                        <td>Salary Deposit</td>
                        <td>Checking Account</td>
                        <td>+$3,850.00</td>
                        <td><span class="status-badge completed">Completed</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
}

// Initialize page buttons
function initializePageButtons(pageName) {
    if (pageName === 'savings') {
        document.getElementById('addSavingsBtn')?.addEventListener('click', function() {
            alert('This would open a form to create a new savings account.');
        });
    }
    
    if (pageName === 'loans') {
        document.getElementById('applyLoanBtn')?.addEventListener('click', function() {
            alert('This would open a loan application form.');
        });
    }
    
    if (pageName === 'transactions') {
        document.getElementById('downloadStatementBtn')?.addEventListener('click', function() {
            alert('PDF statement would be downloaded.');
        });
        
        document.getElementById('typeFilter')?.addEventListener('change', function() {
            console.log('Filter by type:', this.value);
        });
        
        document.getElementById('dateFilter')?.addEventListener('change', function() {
            console.log('Filter by date:', this.value);
        });
    }
}

// Profile dropdown toggle
profileToggle.addEventListener('click', function(e) {
    e.stopPropagation();
    profileDropdown.classList.toggle('active');
});

// Close profile dropdown when clicking outside
document.addEventListener('click', function(e) {
    if (!profileToggle.contains(e.target) && !profileDropdown.contains(e.target)) {
        profileDropdown.classList.remove('active');
    }
});

// Handle edit profile button
document.getElementById('editProfileBtn').addEventListener('click', function() {
    alert('Edit profile form would open here.');
    profileDropdown.classList.remove('active');
});

// Handle logout button
document.getElementById('logoutBtn').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        alert('You have been logged out.');
        // In real app: window.location.href = 'login.html';
    }
});

// Handle notification click
notifications.addEventListener('click', function() {
    alert('You have 3 unread notifications.');
});

// Handle "View All" buttons
document.querySelectorAll('.view-all').forEach(button => {
    button.addEventListener('click', function(e) {
        const page = this.getAttribute('data-page');
        if (page) {
            document.querySelector(`.nav-item[data-page="${page}"]`).click();
        }
    });
});

// Handle help button
document.getElementById('helpBtn').addEventListener('click', function() {
    alert('Help & Support: Contact us at support@cooperativesystem.com');
});

// Close mobile menu when clicking outside
document.addEventListener('click', function(e) {
    if (window.innerWidth <= 992) {
        if (!sidebar.contains(e.target) && 
            !mobileMenuToggle.contains(e.target) && 
            sidebar.classList.contains('mobile-open')) {
            sidebar.classList.remove('mobile-open');
            mobileOverlay.classList.remove('active');
            mobileMenuToggle.querySelector('i').classList.remove('fa-times');
            mobileMenuToggle.querySelector('i').classList.add('fa-bars');
        }
    }
});

// Check screen size on load and resize
function checkScreenSize() {
    if (window.innerWidth <= 992) {
        mobileMenuToggle.style.display = 'flex';
    } else {
        mobileMenuToggle.style.display = 'flex';
        sidebar.classList.remove('mobile-open');
        mobileOverlay.classList.remove('active');
        mobileMenuToggle.querySelector('i').classList.remove('fa-times');
        mobileMenuToggle.querySelector('i').classList.add('fa-bars');
    }
}

// Initialize
window.addEventListener('load', checkScreenSize);
window.addEventListener('resize', checkScreenSize);