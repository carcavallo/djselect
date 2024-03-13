import { useState } from "react";
import { toast } from "react-toastify";

export function useNotifier() {
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const notifyError = (errorMessage: string): void => {
    setError(errorMessage);
    toast.error(errorMessage);
  };

  const notifySuccess = (successMessage: string): void => {
    setSuccess(successMessage);
    toast.success(successMessage);
  };

  return { error, setError, notifyError, success, setSuccess, notifySuccess };
}
