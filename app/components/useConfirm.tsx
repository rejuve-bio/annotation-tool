import { toast } from "sonner";
import { Button } from "./ui/button";
import type { ReactNode } from "react";

interface ConfirmationDialogProps {
  promise: () => Promise<any>;
  prompt: ReactNode;
  action: string;
  variant?: "destructive" | "default";
  title?: ReactNode;
  loading?: ReactNode;
  success?: ReactNode;
  error?: ReactNode;
}

function useConfirm(props: ConfirmationDialogProps) {
  return () => {
    const id = toast(
      <div>
        <p className="mb-2 text-sm font-bold">
          {props.title || "Are you sure?"}
        </p>
        <p className="text-muted-foreground mb-4 text-sm">{props.prompt}</p>
        <Button
          variant={props.variant || "destructive"}
          size="sm"
          onClick={() => {
            toast.promise(props.promise(), {
              loading: props.loading || "Please wait ...",
              success: props.success,
              error: props.error,
              position: "top-right",
            });
            toast.dismiss(id);
          }}
        >
          {props.action}
        </Button>
      </div>,
      {
        position: "top-right",
        closeButton: true,
      }
    );
  };
}

export default useConfirm;
