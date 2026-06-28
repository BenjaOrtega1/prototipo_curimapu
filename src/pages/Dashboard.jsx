import {
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  ClipboardList,
  FileSpreadsheet,
  FlaskConical,
  Gauge,
  PackageCheck,
  Radar,
  Scale,
  Sparkles,
  Table2,
  Truck,
  Warehouse,
} from 'lucide-react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { motion, useReducedMotion } from 'motion/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import AnimatedNumber from '../components/AnimatedNumber.jsx';
import EmptyState from '../components/EmptyState.jsx';
import ExportButtons from '../components/ExportButtons.jsx';
import Logo from '../components/Logo.jsx';
import PremiumSkeleton from '../components/PremiumSkeleton.jsx';
import { buildGeneralRows } from '../components/PlanillaGeneral.jsx';
import StatusBadge from '../components/StatusBadge.jsx';
import { containerStagger, itemReveal, pressableMotion } from '../lib/motionSystem';
import { listRomana } from '../services/romanaService';
import { exportExcel } from '../utils/exporters';
import { humedadAlerta, number } from '../utils/formatters';

gsap.registerPlugin(ScrollTrigger);

const quickActions = [
  { label: 'Nuevo pesaje', to: '/romana', icon: Scale, primary: true },
  { label: 'Analisis', to: '/laboratorio', icon: FlaskConical },
  { label: 'Almacenar', to: '/almacenamiento', icon: Warehouse },
  { label: 'Planilla', to: '/planilla', icon: Table2 },
];

const flow = [
  { key: 'romana', label: 'Romana', to: '/romana', icon: Truck, helper: 'Ingreso y pesaje' },
  { key: 'laboratorio', label: 'Laboratorio', to: '/laboratorio', icon: FlaskConical, helper: 'Muestra y resultado' },
  { key: 'almacenamiento', label: 'Almacenamiento', to: '/almacenamiento', icon: Warehouse, helper: 'Destino operativo' },
  { key: 'planilla', label: 'Planilla', to: '/planilla', icon: ClipboardList, helper: 'Trazabilidad total' },
];

