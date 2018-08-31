var fs = require("fs");
var server = require("http").createServer(function (req, res) {
  res.writeHead(200, { "Content-Type": "text/html" });
  // var output = fs.readFileSync("test.html", "utf-8");
  var output = fs.readFileSync("test.html", "utf-8");
  res.end(output);
}).listen(8090);
var io = require("socket.io").listen(server);

// ユーザ管理ハッシュ
var userHash = {};

// 2.イベントの定義
io.sockets.on("connection", function (socket) {


    socket.on('test', function(msg){
      console.log(msg);
    })

  // 接続確認
  socket.on("connected", function (msg) {
    console.log(msg);
    io.sockets.emit("connect_return", "connected");
  });

  // メッセージ送信カスタムイベント
  // socket.on("publish", function (data) {
  //   console.log("data" + data);
  //   io.sockets.emit("publish", { value: data.value });
  // });

  // 接続終了組み込みイベント(接続元ユーザを削除し、他ユーザへ通知)
  // socket.on("disconnect", function () {
  //   if (userHash[socket.id]) {
  //     var msg = userHash[socket.id] + "が退出しました";
  //     delete userHash[socket.id];
  //     io.sockets.emit("publish", { value: msg });
  //     console.log("msg" + msg);
  //   }
  // });
});