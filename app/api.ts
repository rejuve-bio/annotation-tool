import ky from "ky";

export const annotationAPI = ky.extend({
  timeout: false,
  prefixUrl:
    typeof window === "undefined"
      ? process.env?.ANNOTATION_URL
      : window.ENV?.ANNOTATION_URL,
});
