'use client';

import React from 'react'
import cn from 'classnames'
import useDarkMode from 'use-dark-mode'

const Theme = ({ className }) => {
  const darkMode = useDarkMode(false)

  return (
    <label className={cn("relative inline-flex cursor-pointer items-center", className)}>
      <input
        className="sr-only peer"
        checked={darkMode.value}
        onChange={darkMode.toggle}
        type="checkbox"
      />
      <div className="w-11 h-6 bg-stroke rounded-full peer peer-focus:ring-4 peer-focus:ring-primary/20 dark:bg-dark peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
    </label>
  )
}

export default Theme

