import { ActionFunctionArgs, redirect } from "@remix-run/node";
import { annotationAPI } from "~/api";

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);
  const headers = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczOTc4MzkzOCwianRpIjoiZGRkY2ZlNWQtMGE3NC00OTQwLWIxMDMtMjk0ODVkOGJiNzY3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzM5NzgzOTM4LCJjc3JmIjoiYjAzMDRmOWItOGIxMS00YWZjLTg5YzgtNTlkM2RkYmUyODk3IiwiZXhwIjoxNzQ4NzgzOTM4LCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.S5ZMP6HK1fet3N23CzzPJ-ebPODMdbjRGeQAOEaxr84`,
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
