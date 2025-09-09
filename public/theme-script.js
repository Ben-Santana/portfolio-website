// This script runs before any React code and prevents flash of wrong theme
(function() {
  // Try to get the theme from localStorage
  let theme;
  try {
    theme = localStorage.getItem('theme');
  } catch (e) {
    // If localStorage is not available, fallback to system preference
    theme = null;
  }

  // If no theme is stored, check system preference
  if (!theme) {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    theme = prefersDark ? 'dark' : 'light';
    // Try to save this preference
    try {
      localStorage.setItem('theme', theme);
    } catch (e) {
      // Ignore if localStorage is not available
    }
  }

  // Apply the theme immediately
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
  } else {
    document.documentElement.classList.add('light');
    document.documentElement.classList.remove('dark');
  }

  // Prevent any transitions during initial load
  document.documentElement.classList.add('disable-transitions');
  
  // Remove the transition blocker after the page has loaded
  window.addEventListener('load', function() {
    setTimeout(function() {
      document.documentElement.classList.remove('disable-transitions');
    }, 100);
  });
})();
