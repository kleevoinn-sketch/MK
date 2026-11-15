// Catalogue for KLEEVO products. Descriptions, directions and caution notes are
// transcribed from the printed product labels (see /public/img/labels).
// `price` is the selling price; `mrp` is the M.R.P. printed on the label.

export interface Product {
  id: string
  name: string
  labelName: string
  tagline: string
  size: string
  price: number
  mrp: number
  uspPerMl: string
  bestBefore: string
  image: string
  label: string
  accent: string
  category: string
  shortDescription: string
  description: string
  features: Array<string>
  areas?: string
  howToUse: Array<string>
  caution: Array<string>
  /** Live stock from the database; undefined until loaded. */
  stock?: number
}

export const BRAND = {
  name: 'KLEEVO',
  manufacturer: 'S.M ENTERPRISES',
  email: 'kleevo.inn@gmail.com',
  phones: ['9632583912', '7259315439', '7483608477'],
  whatsapp: '9632583912',
  instagram: 'kleevo.in',
  instagramUrl: 'https://www.instagram.com/kleevo.in/',
  gstin: '29JRYPK8859R1ZR',
  address: 'ನಗರಕೆರೆ ರಸ್ತೆ ವೇದನಾಥಪುರ ದೇವಸ್ಥಾನ ರಸ್ತೆ ಹತ್ತಿರ ಮದ್ದೂರು',
}

export const DELIVERY_FEE = 0

const COMMON_CAUTION = [
  'For external use only.',
  'Keep out of reach of children.',
  'Avoid contact with eyes & skin. In case of contact, wash immediately with plenty of water and seek medical advice.',
  'Do not mix with any other household cleaner or any other material in this liquid.',
  'Store away from direct sunlight.',
]

