document.getElementById('loadAndCaptureBtn').addEventListener('click', loadAndCapture);

let videoElement = document.createElement('video');
videoElement.style.display = 'none'; // 비디오를 화면에 표시하지 않음
document.body.appendChild(videoElement); // 페이지에 비디오 요소를 추가
let canvasElement = document.createElement('canvas');
let ctx = canvasElement.getContext('2d');
let captureInterval;

function loadAndCapture() {
  let url = document.getElementById('urlInput').value;
  
  // 유효한 유튜브 URL인지 체크
  let videoId = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:shorts\/)([a-zA-Z0-9_-]+)/);
  if (videoId) {
    videoElement.src = `https://www.youtube.com/watch?v=${videoId[1]}`;
    videoElement.load();
    videoElement.play(); // 비디오 재생

    alert("영상이 로드되고 5초 간격으로 캡처가 시작됩니다!");

    // 5초 간격 캡처 시작
    startCapture();
  } else {
    alert('유효한 유튜브 쇼츠 URL을 입력해주세요.');
  }
}

function startCapture() {
  if (captureInterval) {
    clearInterval(captureInterval); // 이미 캡처가 진행 중이면 종료
  }

  captureInterval = setInterval(() => {
    if (videoElement.paused || videoElement.ended) {
      return; // 비디오가 일시 정지 상태거나 끝났으면 캡처 중지
    }

    captureImage();
  }, 5000); // 5초 간격으로 캡처
}

function captureImage() {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // 캡처한 프레임을 canvas에 그리기
  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // 캡처한 이미지를 Blob으로 변환
  canvasElement.toBlob(function(blob) {
    // Blob을 객체 URL로 변환
    let url = URL.createObjectURL(blob);

    // 다운로드 링크 생성
    let link = document.createElement('a');
    link.href = url;
    link.download = 'captured_image.jpg'; // 다운로드할 파일 이름 설정
    link.click(); // 자동으로 다운로드가 시작됩니다

    // 다운로드 후 객체 URL 해제
    URL.revokeObjectURL(url);
  }, 'image/jpeg'); // JPEG 형식으로 저장
}
