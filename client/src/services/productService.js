const API_URL = import.meta.env.VITE_API_URL;

export const fetchMaterials = async () => {
  const token = localStorage.getItem("token");
  const res = await fetch(`${API_URL}/products/materials`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  return await res.json();
};


// Có thể mở rộng tiếp:
// getAllProducts()
// getProductById(id)
// createProduct(data)
// updateProduct(id, data)
// deleteProduct(id)
