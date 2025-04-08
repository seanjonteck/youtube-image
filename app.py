import os
import uuid
import math
import cv2
import subprocess
from flask import Flask, render_template, request, send_from_directory

app = Flask(__name__)

OUTPUT_FOLDER = os.path.join("static", "images")
os.makedirs(OUTPUT_FOLDER, exist_ok=True)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/extract", methods=["POST"])
def extract():
    url = request.form["url"]
    video_id = str(uuid.uuid4())[:8]

    # yt-dlp로 비디오 스트리밍 (다운로드 없이)
    video_filename = f"video_{video_id}.mp4"
    subprocess.run(["yt-dlp", "-f", "best", "--sleep-interval", "10", "-o", video_filename, url], check=True)

    # 비디오 열기
    video = cv2.VideoCapture(video_filename)
    fps = video.get(cv2.CAP_PROP_FPS)
    total_frames = int(video.get(cv2.CAP_PROP_FRAME_COUNT))
    duration = int(total_frames / fps)

    # 추출할 이미지 개수 계산 (5초 간격)
    estimated_images = math.ceil(duration / 5)

    # 이미지 추출
    image_files = []
    frame_count = 0
    while True:
        ret, frame = video.read()
        if not ret:
            break
        
        if frame_count % (fps * 5) == 0:  # 5초마다
            image_filename = os.path.join(OUTPUT_FOLDER, f"{video_id}_{frame_count // (fps * 5):04d}.jpg")
            cv2.imwrite(image_filename, frame)
            image_files.append(f"{video_id}_{frame_count // (fps * 5):04d}.jpg")
        
        frame_count += 1

    video.release()

    return render_template("index.html", images=image_files, estimate=estimated_images, video_id=video_id)

@app.route("/images/<filename>")
def serve_image(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == "__main__":
    # 0.0.0.0에 바인딩하고 PORT 환경 변수를 사용하여 포트 설정
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port, debug=True)
