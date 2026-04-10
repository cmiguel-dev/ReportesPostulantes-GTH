// components/BarChart.js

"use client";

import { useEffect, useRef } from "react";

export default function BarChart({ dataObj, title }) {
  const canvasRef = useRef(null);
  const chartRef = useRef(null); // 🔥 guardar instancia

  useEffect(() => {
    if (!dataObj || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");

    // 🔥 DESTRUIR CHART ANTERIOR
    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new window.Chart(ctx, {
      type: "bar",
      data: {
        labels: Object.keys(dataObj),
        datasets: [
          {
            label: title,
            data: Object.values(dataObj),
          },
        ],
      },
    });

    // 🔥 CLEANUP (IMPORTANTE)
    return () => {
      if (chartRef.current) {
        chartRef.current.destroy();
      }
    };
  }, [dataObj, title]);

  return <canvas ref={canvasRef}></canvas>;
}