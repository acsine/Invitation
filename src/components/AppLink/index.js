import Link from 'next/link'

/* This is necessary if you’re using libraries like styled-components. 
Without this, the <a> tag will not have the href attribute, 
which might hurt your site’s SEO.
https://nextjs.org/docs/api-reference/next/link */

function AppLink({ href, className, children, ...props }) {
  const isExternal = href?.startsWith('http')

  return (
    <Link
      href={href || '/'}
      className={className}
      target={isExternal ? '_blank' : '_self'}
      rel={isExternal ? 'noopener noreferrer' : undefined}
      {...props}
    >
      {children}
    </Link>
  )
}

export default AppLink
