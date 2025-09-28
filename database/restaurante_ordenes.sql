-- Crear base de datos (si estás en local; en Render ya existe)
CREATE TABLE public.clientes (
  id        SERIAL PRIMARY KEY,
  nombre    VARCHAR NOT NULL,
  email     VARCHAR NOT NULL UNIQUE,
  telefono  VARCHAR NOT NULL
);

CREATE TABLE public.ordenes (
  id             SERIAL PRIMARY KEY,
  cliente_id     INTEGER NOT NULL REFERENCES public.clientes(id) ON DELETE CASCADE,
  platillo_nombre VARCHAR NOT NULL,
  estado         TEXT NOT NULL DEFAULT 'pending',
  creado         TIMESTAMP NOT NULL DEFAULT NOW(),
  CONSTRAINT ordenes_estado_chk
    CHECK (LOWER(estado) IN ('pending','preparing','delivered'))
);

CREATE INDEX idx_ordenes_cliente   ON public.ordenes (cliente_id);
CREATE INDEX idx_ordenes_creado    ON public.ordenes (creado);