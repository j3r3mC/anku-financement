document.addEventListener('DOMContentLoaded', () => {
  const contactBtn = document.getElementById('contactBtn');
  const downloadBtn = document.getElementById('downloadDocs');

  const contactModal = document.getElementById('contactModal');
  const downloadModal = document.getElementById('downloadModal');

  const modals = [contactModal, downloadModal].filter(Boolean);

  const focusableSelector = 'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function isOpen(modal) {
    return modal && modal.getAttribute('aria-hidden') === 'false';
  }

  function openModal(modal) {
    if (!modal) return;
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector(focusableSelector);
    if (first) first.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  // Attach openers
  if (contactBtn && contactModal) contactBtn.addEventListener('click', () => openModal(contactModal));
  if (downloadBtn && downloadModal) downloadBtn.addEventListener('click', () => openModal(downloadModal));

  // Attach closers and backdrop behavior per modal
  modals.forEach(modal => {
    const closeEls = Array.from(modal.querySelectorAll('[data-close], .modal-close, .btn.secondary'));
    closeEls.forEach(el => el.addEventListener('click', () => closeModal(modal)));

    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) closeModal(modal);
      });
    }

    // Click on panel shouldn't close (safety)
    const panel = modal.querySelector('.modal-panel');
    if (panel) {
      panel.addEventListener('click', (e) => e.stopPropagation());
    }
  });

  // Global keydown: Escape to close any open modal, Tab trapping for the currently open modal
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modals.forEach(m => { if (isOpen(m)) closeModal(m); });
      return;
    }

    if (e.key === 'Tab') {
      const openModal = modals.find(m => isOpen(m));
      if (!openModal) return;
      const focusables = Array.from(openModal.querySelectorAll(focusableSelector));
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

  // Click outside modal-panel to close (for cases where modal element itself is clicked)
  modals.forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });

  // Forms binding
  const contactForm = document.getElementById('contactForm');
  const downloadForm = document.getElementById('downloadForm');

  function bindForm(form, modal) {
    if (!form) return;
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();

      // Native constraint check
      if (!form.reportValidity()) return;

      // Honeypot anti-spam
      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      // If downloadForm, verify consent checkbox before continuing
      if (form.id === 'downloadForm') {
        const consent = form.querySelector('#consent');
        if (!consent || !consent.checked) {
          // rely on required attribute but guard anyway
          consent?.focus();
          return;
        }
      }

      // Submit the form (keeps redirection defined by _next)
      // Use a short delay to allow UX (could add a loader here)
      form.submit();

      // If download form, trigger immediate file download in addition to submit (non-blocking)
      if (form.id === 'downloadForm') {
        try {
          const fileHref = form.dataset.downloadHref || 'assets/documents/charte-anku.pdf';
          const fileName = form.dataset.downloadName || 'charte-anku.pdf';
          const link = document.createElement('a');
          link.href = fileHref;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } catch (err) {
          // silent fail, form submission will still handle redirection
        }
      }

      // Close modal after submit (optional: you may want to wait for network response)
      if (modal) closeModal(modal);
    });
  }

  bindForm(contactForm, contactModal);
  bindForm(downloadForm, downloadModal);

  // Accessible flip cards: hover on pointer devices, click/tap/keyboard on all
  const cardElements = Array.from(document.querySelectorAll('.container-cards .card')).filter(el => !el.classList.contains('small'));
  cardElements.forEach(card => {
    // make cards focusable for keyboard
    if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');

    // keyboard toggle: Enter or Space
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        card.classList.toggle('flipped');
      }
    });

    // click/tap toggle
    card.addEventListener('click', (e) => {
      // don't toggle if clicking a focusable control inside card
      if (e.target.closest('a, button, input, textarea')) return;
      card.classList.toggle('flipped');
    });
  });

  // Reduce background video CPU when modal open: pause background video when any modal opens
  const bgVideo = document.querySelector('.video-bg video');
  const observer = new MutationObserver(() => {
    const anyOpen = modals.some(m => m && m.classList.contains('is-open'));
    if (!bgVideo) return;
    if (anyOpen) {
      try { bgVideo.pause(); } catch {}
    } else {
      try { bgVideo.play().catch(() => {}); } catch {}
    }
  });

  modals.forEach(m => observer.observe(m, { attributes: true, attributeFilter: ['class'] }));
});
