// server.js
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const ytdl = require('ytdl-core');
const ffmpeg = require('fluent-ffmpeg');
const { v4: uuidv4 } = require('uuid');

const app = express();
const port = process.env.PORT || 3000;

// 미들웨어 설정
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 임시 파일 저장 디렉토리
const TEMP_DIR = path.join(__dirname, 'temp');
const PUBLIC_DIR = path.join(__dirname, 'public', 'captures');

// 디렉토리 생성
if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
}
if (!fs.existsSync(PUBLIC_DIR)) {
    fs.mkdirSync(PUBLIC_DIR, { recursive: true });
}

// 메인 HTML 페이지 제공
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 유튜브 쇼츠 캡처 API 엔드포인트
app.post('/api/capture', async (req, res) => {
    const { videoId, interval } = req.body;
    
    if (!videoId) {
        return res.status(400).json({ success: false, error: '유효한 비디오 ID가 필요합니다.' });
    }
    
    const captureInterval = parseInt(interval) || 5;
    
    // 세션 ID 생성
    const sessionId = uuidv4();
    const sessionDir = path.join(PUBLIC_DIR, sessionId);
    fs.mkdirSync(sessionDir, { recursive: true });
    
    try {
        // YouTube 영상 정보 가져오기
        const videoInfo = await ytdl.getInfo(`https://www.youtube.com/shorts/${videoId}`);
        const videoFormat = ytdl.chooseFormat(videoInfo.formats, { quality: 'highest' });
        
        if (!videoFormat) {
            return res.status(404).json({
                success: false,
                error: '적합한 비디오 포맷을 찾을 수 없습니다.'
            });
        }
        
        // 임시 비디오 파일 경로
        const videoPath = path.join(TEMP_DIR, `${sessionId}.mp4`);
        
        // 영상 다운로드
        const videoStream = ytdl(`https://www.youtube.com/shorts/${videoId}`, {
            format: videoFormat
        });
        
        const writeStream = fs.createWriteStream(videoPath);
        videoStream.pipe(writeStream);
        
        writeStream.on('finish', () => {
            // 영상 길이 가져오기
            ffmpeg.ffprobe(videoPath, (err, metadata) => {
                if (err) {
                    return res.status(500).json({
                        success: false,
                        error: '비디오 메타데이터를 처리할 수 없습니다.'
                    });
                }
                
                const duration = metadata.format.duration;
                const frames = [];
                
                // 캡처할 시간 프레임 계산
                for (let time = 0; time < duration; time += captureInterval) {
                    frames.push(time);
                }
                
                const capturedImages = [];
                let processedFrames = 0;
                
                frames.forEach((time, index) => {
                    const outputPath = path.join(sessionDir, `frame_${index}.jpg`);
                    const publicPath = `/captures/${sessionId}/frame_${index}.jpg`;
                    
                    ffmpeg(videoPath)
                        .screenshots({
                            timestamps: [time],
                            filename: `frame_${index}.jpg`,
                            folder: sessionDir,
                            size: '640x?'
                        })
                        .on('end', () => {
                            capturedImages.push({
                                url: publicPath,
                                timestamp: time
                            });
                            
                            processedFrames++;
                            
                            // 모든 프레임 처리 완료 시 응답
                            if (processedFrames === frames.length) {
                                // 임시 비디오 파일 삭제
                                fs.unlink(videoPath, (err) => {
                                    if (err) console.error('임시 파일 삭제 오류:', err);
                                });
                                
                                // 결과 정렬 (타임스탬프 기준)
                                capturedImages.sort((a, b) => a.timestamp - b.timestamp);
                                
                                res.json({
                                    success: true,
                                    images: capturedImages,
                                    videoTitle: videoInfo.videoDetails.title,
                                    sessionId: sessionId
                                });
                            }
                        })
                        .on('error', (err) => {
                            console.error('스크린샷 캡처 오류:', err);
                            processedFrames++;
                            
                            if (processedFrames === frames.length) {
                                res.status(500).json({
                                    success: false,
                                    error: '일부 프레임을 캡처하는 데 실패했습니다.'
                                });
                            }
                        });
                });
            });
        });
        
        videoStream.on('error', (err) => {
            console.error('비디오 다운로드 오류:', err);
            res.status(500).json({
                success: false,
                error: '비디오를 다운로드할 수 없습니다.'
            });
        });
        
    } catch (error) {
        console.error('캡처 처리 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message || '비디오 처리 중 오류가 발생했습니다.'
        });
    }
});

// 서버 시작
app.listen(port, () => {
    console.log(`서버가 http://localhost:${port} 에서 실행 중입니다.`);
});

// 임시 파일 정리 스케줄러 (24시간 이상 된 파일 삭제)
setInterval(() => {
    const now = Date.now();
    fs.readdir(PUBLIC_DIR, (err, dirs) => {
        if (err) {
            console.error('디렉토리 읽기 오류:', err);
            return;
        }
        
        dirs.forEach(dir => {
            const dirPath = path.join(PUBLIC_DIR, dir);
            fs.stat(dirPath, (err, stats) => {
                if (err) {
                    console.error('디렉토리 상태 확인 오류:', err);
                    return;
                }
                
                // 24시간 이상 된 디렉토리 삭제
                if (now - stats.mtime.getTime() > 24 * 60 * 60 * 1000) {
                    fs.rm(dirPath, { recursive: true }, (err) => {
                        if (err) {
                            console.error('오래된 디렉토리 삭제 오류:', err);
                        } else {
                            console.log(`오래된 디렉토리 삭제됨: ${dir}`);
                        }
                    });
                }
            });
        });
    });
}, 3600000); // 1시간마다 실행
