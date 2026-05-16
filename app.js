/* ════════════════════════════════════════════════════
   TaskFlow — Frontend Application
   API Base URL: Update BASE_URL to match your server
   ════════════════════════════════════════════════════ */

const BASE_URL = 'http://localhost/task-app'; // ← Change this to your server path

const API = {
  register: `${BASE_URL}/register.php`,  // POST { username, password }
  login:    `${BASE_URL}/login.php`,     // POST { username, password } → token
  logout:   `${BASE_URL}/logout.php`,   // POST (Authorization header)
  getTasks: `${BASE_URL}/get_task.php`, // GET  (Authorization header)
  addTask:  `${BASE_URL}/add_task.php`, // POST { task } + Authorization header
};

// ── State ──
let token = localStorage.getItem('tf_token') || null;
let username = localStorage.getItem('tf_username') || null;

// ── DOM References ──
const authScreen      = document.getElementById('auth-screen');
const dashScreen      = document.getElementById('dashboard-screen');
const loginTab        = document.getElementById('login-tab');
const registerTab     = document.getElementById('register-tab');
const loginError      = document.getElementById('login-error');
const registerError   = document.getElementById('register-error');
const registerSuccess = document.getElementById('register-success');
const taskList        = document.getElementById('task-list');
const tasksLoading    = document.getElementById('tasks-loading');
const tasksEmpty      = document.getElementById('tasks-empty');
const taskCountLabel  = document.getElementById('task-count-label');
const taskError       = document.getElementById('task-error');
const addModal        = document.getElementById('add-modal');
const addTaskError    = document.getElementById('add-task-error');

// ════════════════════════════════════════
// ROUTING — show correct screen on load
// ════════════════════════════════════════
function init() {
  if (token) {
    showDashboard();
  } else {
    showAuth();
  }
}

function showAuth() {
  authScreen.classList.remove('hidden');
  authScreen.classList.add('active');
  dashScreen.classList.add('hidden');
  dashScreen.classList.remove('active');
}

function showDashboard() {
  authScreen.classList.add('hidden');
  authScreen.classList.remove('active');
  dashScreen.classList.remove('hidden');
  dashScreen.classList.add('active');

  // Set user info in sidebar
  document.getElementById('sidebar-username').textContent = username || 'User';
  document.getElementById('user-avatar').textContent = (username || 'U')[0].toUpperCase();

  loadTasks();
}

// ════════════════════════════════════════
// TAB SWITCHING
// ════════════════════════════════════════
document.querySelectorAll('.tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    const tab = btn.dataset.tab;
    loginTab.classList.add('hidden');
    loginTab.classList.remove('active');
    registerTab.classList.add('hidden');
    registerTab.classList.remove('active');

    const target = tab === 'login' ? loginTab : registerTab;
    target.classList.remove('hidden');
    target.classList.add('active');

    clearAlerts();
  });
});

// ════════════════════════════════════════
// AUTH — REGISTER
// ════════════════════════════════════════
document.getElementById('register-btn').addEventListener('click', async () => {
  const uname = document.getElementById('reg-username').value.trim();
  const pwd   = document.getElementById('reg-password').value.trim();

  clearAlerts();

  if (!uname || !pwd) return showAlert(registerError, 'Please fill in all fields.');
  if (pwd.length < 6) return showAlert(registerError, 'Password must be at least 6 characters.');

  setLoading('register-btn', true);

  try {
    const res = await fetch(API.register, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uname, password: pwd }),
    });

    const data = await res.json();

    if (data.status === 'success') {
      showAlert(registerSuccess, '✓ Account created! You can now sign in.');
      document.getElementById('reg-username').value = '';
      document.getElementById('reg-password').value = '';
    } else {
      showAlert(registerError, data.message || 'Registration failed. Username may be taken.');
    }
  } catch (err) {
    showAlert(registerError, 'Cannot connect to the server. Check BASE_URL in app.js.');
  } finally {
    setLoading('register-btn', false);
  }
});

// ════════════════════════════════════════
// AUTH — LOGIN
// ════════════════════════════════════════
document.getElementById('login-btn').addEventListener('click', async () => {
  const uname = document.getElementById('login-username').value.trim();
  const pwd   = document.getElementById('login-password').value.trim();

  clearAlerts();
  if (!uname || !pwd) return showAlert(loginError, 'Please fill in all fields.');

  setLoading('login-btn', true);

  try {
    const res = await fetch(API.login, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: uname, password: pwd }),
    });

    const data = await res.json();

    if (data.status === 'success' && data.token) {
      token = data.token;
      username = uname;
      localStorage.setItem('tf_token', token);
      localStorage.setItem('tf_username', username);
      showDashboard();
    } else {
      showAlert(loginError, 'Invalid username or password.');
    }
  } catch (err) {
    showAlert(loginError, 'Cannot connect to the server. Check BASE_URL in app.js.');
  } finally {
    setLoading('login-btn', false);
  }
});

// Allow Enter key to submit login
document.getElementById('login-password').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});
document.getElementById('login-username').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('login-btn').click();
});

