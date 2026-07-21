"use client";

import { useEffect, useRef } from "react";

/**
 * Se monta una vez en el layout raíz. Al abrir la app, comprueba los pagos
 * recurrentes activos y genera en `movimientos` todo lo que esté pendiente
 * (aunque hayan pasado varios meses). No renderiza nada.
 */
export function RecurringPaymentsGenerator() {
  const ejecutado = useRef(false);

  useEffect(() => {
    if (ejecutado.current) return;
    ejecutado.current = true;

    fetch("/api/recurrentes/generar", { method: "POST" })
      .then((res) => res.json())
      .then((data) => {
        if (data?.ok && data.generados > 0) {
          window.dispatchEvent(new Event("movimientos:actualizados"));
        }
      })
      .catch((error) => {
        console.error("Error generando pagos recurrentes:", error);
      });
  }, []);

  return null;
}
