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
  variant = 'primary', // primary, secondary, danger, outline
  href,
  ...props 
}) => {
  const baseStyles = "relative flex items-center justify-center gap-3 transition-all duration-300 font-black uppercase tracking-widest active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden";
  
  const variants = {
    primary: "bg-primary text-white shadow-xl shadow-primary/20 hover:scale-[1.02]",
    secondary: "bg-gray-900 text-white shadow-xl hover:bg-primary",
    danger: "bg-red-500 text-white shadow-xl hover:bg-red-600",
    outline: "bg-white/80 backdrop-blur-md text-gray-900 border-2 border-white shadow-xl hover:border-primary",
    ghost: "bg-transparent text-gray-500 hover:bg-gray-50 hover:text-primary",
  };

  const content = (
    <>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader 
            className="!h-6 !w-6 !border-[3px]" 
            color={variant === 'outline' || variant === 'ghost' ? 'primary' : 'white'} 
          />
        </div>
      )}
      <span className={cn("flex items-center gap-3 transition-opacity duration-300", { "opacity-0": loading })}>
        {children}
      </span>
    </>
  );

  if (href) {
    return (
      <AppLink
        href={href}
        onClick={onClick}
        className={cn(baseStyles, variants[variant], className)}
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
      className={cn(baseStyles, variants[variant], className)}
      {...props}
    >
      {content}
    </button>
  );
};

export default Button;
