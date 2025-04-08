const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// 클라이언트 파일 제공
app.use(express.static(path.join(__dirname, '../public')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
