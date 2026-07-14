(function () {
  'use strict';

  const CITY_KEY = 'inetseti-city';
  const BUSINESS_KEY = 'inetseti-business-mode';
  const DEFAULT_CITY = 'Москва';
  const CITY_OPTIONS = [
    'Москва',
    'Санкт-Петербург',
    'Казань',
    'Самара',
    'Екатеринбург',
    'Тюмень',
    'Набережные Челны',
    'Уфа',
    'Нижний Тагил',
    'Новый Уренгой',
    'Йошкар-Ола',
    'Оренбург',
    'Омск'
  ];

  const CITY_TO_SLUG = {
    'Москва': 'moskva',
    'Санкт-Петербург': 'sankt-peterburg',
    'Казань': 'kazan',
    'Самара': 'samara',
    'Екатеринбург': 'ekaterinburg',
    'Тюмень': 'tyumen',
    'Набережные Челны': 'naberezhnye-chelny',
    'Уфа': 'ufa',
    'Нижний Тагил': 'nizhniy-tagil',
    'Новый Уренгой': 'novyy-urengoy',
    'Йошкар-Ола': 'yoshkar-ola',
    'Оренбург': 'orenburg',
    'Омск': 'omsk'
  };

  const PHONE_BY_CITY_SLUG = {
    kazan: '+7 (843) 204-20-03',
    samara: '+7 (800) 775-87-83',
    ekaterinburg: '+7 (343) 298-10-68',
    tyumen: '+7 (345) 221-54-84',
    'naberezhnye-chelny': '+7 (855) 292-10-04',
    moskva: '+7 (495) 989-98-59',
    ufa: '+7 (347) 225-01-81',
    'nizhniy-tagil': '+7 (800) 775-87-83',
    'novyy-urengoy': '+7 (800) 775-87-83',
    orenburg: '+7 (3532) 48-11-17',
    omsk: '+7 (381) 229-00-07',
    'yoshkar-ola': '+7 (8362) 34-73-63',
    'sankt-peterburg': '+7 (812) 214-57-02'
  };

  const isCityLandingPage = () => {
    const pathname = window.location.pathname.replace(/\\/g, '/').replace(/\/+$/, '');
    return Object.values(CITY_TO_SLUG).some(citySlug => pathname === `/${citySlug}`);
  };

  const storage = (() => {
    try {
      localStorage.setItem('__test__', '1');
      localStorage.removeItem('__test__');
      return localStorage;
    } catch {
      return null;
    }
  })();

  const text = (value) => String(value ?? '').trim();
  const escapeHtml = (value) => text(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');

  const pageCity = () => {
    const explicitCity = text(
      document.querySelector('.address-check-form [name="city"]')?.value ||
      document.querySelector('.city-button')?.textContent
    );
    return CITY_OPTIONS.includes(explicitCity) ? explicitCity : DEFAULT_CITY;
  };
  const city = () => isCityLandingPage()
    ? pageCity()
    : ((storage && CITY_OPTIONS.includes(storage.getItem(CITY_KEY))) ? storage.getItem(CITY_KEY) : pageCity());
  const mode = () => (storage && storage.getItem(BUSINESS_KEY) === 'business') ? 'business' : 'home';
  const setCity = (value) => storage && CITY_OPTIONS.includes(value) && storage.setItem(CITY_KEY, value);
  const setMode = (value) => storage && storage.setItem(BUSINESS_KEY, value === 'business' ? 'business' : 'home');
  const slug = (value) => CITY_TO_SLUG[value] || 'moskva';

  const cityPhone = (value) => PHONE_BY_CITY_SLUG[slug(value)] || PHONE_BY_CITY_SLUG.moskva;

  const addPersonalDataConsent = () => {
    document.querySelectorAll('form').forEach((form) => {
      if (form.querySelector('[data-personal-data-consent]')) return;

      const consent = document.createElement('label');
      consent.className = 'personal-data-consent';
      consent.dataset.personalDataConsent = '';
      consent.innerHTML = `
        <input type="checkbox" name="personal_data_consent" value="1" checked required>
        <span>Нажимая кнопку «Отправить», я даю согласие на обработку моих персональных данных в соответствии с <a href="/privacy-policy/">Политикой обработки персональных данных</a>.</span>
      `;

      const submitButton = form.querySelector('button[type="submit"], input[type="submit"], button:not([type])');
      if (submitButton) form.insertBefore(consent, submitButton);
      else form.append(consent);
    });
  };
  const phoneHref = (value) => `tel:${cityPhone(value).replace(/[^\d+]/g, '')}`;

  const updatePhoneLinks = (value = city()) => {
    document.querySelectorAll('.phone-link').forEach(link => {
      link.textContent = cityPhone(value);
      link.setAttribute('href', phoneHref(value));
    });
  };

  const apiUrl = () => {
    const url = new URL('/api/tariffs.php', window.location.origin);
    url.searchParams.set('city', city());
    url.searchParams.set('mode', mode());
    return url.toString();
  };

  const formatPrice = (value) => value == null ? 'Цена уточняется' : `${new Intl.NumberFormat('ru-RU').format(value)} ₽`;

  const getPageMode = () => window.location.pathname.replace(/\\/g, '/').includes('business.html') ? 'business' : 'home';

  const makeCard = (tariff, pageMode) => {
    const badge = tariff.badge ? `<span class="tariff-badge">${escapeHtml(tariff.badge)}</span>` : '';
    const oldPrice = tariff.old_price ? `<span class="tariff-old-price">${escapeHtml(formatPrice(tariff.old_price))}</span>` : '';
    const conditions = tariff.conditions ? `<p class="tariff-conditions">${escapeHtml(tariff.conditions)}</p>` : '';
    const options = Array.isArray(tariff.options) && tariff.options.length
      ? `<ul>${tariff.options.slice(0, 3).map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : '';
    const kind = pageMode === 'business'
      ? 'Для бизнеса'
      : (tariff.category === 'internet_tv' ? 'Интернет + ТВ' : 'Интернет');
    const buttonLabel = pageMode === 'business' ? 'Подключить' : 'Оставить заявку';

    return `
      <article class="card tariff">
        <div class="tariff-top">
          <div>${badge}<h3>${escapeHtml(tariff.name)}</h3></div>
          <span class="tariff-kind">${kind}</span>
        </div>
        <p>${escapeHtml(tariff.description || '')}</p>
        <div class="tariff-price">${escapeHtml(formatPrice(tariff.price))} <span>/ мес</span></div>
        ${oldPrice}
        ${conditions}
        <p><strong>${escapeHtml(tariff.speed || '')}</strong></p>
        ${options}
        <button class="btn btn-primary" type="button"
          data-open-application
          data-provider="${escapeHtml(tariff.provider || '')}"
          data-tariff="${escapeHtml(tariff.name || '')}"
          data-price="${escapeHtml(String(tariff.price ?? ''))}"
          data-city="${escapeHtml(city())}"
          data-tariff-type="${pageMode}"
          data-category="${escapeHtml(tariff.category || '')}">
          ${buttonLabel}
        </button>
      </article>
    `;
  };

  const sortTariffs = (items) => [...items].sort((a, b) => (Number(a.price) || 1e9) - (Number(b.price) || 1e9) || (Number(b.speed_mbps) || 0) - (Number(a.speed_mbps) || 0));

  const renderEmpty = (container) => {
    container.innerHTML = '<div class="tariffs-empty"><p>Тарифы уточняются, оставьте заявку - подберем доступные варианты.</p></div>';
  };

  const renderTariffs = (data) => {
    const currentCity = city();
    const pageMode = getPageMode();
    const cityData = data?.cities?.[slug(currentCity)];

    document.querySelectorAll('.city-button').forEach(button => button.textContent = currentCity);
    updatePhoneLinks(currentCity);
    document.querySelectorAll('[data-city-link]').forEach(link => link.setAttribute('href', `${slug(currentCity)}/${pageMode}.html`));
    document.querySelectorAll('[data-mode-link]').forEach(link => link.setAttribute('href', `${slug(currentCity)}/${link.dataset.modeLink || pageMode}.html`));

    document.querySelectorAll('[data-home-tariffs]').forEach(container => {
      const list = cityData?.home?.[container.dataset.homeCategory || 'internet'] || [];
      const best = sortTariffs(list).slice(0, 3);
      if (best.length) {
        container.innerHTML = best.map(item => makeCard(item, 'home')).join('');
      } else {
        renderEmpty(container);
      }
    });

    const businessContainer = document.querySelector('[data-business-tariffs]');
    if (businessContainer) {
      const best = sortTariffs(cityData?.business || []).slice(0, 3);
      if (best.length) {
        businessContainer.innerHTML = best.map(item => makeCard(item, 'business')).join('');
      } else {
        renderEmpty(businessContainer);
      }
    }

    bindApplicationButtons(currentCity, pageMode);
    initRevealAnimations();
  };

  const normalizeAssetPath = (path) => {
    if (!path) return '';
    return path.startsWith('/') ? path : `/${path}`;
  };

  const createBlogCard = (post) => {
    const image = normalizeAssetPath(post.image);
    return `
      <a class="blog-card" href="${escapeHtml(post.url)}">
        <span class="blog-card-image">
          <img src="${escapeHtml(image)}" width="720" height="420" loading="lazy" alt="${escapeHtml(post.imageAlt || post.title)}">
        </span>
        <span class="blog-card-body">
          <span class="blog-card-meta">${escapeHtml(post.category)}</span>
          <span class="blog-card-title">${escapeHtml(post.title)}</span>
          <span class="blog-card-excerpt">${escapeHtml(post.excerpt)}</span>
          <span class="blog-card-footer">
            <span>${escapeHtml(post.displayDate)}</span>
            <span>${escapeHtml(post.readingTime)}</span>
          </span>
          <span class="blog-card-link">Читать статью →</span>
        </span>
      </a>
    `;
  };

  const renderBlog = () => {
    const blogPosts = Array.isArray(window.blogPosts) ? window.blogPosts : [];
    if (!blogPosts.length) return;

    document.querySelectorAll('[data-blog-list]').forEach(list => {
      const limit = Number(list.dataset.blogLimit);
      const posts = Number.isFinite(limit) && limit > 0 ? blogPosts.slice(0, limit) : blogPosts;
      list.innerHTML = posts.map(createBlogCard).join('');
    });

    document.querySelectorAll('[data-related-posts]').forEach(list => {
      const currentSlug = list.dataset.currentSlug;
      const relatedPosts = blogPosts
        .filter(post => post.slug !== currentSlug)
        .slice(0, 3);

      list.innerHTML = relatedPosts.map(createBlogCard).join('');
    });

    initRevealAnimations();
  };

  const bindApplicationButtons = (currentCity = city(), pageMode = getPageMode()) => {
    document.querySelectorAll('[data-open-application], .btn[href="#address-check"], .btn[href="/#address-check"]').forEach(button => {
      if (button.dataset.applicationBound === 'true') return;
      button.dataset.applicationBound = 'true';
      button.addEventListener('click', (event) => {
        event.preventDefault();
        openModal({
        provider: button.dataset.provider || '',
        tariff: button.dataset.tariff || text(button.textContent) || 'Заявка на подключение',
        price: button.dataset.price || '',
        city: city() || button.dataset.city || currentCity,
        tariffType: button.dataset.tariffType || pageMode,
        category: button.dataset.category || ''
        });
      });
    });
  };

  const setModalSuccess = (modal, isSuccess) => {
    const form = modal.querySelector('.application-form');
    const success = modal.querySelector('[data-application-success]');
    if (form) form.hidden = isSuccess;
    if (success) success.hidden = !isSuccess;
  };

  const openModal = (payload) => {
    const modal = document.querySelector('[data-application-modal]');
    if (!modal) return;
    setModalSuccess(modal, false);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    modal.querySelector('[name="provider"]').value = payload.provider || '';
    modal.querySelector('[name="tariff"]').value = payload.tariff || '';
    modal.querySelector('[name="price"]').value = payload.price || '';
    modal.querySelector('[name="city"]').value = payload.city || city();
    modal.querySelector('[name="tariff_type"]').value = payload.tariffType || getPageMode();
    modal.querySelector('[name="category"]').value = payload.category || '';
    modal.querySelectorAll('[data-current-city]').forEach(node => {
      if ('value' in node) {
        node.value = payload.city || city();
      } else {
        node.textContent = payload.city || city();
      }
    });
    modal.querySelectorAll('[data-current-tariff]').forEach(node => {
      node.textContent = payload.tariff || 'Заявка на подключение';
    });
    const firstInput = modal.querySelector('.application-form .input:not([readonly])');
    if (firstInput) firstInput.focus();
  };

  const closeModal = () => {
    const modal = document.querySelector('[data-application-modal]');
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');
  };

  let revealObserver = null;

  const initRevealAnimations = () => {
    const targets = document.querySelectorAll('.section, .card, .benefit, .blog-card, .article-cta, .address-check, .partners-block, .question-cta');
    if (!targets.length) return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      targets.forEach(node => node.classList.add('is-visible'));
      return;
    }

    if (!revealObserver) {
      revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    }

    targets.forEach((node, index) => {
      if (node.classList.contains('is-visible')) return;
      node.classList.add('reveal');
      node.style.setProperty('--reveal-delay', `${Math.min(index % 4, 3) * 70}ms`);
      revealObserver.observe(node);
    });
  };

  const initUi = () => {
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileToggle && mobileNav) {
      mobileToggle.setAttribute('aria-expanded', 'false');
      mobileToggle.setAttribute('aria-controls', mobileNav.id || 'mobileNav');

      mobileToggle.addEventListener('click', () => {
        const isOpen = mobileNav.classList.toggle('open');
        mobileToggle.setAttribute('aria-expanded', String(isOpen));
      });

      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
          mobileNav.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        });
      });
    }

    document.querySelectorAll('.city-dropdown').forEach(dropdown => {
      const button = dropdown.querySelector('.city-button');
      const options = dropdown.querySelectorAll('.city-menu button');
      if (!button) return;

      button.addEventListener('click', () => {
        const isExpanded = dropdown.classList.toggle('open');
        button.setAttribute('aria-expanded', String(isExpanded));
      });

      options.forEach(option => option.addEventListener('click', () => {
        setCity(text(option.textContent));
        button.textContent = text(option.textContent);
        updatePhoneLinks(text(option.textContent));
        dropdown.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
        option.blur();
        if (mobileNav && mobileToggle) {
          mobileNav.classList.remove('open');
          mobileToggle.setAttribute('aria-expanded', 'false');
        }
        loadTariffs();
      }));
    });

    document.addEventListener('click', (event) => {
      document.querySelectorAll('.city-dropdown.open').forEach(dropdown => {
        if (dropdown.contains(event.target)) return;
        const button = dropdown.querySelector('.city-button');
        dropdown.classList.remove('open');
        if (button) button.setAttribute('aria-expanded', 'false');
      });
    });

    const heroSlider = document.querySelector('.hero-slider');
    if (heroSlider) {
      const slides = Array.from(heroSlider.querySelectorAll('.hero-slide'));
      const dots = Array.from(heroSlider.querySelectorAll('.hero-slider-dot'));
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      let currentSlide = 0;
      let sliderTimer = null;

      const showSlide = (index) => {
        currentSlide = (index + slides.length) % slides.length;

        slides.forEach((slide, slideIndex) => {
          slide.classList.toggle('active', slideIndex === currentSlide);
        });

        dots.forEach((dot, dotIndex) => {
          dot.classList.toggle('active', dotIndex === currentSlide);
        });
      };

      const startSlider = () => {
        if (reduceMotion || slides.length < 2) return;
        sliderTimer = window.setInterval(() => showSlide(currentSlide + 1), 4500);
      };

      const restartSlider = () => {
        if (sliderTimer) window.clearInterval(sliderTimer);
        startSlider();
      };

      dots.forEach((dot, dotIndex) => {
        dot.addEventListener('click', () => {
          showSlide(dotIndex);
          restartSlider();
        });
      });

      showSlide(0);
      startSlider();
    }

    document.querySelectorAll('[data-tariff-tab]').forEach(tab => {
      tab.addEventListener('click', () => {
        const selected = tab.dataset.tariffTab;
        document.querySelectorAll('[data-tariff-tab]').forEach(item => {
          const active = item.dataset.tariffTab === selected;
          item.classList.toggle('active', active);
          item.setAttribute('aria-selected', String(active));
        });
        document.querySelectorAll('[data-tariff-panel]').forEach(panel => {
          panel.hidden = panel.dataset.tariffPanel !== selected;
        });
      });
    });

    document.querySelectorAll('.faq-question').forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        if (!item) return;
        const active = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(node => node.classList.remove('active'));
        if (!active) item.classList.add('active');
      });
    });

    document.querySelectorAll('[data-close-application]').forEach(button => button.addEventListener('click', closeModal));
    document.querySelectorAll('.application-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const modal = form.closest('[data-application-modal]');
      if (!modal) return;
      setModalSuccess(modal, true);
      form.reset();
    }));
    document.querySelectorAll('.address-check-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      openModal({
        provider: '',
        tariff: 'Проверка адреса',
        price: '',
        city: city(),
        tariffType: getPageMode(),
        category: 'address-check'
      });
      const modalForm = document.querySelector('[data-application-modal] .application-form');
      if (modalForm) {
        const phoneInput = form.querySelector('[name="phone"]');
        const modalPhoneInput = modalForm.querySelector('[name="phone"]');
        if (phoneInput && modalPhoneInput) modalPhoneInput.value = phoneInput.value;
      }
    }));
    bindApplicationButtons(city(), getPageMode());
    initRevealAnimations();
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeModal(); });
  };

  const loadTariffs = async () => {
    try {
      const response = await fetch(apiUrl(), { cache: 'no-store' });
      if (!response.ok) throw new Error('Bad response');
      renderTariffs(await response.json());
    } catch {
      const fallback = window.__tariffsData || null;
      if (fallback) renderTariffs(fallback);
    }
  };

  const loadScript = (src) => new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = src;
    script.onload = resolve;
    script.onerror = reject;
    document.head.append(script);
  });

  const hydrateCityLandingPage = async () => {
    if (!isCityLandingPage() || document.body.dataset.cityPageHydrated === 'true') return;

    const city = text(
      document.querySelector('.address-check-form [name="city"]')?.value ||
      document.querySelector('.city-button')?.textContent
    );
    const cityHeading = document.querySelector('h1')?.cloneNode(true);
    const cityTariffs = document.querySelector('#tariffs')?.cloneNode(true);

    if (!CITY_OPTIONS.includes(city) || !cityHeading || !cityTariffs) return;

    try {
      const response = await fetch(new URL('../index.html', window.location.href), { cache: 'no-store' });
      if (!response.ok) throw new Error('Unable to load home page template');

      const homePage = new DOMParser().parseFromString(await response.text(), 'text/html');
      const homeBody = homePage.body;
      const homeHeading = homeBody.querySelector('h1');
      const homeTariffs = homeBody.querySelector('#tariffs');
      if (!homeHeading || !homeTariffs) throw new Error('Home page template is incomplete');

      const base = document.createElement('base');
      base.href = '/';
      document.head.prepend(base);
      document.body.innerHTML = homeBody.innerHTML;
      document.body.dataset.cityPageHydrated = 'true';

      document.querySelector('h1')?.replaceWith(cityHeading);
      document.querySelector('#tariffs')?.replaceWith(cityTariffs);
      document.querySelectorAll('.city-button').forEach(button => { button.textContent = city; });
      document.querySelectorAll('.address-check-form [name="city"]').forEach(input => { input.value = city; });
      document.querySelectorAll('[data-current-city]').forEach(node => {
        if ('value' in node) node.value = city;
        else node.textContent = city;
      });

      if (!window.blogPosts) {
        await loadScript(new URL('../data/blog-posts.js', window.location.href).href);
      }
    } catch (error) {
      console.error('Не удалось загрузить шаблон главной страницы для города.', error);
    }
  };

  const init = async () => {
    await hydrateCityLandingPage();
    setMode(getPageMode());
    addPersonalDataConsent();
    initUi();
    updatePhoneLinks();
    renderBlog();
    loadTariffs();
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
