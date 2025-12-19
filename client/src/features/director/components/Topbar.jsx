import { Bell, Settings, User } from 'lucide-react';
import useCurrentUser from '../../../hooks/useCurrentUser';

export default function Topbar() {
  const { currentUser, loading } = useCurrentUser();

  return (
    // Áp dụng style gradient và shadow của file mẫu
    <header className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between shadow-lg">
      
      {/* --- Div trống để đẩy nội dung sang phải (thay thế thanh tìm kiếm) --- */}
      <div className="flex-1"></div>

      {/* --- Các nút (Lấy từ file mẫu) --- */}
      <div className="flex items-center gap-4">
        <button className="p-2 hover:bg-amber-600 rounded-lg transition-colors">
          <Bell size={22} />
        </button>
        <button className="p-2 hover:bg-amber-600 rounded-lg transition-colors">
          <Settings size={22} />
        </button>

        {/* --- Profile (Lấy từ file mẫu) --- */}
        <div className="flex items-center gap-3 pl-4 border-l border-amber-600">
          <div className="w-10 h-10 bg-amber-500 rounded-full flex items-center justify-center">
            <User size={22} />
          </div>
          <div>
            <div className="font-semibold">
              {loading
                ? 'Đang tải...'
                : currentUser?.hoTen || currentUser?.email || 'Your Name'}
            </div>
            {/* Set role "Ban giám đốc" của bạn */}
            <div className="text-xs text-amber-200">Ban giám đốc</div>
          </div>
        </div>
      </div>
    </header>
  );
}

