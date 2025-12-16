// Admin Dashboard JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in and is an admin
    if (!sessionManager.isLoggedIn() || !sessionManager.isAdmin()) {
        window.location.href = 'login.html';
        return;
    }

    // Initialize the dashboard
    initAdminDashboard();
});

function initAdminDashboard() {
    const user = sessionManager.getCurrentUser();
    
    // Set up UI
    setupAdminUserInfo(user);
    setCurrentDate();
    setupAdminNavigation();
    setupAdminNotifications();
    setupAdminModals();
    
    // Load initial data
    loadAdminDashboardData();
    
    // Setup event listeners
    setupAdminEventListeners();
}

function setupAdminUserInfo(user) {
    const userInfoDiv = document.getElementById('userInfo');
    if (userInfoDiv && user) {
        userInfoDiv.innerHTML = `
            <div class="user-avatar">
                <i class="fas fa-user-shield"></i>
                <div class="user-details">
                    <h3>${user.name}</h3>
                    <p>${user.id}</p>
                    <p class="user-type">Administrator</p>
                </div>
            </div>
            <div class="user-stats">
                <div class="stat">
                    <span>System Role</span>
                    <strong>Super Admin</strong>
                </div>
            </div>
        `;
    }
    
    // Set dashboard title
    const title = document.getElementById('dashboardTitle');
    if (title && user) {
        title.textContent = `Admin Dashboard`;
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

function setupAdminNavigation() {
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
                        case 'dashboard':
                            loadAdminDashboardData();
                            break;
                        case 'members':
                            loadMembersData();
                            break;
                        case 'savings':
                            loadAdminSavingsData();
                            break;
                        case 'loans':
                            loadAdminLoansData();
                            break;
                        case 'reports':
                            loadReportsData();
                            break;
                        case 'settings':
                            loadSettingsData();
                            break;
                    }
                }
            });
            
            // Update dashboard title
            updateAdminSectionTitle(sectionName);
            
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

function updateAdminSectionTitle(sectionName) {
    const titles = {
        'dashboard': 'System Overview',
        'members': 'Members Management',
        'savings': 'Savings Management',
        'loans': 'Loans Management',
        'reports': 'Reports & Analytics',
        'settings': 'System Settings'
    };
    
    const title = document.getElementById('dashboardTitle');
    if (title && titles[sectionName]) {
        title.textContent = titles[sectionName];
    }
}

function setupAdminNotifications() {
    const notificationBell = document.getElementById('notificationBell');
    const notificationCount = document.getElementById('notificationCount');
    
    // Calculate admin notifications
    const users = sessionManager.getUsers();
    const members = users.filter(u => u.type === 'member');
    
    let count = 0;
    const notifications = [];
    
    // Check for pending withdrawals
    members.forEach(member => {
        if (member.transactions) {
            const pendingWithdrawals = member.transactions.filter(t => 
                t.type === 'withdrawal' && t.status === 'pending'
            );
            
            if (pendingWithdrawals.length > 0) {
                count += pendingWithdrawals.length;
                pendingWithdrawals.forEach(w => {
                    notifications.push({
                        type: 'warning',
                        title: 'Withdrawal Approval',
                        message: `${member.name} requested $${w.amount} withdrawal`
                    });
                });
            }
        }
    });
    
    // Check for pending loans
    members.forEach(member => {
        if (member.loans) {
            const pendingLoans = member.loans.filter(l => l.status === 'pending');
            if (pendingLoans.length > 0) {
                count += pendingLoans.length;
                pendingLoans.forEach(loan => {
                    notifications.push({
                        type: 'info',
                        title: 'Loan Application',
                        message: `${member.name} applied for $${loan.amount} ${loan.type}`
                    });
                });
            }
        }
    });
    
    // Check for new members (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const newMembers = members.filter(m => {
        const joinDate = new Date(m.joinDate);
        return joinDate > sevenDaysAgo;
    });
    
    if (newMembers.length > 0) {
        count++;
        notifications.push({
            type: 'success',
            title: 'New Members',
            message: `${newMembers.length} new members joined this week`
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
            showAdminNotificationsModal(notifications);
        });
    }
}

function showAdminNotificationsModal(notifications) {
    const modal = document.getElementById('actionModal');
    if (!modal) return;
    
    let notificationsHTML = '';
    if (notifications.length > 0) {
        notifications.forEach(notif => {
            const icon = notif.type === 'warning' ? 'fa-exclamation-circle' : 
                        notif.type === 'success' ? 'fa-check-circle' : 'fa-info-circle';
            const color = notif.type === 'warning' ? 'var(--warning)' : 
                         notif.type === 'success' ? 'var(--secondary)' : 'var(--primary)';
            notificationsHTML += `
                <div class="notification-item">
                    <div class="notification-icon" style="color: ${color};">
                        <i class="fas ${icon}"></i>
                    </div>
                    <div class="notification-content">
                        <h4>${notif.title}</h4>
                        <p>${notif.message}</p>
                        <button class="btn btn-small" style="margin-top: 0.5rem;">Take Action</button>
                    </div>
                </div>
            `;
        });
    } else {
        notificationsHTML = '<p class="no-notifications">No new notifications.</p>';
    }
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Admin Notifications</h3>
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

function setupAdminModals() {
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
                handleAdminQuickAction(action);
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

function handleAdminQuickAction(action) {
    const modal = document.getElementById('actionModal');
    
    if (!modal) return;
    
    switch(action) {
        case 'addMember':
            showAddMemberModal();
            break;
        case 'approveLoan':
            showApproveLoanModal();
            break;
        case 'generateReport':
            showGenerateReportModal();
            break;
        case 'systemBackup':
            performSystemBackup();
            break;
    }
}

function showAddMemberModal() {
    const modal = document.getElementById('actionModal');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Add New Member</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="addMemberForm">
                <div class="form-group">
                    <label for="memberName">Full Name *</label>
                    <input type="text" id="memberName" class="form-control" required>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="memberEmail">Email Address *</label>
                        <input type="email" id="memberEmail" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="memberPhone">Phone Number *</label>
                        <input type="tel" id="memberPhone" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="memberAddress">Address *</label>
                    <textarea id="memberAddress" class="form-control" rows="2" required></textarea>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="memberDob">Date of Birth</label>
                        <input type="date" id="memberDob" class="form-control">
                    </div>
                    
                    <div class="form-group">
                        <label for="memberOccupation">Occupation</label>
                        <input type="text" id="memberOccupation" class="form-control">
                    </div>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="initialDeposit">Initial Deposit ($)</label>
                        <input type="number" id="initialDeposit" class="form-control" min="0" step="0.01" value="0">
                    </div>
                    
                    <div class="form-group">
                        <label for="memberStatus">Member Status</label>
                        <select id="memberStatus" class="form-control">
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="pending">Pending</option>
                        </select>
                    </div>
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Add Member</button>
                </div>
            </form>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Handle form submission
    const form = document.getElementById('addMemberForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            addNewMember();
            modal.classList.remove('active');
        });
    }
}

