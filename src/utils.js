export const baseURL = "https://cms.nullcomma.com";
export const LAUNCHER_INSTALLER_URL = "https://public.nullcomma.com/launcher/setup/chrisjogoslauncher-win-Setup.exe";


const baseQuery = "fields=*,translations.*,tags.tags_id,tags_translations.*,card_image.id,card_image.type,genres.genres_id,steam_id,trailer_url,web_version_url,screenshots.directus_files_id.id,screenshots.directus_files_id.type,related_posts.post_id.id,related_posts.post_id.title,related_posts.post_id.date_published,related_posts.post_id.cover_image.id,related_posts.post_id.cover_image.type,related_posts.post_id.status";

const filter = import.meta.env.DEV
  ? "filter[status][_in]=published,draft"
  : "filter[status][_eq]=published";

export const fieldsQuery = `${baseQuery}&${filter}`;

const DEFAULT_IMAGE_WIDTH = 800;

/**
 * Returns an optimized asset URL from Directus, applying WEBP format and width limit by default.
 * @param {string} id Asset ID.
 * @param {number} [width=800] Maximum width.
 * @param {string} [options=''] Additional parameters (e.g., 'height=120&fit=cover').
 * @param {string} [mimeType=''] The file MIME type (e.g., 'image/gif').
 * @returns {string | null} Optimized URL.
 */
export const getAssetUrl = (id, width = DEFAULT_IMAGE_WIDTH, options = '', mimeType = '') => {
  if (!id) return null;

  // If it's a GIF, return the original URL without optimization
  if (mimeType.toLowerCase() === 'image/gif') {
    return `${baseURL}/assets/${id}`;
  }

  let params = `?format=webp&width=${width}`;
  if (options) {
    params += `&${options}`;
  }

  return `${baseURL}/assets/${id}${params}`;
};

/**
 * Formats a date string to a readable format.
 * @param {string} dateString Date string to format.
 * @returns {string} Formatted date.
 */
export const formatDate = (dateString) => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * @param {string} text - O texto para gerar a cor.
 * @param {number} hueOffset - Deslocamento em graus (0 a 360). 
 * Mude isso globalmente para girar a paleta de cores.
 */
export const getHashedColor = (text, hueOffset = 240) => {
  if (!text) return 'hsl(0, 0%, 70%)';

  let hash = 0;
  // Usando um multiplicador primo (31 ou 37) ajuda a espalhar melhor as cores
  // para strings parecidas.
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }

  // 1. Calcula o Hue Base (0-360)
  const baseHue = Math.abs(hash % 360);

  // 2. Aplica o OFFSET pedido.
  // O operador % 360 garante que se passar de 360, ele volta pro 0 (roda gira).
  const finalHue = (baseHue + hueOffset) % 360;

  // --- CONFIGURAÇÕES DE VISIBILIDADE (Theme Dark) ---
  
  // Saturação: Entre 50% e 75% (Nem cinza, nem neon estourado)
  // O hash define onde cai nesse range para variar um pouco.
  const saturation = 50 + (Math.abs(hash) % 25); 

  // Luminosidade: Entre 60% e 80% (Para garantir leitura no fundo escuro)
  let lightness = 60 + (Math.abs(hash) % 20);

  // Opcional: Reforço de luz para cores que o olho humano enxerga mais escuro (Azul/Roxo)
  // Se a cor final cair entre azul e roxo (210-290), clareia mais 10%
  if (finalHue > 210 && finalHue < 290) {
    lightness += 10;
  }

  return `hsl(${finalHue}, ${saturation}%, ${lightness}%)`;
};