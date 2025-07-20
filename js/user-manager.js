class UserManager {
    constructor() {
        this.currentUser = null;
        this.loadUser();
    }
    
    loadUser() {
        const userData = localStorage.getItem('ctfUser');
        if (userData) {
            this.currentUser = JSON.parse(userData);
            this.updateUI();
        } else {
            document.getElementById('login-modal').classList.remove('hidden');
        }
    }
    
    login(username) {
        if (!username.trim()) {
            alert("Please enter a valid username");
            return;
        }
        
        // Generate a unique token for the user
        const token = this.generateToken(username);
        this.currentUser = {
            username,
            token,
            score: parseInt(localStorage.getItem(`ctfScore_${username}`)) || 0,
            solvedChallenges: JSON.parse(localStorage.getItem(`ctfSolved_${username}`)) || []
        };
        
        localStorage.setItem('ctfUser', JSON.stringify(this.currentUser));
        localStorage.setItem(`ctfToken_${username}`, token);
        this.updateUI();
        document.getElementById('login-modal').classList.add('hidden');
        
        // Load the active tab
        switchTab('dashboard');
    }
    
    logout() {
        // Save progress before logging out
        if (this.currentUser) {
            localStorage.setItem(`ctfScore_${this.currentUser.username}`, this.currentUser.score);
            localStorage.setItem(`ctfSolved_${this.currentUser.username}`, JSON.stringify(this.currentUser.solvedChallenges));
        }
        localStorage.removeItem('ctfUser');
        this.currentUser = null;
        this.updateUI();
        document.getElementById('login-modal').classList.remove('hidden');
        switchTab('dashboard');
    }
    
    generateToken(username) {
        // Generate a unique token based on username and a secret
        const secret = "CTF_SECRET_KEY_" + window.location.hostname;
        return btoa(username + secret + Date.now()).substring(0, 32);
    }
    
    updateUI() {
        const usernameDisplay = document.getElementById('username-display');
        const logoutBtn = document.getElementById('logout-btn');
        
        if (this.currentUser) {
            usernameDisplay.textContent = `${this.currentUser.username} (${this.currentUser.score} pts)`;
            usernameDisplay.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
        } else {
            usernameDisplay.classList.add('hidden');
            logoutBtn.classList.add('hidden');
        }
    }
}

const userManager = new UserManager();
