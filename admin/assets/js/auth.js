// Check authentication status on page load
document.addEventListener('DOMContentLoaded', async function() {
    try {
        const response = await fetch('/auth/status');
        const data = await response.json();
        
        if (!data.authenticated) {
            // Redirect to login if not authenticated
            window.location.href = '/admin/login.html';
            return;
        }
        
        // Update user info in header
        updateUserInfo(data.user);
        
    } catch (error) {
        console.error('Auth check failed:', error);
        window.location.href = '/admin/login.html';
    }
});

function updateUserInfo(user) {
    const userAvatar = document.querySelector('.user-avatar');
    const userName = document.querySelector('.user-name');
    
    if (userAvatar && user.avatar) {
        userAvatar.src = user.avatar;
    }
    
    if (userName) {
        userName.textContent = user.name;
    }
}

// Logout function
function logout() {
    window.location.href = '/auth/logout';
}

// Add logout event listener
document.addEventListener('DOMContentLoaded', function() {
    const logoutLink = document.querySelector('.logout-link');
    if (logoutLink) {
        logoutLink.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

