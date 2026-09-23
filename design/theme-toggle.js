/* tooli theme switcher: light/dark mode + colour palette.
   Uses the tokens in tokens.css.
   - Dark mode 1st visit: follows the user's system setting.
   - Choices are remembered for the next visit. */

(function () {
  const root = document.documentElement;
  const THEME_KEY = 'tooli-theme';
  const PALETTE_KEY = 'tooli-palette';

  function load(key) {
    try { return localStorage.getItem(key); } catch (e) { return null; }
  }
  function save(key, value) {
    try { localStorage.setItem(key, value); } catch (e) {}
  }

  function applyTheme(theme) {
    if (theme === 'dark') root.dataset.theme = 'dark';
    else delete root.dataset.theme;
  }

  // "blue" is the default palette, so it needs no attribute
  function applyPalette(palette) {
    if (palette && palette !== 'blue') root.dataset.palette = palette;
    else delete root.dataset.palette;
  }

  // Run immediately so the page doesn't flash the wrong colours
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(load(THEME_KEY) || (systemDark ? 'dark' : 'light'));
  applyPalette(load(PALETTE_KEY));

  document.addEventListener('click', function (e) {
    // <button data-theme-toggle>: switches light/dark
    if (e.target.closest('[data-theme-toggle]')) {
      const next = root.dataset.theme === 'dark' ? 'light' : 'dark';
      applyTheme(next);
      save(THEME_KEY, next);
    }

    // <button data-palette-set="green">: picks a palette (blue, yellow, green, red, violet)
    const pick = e.target.closest('[data-palette-set]');
    if (pick) {
      applyPalette(pick.dataset.paletteSet);
      save(PALETTE_KEY, pick.dataset.paletteSet);
    }
  });
})();
