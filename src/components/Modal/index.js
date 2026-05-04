'use client';

import React, { useCallback, useEffect } from 'react'
import { createPortal } from 'react-dom'
import OutsideClickHandler from 'react-outside-click-handler'
import cn from 'classnames'
import Icon from '../Icon'

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
    <div className="fixed inset-0 z-[999] flex items-center justify-center bg-dark/20 backdrop-blur-sm p-5">
      <div className={cn("relative w-full max-w-2xl", outerClassName)}>
        <OutsideClickHandler onOutsideClick={disable ? () => {} : onClose}>
          <div className={cn("relative rounded-lg bg-white p-8 shadow-3 dark:bg-dark-2 sm:p-12", containerClassName)}>
            {children}
            {!disable && (
              <button 
                className="absolute top-4 right-4 flex h-9 w-9 items-center justify-center rounded-full text-body-color hover:text-primary" 
                onClick={onClose}
              >
                <Icon name="close" size="14" />
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

