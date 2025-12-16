// Member Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is a member
    if (!sessionManager.isLoggedIn() || !sessionManager.isMember()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize the dashboard
    initMemberDashboard();
});

function initMemberDashboard() {
    const user = sessionManager.getCurrentUser();
    
    // Set up UI
    setupUserInfo(user);
    setCurrentDate();
    setupNavigation();
    setupNotifications();
    setupModals();
    
    // Load initial data
    loadOverviewData();
    
    // Setup event listeners
    setupEventListeners();
}

function setupUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv && user) {
        userInfoDiv.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user-circle"></i>
                <div class="user-details">
                    <h3>${user.name}</h3>
                    <p>${user.id}</p>
                    <p class="user-type">Member</p>
                </div>
            </div>
            <div class="user-stats">
                <div class="stat">
                    <span>Member Since</span>
                    <strong>${formatDate(user.joinDate)}</strong>
                </div>
            </div>
        `;
    }
    
    // Set dashboard title
    const title = document.getElementById('dashboardTitle');
    if (title && user) {
        title.textContent = `Welcome, ${user.name.split(' ')[0]}`;
    }
}

function setCurrentDate() {
    const dateElement = document.getElementById('currentDate');
    if (dateElement) {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        dateElement.textContent = now.toLocaleDateString('en-US', options);
    }
}

function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-menu li');
    const sections = document.querySelectorAll('.dashboard-section');
    
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get section to show
            const sectionName = this.getAttribute('data-section');
            
            // Update active nav item
            navItems.forEach(nav => nav.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding section
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === `${sectionName}Section`) {
                    section.classList.add('active');
                    
                    // Load section data
                    switch(sectionName) {
                        case 'overview':
                            loadOverviewData();
                            break;
                        case 'savings':
                            loadSavingsData();
                            break;
                        case 'loans':
                            loadLoansData();
                            break;
                        case 'transactions':
                            loadTransactionsData();
                            break;
                        case 'profile':
                            loadProfileData();
                            break;
                        case 'statements':
                            loadStatementsData();
                            break;
                    }
                }
            });
            
            // Update dashboard title
            updateSectionTitle(sectionName);
            
            // Close sidebar on mobile
            if (window.innerWidth < 992) {
                document.getElementById('sidebar').classList.remove('active');
            }
        });
    });
    
    // Handle view all links
    document.querySelectorAll('.view-all, .btn-small[data-section]').forEach(link => {
        link.addEventListener('click', function(e) {
            if (this.hasAttribute('data-section')) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                document.querySelector(`[data-section="${section}"]`).click();
            }
        });
    });
}

function updateSectionTitle(sectionName) {
    const titles = {
        'overview': 'Financial Overview',
        'savings': 'My Savings',
        'loans': 'My Loans',
        'transactions': 'Transaction History',
        'profile': 'My Profile',
        'statements': 'Account Statements'
    };
    
    const title = document.getElementById('dashboardTitle');
    if (title && titles[sectionName]) {
        title.textContent = titles[sectionName];
    }
}

function setupNotifications() {
    const user = sessionManager.getCurrentUser();
    const notificationBell = document.getElementById('notificationBell');
    const notificationCount = document.getElementById('notificationCount');
    
    if (!user) return;
    
    // Calculate notifications
    let count = 0;
    const notifications = [];
    
    // Check for loan payment due (example)
    if (user.loans && user.loans.length > 0) {
        user.loans.forEach(loan => {
            if (loan.status === 'approved' && loan.remainingPayments > 0) {
                count++;
                notifications.push({
                    type: 'warning',
                    title: 'Loan Payment Due',
                    message: `Your ${loan.type} payment is due soon.`
                });
            }
        });
    }
    
    // Check for new messages (example)
    if (user.savings && user.savings < 1000) {
        count++;
        notifications.push({
            type: 'info',
            title: 'Low Savings Alert',
            message: 'Consider increasing your monthly savings.'
        });
    }
    
    // Update notification count
    if (notificationCount) {
        notificationCount.textContent = count;
        notificationCount.style.display = count > 0 ? 'flex' : 'none';
    }
    
    // Setup notification click
    if (notificationBell) {
        notificationBell.addEventListener('click', function() {
            showNotificationsModal(notifications);
        });
    }
}

function showNotificationsModal(notifications) {
    const modal = document.getElementById('actionModal');
    if (!modal) return;
    
    let notificationsHTML = '';
    if (notifications.length > 0) {
        notifications.forEach(notif => {
            const icon = notif.type === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle';
            const color = notif.type === 'warning' ? 'var(--warning)' : 'var(--primary)';
            notificationsHTML += `
                <div class="notification-item">
                    <div class="notification-icon" style="color: ${color};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                    </div>
                </div>
            `;
        });
    } else {
        notificationsHTML = '<p class="no-notifications">No new notifications.</p>';
    }
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Notifications</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="notifications-list">
                ${notificationsHTML}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Clear notification count
    const notificationCount = document.getElementById('notificationCount');
    if (notificationCount) {
        notificationCount.style.display = 'none';
    }
}

function setupModals() {
    const quickActionBtn = document.getElementById('quickActionBtn');
    const quickActionModal = document.getElementById('quickActionModal');
    
    // Quick Action Modal
    if (quickActionBtn && quickActionModal) {
        quickActionBtn.addEventListener('click', function() {
            quickActionModal.classList.add('active');
        });
        
        setupModalClose(quickActionModal);
        
        // Setup action buttons in quick action modal
        const actionBtns = quickActionModal.querySelectorAll('.action-btn');
        actionBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const action = this.getAttribute('data-action');
                handleQuickAction(action);
                quickActionModal.classList.remove('active');
            });
        });
    }
    
    // General modal setup
    setupModalClose(document.getElementById('actionModal'));
}

function setupModalClose(modal) {
    if (!modal) return;
    
    const closeBtns = modal.querySelectorAll('.close-modal');
    closeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            modal.classList.remove('active');
        });
    });
    
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.classList.remove('active');
        }
    });
}

function handleQuickAction(action) {
    const user = sessionManager.getCurrentUser();
    const modal = document.getElementById('actionModal');
    
    if (!modal) return;
    
    switch(action) {
        case 'deposit':
            showDepositModal(user);
            break;
        case 'withdraw':
            showWithdrawModal(user);
            break;
        case 'applyLoan':
            showApplyLoanModal(user);
            break;
        case 'statement':
            downloadStatement(user);
            break;
    }
}

function showDepositModal(user) {
    const modal = document.getElementById('actionModal');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Make a Deposit</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="depositForm">
                <div class="form-group">
                    <label for="depositAmount">Amount ($)</label>
                    <input type="number" id="depositAmount" min="1" step="0.01" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="depositMethod">Payment Method</label>
                    <select id="depositMethod" class="form-control" required>
                        <option value="">Select method</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="card">Credit/Debit Card</option>
                        <option value="mobile">Mobile Money</option>
                        <option value="cash">Cash Deposit</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="depositNotes">Notes (Optional)</label>
                    <textarea id="depositNotes" class="form-control" rows="3" placeholder="Add any notes about this deposit"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Deposit</button>
                </div>
            </form>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Handle form submission
    const form = document.getElementById('depositForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('depositAmount').value);
            const method = document.getElementById('depositMethod').value;
            const notes = document.getElementById('depositNotes').value;
            
            // Simulate deposit
            simulateDeposit(user.id, amount, method, notes);
            modal.classList.remove('active');
        });
    }
}

function showWithdrawModal(user) {
    const modal = document.getElementById('actionModal');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Withdraw Funds</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="withdraw-info">
                <p>Available Balance: <strong>$${user.savings || 0}</strong></p>
            </div>
            <form id="withdrawForm">
                <div class="form-group">
                    <label for="withdrawAmount">Amount ($)</label>
                    <input type="number" id="withdrawAmount" min="1" max="${user.savings || 0}" step="0.01" required class="form-control">
                    <small class="form-text">Maximum: $${user.savings || 0}</small>
                </div>
                <div class="form-group">
                    <label for="withdrawMethod">Withdrawal Method</label>
                    <select id="withdrawMethod" class="form-control" required>
                        <option value="">Select method</option>
                        <option value="bank">Bank Transfer</option>
                        <option value="mobile">Mobile Money</option>
                        <option value="cash">Cash Pickup</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="withdrawAccount">Account Details</label>
                    <input type="text" id="withdrawAccount" class="form-control" placeholder="Enter account number or phone number" required>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Request Withdrawal</button>
                </div>
            </form>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Handle form submission
    const form = document.getElementById('withdrawForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const amount = parseFloat(document.getElementById('withdrawAmount').value);
            const method = document.getElementById('withdrawMethod').value;
            const account = document.getElementById('withdrawAccount').value;
            
            // Validate amount
            if (amount > (user.savings || 0)) {
                showToast('Insufficient funds!', 'error');
                return;
            }
            
            // Simulate withdrawal
            simulateWithdrawal(user.id, amount, method, account);
            modal.classList.remove('active');
        });
    }
}

function showApplyLoanModal(user) {
    const modal = document.getElementById('actionModal');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Apply for Loan</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="loan-info">
                <p>Maximum eligible amount based on your savings: <strong>$${((user.savings || 0) * 2).toFixed(2)}</strong></p>
            </div>
            <form id="loanForm">
                <div class="form-group">
                    <label for="loanType">Loan Type</label>
                    <select id="loanType" class="form-control" required>
                        <option value="">Select type</option>
                        <option value="emergency">Emergency Loan</option>
                        <option value="education">Education Loan</option>
                        <option value="business">Business Loan</option>
                        <option value="home">Home Improvement Loan</option>
                        <option value="vehicle">Vehicle Loan</option>
                    </select>
                </div>
                <div class="form-group">
                    <label for="loanAmount">Amount ($)</label>
                    <input type="number" id="loanAmount" min="100" max="${((user.savings || 0) * 2)}" step="100" required class="form-control">
                </div>
                <div class="form-group">
                    <label for="loanPurpose">Purpose of Loan</label>
                    <textarea id="loanPurpose" class="form-control" rows="3" placeholder="Describe what you need the loan for" required></textarea>
                </div>
                <div class="form-group">
                    <label for="repaymentPeriod">Repayment Period (Months)</label>
                    <select id="repaymentPeriod" class="form-control" required>
                        <option value="6">6 Months</option>
                        <option value="12" selected>12 Months</option>
                        <option value="24">24 Months</option>
                        <option value="36">36 Months</option>
                    </select>
                </div>
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Submit Application</button>
                </div>
            </form>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Handle form submission
    const form = document.getElementById('loanForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            const type = document.getElementById('loanType').value;
            const amount = parseFloat(document.getElementById('loanAmount').value);
            const purpose = document.getElementById('loanPurpose').value;
            const period = parseInt(document.getElementById('repaymentPeriod').value);
            
            // Simulate loan application
            simulateLoanApplication(user.id, type, amount, purpose, period);
            modal.classList.remove('active');
        });
    }
}

function downloadStatement(user) {
    showToast('Statement download started. Check your downloads folder.', 'success');
    
    // In a real app, this would generate and download a PDF
    setTimeout(() => {
        showToast('Statement downloaded successfully!', 'success');
    }, 1500);
}

function simulateDeposit(userId, amount, method, notes) {
    // Get current user
    const users = sessionManager.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    // Update savings
    users[userIndex].savings = (users[userIndex].savings || 0) + amount;
    
    // Add transaction
    if (!users[userIndex].transactions) {
        users[userIndex].transactions = [];
    }
    
    users[userIndex].transactions.unshift({
        id: 'TX-' + Date.now(),
        type: 'deposit',
        amount: amount,
        method: method,
        notes: notes,
        date: new Date().toISOString(),
        status: 'completed'
    });
    
    // Save to localStorage
    localStorage.setItem('coop_users', JSON.stringify(users));
    
    // Update session
    sessionManager.updateUser(userId, {
        savings: users[userIndex].savings,
        transactions: users[userIndex].transactions
    });
    
    // Show success message
    showToast(`Deposit of $${amount} submitted successfully!`, 'success');
    
    // Refresh data
    loadOverviewData();
}

function simulateWithdrawal(userId, amount, method, account) {
    // Get current user
    const users = sessionManager.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    // Check balance
    if (amount > (users[userIndex].savings || 0)) {
        showToast('Insufficient funds!', 'error');
        return;
    }
    
    // Update savings
    users[userIndex].savings = (users[userIndex].savings || 0) - amount;
    
    // Add transaction
    if (!users[userIndex].transactions) {
        users[userIndex].transactions = [];
    }
    
    users[userIndex].transactions.unshift({
        id: 'TX-' + Date.now(),
        type: 'withdrawal',
        amount: amount,
        method: method,
        account: account,
        date: new Date().toISOString(),
        status: 'pending' // Withdrawals need approval
    });
    
    // Save to localStorage
    localStorage.setItem('coop_users', JSON.stringify(users));
    
    // Update session
    sessionManager.updateUser(userId, {
        savings: users[userIndex].savings,
        transactions: users[userIndex].transactions
    });
    
    // Show success message
    showToast(`Withdrawal request of $${amount} submitted for approval!`, 'success');
    
    // Refresh data
    loadOverviewData();
}

function simulateLoanApplication(userId, type, amount, purpose, period) {
    // Get current user
    const users = sessionManager.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) return;
    
    // Add loan application
    if (!users[userIndex].loans) {
        users[userIndex].loans = [];
    }
    
    users[userIndex].loans.push({
        id: 'LN-' + Date.now(),
        type: type,
        amount: amount,
        purpose: purpose,
        period: period,
        appliedDate: new Date().toISOString(),
        status: 'pending',
        remainingPayments: period
    });
    
    // Save to localStorage
    localStorage.setItem('coop_users', JSON.stringify(users));
    
    // Update session
    sessionManager.updateUser(userId, {
        loans: users[userIndex].loans
    });
    
    // Show success message
    showToast(`Loan application for $${amount} submitted successfully!`, 'success');
    
    // Refresh data
    loadOverviewData();
}

function loadOverviewData() {
    const user = sessionManager.getCurrentUser();
    if (!user) return;
    
    // Update stats
    updateOverviewStats(user);
    
    // Update recent transactions
    updateRecentTransactions(user);
    
    // Update active loans
    updateActiveLoans(user);
    
    // Update savings progress
    updateSavingsProgress(user);
}

function updateOverviewStats(user) {
    const statsGrid = document.getElementById('overviewStats');
    if (!statsGrid) return;
    
    const totalSavings = user.savings || 0;
    const totalLoans = user.loans ? user.loans.filter(l => l.status === 'approved').reduce((sum, loan) => sum + loan.amount, 0) : 0;
    const pendingLoans = user.loans ? user.loans.filter(l => l.status === 'pending').length : 0;
    const interestEarned = totalSavings * 0.05; // 5% annual interest example
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(16, 185, 129, 0.1); color: var(--secondary);">
                <i class="fas fa-piggy-bank"></i>
            </div>
            <div class="stat-info">
                <h3>Total Savings</h3>
                <p class="stat-amount">$${totalSavings.toFixed(2)}</p>
                <p class="stat-change positive">
                    <i class="fas fa-arrow-up"></i> 5% interest earned
                </p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.1); color: var(--danger);">
                <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div class="stat-info">
                <h3>Active Loans</h3>
                <p class="stat-amount">$${totalLoans.toFixed(2)}</p>
                <p class="stat-change ${totalLoans > 0 ? 'negative' : 'positive'}">
                    <i class="fas fa-${totalLoans > 0 ? 'arrow-down' : 'check'}"></i>
                    ${totalLoans > 0 ? 'Loan balance' : 'No active loans'}
                </p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(245, 158, 11, 0.1); color: var(--warning);">
                <i class="fas fa-coins"></i>
            </div>
            <div class="stat-info">
                <h3>Interest Earned</h3>
                <p class="stat-amount">$${interestEarned.toFixed(2)}</p>
                <p class="stat-change positive">
                    <i class="fas fa-arrow-up"></i> This year
                </p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(37, 99, 235, 0.1); color: var(--primary);">
                <i class="fas fa-file-contract"></i>
            </div>
            <div class="stat-info">
                <h3>Pending Applications</h3>
                <p class="stat-amount">${pendingLoans}</p>
                <p class="stat-change ${pendingLoans > 0 ? 'negative' : 'positive'}">
                    <i class="fas fa-${pendingLoans > 0 ? 'clock' : 'check'}"></i>
                    ${pendingLoans > 0 ? 'Under review' : 'No pending'}
                </p>
            </div>
        </div>
    `;
}

