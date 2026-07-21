-- Ejecutar una vez en el SQL Editor de Supabase.
-- Crea la tabla de reglas de pagos recurrentes y enlaza `movimientos`
-- con la regla que lo generó, sin tocar el significado de `movimientos`.

create table public.pagos_recurrentes (
  id uuid not null default gen_random_uuid(),
  nombre text not null,
  tipo text not null default 'gasto' check (tipo = any (array['ingreso'::text, 'gasto'::text])),
  importe numeric not null check (importe > 0),
  categoria text not null,
  descripcion text,
  persona text not null default 'Conjunta',
  fecha_inicio date not null,
  fecha_fin date,
  frecuencia text not null,
  dia_ejecucion int,
  activo boolean not null default true,
  fecha_ultima_generacion date,
  color text,
  icono text,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now(),
  constraint pagos_recurrentes_pkey primary key (id)
);

alter table public.movimientos
  add column recurrente_id uuid references public.pagos_recurrentes(id) on delete set null;

-- Los NULL nunca colisionan entre sí en un UNIQUE de Postgres, así que esto
-- solo impide duplicados entre movimientos generados por el mismo pago
-- recurrente en la misma fecha. Los movimientos manuales (recurrente_id
-- null) no se ven afectados.
alter table public.movimientos
  add constraint movimientos_recurrente_fecha_unique unique (recurrente_id, fecha);

-- `pagos_recurrentes` se crea con RLS activado por defecto en este proyecto.
-- `movimientos` no lo tiene (por eso funciona sin políticas), así que se
-- iguala el comportamiento: mismo acceso abierto con la clave anon que ya
-- usa el resto de la app (no hay login de usuarios en "Nuestro Piso").
alter table public.pagos_recurrentes disable row level security;
