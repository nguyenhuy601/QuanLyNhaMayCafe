import { Bell, User } from 'lucide-react';

export default function Topbar() {
  const user = JSON.parse(localStorage.getItem('user') || '{}');

  return (
    // GIỮ NGUYÊN STYLE MÀU NÂU GRADIENT
    <header className="bg-gradient-to-r from-amber-700 to-amber-800 text-white p-4 flex items-center justify-between shadow-lg h-16">
      
      {/* BÊN TRÁI: ĐỂ TRỐNG (Giống Director) - Bỏ dòng chữ "Cổng thông tin..." */}
      <div></div>

      {/* BÊN PHẢI: ICON VÀ PROFILE */}
      <div className="flex items-center gap-4">
        {/* Nút Thông báo */}
        <button className="p-2 hover:bg-amber-600 rounded-lg transition-colors">
          <Bell size={22} />
        </button>

        {/* Profile User */}
        <div className="flex items-center gap-3 pl-4 border-l border-amber-600">
          <div className="w-9 h-9 bg-amber-500 rounded-full flex items-center justify-center border border-amber-300">
            <User size={20} />
          </div>
          <div>
            <div className="font-semibold text-sm">{user.hoTen || 'Công nhân'}</div>
            <div className="text-xs text-amber-200">Bộ phận Sản xuất</div>
          </div>
        </div>
      </div>
    </header>
  );
}