document.getElementById('loadVideoBtn').addEventListener('click', loadVideo);
document.getElementById('captureBtn').addEventListener('click', startCapture);

let videoElement = document.createElement('video'); // <video> 요소를 동적으로 생성
videoElement.style.display = 'none'; // 비디오를 화면에 표시하지 않음
document.body.appendChild(videoElement); // 페이지에 비디오 요소를 추가
let canvasElement = document.createElement('canvas');
let ctx = canvasElement.getContext('2d');
let captureInterval;

function loadVideo() {
  let url = document.getElementById('urlInput').value;

  // 유튜브 쇼츠 URL에서 비디오 ID 추출
  let videoId = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:shorts\/)([a-zA-Z0-9_-]+)/);
  if (videoId) {
    videoElement.src = `https://www.youtube.com/watch?v=${videoId[1]}`;
    videoElement.load();
    videoElement.play(); // 영상 재생
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

  alert('5초 간격으로 캡처를 시작합니다.');
}

function captureImage() {
  canvasElement.width = videoElement.videoWidth;
  canvasElement.height = videoElement.videoHeight;

  // 캡처한 프레임을 canvas에 그리기
  ctx.drawImage(videoElement, 0, 0, canvasElement.width, canvasElement.height);

  // 캡처한 이미지를 data URL로 변환
  let imageData = canvasElement.toDataURL('image/jpeg');

  // 캡처된 이미지를 화면에 추가
  let imgElement = document.createElement('img');
  imgElement.src = imageData;
  document.getElementById('capturedImages').appendChild(imgElement);
}
