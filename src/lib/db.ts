import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DB_PATH = process.env.DB_PATH || '/opt/subtrack/data/subtrack.db';

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (!db) {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    db = new Database(DB_PATH);
    db.pragma('journal_mode = WAL');
    db.pragma('foreign_keys = ON');
    initializeSchema(db);
  }
  return db;
}

function initializeSchema(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS expenses (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      amount REAL NOT NULL,
      category TEXT NOT NULL CHECK(category IN ('IA','Coche','Streaming','Ocio','Comida','Hogar','Salud','Otros')),
      period TEXT NOT NULL DEFAULT 'monthly' CHECK(period IN ('monthly','quarterly','semi-annual','annual','one-time')),
      date TEXT NOT NULL,
      notes TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    )
  `);
  // Add column if upgrading from older schema
  try {
    db.exec("ALTER TABLE expenses ADD COLUMN period TEXT NOT NULL DEFAULT 'monthly' CHECK(period IN ('monthly','quarterly','semi-annual','annual','one-time'))");
  } catch {
    // Column already exists
  }
}

export interface Expense {
  id: number;
  name: string;
  amount: number;
  category: string;
  period: string;
  date: string;
  notes: string | null;
  created_at: string;
}

export interface ExpenseInput {
  name: string;
  amount: number;
  category: string;
  period?: string;
  date: string;
  notes?: string;
}

function periodMonths(period: string): number {
  switch (period) {
    case 'monthly': return 1;
    case 'quarterly': return 3;
    case 'semi-annual': return 6;
    case 'annual': return 12;
    case 'one-time': return 0;
    default: return 1;
  }
}

export function listExpenses(month?: string, category?: string): Expense[] {
  const db = getDb();
  let sql = 'SELECT * FROM expenses WHERE 1=1';
  const params: any[] = [];

  if (month) {
    sql += ' AND substr(date,1,7) = ?';
    params.push(month);
  }
  if (category) {
    sql += ' AND category = ?';
    params.push(category);
  }

  sql += ' ORDER BY date DESC, id DESC';
  return db.prepare(sql).all(...params) as Expense[];
}

const validPeriods = ['monthly', 'quarterly', 'semi-annual', 'annual', 'one-time'];

export function createExpense(input: ExpenseInput): Expense {
  const db = getDb();
  const period = input.period || 'monthly';
  if (!validPeriods.includes(period)) {
    throw new Error(`Invalid period: ${period}`);
  }
  const stmt = db.prepare(
    'INSERT INTO expenses (name, amount, category, period, date, notes) VALUES (?, ?, ?, ?, ?, ?)'
  );
  const result = stmt.run(input.name, input.amount, input.category, period, input.date, input.notes || null);
  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(result.lastInsertRowid) as Expense;
}

export function updateExpense(id: number, input: Partial<ExpenseInput>): Expense | null {
  const db = getDb();
  const existing = db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense | undefined;
  if (!existing) return null;

  const name = input.name ?? existing.name;
  const amount = input.amount ?? existing.amount;
  const category = input.category ?? existing.category;
  const period = input.period ?? existing.period;
  if (input.period !== undefined && !validPeriods.includes(input.period)) {
    throw new Error(`Invalid period: ${input.period}`);
  }
  const date = input.date ?? existing.date;
  const notes = input.notes !== undefined ? input.notes : existing.notes;

  db.prepare(
    'UPDATE expenses SET name=?, amount=?, category=?, period=?, date=?, notes=? WHERE id=?'
  ).run(name, amount, category, period, date, notes, id);

  return db.prepare('SELECT * FROM expenses WHERE id = ?').get(id) as Expense;
}

export function deleteExpense(id: number): boolean {
  const db = getDb();
  const result = db.prepare('DELETE FROM expenses WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getStats() {
  const db = getDb();
  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentYear = `${now.getFullYear()}`;

  // Total this month
  const totalMonth = (db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE substr(date,1,7) = ?"
  ).get(currentMonth) as any).total;

  // Total this year
  const totalYear = (db.prepare(
    "SELECT COALESCE(SUM(amount), 0) as total FROM expenses WHERE substr(date,1,4) = ?"
  ).get(currentYear) as any).total;

  // Effective monthly recurring total
  const effectiveMonthly = (db.prepare(`
    SELECT COALESCE(SUM(
      CASE period
        WHEN 'monthly' THEN amount / 1
        WHEN 'quarterly' THEN amount / 3
        WHEN 'semi-annual' THEN amount / 6
        WHEN 'annual' THEN amount / 12
        ELSE amount
      END
    ), 0) as total FROM expenses WHERE period != 'one-time'
  `).get() as any).total;

  // By category
  const byCategory = db.prepare(`
    SELECT category, SUM(amount) as total, COUNT(*) as count,
      SUM(
        CASE period
          WHEN 'monthly' THEN amount / 1
          WHEN 'quarterly' THEN amount / 3
          WHEN 'semi-annual' THEN amount / 6
          WHEN 'annual' THEN amount / 12
          ELSE amount
        END
      ) as effectiveMonthly
    FROM expenses GROUP BY category ORDER BY total DESC
  `).all();

  // By month (last 12 months)
  const byMonth = db.prepare(`
    SELECT substr(date,1,7) as month, SUM(amount) as total
    FROM expenses
    WHERE date >= date('now', '-12 months')
    GROUP BY month
    ORDER BY month ASC
  `).all();

  // Top expenses by name (subscriptions grouped) with period info
  const topExpenses = db.prepare(`
    SELECT
      e.name,
      SUM(e.amount) as total,
      COUNT(*) as count,
      (SELECT e2.period FROM expenses e2 WHERE e2.name = e.name ORDER BY e2.date DESC, e2.id DESC LIMIT 1) as period,
      SUM(
        CASE e.period
          WHEN 'monthly' THEN e.amount / 1
          WHEN 'quarterly' THEN e.amount / 3
          WHEN 'semi-annual' THEN e.amount / 6
          WHEN 'annual' THEN e.amount / 12
          ELSE e.amount
        END
      ) as effectiveMonthly
    FROM expenses e
    GROUP BY e.name
    ORDER BY total DESC
    LIMIT 5
  `).all();

  // Upcoming payments (next 7 days)
  const upcomingPayments = db.prepare(`
    SELECT * FROM expenses
    WHERE date BETWEEN date('now') AND date('now', '+7 days')
    ORDER BY date ASC
  `).all();

  return { totalMonth, totalYear, effectiveMonthly, byCategory, byMonth, topExpenses, upcomingPayments };
}