function showApproveLoanModal() {
    const modal = document.getElementById('actionModal');
    const users = sessionManager.getUsers();
    const pendingLoans = [];
    
    // Collect all pending loans
    users.forEach(user => {
        if (user.loans) {
            user.loans.forEach(loan => {
                if (loan.status === 'pending') {
                    pendingLoans.push({
                        ...loan,
                        memberName: user.name,
                        memberId: user.id
                    });
                }
            });
        }
    });
    
    let loansHTML = '';
    if (pendingLoans.length > 0) {
        pendingLoans.forEach(loan => {
            loansHTML += `
                <div class="loan-approval-item">
                    <div class="loan-info">
                        <h4>${loan.memberName}</h4>
                        <p>${loan.type} - $${loan.amount.toFixed(2)}</p>
                        <p><small>Applied: ${formatDate(loan.appliedDate)}</small></p>
                    </div>
                    <div class="loan-actions">
                        <button class="btn btn-small btn-success approve-loan" data-id="${loan.id}" data-member="${loan.memberId}">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-small btn-danger reject-loan" data-id="${loan.id}" data-member="${loan.memberId}">
                            <i class="fas fa-times"></i> Reject
                        </button>
                        <button class="btn btn-small btn-outline view-loan" data-id="${loan.id}">
                            <i class="fas fa-eye"></i> View
                        </button>
                    </div>
                </div>
            `;
        });
    } else {
        loansHTML = '<p class="no-data">No pending loans to approve.</p>';
    }
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Approve Pending Loans</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="pending-loans-list">
                ${loansHTML}
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Setup loan action buttons
    document.querySelectorAll('.approve-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            const loanId = this.getAttribute('data-id');
            const memberId = this.getAttribute('data-member');
            approveLoan(memberId, loanId);
            modal.classList.remove('active');
        });
    });
    
    document.querySelectorAll('.reject-loan').forEach(btn => {
        btn.addEventListener('click', function() {
            const loanId = this.getAttribute('data-id');
            const memberId = this.getAttribute('data-member');
            rejectLoan(memberId, loanId);
            modal.classList.remove('active');
        });
    });
}

function showGenerateReportModal() {
    const modal = document.getElementById('actionModal');
    
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Generate Report</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <form id="reportForm">
                <div class="form-group">
                    <label for="reportType">Report Type</label>
                    <select id="reportType" class="form-control" required>
                        <option value="">Select type</option>
                        <option value="members">Members Report</option>
                        <option value="savings">Savings Report</option>
                        <option value="loans">Loans Report</option>
                        <option value="transactions">Transactions Report</option>
                        <option value="financial">Financial Summary</option>
                    </select>
                </div>
                
                <div class="form-row">
                    <div class="form-group">
                        <label for="reportFrom">From Date</label>
                        <input type="date" id="reportFrom" class="form-control" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="reportTo">To Date</label>
                        <input type="date" id="reportTo" class="form-control" required>
                    </div>
                </div>
                
                <div class="form-group">
                    <label for="reportFormat">Format</label>
                    <select id="reportFormat" class="form-control" required>
                        <option value="pdf">PDF</option>
                        <option value="excel">Excel</option>
                        <option value="csv">CSV</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="reportEmail">Email Report To</label>
                    <input type="email" id="reportEmail" class="form-control" placeholder="Optional email address">
                </div>
                
                <div class="form-actions">
                    <button type="button" class="btn btn-secondary close-modal">Cancel</button>
                    <button type="submit" class="btn btn-primary">Generate Report</button>
                </div>
            </form>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
    
    // Handle form submission
    const form = document.getElementById('reportForm');
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            generateReport();
            modal.classList.remove('active');
        });
    }
}

function performSystemBackup() {
    showToast('Starting system backup...', 'info');
    
    // Simulate backup process
    setTimeout(() => {
        // Create backup data
        const users = sessionManager.getUsers();
        const backupData = {
            timestamp: new Date().toISOString(),
            users: users,
            totalMembers: users.filter(u => u.type === 'member').length,
            totalSavings: users.reduce((sum, user) => sum + (user.savings || 0), 0),
            totalLoans: users.reduce((sum, user) => {
                if (user.loans) {
                    return sum + user.loans.filter(l => l.status === 'approved').reduce((s, loan) => s + loan.amount, 0);
                }
                return sum;
            }, 0)
        };
        
        // Create download link
        const dataStr = JSON.stringify(backupData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
        const exportFileDefaultName = `cooperative-backup-${new Date().toISOString().split('T')[0]}.json`;
        
        // Create and trigger download
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileDefaultName);
        linkElement.click();
        
        showToast('Backup completed and downloaded!', 'success');
    }, 1500);
}

