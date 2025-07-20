import { loadJSON } from './common.js';

(async () => {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  const challenges = await loadJSON('../data/challenges.json');

  const totalByCat = {};
  const solvedByCat = {};

  challenges.forEach(c => {
    totalByCat[c.category] = (totalByCat[c.category] || 0) + 1;
  });
  scores.forEach(s => {
    const cat = challenges.find(c => c.id === s.cid).category;
    solvedByCat[cat] = (solvedByCat[cat] || 0) + 1;
  });

  document.getElementById('charts').innerHTML = Object.keys(totalByCat).map(cat => {
    const solved = solvedByCat[cat] || 0;
    const total = totalByCat[cat];
    const pct = total ? Math.round(solved / total * 100) : 0;
    return `
      <div class="bg-gray-700 rounded-xl p-4">
        <div class="flex justify-between mb-1">
          <span class="font-semibold">${cat}</span>
          <span class="text-purple-300">${solved} / ${total}</span>
        </div>
        <div class="w-full bg-gray-600 rounded-full h-2.5">
          <div class="bg-purple-500 h-2.5 rounded-full" style="width:${pct}%"></div>
        </div>
      </div>`;
  }).join('');
})();
