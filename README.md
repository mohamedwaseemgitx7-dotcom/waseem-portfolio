# Mohamed Waseem — Portfolio

Personal portfolio of **Mohamed Waseem**, Computer Science graduate and full-stack developer.

**Live:** _add your Vercel URL here_

## Built with

- **HTML5**, **CSS3**, **JavaScript**: no framework, no build step
- **[GSAP](https://gsap.com/) + ScrollTrigger**: page-load sequence and scroll-driven animation
- **[Lenis](https://lenis.darkroom.engineering/)**: smooth scrolling
- Fonts: Geist, Geist Mono and Caveat (Google Fonts)

The libraries load from a CDN, so there is nothing to install.

## Project structure

```
.
├── index.html            # All page markup (sections: home, about, projects, experience, skills, contact)
├── css/
│   └── style.css         # Design tokens, layout, components, responsive breakpoints
├── js/
│   └── main.js           # Navigation, smooth scroll, animations, dialogs, tap feedback
├── assets/
│   ├── favicon.svg
│   ├── certificates/     # Internship / training certificates shown in Experience
│   └── resume/           # Resume PDF served by the "Download Resume" buttons
├── vercel.json           # Clean URLs + cache headers
└── README.md
```

## Run locally

Any static server works:

```bash
# Python
python -m http.server 5173
# or Node
npx serve .
```

Then open http://localhost:5173.

Opening `index.html` directly also works, but a local server matches production behaviour.

## Deploy to Vercel

1. Push this folder to a GitHub repository.
2. On [vercel.com/new](https://vercel.com/new), import the repository.
3. Set **Framework Preset** to `Other`. Leave the build command empty and set the output directory to `.` (root).
4. Deploy. Every push to `main` redeploys automatically.

## Updating content

| What | Where |
| --- | --- |
| Resume | Replace `assets/resume/Mohamed_Waseem_Resume.pdf` (keep the same file name) |
| Certificates | Replace the images in `assets/certificates/` |
| Text, projects, experience | Edit the matching `<section>` in `index.html` |
| Colours and fonts | Edit the `:root` variables at the top of `css/style.css` |
| Animations | Edit the "motion" block at the end of `js/main.js` |

## Accessibility and performance

- Respects `prefers-reduced-motion`: animations and smooth scrolling turn off.
- Fully responsive from 360px phones to large desktops.
- Keyboard focus states and semantic landmarks.
- Content stays visible even if the animation libraries fail to load.