function updateRecentTransactions(user) {
    const transactionsList = document.getElementById('recentTransactions');
    if (!transactionsList) return;
    
    const transactions = user.transactions || [];
    const recentTransactions = transactions.slice(0, 5);
    
    if (recentTransactions.length === 0) {
        transactionsList.innerHTML = '<p class="no-data">No transactions yet.</p>';
        return;
    }
    
    let transactionsHTML = '';
    recentTransactions.forEach(transaction => {
        const isDeposit = transaction.type === 'deposit';
        const icon = isDeposit ? 'fa-arrow-down' : 'fa-arrow-up';
        const colorClass = isDeposit ? 'positive' : 'negative';
        const amountSign = isDeposit ? '+' : '-';
        
        transactionsHTML += `
            <div class="transaction-item">
                <div class="transaction-icon" style="background-color: ${isDeposit ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)'}; color: ${isDeposit ? 'var(--secondary)' : 'var(--danger)'};">
                    <i class="fas ${icon}"></i>
                </div>
                <div class="transaction-details">
                    <h4>${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}</h4>
                    <p>${formatDate(transaction.date)} • ${transaction.method}</p>
                </div>
                <div class="transaction-amount ${colorClass}">
                    ${amountSign}$${transaction.amount.toFixed(2)}
                </div>
            </div>
        `;
    });
    
    transactionsList.innerHTML = transactionsHTML;
}

