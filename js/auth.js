document.addEventListener("DOMContentLoaded", () => {

    const links = document.querySelectorAll("a");

    links.forEach(link => {
        // Only animate internal page links
        if (link.getAttribute("href").includes(".html")) {
            link.addEventListener("click", function (e) {
                e.preventDefault();

                const target = this.getAttribute("href");

                document.body.classList.add("fade-out");

                setTimeout(() => {
                    window.location.href = target;
                }, 400); // must match CSS transition time
            });
        }
    });

});



// Authentication functions for Cooperative System

// Show toast notification
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

// Show validation error
function showError(elementId, message) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = message;
        element.style.display = 'block';
        document.getElementById(elementId.replace('Error', '')).classList.add('error');
    }
}

// Clear validation error
function clearError(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = '';
        element.style.display = 'none';
        const inputId = elementId.replace('Error', '');
        const inputElement = document.getElementById(inputId);
        if (inputElement) {
            inputElement.classList.remove('error');
        }
    }
}

// Validate email format
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Validate password strength
function isValidPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{8,}$/;
    return passwordRegex.test(password);
}

// Validate phone number
function isValidPhone(phone) {
    // Simple phone validation - accepts various formats
    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)\.]/g, ''));
}

// Redirect to appropriate dashboard
function redirectToDashboard() {
    const userType = sessionManager.getUserType();
    if (userType === 'admin') {
        window.location.href = 'dashboard-admin.html';
    } else {
        window.location.href = 'dashboard-member.html';
    }
}

// Login Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const adminLoginBtn = document.getElementById('adminLogin');
    
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value.trim();
            
            // Clear previous errors
            clearError('emailError');
            clearError('passwordError');
            
            // Validate inputs
            let isValid = true;
            
            if (!email) {
                showError('emailError', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('emailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!password) {
                showError('passwordError', 'Password is required');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Show loading state
            const loginText = document.getElementById('loginText');
            const loginSpinner = document.getElementById('loginSpinner');
            if (loginText && loginSpinner) {
                loginText.textContent = 'Logging in...';
                loginSpinner.style.display = 'inline-block';
            }
            
            // Simulate API call delay
            setTimeout(() => {
                // Validate credentials
                if (sessionManager.validateCredentials(email, password)) {
                    showToast('Login successful! Redirecting...', 'success');
                    
                    // Redirect after delay
                    setTimeout(() => {
                        redirectToDashboard();
                    }, 1000);
                } else {
                    showError('passwordError', 'Invalid email or password');
                    showToast('Login failed. Please check your credentials.', 'error');
                    
                    // Reset loading state
                    if (loginText && loginSpinner) {
                        loginText.textContent = 'Login to Dashboard';
                        loginSpinner.style.display = 'none';
                    }
                }
            }, 1000);
        });
    }
    
    // Admin login button (pre-filled credentials)
    if (adminLoginBtn) {
        adminLoginBtn.addEventListener('click', function() {
            document.getElementById('email').value = 'admin@coop.com';
            document.getElementById('password').value = 'admin123';
            showToast('Admin credentials filled. Click Login button.', 'success');
        });
    }
    
    // Register Form Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form values
            const fullName = document.getElementById('fullName').value.trim();
            const email = document.getElementById('regEmail').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const password = document.getElementById('regPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const address = document.getElementById('address').value.trim();
            const terms = document.getElementById('terms').checked;
            
            // Clear previous errors
            clearError('nameError');
            clearError('regEmailError');
            clearError('phoneError');
            clearError('regPasswordError');
            clearError('confirmPasswordError');
            clearError('addressError');
            clearError('termsError');
            
            // Validate inputs
            let isValid = true;
            
            if (!fullName) {
                showError('nameError', 'Full name is required');
                isValid = false;
            }
            
            if (!email) {
                showError('regEmailError', 'Email is required');
                isValid = false;
            } else if (!isValidEmail(email)) {
                showError('regEmailError', 'Please enter a valid email address');
                isValid = false;
            }
            
            if (!phone) {
                showError('phoneError', 'Phone number is required');
                isValid = false;
            } else if (!isValidPhone(phone)) {
                showError('phoneError', 'Please enter a valid phone number');
                isValid = false;
            }
            
            if (!password) {
                showError('regPasswordError', 'Password is required');
                isValid = false;
            } else if (!isValidPassword(password)) {
                showError('regPasswordError', 'Password must be at least 8 characters with uppercase, lowercase, and number');
                isValid = false;
            }
            
            if (!confirmPassword) {
                showError('confirmPasswordError', 'Please confirm your password');
                isValid = false;
            } else if (password !== confirmPassword) {
                showError('confirmPasswordError', 'Passwords do not match');
                isValid = false;
            }
            
            if (!address) {
                showError('addressError', 'Address is required');
                isValid = false;
            }
            
            if (!terms) {
                showError('termsError', 'You must agree to the terms and conditions');
                isValid = false;
            }
            
            if (!isValid) return;
            
            // Show loading state
            const registerText = document.getElementById('registerText');
            const registerSpinner = document.getElementById('registerSpinner');
            if (registerText && registerSpinner) {
                registerText.textContent = 'Creating Account...';
                registerSpinner.style.display = 'inline-block';
            }
            
            // Simulate API call delay
            setTimeout(() => {
                // Create user object
                const userData = {
                    name: fullName,
                    email: email,
                    password: password,
                    phone: phone,
                    address: address
                };
                
                // Register user
                const result = sessionManager.registerUser(userData);
                
                if (result.success) {
                    showToast('Registration successful! Welcome to our cooperative.', 'success');
                    
                    // Redirect after delay
                    setTimeout(() => {
                        redirectToDashboard();
                    }, 1500);
                } else {
                    showError('regEmailError', result.message);
                    showToast('Registration failed. Please try again.', 'error');
                    
                    // Reset loading state
                    if (registerText && registerSpinner) {
                        registerText.textContent = 'Create Account';
                        registerSpinner.style.display = 'none';
                    }
                }
            }, 1000);
        });
    }
});