const axios = require('axios');

// Sử dụng tên service trong Docker network, fallback về localhost nếu chạy local
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://api-gateway:4000';

/**
 * Cập nhật số lượng tồn kho của sản phẩm/nguyên vật liệu
 * @param {string} productId - ID của sản phẩm
 * @param {number} quantityChange - Số lượng thay đổi (dương = tăng, âm = giảm)
 * @param {string} token - JWT token để authenticate (optional, nếu gọi từ controller có req)
 */
exports.updateProductQuantity = async (productId, quantityChange, token = null) => {
  const buildHeaders = (tk) => {
    const headers = { 'Content-Type': 'application/json' };
    if (tk) {
      headers.Authorization = tk.startsWith('Bearer ') ? tk : `Bearer ${tk}`;
    }
    return headers;
  };

  // Thử cập nhật qua API Gateway
  const tryUpdateViaGateway = async (tk) => {
    const headers = buildHeaders(tk);
    // Lấy thông tin sản phẩm hiện tại qua API Gateway
    const getResponse = await axios.get(`${GATEWAY_URL}/products/${productId}`, { headers });
    const currentProduct = getResponse.data;
    const currentQuantity = currentProduct.soLuong || 0;
    const newQuantity = Math.max(0, currentQuantity + quantityChange);
    await axios.put(`${GATEWAY_URL}/products/${productId}`, { soLuong: newQuantity }, { headers });
    console.log(`✅ Updated product ${productId} quantity via Gateway: ${currentQuantity} → ${newQuantity} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);
    return newQuantity;
  };

  try {
    // Gọi qua Gateway
    return await tryUpdateViaGateway(token);
  } catch (error) {
    console.error(`❌ Error updating product quantity for ${productId}:`, error.message);
    if (error.response) {
      console.error(`❌ Status: ${error.response.status}`);
      console.error(`❌ Response data:`, error.response.data);
      console.error(`❌ Request URL: ${GATEWAY_URL}/products/${productId}`);
      console.error(`❌ Has token: ${!!token}`);
      if (token) {
        try {
          const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          console.error(`❌ Token role: ${payload.role}`);
        } catch (e) {
          console.error(`❌ Cannot decode token`);
        }
      }
    }
    throw error;
  }
};

