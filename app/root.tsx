import {
  json,
  Links,
  Meta,
  NavLink,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useNavigation,
} from "@remix-run/react";
import { CircleGauge, CloudUpload, Gem, Moon, Shapes, Sun } from "lucide-react";
import { Toaster } from "./components/ui/sonner";
import RelativeTime from "dayjs/plugin/relativeTime";
import {
  PreventFlashOnWrongTheme,
  Theme,
  ThemeProvider,
  useTheme,
} from "remix-themes";
import { themeSessionResolver } from "./theme.server";
import { LoaderFunctionArgs } from "@remix-run/node";
import dayjs from "dayjs";
import clsx from "clsx";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./components/ui/tooltip";
import {
  EdgeDefinition,
  FormFieldProps,
  generateNodeStyle,
  NodeClassDefinitionMap,
  NodeDefinition,
  NodeFormFieldsMap,
  QueryBuilderContext,
} from "@yisehak-awm/query-builder";
import { Button } from "./components/ui/button";
import { annotationAPI, loaderAPI } from "./api";
import ErrorBoundaryContent from "./components/error-boundary";
import "./style.css";

dayjs.extend(RelativeTime);

export async function loader({ request }: LoaderFunctionArgs) {
  const headers = {
    Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTczOTc4MzkzOCwianRpIjoiZGRkY2ZlNWQtMGE3NC00OTQwLWIxMDMtMjk0ODVkOGJiNzY3IiwidHlwZSI6ImFjY2VzcyIsInN1YiI6NCwibmJmIjoxNzM5NzgzOTM4LCJjc3JmIjoiYjAzMDRmOWItOGIxMS00YWZjLTg5YzgtNTlkM2RkYmUyODk3IiwiZXhwIjoxNzQ4NzgzOTM4LCJ1c2VyX2lkIjo0LCJlbWFpbCI6Inlpc2VoYWsuYXdAZ21haWwuY29tIn0.S5ZMP6HK1fet3N23CzzPJ-ebPODMdbjRGeQAOEaxr84`,
  };
  const schema = (await loaderAPI.get("api/schema", { headers })).data;
  const { getTheme } = await themeSessionResolver(request);
  const API_URL = process.env.API_URL || "";
  const ANNOTATION_URL = process.env.ANNOTATION_URL || "";
  return json({
    ENV: { API_URL, ANNOTATION_URL },
    theme: getTheme(),
    schema,
  });
}

export function LayoutContent({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useTheme();
  const data: any = useLoaderData<typeof loader>();
  const navigation = useNavigation();

  const c = ({
    isActive,
    isPending,
  }: {
    isActive: boolean;
    isPending: boolean;
  }) => {
    if (isPending)
      return "mb-2 block rounded-lg bg-background p-2 text-foreground outline";
    if (isActive)
      return "mb-2 block rounded-lg bg-foreground p-2 text-background";
    return "mb-2 block rounded-lg p-2 text-foreground/50";
  };

  return (
    <html lang="en" className={clsx(theme)}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="w-screen h-screen">
        {navigation.state === "loading" && (
          <div className="glowing navigation-indicator absolute left-0 top-0 h-1 w-4/5 bg-linear-to-r from-purple-500 to-cyan-500"></div>
        )}
        <div className="flex h-full w-full">
          <div className="p-4 bg-background border-e min-w-fit flex flex-col justify-between items-center">
            <ul>
              <li>
                <NavLink to="/" className={c}>
                  <Tooltip>
                    <TooltipTrigger className="p-0" asChild>
                      <CircleGauge size={24} />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      Dashboard
                    </TooltipContent>
                  </Tooltip>
                </NavLink>
              </li>
              <li>
                <NavLink to="/annotation" className={c}>
                  <Tooltip>
                    <TooltipTrigger className="p-0" asChild>
                      <Gem size={24} />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      Annotations
                    </TooltipContent>
                  </Tooltip>
                </NavLink>
              </li>
              <li>
                <NavLink to="/query" className={c}>
                  <Tooltip>
                    <TooltipTrigger className="p-0" asChild>
                      <Shapes size={24} />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      Query builder
                    </TooltipContent>
                  </Tooltip>
                </NavLink>
              </li>
              <li>
                <NavLink to="/import" className={c}>
                  <Tooltip>
                    <TooltipTrigger className="p-0" asChild>
                      <CloudUpload size={24} />
                    </TooltipTrigger>
                    <TooltipContent side="right" sideOffset={12}>
                      Data import
                    </TooltipContent>
                  </Tooltip>
                </NavLink>
              </li>
            </ul>
            <Button
              size="icon"
              variant="ghost"
              title="Toggle theme"
              className="mb-2 text-foreground/30"
              onClick={() =>
                setTheme((t) => (t === Theme.DARK ? Theme.LIGHT : Theme.DARK))
              }
            >
              {theme === Theme.DARK ? <Sun /> : <Moon />}
            </Button>
          </div>
          <div className="relative flex-grow overflow-y-auto">
            <QueryBuilderContext.Provider
              // value={{
              //   nodeDefinitions: data ? data.schema.nodes : [],
              //   edgeDefinitions: data ? data.schema.edges : [],
              //   style: data ? generateNodeStyle(data?.schema.nodes) : {},
              //   forms: data
              //     ? data.schema.nodes.reduce((acc: any, n: any) => {
              //         return { ...acc, [n.name]: n.inputs };
              //       }, {})
              //     : {},
              // }}
              value={{
                nodeDefinitions:
                  data?.schema?.nodes.map((n: any) => ({ ...n, id: n.name })) ||
                  [],
                edgeDefinitions: data?.schema?.edges || [],
                style: data?.schema?.nodes
                  ? generateNodeStyle(
                      data?.schema?.nodes.map((n: any) => ({
                        ...n,
                        id: n.name,
                      }))
                    )
                  : {},
                forms: data
                  ? data.schema.nodes.reduce((acc: any, n: any) => {
                      return { ...acc, [n.name]: n.inputs };
                    }, {})
                  : {},
              }}
            >
              {children}
            </QueryBuilderContext.Provider>
          </div>
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(data?.ENV)}`,
          }}
        />
        <PreventFlashOnWrongTheme ssrTheme={Boolean(theme)} />
        <ScrollRestoration />
        <Scripts />
        <Toaster position="top-center" richColors />
      </body>
    </html>
  );
}

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider specifiedTheme={Theme.LIGHT} themeAction="/action/set-theme">
      <LayoutContent>{children}</LayoutContent>
    </ThemeProvider>
  );
}

