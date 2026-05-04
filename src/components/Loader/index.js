import React from 'react'
import cn from 'classnames'

const Loader = ({ className, color }) => {
  return (
    <div
      className={cn(
        "h-6 w-6 animate-spin rounded-full border-2 border-solid border-primary border-t-transparent",
        { "border-white border-t-transparent": color === 'white' },
        className
      )}
    ></div>
  )
}

export default Loader

