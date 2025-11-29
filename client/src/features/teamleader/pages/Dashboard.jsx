import React from "react";
import { ClipboardCheck, Users, Calendar, CheckCircle2 } from "lucide-react";

export default function Dashboard() {
  const stats = [
    { label: "Công việc hôm nay", value: 12, icon: <ClipboardCheck size={22} />, accent: "from-amber-500 to-amber-600" },
    { label: "Thành viên tổ", value: 8, icon: <Users size={22} />, accent: "from-amber-400 to-amber-500" },
    { label: "Đang thực hiện", value: 6, icon: <Calendar size={22} />, accent: "from-amber-500 to-amber-700" },
    { label: "Hoàn thành", value: 4, icon: <CheckCircle2 size={22} />, accent: "from-emerald-500 to-emerald-600" },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-3xl shadow-lg px-10 py-12 border border-amber-100 text-center">
        <p className="text-sm uppercase tracking-[0.3em] text-amber-400 mb-3">Tổ trưởng</p>
        <h1 className="text-3xl font-bold text-amber-900 mb-4">
          Tổng quan hoạt động tổ sản xuất
        </h1>
        <p className="text-amber-700 mb-8 max-w-2xl mx-auto">
          Theo dõi tiến độ công việc, phân bổ nhân lực và đảm bảo chất lượng theo kế hoạch đã được phê duyệt.
        </p>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((item) => (
            <div key={item.label} className="bg-amber-50 rounded-2xl p-4 text-left border border-amber-100">
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-r ${item.accent} text-white flex items-center justify-center mb-3`}>
                {item.icon}
              </div>
              <p className="text-sm text-amber-500">{item.label}</p>
              <p className="text-2xl font-bold text-amber-900">{item.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

