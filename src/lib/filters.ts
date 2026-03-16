export interface VideoFilter {
  name: string;
  css: string;
  category: "none" | "color" | "mood" | "retro" | "artistic" | "beauty" | "cinematic";
}

export const VIDEO_FILTERS: VideoFilter[] = [
  // None
  { name: "Normal", css: "", category: "none" },

  // Color filters
  { name: "Vivid", css: "saturate(1.8) contrast(1.15)", category: "color" },
  { name: "Pop", css: "saturate(2.2) brightness(1.1) contrast(1.1)", category: "color" },
  { name: "Cool Blue", css: "hue-rotate(20deg) saturate(1.3) brightness(1.05)", category: "color" },
  { name: "Warm Sun", css: "sepia(0.25) saturate(1.5) brightness(1.1)", category: "color" },
  { name: "Neon", css: "saturate(2.5) contrast(1.3) brightness(1.1)", category: "color" },
  { name: "Pastel", css: "saturate(0.6) brightness(1.2) contrast(0.9)", category: "color" },

  // Mood filters
  { name: "Moody", css: "contrast(1.4) brightness(0.8) saturate(0.8)", category: "mood" },
  { name: "Dark", css: "brightness(0.7) contrast(1.5) saturate(1.1)", category: "mood" },
  { name: "Dreamy", css: "brightness(1.15) contrast(0.85) blur(0.3px) saturate(1.2)", category: "mood" },
  { name: "Melancholy", css: "sepia(0.15) saturate(0.7) brightness(0.9) contrast(1.1)", category: "mood" },
  { name: "Golden Hour", css: "sepia(0.35) saturate(1.4) brightness(1.1) contrast(1.05)", category: "mood" },

  // Retro filters
  { name: "Vintage", css: "sepia(0.6) contrast(1.1) brightness(0.9)", category: "retro" },
  { name: "Film Grain", css: "sepia(0.2) contrast(1.15) brightness(0.95) saturate(1.1)", category: "retro" },
  { name: "70s", css: "sepia(0.45) hue-rotate(-10deg) saturate(1.6) contrast(0.95)", category: "retro" },
  { name: "Polaroid", css: "sepia(0.3) contrast(1.05) brightness(1.1) saturate(0.9)", category: "retro" },
  { name: "VHS", css: "contrast(1.3) brightness(1.05) saturate(1.4) hue-rotate(5deg)", category: "retro" },

  // Artistic filters
  { name: "B&W", css: "grayscale(1)", category: "artistic" },
  { name: "Noir", css: "grayscale(1) contrast(1.6) brightness(0.85)", category: "artistic" },
  { name: "Sketch", css: "grayscale(1) contrast(2) brightness(1.3)", category: "artistic" },
  { name: "Duotone", css: "grayscale(1) sepia(1) hue-rotate(180deg) saturate(2)", category: "artistic" },
  { name: "Invert", css: "invert(0.85) hue-rotate(180deg)", category: "artistic" },

  // Beauty filters
  { name: "Glow", css: "brightness(1.15) contrast(1.05) saturate(1.2)", category: "beauty" },
  { name: "Soft Skin", css: "brightness(1.1) contrast(0.95) blur(0.2px) saturate(1.1)", category: "beauty" },
  { name: "Porcelain", css: "brightness(1.2) contrast(0.9) saturate(0.8)", category: "beauty" },
  { name: "Radiant", css: "brightness(1.15) saturate(1.3) contrast(1.05)", category: "beauty" },
  { name: "Peach", css: "sepia(0.15) saturate(1.3) brightness(1.1) hue-rotate(-5deg)", category: "beauty" },

  // Cinematic filters
  { name: "Cinema", css: "contrast(1.3) saturate(0.9) brightness(0.95)", category: "cinematic" },
  { name: "Blockbuster", css: "contrast(1.4) saturate(1.2) brightness(0.9) sepia(0.1)", category: "cinematic" },
  { name: "Teal & Orange", css: "contrast(1.2) saturate(1.3) sepia(0.15) hue-rotate(-10deg)", category: "cinematic" },
  { name: "Blade Runner", css: "contrast(1.5) saturate(1.5) brightness(0.8) hue-rotate(10deg)", category: "cinematic" },
  { name: "Desaturated", css: "saturate(0.4) contrast(1.2) brightness(0.95)", category: "cinematic" },
];

export const FILTER_CATEGORIES = [
  { id: "none" as const, label: "All" },
  { id: "color" as const, label: "Color" },
  { id: "mood" as const, label: "Mood" },
  { id: "retro" as const, label: "Retro" },
  { id: "artistic" as const, label: "Artistic" },
  { id: "beauty" as const, label: "Beauty" },
  { id: "cinematic" as const, label: "Cinema" },
];

export const LIVE_FILTERS = VIDEO_FILTERS.filter(
  (f) => f.category === "beauty" || f.category === "color" || f.category === "mood" || f.name === "Normal"
);
