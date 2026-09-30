const LANGUAGE_FILES = {
  uk: 'data/i18n/uk.json',
  en: 'data/i18n/en.json'
};

async function loadJson(path) {
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`Could not load ${path}: ${response.status}`);
  }
  return response.json();
}

function interpolate(value, variables) {
  if (typeof value !== 'string') return value;
  return value.replace(/\{\{(\w+)\}\}/g, (_, key) => variables[key] ?? '');
}

export async function loadTranslations() {
  const [uk, en] = await Promise.all([
    loadJson(LANGUAGE_FILES.uk),
    loadJson(LANGUAGE_FILES.en)
  ]);
  return { uk, en };
}

export function createI18n({ translations, config }) {
  let language = 'uk';

  const dictionary = () => translations[language];
  const variables = () => ({ email: config.email });
  const translate = key => interpolate(dictionary()[key], variables());

  function updateMetadata() {
    const localizedUrl = language === 'en' ? `${config.siteUrl}?lang=en` : config.siteUrl;
    const dict = dictionary();

    document.title = dict.page_title;
    document.querySelector('meta[name="description"]')?.setAttribute('content', dict.page_description);
    document.querySelector('meta[property="og:title"]')?.setAttribute('content', dict.page_title);
    document.querySelector('meta[property="og:description"]')?.setAttribute('content', dict.page_description);
    document.querySelector('meta[property="og:locale"]')?.setAttribute('content', language === 'uk' ? 'uk_UA' : 'en_US');
    document.querySelector('meta[property="og:site_name"]')?.setAttribute('content', language === 'uk' ? 'Інтертехкорм' : 'Intertekhkorm');
    document.querySelector('meta[property="og:url"]')?.setAttribute('content', localizedUrl);
    document.querySelector('meta[property="og:image:alt"]')?.setAttribute('content', dict.product1_image_alt);
    document.querySelector('link[rel="canonical"]')?.setAttribute('href', localizedUrl);
    document.querySelector('meta[name="twitter:title"]')?.setAttribute('content', dict.page_title);
    document.querySelector('meta[name="twitter:description"]')?.setAttribute('content', dict.page_description);
    document.querySelector('meta[name="twitter:image:alt"]')?.setAttribute('content', dict.product1_image_alt);
  }

  function apply(nextLanguage, { updateUrl = false } = {}) {
    language = Object.hasOwn(translations, nextLanguage) ? nextLanguage : 'uk';

    document.querySelectorAll('[data-i18n]').forEach(element => {
      const value = translate(element.dataset.i18n);
      if (typeof value === 'string') element.textContent = value;
    });

    const translatedAttributes = [
      ['data-i18n-aria-label', 'aria-label'],
      ['data-i18n-alt', 'alt'],
      ['data-i18n-title', 'title'],
      ['data-i18n-placeholder', 'placeholder']
    ];

    translatedAttributes.forEach(([dataAttribute, targetAttribute]) => {
      document.querySelectorAll(`[${dataAttribute}]`).forEach(element => {
        const key = element.getAttribute(dataAttribute);
        const value = translate(key);
        if (typeof value === 'string') element.setAttribute(targetAttribute, value);
      });
    });

    const logo = document.querySelector('[data-site-logo]');
    if (logo) {
      logo.src = language === 'en' ? 'assets/img/logo-en.png' : 'assets/img/logo.png';
      logo.dataset.logoLocale = language;
    }

    document.documentElement.lang = language;
    updateMetadata();

    document.querySelectorAll('[data-lang-option]').forEach(button => {
      const active = button.dataset.langOption === language;
      button.setAttribute('aria-pressed', String(active));
      button.setAttribute('tabindex', active ? '-1' : '0');
    });

    if (updateUrl) {
      const url = new URL(window.location.href);
      url.searchParams.set('lang', language);
      url.hash = '';
      history.replaceState(null, '', url);
    }

    document.dispatchEvent(new CustomEvent('languagechange', {
      detail: { language, dictionary: dictionary() }
    }));
  }

  return {
    apply,
    getLanguage: () => language,
    getDictionary: dictionary,
    t: translate
  };
}
