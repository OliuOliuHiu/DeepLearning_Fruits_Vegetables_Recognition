# Fruit AI Classification System - Hướng dẫn chạy từ đầu

## 📋 Yêu cầu hệ thống

- Python 3.8+ 
- Node.js 16+ và npm
- MongoDB (có thể dùng MongoDB Atlas hoặc local MongoDB)
- File model `.h5` trong folder `model/`

## 🏷️ Tạo File Labels (Quan trọng!)

Nếu kết quả hiển thị "Class_0", "Class_35" thay vì tên quả, bạn cần tạo file labels:

### Cách 1: Dùng script tự động (Khuyến nghị)

```bash
cd back-end
python check_model.py
```

Script sẽ:
- Kiểm tra số lượng classes trong model
- Tạo file `model/fruit_classifier_mobilenetv2.labels.txt` với tên mẫu
- Bạn cần sửa lại file này với đúng tên các class theo thứ tự train

### Cách 2: Tạo thủ công

1. Tạo file `model/fruit_classifier_mobilenetv2.labels.txt` (hoặc `[tên_file_model].labels.txt`)
2. Mỗi dòng là tên một class, theo đúng thứ tự khi train model
3. Ví dụ nếu model có 36 classes (0-35):
   ```
   Apple
   Banana
   Orange
   ...
   Watermelon
   ```

**Lưu ý:** Thứ tự labels PHẢI đúng với thứ tự classes khi train model. Nếu không chắc, xem lại:
- Code train model
- Dataset gốc (tên folder thường = tên class)
- Hoặc test với ảnh đã biết để xác định class index

## 🚀 Cách chạy từ đầu

### Bước 1: Chuẩn bị Model

1. Đặt file model `.h5` của bạn vào folder `model/`:
   ```
   model/
     └── fruit_classifier_mobilenetv2.h5  (hoặc tên file .h5 của bạn)
   ```

2. (Tùy chọn) Tạo file labels để hiển thị tên class đẹp hơn:
   - Tạo file `model/fruit_classifier_mobilenetv2.labels.txt` (hoặc `[tên_file].labels.txt`)
   - Mỗi dòng là tên một class, ví dụ:
     ```
     Apple
     Banana
     Pineapple
     Orange
     ```

### Bước 2: Cài đặt Backend

1. Vào folder backend:
   ```bash
   cd back-end
   ```

2. Tạo virtual environment (khuyến nghị):
   ```bash
   python -m venv venv
   
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. Cài đặt dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Tạo file `.env` trong folder `back-end/`:
   ```env
   MONGODB_URI=mongodb://localhost:27017
   MONGODB_DB=dlba
   MONGODB_COLLECTION=predictions
   ```
   
   **Lưu ý:** Nếu dùng MongoDB Atlas, thay `MONGODB_URI` bằng connection string của bạn.

### Bước 3: Cài đặt Frontend

1. Vào folder frontend:
   ```bash
   cd front-end
   ```

2. Cài đặt dependencies:
   ```bash
   npm install
   ```

3. Kiểm tra file `src/config.ts` để đảm bảo API URL đúng:
   ```typescript
   export const API_BASE_URL = 'http://localhost:8000';
   ```

### Bước 4: Chạy MongoDB

**Cách 1: Dùng MongoDB Local**
- Cài đặt MongoDB Community Edition
- Chạy MongoDB service:
  ```bash
  # Windows (nếu đã cài MongoDB)
  net start MongoDB
  
  # Linux/Mac
  sudo systemctl start mongod
  ```

**Cách 2: Dùng MongoDB Atlas (Cloud)**
- Tạo tài khoản tại https://www.mongodb.com/cloud/atlas
- Tạo cluster miễn phí
- Lấy connection string và cập nhật vào file `.env`

**Cách 3: Dùng Docker (nếu có docker-compose.yml)**
```bash
docker-compose up -d mongodb
```

### Bước 5: Chạy Backend

1. Vào folder `back-end/`:
   ```bash
   cd back-end
   ```

2. Kích hoạt virtual environment (nếu dùng):
   ```bash
   # Windows
   venv\Scripts\activate
   
   # Linux/Mac
   source venv/bin/activate
   ```

3. Chạy server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

   Backend sẽ chạy tại: `http://localhost:8000`
   
   Bạn sẽ thấy log:
   ```
   Loading model from .../model/fruit_classifier_mobilenetv2.h5...
   Model loaded successfully!
   Model type detected: mobilenet
   ```

### Bước 6: Chạy Frontend

1. Mở terminal mới, vào folder `front-end/`:
   ```bash
   cd front-end
   ```

2. Chạy development server:
   ```bash
   npm run dev
   ```

   Frontend sẽ chạy tại: `http://localhost:5173` (hoặc port khác nếu 5173 bận)

### Bước 7: Kiểm tra

1. Mở trình duyệt và vào: `http://localhost:5173`
2. Upload một ảnh trái cây để test
3. Xem kết quả dự đoán

