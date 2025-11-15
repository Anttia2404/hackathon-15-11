# Hướng dẫn nhập lịch học theo format trường

## Bảng giờ học chuẩn

| Tiết | Thời gian | Tiết | Thời gian |
|------|-----------|------|-----------|
| 1 | 07:30 - 08:15 | 7 | 12:45 - 13:30 |
| 2 | 08:15 - 09:00 | 8 | 13:30 - 14:15 |
| 3 | 09:00 - 09:45 | 9 | 14:15 - 15:00 |
| 4 | 10:00 - 10:45 | 10 | 15:15 - 16:00 |
| 5 | 10:45 - 11:30 | 11 | 16:00 - 16:45 |
| 6 | 11:30 - 12:15 | 12 | 16:45 - 17:30 |

## Cách nhập lịch

### Format 1: Theo tiết học
```
Thứ 2 tiết 1-3 Lập trình Python - P.401
Thứ 3 tiết 4-6 An toàn thông tin - P.502
Thứ 5 tiết 7-9 Cơ sở dữ liệu - P.301
```

### Format 2: Theo giờ
```
Monday 7:30-9:45 Lập trình Python - P.401
Tuesday 10:00-12:15 An toàn thông tin - P.502
Thursday 12:45-15:00 Cơ sở dữ liệu - P.301
```

### Format 3: Copy từ UTEX/Portal
```
Thứ 2, 07:30-09:45, Lập trình Python, Phòng 401
Thứ 3, 10:00-12:15, An toàn thông tin, Phòng 502
Thứ 5, 12:45-15:00, Cơ sở dữ liệu, Phòng 301
```

## Quy tắc chuyển đổi tiết → giờ

- Tiết 1 = 07:30-08:15
- Tiết 2 = 08:15-09:00
- Tiết 3 = 09:00-09:45
- Tiết 4 = 10:00-10:45 (nghỉ 15 phút)
- Tiết 5 = 10:45-11:30
- Tiết 6 = 11:30-12:15
- Tiết 7 = 12:45-13:30 (nghỉ trưa 30 phút)
- Tiết 8 = 13:30-14:15
- Tiết 9 = 14:15-15:00
- Tiết 10 = 15:15-16:00 (nghỉ 15 phút)
- Tiết 11 = 16:00-16:45
- Tiết 12 = 16:45-17:30

## Ví dụ đầy đủ

```
Thứ 2 tiết 1-3 Lập trình Python - P.401
Thứ 2 tiết 7-9 Toán rời rạc - P.201
Thứ 3 tiết 4-6 An toàn thông tin - P.502
Thứ 4 tiết 1-3 Cấu trúc dữ liệu - P.301
Thứ 5 tiết 7-9 Cơ sở dữ liệu - P.302
Thứ 6 tiết 4-6 Mạng máy tính - P.401
```

Sẽ được chuyển thành:
- Monday 07:30-09:45 Lập trình Python - P.401
- Monday 12:45-15:00 Toán rời rạc - P.201
- Tuesday 10:00-12:15 An toàn thông tin - P.502
- Wednesday 07:30-09:45 Cấu trúc dữ liệu - P.301
- Thursday 12:45-15:00 Cơ sở dữ liệu - P.302
- Friday 10:00-12:15 Mạng máy tính - P.401
