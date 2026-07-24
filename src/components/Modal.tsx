import React, { useEffect, useId, useRef } from 'react';
import { XIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  footer,
  maxWidth = 'md'
}: ModalProps) {
  const titleId = useId();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Keep the latest onClose in a ref so the open/focus effect can depend only on
  // `isOpen` — otherwise an unstable inline onClose would re-run the effect on every
  // parent render and yank focus out of modal form fields on each keystroke.
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current();
    };
    previouslyFocused.current = document.activeElement as HTMLElement;
    document.addEventListener('keydown', handleEscape);
    document.body.style.overflow = 'hidden';
    // Move focus into the dialog once it has mounted (first form field if any,
    // otherwise the dialog itself — not the close button).
    requestAnimationFrame(() => {
      const focusable = dialogRef.current?.querySelector<HTMLElement>(
        'input, select, textarea, [href], [tabindex]:not([tabindex="-1"])'
      );
      (focusable ?? dialogRef.current)?.focus();
    });
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
      // Restore focus to the element that opened the dialog.
      previouslyFocused.current?.focus?.();
    };
  }, [isOpen]);

  // Trap Tab focus within the dialog.
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key !== 'Tab' || !dialogRef.current) return;
    const focusables = dialogRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const maxWidthClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl'
  };
  return (
    <AnimatePresence>
      {isOpen &&
      <>
          <motion.div
          initial={{
            opacity: 0
          }}
          animate={{
            opacity: 1
          }}
          exit={{
            opacity: 0
          }}
          transition={{
            duration: 0.2
          }}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={onClose} />
        
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            initial={{
              opacity: 0,
              scale: 0.95,
              y: 10
            }}
            animate={{
              opacity: 1,
              scale: 1,
              y: 0
            }}
            exit={{
              opacity: 0,
              scale: 0.95,
              y: 10
            }}
            transition={{
              duration: 0.2
            }}
            className={`w-full ${maxWidthClasses[maxWidth]} bg-surface rounded-xl shadow-xl pointer-events-auto flex flex-col max-h-[90vh] focus:outline-none`}>

              <div className="flex items-center justify-between px-6 py-4 border-b border-border">
                <h2 id={titleId} className="text-lg font-semibold text-text-primary">
                  {title}
                </h2>
                <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="p-2.5 -mr-1.5 min-h-[44px] min-w-[44px] flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-gray-100 rounded-full transition-colors">

                  <XIcon className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto flex-1">{children}</div>
              {footer &&
            <div className="px-6 py-4 border-t border-border bg-gray-50 rounded-b-xl flex justify-end gap-3">
                  {footer}
                </div>
            }
            </motion.div>
          </div>
        </>
      }
    </AnimatePresence>);

}