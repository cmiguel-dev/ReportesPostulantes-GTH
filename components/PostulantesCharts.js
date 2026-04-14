// components/PostulantesCharts.js
"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function PostulantesCharts({ stats }) {
  const areasChartRef = useRef(null);
  const carrerasChartRef = useRef(null);
  const universidadesChartRef = useRef(null);
  const estadosChartRef = useRef(null);
  
  const chartsRef = useRef({
    areas: null,
    carreras: null,
    universidades: null,
    estados: null
  });

  useEffect(() => {
    if (!stats) return;
    
    // Gráfico de Áreas
    if (areasChartRef.current && Object.keys(stats.areas).length > 0) {
      if (chartsRef.current.areas) chartsRef.current.areas.destroy();
      
      const ctx = areasChartRef.current.getContext("2d");
      const areasData = Object.entries(stats.areas)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      
      chartsRef.current.areas = new Chart(ctx, {
        type: "bar",
        data: {
          labels: areasData.map(([key]) => key.length > 20 ? key.slice(0, 20) + "..." : key),
          datasets: [{
            label: "Postulantes por Área",
            data: areasData.map(([, value]) => value),
            backgroundColor: "rgba(54, 162, 235, 0.6)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          plugins: {
            legend: { position: "top" },
            tooltip: { callbacks: { label: (ctx) => `${ctx.raw} postulantes` } }
          }
        }
      });
    }
    
    // Gráfico de Carreras (Pie)
    if (carrerasChartRef.current && Object.keys(stats.carreras).length > 0) {
      if (chartsRef.current.carreras) chartsRef.current.carreras.destroy();
      
      const ctx = carrerasChartRef.current.getContext("2d");
      const carrerasData = Object.entries(stats.carreras)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6);
      
      chartsRef.current.carreras = new Chart(ctx, {
        type: "pie",
        data: {
          labels: carrerasData.map(([key]) => key),
          datasets: [{
            data: carrerasData.map(([, value]) => value),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)",
              "rgba(54, 162, 235, 0.6)",
              "rgba(255, 206, 86, 0.6)",
              "rgba(75, 192, 192, 0.6)",
              "rgba(153, 102, 255, 0.6)",
              "rgba(255, 159, 64, 0.6)"
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "right" },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} postulantes` } }
          }
        }
      });
    }
    
    // Gráfico de Universidades
    if (universidadesChartRef.current && Object.keys(stats.universidades).length > 0) {
      if (chartsRef.current.universidades) chartsRef.current.universidades.destroy();
      
      const ctx = universidadesChartRef.current.getContext("2d");
      const universidadesData = Object.entries(stats.universidades)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 8);
      
      chartsRef.current.universidades = new Chart(ctx, {
        type: "bar",
        data: {
          labels: universidadesData.map(([key]) => key.length > 25 ? key.slice(0, 25) + "..." : key),
          datasets: [{
            label: "Postulantes por Universidad",
            data: universidadesData.map(([, value]) => value),
            backgroundColor: "rgba(75, 192, 192, 0.6)",
            borderColor: "rgba(75, 192, 192, 1)",
            borderWidth: 1
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: true,
          indexAxis: 'y', // Gráfico horizontal para mejor visualización
        }
      });
    }
    
    // Gráfico de Estados
    if (estadosChartRef.current && Object.keys(stats.estados).length > 0) {
      if (chartsRef.current.estados) chartsRef.current.estados.destroy();
      
      const ctx = estadosChartRef.current.getContext("2d");
      const estadosData = Object.entries(stats.estados);
      
      chartsRef.current.estados = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: estadosData.map(([key]) => key),
          datasets: [{
            data: estadosData.map(([, value]) => value),
            backgroundColor: [
              "rgba(255, 99, 132, 0.6)", // falta agendar
              "rgba(54, 162, 235, 0.6)", // ya se entrevistó
              "rgba(255, 206, 86, 0.6)",  // rechazó
              "rgba(75, 192, 192, 0.6)",  // no respondió
              "rgba(153, 102, 255, 0.6)"  // otros
            ]
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: { callbacks: { label: (ctx) => `${ctx.label}: ${ctx.raw} (${Math.round(ctx.raw / Object.values(stats.estados).reduce((a,b) => a+b, 0) * 100)}%)` } }
          }
        }
      });
    }
    
    return () => {
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [stats]);

  return (
    <div className="row">
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">📊 Postulantes por Área</h5>
            <canvas ref={areasChartRef} style={{ maxHeight: "300px" }}></canvas>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">🎓 Carreras de Postulantes</h5>
            <canvas ref={carrerasChartRef} style={{ maxHeight: "300px" }}></canvas>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">🏫 Universidades más frecuentes</h5>
            <canvas ref={universidadesChartRef} style={{ maxHeight: "300px" }}></canvas>
          </div>
        </div>
      </div>
      
      <div className="col-md-6 mb-4">
        <div className="card">
          <div className="card-body">
            <h5 className="card-title">📌 Estado de Postulantes</h5>
            <canvas ref={estadosChartRef} style={{ maxHeight: "300px" }}></canvas>
          </div>
        </div>
      </div>
    </div>
  );
}