import { Check, Circle, Clock } from 'lucide-react';
import { flujoEtapas } from '../data/mockData';

export default function FlujoRecepcion({ etapaActual, onChange }) {
  const currentIndex = Math.max(0, flujoEtapas.indexOf(etapaActual));

  return (
    <section className="panel rounded-md p-4">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900">Flujo de recepción</h2>
          <p className="text-sm text-slate-500">Marca la etapa operacional actual del camión.</p>
        </div>
      </div>
      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {flujoEtapas.map((etapa, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          return (
            <button
              key={etapa}
              type="button"
              onClick={() => onChange?.(etapa)}
              className={`flex min-h-16 items-center gap-3 rounded-md border px-3 py-2 text-left text-sm transition ${
                active
                  ? 'border-curimapu-green bg-curimapu-field text-curimapu-green'
                  : done
                    ? 'border-green-200 bg-green-50 text-green-800'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-white">
                {done ? <Check size={16} /> : active ? <Clock size={16} /> : <Circle size={16} />}
              </span>
              <span className="font-semibold">{etapa}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