const products: Array<Product> = [
  {
    id: 'dish-wash',
    name: 'KLEEVO Dish Wash',
    labelName: 'Dish Wash Liquid',
    tagline: 'Sparkling Utensils, Every Time',
    size: '500 ml',
    price: 100,
    mrp: 110,
    uspPerMl: '0.22',
    bestBefore: '12 Months from Date of Mfg.',
    image: '/img/products/dish-wash.jpg',
    label: '/img/labels/dish-wash.jpg',
    accent: '#16a34a',
    category: 'Kitchen',
    shortDescription: 'Concentrated dish wash liquid that cuts grease for a sink full of sparkling utensils.',
    description:
      'KLEEVO Dish Wash is a powerful cleaning formula for everyday utensils. Just one teaspoon mixed in a bowl of water is enough to clean a sink full of vessels — it lifts oil, grease and food stains and leaves steel, glass and non-stick cookware sparkling clean.',
    features: ['Removes tough oil & grease', 'Just 1 teaspoon per bowl', 'Sparkling utensils', 'Gentle on hands'],
    howToUse: [
      'Take 1 teaspoon full of dish wash.',
      'Mix it in a bowl of water.',
      'Dip a scrubber and squeeze to get powerful result.',
      'Clean to get a sink full of sparkling utensils.',
    ],
    caution: [
      'For external use only.',
      'Keep out of reach of children.',
      'Avoid contact with eye. In case of contact, wash immediately with plenty of water and seek medical advice.',
      'Do not mix with any other household cleaner or any other material in this liquid.',
      'Store away from direct sunlight.',
    ],
  },
  {
    id: 'cloth-detergent',
    name: 'KLEEVO Cloth Detergent',
    labelName: 'Fabrics Care Detergent Liquid',
    tagline: 'New Formula · Clean Action',
    size: '500 ml',
    price: 110,
    mrp: 120,
    uspPerMl: '0.24',
    bestBefore: '24 Months from Date of Mfg.',
    image: '/img/products/cloth-detergent.jpg',
    label: '/img/labels/cloth-detergent.jpg',
    accent: '#6d28d9',
    category: 'Laundry',
    shortDescription: 'Fabrics care detergent liquid — best for machine wash and bucket wash.',
    description:
      'KLEEVO Fabrics Care Detergent Liquid with a new formula and Clean Action technology removes tough stains while caring for your fabrics. Dissolves completely, leaves no residue, and is best used for both washing machines and bucket wash.',
    features: ['New formula', 'Best for machine & bucket wash', 'Removes tough stains', 'Cares for whites & colours'],
    howToUse: [
      'Always wash whites and colours separately.',
      'Always dissolve the liquid completely in water before adding clothes.',
      'For really tough stains, soak clothes in the solution for 30 minutes before washing.',
      'Always check the fabric washing instructions on the garment.',
    ],
    caution: [
      'For external use only.',
      'Avoid contact with eyes. In case of contact, wash immediately with plenty of water and seek medical advice.',
      'Keep out of reach of children.',
      'Store away from direct sunlight.',
    ],
  },
  {
    id: 'floor-wash',
    name: 'KLEEVO Floor Wash',
    labelName: 'Floor Cleaner',
    tagline: 'We Will Make It Shine',
    size: '500 ml',
    price: 110,
    mrp: 110,
    uspPerMl: '0.22',
    bestBefore: '12 Months from Date of Mfg.',
    image: '/img/products/floor-wash.jpg',
    label: '/img/labels/floor-wash.jpg',
    accent: '#1d4ed8',
    category: 'Home',
    shortDescription: 'Powerful cleaning formula for floors, tiles, wash basins and sinks.',
    description:
      'KLEEVO Floor Cleaner — "We Will Make It Shine". A powerful cleaning formula that removes tough oil, grease and stains, gives shine, neutralises odour and is safe on hands.',
    features: ['Removes tough oil, grease & stains', 'Gives shine', 'Neutralises odour', 'Safe on hand'],
    areas: 'Cleaning all floor, bathroom surfaces, tiles, wash basin, sink etc.',
    howToUse: [
      'Add the recommended quantity of floor cleaner to a bucket of water.',
      'Dip the mop in the solution and squeeze out excess liquid.',
      'Mop the floor, tiles or surface evenly.',
      'For tough stains, apply directly on the stain, wait a few minutes and wipe clean.',
    ],
    caution: COMMON_CAUTION,
  },
  {
    id: 'toilet-cleaner',
    name: 'KLEEVO Toilet Cleaner',
    labelName: 'Toilet Cleaner',
    tagline: 'Powerful Cleaning Formula',
    size: '500 ml',
    price: 100,
    mrp: 100,
    uspPerMl: '0.20',
    bestBefore: '12 Months from Date of Mfg.',
    image: '/img/products/toilet-cleaner.jpg',
    label: '/img/labels/toilet-cleaner.jpg',
    accent: '#1e3a8a',
    category: 'Bathroom',
    shortDescription: 'Super active thick formula — works in Indian & Western toilets, safe for septic tanks.',
    description:
      'The super active formula of KLEEVO Toilet Cleaner helps the liquid stay longer on the commode to make your toilet extra ordinary clean and absolutely sparkling. Toilet cleaner works well in both Indian and Western toilets and is safe for septic tanks.',
    features: ['Super active formula', 'Stays longer on the commode', 'Indian & Western toilets', 'Safe for septic tanks'],
    howToUse: [
      'Step 1: First flush the toilet and then apply Toilet Cleaner under the rim.',
      'Step 2: Wait for 20 minutes. Brush gently.',
      'Step 3: Flush.',
    ],
    caution: [
      'Use only for toilet bowls.',
      ...COMMON_CAUTION,
    ],
  },
  {
    id: 'bathroom-cleaner',
    name: 'KLEEVO Bathroom Cleaner',
    labelName: 'Bathroom Cleaner',
    tagline: 'Powerful Cleaning Formula',
    size: '500 ml',
    price: 100,
    mrp: 110,
    uspPerMl: '0.22',
    bestBefore: '12 Months from Date of Mfg.',
    image: '/img/products/bathroom-cleaner.jpg',
    label: '/img/labels/bathroom-cleaner.jpg',
    accent: '#dc2626',
    category: 'Bathroom',
    shortDescription: 'For sinks, bath tubs, tiles and floors — one bottle for the whole bathroom.',
    description:
      'KLEEVO Bathroom Cleaner is a powerful cleaning formula for the complete bathroom. It removes soap scum, hard-water marks and stains from sinks, bath tubs, tiles and floors and leaves them fresh and shining.',
    features: ['Sinks cleaning', 'Bath tub cleaning', 'Tiles cleaning', 'Floor cleaning'],
    areas: 'Sinks, bath tubs, tiles and bathroom floors.',
    howToUse: [
      'Apply the cleaner directly on the surface or on a wet sponge / brush.',
      'Leave for a few minutes to act on stains and hard-water marks.',
      'Scrub gently with a brush or sponge.',
      'Rinse thoroughly with water.',
    ],
    caution: COMMON_CAUTION,
  },
  {
    id: 'car-wash',
    name: 'KLEEVO Car Wash',
    labelName: 'Car Shampoo',
    tagline: 'Complete Care with CAR',
    size: '500 ml',
    price: 210,
    mrp: 210,
    uspPerMl: '0.42',
    bestBefore: '12 Months from Date of Mfg.',
    image: '/img/products/car-wash.jpg',
    label: '/img/labels/car-wash.jpg',
    accent: '#111827',
    category: 'Vehicle',
    shortDescription: 'Liquid car shampoo for a streak-free, glossy finish. Shake well before use.',
    description:
      'KLEEVO Car Shampoo gives your vehicle complete care. The liquid shampoo loosens dirt and road grime and rinses off cleanly, leaving the paint glossy and streak-free. Shake well before use.',
    features: ['Complete care for your car', 'Glossy, streak-free finish', 'Rinses off cleanly', 'Shake well before use'],
    howToUse: [
      'Mix in water (liquid car shampoo).',
      'Rinse the vehicle with fresh water from top down.',
      'Agitate the car shampoo with a wash mitt and apply it to the top of the vehicle, then proceed downwards on the remaining parts including the wheel wells (use a separate wash mitt for wheels).',
      'Remove any excess water with a clean microfibre cloth.',
    ],
    caution: [
      'Ensure the vehicle is not under direct sunlight while washing.',
      'Mix the car shampoo and water as directed. Too much concentrated car shampoo may lead to unwanted streaking.',
      'Avoid contact with eyes & skin. In case of contact, wash immediately with plenty of water and seek medical advice immediately.',
      'Store away from direct sunlight. Keep away from children.',
      'Wear hand gloves when making products.',
      'Do not mix with any other household cleaner or any other material in this liquid.',
    ],
  },
  {
    id: 'glass-cleaner',
    name: 'KLEEVO Glass Cleaner',
    labelName: 'Glass Cleaner',
    tagline: 'Streak Free Shine',
    size: '500 ml',
    price: 110,
    mrp: 110,
    uspPerMl: '0.22',
    bestBefore: '12 Months from Date of Mfg.',
    image: '/img/products/glass-cleaner.jpg',
    label: '/img/labels/glass-cleaner.jpg',
    accent: '#0284c7',
    category: 'Home',
    shortDescription: 'Streak-free shine for windows, mirrors, display cases and vehicle glass.',
    description:
      'KLEEVO Glass Cleaner — Streak Free Shine. A powerful cleaning formula that removes tough oil, grease and stains, gives shine, removes odour and is safe on hands.',
    features: ['Removes tough oil', 'Grease & stains', 'Gives shine', 'Odour remove', 'Safe on hand'],
    areas: 'Cleaning all glass windows, mirrors, glass display cases, car, bus, truck glass etc.',
    howToUse: [
      'Spray the cleaner evenly on the glass surface from a distance of about 15–20 cm.',
      'Wipe with a clean, dry, lint-free or microfibre cloth / squeegee.',
      'Buff dry for a streak-free shine.',
    ],
    caution: [
      'For external use only.',
      'Keep out of reach of children.',
      'Avoid contact with eye. In case of contact, wash immediately with plenty of water and seek medical advice.',
      'Do not mix with any other household cleaner or any other material in this liquid.',
      'Store away from direct sunlight.',
      'Do not use on electronic items.',
    ],
  },
]

/** Overlay live DB price/MRP/stock onto the bundled catalogue (descriptions & images stay local). */
export function applyLiveCatalogue(rows: Array<{ slug: string; price: number; mrp: number; stock: number; active: boolean }>) {
  for (const r of rows) {
    const p = products.find((x) => x.id === r.slug)
    if (!p) continue
    p.price = r.price
    p.mrp = r.mrp
    p.stock = r.active ? r.stock : 0
  }
}

export const isSoldOut = (p: Product) => p.stock !== undefined && p.stock <= 0

export function getProduct(id: string) {
  return products.find((p) => p.id === id)
}

export function img(src: string, w: number) {
  return `/.netlify/images?url=${encodeURIComponent(src)}&w=${w}&fm=webp&q=80`
}

export const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`

export default products
