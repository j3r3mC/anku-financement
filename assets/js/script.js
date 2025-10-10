document.addEventListener('DOMContentLoaded', () => {
  const contactBtn = document.getElementById('contactBtn');
  const downloadBtn = document.getElementById('downloadDocs');

  const contactModal = document.getElementById('contactModal');
  const downloadModal = document.getElementById('downloadModal');

  const modals = [contactModal, downloadModal].filter(Boolean);

  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])';
  let lastFocused = null;

  function openModal(modal) {
    lastFocused = document.activeElement;
    modal.setAttribute('aria-hidden', 'false');
    modal.classList.add('is-open');
    document.body.style.overflow = 'hidden';
    const first = modal.querySelector(focusableSelector);
    if (first) first.focus();
  }

  function closeModal(modal) {
    modal.setAttribute('aria-hidden', 'true');
    modal.classList.remove('is-open');
    document.body.style.overflow = '';
    if (lastFocused && typeof lastFocused.focus === 'function') lastFocused.focus();
  }

  if (contactBtn && contactModal) {
    contactBtn.addEventListener('click', () => openModal(contactModal));
  }

  if (downloadBtn && downloadModal) {
    downloadBtn.addEventListener('click', () => openModal(downloadModal));
  }

  modals.forEach(modal => {
    const closeEls = Array.from(modal.querySelectorAll('[data-close], .modal-close, .btn.secondary'));
    closeEls.forEach(el => el.addEventListener('click', () => closeModal(modal)));

    const backdrop = modal.querySelector('.modal-backdrop');
    if (backdrop) {
      backdrop.addEventListener('click', () => closeModal(modal));
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal.getAttribute('aria-hidden') === 'false') {
        closeModal(modal);
      }

      if (e.key === 'Tab' && modal.getAttribute('aria-hidden') === 'false') {
        const focusables = Array.from(modal.querySelectorAll(focusableSelector));
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
  });

  const contactForm = document.getElementById('contactForm');
  const downloadForm = document.getElementById('downloadForm');

  function bindForm(form, modal) {
    if (!form) return;

    form.addEventListener('submit', (ev) => {
      ev.preventDefault();

      if (!form.reportValidity()) return;

      const honey = form.querySelector('[name="_honey"]');
      if (honey && honey.value) return;

      form.setAttribute('method', 'POST');
      form.submit();

      if (form.id === 'downloadForm') {
        const consent = form.querySelector('#consent');
        if (consent && consent.checked) {
          const link = document.createElement('a');
          link.href = 'assets/documents/charte-anku.pdf';
          link.download = 'charte-anku.pdf';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
  }

  bindForm(contactForm, contactModal);
  bindForm(downloadForm, downloadModal);
});
