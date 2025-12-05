import React, { useState } from 'react';
import { createFinishedReceipt } from '../../../services/warehouseService.js';

// Định nghĩa các màu sắc chính dựa trên hình ảnh
const primaryBg = '#8B4513'; 
const formBg = '#7C4318';   
const inputBg = '#B87333';  
const buttonBg = '#C67E3F'; 
const buttonHover = '#A0522D'; 
const successColor = '#4CAF50'; // Màu xanh lá cho thông báo thành công

const khoLuuTruOptions = [
  { label: 'Chọn kho lưu trữ....', value: '' },
  { label: 'Kho A ', value: 'KHA' },
  { label: 'Kho B ', value: 'KHB' },
  { label: 'Kho C ', value: 'KHC' },
];

// Component cho trường nhập liệu
const InputField = ({ label, value, type = 'text', readOnly = false, onChange, placeholder = '', name }) => {
  const isInputEditable = !readOnly;
  
  return (
    <div className="flex items-center mb-4">
      <label className="w-1/3 text-white text-sm font-medium pr-4 text-left">
        {label}:
      </label>
      <input
        type={type}
        name={name}
        readOnly={readOnly}
        value={value}
        onChange={isInputEditable ? onChange : undefined}
        placeholder={placeholder}
        className={`w-2/3 py-2 px-3 rounded-lg shadow-inner text-sm outline-none ${
          readOnly ? 'text-white' : 'text-white placeholder-gray-300'
        }`}
        style={{ 
            backgroundColor: inputBg, 
            border: 'none', 
            opacity: readOnly ? 0.8 : 1 
        }}
      />
    </div>
  );
};

