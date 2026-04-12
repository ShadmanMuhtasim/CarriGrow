import { Toaster, toast } from "react-hot-toast";

export function ToastViewport() {
  return <Toaster position="top-right" />;
}

export const toastUI = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast(message),
};
