'use client';

import { Asset } from '@/lib/mockEngine';
import { motion } from 'framer-motion';
import { Bell, Heart, HelpCircle } from 'lucide-react';
import { useGeolandStore } from '@/store/useGeolandStore';
import { translations } from '@/lib/translations';
import { useAuth } from '@/hooks/useAuth';


const STRATEGY_LABELS: Record<string, string> = {
    'FIX_AND_FLIP':             'Fix & Flip',
    'VALUE_ADD':                'Value Add',
    'RENTAL_LONG_TERM':         'Renta',
    'RENTAL_SHORT_TERM':        'Renta Corta',
    'COMMERCIAL':               'Comercial',
    'DEVELOPMENT':              'Desarrollo',
    'DISTRESSED':               'Distressed',
    'LAND_BANKING':             'Land Banking',
    'AGRICULTURE':              'Agricultura',
    'LIVESTOCK':                'Ganadería',
    'MIXED_FARMLAND':           'Mixto',
    'FORESTRY':                 'Forestal',
    'BUY_AND_HOLD_APPRECIATION': 'Buy & Hold',
    'SUBDIVISION':              'Subdivisión',
    'fix_and_flip':              'Fix & Flip',
    'rental_long_term':          'Renta',
    'rental_short_term':         'Renta Corta',
    'buy_and_hold_appreciation': 'Buy & Hold',
    'development':               'Development',
    'commercial':                'Comercial',
    'agriculture':               'Agricultura',
    'livestock':                 'Ganadería',
    'mixed_farmland':            'Farmland Mixto',
    'land_banking':              'Land Banking',
    'subdivision':               'Subdivisión',
    'value_add':                 'Value Add',
    'distressed':                'Distressed',
    'forestry':                  'Forestal',
};

const ZONA_LABELS: Record<string, string> = {
    'pampa_humeda': '🌾 Pampa Húmeda',
    'nea': '🌿 NEA',
    'noa': '⛰️ NOA',
    '_default': 'Zona Argentina',
};

const AGUA_LABELS: Record<string, string> = {
    'secano': 'Secano',
    'riego_complementario': 'Riego Complementario',
    'riego_pleno': 'Riego Pleno',
};

const RANK_BADGES: Record<number, { label: string; className: string }> = {
    1: { label: 'Gold',   className: 'bg-yellow-100/90 text-yellow-700' },
    2: { label: 'Silver', className: 'bg-slate-100/90 text-slate-600'   },
    3: { label: 'Bronze', className: 'bg-orange-100/90 text-orange-700' },
};

// Semáforo unificado
function metricColor(value: number, high: number, mid: number): string {
    if (value >= high) return '#16A34A';
    if (value >= mid)  return '#D97706';
    return '#DC2626';
}

interface Layer1AssetCardProps {
    asset: Asset;
    onClick: (id: string) => void;
    rank?: number;
}

