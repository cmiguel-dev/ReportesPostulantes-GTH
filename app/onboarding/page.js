// app/onboarding/page.js

"use client";

import { useEffect, useState } from "react";
import { getOnboarding } from "../../services/onboardingService";
import Timeline from "../../components/Timeline";

export default function OnboardingPage() {
  const [data, setData] = useState([]);

  async function loadData() {
    const res = await getOnboarding();
    console.log("DATA:", res);
    const mapped = res.map((item) => ({
      id: item.id,
      nombre: item["Nombre y Apellidos"],
      celular: item["Número de celular "],
      dni: item["DNI (Documento de Identificación)"],
      carrera: item["Carrera"],
      area: item["Área a la que ingresaras(mencionada en la entrevista) "],
      estado: item["Onboarding Estado"] || "Inicio",
      fecha: item["Fecha que se envió"],
    }));

    // ORDENAR POR FECHA (más recientes primero)
    const sorted = mapped.sort((a, b) => {
      const fechaA = new Date(a.fecha || 0);
      const fechaB = new Date(b.fecha || 0);
      return fechaB - fechaA;
    });

    // Muestra SOLO 20
    const limited = sorted.slice(0, 20);

    setData(limited);
  }

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <h2>📌 Onboarding</h2>
      <br></br>
      <p>Se muestra la lista de los últimos 20 empleados en proceso de onboarding. Los empleados se muestran en orden descendente según la fecha de envío.</p>
      <div className="mt-4">
        {Array.isArray(data) &&
          data.map((emp, index) => (
            <div key={index} className="card p-3 mb-2">
              <h5>{emp.nombre}</h5>
              <p>📞 Celular: {emp.celular}</p>
              <p>🎫 DNI: {emp.dni}</p>
              <p>🎓 Carrera: {emp.carrera}</p>
              <p>🏢 Área: {emp.area}</p>
              <Timeline employee={emp} reload={loadData} />
            </div>
          ))}
      </div>
    </div>
  );
}