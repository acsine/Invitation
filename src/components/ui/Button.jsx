import React, { useState } from 'react';
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
  const [internalLoading, setInternalLoading] = useState(false);

  const handleClick = async (e) => {
    if (loading || internalLoading || disabled) return;

    if (onClick) {
      try {
        const result = onClick(e);
        if (result && typeof result.then === 'function') {
          setInternalLoading(true);
          await result;
        } else {
          // Brief spinner for non-async click feedback
          setInternalLoading(true);
          setTimeout(() => setInternalLoading(false), 500);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setInternalLoading(false);
      }
    }
  };

  const isSpinning = loading || internalLoading;

  const baseStyles = "relative inline-flex items-center justify-center gap-2.5 transition-all duration-300 font-bold tracking-wide rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/50 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed disabled:pointer-events-none select-none overflow-hidden cursor-pointer";
  
  const sizes = {
    sm: "px-4 py-2 text-xs",
    md: "px-6 py-3 text-sm",
    lg: "px-8 py-4 text-base font-extrabold",
  };

  const variants = {
    primary: "bg-[#FF6500] hover:bg-[#e05900] text-white shadow-none font-black transition-all cursor-pointer",
    secondary: "bg-[#3B52E8] hover:bg-[#2b40c7] text-white shadow-none font-bold transition-all cursor-pointer",
    danger: "bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-md hover:scale-[1.01]",
    outline: "bg-transparent text-slate-800 border border-slate-200 hover:border-[#3B52E8] hover:text-[#3B52E8] hover:bg-blue-50/50",
    ghost: "bg-transparent text-slate-600 hover:text-[#FF6500] hover:bg-slate-100/70",
    glass: "glass-card text-slate-800 border border-white/60 hover:border-[#3B52E8]/50 hover:bg-white/80 shadow-sm",
    glow: "bg-[#FF6500] hover:bg-[#e05900] text-white shadow-none font-extrabold transition-all cursor-pointer",
  };

  const content = (
    <>
      {isSpinning && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit rounded-xl z-10">
          <svg className="animate-spin h-5 w-5 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}
      <span className={cn("inline-flex items-center justify-center gap-2.5 transition-opacity duration-200", { "opacity-0": isSpinning })}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <AppLink
        href={href}
        onClick={handleClick}
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
      disabled={isSpinning || disabled}
      onClick={handleClick}
      className={cn(baseStyles, sizes[size], variants[variant], className)}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