function addNewMember() {
    const name = document.getElementById('memberName').value;
    const email = document.getElementById('memberEmail').value;
    const phone = document.getElementById('memberPhone').value;
    const address = document.getElementById('memberAddress').value;
    const dob = document.getElementById('memberDob').value;
    const occupation = document.getElementById('memberOccupation').value;
    const initialDeposit = parseFloat(document.getElementById('initialDeposit').value) || 0;
    const status = document.getElementById('memberStatus').value;
    
    // Get current users
    const users = sessionManager.getUsers();
    
    // Check if email already exists
    if (users.some(u => u.email === email)) {
        showToast('Email already registered!', 'error');
        return;
    }
    
    // Generate member ID
    const memberId = 'COOP-' + (1000 + users.length);
    
    // Create new member
    const newMember = {
        id: memberId,
        name: name,
        email: email,
        password: 'Welcome123', // Default password
        type: 'member',
        phone: phone,
        address: address,
        dob: dob,
        occupation: occupation,
        joinDate: new Date().toISOString(),
        status: status,
        savings: initialDeposit,
        loans: [],
        transactions: initialDeposit > 0 ? [{
            id: 'TX-' + Date.now(),
            type: 'deposit',
            amount: initialDeposit,
            method: 'initial',
            date: new Date().toISOString(),
            status: 'completed'
        }] : []
    };
    
    // Add to users array
    users.push(newMember);
    localStorage.setItem('coop_users', JSON.stringify(users));
    
    showToast(`Member ${name} added successfully! Member ID: ${memberId}`, 'success');
    
    // Refresh members data if on members page
    if (document.getElementById('membersSection').classList.contains('active')) {
        loadMembersData();
    }
    
    // Refresh dashboard data
    loadAdminDashboardData();
}

function approveLoan(memberId, loanId) {
    const users = sessionManager.getUsers();
    const userIndex = users.findIndex(u => u.id === memberId);
    
    if (userIndex === -1) return;
    
    // Find and update loan
    if (users[userIndex].loans) {
        const loanIndex = users[userIndex].loans.findIndex(l => l.id === loanId);
        if (loanIndex !== -1) {
            users[userIndex].loans[loanIndex].status = 'approved';
            users[userIndex].loans[loanIndex].approvedDate = new Date().toISOString();
            
            // Save changes
            localStorage.setItem('coop_users', JSON.stringify(users));
            
            showToast('Loan approved successfully!', 'success');
            
            // Refresh data
            loadAdminDashboardData();
            if (document.getElementById('loansSection').classList.contains('active')) {
                loadAdminLoansData();
            }
        }
    }
}

function rejectLoan(memberId, loanId) {
    const users = sessionManager.getUsers();
    const userIndex = users.findIndex(u => u.id === memberId);
    
    if (userIndex === -1) return;
    
    // Find and update loan
    if (users[userIndex].loans) {
        const loanIndex = users[userIndex].loans.findIndex(l => l.id === loanId);
        if (loanIndex !== -1) {
            users[userIndex].loans[loanIndex].status = 'rejected';
            users[userIndex].loans[loanIndex].rejectedDate = new Date().toISOString();
            users[userIndex].loans[loanIndex].rejectionReason = 'Rejected by administrator';
            
            // Save changes
            localStorage.setItem('coop_users', JSON.stringify(users));
            
            showToast('Loan rejected.', 'info');
            
            // Refresh data
            loadAdminDashboardData();
            if (document.getElementById('loansSection').classList.contains('active')) {
                loadAdminLoansData();
            }
        }
    }
}

function generateReport() {
    const reportType = document.getElementById('reportType').value;
    const fromDate = document.getElementById('reportFrom').value;
    const toDate = document.getElementById('reportTo').value;
    const format = document.getElementById('reportFormat').value;
    
    // Simulate report generation
    showToast(`Generating ${reportType} report from ${fromDate} to ${toDate} in ${format.toUpperCase()} format...`, 'info');
    
    setTimeout(() => {
        // Create sample report data
        const reportData = {
            type: reportType,
            period: `${fromDate} to ${toDate}`,
            generated: new Date().toISOString(),
            data: getReportData(reportType, fromDate, toDate)
        };
        
        // Create download link based on format
        let dataStr, mimeType, extension;
        
        switch(format) {
            case 'csv':
                dataStr = convertToCSV(reportData.data);
                mimeType = 'text/csv';
                extension = 'csv';
                break;
            case 'excel':
                // For simplicity, we'll use CSV for Excel too
                dataStr = convertToCSV(reportData.data);
                mimeType = 'application/vnd.ms-excel';
                extension = 'xls';
                break;
            case 'pdf':
            default:
                dataStr = JSON.stringify(reportData, null, 2);
                mimeType = 'application/json';
                extension = 'json';
        }
        
        const dataUri = `data:${mimeType};charset=utf-8,`+ encodeURIComponent(dataStr);
        const exportFileName = `report-${reportType}-${new Date().toISOString().split('T')[0]}.${extension}`;
        
        // Create and trigger download
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportFileName);
        linkElement.click();
        
        showToast('Report generated and downloaded!', 'success');
    }, 2000);
}

