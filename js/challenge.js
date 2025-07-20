import { loadJSON } from './common.js';

(async () => {
    const id = location.hash.slice(1);
    const challenges = await loadJSON('../data/challenges.json');
    const challenge = challenges.find(c => c.id === id);
    
    if (!challenge) {
        document.body.innerHTML = '<h1 class="text-red-400 text-center mt-20">Challenge not found</h1>';
        return;
    }

    // Check if user is logged in
    const userData = localStorage.getItem('ctfUser');
    if (!userData) {
        window.location.href = '../index.html';
        return;
    }
    
    const user = JSON.parse(userData);
    const isSolved = user.solvedChallenges.includes(challenge.id);

    document.body.innerHTML = `
        <div class="container mx-auto max-w-3xl p-8">
            <a class="btn mb-6" href="../index.html#">← Back</a>
            <div class="bg-gray-700 rounded-xl p-8 shadow-lg ${isSolved ? 'challenge-solved' : ''}">
                <h1 class="text-3xl font-bold text-purple-400 mb-2">${challenge.title}</h1>
                <p class="mb-1"><span class="font-semibold">Category:</span> ${challenge.category}</p>
                <p class="mb-4"><span class="font-semibold">Points:</span> ${challenge.points}</p>
                <p class="mb-6">${challenge.description}</p>
                ${challenge.hint ? `<div class="bg-gray-600 rounded p-3 mb-4"><strong>Hint:</strong> ${challenge.hint}</div>` : ''}
                ${isSolved ? 
                    '<div class="text-green-400 font-bold text-center py-4">✓ Challenge Solved</div>' :
                    `<div>
                        <label class="block mb-2 font-semibold">Submit Flag:</label>
                        <input id="flag" class="w-full p-3 rounded bg-gray-900 border border-gray-600 mb-4 text-white" placeholder="FLAG{...}">
                        <button class="btn w-full" onclick="submitFlag('${challenge.id}',${challenge.points},'${challenge.flag}')">Submit</button>
                        <p id="msg" class="mt-4 text-center font-semibold"></p>
                    </div>`
                }
            </div>
        </div>`;

    window.submitFlag = (cid, pts, correct) => {
        const val = document.getElementById('flag').value.trim();
        const msg = document.getElementById('msg');
        
        if (val !== correct) {
            msg.textContent = 'Incorrect flag';
            msg.className = 'mt-4 text-center font-semibold text-red-400';
            return;
        }
        
        // Update user data
        const user = JSON.parse(localStorage.getItem('ctfUser'));
        if (!user.solvedChallenges.includes(cid)) {
            user.score += pts;
            user.solvedChallenges.push(cid);
            localStorage.setItem('ctfUser', JSON.stringify(user));
            localStorage.setItem(`ctfScore_${user.username}`, user.score);
            localStorage.setItem(`ctfSolved_${user.username}`, JSON.stringify(user.solvedChallenges));
            
            // Update scoreboard
            let scores = JSON.parse(localStorage.getItem('scores') || '[]');
            scores.push({ player: user.username, cid, pts, ts: Date.now() });
            localStorage.setItem('scores', JSON.stringify(scores));
        }
        
        msg.textContent = 'Correct! Challenge solved 🎉';
        msg.className = 'mt-4 text-center font-semibold text-green-400';
        document.querySelector('.bg-gray-700').classList.add('challenge-solved');
    };
})();
