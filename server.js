// express 모듈 불러오기
const express = require('express');
const path = require('path');

// Express 앱 생성
const app = express();

// 포트 설정 (환경변수 PORT가 있으면 그 값을 사용, 없으면 3000 포트 사용)
const port = process.env.PORT || 3000;

// 정적 파일 제공 설정 (public 폴더에서 파일을 제공)
app.use(express.static(path.join(__dirname, 'public')));

// 기본 라우트 (index.html 반환)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 실행
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
