import React, { useState } from "react";
import {
  CalendarDays,
  UserCheck,
  Check,
  X,
  Search,
  PlusCircle,
} from "lucide-react";

export default function Attendance() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [keyword, setKeyword] = useState("");
  const [workers, setWorkers] = useState([
    { id: "CN001", name: "Nguyễn Văn A", shift: "Ca sáng", status: "present" },
    { id: "CN002", name: "Trần Thị B", shift: "Ca chiều", status: "absent" },
    { id: "CN003", name: "Lê Văn C", shift: "Ca tối", status: "present" },
  ]);
  const [newWorker, setNewWorker] = useState({
    id: "",
    name: "",
    shift: "Ca sáng",
  });
  const [toast, setToast] = useState("");

  const toggleStatus = (id, status) => {
    setWorkers((prev) =>
      prev.map((worker) =>
        worker.id === id ? { ...worker, status } : worker
      )
    );
  };

  const filteredWorkers = workers.filter(
    (w) =>
      w.name.toLowerCase().includes(keyword.toLowerCase()) ||
      w.id.toLowerCase().includes(keyword.toLowerCase())
  );

  const addWorker = (e) => {
    e.preventDefault();
    if (!newWorker.id || !newWorker.name) return;
    setWorkers((prev) => [
      ...prev,
      { ...newWorker, status: "present" },
    ]);
    setNewWorker({ id: "", name: "", shift: "Ca sáng" });
  };

  const saveAttendance = () => {
    setToast("✅ Đã lưu bảng chấm công hôm nay");
    setTimeout(() => setToast(""), 1500);
  };

  return (
    <div className="space-y-6 text-amber-900">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-2xl bg-amber-100 text-amber-600">
          <UserCheck size={24} />
        </div>
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-amber-400">
            Attendance
          </p>
          <h1 className="text-3xl font-bold text-amber-900">
            Chấm công cho công nhân
          </h1>
        </div>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow p-6 space-y-4">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-2xl border border-amber-200 px-4 py-2.5 bg-white text-sm text-amber-900 focus-within:ring-2 focus-within:ring-amber-500">
            <CalendarDays size={18} className="text-amber-500" />
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
          <label className="flex items-center gap-3 rounded-2xl border border-amber-200 px-4 py-2.5 bg-white text-sm text-amber-900 focus-within:ring-2 focus-within:ring-amber-500 md:col-span-2">
            <Search size={18} className="text-amber-500" />
            <input
              type="text"
              placeholder="Tìm mã hoặc tên công nhân..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="flex-1 border-none bg-transparent outline-none"
            />
          </label>
        </div>
        <form
          onSubmit={addWorker}
          className="grid gap-4 md:grid-cols-3 pt-4 border-t border-amber-100"
        >
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Mã công nhân
            </label>
            <input
              type="text"
              value={newWorker.id}
              onChange={(e) =>
                setNewWorker({ ...newWorker, id: e.target.value })
              }
              placeholder="VD: CN010"
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Họ tên
            </label>
            <input
              type="text"
              value={newWorker.name}
              onChange={(e) =>
                setNewWorker({ ...newWorker, name: e.target.value })
              }
              placeholder="Tên công nhân"
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-amber-800">
              Ca làm
            </label>
            <select
              value={newWorker.shift}
              onChange={(e) =>
                setNewWorker({ ...newWorker, shift: e.target.value })
              }
              className="mt-2 w-full rounded-2xl border border-amber-200 bg-white px-4 py-2.5 text-sm text-amber-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
            >
              <option>Ca sáng</option>
              <option>Ca chiều</option>
              <option>Ca tối</option>
            </select>
          </div>
          <div className="md:col-span-3 flex justify-end">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-amber-700 text-white font-semibold shadow hover:shadow-lg transition"
            >
              <PlusCircle size={18} />
              Thêm công nhân
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border border-amber-100 rounded-3xl shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-amber-700 text-white">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Mã CN</th>
                <th className="px-4 py-3 text-left font-semibold">Họ tên</th>
                <th className="px-4 py-3 text-left font-semibold">Ca làm</th>
                <th className="px-4 py-3 text-left font-semibold">Trạng thái</th>
                <th className="px-4 py-3 text-left font-semibold">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-amber-50 bg-white">
              {filteredWorkers.map((worker) => (
                <tr key={worker.id} className="hover:bg-amber-50/60">
                  <td className="px-4 py-3 font-semibold">{worker.id}</td>
                  <td className="px-4 py-3">{worker.name}</td>
                  <td className="px-4 py-3">{worker.shift}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        worker.status === "present"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-rose-100 text-rose-700"
                      }`}
                    >
                      {worker.status === "present" ? "Có mặt" : "Vắng"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleStatus(worker.id, "present")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition ${
                          worker.status === "present"
                            ? "bg-emerald-500 text-white border-emerald-500"
                            : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                        }`}
                      >
                        <Check size={14} />
                        Có mặt
                      </button>
                      <button
                        onClick={() => toggleStatus(worker.id, "absent")}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-2xl text-xs font-semibold border transition ${
                          worker.status === "absent"
                            ? "bg-rose-500 text-white border-rose-500"
                            : "border-rose-200 text-rose-600 hover:bg-rose-50"
                        }`}
                      >
                        <X size={14} />
                        Vắng
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="flex justify-end">
        <button
          onClick={saveAttendance}
          className="px-8 py-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold shadow hover:shadow-lg transition"
        >
          Lưu bảng chấm công
        </button>
      </div>

      {toast && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none">
          <div className="bg-emerald-600 text-white px-5 py-3 rounded-full shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </div>
  );
}