// Component cho trường Select/Dropdown
const SelectField = ({ label, value, onChange, options, name }) => {
  return (
    <div className="flex items-center mb-4">
      <label className="w-1/3 text-white text-sm font-medium pr-4 text-left">
        {label}:
      </label>
      <select
        name={name}
        value={value}
        onChange={onChange}
        className="w-2/3 py-2 px-3 rounded-lg shadow-inner text-white text-sm outline-none cursor-pointer appearance-none"
        style={{ backgroundColor: inputBg, border: 'none' }}
      >
        {options.map((option, index) => (
          <option key={index} value={option.value} className="bg-[#5c371d] text-white">
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// =================================================================
//                 MODAL COMPONENT (MỚI)
// =================================================================
const SuccessModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleSave = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-2xl text-center" style={{ width: '400px' }}>
        <div 
          className="text-3xl mb-4 mx-auto w-16 h-16 rounded-full flex items-center justify-center text-white"
          style={{ backgroundColor: successColor }}
        >
          ✓
        </div>
        <h3 className="text-xl font-bold mb-3 text-gray-800">Tạo phiếu nhập thành công!</h3>
        <p className="text-gray-600 mb-6">Phiếu nhập thành phẩm đã được lưu vào hệ thống.</p>
        
        <button
          onClick={handleSave}
          className="py-2 px-6 rounded-lg font-bold text-white shadow-md transition-colors duration-200"
          style={{ backgroundColor: successColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#388E3C'} // Màu xanh đậm hơn
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = successColor}
        >
          Đóng
        </button>
      </div>
    </div>
  );
};

// =================================================================
//                 MAIN COMPONENT
// =================================================================
const PhieuNhapThanhPham = ({ selectedQC, onClose }) => {
  const [formData, setFormData] = useState({
    khoLuuTru: '',
    soLuongNhap: '',
    ngaySanXuat: '',
    hanSuDung: '',
    ghiChu: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Lấy dữ liệu từ QC
  const qcData = selectedQC ? {
    _id: selectedQC._id || '',
    maPhieuQC: selectedQC.qcRequest?.maPhieuQC || selectedQC.maPhieuQC || '',
    maSanPham: selectedQC.qcRequest?.sanPham?.maSP || selectedQC.maSanPham || '',
    tenSanPham: selectedQC.qcRequest?.sanPham?.tenSP || selectedQC.tenSanPham || '',
    soLuongDat: selectedQC.soLuongDat || 0,
    loSanXuat: selectedQC.loSanXuat || selectedQC.qcRequest?.loSanXuat || '',
    ngayKiemTra: selectedQC.ngayKiemTra || '',
  } : {};

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleConfirm = async () => {
    try {
      // Kiểm tra tính hợp lệ
      if (!formData.khoLuuTru) {
        setError("Vui lòng chọn Kho lưu trữ.");
        return;
      }
      
      if (!formData.soLuongNhap || parseInt(formData.soLuongNhap) <= 0) {
        setError("Vui lòng nhập Số lượng nhập > 0.");
        return;
      }

      if (parseInt(formData.soLuongNhap) > qcData.soLuongDat) {
        setError("Số lượng nhập không được vượt quá số lượng đạt.");
        return;
      }

      setLoading(true);

      const payload = {
        phieuQC: qcData._id,
        sanPham: selectedQC.qcRequest?.sanPham?._id || selectedQC.sanPham?._id || '',
        soLuong: parseInt(formData.soLuongNhap),
        loSanXuat: formData.loSanXuat || qcData.loSanXuat,
        ngaySanXuat: formData.ngaySanXuat || new Date().toISOString().split('T')[0],
        hanSuDung: formData.hanSuDung,
        khoLuuTru: formData.khoLuuTru,
        ghiChu: formData.ghiChu,
      };

      await createFinishedReceipt(payload);
      setIsModalOpen(true);
    } catch (err) {
      console.error("Lỗi tạo phiếu nhập:", err);
      setError(err.response?.data?.error || err.response?.data?.message || "Lỗi tạo phiếu nhập thành phẩm");
    } finally {
      setLoading(false);
    }
  };
  
  const handleCancel = () => {
    setFormData({ khoLuuTru: '', soLuongNhap: '', ngaySanXuat: '', hanSuDung: '', ghiChu: '' });
    setError(null);
    onClose();
  };

  return (
    <div className="flex justify-center items-center w-full min-h-full p-6 bg-gray-100 relative"> 
      
      <div className="w-full max-w-lg p-8 rounded-xl shadow-2xl" style={{ backgroundColor: formBg }}>
        
        <h2 className="text-2xl font-bold text-white text-center mb-8 pb-4" 
            style={{ color: '#D2B48C', textShadow: '1px 1px 2px #000000', borderBottom: `1px solid ${inputBg}` }}>
          Phiếu nhập thành phẩm
        </h2>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {/* Form Inputs */}
        <div className="space-y-4">
          <InputField label="Mã phiếu QC" value={qcData.maPhieuQC || ''} readOnly={true} name="maPhieuQC"/>
          <InputField label="Mã sản phẩm" value={qcData.maSanPham || ''} readOnly={true} name="maSanPham"/>
          <InputField label="Tên sản phẩm" value={qcData.tenSanPham || ''} readOnly={true} name="tenSanPham"/>
          <InputField label="Lô sản xuất" value={formData.loSanXuat || qcData.loSanXuat || ''} onChange={handleChange} name="loSanXuat"/>
          <InputField label="Ngày sản xuất" value={formData.ngaySanXuat} onChange={handleChange} type="date" name="ngaySanXuat"/>
          <InputField label="Hạn sử dụng" value={formData.hanSuDung} onChange={handleChange} type="date" name="hanSuDung"/>
          
          <SelectField 
            label="Kho lưu trữ" 
            name="khoLuuTru"
            value={formData.khoLuuTru}
            onChange={handleChange}
            options={khoLuuTruOptions} 
          />
          
          <InputField 
            label="Số lượng nhập" 
            name="soLuongNhap"
            value={formData.soLuongNhap}
            onChange={handleChange}
            type="number" 
            readOnly={false} 
            placeholder={`Tối đa: ${qcData.soLuongDat || 0}`}
          />
          
          <InputField label="Tổng số lượng đạt" value={qcData.soLuongDat || 0} readOnly={true} name="soLuongDat"/>
          
          <InputField 
            label="Ghi chú" 
            name="ghiChu"
            value={formData.ghiChu}
            onChange={handleChange}
            readOnly={false} 
            placeholder="Nhập ghi chú"
          />
        </div>

        {/* Actions (Buttons) */}
        <div className="flex justify-center space-x-8 mt-10">
          
          <button 
            onClick={handleCancel}
            disabled={loading}
            className="py-2 px-6 rounded-lg font-bold text-white shadow-md transition-colors duration-200"
            style={{ backgroundColor: buttonBg }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = buttonHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
          >
            Hủy
          </button>
          
          <button 
            onClick={handleConfirm}
            disabled={loading}
            className="py-2 px-6 rounded-lg font-bold text-white shadow-md transition-colors duration-200"
            style={{ backgroundColor: buttonBg, opacity: loading ? 0.6 : 1 }}
            onMouseEnter={(e) => !loading && (e.currentTarget.style.backgroundColor = buttonHover)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = buttonBg)}
          >
            {loading ? 'Đang xử lý...' : 'Xác nhận'}
          </button>
        </div>
      </div>

      {/* MODAL HIỂN THỊ THÀNH CÔNG */}
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          onClose();
        }} 
      />
    </div>
  );
};

export default PhieuNhapThanhPham;