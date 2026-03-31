<div align="center">

# 👁️ See Like an Event Camera

### A real-time neuromorphic vision simulator — running entirely in your browser.

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-0a0a0a?style=for-the-badge&logoColor=white)](https://myraaadra.github.io/see-like-an-event-camera)
[![PhD Project](https://img.shields.io/badge/PhD%20Project-Event--based%20Vision-1e90ff?style=for-the-badge)](https://github.com/MyraAdra)
[![License](https://img.shields.io/badge/License-MIT-555?style=for-the-badge)](LICENSE)

</div>

---

<div align="center">

> *"Traditional cameras capture the world frame by frame. Event cameras only wake up when something changes."*

</div>

---

## 📸 Demo

<div align="center">

![Demo Screenshot](docs/demo_screenshot.png)
*🔵 Blue = ON events (brightness increase) &nbsp;|&nbsp; 🔴 Red = OFF events (brightness decrease) &nbsp;|&nbsp; ⬛ Black = silence*

</div>

---

## 🧠 What Is an Event Camera?

Unlike traditional frame-based cameras that capture full images at a fixed rate, **event cameras** (also called Dynamic Vision Sensors, or DVS) operate at the **pixel level** — each pixel fires independently the moment it detects a change in brightness.

This results in:
- ⚡ **Microsecond temporal resolution** — no motion blur
- 🔇 **Extreme sparsity** — 95–99% of pixels are silent at any moment
- 🌗 **120+ dB dynamic range** — works in both pitch dark and direct sunlight
- 🔋 **Ultra-low power** — only transmit what changes

This simulator lets you experience that paradigm shift directly in your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 **Upload any video** | Drop any `.mp4` and see its event-camera approximation in real time |
| 🎬 **Preset clips** | Curated clips processed with [V2E](https://github.com/SensorsINI/v2e) for research-accurate output |
| 🎚️ **Threshold slider** | Tune the contrast sensitivity — from noisy & dense to sparse & clean |
| 🔵🔴 **Polarity toggles** | Show/hide ON events, OFF events, or both independently |
| 👻 **Fade buffer rendering** | Events decay naturally over time, mimicking real DVS persistence |
| ⚡ **Live event counter** | See ON/OFF event counts update in real time per frame |
| ⏯️ **Playback controls** | Pause, play, and adjust speed from 0.25× to 2× |
| 🖥️ **Zero dependencies** | Runs entirely in the browser — no backend, no install, no GPU needed |

---

## 🔬 How It Works

### User-uploaded videos → Frame Differencing Approximation

```
Video frame N  ──┐
                  ├──▶  Grayscale  ──▶  Gaussian Blur  ──▶  Pixel Δ  ──▶  ON/OFF Events
Video frame N-1 ──┘
```

For each pixel:
- `Δ > +threshold` → **ON event** (🔵 blue)
- `Δ < −threshold` → **OFF event** (🔴 red)
- `|Δ| ≤ threshold` → **silence** (⬛ black, decays)

### Preset clips → Real V2E Output

Preset clips are processed offline using **[V2E](https://github.com/SensorsINI/v2e)**, a research-grade simulator that models:
- Sub-frame temporal interpolation via SuperSloMo
- Per-pixel shot noise and bandwidth limits
- Refractory periods

The output is stored as compact `.bin` event arrays `[timestamp, x, y, polarity]` and rendered directly in the browser.

---

## 🚀 Run Locally

No build step needed — just serve the folder:

```bash
git clone https://github.com/MyraAdra/see-like-an-event-camera.git
cd see-like-an-event-camera
python -m http.server 8000
```

Then open [`http://localhost:8000`](http://localhost:8000)

---

## 📁 Project Structure

```
see-like-an-event-camera/
├── index.html          # UI layout
├── style.css           # Dark theme styling
├── main.js             # Core simulation logic
├── videos/
│   ├── walking_crowd.mp4
│   ├── traffic.mp4
│   └── fast_motion.mp4
└── docs/
    └── demo_screenshot.png   # ← add your screenshot here
```

---

## 🎓 Research Context

This project is part of my PhD research on **Event-based Crowd Surveillance Systems**. It sits at the intersection of:

- Neuromorphic engineering & Dynamic Vision Sensors (DVS)
- Crowd analysis and density estimation
- Real-time computer vision pipelines

The simulator is intended as an **educational and outreach tool** — bridging the gap between neuromorphic hardware and public understanding of event-based vision.

---

## 📚 References & Related Work

- Gallego et al. — *"Event-based Vision: A Survey"*, IEEE TPAMI 2022
- Gehrig et al. — *"Video to Events: Recycling Video Datasets for Event Cameras"* (V2E)
- Rebecq et al. — *"E2VID: High Speed and High Dynamic Range Video with an Event Camera"*
- [RPG Event Camera Dataset](http://rpg.ifi.uzh.ch/davis_data.html)
- [Prophesee Metavision](https://www.prophesee.ai/)

---

## 🤝 Contact

**Myra Adra** — PhD Student, Event-based Vision & Crowd Surveillance

[![GitHub](https://img.shields.io/badge/GitHub-MyraAdra-0a0a0a?style=flat-square&logo=github)](https://github.com/MyraAdra)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077b5?style=flat-square&logo=linkedin)](https://linkedin.com/in/YOUR_LINKEDIN)

---

<div align="center">

*Built with vanilla JS · No frameworks · No GPU required*

⭐ Star this repo if you found it interesting!

</div>