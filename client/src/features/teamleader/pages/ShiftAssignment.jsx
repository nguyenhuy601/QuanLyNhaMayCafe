import React, { useState } from "react";
import { Clipboard, Clock4, Users, UserPlus } from "lucide-react";

export default function ShiftAssignment() {
  const workerOptions = [
    { id: "CN001", name: "Nguyễn Văn A", team: "Tổ 1" },
    { id: "CN002", name: "Trần Thị B", team: "Tổ 1" },
    { id: "CN003", name: "Lê Văn C", team: "Tổ 2" },
    { id: "CN004", name: "Phạm Thị D", team: "Tổ 2" },
  ];

  const [formData, setFormData] = useState({
    workerId: "",
    shift: "Ca sáng (06h - 14h)",
    date: new Date().toISOString().split("T")[0],
    tasks: "",
  });
  const [assignments, setAssignments] = useState([
    {
      id: 1,
      team: "Tổ 1",
      shift: "Sáng",
      date: "2025-11-20",
      tasks: "Chuẩn bị nguyên liệu",
    },
    {
      id: 2,
      team: "Tổ 2",
      shift: "Chiều",
      date: "2025-11-20",
      tasks: "Đóng gói thành phẩm",
    },
  ]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.team || !formData.tasks) return;
    setAssignments((prev) => [
      ({
        id: prev.length + 1,
        workerId: formData.workerId,
        worker: workerOptions.find((w) => w.id === formData.workerId),
        shift: formData.shift,
        date: formData.date,
        tasks: formData.tasks,
      }),
      ...prev,
    ]);
    setFormData({
      workerId: "",
      shift: "Ca sáng (06h - 14h)",
      date: formData.date,
      tasks: "",
    });
  };

  const inputClass =
    "mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500";

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <Clipboard size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Scheduling
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Phân công ca làm
          </h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6">
        <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Công nhân
            </label>
            <select
              name="workerId"
              value={formData.workerId}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="">-- Chọn công nhân --</option>
              {workerOptions.map((worker) => (
                <option key={worker.id} value={worker.id}>
                  {worker.name} ({worker.team})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Ngày thực hiện
            </label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Ca làm
            </label>
            <select
              name="shift"
              value={formData.shift}
              onChange={handleChange}
              className={inputClass}
            >
              <option value="Ca sáng (06h - 14h)">Ca sáng (06h - 14h)</option>
              <option value="Ca chiều (14h - 22h)">Ca chiều (14h - 22h)</option>
              <option value="Ca tối (22h - 06h)">Ca tối (22h - 06h)</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-semibold text-amber-800">
              Nội dung công việc
            </label>
            <textarea
              name="tasks"
              value={formData.tasks}
              onChange={handleChange}
              placeholder="Mô tả chi tiết công việc cần thực hiện trong ca..."
              rows={3}
              className={`${inputClass} resize-none`}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              disabled={!formData.workerId || !formData.tasks}
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 font-semibold text-white shadow hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="inline-flex items-center gap-2">
                <UserPlus size={18} />
                Giao ca làm
              </span>
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">
                  Công nhân
                </th>
                <th className="px-4 py-3 text-left font-semibold">Ca làm</th>
                <th className="px-4 py-3 text-left font-semibold">Ngày</th>
                <th className="px-4 py-3 text-left font-semibold">
                  Nội dung
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {assignments.map((item) => (
                <tr key={item.id} className="hover:bg-amber-50/60">
                  <td className="px-4 py-3 font-semibold flex items-center gap-2">
                    <Users size={16} className="text-amber-500" />
                    <div>
                      <p>{item.worker?.name}</p>
                      <p className="text-xs text-amber-600">
                        {item.worker?.id} • {item.worker?.team}
                      </p>
                    </div>
                  </td>
                  <td className="px-4 py-3 flex items-center gap-2">
                    <Clock4 size={16} className="text-amber-500" />
                    {item.shift}
                  </td>
                  <td className="px-4 py-3">{item.date}</td>
                  <td className="px-4 py-3">{item.tasks}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

