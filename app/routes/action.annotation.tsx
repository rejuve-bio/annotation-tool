import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { annotationAPI } from "~/api";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);
  const headers = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc0Njc3NTcwMywianRpIjoiY2FjMWZkMjMtZjEzZC00YTUyLTk2YzItZDJhMDA3YTAwZmVlIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzQ2Nzc1NzAzLCJjc3JmIjoiNjM0ZTYzN2UtNGUyMS00YjhjLTljNTktMTg4NzQ4ZGNjNTIwIiwiZXhwIjoxNzU1Nzc1NzAzLCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.47X8uwrh_kOCipOEGfdbBTYbI84CXPW_NfpatvFbJd4`,
  };

  try {
    if (_action === "delete") {
      await annotationAPI.delete(`annotation/${values.id}`, { headers }).json();
      return redirect("/");
    }
    if (_action === "bulk_delete") {
      const ids = (values.id as string).split(",");
      await annotationAPI
        .post(`annotation/delete`, {
          headers,
          json: { annotation_ids: [] },
        })
        .json();
      return redirect("/query");
    }
  } catch (e: any) {
    const redirectTo = request.headers.get("Referer") || "/";
    const session = await sessionStorage.getSession(
      request.headers.get("Cookie")
    );
    const error = { timestamp: new Date(), message: e.message };
    session.flash("error", error);
    return redirect(redirectTo, {
      headers: {
        "Set-Cookie": await sessionStorage.commitSession(session),
      },
    });
  }
}
