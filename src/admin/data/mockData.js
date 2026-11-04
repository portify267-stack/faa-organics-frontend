// Isolated mock data for Faa Organics Admin Panel UI
// STRICTLY FRONTEND ONLY - No backend connection or real API calls

export const getStockStatus = (stock) => {
  const qty = Number(stock);
  return qty > 0 ? 'In Stock' : 'Out of Stock';
};

export const initialOrders = [
  {
    id: "FAO-2026-1048",
    customerName: "Ayesha Rahman",
    email: "ayesha.rahman@example.com",
    phone: "+91 98765 43210",
    orderDate: "2026-11-02",
    paymentStatus: "Pending",
    deliveryAddress: {
      street: "Flat 402, Green Meadows, 12th Main Road",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600028"
    },
    items: [
      {
        id: "skin-brightening-goat-milk-soap",
        name: "Premium Skin Brightening Goat Milk Soap",
        weight: "100 g",
        price: 230,
        quantity: 2,
        image: "/assets/images/img11.jpeg"
      },
      {
        id: "nalangumaavu-goat-milk-soap",
        name: "Premium 20+ Herb Infused Nalangumaavu Goat Milk Soap",
        weight: "100 g",
        price: 240,
        quantity: 1,
        image: "/assets/images/img10.jpeg"
      }
    ],
    subtotal: 700,
    shippingCharge: 60,
    totalAmount: 760
  },
  {
    id: "FAO-2026-1047",
    customerName: "Priya Sundaram",
    email: "priya.s@example.com",
    phone: "+91 98401 23456",
    orderDate: "2026-11-01",
    paymentStatus: "Paid",
    deliveryAddress: {
      street: "18, Lotus Avenue, Anna Nagar West",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600040"
    },
    items: [
      {
        id: "herbal-hair-growth-oil",
        name: "Herbal Hair Growth Oil",
        weight: "100 ml",
        price: 120,
        quantity: 3,
        image: "/assets/images/img5.jpeg"
      },
      {
        id: "saffron-gold-glow-cream",
        name: "Saffron Gold Day & Night Glow Cream",
        weight: "50 g",
        price: 320,
        quantity: 2,
        image: "/assets/images/img8.jpeg"
      }
    ],
    subtotal: 1000,
    shippingCharge: 0,
    totalAmount: 1000
  },
  {
    id: "FAO-2026-1046",
    customerName: "Kavitha Nair",
    email: "kavitha.nair@example.com",
    phone: "+91 97123 45678",
    orderDate: "2026-10-31",
    paymentStatus: "Paid",
    deliveryAddress: {
      street: "7B, Palm Grove Residences",
      city: "Coimbatore",
      state: "Tamil Nadu",
      pincode: "641018"
    },
    items: [
      {
        id: "beetroot-lip-lightening-balm",
        name: "Beetroot Lip Lightening Balm",
        weight: "15 g",
        price: 150,
        quantity: 2,
        image: "/assets/images/img7.jpeg"
      },
      {
        id: "skin-brightening-face-pack",
        name: "Skin Brightening Herbal Face Pack",
        weight: "100 g",
        price: 250,
        quantity: 1,
        image: "/assets/images/img6.jpeg"
      }
    ],
    subtotal: 550,
    shippingCharge: 60,
    totalAmount: 610
  },
  {
    id: "FAO-2026-1045",
    customerName: "Deepak Sharma",
    email: "deepak.sharma@example.com",
    phone: "+91 98840 99887",
    orderDate: "2026-10-30",
    paymentStatus: "Pending",
    deliveryAddress: {
      street: "Flat 201, Shanti Niketan Apartments",
      city: "Bengaluru",
      state: "Karnataka",
      pincode: "560034"
    },
    items: [
      {
        id: "red-wine-anti-aging-soap",
        name: "Red Wine & Pomegranate Anti-Aging Soap",
        weight: "100 g",
        price: 250,
        quantity: 2,
        image: "/assets/images/img9.jpeg"
      }
    ],
    subtotal: 500,
    shippingCharge: 90,
    totalAmount: 590
  },
  {
    id: "FAO-2026-1044",
    customerName: "Ananya Iyer",
    email: "ananya.iyer@example.com",
    phone: "+91 94440 11223",
    orderDate: "2026-10-29",
    paymentStatus: "Paid",
    deliveryAddress: {
      street: "24, Temple Street, Mylapore",
      city: "Chennai",
      state: "Tamil Nadu",
      pincode: "600004"
    },
    items: [
      {
        id: "nalangumaavu-bath-powder",
        name: "Traditional Herbal Nalangumaavu Bath Powder",
        weight: "200 g",
        price: 280,
        quantity: 2,
        image: "/assets/images/img3.jpeg"
      },
      {
        id: "aloe-vera-gel",
        name: "Pure Soothing Aloe Vera Gel",
        weight: "100 g",
        price: 180,
        quantity: 1,
        image: "/assets/images/img4.jpeg"
      }
    ],
    subtotal: 740,
    shippingCharge: 60,
    totalAmount: 800
  },
  {
    id: "FAO-2026-1043",
    customerName: "Sneha Reddy",
    email: "sneha.reddy@example.com",
    phone: "+91 99000 88776",
    orderDate: "2026-10-28",
    paymentStatus: "Failed",
    deliveryAddress: {
      street: "Plot 55, Jubilee Hills",
      city: "Hyderabad",
      state: "Telangana",
      pincode: "500033"
    },
    items: [
      {
        id: "saffron-gold-glow-cream",
        name: "Saffron Gold Day & Night Glow Cream",
        weight: "50 g",
        price: 320,
        quantity: 1,
        image: "/assets/images/img8.jpeg"
      }
    ],
    subtotal: 320,
    shippingCharge: 90,
    totalAmount: 410
  },
  {
    id: "FAO-2026-1042",
    customerName: "Vikram Malhotra",
    email: "vikram.m@example.com",
    phone: "+91 91234 56789",
    orderDate: "2026-10-27",
    paymentStatus: "Paid",
    deliveryAddress: {
      street: "14, Coral Court, Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      pincode: "400020"
    },
    items: [
      {
        id: "skin-brightening-goat-milk-soap",
        name: "Premium Skin Brightening Goat Milk Soap",
        weight: "100 g",
        price: 230,
        quantity: 4,
        image: "/assets/images/img11.jpeg"
      }
    ],
    subtotal: 920,
    shippingCharge: 0,
    totalAmount: 920
  }
];

