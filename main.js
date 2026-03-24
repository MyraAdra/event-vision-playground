document.addEventListener('DOMContentLoaded', () => {

    // ── Element refs ──────────────────────────────────────────────
    const video = document.getElementById('video');
    const eventCanvas = document.getElementById('eventCanvas');
    const eventCtx = eventCanvas.getContext('2d');

    //   const onCountEl    = document.getElementById('onCount');
    //   const offCountEl   = document.getElementById('offCount');
    //   const totalCountEl = document.getElementById('totalCount');

    const playPauseBtn = document.getElementById('playPauseBtn');
    const speedSlider = document.getElementById('speedSlider');
    const speedValue = document.getElementById('speedValue');
    const thresholdSlider = document.getElementById('threshold');
    const thresholdValue = document.getElementById('thresholdValue');
    const showON = document.getElementById('showON');
    const showOFF = document.getElementById('showOFF');
    const upload = document.getElementById('upload');

    // ── Offscreen canvas ──────────────────────────────────────────
    const offscreen = document.createElement('canvas');
    const offCtx = offscreen.getContext('2d');

    // ── State ─────────────────────────────────────────────────────
    let THRESHOLD = 15;
    let prevGray = null;
    let lastVideoTime = -1;
    let loopRunning = false;
    let fadeBuffer = null; // persists across frames

    // ── Controls ──────────────────────────────────────────────────
    playPauseBtn.addEventListener('click', () => {
        if (video.paused) {
            video.play();
            playPauseBtn.textContent = '⏸ Pause';
        } else {
            video.pause();
            playPauseBtn.textContent = '▶ Play';
        }
    });

    speedSlider.addEventListener('input', () => {
        video.playbackRate = parseFloat(speedSlider.value);
        speedValue.textContent = `${speedSlider.value}x`;
    });

    thresholdSlider.addEventListener('input', () => {
        THRESHOLD = parseInt(thresholdSlider.value);
        thresholdValue.textContent = THRESHOLD;
    });

    // ── Load video (works for both presets and uploads) ───────────
    function loadVideo(src) {
        fadeBuffer = null;
        prevGray = null;
        lastVideoTime = -1;
        loopRunning = false;

        video.src = src;
        video.load(); // force reload metadata for new src

        video.addEventListener('loadedmetadata', onMetadataLoaded);
        playPauseBtn.textContent = '⏸ Pause';
    }

    function onMetadataLoaded() {
        // Remove listener so it doesn't stack on next load
        video.removeEventListener('loadedmetadata', onMetadataLoaded);

        offscreen.width = video.videoWidth;
        offscreen.height = video.videoHeight;
        eventCanvas.width = video.videoWidth;
        eventCanvas.height = video.videoHeight;

        eventCtx.clearRect(0, 0, eventCanvas.width, eventCanvas.height);

        console.log(`Video loaded: ${video.videoWidth} x ${video.videoHeight}`);

        video.play();

        // Start loop only once
        if (!loopRunning) {
            loopRunning = true;
            requestAnimationFrame(processFrame);
        }
    }

    // ── Preset buttons ────────────────────────────────────────────
    const presetBtns = document.querySelectorAll('.preset-btn[data-src]');
    presetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            presetBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            loadVideo(btn.dataset.src);
        });
    });

    // ── Upload ────────────────────────────────────────────────────
    upload.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        presetBtns.forEach(b => b.classList.remove('active'));
        loadVideo(URL.createObjectURL(file));
    });

    // ── Processing functions ──────────────────────────────────────
    function toGrayscale(imageData) {
        const { data, width, height } = imageData;
        const gray = new Float32Array(width * height);
        for (let i = 0; i < width * height; i++) {
            gray[i] = 0.299 * data[i * 4] + 0.587 * data[i * 4 + 1] + 0.114 * data[i * 4 + 2];
        }
        return gray;
    }

    function gaussianBlur(gray, width, height) {
        const kernel = [
            1, 4, 7, 4, 1,
            4, 16, 26, 16, 4,
            7, 26, 41, 26, 7,
            4, 16, 26, 16, 4,
            1, 4, 7, 4, 1
        ];
        const kernelSize = 5;
        const kernelSum = 273;
        const half = 2;
        const blurred = new Float32Array(width * height);

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                let sum = 0;
                for (let ky = 0; ky < kernelSize; ky++) {
                    for (let kx = 0; kx < kernelSize; kx++) {
                        const py = Math.min(height - 1, Math.max(0, y + ky - half));
                        const px = Math.min(width - 1, Math.max(0, x + kx - half));
                        sum += gray[py * width + px] * kernel[ky * kernelSize + kx];
                    }
                }
                blurred[y * width + x] = sum / kernelSum;
            }
        }
        return blurred;
    }

    function computeEvents(curr, prev, width, height) {
        const events = new Int8Array(width * height);
        for (let i = 0; i < width * height; i++) {
            const delta = curr[i] - prev[i];
            if (delta > THRESHOLD) events[i] = 1;
            else if (delta < -THRESHOLD) events[i] = -1;
            else events[i] = 0;
        }
        return events;
    }

    //   function renderEvents(events, width, height) {
    //     const output = eventCtx.createImageData(width, height);
    //     const d = output.data;
    //     for (let i = 0; i < width * height; i++) {
    //       const px = i * 4;
    //       if (events[i] === 1 && showON.checked) {
    //         d[px]=30; d[px+1]=144; d[px+2]=255; d[px+3]=255;
    //       } else if (events[i] === -1 && showOFF.checked) {
    //         d[px]=255; d[px+1]=50; d[px+2]=50; d[px+3]=255;
    //       } else {
    //         d[px]=0; d[px+1]=0; d[px+2]=0; d[px+3]=255;
    //       }
    //     }
    //     eventCtx.putImageData(output, 0, 0);
    //   }

    function renderEvents(events, width, height) {
        // Initialize buffer on first call or resolution change
        if (!fadeBuffer || fadeBuffer.width !== width || fadeBuffer.height !== height) {
            fadeBuffer = eventCtx.createImageData(width, height);
            // Fill black
            for (let i = 0; i < fadeBuffer.data.length; i += 4) {
                fadeBuffer.data[i] = 0;
                fadeBuffer.data[i + 1] = 0;
                fadeBuffer.data[i + 2] = 0;
                fadeBuffer.data[i + 3] = 255;
            }
        }

        const d = fadeBuffer.data;
        const DECAY = 0.6; // how fast old events fade (0.7=fast, 0.95=slow trail)

        for (let i = 0; i < width * height; i++) {
            const px = i * 4;

            if (events[i] === 1 && showON.checked) {
                // ON event → paint blue at full brightness
                d[px] = 30;
                d[px + 1] = 144;
                d[px + 2] = 255;
                d[px + 3] = 255;
            } else if (events[i] === -1 && showOFF.checked) {
                // OFF event → paint red at full brightness
                d[px] = 255;
                d[px + 1] = 50;
                d[px + 2] = 50;
                d[px + 3] = 255;
            } else {
                // No event → decay toward black
                d[px] = d[px] * DECAY;
                d[px + 1] = d[px + 1] * DECAY;
                d[px + 2] = d[px + 2] * DECAY;
                // alpha stays 255
            }
        }

        eventCtx.putImageData(fadeBuffer, 0, 0);
    }

    // ── Main loop ─────────────────────────────────────────────────
    function processFrame() {
        if (!video.paused && !video.ended && video.currentTime !== lastVideoTime) {
            lastVideoTime = video.currentTime;

            offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
            const frame = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
            const currGray = toGrayscale(frame);
            const currBlurred = gaussianBlur(currGray, offscreen.width, offscreen.height);

            if (prevGray) {
                const events = computeEvents(currBlurred, prevGray, offscreen.width, offscreen.height);
                renderEvents(events, offscreen.width, offscreen.height);

                // let onCount = 0, offCount = 0;
                // for (let i = 0; i < events.length; i++) {
                //   if      (events[i] ===  1) onCount++;
                //   else if (events[i] === -1) offCount++;
                // }
                // const total      = onCount + offCount;
                // const totalPixels = offscreen.width * offscreen.height;

                // onCountEl.textContent    = `🔵 ON: ${onCount.toLocaleString()}`;
                // offCountEl.textContent   = `🔴 OFF: ${offCount.toLocaleString()}`;
                // totalCountEl.textContent = `⚡ Total: ${total.toLocaleString()}`;
            }

            prevGray = currBlurred;
        }

        requestAnimationFrame(processFrame);
    }

});