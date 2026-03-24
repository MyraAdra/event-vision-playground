//const upload = document.getElementById('upload');


document.addEventListener('DOMContentLoaded', () => {


  const video = document.getElementById('video');


  const onCountEl = document.getElementById('onCount');
  const offCountEl = document.getElementById('offCount');
  const totalCountEl = document.getElementById('totalCount');
  const sparsityEl = document.getElementById('sparsity');



  // upload.addEventListener('change', (e) => {
  //   const file = e.target.files[0];
  //   if (!file) return;

  //   const url = URL.createObjectURL(file);
  //   video.src = url;
  //   video.play();
  // });

  // Offscreen canvas for reading pixel data
  const offscreen = document.createElement('canvas');
  const offCtx = offscreen.getContext('2d');

  // Output canvas (the one the user sees)
  const eventCanvas = document.getElementById('eventCanvas');
  const eventCtx = eventCanvas.getContext('2d');

  // Match canvas size to video once metadata is loaded
  video.addEventListener('loadedmetadata', () => {
    offscreen.width = video.videoWidth;
    offscreen.height = video.videoHeight;
    eventCanvas.width = video.videoWidth;
    eventCanvas.height = video.videoHeight;

    console.log(`Video size: ${video.videoWidth} x ${video.videoHeight}`);

    // Start the frame loop
    requestAnimationFrame(processFrame);
  });

  function toGrayscale(imageData) {
    const { data, width, height } = imageData;
    const gray = new Float32Array(width * height);

    for (let i = 0; i < width * height; i++) {
      const r = data[i * 4];
      const g = data[i * 4 + 1];
      const b = data[i * 4 + 2];

      // Standard luminance formula
      gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
    }

    return gray;
  }


  const playPauseBtn = document.getElementById('playPauseBtn');
  const speedSlider = document.getElementById('speedSlider');
  const speedValue = document.getElementById('speedValue');

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



  // Replace this line:
  //const THRESHOLD = 15; // default, we'll make this a slider later

  // With this:
  let THRESHOLD = 15;

  const thresholdSlider = document.getElementById('threshold');
  const thresholdValue = document.getElementById('thresholdValue');

  thresholdSlider.addEventListener('input', () => {
    THRESHOLD = parseInt(thresholdSlider.value);
    thresholdValue.textContent = THRESHOLD;
  });


  const showON = document.getElementById('showON');
  const showOFF = document.getElementById('showOFF');


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
    const half = Math.floor(kernelSize / 2);
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

  function computeEvents(currGray, prevGray, width, height) {
    const events = new Int8Array(width * height);
    // -1 = OFF event, 0 = silence, +1 = ON event

    for (let i = 0; i < width * height; i++) {
      const delta = currGray[i] - prevGray[i];

      if (delta > THRESHOLD) {
        events[i] = 1;   // brightness increased → ON
      } else if (delta < -THRESHOLD) {
        events[i] = -1;  // brightness decreased → OFF
      } else {
        events[i] = 0;   // no significant change → silence
      }
    }

    return events;
  }

  function renderEvents(events, width, height) {
    const output = eventCtx.createImageData(width, height);
    const d = output.data;

    for (let i = 0; i < width * height; i++) {
      const px = i * 4;

      if (events[i] === 1 && showON.checked) {
        d[px] = 30; d[px + 1] = 144; d[px + 2] = 255; d[px + 3] = 255;
      } else if (events[i] === -1 && showOFF.checked) {
        d[px] = 255; d[px + 1] = 50; d[px + 2] = 50; d[px + 3] = 255;
      } else {
        d[px] = 0; d[px + 1] = 0; d[px + 2] = 0; d[px + 3] = 255;
      }
    }

    eventCtx.putImageData(output, 0, 0);
  }

  let prevGray = null;

  function processFrame() {
    if (!video.paused && !video.ended) {
      offCtx.drawImage(video, 0, 0, offscreen.width, offscreen.height);
      const frame = offCtx.getImageData(0, 0, offscreen.width, offscreen.height);
      const currGray = toGrayscale(frame);
      const currBlurred = gaussianBlur(currGray, offscreen.width, offscreen.height); // 👈 new

      if (prevGray) {
        const events = computeEvents(currBlurred, prevGray, offscreen.width, offscreen.height);
        renderEvents(events, offscreen.width, offscreen.height);

        // Count events
        let onCount = 0, offCount = 0;
        for (let i = 0; i < events.length; i++) {
          if (events[i] === 1) onCount++;
          else if (events[i] === -1) offCount++;
        }

        const total = onCount + offCount;
        const totalPixels = offscreen.width * offscreen.height;
        const silencePct = (((totalPixels - total) / totalPixels) * 100).toFixed(1);

        onCountEl.textContent = `🔵 ON: ${onCount.toLocaleString()}`;
        offCountEl.textContent = `🔴 OFF: ${offCount.toLocaleString()}`;
        totalCountEl.textContent = `⚡ Total: ${total.toLocaleString()}`;
        sparsityEl.textContent = `🔇 Silence: ${silencePct}%`;
      }

      prevGray = currBlurred; // 👈 store blurred version
    }

    requestAnimationFrame(processFrame);
  }


  function loadVideo(src) {
    // Reset state when new video loads
    prevGray = null;
    lastVideoTime = -1;

    video.src = src;
    video.play();
    playPauseBtn.textContent = '⏸ Pause';

    // Clear event canvas
    eventCtx.clearRect(0, 0, eventCanvas.width, eventCanvas.height);
  }

  // Preset buttons
  const presetBtns = document.querySelectorAll('.preset-btn[data-src]');
  presetBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      // Mark active
      presetBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      loadVideo(btn.dataset.src);
    });
  });

  // Upload your own
  const upload = document.getElementById('upload');

  upload.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Clear active preset
    presetBtns.forEach(b => b.classList.remove('active'));

    const url = URL.createObjectURL(file);
    loadVideo(url);
  });


});
