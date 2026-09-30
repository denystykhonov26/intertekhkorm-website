function generateLeadId() {
  const now = new Date();
  const date = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0')
  ].join('');
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const suffix = [...bytes].map(value => alphabet[value % alphabet.length]).join('');
  return `A-${date}-${suffix}`;
}

export function setupContactForm({ config, i18n }) {
  const form = document.getElementById('price-request-form');
  if (!form) return;

  const status = form.querySelector('.form-status');
  const submit = form.querySelector('.request-submit');
  const fallback = form.querySelector('[data-form-fallback]');
  const leadIdField = form.elements.lead_id;

  function refreshLeadId() {
    leadIdField.value = generateLeadId();
  }

  function setFieldError(field, message) {
    field.setAttribute('aria-invalid', message ? 'true' : 'false');
    const error = form.querySelector(`[data-error-for="${field.name}"]`);
    if (error) error.textContent = message;
  }

  function validate() {
    const checks = [
      [form.elements.name, form.elements.name.value.trim() ? '' : i18n.t('form_error_required')],
      [form.elements.phone, form.elements.phone.value.replace(/\D/g, '').length >= 7 ? '' : i18n.t('form_error_phone')],
      [form.elements.product, form.elements.product.value ? '' : i18n.t('form_error_required')]
    ];
    checks.forEach(([field, message]) => setFieldError(field, message));
    const invalid = checks.find(([, message]) => message);
    invalid?.[0].focus();
    return !invalid;
  }

  function updateFallbackEmail() {
    const values = new FormData(form);
    const product = form.elements.product.selectedOptions[0]?.textContent || '—';
    const lines = [
      `lead_id: ${values.get('lead_id')}`,
      `source: website`,
      `${i18n.t('form_name')}: ${values.get('name') || '—'}`,
      `${i18n.t('form_phone')}: ${values.get('phone') || '—'}`,
      `${i18n.t('form_product')}: ${values.get('product') ? product : '—'}`,
      `${i18n.t('form_comment')}: ${values.get('comment') || '—'}`
    ];
    fallback.href = `mailto:${config.email}?subject=${encodeURIComponent(i18n.t('form_mail_subject'))}&body=${encodeURIComponent(lines.join('\n'))}`;
  }

  form.addEventListener('input', event => {
    if (event.target.name) setFieldError(event.target, '');
    updateFallbackEmail();
  });
  form.addEventListener('change', updateFallbackEmail);

  document.querySelectorAll('[data-price-product]').forEach(link => {
    link.addEventListener('click', () => {
      form.elements.product.value = link.dataset.priceProduct;
      setFieldError(form.elements.product, '');
      updateFallbackEmail();
    });
  });

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (!validate()) return;

    if (!config.formEndpoint.trim()) {
      status.dataset.state = '';
      status.textContent = i18n.t('form_mail_opened');
      window.location.href = fallback.href;
      return;
    }

    status.dataset.state = '';
    status.textContent = i18n.t('form_sending');
    submit.disabled = true;

    try {
      const formData = new FormData(form);
      if (config.web3FormsAccessKey.trim()) {
        formData.set('access_key', config.web3FormsAccessKey.trim());
      }
      const response = await fetch(config.formEndpoint, {
        method: 'POST',
        body: formData,
        headers: { Accept: 'application/json' }
      });
      if (!response.ok) throw new Error(`Request failed: ${response.status}`);
      form.reset();
      refreshLeadId();
      status.dataset.state = 'success';
      status.textContent = i18n.t('form_success');
      updateFallbackEmail();
    } catch {
      status.dataset.state = 'error';
      status.textContent = i18n.t('form_send_error');
    } finally {
      submit.disabled = false;
    }
  });

  document.addEventListener('languagechange', updateFallbackEmail);
  refreshLeadId();
  updateFallbackEmail();
}
