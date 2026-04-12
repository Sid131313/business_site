
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
