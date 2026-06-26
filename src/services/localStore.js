import { almacenamientoMock, configuracionMock, laboratorioMock, proveedoresMock, romanaMock } from '../data/realFlowMock';

const STORAGE_KEY = 'curimapu_recepcion_cereales_v2';
export const DEMO_SESSION_KEY = 'curimapu_demo_session';
let demoStore = null;

function seed() {
  return {
    proveedores: proveedoresMock,
    romana: romanaMock,
    laboratorio: laboratorioMock,
    almacenamiento: almacenamientoMock,
    configuracion: configuracionMock,
    documentos_curimapu: [],
    recepciones: [],
    analisis: [],
  };
}

function demoSeed() {
  return {
    proveedores: [],
    romana: [],
    laboratorio: [],
    almacenamiento: [],
    configuracion: configuracionMock,
    documentos_curimapu: [],
    recepciones: [],
    analisis: [],
  };
}

export function getStore() {
  if (isDemoMode()) {
    demoStore ||= demoSeed();
    return demoStore;
  }

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

export function setStore(nextStore) {
  if (isDemoMode()) {
    demoStore = nextStore;
    return demoStore;
  }

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  return nextStore;
}

export function isDemoMode() {
  return sessionStorage.getItem(DEMO_SESSION_KEY) === 'true';
}

export function clearDemoStore() {
  demoStore = null;
}

export function shouldUseRemote() {
  return !isDemoMode();
}

export function uid(prefix) {
  return `${prefix}-${crypto.randomUUID()}`;
}

export function composeRecords(store = getStore()) {
  return store.romana.map((romana) => {
    const proveedor = store.proveedores.find((item) => item.id === romana.proveedor_id);
    const laboratorio = store.laboratorio.find((item) => item.romana_id === romana.id);
    const almacenamiento = store.almacenamiento.find((item) => item.romana_id === romana.id);
    return {
      ...romana,
      proveedor,
      laboratorio,
      almacenamiento,
    };
  });
}
