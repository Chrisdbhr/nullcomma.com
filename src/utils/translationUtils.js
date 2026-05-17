/**
 * Returns the preferred translation from a translations array.
 * Prioritizes English, then Portuguese, then first available.
 * @param {Array} translations - Array of translation objects with `language` property.
 * @param {string} [lang] - Optional target language code (e.g., 'en', 'pt').
 * @returns {object} The best matching translation object.
 */
export const getPreferredTranslation = (translations, lang) => {
  if (!translations || translations.length === 0) return {};
  if (lang) {
    const target = translations.find(t => t.language.startsWith(lang));
    if (target) return target;
  }
  const en = translations.find(t => t.language.startsWith('en'));
  if (en) return en;
  const pt = translations.find(t => t.language.startsWith('pt'));
  if (pt) return pt;
  return translations[0] || {};
};
