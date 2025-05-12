import { type MetaFunction } from "@remix-run/node";
import { useNavigate } from "@remix-run/react";
import {
  Context,
  CSVuploader,
  DataSource,
  DatasourceList,
  EntityData,
  RelationData,
  Schema,
  SchemaBuilder,
} from "@yisehak-awm/schema-builder";
import { Play } from "lucide-react";
import { useContext, useState } from "react";
import { toast } from "sonner";
import { annotationAPI, loaderAPI } from "~/api";
import { Button } from "~/components/ui/button";

interface Config {
  vertices: {
    label: string;
    input: {
      type: string;
      path: string;
      format: "CSV";
    };
    null_values: string[];
    id: string;
  }[];
  edges: {
    label: string;
    source: [string];
    target: [string];
    input: {
      type: string;
      path: string;
      format: string;
    };
  }[];
}

interface OutputSchema {
  property_keys: { name: string; type: string }[];
  vertex_labels: {
    name: string;
    properties: string[];
    nullable_keys: string[];
    id_strategy: "customize_string";
  }[];
  edge_labels: {
    name: string;
    source_label: string;
    target_label: string;
    properties: string[];
  }[];
}

export const meta: MetaFunction = () => {
  return [
    { title: "Annotation tool" },
    { name: "description", content: "Annotation tool" },
  ];
};

function Tool() {
  const { dataSources, setDataSources, isValid, schema } = useContext(Context);
  const [busy, setBusy] = useState(false);
  const navigate = useNavigate();

  function removeSource(id: string) {
    setDataSources((ss: DataSource[]) => ss.filter((s) => s.id !== id));
  }

  async function runImport() {
    if (!schema?.nodes) throw "Invalid schema";

    const vertices: Config["vertices"] = [];
    const edges: Config["edges"] = [];
    const property_keys: OutputSchema["property_keys"] = [];
    const vertex_labels: OutputSchema["vertex_labels"] = [];
    const edge_labels: OutputSchema["edge_labels"] = [];

    schema.nodes.map((n) => {
      const data = n.data as EntityData;
      const entityProps = Object.values(data.properties).filter(
        (p) => p.checked
      );

      entityProps.map((p) => {
        property_keys.push({ name: p.col, type: p.type });
      });

      vertices.push({
        label: data.name!,
        input: {
          type: "file",
          path: dataSources.find((d) => d.id == data.table)?.file.name!,
          format: "CSV",
          // header: entityProps.map((e) => e.col),
          // charset: "UTF-8",
          // skipped_line: {
          //   regex: "(^#|^//).*",
          // },
        },
        id: data.properties[data.primaryKey!].col,
        null_values: ["NULL", "null", ""],
      });

      vertex_labels.push({
        name: data.name!,
        properties: entityProps.map((p) => p.col),
        nullable_keys: [],
        id_strategy: "customize_string",
      });
    });

    schema.edges.map((e) => {
      const data = e.data as RelationData;
      const connections = Object.values(data);

      connections.map((c) => {
        const sourceEntity = schema.nodes.find((n) =>
          c.reversed ? n.id == e.target : n.id == e.source
        )?.data as EntityData;

        const targetEntity = schema.nodes.find((n) =>
          c.reversed ? n.id == e.source : n.id == e.target
        )?.data as EntityData;

        const relationProps = Object.values(c.properties).filter(
          (p) => p.checked
        );

        relationProps.map((p) => {
          property_keys.push({ name: p.col, type: p.type });
        });

        edges.push({
          label: c.name!,
          source: [c.source!],
          target: [c.target!],
          input: {
            type: "file",
            path: dataSources.find((d) => d.id == c.table)?.file.name!,
            format: "CSV",
          },
        });

        edge_labels.push({
          name: c.name!,
          source_label: sourceEntity.name as string,
          target_label: targetEntity.name as string,
          properties: Object.values(c.properties)
            .filter((p) => p.checked)
            .map((p) => p.col),
        });
      });
    });

    const config: Config = { vertices, edges };
    const outputSchema: OutputSchema = {
      vertex_labels,
      edge_labels,
      property_keys,
    };

    const formData = new FormData();
    for (const source of dataSources) {
      formData.append("files", source.file);
    }
    formData.append("config", JSON.stringify(config));
    formData.append("schema_json", JSON.stringify(outputSchema));

    try {
      setBusy(true);
      await loaderAPI.post("api/load", formData, {});
      toast.success("Data has been imported successfully!", {
        description: "You may now build queries and run annotations.",
      });
      navigate("/");
    } catch (e) {
      toast.error("Could not import data", {
        description:
          "Something is wrong with the schema construction or the files could not be uploaded",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="h-full w-full flex">
      <div className="border-e  relative h-full flex flex-col pb-16">
        <div className="px-4 mt-4">
          <div className="flex items-center">
            <div>
              <h4 className="font-bold ">Data import tool</h4>
              <p className="text-muted-foreground text-sm">
                Upload .csv data source files
              </p>
            </div>
          </div>
        </div>
        <div className="p-4 my-2 flex flex-col items-center ">
          <CSVuploader />
        </div>
        <DatasourceList dataSources={dataSources} onRemove={removeSource} />
        <div className="w-full absolute bottom-0 p-4">
          <Button
            className="w-full shadow-lg"
            disabled={!isValid}
            busy={busy}
            onClick={runImport}
          >
            {!busy && <Play className="inline me-1" />} Run import
          </Button>
        </div>
      </div>
      <div className="relative w-full h-full">
        <SchemaBuilder />
      </div>
    </div>
  );
}

export default function () {
  const [dataSources, setDataSources] = useState<DataSource[]>([]);
  const [isValid, setIsValid] = useState<boolean>(false);
  const [schema, setSchema] = useState<Schema>(null);

  return (
    <Context.Provider
      value={{
        dataSources,
        setDataSources,
        isValid,
        setIsValid,
        schema,
        setSchema,
      }}
    >
      <Tool />
    </Context.Provider>
  );
}
