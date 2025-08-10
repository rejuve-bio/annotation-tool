import { Form } from "@remix-run/react";
import alert from "/alert.svg";

export default function () {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="m-auto w-1/2">
        <div className="flex flex-col items-center px-12">
          <img src={alert} className="mb-8 block h-72 dark:invert-[0.95]" />
          <h2 className="mb-2 text-3xl font-bold text-foreground/70">
            Something went wrong.
          </h2>
          <p className="mb-4 text-center text-foreground/50">
            An error occured while trying to process your request. Please try
            these steps:
          </p>
          <ol className="list-decimal text-foreground/50">
            <li>Reload the page</li>
            <li>Check your internet connection</li>
            <li>Make sure your server is up and running</li>
            <li>
              If you are self-hosting, make sure your environment variables are
              setup properly and pointing to correct ports.
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
