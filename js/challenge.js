import { loadJSON, getPlayer, setPlayer } from './common.js';

(async () => {
  const id = location.hash.slice(1);
  const challenges = await loadJSON('../data/challenges.json');
  const ch = challenges.find(c => c.id === id);
  if (!ch) { document.body.innerHTML = '<h1 class="text-red-400 text-center mt-20">Challenge not found</h1>'; return; }

  // username gate
  let player = getPlayer();
  if (!player) {
    document.body.innerHTML = `
      <div class="min-h-screen flex items-center justify-center">
        <div class="bg-gray-700 rounded-xl p-8 max-w-sm w-full text-center">
          <h2 class="text-2xl font-bold mb-4">Enter Player Name</h2>
          <input id="nick" class="w-full p-3 rounded bg-gray-900 border border-gray-600 mb-4 text-white" placeholder="Player">
          <button class="btn w-full" onclick="localStorage.setItem('player',document.getElementById('nick').value.trim());location.reload()">Continue</button>
        </div>
      </div>`;
    return;
  }

  // challenge page
  document.body.innerHTML = `
    <div class="container mx-auto max-w-3xl p-8">
      <a class="btn mb-6" href="../index.html#">← Back</a>
      <div class="bg-gray-700 rounded-xl p-8 shadow-lg">
        <h1 class="text-3xl font-bold text-purple-400 mb-2">${ch.title}</h1>
        <p class="mb-1"><span class="font-semibold">Category:</span> ${ch.category}</p>
        <p class="mb-4"><span class="font-semibold">Points:</span> ${ch.points}</p>
        <p class="mb-6">${ch.description}</p>
        ${ch.hint ? `<div class="bg-gray-600 rounded p-3 mb-4"><strong>Hint:</strong> ${ch.hint}</div>` : ''}
        <div>
          <label class="block mb-2 font-semibold">Submit Flag:</label>
          <input id="flag" class="w-full p-3 rounded bg-gray-900 border border-gray-600 mb-4 text-white" placeholder="FLAG{...}">
          <button class="btn w-full" onclick="submitFlag('${ch.id}',${ch.points},'${ch.flag}')">Submit</button>
          <p id="msg" class="mt-4 text-center font-semibold"></p>
        </div>
      </div>
    </div>`;

  window.submitFlag = (cid, pts, correct) => {
    const val = document.getElementById('flag').value.trim();
    const msg = document.getElementById('msg');
    if (val !== correct) { msg.textContent = 'Incorrect flag'; msg.className = 'text-red-400'; return; }
    let scores = JSON.parse(localStorage.getItem('scores') || '[]');
    scores.push({ player, cid, pts, ts: Date.now() });
    localStorage.setItem('scores', JSON.stringify(scores));
    msg.textContent = 'Correct! Challenge solved 🎉';
    msg.className = 'text-green-400';
  };
})();