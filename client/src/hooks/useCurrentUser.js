import { useEffect, useState } from "react";
import { getAllUsers } from "../api/adminAPI";

// Hook dùng chung để lấy thông tin nhân sự tương ứng với account đang đăng nhập
// Ưu tiên dữ liệu theo từng tab (sessionStorage), fallback sang localStorage.
export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserInfo = async () => {
      setLoading(true);
      try {
        // Ưu tiên user trong sessionStorage (per-tab), sau đó tới localStorage
        const storedUser = JSON.parse(
          sessionStorage.getItem("user") ||
            localStorage.getItem("user") ||
            "{}"
        );
        if (storedUser.hoTen && storedUser._id) {
          setCurrentUser(storedUser);
          setLoading(false);
          // vẫn tiếp tục load để cập nhật nếu cần
        }

        const token =
          sessionStorage.getItem("token") ||
          localStorage.getItem("token") ||
          window.userToken;
        if (!token) {
          setLoading(false);
          return;
        }

        // Decode JWT để lấy thông tin account
        let payload;
        try {
          payload = JSON.parse(atob(token.split(".")[1]));
        } catch (e) {
          console.error("❌ Lỗi decode JWT:", e);
          setLoading(false);
          return;
        }

        // Lấy email để map sang bảng nhân sự
        let emailToSearch =
          sessionStorage.getItem("userEmail") ||
          localStorage.getItem("userEmail") ||
          payload.email;

        if (!emailToSearch) {
          const fallbackStored = JSON.parse(
            sessionStorage.getItem("user") ||
              localStorage.getItem("user") ||
              "{}"
          );
          emailToSearch = fallbackStored.email;
        }

        const users = await getAllUsers();

        let user = null;
        if (emailToSearch) {
          const emailNormalized = emailToSearch.trim().toLowerCase();
          user = users.find((u) => {
            if (!u.email) return false;
            return u.email.trim().toLowerCase() === emailNormalized;
          });
        }

        // Fallback: thử theo id trong payload
        if (!user && payload) {
          const accountId = payload.id || payload._id || payload.userId;
          if (accountId) {
            const accountIdStr = accountId.toString();
            user = users.find((u) => {
              const uId = u._id?.toString() || u.id?.toString();
              return uId === accountIdStr;
            });
          }
        }

        if (user) {
          setCurrentUser(user);
          const userStr = JSON.stringify(user);
          sessionStorage.setItem("user", userStr);
          localStorage.setItem("user", userStr);
        } else if (payload?.email) {
          // Nếu vẫn không map được thì dùng email trong payload
          setCurrentUser({ email: payload.email, hoTen: null });
        }
      } catch (err) {
        console.error("❌ Lỗi khi tải thông tin user:", err);
        const storedUser = JSON.parse(
          sessionStorage.getItem("user") ||
            localStorage.getItem("user") ||
            "{}"
        );
        if (storedUser.hoTen || storedUser.email) {
          setCurrentUser(storedUser);
        }
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);

  return { currentUser, loading };
}



