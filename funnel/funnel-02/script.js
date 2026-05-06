// ============================================
// Speed Clean — Funnel 02 Scripts
// Form-only funnel (no direct call / WhatsApp)
// ============================================

// --- Supabase Config ---
const SUPABASE_URL = 'https://zpsohcjzbngfjnkmuwep.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_ItbypEWGFQCv99Cs4vHkIw_2E7wWdbM';
const sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// --- UTM Helper ---
function getUTMParams() {
  const params = new URLSearchParams(window.location.search);
  return {
    utm_source:   params.get('utm_source')   || null,
    utm_medium:   params.get('utm_medium')   || null,
    utm_campaign: params.get('utm_campaign') || null,
    utm_term:     params.get('utm_term')     || null,
    utm_content:  params.get('utm_content')  || null,
  };
}

const utmData = getUTMParams();

// ============================================
// FAQ Accordion
// ============================================
document.querySelectorAll('.faq-q').forEach(btn => {
  btn.addEventListener('click', () => {
    const isOpen = btn.classList.contains('open');
    document.querySelectorAll('.faq-q').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.style.maxHeight = null;
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.nextElementSibling.style.maxHeight = btn.nextElementSibling.scrollHeight + 'px';
    }
  });
});

// ============================================
// Reveal on Scroll
// ============================================
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

// ============================================
// Contact Form → Supabase
// ============================================
async function handleFormSubmit(form, btnId, formSource) {
  const btn = document.getElementById(btnId);
  const originalText = btn.textContent;
  btn.textContent = 'שולח...';
  btn.disabled = true;

  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  const lead = {
    name:         data.name    || null,
    phone:        data.phone   || null,
    service:      data.service || null,
    city:         data.city    || null,
    consent:      data.consent === 'on' ? true : false,
    form_source:  formSource,
    funnel:       'funnel-02',
    page_url:     window.location.href,
    ...utmData,
  };

  try {
    const { error } = await sb.from('leads').insert([lead]);
    if (error) throw error;

    // Send to Make.com webhook (non-blocking)
    fetch('/api/webhook', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(lead),
    }).catch(err => console.warn('Make webhook failed (non-blocking):', err));

    // GTM dataLayer event
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: 'lead_submitted',
      form_id: formSource,
      lead_service: lead.service,
      funnel: 'funnel-02',
    });

    btn.textContent = '✓ נשלח! נחזור אליכם בקרוב';
    btn.style.background = '#10b981';
    form.reset();
    window.location.href = '/v2/thank-you/';
  } catch (err) {
    console.error('Supabase insert error:', err);
    btn.textContent = 'שגיאה, נסו שוב';
    btn.style.background = '#ef4444';
    setTimeout(() => {
      btn.textContent = originalText;
      btn.style.background = '';
      btn.disabled = false;
    }, 3000);
  }
}

// Main contact form
document.getElementById('contactForm').addEventListener('submit', (e) => {
  e.preventDefault();
  handleFormSubmit(e.target, 'submitBtn', 'contactForm');
});

// Exit intent form
document.getElementById('exitForm').addEventListener('submit', (e) => {
  e.preventDefault();
  handleFormSubmit(e.target, 'exitSubmitBtn', 'exitPopup');
});

// ============================================
// Exit Intent Popup
// ============================================
(function () {
  const overlay = document.getElementById('exitOverlay');
  const closeBtn = document.getElementById('exitClose');
  let shown = false;

  function showExit() {
    if (shown) return;
    shown = true;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function hideExit() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  // Desktop: mouse leaves viewport top
  document.addEventListener('mouseout', (e) => {
    if (e.clientY < 5 && !e.relatedTarget && !e.toElement) showExit();
  });

  // Mobile: back button / scroll-up intent after 30s
  let mobileTimer = setTimeout(() => {
    let lastScroll = window.scrollY;
    window.addEventListener('scroll', function onScroll() {
      if (window.scrollY < lastScroll - 100) {
        showExit();
        window.removeEventListener('scroll', onScroll);
      }
      lastScroll = window.scrollY;
    });
  }, 30000);

  closeBtn.addEventListener('click', hideExit);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) hideExit();
  });
})();

