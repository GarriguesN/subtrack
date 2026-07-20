import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';

const DB_PATH = process.env.DB_PATH || '/opt/subtrack/data/subtrack.db';

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  )`);
  return db;
}

function hashPin(pin: string): string {
  return crypto.createHash('sha256').update(pin).digest('hex');
}

// POST /api/pin - set or verify PIN
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, pin } = body;

    if (!pin || typeof pin !== 'string' || pin.length < 4 || pin.length > 10) {
      return NextResponse.json({ error: 'PIN must be 4-10 characters' }, { status: 400 });
    }

    const db = getDb();

    if (action === 'set') {
      // Set new PIN
      const hashed = hashPin(pin);
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('pin_hash', hashed);
      db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('pin_length', String(pin.length));
      return NextResponse.json({ success: true });
    }

    if (action === 'verify') {
      // Verify PIN
      const stored = db.prepare('SELECT value FROM settings WHERE key = ?').get('pin_hash') as { value: string } | undefined;
      if (!stored) {
        // No PIN set = always allowed
        return NextResponse.json({ valid: true });
      }
      const hashed = hashPin(pin);
      return NextResponse.json({ valid: hashed === stored.value });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('POST /api/pin error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/pin - check if PIN is configured
export async function GET() {
  try {
    const db = getDb();
    const stored = db.prepare('SELECT value FROM settings WHERE key = ?').get('pin_hash') as { value: string } | undefined;
    const lengthRow = db.prepare('SELECT value FROM settings WHERE key = ?').get('pin_length') as { value: string } | undefined;
    return NextResponse.json({
      configured: !!stored,
      length: lengthRow ? parseInt(lengthRow.value) : null,
    });
  } catch (error) {
    console.error('GET /api/pin error:', error);
    return NextResponse.json({ configured: false, length: null });
  }
}
