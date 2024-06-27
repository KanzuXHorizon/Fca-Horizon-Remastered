[![Socket Badge](https://socket.dev/api/badge/npm/package/fca-horizon-remastered)](https://socket.dev/npm/package/fca-horizon-remastered)

# The following are not allowed here and a little note:

🎆

## Important !

<img width="517" alt="Reason" src="https://i.imgur.com/rD3ujmL.png">
This project is no longer being developed because the project owner lacks high security capabilities, leading to potential security vulnerabilities. Therefore, the project will be permanently suspended.

Special Thanks: 
![image](https://github.com/KanzuXHorizon/Fca-Horizon-Remastered/assets/125113101/0a455054-b7f4-499d-b4b6-c91fd0569ce4)

## Important !

This package require NodeJS 14.17.0 to work properly.

## Notification !

+ We will have Example Video on Channel "Nguyễn Thái Hảo Official"

Original Project(Deprecated): https://github.com/Schmavery/facebook-chat-api

Chúc các bạn một ngày tốt lành!, cảm ơn vì đã sài Sản phẩm của HZI, thân ái

KANZUWAKAZAKI(15/04/2023)

## Support For : 

+ Support English, VietNamese !,
+ All bot if using listenMqtt first.

# Api Cho ChatBot Messenger

Facebook Đã Có Và Cho Người Dùng Tạo Api Cho Chatbots 😪 Tại Đey => [Đây Nè](https://developers.facebook.com/docs/messenger-platform).

### Api Này Có Thể Khiến Cho Bạn Payy Acc Như Cách Acc Bạn Chưa Từng Có, Hãy Chú Ý Nhé =))

Lưu Ý ! Nếu Bạn Muốn Sài Api Này Hãy Xem Document Tại [Đây Nè](https://github.com/Schmavery/facebook-chat-api).

## Tải Về 

Nếu Bạn Muốn Sử Dụng, Hãy Tải Nó Bằng Cách:
```bash
npm i fca-horizon-remastered
```
or
```bash
npm install fca-horizon-remastered
```

Nó Sẽ Tải Vô node_modules (Lib Của Bạn) - Lưu Ý Replit Sẽ Không Hiện Đâu Mà Tìm 😪

### Tải Bản Mới Nhất Hoặc Update

Nếu Bạn Muốn Sử Dụng Phiên Bản Mới Nhất Hay Cập Nhật Thì Hãy Vô Terminal Hoặc Command Promt Nhập :
```bash
npm install fca-horizon-remastered@latest
```
Hoặc
```bash
npm i fca-horizon-remastered@latest
```

## Nếu Bạn Muốn Test Api 

Lợi Ích Cho Việc Này Thì Bạn Sẽ Không Tốn Thời Gian Pay Acc Và Có Acc 😪
Hãy Sử Dụng Với Tài Khoản Thử Nghiệm => [Facebook Whitehat Accounts](https://www.facebook.com/whitehat/accounts/).

## Cách Sử Dụng

```javascript
const login = require("fca-horizon-remastered"); // lấy từ lib ra 

// đăng nhập
login({email: "Gmail Account", password: "Mật Khẩu Facebook Của Bạn"}, (err, api) => {

    if(err) return console.error(err); // trường hợp lỗi

    // tạo bot tự động nhái theo bạn:
    api.listenMqtt((err, message) => {
        api.sendMessage(message.body, message.threadID);
    });

});
```

Kết Quả Là Nó Sẽ Nhái Bạn Như Hình Dưới:
<img width="517" alt="screen shot 2016-11-04 at 14 36 00" src="https://cloud.githubusercontent.com/assets/4534692/20023545/f8c24130-a29d-11e6-9ef7-47568bdbc1f2.png">

Nếu Bạn Muốn Sử Dụng Nâng Cao Thì Hãy Sử Dụng Các Loại Bot Được Liệt Kê Ở Trên !

## Danh Sách

Bạn Có Thể Đọc Full Api Tại => [here](DOCS.md).

## Cài Đặt Cho Mirai: 

Bạn Cần Vô File Mirai.js,Sau Đó Tìm Đến Dòng
```js
    var login = require('tùy bot'); 
    /* Có thể là :
        var login = require('@maihuybao/fca-Unofficial');
        var login = require('fca-xuyen-get');
        var login = require('fca-unofficial-force');
    ...   
    */
```

Và Thay Nó Bằng:

```js
    var login = require('fca-horizon-remastered')
```

Sau Đó Thì Chạy Bình Thường Thôi  !

## Tự Nghiên Cứu

Nếu Bạn Muốn Tự Nghiên Cứu Hoặc Tạo Bot Cho Riêng Bạn Thì Bạn Hãy Vô Cái Này Đọc Chức Năng Của Nó Và Cách Sử Dụng => [Link](https://github.com/Schmavery/facebook-chat-api#Unofficial%20Facebook%20Chat%20API)

------------------------------------

### Lưu Lại Thông Tin Đăng Nhập.

Để Lưu Lại Thì Bạn Cần 1 Apstate Kiểu (Cookie, etc,..) Để Lưu Lại Hoặc Là Sử Dụng Mã Login Như Trên Để Đăng Nhập !

Và Chế Độ Này Đã Có Sẵn Trong 1 Số Bot Việt Nam Nên Bạn Cứ Yên Tâm Nhé !

__Hướng Dẫn Với Appstate__

```js
const fs = require("fs");
const login = require("fca-horizon-remastered");

var credentials = {email: "FB_EMAIL", password: "FB_PASSWORD"}; // thông tin tk

login(credentials, (err, api) => {
    if(err) return console.error(err);
    // đăng nhập
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState(), null,'\t')); //tạo appstate
});
```

Hoặc Dễ Dàng Hơn ( Chuyên Nghiệp ) Bạn Có Thể Dùng => [c3c-fbstate](https://github.com/c3cbot/c3c-fbstate) Để Lấy Fbstate And Rename Lại Thành Apstate Cũng Được ! (appstate.json)

------------------------------------

## FAQS

FAQS => [Link](https://github.com/Schmavery/facebook-chat-api#FAQS)
