/**
 * vitest.setup.ts
 *
 * Configuración global e inyección sintética de variables de entorno para
 * la suite de pruebas automatizadas (Vitest).
 *
 * Garantiza que todos los tests se ejecuten de manera 100% hermética y aislada,
 * sin requerir la presencia de un archivo .env real ni secretos de producción.
 */

import { afterEach } from "vitest";

const SYNTHETIC_ENV: Record<string, string> = {
  NODE_ENV: "test",
  ADMIN_ACTION_PASSWORD: "test-admin-password-hermetic",
  JWT_SECRET: "test-jwt-secret-hermetic-key-123",
  DATABASE_URL: "mysql://test_user:test_pass@localhost:3306/test_vocacional_ies11_test",
  INSTANCE_MODE: "historical",
  VITE_INSTANCE_MODE: "historical",
  APP_URL: "https://testvocacional.ies11.edu.ar",
  PORT: "3000",
  OWNER_OPEN_ID: "test-owner-openid",
  VITE_APP_ID: "test-vocacional-ies11",
};

// Asignar variables sintéticas al inicio del entorno de pruebas
Object.entries(SYNTHETIC_ENV).forEach(([key, value]) => {
  process.env[key] = value;
});

// Restaurar el entorno sintético después de cada prueba individual
afterEach(() => {
  Object.entries(SYNTHETIC_ENV).forEach(([key, value]) => {
    process.env[key] = value;
  });
});
