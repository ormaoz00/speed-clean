// ============================================
// Speed Clean - Landing Page Scripts
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  initMobileMenu();
  initNavbarScroll();
  initCounters();
  initFAQ();
  initBeforeAfterSliders();
  initFormHandling();
  initSmoothScroll();
});

// --- Mobile Menu ---
function initMobileMenu() {
  const btn = document.getElementById('mobileMenuBtn');
  const links = document.getElementById('navLinks');
  if (!btn || !links) return;

  btn.addEventListener('click', () => {
    btn.classList.toggle('active');
    links.classList.toggle('active');
  });

  links.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      btn.classList.remove('active');
      links.classList.remove('active');
    });
  });
}

// --- Navbar Scroll Effect ---
function initNavbarScroll() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;

  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  });
}

// --- Animated Counters ---
function initCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

function animateCounter(el) {
  const target = parseFloat(el.dataset.target);
  const decimals = parseInt(el.dataset.decimals) || 0;
  const duration = 2000;
  const startTime = performance.now();

  function update(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = eased * target;

    el.textContent = decimals > 0
      ? current.toFixed(decimals)
      : Math.floor(current).toLocaleString('he-IL');

    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// --- FAQ Accordion ---
function initFAQ() {
  const items = document.querySelectorAll('.faq-item');

  items.forEach(item => {
    const btn = item.querySelector('.faq-question');
    const answer = item.querySelector('.faq-answer');

    btn.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      items.forEach(other => {
        other.classList.remove('active');
        other.querySelector('.faq-answer').style.maxHeight = '0';
      });

      if (!isActive) {
        item.classList.add('active');
        answer.style.maxHeight = answer.scrollHeight + 'px';
      }
    });
  });
}

// --- Before/After Sliders ---
function initBeforeAfterSliders() {
  const sliders = document.querySelectorAll('[data-ba]');

  sliders.forEach(slider => {
    const before = slider.querySelector('.ba-before');
    const handle = slider.querySelector('.ba-handle');
    let isDragging = false;

    function updatePosition(x) {
      const rect = slider.getBoundingClientRect();
      let percentage = ((x - rect.left) / rect.width) * 100;
      percentage = Math.max(5, Math.min(95, percentage));
      before.style.width = percentage + '%';
      handle.style.right = percentage + '%';
    }

    slider.addEventListener('mousedown', (e) => {
      isDragging = true;
      updatePosition(e.clientX);
    });

    document.addEventListener('mousemove', (e) => {
      if (isDragging) updatePosition(e.clientX);
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });

    slider.addEventListener('touchstart', (e) => {
      isDragging = true;
      updatePosition(e.touches[0].clientX);
    });

    slider.addEventListener('touchmove', (e) => {
      if (isDragging) {
        e.preventDefault();
        updatePosition(e.touches[0].clientX);
      }
    });

    slider.addEventListener('touchend', () => {
      isDragging = false;
    });
  });
}

// --- Form Handling ---
function initFormHandling() {
  const WEBHOOK_URL = 'https://hook.eu1.make.com/b4u7o3jd80luh399jw8bov437frivaox';
  const forms = document.querySelectorAll('#heroForm, #contactForm');

  forms.forEach(form => {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      data.form_source = form.id;

      const btn = form.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'שולח...';
      btn.disabled = true;

      fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      .then(response => {
        if (response.ok) {
          btn.textContent = 'נשלח בהצלחה! ✓';
          btn.style.background = '#10b981';
          setTimeout(() => {
            form.reset();
            btn.textContent = originalText;
            btn.style.background = '';
            btn.disabled = false;
          }, 3000);
        } else {
          throw new Error('Server error');
        }
      })
      .catch(() => {
        btn.textContent = 'שגיאה, נסו שוב';
        btn.style.background = '#ef4444';
        setTimeout(() => {
          btn.textContent = originalText;
          btn.style.background = '';
          btn.disabled = false;
        }, 3000);
      });
    });
  });
}

// --- Smooth Scroll ---
function initSmoothScroll() {
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
}