export function Layer1AssetCard({ asset, onClick, rank }: Layer1AssetCardProps) {
    const { language } = useGeolandStore();
    const t = translations[language];
    const { user } = useAuth();
    const setAuthModalOpen = useGeolandStore((state) => state.setAuthModalOpen);
    const setAuthModalView = useGeolandStore((state) => state.setAuthModalView);

    const layer1 = asset?.layer1 || {};

    const layer2 = asset?.layer2 || { metrics: { baseCapex: 0 } };

    const gScore             = layer1.gScore ?? (asset as any).aqs_score ?? 0;
    const expectedIrr        = layer1.expectedIrr ?? 0;
    const backgroundImageUrl = layer1.backgroundImageUrl ?? '';
    const precio             = layer2.metrics?.baseCapex ?? 0;
    const strategyLabel      = STRATEGY_LABELS[asset.strategy] ?? asset.strategy;
    const roiPct             = expectedIrr ? expectedIrr * 100 : null;

    const formatPrecio = (n: number) => {
        if (!n || n === 0) return '—';
        return `${n.toLocaleString('es-ES')} USD`;
    };

    const badge = rank && rank <= 3 ? RANK_BADGES[rank] : null;

    const gScoreColor = metricColor(gScore, 75, 50);
    const roiColor    = roiPct !== null ? metricColor(roiPct, 15, 8) : '#9CA3AF';

    const confRaw = (asset as any).confidenceScore ?? (asset.confidence ? asset.confidence * 100 : null);
    const confVal = confRaw !== null ? Number(confRaw) : null;
    const confColor = confVal !== null ? metricColor(confVal, 75, 50) : '#9CA3AF';

    // Anillo SVG — mismo alto que los números (52px)
    const RING = 52;
    const r = 20;
    const circ = 2 * Math.PI * r;
    const dash = confVal !== null ? (confVal / 100) * circ : 0;

    // Estilo compartido para los 3 grupos de métricas — labels alineados desde el tope
    const metricGroup: React.CSSProperties = {
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        height: '56px', // Align everything to the height of the largest metric (Conf. Ring)
        gap: '4px',
    };

    const labelStyle: React.CSSProperties = {
        fontSize: '8px',
        fontWeight: 600,
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: '#9CA3AF',
        lineHeight: 1,
    };

    const numStyle = (color: string): React.CSSProperties => ({
        fontSize: '27px',
        fontWeight: 300,
        lineHeight: 1,
        letterSpacing: '-0.03em',
        fontVariantNumeric: 'tabular-nums',
        color,
    });

    const divider: React.CSSProperties = {
        width: '1px',
        height: '36px',
        backgroundColor: '#F3F4F6',
        flexShrink: 0,
    };

    return (
        <motion.div
            className="flex flex-row items-stretch h-[128px] rounded-xl overflow-hidden cursor-pointer"
            style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}
            whileHover={{ scale: 1.008, y: -1, boxShadow: '0 4px 16px rgba(0,0,0,0.10)' }}
            onClick={() => {
                if (!user) {
                    setAuthModalView('register');
                    setAuthModalOpen(true);
                    return;
                }
                onClick(asset.id);
            }}
            transition={{ type: 'spring', stiffness: 350, damping: 25 }}

        >

            {/* ── FOTO 22% ─────────────────────────────────────────── */}
            <div className="relative shrink-0" style={{ width: '22%' }}>
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url(${backgroundImageUrl})`, opacity: 0.85 }}
                />
                {badge && (
                    <div className={`absolute top-2 left-2 text-[9px] font-semibold px-2 py-0.5 rounded-md tracking-widest uppercase shadow-sm ${badge.className}`}>
                        {t.header.rank[badge.label as keyof typeof t.header.rank] || badge.label}
                    </div>
                )}
                <div className="absolute top-2 right-2 flex gap-1">
                    <button onClick={(e) => e.stopPropagation()} className="w-6 h-6 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                        <Bell size={10} style={{ color: '#374151' }} />
                    </button>
                    <button onClick={(e) => e.stopPropagation()} className="w-6 h-6 flex items-center justify-center rounded-full" style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
                        <Heart size={10} style={{ color: '#374151' }} />
                    </button>
                </div>
                <div className="absolute bottom-2 left-2 flex gap-1">
                    <span className="text-[9px] px-1.5 py-0.5 rounded text-white/90" style={{ backgroundColor: 'rgba(0,0,0,0.55)' }}>
                        {strategyLabel}
                    </span>
                    {(asset as any).datos_estimados && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#FFFBEB', color: '#92400E', border: '1px solid #FDE68A', fontWeight: 600 }}>
                            Datos parciales
                        </span>
                    )}
                </div>
            </div>

            {/* ── CENTRO 38% ───────────────────────────────────────── */}
            <div className="flex flex-col justify-center px-4 shrink-0" style={{ width: '38%', borderRight: '1px solid #F3F4F6' }}>
                <p style={{ fontSize: '9px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.15em', color: '#000000', marginBottom: '2px' }}>
                    {asset.location}
                </p>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', lineHeight: 1.3, marginBottom: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {asset.etiqueta_operacion ?? asset.location}
                </p>
                {(asset as any).assetType && (
                    <div style={{ marginBottom: '6px' }}>
                        <span style={{ fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', backgroundColor: '#F3F4F6', color: '#6B7280', padding: '2px 6px', borderRadius: '4px' }}>
                            {(asset as any).assetType}
                        </span>
                    </div>
                )}
                <div>
                    <p style={{ fontSize: '8px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#9CA3AF' }}>{t.assetCard.price}</p>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: '#0F1117', fontVariantNumeric: 'tabular-nums' }}>{formatPrecio(precio)}</p>
                </div>
                {(asset.strategy === 'FARMLAND' || asset.strategy === 'LIVESTOCK') && (
                    <div style={{ display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {asset.zona_agroecologica && (
                            <span style={{ fontSize: '8px', fontWeight: 500, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#ECFDF5', color: '#065F46', border: '1px solid #A7F3D0' }}>
                                {ZONA_LABELS[asset.zona_agroecologica]}
                            </span>
                        )}
                        {asset.acceso_agua && (
                            <span style={{ fontSize: '8px', fontWeight: 500, padding: '2px 6px', borderRadius: '4px', backgroundColor: '#EFF6FF', color: '#1D4ED8', border: '1px solid #BFDBFE' }}>
                                {AGUA_LABELS[asset.acceso_agua]}
                            </span>
                        )}
                    </div>
                )}
            </div>

            {/* ── MÉTRICAS 40% — G-Score | ROI | Confidence en fila ── */}
            <div style={{
                width: '40%',
                flexShrink: 0,
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                padding: '0 16px',
            }}>

                {/* G-SCORE */}
                <div style={metricGroup}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                        <span style={labelStyle}>G-Score</span>
                        <HelpCircle size={8} color="#D1D5DB" />
                    </div>
                    <span style={numStyle(gScoreColor)}>{gScore}</span>
                </div>

                <div style={divider} />

                {/* ROI EST. */}
                <div style={metricGroup}>
                    <span style={labelStyle}>ROI EST.</span>
                    <span style={numStyle(roiColor)}>{roiPct !== null ? `${roiPct.toFixed(1)}%` : '—'}</span>
                </div>

                <div style={divider} />

                {/* CONFIDENCE RING */}
                <div style={metricGroup}>
                    <span style={labelStyle}>Confidence</span>
                    {confVal !== null ? (
                        <div style={{ position: 'relative', width: '44px', height: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <svg width={44} height={44} viewBox="0 0 44 44" style={{ position: 'absolute', top: 0, left: 0 }}>
                                <circle cx={22} cy={22} r={18} fill="none" stroke="#F3F4F6" strokeWidth="3" />
                                <circle
                                    cx={22} cy={22} r={18}
                                    fill="none"
                                    stroke={confColor}
                                    strokeWidth="3"
                                    strokeDasharray={`${(confVal / 100) * (2 * Math.PI * 18)} ${2 * Math.PI * 18}`}
                                    strokeDashoffset={(2 * Math.PI * 18) * 0.25}
                                    strokeLinecap="round"
                                />
                            </svg>
                            <span style={{ fontSize: '11px', fontWeight: 500, fontVariantNumeric: 'tabular-nums', color: confColor, position: 'relative', zIndex: 1 }}>
                                {confVal.toFixed(0)}%
                            </span>
                        </div>
                    ) : (
                        <span style={{ fontSize: '13px', color: '#D1D5DB' }}>—</span>
                    )}
                </div>

            </div>

        </motion.div>
    );
}
