'use strict';

// Portfolio demonstration: credentials exist in memory for this page visit only.
// Never use a real email or password in this demo.
document.addEventListener('DOMContentLoaded', () => {
  const nav = document.getElementById('navMenu');
  const menuButton = document.getElementById('menuButton');
  if (menuButton && nav) {
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('responsive');
      menuButton.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      nav.classList.remove('responsive');
      menuButton.setAttribute('aria-expanded', 'false');
    }));
  }

  document.getElementById('donateButton')?.addEventListener('click', event => {
    event.preventDefault();
    document.getElementById('donateInfo')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  });

  const modal = document.getElementById('authModal');
  const loginPanel = document.getElementById('loginPanel');
  const registerPanel = document.getElementById('registerPanel');
  const message = document.getElementById('authMessage');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  let demoAccount = null;

  function showPanel(mode) {
    if (!modal) return;
    modal.hidden = false;
    document.body.classList.add('modal-open');
    loginPanel.hidden = mode !== 'login';
    registerPanel.hidden = mode !== 'register';
    message.textContent = '';
    (mode === 'login' ? document.getElementById('loginEmail') : document.getElementById('firstName'))?.focus();
  }
  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    loginForm?.reset();
    registerForm?.reset();
  }
  document.querySelectorAll('[data-auth]').forEach(button => {
    button.addEventListener('click', () => showPanel(button.dataset.auth));
  });
  document.getElementById('closeAuth')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', event => {
    if (event.target === modal) closeModal();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') closeModal();
  });

  registerForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(registerForm);
    const firstName = String(data.get('firstName') || '').trim();
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    if (!firstName || !email || password.length < 6) {
      message.textContent = 'Enter a name, a valid demo email, and at least 6 characters for the demo password.';
      return;
    }
    // Temporary in-memory demo only; nothing is sent or saved.
    demoAccount = { firstName, email, password };
    registerForm.reset();
    showPanel('login');
    message.textContent = 'Demo account created for this page visit! Try signing in.';
  });

  loginForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(loginForm);
    const email = String(data.get('email') || '').trim().toLowerCase();
    const password = String(data.get('password') || '');
    if (demoAccount && email === demoAccount.email && password === demoAccount.password) {
      message.textContent = 'Welcome, ' + demoAccount.firstName + '! Demo sign-in successful.';
      loginForm.reset();
    } else {
      message.textContent = 'No matching demo account. Sign up first on this page (use fictional details).';
    }
  });
});
