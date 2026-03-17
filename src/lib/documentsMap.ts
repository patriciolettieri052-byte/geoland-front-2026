import { DocumentItem } from "./mockEngine";

export const DOCUMENTS_MAP: Record<string, DocumentItem[]> = {
    "ES_MAD_88": [
        { id: '1', name: 'Technical structural inspection', type: 'pdf', size: '2.4 MB', secured: true },
        { id: '2', name: 'Renovation budget (EUR)', type: 'xls', size: '850 KB', secured: true },
    ],
    "AE_DXB_89": [
        { id: '1', name: 'Master developer SPA (Tax-Free)', type: 'pdf', size: '4.7 MB', secured: true },
        { id: '2', name: 'Escrow account verification', type: 'pdf', size: '1.2 MB', secured: true },
    ],
    "US_MIA_94": [
        { id: '1', name: 'Sq.Ft to Sq.M yield analysis', type: 'xls', size: '1.2 MB', secured: true },
        { id: '2', name: 'USD Tenancy & HOA study', type: 'pdf', size: '4.2 MB', secured: true },
    ],
    "AR_BUE_84": [
        { id: '1', name: 'Macro-economic risk hedge strategy', type: 'pdf', size: '5.2 MB', secured: true },
        { id: '2', name: 'Local currency exposure plan', type: 'pdf', size: '12 MB', secured: true },
    ],
};
