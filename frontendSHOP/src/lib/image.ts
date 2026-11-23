// Réduit les photos de téléphone (souvent 5-12 Mo) avant envoi : max 1600 px de côté.
// Les PNG (souvent transparents) restent des PNG ; le reste devient JPEG.
// En cas d'échec (format non décodable, ex. HEIC), on renvoie le fichier d'origine.
const MAX_SIDE = 1600;

export async function compressImage(file: File): Promise<File> {
  if (!file.type.startsWith('image/')) return file;
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const isPng = file.type === 'image/png';

    // Petit fichier déjà à la bonne taille : inutile de le réencoder
    if (scale === 1 && file.size < 800 * 1024) {
      bitmap.close();
      return file;
    }

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    const ctx = canvas.getContext('2d');
    if (!ctx) return file;
    if (!isPng) {
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const type = isPng ? 'image/png' : 'image/jpeg';
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
    if (!blob || blob.size >= file.size) return file;

    const base = file.name.replace(/\.[^.]+$/, '') || 'image';
    return new File([blob], `${base}.${isPng ? 'png' : 'jpg'}`, { type });
  } catch {
    return file;
  }
}
