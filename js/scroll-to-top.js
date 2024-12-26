document.addEventListener('DOMContentLoaded', function() {
    // Create the button element
    const scrollButton = document.createElement('button');
    scrollButton.className = 'scroll-to-top';
    scrollButton.innerHTML = '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
    scrollButton.setAttribute('aria-label', 'Scroll naar boven');
    document.body.appendChild(scrollButton);

    // Show/hide button based on scroll position
    function toggleScrollButton() {
        if (window.scrollY > 300) {
            scrollButton.classList.add('visible');
        } else {
            scrollButton.classList.remove('visible');
        }
    }

    // Smooth scroll to top
    function scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

    // Event listeners
    window.addEventListener('scroll', toggleScrollButton);
    scrollButton.addEventListener('click', scrollToTop);
});
