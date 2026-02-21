/* ===== STATE ===== */
let qrInstance = null;
let html5QrCode = null;
let scannerActive = false;
let lastScannedText = '';
let toastTimer = null;

/* ===== UTILITIES ===== */
function showToast(msg, duration = 2500) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), duration);
}

function isUrl(str) {
  try {
    const url = new URL(str.trim());
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/* ===== TAB SWITCHING ===== */
function switchTab(tab) {
  const tabs = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  tabs.forEach(t => {
    const isActive = t.id === `tab-${tab}`;
    t.classList.toggle('tab-active', isActive);
    t.setAttribute('aria-selected', isActive ? 'true' : 'false');
  });

  panels.forEach(p => {
    const isActive = p.id === `panel-${tab}`;
    p.classList.toggle('panel-active', isActive);
    p.classList.toggle('hidden', !isActive);
  });

  // Auto-stop scanner when leaving scan tab
  if (tab !== 'scan' && scannerActive) {
    stopScan();
  }
}

/* ===================== GENERATOR ===================== */
function handleInput() {
  const input = document.getElementById('qr-input');
  const counter = document.getElementById('char-counter');
  const btn = document.getElementById('btn-generate');
  const len = input.value.length;
  counter.textContent = `${len.toLocaleString('id')} karakter`;
  btn.disabled = len === 0;
}

function generateQR() {
  const input = document.getElementById('qr-input').value.trim();
  if (!input) return;

  const container = document.getElementById('qr-code');
  const output = document.getElementById('qr-output');
  const meta = document.getElementById('qr-meta');

  // Clear existing QR
  container.innerHTML = '';
  if (qrInstance) {
    try { qrInstance.clear(); } catch {}
    qrInstance = null;
  }

  // Calculate size based on container
  const size = Math.min(260, window.innerWidth - 120);

  try {
    qrInstance = new QRCode(container, {
      text: input,
      width: size,
      height: size,
      colorDark: '#1a1a2e',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.M,
    });
  } catch (err) {
    showToast('❌ Teks terlalu panjang untuk QR code');
    return;
  }

  // Show meta info
  const display = input.length > 60 ? input.substring(0, 57) + '…' : input;
  meta.textContent = display;

  output.classList.remove('hidden');
  output.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  showToast('✅ QR berhasil dibuat!');
}

function clearInput() {
  const input = document.getElementById('qr-input');
  const output = document.getElementById('qr-output');
  input.value = '';
  handleInput();
  output.classList.add('hidden');
  if (qrInstance) {
    try { qrInstance.clear(); } catch {}
    qrInstance = null;
  }
  input.focus();
}

function downloadQR() {
  // Try to get canvas first, then img (QRCode.js may render either)
  const wrapper = document.getElementById('qr-code');
  const canvas = wrapper.querySelector('canvas');
  const img = wrapper.querySelector('img');

  const link = document.createElement('a');
  link.download = 'qr-transfer.png';

  if (canvas) {
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('📥 QR berhasil didownload!');
  } else if (img) {
    // img src is already a data URL from QRCode.js
    fetch(img.src)
      .then(r => r.blob())
      .then(blob => {
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
      });
    showToast('📥 QR berhasil didownload!');
  } else {
    showToast('❌ QR belum dibuat');
  }
}

/* ===================== SCANNER ===================== */
function startScan() {
  const wrapper = document.getElementById('scanner-wrapper');
  const btnStart = document.getElementById('btn-start-scan');
  const btnStop = document.getElementById('btn-stop-scan');
  const errorEl = document.getElementById('scan-error');
  const resultEl = document.getElementById('scan-result');

  // Reset UI
  errorEl.classList.add('hidden');
  resultEl.classList.add('hidden');
  wrapper.classList.remove('hidden');
  btnStart.classList.add('hidden');
  btnStop.classList.remove('hidden');

  html5QrCode = new Html5Qrcode('qr-reader');

  const config = {
    fps: 12,
    qrbox: { width: 220, height: 220 },
    aspectRatio: 1.0,
    disableFlip: false,
  };

  Html5Qrcode.getCameras()
    .then(cameras => {
      if (!cameras || cameras.length === 0) {
        throw new Error('Tidak ada kamera yang ditemukan di perangkat ini.');
      }

      // Prefer back/environment camera on mobile
      const backCam = cameras.find(c =>
        c.label.toLowerCase().includes('back') ||
        c.label.toLowerCase().includes('environment') ||
        c.label.toLowerCase().includes('rear')
      );
      const cameraId = backCam ? backCam.id : cameras[0].id;

      return html5QrCode.start(
        cameraId,
        config,
        onScanSuccess,
        onScanFailure
      );
    })
    .catch(err => {
      showScanError(formatCameraError(err));
      resetScannerUI();
    });

  scannerActive = true;
}

function stopScan() {
  if (!html5QrCode || !scannerActive) return;
  html5QrCode.stop()
    .then(() => {
      html5QrCode = null;
      resetScannerUI();
    })
    .catch(() => {
      html5QrCode = null;
      resetScannerUI();
    });
}

function resetScannerUI() {
  const wrapper = document.getElementById('scanner-wrapper');
  const btnStart = document.getElementById('btn-start-scan');
  const btnStop = document.getElementById('btn-stop-scan');
  wrapper.classList.add('hidden');
  btnStop.classList.add('hidden');
  btnStart.classList.remove('hidden');
  scannerActive = false;
}

function onScanSuccess(decodedText) {
  lastScannedText = decodedText;

  // Stop scanner after success
  stopScan();

  // Show result
  const resultEl = document.getElementById('scan-result');
  const textEl = document.getElementById('scan-text');
  const openLinkBtn = document.getElementById('btn-open-link');

  textEl.textContent = decodedText;
  resultEl.classList.remove('hidden');
  resultEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

  // Show "Buka Link" button only if it's a URL
  if (isUrl(decodedText)) {
    openLinkBtn.style.display = 'inline-flex';
  } else {
    openLinkBtn.style.display = 'none';
  }

  showToast('🎉 QR berhasil di-scan!');
}

function onScanFailure(error) {
  // Silently ignore scan frame failures (normal during scanning)
}

function showScanError(msg) {
  const errorEl = document.getElementById('scan-error');
  const msgEl = document.getElementById('scan-error-msg');
  msgEl.textContent = msg;
  errorEl.classList.remove('hidden');
}

function formatCameraError(err) {
  const msg = (err?.message || err || '').toString().toLowerCase();
  if (msg.includes('permission') || msg.includes('denied') || msg.includes('notallowed')) {
    return 'Izin kamera ditolak. Buka pengaturan browser dan izinkan akses kamera untuk halaman ini.';
  }
  if (msg.includes('notfound') || msg.includes('tidak ada kamera')) {
    return 'Tidak ada kamera yang ditemukan di perangkat ini.';
  }
  if (msg.includes('insecure') || msg.includes('https')) {
    return 'Kamera hanya bisa diakses via HTTPS. Coba buka lewat localhost atau deploy ke GitHub Pages.';
  }
  return `Gagal mengakses kamera: ${err?.message || err}`;
}

function copyResult() {
  if (!lastScannedText) return;
  const btn = document.getElementById('btn-copy');

  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(lastScannedText)
      .then(() => {
        showToast('📋 Teks disalin!');
        const orig = btn.innerHTML;
        btn.innerHTML = `<svg viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M4 10l4 4 8-8" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg> Disalin!`;
        setTimeout(() => { btn.innerHTML = orig; }, 2000);
      })
      .catch(() => fallbackCopy());
  } else {
    fallbackCopy();
  }
}

function fallbackCopy() {
  const el = document.createElement('textarea');
  el.value = lastScannedText;
  el.style.position = 'fixed';
  el.style.opacity = '0';
  document.body.appendChild(el);
  el.focus(); el.select();
  try {
    document.execCommand('copy');
    showToast('📋 Teks disalin!');
  } catch {
    showToast('❌ Gagal menyalin teks. Salin manual.');
  }
  document.body.removeChild(el);
}

function openLink() {
  if (isUrl(lastScannedText)) {
    window.open(lastScannedText, '_blank', 'noopener,noreferrer');
  }
}

function resetScan() {
  lastScannedText = '';
  document.getElementById('scan-result').classList.add('hidden');
  document.getElementById('scan-error').classList.add('hidden');
  document.getElementById('btn-open-link').style.display = 'none';
}

/* ===== KEYBOARD SHORTCUT ===== */
document.addEventListener('keydown', (e) => {
  // Ctrl/Cmd + Enter → Generate
  if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
    const panel = document.getElementById('panel-generate');
    if (!panel.classList.contains('hidden')) {
      generateQR();
    }
  }
});

/* ===== ENTER KEY on textarea ===== */
document.getElementById('qr-input').addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
    generateQR();
  }
});
