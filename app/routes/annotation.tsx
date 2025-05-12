import type { ActionFunctionArgs, LoaderFunction } from "@remix-run/node";
import {
  Form,
  Link,
  redirect,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import type { ColumnDef, Table as TableType } from "@tanstack/react-table";
import { Icon } from "@yisehak-awm/query-builder";
import dayjs from "dayjs";
import {
  AlertTriangle,
  CloudUpload,
  EllipsisVertical,
  Plus,
  Trash,
} from "lucide-react";
import { type ReactNode, useEffect, useState } from "react";
import { annotationAPI } from "~/api";
import Progress from "~/components/progress";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import {
  DataTable,
  useDataTable,
  DataTableColumnHeader,
  DataTablePagination,
} from "~/components/data-table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { toast } from "sonner";

const Authorization = `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczOTc4MzkzOCwianRpIjoiZGRkY2ZlNWQtMGE3NC00OTQwLWIxMDMtMjk0ODVkOGJiNzY3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzM5NzgzOTM4LCJjc3JmIjoiYjAzMDRmOWItOGIxMS00YWZjLTg5YzgtNTlkM2RkYmUyODk3IiwiZXhwIjoxNzQ4NzgzOTM4LCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.S5ZMP6HK1fet3N23CzzPJ-ebPODMdbjRGeQAOEaxr84`;

export const loader: LoaderFunction = async () => {
  const headers = { Authorization };
  return (await annotationAPI.get("history", { headers })).data;
};

export default function () {
  const annotations = useLoaderData<
    typeof loader
  >() as any as AnnotationListItem[];
  const table: TableType<AnnotationListItem> = useDataTable(
    columns,
    annotations
  );

  return (
    <div className="py-4 px-12">
      <div className="flex justify-between">
        <div>
          <h1 className="text-xl font-bold">Annotations</h1>
          <p className="text-muted-foreground">
            You have {annotations.length} saved annotations.
          </p>
        </div>
        <div className="grid gap-2 grid-flow-col">
          <Link to="/import">
            <Button variant="outline">
              <CloudUpload /> Upload data sources
            </Button>
          </Link>
          <Link to="/query">
            <Button>
              <Plus /> Build a new query
            </Button>
          </Link>
        </div>
      </div>
      <div className="border rounded-lg mt-8 mb-2">
        <DataTable table={table} />
      </div>
      <DataTablePagination table={table} />
      {table.getFilteredSelectedRowModel().rows.length > 1 && (
        <div className="animate-popup fixed bottom-6 left-12 flex items-center rounded-lg border  p-12 py-2 text-background bg-foreground shadow-xl">
          <div className="flex-1 text-sm">
            {table.getFilteredSelectedRowModel().rows.length} rows selected.
          </div>
          <BulkDeleteConfirmationDialog
            annotationIDs={table
              .getFilteredSelectedRowModel()
              .rows.map((r) => r.original.annotation_id)}
          >
            <Button variant="link" className="text-destructive">
              Delete all
            </Button>
          </BulkDeleteConfirmationDialog>
        </div>
      )}
    </div>
  );
}

export const columns: ColumnDef<AnnotationListItem>[] = [
  {
    id: "select",
    header: ({ table }) => (
      <Checkbox
        checked={
          table.getIsAllPageRowsSelected() ||
          (table.getIsSomePageRowsSelected() && "indeterminate")
        }
        onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
        aria-label="Select all"
      />
    ),
    cell: ({ row }) => (
      <Checkbox
        checked={row.getIsSelected()}
        onCheckedChange={(value) => row.toggleSelected(!!value)}
        aria-label="Select row"
      />
    ),
  },
  {
    id: "title",
    accessorKey: "title",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Title" />
    ),
    cell: ({ row }) => {
      const { annotation_id, status, title } = row.original;
      return (
        <Link
          className="flex h-full items-center p-2 py-4 wrap-anywhere"
          to={`/annotation/${annotation_id}`}
        >
          {status === "PENDING" && <Progress small className="me-4" />}
          {status === "FAILED" && (
            <span className="me-2 rounded border border-destructive p-1 px-2 text-destructive">
              <AlertTriangle size={16} className="mb-[3px] me-2 inline" />
              Failed
            </span>
          )}
          <span className={status === "FAILED" ? "text-destructive" : ""}>
            {title || annotation_id}
          </span>
        </Link>
      );
    },
  },
  {
    id: "node_count",
    accessorKey: "node_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nodes" />
    ),
  },
  {
    id: "edge_count",
    accessorKey: "edge_count",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Edges" />
    ),
  },
  {
    id: "node_types",
    accessorKey: "node_types",
    header: "Node types",
    cell: ({ row }) => <QueryNodeList nodeTypes={row.getValue("node_types")} />,
  },
  {
    id: "created_at",
    accessorKey: "created_at",
    header: "Created at",
    cell: ({ row }) => (
      <span className="whitespace-nowrap">
        {dayjs(row.getValue("created_at")).fromNow()}
      </span>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => <AnnotationContextMenu annotation={row.original} />,
  },
];

function QueryNodeList(props: QueryNodeListProps) {
  return (
    <div className="flex -space-x-4">
      {props.nodeTypes.map((type, i) => (
        <div key={type} className="border-4 border-background rounded-full">
          <Icon type={type} size="small" />
        </div>
      ))}
    </div>
  );
}

