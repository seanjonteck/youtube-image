let player;
let videoId;
let captureInterval;
let canvasElement = document.createElement('canvas');
let ctx = canvasElement.getContext('2d');

document.getElementById('loadVideoBtn').addEventListener('click', loadVideo);
document.getElementById('captureBtn').addEventListener('click', startCapture);

function onYouTubeIframeAPIReady() {
  // YouTube API가 로드되면 player 객체를 생성
  player = new YT.Player('player', {
    height: '360',
    width: '640',
    videoId: '', // 빈 비디오 ID로 초기화
    playerVars: {
      'autoplay': 1,
      'controls': 1,
      'mute': 1
    }
  });
}

function loadVideo() {
  let url = document.getElementById('urlInput').value;

  // 유튜브 쇼츠 URL에서 비디오 ID 추출
  let videoIdMatch = url.match(/(?:https?:\/\/)?(?:www\.)?youtube\.com\/(?:shorts\/)([a-zA-Z0-9_-]+)/);
  if (videoIdMatch) {
    videoId = videoIdMatch[1];
    player.loadVideoById(videoId);  // 유튜브 영상 로드
  } else {
    alert('유효한 유튜브 쇼츠 URL을 입력해주세요.');
  }
}

function startCapture() {
  if (captureInterval) {
    clearInterval(captureInterval); // 이미 캡처가 진행 중이면 종료
  }

  captureInterval = setInterval(() => {
    if (player.getPlayerState() !== YT.PlayerState.PLAYING) {
      return; // 비디오가 재생되지 않으면 캡처 중지
    }

    captureImage();
  }, 5000); // 5초 간격으로 캡처

  alert('5초 간격으로 캡처를 시작합니다.');
}

function captureImage() {
  // 캡처할 비디오의 크기를 canvas에 맞게 설정
  canvasElement.width = player.getIframe().width;
  canvasElement.height = player.getIframe().height;

  // 캡처된 비디오의 프레임을 canvas에 그리기
  ctx.drawImage(player.getIframe(), 0, 0, canvasElement.width, canvasElement.height);

  // 캡처한 이미지를 data URL로 변환
  let imageData = canvasElement.toDataURL('image/jpeg');

  // 캡처된 이미지를 화면에 추가
  let imgElement = document.createElement('img');
  imgElement.src = imageData;
  document.getElementById('capturedImages').appendChild(imgElement);
}
