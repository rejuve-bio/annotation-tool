import axios from "axios";

export const annotationAPI = axios.create({
  baseURL:
    typeof window === "undefined"
      ? process.env?.ANNOTATION_URL
      : window.ENV?.ANNOTATION_URL,
  timeout: 0,
  headers: { "X-Custom-Header": "foobar" },
});
