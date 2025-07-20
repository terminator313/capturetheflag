// Challenges data - you can move this to a separate JSON file later
const challenges = [
    { 
        id: 1, 
        name: "Web Exploit 1", 
        category: "Web", 
        points: 100, 
        description: "Find the flag in this web page. Inspect the source code carefully.", 
        url: "challenges/web1.html" 
    },
    { 
        id: 2, 
        name: "Reverse Engineering", 
        category: "Reversing", 
        points: 200, 
        description: "Reverse this binary to find the hidden flag.", 
        url: "challenges/reverse1.html" 
    },
    { 
        id: 3, 
        name: "Cryptography Challenge", 
        category: "Crypto", 
        points: 150, 
        description: "Decrypt this message to reveal the flag.", 
        url: "challenges/crypto1.html" 
    }
];

// User management
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
        
        // Load the active tab
        const activeTab = document.querySelector('.tab-button.active');
        if (activeTab) {
            const tabId = activeTab.getAttribute('onclick').match(/'([^']+)'/)[1];
            openTab(tabId);
        }
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
        location.reload(); // Refresh to show login screen
    }
    
    generateToken(username) {
        // Generate a unique token based on username and a secret
        const secret = "CTF_SECRET_KEY_" + window.location.hostname; // Unique per domain
        return btoa(username + secret + Date.now()).substring(0, 32);
    }
    
    updateUI() {
        if (this.currentUser) {
            // Show user info in top right
            document.getElementById('user-info').innerHTML = `
                Welcome, <strong>${this.currentUser.username}</strong> | Score: <strong>${this.currentUser.score}</strong>
                <button onclick="userManager.logout()">Logout</button>
            `;
            // Hide login form
            document.getElementById('login-container').style.display = 'none';
        } else {
            // Show login form
            document.getElementById('user-info').innerHTML = '';
            document.getElementById('login-container').style.display = 'block';
        }
    }
    
    checkToken(username, token) {
        const storedToken = localStorage.getItem(`ctfToken_${username}`);
        return token === storedToken;
    }
}

const userManager = new UserManager();

// Tab functionality
function openTab(tabName) {
    // Hide all tab contents
    const tabContents = document.getElementsByClassName('tab-content');
    for (let i = 0; i < tabContents.length; i++) {
        tabContents[i].classList.remove('active');
    }
    
    // Deactivate all tab buttons
    const tabButtons = document.getElementsByClassName('tab-button');
    for (let i = 0; i < tabButtons.length; i++) {
        tabButtons[i].classList.remove('active');
    }
    
    // Activate the selected tab
    document.getElementById(tabName).classList.add('active');
    event.currentTarget.classList.add('active');
    
    // Load tab content
    switch(tabName) {
        case 'challenges':
            displayChallenges();
            break;
        case 'scoreboard':
            updateScoreboard();
            break;
        case 'charts':
            displayCharts();
            break;
    }
}

// Challenges functionality
function displayChallenges() {
    const container = document.getElementById('challenges-container');
    
    if (!userManager.currentUser) {
        container.innerHTML = '<p>Please login to view challenges.</p>';
        return;
    }
    
    let html = '';
    challenges.forEach(challenge => {
        const isSolved = userManager.currentUser.solvedChallenges.includes(challenge.id);
        
        html += `
        <div class="challenge-card">
            <div class="challenge-header">
                <div>
                    <div class="challenge-title">${challenge.name}</div>
                    <div class="challenge-category">${challenge.category}</div>
                </div>
                <div class="challenge-points">${challenge.points} pts</div>
            </div>
            <div class="challenge-body">
                <p>${challenge.description}</p>
                ${isSolved ? '<p style="color: #4CAF50;">✓ Solved</p>' : ''}
                <p>Challenge URL: <code>${window.location.origin}/${challenge.url}</code></p>
                <button class="challenge-button" onclick="startChallenge(${challenge.id})">
                    ${isSolved ? 'View Challenge' : 'Start Challenge'}
                </button>
            </div>
        </div>
        `;
    });
    
    container.innerHTML = html;
}

