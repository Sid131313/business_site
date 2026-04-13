
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

    const leadForm = document.getElementById('leadForm');
    const formResult = document.getElementById('formResult');

    if (leadForm && formResult) {
      leadForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const formData = new FormData(leadForm);
        const payload = Object.fromEntries(formData.entries());
        console.log('Форма отправлена:', payload);

        formResult.style.display = 'block';
        leadForm.reset();
        window.scrollTo({
          top: leadForm.offsetTop - 120,
          behavior: 'smooth'
        });
      });
    }
