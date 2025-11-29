import React from "react";
import { User, Users, ClipboardList } from "lucide-react";

const leader = {
  id: "TTR001",
  name: "Nguyễn Văn Hùng",
  experience: "8 năm quản lý tổ sản xuất",
  shift: "Ca sáng (06h - 14h)",
  phone: "0987 123 456",
  email: "hung.nguyen@coffee.com",
  focus: ["Phân bổ nhân lực", "Giám sát chất lượng", "Đào tạo thành viên"],
};

const members = [
  { id: "CN001", name: "Trần Thị Lan", role: "Rang xay", shift: "Sáng" },
  { id: "CN002", name: "Lê Văn Cường", role: "Rang xay", shift: "Sáng" },
  { id: "CN003", name: "Phạm Thị Ngân", role: "Kiểm phẩm", shift: "Chiều" },
  { id: "CN004", name: "Hoàng Đình Tín", role: "Đóng gói", shift: "Chiều" },
  { id: "CN005", name: "Võ Thị Đào", role: "Đóng gói", shift: "Tối" },
];

export default function ToTruongInfo() {
  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <User size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Team Lead
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Thông tin tổ trưởng & thành viên
          </h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 grid gap-6 md:grid-cols-[2fr,1fr]">
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl font-semibold">
              {leader.name.split(" ").slice(-1)[0][0]}
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-amber-400">
                Mã {leader.id}
              </p>
              <h2 className="text-2xl font-bold text-amber-900">
                {leader.name}
              </h2>
              <p className="text-sm text-amber-700">{leader.experience}</p>
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2 text-sm">
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-500">Ca phụ trách</p>
              <p className="font-semibold text-amber-900">{leader.shift}</p>
            </div>
            <div className="rounded-2xl bg-amber-50 px-4 py-3">
              <p className="text-xs text-amber-500">Liên hệ</p>
              <p className="font-semibold text-amber-900">{leader.phone}</p>
              <p className="text-xs text-amber-600">{leader.email}</p>
            </div>
          </div>
        </div>

        <div className="rounded-3xl bg-gradient-to-b from-amber-600 to-amber-700 text-white p-5 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-amber-200">
            Trọng tâm quản lý
          </p>
          <ul className="text-sm space-y-2">
            {leader.focus.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-white" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <Users size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Thành viên trong tổ
            </p>
            <p className="text-xs text-amber-500">
              Danh sách nhân sự đang phụ trách
            </p>
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {members.map((member) => (
            <div
              key={member.id}
              className="border border-amber-100 rounded-2xl px-4 py-3 flex items-center justify-between hover:border-amber-200 transition"
            >
              <div>
                <p className="font-semibold text-amber-900">{member.name}</p>
                <p className="text-xs text-amber-500">{member.id}</p>
              </div>
              <div className="text-right text-sm">
                <p className="text-amber-700 font-semibold">{member.role}</p>
                <p className="text-xs text-amber-500">{member.shift}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-amber-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Thành viên</th>
              <th className="px-4 py-3 text-left font-semibold">Vai trò</th>
              <th className="px-4 py-3 text-left font-semibold">Ca làm</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50 bg-white">
            {members.map((member) => (
              <tr key={member.id} className="hover:bg-amber-50/60">
                <td className="px-4 py-3">
                  <div className="font-semibold text-amber-900">
                    {member.name}
                  </div>
                  <div className="text-xs text-amber-500">{member.id}</div>
                </td>
                <td className="px-4 py-3 text-amber-700 font-semibold">
                  {member.role}
                </td>
                <td className="px-4 py-3">{member.shift}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 space-y-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-100 text-amber-600">
            <ClipboardList size={18} />
          </div>
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Nhật ký hoạt động gần đây
            </p>
            <p className="text-xs text-amber-500">
              Các ghi chú nhanh do tổ trưởng cập nhật
            </p>
          </div>
        </div>
        <ul className="text-sm space-y-2 text-amber-800">
          <li>• 07:30 - Phân công lại nhân sự do thiếu người ca sáng</li>
          <li>• 10:00 - Kiểm tra lại nhiệt độ lò rang lô hàng Arabica</li>
          <li>• 12:15 - Bàn giao kết quả cho ca chiều và cập nhật tồn</li>
        </ul>
      </div>
    </div>
  );
}

