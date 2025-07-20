import { loadJSON } from './common.js';

(async () => {
  const scores = JSON.parse(localStorage.getItem('scores') || '[]');
  const players = {};

  scores.forEach(s => {
    if (!players[s.player]) players[s.player] = { solved: 0, points: 0 };
    players[s.player].solved++;
    players[s.player].points += s.pts;
  });

  const sorted = Object.entries(players).sort((a, b) => b[1].points - a[1].points);

  document.getElementById('body').innerHTML = sorted.map(([p, d], i) => `
    <tr class="border-b border-gray-600">
      <td class="p-3">${i + 1}</td>
      <td class="p-3 font-mono text-purple-300">${p}</td>
      <td class="p-3">${d.solved}</td>
      <td class="p-3 font-bold text-green-400">${d.points}</td>
    </tr>`).join('');
})();