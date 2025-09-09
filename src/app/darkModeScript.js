// This script runs before React hydration to prevent flash of light mode
(function() {
  try {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  } catch (e) {
    // Fallback to dark mode if localStorage is not available
    document.documentElement.classList.add('dark');
  }
})();