function updateActiveLoans(user) {
    const loansDiv = document.getElementById('activeLoans');
    if (!loansDiv) return;
    
    const activeLoans = user.loans ? user.loans.filter(l => l.status === 'approved') : [];
    
    if (activeLoans.length === 0) {
        loansDiv.innerHTML = '<p class="no-data">No active loans.</p>';
        return;
    }
    
    let loansHTML = '';
    activeLoans.slice(0, 3).forEach(loan => {
        const paid = loan.period - loan.remainingPayments;
        const progress = (paid / loan.period) * 100;
        
        loansHTML += `
            <div class="loan-item">
                <div class="loan-info">
                    <h4>${loan.type}</h4>
                    <p>$${loan.amount.toFixed(2)} • ${loan.period} months</p>
                </div>
                <div class="loan-progress">
                    <div class="progress-bar" style="height: 5px;">
                        <div class="progress-fill" style="width: ${progress}%;"></div>
                    </div>
                    <p class="progress-text">${paid}/${loan.period} payments made</p>
                </div>
            </div>
        `;
    });
    
    loansDiv.innerHTML = loansHTML;
}

function updateSavingsProgress(user) {
    const currentSavings = user.savings || 0;
    const target = 30000; // Example target
    
    document.getElementById('currentSavings').textContent = `$${currentSavings.toFixed(2)}`;
    document.getElementById('savingsTarget').textContent = `Target: $${target.toFixed(2)}`;
    
    const percentage = Math.min((currentSavings / target) * 100, 100);
    document.getElementById('savingsProgress').style.width = `${percentage}%`;
    document.getElementById('savingsPercentage').textContent = `${Math.round(percentage)}%`;
}

