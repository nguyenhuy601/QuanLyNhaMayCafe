## 1. Giới thiệu đề tài & bối cảnh

Trong thực tế, các nhà máy sản xuất cà phê thường có quy mô nhiều xưởng, nhiều tổ sản xuất và số lượng lớn công nhân tham gia vào các công đoạn khác nhau như rang xay, đóng gói, kiểm tra chất lượng và lưu kho. Tuy nhiên, công tác quản lý tại nhiều nhà máy vẫn còn phụ thuộc nhiều vào ghi chép thủ công, file rời rạc hoặc kinh nghiệm cá nhân của người quản lý, dẫn đến khó khăn trong việc kiểm soát nhân sự, theo dõi tiến độ sản xuất và tổng hợp báo cáo.

Các vấn đề thường gặp bao gồm: khó xác định công nhân thuộc tổ nào, việc phân công lao động thiếu thống nhất giữa các ca làm việc, thông tin kế hoạch sản xuất và tình trạng nguyên vật liệu không được cập nhật kịp thời, cũng như việc phê duyệt và theo dõi các kế hoạch sản xuất còn mang tính thủ công. Điều này làm giảm hiệu quả vận hành, gây chậm trễ trong ra quyết định và ảnh hưởng đến năng suất chung của nhà máy.

Xuất phát từ thực trạng trên, đề tài “Quản Lý Nhà Máy Cà Phê” được xây dựng với mục tiêu đề xuất và mô phỏng một hệ thống thông tin quản lý sản xuất nhằm hỗ trợ nhà máy trong việc quản lý tập trung dữ liệu, chuẩn hóa quy trình nghiệp vụ và nâng cao hiệu quả điều hành. Hệ thống đóng vai trò là công cụ hỗ trợ cho các cấp quản lý như ban giám đốc, xưởng trưởng và tổ trưởng trong việc theo dõi hoạt động sản xuất, phân công nhân sự và giám sát kế hoạch sản xuất.

Trong phạm vi đề tài học phần Hệ Thống Thông Tin (HTTT), hệ thống tập trung vào việc phân tích nghiệp vụ, thiết kế quy trình và mô hình hóa hệ thống, thay vì đi sâu vào điều khiển máy móc hay tự động hóa dây chuyền sản xuất. Dữ liệu và kịch bản sử dụng trong hệ thống mang tính mô phỏng, phục vụ cho mục đích nghiên cứu, học tập và minh họa cho quá trình phân tích – thiết kế một hệ thống thông tin trong môi trường nhà máy sản xuất cà phê.

##2. Stakeholders & phân quyền hệ thống

Hệ thống Quản Lý Nhà Máy Cà Phê phục vụ cho nhiều nhóm người sử dụng khác nhau, tương ứng với các bộ phận và vai trò nghiệp vụ trong nhà máy. Mỗi vai trò được thiết kế gắn liền với chức năng cụ thể trong hệ thống, phản ánh đúng cơ cấu tổ chức và quy trình vận hành thực tế của nhà máy sản xuất cà phê.

Việc phân quyền được xây dựng nhằm đảm bảo:

Đúng người – đúng chức năng

Phân tách rõ ràng trách nhiệm giữa các bộ phận

Hỗ trợ kiểm soát, phê duyệt và truy vết nghiệp vụ

###2.1 Các nhóm Stakeholders trong hệ thống
🔹 Admin (Quản trị hệ thống)

Admin là vai trò chịu trách nhiệm về mặt kỹ thuật và vận hành hệ thống, không tham gia trực tiếp vào các nghiệp vụ sản xuất.

Chức năng chính:

Quản lý tài khoản người dùng

Gán vai trò (role) cho người sử dụng

Cấu hình hệ thống và kiểm soát truy cập

Admin không tham gia phê duyệt kế hoạch, không phân công sản xuất, nhằm tách biệt quản lý hệ thống và quản lý nghiệp vụ.

🔹 Director (Ban giám đốc)

Director là vai trò quản lý cấp cao, chịu trách nhiệm phê duyệt các quyết định quan trọng liên quan đến sản xuất.

Chức năng chính:

Duyệt kế hoạch sản xuất

Duyệt các yêu cầu quan trọng phát sinh trong hệ thống

Theo dõi tình hình tổng thể thông qua các báo cáo

Director không thao tác trực tiếp dữ liệu chi tiết, mà đóng vai trò kiểm soát và ra quyết định.

🔹 Plan (Bộ phận kế hoạch sản xuất)

Vai trò Plan chịu trách nhiệm xây dựng và quản lý kế hoạch sản xuất dựa trên đơn hàng và năng lực nhà máy.

Chức năng chính:

Lập kế hoạch sản xuất

Gửi kế hoạch sang hệ thống phê duyệt

Theo dõi trạng thái phê duyệt của kế hoạch