function getReportData(type, fromDate, toDate) {
    const users = sessionManager.getUsers();
    const members = users.filter(u => u.type === 'member');
    
    switch(type) {
        case 'members':
            return members.map(member => ({
                'Member ID': member.id,
                'Name': member.name,
                'Email': member.email,
                'Phone': member.phone,
                'Join Date': formatDate(member.joinDate),
                'Status': member.status || 'active',
                'Savings': member.savings || 0,
                'Active Loans': member.loans ? member.loans.filter(l => l.status === 'approved').length : 0
            }));
            
        case 'savings':
            return members.map(member => ({
                'Member ID': member.id,
                'Name': member.name,
                'Current Balance': member.savings || 0,
                'Last Transaction': member.transactions && member.transactions.length > 0 
                    ? formatDate(member.transactions[0].date) 
                    : 'None',
                'Total Deposits': member.transactions 
                    ? member.transactions.filter(t => t.type === 'deposit').reduce((sum, t) => sum + t.amount, 0)
                    : 0,
                'Total Withdrawals': member.transactions 
                    ? member.transactions.filter(t => t.type === 'withdrawal').reduce((sum, t) => sum + t.amount, 0)
                    : 0
            }));
            
        case 'loans':
            const loanData = [];
            members.forEach(member => {
                if (member.loans) {
                    member.loans.forEach(loan => {
                        loanData.push({
                            'Member ID': member.id,
                            'Name': member.name,
                            'Loan ID': loan.id,
                            'Type': loan.type,
                            'Amount': loan.amount,
                            'Applied Date': formatDate(loan.appliedDate),
                            'Status': loan.status,
                            'Period': loan.period || 'N/A',
                            'Remaining Payments': loan.remainingPayments || 'N/A'
                        });
                    });
                }
            });
            return loanData;
            
        default:
            return { message: 'Report data not available' };
    }
}

