"use client";

import React from "react";

export default function CardLineChart() {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const container = chartRef.current;
    if (!container) {
      return undefined;
    }

    const widget = document.createElement("div");
    widget.className = "tradingview-widget-container__widget";
    widget.style.height = "100%";
    widget.style.width = "100%";

    const script = document.createElement("script");
    script.type = "text/javascript";
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.async = true;
    script.text = JSON.stringify({
      allow_symbol_change: true,
      calendar: false,
      details: false,
      hide_side_toolbar: true,
      hide_top_toolbar: false,
      hide_legend: false,
      hide_volume: false,
      hotlist: false,
      interval: "60",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "BINANCE:BTCUSDT",
      theme: "dark",
      timezone: "Etc/UTC",
      backgroundColor: "#0F0F0F",
      gridColor: "rgba(242, 242, 242, 0.2)",
      watchlist: [],
      withdateranges: false,
      compareSymbols: [],
      support_host: "https://www.tradingview.com",
      studies: [],
      autosize: true
    });

    container.append(widget, script);

    return () => {
      container.replaceChildren();
    };
  }, []);

  return (
    <>
      <div className="relative flex flex-col min-w-0 break-words bg-white w-full mb-6 shadow-lg rounded">
        <div className="rounded-t mb-0 px-4 py-3 bg-transparent">
          <h2 className="text-blueGray-700 text-xl font-semibold">Market chart</h2>
        </div>
        <div className="p-4 flex-auto">
          <div className="relative h-500-px">
            <div
              ref={chartRef}
              className="tradingview-widget-container"
              style={{ height: "100%", width: "100%" }}
            />
          </div>
        </div>
      </div>
    </>
  );
}
