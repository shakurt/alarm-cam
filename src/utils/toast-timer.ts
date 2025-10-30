import toast from "react-simple-toasts";

export const startToastTimer = (duration: number, textMessage: string) => {
  const toastCreatedAt = Date.now();
  const taskPromise = new Promise((resolve) => setTimeout(resolve, duration));

  const myToast = toast(`${textMessage} ${duration / 1000}s`, {
    duration: duration,
    loading: taskPromise,
    onClose: () => clearInterval(interval),
  });

  const interval = setInterval(() => {
    const remainingTime = Math.max(0, duration - (Date.now() - toastCreatedAt));
    myToast.update(`${textMessage} ${(remainingTime / 1000).toFixed(1)}s`);
  }, 100);

  return { toast: myToast, taskPromise };
};
