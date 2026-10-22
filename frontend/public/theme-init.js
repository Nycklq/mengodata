try {
  const preference = localStorage.getItem('mengodata-theme');
  document.documentElement.dataset.theme = ['light', 'dark'].includes(preference)
    ? preference
    : 'system';
} catch {
  document.documentElement.dataset.theme = 'system';
}
