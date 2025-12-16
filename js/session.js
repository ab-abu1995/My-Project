// Session Manager for Cooperative System
class SessionManager {
    constructor() {
        this.currentUser = null;
        this.loadSession();
    }
    
    // Load session from localStorage
    loadSession() {
        const session = localStorage.getItem('coop_session');
        if (session) {
            this.currentUser = JSON.parse(session);
        }
    }
    
    // Save session to localStorage
    saveSession(user) {
        this.currentUser = user;
        localStorage.setItem('coop_session', JSON.stringify(user));
    }
    
    // Clear session
    clearSession() {
        this.currentUser = null;
        localStorage.removeItem('coop_session');
    }
    
    // Check if user is logged in
    isLoggedIn() {
        return this.currentUser !== null;
    }
    
    // Get current user
    getCurrentUser() {
        return this.currentUser;
    }
    
    // Get user type
    getUserType() {
        return this.currentUser ? this.currentUser.type : null;
    }
    
    // Check if user is admin
    isAdmin() {
        return this.getUserType() === 'admin';
    }
    
    // Check if user is member
    isMember() {
        return this.getUserType() === 'member';
    }
    
    // Validate credentials (simulated - in real app, this would call an API)
    validateCredentials(email, password) {
        // Get users from localStorage or use default
        const users = this.getUsers();
        
        // Find user by email
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            // Remove password from session data
            const { password, ...userWithoutPassword } = user;
            this.saveSession(userWithoutPassword);
            return true;
        }
        
        return false;
    }
    
    // Register new user
    registerUser(userData) {
        const users = this.getUsers();
        
        // Check if email already exists
        if (users.some(u => u.email === userData.email)) {
            return { success: false, message: 'Email already registered' };
        }
        
        // Generate user ID
        const userId = 'COOP-' + (1000 + users.length);
        
        // Create new user object
        const newUser = {
            id: userId,
            ...userData,
            type: 'member', // Default to member type
            joinDate: new Date().toISOString(),
            savings: 0,
            loans: []
        };
        
        // Add to users array
        users.push(newUser);
        localStorage.setItem('coop_users', JSON.stringify(users));
        
        // Remove password and save session
        const { password, ...userWithoutPassword } = newUser;
        this.saveSession(userWithoutPassword);
        
        return { success: true, user: userWithoutPassword };
    }
    
    // Get all users from localStorage
    getUsers() {
        const usersJson = localStorage.getItem('coop_users');
        if (usersJson) {
            return JSON.parse(usersJson);
        }
        
        // Create default users if none exist
        const defaultUsers = [
            {
                id: 'COOP-0001',
                name: 'Admin User',
                email: 'admin@coop.com',
                password: 'admin123',
                type: 'admin',
                joinDate: '2023-01-01',
                phone: '+1234567890',
                address: '123 Admin St, City'
            },
            {
                id: 'COOP-0002',
                name: 'John Smith',
                email: 'john@example.com',
                password: 'member123',
                type: 'member',
                joinDate: '2023-02-15',
                phone: '+1234567891',
                address: '456 Member Ave, City',
                savings: 24580.50,
                loans: [
                    {
                        id: 'LN-001',
                        amount: 3250,
                        type: 'Education Loan',
                        status: 'approved',
                        appliedDate: '2023-09-28',
                        remainingPayments: 8
                    }
                ]
            }
        ];
        
        localStorage.setItem('coop_users', JSON.stringify(defaultUsers));
        return defaultUsers;
    }
    
    // Get all members (excluding admins)
    getMembers() {
        return this.getUsers().filter(user => user.type === 'member');
    }
    
    // Update user data
    updateUser(userId, updates) {
        const users = this.getUsers();
        const index = users.findIndex(u => u.id === userId);
        
        if (index !== -1) {
            // Update user
            users[index] = { ...users[index], ...updates };
            localStorage.setItem('coop_users', JSON.stringify(users));
            
            // Update session if it's the current user
            if (this.currentUser && this.currentUser.id === userId) {
                this.saveSession(users[index]);
            }
            
            return true;
        }
        
        return false;
    }
}

// Create global session manager instance
const sessionManager = new SessionManager();