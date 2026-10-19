# Miu Miu gửi lời yêu

Landing page chúc mừng 20/10 dành riêng cho vợ, dùng concept chú mèo Miu Miu trắng kem pha cam và đeo nơ đỏ.

## Chạy local

Từ thư mục project, chạy một static server:

```powershell
python -m http.server 4173
```

Sau đó mở [http://localhost:4173](http://localhost:4173).

## Chỉnh nội dung cá nhân

- Nội dung lời chúc, hộp quà và placeholder kỷ niệm nằm trong `index.html`.
- Các câu phản hồi khi thu thập trái tim nằm trong `app.js`, trong mảng `heartMessages`.
- Màu sắc, layout, mascot và animation nằm trong `styles.css`.
- Các vị trí `Ảnh của hai mình` là placeholder; thay bằng ảnh thật trước khi gửi cho người nhận.

## Kiểm tra

```powershell
npm test
node --check app.js
git diff --check
```

Runtime không dùng dependency ngoài. Trang không tự động phát nhạc và không lưu dữ liệu ra backend.
