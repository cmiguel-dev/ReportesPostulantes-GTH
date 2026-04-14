// app/reportes/page.js

"use client";

import { useEffect, useState } from "react";
import { getPostulantes } from "../../services/postulantesService";
import {
  normalizarArea,
  normalizarCarrera,
  normalizarFuenteCaptacion,
} from "../../utils/normalizersCampos";
import BarChart from "../../components/BarChart";

export default function ReportesPage() {
  const [data, setData] = useState([]);
  const [stats, setStats] = useState({
    universidades: {},
    areas: {},
    carreras: {},
    fuentesCaptacion: {},
  });

  async function loadData() {
    const res = await getPostulantes();

    const cleaned = res.map((item) => ({
      ...item,
      area: normalizarArea(item.area),
      carrera: normalizarCarrera(item.carrera),
      fuenteCaptacion: normalizarFuenteCaptacion(item.fuenteCaptacion),
    }));

    setData(cleaned);
    generarEstadisticas(cleaned);
  }

  function generarEstadisticas(data) {
    const universidades = {};
    const areas = {};
    const carreras = {};
    const fuentesCaptacion = {};

    data.forEach((item) => {
      universidades[item.universidad] =
        (universidades[item.universidad] || 0) + 1;
      areas[item.area] = (areas[item.area] || 0) + 1;
      carreras[item.carrera] = (carreras[item.carrera] || 0) + 1;
      fuentesCaptacion[item.fuenteCaptacion] =
        (fuentesCaptacion[item.fuenteCaptacion] || 0) + 1;
    });

    setStats({ universidades, areas, carreras, fuentesCaptacion });
  }

  useEffect(() => {
    loadData();
  }, []);

  const renderTopList = (obj, limit = 10) => {
    return Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([key, value]) => (
        <li
          key={key}
          className="list-group-item d-flex justify-content-between align-items-center"
        >
          {key}
          <span className="badge bg-primary rounded-pill">{value}</span>
        </li>
      ));
  };

  return (
    <div className="container-fluid">
      <h2 className="mb-3">📊 Reporte de Postulantes</h2>

      {/* TOTAL */}
      <div className="alert alert-primary">
        <strong>Total registros:</strong> {data.length}
      </div>

      <div className="row g-4">
        {/* UNIVERSIDADES */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-dark text-white">
              🏫 Universidades
            </div>
            <ul className="list-group list-group-flush">
              {renderTopList(stats.universidades)}
            </ul>
          </div>
        </div>

        {/* AREAS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-secondary text-white">
              🏢 Áreas
            </div>
            <ul className="list-group list-group-flush">
              {renderTopList(stats.areas)}
            </ul>
          </div>
        </div>

        {/* CARRERAS */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-success text-white">
              🎓 Carreras
            </div>
            <ul className="list-group list-group-flush">
              {renderTopList(stats.carreras)}
            </ul>
          </div>
        </div>

        {/* FUENTES */}
        <div className="col-md-6 col-lg-3">
          <div className="card shadow-sm h-100">
            <div className="card-header bg-warning text-dark">
              📢 Captación
            </div>
            <ul className="list-group list-group-flush">
              {renderTopList(stats.fuentesCaptacion, 15)}
            </ul>
          </div>
        </div>
      </div>

      {/* GRÁFICOS */}
      <div className="mt-5">
        <div className="card p-3 mb-4 shadow-sm">
          <h5>📊 Universidades</h5>
          <BarChart dataObj={stats.universidades} title="Universidades" />
        </div>

        <div className="card p-3 mb-4 shadow-sm">
          <h5>📊 Áreas</h5>
          <BarChart dataObj={stats.areas} title="Áreas" />
        </div>

        <div className="card p-3 mb-4 shadow-sm">
          <h5>📊 Carreras</h5>
          <BarChart dataObj={stats.carreras} title="Carreras" />
        </div>

        <div className="card p-3 shadow-sm">
          <h5>📢 Canales de Captación</h5>
          <BarChart
            dataObj={stats.fuentesCaptacion}
            title="Fuentes de captación"
          />
        </div>
      </div>
    </div>
  );
}