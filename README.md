# VISIO — Human Vision Simulator

## Project Overview

VISIO is an educational **web application** for exploring simplified vision effects associated with sphere minus (myopia), sphere plus (hyperopia), and cylinder (astigmatism) prescriptions. Prescription values can be difficult to visualize, so VISIO lets users adjust them and immediately compare the simulated view. Its purpose is to make these concepts easier to explore while demonstrating a containerized web application; it is not a clinical tool.

The main feature is a live, depth-aware WebGL simulation with controls for the three prescription values, plus the option to save and review configurations. It uses a street photograph at `public/assets/scene.jpg` and its paired, colorized RGB depth image at `public/assets/scene-depth.png`. Both files are included in the repository and are 3000 × 4000 pixels. The renderer uploads the depth image as a WebGL luminance texture and uses its converted intensity as approximate relative depth. VISIO does not run an AI/ML model, and the simulation is not clinically accurate.

## How to Run

**Requirements:** Git, Docker Engine, and Docker Compose.

Clone the public repository and create the local environment file:

```sh
git clone https://github.com/kevinalexanderwu/visio.git
cd visio
cp .env.example .env
```

On PowerShell, use `Copy-Item .env.example .env` instead of `cp`. Edit `.env` and replace the example `POSTGRES_PASSWORD` with a private local value. Keep `.env` local; it is ignored by Git.

Build and start the application and database:

```sh
docker compose up -d --build
```

Open **http://localhost:3000**. To stop the containers while keeping saved simulations, run:

```sh
docker compose down
```

Do not add `-v`: `docker compose down -v` removes the named database volume and its data.

## Screenshots

Screenshots are not included yet. Replace these placeholders with genuine screenshots before submission.

- **Main application:** `[Screenshot pending — docs/screenshots/main-view.png]`
- **Vision simulation:** `[Screenshot pending — docs/screenshots/vision-simulation.png]`

## Article & Video

- **Public article:** `[Add the public article URL before submission]`
- **Public YouTube video:** `[Add the public YouTube video URL before submission]`

## AI Usage Declaration

**AI Use Type: Partial.** The exam instructions permit AI assistance for up to 50% of the work process. ChatGPT was used for project brainstorming and architecture planning, debugging, and preparing documentation instructions. OpenCode was used to assist with implementation and code/configuration checks, including the React interface, WebGL/GLSL simulation, Express/PostgreSQL integration, and Docker configuration.

Representative prompts actually used included:

- “Act as a senior full-stack developer and help me build a complete, working web application called VISIO.”
- “I need you to debug the existing implementation, NOT rebuild the application.”
- “I want to redesign the VISIO frontend completely.”
