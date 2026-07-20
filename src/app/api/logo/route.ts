import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || '/opt/subtrack/data/subtrack.db';

function getDb() {
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.exec(`CREATE TABLE IF NOT EXISTS logos (
    name TEXT PRIMARY KEY,
    logo_url TEXT NOT NULL DEFAULT '',
    candidates TEXT DEFAULT '[]',
    updated_at TEXT DEFAULT (datetime('now'))
  )`);
  return db;
}

const TLDS = [
  '.com', '.es', '.io', '.org', '.net', '.app', '.dev', '.co', '.ai',
  '.uk', '.de', '.fr', '.it', '.jp', '.cn', '.br', '.au', '.ca', '.nl',
  '.eu', '.ru', '.in', '.info', '.online', '.xyz', '.me', '.tv', '.fm',
  '.design', '.cloud', '.tech', '.digital', '.software', '.solutions',
  '.io', '.co.uk', '.com.au', '.com.es',
];

// Maximum number of combinations to try
const MAX_RESULTS = 20;

// Generate as many domain candidates as possible from a name
function generateDomains(companyName: string): string[] {
  const domains: string[] = [];
  const words = companyName.toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 0);
  const slug = companyName.toLowerCase().replace(/[^a-z0-9]/g, '').trim();

  if (slug) domains.push(slug);

  // Individual words (if multi-word)
  words.forEach(w => {
    if (w.length > 2 && !domains.includes(w)) domains.push(w);
  });

  // All word combinations
  if (words.length >= 2) {
    for (let len = 1; len <= Math.min(words.length, 3); len++) {
      for (let start = 0; start <= words.length - len; start++) {
        const combo = words.slice(start, start + len).join('');
        if (combo.length > 2 && !domains.includes(combo)) domains.push(combo);
      }
    }
    // Also reversed combinations
    for (let i = 0; i < words.length; i++) {
      for (let j = i + 1; j < words.length; j++) {
        const rev = words[j] + words[i];
        if (rev.length > 2 && !domains.includes(rev)) domains.push(rev);
      }
    }
  }

  // Common prefixes
  const prefixed: string[] = [];
  domains.forEach(d => {
    ['', 'get', 'go', 'my', 'the', 'app', 'use', 'try'].forEach(pre => {
      const pd = pre + d;
      if (!domains.includes(pd) && !prefixed.includes(pd)) prefixed.push(pd);
    });
  });
  domains.push(...prefixed);

  return [...new Set(domains)].filter(d => d.length > 2);
}

// Search for logos using Google Favicons
async function searchFavicons(domains: string[]): Promise<string[]> {
  const found: string[] = [];

  for (const domain of domains) {
    for (const tld of TLDS) {
      const fullDomain = domain.includes('.') ? domain : domain + tld;
      try {
        const url = `https://www.google.com/s2/favicons?domain=${fullDomain}&sz=64`;
        const res = await fetch(url, { signal: AbortSignal.timeout(2000) });
        if (res.ok) {
          const blob = await res.blob();
          if (blob.size > 200 && !found.includes(url)) {
            found.push(url);
          }
        }
      } catch {}
      if (found.length >= MAX_RESULTS) break;
    }
    if (found.length >= MAX_RESULTS) break;
  }
  return found;
}

export async function GET(request: NextRequest) {
  try {
    const name = request.nextUrl.searchParams.get('name');
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'name query param required' }, { status: 400 });
    }

    const db = getDb();
    const trimmedName = name.trim();

    // Check cache
    const cached = db.prepare('SELECT logo_url, candidates FROM logos WHERE name = ?').get(trimmedName) as { logo_url: string; candidates: string } | undefined;
    if (cached && cached.candidates && cached.candidates !== '[]') {
      return NextResponse.json({
        logo: cached.logo_url,
        logos: JSON.parse(cached.candidates),
      });
    }

    // Generate domains and search
    const domains = generateDomains(trimmedName);
    console.log(`Logo search for "${trimmedName}": ${domains.length} domain candidates`);
    const logos = await searchFavicons(domains);
    const primary = logos[0] || '';

    // Cache
    db.prepare('INSERT OR REPLACE INTO logos (name, logo_url, candidates, updated_at) VALUES (?, ?, ?, datetime(\'now\'))')
      .run(trimmedName, primary, JSON.stringify(logos));

    return NextResponse.json({ logo: primary, logos });
  } catch (error) {
    console.error('GET /api/logo error:', error);
    return NextResponse.json({ logo: '', logos: [] });
  }
}

// PUT /api/logo - save a user-selected logo (persists to DB)
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, logoUrl } = body;

    if (!name || !logoUrl) {
      return NextResponse.json({ error: 'name and logoUrl required' }, { status: 400 });
    }

    const db = getDb();
    const trimmedName = name.trim();

    // Upsert: save the user's selection as primary logo
    const existing = db.prepare('SELECT candidates FROM logos WHERE name = ?').get(trimmedName) as { candidates: string } | undefined;
    let candidates: string[] = existing ? JSON.parse(existing.candidates) : [];
    if (!candidates.includes(logoUrl)) {
      candidates = [logoUrl, ...candidates.slice(0, 19)]; // keep max 20
    }

    db.prepare('INSERT OR REPLACE INTO logos (name, logo_url, candidates, updated_at) VALUES (?, ?, ?, datetime(\'now\'))')
      .run(trimmedName, logoUrl, JSON.stringify(candidates));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('PUT /api/logo error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
