# Koncsor Bőrkereskedés – Webáruház

Kézműves bőrdíszműves webáruház (kutya nyakörvek, övek, tőrtokok) teljes admin
felülettel, automata számlázással, e-mail értesítőkkel és OTP **SimplePay**
fizetési integrációval.

Stack: **Next.js 15** (App Router) · TypeScript · Tailwind CSS · Prisma · SQLite.

---

## Funkciók

### Vásárlói oldal (storefront)
- Kézműves bőrdíszműves dizájn (bőr-textúra, meleg színvilág, magyar nyelven)
- Főoldal kiemelt termékekkel és kategóriákkal
- Termékböngészés kategóriánként, termékoldal kivitel- (méret/szín) választással
- Kosár (böngészőben tárolva), pénztár szállítási és számlázási adatokkal
- Online fizetés OTP SimplePay-en keresztül
- Rendelés-visszaigazoló oldal, számla megtekintése
- Jogi oldalak: ÁSZF, Adatkezelési tájékoztató, Szállítás, Elállási jog, Impresszum

### Admin felület (`/admin`)
- Bejelentkezés (JWT munkamenet, bcrypt jelszó)
- Áttekintő irányítópult (bevétel, rendelések, alacsony készlet)
- **Rendelések**: lista, részletek, állapotváltás (ügyfél-értesítéssel), manuális fizetettnek jelölés
- **Termékek**: teljes CRUD, kivitelek (méret/szín) ár- és készletkezeléssel, képek
- **Készlet**: gyors készletmódosítás kivitelenként
- **Kategóriák**, **Szállítási módok**, **Felhasználók** kezelése
- **Számlák**: lista és megtekintés
- **Beállítások**: cég- és számlázási adatok, integrációk állapota

### Automatizmusok
- **Számlakészítés**: sikeres fizetéskor automatikus, sorszámozott számla (nettó/ÁFA/bruttó)
- **E-mail értesítő**: rendelés-visszaigazolás a vevőnek (számlával) + értesítés a boltnak
- **SimplePay**: fizetés indítása, IPN (azonnali fizetési értesítés) és visszairányítás kezelése

---

## Adatbázis

Az alkalmazás **PostgreSQL**-t használ (Prisma ORM). Helyi fejlesztéshez és éles
üzemhez egyaránt egy Postgres adatbázis `DATABASE_URL` kapcsolati sztringje kell
(pl. Vercel/Neon Postgres, Supabase, vagy helyi Postgres).

## Telepítés (helyi fejlesztés)

```bash
npm install
cp .env.example .env        # töltsd ki az értékeket (DATABASE_URL kötelező)
npm run db:setup            # séma létrehozása + kezdeti adatok (admin, termékek)
npm run dev                 # http://localhost:3000
```

Alapértelmezett admin belépés (a `.env`-ből, `npm run db:setup` után):
- E-mail: `admin@koncsorbor.hu`
- Jelszó: `Koncsor2026!`  *(éles környezetben azonnal módosítandó!)*

### Hasznos parancsok
| Parancs | Leírás |
|---|---|
| `npm run dev` | Fejlesztői szerver |
| `npm run build` | Éles build |
| `npm run start` | Éles szerver |
| `npm run db:push` | Prisma séma szinkronizálása az adatbázissal |
| `npm run db:seed` | Kezdeti adatok betöltése |

---

## Környezeti változók (`.env`)

| Változó | Leírás |
|---|---|
| `DATABASE_URL` | Adatbázis kapcsolat (alap: SQLite `file:./dev.db`) |
| `AUTH_SECRET` | Hosszú, véletlenszerű titok a munkamenet aláírásához |
| `NEXT_PUBLIC_SITE_URL` | A webáruház nyilvános URL-je (SimplePay visszairányításhoz) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | Az induló admin fiók (seedeléskor) |
| `SIMPLEPAY_MERCHANT` | SimplePay kereskedői azonosító |
| `SIMPLEPAY_SECRET_KEY` | SimplePay titkos kulcs (HMAC aláíráshoz) |
| `SIMPLEPAY_SANDBOX` | `true` = teszt, `false` = éles |
| `SMTP_HOST` / `SMTP_PORT` / `SMTP_USER` / `SMTP_PASS` | E-mail küldés (SMTP) |
| `SMTP_FROM` | Feladó cím |
| `SHOP_NOTIFY_EMAIL` | Hová érkezzen az új rendelés értesítő |

> Ha a SimplePay vagy az SMTP nincs beállítva, az áruház működik: a fizetés
> "manuális" módba vált (telefonos egyeztetés), az e-maileket pedig a rendszer
> csak naplózza, nem küldi ki.

### SimplePay beállítása
1. Add meg a `SIMPLEPAY_MERCHANT` és `SIMPLEPAY_SECRET_KEY` értékeket.
2. A SimplePay kereskedői felületén állítsd be az IPN URL-t:
   `https://<domain>/api/simplepay/ipn`
3. Élesítéshez: `SIMPLEPAY_SANDBOX="false"`.

---

## Éles üzem / deploy (Vercel + Neon Postgres)

A projekt Vercelre kész, és a deploy **zéró kézi lépéssel** működik:

1. **Adatbázis létrehozása:** a Vercel projekt **Storage** fülén hozz létre egy
   **Neon Postgres** adatbázist, és kösd a projekthez. Ez automatikusan beállítja a
   `DATABASE_URL` környezeti változót minden környezetben (Production/Preview).
2. **Környezeti változók:** a Vercel projekt **Settings → Environment Variables**
   alatt add meg legalább az `AUTH_SECRET` és `NEXT_PUBLIC_SITE_URL` értékeket
   (valamint a SimplePay/SMTP kulcsokat, ha élesíted azokat). Lásd a táblázatot lent.
3. **Deploy:** a build során automatikusan lefut a `prisma db push` (táblák
   létrehozása) és a `prisma/seed.ts` (kategóriák, termékek, induló admin fiók),
   majd a `next build`. A seed **additív**: nem írja felül az adminban végzett
   módosításokat, biztonságosan fut minden deploykor.

> A seed így zéró kézi lépéssel feltölti a kezdeti adatokat. Ha a Neon *pooled*
> kapcsolaton a `prisma db push` hibázna, állíts be egy `DATABASE_URL`-t a
> *direct* (non-pooling) végpontra a buildhez.

A termékképeket töltsd a `public/uploads/` mappába, és add meg az elérési utat az
admin termékszerkesztőben (pl. `/uploads/nyakorv.jpg`), vagy használj külső URL-t /
objektumtárolót.

---

## Projektszerkezet

```
prisma/schema.prisma        – adatmodell (termék, kivitel, rendelés, számla, ...)
prisma/seed.ts              – kezdeti adatok (kategóriák, termékek, admin)
src/app/(shop)/             – vásárlói oldal
src/app/admin/(panel)/      – admin felület (auth-védett)
src/app/api/                – checkout, SimplePay IPN, admin auth
src/app/szamla/[number]/    – számla megtekintő (HTML/nyomtatható)
src/lib/                    – auth, simplepay, invoice, email, orders, settings
src/components/             – UI komponensek (storefront + admin)
```
