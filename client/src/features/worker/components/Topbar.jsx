import { useState } from "react";

export default function Topbar() {
  const [q, setQ] = useState("");
  return (
    <header className="flex items-center justify-between bg-[#6d3a14] text-white px-4 py-2">
      <form
        className="flex items-center bg-[#7f4a1d] rounded-md px-3 py-1 min-w-[320px]"
        onSubmit={(e) => e.preventDefault()}
      >
        <span className="mr-2">🔎</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Tìm kiếm..."
          className="bg-transparent outline-none w-full placeholder-white/80"
        />
      </form>

      <div className="flex items-center gap-3">
        <button title="Thông báo">🔔</button>
        <button title="Cài đặt">⚙️</button>
        <div className="flex items-center gap-2 bg-[#7f4a1d] rounded-md px-3 py-1">
          <span className="bg-amber-200 rounded-full px-2 py-1">👤</span>
          <div className="text-xs leading-tight">
            <div className="font-medium">Your Name</div>
            <div className="opacity-90">Công Nhân</div>
          </div>
        </div>
      </div>
    </header>
  );
}
