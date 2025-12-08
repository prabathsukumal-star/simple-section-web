import React from "react"
import { useToast } from "@/hooks/use-toast"
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast"

const SafeToastImage = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = React.useState(false);
  
  if (hasError || !src) return null;
  
  return (
    <img 
      src={src} 
      alt={alt} 
      className="w-14 h-14 rounded-full object-cover ring-2 ring-primary/30 shadow-md"
      onError={() => setHasError(true)}
    />
  );
};

export function Toaster() {
  const { toasts } = useToast()

  // Separate attendance alerts from error messages
  const attendanceAlerts = toasts.filter(t => t.isAttendanceAlert);
  const errorToasts = toasts.filter(t => !t.isAttendanceAlert && t.variant === 'destructive');

  return (
    <ToastProvider swipeDirection="right">
      {/* Attendance Alerts */}
      {attendanceAlerts.map(function ({ id, title, description, action, imageUrl, status, isAttendanceAlert, ...props }) {
        const variant = status === 'present' ? 'success' : status === 'absent' ? 'absent' : status === 'late' ? 'late' : 'default';
        
        return (
          <Toast key={id} {...props} variant={variant} className="top-4 left-4 fixed">
            <div className="flex items-center gap-2">
              {imageUrl && <SafeToastImage src={imageUrl} alt="Student" />}
              <div className="grid gap-0.5 flex-1">
                {title && <ToastTitle className="text-xs font-medium">{title}</ToastTitle>}
                {description && (
                  <ToastDescription className="text-xs">{description}</ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}

      {/* Error Messages */}
      {errorToasts.map(function ({ id, title, description, action, imageUrl, status, isAttendanceAlert, ...props }) {
        return (
          <Toast key={id} {...props} variant="destructive">
            <div className="grid gap-0.5 flex-1">
              {title && <ToastTitle className="text-xs font-medium">{title}</ToastTitle>}
              {description && (
                <ToastDescription className="text-xs">{description}</ToastDescription>
              )}
            </div>
            {action}
            <ToastClose />
          </Toast>
        )
      })}
      <ToastViewport />
    </ToastProvider>
  )
}
