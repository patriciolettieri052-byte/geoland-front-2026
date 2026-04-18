'use client'

import { AyudaPage } from './AyudaPage'
import { QueEsGeolandPage } from './QueEsGeolandPage'
import { SuscripcionPage } from './SuscripcionPage'
import { FavoritosPage } from './FavoritosPage'
import { RightPanelView } from '@/store/useGeolandStore'

interface Props {
  view: Exclude<RightPanelView, null>
  onBack: () => void
}

export function InnerPageRouter({ view, onBack }: Props) {
  const pages = {
    'ayuda': <AyudaPage onBack={onBack} />,
    'que-es-geoland': <QueEsGeolandPage onBack={onBack} />,
    'suscripcion': <SuscripcionPage onBack={onBack} />,
    'favoritos': <FavoritosPage onBack={onBack} />,
  }

  return pages[view] ?? null
}
