// Login and register page - Member 1

function showTab(tab) {
  const login = tab === 'login';
  document.getElementById('loginForm').classList.toggle('hidden', !login);
  document.getElementById('registerForm').classList.toggle('hidden', login);
  document.getElementById('tabLogin').classList.toggle('active', login);
  document.getElementById('tabRegister').classList.toggle('active', !login);
}

function showMessage(text, isError) {
  const box = document.getElementById('message');
  box.textContent = text;
  box.className = 'message show' + (isError ? ' error' : '');
}

document.getElementById('loginForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('loginEmail').value,
      password: document.getElementById('loginPassword').value
    })
  });
  const data = await res.json();
  if (res.ok) window.location.href = 'dashboard.html';
  else showMessage(data.error, true);
};

document.getElementById('registerForm').onsubmit = async (e) => {
  e.preventDefault();
  const res = await fetch('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: document.getElementById('regName').value,
      email: document.getElementById('regEmail').value,
      password: document.getElementById('regPassword').value
    })
  });
  const data = await res.json();
  if (res.ok) window.location.href = 'dashboard.html';
  else showMessage(data.error, true);
};