export const initialProducts = [
  {
    id: "skin-brightening-goat-milk-soap",
    name: "Premium Skin Brightening Goat Milk Soap",
    category: "soap",
    price: 230,
    weight: "100 g",
    stock: 45,
    image: "/assets/images/img11.jpeg",
    description: "Handcrafted with pure goat milk, manjistha, and licorice to gently cleanse and enhance natural radiance.",
    subtitle: "Handcrafted Radiant Glow Formula",
    keyIngredients: "Premium Goat Milk Soap Base, Manjistha, Licorice, Oats Extract, Herbal-Infused Oil, Fragrance Oil, Essential Oil",
    benefits: "Helps remove tan\nHelps reduce dullness\nHelps reduce the appearance of dark spots\nHelps promote a brighter-looking skin tone\nVisible glow and softness from initial wash",
    howToUse: "Wet your face with clean water.\nGently apply the soap and create a soft lather.\nLeave it on your face for 1 minute.\nRinse thoroughly with clean water.\nUse up to 3 times a day as part of your skincare routine.",
    suitability: "All skin types, including sensitive and acne-prone skin, as stated by the brand."
  },
  {
    id: "nalangumaavu-goat-milk-soap",
    name: "Premium 20+ Herb Infused Nalangumaavu Goat Milk Soap",
    category: "soap",
    price: 240,
    weight: "100 g",
    stock: 38,
    image: "/assets/images/img10.jpeg",
    description: "Infused with sandalwood, amla, vetiver, and 20+ botanicals for gentle everyday body exfoliation.",
    subtitle: "Ancient 20-Herb Ayurvedic Ritual",
    keyIngredients: "Premium Goat Milk Soap Base, Sandalwood, Orange Peel, Almond, Amla, Manjistha, Licorice, Rosemary, Poolankilangu, Vetiver, Avarampoo, 13+ traditional herbs",
    benefits: "Gently exfoliates dead skin buildup\nReduces dullness and polishes texture\nLeaves skin feeling velvety soft\nEnhances natural radiant undertones",
    howToUse: "Wet skin with warm water.\nWork up a creamy herbal lather.\nMassage over face and body for 1-2 minutes.\nRinse clean and pat dry.",
    suitability: "Normal, dry, and combination body skin."
  },
  {
    id: "red-wine-anti-aging-soap",
    name: "Red Wine & Pomegranate Anti-Aging Soap",
    category: "soap",
    price: 250,
    weight: "100 g",
    stock: 22,
    image: "/assets/images/img9.jpeg",
    description: "Rich in antioxidants from red wine extract and pomegranate to restore skin elasticity and youthful glow.",
    subtitle: "Antioxidant Cellular Youth Complex",
    keyIngredients: "Red Wine Polyphenols, Organic Pomegranate Extract, Wood-Pressed Coconut Oil, Raw Shea Butter, Natural Vitamin E",
    benefits: "Fights oxidative environmental stress\nBoosts skin firmness and elasticity\nDeeply hydrates mature skin\nPromotes healthy cell turnover",
    howToUse: "Lather between wet palms.\nApply gently with circular upward motions.\nRinse thoroughly with lukewarm water.\nFollow with Faa Organics Day Cream.",
    suitability: "Mature skin and skin showing early signs of aging or sun damage."
  },
  {
    id: "saffron-gold-glow-cream",
    name: "Saffron Gold Day & Night Glow Cream",
    category: "cream",
    price: 320,
    weight: "50 g",
    stock: 50,
    image: "/assets/images/img8.jpeg",
    description: "Kashmiri saffron and pure almond butter infused cream for deep overnight hydration and glowing complexion.",
    subtitle: "Pure Kashmiri Kesar Infusion",
    keyIngredients: "Pure Kashmiri Saffron (Crocus Sativus), Cold-Pressed Almond Oil, Mango Butter, Aloe Vera Gel Base, Kumkumadi Extract",
    benefits: "Restores dull, tired skin overnight\nFades hyperpigmentation and sun spots\nLeaves skin supple, non-greasy, and luminous\nProvides lasting all-day moisture",
    howToUse: "Take a pea-sized amount onto clean fingertips.\nDot evenly across face and neck.\nMassage gently in upward strokes until fully absorbed.\nUse morning and night.",
    suitability: "Suitable for dry, normal, and uneven skin tones."
  },
  {
    id: "aloe-vera-gel",
    name: "Pure Soothing Aloe Vera Gel",
    category: "cream",
    price: 180,
    weight: "100 g",
    stock: 65,
    image: "/assets/images/img4.jpeg",
    description: "99% pure organic cold-pressed aloe vera gel to cool sunburns, soothe irritation, and hydrate skin.",
    subtitle: "Cooling & Hydrating Leaf Extract",
    keyIngredients: "99% Organic Cold-Pressed Aloe Barbadensis Leaf Juice, Vegetable Glycerin, Cucumber Hydrosol",
    benefits: "Instantly cools and calms heated skin\nSoothes razor burns, redness, and breakouts\nOil-free hydration that absorbs in seconds\nMultipurpose hair and scalp soothing mask",
    howToUse: "Apply generously to cleansed face, body, or scalp.\nAllow to absorb naturally without washing off.\nCan be kept refrigerated for an extra cooling sensation.",
    suitability: "All skin types, especially sensitive and acne-prone skin."
  },
  {
    id: "herbal-hair-growth-oil",
    name: "Herbal Hair Growth Oil",
    category: "oil",
    price: 120,
    weight: "100 ml",
    stock: 74,
    image: "/assets/images/img5.jpeg",
    description: "Traditional wood-pressed coconut oil boiled with hibiscus, kalonji, amla, and curry leaves.",
    subtitle: "Slow-Cooked Scalp Nutrition Formula",
    keyIngredients: "Wood-Pressed Coconut Oil, Amla, Curry Leaves, Hibiscus Flowers, Rosemary, Kalonji (Black Seed), Fenugreek Seeds, Bhringraj",
    benefits: "Nourishes roots and strengthens follicle roots\nHelps reduce hair breakage and split ends\nCalms dry, flaky scalp issues\nAdds natural shine and smooth bounce",
    howToUse: "Part hair into sections.\nApply oil directly to scalp and massage with fingertips for 5 minutes.\nLeave on for 1-2 hours or overnight.\nWash with a mild herbal shampoo.",
    suitability: "All hair textures and scalp conditions."
  },
  {
    id: "skin-brightening-face-pack",
    name: "Skin Brightening Herbal Face Pack",
    category: "powder",
    price: 250,
    weight: "100 g",
    stock: 30,
    image: "/assets/images/img6.jpeg",
    description: "Sun-dried wild turmeric, kasturi manjal, multani mitti, and rose petals to detoxify pores.",
    subtitle: "Sun-Dried Botanical Detox Powder",
    keyIngredients: "Kasturi Manjal (Wild Turmeric), Multani Mitti, Sun-Dried Damascus Rose Petals, Sandalwood Powder, Licorice Root",
    benefits: "Deep cleanses clogged pores and removes excess sebum\nHelps visibly reduce tanning and blemishes\nImproves skin tone and clarity\nLeaves face refreshed and smooth",
    howToUse: "Mix 1-2 tablespoons with raw milk, curd, or rose water into a smooth paste.\nApply evenly over face and neck avoiding eye area.\nLeave on for 12-15 minutes until semi-dry.\nRinse with cool water while gently buffing skin.",
    suitability: "Normal to oily, acne-prone, and tanned skin."
  },
  {
    id: "beetroot-lip-lightening-balm",
    name: "Beetroot Lip Lightening Balm",
    category: "cream",
    price: 150,
    weight: "15 g",
    stock: 0, // Demonstrates automatic Out of Stock status!
    image: "/assets/images/img7.jpeg",
    description: "Raw shea butter and organic beetroot extract to naturally lighten pigmented lips and provide 24h moisture.",
    subtitle: "Nourishing Herbal Lip Tint",
    keyIngredients: "Organic Beetroot Extract, Cold-Pressed Coconut Oil, Raw Shea Butter, Cocoa Butter, Natural Vitamin E Oil",
    benefits: "Helps lighten nicotine and sun pigmentation on lips\nPrevents lip peeling and chapping\nAdds a subtle, healthy rosy sheen\nDeep long-lasting hydration",
    howToUse: "Take a small amount onto finger.\nSmooth gently across lips whenever feeling dry.\nApply a thicker layer before bedtime as an overnight lip sleeping mask.",
    suitability: "Dry, chapped, or pigmented lips."
  }
];

