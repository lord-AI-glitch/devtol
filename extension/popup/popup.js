/**
 * DevTol Official Browser Extension - Popup Engine (Manifest V3)
 * High-performance, offline-first client-side utilities and tool search
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initTabs();
  initToolsDirectory();
  initJsonTool();
  initTokenTool();
  initBase64Tool();
  initUnixTool();
});

// ==========================================
// 1. Theme Management (Dark / Light)
// ==========================================
function initTheme() {
  const toggleBtn = document.getElementById('themeToggle');
  const html = document.documentElement;

  // Retrieve saved preference
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
    chrome.storage.local.get(['theme'], (res) => {
      if (res && res.theme) {
        html.setAttribute('data-theme', res.theme);
      }
    });
  } else {
    const saved = localStorage.getItem('devtol_ext_theme');
    if (saved) html.setAttribute('data-theme', saved);
  }

  toggleBtn.addEventListener('click', () => {
    const current = html.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);

    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.set({ theme: next });
    } else {
      localStorage.setItem('devtol_ext_theme', next);
    }
  });
}

// ==========================================
// 2. Tab Navigation
// ==========================================
function initTabs() {
  const tabBtns = document.querySelectorAll('.tab-btn');
  const panels = document.querySelectorAll('.tab-panel');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      panels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const target = btn.getAttribute('data-tab');
      const activePanel = document.getElementById(`panel-${target}`);
      if (activePanel) {
        activePanel.classList.add('active');
        // Auto focus search input if search tab is activated
        if (target === 'search') {
          const input = document.getElementById('toolSearchInput');
          if (input) input.focus();
        }
      }
    });
  });
}

// ==========================================
// 3. Tools Directory & Fuzzy Search (122 Tools)
// ==========================================
let allTools = [];
let activeCategory = 'all';

async function initToolsDirectory() {
  const searchInput = document.getElementById('toolSearchInput');
  const clearBtn = document.getElementById('clearSearchBtn');
  const listContainer = document.getElementById('toolsList');
  const chipBtns = document.querySelectorAll('.chip-btn');

  try {
    const resp = await fetch('tools-catalog.json');
    allTools = await resp.json();
  } catch (err) {
    console.warn('Could not load tools-catalog.json, falling back to core registry', err);
    allTools = getCoreFallbackTools();
  }

  renderToolsList(allTools);

  // Search input handler
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.trim().toLowerCase();
    clearBtn.style.display = query ? 'block' : 'none';
    filterTools();
  });

  clearBtn.addEventListener('click', () => {
    searchInput.value = '';
    clearBtn.style.display = 'none';
    searchInput.focus();
    filterTools();
  });

  // Category filter chips
  chipBtns.forEach(chip => {
    chip.addEventListener('click', () => {
      chipBtns.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeCategory = chip.getAttribute('data-category');
      filterTools();
    });
  });
}

function filterTools() {
  const query = document.getElementById('toolSearchInput').value.trim().toLowerCase();

  const filtered = allTools.filter(tool => {
    const matchesCat = (activeCategory === 'all') ||
      (tool.category && tool.category.toLowerCase().includes(activeCategory)) ||
      (activeCategory === 'ai' && (tool.name.toLowerCase().includes('ai') || tool.path.includes('ai') || tool.path.includes('llm') || tool.path.includes('token')));

    if (!matchesCat) return false;
    if (!query) return true;

    const inName = tool.name.toLowerCase().includes(query);
    const inDesc = (tool.description || '').toLowerCase().includes(query);
    const inKeywords = (tool.keywords || []).some(k => k.toLowerCase().includes(query));
    const inPath = tool.path.toLowerCase().includes(query);

    return inName || inDesc || inKeywords || inPath;
  });

  renderToolsList(filtered);
}

function renderToolsList(tools) {
  const container = document.getElementById('toolsList');
  if (!container) return;

  if (tools.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 24px; color: var(--text-muted);">
        <p style="font-size: 13px; font-weight: 500;">No matching tools found</p>
        <p style="font-size: 11px; margin-top: 4px;">Try searching for "json", "jwt", "docker", "regex", or "base64"</p>
      </div>
    `;
    return;
  }

  container.innerHTML = tools.map(tool => `
    <a href="https://devtol.online${tool.path}?utm_source=chrome_extension" target="_blank" class="tool-card" title="${escapeHtml(tool.description || tool.name)}">
      <div class="tool-info">
        <div class="tool-name">
          <span>${escapeHtml(tool.name)}</span>
          <span class="tool-cat-tag">${escapeHtml(tool.category || 'Utility')}</span>
        </div>
        <div class="tool-desc">${escapeHtml(tool.description || 'Developer productivity tool')}</div>
      </div>
      <div class="tool-action-btn">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="9 18 15 12 9 6"/></svg>
      </div>
    </a>
  `).join('');
}

// ==========================================
// 4. JSON Prettifier & Minifier Tool
// ==========================================
function initJsonTool() {
  const input = document.getElementById('jsonInput');
  const badge = document.getElementById('jsonValidationBadge');
  const btn2 = document.getElementById('jsonPrettify2');
  const btn4 = document.getElementById('jsonPrettify4');
  const btnMin = document.getElementById('jsonMinify');
  const btnCopy = document.getElementById('jsonCopy');
  const btnClear = document.getElementById('jsonClear');

  function parseAndFormat(spaces) {
    const raw = input.value.trim();
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      input.value = spaces === 0 ? JSON.stringify(parsed) : JSON.stringify(parsed, null, spaces);
      badge.textContent = 'Valid JSON';
      badge.className = 'badge badge-success';
    } catch (err) {
      badge.textContent = 'Invalid JSON';
      badge.className = 'badge badge-error';
    }
  }

  btn2.addEventListener('click', () => parseAndFormat(2));
  btn4.addEventListener('click', () => parseAndFormat(4));
  btnMin.addEventListener('click', () => parseAndFormat(0));

  btnCopy.addEventListener('click', () => {
    if (!input.value) return;
    copyToClipboard(input.value);
  });

  btnClear.addEventListener('click', () => {
    input.value = '';
    badge.textContent = 'Ready';
    badge.className = 'badge badge-success';
  });

  input.addEventListener('input', () => {
    const raw = input.value.trim();
    if (!raw) {
      badge.textContent = 'Ready';
      badge.className = 'badge badge-success';
      return;
    }
    try {
      JSON.parse(raw);
      badge.textContent = 'Valid JSON';
      badge.className = 'badge badge-success';
    } catch (e) {
      badge.textContent = 'Invalid JSON';
      badge.className = 'badge badge-error';
    }
  });
}

// ==========================================
// 5. Password & Token Generator Tool
// ==========================================
function initTokenTool() {
  const slider = document.getElementById('tokenLengthSlider');
  const lengthVal = document.getElementById('tokenLengthVal');
  const output = document.getElementById('tokenOutput');
  const copyBtn = document.getElementById('tokenCopyBtn');
  const genBtn = document.getElementById('tokenGenerateBtn');
  const entropyBadge = document.getElementById('tokenEntropyBadge');

  const upper = document.getElementById('tokenUpper');
  const lower = document.getElementById('tokenLower');
  const nums = document.getElementById('tokenNumbers');
  const syms = document.getElementById('tokenSymbols');

  slider.addEventListener('input', () => {
    lengthVal.textContent = slider.value;
    generateSecret();
  });

  [upper, lower, nums, syms].forEach(chk => chk.addEventListener('change', generateSecret));
  genBtn.addEventListener('click', generateSecret);

  copyBtn.addEventListener('click', () => {
    const text = output.textContent;
    if (text && text !== 'Click Generate') {
      copyToClipboard(text);
    }
  });

  function generateSecret() {
    let pool = '';
    if (upper.checked) pool += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    if (lower.checked) pool += 'abcdefghijklmnopqrstuvwxyz';
    if (nums.checked) pool += '0123456789';
    if (syms.checked) pool += '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (!pool) {
      output.textContent = 'Select at least one set';
      entropyBadge.textContent = 'None';
      entropyBadge.className = 'badge badge-error';
      return;
    }

    const length = parseInt(slider.value, 10);
    const array = new Uint32Array(length);
    crypto.getRandomValues(array);

    let result = '';
    for (let i = 0; i < length; i++) {
      result += pool[array[i] % pool.length];
    }

    output.textContent = result;

    // Calculate entropy: length * log2(pool.length)
    const bits = Math.round(length * Math.log2(pool.length));
    if (bits >= 100) {
      entropyBadge.textContent = `${bits} bits (Crypto)`;
      entropyBadge.className = 'badge badge-success';
    } else if (bits >= 60) {
      entropyBadge.textContent = `${bits} bits (Strong)`;
      entropyBadge.className = 'badge badge-success';
    } else {
      entropyBadge.textContent = `${bits} bits (Weak)`;
      entropyBadge.className = 'badge badge-error';
    }
  }

  // Initial generation
  generateSecret();
}

// ==========================================
// 6. Base64 String Converter Tool
// ==========================================
function initBase64Tool() {
  const input = document.getElementById('b64Input');
  const output = document.getElementById('b64Output');
  const btnEncode = document.getElementById('b64ModeEncode');
  const btnDecode = document.getElementById('b64ModeDecode');
  const copyBtn = document.getElementById('b64CopyBtn');

  let mode = 'encode'; // 'encode' or 'decode'

  btnEncode.addEventListener('click', () => {
    mode = 'encode';
    btnEncode.className = 'primary-btn';
    btnDecode.className = 'secondary-btn';
    convert();
  });

  btnDecode.addEventListener('click', () => {
    mode = 'decode';
    btnDecode.className = 'primary-btn';
    btnEncode.className = 'secondary-btn';
    convert();
  });

  input.addEventListener('input', convert);

  copyBtn.addEventListener('click', () => {
    if (output.value) copyToClipboard(output.value);
  });

  function convert() {
    const raw = input.value;
    if (!raw) {
      output.value = '';
      return;
    }

    try {
      if (mode === 'encode') {
        // UTF-8 safe base64 encode
        const bytes = new TextEncoder().encode(raw);
        let binary = '';
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        output.value = btoa(binary);
      } else {
        // UTF-8 safe base64 decode
        const binary = atob(raw.trim());
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        output.value = new TextDecoder().decode(bytes);
      }
    } catch (err) {
      output.value = `Error: ${err.message}`;
    }
  }
}


// ==========================================
// 7. Unix Epoch & Time Converter Tool
// ==========================================
function initUnixTool() {
  const liveDisplay = document.getElementById('liveUnixDisplay');
  const copyBtn = document.getElementById('unixEpochCopy');
  const input = document.getElementById('unixInputVal');
  const convertBtn = document.getElementById('unixConvertBtn');
  const utcRes = document.getElementById('unixUtcRes');
  const localRes = document.getElementById('unixLocalRes');

  function updateClock() {
    const now = Math.floor(Date.now() / 1000);
    liveDisplay.textContent = now.toString();
  }

  updateClock();
  setInterval(updateClock, 1000);

  copyBtn.addEventListener('click', () => {
    copyToClipboard(liveDisplay.textContent);
  });

  convertBtn.addEventListener('click', () => {
    const val = input.value.trim();
    if (!val) return;
    const epochSec = parseInt(val, 10);
    if (isNaN(epochSec)) {
      utcRes.textContent = 'Invalid Epoch';
      localRes.textContent = 'Invalid Epoch';
      return;
    }

    const d = new Date(epochSec * 1000);
    utcRes.textContent = d.toISOString();
    localRes.textContent = d.toLocaleString();
  });
}

// ==========================================
// Utilities
// ==========================================
function copyToClipboard(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Copied to clipboard!');
  }).catch(err => {
    console.error('Clipboard copy failed:', err);
  });
}

let toastTimeout = null;
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove('show');
  }, 1600);
}

function escapeHtml(str) {
  return (str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function getCoreFallbackTools() {
  return [
    { name: "JSON Prettify & Format", path: "/json-prettify", category: "Web", description: "Beautify, format, and validate JSON" },
    { name: "AI Token & Cost Calculator", path: "/ai-token-cost-calculator", category: "AI Tools", description: "Calculate token usage and prompt pricing across LLMs" },
    { name: "Token & Password Generator", path: "/token-generator", category: "Crypto", description: "Generate secure random tokens and passwords" },
    { name: "cURL to Code Converter", path: "/curl-to-code-converter", category: "Development", description: "Convert cURL commands to Python, JS, Go, Rust" },
    { name: "AI Regex Generator & Explainer", path: "/ai-regex-generator-explainer", category: "AI Tools", description: "Natural language regex generator with visual breakdown" },
    { name: "SQL to ORM Converter", path: "/sql-to-orm-converter", category: "Development", description: "Convert SQL CREATE TABLE to Prisma, SQLAlchemy, Drizzle" },
    { name: "Docker Run to Compose", path: "/docker-run-to-docker-compose-converter", category: "Development", description: "Transform docker run commands to docker-compose.yml" },
    { name: "Base64 String Converter", path: "/base64-string-converter", category: "Converters", description: "Encode and decode text to/from Base64" },
    { name: "JWT Parser & Inspector", path: "/jwt-parser", category: "Web", description: "Inspect and decode JSON Web Tokens" }
  ];
}
