import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://devasthalyballia.com";
  const lastModified = new Date("2025-10-17T00:00:00.000Z");

  const routes = [
    "",
    "/about",
    "/vision-mission",
    "/principals-message",
    "/academics",
    "/facilities",
    "/admissions",
    "/admissions/procedure",
    "/admissions/fees",
    "/notices",
    "/results",
    "/downloads",
    "/gallery",
    "/events",
    "/faculty",
    "/alumni",
    "/contact",
    "/privacy-policy",
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified,
    changeFrequency: route === "" || route === "/notices" ? "daily" : "weekly",
    priority: route === "" ? 1.0 : route.startsWith("/admissions") ? 0.9 : 0.7,
  }));
}