export default function App() {
  return <Outlet />;
}

enum CATEGORIES {
  coding = "Coding / Coded elements",
  variant = "Genomic variant",
  noncoding = "Non-coding elements",
  process = "Biological process",
  ontology = "Ontology term",
  threeD = "3d genome structure",
  epigenomic = "Epigenomic feature",
}

export const nodeDefinitions: NodeDefinition[] = [
  {
    id: "gene",
    name: "Gene",
    category: CATEGORIES.coding,
  },
  {
    id: "protein",
    name: "Protein",
    category: CATEGORIES.coding,
  },
  {
    id: "exon",
    name: "Exon",
    category: CATEGORIES.coding,
  },
  {
    id: "transcript",
    name: "Transcript",
    category: CATEGORIES.coding,
  },
  {
    id: "snp",
    name: "SNP",
    category: CATEGORIES.variant,
  },
  {
    id: "sv",
    name: "Structural variant",
    category: CATEGORIES.variant,
  },
  {
    id: "enhancer",
    name: "Enhancer",
    category: CATEGORIES.noncoding,
  },
  {
    id: "super_enhancer",
    name: "Super enhancer",
    category: CATEGORIES.noncoding,
  },
  {
    id: "promoter",
    name: "Promoter",
    category: CATEGORIES.noncoding,
  },
  {
    id: "non_coding_rna",
    name: "Non-coding RNA",
    category: CATEGORIES.noncoding,
  },
  {
    id: "pathway",
    name: "Pathway",
    category: CATEGORIES.process,
  },
  {
    id: "go",
    name: "GO",
    category: CATEGORIES.ontology,
  },
  {
    id: "uberon",
    name: "Uberon",
    category: CATEGORIES.ontology,
  },
  {
    id: "clo",
    name: "CLO",
    category: CATEGORIES.ontology,
  },
  {
    id: "cl",
    name: "CL",
    category: CATEGORIES.ontology,
  },
  {
    id: "efo",
    name: "EFO",
    category: CATEGORIES.ontology,
  },
  {
    id: "bto",
    name: "BTO",
    category: CATEGORIES.ontology,
  },
  {
    id: "motif",
    name: "Motif",
    category: CATEGORIES.epigenomic,
  },
  {
    id: "tfbs",
    name: "TFBS",
    category: CATEGORIES.epigenomic,
  },
  {
    id: "tad",
    name: "TAD",
    category: CATEGORIES.threeD,
  },
];

