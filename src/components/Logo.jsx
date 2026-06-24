import { useState } from 'react';

const logoUrl = '/logo.png';

export default function Logo({ size = 'md', showText = true }) {
  const [failed, setFailed] = useState(false);
  const sizes = {
    sm: 'h-8',
    md: 'h-12',
    lg: 'h-16',
    xl: 'h-24',
  };

  return (
    <div className="flex items-center gap-3">
      {!failed ? (
        <img
          src={logoUrl}
          alt="Curimapu"
          className={`${sizes[size]} w-auto object-contain`}
          onError={() => setFailed(true)}
        />
      ) : (
        <div className={`${sizes[size]} flex items-center rounded-md bg-curimapu-green px-3 font-bold tracking-wide text-white`}>
          CURIMAPU
        </div>
      )}
      {showText && (
        <div className="leading-tight">
          <p className="font-bold text-curimapu-dark">CURIMAPU</p>
          <p className="text-xs text-slate-500 dark:text-slate-400">Chillán</p>
        </div>
      )}
    </div>
  );
}
