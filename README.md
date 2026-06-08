# ibbi Waitlist Landing Page

Standalone landing page pre zbieranie waitlist emailov.

## Štruktúra
- index.html — hlavná stránka
- shared/ — skopírované zdieľané súbory z ibbi_pages

## Nasadenie
Táto stránka sa nasadzuje na hlavnú doménu (napr. ibbi.sk).
ibbi_pages/ sa nasadzuje na app.ibbi.sk alebo /app/.

## Supabase
Waitlist tabuľka SQL:

```sql
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'unknown'
    CHECK (role IN ('business','influencer','unknown')),
  source TEXT DEFAULT 'landing',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT waitlist_email_unique UNIQUE (email)
);

ALTER TABLE waitlist ENABLE ROW LEVEL SECURITY;

CREATE POLICY "insert_waitlist" ON waitlist
  FOR INSERT WITH CHECK (true);

CREATE POLICY "service_read_waitlist" ON waitlist
  FOR SELECT USING (false);
```

## Demo redirect
Try demo → `../ibbi_pages/business.html` alebo
           `../ibbi_pages/influencer.html`

Štruktúra pre tieto relatívne cesty:
```
projekt/
├── waitlist/index.html
└── ibbi_pages/business.html
```

Ak je iná štruktúra → uprav cesty v `startDemo()` funkcii v index.html.

## Izolácia od platformy

waitlist/ a ibbi_pages/ sú ODDELENÉ aplikácie:

  ibbi.sk (waitlist/)
    ↓ Try demo (window.location.replace)
  app.ibbi.sk (ibbi_pages/)
    ↓ ← Späť na ibbi.sk (manuálny link)
  ibbi.sk (waitlist/)

Žiadna automatická cesta SPÄŤ neexistuje okrem
manuálneho kliknutia na "← Späť na ibbi.sk" banner.

Späť button v prehliadači z demo módu:
- Použijeme window.location.replace() →
  ibbi_pages/ sa nevloží do browser history
- Späť button teda nemá kam ísť
  (alebo ide na predchádzajúcu stránku pred waitlist)
