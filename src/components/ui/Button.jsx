import React from 'react';
import cn from 'classnames';
import Loader from '../Loader';
import AppLink from '../AppLink';

const Button = ({ 
  children, 
  loading = false, 
  disabled = false, 
  className = '', 
  type = 'button', 
  onClick,
  variant = 'primary', // primary, secondary, danger, outline, ghost, glass, glow
  size = 'md', // sm, md, lg
  href,
  ...props 
}) => {
  const baseStyles = "relative inline-flex items-center justify-center gap-2.5 transition-all duration-300 font-bold tracking-wide rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none select-none overflow-hidden cursor-pointer";
  
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base font-extrabold",
  };

  const variants = {
    primary: "bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-500/25 hover:shadow-indigo-500/40 hover:scale-[1.02]",
    secondary: "bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md hover:bg-slate-800 dark:hover:bg-white hover:scale-[1.02]",
    danger: "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-500/20 hover:shadow-rose-500/35 hover:scale-[1.02]",
    outline: "bg-transparent text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-800 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20",
    ghost: "bg-transparent text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100/70 dark:hover:bg-slate-800/60",
    glass: "glass-card text-slate-800 dark:text-white border border-white/60 dark:border-white/10 hover:border-indigo-500/50 hover:bg-white/80 dark:hover:bg-slate-900/80 shadow-sm",
    glow: "bg-gradient-to-r from-indigo-600 to-purple-600 text-white btn-glow",
  };

  const content = (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl">
          <Loader 
            className="!h-5 !w-5 !border-[2.5px]" 
            color={variant === 'outline' || variant === 'ghost' || variant === 'glass' ? 'primary' : 'white'} 
          />
        </div>
      )}
      <span className={cn("inline-flex items-center justify-center gap-2.5 transition-opacity duration-200", { "opacity-0": loading })}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <AppLink
        href={href}
        onClick={onClick}
        className={cn(baseStyles, sizes[size], variants[variant], className)}
        {...props}
      >
        {content}
      </AppLink>
    );
  }

  return (
    <button
      type={type}
      disabled={loading || disabled}
      onClick={onClick}
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
