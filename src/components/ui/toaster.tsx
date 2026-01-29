'use client';

import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';

import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from '@/components/ui/toast';
import { useToast } from '@/hooks/use-toast';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <ToastProvider>
      {toasts.map(({ id, title, description, action, ...props }) => {
        return (
          <Toast key={id} {...props}>
            <div className="flex flex-1 items-start gap-2.5">
              {/* Success Icon - Green #34C759 */}
              {props.variant === 'success' && (
                <CheckCircle className="size-[22px] shrink-0 text-[#34C759]" />
              )}
              {/* Warning Icon - Orange #FF8D28 */}
              {props.variant === 'warning' && (
                <AlertTriangle className="size-[22px] shrink-0 text-[#FF8D28]" />
              )}
              {/* Danger Icon - Red #FF383C */}
              {props.variant === 'danger' && (
                <XCircle className="size-[22px] shrink-0 text-[#FF383C]" />
              )}

              <div className="flex flex-col gap-1">
                {title && <ToastTitle>{title}</ToastTitle>}
                {description && (
                  <ToastDescription>{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}

