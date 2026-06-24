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

## Telepítés (helyi fejlesztés)

```bash
npm install
cp .env.example .env        # töltsd ki az értékeket
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

## Éles üzem / deploy

A projekt Vercelre kész. **Figyelem:** a SQLite a Vercel szerver nélküli
környezetében nem perzisztens. Éles üzemhez állíts be egy menedzselt
PostgreSQL/MySQL adatbázist:

1. A `prisma/schema.prisma`-ban a `datasource db` `provider`-ét állítsd
   `postgresql`-re (vagy `mysql`-re), és add meg a `DATABASE_URL`-t.
2. Futtasd: `npx prisma db push` majd `npm run db:seed`.

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
