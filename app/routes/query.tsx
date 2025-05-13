import { ReactFlowProvider } from "@xyflow/react";
import { QueryBuilder } from "@yisehak-awm/query-builder";
import { useRunQuery } from "./annotations";
import { useNavigate } from "@remix-run/react";

export default function () {
  const navigate = useNavigate();
  const { runQuery, busy } = useRunQuery();

  return (
    <ReactFlowProvider>
      <QueryBuilder
        nodes={[]}
        edges={[]}
        busy={busy}
        onSubmit={async (query) => {
          const id = await runQuery(query);
          navigate(`/annotation/${id}`);
        }}
      />
    </ReactFlowProvider>
  );
}
