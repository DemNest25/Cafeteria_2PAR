# 🍽️ Backend - Restaurante Órdenes

API REST desarrollada con **Node.js + Express + PostgreSQL** para gestionar clientes y órdenes de un restaurante.

## 🚀 Endpoints principales

### Clientes
- **POST /clientes/registrar** → Registrar cliente
- **POST /clientes/login** → Login cliente

### Órdenes
- **POST /ordenes** → Crear orden
- **GET /ordenes/:clienteId** → Listar órdenes por cliente
- **PUT /ordenes/:id/estado** → Avanzar estado (pending → preparing → delivered)

### Healthcheck
- **GET /health** → Verifica si la API y la DB responden

---

## ⚙️ Instalación local

```bash
cd backend
npm install
npm run dev
