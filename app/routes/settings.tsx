import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import {
  CheckCircle2,
  ChevronsLeftRightEllipsis,
  CircleDot,
} from "lucide-react";
import { SummaryData } from "./_index";
import { loaderAPI } from "~/api";
import Graph from "~/components/graph";
import { useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";
import type { ColumnDef, Table as TableType } from "@tanstack/react-table";
import {
  MinimalDataTablePagination,
  useDataTable,
} from "~/components/data-table";

export const loader: LoaderFunction = async () => {
  const data: { selected_job_id: string; history: SummaryData[] } = (
    await loaderAPI.get("api/history", {})
  ).data;
  return data;
};

export default function Settings() {
  const data: { selected_job_id: string; history: SummaryData[] } =
    useLoaderData<typeof loader>();
  const [currentJobId, setCurrentJobId] = useState(data.selected_job_id);

  const columns: ColumnDef<SummaryData>[] = [
    {
      id: "job_id",
      accessorKey: "job_id",
    },
    {
      id: "node_count",
      accessorKey: "node_count",
    },
    {
      id: "edge_count",
      accessorKey: "edge_count",
    },
    {
      id: "imported_on",
      accessorKey: "imported_on",
    },
    {
      id: "schema",
      accessorKey: "schema",
    },
    {
      id: "selected",
      accessorFn: (row) => (row.job_id === data.selected_job_id ? 2 : 1),
    },
  ];

  const table: TableType<SummaryData> = useDataTable(columns, data.history, {
    sorting: [
      {
        id: "selected",
        desc: true,
      },
    ],
    pagination: {
      pageSize: 3,
    },
  });

  function colorMapping(graph: SummaryData["schema"]) {
    if (!graph.nodes) return;
    const uniqueNodeTypes = new Set(
      graph.nodes.map((n) => n.data.id as string)
    );
    const map = [
      "#EF4444",
      "#22C55E",
      "#F97316",
      "#3B82F6",
      "#EAB308",
      "#8B5CF6",
      "#84CC16",
      "#EC4899",
      "#14B8A6",
      "#6366F1",
      "#06B6D4",
      "#F472B6",
      "#0EA5E9",
      "#A855F7",
      "#6B7280",
    ];
    return [...uniqueNodeTypes].reduce(
      (a, c, i) => ({ ...a, [c]: map[i % map.length] }),
      {}
    );
  }

  async function switchAtomspace(job_id: string) {
    toast.promise(loaderAPI.post("api/select-job", { job_id }, {}), {
      loading: "Switching atomspace, please wait ...",
      success: () => {
        setCurrentJobId(job_id);
        return `New atomspace selected.`;
      },
      error: "Could not switch atomspace, please try again.",
    });
  }

  return (
    <div className="py-4 px-12">
      <div className="flex justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold">Settings</h1>
        </div>
        <div className="grid gap-2 grid-flow-col"></div>
      </div>
      <div>
        <h2 className="font-bold">Current atomspace:</h2>
        <p className="text-muted-foreground mb-4">
          Select the atomspace you want to run annotation queries on
        </p>
        <div className="grid grid-cols-3 gap-4 mb-2">
          {table.getRowModel().rows?.length
            ? table.getRowModel().rows.map((row) => (
                <div
                  className={`relative border rounded-lg hover:border-foreground hover:cursor-pointer ${
                    row.getValue("job_id") == currentJobId &&
                    " border-2 border-green-500 bg-green-500/5"
                  }`}
                  onClick={() => switchAtomspace(row.getValue("job_id"))}
                >
                  <div className="h-[200px] mb-2">
                    <Graph
                      elements={row.getValue("schema")}
                      colorMapping={colorMapping(row.getValue("schema"))}
                      hideControls={true}
                      layout={{
                        name: "dagre",
                        nodeDimensionsIncludeLabels: true,
                        rankSep: 20,
                        edgeSep: 0,
                        rankDir: "LR",
                      }}
                    ></Graph>
                  </div>
                  <div className="p-4">
                    <div className="flex gap-6 mb-2">
                      <p className="flex items-center">
                        <CircleDot size={16} className="inline me-2" />
                        {(
                          row.getValue("node_count") as number
                        ).toLocaleString()}{" "}
                        nodes
                      </p>
                      <p className="flex items-center">
                        <ChevronsLeftRightEllipsis className="inline me-2" />
                        {(
                          row.getValue("edge_count") as number
                        ).toLocaleString()}{" "}
                        edges
                      </p>
                    </div>
                    <p className="text-muted-foreground ">
                      Created {dayjs(row.getValue("imported_on")).fromNow()}
                    </p>
                  </div>
                  {row.getValue("job_id") == currentJobId && (
                    <CheckCircle2
                      size={32}
                      className="absolute bottom-2 right-2 fill-green-500 stroke-background"
                    />
                  )}
                </div>
              ))
            : "No atomspaces to choose from."}
        </div>
        <MinimalDataTablePagination table={table} />
      </div>
    </div>
  );
}