## 🔧 Troubleshooting

### Lỗi: "Model file not found"
- Kiểm tra file `.h5` có trong folder `model/` không
- Đảm bảo tên file đúng (có thể là bất kỳ tên nào, miễn là `.h5`)

### Lỗi: "Failed to load model"
- Kiểm tra model file có bị hỏng không
- Đảm bảo TensorFlow version tương thích: `tensorflow>=2.15.0`

### Lỗi: MongoDB connection failed
- Kiểm tra MongoDB đã chạy chưa
- Kiểm tra `MONGODB_URI` trong file `.env`
- Nếu dùng MongoDB Atlas, kiểm tra IP whitelist

### Lỗi: Frontend không kết nối được Backend
- Kiểm tra Backend đã chạy tại `http://localhost:8000` chưa
- Kiểm tra CORS settings trong `main.py`
- Kiểm tra `API_BASE_URL` trong `front-end/src/config.ts`

### Model dự đoán sai
- Kiểm tra preprocessing: code tự động detect model type (EfficientNet/MobileNet/Generic)
- Nếu vẫn sai, có thể cần điều chỉnh preprocessing trong `model.py`
- Kiểm tra model có được train đúng không

## 📁 Cấu trúc Project

```
dlba/
├── back-end/           # Python FastAPI backend
│   ├── main.py        # API endpoints
│   ├── model.py      # Model loading & prediction
│   ├── database.py    # MongoDB operations
│   ├── requirements.txt
│   └── .env          # Environment variables (tạo mới)
│
├── front-end/         # React + TypeScript frontend
│   ├── src/
│   │   ├── pages/    # Các trang
│   │   ├── components/ # Components
│   │   └── config.ts  # API configuration
│   └── package.json
│
├── model/             # Folder chứa model
│   └── *.h5          # File model của bạn
│
└── upload/            # Folder upload (tự động tạo)
```

## 🐳 Chạy bằng Docker (Tùy chọn)

Nếu có `docker-compose.yml`:

```bash
docker-compose up --build
```

## 📝 API Endpoints

- `GET /health` - Health check
- `POST /predict` - Predict một ảnh
- `POST /batch-predict` - Predict nhiều ảnh
- `GET /history` - Lấy lịch sử predictions
- `DELETE /history` - Xóa predictions
- `GET /analytics` - Lấy thống kê

## 💡 Tips

1. **Tối ưu Model**: Nếu model lớn, có thể mất vài giây để load lần đầu
2. **Labels File**: Tạo file labels để hiển thị tên class đẹp thay vì "Class_0", "Class_1"
3. **MongoDB**: Có thể bỏ qua MongoDB nếu chỉ test model (nhưng sẽ không lưu history)
4. **Hot Reload**: Backend và Frontend đều có hot reload, sửa code sẽ tự động reload

## ☁️ Deploy lên Render (tham khảo)

### Chuẩn bị
- Merge code vào nhánh `main`.
- Đảm bảo folder `model/` được ignore (không push `.h5` lên GitHub). Giữ lại `model/.gitkeep` để Render tạo đúng thư mục.
- Lưu model ở nơi khác (S3, GDrive, v.v.) hoặc chuẩn bị script tải về khi build.

### Backend (FastAPI) - Render Web Service
1. Vào Render Dashboard → **New +** → **Web Service** → chọn repo & branch `main`.
2. **Build Command**: `pip install -r back-end/requirements.txt` (nếu cần tải model, xem phần script bên dưới).
3. **Start Command**: `cd back-end && uvicorn main:app --host 0.0.0.0 --port $PORT`
4. Khai báo biến môi trường:
   - `MONGODB_URI`
   - `MONGODB_DB`
   - `MONGODB_COLLECTION`
   - `MODEL_URL` (nếu bạn dùng script tải model)
5. Nếu cần tải model khi build, thêm script:
   ```bash
   pip install -r back-end/requirements.txt
   python back-end/scripts/download_model.py
   ```
   Với script này, Render sẽ tải model từ `MODEL_URL` vào `back-end/model/`.

### Frontend (Vite) - Render Static Site
1. Render Dashboard → **New +** → **Static Site** → chọn repo & branch `main`.
2. **Build Command**: `cd front-end && npm install && npm run build`
3. **Publish Directory**: `front-end/dist`
4. Thêm biến môi trường `VITE_API_BASE_URL` (hoặc `VITE_API_URL`) trỏ tới URL backend Render đã deploy.

### Kiểm tra sau deploy
- Frontend URL hiển thị được trang chủ.
- Upload ảnh thử để kiểm tra API đang hoạt động, tag hiển thị đúng.
- Xem logs trong Render nếu gặp lỗi (Menus → Logs).

## 📞 Hỗ trợ

Nếu gặp vấn đề, kiểm tra:
1. Logs của Backend (terminal chạy uvicorn)
2. Logs của Frontend (terminal chạy npm)
3. Console của trình duyệt (F12)

