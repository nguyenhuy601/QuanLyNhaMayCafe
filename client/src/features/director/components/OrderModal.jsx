import React, { useEffect, useState } from 'react';
import { getOrderById } from '../../../api/directorAPI';
import { enrichOrderData } from '../utils/dataMapper';

const OrderModal = ({ orderId, onClose }) => {
    const [orderData, setOrderData] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        // Nếu chưa có ID thì thôi
        if (!orderId) return;

        const run = async () => {
            setLoading(true);
            try {
                // B1: Lấy data thô
                const raw = await getOrderById(orderId);
                // B2: Ghép tên tuổi vào
                const full = await enrichOrderData(raw);
                // B3: Lưu lại
                setOrderData(full);
            } catch (e) {
                console.log(e);
            } finally {
                setLoading(false);
            }
        };
        run();
    }, [orderId]);

    if (!orderId) return null;

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center'
        }}>
            <div style={{background: 'white', padding: 20, borderRadius: 8, width: 500}}>
                <h2 style={{marginTop: 0}}>Chi tiết đơn: {orderData?.maDH}</h2>
                <hr/>
                {loading ? <p>Đang tải...</p> : (
                    <>
                        <p><b>Khách hàng:</b> {orderData?.customerName}</p>
                        <p><b>SĐT:</b> {orderData?.customerPhone}</p>
                        
                        <h4>Sản phẩm:</h4>
                        <ul>
                        {orderData?.chiTiet?.map((sp, i) => {
                            const soLuong = sp.soLuong || 0;
                            const donVi = sp.donVi;
                            const loaiTui = sp.loaiTui;
                            // Nếu loaiTui = "hop" thì hiển thị "Hộp"
                            const displayUnit = loaiTui === "hop" ? "Hộp" : (donVi !== null && donVi !== undefined ? donVi : "null");
                            return (
                                <li key={i}>
                                    {sp.productName} - SL: {soLuong} {displayUnit} - {sp.donGia}đ
                                </li>
                            );
                        })}
                        </ul>
                    </>
                )}
                <button onClick={onClose} style={{marginTop: 10, padding: '5px 15px'}}>Đóng</button>
            </div>
        </div>
    );
};

export default OrderModal;
