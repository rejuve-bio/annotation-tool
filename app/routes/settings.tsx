import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { Link, useLoaderData, useRevalidator } from "@remix-run/react";
import {
  CheckCircle2,
  ChevronsLeftRightEllipsis,
  Circle,
  CircleDot,
  CloudUpload,
  Plus,
} from "lucide-react";
import { Button } from "~/components/ui/button";
import { SummaryData } from "./_index";
import { loaderAPI } from "~/api";
import Graph from "~/components/graph";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { toast } from "sonner";

const headers = {
  Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczOTc4MzkzOCwianRpIjoiZGRkY2ZlNWQtMGE3NC00OTQwLWIxMDMtMjk0ODVkOGJiNzY3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzM5NzgzOTM4LCJjc3JmIjoiYjAzMDRmOWItOGIxMS00YWZjLTg5YzgtNTlkM2RkYmUyODk3IiwiZXhwIjoxNzQ4NzgzOTM4LCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.S5ZMP6HK1fet3N23CzzPJ-ebPODMdbjRGeQAOEaxr84`,
};

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const data: { selected_job_id: string; history: SummaryData[] } = (
    await loaderAPI.get("api/history", { headers })
  ).data;
  return data;
};

export default function Settings() {
  const data: { selected_job_id: string; history: SummaryData[] } =
    useLoaderData<typeof loader>();
  const [currentJobId, setCurrentJobId] = useState(data.selected_job_id);

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
    toast.promise(
      loaderAPI.post(
        "api/select-job",
        { job_id },
        {
          headers,
        }
      ),
      {
        loading: "Switching atomspace, please wait ...",
        success: (data) => {
          setCurrentJobId(job_id);
          return `New atomspace selected.`;
        },
        error: "Could not switch atomspace, please try again.",
      }
    );
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
        <div className="grid grid-cols-3 gap-4">
          {data.history.map((a) => (
            <div
              className={`relative border rounded-lg hover:border-foreground hover:cursor-pointer ${
                a.job_id == currentJobId &&
                " border-2 border-green-500 bg-green-500/5"
              }`}
              onClick={() => switchAtomspace(a.job_id)}
            >
              <div className="h-[200px] mb-2">
                <Graph
                  elements={a.schema}
                  colorMapping={colorMapping(a.schema)}
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
                    {a.node_count} nodes
                  </p>
                  <p className="flex items-center">
                    <ChevronsLeftRightEllipsis className="inline me-2" />
                    {a.edge_count} edges
                  </p>
                </div>
                <p className="text-muted-foreground ">
                  Created {dayjs(a.imported_on).fromNow()}
                </p>
              </div>
              {a.job_id == currentJobId && (
                <CheckCircle2
                  size={32}
                  className="absolute bottom-2 right-2 fill-green-500 stroke-background"
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