function convertToCSV(data) {
    if (!data || data.length === 0) return '';
    
    const headers = Object.keys(data[0]);
    const csvRows = [];
    
    // Add headers
    csvRows.push(headers.join(','));
    
    // Add data rows
    for (const row of data) {
        const values = headers.map(header => {
            const escaped = ('' + row[header]).replace(/"/g, '""');
            return `"${escaped}"`;
        });
        csvRows.push(values.join(','));
    }
    
    return csvRows.join('\n');
}

function loadAdminDashboardData() {
    const users = sessionManager.getUsers();
    const members = users.filter(u => u.type === 'member');
    
    // Update system stats
    updateSystemStats(members);
    
    // Update recent members
    updateRecentMembers(members);
    
    // Update pending loans
    updatePendingLoans(members);
    
    // Update system status
    updateSystemStatus(members);
}

function updateSystemStats(members) {
    const statsGrid = document.getElementById('systemStats');
    if (!statsGrid) return;
    
    const totalMembers = members.length;
    const totalSavings = members.reduce((sum, member) => sum + (member.savings || 0), 0);
    
    // Calculate active loans
    let totalActiveLoans = 0;
    let totalLoanAmount = 0;
    members.forEach(member => {
        if (member.loans) {
            const activeLoans = member.loans.filter(l => l.status === 'approved');
            totalActiveLoans += activeLoans.length;
            totalLoanAmount += activeLoans.reduce((sum, loan) => sum + loan.amount, 0);
        }
    });
    
    // Calculate new members this month
    const thisMonth = new Date().getMonth();
    const thisYear = new Date().getFullYear();
    const newMembersThisMonth = members.filter(member => {
        const joinDate = new Date(member.joinDate);
        return joinDate.getMonth() === thisMonth && joinDate.getFullYear() === thisYear;
    }).length;
    
    statsGrid.innerHTML = `
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(37, 99, 235, 0.1); color: var(--primary);">
                <i class="fas fa-users"></i>
            </div>
            <div class="stat-info">
                <h3>Total Members</h3>
                <p class="stat-amount">${totalMembers}</p>
                <p class="stat-change positive">
                    <i class="fas fa-user-plus"></i> ${newMembersThisMonth} this month
                </p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(16, 185, 129, 0.1); color: var(--secondary);">
                <i class="fas fa-piggy-bank"></i>
            </div>
            <div class="stat-info">
                <h3>Total Savings</h3>
                <p class="stat-amount">$${totalSavings.toFixed(2)}</p>
                <p class="stat-change positive">
                    <i class="fas fa-arrow-up"></i> 8.5% growth
                </p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(239, 68, 68, 0.1); color: var(--danger);">
                <i class="fas fa-hand-holding-usd"></i>
            </div>
            <div class="stat-info">
                <h3>Active Loans</h3>
                <p class="stat-amount">${totalActiveLoans}</p>
                <p class="stat-change ${totalActiveLoans > 0 ? 'negative' : 'positive'}">
                    <i class="fas fa-${totalActiveLoans > 0 ? 'arrow-up' : 'check'}"></i>
                    $${totalLoanAmount.toFixed(2)} total
                </p>
            </div>
        </div>
        
        <div class="stat-card">
            <div class="stat-icon" style="background-color: rgba(245, 158, 11, 0.1); color: var(--warning);">
                <i class="fas fa-chart-line"></i>
            </div>
            <div class="stat-info">
                <h3>Loan Recovery</h3>
                <p class="stat-amount">94.2%</p>
                <p class="stat-change positive">
                    <i class="fas fa-arrow-up"></i> 2.1% from last month
                </p>
            </div>
        </div>
    `;
}

function updateRecentMembers(members) {
    const recentMembersDiv = document.getElementById('recentMembers');
    if (!recentMembersDiv) return;
    
    // Sort by join date (newest first) and take first 5
    const recentMembers = [...members]
        .sort((a, b) => new Date(b.joinDate) - new Date(a.joinDate))
        .slice(0, 5);
    
    if (recentMembers.length === 0) {
        recentMembersDiv.innerHTML = '<p class="no-data">No members yet.</p>';
        return;
    }
    
    let membersHTML = '';
    recentMembers.forEach(member => {
        membersHTML += `
            <div class="member-item">
                <div class="member-avatar">
                    <i class="fas fa-user-circle"></i>
                </div>
                <div class="member-info">
                    <h4>${member.name}</h4>
                    <p>${member.id} • Joined ${formatDate(member.joinDate)}</p>
                </div>
                <div class="member-savings">
                    <p>$${(member.savings || 0).toFixed(2)}</p>
                </div>
            </div>
        `;
    });
    
    recentMembersDiv.innerHTML = membersHTML;
}

function updatePendingLoans(members) {
    const pendingLoansDiv = document.getElementById('pendingLoans');
    if (!pendingLoansDiv) return;
    
    // Collect all pending loans
    const pendingLoans = [];
    members.forEach(member => {
        if (member.loans) {
            member.loans.forEach(loan => {
                if (loan.status === 'pending') {
                    pendingLoans.push({
                        ...loan,
                        memberName: member.name,
                        memberId: member.id
                    });
                }
            });
        }
    });
    
    if (pendingLoans.length === 0) {
        pendingLoansDiv.innerHTML = '<p class="no-data">No pending loans.</p>';
        return;
    }
    
    let loansHTML = '';
    pendingLoans.slice(0, 3).forEach(loan => {
        loansHTML += `
            <div class="loan-item">
                <div class="loan-info">
                    <h4>${loan.memberName}</h4>
                    <p>${loan.type} • $${loan.amount.toFixed(2)}</p>
                    <p><small>Applied ${formatDate(loan.appliedDate)}</small></p>
                </div>
                <div class="loan-actions">
                    <button class="btn btn-small btn-outline" onclick="approveLoan('${loan.memberId}', '${loan.id}')">Approve</button>
                </div>
            </div>
        `;
    });
    
    pendingLoansDiv.innerHTML = loansHTML;
}

function updateSystemStatus(members) {
    document.getElementById('totalMembers').textContent = members.length;
    
    const totalSavings = members.reduce((sum, member) => sum + (member.savings || 0), 0);
    document.getElementById('totalSavings').textContent = `$${totalSavings.toFixed(2)}`;
    
    let totalActiveLoans = 0;
    members.forEach(member => {
        if (member.loans) {
            totalActiveLoans += member.loans.filter(l => l.status === 'approved').length;
        }
    });
    document.getElementById('totalLoans').textContent = totalActiveLoans;
}

function loadMembersData() {
    const users = sessionManager.getUsers();
    const members = users.filter(u => u.type === 'member');
    const contentDiv = document.getElementById('membersContent');
    
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="members-header">
            <div class="search-box">
                <input type="text" id="memberSearch" class="form-control" placeholder="Search members...">
                <i class="fas fa-search"></i>
            </div>
            
            <div class="filter-options">
                <select id="memberFilter" class="form-control">
                    <option value="all">All Members</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="pending">Pending</option>
                </select>
            </div>
        </div>
        
        <div class="members-table">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Member ID</th>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Phone</th>
                        <th>Join Date</th>
                        <th>Savings</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody id="membersTableBody">
                    ${members.map(member => `
                        <tr>
                            <td>${member.id}</td>
                            <td>${member.name}</td>
                            <td>${member.email}</td>
                            <td>${member.phone || 'N/A'}</td>
                            <td>${formatDate(member.joinDate)}</td>
                            <td>$${(member.savings || 0).toFixed(2)}</td>
                            <td><span class="status-badge ${member.status || 'active'}">${member.status || 'active'}</span></td>
                            <td>
                                <div class="action-buttons">
                                    <button class="btn-icon view-member" data-id="${member.id}" title="View">
                                        <i class="fas fa-eye"></i>
                                    </button>
                                    <button class="btn-icon edit-member" data-id="${member.id}" title="Edit">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="btn-icon delete-member" data-id="${member.id}" title="Delete">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        
        <div class="members-summary">
            <p>Showing ${members.length} members</p>
            <button class="btn btn-primary" id="exportMembersBtn">
                <i class="fas fa-download"></i> Export Members List
            </button>
        </div>
    `;
    
    // Setup search functionality
    document.getElementById('memberSearch')?.addEventListener('input', function() {
        filterMembersTable(this.value);
    });
    
    // Setup filter functionality
    document.getElementById('memberFilter')?.addEventListener('change', function() {
        filterMembersTable(document.getElementById('memberSearch').value, this.value);
    });
    
    // Setup action buttons
    document.querySelectorAll('.view-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            viewMemberDetails(memberId);
        });
    });
    
    document.querySelectorAll('.edit-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            editMember(memberId);
        });
    });
    
    document.querySelectorAll('.delete-member').forEach(btn => {
        btn.addEventListener('click', function() {
            const memberId = this.getAttribute('data-id');
            deleteMember(memberId);
        });
    });
    
    // Export button
    document.getElementById('exportMembersBtn')?.addEventListener('click', exportMembersList);
}