export const edgeDefinitions: EdgeDefinition[] = [
  {
    id: "1",
    source: "snp",
    label: "activity_by_contact",
    target: "gene",
  },
  {
    id: "2",
    source: "uberon",
    label: "subclass_of",
    target: "uberon",
  },
  {
    id: "3",
    source: "super_enhancer",
    label: "associated_with",
    target: "gene",
  },
  {
    id: "4",
    source: "enhancer",
    label: "associated_with",
    target: "gene",
  },
  {
    id: "5",
    source: "transcript",
    label: "transcribed_from",
    target: "gene",
  },
  {
    id: "6",
    source: "gene",
    label: "transcribed_to",
    target: "transcript",
  },
  {
    id: "7",
    source: "transcript",
    label: "translates_to",
    target: "protein",
  },
  {
    id: "8",
    source: "protein",
    label: "translation_of",
    target: "transcript",
  },
  {
    id: "9",
    source: "pathway",
    label: "child_pathway_of",
    target: "pathway",
  },
  {
    id: "10",
    source: "gene",
    label: "genes_pathways",
    target: "pathway",
  },
  {
    id: "11",
    source: "pathway",
    label: "parent_pathway_of",
    target: "pathway",
  },
  {
    id: "12",
    source: "bto",
    label: "subclass_of",
    target: "bto",
  },
  {
    id: "13",
    source: "go",
    label: "subclass_of",
    target: "go",
  },
  {
    id: "14",
    source: "efo",
    label: "subclass_of",
    target: "efo",
  },
  {
    id: "15",
    source: "clo",
    label: "subclass_of",
    target: "clo",
  },
  {
    id: "16",
    source: "cl",
    label: "part_of",
    target: "uberon",
  },
  {
    id: "17",
    source: "cl",
    label: "capable_of",
    target: "go",
  },
  {
    id: "18",
    source: "gene",
    label: "expressed_in",
    target: "cl",
  },
  {
    id: "19",
    source: "gene",
    label: "expressed_in",
    target: "uberon",
  },
  {
    id: "20",
    source: "gene",
    label: "binds_to",
    target: "tfbs",
  },
  {
    id: "21",
    source: "promoter",
    label: "associated_with",
    target: "gene",
  },
  {
    id: "22",
    source: "snp",
    label: "eqtl_association",
    target: "gene",
  },
  {
    id: "23",
    source: "snp",
    label: "closest_gene",
    target: "gene",
  },
  {
    id: "24",
    source: "gene",
    label: "regulates",
    target: "gene",
  },
  {
    id: "25",
    source: "gene",
    label: "in_tad_region",
    target: "tad",
  },
  {
    id: "26",
    source: "cl",
    label: "subclass_of",
    target: "cl",
  },
  {
    id: "27",
    source: "non_coding_rna",
    label: "belongs_to",
    target: "go",
  },
  {
    id: "28",
    source: "protein",
    label: "interacts_with",
    target: "protein",
  },
  {
    id: "29",
    source: "snp",
    label: "in_dnase_i_hotspot",
    target: "uberon",
  },
  {
    id: "30",
    source: "snp",
    label: "chromatin_state",
    target: "uberon",
  },
  {
    id: "31",
    source: "snp",
    label: "histone_modification",
    target: "uberon",
  },
  {
    id: "32",
    source: "go",
    label: "go_gene_product",
    target: "protein",
  },
  {
    id: "33",
    source: "gene",
    label: "tfbs_snp",
    target: "snp",
  },
  {
    id: "34",
    source: "gene",
    label: "expressed_in",
    target: "clo",
  },
  {
    id: "35",
    source: "gene",
    label: "expressed_in",
    target: "efo",
  },
  {
    id: "36",
    source: "transcript",
    label: "includes",
    target: "exon",
  },
  {
    id: "37",
    source: "snp",
    label: "chromatin_state",
    target: "cl",
  },
  {
    id: "38",
    source: "snp",
    label: "chromatin_state",
    target: "clo",
  },
  {
    id: "39",
    source: "snp",
    label: "chromatin_state",
    target: "efo",
  },
  {
    id: "40",
    source: "snp",
    label: "in_dnase_i_hotspot",
    target: "cl",
  },
  {
    id: "41",
    source: "snp",
    label: "in_dnase_i_hotspot",
    target: "clo",
  },
  {
    id: "42",
    source: "snp",
    label: "in_dnase_i_hotspot",
    target: "efo",
  },
  {
    id: "43",
    source: "snp",
    label: "histone_modification",
    target: "cl",
  },
  {
    id: "44",
    source: "snp",
    label: "histone_modification",
    target: "clo",
  },
];