function startChallenge(id) {
    if (!userManager.currentUser) {
        alert("Please login first");
        return;
    }
    
    // Find the challenge
    const challenge = challenges.find(c => c.id === id);
    if (!challenge) return;
    
    const isSolved = userManager.currentUser.solvedChallenges.includes(challenge.id);
    
    // Show challenge details
    const modal = document.getElementById('challenge-modal');
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${challenge.name}</h2>
            <p><strong>Category:</strong> ${challenge.category}</p>
            <p><strong>Points:</strong> ${challenge.points}</p>
            <p><strong>Description:</strong> ${challenge.description}</p>
            <p><strong>Challenge URL:</strong> <a href="${challenge.url}" target="_blank">${challenge.url}</a></p>
            ${isSolved ? 
                '<p style="color: #4CAF50;">You have already solved this challenge!</p>' : 
                '<input type="text" id="flag-input" placeholder="Enter flag">'
            }
            <div style="margin-top: 20px;">
                ${isSolved ? 
                    '<button onclick="document.getElementById(\'challenge-modal\').style.display=\'none\'">Close</button>' : 
                    '<button onclick="submitFlag(' + challenge.id + ')">Submit Flag</button>'
                }
            </div>
        </div>
    `;
    modal.style.display = 'block';
}

// Flag submission
function getFlagForChallenge(challengeId) {
    // This is a simple obfuscation - for real security you'd need server-side validation
    const flags = {
        1: "FLAG{" + btoa("challenge1" + "SECRET_KEY").substring(0, 16) + "}",
        2: "FLAG{" + btoa("challenge2" + "SECRET_KEY").substring(0, 16) + "}",
        3: "FLAG{" + btoa("challenge3" + "SECRET_KEY").substring(0, 16) + "}"
    };
    return flags[challengeId];
}

function submitFlag(challengeId) {
    if (!userManager.currentUser) {
        alert("Please login first");
        return;
    }
    
    const userFlag = document.getElementById('flag-input').value;
    const correctFlag = getFlagForChallenge(challengeId);
    
    if (userFlag === correctFlag) {
        alert("Correct flag! Points awarded.");
        
        // Award points if not already solved
        if (!userManager.currentUser.solvedChallenges.includes(challengeId)) {
            const challenge = challenges.find(c => c.id === challengeId);
            userManager.currentUser.score += challenge.points;
            userManager.currentUser.solvedChallenges.push(challengeId);
            userManager.updateUI();
            
            // Save progress
            localStorage.setItem('ctfUser', JSON.stringify(userManager.currentUser));
            localStorage.setItem(`ctfScore_${userManager.currentUser.username}`, userManager.currentUser.score);
            localStorage.setItem(`ctfSolved_${userManager.currentUser.username}`, JSON.stringify(userManager.currentUser.solvedChallenges));
            
            // Update scoreboard
            updateScoreboard();
        }
        
        // Close modal
        document.getElementById('challenge-modal').style.display = 'none';
        // Refresh challenges view
        displayChallenges();
    } else {
        alert("Incorrect flag! Try again.");
    }
}

// Scoreboard functionality
function updateScoreboard() {
    const scoreboard = document.getElementById('scoreboard-content');
    scoreboard.innerHTML = '<h2>Loading scoreboard...</h2>';
    
    // Get all users and their scores
    let users = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ctfScore_')) {
            const username = key.replace('ctfScore_', '');
            const score = localStorage.getItem(key);
            users.push({ username, score: parseInt(score) });
        }
    }
    
    // Sort by score
    users.sort((a, b) => b.score - a.score);
    
    // Display
    let html = '<table><tr><th>Rank</th><th>Username</th><th>Score</th><th>Solved</th></tr>';
    users.forEach((user, index) => {
        const solved = JSON.parse(localStorage.getItem(`ctfSolved_${user.username}`)) || [];
        html += `<tr>
            <td>${index + 1}</td>
            <td>${user.username}</td>
            <td>${user.score}</td>
            <td>${solved.length}</td>
        </tr>`;
    });
    html += '</table>';
    
    scoreboard.innerHTML = html;
}

// Charts functionality
function displayCharts() {
    const ctx = document.getElementById('charts-canvas').getContext('2d');
    
    // Get all users and their scores
    let users = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ctfScore_')) {
            const username = key.replace('ctfScore_', '');
            const score = localStorage.getItem(key);
            users.push({ username, score: parseInt(score) });
        }
    }
    
    // Sort and take top 10
    users.sort((a, b) => b.score - a.score);
    const topUsers = users.slice(0, 10);
    
    // Destroy previous chart if exists
    if (window.ctfChart) {
        window.ctfChart.destroy();
    }
    
    window.ctfChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: topUsers.map(user => user.username),
            datasets: [{
                label: 'Top Scores',
                data: topUsers.map(user => user.score),
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderColor: 'rgba(75, 192, 192, 1)',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('challenge-modal');
    if (event.target == modal) {
        modal.style.display = "none";
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    // If user is logged in, show challenges by default
    if (userManager.currentUser) {
        document.querySelector('.tab-button:nth-child(2)').click();
    }
});
