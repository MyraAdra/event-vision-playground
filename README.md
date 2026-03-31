<div align="center">

# 👁️ See Like an Event Camera

### A real-time neuromorphic vision simulator — running entirely in your browser.

[![Live Demo](https://img.shields.io/badge/▶%20Live%20Demo-0a0a0a?style=for-the-badge&logoColor=white)](https://myraaadra.github.io/event-vision-playground)
[![PhD Project](https://img.shields.io/badge/PhD%20Project-Event--based%20Vision-1e90ff?style=for-the-badge)](https://github.com/MyraAdra)
[![License](https://img.shields.io/badge/License-MIT-555?style=for-the-badge)](LICENSE)

</div>

---

<div align="center">

> *"Traditional cameras capture the world frame by frame. Event cameras only record when something changes."*

</div>

---

## 📸 Demo

<div align="center">

![Demo Screenshot](docs/demo_screenshot.png)
*🔵 Blue = ON events (brightness increase) &nbsp;|&nbsp; 🔴 Red = OFF events (brightness decrease) &nbsp;|&nbsp; ⬛ Black = silence*

</div>

---

## 🧠 What Is an Event Camera?

Unlike traditional frame-based cameras that capture full images at a fixed rate, **event cameras** (also called Dynamic Vision Sensors, or DVS) operate at the **pixel level**. Each pixel is triggered independently the moment it detects a change in brightness.

This results in:
- **Microsecond temporal resolution** — no motion blur
- **High dynamic range** — works in both pitch dark and direct sunlight
- **Low power consumption** — only transmits event when we have a brightness change.

This simulator lets you experience that paradigm shift directly in your browser.

---

## ✨ Features

| Feature | Description |
|---|---|
| 📁 **Upload any video** | Drop any `.mp4` and see its event-camera approximation in real time |
| 🎚️ **Threshold slider** | Tune the contrast sensitivity — from noisy & dense to sparse & clean |
| 🔵🔴 **Polarity toggles** | Show/hide ON events, OFF events, or both independently |
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

---

## 🚀 Run Locally

No build step needed — just serve the folder:

```bash
git clone https://github.com/MyraAdra/event-vision-playground.git
cd event-vision-playground
python -m http.server 8000
```

Then open [`http://localhost:8000`](http://localhost:8000)

---

## 📁 Project Structure

```
see-like-an-event-camera/
├── index.html          
├── style.css           
├── main.js            
└── videos/
    ├── walking_crowd.mp4
    ├── traffic.mp4
    └── fast_motion.mp4
 
```
---

## 🤝 Contact

**Mira Adra** ~ PhD Student, Event-based Vision & Crowd Surveillance

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0077b5?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/mira-adra/)

---

<div align="center">

*Built with vanilla JS · No frameworks · No GPU required*

⭐ Star this repo if you found it interesting!

</div>