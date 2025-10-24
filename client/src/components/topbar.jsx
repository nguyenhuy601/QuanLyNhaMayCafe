export default function Topbar() {
  return (
    <header className="h-16 bg-[#7B3F22] text-white flex items-center justify-between px-6">
      <input
        type="text"
        placeholder="Tìm kiếm..."
        className="bg-[#6A341D] text-white px-3 py-2 rounded-lg w-80 outline-none placeholder:text-gray-300"
      />
      <div className="flex items-center gap-4">
        <button className="text-xl">🔔</button>
        <button className="text-xl">⚙️</button>
        <div className="flex items-center gap-2 border-l border-white/30 pl-3">
          <div className="bg-[#6A341D] w-10 h-10 rounded-full flex items-center justify-center text-xl">
            👤
          </div>
          <div>
            <p className="font-semibold leading-4">Your Name</p>
            <p className="text-xs opacity-90">Xưởng trưởng</p>
          </div>
        </div>
      </div>
    </header>
  );
}
