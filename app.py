from flask import Flask, render_template, request, send_from_directory
import os
import subprocess
import uuid
import math

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
    video_filename = f"video_{video_id}.mp4"

    subprocess.run(["yt-dlp", "-f", "best", "-o", video_filename, url], check=True)

    result = subprocess.run(["ffmpeg", "-i", video_filename], stderr=subprocess.PIPE, text=True)
    duration_line = [line for line in result.stderr.splitlines() if "Duration" in line][0]
    duration_str = duration_line.split("Duration: ")[1].split(",")[0]
    h, m, s = map(float, duration_str.split(":"))
    total_seconds = int(h * 3600 + m * 60 + s)
    estimated_images = math.ceil(total_seconds / 5)

    output_pattern = os.path.join(OUTPUT_FOLDER, f"{video_id}_%04d.jpg")
    subprocess.run(["ffmpeg", "-i", video_filename, "-vf", "fps=1/5", "-q:v", "2", output_pattern], check=True)

    image_files = sorted(f for f in os.listdir(OUTPUT_FOLDER) if f.startswith(video_id))

    return render_template("index.html", images=image_files, estimate=estimated_images, video_id=video_id)

@app.route("/images/<filename>")
def serve_image(filename):
    return send_from_directory(OUTPUT_FOLDER, filename)

if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 10000))
    app.run(host="0.0.0.0", port=port)
