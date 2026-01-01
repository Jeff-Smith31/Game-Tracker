/* TableTop HQ — Letter Jam Virtual Sheet (offline-first) */
(function() {
  const DEFAULT_ROWS = 6; // typical word length + extra
  const COLS = 13; // generous for letter jam grids
  const STORAGE_KEY = 'tabletop_hq_letterjam_v1';

  const gridEl = document.getElementById('grid');
  const notesEl = document.getElementById('notes');
  const yearEl = document.getElementById('year');
  const installBtn = document.getElementById('installBtn');
  const helpBtn = document.getElementById('helpBtn');
  const helpDialog = document.getElementById('helpDialog');

  const addRowBtn = document.getElementById('addRowBtn');
  const removeRowBtn = document.getElementById('removeRowBtn');
  const saveBtn = document.getElementById('saveBtn');
  const clearBtn = document.getElementById('clearBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importInput = document.getElementById('importInput');
  const howToInstall = document.getElementById('howToInstall');

  yearEl.textContent = new Date().getFullYear();

  function createRow(cells) {
    const row = document.createElement('div');
    row.className = 'row';
    for (let c = 0; c < COLS; c++) {
      const wrap = document.createElement('div');
      wrap.className = 'cell';
      const input = document.createElement('input');
      input.type = 'text';
      input.inputMode = 'text';
      input.autocomplete = 'off';
      input.autocapitalize = 'characters';
      input.maxLength = 1;
      input.placeholder = '·';
      input.value = (cells && cells[c]) ? cells[c] : '';
      input.addEventListener('input', e => {
        // Allow only A–Z letters
        let v = e.target.value.toUpperCase();
        v = v.replace(/[^A-Z]/g, '');
        e.target.value = v.slice(0,1);
      });
      wrap.appendChild(input);
      row.appendChild(wrap);
    }
    return row;
  }

  function getState() {
    const rows = Array.from(gridEl.querySelectorAll('.row'));
    const data = rows.map(row => Array.from(row.querySelectorAll('input')).map(i => i.value));
    return {
      data,
      notes: notesEl.value || ''
    };
  }

  function setState(state) {
    gridEl.innerHTML = '';
    const rows = state?.data?.length ? state.data.length : DEFAULT_ROWS;
    for (let r = 0; r < rows; r++) {
      const cells = state?.data?.[r] || [];
      gridEl.appendChild(createRow(cells));
    }
    notesEl.value = state?.notes || '';
  }

  function save() {
    const state = getState();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    toast('Saved locally.');
  }

  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        setState(JSON.parse(raw));
        return;
      }
    } catch (e) { /* ignore */ }
    // default
    setState({});
  }

  function clearAll() {
    if (!confirm('Clear the sheet? This cannot be undone.')) return;
    setState({});
    save();
  }

  function exportJSON() {
    const state = getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    const ts = new Date().toISOString().replace(/[:.]/g,'-');
    a.href = url;
    a.download = `TableTopHQ-LetterJam-${ts}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function importJSON(file) {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const state = JSON.parse(reader.result);
        setState(state);
        save();
        toast('Imported.');
      } catch (e) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
  }

  // Simple toast
  let toastId = 0;
  function toast(msg) {
    const id = `t${++toastId}`;
    const el = document.createElement('div');
    el.id = id;
    el.style.position = 'fixed';
    el.style.bottom = '16px';
    el.style.left = '50%';
    el.style.transform = 'translateX(-50%)';
    el.style.background = 'linear-gradient(180deg, #1565c0, #0d47a1)';
    el.style.color = 'white';
    el.style.padding = '10px 16px';
    el.style.borderRadius = '12px';
    el.style.boxShadow = '0 8px 24px rgba(0,0,0,.35)';
    el.style.zIndex = '1000';
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1800);
  }

  // Events
  addRowBtn.addEventListener('click', () => {
    gridEl.appendChild(createRow());
  });
  removeRowBtn.addEventListener('click', () => {
    const rows = gridEl.querySelectorAll('.row');
    if (rows.length > 0) rows[rows.length - 1].remove();
  });
  saveBtn.addEventListener('click', save);
  clearBtn.addEventListener('click', clearAll);
  exportBtn.addEventListener('click', exportJSON);
  importInput.addEventListener('change', () => {
    const f = importInput.files && importInput.files[0];
    if (f) importJSON(f);
    importInput.value = '';
  });

  helpBtn.addEventListener('click', () => {
    helpDialog.showModal();
  });
  document.getElementById('closeHelp').addEventListener('click', () => helpDialog.close());

  howToInstall.addEventListener('click', (e) => {
    e.preventDefault();
    const ua = navigator.userAgent || '';
    let msg = 'Use your browser\'s menu to Add to Home Screen / Install app.';
    if (/iPhone|iPad|iPod/.test(ua)) {
      msg = 'iOS: Tap Share (square with arrow) > Add to Home Screen.';
    } else if (/Android/.test(ua)) {
      msg = 'Android: Tap ⋮ menu > Install app or Add to Home screen.';
    }
    alert(msg);
  });

  // PWA install prompt
  let deferredPrompt;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.hidden = false;
  });
  installBtn.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const choice = await deferredPrompt.userChoice;
    if (choice.outcome === 'accepted') {
      toast('Installing...');
    }
    installBtn.hidden = true;
    deferredPrompt = null;
  });

  // Init
  load();
})();
