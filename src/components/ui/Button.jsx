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
