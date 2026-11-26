/* Preserve existing team text when loading older member records into the dropdown. */
export function setTeam(value = '') {
  const select = document.getElementById('fTeam');
  select.querySelectorAll('[data-existing-team]').forEach(option => option.remove());
  if (value && !Array.from(select.options).some(option => option.value === value)) {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value + ' (current team)';
    option.dataset.existingTeam = 'true';
    select.appendChild(option);
  }
  select.value = value;
  select.dispatchEvent(new Event('input'));
}
