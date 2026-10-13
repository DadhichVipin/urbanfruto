import { media } from "@/lib/api";

export const BRAND_NAME = "Urban Fruto";

// Logo files live in R2 under site/. Bump the -vN suffix when replacing one,
// since they are served with an immutable cache header.
export const LOGO = {
  full: media("site/logo-full-v1.png"),
  mark: media("site/logo-mark-v1.png"),
  wordmark: media("site/logo-wordmark-v1.png"),
};
