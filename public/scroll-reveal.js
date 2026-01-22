// Client-side script to handle scroll-triggered animations
document.addEventListener('DOMContentLoaded', () => {
  console.log('Initializing scroll reveal animations');
  const revealElements = document.querySelectorAll('.reveal-on-scroll');
  console.log(`Found ${revealElements.length} elements to animate`);
  
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          console.log('Revealing element:', entry.target);
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );
  
  revealElements.forEach((el) => {
    observer.observe(el);
  });
});