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
type LoadedFont = {
  getInfo: () => FontInfo;
  loadFont: (
    style?: never,
    options?: { weights?: string[]; subsets?: string[] },
  ) => { waitUntilDone: () => Promise<undefined> };
};

/** The surface every `@remotion/google-fonts/<Family>` module shares verbatim. */
type FontFamilyModule = {
  getInfo: () => FontInfo;
};

// SAFETY: every `@remotion/google-fonts/<Family>` module ships a `loadFont`
// whose per-family literal `weights`/`style` parameters only narrow, never
// change, this shape; callers validate each weight against
// `getInfo().fonts.normal` before passing it (font-picker.tsx,
// services/fonts.ts), so the widened signature can't receive an unsupported
// weight at runtime.
// oxlint-disable-next-line typescript/consistent-type-assertions
const asLoadedFont = (mod: FontFamilyModule) => mod as LoadedFont;

type FontEntry = {
  family: string;
  load: () => Promise<LoadedFont>;
  fontKey: string;
};

export const fontsList: FontEntry[] = [
  {
    family: "Abel",
    load: () => import("@remotion/google-fonts/Abel").then(asLoadedFont),
    fontKey: "Abel",
  },
  {
    family: "Anton",
    load: () => import("@remotion/google-fonts/Anton").then(asLoadedFont),
    fontKey: "Anton",
  },
  {
    family: "Archivo",
    load: () => import("@remotion/google-fonts/Archivo").then(asLoadedFont),
    fontKey: "Archivo",
  },
  {
    family: "Arimo",
    load: () => import("@remotion/google-fonts/Arimo").then(asLoadedFont),
    fontKey: "Arimo",
  },
  {
    family: "Arvo",
    load: () => import("@remotion/google-fonts/Arvo").then(asLoadedFont),
    fontKey: "Arvo",
  },
  {
    family: "Asap",
    load: () => import("@remotion/google-fonts/Asap").then(asLoadedFont),
    fontKey: "Asap",
  },
  {
    family: "Assistant",
    load: () => import("@remotion/google-fonts/Assistant").then(asLoadedFont),
    fontKey: "Assistant",
  },
  {
    family: "Barlow",
    load: () => import("@remotion/google-fonts/Barlow").then(asLoadedFont),
    fontKey: "Barlow",
  },
  {
    family: "Barlow Condensed",
    load: () => import("@remotion/google-fonts/BarlowCondensed").then(asLoadedFont),
    fontKey: "BarlowCondensed",
  },
  {
    family: "Barlow Semi Condensed",
    load: () => import("@remotion/google-fonts/BarlowSemiCondensed").then(asLoadedFont),
    fontKey: "BarlowSemiCondensed",
  },
  {
    family: "Bebas Neue",
    load: () => import("@remotion/google-fonts/BebasNeue").then(asLoadedFont),
    fontKey: "BebasNeue",
  },
  {
    family: "Bitter",
    load: () => import("@remotion/google-fonts/Bitter").then(asLoadedFont),
    fontKey: "Bitter",
  },
  {
    family: "Cabin",
    load: () => import("@remotion/google-fonts/Cabin").then(asLoadedFont),
    fontKey: "Cabin",
  },
  {
    family: "Cairo",
    load: () => import("@remotion/google-fonts/Cairo").then(asLoadedFont),
    fontKey: "Cairo",
  },
  {
    family: "Caveat",
    load: () => import("@remotion/google-fonts/Caveat").then(asLoadedFont),
    fontKey: "Caveat",
  },
  {
    family: "Chakra Petch",
    load: () => import("@remotion/google-fonts/ChakraPetch").then(asLoadedFont),
    fontKey: "ChakraPetch",
  },
  {
    family: "Comfortaa",
    load: () => import("@remotion/google-fonts/Comfortaa").then(asLoadedFont),
    fontKey: "Comfortaa",
  },
  {
    family: "Cormorant Garamond",
    load: () => import("@remotion/google-fonts/CormorantGaramond").then(asLoadedFont),
    fontKey: "CormorantGaramond",
  },
  {
    family: "Crimson Text",
    load: () => import("@remotion/google-fonts/CrimsonText").then(asLoadedFont),
    fontKey: "CrimsonText",
  },
  {
    family: "DM Sans",
    load: () => import("@remotion/google-fonts/DMSans").then(asLoadedFont),
    fontKey: "DMSans",
  },
  {
    family: "Dancing Script",
    load: () => import("@remotion/google-fonts/DancingScript").then(asLoadedFont),
    fontKey: "DancingScript",
  },
  {
    family: "Dosis",
    load: () => import("@remotion/google-fonts/Dosis").then(asLoadedFont),
    fontKey: "Dosis",
  },
  {
    family: "EB Garamond",
    load: () => import("@remotion/google-fonts/EBGaramond").then(asLoadedFont),
    fontKey: "EBGaramond",
  },
  {
    family: "Exo 2",
    load: () => import("@remotion/google-fonts/Exo2").then(asLoadedFont),
    fontKey: "Exo2",
  },
  {
    family: "Figtree",
    load: () => import("@remotion/google-fonts/Figtree").then(asLoadedFont),
    fontKey: "Figtree",
  },
  {
    family: "Fira Sans",
    load: () => import("@remotion/google-fonts/FiraSans").then(asLoadedFont),
    fontKey: "FiraSans",
  },
  {
    family: "Fira Sans Condensed",
    load: () => import("@remotion/google-fonts/FiraSansCondensed").then(asLoadedFont),
    fontKey: "FiraSansCondensed",
  },
  {
    family: "Fjalla One",
    load: () => import("@remotion/google-fonts/FjallaOne").then(asLoadedFont),
    fontKey: "FjallaOne",
  },
  {
    family: "Heebo",
    load: () => import("@remotion/google-fonts/Heebo").then(asLoadedFont),
    fontKey: "Heebo",
  },
  {
    family: "Hind",
    load: () => import("@remotion/google-fonts/Hind").then(asLoadedFont),
    fontKey: "Hind",
  },
  {
    family: "Hind Siliguri",
    load: () => import("@remotion/google-fonts/HindSiliguri").then(asLoadedFont),
    fontKey: "HindSiliguri",
  },
  {
    family: "IBM Plex Mono",
    load: () => import("@remotion/google-fonts/IBMPlexMono").then(asLoadedFont),
    fontKey: "IBMPlexMono",
  },
  {
    family: "IBM Plex Sans",
    load: () => import("@remotion/google-fonts/IBMPlexSans").then(asLoadedFont),
    fontKey: "IBMPlexSans",
  },
  {
    family: "Inconsolata",
    load: () => import("@remotion/google-fonts/Inconsolata").then(asLoadedFont),
    fontKey: "Inconsolata",
  },
  {
    family: "Inter",
    load: () => import("@remotion/google-fonts/Inter").then(asLoadedFont),
    fontKey: "Inter",
  },
  {
    family: "Josefin Sans",
    load: () => import("@remotion/google-fonts/JosefinSans").then(asLoadedFont),
    fontKey: "JosefinSans",
  },
  {
    family: "Jost",
    load: () => import("@remotion/google-fonts/Jost").then(asLoadedFont),
    fontKey: "Jost",
  },
  {
    family: "Kanit",
    load: () => import("@remotion/google-fonts/Kanit").then(asLoadedFont),
    fontKey: "Kanit",
  },
  {
    family: "Karla",
    load: () => import("@remotion/google-fonts/Karla").then(asLoadedFont),
    fontKey: "Karla",
  },
  {
    family: "Lato",
    load: () => import("@remotion/google-fonts/Lato").then(asLoadedFont),
    fontKey: "Lato",
  },
  {
    family: "Lexend",
    load: () => import("@remotion/google-fonts/Lexend").then(asLoadedFont),
    fontKey: "Lexend",
  },
  {
    family: "Libre Baskerville",
    load: () => import("@remotion/google-fonts/LibreBaskerville").then(asLoadedFont),
    fontKey: "LibreBaskerville",
  },
  {
    family: "Libre Franklin",
    load: () => import("@remotion/google-fonts/LibreFranklin").then(asLoadedFont),
    fontKey: "LibreFranklin",
  },
  {
    family: "Lobster",
    load: () => import("@remotion/google-fonts/Lobster").then(asLoadedFont),
    fontKey: "Lobster",
  },
  {
    family: "Lora",
    load: () => import("@remotion/google-fonts/Lora").then(asLoadedFont),
    fontKey: "Lora",
  },
  {
    family: "M PLUS Rounded 1c",
    load: () => import("@remotion/google-fonts/MPLUSRounded1c").then(asLoadedFont),
    fontKey: "MPLUSRounded1c",
  },
  {
    family: "Manrope",
    load: () => import("@remotion/google-fonts/Manrope").then(asLoadedFont),
    fontKey: "Manrope",
  },
  {
    family: "Maven Pro",
    load: () => import("@remotion/google-fonts/MavenPro").then(asLoadedFont),
    fontKey: "MavenPro",
  },
  {
    family: "Merriweather",
    load: () => import("@remotion/google-fonts/Merriweather").then(asLoadedFont),
    fontKey: "Merriweather",
  },
  {
    family: "Montserrat",
    load: () => import("@remotion/google-fonts/Montserrat").then(asLoadedFont),
    fontKey: "Montserrat",
  },
  {
    family: "Mukta",
    load: () => import("@remotion/google-fonts/Mukta").then(asLoadedFont),
    fontKey: "Mukta",
  },
  {
    family: "Mulish",
    load: () => import("@remotion/google-fonts/Mulish").then(asLoadedFont),
    fontKey: "Mulish",
  },
  {
    family: "Nanum Gothic",
    load: () => import("@remotion/google-fonts/NanumGothic").then(asLoadedFont),
    fontKey: "NanumGothic",
  },
  {
    family: "Noto Color Emoji",
    load: () => import("@remotion/google-fonts/NotoColorEmoji").then(asLoadedFont),
    fontKey: "NotoColorEmoji",
  },
  {
    family: "Noto Sans",
    load: () => import("@remotion/google-fonts/NotoSans").then(asLoadedFont),
    fontKey: "NotoSans",
  },
  {
    family: "Noto Sans Arabic",
    load: () => import("@remotion/google-fonts/NotoSansArabic").then(asLoadedFont),
    fontKey: "NotoSansArabic",
  },
  {
    family: "Noto Sans HK",
    load: () => import("@remotion/google-fonts/NotoSansHK").then(asLoadedFont),
    fontKey: "NotoSansHK",
  },
  {
    family: "Noto Sans JP",
    load: () => import("@remotion/google-fonts/NotoSansJP").then(asLoadedFont),
    fontKey: "NotoSansJP",
  },
  {
    family: "Noto Sans KR",
    load: () => import("@remotion/google-fonts/NotoSansKR").then(asLoadedFont),
    fontKey: "NotoSansKR",
  },
  {
    family: "Noto Sans SC",
    load: () => import("@remotion/google-fonts/NotoSansSC").then(asLoadedFont),
    fontKey: "NotoSansSC",
  },
  {
    family: "Noto Sans TC",
    load: () => import("@remotion/google-fonts/NotoSansTC").then(asLoadedFont),
    fontKey: "NotoSansTC",
  },
  {
    family: "Noto Serif",
    load: () => import("@remotion/google-fonts/NotoSerif").then(asLoadedFont),
    fontKey: "NotoSerif",
  },
  {
    family: "Noto Serif JP",
    load: () => import("@remotion/google-fonts/NotoSerifJP").then(asLoadedFont),
    fontKey: "NotoSerifJP",
  },
  {
    family: "Nunito",
    load: () => import("@remotion/google-fonts/Nunito").then(asLoadedFont),
    fontKey: "Nunito",
  },
  {
    family: "Nunito Sans",
    load: () => import("@remotion/google-fonts/NunitoSans").then(asLoadedFont),
    fontKey: "NunitoSans",
  },
  {
    family: "Open Sans",
    load: () => import("@remotion/google-fonts/OpenSans").then(asLoadedFont),
    fontKey: "OpenSans",
  },
  {
    family: "Oswald",
    load: () => import("@remotion/google-fonts/Oswald").then(asLoadedFont),
    fontKey: "Oswald",
  },
  {
    family: "Outfit",
    load: () => import("@remotion/google-fonts/Outfit").then(asLoadedFont),
    fontKey: "Outfit",
  },
  {
    family: "Overpass",
    load: () => import("@remotion/google-fonts/Overpass").then(asLoadedFont),
    fontKey: "Overpass",
  },
  {
    family: "Oxygen",
    load: () => import("@remotion/google-fonts/Oxygen").then(asLoadedFont),
    fontKey: "Oxygen",
  },
  {
    family: "PT Sans",
    load: () => import("@remotion/google-fonts/PTSans").then(asLoadedFont),
    fontKey: "PTSans",
  },
  {
    family: "PT Sans Narrow",
    load: () => import("@remotion/google-fonts/PTSansNarrow").then(asLoadedFont),
    fontKey: "PTSansNarrow",
  },
  {
    family: "PT Serif",
    load: () => import("@remotion/google-fonts/PTSerif").then(asLoadedFont),
    fontKey: "PTSerif",
  },
  {
    family: "Pacifico",
    load: () => import("@remotion/google-fonts/Pacifico").then(asLoadedFont),
    fontKey: "Pacifico",
  },
  {
    family: "Play",
    load: () => import("@remotion/google-fonts/Play").then(asLoadedFont),
    fontKey: "Play",
  },
  {
    family: "Playfair Display",
    load: () => import("@remotion/google-fonts/PlayfairDisplay").then(asLoadedFont),
    fontKey: "PlayfairDisplay",
  },
  {
    family: "Poppins",
    load: () => import("@remotion/google-fonts/Poppins").then(asLoadedFont),
    fontKey: "Poppins",
  },
  {
    family: "Prompt",
    load: () => import("@remotion/google-fonts/Prompt").then(asLoadedFont),
    fontKey: "Prompt",
  },
  {
    family: "Public Sans",
    load: () => import("@remotion/google-fonts/PublicSans").then(asLoadedFont),
    fontKey: "PublicSans",
  },
  {
    family: "Quicksand",
    load: () => import("@remotion/google-fonts/Quicksand").then(asLoadedFont),
    fontKey: "Quicksand",
  },
  {
    family: "Rajdhani",
    load: () => import("@remotion/google-fonts/Rajdhani").then(asLoadedFont),
    fontKey: "Rajdhani",
  },
  {
    family: "Raleway",
    load: () => import("@remotion/google-fonts/Raleway").then(asLoadedFont),
    fontKey: "Raleway",
  },
  {
    family: "Red Hat Display",
    load: () => import("@remotion/google-fonts/RedHatDisplay").then(asLoadedFont),
    fontKey: "RedHatDisplay",
  },
  {
    family: "Roboto",
    load: () => import("@remotion/google-fonts/Roboto").then(asLoadedFont),
    fontKey: "Roboto",
  },
  {
    family: "Roboto Condensed",
    load: () => import("@remotion/google-fonts/RobotoCondensed").then(asLoadedFont),
    fontKey: "RobotoCondensed",
  },
  {
    family: "Roboto Mono",
    load: () => import("@remotion/google-fonts/RobotoMono").then(asLoadedFont),
    fontKey: "RobotoMono",
  },
  {
    family: "Roboto Slab",
    load: () => import("@remotion/google-fonts/RobotoSlab").then(asLoadedFont),
    fontKey: "RobotoSlab",
  },
  {
    family: "Rubik",
    load: () => import("@remotion/google-fonts/Rubik").then(asLoadedFont),
    fontKey: "Rubik",
  },
  {
    family: "Shadows Into Light",
    load: () => import("@remotion/google-fonts/ShadowsIntoLight").then(asLoadedFont),
    fontKey: "ShadowsIntoLight",
  },
  {
    family: "Signika Negative",
    load: () => import("@remotion/google-fonts/SignikaNegative").then(asLoadedFont),
    fontKey: "SignikaNegative",
  },
  {
    family: "Slabo 27px",
    load: () => import("@remotion/google-fonts/Slabo27px").then(asLoadedFont),
    fontKey: "Slabo27px",
  },
  {
    family: "Source Code Pro",
    load: () => import("@remotion/google-fonts/SourceCodePro").then(asLoadedFont),
    fontKey: "SourceCodePro",
  },
  {
    family: "Source Sans 3",
    load: () => import("@remotion/google-fonts/SourceSans3").then(asLoadedFont),
    fontKey: "SourceSans3",
  },
  {
    family: "Space Grotesk",
    load: () => import("@remotion/google-fonts/SpaceGrotesk").then(asLoadedFont),
    fontKey: "SpaceGrotesk",
  },
  {
    family: "Teko",
    load: () => import("@remotion/google-fonts/Teko").then(asLoadedFont),
    fontKey: "Teko",
  },
  {
    family: "Titillium Web",
    load: () => import("@remotion/google-fonts/TitilliumWeb").then(asLoadedFont),
    fontKey: "TitilliumWeb",
  },
  {
    family: "Ubuntu",
    load: () => import("@remotion/google-fonts/Ubuntu").then(asLoadedFont),
    fontKey: "Ubuntu",
  },
  {
    family: "Varela Round",
    load: () => import("@remotion/google-fonts/VarelaRound").then(asLoadedFont),
    fontKey: "VarelaRound",
  },
  {
    family: "Work Sans",
    load: () => import("@remotion/google-fonts/WorkSans").then(asLoadedFont),
    fontKey: "WorkSans",
  },
  {
    family: "Zilla Slab",
    load: () => import("@remotion/google-fonts/ZillaSlab").then(asLoadedFont),
    fontKey: "ZillaSlab",
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
