document.addEventListener('DOMContentLoaded', function() {
    // Load footer component
    fetch('components/footer.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('footer').outerHTML = data;
        })
        .catch(error => console.error('Error loading footer:', error));

    // Mobile menu functionality
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Menu openen');

        mobileMenuToggle.addEventListener('click', function() {
            const isExpanded = this.getAttribute('aria-expanded') === 'true';
            this.setAttribute('aria-expanded', !isExpanded);
            this.setAttribute('aria-label', isExpanded ? 'Menu openen' : 'Menu sluiten');
            navLinks.classList.toggle('active');
            this.classList.toggle('active');

            if (!isExpanded) {
                document.addEventListener('click', closeMenuOutside);
            } else {
                document.removeEventListener('click', closeMenuOutside);
            }
        });

        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenuToggle.getAttribute('aria-expanded') === 'true') {
                closeMenu();
            }
        });
    }

    function closeMenuOutside(e) {
        if (!navLinks.contains(e.target) && !mobileMenuToggle.contains(e.target)) {
            closeMenu();
        }
    }

    function closeMenu() {
        navLinks.classList.remove('active');
        mobileMenuToggle.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.setAttribute('aria-label', 'Menu openen');
        document.removeEventListener('click', closeMenuOutside);
    }

    // Fade-in animations
    const fadeElements = document.querySelectorAll('.fade-in');
    const fadeInObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('fade-in-visible');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '50px'
    });

    fadeElements.forEach(element => {
        fadeInObserver.observe(element);
    });

    // Form validation
    const forms = document.querySelectorAll('form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            if (!validateForm(this)) {
                e.preventDefault();
            }
        });

        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('blur', function() {
                validateInput(this);
            });
        });
    });

    function validateForm(form) {
        let isValid = true;
        const inputs = form.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            if (!validateInput(input)) {
                isValid = false;
            }
        });
        return isValid;
    }

    function validateInput(input) {
        const errorElement = input.nextElementSibling?.classList.contains('error-message')
            ? input.nextElementSibling
            : createErrorElement(input);
        
        errorElement.textContent = '';
        input.classList.remove('invalid');

        if (input.hasAttribute('required') && !input.value.trim()) {
            showError(input, errorElement, 'Dit veld is verplicht');
            return false;
        }

        if (input.type === 'email' && input.value) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(input.value)) {
                showError(input, errorElement, 'Voer een geldig e-mailadres in');
                return false;
            }
        }

        if (input.type === 'tel' && input.value) {
            const phoneRegex = /^[0-9\s\-\+\(\)]{10,}$/;
            if (!phoneRegex.test(input.value)) {
                showError(input, errorElement, 'Voer een geldig telefoonnummer in');
                return false;
            }
        }

        return true;
    }

    function createErrorElement(input) {
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.style.color = 'red';
        errorElement.style.fontSize = '0.8em';
        errorElement.style.marginTop = '5px';
        input.parentNode.insertBefore(errorElement, input.nextSibling);
        return errorElement;
    }

    function showError(input, errorElement, message) {
        input.classList.add('invalid');
        errorElement.textContent = message;
    }

    // Button loading states
    const buttons = document.querySelectorAll('button[type="submit"]');
    buttons.forEach(button => {
        button.addEventListener('click', function() {
            if (this.form && validateForm(this.form)) {
                this.classList.add('loading');
                this.disabled = true;
                const originalText = this.textContent;
                this.textContent = 'Verzenden...';
                
                setTimeout(() => {
                    if (this.classList.contains('loading')) {
                        this.classList.remove('loading');
                        this.disabled = false;
                        this.textContent = originalText;
                    }
                }, 5000);
            }
        });
    });

    // Scroll to top button
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
    scrollButton.setAttribute('aria-label', 'Scroll naar boven');
    document.body.appendChild(scrollButton);

    function toggleScrollButton() {
        if (window.scrollY > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }

    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    window.addEventListener('scroll', toggleScrollButton);
    scrollButton.addEventListener('click', scrollToTop);
});
