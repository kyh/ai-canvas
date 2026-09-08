import type { FontInfo } from "@remotion/google-fonts";

/**
 * Each `@remotion/google-fonts/<Family>` module narrows `loadFont`'s `style`
 * and `weights` parameters to that family's own literal variants (Abel accepts
 * only `"400"`, for instance), so no family module is assignable to a shared
 * type that accepts the arbitrary weight strings the canvas passes. Callers
 * already validate a weight against `getInfo().fonts.normal` before loading it
 * — see `font-picker.tsx` and `services/fonts.ts` — so the widening is sound at
 * runtime but not provable to the compiler.
 *
 * `asLoadedFont` is the single boundary where that widening happens; it
 * replaces the ~100 per-entry `as Promise<GoogleFont>` casts this list used to
 * carry. Model the weight/family relationship properly and it can go away.
 */
interface LoadedFont {
  getInfo: () => FontInfo;
  loadFont: (
    style?: never,
    options?: { weights?: string[]; subsets?: string[] },
  ) => { waitUntilDone: () => Promise<undefined> };
}

/** The surface every `@remotion/google-fonts/<Family>` module shares verbatim. */
interface FontFamilyModule {
  getInfo: () => FontInfo;
}

// SAFETY: every `@remotion/google-fonts/<Family>` module ships a `loadFont`
// whose per-family literal `weights`/`style` parameters only narrow, never
// change, this shape; callers validate each weight against
// `getInfo().fonts.normal` before passing it (font-picker.tsx,
// services/fonts.ts), so the widened signature can't receive an unsupported
// weight at runtime.
// oxlint-disable-next-line typescript/consistent-type-assertions
const asLoadedFont = (mod: FontFamilyModule) => mod as LoadedFont;

interface FontEntry {
  family: string;
  load: () => Promise<LoadedFont>;
  fontKey: string;
}

