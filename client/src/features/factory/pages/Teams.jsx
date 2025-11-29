import React from "react";
import { Users, UserCircle2, ClipboardList, Award } from "lucide-react";

const teams = [
  {
    id: "T1",
    name: "Tổ 1 - Rang xay",
    leader: "Nguyễn Văn Hùng",
    members: 8,
    shift: "Ca sáng",
    performance: "97%",
    planProgress: 82,
    planDeadline: "25/11/2025",
    tasks: ["Chuẩn bị nguyên liệu", "Rang xay Arabica", "Kiểm soát nhiệt độ"],
  },
  {
    id: "T2",
    name: "Tổ 2 - Đóng gói",
    leader: "Trần Thị Minh",
    members: 7,
    shift: "Ca chiều",
    performance: "95%",
    planProgress: 68,
    planDeadline: "27/11/2025",
    tasks: ["Định lượng", "Đóng gói thành phẩm", "Niêm phong & QC"],
  },
  {
    id: "T3",
    name: "Tổ 3 - Hòa tan",
    leader: "Lê Hoàng",
    members: 6,
    shift: "Ca tối",
    performance: "93%",
    planProgress: 54,
    planDeadline: "30/11/2025",
    tasks: ["Hòa tan 3in1", "Sấy phun", "Đóng gói túi nhỏ"],
  },
];

export default function FactoryTeams() {
  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Teams
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Thông tin các tổ sản xuất
          </h1>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {teams.map((team) => (
          <div
            key={team.id}
            className="bg-white border border-amber-100 rounded-3xl shadow p-6 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-widest text-amber-400">
                  {team.id}
                </p>
                <h2 className="text-xl font-semibold text-amber-900">
                  {team.name}
                </h2>
              </div>
              <Award className="text-amber-500" size={28} />
            </div>

            <div className="flex items-center gap-3 rounded-2xl bg-amber-50 px-4 py-3">
              <UserCircle2 size={32} className="text-amber-600" />
              <div>
                <p className="text-xs text-amber-500">Tổ trưởng phụ trách</p>
                <p className="font-semibold">{team.leader}</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-sm">
              <div className="rounded-2xl bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">Thành viên</p>
                <p className="font-semibold text-gray-800">{team.members}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">Ca chính</p>
                <p className="font-semibold text-gray-800">{team.shift}</p>
              </div>
              <div className="rounded-2xl bg-gray-50 px-3 py-2">
                <p className="text-xs text-gray-500">Hiệu suất</p>
                <p className="font-semibold text-amber-700">{team.performance}</p>
              </div>
              <div className="col-span-3 rounded-2xl bg-white border border-amber-100 px-3 py-2">
                <div className="flex justify-between text-xs text-gray-500 mb-1">
                  <span>Tiến độ kế hoạch</span>
                  <span>Hạn: {team.planDeadline}</span>
                </div>
                <div className="w-full bg-amber-100 rounded-full h-3">
                  <div
                    className="h-3 rounded-full bg-gradient-to-r from-amber-500 to-amber-700"
                    style={{ width: `${team.planProgress}%` }}
                  />
                </div>
                <p className="text-right text-xs text-amber-700 font-semibold mt-1">
                  {team.planProgress}%
                </p>
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 text-sm font-semibold text-amber-800 mb-2">
                <ClipboardList size={16} />
                Nhiệm vụ chính
              </div>
              <ul className="space-y-1 text-sm text-amber-900">
                {team.tasks.map((task) => (
                  <li key={task} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                    {task}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <table className="min-w-full text-sm">
          <thead className="bg-amber-700 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-semibold">Tổ</th>
              <th className="px-4 py-3 text-left font-semibold">Tổ trưởng</th>
              <th className="px-4 py-3 text-left font-semibold">Thành viên</th>
              <th className="px-4 py-3 text-left font-semibold">Ca chính</th>
              <th className="px-4 py-3 text-left font-semibold">Hiệu suất</th>
              <th className="px-4 py-3 text-left font-semibold">Tiến độ kế hoạch</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-amber-50 bg-white">
            {teams.map((team) => (
              <tr key={team.id} className="hover:bg-amber-50/60">
                <td className="px-4 py-3 font-semibold">{team.name}</td>
                <td className="px-4 py-3">{team.leader}</td>
                <td className="px-4 py-3">{team.members} người</td>
                <td className="px-4 py-3">{team.shift}</td>
                <td className="px-4 py-3 text-amber-700 font-semibold">
                  {team.performance}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-amber-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-amber-600 rounded-full"
                        style={{ width: `${team.planProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-amber-800">
                      {team.planProgress}%
                    </span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

