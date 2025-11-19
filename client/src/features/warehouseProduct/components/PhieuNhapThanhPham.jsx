import React, { useState } from 'react';

// Định nghĩa các màu sắc chính dựa trên hình ảnh
const primaryBg = '#8B4513'; 
const formBg = '#7C4318';   
const inputBg = '#B87333';  
const buttonBg = '#C67E3F'; 
const buttonHover = '#A0522D'; 
const successColor = '#4CAF50'; // Màu xanh lá cho thông báo thành công

// Dữ liệu cố định (lấy từ Phiếu QC/Hệ thống)
const qcData = {
  maPhieuQC: 'QC001',
  maSanPham: 'SP004',
  tenSanPham: 'cafe rang xay arabica',
  loSanXuat: 'Lo002',
  ngayNhap: '19/10/2025',
  tongTonKhoSauNhap: '25000', 
};

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
    // Thêm logic Lưu phiếu nhập tại đây (ví dụ: chuyển trang, in phiếu,...)
    alert("Đã lưu và đóng phiếu nhập.");
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
        <p className="text-gray-600 mb-6">Bạn có muốn lưu và đóng phiếu này không?</p>
        
        <button
          onClick={handleSave}
          className="py-2 px-6 rounded-lg font-bold text-white shadow-md transition-colors duration-200"
          style={{ backgroundColor: successColor }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#388E3C'} // Màu xanh đậm hơn
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = successColor}
        >
          Lưu
        </button>
      </div>
    </div>
  );
};

// =================================================================
//                 MAIN COMPONENT
// =================================================================
const PhieuNhapThanhPham = () => {
  const [formData, setFormData] = useState({
    khoLuuTru: '',
    soLuongNhap: '',
    ghiChu: '',
  });
  const [isModalOpen, setIsModalOpen] = useState(false); // State quản lý Modal

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleConfirm = () => {
    // Kiểm tra tính hợp lệ đơn giản
    if (!formData.khoLuuTru || !formData.soLuongNhap) {
      alert("Vui lòng chọn Kho lưu trữ và nhập Số lượng nhập.");
      return;
    }
    
    // Logic xử lý thành công (ví dụ: gọi API)
    console.log("Dữ liệu gửi đi:", { ...qcData, ...formData });
    
    // Mở Modal thông báo thành công
    setIsModalOpen(true);
  };
  
  const handleCancel = () => {
    setFormData({ khoLuuTru: '', soLuongNhap: '', ghiChu: '' });
    // Thêm logic chuyển hướng hoặc đóng form
    alert("Phiếu nhập đã được hủy.");
  };

  return (
    <div className="flex justify-center items-center w-full min-h-full p-6 bg-gray-100 relative"> 
      
      <div className="w-full max-w-lg p-8 rounded-xl shadow-2xl" style={{ backgroundColor: formBg }}>
        
        <h2 className="text-2xl font-bold text-white text-center mb-8 pb-4" 
            style={{ color: '#D2B48C', textShadow: '1px 1px 2px #000000', borderBottom: `1px solid ${inputBg}` }}>
          Phiếu nhập thành phẩm
        </h2>

        {/* Form Inputs */}
        <div className="space-y-4">
          <InputField label="Mã phiếu QC" value={qcData.maPhieuQC} readOnly={true} name="maPhieuQC"/>
          <InputField label="Mã sản phẩm" value={qcData.maSanPham} readOnly={true} name="maSanPham"/>
          <InputField label="Tên sản phẩm" value={qcData.tenSanPham} readOnly={true} name="tenSanPham"/>
          <InputField label="Lô sản xuất" value={qcData.loSanXuat} readOnly={true} name="loSanXuat"/>
          <InputField label="Ngày nhập" value={qcData.ngayNhap} readOnly={true} name="ngayNhap"/>
          
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
            placeholder="Nhập số lượng"
          />
          
          <InputField label="Tổng tồn kho sau nhập" value={qcData.tongTonKhoSauNhap} readOnly={true} name="tongTonKhoSauNhap"/>
          
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
            className="py-2 px-6 rounded-lg font-bold text-white shadow-md transition-colors duration-200"
            style={{ backgroundColor: buttonBg }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonBg}
          >
            Hủy
          </button>
          
          <button 
            onClick={handleConfirm}
            className="py-2 px-6 rounded-lg font-bold text-white shadow-md transition-colors duration-200"
            style={{ backgroundColor: buttonBg }}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = buttonHover}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = buttonBg}
          >
            Xác nhận
          </button>
        </div>
      </div>

      {/* MODAL HIỂN THỊ THÀNH CÔNG */}
      <SuccessModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default PhieuNhapThanhPham;