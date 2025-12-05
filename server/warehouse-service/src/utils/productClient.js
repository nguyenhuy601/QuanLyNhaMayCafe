const axios = require('axios');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://api-gateway:4000';

/**
 * Cập nhật số lượng tồn kho của sản phẩm/nguyên vật liệu
 * @param {string} productId - ID của sản phẩm
 * @param {number} quantityChange - Số lượng thay đổi (dương = tăng, âm = giảm)
 * @param {string} token - JWT token để authenticate (optional, nếu gọi từ controller có req)
 */
exports.updateProductQuantity = async (productId, quantityChange, token = null) => {
  try {
    const headers = {};
    if (token) {
      // Token có thể đã có "Bearer " prefix hoặc chưa
      headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    
    // Lấy thông tin sản phẩm hiện tại qua API Gateway
    const getResponse = await axios.get(`${GATEWAY_URL}/products/${productId}`, { headers });
    const currentProduct = getResponse.data;
    const currentQuantity = currentProduct.soLuong || 0;
    
    // Cập nhật số lượng mới
    const newQuantity = Math.max(0, currentQuantity + quantityChange);
    
    await axios.put(`${GATEWAY_URL}/products/${productId}`, {
      soLuong: newQuantity
    }, { headers });
    
    console.log(`✅ Updated product ${productId} quantity: ${currentQuantity} → ${newQuantity} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);
    return newQuantity;
  } catch (error) {
    console.error(`❌ Error updating product quantity for ${productId}:`, error.message);
    throw error;
  }
};

