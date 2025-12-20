# ☕ Hệ Thống Quản Lý Nhà Máy Cà Phê

## 📋 Mục lục

1. [Giới thiệu đề tài & bối cảnh](#1-giới-thiệu-đề-tài--bối-cảnh)
2. [Công nghệ sử dụng](#2-công-nghệ-sử-dụng)
3. [Kiến trúc hệ thống](#3-kiến-trúc-hệ-thống)
4. [Cài đặt và chạy](#4-cài-đặt-và-chạy)
5. [Cấu trúc dự án](#5-cấu-trúc-dự-án)
6. [Stakeholders & Phân quyền](#6-stakeholders--phân-quyền-hệ-thống)
7. [Quy trình nghiệp vụ](#7-quy-trình-nghiệp-vụ)
8. [API Documentation](#8-api-documentation)
9. [Database Schema](#9-database-schema)
10. [Deployment](#10-deployment)
11. [Troubleshooting](#11-troubleshooting)
12. [Contributing](#12-contributing)

---

## 1. Giới thiệu đề tài & bối cảnh

Trong thực tế, các nhà máy sản xuất cà phê thường có quy mô nhiều xưởng, nhiều tổ sản xuất và số lượng lớn công nhân tham gia vào các công đoạn khác nhau như rang xay, đóng gói, kiểm tra chất lượng và lưu kho. Tuy nhiên, công tác quản lý tại nhiều nhà máy vẫn còn phụ thuộc nhiều vào ghi chép thủ công, file rời rạc hoặc kinh nghiệm cá nhân của người quản lý, dẫn đến khó khăn trong việc kiểm soát nhân sự, theo dõi tiến độ sản xuất và tổng hợp báo cáo.

Các vấn đề thường gặp bao gồm:
- Khó xác định công nhân thuộc tổ nào
- Việc phân công lao động thiếu thống nhất giữa các ca làm việc
- Thông tin kế hoạch sản xuất và tình trạng nguyên vật liệu không được cập nhật kịp thời
- Việc phê duyệt và theo dõi các kế hoạch sản xuất còn mang tính thủ công

Điều này làm giảm hiệu quả vận hành, gây chậm trễ trong ra quyết định và ảnh hưởng đến năng suất chung của nhà máy.

Xuất phát từ thực trạng trên, đề tài **"Quản Lý Nhà Máy Cà Phê"** được xây dựng với mục tiêu đề xuất và mô phỏng một hệ thống thông tin quản lý sản xuất nhằm hỗ trợ nhà máy trong việc quản lý tập trung dữ liệu, chuẩn hóa quy trình nghiệp vụ và nâng cao hiệu quả điều hành.

### 1.1 Mục tiêu hệ thống

- **Quản lý tập trung**: Tập trung hóa dữ liệu và quy trình quản lý
- **Chuẩn hóa nghiệp vụ**: Xây dựng quy trình chuẩn cho các hoạt động sản xuất
- **Nâng cao hiệu quả**: Tối ưu hóa quy trình, giảm thời gian xử lý và ra quyết định
- **Kiểm soát và truy vết**: Hỗ trợ kiểm soát, phê duyệt và truy vết nghiệp vụ

### 1.2 Phạm vi đề tài

Trong phạm vi đề tài học phần Hệ Thống Thông Tin (HTTT), hệ thống tập trung vào việc phân tích nghiệp vụ, thiết kế quy trình và mô hình hóa hệ thống, thay vì đi sâu vào điều khiển máy móc hay tự động hóa dây chuyền sản xuất. Dữ liệu và kịch bản sử dụng trong hệ thống mang tính mô phỏng, phục vụ cho mục đích nghiên cứu, học tập và minh họa cho quá trình phân tích – thiết kế một hệ thống thông tin trong môi trường nhà máy sản xuất cà phê.

---

## 2. Công nghệ sử dụng

### 2.1 Frontend

- **React 19.1.1**: Framework JavaScript cho giao diện người dùng
- **Vite 7.1.6**: Build tool và dev server
- **React Router DOM 7.9.4**: Routing cho Single Page Application
- **Axios 1.12.2**: HTTP client cho API calls
- **Tailwind CSS 3.4.18**: Utility-first CSS framework
- **Redux Toolkit 2.11.0**: State management
- **Socket.io Client 4.8.1**: Real-time communication

### 2.2 Backend

- **Node.js**: Runtime environment
- **Express 4.18.2 / 5.1.0**: Web framework
- **MongoDB 6**: NoSQL database
- **Mongoose 7.0.0 / 8.18.0**: MongoDB object modeling
- **JWT (jsonwebtoken 9.0.0)**: Authentication & Authorization
- **RabbitMQ 3**: Message broker cho event-driven architecture
- **AMQP (amqplib 0.10.9)**: RabbitMQ client
- **Axios 1.12.2**: HTTP client cho inter-service communication
- **bcryptjs 2.4.3**: Password hashing

### 2.3 Infrastructure

- **Docker & Docker Compose**: Containerization và orchestration
- **API Gateway**: Centralized entry point cho tất cả requests
- **Microservices Architecture**: Kiến trúc đa dịch vụ

---

## 3. Kiến trúc hệ thống

### 3.1 Kiến trúc tổng quan

Hệ thống được xây dựng theo mô hình **Microservices Architecture** với các thành phần chính:

```
┌─────────────┐
│   Client    │ (React Frontend)
│  (Port 5173)│
└──────┬──────┘
       │
       ▼
┌─────────────────┐
│   API Gateway   │ (Port 4000)
│  (Entry Point)  │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬──────────┬──────────┬──────────┐
    │         │          │          │          │          │
    ▼         ▼          ▼          ▼          ▼          ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐
│ Admin  │ │ Auth   │ │Director│ │Factory │ │  Plan  │ │   QC   │
│Service │ │Service │ │Service │ │Service │ │Service │ │Service │
│ :3001  │ │ :3002  │ │ :3003  │ │ :3004  │ │ :3005  │ │ :3006  │
└────────┘ └────────┘ └────────┘ └────────┘ └────────┘ └────────┘
    │         │          │          │          │          │
    └─────────┴──────────┴──────────┴──────────┴──────────┘
                    │
                    ▼
            ┌───────────────┐
            │   RabbitMQ    │ (Port 5672)
            │ Message Broker│
            └───────────────┘
                    │
    ┌───────────────┼───────────────┐
    │               │               │
    ▼               ▼               ▼
┌────────┐    ┌────────┐    ┌────────┐
│ Sales  │    │Warehouse│   │ Report │
│Service │    │ Service │   │Service │
│ :3008  │    │ :3009   │   │ :3007  │
└────────┘    └────────┘    └────────┘
    │               │               │
    └───────────────┴───────────────┘
                    │
                    ▼
            ┌───────────────┐
            │   MongoDB     │ (Port 27017)
            │   Database    │
            └───────────────┘
```

### 3.2 Các Microservices

| Service | Port | Mô tả |
|---------|------|-------|
| **api-gateway** | 4000 | Entry point, routing, authentication |
| **admin-service** | 3001 | Quản lý tài khoản, roles, departments |
| **auth-service** | 3002 | Xác thực và phân quyền |
| **director-service** | 3003 | Phê duyệt kế hoạch, quản lý cấp cao |
| **factory-service** | 3004 | Quản lý xưởng, tổ, công nhân, sản xuất |
| **production-plan-service** | 3005 | Quản lý kế hoạch sản xuất |
| **qc-service** | 3006 | Kiểm soát chất lượng |
| **report-service** | 3007 | Báo cáo và thống kê |
| **sales-service** | 3008 | Quản lý đơn hàng |
| **warehouse-service** | 3009 | Quản lý kho NVL và thành phẩm |
| **realtime-service** | 4100 | Real-time notifications |

### 3.3 Communication Patterns

- **Synchronous**: HTTP/REST API qua API Gateway
- **Asynchronous**: RabbitMQ message broker cho events
- **Real-time**: WebSocket (Socket.io) cho notifications

### 3.4 Database Strategy

Mỗi service có database riêng (Database per Service pattern):
- `adminDB` - Admin service
- `authDB` - Auth service
- `factoryDB` - Factory service
- `productionPlanDB` - Production plan service
- `qcDB` - QC service
- `salesDB` - Sales service
- `warehouseDB` - Warehouse service
- `reportDB` - Report service

---

## 4. Cài đặt và chạy

### 4.1 Yêu cầu hệ thống

- **Node.js**: >= 18.x
- **Docker**: >= 20.x
- **Docker Compose**: >= 2.x
- **Git**: Để clone repository

### 4.2 Cài đặt

#### Bước 1: Clone repository

```bash
git clone <repository-url>
cd QuanLyNhaMayCafe
```

#### Bước 2: Cài đặt dependencies

```bash
# Cài đặt dependencies cho client
cd client
npm install

# Cài đặt dependencies cho các services
cd ../server/admin-service
npm install

cd ../auth-service
npm install

# ... (lặp lại cho các service khác)
```

**Hoặc sử dụng script tự động:**

```bash
# Windows
run.bat

# Linux/Mac
chmod +x run.sh
./run.sh
```

#### Bước 3: Cấu hình môi trường

Tạo file `.env` ở thư mục gốc (nếu chưa có):

```env
# JWT Secret
JWT_SECRET=your-secret-key-here

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Service Secret (cho inter-service communication)
SERVICE_SECRET=warehouse-service-secret-key
```

#### Bước 4: Khởi động với Docker Compose

```bash
docker-compose up -d
```

Lệnh này sẽ khởi động:
- MongoDB (port 27017)
- RabbitMQ (ports 5672, 15672)
- Tất cả các microservices
- API Gateway

#### Bước 5: Khởi động Frontend

```bash
cd client
npm run dev
```

Frontend sẽ chạy tại: `http://localhost:5173`

### 4.3 Truy cập hệ thống

- **Frontend**: http://localhost:5173
- **API Gateway**: http://localhost:4000
- **RabbitMQ Management**: http://localhost:15672 (admin/admin)
- **MongoDB**: mongodb://localhost:27017

### 4.4 Tài khoản mặc định

Sau khi khởi động, tạo tài khoản Admin đầu tiên qua API hoặc seed data:

```bash
POST http://localhost:4000/auth/register
{
  "username": "admin",
  "password": "admin123",
  "role": "admin"
}
```

---

## 5. Cấu trúc dự án

```
QuanLyNhaMayCafe/
├── api-gateway/              # API Gateway service
│   ├── index.js
│   ├── package.json
│   └── Dockerfile
│
├── client/                   # React Frontend
│   ├── src/
│   │   ├── features/        # Feature-based modules
│   │   │   ├── admin/
│   │   │   ├── auth/
│   │   │   ├── director/
│   │   │   ├── factory/
│   │   │   ├── order/
│   │   │   ├── plan/
│   │   │   ├── qc/
│   │   │   ├── teamleader/
│   │   │   ├── warehouseProduct/
│   │   │   ├── warehouseRawMaterial/
│   │   │   └── worker/
│   │   ├── api/             # API clients
│   │   ├── services/        # Business logic services
│   │   ├── hooks/           # Custom React hooks
│   │   ├── utils/           # Utility functions
│   │   └── App.jsx
│   ├── package.json
│   └── vite.config.js
│
├── server/                   # Microservices
│   ├── admin-service/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routers/
│   │   │   └── middlewares/
│   │   ├── index.js
│   │   └── package.json
│   │
│   ├── auth-service/
│   ├── director-service/
│   ├── factory-service/
│   ├── production-plan-service/
│   ├── qc-service/
│   ├── report-service/
│   ├── sales-service/
│   ├── warehouse-service/
│   └── realtime-service/
│
├── docker-compose.yml        # Docker orchestration
├── package.json
└── README.md
```

---

## 6. Stakeholders & Phân quyền hệ thống

Hệ thống phục vụ cho nhiều nhóm người sử dụng khác nhau, tương ứng với các bộ phận và vai trò nghiệp vụ trong nhà máy.

### 6.1 Các nhóm Stakeholders

#### 🔹 Admin (Quản trị hệ thống)

Admin là vai trò chịu trách nhiệm về mặt kỹ thuật và vận hành hệ thống, không tham gia trực tiếp vào các nghiệp vụ sản xuất.

**Chức năng chính:**
- Quản lý tài khoản người dùng
- Gán vai trò (role) cho người sử dụng
- Quản lý phòng ban (departments)
- Quản lý chức vụ (positions)
- Cấu hình hệ thống và kiểm soát truy cập

Admin không tham gia phê duyệt kế hoạch, không phân công sản xuất, nhằm tách biệt quản lý hệ thống và quản lý nghiệp vụ.

#### 🔹 Director (Ban giám đốc)

Director là vai trò quản lý cấp cao, chịu trách nhiệm phê duyệt các quyết định quan trọng liên quan đến sản xuất.

**Chức năng chính:**
- Duyệt kế hoạch sản xuất
- Duyệt xuất kho thành phẩm
- Duyệt các yêu cầu quan trọng phát sinh trong hệ thống
- Theo dõi tình hình tổng thể thông qua các báo cáo
- Xem dashboard tổng quan

Director không thao tác trực tiếp dữ liệu chi tiết, mà đóng vai trò kiểm soát và ra quyết định.

#### 🔹 Plan (Bộ phận kế hoạch sản xuất)

Vai trò Plan chịu trách nhiệm xây dựng và quản lý kế hoạch sản xuất dựa trên đơn hàng và năng lực nhà máy.

**Chức năng chính:**
- Lập kế hoạch sản xuất
- Chọn đơn hàng để tạo kế hoạch (ràng buộc: đơn hàng chưa thuộc kế hoạch nào)
- Gửi kế hoạch sang hệ thống phê duyệt
- Theo dõi trạng thái phê duyệt của kế hoạch
- Xem tiến độ sản xuất

Vai trò này đóng vai trò trung gian giữa bộ phận kinh doanh và sản xuất.

#### 🔹 Factory (Xưởng trưởng)

Factory là vai trò quản lý trực tiếp hoạt động sản xuất tại xưởng.

**Chức năng chính:**
- Quản lý xưởng và các tổ sản xuất
- Phân công công nhân vào tổ
- Tạo lô sản xuất
- Phân công công việc cho công nhân
- Theo dõi tiến độ sản xuất tại xưởng
- Tạo phiếu nhập thành phẩm
- Tham gia xác nhận hoặc phản hồi kế hoạch sản xuất

Factory là vai trò có quyền điều phối nhân sự sản xuất, phù hợp với nghiệp vụ thực tế của nhà máy.

#### 🔹 Tổ trưởng (Totruong)

Tổ trưởng chịu trách nhiệm quản lý hoạt động sản xuất hằng ngày của một tổ cụ thể.

**Chức năng chính:**
- Quản lý công nhân trong tổ
- Tạo yêu cầu kiểm tra chất lượng (QC Request)
- Theo dõi tiến độ công việc của tổ
- Báo cáo tình trạng thực hiện sản xuất lên xưởng trưởng

Tổ trưởng không có quyền phân công công nhân giữa các tổ, nhằm đảm bảo tính thống nhất trong quản lý nhân sự.

#### 🔹 Worker (Công nhân)

Worker là vai trò thực hiện trực tiếp các công đoạn sản xuất.

**Chức năng chính:**
- Xem thông tin công việc được phân công
- Xem lô sản xuất được giao
- Thực hiện nhiệm vụ theo kế hoạch
- Ghi nhận nhật ký sản xuất

Không có quyền chỉnh sửa hoặc phê duyệt dữ liệu quản lý.

#### 🔹 Orders (Bộ phận kinh doanh / đơn hàng)

Vai trò Orders chịu trách nhiệm quản lý đơn hàng từ khách hàng.

**Chức năng chính:**
- Tạo và quản lý đơn hàng
- Cập nhật thông tin đơn hàng
- Cung cấp dữ liệu đầu vào cho kế hoạch sản xuất
- Theo dõi trạng thái xử lý đơn hàng

#### 🔹 Kho NVL (Khonvl)

Bộ phận Kho NVL chịu trách nhiệm quản lý nguyên vật liệu đầu vào phục vụ sản xuất.

**Chức năng chính:**
- Quản lý nhập – xuất – tồn kho nguyên vật liệu
- Tạo phiếu nhập NVL
- Tạo phiếu xuất NVL
- Cung cấp dữ liệu nguyên vật liệu cho bộ phận kế hoạch
- Đảm bảo nguyên vật liệu sẵn sàng cho sản xuất

#### 🔹 Kho thành phẩm (WarehouseProduct / khotp)

Vai trò WarehouseProduct quản lý thành phẩm sau sản xuất.

**Chức năng chính:**
- Theo dõi tồn kho thành phẩm
- Xác nhận nhập kho sau khi hoàn tất sản xuất
- Tạo phiếu xuất kho thành phẩm (chờ duyệt)
- Hỗ trợ giao hàng theo đơn đặt hàng

**Lưu ý**: Không có chức năng "Nhập kho TP" vì việc nhập kho được thực hiện tự động khi xưởng trưởng tạo phiếu nhập.

#### 🔹 QC (Quality Control)

QC chịu trách nhiệm kiểm soát chất lượng trong quá trình sản xuất.

**Chức năng chính:**
- Nhận yêu cầu kiểm tra từ tổ trưởng
- Kiểm tra chất lượng sản phẩm
- Ghi nhận kết quả kiểm tra (đạt/không đạt)
- Phản hồi các vấn đề chất lượng cho bộ phận sản xuất

### 6.2 Phân quyền chức năng theo vai trò

| Chức năng / Vai trò | Admin | Director | Plan | Orders | Factory | Totruong | Worker | Khonvl | WarehouseProduct | QC |
|---------------------|-------|----------|------|--------|---------|----------|--------|--------|-------------------|-----|
| Quản lý tài khoản & role | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Quản lý đơn hàng | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Lập kế hoạch sản xuất | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Duyệt kế hoạch | ✖ | ✔ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Quản lý xưởng & tổ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Phân công công nhân vào tổ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Tạo lô sản xuất | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Phân công công việc | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Theo dõi tiến độ sản xuất | ✖ | ✔ | ✔ | ✖ | ✔ | ✔ | ✖ | ✖ | ✖ | ✖ |
| Thực hiện sản xuất | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ |
| Tạo phiếu nhập TP | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Xác nhận nhập TP | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ |
| Tạo phiếu xuất TP | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ |
| Duyệt xuất TP | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ |
| Quản lý kho NVL | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ |
| Tạo yêu cầu QC | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ | ✖ | ✖ | ✖ | ✖ |
| Kiểm soát chất lượng | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✖ | ✔ |

### 6.3 Nguyên tắc phân quyền trong hệ thống

Hệ thống áp dụng các nguyên tắc phân quyền sau:

1. **Phân quyền dựa trên vai trò nghiệp vụ**, không dựa trên cá nhân
2. **Mỗi vai trò chỉ được phép thao tác trong phạm vi chức năng của mình**
3. **Các nghiệp vụ quan trọng** (kế hoạch, sản xuất, xuất kho) đều có bước phê duyệt
4. **Dữ liệu được quản lý tập trung**, hỗ trợ kiểm soát và truy vết trách nhiệm
5. **Ràng buộc dữ liệu**: Đơn hàng chỉ có thể thuộc một kế hoạch sản xuất

---

## 7. Quy trình nghiệp vụ

### 7.1 Quy trình tổng quan: Từ đơn hàng đến giao hàng

```
┌─────────────┐
│  Đơn hàng   │ (Orders tạo đơn hàng)
│  (Chờ duyệt)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Đã duyệt    │ (Director/Factory duyệt)
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│  Lập kế hoạch SX    │ (Plan tạo kế hoạch)
│  (Chờ duyệt)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Kế hoạch đã duyệt  │ (Director/Factory duyệt)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Tạo lô sản xuất    │ (Factory tạo lô)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Phân công công việc│ (Factory phân công)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Công nhân sản xuất │ (Worker thực hiện)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Gửi QC kiểm tra    │ (Totruong tạo QC Request)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  QC kiểm tra        │ (QC kiểm tra chất lượng)
│  (Đạt/Không đạt)    │
└──────┬──────────────┘
       │
       ▼ (Nếu đạt)
┌─────────────────────┐
│  Tạo phiếu nhập TP  │ (Factory tạo phiếu)
│  (Chờ duyệt)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Xác nhận nhập kho  │ (Kho TP xác nhận)
│  (Đã nhập kho)      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Hoàn tất chu kỳ    │ (Tự động: Reset công nhân,
│  sản xuất           │  cập nhật lô, kế hoạch)
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Tạo phiếu xuất TP  │ (Kho TP tạo phiếu)
│  (Chờ duyệt)        │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Duyệt xuất kho     │ (Director duyệt)
│  (Đã xuất kho)      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│  Trừ số lượng kho   │ (Tự động trừ số lượng)
│  & Cập nhật đơn hàng│
└─────────────────────┘
```

### 7.2 Quy trình chi tiết

#### 7.2.1 Quản lý đơn hàng

**Người thực hiện**: Orders (Bộ phận kinh doanh)

1. **Tạo đơn hàng**
   - Nhập thông tin khách hàng
   - Chọn sản phẩm, số lượng
   - Đặt ngày yêu cầu giao hàng
   - Trạng thái: "Chờ duyệt"

2. **Duyệt đơn hàng**
   - Director hoặc Factory duyệt đơn hàng
   - Trạng thái: "Đã duyệt"

3. **Theo dõi đơn hàng**
   - Xem trạng thái: "Chờ duyệt", "Đã duyệt", "Đã xuất kho", "Đã giao"

**Ràng buộc**: Đơn hàng "Đã duyệt" chỉ có thể được chọn vào một kế hoạch sản xuất duy nhất.

#### 7.2.2 Lập kế hoạch sản xuất

**Người thực hiện**: Plan (Bộ phận kế hoạch)

1. **Tạo kế hoạch**
   - Chọn các đơn hàng "Đã duyệt" (chưa thuộc kế hoạch nào)
   - Nhập thông tin sản phẩm, số lượng
   - Đặt ngày bắt đầu và kết thúc dự kiến
   - Trạng thái: "Chờ duyệt"

2. **Gửi duyệt**
   - Kế hoạch được gửi cho Director và Factory để duyệt

3. **Theo dõi kế hoạch**
   - Xem trạng thái: "Chờ duyệt", "Đã duyệt", "Đang thực hiện", "Hoàn thành", "Từ chối"

#### 7.2.3 Duyệt kế hoạch sản xuất

**Người thực hiện**: Director hoặc Factory

1. **Xem danh sách kế hoạch chờ duyệt**
2. **Duyệt hoặc từ chối kế hoạch**
   - Nếu duyệt: Trạng thái → "Đã duyệt"
   - Nếu từ chối: Trạng thái → "Từ chối", kèm ghi chú

#### 7.2.4 Quản lý sản xuất

**Người thực hiện**: Factory (Xưởng trưởng)

1. **Tạo lô sản xuất**
   - Chọn kế hoạch "Đã duyệt" hoặc "Đang thực hiện"
   - Nhập thông tin lô: mã lô, số lượng, ngày sản xuất
   - Liên kết với kế hoạch sản xuất

2. **Phân công công việc**
   - Chọn lô sản xuất
   - Chọn tổ và công nhân
   - Gán công việc cụ thể
   - Trạng thái công nhân: "Active" → "Assigned"

3. **Tạo phiếu nhập thành phẩm**
   - Sau khi QC đạt, Factory tạo phiếu nhập
   - Chọn phiếu QC đã đạt
   - Nhập số lượng, ngày nhập
   - Trạng thái: "Cho duyet" (chờ kho xác nhận)

4. **Xác nhận nhập kho** (tự động khi kho xác nhận)
   - Khi kho TP xác nhận, trạng thái → "Da nhap kho"
   - Tự động hoàn tất chu kỳ sản xuất:
     - Cập nhật lô → "Hoàn thành"
     - Reset trạng thái tổ → "Active"
     - Reset trạng thái công nhân → "Active"
     - Cập nhật kế hoạch → "Hoàn thành"
     - Xóa phân công công việc

#### 7.2.5 Thực hiện sản xuất

**Người thực hiện**: Worker (Công nhân)

1. **Xem công việc được phân công**
   - Xem lô sản xuất
   - Xem công việc cụ thể

2. **Ghi nhận nhật ký sản xuất**
   - Nhập số lượng thực tế
   - Nhập số lượng lỗi (nếu có)
   - Ghi chú (nếu có)

3. **Hoàn thành công việc**
   - Báo cáo hoàn thành cho tổ trưởng

#### 7.2.6 Kiểm tra chất lượng

**Người thực hiện**: Totruong (Tổ trưởng) và QC

1. **Tạo yêu cầu QC** (Totruong)
   - Chọn lô sản xuất đã hoàn thành
   - Tạo QC Request
   - Gửi cho bộ phận QC

2. **Kiểm tra chất lượng** (QC)
   - Nhận yêu cầu kiểm tra
   - Kiểm tra sản phẩm
   - Ghi nhận kết quả: "Đạt" hoặc "Không đạt"
   - Nếu đạt: Sản phẩm được chuyển sang kho thành phẩm
   - Nếu không đạt: Trả lại sản xuất

#### 7.2.7 Quản lý kho thành phẩm

**Người thực hiện**: WarehouseProduct (Kho TP) và Director

1. **Xác nhận nhập kho** (Kho TP)
   - Xem phiếu nhập từ Factory
   - Xác nhận nhập kho
   - Trạng thái phiếu: "Cho duyet" → "Da nhap kho"
   - Số lượng được cập nhật vào kho

2. **Tạo phiếu xuất kho** (Kho TP)
   - Chọn kế hoạch sản xuất
   - Xem danh sách đơn hàng của kế hoạch
   - Chọn đơn hàng cần xuất (trạng thái "Đã duyệt", chưa "Đã xuất kho")
   - Tạo phiếu xuất
   - Trạng thái: "Cho duyet" (chờ Director duyệt)

3. **Duyệt xuất kho** (Director)
   - Xem danh sách phiếu xuất chờ duyệt
   - Duyệt phiếu xuất
   - Trạng thái: "Cho duyet" → "Da xuat"
   - Tự động:
     - Trừ số lượng khỏi kho
     - Cập nhật trạng thái đơn hàng → "Đã xuất kho"

#### 7.2.8 Quản lý kho nguyên vật liệu

**Người thực hiện**: Khonvl (Kho NVL)

1. **Nhập kho NVL**
   - Tạo phiếu nhập NVL
   - Nhập thông tin: loại NVL, số lượng, ngày nhập
   - Cập nhật tồn kho

2. **Xuất kho NVL**
   - Tạo phiếu xuất NVL
   - Chọn NVL, số lượng
   - Cập nhật tồn kho

3. **Theo dõi tồn kho**
   - Xem tồn kho hiện tại
   - Xem lịch sử nhập/xuất

### 7.3 Luồng sự kiện (Event Flow)

Hệ thống sử dụng RabbitMQ để xử lý các sự kiện bất đồng bộ:

| Event | Publisher | Subscriber | Mô tả |
|-------|-----------|------------|-------|
| `PLAN_CREATED` | production-plan-service | director-service, factory-service | Kế hoạch mới được tạo |
| `PLAN_APPROVED` | director-service | production-plan-service, factory-service | Kế hoạch được duyệt |
| `PRODUCTION_DONE` | factory-service | qc-service | Sản phẩm hoàn thành, gửi QC |
| `QC_PASSED` | qc-service | warehouse-service, factory-service | QC đạt, có thể nhập kho |
| `QC_FAILED` | qc-service | factory-service | QC không đạt, trả lại sản xuất |
| `FINISHED_RECEIPT_CREATED` | warehouse-service | sales-service | Phiếu nhập TP được tạo |
| `FINISHED_ISSUE_CREATED` | warehouse-service | sales-service | Phiếu xuất TP được tạo |
| `FINISHED_ISSUE_APPROVED` | warehouse-service | sales-service | Phiếu xuất TP được duyệt |

---

## 8. API Documentation

### 8.1 Base URL

```
http://localhost:4000
```

Tất cả requests đều đi qua API Gateway, trừ các endpoint công khai.

### 8.2 Authentication

Hầu hết các API yêu cầu JWT token trong header:

```
Authorization: Bearer <token>
```

Token được lấy từ endpoint `/auth/login`.

### 8.3 Các nhóm API chính

#### 8.3.1 Authentication API

**POST** `/auth/login`
- Đăng nhập, nhận JWT token
- Body: `{ username, password }`
- Response: `{ token, user }`

**POST** `/auth/register`
- Đăng ký tài khoản mới (Admin only)
- Body: `{ username, password, role, ... }`

#### 8.3.2 Admin API

**GET** `/admin/users`
- Lấy danh sách người dùng
- Role: `admin`

**POST** `/admin/users`
- Tạo người dùng mới
- Role: `admin`

**PUT** `/admin/users/:id`
- Cập nhật người dùng
- Role: `admin`

**DELETE** `/admin/users/:id`
- Xóa người dùng
- Role: `admin`

#### 8.3.3 Production Plan API

**GET** `/plan`
- Lấy danh sách kế hoạch sản xuất
- Role: `plan`, `director`, `factory`

**POST** `/plan`
- Tạo kế hoạch sản xuất mới
- Role: `plan`
- Body: `{ donHang, sanPham, soLuongCanSanXuat, ... }`

**PUT** `/plan/:id`
- Cập nhật kế hoạch
- Role: `plan`

**PUT** `/plan/:id/approve`
- Duyệt kế hoạch
- Role: `director`, `factory`
- Body: `{ trangThai: "Đã duyệt" }`

#### 8.3.4 Factory API

**GET** `/factory/teams`
- Lấy danh sách tổ
- Role: `factory`, `totruong`

**POST** `/factory/teams`
- Tạo tổ mới
- Role: `factory`

**GET** `/factory/workers`
- Lấy danh sách công nhân
- Role: `factory`

**POST** `/factory/workers`
- Tạo công nhân mới
- Role: `factory`

**GET** `/factory/lots`
- Lấy danh sách lô sản xuất
- Role: `factory`, `totruong`, `worker`

**POST** `/factory/lots`
- Tạo lô sản xuất
- Role: `factory`
- Body: `{ keHoach, soLuong, ... }`

**POST** `/factory/assignments`
- Phân công công việc
- Role: `factory`
- Body: `{ lot, to, workers, ... }`

#### 8.3.5 QC API

**GET** `/qc-request`
- Lấy danh sách yêu cầu QC
- Role: `qc`, `totruong`

**POST** `/qc-request`
- Tạo yêu cầu QC
- Role: `totruong`
- Body: `{ lot, keHoach, ... }`

**GET** `/qc-result`
- Lấy danh sách kết quả QC
- Role: `qc`, `factory`

**POST** `/qc-result`
- Tạo kết quả QC
- Role: `qc`
- Body: `{ qcRequest, ketQua: "Đạt"/"Không đạt", ... }`

#### 8.3.6 Warehouse API

**GET** `/warehouse/products/finished`
- Lấy danh sách thành phẩm trong kho
- Role: `khotp`, `factory`

**POST** `/warehouse/products/receipts`
- Tạo phiếu nhập thành phẩm
- Role: `factory`
- Body: `{ phieuQC, soLuong, ... }`

**PUT** `/warehouse/products/receipts/:id/confirm`
- Xác nhận nhập kho
- Role: `khotp`

**GET** `/warehouse/products/issues`
- Lấy danh sách phiếu xuất
- Role: `khotp`, `director`

**POST** `/warehouse/products/issues`
- Tạo phiếu xuất thành phẩm
- Role: `khotp`
- Body: `{ donHang, chiTiet, ... }`

**GET** `/warehouse/products/issues/pending`
- Lấy danh sách phiếu xuất chờ duyệt
- Role: `director`

**PUT** `/warehouse/products/issues/:id/approve`
- Duyệt phiếu xuất
- Role: `director`

#### 8.3.7 Sales API

**GET** `/orders`
- Lấy danh sách đơn hàng
- Role: `orders`, `plan`, `director`

**POST** `/orders`
- Tạo đơn hàng mới
- Role: `orders`
- Body: `{ khachHang, chiTiet, ... }`

**PUT** `/orders/:id`
- Cập nhật đơn hàng
- Role: `orders`, `khotp`

#### 8.3.8 Director API

**GET** `/director/plans/pending`
- Lấy danh sách kế hoạch chờ duyệt
- Role: `director`

**GET** `/director/dashboard`
- Lấy dashboard tổng quan
- Role: `director`

**GET** `/director/finished-issues/pending`
- Lấy danh sách phiếu xuất chờ duyệt
- Role: `director`

**PUT** `/director/finished-issues/:id/approve`
- Duyệt phiếu xuất
- Role: `director`

### 8.4 Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... },
  "message": "Thành công"
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message",
  "status": 400
}
```

### 8.5 Status Codes

- `200` - OK
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## 9. Database Schema

### 9.1 User & Authentication

#### User (adminDB)
```javascript
{
  _id: ObjectId,
  username: String,
  password: String (hashed),
  role: String,
  department: ObjectId,
  position: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

#### Role (adminDB)
```javascript
{
  _id: ObjectId,
  tenQuyen: String,
  moTa: String
}
```

### 9.2 Production Planning

#### ProductionPlan (productionPlanDB)
```javascript
{
  _id: ObjectId,
  maKeHoach: String (unique),
  donHang: [ObjectId],
  sanPham: {
    tenSanPham: String,
    maSP: String
  },
  soLuongCanSanXuat: Number,
  ngayBatDauDuKien: Date,
  ngayKetThucDuKien: Date,
  trangThai: "Chờ duyệt" | "Đã duyệt" | "Đang thực hiện" | "Hoàn thành" | "Từ chối",
  nguoiDuyet: String,
  ngayDuyet: Date,
  nvlCanThiet: [{
    productId: String,
    tenNVL: String,
    soLuong: Number
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### 9.3 Factory Management

#### ToSanXuat (factoryDB)
```javascript
{
  _id: ObjectId,
  tenTo: String,
  xuong: ObjectId,
  trangThai: "Active" | "Inactive",
  createdAt: Date
}
```

#### Worker (factoryDB)
```javascript
{
  _id: ObjectId,
  tenCongNhan: String,
  maCongNhan: String,
  to: ObjectId,
  trangThai: "Active" | "Assigned" | "Inactive",
  createdAt: Date
}
```

#### LoSanXuat (factoryDB)
```javascript
{
  _id: ObjectId,
  maLo: String,
  keHoach: {
    planId: ObjectId,
    maKeHoach: String
  },
  soLuong: Number,
  ngaySanXuat: Date,
  trangThai: "Chờ sản xuất" | "Đang sản xuất" | "Hoàn thành",
  phieuNhapKho: ObjectId,
  createdAt: Date
}
```

#### WorkAssignment (factoryDB)
```javascript
{
  _id: ObjectId,
  lot: ObjectId,
  to: ObjectId,
  workers: [ObjectId],
  congViec: ObjectId,
  trangThai: "Pending" | "In Progress" | "Completed",
  createdAt: Date
}
```

#### ProductionLog (factoryDB)
```javascript
{
  _id: ObjectId,
  lot: ObjectId,
  keHoach: {
    planId: ObjectId
  },
  soLuongThucTe: Number,
  soLuongLoi: Number,
  trangThai: "Đang sản xuất" | "Cho kiem tra" | "Da gui QC",
  createdAt: Date
}
```

### 9.4 Quality Control

#### QCRequest (qcDB)
```javascript
{
  _id: ObjectId,
  lot: ObjectId,
  keHoach: {
    planId: ObjectId,
    maKeHoach: String
  },
  to: ObjectId,
  trangThai: "Chờ kiểm tra" | "Đang kiểm tra" | "Hoàn thành",
  createdAt: Date
}
```

#### QCResult (qcDB)
```javascript
{
  _id: ObjectId,
  qcRequest: ObjectId,
  ketQua: "Đạt" | "Không đạt",
  ghiChu: String,
  ngayKiemTra: Date,
  createdAt: Date
}
```

### 9.5 Warehouse

#### FinishedReceipt (warehouseDB)
```javascript
{
  _id: ObjectId,
  maPhieuNhapTP: String (unique),
  phieuQC: ObjectId,
  soLuong: Number,
  ngayNhap: Date,
  trangThai: "Cho duyet" | "Da nhap kho",
  nguoiTao: String,
  createdAt: Date
}
```

#### FinishedIssue (warehouseDB)
```javascript
{
  _id: ObjectId,
  maPhieuXuatTP: String (unique),
  donHang: ObjectId,
  chiTiet: [{
    sanPham: ObjectId,
    soLuong: Number
  }],
  ngayXuat: Date,
  trangThai: "Cho duyet" | "Da xuat",
  nguoiTao: String,
  nguoiDuyet: String,
  createdAt: Date
}
```

#### FinishedProduct (warehouseDB)
```javascript
{
  _id: ObjectId,
  sanPham: {
    _id: ObjectId,
    tenSP: String,
    maSP: String
  },
  soLuong: Number,
  donViTinh: String,
  updatedAt: Date
}
```

### 9.5 Sales

#### Order (salesDB)
```javascript
{
  _id: ObjectId,
  maDH: String (unique),
  khachHang: {
    tenKH: String,
    sdt: String,
    email: String,
    diaChi: String
  },
  chiTiet: [{
    sanPham: {
      tenSP: String,
      maSP: String
    },
    soLuong: Number,
    donGia: Number,
    thanhTien: Number
  }],
  tongTien: Number,
  ngayDat: Date,
  ngayYeuCauGiao: Date,
  trangThai: "Chờ duyệt" | "Đã duyệt" | "Đã xuất kho" | "Đã giao" | "Hủy",
  createdAt: Date
}
```

---

## 10. Deployment

### 10.1 Docker Deployment

Hệ thống được containerized bằng Docker và Docker Compose.

#### Khởi động tất cả services:

```bash
docker-compose up -d
```

#### Xem logs:

```bash
# Tất cả services
docker-compose logs -f

# Một service cụ thể
docker-compose logs -f api-gateway
```

#### Dừng services:

```bash
docker-compose down
```

#### Rebuild và khởi động lại:

```bash
docker-compose up -d --build
```

### 10.2 Environment Variables

Tạo file `.env` ở thư mục gốc:

```env
# JWT Secret (bắt buộc)
JWT_SECRET=your-secret-key-change-in-production

# Frontend URL
FRONTEND_URL=http://localhost:5173

# Service Secret (cho inter-service communication)
SERVICE_SECRET=warehouse-service-secret-key

# RabbitMQ (optional, có thể disable)
DISABLE_RABBITMQ=false
RABBITMQ_URL=amqp://admin:admin@rabbitmq:5672
```

### 10.3 Production Deployment

#### Khuyến nghị:

1. **Sử dụng reverse proxy** (Nginx) phía trước API Gateway
2. **SSL/TLS** cho tất cả connections
3. **Database backup** định kỳ
4. **Monitoring** và logging (ELK stack, Prometheus)
5. **Load balancing** cho các services
6. **Secrets management** (Vault, AWS Secrets Manager)
7. **CI/CD pipeline** (GitHub Actions, GitLab CI)

### 10.4 Health Checks

Các services có health check endpoints:

- API Gateway: `GET /health`
- Các microservices: `GET /health`

Kiểm tra health:

```bash
curl http://localhost:4000/health
```

---

## 11. Troubleshooting

### 11.1 Lỗi thường gặp

#### Lỗi 401 Unauthorized

**Nguyên nhân**: Token không hợp lệ hoặc đã hết hạn.

**Giải pháp**:
- Đăng nhập lại để lấy token mới
- Kiểm tra `JWT_SECRET` trong `.env` phải giống nhau giữa các services

#### Lỗi 403 Forbidden

**Nguyên nhân**: Người dùng không có quyền truy cập endpoint.

**Giải pháp**:
- Kiểm tra role của user
- Kiểm tra `authorizeRoles` middleware trong route

#### Lỗi ECONNREFUSED

**Nguyên nhân**: Service không thể kết nối đến service khác.

**Giải pháp**:
- Kiểm tra service đã khởi động chưa
- Kiểm tra `GATEWAY_URL` và service URLs trong `.env`
- Kiểm tra Docker network

#### Lỗi RabbitMQ Connection

**Nguyên nhân**: RabbitMQ không khả dụng hoặc credentials sai.

**Giải pháp**:
- Kiểm tra RabbitMQ container: `docker-compose ps rabbitmq`
- Kiểm tra `RABBITMQ_URL` trong `.env`
- Nếu không cần RabbitMQ, set `DISABLE_RABBITMQ=true`

#### Lỗi MongoDB Connection

**Nguyên nhân**: MongoDB không khả dụng hoặc URI sai.

**Giải pháp**:
- Kiểm tra MongoDB container: `docker-compose ps mongodb`
- Kiểm tra `MONGO_URI` trong service config
- Kiểm tra database name có đúng không

#### Lỗi "Cannot POST /issues"

**Nguyên nhân**: Route không đúng hoặc API Gateway routing sai.

**Giải pháp**:
- Kiểm tra route trong service có đúng không
- Kiểm tra API Gateway routing config
- Sử dụng đúng base path: `/warehouse/products/issues` thay vì `/issues`

### 11.2 Debug Mode

Bật debug logs:

```bash
# Trong service
DEBUG=* npm start

# Hoặc trong Docker
docker-compose logs -f --tail=100 <service-name>
```

### 11.3 Kiểm tra Services

```bash
# Kiểm tra tất cả containers
docker-compose ps

# Kiểm tra network
docker network ls
docker network inspect <network-name>

# Kiểm tra volumes
docker volume ls
```

### 11.4 Reset Database

**CẢNH BÁO**: Chỉ dùng trong development!

```bash
# Xóa tất cả volumes
docker-compose down -v

# Khởi động lại
docker-compose up -d
```

---

## 12. Contributing

### 12.1 Quy trình đóng góp

1. **Fork** repository
2. **Tạo branch** mới: `git checkout -b feature/amazing-feature`
3. **Commit** changes: `git commit -m 'Add amazing feature'`
4. **Push** to branch: `git push origin feature/amazing-feature`
5. **Tạo Pull Request**

### 12.2 Coding Standards

- **JavaScript/Node.js**: Follow ESLint rules
- **React**: Follow React best practices, use functional components
- **Naming**: 
  - Variables: `camelCase`
  - Functions: `camelCase`
  - Constants: `UPPER_SNAKE_CASE`
  - Files: `camelCase.js` hoặc `PascalCase.jsx`
- **Comments**: Viết comments bằng tiếng Việt cho business logic
- **Error Handling**: Luôn có try-catch và error logging

### 12.3 Commit Messages

Format: `[Type] Description`

Types:
- `feat`: Tính năng mới
- `fix`: Sửa lỗi
- `docs`: Cập nhật documentation
- `style`: Formatting, không ảnh hưởng code
- `refactor`: Refactor code
- `test`: Thêm/sửa tests
- `chore`: Cập nhật build, dependencies

Ví dụ:
```
feat: Thêm chức năng duyệt xuất kho cho Director
fix: Sửa lỗi không reset trạng thái công nhân sau khi hoàn thành
docs: Cập nhật README với quy trình nghiệp vụ
```

### 12.4 Testing

Trước khi commit, đảm bảo:
- Code không có lỗi syntax
- Không có lỗi ESLint
- Test các chức năng liên quan
- Kiểm tra với các role khác nhau

---

## 📝 License

Dự án này được phát triển cho mục đích học tập và nghiên cứu trong phạm vi học phần Hệ Thống Thông Tin.

---

## 👥 Authors

- **Nhóm phát triển** - Hệ Thống Quản Lý Nhà Máy Cà Phê

---

## 🙏 Acknowledgments

- Ths.Lê Thùy Trang
- https://microservices.io/patterns/microservices.html
- Cộng đồng open source

---

**Lưu ý**: Đây là hệ thống mô phỏng phục vụ mục đích học tập. Dữ liệu và kịch bản sử dụng mang tính minh họa.
