import { useEffect, useRef } from "react";

/**
 * Gọi lại callback định kỳ và khi user quay lại tab để tự refresh dữ liệu.
 * @param {Function} callback - hàm load dữ liệu
 * @param {{ interval?: number, runOnFocus?: boolean, enabled?: boolean }} options
 */
const useAutoRefresh = (callback, options = {}) => {
  const { interval = 15000, runOnFocus = true, enabled = true } = options;
  const savedCallback = useRef(callback);

  // Luôn lưu callback mới nhất
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Thiết lập interval
  useEffect(() => {
    if (!interval || !enabled) return undefined;
    const id = setInterval(() => {
      savedCallback.current?.();
    }, interval);

    return () => clearInterval(id);
  }, [interval, enabled]);

  // Tự refresh khi tab được focus lại
  useEffect(() => {
    if (!runOnFocus || !enabled) return undefined;

    const handleFocus = () => savedCallback.current?.();
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleFocus);

    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleFocus);
    };
  }, [runOnFocus, enabled]);
};

export default useAutoRefresh;

