(function () {
  'use strict';

  const CITY_KEY = 'inetseti-city';
  const BUSINESS_KEY = 'inetseti-business-mode';
  const MAX_MESSENGER_URL = 'https://max.ru/u/f9LHodD0cOJbGuUnkNs5vbebn5z8wm-2vX0cb0RUgSHp25MZMmCRiGww1hg';
  const DEFAULT_CITY = 'Казань';
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
  const slug = (value) => CITY_TO_SLUG[value] || 'kazan';

  const cityPhone = (value) => PHONE_BY_CITY_SLUG[slug(value)] || PHONE_BY_CITY_SLUG.kazan;

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

  const maxMessengerLink = (className = '') => `
    <a class="max-messenger-link ${className}" href="${MAX_MESSENGER_URL}" target="_blank" rel="noopener noreferrer" aria-label="Написать в MAX">
      <img src="/img/icon/max.svg" width="32" height="32" alt="MAX">
      <span>Написать в MAX</span>
    </a>
  `;

  const ensureMessengerContacts = () => {
    document.querySelectorAll('[data-application-modal] .application-form').forEach(form => {
      const nextElement = form.nextElementSibling;
      if (!nextElement?.classList.contains('modal-form-messenger-link')) {
        form.insertAdjacentHTML('afterend', maxMessengerLink('modal-messenger-link modal-form-messenger-link'));
      }
    });

    document.querySelectorAll('[data-application-success]').forEach(success => {
      if (!success.querySelector('[data-success-phone]')) {
        success.innerHTML = `
          <h3>Мы уже получили вашу заявку и начали обработку</h3>
          <div class="application-success-copy">
            <p><strong>📞 Позвоним вам в течение 5–15 минут в рабочее время.</strong></p>
            <p><strong>📵 Просьба временно отключить антиспам и блокировки, чтобы мы могли до вас дозвониться.</strong></p>
            <p><strong>Если не удалось связаться — напишите нам в удобный мессенджер или перезвоните по телефону: <a class="success-phone-link" data-success-phone></a>.</strong></p>
          </div>
          ${maxMessengerLink('modal-messenger-link')}
          <button class="btn btn-primary" type="button" data-close-application>Хорошо</button>
        `;
      }
    });

    document.querySelectorAll('[data-application-success]').forEach(success => {
      const closeButton = success.querySelector('[data-close-application]');
      if (closeButton) {
        closeButton.outerHTML = '<a class="btn btn-primary" href="/">Вернуться на главный экран</a>';
      }
    });

    document.querySelectorAll('.footer-inner').forEach(footer => {
      if (!footer.querySelector('.footer-messenger-link')) {
        footer.insertAdjacentHTML('beforeend', maxMessengerLink('footer-messenger-link'));
      }
    });
  };

  const updateSuccessPhoneLinks = (value = city()) => {
    document.querySelectorAll('[data-success-phone]').forEach(link => {
      link.textContent = cityPhone(value);
      link.setAttribute('href', phoneHref(value));
    });
  };

  const formatRussianPhone = (value) => {
    let digits = String(value || '').replace(/\D/g, '');
    if (digits.startsWith('7') || digits.startsWith('8')) digits = digits.slice(1);
    digits = digits.slice(0, 10);
    if (!digits) return '';

    let result = '+7 (' + digits.slice(0, 3);
    if (digits.length < 3) return result;
    result += ')';
    if (digits.length === 3) return result;
    result += ' ' + digits.slice(3, 6);
    if (digits.length <= 6) return result;
    result += '-' + digits.slice(6, 8);
    if (digits.length <= 8) return result;
    return result + '-' + digits.slice(8, 10);
  };

  const initPhoneMasks = () => {
    document.querySelectorAll('input[type="tel"], input[name="phone"]').forEach(input => {
      input.type = 'tel';
      input.inputMode = 'tel';
      input.autocomplete = 'tel';
      input.maxLength = 18;
      input.pattern = '\\+7 \\([0-9]{3}\\) [0-9]{3}-[0-9]{2}-[0-9]{2}';
      input.title = 'Введите номер в формате +7 (999) 123-45-67';
      input.value = formatRussianPhone(input.value);
      input.addEventListener('input', () => {
        input.value = formatRussianPhone(input.value);
      });
    });
  };

  const updatePhoneLinks = (value = city()) => {
    document.querySelectorAll('.phone-link').forEach(link => {
      link.textContent = cityPhone(value);
      link.setAttribute('href', phoneHref(value));
    });
    updateSuccessPhoneLinks(value);
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
    modal.querySelectorAll('.modal-form-messenger-link').forEach(link => { link.hidden = isSuccess; });
    if (success) success.hidden = !isSuccess;
  };

  const openModal = (payload) => {
    const modal = document.querySelector('[data-application-modal]');
    if (!modal) return;
    updateSuccessPhoneLinks(payload.city || city());
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

  const ensureSuccessModal = () => {
    if (document.querySelector('[data-success-modal]')) return;
    document.body.insertAdjacentHTML('beforeend', `
      <section class="modal" aria-hidden="true" data-success-modal>
        <div class="modal-backdrop" data-close-success-modal></div>
        <div class="modal-card" role="dialog" aria-modal="true" aria-labelledby="success-modal-title">
          <button class="modal-close" type="button" aria-label="Закрыть" data-close-success-modal>×</button>
          <div class="application-success">
            <h3 id="success-modal-title">Мы уже получили вашу заявку и начали обработку</h3>
            <div class="application-success-copy">
              <p><strong>📞 Позвоним вам в течение 5–15 минут в рабочее время.</strong></p>
              <p><strong>📵 Просьба временно отключить антиспам и блокировки, чтобы мы могли до вас дозвониться.</strong></p>
              <p><strong>Если не удалось связаться — напишите нам в удобный мессенджер или перезвоните по телефону: <a class="success-phone-link" data-success-phone></a>.</strong></p>
            </div>
            ${maxMessengerLink('modal-messenger-link')}
            <a class="btn btn-primary" href="/">Вернуться на главный экран</a>
          </div>
        </div>
      </section>
    `);
  };

  const openSuccessModal = (value = city()) => {
    ensureSuccessModal();
    const modal = document.querySelector('[data-success-modal]');
    if (!modal) return;
    updateSuccessPhoneLinks(value);
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.documentElement.classList.add('no-scroll');
    document.body.classList.add('no-scroll');
    modal.querySelector('.btn[href="/"]')?.focus();
  };

  const closeSuccessModal = () => {
    const modal = document.querySelector('[data-success-modal]');
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
    document.querySelectorAll('[data-close-success-modal]').forEach(button => button.addEventListener('click', closeSuccessModal));
    document.querySelectorAll('.application-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const modal = form.closest('[data-application-modal]');
      if (!modal) return;
      updateSuccessPhoneLinks(form.querySelector('[name="city"]')?.value || city());
      closeModal();
      openSuccessModal(form.querySelector('[name="city"]')?.value || city());
      form.reset();
    }));
    document.querySelectorAll('.address-check-form').forEach(form => form.addEventListener('submit', event => {
      event.preventDefault();
      const submittedCity = form.querySelector('[name="city"]')?.value || city();
      updateSuccessPhoneLinks(submittedCity);
      openSuccessModal(submittedCity);
      form.reset();
    }));
    bindApplicationButtons(city(), getPageMode());
    initRevealAnimations();
    document.addEventListener('keydown', event => {
      if (event.key !== 'Escape') return;
      closeModal();
      closeSuccessModal();
    });
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
    ensureMessengerContacts();
    ensureSuccessModal();
    initPhoneMasks();
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
