import { useEffect, useState, useCallback } from "react";
import { getAllUsers } from "../api/adminAPI";

// Hook dùng chung để lấy thông tin nhân sự tương ứng với account đang đăng nhập
// Logic đơn giản theo cách trang admin hoạt động: luôn load từ token, mỗi tab độc lập
export default function useCurrentUser() {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUserInfo = useCallback(async () => {
    setLoading(true);

    // 1. Lấy token: ưu tiên sessionStorage (per-tab), fallback localStorage
    const token =
      sessionStorage.getItem("token") ||
      localStorage.getItem("token") ||
      window.userToken;

    if (!token) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    // 2. Decode JWT để lấy thông tin account (payload)
    let payload;
    try {
      payload = JSON.parse(atob(token.split(".")[1]));
    } catch (e) {
      setCurrentUser(null);
      setLoading(false);
      return;
    }

    try {
      // 3. Lấy email để map sang bảng nhân sự
      const emailToSearch =
        sessionStorage.getItem("userEmail") ||
        localStorage.getItem("userEmail") ||
        payload.email;

      if (!emailToSearch) {
        // Không có email trong hệ thống users, dùng thông tin từ token
        setCurrentUser({
          email: payload.email || null,
          hoTen: payload.hoTen || payload.name || payload.fullName || null,
        });
        setLoading(false);
        return;
      }

      // 4. Load danh sách users và tìm user theo email
      const users = await getAllUsers();
      const emailNormalized = emailToSearch.trim().toLowerCase();

      let user = users.find((u) => {
        if (!u.email) return false;
        return u.email.trim().toLowerCase() === emailNormalized;
      });

      // 5. Fallback: thử tìm theo id trong payload
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

      // 5b. Fallback: thử tìm theo maNV nếu có trong payload
      if (!user && payload) {
        const maNV = payload.maNV || payload.employee?.maNV;
        if (maNV) {
          user = users.find((u) => {
            return u.maNV && u.maNV.toString() === maNV.toString();
          });
        }
      }

      // 6. Nếu tìm được trong bảng nhân sự thì dùng (ưu tiên hoTen từ User model)
      if (user) {
        // Đảm bảo hoTen được ưu tiên từ User model
        setCurrentUser({
          ...user,
          hoTen: user.hoTen || payload.hoTen || payload.name || payload.fullName || null,
        });
        sessionStorage.setItem("user", JSON.stringify(user));
      } else {
        // Fallback: dùng thông tin từ token
        setCurrentUser({
          email: payload.email || emailToSearch,
          hoTen: payload.hoTen || payload.name || payload.fullName || null,
        });
      }
    } catch (err) {
      // Fallback trong trường hợp không gọi được adminAPI (403, 500, network error, ...)
      setCurrentUser({
        email: payload?.email || null,
        hoTen: payload?.hoTen || payload?.name || payload?.fullName || null,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUserInfo();

    // Lắng nghe sự kiện storage để reload khi token thay đổi từ tab khác
    const handleStorageChange = (e) => {
      if (e.key === "token" || e.key === "userEmail" || e.key === "user") {
        loadUserInfo();
      }
    };

    // Lắng nghe custom event khi token thay đổi trong cùng tab
    const handleTokenChanged = () => {
      loadUserInfo();
    };

    // Lắng nghe storage event (chỉ trigger khi thay đổi từ tab khác)
    window.addEventListener("storage", handleStorageChange);
    
    // Lắng nghe custom event (trigger khi đăng nhập trong cùng tab)
    window.addEventListener("tokenChanged", handleTokenChanged);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tokenChanged", handleTokenChanged);
    };
  }, [loadUserInfo]);

  return { currentUser, loading };
}








