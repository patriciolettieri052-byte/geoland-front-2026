// Using global fetch (available in Node 18+)

const API_URL = 'https://geoland-backend-final.onrender.com';
const API_KEY = 'geoland-dev-key-abc123';

async function diagnose() {
    console.log(`🔍 Diagnosing backend at ${API_URL}...`);
    
    try {
        const healthRes = await fetch(`${API_URL}/api/v1/health`, {
            headers: { 'x-api-key': API_KEY }
        });
        const health = await healthRes.json();
        console.log('✅ Health status:', health);

        const auditRes = await fetch(`${API_URL}/api/v1/match/audit`, {
            headers: { 'x-api-key': API_KEY }
        });
        const audits = await auditRes.json();
        console.log('✅ Recent Audits (Discards):', audits.slice(0, 5));

        console.log('🧪 Testing Match: mercado=Madrid, strategy=RENTAL_LONG_TERM, min_aqs=45...');
        const matchRes = await fetch(`${API_URL}/api/v1/match/search?mercado=Madrid&strategy=RENTAL_LONG_TERM&min_aqs=45`, {
            headers: { 'x-api-key': API_KEY }
        });
        const matches = await matchRes.json();
        console.log('✅ Match Results:', {
            count: matches.count,
            first_ids: matches.results?.slice(0, 3).map(r => r.asset_id) || []
        });

    } catch (error) {
        console.error('❌ Error during diagnosis:', error.message);
    }
}

diagnose();
