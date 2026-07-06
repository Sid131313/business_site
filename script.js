
    const mobileToggle = document.getElementById('mobileToggle');
    const mobileNav = document.getElementById('mobileNav');

    if (mobileToggle && mobileNav) {
      mobileToggle.addEventListener('click', () => {
        mobileNav.classList.toggle('open');
      });

      mobileNav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => mobileNav.classList.remove('open'));
      });
    }

    document.querySelectorAll('.faq-question').forEach(button => {
      button.addEventListener('click', () => {
        const item = button.closest('.faq-item');
        if (!item) return;

        const isActive = item.classList.contains('active');
        document.querySelectorAll('.faq-item').forEach(faq => faq.classList.remove('active'));
        if (!isActive) item.classList.add('active');
      });
    });

    document.querySelectorAll('.city-dropdown').forEach(dropdown => {
      const cityButton = dropdown.querySelector('.city-button');
      const cityOptions = dropdown.querySelectorAll('.city-menu button');

      if (!cityButton) return;

      cityButton.addEventListener('click', () => {
        const isExpanded = dropdown.classList.toggle('open');
        cityButton.setAttribute('aria-expanded', String(isExpanded));
      });

      cityOptions.forEach(option => {
        option.addEventListener('click', () => {
          cityButton.textContent = option.textContent;
          dropdown.classList.remove('open');
          cityButton.setAttribute('aria-expanded', 'false');
          option.blur();
        });
      });
    });

    document.addEventListener('click', (event) => {
      document.querySelectorAll('.city-dropdown.open').forEach(dropdown => {
        if (dropdown.contains(event.target)) return;

        const cityButton = dropdown.querySelector('.city-button');
        dropdown.classList.remove('open');
        if (cityButton) cityButton.setAttribute('aria-expanded', 'false');
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

    const escapeHtml = (value) => String(value)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#039;');

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

    const blogPosts = Array.isArray(window.blogPosts) ? window.blogPosts : [];

    if (blogPosts.length) {
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
    }
