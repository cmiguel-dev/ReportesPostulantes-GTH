// components/BarChart.js

"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto"; // npm install chart.js

export default function BarChart({ dataObj, title }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null);

  useEffect(() => {
    if (!dataObj || Object.keys(dataObj).length === 0) return;

    const ctx = canvasRef.current.getContext("2d");

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    const topData = Object.entries(dataObj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    chartRef.current = new Chart(ctx, {
      type: "bar",
      data: {
        labels: topData.map(([key]) => key.length > 20 ? key.slice(0, 20) + "..." : key),
        datasets: [
          {
            label: title,
            data: topData.map(([, value]) => value),
            backgroundColor: "rgba(54, 162, 235, 0.5)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
          legend: { position: "top" },
          tooltip: { callbacks: { label: (ctx) => `${ctx.raw} postulantes` } },
        },
      },
    });

    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dataObj, title]);

  return <canvas ref={canvasRef} style={{ maxHeight: "400px" }}></canvas>;
}