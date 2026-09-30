export function setupNavigation(i18n) {
  const header = document.querySelector('header');
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navigation = document.getElementById('main-navigation');

  function setMobileMenu(open) {
    if (!menuToggle || !navigation) return;
    navigation.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', i18n.t(open ? 'menu_close' : 'menu_open'));
  }

  menuToggle?.addEventListener('click', () => {
    setMobileMenu(menuToggle.getAttribute('aria-expanded') !== 'true');
  });

  navigation?.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', () => setMobileMenu(false));
  });

  document.addEventListener('click', event => {
    if (menuToggle?.getAttribute('aria-expanded') === 'true' && !event.target.closest('.nav')) {
      setMobileMenu(false);
    }
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
      setMobileMenu(false);
      menuToggle.focus();
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 860) setMobileMenu(false);
  }, { passive: true });

  window.addEventListener('scroll', () => {
    header?.classList.toggle('scrolled', window.scrollY > 8);
  }, { passive: true });

  const sectionLinks = [...document.querySelectorAll('.nav-links a[href^="#"]')];
  const sections = sectionLinks
    .map(link => document.querySelector(link.getAttribute('href')))
    .filter(Boolean);
  let observer;

  function setActiveSection(activeId) {
    sectionLinks.forEach(link => {
      const active = link.getAttribute('href') === `#${activeId}`;
      link.classList.toggle('active', active);
      if (active) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function observeSections() {
    if (!header || !('IntersectionObserver' in window)) return;
    const headerHeight = Math.ceil(header.getBoundingClientRect().height);
    document.documentElement.style.setProperty('--header-height', `${headerHeight}px`);
    observer?.disconnect();
    observer = new IntersectionObserver(() => {
      const marker = headerHeight + 2;
      const atMarker = sections.find(section => {
        const rect = section.getBoundingClientRect();
        return rect.top <= marker && rect.bottom > marker;
      });
      const approaching = sections.find(section => {
        const top = section.getBoundingClientRect().top;
        return top > marker && top <= window.innerHeight * 0.45;
      });
      const active = atMarker || approaching;
      if (active) setActiveSection(active.id);
    }, {
      rootMargin: `-${headerHeight + 2}px 0px -55% 0px`,
      threshold: 0
    });
    sections.forEach(section => observer.observe(section));
  }

  let resizeFrame;
  window.addEventListener('resize', () => {
    cancelAnimationFrame(resizeFrame);
    resizeFrame = requestAnimationFrame(observeSections);
  }, { passive: true });

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    document.querySelectorAll('.reveal').forEach(element => revealObserver.observe(element));
  } else {
    document.querySelectorAll('.reveal').forEach(element => element.classList.add('in-view'));
  }

  document.addEventListener('languagechange', () => {
    const open = menuToggle?.getAttribute('aria-expanded') === 'true';
    menuToggle?.setAttribute('aria-label', i18n.t(open ? 'menu_close' : 'menu_open'));
  });

  observeSections();
  return { setMobileMenu };
}