export const DeleteConfirmationDialog = ({
  open,
  onOpenChange,
  annotation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  annotation: any;
}) => {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger></DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently remove the annotation{" "}
            <span className="font-bold">
              {annotation.name || annotation.id}
            </span>
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            disabled={busy}
            variant="secondary"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Form method="delete" action=".">
            <input type="hidden" name="id" value={annotation.annotation_id} />
            <Button
              name="_action"
              value="delete"
              variant="destructive"
              type="submit"
              busy={busy}
            >
              Yes, Delete
            </Button>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const BulkDeleteConfirmationDialog = ({
  annotationIDs,
  children,
}: {
  annotationIDs: string[];
  children: ReactNode;
}) => {
  const navigation = useNavigation();
  const busy = navigation.state !== "idle";

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <DialogHeader className="text-start">
          <DialogTitle>Are you sure?</DialogTitle>
          <DialogDescription>
            This will permanently remove {annotationIDs.length} annotations.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Form method="delete" action=".">
            <input type="hidden" name="id" value={annotationIDs} />
            <Button
              name="_action"
              value="bulk_delete"
              variant="destructive"
              type="submit"
              busy={busy}
            >
              Yes, Delete
            </Button>
          </Form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export const AnnotationContextMenu = ({ annotation }: { annotation: any }) => {
  const [deleteDialogOpened, toggleDeleteDialog] = useState(false);
  const [menuOpened, toggleMenuDialog] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === "loading") {
      toggleDeleteDialog(false);
    }
  }, [navigation.state]);

  return (
    <div>
      <DropdownMenu open={menuOpened} onOpenChange={toggleMenuDialog}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="">
            <EllipsisVertical size={16} />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="bottom">
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => {
              toggleMenuDialog(false);
              toggleDeleteDialog(true);
            }}
          >
            <Trash size={16} className="me-2 inline" /> Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <DeleteConfirmationDialog
        open={deleteDialogOpened}
        onOpenChange={toggleDeleteDialog}
        annotation={annotation}
      />
    </div>
  );
};

export const useRunQuery = (id?: string) => {
  const [busy, setBusy] = useState<boolean>(false);

  const runQuery = async (graph: any) => {
    setBusy(true);
    const requestJSON = {
      requests: {
        annotation_id: id,
        nodes: graph.nodes.map((n: any) => {
          return {
            node_id: "a" + n.id.replaceAll("-", ""),
            id: n.data.id || "",
            type: n.data.type,
            properties: Object.keys(n.data)
              .filter(
                (k) => !["id", "type", "animate"].includes(k) && n.data[k]
              )
              .reduce((acc, k) => ({ ...acc, [k]: n.data[k] }), {}),
          };
        }),
        predicates: graph.edges.map((e: any) => {
          return {
            predicate_id: e.id,
            type: e.data.edgeType,
            source: "a" + e.source.replaceAll("-", ""),
            target: "a" + e.target.replaceAll("-", ""),
          };
        }),
      },
    };
    const headers = {
      Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczOTc4MzkzOCwianRpIjoiZGRkY2ZlNWQtMGE3NC00OTQwLWIxMDMtMjk0ODVkOGJiNzY3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzM5NzgzOTM4LCJjc3JmIjoiYjAzMDRmOWItOGIxMS00YWZjLTg5YzgtNTlkM2RkYmUyODk3IiwiZXhwIjoxNzQ4NzgzOTM4LCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.S5ZMP6HK1fet3N23CzzPJ-ebPODMdbjRGeQAOEaxr84`,
      "content-type": "application/json",
    };
    try {
      const { annotation_id }: Annotation = (
        await annotationAPI.post("query", JSON.stringify(requestJSON), {
          headers,
        })
      ).data;
      return annotation_id;
    } catch (e: any) {
      toast(e.response.statusText);
    } finally {
      setBusy(false);
    }
  };

  return { runQuery, busy };
};

export function meta() {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export interface Annotation {
  annotation_id: string;
  title: string;
  summary: string;
  node_count: number;
  edge_count: number;
  node_count_by_label: { label: string; count: number }[];
  edge_count_by_label: { label: string; count: number }[];
  nodes: { data: { id: string; type: string; name: string } }[];
  edges: {
    data: { id: string; label: string; source: string; target: string };
  }[];
  request: AnnotationRequest;
  status: "PENDING" | "FAILED" | "COMPLETE";
}

interface AnnotationListItem {
  annotation_id: string;
  title: string;
  node_count: number;
  edge_count: number;
  node_types: string[];
  created_at: string;
  updated_at: string;
  request: AnnotationRequest;
  status: "PENDING" | "FAILED" | "COMPLETE";
}

interface AnnotationRequest {
  nodes: {
    node_id: string;
    id: string;
    type: string;
    properties: {
      [key: string]: string;
    };
  }[];
  predicates: {
    type: string;
    source: string;
    target: string;
  }[];
}

interface QueryNodeListProps {
  nodeTypes: string[];
}

export async function action({ request }: ActionFunctionArgs) {
  const formData = await request.formData();
  const { _action, ...values } = Object.fromEntries(formData);
  const headers = { Authorization };

  try {
    if (_action === "create") {
      const data: any = await annotationAPI.post("query", {}, { headers });
      return redirect(`/annotation/${data.id}/results`);
    }
    if (_action === "delete") {
      await annotationAPI.delete(`annotation/${values.id}`, { headers });
      return redirect("/");
    }
    if (_action === "bulk_delete") {
      const ids = (values.id as string).split(",");
      await annotationAPI.post(
        `annotation/delete`,
        { annotation_ids: ids },
        { headers }
      );
      return redirect("/");
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
