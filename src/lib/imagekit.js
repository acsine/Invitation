import ImageKit from 'imagekit';

const publicKey = process.env.IMAGEKIT_PUBLIC_KEY || '';
const privateKey = process.env.IMAGEKIT_PRIVATE_KEY || '';
const urlEndpoint = process.env.IMAGEKIT_URL_ENDPOINT || '';

const isConfigured = Boolean(
  publicKey &&
  publicKey !== 'public_...' &&
  privateKey &&
  privateKey !== 'private_...' &&
  urlEndpoint &&
  urlEndpoint !== 'https://ik.imagekit.io/...'
);

let imagekit = null;
if (isConfigured) {
  try {
    imagekit = new ImageKit({
      publicKey,
      privateKey,
      urlEndpoint,
    });
  } catch (err) {
    console.warn('ImageKit initialization failed:', err.message);
    imagekit = null;
  }
}

export { isConfigured };
export default imagekit;

export function getImageKitAuthParams() {
  if (!imagekit) {
    return { token: '', expire: 0, signature: '' };
  }
  return imagekit.getAuthenticationParameters();
}
