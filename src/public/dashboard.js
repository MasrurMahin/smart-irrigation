// Dashboard page - Members 2 and 3

function showMessage(text, isError) {
  const box = document.getElementById('message');
  box.textContent = text;
  box.className = 'message show' + (isError ? ' error' : '');
}

async function callApi(url, method = 'GET', body) {
  const options = { method, headers: { 'Content-Type': 'application/json' } };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(url, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

// ---- fields table (Member 2) ----
async function loadFields() {
  const { fields } = await callApi('/api/fields');
  const body = document.querySelector('#fieldTable tbody');

  if (fields.length === 0) {
    body.innerHTML = '<tr><td colspan="7">No fields yet. Add one above.</td></tr>';
    return;
  }

  body.innerHTML = fields.map(f => `
    <tr>
      <td>${f.name}</td>
      <td>${f.crop}</td>
      <td>${f.reading ? f.reading.moisture + '%' : '-'}</td>
      <td>${f.threshold}%</td>
      <td><span class="badge ${f.status === 'dry' ? 'dry' : 'ok'}">${f.status}</span></td>
      <td><span class="badge ${f.pump_status === 'ON' ? 'on' : 'off'}">${f.pump_status}</span></td>
      <td>
        <button class="small" onclick="pump(${f.id}, '${f.pump_status === 'ON' ? 'off' : 'on'}')">
          Turn ${f.pump_status === 'ON' ? 'OFF' : 'ON'}
        </button>
        <button class="small danger" onclick="removeField(${f.id})">Delete</button>
      </td>
    </tr>`).join('');
}

// ---- irrigation history (Member 3) ----
async function loadLogs() {
  try {
    const { logs } = await callApi('/api/logs');
    const body = document.querySelector('#logTable tbody');

    if (!logs || logs.length === 0) {
      body.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted); padding: 18px;">No irrigation history recorded yet.</td></tr>';
      return;
    }

    body.innerHTML = logs.map(l => {
      const actionBadge = `<span class="badge ${l.action === 'START' ? 'badge-start' : 'badge-stop'}">${l.action}</span>`;
      const triggerBadge = `<span class="badge ${l.trigger_by === 'AUTO' ? 'badge-auto' : 'badge-manual'}">${l.trigger_by}</span>`;
      const moistureDisplay = l.moisture !== null && l.moisture !== undefined ? `${Number(l.moisture)}%` : '<span style="color: #94a3b8;">-</span>';
      const timeFormatted = new Date(l.created_at).toLocaleString();

      return `
        <tr>
          <td>${timeFormatted}</td>
          <td><strong>${l.field_name}</strong></td>
          <td>${actionBadge}</td>
          <td>${triggerBadge}</td>
          <td>${moistureDisplay}</td>
        </tr>`;
    }).join('');
  } catch (err) {
    console.error('Error loading logs:', err);
  }
}

// ---- metrics overview (Member 3) ----
async function updateMetrics() {
  try {
    const [fieldsData, logsData] = await Promise.all([
      callApi('/api/fields'),
      callApi('/api/logs')
    ]);

    const fields = fieldsData.fields || [];
    const logs = logsData.logs || [];

    const totalEl = document.getElementById('statTotalFields');
    if (totalEl) totalEl.textContent = fields.length;

    const pumpEl = document.getElementById('statActivePumps');
    const activePumps = fields.filter(f => f.pump_status === 'ON').length;
    if (pumpEl) pumpEl.textContent = activePumps;

    const pulseDot = document.getElementById('pumpPulseDot');
    if (pulseDot) {
      if (activePumps > 0) pulseDot.classList.add('active');
      else pulseDot.classList.remove('active');
    }

    const dryEl = document.getElementById('statDryFields');
    if (dryEl) {
      dryEl.textContent = fields.filter(f => f.status === 'dry').length;
    }

    const logsEl = document.getElementById('statTotalLogs');
    if (logsEl) logsEl.textContent = logs.length;
  } catch (err) {
    // Non-blocking metrics update
  }
}

function refresh() {
  loadFields();
  loadLogs();
  updateMetrics();
}

// ---- actions ----
document.getElementById('fieldForm').onsubmit = async (e) => {
  e.preventDefault();
  try {
    await callApi('/api/fields', 'POST', {
      name: document.getElementById('fName').value,
      crop: document.getElementById('fCrop').value,
      area: document.getElementById('fArea').value,
      threshold: document.getElementById('fThreshold').value
    });
    e.target.reset();
    document.getElementById('fArea').value = 1;
    document.getElementById('fThreshold').value = 35;
    showMessage('Field added.');
    refresh();
  } catch (err) { showMessage(err.message, true); }
};

async function pump(id, state) {
  try {
    const data = await callApi(`/api/pump/${id}/${state}`, 'POST');
    showMessage(data.message || `Pump turned ${state}.`);
    refresh();
  } catch (err) { showMessage(err.message, true); }
}

async function removeField(id) {
  if (!confirm('Delete this field?')) return;
  await callApi(`/api/fields/${id}`, 'DELETE');
  showMessage('Field deleted.');
  refresh();
}

async function simulate() {
  const data = await callApi('/api/simulate', 'POST');
  showMessage(data.message);
  refresh();
}

async function runAuto() {
  try {
    const data = await callApi('/api/auto', 'POST');
    const results = data.results || [];
    showMessage(results.length ? results.join('  \u2022  ') : 'Auto irrigation check completed.');
    refresh();
  } catch (err) { showMessage(err.message, true); }
}

async function logout() {
  await callApi('/api/logout', 'POST');
  window.location.href = 'index.html';
}

// ---- start ----
callApi('/api/me')
  .then(data => {
    document.getElementById('userName').textContent = data.user.name;
    refresh();
  })
  .catch(() => { window.location.href = 'index.html'; });
