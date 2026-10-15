// Error toasts stay longer than the regular 2s toast so staff can read them
const ERROR_TOAST_DURATION_MS = 6000;

let toastTimer: ReturnType<typeof setTimeout> | undefined;

// Requires an element with id="error-toast" on the page
export function showErrorToast(message: string) {
  const toast = document.getElementById("error-toast");
  if (!toast) return;

  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.remove("opacity-0", "-translate-y-2");

  toastTimer = setTimeout(() => {
    toast.classList.add("opacity-0", "-translate-y-2");
  }, ERROR_TOAST_DURATION_MS);
}
