-Hướng dẫn lấy code và chạy project lần đầu
1. Clone repository
git clone https://github.com/Haruto2711/MMA.git
cd MMA

2. Chuyển sang nhánh develop (quan trọng)
git checkout develop
git pull origin develop

3. Cài dependencies
npm install

4. Chạy project
npx expo start

Chạy trên điện thoại

B1. Cài app **Expo Go** trên:
    -   Android (Play Store)
    -   iOS (App Store)
B2.  Mở Expo Go
B3.  Quét QR code hiển thị trong terminal hoặc trình duyệt.

-Quy tắc làm việc
1. Luôn pull code mới nhất từ develop
git checkout develop
git pull origin develop

2. Tạo nhánh mới cho chức năng của mình

Không được code trực tiếp trên nhánh develop

git checkout -b feature/ten-chuc-nang

Ví dụ:
feature/dashboard
feature/transactions
feature/wallets

3. Sau khi code xong → commit và push nhánh của mình
git add .
git commit -m "feat: mo ta ngan"
git push origin feature/ten-chuc-nang

4. Tạo Pull Request trên GitHub
Vào repository trên GitHub
Tạo Pull Request từ feature/ten-chuc-nang → develop

5. Nhờ thành viên trong team review
Sau khi review xong:
Merge Pull Request

6. Quy tắc branch chính
Nhánh main chỉ dùng để nộp bài / release
Khi hoàn thành project, nhóm sẽ merge từ develop → main
