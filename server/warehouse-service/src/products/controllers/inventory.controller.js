const axios = require('axios');

const GATEWAY_URL = process.env.GATEWAY_URL || 'http://api-gateway:4000';

/**
 * Lấy danh sách nguyên vật liệu với thông tin tồn kho
 */
exports.getMaterials = async (req, res) => {
  try {
    // Lấy token từ request để forward
    const token = req.headers.authorization;
    const headers = token ? { Authorization: token } : {};
    
    // Gọi đến sales-service qua API Gateway
    const response = await axios.get(`${GATEWAY_URL}/products/materials`, { headers });
    const materials = Array.isArray(response.data) ? response.data : [];
    
    res.status(200).json(materials);
  } catch (error) {
    console.error('❌ Error fetching materials:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Không thể tải danh sách nguyên vật liệu',
      message: error.response?.data?.message || error.message 
    });
  }
};

/**
 * Lấy danh sách thành phẩm với thông tin tồn kho
 */
exports.getFinishedProducts = async (req, res) => {
  try {
    // Lấy token từ request để forward
    const token = req.headers.authorization;
    const headers = token ? { Authorization: token } : {};
    
    // Gọi đến sales-service qua API Gateway
    const response = await axios.get(`${GATEWAY_URL}/products/finished`, { headers });
    const products = Array.isArray(response.data) ? response.data : [];
    
    res.status(200).json(products);
  } catch (error) {
    console.error('❌ Error fetching finished products:', error.message);
    res.status(error.response?.status || 500).json({ 
      error: 'Không thể tải danh sách thành phẩm',
      message: error.response?.data?.message || error.message 
    });
  }
};

/**
 * Lấy tổng quan thông số kho (tổng NVL và thành phẩm)
 */
exports.getInventorySummary = async (req, res) => {
  try {
    const token = req.headers.authorization;
    const headers = token ? { Authorization: token } : {};
    
    const [materialsRes, productsRes] = await Promise.all([
      axios.get(`${GATEWAY_URL}/products/materials`, { headers }),
      axios.get(`${GATEWAY_URL}/products/finished`, { headers }),
    ]);
    
    const materials = Array.isArray(materialsRes.data) ? materialsRes.data : [];
    const products = Array.isArray(productsRes.data) ? productsRes.data : [];
    
    const totalMaterials = materials.reduce((sum, item) => sum + (item.soLuong || 0), 0);
    const totalProducts = products.reduce((sum, item) => sum + (item.soLuong || 0), 0);
    
    res.status(200).json({
      materials: {
        total: totalMaterials,
        items: materials,
        count: materials.length,
      },
      products: {
        total: totalProducts,
        items: products,
        count: products.length,
      },
    });
  } catch (error) {
    console.error('❌ Error fetching inventory summary:', error.message);
    res.status(500).json({ 
      error: 'Không thể tải thông số kho',
      message: error.message 
    });
  }
};