Vai trò này đóng vai trò trung gian giữa bộ phận kinh doanh và sản xuất.

🔹 Factory (Xưởng trưởng)

Factory là vai trò quản lý trực tiếp hoạt động sản xuất tại xưởng.

Chức năng chính:

Quản lý xưởng và các tổ sản xuất

Phân công công nhân vào tổ

Theo dõi tiến độ sản xuất tại xưởng

Tham gia xác nhận hoặc phản hồi kế hoạch sản xuất

Factory là vai trò có quyền điều phối nhân sự sản xuất, phù hợp với nghiệp vụ thực tế của nhà máy.

🔹 Tổ trưởng (Totruong)

Tổ trưởng chịu trách nhiệm quản lý hoạt động sản xuất hằng ngày của một tổ cụ thể.

Chức năng chính:

Quản lý công nhân trong tổ

Theo dõi tiến độ công việc của tổ

Báo cáo tình trạng thực hiện sản xuất lên xưởng trưởng

Tổ trưởng không có quyền phân công công nhân giữa các tổ, nhằm đảm bảo tính thống nhất trong quản lý nhân sự.

🔹 Worker (Công nhân)

Worker là vai trò thực hiện trực tiếp các công đoạn sản xuất.

Chức năng chính:

Xem thông tin công việc được phân công

Thực hiện nhiệm vụ theo kế hoạch

Không có quyền chỉnh sửa hoặc phê duyệt dữ liệu quản lý

🔹 Orders (Bộ phận kinh doanh / đơn hàng)

Vai trò Orders chịu trách nhiệm quản lý đơn hàng từ khách hàng.

Chức năng chính:

Tạo và quản lý đơn hàng

Cung cấp dữ liệu đầu vào cho kế hoạch sản xuất

Theo dõi trạng thái xử lý đơn hàng

🔹 Kho NVL (Khonvl)

Bộ phận Kho NVL chịu trách nhiệm quản lý nguyên vật liệu đầu vào phục vụ sản xuất.

Chức năng chính:

Quản lý nhập – xuất – tồn kho nguyên vật liệu

Cung cấp dữ liệu nguyên vật liệu cho bộ phận kế hoạch

Đảm bảo nguyên vật liệu sẵn sàng cho sản xuất

🔹 Kho thành phẩm (WarehouseProduct)

Vai trò WarehouseProduct quản lý thành phẩm sau sản xuất.

Chức năng chính:

Theo dõi tồn kho thành phẩm

Cập nhật nhập kho sau khi hoàn tất sản xuất

Hỗ trợ giao hàng theo đơn đặt hàng

🔹 QC (Quality Control)

QC chịu trách nhiệm kiểm soát chất lượng trong quá trình sản xuất.

Chức năng chính:

Kiểm tra chất lượng sản phẩm

Ghi nhận kết quả kiểm tra

Phản hồi các vấn đề chất lượng cho bộ phận sản xuất

###2.2 Phân quyền chức năng theo vai trò
Chức năng / Vai trò	Admin	Director	Plan	Orders	Factory	Totruong	Worker	Khonvl	WarehouseProduct	QC
Quản lý tài khoản & role	✔	✖	✖	✖	✖	✖	✖	✖	✖	✖
Quản lý đơn hàng	✖	✖	✖	✔	✖	✖	✖	✖	✖	✖
Lập kế hoạch sản xuất	✖	✖	✔	✖	✖	✖	✖	✖	✖	✖
Duyệt kế hoạch	✖	✔	✖	✖	✔	✖	✖	✖	✖	✖
Quản lý xưởng & tổ	✖	✖	✖	✖	✔	✖	✖	✖	✖	✖
Phân công công nhân vào tổ	✖	✖	✖	✖	✔	✖	✖	✖	✖	✖
Theo dõi tiến độ sản xuất	✖	✔	✔	✖	✔	✔	✖	✖	✖	✖
Thực hiện sản xuất	✖	✖	✖	✖	✖	✖	✔	✖	✖	✖
Quản lý kho NVL	✖	✖	✖	✖	✖	✖	✖	✔	✖	✖
Quản lý kho thành phẩm	✖	✖	✖	✖	✖	✖	✖	✖	✔	✖
Kiểm soát chất lượng	✖	✖	✖	✖	✖	✖	✖	✖	✖	✔
###2.3 Nguyên tắc phân quyền trong hệ thống

Hệ thống áp dụng các nguyên tắc phân quyền sau:

Phân quyền dựa trên vai trò nghiệp vụ, không dựa trên cá nhân

Mỗi vai trò chỉ được phép thao tác trong phạm vi chức năng của mình

Các nghiệp vụ quan trọng (kế hoạch, sản xuất) đều có bước phê duyệt

Dữ liệu được quản lý tập trung, hỗ trợ kiểm soát và truy vết trách nhiệm