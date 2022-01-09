Lưu Ý! Đây Là Sản Phẩm Được Horizon Remake ( Chính Bởi Facebook-Chat-Api Của Schmavery, Tác Giả Không Chịu Trách Nghiệm Nào !), Nếu Có Lỗi Hãy Thử Sử Dụng Sang Sản Phẩm Khác !

## Support For : 
+ Horizon Lucius Synthesis IV
+ MiraiPr0ject
+ C3C
+ Kb2a
+ LawerBot
+ Lazic (Private)
+ Goat
+ Jabd
+ Sumi


# Api Cho ChatBot Messenger

Facebook Giờ Đã Có Api Cho ChatBot 😪 Tại Đey => [Đây Nè](https://developers.facebook.com/docs/messenger-platform).

Api Này Có Thể Khiến Cho Bạn Payy Acc Như Cách Acc Bạn Chưa Từng Có, Hãy Chú Ý Nhé =))

Lưu Ý ! Nếu Bạn Muốn Sài Api Này Hãy Xem Document Tại [Đây Nè](https://github.com/Schmavery/facebook-chat-api).

## Tải Về 
Nếu Bạn Muốn Sử Dụng, Hãy Tải Nó Bằng Cách:
```bash
npm i fca-horizon-remake
```
or
```bash
npm install fca-horizon-remake
```

Nó Sẽ Tải Vô node_modules (Lib Của Bạn)

### Tải Bản Mới Nhất Hoặc Update
    Nếu Bạn Muốn Sử Dụng Phiên Bản Mới Nhất Hay Cập Nhật Thì Hãy Vô Terminal Hoặc Command Promt Nhập :
    ```bash
    npm install fca-horizon-remake@latest
```
Hoặc
```bash
npm i fca-horizon-remake@latest
```

## Nếu Bạn Muốn Test Api 
Lợi Ích Cho Việc Này Thì Bạn Sẽ Không Tốn Thời Gian Pay Acc Và Có Acc 😪
Hãy Sử Dụng Với Tài Khoản Thử Nghiệm => [Facebook Whitehat Accounts](https://www.facebook.com/whitehat/accounts/).

## Cách Sử Dụng
```javascript
const login = require("fca-horizon-remake"); // lấy từ lib ra 

// đăng nhập
login({email: "Gmail Account", password: "Mật Khẩu Facebook Của Bạn"}, (err, api) => {

    if(err) return console.error(err); // trường hợp lỗi

    // tạo bot tự động nhái theo bạn:
    api.listen((err, message) => {
        api.sendMessage(message.body, message.threadID);
    });

});
```

Kết Quả Là Nó Sẽ Nhái Bạn Như Hình Dưới:
<img width="517" alt="screen shot 2016-11-04 at 14 36 00" src="https://cloud.githubusercontent.com/assets/4534692/20023545/f8c24130-a29d-11e6-9ef7-47568bdbc1f2.png">

Nếu Bạn Muốn Sử Dụng Nâng Cao Thì Hãy Sử Dụng Các Loại Bot Được Liệt Kê Ở Trên !


## Danh Sách

Bạn Có Thể Đọc Full Api Tại => [here](DOCS.md).

## Main Functionality

### Sending a message
#### api.sendMessage(message, threadID[, calblack][, messageID])

Various types of message can be sent:
* *Regular:* set field `body` to the desired message as a string.
* *Sticker:* set a field `sticker` to the desired sticker ID.
* *File or image:* Set field `attachment` to a readable stream or an array of readable streams.
* *URL:* set a field `url` to the desired URL.
* *Emoji:* set field `emoji` to the desired emoji as a string and set field `emojiSize` with size of the emoji (`small`, `medium`, `large`)

Note that a message can only be a regular message (which can be empty) and optionally one of the following: a sticker, an attachment or a url.

__Tip__: to find your own ID, you can look inside the cookies. The `userID` is under the name `c_user`.

__Example (Basic Message)__
```js
const login = require("fca-horizon-remake");

login({email: "FB_EMAIL", password: "FB_PASSWORD"}, (err, api) => {
    if(err) return console.error(err);

    var yourID = "000000000000000"; // id facebook của bạn
    var msg = "Hey!";
    api.sendMessage(msg, yourID);
});
```

__Example (Cách Upload File Qua Tin Nhắn)__
```js
const login = require("fca-horizon-remake");

login({email: "FB_EMAIL", password: "FB_PASSWORD"}, (err, api) => {
    if(err) return console.error(err);

    // Note this example uploads an image called image.jpg
    var yourID = "000000000000000";
    var msg = {
        body: "Hey!",
        attachment: fs.createReadStream(__dirname + '/image.jpg')
    }
    api.sendMessage(msg, yourID);
});
```

------------------------------------
### Lưu Lại Thông Tin Đăng Nhập.

Để Lưu Lại Thì Bạn Cần 1 Apstate Kiểu (Cookie, etc,..) Để Lưu Lại Hoặc Là Sử Dụng Mã Login Như Trên Để Đăng Nhập !
__Hướng Dẫn Với Appstate__

```js
const fs = require("fs");
const login = require("fca-horizon-remake");

var credentials = {email: "FB_EMAIL", password: "FB_PASSWORD"}; // thông tin tk

login(credentials, (err, api) => {
    if(err) return console.error(err);
    // đăng nhập
    fs.writeFileSync('appstate.json', JSON.stringify(api.getAppState())); //tạo appstate
});
```

Hoặc Dễ Dàng Hơn ( Chuyên Nghiệp ) Bạn Có Thể Dùng => [c3c-fbstate](https://github.com/c3cbot/c3c-fbstate) Để Lấy Fbstate And Rename Lại Thành Apstate Cũng Được ! (appstate.json)

------------------------------------

### Listening to a chat
#### api.listen(callback)

Listen watches for messages sent in a chat. By default this won't receive events (joining/leaving a chat, title change etc…) but it can be activated with `api.setOptions({listenEvents: true})`. This will by default ignore messages sent by the current account, you can enable listening to your own messages with `api.setOptions({selfListen: true})`.

__Example__

```js
const fs = require("fs");
const login = require("fca-horizon-remake");

// Simple echo bot. It will repeat everything that you say.
// Will stop when you say '/stop'
login({appState: JSON.parse(fs.readFileSync('appstate.json', 'utf8'))}, (err, api) => {
    if(err) return console.error(err);

    api.setOptions({listenEvents: true});

    var stopListening = api.listenMqtt((err, event) => {
        if(err) return console.error(err);

        api.markAsRead(event.threadID, (err) => {
            if(err) console.error(err);
        });

        switch(event.type) {
            case "message":
                if(event.body === '/stop') {
                    api.sendMessage("Goodbye…", event.threadID);
                    return stopListening();
                }
                api.sendMessage("TEST BOT: " + event.body, event.threadID);
                break;
            case "event":
                console.log(event);
                break;
        }
    });
});
```

## FAQS

1. How do I run tests?
> For tests, create a `test-config.json` file that resembles `example-config.json` and put it in the `test` directory. From the root >directory, run `npm test`.

2. Why doesn't `sendMessage` always work when I'm logged in as a page?
> Pages can't start conversations with users directly; this is to prevent pages from spamming users.

3. What do I do when `login` doesn't work?
> First check that you can login to Facebook using the website. If login approvals are enabled, you might be logging in incorrectly. For how to handle login approvals, read our docs on [`login`](DOCS.md#login).

4. How can I avoid logging in every time?  Can I log into a previous session?
> We support caching everything relevant for you to bypass login. `api.getAppState()` returns an object that you can save and pass into login as `{appState: mySavedAppState}` instead of the credentials object.  If this fails, your session has expired.

5. Do you support sending messages as a page?
> Yes, set the pageID option on login (this doesn't work if you set it using api.setOptions, it affects the login process).
> ```js
> login(credentials, {pageID: "000000000000000"}, (err, api) => { … }
> ```

6. I'm getting some crazy weird syntax error like `SyntaxError: Unexpected token [`!!!
> Please try to update your version of node.js before submitting an issue of this nature.  We like to use new language features.

7. I don't want all of these logging messages!
> You can use `api.setOptions` to silence the logging. You get the `api` object from `login` (see example above). Do
> ```js
> api.setOptions({
>     logLevel: "silent"
> });
> ```
