import { LoaderFunction, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";
import dayjs from "dayjs";
import { annotationAPI } from "~/api";
import { ClientOnly } from "remix-utils/client-only";
import Bar from "~/components/bar.client";
import Chord from "~/components/chord.client";
import Graph from "~/components/graph";
import { useMemo } from "react";
import { Theme, useTheme } from "remix-themes";

interface SummaryData {
  node_count: number;
  edge_count: number;
  dataset_count: number;
  data_size: string;
  top_entities: {
    count: number;
    name: string;
  }[];
  top_connections: {
    count: number;
    name: string;
  }[];
  frequent_relationships: {
    count: number;
    entities: [string, string];
  }[];
  schema: {
    nodes: { data: { id?: string; name: string; properties: string[] } }[];
    edges: {
      data: { source: string; target: string; possible_connections: string[] };
    }[];
  };
}

export const loader: LoaderFunction = async ({
  request,
}: LoaderFunctionArgs) => {
  const headers = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczOTc4MzkzOCwianRpIjoiZGRkY2ZlNWQtMGE3NC00OTQwLWIxMDMtMjk0ODVkOGJiNzY3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzM5NzgzOTM4LCJjc3JmIjoiYjAzMDRmOWItOGIxMS00YWZjLTg5YzgtNTlkM2RkYmUyODk3IiwiZXhwIjoxNzQ4NzgzOTM4LCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.S5ZMP6HK1fet3N23CzzPJ-ebPODMdbjRGeQAOEaxr84`,
  };
  const data: SummaryData = (await annotationAPI.get("kg-info", { headers }))
    .data;
  data.top_entities = data.top_entities
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  data.top_connections = data.top_connections
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
  return data;
};

export default function () {
  const [theme] = useTheme();
  const data: SummaryData = useLoaderData<typeof loader>();

  const colorMapping = useMemo(() => {
    if (!data.schema.nodes) return;
    console.log("data", data.schema.nodes[0]);
    const uniqueNodeTypes = new Set(
      data.schema.nodes.map((n) => n.data.id as string)
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
  }, [data]);

  return (
    <div className="px-12 py-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">Atomspace statistics</h1>
        <p className="text-muted-foreground">Last updated: few seconds ago</p>
      </div>
      <div className="grid grid-cols-3 gap-6 mb-6">
        <div className="border border-dashed rounded-lg p-4">
          <h2 className="font-bold mb-4">Top entities</h2>
          <p className="text-2xl font-bold">72,801,737</p>
          <p className="mb-6 text-foreground/40">Total number of entities</p>
          <ClientOnly fallback={"Loading ..."}>
            {() => (
              <Bar
                data={data.top_entities.map((e) => e.count)}
                categories={data.top_entities.map((e) => e.name)}
              />
            )}
          </ClientOnly>
        </div>
        <div className="border border-dashed rounded-lg p-4">
          <h2 className="font-bold mb-4">Top connections</h2>
          <p className="text-2xl font-bold">109,945,245</p>
          <p className="mb-6 text-foreground/40">Total number of connections</p>
          <ClientOnly fallback={"Loading ..."}>
            {() => (
              <Bar
                data={data.top_connections.map((e) => e.count)}
                categories={data.top_connections.map((e) => e.name)}
              />
            )}
          </ClientOnly>
        </div>
        <div className=" rounded-lg border border-dashed p-4">
          <h2 className="font-bold mb-6">Interconnection between entities</h2>
          <ClientOnly fallback={"Loading ..."}>
            {() => (
              <Chord
                data={data.frequent_relationships.map((r) => [
                  ...r.entities,
                  r.count,
                ])}
              />
            )}
          </ClientOnly>
        </div>
      </div>
      <div className="p-4 border border-dashed rounded-lg w-full relative">
        <h2 className="font-bold">Atomspace schema</h2>
        <p className="text-foreground/40">
          Click on nodes and edges to see more information
        </p>
        <div className="h-[600px] ">
          <Graph
            elements={data.schema}
            colorMapping={colorMapping}
            NodePopup={NodeProperties}
            layout={{
              name: "dagre",
              nodeDimensionsIncludeLabels: true,
              rankSep: 0,
              edgeSep: 0,
              rankDir: "LR",
            }}
          ></Graph>
        </div>
      </div>
    </div>
  );
}

const NodeProperties = ({
  popupRef,
  selectedNode,
}: {
  popupRef: React.RefObject<HTMLDivElement>;
  selectedNode: any;
}) => {
  const data = selectedNode?.data();
  if (!data) return <></>;
  if (data.possible_connections?.length)
    return (
      <div
        ref={popupRef}
        className="absolute z-50 rounded-md bg-primary p-2 text-background/65"
      >
        <h5 className="mb-2 font-mono text-xs">
          {data.source} to {data.target} connections
        </h5>
        <ul className="ms-8">
          {data.possible_connections.map((p: string) => (
            <li className="list-outside list-disc font-mono text-xs">{p}</li>
          ))}
        </ul>
      </div>
    );

  if (data.properties?.length)
    return (
      <div
        ref={popupRef}
        className="absolute z-50 rounded-md bg-primary p-2 text-background/65"
      >
        <h5 className="mb-2 font-mono text-xs">Properties of {data.id}</h5>

        <ul className="ms-8">
          {data.properties.map((p: string) => (
            <li className="list-outside list-disc font-mono text-xs">{p}</li>
          ))}
        </ul>
      </div>
    );

  return <div ref={popupRef}></div>;
};
