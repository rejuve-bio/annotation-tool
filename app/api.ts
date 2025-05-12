import axios from "axios";

export const annotationAPI = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env?.ANNOTATION_URL
      : window.ENV?.ANNOTATION_URL,
  timeout: 0,
  headers: { "X-Custom-Header": "foobar" },
});

export const loaderAPI = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env?.LOADER_URL
      : window.ENV?.LOADER_URL,
  timeout: 0,
  headers: { "X-Custom-Header": "foobar" },
});
