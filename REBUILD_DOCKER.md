# 🔄 Hướng dẫn Rebuild Docker sau khi sửa code

## ❌ Vấn đề

Khi chạy `docker compose down` rồi `docker compose up` lại, code vẫn như cũ vì:
- Code được **COPY vào image** khi build (không phải mount)
- Docker sử dụng **image cũ** đã build trước đó
- Cần **rebuild** để tạo image mới với code mới

## ✅ Giải pháp

### Cách 1: Rebuild tất cả (Khuyến nghị)

```bash
# Dừng và xóa containers
docker compose down

# Rebuild tất cả images (không dùng cache)
docker compose build --no-cache

# Chạy lại
docker compose up -d
```

### Cách 2: Rebuild chỉ backend và frontend

```bash
# Dừng containers
docker compose down

# Rebuild chỉ backend và frontend
docker compose build --no-cache backend frontend

# Chạy lại
docker compose up -d
```

### Cách 3: Rebuild và chạy cùng lúc

```bash
docker compose down
docker compose up --build -d
```

## 🔍 Kiểm tra code mới đã được áp dụng

### Kiểm tra Backend:

```bash
# Xem logs backend
docker compose logs backend | head -20

# Hoặc vào container kiểm tra
docker exec -it dlba-backend cat /app/main.py | grep "get_unique_fruits"
```

### Kiểm tra Frontend:

```bash
# Xem logs frontend
docker compose logs frontend | head -20

# Hoặc vào container kiểm tra
docker exec -it dlba-frontend ls -la /app/src/pages/
```

## 📝 Lưu ý quan trọng

1. **Model folder được mount**: Folder `model/` được mount vào container, nên thay đổi file model **KHÔNG CẦN** rebuild, chỉ cần restart:
   ```bash
   docker compose restart backend
   ```

2. **Code cần rebuild**: Mỗi khi sửa code Python hoặc TypeScript, **PHẢI** rebuild:
   ```bash
   docker compose build --no-cache backend frontend
   docker compose up -d
   ```

3. **Cache Docker**: Dùng `--no-cache` để đảm bảo build lại từ đầu, không dùng cache cũ.

## 🚀 Workflow khuyến nghị

```bash
# 1. Sửa code
# ... sửa code trong back-end/ hoặc front-end/ ...

# 2. Rebuild và chạy
docker compose down
docker compose build --no-cache backend frontend
docker compose up -d

# 3. Kiểm tra logs
docker compose logs -f backend
docker compose logs -f frontend
```

## ⚡ Quick commands

```bash
# Rebuild tất cả và chạy
docker compose down && docker compose build --no-cache && docker compose up -d

# Chỉ rebuild backend
docker compose build --no-cache backend && docker compose up -d backend

# Chỉ rebuild frontend  
docker compose build --no-cache frontend && docker compose up -d frontend
```