function loadAdminSavingsData() {
    const users = sessionManager.getUsers();
    const members = users.filter(u => u.type === 'member');
    const contentDiv = document.getElementById('savingsContent');
    
    if (!contentDiv) return;
    
    // Calculate totals
    const totalSavings = members.reduce((sum, member) => sum + (member.savings || 0), 0);
    const totalDeposits = members.reduce((sum, member) => {
        if (member.transactions) {
            return sum + member.transactions.filter(t => t.type === 'deposit').reduce((s, t) => s + t.amount, 0);
        }
        return sum;
    }, 0);
    
    const totalWithdrawals = members.reduce((sum, member) => {
        if (member.transactions) {
            return sum + member.transactions.filter(t => t.type === 'withdrawal').reduce((s, t) => s + t.amount, 0);
        }
        return sum;
    }, 0);
    
    contentDiv.innerHTML = `
        <div class="savings-summary">
            <div class="summary-card">
                <h3>Total Savings</h3>
                <p class="amount">$${totalSavings.toFixed(2)}</p>
                <p class="change positive">Across all members</p>
            </div>
            
            <div class="summary-card">
                <h3>Total Deposits</h3>
                <p class="amount">$${totalDeposits.toFixed(2)}</p>
                <p class="change">All time</p>
            </div>
            
            <div class="summary-card">
                <h3>Total Withdrawals</h3>
                <p class="amount">$${totalWithdrawals.toFixed(2)}</p>
                <p class="change negative">All time</p>
            </div>
            
            <div class="summary-card">
                <h3>Average Balance</h3>
                <p class="amount">$${(totalSavings / (members.length || 1)).toFixed(2)}</p>
                <p class="change">Per member</p>
            </div>
        </div>
        
        <div class="savings-chart">
            <h3>Savings Distribution</h3>
            <div class="chart-placeholder">
                <p><i class="fas fa-chart-pie"></i> Chart would show here</p>
                <p><small>In a real application, this would show a pie chart of savings distribution</small></p>
            </div>
        </div>
        
        <div class="top-savers">
            <h3>Top Savers</h3>
            <div class="top-list">
                ${members
                    .sort((a, b) => (b.savings || 0) - (a.savings || 0))
                    .slice(0, 5)
                    .map(member => `
                        <div class="top-item">
                            <div class="top-info">
                                <h4>${member.name}</h4>
                                <p>${member.id}</p>
                            </div>
                            <div class="top-amount">
                                $${(member.savings || 0).toFixed(2)}
                            </div>
                        </div>
                    `).join('')}
            </div>
        </div>
    `;
}

