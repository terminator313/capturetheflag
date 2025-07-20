import { loadJSON } from './common.js';

const ALL_CATEGORIES = [
    'Web Exploitation','Networking','Forensics','Mobile Exploitation',
    'Cryptography','Reverse Engineering','Binary Exploitation','Miscellaneous'
];

/* ---------- tabs ---------- */
const TABS = ['dashboard','scoreboard','charts'];
function switchTab(tab){
    if (!userManager.currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    TABS.forEach(t => document.getElementById('tab-'+t).classList.remove('tab-active'));
    document.getElementById('tab-'+tab).classList.add('tab-active');
    render(tab);
}

/* ---------- views ---------- */
async function render(tab){
    const app = document.getElementById('app');
    switch(tab){
        case 'dashboard': {
            const challenges = await loadJSON('./data/challenges.json');
            const counts = {};
            ALL_CATEGORIES.forEach(c => counts[c] = 0);
            challenges.forEach(c => counts[c.category]++);
            
            app.innerHTML = `
                <h2 class="text-4xl font-extrabold text-center mb-8">Challenge Categories</h2>
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
                ${ALL_CATEGORIES.map(cat => {
                    const icon = cat === 'Web Exploitation' ? '🕸️' :
                                cat === 'Networking' ? '🌐' :
                                cat === 'Forensics' ? '🔬' :
                                cat === 'Mobile Exploitation' ? '📱' :
                                cat === 'Cryptography' ? '🔑' :
                                cat === 'Reverse Engineering' ? '⚙️' :
                                cat === 'Binary Exploitation' ? '💻' : '❓';
                    return `
                        <div class="bg-gray-700 rounded-xl p-6 text-center cursor-pointer hover:scale-105 transition transform"
                             onclick="openCategory('${cat}')">
                            <div class="text-5xl mb-4 text-purple-400">${icon}</div>
                            <h3 class="text-2xl font-semibold mb-2">${cat}</h3>
                            <p class="text-gray-300">${counts[cat]} Challenges</p>
                        </div>`;
                }).join('')}
                </div>`;
            break;
        }
        case 'scoreboard': {
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const players = {};
            
            scores.forEach(s => {
                if (!players[s.player]) players[s.player] = { solved: 0, points: 0 };
                players[s.player].solved++;
                players[s.player].points += s.pts;
            });
            
            const sorted = Object.entries(players).sort((a, b) => b[1].points - a[1].points);
            
            app.innerHTML = `
                <h2 class="text-4xl font-extrabold text-center mb-8">Scoreboard</h2>
                <div class="bg-gray-700 rounded-xl overflow-x-auto max-w-4xl mx-auto">
                    <table class="w-full text-left">
                        <thead>
                            <tr class="border-b border-gray-600">
                                <th class="p-3">#</th>
                                <th class="p-3">Player</th>
                                <th class="p-3">Solved</th>
                                <th class="p-3">Points</th>
                            </tr>
                        </thead>
                        <tbody>
                        ${sorted.map(([p, d], i) => `
                            <tr class="border-b border-gray-600">
                                <td class="p-3">${i + 1}</td>
                                <td class="p-3 font-mono text-purple-300">${p}</td>
                                <td class="p-3">${d.solved}</td>
                                <td class="p-3 font-bold text-green-400">${d.points}</td>
                            </tr>`).join('')}
                        </tbody>
                    </table>
                </div>`;
            break;
        }
        case 'charts': {
            const challenges = await loadJSON('./data/challenges.json');
            const scores = JSON.parse(localStorage.getItem('scores') || '[]');
            const totalByCat = {};
            const solvedByCat = {};
            
            ALL_CATEGORIES.forEach(c => {
                totalByCat[c] = 0;
                solvedByCat[c] = 0;
            });
            
            challenges.forEach(c => totalByCat[c.category]++);
            scores.forEach(s => {
                const cat = challenges.find(c => c.id === s.cid).category;
                solvedByCat[cat]++;
            });
            
            app.innerHTML = `
                <h2 class="text-4xl font-extrabold text-center mb-8">Statistics</h2>
                <div class="space-y-6 max-w-4xl mx-auto">
                ${ALL_CATEGORIES.map(cat => {
                    const pct = totalByCat[cat] ? Math.round(solvedByCat[cat] / totalByCat[cat] * 100) : 0;
                    return `
                        <div class="bg-gray-700 rounded-xl p-4">
                            <div class="flex justify-between mb-1">
                                <span class="font-semibold">${cat}</span>
                                <span class="text-purple-300">${solvedByCat[cat]} / ${totalByCat[cat]}</span>
                            </div>
                            <div class="w-full bg-gray-600 rounded-full h-2.5">
                                <div class="bg-purple-500 h-2.5 rounded-full" style="width:${pct}%"></div>
                            </div>
                        </div>`;
                }).join('')}
                </div>`;
            break;
        }
    }
}

/* ---------- category drill-down ---------- */
window.openCategory = async function(cat) {
    if (!userManager.currentUser) {
        document.getElementById('login-modal').classList.remove('hidden');
        return;
    }
    
    const challenges = await loadJSON('./data/challenges.json');
    const list = challenges.filter(c => c.category === cat);
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <button class="btn mb-6" onclick="switchTab('dashboard')">← Back</button>
        <h2 class="text-3xl font-bold mb-6">${cat}</h2>
        <div class="grid gap-6">
        ${list.map(c => {
            const solved = userManager.currentUser.solvedChallenges.includes(c.id);
            return `
                <div class="bg-gray-700 rounded-xl p-6 flex justify-between items-center ${solved ? 'challenge-solved' : ''}">
                    <div>
                        <h3 class="text-xl font-semibold">${c.title}</h3>
                        <p class="text-gray-300">${c.points} pts</p>
                        <p class="text-gray-400 mt-2">${c.description}</p>
                    </div>
                    <a class="btn" href="./challenge.html#${c.id}">Solve</a>
                </div>`;
        }).join('')}
        </div>`;
}

/* ---------- init ---------- */
switchTab('dashboard');
document.getElementById('yr').textContent = new Date().getFullYear();