// ============================================
// Viewers Badge (social proof)
// ============================================
(function () {
  const badge = document.getElementById('viewersBadge');
  const countEl = document.getElementById('viewersCount');

  setTimeout(() => {
    badge.classList.add('visible');
  }, 4000);

  // Vary count naturally
  setInterval(() => {
    const current = parseInt(countEl.textContent);
    const delta = Math.random() > 0.5 ? 1 : -1;
    const next = Math.max(2, Math.min(8, current + delta));
    countEl.textContent = next;
  }, 12000);
})();

// ============================================
// Accessibility Widget
// ============================================
(function () {
  const btn      = document.getElementById('accBtn');
  const panel    = document.getElementById('accPanel');
  const closeBtn = document.getElementById('accClose');
  const body     = document.body;

  let fontLevel = 0;
  const MAX_FONT = 4, MIN_FONT = -2;

  function togglePanel(open) {
    panel.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', open);
  }

  btn.addEventListener('click', () => togglePanel(!panel.classList.contains('open')));
  closeBtn.addEventListener('click', () => togglePanel(false));

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && e.target !== btn) togglePanel(false);
  });

  // Font size
  function applyFont() {
    const pct = 100 + fontLevel * 10;
    document.documentElement.style.fontSize = pct + '%';
    document.getElementById('accFontVal').textContent = pct + '%';
    save('accFont', fontLevel);
  }
  document.getElementById('accFontInc').addEventListener('click', () => {
    if (fontLevel < MAX_FONT) { fontLevel++; applyFont(); }
  });
  document.getElementById('accFontDec').addEventListener('click', () => {
    if (fontLevel > MIN_FONT) { fontLevel--; applyFont(); }
  });

  // Toggles
  function makeToggle(id, cls, key) {
    const el = document.getElementById(id);
    el.addEventListener('change', () => {
      body.classList.toggle(cls, el.checked);
      save(key, el.checked);
    });
    return el;
  }
  const tContrast = makeToggle('accContrast', 'acc-high-contrast', 'accContrast');
  const tGray     = makeToggle('accGray',     'acc-grayscale',      'accGray');
  const tLinks    = makeToggle('accLinks',    'acc-highlight-links','accLinks');
  const tAnim     = makeToggle('accAnim',     'acc-no-anim',        'accAnim');
  const tCursor   = makeToggle('accCursor',   'acc-large-cursor',   'accCursor');

  // Reset
  document.getElementById('accReset').addEventListener('click', () => {
    fontLevel = 0; applyFont();
    [tContrast, tGray, tLinks, tAnim, tCursor].forEach(t => {
      t.checked = false; t.dispatchEvent(new Event('change'));
    });
    localStorage.removeItem('accPrefs');
  });

  // Persist to localStorage
  function save(key, val) {
    try {
      const prefs = JSON.parse(localStorage.getItem('accPrefs') || '{}');
      prefs[key] = val;
      localStorage.setItem('accPrefs', JSON.stringify(prefs));
    } catch (_) {}
  }

  // Restore on load
  try {
    const prefs = JSON.parse(localStorage.getItem('accPrefs') || '{}');
    if (prefs.accFont != null) { fontLevel = prefs.accFont; applyFont(); }
    if (prefs.accContrast) { tContrast.checked = true; tContrast.dispatchEvent(new Event('change')); }
    if (prefs.accGray)     { tGray.checked = true;     tGray.dispatchEvent(new Event('change'));     }
    if (prefs.accLinks)    { tLinks.checked = true;    tLinks.dispatchEvent(new Event('change'));    }
    if (prefs.accAnim)     { tAnim.checked = true;     tAnim.dispatchEvent(new Event('change'));     }
    if (prefs.accCursor)   { tCursor.checked = true;   tCursor.dispatchEvent(new Event('change'));   }
  } catch (_) {}
})();

// ============================================
// Smooth Scroll for anchor links
// ============================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    const targetId = this.getAttribute('href');
    if (targetId === '#') return;
    const target = document.querySelector(targetId);
    if (target) {
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
});
