import Highcharts from "highcharts";
import HighchartsReact from "highcharts-react-official";
import { Suspense } from "react";
import { Theme, useTheme } from "remix-themes";

const options: Highcharts.Options = {
  title: { text: "" },
  chart: { type: "bar", styledMode: true },
  yAxis: {
    min: 0,
    title: {
      text: "Count",
      align: "high",
    },
    labels: { overflow: "justify" },
  },
  plotOptions: {
    bar: {
      borderRadius: "50%",
      dataLabels: { enabled: true },
    },
  },
  tooltip: { valueSuffix: "" },
  credits: { enabled: false },
  series: [
    { colorByPoint: true, type: "bar", showInLegend: false, pointWidth: 20 },
  ],
};

export default function Bar({ categories, data }: any) {
  const [theme] = useTheme();
  const props = {
    ...options,
    xAxis: { ...options.xAxis, categories },
    series: [{ ...options.series?.[0], data, type: "bar" }],
  };

  return (
    <Suspense fallback={null}>
      <HighchartsReact
        highcharts={Highcharts}
        options={props}
        containerProps={{
          className:
            theme == Theme.DARK ? "highcharts-dark" : "highcharts-light",
        }}
      />
    </Suspense>
  );
}
