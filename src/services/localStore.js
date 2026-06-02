import { almacenamientoMock, configuracionMock, laboratorioMock, proveedoresMock, romanaMock } from '../data/realFlowMock';

const STORAGE_KEY = 'curimapu_recepcion_cereales_v2';

function seed() {
  return {
    proveedores: proveedoresMock,
    romana: romanaMock,
    laboratorio: laboratorioMock,
    almacenamiento: almacenamientoMock,
    configuracion: configuracionMock,
  };
}

export function getStore() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    const initial = seed();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(initial));
    return initial;
  }
  return JSON.parse(raw);
}

export function setStore(nextStore) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextStore));
  return nextStore;
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
