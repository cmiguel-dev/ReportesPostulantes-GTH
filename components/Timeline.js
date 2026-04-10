// components/Timeline.js

"use client";

import { updateOnboarding } from "../services/onboardingService";

export default function Timeline({ employee, reload }) {
  const steps = [
    "Inicio",
    "Creación de correo Sanilab",
    "Carta de Compromiso",
    "Presentación con jefe de área",
    "Leer manuales",
    "Evaluación Final",
    "Finalizado",
  ];

  const currentIndex = steps.indexOf(employee.estado);

  async function changeStep(step) {
    console.log("ID:", employee.id);

    await updateOnboarding(employee.id, {
      "Onboarding Estado": step,
    });

    reload();
  }

  return (
    <div className="mt-3">
      <div className="d-flex justify-content-between align-items-center">
        {steps.map((step, index) => (
          <div
            key={step}
            className="text-center"
            style={{ cursor: "pointer" }}
            onClick={() => changeStep(step)}
          >
            <div
              style={{
                width: 25,
                height: 25,
                borderRadius: "50%",
                background:
                  index <= currentIndex ? "green" : "lightgray",
                margin: "0 auto",
              }}
            ></div>
            <small>{step}</small>
          </div>
        ))}
      </div>
    </div>
  );
}