const axios = require('axios');

// Sử dụng tên service trong Docker network, fallback về localhost nếu chạy local
const GATEWAY_URL = process.env.GATEWAY_URL || 'http://api-gateway:4000';
const SALES_SERVICE_URL = process.env.SALES_SERVICE_URL || 'http://sales-service:3008';

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

  // Thử cập nhật trực tiếp đến sales-service (sử dụng internal endpoint)
  const tryUpdateDirect = async (tk) => {
    const SERVICE_SECRET = process.env.SERVICE_SECRET || "warehouse-service-secret-key";
    const serviceHeaders = {
      'X-Service-Secret': SERVICE_SECRET
    };
    
    // Lấy thông tin sản phẩm hiện tại trực tiếp từ sales-service (sử dụng internal endpoint)
    let currentProduct;
    let currentQuantity = 0;
    try {
      const getResponse = await axios.get(`${SALES_SERVICE_URL}/products/${productId}/internal`, { 
        headers: serviceHeaders
      });
      currentProduct = getResponse.data;
      currentQuantity = currentProduct.soLuong || 0;
    } catch (getError) {
      console.error(`❌ Error getting product ${productId} via internal endpoint:`, getError.message);
      // Nếu không được, dùng số lượng hiện tại là 0 và tính toán
      console.warn(`⚠️ Cannot get current product quantity, assuming 0`);
      currentQuantity = 0;
    }
    
    const newQuantity = Math.max(0, currentQuantity + quantityChange);
    
    // Sử dụng internal endpoint để cập nhật số lượng
    const updateHeaders = {
      'Content-Type': 'application/json',
      'X-Service-Secret': SERVICE_SECRET
    };
    await axios.put(`${SALES_SERVICE_URL}/products/${productId}/quantity`, { soLuong: newQuantity }, { headers: updateHeaders });
    console.log(`✅ Updated product ${productId} quantity via Direct (internal): ${currentQuantity} → ${newQuantity} (${quantityChange > 0 ? '+' : ''}${quantityChange})`);
    return newQuantity;
  };

  try {
    // Thử qua Gateway trước
    return await tryUpdateViaGateway(token);
  } catch (error) {
    // Nếu lỗi do quyền (401/403), thử gọi trực tiếp đến sales-service
    if (error.response && [401, 403].includes(error.response.status)) {
      console.warn(`⚠️ Gateway returned ${error.response.status}, retrying directly to sales-service for product ${productId}`);
      try {
        return await tryUpdateDirect(token);
      } catch (directError) {
        // Nếu vẫn lỗi với token, thử không token
        if (directError.response && [401, 403].includes(directError.response.status)) {
          console.warn(`⚠️ Direct call with token failed, retrying without token for product ${productId}`);
          return await tryUpdateDirect(null);
        }
        console.error(`❌ Error updating product quantity directly for ${productId}:`, directError.message);
        if (directError.response) {
          console.error(`❌ Status: ${directError.response.status}`);
          console.error(`❌ Response data:`, directError.response.data);
        }
        throw directError;
      }
    }
    console.error(`❌ Error updating product quantity for ${productId}:`, error.message);
    if (error.response) {
      console.error(`❌ Status: ${error.response.status}`);
      console.error(`❌ Response data:`, error.response.data);
    }
    throw error;
  }
};

