// Authentication JavaScript

// Check if user is already logged in on page load
document.addEventListener('DOMContentLoaded', function() {
    const currentUser = localStorage.getItem('currentUser');
    const currentPage = window.location.pathname.split('/').pop();
    
    // If user is logged in and on auth pages, redirect to todos
    if (currentUser && (currentPage === 'login.html' || currentPage === 'register.html' || currentPage === 'index.html' || currentPage === '')) {
        window.location.href = 'Todos.html';
        return;
    }
    
    // If user is not logged in and on todos page, redirect to login
    if (!currentUser && currentPage === 'Todos.html') {
        window.location.href = 'login.html';
        return;
    }
    
    initializeAuthPage();
});

function initializeAuthPage() {
    const currentPage = window.location.pathname.split('/').pop();
    
    if (currentPage === 'login.html') {
        initializeLogin();
    } else if (currentPage === 'register.html') {
        initializeRegister();
    }
}

function initializeLogin() {
    const loginForm = document.getElementById('loginForm');
    const showRegisterBtn = document.getElementById('showRegister');
    const togglePasswordBtn = document.getElementById('toggleLoginPassword');
    const passwordInput = document.getElementById('loginPassword');
    const errorDiv = document.getElementById('loginError');
    
    // Handle login form submission
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });
    
    // Handle show register button
    showRegisterBtn.addEventListener('click', function() {
        window.location.href = 'register.html';
    });
    
    // Handle password toggle
    togglePasswordBtn.addEventListener('click', function() {
        togglePasswordVisibility(passwordInput, togglePasswordBtn);
    });
    
    // Handle Enter key on form inputs
    const inputs = loginForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleLogin();
            }
        });
    });
}

function initializeRegister() {
    const registerForm = document.getElementById('registerForm');
    const showLoginBtn = document.getElementById('showLogin');
    const togglePasswordBtns = document.querySelectorAll('.password-toggle');
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    
    // Handle register form submission
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleRegister();
    });
    
    // Handle show login button
    showLoginBtn.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
    
    // Handle password toggles
    togglePasswordBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const passwordInput = btn.parentElement.querySelector('input');
            togglePasswordVisibility(passwordInput, btn);
        });
    });
    
    // Handle Enter key on form inputs
    const inputs = registerForm.querySelectorAll('input');
    inputs.forEach(input => {
        input.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                handleRegister();
            }
        });
    });
    
    // Real-time password validation
    const passwordInput = document.getElementById('registerPassword');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    confirmPasswordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
    
    passwordInput.addEventListener('input', function() {
        validatePasswordMatch();
    });
}

function handleLogin() {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const rememberMe = document.getElementById('rememberMe').checked;
    const errorDiv = document.getElementById('loginError');
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    
    // Clear previous errors
    hideError(errorDiv);
    
    // Validate inputs
    if (!email || !password) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    // Simulate API call delay
    setTimeout(() => {
        const users = getStoredUsers();
        const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
        
        if (user) {
            // Login successful
            const loginData = {
                id: user.id,
                name: user.name,
                email: user.email,
                loginTime: new Date().toISOString()
            };
            
            localStorage.setItem('currentUser', JSON.stringify(loginData));
            
            if (rememberMe) {
                localStorage.setItem('rememberUser', email);
            } else {
                localStorage.removeItem('rememberUser');
            }
            
            // Redirect to todos
            window.location.href = 'Todos.html';
        } else {
            // Login failed
            setLoadingState(submitBtn, false);
            showError(errorDiv, 'Invalid email or password');
        }
    }, 1000);
}

function handleRegister() {
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const agreeTerms = document.getElementById('agreeTerms').checked;
    const errorDiv = document.getElementById('registerError');
    const successDiv = document.getElementById('registerSuccess');
    const submitBtn = registerForm.querySelector('button[type="submit"]');
    
    // Clear previous messages
    hideError(errorDiv);
    hideSuccess(successDiv);
    
    // Validate inputs
    if (!name || !email || !password || !confirmPassword) {
        showError(errorDiv, 'Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError(errorDiv, 'Please enter a valid email address');
        return;
    }
    
    if (password.length < 6) {
        showError(errorDiv, 'Password must be at least 6 characters long');
        return;
    }
    
    if (password !== confirmPassword) {
        showError(errorDiv, 'Passwords do not match');
        return;
    }
    
    if (!agreeTerms) {
        showError(errorDiv, 'Please agree to the Terms and Conditions');
        return;
    }
    
    // Show loading state
    setLoadingState(submitBtn, true);
    
    // Simulate API call delay
    setTimeout(() => {
        const users = getStoredUsers();
        
        // Check if user already exists
        if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
            setLoadingState(submitBtn, false);
            showError(errorDiv, 'An account with this email already exists');
            return;
        }
        
        // Create new user (in a real app, password should be hashed)
        const newUser = {
            id: generateUserId(),
            name: name,
            email: email.toLowerCase(),
            password: password, // In production, this should be hashed
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        setLoadingState(submitBtn, false);
        showSuccess(successDiv, 'Account created successfully! Redirecting to login...');
        
        // Redirect to login after 2 seconds
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    }, 1000);
}

function togglePasswordVisibility(input, button) {
    const icon = button.querySelector('i');
    
    if (input.type === 'password') {
        input.type = 'text';
        icon.classList.remove('fa-eye');
        icon.classList.add('fa-eye-slash');
    } else {
        input.type = 'password';
        icon.classList.remove('fa-eye-slash');
        icon.classList.add('fa-eye');
    }
}

function validatePasswordMatch() {
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const confirmInput = document.getElementById('confirmPassword');
    
    if (confirmPassword && password !== confirmPassword) {
        confirmInput.style.borderColor = '#dc3545';
    } else {
        confirmInput.style.borderColor = '#e4e7eb';
    }
}

function getStoredUsers() {
    const users = localStorage.getItem('users');
    return users ? JSON.parse(users) : [];
}

function generateUserId() {
    return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showError(errorDiv, message) {
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideError(errorDiv) {
    errorDiv.style.display = 'none';
}

function showSuccess(successDiv, message) {
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    successDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

function hideSuccess(successDiv) {
    successDiv.style.display = 'none';
}

function setLoadingState(button, loading) {
    if (loading) {
        button.disabled = true;
        button.classList.add('loading');
    } else {
        button.disabled = false;
        button.classList.remove('loading');
    }
}

// Auto-fill remembered email on login page
if (window.location.pathname.includes('login.html')) {
    document.addEventListener('DOMContentLoaded', function() {
        const rememberedEmail = localStorage.getItem('rememberUser');
        if (rememberedEmail) {
            const emailInput = document.getElementById('loginEmail');
            const rememberCheckbox = document.getElementById('rememberMe');
            if (emailInput) {
                emailInput.value = rememberedEmail;
                rememberCheckbox.checked = true;
            }
        }
    });
}

// Logout function (to be used in todos page)
function logout() {
    localStorage.removeItem('currentUser');
    window.location.href = 'login.html';
}

// Export logout function for use in other files
window.logout = logout;