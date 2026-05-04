import React from 'react'
import cn from 'classnames'

const TextInput = ({ className, label, ...props }) => {
  return (
    <div className={cn("mb-5", className)}>
      {label && (
        <label className="mb-3 block text-base font-medium text-dark dark:text-white">
          {label}
        </label>
      )}
      <input 
        className="w-full rounded-md border-[1.5px] border-stroke bg-transparent py-3 px-5 text-base text-body-color outline-none transition focus:border-primary active:border-primary disabled:cursor-default disabled:bg-whiter" 
        {...props} 
      />
    </div>
  )
}

export default TextInput

