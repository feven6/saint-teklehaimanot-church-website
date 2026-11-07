'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navMenu');
  const menuButton = document.getElementById('menuButton');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('responsive');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      nav.classList.remove('responsive');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }
  const donate = document.getElementById('donateButton');
  donate?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('donateInfo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
