'use strict';

document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navMenu');
  const menuButton = document.getElementById('menuButton');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('responsive');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => nav.classList.remove('responsive')));
  }

  const modal = document.getElementById('authModal');
  const closeBtn = document.getElementById('closeAuth');
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const authMessage = document.getElementById('authMessage');

  const showPanel = mode => {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    const loginMode = mode === 'login';
    loginPanel.hidden = !loginMode;
    registerPanel.hidden = loginMode;
    authMessage.textContent = '';
    setTimeout(() => modal.querySelector('input:not([type="checkbox"])')?.focus(), 0);
  };
  const closeModal = () => {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
  };

  document.querySelectorAll('[data-auth="login"]').forEach(b => b.addEventListener('click', () => showPanel('login')));
  document.querySelectorAll('[data-auth="register"]').forEach(b => b.addEventListener('click', () => showPanel('register')));
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeModal(); });

  const registerForm = document.getElementById('registerForm');
  registerForm?.addEventListener('submit', e => {
    e.preventDefault();
    const data = new FormData(registerForm);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    const firstName = String(data.get('firstName') || '').trim();
    if (!firstName || !email || password.length < 6) {
      authMessage.textContent = 'Please enter your name, a valid email, and a password of at least 6 characters.';
      return;
    }
    localStorage.setItem('churchDemoUser', JSON.stringify({ firstName, email, password }));
    authMessage.textContent = 'Account saved on this browser. You can sign in now.';
    setTimeout(() => showPanel('login'), 900);
  });

  const loginForm = document.getElementById('loginForm');
  loginForm?.addEventListener('submit', e => {
    e.preventDefault();
    const saved = JSON.parse(localStorage.getItem('churchDemoUser') || 'null');
    const data = new FormData(loginForm);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    if (saved && saved.email === email && saved.password === password) {
      authMessage.textContent = `Welcome, ${saved.firstName}! Demo sign-in successful.`;
      loginForm.reset();
    } else {
      authMessage.textContent = 'No matching demo account was found. Please sign up first.';
    }
  });

  const donate = document.getElementById('donateButton');
  donate?.addEventListener('click', e => {
    e.preventDefault();
    document.getElementById('donateInfo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });
});