const locationInputs: FormFieldProps[] = [
  {
    name: "chr",
    label: "Chromosome",
    inputType: "combobox",
    options: [
      { value: "X" },
      { value: "Y" },
      ...new Array(22)
        .fill(null)
        .map((_, i) => ({ value: (i + 1).toString() })),
    ],
  },
  { label: "Start", name: "start", inputType: "input", type: "number" },
  { label: "End", name: "end", inputType: "input", type: "number" },
];

const forms: NodeFormFieldsMap = {
  enhancer: locationInputs,
  super_enhancer: locationInputs,
  promoter: locationInputs,
  tad: locationInputs,
  tfbs: locationInputs,
  unberon: [{ label: "Name", name: "term_name", inputType: "input" }],
  clo: [{ label: "Name", name: "term_name", inputType: "input" }],
  cl: [{ label: "Name", name: "term_name", inputType: "input" }],
  efo: [{ label: "Name", name: "term_name", inputType: "input" }],
  bto: [{ label: "Name", name: "term_name", inputType: "input" }],
  motif: [{ label: "Name", name: "tf_name", inputType: "input" }],
  pathway: [{ label: "Name", name: "pathway_name", inputType: "input" }],
  gene: [
    { label: "Name", name: "gene_name", inputType: "input" },
    {
      label: "Type",
      name: "gene_type",
      inputType: "combobox",
      options: [
        { value: "lncRNA" },
        { value: "snRNA" },
        { value: "snoRNA" },
        { value: "processed_pseudogene" },
        { value: "transcribed_unprocessed_pseudogene" },
        { value: "protein_coding" },
        { value: "unprocessed_pseudogene" },
        { value: "TEC" },
        { value: "miRNA" },
        { value: "rRNA_pseudogene" },
        { value: "scaRNA" },
        { value: "misc_RNA" },
        { value: "transcribed_processed_pseudogene" },
        { value: "transcribed_unitary_pseudogene" },
        { value: "rRNA" },
        { value: "unitary_pseudogene" },
        { value: "pseudogene" },
        { value: "IG_V_pseudogene" },
        { value: "scRNA" },
        { value: "sRNA" },
        { value: "IG_C_gene" },
        { value: "IG_J_gene" },
        { value: "IG_V_gene" },
        { value: "translated_processed_pseudogene" },
        { value: "ribozyme" },
        { value: "vault_RNA" },
        { value: "TR_V_gene" },
        { value: "TR_V_pseudogene" },
        { value: "TR_C_gene" },
        { value: "TR_J_gene" },
        { value: "TR_D_gene" },
        { value: "IG_C_pseudogene" },
        { value: "TR_J_pseudogene" },
        { value: "IG_J_pseudogene" },
        { value: "IG_D_gene" },
        { value: "IG_pseudogene" },
        { value: "artifact" },
        { value: "Mt_tRNA" },
        { value: "Mt_rRNA" },
      ],
    },
    ...locationInputs,
  ],
  protein: [{ label: "Name", name: "protein_name", inputType: "input" }],
  transcript: [
    { label: "Gene name", name: "gene_name", inputType: "input" },
    { label: "Transcript name", name: "transcript_name", inputType: "input" },
    {
      label: "Type",
      name: "transcript_type",
      inputType: "combobox",
      options: [
        { value: "processed_transcript" },
        { value: "lncRNA" },
        { value: "transcribed_unprocessed_pseudogene" },
        { value: "unprocessed_pseudogene" },
        { value: "miRNA" },
        { value: "nonsense_mediated_decay" },
        { value: "transcribed_unitary_pseudogene" },
        { value: "protein_coding" },
        { value: "protein_coding_CDS_not_defined" },
        { value: "retained_intron" },
        { value: "misc_RNA" },
        { value: "processed_pseudogene" },
        { value: "transcribed_processed_pseudogene" },
        { value: "snRNA" },
        { value: "snoRNA" },
        { value: "TEC" },
        { value: "rRNA_pseudogene" },
        { value: "scaRNA" },
        { value: "non_stop_decay" },
        { value: "protein_coding_LoF" },
        { value: "unitary_pseudogene" },
        { value: "pseudogene" },
        { value: "rRNA" },
        { value: "IG_V_pseudogene" },
        { value: "scRNA" },
        { value: "IG_V_gene" },
        { value: "IG_C_gene" },
        { value: "IG_J_gene" },
        { value: "sRNA" },
        { value: "ribozyme" },
        { value: "translated_processed_pseudogene" },
        { value: "vault_RNA" },
        { value: "TR_C_gene" },
        { value: "TR_J_gene" },
        { value: "TR_V_gene" },
        { value: "TR_V_pseudogene" },
        { value: "TR_D_gene" },
        { value: "IG_C_pseudogene" },
        { value: "TR_J_pseudogene" },
        { value: "IG_J_pseudogene" },
        { value: "IG_D_gene" },
        { value: "IG_pseudogene" },
        { value: "artifact" },
        { value: "Mt_tRNA" },
        { value: "Mt_rRNA" },
      ],
    },
  ],
  exon: [
    { label: "Gene ID", name: "gene_id", inputType: "input" },
    { label: "Transcript ID", name: "transcript_id", inputType: "input" },
    { label: "Exon number", name: "exon_number", inputType: "input" },
    ...locationInputs,
  ],
  snp: [
    { label: "Ref", name: "ref", inputType: "input" },
    { label: "Alt", name: "alt", inputType: "input" },
    { label: "Caf_ref", name: "caf_ref", inputType: "input" },
    { label: "Caf_alt", name: "caf_alt", inputType: "input" },
    ...locationInputs,
  ],
  sv: [
    {
      label: "Variant type",
      name: "variant_type",
      inputType: "combobox",
      options: [
        { value: "duplication" },
        { value: "deletion" },
        { value: "loss" },
        { value: "gain+loss" },
        { value: "complex" },
        { value: "gain" },
        { value: "insertion" },
        { value: "inversion" },
        { value: "tandem duplication" },
        { value: "sva insertion" },
        { value: "alu insertion" },
        { value: "novel sequence insertion" },
        { value: "sequence alteration" },
        { value: "mobile element insertion" },
        { value: "mobile element deletion" },
        { value: "line1 deletion" },
        { value: "alu deletion" },
        { value: "line1 insertion" },
        { value: "sva deletion" },
        { value: "herv deletion" },
        { value: "herv insertion" },
        { value: "copy number variation" },
      ],
    },
    ...locationInputs,
  ],
  non_coding_rna: [
    {
      label: "RNA type",
      name: "rna_type",
      inputType: "combobox",
      options: [
        { value: "piRNA" },
        { value: "tRNA" },
        { value: "SRP_RNA" },
        { value: "lncRNA" },
        { value: "sRNA" },
        { value: "miRNA" },
        { value: "pre_miRNA" },
        { value: "snRNA" },
        { value: "misc_RNA" },
        { value: "snoRNA" },
        { value: "precursor_RNA" },
        { value: "scRNA" },
        { value: "antisense_RNA" },
        { value: "ncRNA" },
        { value: "Y_RNA" },
        { value: "circRNA" },
        { value: "scaRNA" },
        { value: "rRNA" },
        { value: "ribozyme" },
        { value: "other" },
        { value: "guide_RNA" },
        { value: "autocatalytically_spliced_intron" },
        { value: "RNase_P_RNA" },
        { value: "vault_RNA" },
        { value: "RNase_MRP_RNA" },
        { value: "hammerhead_ribozyme" },
        { value: "telomerase_RNA" },
      ],
    },
    ...locationInputs,
  ],
  go: [
    { label: "Term name", name: "term_name", inputType: "input" },
    {
      label: "Subontology",
      name: "subontology",
      inputType: "combobox",
      options: [
        { value: "biological_process" },
        { value: "molecular_function" },
        { value: "cellular_component" },
        { value: "external" },
        { value: "gene_ontology" },
      ],
    },
  ],
};

export function ErrorBoundary() {
  return <ErrorBoundaryContent />;
}
