/* Team palettes and SVG icons supplied with the Social Cards design. */
export const icons = {
  "code": "<path d=\"m18 16 4-4-4-4\"/><path d=\"m6 8-4 4 4 4\"/><path d=\"m14.5 4-5 16\"/>",
  "handshake": "<path d=\"m11 17 2 2a1 1 0 1 0 3-3\"/><path d=\"m14 14 2.5 2.5a1 1 0 1 0 3-3l-3.88-3.88a3 3 0 0 0-4.24 0l-.88.88a1 1 0 1 1-3-3l2.81-2.81a5.79 5.79 0 0 1 7.06-.87l.47.28a2 2 0 0 0 1.42.25L21 4\"/><path d=\"m21 3 1 11h-2\"/><path d=\"M3 3 2 14l6.5 6.5a1 1 0 1 0 3-3\"/><path d=\"M3 4h8\"/>",
  "calendar": "<rect x=\"3\" y=\"4\" width=\"18\" height=\"18\" rx=\"2\"/><path d=\"M16 2v4M8 2v4M3 10h18\"/><path d=\"m9 16 2 2 4-4\"/>",
  "chart": "<path d=\"M3 3v16a2 2 0 0 0 2 2h16\"/><path d=\"M18 17V9M13 17V5M8 17v-3\"/>",
  "megaphone": "<path d=\"m3 11 18-5v12L3 14v-3z\"/><path d=\"M11.6 16.8a3 3 0 1 1-5.8-1.6\"/>",
  "play": "<circle cx=\"12\" cy=\"12\" r=\"10\"/><path d=\"m10 8 6 4-6 4z\" fill=\"#fff\"/>",
  "pen": "<path d=\"m12 19 7-7 3 3-7 7-3-3z\"/><path d=\"m18 13-1.5-7.5L2 2l3.5 14.5L13 18l5-5z\"/><path d=\"m2 2 7.6 7.6\"/><circle cx=\"11\" cy=\"11\" r=\"2\"/>",
  "star": "<path d=\"m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z\" fill=\"#fff\"/>"
};
export const palettes = [
  {
    "name": "Technical",
    "label": "Technical",
    "icon": [
      "code"
    ],
    "sep": false,
    "bg": "radial-gradient(ellipse at 72% 38%, #0e3f98 0%, rgba(14,63,152,0) 62%), radial-gradient(ellipse at 12% 100%, #0b2d7a 0%, rgba(11,45,122,0) 55%), linear-gradient(160deg, #040c2e 0%, #071a52 55%, #040d33 100%)",
    "accent": "#00b8ff",
    "light": "#74f2ff",
    "head": "#00f6f6",
    "pillA": "#0a4fd0",
    "pillB": "#1a7bff",
    "pillBorder": "#8fdcff",
    "shift": {
      "c": 0,
      "f": 0,
      "k": 0
    }
  },
  {
    "name": "Outreach",
    "label": "Outreach",
    "icon": [
      "handshake"
    ],
    "sep": false,
    "bg": "radial-gradient(ellipse at 72% 38%, #10705f 0%, rgba(16,112,95,0) 62%), radial-gradient(ellipse at 12% 100%, #0b5247 0%, rgba(11,82,71,0) 55%), linear-gradient(160deg, #031c1a 0%, #07403a 55%, #031d1b 100%)",
    "accent": "#12e0c0",
    "light": "#86ffe8",
    "head": "#2df5d6",
    "pillA": "#0a6a5a",
    "pillB": "#0e8a74",
    "pillBorder": "#7ff5de",
    "shift": {
      "c": 0,
      "f": 0,
      "k": 0
    }
  },
  {
    "name": "Events & Operations",
    "label": "Events & Operations",
    "icon": [
      "calendar"
    ],
    "sep": false,
    "bg": "radial-gradient(ellipse at 72% 38%, #5a28b8 0%, rgba(90,40,184,0) 62%), radial-gradient(ellipse at 12% 100%, #44208f 0%, rgba(68,32,143,0) 55%), linear-gradient(160deg, #170630 0%, #35146e 55%, #1a0838 100%)",
    "accent": "#9d5cff",
    "light": "#d8b8ff",
    "head": "#c19bff",
    "pillA": "#5a2cc4",
    "pillB": "#7b46ea",
    "pillBorder": "#d3b4ff",
    "shift": {
      "c": -36,
      "f": -31,
      "k": -33
    }
  },
  {
    "name": "Marketing",
    "label": "Marketing",
    "icon": [
      "chart",
      "megaphone"
    ],
    "sep": true,
    "bg": "radial-gradient(ellipse at 72% 38%, #8c1352 0%, rgba(140,19,82,0) 62%), radial-gradient(ellipse at 12% 100%, #6b0e40 0%, rgba(107,14,64,0) 55%), linear-gradient(160deg, #26031a 0%, #560a33 55%, #2a041c 100%)",
    "accent": "#ff2f95",
    "light": "#ffa6cf",
    "head": "#ff4fa3",
    "pillA": "#a8124f",
    "pillB": "#e0207a",
    "pillBorder": "#ffb3d6",
    "shift": {
      "c": 0,
      "f": 0,
      "k": 0
    }
  },
  {
    "name": "Social Media",
    "label": "Social Media",
    "icon": [
      "play"
    ],
    "sep": false,
    "bg": "radial-gradient(ellipse at 72% 38%, #3d24b4 0%, rgba(61,36,180,0) 62%), radial-gradient(ellipse at 12% 100%, #2f1a96 0%, rgba(47,26,150,0) 55%), linear-gradient(160deg, #08062e 0%, #1c1074 55%, #0a0734 100%)",
    "accent": "#8f4dff",
    "light": "#cba6ff",
    "head": "#b387ff",
    "pillA": "#5530d6",
    "pillB": "#7a4bff",
    "pillBorder": "#d2b5ff",
    "shift": {
      "c": -2,
      "f": 0,
      "k": 0
    }
  },
  {
    "name": "Sponsorship",
    "label": "Sponsorship",
    "icon": [
      "handshake"
    ],
    "sep": true,
    "bg": "radial-gradient(ellipse at 72% 38%, #0f2f80 0%, rgba(15,47,128,0) 62%), radial-gradient(ellipse at 12% 100%, #0b2566 0%, rgba(11,37,102,0) 55%), linear-gradient(160deg, #040e30 0%, #081d57 55%, #040e32 100%)",
    "accent": "#f1b500",
    "light": "#ffe493",
    "head": "#f6b800",
    "pillA": "#7d5a0c",
    "pillB": "#b8861a",
    "pillBorder": "#f6d36a",
    "shift": {
      "c": 0,
      "f": 0,
      "k": 0
    }
  },
  {
    "name": "Design & Content",
    "label": "Design & Content",
    "icon": [
      "pen"
    ],
    "sep": true,
    "bg": "radial-gradient(ellipse at 72% 38%, #232323 0%, rgba(35,35,35,0) 62%), radial-gradient(ellipse at 12% 100%, #2a0a0d 0%, rgba(42,10,13,0) 55%), linear-gradient(160deg, #050505 0%, #121212 55%, #060606 100%)",
    "accent": "#f0141f",
    "light": "#ff8286",
    "head": "#ff1f2b",
    "pillA": "#a30d17",
    "pillB": "#d5151f",
    "pillBorder": "#ff9c9f",
    "shift": {
      "c": 0,
      "f": 0,
      "k": 0
    }
  },
  {
    "name": "MLSA SZABIST",
    "label": "MLSA SZABIST",
    "icon": [
      "star"
    ],
    "sep": true,
    "bg": "radial-gradient(ellipse at 72% 38%, #790824 0%, rgba(121,8,36,0) 62%), radial-gradient(ellipse at 12% 100%, #500012 0%, rgba(80,0,18,0) 55%), linear-gradient(160deg, #3c0010 0%, #68051d 55%, #26000a 100%)",
    "accent": "#e5bc7d",
    "light": "#fff0d2",
    "head": "#efd39e",
    "pillA": "#500012",
    "pillB": "#790824",
    "pillBorder": "#edd0a1",
    "shift": {
      "c": -18,
      "f": -24,
      "k": -28
    }
  }
];