function loadAdminLoansData() {
    const users = sessionManager.getUsers();
    const members = users.filter(u => u.type === 'member');
    const contentDiv = document.getElementById('loansContent');
    
    if (!contentDiv) return;
    
    // Collect all loans
    const allLoans = [];
    members.forEach(member => {
        if (member.loans) {
            member.loans.forEach(loan => {
                allLoans.push({
                    ...loan,
                    memberName: member.name,
                    memberId: member.id
                });
            });
        }
    });
    
    // Calculate statistics
    const pendingLoans = allLoans.filter(l => l.status === 'pending');
    const approvedLoans = allLoans.filter(l => l.status === 'approved');
    const rejectedLoans = allLoans.filter(l => l.status === 'rejected');
    const totalLoanAmount = approvedLoans.reduce((sum, loan) => sum + loan.amount, 0);
    
    contentDiv.innerHTML = `
        <div class="loans-summary">
            <div class="summary-card">
                <h3>Pending</h3>
                <p class="amount">${pendingLoans.length}</p>
                <p class="change warning">Need approval</p>
            </div>
            
            <div class="summary-card">
                <h3>Active</h3>
                <p class="amount">${approvedLoans.length}</p>
                <p class="change">Current loans</p>
            </div>
            
            <div class="summary-card">
                <h3>Total Amount</h3>
                <p class="amount">$${totalLoanAmount.toFixed(2)}</p>
                <p class="change negative">Active loans</p>
            </div>
            
            <div class="summary-card">
                <h3>Recovery Rate</h3>
                <p class="amount">94.2%</p>
                <p class="change positive">Timely payments</p>
            </div>
        </div>
        
        <div class="loans-tabs">
            <div class="tabs">
                <button class="tab-btn active" data-tab="pending">Pending (${pendingLoans.length})</button>
                <button class="tab-btn" data-tab="active">Active (${approvedLoans.length})</button>
                <button class="tab-btn" data-tab="all">All Loans</button>
            </div>
            
            <div class="tab-content active" id="pendingTab">
                ${renderAdminLoansTable(pendingLoans)}
            </div>
            
            <div class="tab-content" id="activeTab">
                ${renderAdminLoansTable(approvedLoans)}
            </div>
            
            <div class="tab-content" id="allTab">
                ${renderAdminLoansTable(allLoans)}
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
}

function loadReportsData() {
    const contentDiv = document.getElementById('reportsContent');
    
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="reports-grid">
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-users"></i>
                </div>
                <h3>Members Report</h3>
                <p>Detailed list of all members with their information and status.</p>
                <button class="btn btn-outline generate-report" data-type="members">
                    <i class="fas fa-download"></i> Generate
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-piggy-bank"></i>
                </div>
                <h3>Savings Report</h3>
                <p>Complete savings summary with deposits, withdrawals, and balances.</p>
                <button class="btn btn-outline generate-report" data-type="savings">
                    <i class="fas fa-download"></i> Generate
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-hand-holding-usd"></i>
                </div>
                <h3>Loans Report</h3>
                <p>Loan applications, approvals, repayments, and recovery status.</p>
                <button class="btn btn-outline generate-report" data-type="loans">
                    <i class="fas fa-download"></i> Generate
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-exchange-alt"></i>
                </div>
                <h3>Transactions Report</h3>
                <p>All financial transactions across the cooperative system.</p>
                <button class="btn btn-outline generate-report" data-type="transactions">
                    <i class="fas fa-download"></i> Generate
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-chart-bar"></i>
                </div>
                <h3>Financial Summary</h3>
                <p>Comprehensive financial overview and performance metrics.</p>
                <button class="btn btn-outline generate-report" data-type="financial">
                    <i class="fas fa-download"></i> Generate
                </button>
            </div>
            
            <div class="report-card">
                <div class="report-icon">
                    <i class="fas fa-calendar-alt"></i>
                </div>
                <h3>Custom Report</h3>
                <p>Create a custom report with specific parameters and date ranges.</p>
                <button class="btn btn-primary" id="customReportBtn">
                    <i class="fas fa-cogs"></i> Customize
                </button>
            </div>
        </div>
        
        <div class="recent-reports">
            <h3>Recently Generated Reports</h3>
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Report Name</th>
                        <th>Generated</th>
                        <th>Type</th>
                        <th>Size</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Monthly Savings Report - Oct 2023</td>
                        <td>Nov 1, 2023</td>
                        <td>PDF</td>
                        <td>2.4 MB</td>
                        <td>
                            <button class="btn btn-small btn-outline">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </td>
                    </tr>
                    <tr>
                        <td>Loan Recovery Q3 2023</td>
                        <td>Oct 15, 2023</td>
                        <td>Excel</td>
                        <td>1.8 MB</td>
                        <td>
                            <button class="btn btn-small btn-outline">
                                <i class="fas fa-download"></i> Download
                            </button>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    // Setup report generation buttons
    document.querySelectorAll('.generate-report').forEach(btn => {
        btn.addEventListener('click', function() {
            const reportType = this.getAttribute('data-type');
            generateQuickReport(reportType);
        });
    });
    
    // Custom report button
    document.getElementById('customReportBtn')?.addEventListener('click', () => {
        handleAdminQuickAction('generateReport');
    });
}

function loadSettingsData() {
    const contentDiv = document.getElementById('settingsContent');
    
    if (!contentDiv) return;
    
    contentDiv.innerHTML = `
        <div class="settings-tabs">
            <div class="tabs vertical">
                <button class="tab-btn active" data-tab="general">General Settings</button>
                <button class="tab-btn" data-tab="financial">Financial Settings</button>
                <button class="tab-btn" data-tab="security">Security</button>
                <button class="tab-btn" data-tab="notifications">Notifications</button>
                <button class="tab-btn" data-tab="backup">Backup & Restore</button>
            </div>
            
            <div class="tab-content active" id="generalTab">
                <h3>General System Settings</h3>
                <form id="generalSettingsForm">
                    <div class="form-group">
                        <label for="coopName">Cooperative Name</label>
                        <input type="text" id="coopName" class="form-control" value="Online Savings & Loan Cooperative">
                    </div>
                    
                    <div class="form-group">
                        <label for="coopAddress">Address</label>
                        <textarea id="coopAddress" class="form-control" rows="3">123 Cooperative St, City, Country</textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="coopPhone">Contact Phone</label>
                        <input type="tel" id="coopPhone" class="form-control" value="+1 234 567 8900">
                    </div>
                    
                    <div class="form-group">
                        <label for="coopEmail">Contact Email</label>
                        <input type="email" id="coopEmail" class="form-control" value="info@coop.com">
                    </div>
                    
                    <div class="form-group">
                        <label for="timezone">Timezone</label>
                        <select id="timezone" class="form-control">
                            <option value="UTC-5" selected>Eastern Time (UTC-5)</option>
                            <option value="UTC-8">Pacific Time (UTC-8)</option>
                            <option value="UTC+0">GMT (UTC+0)</option>
                        </select>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
            
            <div class="tab-content" id="financialTab">
                <h3>Financial Settings</h3>
                <form id="financialSettingsForm">
                    <div class="form-group">
                        <label for="savingsInterest">Savings Interest Rate (%)</label>
                        <input type="number" id="savingsInterest" class="form-control" value="5.0" step="0.1">
                    </div>
                    
                    <div class="form-group">
                        <label for="loanInterest">Loan Interest Rate (%)</label>
                        <input type="number" id="loanInterest" class="form-control" value="8.5" step="0.1">
                    </div>
                    
                    <div class="form-group">
                        <label for="minDeposit">Minimum Deposit ($)</label>
                        <input type="number" id="minDeposit" class="form-control" value="10" step="1">
                    </div>
                    
                    <div class="form-group">
                        <label for="maxLoanRatio">Maximum Loan to Savings Ratio</label>
                        <input type="number" id="maxLoanRatio" class="form-control" value="2.0" step="0.1">
                        <small>Example: 2.0 means members can borrow up to 2x their savings</small>
                    </div>
                    
                    <div class="form-actions">
                        <button type="submit" class="btn btn-primary">Save Changes</button>
                    </div>
                </form>
            </div>
            
            <div class="tab-content" id="securityTab">
                <h3>Security Settings</h3>
                <div class="security-options">
                    <div class="security-item">
                        <h4>Two-Factor Authentication</h4>
                        <p>Require 2FA for admin accounts</p>
                        <label class="switch">
                            <input type="checkbox" checked>
                            <span class="slider"></span>
                        </label>
                    </div>
                    
                    <div class="security-item">
                        <h4>Session Timeout</h4>
                        <p>Automatically logout after inactivity</p>
                        <select class="form-control" style="width: auto;">
                            <option value="15">15 minutes</option>
                            <option value="30" selected>30 minutes</option>
                            <option value="60">1 hour</option>
                        </select>
                    </div>
                    
                    <div class="security-item">
                        <h4>Password Policy</h4>
                        <p>Minimum password requirements</p>
                        <button class="btn btn-outline">Configure</button>
                    </div>
                    
                    <div class="security-item">
                        <h4>IP Whitelisting</h4>
                        <p>Restrict admin access to specific IPs</p>
                        <button class="btn btn-outline">Manage IPs</button>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    // Setup tab switching for settings
    document.querySelectorAll('.settings-tabs .tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            
            // Update active tab button
            document.querySelectorAll('.settings-tabs .tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Show corresponding tab content
            document.querySelectorAll('.settings-tabs .tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(tab + 'Tab').classList.add('active');
        });
    });
    
    // Handle form submissions
    document.getElementById('generalSettingsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveGeneralSettings();
    });
    
    document.getElementById('financialSettingsForm')?.addEventListener('submit', function(e) {
        e.preventDefault();
        saveFinancialSettings();
    });
}