function loadSavingsData() {
    const user = sessionManager.getCurrentUser();
    const contentDiv = document.getElementById('savingsContent');
    
    if (!contentDiv || !user) return;
    
    const savings = user.savings || 0;
    const transactions = user.transactions || [];
    const savingsTransactions = transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal');
    
    contentDiv.innerHTML = `
        <div class="savings-summary">
            <div class="summary-card">
                <h3>Current Balance</h3>
                <p class="amount">$${savings.toFixed(2)}</p>
                <p class="change positive">+5% from last month</p>
            </div>
            
            <div class="summary-card">
                <h3>Monthly Goal</h3>
                <p class="amount">$500.00</p>
                <div class="progress-bar" style="height: 8px; margin: 10px 0;">
                    <div class="progress-fill" style="width: ${Math.min((savings/500)*100, 100)}%;"></div>
                </div>
                <p class="change">Monthly savings target</p>
            </div>
            
            <div class="summary-card">
                <h3>Interest Rate</h3>
                <p class="amount">5%</p>
                <p class="change">Annual interest</p>
            </div>
        </div>
        
        <div class="savings-actions">
            <button class="btn btn-primary" id="makeDepositBtn">
                <i class="fas fa-plus-circle"></i> Make Deposit
            </button>
            <button class="btn btn-secondary" id="requestWithdrawalBtn">
                <i class="fas fa-minus-circle"></i> Request Withdrawal
            </button>
            <button class="btn btn-outline" id="setGoalBtn">
                <i class="fas fa-bullseye"></i> Set Savings Goal
            </button>
        </div>
        
        <div class="savings-history">
            <h3>Savings History</h3>
            ${savingsTransactions.length > 0 ? 
                `<table class="data-table">
                    <thead>
                        <tr>
                            <th>Date</th>
                            <th>Type</th>
                            <th>Amount</th>
                            <th>Method</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${savingsTransactions.slice(0, 10).map(transaction => `
                            <tr>
                                <td>${formatDate(transaction.date)}</td>
                                <td>${transaction.type}</td>
                                <td>$${transaction.amount.toFixed(2)}</td>
                                <td>${transaction.method}</td>
                                <td><span class="status-badge ${transaction.status}">${transaction.status}</span></td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>` :
                '<p class="no-data">No savings transactions yet.</p>'
            }
        </div>
    `;
    
    // Add event listeners to buttons
    document.getElementById('makeDepositBtn')?.addEventListener('click', () => {
        handleQuickAction('deposit');
    });
    
    document.getElementById('requestWithdrawalBtn')?.addEventListener('click', () => {
        handleQuickAction('withdraw');
    });
    
    document.getElementById('setGoalBtn')?.addEventListener('click', () => {
        showSetGoalModal(user);
    });
}

function loadLoansData() {
    const user = sessionManager.getCurrentUser();
    const contentDiv = document.getElementById('loansContent');
    
    if (!contentDiv || !user) return;
    
    const loans = user.loans || [];
    const pendingLoans = loans.filter(l => l.status === 'pending');
    const activeLoans = loans.filter(l => l.status === 'approved');
    const completedLoans = loans.filter(l => l.status === 'completed' || l.status === 'paid');
    
    contentDiv.innerHTML = `
        <div class="loans-summary">
            <div class="summary-card">
                <h3>Pending</h3>
                <p class="amount">${pendingLoans.length}</p>
                <p class="change">Applications under review</p>
            </div>
            
            <div class="summary-card">
                <h3>Active</h3>
                <p class="amount">${activeLoans.length}</p>
                <p class="change">Current loans</p>
            </div>
            
            <div class="summary-card">
                <h3>Total Borrowed</h3>
                <p class="amount">$${activeLoans.reduce((sum, loan) => sum + loan.amount, 0).toFixed(2)}</p>
                <p class="change">Active loan balance</p>
            </div>
        </div>
        
        <div class="loans-actions">
            <button class="btn btn-primary" id="applyLoanBtn">
                <i class="fas fa-file-signature"></i> Apply for New Loan
            </button>
        </div>
        
        <div class="loans-tabs">
            <div class="tabs">
                <button class="tab-btn active" data-tab="active">Active Loans</button>
                <button class="tab-btn" data-tab="pending">Pending</button>
                <button class="tab-btn" data-tab="history">History</button>
            </div>
            
            <div class="tab-content active" id="activeTab">
                ${renderLoansTable(activeLoans)}
            </div>
            
            <div class="tab-content" id="pendingTab">
                ${renderLoansTable(pendingLoans)}
            </div>
            
            <div class="tab-content" id="historyTab">
                ${renderLoansTable(completedLoans)}
            </div>
        </div>
    `;
    
    // Setup tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });
    
    // Setup apply loan button
    document.getElementById('applyLoanBtn')?.addEventListener('click', () => {
        handleQuickAction('applyLoan');
    });
}

function renderLoansTable(loans) {
    if (loans.length === 0) {
        return '<p class="no-data">No loans found.</p>';
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Loan ID</th>
                    <th>Type</th>
                    <th>Amount</th>
                    <th>Applied Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${loans.map(loan => `
                    <tr>
                        <td>${loan.id}</td>
                        <td>${loan.type}</td>
                        <td>$${loan.amount.toFixed(2)}</td>
                        <td>${formatDate(loan.appliedDate)}</td>
                        <td><span class="status-badge ${loan.status}">${loan.status}</span></td>
                        <td>
                            <button class="btn btn-small btn-outline view-loan" data-id="${loan.id}">View</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function loadTransactionsData() {
    const user = sessionManager.getCurrentUser();
    const contentDiv = document.getElementById('transactionsContent');
    
    if (!contentDiv || !user) return;
    
    const transactions = user.transactions || [];
    
    contentDiv.innerHTML = `
        <div class="transactions-header">
            <div class="filter-options">
                <select id="transactionFilter" class="form-control" style="width: auto;">
                    <option value="all">All Transactions</option>
                    <option value="deposit">Deposits</option>
                    <option value="withdrawal">Withdrawals</option>
                    <option value="loan">Loan Payments</option>
                </select>
                
                <input type="date" id="dateFrom" class="form-control" style="width: auto;">
                <input type="date" id="dateTo" class="form-control" style="width: auto;">
                
                <button class="btn btn-primary" id="filterBtn">Filter</button>
                <button class="btn btn-secondary" id="resetBtn">Reset</button>
            </div>
            
            <button class="btn btn-outline" id="exportBtn">
                <i class="fas fa-download"></i> Export CSV
            </button>
        </div>
        
        <div class="transactions-table">
            ${transactions.length > 0 ? `
                <table class="data-table">
                    <thead>
                        <tr>
                            <th>Date & Time</th>
                            <th>Transaction ID</th>
                            <th>Type</th>
                            <th>Description</th>
                            <th>Amount</th>
                            <th>Status</th>
                            <th>Method</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${transactions.map(transaction => `
                            <tr>
                                <td>${formatDateTime(transaction.date)}</td>
                                <td>${transaction.id}</td>
                                <td>${transaction.type}</td>
                                <td>${transaction.notes || transaction.purpose || 'Transaction'}</td>
                                <td class="${transaction.type === 'deposit' ? 'positive' : 'negative'}">
                                    ${transaction.type === 'deposit' ? '+' : '-'}$${transaction.amount.toFixed(2)}
                                </td>
                                <td><span class="status-badge ${transaction.status}">${transaction.status}</span></td>
                                <td>${transaction.method || 'N/A'}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            ` : '<p class="no-data">No transactions found.</p>'}
        </div>
    `;
    
    // Setup filter functionality
    document.getElementById('filterBtn')?.addEventListener('click', filterTransactions);
    document.getElementById('resetBtn')?.addEventListener('click', resetTransactionsFilter);
    document.getElementById('exportBtn')?.addEventListener('click', exportTransactions);
}

function loadProfileData() {
    const user = sessionManager.getCurrentUser();
    const contentDiv = document.getElementById('profileContent');
    
    if (!contentDiv || !user) return;
    
    contentDiv.innerHTML = `
        <div class="profile-header">
            <div class="profile-avatar">
                <i class="fas fa-user-circle"></i>
                <button class="btn btn-small" id="changeAvatarBtn">Change</button>
            </div>
            <div class="profile-info">
                <h3>${user.name}</h3>
                <p>Member ID: ${user.id}</p>
                <p>Member since: ${formatDate(user.joinDate)}</p>
            </div>
        </div>
        
        <form id="profileForm" class="dashboard-form">
            <div class="form-row">
                <div class="form-group">
                    <label for="profileName">Full Name</label>
                    <input type="text" id="profileName" class="form-control" value="${user.name}" required>
                </div>
                
                <div class="form-group">
                    <label for="profileEmail">Email Address</label>
                    <input type="email" id="profileEmail" class="form-control" value="${user.email}" required>
                </div>
            </div>
            
            <div class="form-row">
                <div class="form-group">
                    <label for="profilePhone">Phone Number</label>
                    <input type="tel" id="profilePhone" class="form-control" value="${user.phone || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="profileDob">Date of Birth</label>
                    <input type="date" id="profileDob" class="form-control" value="${user.dob || ''}">
                </div>
            </div>
            
            <div class="form-group">
                <label for="profileAddress">Address</label>
                <textarea id="profileAddress" class="form-control" rows="3" required>${user.address || ''}</textarea>
            </div>
            
            <div class="form-group">
                <label for="profileOccupation">Occupation</label>
                <input type="text" id="profileOccupation" class="form-control" value="${user.occupation || ''}">
            </div>
            
            <div class="form-actions">
                <button type="button" class="btn btn-secondary" id="cancelProfileBtn">Cancel</button>
                <button type="submit" class="btn btn-primary">Save Changes</button>
            </div>
        </form>
        
        <div class="profile-security">
            <h3>Security Settings</h3>
            <button class="btn btn-outline" id="changePasswordBtn">
                <i class="fas fa-lock"></i> Change Password
            </button>
            <button class="btn btn-outline" id="twoFactorBtn">
                <i class="fas fa-shield-alt"></i> Two-Factor Authentication
            </button>
        </div>
    `;
    
    // Handle form submission
    document.getElementById('profileForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        updateProfile();
    });
    
    // Handle cancel button
    document.getElementById('cancelProfileBtn')?.addEventListener('click', () => {
        loadProfileData(); // Reload to reset changes
    });
    
    // Handle security buttons
    document.getElementById('changePasswordBtn')?.addEventListener('click', showChangePasswordModal);
    document.getElementById('twoFactorBtn')?.addEventListener('click', showTwoFactorModal);
}

function loadStatementsData() {
    const user = sessionManager.getCurrentUser();
    const contentDiv = document.getElementById('statementsContent');
    
    if (!contentDiv || !user) return;
    
    // Generate sample statements
    const statements = [
        { id: 'STMT-2023-10', period: 'October 2023', type: 'Monthly', date: '2023-11-01' },
        { id: 'STMT-2023-Q3', period: 'Q3 2023 (Jul-Sep)', type: 'Quarterly', date: '2023-10-01' },
        { id: 'STMT-2023-09', period: 'September 2023', type: 'Monthly', date: '2023-10-01' },
        { id: 'STMT-2023-08', period: 'August 2023', type: 'Monthly', date: '2023-09-01' },
        { id: 'STMT-2023-07', period: 'July 2023', type: 'Monthly', date: '2023-08-01' },
        { id: 'STMT-2023-Q2', period: 'Q2 2023 (Apr-Jun)', type: 'Quarterly', date: '2023-07-01' },
    ];
    
    contentDiv.innerHTML = `
        <div class="statements-info">
            <p>Download your account statements for record keeping or tax purposes.</p>
        </div>
        
        <div class="statements-actions">
            <button class="btn btn-primary" id="generateStatementBtn">
                <i class="fas fa-file-invoice-dollar"></i> Generate Custom Statement
            </button>
        </div>
        
        <div class="statements-list">
            <h3>Available Statements</h3>
            
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Statement ID</th>
                        <th>Period</th>
                        <th>Type</th>
                        <th>Generated Date</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${statements.map(stmt => `
                        <tr>
                            <td>${stmt.id}</td>
                            <td>${stmt.period}</td>
                            <td>${stmt.type}</td>
                            <td>${formatDate(stmt.date)}</td>
                            <td>
                                <button class="btn btn-small btn-outline download-stmt" data-id="${stmt.id}">
                                    <i class="fas fa-download"></i> Download
                                </button>
                                <button class="btn btn-small btn-outline view-stmt" data-id="${stmt.id}">
                                    <i class="fas fa-eye"></i> View
                                </button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Setup statement buttons
    document.getElementById('generateStatementBtn')?.addEventListener('click', showGenerateStatementModal);
    
    document.querySelectorAll('.download-stmt').forEach(btn => {
        btn.addEventListener('click', function() {
            const stmtId = this.getAttribute('data-id');
            downloadStatementById(stmtId);
        });
    });
    
    document.querySelectorAll('.view-stmt').forEach(btn => {
        btn.addEventListener('click', function() {
            const stmtId = this.getAttribute('data-id');
            viewStatement(stmtId);
        });
    });
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
}

function formatDateTime(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function showToast(message, type = 'success') {
    // Remove existing toast if any
    const existingToast = document.querySelector('.toast-notification');
    if (existingToast) {
        existingToast.remove();
    }
    
    // Create toast element
    const toast = document.createElement('div');
    toast.className = 'toast-notification';
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    const iconColor = type === 'success' ? 'var(--secondary)' : 'var(--warning)';
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas ${icon}" style="color: ${iconColor}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add to page
    document.body.appendChild(toast);
    
    // Add close functionality
    const closeBtn = toast.querySelector('.toast-close');
    closeBtn.addEventListener('click', function() {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            toast.remove();
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (toast.parentNode) {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }
    }, 5000);
}

function setupEventListeners() {
    // Sidebar toggle for mobile
    const menuToggle = document.getElementById('menuToggle');
    const sidebarToggle = document.getElementById('sidebarToggle');
    const sidebar = document.getElementById('sidebar');
    
    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', function() {
            sidebar.classList.add('active');
        });
    }
    
    if (sidebarToggle && sidebar) {
        sidebarToggle.addEventListener('click', function() {
            sidebar.classList.remove('active');
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            sessionManager.clearSession();
            window.location.href = 'login.html';
        });
    }
    
    // Close sidebar when clicking outside on mobile
    document.addEventListener('click', function(e) {
        const sidebar = document.getElementById('sidebar');
        if (window.innerWidth < 992 && sidebar.classList.contains('active')) {
            if (!sidebar.contains(e.target) && !e.target.closest('.menu-toggle')) {
                sidebar.classList.remove('active');
            }
        }
    });
}

// Placeholder functions for unimplemented features
function showSetGoalModal(user) {
    showToast('Set goal feature coming soon!', 'info');
}

function filterTransactions() {
    showToast('Filtering transactions...', 'info');
}

function resetTransactionsFilter() {
    showToast('Filters reset', 'info');
}

function exportTransactions() {
    showToast('Exporting transactions to CSV...', 'success');
}

function updateProfile() {
    showToast('Profile updated successfully!', 'success');
}

function showChangePasswordModal() {
    showToast('Change password feature coming soon!', 'info');
}

function showTwoFactorModal() {
    showToast('Two-factor authentication setup coming soon!', 'info');
}

function showGenerateStatementModal() {
    showToast('Custom statement generation coming soon!', 'info');
}

function downloadStatementById(stmtId) {
    showToast(`Downloading statement ${stmtId}...`, 'success');
}

function viewStatement(stmtId) {
    showToast(`Viewing statement ${stmtId}...`, 'info');
}