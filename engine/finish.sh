#!/bin/bash
# finish: loudness (one linear gain to -14 LUFS + -1 dBFS limiter), H.264 encode, QA
set -e
cd /home/claude/pig
I=$(ffmpeg -hide_banner -i audio/mix.wav -af ebur128 -f null - 2>&1 | grep -E "^\s+I:" | tail -1 | awk '{print $2}')
G=$(python3 -c "print(round(-14.0-($I),2))")
echo "mix integrated $I LUFS -> gain $G dB"
ffmpeg -y -v error -i audio/mix.wav -af "volume=${G}dB,alimiter=limit=0.891:level=false:attack=2:release=60" -ar 48000 -c:a pcm_s16le out/master.wav
ffmpeg -y -v error -framerate 30 -i frames/f%04d.jpg -i out/master.wav -c:v libx264 -preset veryfast -crf 17 -pix_fmt yuv420p -c:a aac -b:a 256k -shortest -movflags +faststart "out/$1.mp4"
ffmpeg -hide_banner -i "out/$1.mp4" -af ebur128=peak=true -f null - 2>&1 | grep -A12 Summary | grep -E "I:|Peak:"
ffmpeg -hide_banner -i "out/$1.mp4" -vf "freezedetect=n=0.001:d=0.4,blackdetect=d=0.1" -an -f null - 2>&1 | grep -E "freeze_|black_" || echo "QA: no freezes >=0.4 s, no black frames"
ffprobe -v error -show_entries format=duration:stream=width,height,r_frame_rate -of compact "out/$1.mp4"
