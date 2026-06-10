export interface ProductDetails {
  overview: string;
  ingredients: string;
  storage: string;
  shelfLife: string;
}

const COMMON_STORAGE =
  "Store sealed jars in a cool, dry place away from direct sunlight. Refrigerate after opening. Always use a clean, dry spoon. See our FAQ for full food-safety guidance.";

const COMMON_SHELF_LIFE =
  "Best enjoyed within 6 months when stored sealed at room temperature. Consume within 4–6 weeks after opening when refrigerated.";

const FSSAI_NOTE =
  "Lachava Telangana Pickles is FSSAI registered (license 23626043000232).";

/** Rich PDP copy for crawlers and shoppers — keyed by canonical product id. */
export const PRODUCT_DETAILS: Record<string, ProductDetails> = {
  "mutton-pickle": {
    overview:
      "Lachava Mutton Pickle is a traditional Telangana non-vegetarian avakaya-style pickle, slow-cooked with tender mutton pieces, aromatic spices, and cold-pressed oil. Prepared in small batches at our Siddipet kitchen and packed in ½ kg or 1 kg jars for delivery across India.",
    ingredients:
      "Mutton, refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, ginger, curry leaves, turmeric, salt, and traditional Telangana spice blend.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "chepala-pickle": {
    overview:
      "Lachava Fish Pickle (Chepala) brings coastal Telangana flavours to your table — boneless fish pieces marinated in a bold spice masala and aged in oil for depth. A customer favourite for rice, roti, and festival meals.",
    ingredients:
      "Fish, refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, ginger, tamarind, curry leaves, turmeric, salt, and house spice mix.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "chicken-pickle": {
    overview:
      "Lachava Chicken Pickle is a signature Telangana home-style recipe — juicy chicken pieces cooked in a fiery masala and preserved in oil. Available in ½ kg and 1 kg jars with official menu pricing on this page.",
    ingredients:
      "Chicken, refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, ginger, curry leaves, turmeric, salt, and traditional spice blend.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "chinthankaya-pickle": {
    overview:
      "Lachava Chinthankaya (sour tamarind) Pickle is a classic Telangana vegetarian pickle — tangy, spicy, and perfect with hot rice and ghee. Made from sun-dried tamarind and slow-ground spices.",
    ingredients:
      "Tamarind (chinthakaya), refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, turmeric, salt, and Telangana masala.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "usirikaya-pickle": {
    overview:
      "Lachava Usirikaya (Indian gooseberry) Pickle combines the natural tartness of amla with traditional Telangana spices. A wholesome veg pickle rich in flavour and a staple in Telugu households.",
    ingredients:
      "Usirikaya (amla), refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, turmeric, salt, and spice blend.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "nimmakaya-pickle": {
    overview:
      "Lachava Nimmakaya (lemon) Pickle is a bright, zesty Telangana favourite — whole lemons cured with salt and chilli for a sharp, appetising side. Pairs well with curd rice, dal, and snacks.",
    ingredients:
      "Lemon (nimmakaya), refined sunflower oil, red chilli powder, mustard seeds, fenugreek, turmeric, salt, and traditional spices.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "mamidikaya-pickle": {
    overview:
      "Lachava Mamidikaya (raw mango) Pickle is the quintessential Telugu mango avakaya — cut mango pieces soaked in spice and oil for an authentic Telangana taste. One of our most-ordered vegetarian jars.",
    ingredients:
      "Raw mango (mamidikaya), refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, turmeric, salt, and avakaya masala.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "mamidikaya-allam-pickle": {
    overview:
      "Lachava Mamidikaya Allam Pickle blends raw mango with fresh ginger (allam) for extra warmth and bite. A distinctive Telangana variant for those who love mango pickle with a ginger-forward finish.",
    ingredients:
      "Raw mango, ginger (allam), refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, turmeric, salt, and spice blend.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "tomato-pickle": {
    overview:
      "Lachava Tomato Pickle is a homely Telangana table pickle — ripe tomatoes cooked down with spices for a slightly sweet, tangy heat. A milder veg option popular with children and everyday meals.",
    ingredients:
      "Tomato, refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, turmeric, salt, and spices.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
  "kakarakaya-pickle": {
    overview:
      "Lachava Kakarakaya (bitter gourd) Pickle turns karela into a bold Telangana side dish — sliced bitter gourd marinated in masala and oil. Loved by fans of strong, traditional veg pickles.",
    ingredients:
      "Bitter gourd (kakarakaya), refined sunflower oil, red chilli powder, mustard seeds, fenugreek, garlic, turmeric, salt, and Telangana spice mix.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  },
};

export function getProductDetails(productId: string, productName: string): ProductDetails {
  const known = PRODUCT_DETAILS[productId];
  if (known) return known;

  return {
    overview: `${productName} from Lachava Telangana Pickles is prepared in our Siddipet kitchen using traditional Telangana recipes and packed fresh for pan-India delivery. ${FSSAI_NOTE}`,
    ingredients:
      "Fresh produce or protein, refined oil, red chilli, mustard, fenugreek, garlic, turmeric, salt, and traditional Telangana spices.",
    storage: COMMON_STORAGE,
    shelfLife: COMMON_SHELF_LIFE,
  };
}

export function productDetailsWordCount(details: ProductDetails): number {
  const text = `${details.overview} ${details.ingredients} ${details.storage} ${details.shelfLife}`;
  return text.split(/\s+/).filter(Boolean).length;
}
