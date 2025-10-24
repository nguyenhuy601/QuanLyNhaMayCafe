export default function Sidebar() {
  return (
    <aside className="w-64 bg-[#5C2C12] text-white flex flex-col justify-between p-4 rounded-l-2xl">
      <div>
        <h1 className="text-lg font-bold mb-4">Coffee Company</h1>

        <div className="flex items-center gap-3 mb-6 bg-[#78421F] p-3 rounded-xl">
          <div className="bg-[#A06437] p-2 rounded-lg">☕</div>
          <div>
            <p className="font-semibold">Coffee App</p>
            <p className="text-xs opacity-80">Dashboard v1.0</p>
          </div>
        </div>

        <nav className="flex flex-col gap-2">
          {[
            { icon: "🏠", text: "Trang chủ", active: true },
            { icon: "📅", text: "Phân công công việc" },
            { icon: "📊", text: "Thống kê kết quả sản xuất" },
            { icon: "🗂️", text: "Xem kế hoạch" },
            { icon: "🧾", text: "Kiểm tra thành phẩm" },
          ].map((item) => (
            <a
              key={item.text}
              className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer ${
                item.active
                  ? "bg-[#78421F] shadow-inner font-semibold"
                  : "hover:bg-[#78421F]/60"
              }`}
            >
              <span>{item.icon}</span>
              {item.text}
            </a>
          ))}
        </nav>
      </div>

      <div className="flex items-center gap-3 bg-[#78421F] p-3 rounded-xl mt-6">
        <div className="w-2 h-2 bg-green-400 rounded-full"></div>
        <span className="text-sm">Trạng thái hệ thống</span>
      </div>
    </aside>
  );
}
