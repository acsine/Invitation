import React from 'react'
import Image from 'next/image'
import useDarkMode from 'use-dark-mode'

const ImageApp = ({
  className,
  src,
  srcDark,
  alt,
  size,
  priority,
  objectFit = 'contain',
}) => {
  const darkMode = useDarkMode(false)

  return (
    <div className={className} style={{ ...size, position: 'relative' }}>
      <Image
        src={darkMode.value && srcDark ? srcDark : src}
        alt={alt}
        fill
        quality={75}
        style={{ objectFit }}
        placeholder="blur"
        blurDataURL={`${src}?auto=format,compress&q=1&blur=500&w=2`}
        priority={priority}
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />
    </div>
  )
}

export default ImageApp
