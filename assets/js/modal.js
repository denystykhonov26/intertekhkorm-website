export function setupModals({ config, i18n }) {
  let modalTrigger = null;

  function openModal(overlay, trigger) {
    if (!overlay) return;
    modalTrigger = trigger ?? document.activeElement;
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('modal-open');
    overlay.querySelector('[data-close]')?.focus();
  }

  function closeModal(overlay) {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('modal-open');
    modalTrigger?.focus();
    modalTrigger = null;
  }

  document.querySelectorAll('[data-modal]').forEach(trigger => {
    trigger.addEventListener('click', () => {
      openModal(document.getElementById(trigger.dataset.modal), trigger);
    });
  });

  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', event => {
      if (event.target === overlay) closeModal(overlay);
    });
    overlay.querySelector('[data-close]')?.addEventListener('click', () => closeModal(overlay));
  });

  const emailOverlay = document.getElementById('email-modal');
  document.querySelectorAll('[data-email-trigger]').forEach(trigger => {
    trigger.addEventListener('click', event => {
      event.preventDefault();
      openModal(emailOverlay, trigger);
    });
  });

  function updateEmailProviders() {
    const subject = i18n.t('form_mail_subject');
    const encodedEmail = encodeURIComponent(config.email);
    const encodedSubject = encodeURIComponent(subject);
    const providers = {
      gmail: `https://mail.google.com/mail/?view=cm&fs=1&to=${encodedEmail}&su=${encodedSubject}`,
      outlook: `https://outlook.live.com/mail/0/deeplink/compose?to=${encodedEmail}&subject=${encodedSubject}`,
      app: `mailto:${config.email}?subject=${encodedSubject}`
    };
    Object.entries(providers).forEach(([provider, href]) => {
      document.querySelector(`[data-email-provider="${provider}"]`)?.setAttribute('href', href);
    });
  }

  document.querySelectorAll('[data-email-provider]').forEach(link => {
    link.addEventListener('click', () => closeModal(emailOverlay));
  });

  document.querySelector('[data-copy-email]')?.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(config.email);
    } catch {
      const field = document.createElement('textarea');
      field.value = config.email;
      field.setAttribute('readonly', '');
      field.className = 'clipboard-field';
      document.body.appendChild(field);
      field.select();
      document.execCommand('copy');
      field.remove();
    }
    const status = document.querySelector('.email-copy-status');
    if (status) status.textContent = i18n.t('email_copied');
  });

  document.addEventListener('keydown', event => {
    const openOverlay = document.querySelector('.modal-overlay.open');
    if (!openOverlay) return;

    if (event.key === 'Escape') {
      closeModal(openOverlay);
      return;
    }

    if (event.key !== 'Tab') return;
    const focusable = [...openOverlay.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')]
      .filter(element => !element.hasAttribute('disabled'));
    if (!focusable.length) return;
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });

  document.addEventListener('languagechange', () => {
    updateEmailProviders();
    const status = document.querySelector('.email-copy-status');
    if (status) status.textContent = '';
  });

  updateEmailProviders();
  return { openModal, closeModal };
}