export default function Dashboard() {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const heroRef = useRef(null);
  const captureRef = useRef(null);
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    listRomana().then(setRecords).finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (reduceMotion || !heroRef.current) return undefined;

    const context = gsap.context(() => {
      const timeline = gsap.timeline({
        defaults: { ease: 'power3.out' },
        scrollTrigger: { trigger: heroRef.current, start: 'top 78%', once: true },
      });

      timeline
        .from('.ops-hero__brand', { y: 14, opacity: 0, duration: 0.38 })
        .from('.ops-hero__copy > *', { y: 18, opacity: 0, stagger: 0.06, duration: 0.42 }, '-=0.2')
        .from('.ops-hero__actions > *', { y: 12, opacity: 0, stagger: 0.05, duration: 0.32 }, '-=0.2')
        .from('.ops-command', { x: 24, opacity: 0, duration: 0.46 }, '-=0.18');

      gsap.to('.ops-hero__mesh', {
        yPercent: -14,
        rotate: 2,
        ease: 'none',
        scrollTrigger: { trigger: heroRef.current, start: 'top top', end: 'bottom top', scrub: 0.8 },
      });
    });

    return () => context.revert();
  }, [reduceMotion]);

  const today = new Date().toISOString().slice(0, 10);
  const rows = useMemo(() => buildGeneralRows(records), [records]);
  const rejectedRows = records.filter((row) => row.estado === 'Rechazado');
  const alertas = records.filter((item) => Number(item.laboratorio?.humedad || 0) > humedadAlerta);
  const latest = records.slice(0, 8);

  const stats = {
    totalCamiones: records.filter((item) => item.fecha_ingreso === today).length,
    kilos: records.reduce((sum, item) => sum + Number(item.peso_entrada || 0), 0),
    pendientes: records.filter((item) => item.estado === 'Pendiente de laboratorio').length,
    aprobadas: records.filter((item) => item.laboratorio?.resultado === 'Aprobado').length,
    rechazadas: rejectedRows.length,
    almacenamiento: records.filter((item) => item.almacenamiento).length,
  };

  const stageCounts = {
    romana: records.length,
    laboratorio: stats.pendientes,
    almacenamiento: stats.almacenamiento,
    planilla: rows.length,
  };
  const completion = records.length ? Math.round((stats.almacenamiento / records.length) * 100) : 0;
  const health = Math.max(0, 100 - alertas.length * 12 - rejectedRows.length * 8);
  const nextAction = stats.pendientes > 0
    ? { label: 'Priorizar laboratorio', to: '/laboratorio', detail: `${stats.pendientes} registros esperan analisis`, icon: FlaskConical }
    : records.length === 0
      ? { label: 'Crear primer ingreso', to: '/romana', detail: 'Comienza la trazabilidad desde romana', icon: Scale }
      : { label: 'Revisar planilla', to: '/planilla', detail: 'Consolidado listo para exportar', icon: Table2 };
  const NextIcon = nextAction.icon;

  return (
    <div className="dashboard-redesign" ref={captureRef}>
      <section ref={heroRef} className="ops-hero">
        <div className="ops-hero__mesh" aria-hidden="true" />
        <div className="ops-hero__grid" aria-hidden="true" />

        <div className="ops-hero__copy">
          <div className="ops-hero__brand">
            <Logo size="md" />
            <span><Radar size={15} /> Operacion en vivo</span>
          </div>
          <h1>Centro operativo Curimapu</h1>
          <p>
            Una vista ejecutiva para decidir rapido: recepcion, laboratorio, almacenamiento, alertas y planilla en un solo flujo.
          </p>
          <div className="ops-hero__actions">
            {quickActions.map(({ label, to, icon: Icon, primary }) => (
              <Link key={label} className={`ops-action ${primary ? 'is-primary' : ''}`} to={to}>
                <Icon size={18} />
                {label}
              </Link>
            ))}
          </div>
        </div>

        <aside className="ops-command">
          <div className="ops-command__top">
            <div>
              <p>Accion sugerida</p>
              <h2>{nextAction.label}</h2>
            </div>
            <span><Sparkles size={16} /></span>
          </div>
          <p className="ops-command__detail">{nextAction.detail}</p>
          <Link className="ops-command__button" to={nextAction.to}>
            <NextIcon size={18} />
            Abrir modulo
            <ArrowRight size={17} />
          </Link>
          <div className="ops-command__dial" style={{ '--value': `${completion}%` }}>
            <div>
              <strong><AnimatedNumber value={completion} suffix="%" /></strong>
              <span>avance a destino</span>
            </div>
          </div>
        </aside>
      </section>

      <motion.section className="ops-metrics" variants={containerStagger} initial="hidden" animate="show">
        <Metric label="Camiones hoy" value={stats.totalCamiones} icon={Truck} tone="green" />
        <Metric label="Kilos recibidos" value={stats.kilos} suffix=" kg" icon={Gauge} tone="ink" />
        <Metric label="Pendientes lab" value={stats.pendientes} icon={FlaskConical} tone="amber" />
        <Metric label="Salud operativa" value={health} suffix="%" icon={CheckCircle2} tone="blue" />
      </motion.section>

      <div className="ops-layout">
        <motion.section className="ops-panel ops-panel--flow" variants={itemReveal} initial="hidden" animate="show">
          <PanelHeader eyebrow="Flujo operativo" title="Trazabilidad sin friccion" action={<ExportButtons rows={rows} captureRef={captureRef} compact />} />
          <div className="ops-flow">
            {flow.map(({ key, label, to, icon: Icon, helper }, index) => (
              <Link key={key} to={to} className="ops-flow__item">
                <span className="ops-flow__index">{String(index + 1).padStart(2, '0')}</span>
                <span className="ops-flow__icon"><Icon size={20} /></span>
                <span className="ops-flow__content">
                  <strong>{label}</strong>
                  <small>{helper}</small>
                </span>
                <span className="ops-flow__count"><AnimatedNumber value={stageCounts[key]} /></span>
              </Link>
            ))}
          </div>
        </motion.section>

        <motion.section className="ops-panel ops-panel--alerts" variants={itemReveal} initial="hidden" animate="show">
          <PanelHeader eyebrow="Riesgo" title="Alertas activas" action={<Link to="/planilla" className="ops-mini-link">Ver planilla</Link>} />
          {loading ? (
            <PremiumSkeleton rows={3} />
          ) : alertas.length === 0 && rejectedRows.length === 0 ? (
            <div className="ops-clear-state">
              <PackageCheck size={28} />
              <strong>Sin alertas criticas</strong>
              <span>Los registros visibles estan dentro de parametros.</span>
            </div>
          ) : (
            <div className="ops-alert-list">
              {alertas.slice(0, 4).map((row) => (
                <AlertCard key={`humedad-${row.id}`} title="Humedad alta" detail={`${row.patente} - ${row.proveedor_nombre}`} meta={`${number(row.laboratorio?.humedad, 1)}%`} tone="amber" />
              ))}
              {rejectedRows.slice(0, 3).map((row) => (
                <AlertCard key={`rechazo-${row.id}`} title="Registro rechazado" detail={`${row.patente} - ${row.proveedor_nombre}`} meta="Revisar" tone="red" />
              ))}
            </div>
          )}
        </motion.section>

        <motion.section className="ops-panel ops-panel--activity" variants={itemReveal} initial="hidden" animate="show">
          <PanelHeader eyebrow="Actividad" title="Ultimos movimientos" action={<Link to="/romana" className="ops-mini-link">Nuevo ingreso</Link>} />
          {loading ? (
            <PremiumSkeleton rows={5} />
          ) : latest.length === 0 ? (
            <EmptyState title="Sin movimientos todavia" description="Ingresa el primer camion para activar el tablero." />
          ) : (
            <motion.div className="ops-activity" variants={containerStagger} initial="hidden" animate="show">
              {latest.map((row) => (
                <motion.div
                  key={row.id}
                  className="ops-activity__row"
                  layout
                  variants={itemReveal}
                  whileHover={reduceMotion ? undefined : { x: 4 }}
                  whileTap={reduceMotion ? undefined : pressableMotion.whileTap}
                  transition={pressableMotion.transition}
                >
                  <div className="ops-activity__plate">{row.patente || 'S/P'}</div>
                  <div className="ops-activity__main">
                    <strong>{row.proveedor_nombre || 'Proveedor sin nombre'}</strong>
                    <span>{row.chofer || 'Chofer no informado'} - {row.fecha_ingreso} {row.hora_ingreso}</span>
                  </div>
                  <div className="ops-activity__weight">{number(row.peso_entrada)} kg</div>
                  <StatusBadge value={row.estado} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.section>

        <motion.section className="ops-panel ops-panel--export" variants={itemReveal} initial="hidden" animate="show">
          <PanelHeader eyebrow="Salida" title="Datos listos" />
          <div className="ops-export">
            <div>
              <span>Registros consolidados</span>
              <strong><AnimatedNumber value={rows.length} /></strong>
            </div>
            <button className="ops-export__button" onClick={() => exportExcel(rows)}>
              <FileSpreadsheet size={18} />
              Exportar Excel
            </button>
          </div>
        </motion.section>
      </div>
    </div>
  );
}

function Metric({ label, value, suffix = '', icon: Icon, tone }) {
  return (
    <motion.article className={`ops-metric ops-metric--${tone}`} variants={itemReveal}>
      <span className="ops-metric__icon"><Icon size={20} /></span>
      <div>
        <p>{label}</p>
        <strong><AnimatedNumber value={value} suffix={suffix} /></strong>
      </div>
    </motion.article>
  );
}

function PanelHeader({ eyebrow, title, action }) {
  return (
    <div className="ops-panel__header">
      <div>
        <span>{eyebrow}</span>
        <h2>{title}</h2>
      </div>
      {action}
    </div>
  );
}

function AlertCard({ title, detail, meta, tone }) {
  return (
    <div className={`ops-alert ops-alert--${tone}`}>
      <AlertTriangle size={18} />
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <em>{meta}</em>
    </div>
  );
}
