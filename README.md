# Nuestro Piso

Aplicación móvil web para gestionar el fondo común de Marc y Alba.

## Funciones incluidas

- Ingresos y gastos en una única tabla `movimientos`.
- Saldo acumulado real del fondo.
- Aportaciones mensuales de Marc y Alba sin duplicados.
- Registro, edición y eliminación de movimientos.
- Integración con Atajos de iPhone mediante `/api/movimientos`.
- Pagos recurrentes (Netflix, alquiler, seguros...) que generan movimientos
  automáticamente al abrir la app, sin duplicados aunque pasen meses sin
  entrar.
- Comparación del mes activo con el mes anterior.
- Comparativas automáticas por categoría.
- Gráfico circular de gastos por categoría.
- Evolución de ingresos y gastos de los últimos seis meses.
- Separación entre aportaciones e importes pagados por cada persona.

## Puesta en marcha

```bash
npm install
npm run dev
```

La aplicación estará disponible en `http://localhost:3000`.

## Pagos recurrentes

Antes de usar la pantalla "Pagos recurrentes", ejecuta una vez el script
`supabase/pagos_recurrentes.sql` en el SQL Editor de tu proyecto Supabase.
Crea la tabla `pagos_recurrentes` y enlaza `movimientos` con el pago que lo
generó (`recurrente_id`), con una restricción única que impide duplicados.

## Variables de entorno

Crea `.env.local` en la raíz:

```env
NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_CLAVE_PUBLICA_DE_SUPABASE
SHORTCUT_SECRET=TU_SECRETO_PARA_ATAJOS
```

## Comprobaciones antes de subir

```bash
npm run build
git add .
git commit -m "Mejora completa de dashboard y estadisticas"
git push
```
