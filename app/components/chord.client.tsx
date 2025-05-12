import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import dep from "highcharts/modules/dependency-wheel";
import san from "highcharts/modules/sankey";
import { Suspense } from "react";
import { Theme, useTheme } from "remix-themes";

console.log("dep", dep, Highcharts);
san(Highcharts);
dep(Highcharts);

const options = {
  chart: { styledMode: true, margin: 20 },
  title: {
    text: "",
  },
  credits: {
    enabled: false,
  },
};

export default function Chord({ data }: { data: [string, string, number][] }) {
  const [theme] = useTheme();

  return (
    <Suspense fallback={null}>
      <HighchartsReact
        containerProps={{
          className:
            theme == Theme.DARK ? "highcharts-dark" : "highcharts-light",
        }}
        highcharts={Highcharts}
        options={{
          ...options,
          series: [
            {
              name: "Connections",
              keys: ["from", "to", "weight"],
              data,
              type: "dependencywheel",
              dataLabels: {
                color: "#333",
                style: {
                  textOutline: "none",
                },
                textPath: {
                  enabled: true,
                },
                distance: 10,
              },
            },
          ],
        }}
      />
    </Suspense>
  );
}
