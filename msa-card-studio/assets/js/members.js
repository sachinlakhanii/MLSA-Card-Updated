import { $, loadImage } from './utils.js';
import { state } from './state.js';
import { showPhoto, resetCardTheme } from './card.js';
import { resetEditor } from './editor.js';
import { githubHandle } from './handles.js';
import { setTeam } from './team-select.js';

export function initMembers() {
  const key = $('#adminKey'), select = $('#memberSelect'), note = $('#membersNote');
  let list = [];
  async function request(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { 'x-admin-key': key.value.trim(), ...(options.body ? { 'Content-Type': 'application/json' } : {}) } });
    let data = {}; try { data = await response.json(); } catch (e) { /* response may not be JSON */ }
    if (!response.ok) throw new Error(response.status === 401 ? 'Wrong admin key.' : response.status === 404 ? (data.error || 'The members API is unavailable. Restart the studio with npm run dev and open http://localhost:3000.') : data.error || 'Server error. Check the settings.');
    return data;
  }
  function report(error) { note.textContent = error instanceof TypeError ? 'Could not connect. Check your connection.' : error.message; }
  async function refresh() {
    try {
      sessionStorage.setItem('msaAdminKey', key.value.trim());
      const data = await request('/api/members'); list = data.members; select.textContent = '';
      list.forEach(m => { const option = document.createElement('option'); option.value = m.slug; option.textContent = [m.name, m.role, m.team].filter(Boolean).join(' — '); select.appendChild(option); });
      note.textContent = list.length ? `${list.length} member(s) loaded.` : 'No members yet.';
    } catch (e) { report(e); }
  }
  $('#loadMembers').addEventListener('click', refresh);
  document.addEventListener('members-changed', refresh);
  $('#editMember').addEventListener('click', async () => {
    if (!select.value) { note.textContent = 'Select a member first.'; return; }
    try {
      const m = await request('/api/member?slug=' + encodeURIComponent(select.value));
      const image = m.photo ? await loadImage(m.photo) : null;
      setTeam(m.team || '');
      [['fName', m.name], ['fRole', m.role], ['fLi', m.linkedin], ['fGh', githubHandle(m.github)]].forEach(([id, value]) => { const input = document.getElementById(id); input.value = value || ''; input.dispatchEvent(new Event('input')); });
      $('#slug').value = m.slug; $('#slug').readOnly = true;
      state.mode = 'update'; state.photo = m.photo; state.srcImg = image; resetEditor(); showPhoto(); $('#edBtn').disabled = !image;
      resetCardTheme();
      $('#editingNote').textContent = 'Editing: ' + m.name; $('#pubBtn').textContent = 'Update member'; note.textContent = 'Member loaded.';
    } catch (e) { report(e); }
  });
  $('#newMember').addEventListener('click', () => {
    state.mode = 'create'; state.photo = null; state.srcImg = null; resetEditor(); showPhoto(); $('#edBtn').disabled = true;
    setTeam();
    ['fName', 'fRole', 'fLi', 'fGh'].forEach(id => { const input = document.getElementById(id); input.value = ''; input.dispatchEvent(new Event('input')); });
    $('#slug').readOnly = false; $('#slug').value = ''; document.dispatchEvent(new Event('new-member'));
    resetCardTheme(); $('#editingNote').textContent = ''; $('#pubBtn').textContent = 'Publish member'; $('#pubNote').textContent = ''; note.textContent = 'Ready for a new member.';
  });
  $('#deleteMember').addEventListener('click', async () => {
    const m = list.find(item => item.slug === select.value);
    if (!m) { note.textContent = 'Select a member first.'; return; }
    if (!window.confirm('Delete ' + m.name + '?')) return;
    try {
      await request('/api/delete', { method: 'POST', body: JSON.stringify({ slug: m.slug }) });
      if (state.mode === 'update' && $('#slug').value === m.slug) $('#newMember').click();
      await refresh(); note.textContent = m.name + ' deleted.';
    } catch (e) { report(e); }
  });
}
