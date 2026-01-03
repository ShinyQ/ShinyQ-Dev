// Theme switching functionality
const initializeTheme = () => {
  const theme = (() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) {
      const storedTheme = localStorage.getItem('theme');
      return storedTheme === 'dark' ? 'dark' : 'light';
    }
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'light';
  })();

  if (theme === 'light') {
    document.documentElement.classList.remove('dark');
  } else {
    document.documentElement.classList.add('dark');
  }

  window.localStorage.setItem('theme', theme);
  return theme;
};

// Handle theme toggle
const handleToggleClick = (event: Event) => {
  event.preventDefault();
  const element = document.documentElement;
  element.classList.toggle('dark');

  const isDark = element.classList.contains('dark');
  localStorage.setItem('theme', isDark ? 'dark' : 'light');

  // Dispatch theme change event
  const themeChangeEvent = new CustomEvent('themeChange', {
    detail: { theme: isDark ? 'dark' : 'light' }
  });
  document.dispatchEvent(themeChangeEvent);
};

// Initialize theme and set up event listeners
document.addEventListener('DOMContentLoaded', () => {
  initializeTheme();
  
  const themeToggle = document.getElementById('theme-toggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', handleToggleClick);
  }
});

// Handle system theme changes
const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
mediaQuery.addEventListener('change', (e) => {
  if (!localStorage.getItem('theme')) {
    const newTheme = e.matches ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', e.matches);
    localStorage.setItem('theme', newTheme);
  }
}); 