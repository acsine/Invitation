import React from 'react'
import cn from 'classnames'

const TextInput = ({ className, label, error, icon: Icon, ...props }) => {
  return (
    <div className={cn("mb-5 w-full", className)}>
      {label && (
        <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {Icon && (
          <div className="absolute left-4 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon size={18} />
          </div>
        )}
        <input 
          className={cn(
            "w-full rounded-xl border bg-white/70 dark:bg-slate-900/70 backdrop-blur-md py-3.5 px-4 text-sm font-medium text-slate-800 dark:text-slate-100 placeholder-slate-400 outline-none transition-all duration-200",
            "border-slate-200 dark:border-slate-800 focus:border-indigo-500 dark:focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/15 shadow-sm",
            "disabled:opacity-60 disabled:cursor-not-allowed",
            { "pl-11": Icon },
            { "border-rose-500 focus:border-rose-500 focus:ring-rose-500/15": error }
          )}
          {...props} 
        />
      </div>
      {error && (
        <p className="mt-1.5 text-xs font-semibold text-rose-500 animate-fadeIn">
          {error}
        </p>
      )}
    </div>
  )
}

export default TextInput
