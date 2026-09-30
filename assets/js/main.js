import { SITE_CONFIG } from '../../config/site.config.js';
import { createI18n, loadTranslations } from './i18n.js';
import { setupContactForm } from './form.js';
import { setupModals } from './modal.js';
import { setupNavigation } from './nav.js';

document.documentElement.classList.add('js');

function replaceWithLines(element, lines) {
  if (!element) return;
  element.replaceChildren();
  lines.forEach((line, index) => {
    if (index) element.appendChild(document.createElement('br'));
    element.appendChild(document.createTextNode(line));
  });
}

function hydrateContactLinks(config) {
  document.querySelectorAll('[data-config-phone]').forEach(link => {
    link.textContent = config.phone.display;
    link.href = `tel:${config.phone.e164}`;
    link.setAttribute('aria-label', `${config.phone.display}`);
  });

  document.querySelectorAll('[data-config-email]').forEach(link => {
    link.textContent = config.email;
    link.href = `mailto:${config.email}`;
  });

  const messengerLinks = {
    telegram: config.messengers.telegram,
    viber: config.messengers.viber,
    whatsapp: config.messengers.whatsapp
  };
  Object.entries(messengerLinks).forEach(([name, href]) => {
    document.querySelectorAll(`[data-config-${name}]`).forEach(link => {
      link.href = href;
    });
  });

  document.querySelectorAll('[data-config-maps]').forEach(link => {
    link.href = config.address.mapsUrl;
  });
}

function hydrateLocalizedCompanyData(config, language) {
  const address = language === 'en' ? config.address.en : config.address.uk;
  document.querySelectorAll('[data-config-address]').forEach(element => {
    element.textContent = address;
  });
  document.querySelectorAll('[data-config-footer-address]').forEach(element => {
    element.textContent = address;
  });

  const companyName = language === 'en' ? config.company.en : config.company.uk;
  const edrpouLabel = language === 'en' ? 'EDRPOU' : 'ЄДРПОУ';
  const taxLabel = language === 'en' ? 'Tax ID' : 'ІПН';
  document.querySelectorAll('[data-config-requisites]').forEach(element => {
    replaceWithLines(element, [
      companyName,
      `${edrpouLabel} ${config.company.edrpou}`,
      `${taxLabel} ${config.company.taxId}`
    ]);
  });
}

async function loadProducts() {
  const response = await fetch('data/products.json');
  if (!response.ok) throw new Error(`Could not load products: ${response.status}`);
  return response.json();
}

function productRows(products, path) {
  return path.split('.').reduce((value, key) => value?.[key], products) || [];
}

function renderProductData(products, i18n) {
  document.querySelectorAll('[data-product-table]').forEach(tbody => {
    const rows = productRows(products, tbody.dataset.productTable);
    tbody.replaceChildren(...rows.map(row => {
      const tableRow = document.createElement('tr');
      const label = document.createElement('td');
      const value = document.createElement('td');
      label.textContent = i18n.t(row.labelKey);
      value.textContent = row.valueKey ? i18n.t(row.valueKey) : row.value;
      tableRow.append(label, value);
      return tableRow;
    }));
  });

  document.querySelectorAll('[data-product-amino]').forEach(grid => {
    const aminoAcids = products[grid.dataset.productAmino]?.amino || [];
    grid.replaceChildren();
    aminoAcids.forEach(item => {
      const name = document.createElement('span');
      const value = document.createElement('span');
      name.textContent = i18n.t(item.labelKey);
      value.textContent = item.value;
      grid.append(name, value);
    });
  });
}

async function bootstrap() {
  const [translations, products] = await Promise.all([
    loadTranslations(),
    loadProducts()
  ]);
  const i18n = createI18n({ translations, config: SITE_CONFIG });

  hydrateContactLinks(SITE_CONFIG);
  const navigation = setupNavigation(i18n);
  setupModals({ config: SITE_CONFIG, i18n });
  setupContactForm({ config: SITE_CONFIG, i18n });

  document.addEventListener('languagechange', event => {
    hydrateLocalizedCompanyData(SITE_CONFIG, event.detail.language);
    renderProductData(products, i18n);
  });

  document.querySelectorAll('[data-lang-option]').forEach(button => {
    button.addEventListener('click', () => {
      i18n.apply(button.dataset.langOption, { updateUrl: true });
      navigation.setMobileMenu(false);
    });
  });

  const initialLanguage = new URLSearchParams(window.location.search).get('lang') === 'en' ? 'en' : 'uk';
  i18n.apply(initialLanguage);
}

bootstrap().catch(error => {
  document.documentElement.classList.remove('js');
  console.error('Site initialization failed.', error);
});
