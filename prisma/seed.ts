import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

// Load .env locally (Node 20.12+/22). On Vercel the env vars are already in
// process.env and there is no .env file, so we ignore the error.
try {
  (process as NodeJS.Process & { loadEnvFile?: (p?: string) => void }).loadEnvFile?.();
} catch {
  /* no .env file — using process.env */
}

const prisma = new PrismaClient();

async function main() {
  // ---- Admin user ----
  const adminEmail = (process.env.ADMIN_EMAIL || "admin@koncsorbor.hu").toLowerCase();
  const adminPassword = process.env.ADMIN_PASSWORD || "Koncsor2026!";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Adminisztrátor",
      password: await bcrypt.hash(adminPassword, 10),
      role: "admin",
    },
  });
  console.log(`Admin user: ${adminEmail}`);

  // ---- Settings ----
  const settings: Record<string, string> = {
    company_name: "Koncsor Bőrkereskedés",
    company_address: "—  (töltsd ki a Beállításoknál)",
    company_tax_id: "—",
    company_reg: "—",
    company_email: "rendeles@koncsorbor.hu",
    company_phone: "06 70 942 0725",
    vat_rate: "27",
    invoice_prefix: "KB",
  };
  for (const [key, value] of Object.entries(settings)) {
    await prisma.setting.upsert({ where: { key }, update: {}, create: { key, value } });
  }

  // ---- Shipping methods ----
  const shipping = [
    { name: "Csomagautomata (Foxpost / Packeta)", fee: 1290, note: "1-3 munkanap", position: 1 },
    { name: "GLS futárszolgálat (házhozszállítás)", fee: 1690, note: "1-3 munkanap", position: 2 },
    { name: "Személyes átvétel", fee: 0, note: "Előzetes egyeztetés alapján", position: 3 },
  ];
  const existingShipping = await prisma.shippingMethod.count();
  if (existingShipping === 0) {
    for (const s of shipping) await prisma.shippingMethod.create({ data: s });
  }

  // ---- Categories ----
  const categories = [
    {
      slug: "kutya-nyakorvek",
      name: "Kutya nyakörvek",
      description:
        "Masszív, növényi cserzésű marhabőr nyakörvek a leghűségesebb társaknak — vadászathoz, túrázáshoz, mindennapokra.",
      position: 1,
    },
    {
      slug: "ovek",
      name: "Bőrövek",
      description:
        "Vastag marhabőr övek: egyedi mintás vadászövek és klasszikus, letisztult darabok, amelyek egy életen át kitartanak.",
      position: 2,
    },
    {
      slug: "tortokok",
      name: "Tőrtokok",
      description:
        "Teljes barkás, két oldalról növényi cserzett marhabőr tőrtokok, derékszíjra bújtatóval, pontos méretben.",
      position: 3,
    },
  ];
  const catMap: Record<string, string> = {};
  for (const c of categories) {
    // Purely additive: don't overwrite edits made later in the admin.
    const cat = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: c,
    });
    catMap[c.slug] = cat.id;
  }

  // ---- Products ----
  type Variant = { name: string; priceDiff: number; stock: number };
  type Seed = {
    slug: string;
    name: string;
    category: string;
    basePrice: number;
    description: string;
    details: string;
    featured?: boolean;
    variants: Variant[];
  };

  const products: Seed[] = [
    {
      slug: "kezmuves-kutya-nyakorv",
      name: "Kézműves kutya nyakörv",
      category: "kutya-nyakorvek",
      basePrice: 5900,
      featured: true,
      description:
        "Elnyűhetetlen, 3,5–4 mm vastag, növényi cserzésű marhabőr nyakörv masszív fém csattal és hegesztett karikával.",
      details:
        "Rendkívül masszív, növényi cserzésű marhabőrből készül, amely nem nyúlik és nem szakad — az idő múlásával csak még patinásabb lesz.\nErős csatokkal és hegesztett karikával szereljük fel, így a legnagyobb testű, legerősebb kutyák tartására is teljesen biztonságos.\nVálasztható szélességek: 2,5 cm (kisebb/közepes testű kutyáknak), 3 cm (univerzális), 4 cm (nagytestű, erős kutyáknak).\nFekete és természetes natúr színben is elérhető, a kutyád egyedi nyakméretére szabva.\nEgyedi méretért hívj minket: 06 70 942 0725",
      variants: [
        { name: "2,5 cm / Natúr", priceDiff: 0, stock: 8 },
        { name: "2,5 cm / Fekete", priceDiff: 0, stock: 6 },
        { name: "3 cm / Natúr", priceDiff: 700, stock: 7 },
        { name: "3 cm / Fekete", priceDiff: 700, stock: 5 },
        { name: "4 cm / Natúr", priceDiff: 1500, stock: 4 },
        { name: "4 cm / Fekete", priceDiff: 1500, stock: 4 },
      ],
    },
    {
      slug: "egyedi-mintas-vadaszov",
      name: "Egyedi mintás vadászöv",
      category: "ovek",
      basePrice: 12900,
      featured: true,
      description:
        "Prémium barna bőröv gímszarvas, dámvad, tölgylevél és makk motívumokkal, egyedi mintás csattal. A vadászat szerelmeseinek.",
      details:
        "Valódi, vastag marhabőrből készült egyedi mintás vadászöv.\nKülönleges, gímszarvas, dámvad, tölgylevél és makk motívumokkal díszítve, egyedi mintás csattal.\nNem egy-két szezonra szól, hanem egy életen át kiszolgál.\nVálaszd ki a derékbőségednek megfelelő méretet. Egyedi méretért keress minket telefonon: 06 70 942 0725",
      variants: [
        { name: "90 cm", priceDiff: 0, stock: 3 },
        { name: "95 cm", priceDiff: 0, stock: 4 },
        { name: "100 cm", priceDiff: 0, stock: 4 },
        { name: "105 cm", priceDiff: 500, stock: 3 },
        { name: "110 cm", priceDiff: 500, stock: 2 },
        { name: "115 cm", priceDiff: 1000, stock: 2 },
      ],
    },
    {
      slug: "klasszikus-ejfekete-borov",
      name: "Klasszikus éjfekete bőröv",
      category: "ovek",
      basePrice: 9900,
      description:
        "Elegáns, letisztult fekete bőröv masszív fémcsattal — farmerhez és alkalmi nadrághoz is tökéletes választás.",
      details:
        "Klasszikus, éjfekete bőröv valódi, vastag marhabőrből.\nLetisztult darab masszív fémcsattal, amely farmerhez és alkalmi nadrághoz egyaránt illik.\nGondos kézmunka eredménye, a legkiválóbb alapanyagokból.\nEgyedi méretért hívj minket: 06 70 942 0725",
      variants: [
        { name: "90 cm", priceDiff: 0, stock: 4 },
        { name: "95 cm", priceDiff: 0, stock: 4 },
        { name: "100 cm", priceDiff: 0, stock: 5 },
        { name: "105 cm", priceDiff: 0, stock: 3 },
        { name: "110 cm", priceDiff: 500, stock: 2 },
      ],
    },
    {
      slug: "stilusos-sotetbarna-borov",
      name: "Stílusos sötétbarna bőröv",
      category: "ovek",
      basePrice: 9900,
      description:
        "Letisztult, sima felületű, természetes barna öv azoknak, akik a minimalista, mégis férfias eleganciát kedvelik.",
      details:
        "Sötétbarna, sima felületű bőröv valódi marhabőrből.\nMinimalista, mégis férfias megjelenés, masszív csattal.\nMinden darab gondos kézmunka eredménye.\nEgyedi méretért keress minket: 06 70 942 0725",
      variants: [
        { name: "90 cm", priceDiff: 0, stock: 3 },
        { name: "95 cm", priceDiff: 0, stock: 4 },
        { name: "100 cm", priceDiff: 0, stock: 4 },
        { name: "105 cm", priceDiff: 0, stock: 3 },
        { name: "110 cm", priceDiff: 500, stock: 2 },
      ],
    },
    {
      slug: "kezmuves-tortok",
      name: "Kézműves tőrtok",
      category: "tortokok",
      basePrice: 6900,
      featured: true,
      description:
        "3 mm vastag, teljes barkás, két oldalról növényi cserzett szín marhabőr tőrtok, derékszíjra bújtatóval.",
      details:
        "A létező legtartósabb, legszebb öregedésű prémium bőrből: 3 mm vastag, teljes barkás, két oldalról növényi cserzett szín marhabőr.\nMinden tok derékszíjra bújtatóval rögzíthető, így stabilan és kényelmesen hordható vadászat vagy túrázás során.\nVálasztható méretek:\nB1 – kisebb tőrökhöz\nB2 – Hossz: 11 cm | Szélesség: 4 cm\nB3 – Hossz: 13 cm | Szélesség: 4,5 cm\nEgyedi méretért hívj minket: 06 70 942 0725",
      variants: [
        { name: "B1 (kisebb tőrökhöz)", priceDiff: 0, stock: 5 },
        { name: "B2 – 11 × 4 cm", priceDiff: 800, stock: 5 },
        { name: "B3 – 13 × 4,5 cm", priceDiff: 1500, stock: 4 },
      ],
    },
  ];

  for (const p of products) {
    const created = await prisma.product.upsert({
      where: { slug: p.slug },
      // Purely additive: don't overwrite edits made later in the admin.
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        description: p.description,
        details: p.details,
        basePrice: p.basePrice,
        featured: p.featured ?? false,
        categoryId: catMap[p.category],
        active: true,
      },
    });

    // Variants — create only if none exist yet for this product
    const existingVariants = await prisma.productVariant.count({ where: { productId: created.id } });
    if (existingVariants === 0) {
      let idx = 0;
      for (const v of p.variants) {
        idx++;
        await prisma.productVariant.create({
          data: {
            productId: created.id,
            sku: `${p.slug.toUpperCase().replace(/-/g, "").slice(0, 12)}-${idx}`,
            name: v.name,
            priceDiff: v.priceDiff,
            stock: v.stock,
          },
        });
      }
    }
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
