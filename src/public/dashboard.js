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
  const { logs } = await callApi('/api/logs');
  const body = document.querySelector('#logTable tbody');

  body.innerHTML = logs.length
    ? logs.map(l => `
      <tr>
        <td>${new Date(l.created_at).toLocaleString()}</td>
        <td>${l.field_name}</td>
        <td>${l.action}</td>
        <td>${l.trigger_by}</td>
        <td>${l.moisture !== null ? l.moisture + '%' : '-'}</td>
      </tr>`).join('')
    : '<tr><td colspan="5">No irrigation yet.</td></tr>';
}

function refresh() {
  loadFields();
  loadLogs();
}

// ---- actions ----
document.getElementById('fieldForm').onsubmit = async (e) => {
  e.preventDefault();
  const name = document.getElementById('fName').value.trim();
  const crop = document.getElementById('fCrop').value.trim();
  const area = parseFloat(document.getElementById('fArea').value);
  const threshold = parseInt(document.getElementById('fThreshold').value, 10);

  if (!name || !crop) {
    return showMessage('Please provide both field name and crop type.', true);
  }
  if (isNaN(area) || area <= 0) {
    return showMessage('Area must be greater than 0.', true);
  }
  if (isNaN(threshold) || threshold < 1 || threshold > 100) {
    return showMessage('Threshold must be between 1% and 100%.', true);
  }

  try {
    await callApi('/api/fields', 'POST', { name, crop, area, threshold });
    e.target.reset();
    document.getElementById('fArea').value = 1;
    document.getElementById('fThreshold').value = 35;
    showMessage('Field added successfully.');
    refresh();
  } catch (err) { showMessage(err.message, true); }
};

async function pump(id, state) {
  try {
    const data = await callApi(`/api/pump/${id}/${state}`, 'POST');
    showMessage(data.message);
    refresh();
  } catch (err) { showMessage(err.message, true); }
}

async function removeField(id) {
  if (!confirm('Delete this field?')) return;
  try {
    const data = await callApi(`/api/fields/${id}`, 'DELETE');
    showMessage(data.message || 'Field deleted.');
    refresh();
  } catch (err) { showMessage(err.message, true); }
}

async function simulate() {
  const data = await callApi('/api/simulate', 'POST');
  showMessage(data.message);
  refresh();
}

async function runAuto() {
  const { results } = await callApi('/api/auto', 'POST');
  showMessage(results.join('  |  '));
  refresh();
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