// Utility Functions
function formatDate(dateString) {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
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

function renderAdminLoansTable(loans) {
    if (loans.length === 0) {
        return '<p class="no-data">No loans found.</p>';
    }
    
    return `
        <table class="data-table">
            <thead>
                <tr>
                    <th>Member</th>
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
                        <td>${loan.memberName}</td>
                        <td>${loan.id}</td>
                        <td>${loan.type}</td>
                        <td>$${loan.amount.toFixed(2)}</td>
                        <td>${formatDate(loan.appliedDate)}</td>
                        <td><span class="status-badge ${loan.status}">${loan.status}</span></td>
                        <td>
                            ${loan.status === 'pending' ? `
                                <button class="btn btn-small btn-success" onclick="approveLoan('${loan.memberId}', '${loan.id}')">
                                    Approve
                                </button>
                                <button class="btn btn-small btn-danger" onclick="rejectLoan('${loan.memberId}', '${loan.id}')">
                                    Reject
                                </button>
                            ` : ''}
                            <button class="btn btn-small btn-outline" onclick="viewLoanDetails('${loan.memberId}', '${loan.id}')">
                                View
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function filterMembersTable(searchTerm = '', filter = 'all') {
    const tableBody = document.getElementById('membersTableBody');
    if (!tableBody) return;
    
    const rows = tableBody.querySelectorAll('tr');
    const searchLower = searchTerm.toLowerCase();
    
    rows.forEach(row => {
        const cells = row.querySelectorAll('td');
        const statusCell = cells[6]?.querySelector('.status-badge');
        const status = statusCell ? statusCell.textContent.toLowerCase() : '';
        
        const rowText = Array.from(cells).map(cell => cell.textContent.toLowerCase()).join(' ');
        
        const matchesSearch = !searchTerm || rowText.includes(searchLower);
        const matchesFilter = filter === 'all' || status === filter;
        
        row.style.display = matchesSearch && matchesFilter ? '' : 'none';
    });
}

function viewMemberDetails(memberId) {
    const users = sessionManager.getUsers();
    const member = users.find(u => u.id === memberId);
    
    if (!member) return;
    
    const modal = document.getElementById('actionModal');
    modal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>Member Details - ${member.name}</h3>
            <button class="close-modal">&times;</button>
        </div>
        <div class="modal-body">
            <div class="member-details">
                <div class="detail-row">
                    <span>Member ID:</span>
                    <strong>${member.id}</strong>
                </div>
                <div class="detail-row">
                    <span>Full Name:</span>
                    <strong>${member.name}</strong>
                </div>
                <div class="detail-row">
                    <span>Email:</span>
                    <span>${member.email}</span>
                </div>
                <div class="detail-row">
                    <span>Phone:</span>
                    <span>${member.phone || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span>Address:</span>
                    <span>${member.address || 'N/A'}</span>
                </div>
                <div class="detail-row">
                    <span>Join Date:</span>
                    <span>${formatDate(member.joinDate)}</span>
                </div>
                <div class="detail-row">
                    <span>Status:</span>
                    <span class="status-badge ${member.status || 'active'}">${member.status || 'active'}</span>
                </div>
                <div class="detail-row">
                    <span>Current Savings:</span>
                    <strong>$${(member.savings || 0).toFixed(2)}</strong>
                </div>
                <div class="detail-row">
                    <span>Active Loans:</span>
                    <span>${member.loans ? member.loans.filter(l => l.status === 'approved').length : 0}</span>
                </div>
            </div>
            
            <div class="modal-actions">
                <button class="btn btn-primary" onclick="editMember('${member.id}')">
                    <i class="fas fa-edit"></i> Edit Member
                </button>
                <button class="btn btn-outline" onclick="viewMemberTransactions('${member.id}')">
                    <i class="fas fa-exchange-alt"></i> View Transactions
                </button>
            </div>
        </div>
    `;
    
    modal.classList.add('active');
    setupModalClose(modal);
}

function editMember(memberId) {
    showToast('Edit member feature coming soon!', 'info');
}

function deleteMember(memberId) {
    if (confirm('Are you sure you want to delete this member? This action cannot be undone.')) {
        // In a real app, this would make an API call
        showToast('Member deletion would be processed here.', 'info');
    }
}

function exportMembersList() {
    showToast('Exporting members list...', 'success');
    // Similar to generateReport function
}

function generateQuickReport(type) {
    showToast(`Generating ${type} report...`, 'info');
    // Similar to generateReport function
}

function viewLoanDetails(memberId, loanId) {
    showToast(`Viewing loan details for ${loanId}`, 'info');
}

function viewMemberTransactions(memberId) {
    showToast(`Viewing transactions for member ${memberId}`, 'info');
}

function saveGeneralSettings() {
    showToast('General settings saved successfully!', 'success');
}

function saveFinancialSettings() {
    showToast('Financial settings saved successfully!', 'success');
}

function setupAdminEventListeners() {
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