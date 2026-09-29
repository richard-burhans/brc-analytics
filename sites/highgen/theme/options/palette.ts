import {
  type Palette,
  type PaletteColorOptions,
  type ThemeOptions,
} from "@mui/material";

// Slot names are shared with ga2: the root tsconfig merges every site's
// BrandColors augmentation, so HighGen keeps the keys and changes the values.
const BRAND = {
  ACCENT: "#007296",
  BURNT_SIENNA: "#3F7D3A", // leaf green (primary)
  DARK_SIENNA: "#12301A", // forest (headings)
  RAW_SIENNA: "#C9A227", // resin amber
  SURFACE: "#EEF4E6", // pale sage
};

const brand: Palette["brand"] = {
  accent: BRAND.ACCENT,
  burntSienna: BRAND.BURNT_SIENNA,
  darkSienna: BRAND.DARK_SIENNA,
  rawSienna: BRAND.RAW_SIENNA,
  surface: BRAND.SURFACE,
};

const primary: PaletteColorOptions = {
  contrastText: "#FFFFFF",
  dark: BRAND.DARK_SIENNA,
  main: BRAND.BURNT_SIENNA,
};

export const palette: ThemeOptions["palette"] = {
  brand,
  primary,
};
