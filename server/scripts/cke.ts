import console from "node:console";
import fs from "fs";
import { keyCollection, KeySchema, type Key } from "../src/models/key.model.js";

type Brand = {
  make: string;
  models: any[];
};

const makes: string[] = [
    "Acura",
    "Alfa Romeo",
    "Audi",
    "Bentley",
    "BMW",
    "Buick",
    "Cadillac",
    "Chevrolet",
    "Chrysler",
    "Dodge",
    "Eagle",
    "Ford",
    "Genesis",
    "Geo",
    "GMC",
    "Hino",
  "Honda",
    "Hummer",
    "Hyundai",
    "Ineos",
    "Infiniti",
    "Isuzu",
    "Jaguar",
    "Jeep",
    "Kia",
    "Lexus",
    "Lincoln",
    "Mazda",
    "Mercedes-Benz",
    "Mercury",
    "Mini",
    "Mitsubishi",
    "Nissan",
    "Oldsmobile",
    "Peterbilt",
    "Plymouth",
    "Polestar",
    "Pontiac",
    "Ram",
    "Rivian",
    "Rolls-Royce",
    "Saab",
    "Saturn",
    "Scion",
    "Sterling",
    "Subaru",
    "Suzuki",
    "Tesla",
    "Toyota",
    "Volkswagen",
    "Volvo",
];

const brands: Brand[] = [];
let counter = 0;

const saveObjectToJSONFile = (obj: any, path: string) => {
  fs.writeFileSync(path, JSON.stringify(obj, null, 2));
  console.log(`File saved: ${path}`);
};

const loadObjectFromJSONFile = (path: string) => {
  const json = fs.readFileSync(path, "utf8");
  const data = JSON.parse(json);
  return data;
};

export function generateProductSlug(
  brand: string,
  model: string,
  year: number,
  keyType: string,
): string {
  return [brand, model, year, keyType]
    .map((s) => String(s).toLowerCase().trim().replace(/\s+/g, "-"))
    .join("-");
}

const fetchModels = async (make: string) => {
  counter++;
  const r = await fetch(
    `https://store.carkeysexpress.com/_next/data/qdAs8kr5KtBF6DtI5nPKU/keys-and-remotes/${make}.json?params=${make}`,
  );
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();

  const { models: mo } = data.pageProps;
  console.log(`Make: ${make} - ${mo.length} models`);
  return mo;
};

const fetchYearData = async (make: string, model: string, year: string) => {
  counter++;
  const URL = `https://store.carkeysexpress.com/_next/data/qdAs8kr5KtBF6DtI5nPKU/keys-and-remotes/${make}/${model}/${year}.json?params=${make}&params=${model}&params=${year}`;
  const r = await fetch(URL);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  const { productList } = data.pageProps;
  if (!productList || productList.length === 0) return [];
  console.log(
    `Make: ${make} - Model:${model}: - Year: ${year} - Items: ${productList.items.length}`,
  );
  return productList;
};

const fetchYears = async (make: string, model: string) => {
  counter++;
  const URL = `https://store.carkeysexpress.com/_next/data/qdAs8kr5KtBF6DtI5nPKU/keys-and-remotes/${make}/${model}.json?params=${make}&params=${model}`;

  const r = await fetch(URL);
  if (!r.ok) throw new Error(`HTTP ${r.status}`);
  const data = await r.json();
  const { years } = data.pageProps;
  if (!years || years.length === 0) return [];
  console.log(`Make: ${make} - Model:${model}: years: ${years.length}`);
  return years || [];
};

const fetchBrands = async () => {
  const startTime = Date.now();
  for (const make of makes) {
    const brand: Brand = { make, models: [] };
    const models = await fetchModels(make);
    for (const model of models) {
      const years = await fetchYears(make, model.name);
      for (const year of years) {
        const yearData = await fetchYearData(make, model.name, year.year);
        year.yData = yearData;
        // break;
      }
      model.years = years;
      brand.models.push(model);
      //   break;
    }
    brands.push(brand);
    // break;
  }
  const endTime = Date.now();
  const timeTotalMS = endTime - startTime;
  const timeS = Math.floor(timeTotalMS / 1000) % 60;
  const timeM = Math.floor(timeTotalMS / (60 * 1000));
  console.log(`Data: `, brands);
  console.log(`Reqs: `, counter);
  console.log(`Time: ${timeM}:${timeS}`);
  saveObjectToJSONFile(brands, "dump.json");
};

const loadDataToDB = async () => {
  await keyCollection().deleteMany();
  const zzz = loadObjectFromJSONFile("dump.json");
  const keys: Partial<Key>[] = [];
  for (const brand of zzz) {
    for (const model of brand.models) {
      for (const year of model.years) {
        for (const item of year.yData.items) {
          const key: Partial<Key> = {
            brand: brand.make,
            model: model.name,
            year: year.year,
            price: item.price_pop || -1,
            priceRetail: item.price || -1,
            keyType: item.type,
            slug: generateProductSlug(
              brand.make,
              model.name,
              year.year,
              item.type,
            ),
            imagesUrls: item.photoUrls || [],
            thumbnailsUrls: item.thumbnail_photo_urls || [],
          };
          keys.push(key);
          //   break;
        }
        //   break;
      }
      //   break;
    }
    //   break;
  }

  const safeData = keys.map((u) => {
    const result = KeySchema.safeParse({ ...u, createdAt: new Date() });
    if (!result.success)
      throw new Error(`Invalid seed data for ${u.slug}: ${result.error}`);
    return result.data;
  });
  const { insertedCount } = await keyCollection().insertMany(safeData);
  console.log(`Loadeed ${insertedCount} keys`);
};

// fetchBrands()
loadDataToDB()
  .then(() => {
    console.log("gg");
    process.exit(0);
  })
  .catch((err) => {
    console.error("cke failed:", err);
    process.exit(1);
  });
