export const loadJSON = async url => (await fetch(url)).json();
export const getPlayer = () => localStorage.getItem('player');
export const setPlayer = name => localStorage.setItem('player', name.trim());