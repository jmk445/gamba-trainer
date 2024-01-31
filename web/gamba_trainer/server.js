const express = require('express');
const https = require('https');
const fs = require('fs');
const app = express();
const path = require('path');
const port = 3010;

// app.use((req, res, next) => {
//   if (!req.secure) {
//     return res.redirect('https://localhost:${port}');
//   }
//   next();
// });

// SSL/TLS 인증서 파일 경로 설정
// const options = {
//   cert: fs.readFileSync('/etc/letsencrypt/live/gambalabs.ai/cert.pem'),    // SSL/TLS 인증서 파일 경로
//   key: fs.readFileSync('/etc/letsencrypt/live/gambalabs.ai/privkey.pem'),  // 개인 키 파일 경로
//   ca: fs.readFileSync('/etc/letsencrypt/live/gambalabs.ai/chain.pem'),     // 중간 인증서 파일 (SSLCertificateChainFile)
// };

// 정적 파일 제공
app.use(express.static('dist')); // 앱 빌드 결과물이 있는 디렉토리

// 기타 라우트 및 미들웨어 
// ...

// '/motion-FUI' 경로에 대한 정적 파일 제공
app.use('/motion-FUI', express.static('./src/finger-user-interface'));
app.use('/motion-FUI', express.static('./src/finger-user-interface/web'));
app.use('/speech-example', express.static('./src/speech_example'));
app.use('/speech-example', express.static('./src/speech_example/web'));

app.get('/motion-FUI', (req, res) => {
    res.sendFile(path.join(__dirname, '/src/finger-user-interface/web/index.html'));
});
app.get('/speech-example', (req, res) => {
  res.sendFile(path.join(__dirname, '/src/speech_example/web/index.html'));
});

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
});


//http 서버 시작
app.listen(port, '0.0.0.0', () => {
  console.log(`앱이 http://localhost:${port} 에서 호스팅됩니다.`);
});

// //HTTPS 서버 시작
// const httpsServer = https.createServer(options, app);
// httpsServer.listen(port, '0.0.0.0', () => {
//   console.log(`앱이 https://localhost:${port}에서 호스팅됩니다.`);
// });