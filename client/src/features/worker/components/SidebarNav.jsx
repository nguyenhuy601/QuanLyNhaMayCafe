import { NavLink } from "react-router-dom";
const icons = { home: "🏠", list: "🗒️", box: "📦" };

export default function SidebarNav() {
  const items = [
    { to: "/worker", icon: "home", label: "Trang chủ" },
    { to: "/worker/shifts", icon: "list", label: "Xem ca làm" },
    { to: "/worker/salary", icon: "💰", label: "Xem lương" },
  ];

  return (
    <div className="flex h-full flex-col">
      <div>
        <div className="font-bold">Coffee Company</div>
        <div className="text-xs opacity-90 mt-0.5">
          <span className="block">Coffee App</span>
          <span className="opacity-80">Dashboard v1.0</span>
        </div>
      </div>

      <nav className="mt-3 flex flex-col gap-2">
        {items.map((it) => (
          <NavLink
            key={it.to}
            to={it.to}
            className={({ isActive }) =>
              [
                "flex items-center gap-2 rounded-lg px-3 py-2 text-white bg-[#5a2f10] opacity-90",
                isActive ? "outline outline-2 outline-[#f1a65c] opacity-100" : "hover:outline hover:outline-2 hover:outline-[#f1a65c]"
              ].join(" ")
            }
          >
            <span className="w-[22px] text-center">{icons[it.icon]}</span>
            <span>{it.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-auto grid gap-2">
        <div className="text-sm">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 mr-2" />
          Trạng thái hệ thống
        </div>
        <a
          href="/logout"
          className="bg-[#4b1f07] text-white rounded-lg px-3 py-2 text-center"
        >
          Đăng xuất
        </a>
      </div>
    </div>
  );
}
