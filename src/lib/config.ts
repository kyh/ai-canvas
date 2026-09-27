export const siteConfig = {
  author: { name: "Kaiyu Hsu", url: "https://kyh.io" },
  creator: "@kaiyuhsu",
  description:
    "Forkable Next.js template featuring an AI design canvas — generate, edit, and compose on an infinite canvas in natural language.",
  email: "kai@kyh.io",
  name: "AI Canvas",
  repository: "https://github.com/kyh/ai-canvas",
  sameAs: ["https://github.com/kyh/ai-canvas", "https://github.com/kyh", "https://x.com/kaiyuhsu"],
  shortName: "AI Canvas",
  url: process.env.NODE_ENV === "development" ? "http://localhost:3000" : "https://canvas.kyh.io",
};
