import ImageKit from 'imagekit'

const isConfigured = 
  process.env.IMAGEKIT_PUBLIC_KEY && 
  process.env.IMAGEKIT_PUBLIC_KEY !== 'public_...' &&
  process.env.IMAGEKIT_PRIVATE_KEY && 
  process.env.IMAGEKIT_PRIVATE_KEY !== 'private_...' &&
  process.env.IMAGEKIT_URL_ENDPOINT && 
  process.env.IMAGEKIT_URL_ENDPOINT !== 'https://ik.imagekit.io/...'

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY || '',
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT || '',
})

export { isConfigured }
export default imagekit

export function getImageKitAuthParams() {
  return imagekit.getAuthenticationParameters()
}