// ════════════════════════════════════════
// AUTH — LOGOUT
// ════════════════════════════════════════
document.getElementById('logout-btn').addEventListener('click', async () => {
  try {
    await fetch(API.logout, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
    });
  } catch (_) { /* ignore network errors on logout */ }

  token = null;
  username = null;
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_username');
  showAuth();
});

// ════════════════════════════════════════
// TASKS — LOAD
// ════════════════════════════════════════
async function loadTasks() {
  tasksLoading.classList.remove('hidden');
  tasksEmpty.classList.add('hidden');
  taskList.classList.add('hidden');
  taskError.classList.add('hidden');
  taskList.innerHTML = '';

  try {
    const res = await fetch(API.getTasks, {
      method: 'GET',
      headers: { 'Authorization': token },
    });

    if (res.status === 401) {
      handleUnauthorized();
      return;
    }

    const data = await res.json();
    tasksLoading.classList.add('hidden');

    if (Array.isArray(data) && data.length > 0) {
      renderTasks(data);
    } else {
      tasksEmpty.classList.remove('hidden');
      taskCountLabel.textContent = '0 tasks';
    }
  } catch (err) {
    tasksLoading.classList.add('hidden');
    taskError.classList.remove('hidden');
    taskError.textContent = 'Failed to load tasks. Check your server connection.';
  }
}

function renderTasks(tasks) {
  taskList.classList.remove('hidden');
  taskCountLabel.textContent = `${tasks.length} task${tasks.length !== 1 ? 's' : ''}`;

  tasks.forEach((task, i) => {
    const card = document.createElement('div');
    card.className = 'task-card';
    card.style.animationDelay = `${i * 0.04}s`;

    const taskText = task.task || task.description || task.title || JSON.stringify(task);
    const taskId   = task.id || task.task_id || i + 1;

    card.innerHTML = `
      <div class="task-check" title="Mark complete"></div>
      <div class="task-body">
        <p class="task-text">${escapeHTML(taskText)}</p>
        <span class="task-id-badge">#${taskId}</span>
      </div>
    `;

    // Toggle done state (local UI only, no delete endpoint provided)
    card.querySelector('.task-check').addEventListener('click', function() {
      this.classList.toggle('done');
      card.querySelector('.task-text').classList.toggle('done');
    });

    taskList.appendChild(card);
  });
}

// ════════════════════════════════════════
// TASKS — ADD
// ════════════════════════════════════════
document.getElementById('open-add-modal').addEventListener('click', () => {
  document.getElementById('task-input').value = '';
  addTaskError.classList.add('hidden');
  addModal.classList.remove('hidden');
  addModal.classList.add('active');
  setTimeout(() => document.getElementById('task-input').focus(), 100);
});

function closeModal() {
  addModal.classList.add('hidden');
  addModal.classList.remove('active');
}

document.getElementById('close-modal').addEventListener('click', closeModal);
document.getElementById('cancel-modal').addEventListener('click', closeModal);
addModal.addEventListener('click', e => { if (e.target === addModal) closeModal(); });

document.getElementById('add-task-btn').addEventListener('click', async () => {
  const taskText = document.getElementById('task-input').value.trim();
  addTaskError.classList.add('hidden');

  if (!taskText) return showAlert(addTaskError, 'Please enter a task description.');

  setLoading('add-task-btn', true);

  try {
    const res = await fetch(API.addTask, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify({ task: taskText }),
    });

    if (res.status === 401) { handleUnauthorized(); return; }

    const data = await res.json();

    if (data.status === 'task added' || data.status === 'success') {
      closeModal();
      loadTasks(); // Refresh task list
    } else {
      showAlert(addTaskError, data.message || 'Failed to add task.');
    }
  } catch (err) {
    showAlert(addTaskError, 'Cannot connect to the server.');
  } finally {
    setLoading('add-task-btn', false);
  }
});

// Ctrl+Enter to submit from textarea
document.getElementById('task-input').addEventListener('keydown', e => {
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    document.getElementById('add-task-btn').click();
  }
});

// ════════════════════════════════════════
// HELPERS
// ════════════════════════════════════════
function showAlert(el, msg) {
  el.textContent = msg;
  el.classList.remove('hidden');
}

function clearAlerts() {
  [loginError, registerError, registerSuccess, addTaskError].forEach(el => {
    el.classList.add('hidden');
    el.textContent = '';
  });
}

function setLoading(btnId, loading) {
  const btn    = document.getElementById(btnId);
  const text   = btn.querySelector('.btn-text');
  const loader = btn.querySelector('.btn-loader');
  btn.disabled = loading;
  text.classList.toggle('hidden', loading);
  loader.classList.toggle('hidden', !loading);
}

function handleUnauthorized() {
  token = null;
  username = null;
  localStorage.removeItem('tf_token');
  localStorage.removeItem('tf_username');
  showAuth();
  showAlert(loginError, 'Session expired. Please sign in again.');
}

function escapeHTML(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Boot ──
init();
