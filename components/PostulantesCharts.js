// components/PostulantesCharts.js
"use client";

import { useEffect, useRef } from "react";
import Chart from "chart.js/auto";

export default function PostulantesCharts({ postulantes }) {
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
    if (!postulantes || postulantes.length === 0) return;
    
    // Calcular estadísticas
    const areas = {};
    const carreras = {};
    const universidades = {};
    const estados = {};
    
    postulantes.forEach(p => {
      areas[p.area] = (areas[p.area] || 0) + 1;
      carreras[p.carrera] = (carreras[p.carrera] || 0) + 1;
      universidades[p.universidad] = (universidades[p.universidad] || 0) + 1;
      estados[p.estado_postulante] = (estados[p.estado_postulante] || 0) + 1;
    });
    
    // Gráfico de Áreas
    if (areasChartRef.current && Object.keys(areas).length > 0) {
      if (chartsRef.current.areas) chartsRef.current.areas.destroy();
      
      const ctx = areasChartRef.current.getContext("2d");
      const areasData = Object.entries(areas)
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
    if (carrerasChartRef.current && Object.keys(carreras).length > 0) {
      if (chartsRef.current.carreras) chartsRef.current.carreras.destroy();
      
      const ctx = carrerasChartRef.current.getContext("2d");
      const carrerasData = Object.entries(carreras)
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
    if (universidadesChartRef.current && Object.keys(universidades).length > 0) {
      if (chartsRef.current.universidades) chartsRef.current.universidades.destroy();
      
      const ctx = universidadesChartRef.current.getContext("2d");
      const universidadesData = Object.entries(universidades)
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
          indexAxis: 'y',
        }
      });
    }
    
    // Gráfico de Estados
    if (estadosChartRef.current && Object.keys(estados).length > 0) {
      if (chartsRef.current.estados) chartsRef.current.estados.destroy();
      
      const ctx = estadosChartRef.current.getContext("2d");
      const estadosData = Object.entries(estados);
      
      const coloresEstados = {
        "NUEVO (FALTA AGENDAR)": "rgba(255, 193, 7, 0.6)",
        "CONTACTADO (SIN RESPUESTA)": "rgba(108, 117, 125, 0.6)",
        "ENTREVISTA AGENDADA": "rgba(13, 202, 240, 0.6)",
        "EN EVALUACIÓN": "rgba(13, 110, 253, 0.6)",
        "ACEPTADO": "rgba(25, 135, 84, 0.6)",
        "DESCARTADO": "rgba(220, 53, 69, 0.6)"
      };
      
      chartsRef.current.estados = new Chart(ctx, {
        type: "doughnut",
        data: {
          labels: estadosData.map(([key]) => {
            const textos = {
              "NUEVO (FALTA AGENDAR)": "🆕 Nuevo",
              "CONTACTADO (SIN RESPUESTA)": "📞 Contactado",
              "ENTREVISTA AGENDADA": "📅 Entrevista",
              "EN EVALUACIÓN": "⚖️ Evaluación",
              "ACEPTADO": "✅ Aceptado",
              "DESCARTADO": "❌ Descartado"
            };
            return textos[key] || key;
          }),
          datasets: [{
            data: estadosData.map(([, value]) => value),
            backgroundColor: estadosData.map(([key]) => coloresEstados[key] || "rgba(200, 200, 200, 0.6)"),
          }]
        },
        options: {
          responsive: true,
          plugins: {
            legend: { position: "bottom" },
            tooltip: { 
              callbacks: { 
                label: (ctx) => {
                  const total = Object.values(estados).reduce((a,b) => a+b, 0);
                  const porcentaje = Math.round(ctx.raw / total * 100);
                  return `${ctx.label}: ${ctx.raw} (${porcentaje}%)`;
                }
              } 
            }
          }
        }
      });
    }
    
    return () => {
      Object.values(chartsRef.current).forEach(chart => {
        if (chart) chart.destroy();
      });
    };
  }, [postulantes]);

  if (!postulantes || postulantes.length === 0) {
    return <div className="alert alert-warning">No hay datos para mostrar gráficos</div>;
  }

  return (
    <div className="row mt-4">
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