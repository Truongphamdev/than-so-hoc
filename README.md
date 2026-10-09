# Landing page Thần số học

Trang nhận thông tin khách (họ tên, ngày sinh, câu hỏi, Zalo hoặc email), hiện ngay phần miễn phí
(con số chủ đạo, biểu đồ ngày sinh, mũi tên, tóm tắt) và gửi thông tin về webhook để workflow
lập bản luận giải riêng.

HTML, CSS và JavaScript thuần, không cần build.

## Chạy thử

```bash
npm start          # mở http://localhost:4173
npm test           # 28 test cho phần tính toán, kiểm tra dữ liệu và gửi webhook
```

Trang dùng ES module nên phải mở qua máy chủ, không mở thẳng file `index.html`.

## Cấu hình: `js/config.js`

| Khoá | Ý nghĩa |
|---|---|
| `BRAND_NAME` | Tên thương hiệu hiện ở đầu và cuối trang |
| `WEBHOOK_URL` | Địa chỉ nhận dữ liệu. Để trống thì trang chạy thử và báo rõ là chưa gửi |
| `OLDEST_BIRTH_YEAR` | Năm sinh xa nhất trong danh sách chọn |

## Dữ liệu gửi về webhook

`POST` với `Content-Type: application/json`:

```json
{
  "fullName": "Nguyễn Thị Mai",
  "birthDate": "1990-08-15",
  "question": "Năm nay mình có nên đổi việc không?",
  "contactType": "phone",
  "contact": "0912345678",
  "rulingNumber": 6,
  "source": "tiktok",
  "submittedAt": "2026-10-09T03:00:00.000Z"
}
```

`source` lấy từ `?utm_source=` trên đường dẫn, mặc định là `direct`.

Webhook phải cho phép CORS từ tên miền của trang (trả `Access-Control-Allow-Origin` và xử lý
`OPTIONS`). Với n8n: bật "Allowed Origins" trong node Webhook.

Phía workflow nên tự kiểm tra lại dữ liệu và giới hạn tần suất, vì ai cũng gọi được webhook.

## Cấu trúc

```
index.html
css/style.css
js/numerology.js   con số chủ đạo, biểu đồ ngày sinh, mũi tên (hàm thuần)
js/validate.js     kiểm tra và làm sạch dữ liệu form (hàm thuần)
js/submit.js       đóng gói và gửi webhook
js/content.js      nội dung luận giải cho từng con số, sửa chữ ở đây
js/config.js       cấu hình
js/app.js          nối form, tờ lịch và phần kết quả
tests/
```

## Cách tính

Con số chủ đạo: cộng mọi chữ số của ngày sinh dương lịch, rút gọn tới khi ra số từ 2 đến 11,
giữ nguyên tổng 22. Biểu đồ ngày sinh: hàng trên 3 6 9, hàng giữa 2 5 8, hàng dưới 1 4 7.
