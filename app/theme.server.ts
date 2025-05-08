import { createCookieSessionStorage } from "@remix-run/node";
import { createThemeAction, createThemeSessionResolver } from "remix-themes";

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "_session",
    sameSite: "lax",
    path: "/",
    httpOnly: true,
    secrets: ["61381f55634a4e2eb44a93d2383da319"],
    secure:
      typeof window === "undefined" && process.env?.NODE_ENV == "production",
  },
});

export const themeSessionResolver = createThemeSessionResolver(sessionStorage);
