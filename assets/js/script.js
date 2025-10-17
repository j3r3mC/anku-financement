document.addEventListener('DOMContentLoaded', () => {
  const contactBtn = document.getElementById('contactBtn');
  const downloadBtn = document.getElementById('downloadDocs');

  const contactModal = document.getElementById('contactModal');
  const downloadModal = document.getElementById('downloadModal');

  const modals = [contactModal, downloadModal].filter(Boolean);

  const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  const bgVideo = document.querySelector('.video-bg video');

  function isOpen(modal) {
    return modal && modal.getAttribute('aria-hidden') === 'false';
  }

  function pauseBackgroundVideo() {
    if (!bgVideo) return;
    try { bgVideo.pause(); } catch {}
  }

  function playBackgroundVideo() {
    if (!bgVideo) return;
    try { bgVideo.play().catch(() => {}); } catch {}
  }

  function openModal(modal) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector(focusableSelector);
    if (first) first.focus();
    pauseBackgroundVideo();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
    const anyOpen = modals.some(m => m && m.classList.contains('is-open'));
    if (!anyOpen) playBackgroundVideo();
  }

  if (contactBtn && contactModal) contactBtn.addEventListener('click', () => openModal(contactModal));
  if (downloadBtn && downloadModal) downloadBtn.addEventListener('click', () => openModal(downloadModal));

  modals.forEach(modal => {
    if (!modal) return;

    const closeEls = Array.from(modal.querySelectorAll('[data-close], .modal-close, .btn.secondary'));
    closeEls.forEach(el => el.addEventListener('click', () => closeModal(modal)));

    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(modal);
      });
    }

    const panel = modal.querySelector('.modal-panel');
    if (panel) {
      panel.addEventListener('click', (e) => e.stopPropagation());
    }

    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(m => { if (isOpen(m)) closeModal(m); });
      return;
    }

    if (e.key === 'Tab') {
      const openModalEl = modals.find(m => isOpen(m));
      if (!openModalEl) return;

      const focusables = Array.from(openModalEl.querySelectorAll(focusableSelector));
      if (focusables.length === 0) {
        e.preventDefault();
        return;
      }
      const first = focusables[0];
      const last = focusables[focusables.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  });

  function bindForm(form, modal) {
    if (!form) return;

    const consent = form.querySelector('#consent');
    const submitBtn = form.querySelector('button[type="submit"]');

    if (consent && submitBtn) {
      submitBtn.disabled = !consent.checked;
      consent.addEventListener('change', () => {
        submitBtn.disabled = !consent.checked;
      });
    }

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!form.reportValidity()) return;

      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      if (form.id === 'downloadForm') {
        if (!consent || !consent.checked) {
          consent?.focus();
          return;
        }
      }

      // Submit via FormSubmit
      const tempForm = document.createElement('form');
      tempForm.action = form.action;
      tempForm.method = form.method;
      tempForm.style.display = 'none';

      Array.from(form.elements).forEach(el => {
        if (!el.name || el.disabled) return;
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = el.name;
        input.value = el.value;
        tempForm.appendChild(input);
      });

      document.body.appendChild(tempForm);
      tempForm.submit();

      // Téléchargement du ZIP
      if (form.id === 'downloadForm') {
        const zipUrl = 'assets/documents/docs-anku.zip';
        const link = document.createElement('a');
        link.href = zipUrl;
        link.download = 'docs-anku.zip';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      if (modal) closeModal(modal);
    });
  }

  bindForm(document.getElementById('contactForm'), contactModal);
  bindForm(document.getElementById('downloadForm'), downloadModal);

  const cardElements = Array.from(document.querySelectorAll('.container-cards .card')).filter(el => !el.classList.contains('small'));
  cardElements.forEach(card => {
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });

    card.addEventListener('click', (e) => {
      if (e.target.closest('a, button, input, textarea')) return;
      card.classList.toggle('flipped');
    });
  });
});

function isMobile() {
  return window.matchMedia("(hover: none) and (pointer: coarse)").matches;
}

if (isMobile()) {
  document.querySelectorAll('.card').forEach(card => {
    card.addEventListener('click', () => {
      card.classList.toggle('flipped');
    });
  });
}
