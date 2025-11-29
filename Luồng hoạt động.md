Luồng hoạt động real-time:

* Frontend lấy token bằng getToken() (từ sessionStorage/localStorage/window)
* Token được truyền qua auth: { token } khi tạo socket connection
* Backend nhận token từ socket.handshake.auth.token
* Backend verify token bằng JWT\_SECRET
* Nếu hợp lệ → kết nối thành công
* Nếu không hợp lệ → trả về lỗi "Invalid token"
