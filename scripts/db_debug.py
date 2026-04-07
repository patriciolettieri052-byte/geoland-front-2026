import sqlite3
import os
import traceback

# Try both absolute and relative paths
db_paths = [
    r'c:\Users\59892\Desktop\BACKEND GEOLAND\geoland.db',
    r'..\BACKEND GEOLAND\geoland.db',
    'geoland.db'
]

def diagnose():
    db_path = None
    for p in db_paths:
        if os.path.exists(p):
            db_path = p
            break
            
    if not db_path:
        print(f"❌ DB file not found in any of: {db_paths}")
        try:
            print(f"Listing ..: {os.listdir('..')}")
        except:
            pass
        return

    print(f"Checking DB at: {db_path}")
    try:
        conn = sqlite3.connect(db_path)
        cur = conn.cursor()
        
        cur.execute("SELECT name FROM sqlite_master WHERE type='table';")
        tables = [t[0] for t in cur.fetchall()]
        print(f"Tables: {tables}")

        if 'assets' in tables:
            cur.execute("SELECT count(*) FROM assets")
            count = cur.fetchone()[0]
            print(f"✅ Assets in DB: {count}")
            
            cur.execute("SELECT asset_id, mercado, strategy, aqs_score FROM assets LIMIT 10")
            rows = cur.fetchall()
            print("\nSample Assets:")
            for r in rows:
                print(f"  ID: {r[0]}, Mercado: {r[1]}, Strategy: {r[2]}, AQS: {r[3]}")
        else:
            print("❌ 'assets' table MISSING!")

        if 'audit_log' in tables:
            cur.execute("SELECT count(*) FROM audit_log")
            audit_count = cur.fetchone()[0]
            print(f"✅ Audit logs in DB: {audit_count}")
            
            cur.execute("SELECT asset_id, stop_reason FROM audit_log ORDER BY created_at DESC LIMIT 5")
            audits = cur.fetchall()
            print("\nRecent Pipeline Discards (Audit Log):")
            for a in audits:
                print(f"  ID: {a[0]}, Reason: {a[1]}")
            
        conn.close()
    except Exception as e:
        print(f"❌ Error: {e}")
        traceback.print_exc()

if __name__ == "__main__":
    diagnose()