export const fontsList: FontEntry[] = [
  {
    family: "Abel",
    fontKey: "Abel",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Abel")),
  },
  {
    family: "Anton",
    fontKey: "Anton",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Anton")),
  },
  {
    family: "Archivo",
    fontKey: "Archivo",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Archivo")),
  },
  {
    family: "Arimo",
    fontKey: "Arimo",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Arimo")),
  },
  {
    family: "Arvo",
    fontKey: "Arvo",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Arvo")),
  },
  {
    family: "Asap",
    fontKey: "Asap",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Asap")),
  },
  {
    family: "Assistant",
    fontKey: "Assistant",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Assistant")),
  },
  {
    family: "Barlow",
    fontKey: "Barlow",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Barlow")),
  },
  {
    family: "Barlow Condensed",
    fontKey: "BarlowCondensed",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/BarlowCondensed")),
  },
  {
    family: "Barlow Semi Condensed",
    fontKey: "BarlowSemiCondensed",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/BarlowSemiCondensed")),
  },
  {
    family: "Bebas Neue",
    fontKey: "BebasNeue",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/BebasNeue")),
  },
  {
    family: "Bitter",
    fontKey: "Bitter",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Bitter")),
  },
  {
    family: "Cabin",
    fontKey: "Cabin",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Cabin")),
  },
  {
    family: "Cairo",
    fontKey: "Cairo",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Cairo")),
  },
  {
    family: "Caveat",
    fontKey: "Caveat",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Caveat")),
  },
  {
    family: "Chakra Petch",
    fontKey: "ChakraPetch",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/ChakraPetch")),
  },
  {
    family: "Comfortaa",
    fontKey: "Comfortaa",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Comfortaa")),
  },
  {
    family: "Cormorant Garamond",
    fontKey: "CormorantGaramond",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/CormorantGaramond")),
  },
  {
    family: "Crimson Text",
    fontKey: "CrimsonText",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/CrimsonText")),
  },
  {
    family: "DM Sans",
    fontKey: "DMSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/DMSans")),
  },
  {
    family: "Dancing Script",
    fontKey: "DancingScript",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/DancingScript")),
  },
  {
    family: "Dosis",
    fontKey: "Dosis",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Dosis")),
  },
  {
    family: "EB Garamond",
    fontKey: "EBGaramond",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/EBGaramond")),
  },
  {
    family: "Exo 2",
    fontKey: "Exo2",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Exo2")),
  },
  {
    family: "Figtree",
    fontKey: "Figtree",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Figtree")),
  },
  {
    family: "Fira Sans",
    fontKey: "FiraSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/FiraSans")),
  },
  {
    family: "Fira Sans Condensed",
    fontKey: "FiraSansCondensed",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/FiraSansCondensed")),
  },
  {
    family: "Fjalla One",
    fontKey: "FjallaOne",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/FjallaOne")),
  },
  {
    family: "Heebo",
    fontKey: "Heebo",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Heebo")),
  },
  {
    family: "Hind",
    fontKey: "Hind",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Hind")),
  },
  {
    family: "Hind Siliguri",
    fontKey: "HindSiliguri",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/HindSiliguri")),
  },
  {
    family: "IBM Plex Mono",
    fontKey: "IBMPlexMono",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/IBMPlexMono")),
  },
  {
    family: "IBM Plex Sans",
    fontKey: "IBMPlexSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/IBMPlexSans")),
  },
  {
    family: "Inconsolata",
    fontKey: "Inconsolata",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Inconsolata")),
  },
  {
    family: "Inter",
    fontKey: "Inter",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Inter")),
  },
  {
    family: "Josefin Sans",
    fontKey: "JosefinSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/JosefinSans")),
  },
  {
    family: "Jost",
    fontKey: "Jost",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Jost")),
  },
  {
    family: "Kanit",
    fontKey: "Kanit",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Kanit")),
  },
  {
    family: "Karla",
    fontKey: "Karla",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Karla")),
  },
  {
    family: "Lato",
    fontKey: "Lato",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Lato")),
  },
  {
    family: "Lexend",
    fontKey: "Lexend",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Lexend")),
  },
  {
    family: "Libre Baskerville",
    fontKey: "LibreBaskerville",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/LibreBaskerville")),
  },
  {
    family: "Libre Franklin",
    fontKey: "LibreFranklin",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/LibreFranklin")),
  },
  {
    family: "Lobster",
    fontKey: "Lobster",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Lobster")),
  },
  {
    family: "Lora",
    fontKey: "Lora",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Lora")),
  },
  {
    family: "M PLUS Rounded 1c",
    fontKey: "MPLUSRounded1c",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/MPLUSRounded1c")),
  },
  {
    family: "Manrope",
    fontKey: "Manrope",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Manrope")),
  },
  {
    family: "Maven Pro",
    fontKey: "MavenPro",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/MavenPro")),
  },
  {
    family: "Merriweather",
    fontKey: "Merriweather",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Merriweather")),
  },
  {
    family: "Montserrat",
    fontKey: "Montserrat",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Montserrat")),
  },
  {
    family: "Mukta",
    fontKey: "Mukta",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Mukta")),
  },
  {
    family: "Mulish",
    fontKey: "Mulish",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Mulish")),
  },
  {
    family: "Nanum Gothic",
    fontKey: "NanumGothic",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NanumGothic")),
  },
  {
    family: "Noto Color Emoji",
    fontKey: "NotoColorEmoji",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoColorEmoji")),
  },
  {
    family: "Noto Sans",
    fontKey: "NotoSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSans")),
  },
  {
    family: "Noto Sans Arabic",
    fontKey: "NotoSansArabic",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSansArabic")),
  },
  {
    family: "Noto Sans HK",
    fontKey: "NotoSansHK",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSansHK")),
  },
  {
    family: "Noto Sans JP",
    fontKey: "NotoSansJP",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSansJP")),
  },
  {
    family: "Noto Sans KR",
    fontKey: "NotoSansKR",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSansKR")),
  },
  {
    family: "Noto Sans SC",
    fontKey: "NotoSansSC",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSansSC")),
  },
  {
    family: "Noto Sans TC",
    fontKey: "NotoSansTC",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSansTC")),
  },
  {
    family: "Noto Serif",
    fontKey: "NotoSerif",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSerif")),
  },
  {
    family: "Noto Serif JP",
    fontKey: "NotoSerifJP",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NotoSerifJP")),
  },
  {
    family: "Nunito",
    fontKey: "Nunito",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Nunito")),
  },
  {
    family: "Nunito Sans",
    fontKey: "NunitoSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/NunitoSans")),
  },
  {
    family: "Open Sans",
    fontKey: "OpenSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/OpenSans")),
  },
  {
    family: "Oswald",
    fontKey: "Oswald",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Oswald")),
  },
  {
    family: "Outfit",
    fontKey: "Outfit",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Outfit")),
  },
  {
    family: "Overpass",
    fontKey: "Overpass",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Overpass")),
  },
  {
    family: "Oxygen",
    fontKey: "Oxygen",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Oxygen")),
  },
  {
    family: "PT Sans",
    fontKey: "PTSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/PTSans")),
  },
  {
    family: "PT Sans Narrow",
    fontKey: "PTSansNarrow",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/PTSansNarrow")),
  },
  {
    family: "PT Serif",
    fontKey: "PTSerif",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/PTSerif")),
  },
  {
    family: "Pacifico",
    fontKey: "Pacifico",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Pacifico")),
  },
  {
    family: "Play",
    fontKey: "Play",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Play")),
  },
  {
    family: "Playfair Display",
    fontKey: "PlayfairDisplay",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/PlayfairDisplay")),
  },
  {
    family: "Poppins",
    fontKey: "Poppins",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Poppins")),
  },
  {
    family: "Prompt",
    fontKey: "Prompt",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Prompt")),
  },
  {
    family: "Public Sans",
    fontKey: "PublicSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/PublicSans")),
  },
  {
    family: "Quicksand",
    fontKey: "Quicksand",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Quicksand")),
  },
  {
    family: "Rajdhani",
    fontKey: "Rajdhani",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Rajdhani")),
  },
  {
    family: "Raleway",
    fontKey: "Raleway",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Raleway")),
  },
  {
    family: "Red Hat Display",
    fontKey: "RedHatDisplay",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/RedHatDisplay")),
  },
  {
    family: "Roboto",
    fontKey: "Roboto",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Roboto")),
  },
  {
    family: "Roboto Condensed",
    fontKey: "RobotoCondensed",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/RobotoCondensed")),
  },
  {
    family: "Roboto Mono",
    fontKey: "RobotoMono",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/RobotoMono")),
  },
  {
    family: "Roboto Slab",
    fontKey: "RobotoSlab",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/RobotoSlab")),
  },
  {
    family: "Rubik",
    fontKey: "Rubik",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Rubik")),
  },
  {
    family: "Shadows Into Light",
    fontKey: "ShadowsIntoLight",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/ShadowsIntoLight")),
  },
  {
    family: "Signika Negative",
    fontKey: "SignikaNegative",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/SignikaNegative")),
  },
  {
    family: "Slabo 27px",
    fontKey: "Slabo27px",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Slabo27px")),
  },
  {
    family: "Source Code Pro",
    fontKey: "SourceCodePro",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/SourceCodePro")),
  },
  {
    family: "Source Sans 3",
    fontKey: "SourceSans3",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/SourceSans3")),
  },
  {
    family: "Space Grotesk",
    fontKey: "SpaceGrotesk",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/SpaceGrotesk")),
  },
  {
    family: "Teko",
    fontKey: "Teko",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Teko")),
  },
  {
    family: "Titillium Web",
    fontKey: "TitilliumWeb",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/TitilliumWeb")),
  },
  {
    family: "Ubuntu",
    fontKey: "Ubuntu",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/Ubuntu")),
  },
  {
    family: "Varela Round",
    fontKey: "VarelaRound",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/VarelaRound")),
  },
  {
    family: "Work Sans",
    fontKey: "WorkSans",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/WorkSans")),
  },
  {
    family: "Zilla Slab",
    fontKey: "ZillaSlab",
    load: async () => asLoadedFont(await import("@remotion/google-fonts/ZillaSlab")),
  },
];

export const fontWeights = [
  { label: "Thin", value: "100" },
  { label: "Extra Light", value: "200" },
  { label: "Light", value: "300" },
  { label: "Normal", value: "400" },
  { label: "Medium", value: "500" },
  { label: "Semi Bold", value: "600" },
  { label: "Bold", value: "700" },
  { label: "Extra Bold", value: "800" },
  { label: "Black", value: "900" },
];