export const initialCategories = [
  {
    id: "soap",
    name: "Soap",
    slug: "soap",
    description: "Handcrafted cold-processed organic soaps made with fresh goat milk and wild botanicals.",
    productCount: 3,
    status: "Active",
    displayOrder: 1,
    image: "/assets/images/img11.jpeg"
  },
  {
    id: "combo",
    name: "Combo",
    slug: "combo",
    description: "Special value skincare duos, curated ritual bundles, and artisanal gift sets.",
    productCount: 0,
    status: "Active",
    displayOrder: 2,
    image: "/assets/images/img2.jpeg"
  },
  {
    id: "cream",
    name: "Creams & Balms",
    slug: "cream",
    description: "Rich botanical butters, herbal night creams, and soothing pure aloe gels.",
    productCount: 2,
    status: "Active",
    displayOrder: 3,
    image: "/assets/images/img8.jpeg"
  },
  {
    id: "oil",
    name: "Herbal Oils",
    slug: "oil",
    description: "Authentic wood-pressed oils slow-cooked with fresh medicinal herbs for hair & body.",
    productCount: 1,
    status: "Active",
    displayOrder: 4,
    image: "/assets/images/img5.jpeg"
  },
  {
    id: "powder",
    name: "Herbal Powders",
    slug: "powder",
    description: "Traditional sun-dried herbal bath powders, ubtan, and face detoxification packs.",
    productCount: 1,
    status: "Active",
    displayOrder: 5,
    image: "/assets/images/img6.jpeg"
  }
];

export const salesOverviewData = [
  { month: "May 2026", sales: 42500, orders: 58, avgOrder: 732 },
  { month: "Jun 2026", sales: 48900, orders: 66, avgOrder: 740 },
  { month: "Jul 2026", sales: 53200, orders: 72, avgOrder: 738 },
  { month: "Aug 2026", sales: 61800, orders: 84, avgOrder: 735 },
  { month: "Sep 2026", sales: 69400, orders: 93, avgOrder: 746 },
  { month: "Oct 2026", sales: 78500, orders: 106, avgOrder: 740 }
];

export const initialAdminProfile = {
  name: "Faa Fatima",
  role: "Store Administrator",
  email: "admin@faaorganics.com",
  avatar: "/assets/images/admin-logo.jpg"
};
