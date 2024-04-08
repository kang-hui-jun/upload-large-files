const express = require("express");
const multer = require("multer");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = 3000;

app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// 创建一个 Multer 实例来处理文件上传
const upload = multer({ dest: "uploads/" });

// 存储分片信息的对象
const uploadedChunks = {};

// 处理客户端上传的文件分片
app.post("/upload", upload.single("file"), (req, res) => {
  const start = parseInt(req.body.start);
  const end = parseInt(req.body.end);
  const index = parseInt(req.body.index);
  const file = req.file;

  // 读取分片的内容并将其追加到已保存的文件末尾
  fs.readFile(file.path, (err, data) => {
    if (err) {
      console.error(err);
      return res.status(500).send("读取分片数据失败");
    }

    // 将接收到的分片追加到已保存的文件末尾
    const chunkFilePath = path.join(
      __dirname,
      `uploads/${file.originalname}.${index}`
    );
    fs.appendFileSync(chunkFilePath, data);

    console.log(`Chunk ${index} saved as ${chunkFilePath}`);

    // 将分片信息存储到 uploadedChunks 中
    uploadedChunks[index] = {
      start,
      end,
      path: chunkFilePath,
    };

    // 如果是最后一个分片，发送成功响应
    if (end >= file.size) {
      console.log("收到所以分片");
      return res.send("分片上传成功");
    }

    // 否则，继续等待下一个分片
    res.send("收到分片");
  });
});

app.listen(PORT, () => {
  console.log(`服务器正在运行 http://localhost:${PORT}`);
});
