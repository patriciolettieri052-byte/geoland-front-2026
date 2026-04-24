'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { useGeolandStore } from '@/store/useGeolandStore';
import { useAuth } from '@/hooks/useAuth';
import { 
  STRATEGY_KEY_MAP, 
  STRATEGY_CARD_METRICS, 
  formatMetric, 
  getConfidenceBadge 
} from './layer1.config';

interface Layer1AssetCardProps {
    asset: any; 
    onClick: (id: string) => void;
    rank?: number;
}

export function Layer1AssetCard({ asset, onClick, rank }: Layer1AssetCardProps) {
    const { user } = useAuth();
    const setAuthModalOpen = useGeolandStore((state) => state.setAuthModalOpen);
    const setAuthModalView = useGeolandStore((state) => state.setAuthModalView);

    // Mapeo de estrategia
    const strategyRaw = asset.strategy || asset.estrategia || 'RENTAL_LONG_TERM';
    const strategyKey = STRATEGY_KEY_MAP[strategyRaw] || strategyRaw;
    const metricsConfig = STRATEGY_CARD_METRICS[strategyKey] || STRATEGY_CARD_METRICS.RENTAL_LONG_TERM;
    
    // Datos de la Layer 2
    const layer2Metrics = asset.layer2?.metrics || {};
    
    // G-Score y Confianza
    const gScore = asset.g_score || asset.layer1?.gScore || 0;
    const confidence = asset.confidence_final || asset.confidence || 0.5;
    const badge = getConfidenceBadge(confidence);
    
    // Visuales
    const foto = asset.photo_urls?.[0] || asset.fotos_urls?.[0] || asset.layer1?.backgroundImageUrl || '/placeholder.jpg';
    
    // Formateo de precio y superficie estilo mockup
    const precioRaw = asset.precio_usd || asset.layer2?.metrics?.precio_usd;
    const precio = precioRaw
        ? `$${(precioRaw / 1000).toFixed(0)}K USD` 
        : '—';
    
    const superficie = asset.superficie_m2 || asset.layer2?.metrics?.superficie_m2;
    const location = asset.barrio || asset.location || asset.mercado || 'MERCADO GLOBAL';
    const title = asset.nombre || asset.descripcion?.substring(0, 60) || 'Sin descripción';
    
    const barraWidth = `${Math.min(gScore, 99)}%`;

    const handleCardClick = () => {
        if (!user) {
            setAuthModalView('register');
            setAuthModalOpen(true);
            return;
        }
        onClick(asset.id || asset.asset_id);
    };

    return (
        <motion.div
            onClick={handleCardClick}
            style={{
                width: '100%',
                height: 140,
                background: '#FFFFFF',
                borderRadius: 16,
                display: 'flex',
                overflow: 'hidden',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid #F3F4F6',
                cursor: 'pointer',
                marginBottom: 16,
            }}
            whileHover={{ 
                scale: 1.005, 
                translateY: -2, 
                boxShadow: '0 10px 30px rgba(0,0,0,0.08)' 
            }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        >
            {/* COL 1 — FOTO 22% */}
            <div style={{
                width: '22%',
                position: 'relative',
                backgroundImage: `url(${foto})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                flexShrink: 0,
            }}>
                {/* Confidence indicator */}
                <div style={{
                    position: 'absolute', top: 10, left: 10,
                    background: 'rgba(255,255,255,0.9)',
                    padding: '3px 8px', borderRadius: 20,
                    display: 'flex', alignItems: 'center', gap: 4,
                    fontSize: 9, fontWeight: 600, color: badge.color,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                }}>
                    <div style={{ width: 5, height: 5, background: badge.color, borderRadius: '50%' }} />
                    {badge.label}
                </div>
                {/* Strategy badge */}
                <div style={{
                    position: 'absolute', bottom: 10, left: 10,
                    background: 'rgba(0,0,0,0.6)', color: 'white',
                    fontSize: 9, padding: '3px 8px', borderRadius: 4,
                    textTransform: 'uppercase', fontWeight: 600, letterSpacing: '0.05em',
                }}>
                    {strategyKey.replace(/_/g, ' ')}
                </div>
            </div>

            {/* COL 2 — INFO + G-SCORE 43% */}
            <div style={{
                width: '43%',
                padding: '18px 24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                borderRight: '1px solid #F3F4F6',
            }}>
                <div style={{
                    fontSize: 9, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.15em', color: '#000000', marginBottom: 4,
                }}>
                    {location}
                </div>
                <p style={{
                    fontSize: 14, fontWeight: 500, color: '#6B7280',
                    margin: '0 0 6px 0', whiteSpace: 'nowrap',
                    overflow: 'hidden', textOverflow: 'ellipsis',
                }}>
                    {title}
                </p>
                <div style={{
                    fontSize: 13, fontWeight: 700, color: '#0F1117', marginBottom: 14,
                }}>
                    {precio}{superficie ? ` · ${superficie} m²` : ''}
                </div>

                {/* G-Score box */}
                <div style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 5 }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: '#9CA3AF', letterSpacing: '0.1em' }}>
                            G-SCORE
                        </span>
                        <span style={{ fontSize: 20, fontWeight: 300, lineHeight: '0.8', color: '#16A34A' }}>
                            {gScore}
                        </span>
                    </div>
                    <div style={{ width: '100%', height: 4, background: '#F3F4F6', borderRadius: 10 }}>
                        <div style={{ height: '100%', background: '#16A34A', width: barraWidth, borderRadius: 10 }} />
                    </div>
                </div>
            </div>

            {/* COL 3 — METRICS 35% */}
            <div style={{
                width: '35%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-evenly',
                padding: '0 10px',
                background: '#FAFAFA',
            }}>
                {metricsConfig.map((metric, i) => (
                    <React.Fragment key={metric.field}>
                        {i > 0 && (
                            <div style={{ width: 1, height: 40, background: '#E5E7EB' }} />
                        )}
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                            <span style={{
                                fontSize: 8, fontWeight: 600, textTransform: 'uppercase',
                                letterSpacing: '0.1em', color: '#9CA3AF',
                            }}>
                                {metric.label}
                            </span>
                            <span style={{
                                fontSize: 24, fontWeight: 300, letterSpacing: '-0.03em', color: '#0F1117',
                            }}>
                                {formatMetric(layer2Metrics[metric.field], metric.format, metric.suffix)}
                            </span>
                        </div>
                    </React.Fragment>
                ))}
            </div>
        </motion.div>
    );
}
