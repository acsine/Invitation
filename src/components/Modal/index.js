'use client';

import React, { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import OutsideClickHandler from 'react-outside-click-handler'
import cn from 'classnames'
import Icon from '../Icon'
import { FiX } from 'react-icons/fi'

const Modal = ({
  outerClassName,
  containerClassName,
  visible,
  onClose,
  children,
  disable,
}) => {
  const [mounted, setMounted] = React.useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const escFunction = useCallback(
    e => {
      if (e.keyCode === 27) {
        onClose()
      }
    },
    [onClose]
  )

  useEffect(() => {
    if (mounted && !disable) {
      document.addEventListener('keydown', escFunction, false)
    }

    return () => {
      document.removeEventListener('keydown', escFunction, false)
    }
  }, [escFunction, disable, mounted])

  if (!mounted || !visible) return null;

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 sm:p-6 animate-in fade-in duration-200">
      <div className={cn("relative w-full max-w-2xl animate-in zoom-in-95 duration-200", outerClassName)}>
        <OutsideClickHandler onOutsideClick={disable ? () => {} : onClose}>
          <div className={cn("relative rounded-3xl bg-white dark:bg-slate-900 p-6 sm:p-8 shadow-2xl border border-slate-100 dark:border-slate-800", containerClassName)}>
            {children}
            {!disable && (
              <button 
                type="button"
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer" 
                onClick={onClose}
                title="Fermer"
              >
                <FiX size={18} />
              </button>
            )}
          </div>
        </OutsideClickHandler>
      </div>
    </div>,
    document.body
  );
}

export default Modal
