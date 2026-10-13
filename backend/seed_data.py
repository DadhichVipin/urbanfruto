import os
from pathlib import Path

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

# Catalog images live in Cloudflare R2 (uploaded by scripts/migrate_images_to_r2.py).
MEDIA_URL = os.environ["R2_PUBLIC_URL"].rstrip("/")

IMG_ROYAL = f"{MEDIA_URL}/catalog/royal.jpg"
IMG_TRIO = f"{MEDIA_URL}/catalog/trio.jpg"
IMG_EMPEROR = f"{MEDIA_URL}/catalog/emperor.jpg"
IMG_WELLNESS = f"{MEDIA_URL}/catalog/wellness.jpg"
IMG_CITRUS = f"{MEDIA_URL}/catalog/citrus.jpg"
IMG_ORCHARD = f"{MEDIA_URL}/catalog/orchard.jpg"

IMG_PITAYA = f"{MEDIA_URL}/catalog/pitaya.jpg"
IMG_PITAYA2 = f"{MEDIA_URL}/catalog/pitaya-2.jpg"
IMG_CHERRY = f"{MEDIA_URL}/catalog/cherry.jpg"
IMG_KIWI = f"{MEDIA_URL}/catalog/kiwi.jpg"
IMG_AVOCADO = f"{MEDIA_URL}/catalog/avocado.jpg"
IMG_CITRUS_CUT = f"{MEDIA_URL}/catalog/citrus-cut.jpg"

HAMPERS = [
    {
        "name": "Daily Fresh Trio", "slug": "daily-fresh-trio",
        "tagline": "Everyday wellness, hand-sorted each morning",
        "description": "A compact everyday box of three seasonal staples, ozone washed and chilled to 4°C within minutes of intake.",
        "badge": "Daily Vitality", "price": 1299, "compare_price": None,
        "weight": "2.8 kg", "vessel": "Recyclable Cane Tray", "image": IMG_TRIO,
        "gallery": [IMG_TRIO, IMG_ORCHARD], "curation": "wellness",
        "contents": ["Washington Fuji Apples (4 pcs)", "Valencia Sweet Navel Oranges (4 pcs)", "South African Packham Pears (3 pcs)"],
        "produce": [
            {"name": "Washington Fuji Apples", "note": "High Crunch Grade", "qty": "4 pcs"},
            {"name": "Valencia Navel Oranges", "note": "Sun-drenched Citrus", "qty": "4 pcs"},
            {"name": "Packham Pears", "note": "South African Orchard", "qty": "3 pcs"},
        ],
        "varieties": 3, "rating": 4.7, "reviews": 96, "stock": 30,
        "featured": True, "popular": False, "active": True,
    },
    {
        "name": "The Royal Exotic Basket", "slug": "royal-exotic-basket",
        "tagline": "Hand-woven wicker · masterfully curated seasonal luxury",
        "description": "Masterfully curated seasonal luxury orchard harvest in hand-woven wicker. Fifteen artisanal varieties, hand-sorted daily at 4 AM for peak Brix sweetness.",
        "badge": "Most Popular · Chef's Choice", "price": 2299, "compare_price": 2650,
        "weight": "4.2 kg (±150g)", "vessel": "Hand-Woven Heirloom Wicker", "image": IMG_ROYAL,
        "gallery": [IMG_ROYAL, IMG_EMPEROR, IMG_CITRUS], "curation": "exotic",
        "contents": ["Vietnamese Red Pitaya Dragon Fruit", "Chilean Bing Cherries & Blueberry Punnet", "Zespri Gold Kiwis & Muscat Grapes", "Artisanal Muslin Lining & Greeting Card"],
        "produce": [
            {"name": "White Dragonfruit", "note": "Vietnam Highland Origin", "qty": "350g Imported"},
            {"name": "Pink Taiwan Guava", "note": "High Vitamin C · Crisp", "qty": "400g Seasonal"},
            {"name": "Blueberry Punnet", "note": "New Zealand Hayward", "qty": "100g Clamshell"},
            {"name": "Fresh Green Kiwis", "note": "Sun-drenched Citrus", "qty": "3 Units"},
            {"name": "Malta Valencia Orange", "note": "Sun-drenched Citrus", "qty": "400g"},
            {"name": "Crisp Granny Smith Apples", "note": "Kinnaur Valley Orchards", "qty": "250g"},
            {"name": "Royal Washington Red Apples", "note": "Crisp & Juicy", "qty": "250g"},
            {"name": "Ruby Bhagwa Pomegranate", "note": "Solapur Pearl Grade", "qty": "400g"},
            {"name": "Custard Apple (Sitaphal)", "note": "Seed Heritage Reserve", "qty": "400g Seasonal"},
        ],
        "varieties": 15, "rating": 4.9, "reviews": 184, "stock": 18,
        "featured": True, "popular": True, "active": True,
    },
    {
        "name": "Grand Emperor Hamper", "slug": "grand-emperor-hamper",
        "tagline": "Bespoke wood chest for prestige corporate gifting",
        "description": "Our most generous presentation vessel, built for board rooms and milestone gifting. Gourmet organic honeycomb and raw almond jar included.",
        "badge": "Prestige Corporate", "price": 3299, "compare_price": 3750,
        "weight": "7.2 kg", "vessel": "Bespoke Wood Chest", "image": IMG_EMPEROR,
        "gallery": [IMG_EMPEROR, IMG_ROYAL], "curation": "corporate",
        "contents": ["Mexican Hass Avocados & Golden Passion Fruit", "Kabul Ruby Pomegranates & Thai Guava", "Gourmet Organic Honeycomb & Raw Almond Jar"],
        "produce": [
            {"name": "Mexican Hass Avocado", "note": "Cold-chain ripened", "qty": "2 pcs"},
            {"name": "Golden Passion Fruit", "note": "Aromatic Reserve", "qty": "4 pcs"},
            {"name": "Kabul Ruby Pomegranate", "note": "Hand-picked", "qty": "2 pcs"},
            {"name": "Organic Honeycomb Jar", "note": "Artisanal gourmet add-on", "qty": "220g"},
        ],
        "varieties": 18, "rating": 4.9, "reviews": 72, "stock": 9,
        "featured": True, "popular": False, "active": True,
    },
    {
        "name": "Wellness Recovery Box", "slug": "wellness-recovery-box",
        "tagline": "Immunity-forward curation for recovery gifting",
        "description": "Vitamin-dense, low-acid produce curated with nutritionists for post-surgery and recovery gifting. Chilled dispatch within 3 hours.",
        "badge": "Wellness Trio", "price": 1799, "compare_price": 1999,
        "weight": "3.4 kg", "vessel": "Natural Willow Oval Wicker", "image": IMG_WELLNESS,
        "gallery": [IMG_WELLNESS, IMG_KIWI], "curation": "wellness",
        "contents": ["Zespri SunGold Kiwi & Papaya", "Ruby Pomegranate & Sweet Lime", "Seasonal Berry Punnet"],
        "produce": [
            {"name": "Zespri SunGold Kiwi", "note": "Vitamin C dense", "qty": "3 pcs"},
            {"name": "Ruby Pomegranate", "note": "Iron rich", "qty": "2 pcs"},
            {"name": "Sweet Lime (Mosambi)", "note": "Low acid", "qty": "500g"},
        ],
        "varieties": 8, "rating": 4.8, "reviews": 58, "stock": 22,
        "featured": False, "popular": False, "active": True,
    },
    {
        "name": "Citrus Bliss Crate", "slug": "citrus-bliss-crate",
        "tagline": "Sun-drenched citrus from alpine foothills",
        "description": "A bright, zesty crate of five citrus varieties, lab-tested for Brix and packed in plastic-free cane.",
        "badge": "Exotic Imports", "price": 1499, "compare_price": None,
        "weight": "3.0 kg", "vessel": "Plastic-Free Cane Crate", "image": IMG_CITRUS,
        "gallery": [IMG_CITRUS, IMG_CITRUS_CUT], "curation": "exotic",
        "contents": ["Blood Oranges & Malta Valencia", "Ruby Grapefruit", "Kaffir Lime & Sweet Lime"],
        "produce": [
            {"name": "Blood Orange", "note": "Imported Sicilian", "qty": "4 pcs"},
            {"name": "Ruby Grapefruit", "note": "Lab tested 13° Brix", "qty": "2 pcs"},
            {"name": "Malta Valencia Orange", "note": "Seasonal peak", "qty": "500g"},
        ],
        "varieties": 6, "rating": 4.6, "reviews": 41, "stock": 26,
        "featured": False, "popular": False, "active": True,
    },
    {
        "name": "Tropical Halo Basket", "slug": "tropical-halo-basket",
        "tagline": "Tropical grove exotics in artisanal wicker",
        "description": "Mangosteen, rambutan and pitaya flown in from tropical groves, ozone washed and cold-chain sealed.",
        "badge": "Exotic Imports", "price": 2599, "compare_price": 2899,
        "weight": "4.6 kg", "vessel": "Artisanal Wicker Tray", "image": IMG_ORCHARD,
        "gallery": [IMG_ORCHARD, IMG_PITAYA2], "curation": "exotic",
        "contents": ["Mangosteen & Rambutan", "Red Pitaya & Star Fruit", "Thai Guava"],
        "produce": [
            {"name": "Mangosteen", "note": "Thai grove reserve", "qty": "400g"},
            {"name": "Rambutan", "note": "Hand-picked", "qty": "400g"},
            {"name": "Red Pitaya", "note": "Vietnam Highland", "qty": "2 pcs"},
        ],
        "varieties": 10, "rating": 4.8, "reviews": 63, "stock": 14,
        "featured": False, "popular": False, "active": True,
    },
]

FRUITS = [
    {
        "name": "Vietnamese Red Pitaya", "slug": "vietnamese-red-pitaya", "short_name": "Red Pitaya",
        "origin": "Direct Orchard Harvest", "grammage": "350 - 400g / pc",
        "description": "Sourced directly from certified solar-rich groves. Crisp ruby-magenta flesh laden with natural antioxidants, subtle floral sweetness, and refreshing crunch. Hand-washed with active ozone.",
        "price": 280, "unit": "pc", "image": IMG_PITAYA, "brix": "14.2°", "weight_grams": 380,
        "tags": ["Freshly Plucked Today", "100% Ozone Sanitized", "Zero Wax Coating"],
        "nutrition": [{"label": "Energy", "value": "60 kcal"}, {"label": "Vitamin C", "value": "9 mg"}, {"label": "Fibre", "value": "3 g"}, {"label": "Sugar", "value": "8 g"}],
        "packaging": "Wrapped in biodegradable cane mesh, cold-packed at 4°C with gel sheets. Shelf life 5-6 days refrigerated.",
        "stock": 48, "active": True,
    },
    {
        "name": "Chilean Bing Cherries", "slug": "chilean-bing-cherries", "short_name": "Bing Cherries",
        "origin": "Air-Flown Chilean Reserve", "grammage": "250g punnet",
        "description": "Deep mahogany Bing cherries with a firm snap and high natural sugar. Air-flown and never frozen, graded by hand for uniform 28mm calibre.",
        "price": 499, "unit": "250g", "image": IMG_CHERRY, "brix": "18.4°", "weight_grams": 250,
        "tags": ["Air-Flown Reserve", "Hand Graded", "Never Frozen"],
        "nutrition": [{"label": "Energy", "value": "63 kcal"}, {"label": "Vitamin C", "value": "7 mg"}, {"label": "Potassium", "value": "222 mg"}, {"label": "Sugar", "value": "13 g"}],
        "packaging": "Clamshell punnet in vented cold sleeve. Best consumed within 4 days.",
        "stock": 32, "active": True,
    },
    {
        "name": "Zespri SunGold Kiwi", "slug": "zespri-sungold-kiwi", "short_name": "SunGold Kiwi",
        "origin": "New Zealand Certified", "grammage": "3 pcs · 300g",
        "description": "Golden-fleshed SunGold kiwi with tropical sweetness and three times the vitamin C of an orange. Ripened in controlled 4°C chambers.",
        "price": 320, "unit": "3 pcs", "image": IMG_KIWI, "brix": "15.6°", "weight_grams": 300,
        "tags": ["Vitamin C Dense", "Controlled Ripening", "Zero Chemical Wax"],
        "nutrition": [{"label": "Energy", "value": "63 kcal"}, {"label": "Vitamin C", "value": "152 mg"}, {"label": "Fibre", "value": "1.4 g"}, {"label": "Sugar", "value": "12 g"}],
        "packaging": "Nested in moulded pulp tray, cold-chain sealed.",
        "stock": 40, "active": True,
    },
    {
        "name": "Mexican Hass Avocado", "slug": "mexican-hass-avocado", "short_name": "Hass Avocado",
        "origin": "Michoacán Grove Select", "grammage": "2 pcs · 420g",
        "description": "Buttery Hass avocados with pebbled skin, ripened to a perfect press. Rich in monounsaturated fats and folate.",
        "price": 480, "unit": "2 pcs", "image": IMG_AVOCADO, "brix": "—", "weight_grams": 420,
        "tags": ["Ripe & Ready", "Grove Select", "Cold-Chain"],
        "nutrition": [{"label": "Energy", "value": "160 kcal"}, {"label": "Healthy Fats", "value": "15 g"}, {"label": "Fibre", "value": "7 g"}, {"label": "Folate", "value": "81 mcg"}],
        "packaging": "Individually netted, ripeness-indicator sticker included.",
        "stock": 24, "active": True,
    },
    {
        "name": "Ruby Bhagwa Pomegranate", "slug": "ruby-bhagwa-pomegranate", "short_name": "Pomegranate",
        "origin": "Solapur Pearl Grade", "grammage": "2 pcs · 800g",
        "description": "Pearl-grade Bhagwa pomegranates with deep ruby arils and remarkably thin rind. Hand-tapped for density before packing.",
        "price": 340, "unit": "2 pcs", "image": IMG_AVOCADO, "brix": "16.1°", "weight_grams": 800,
        "tags": ["Pearl Grade", "Iron Rich", "Hand Tapped"],
        "nutrition": [{"label": "Energy", "value": "83 kcal"}, {"label": "Vitamin K", "value": "16 mcg"}, {"label": "Fibre", "value": "4 g"}, {"label": "Sugar", "value": "14 g"}],
        "packaging": "Cushioned in shredded cane, plastic-free.",
        "stock": 36, "active": True,
    },
    {
        "name": "Pink Taiwan Guava", "slug": "pink-taiwan-guava", "short_name": "Taiwan Guava",
        "origin": "Chikkan Handpicked", "grammage": "400g seasonal",
        "description": "Crisp pink-fleshed Taiwan guava, remarkably low in seeds with a honeyed finish and exceptional vitamin C density.",
        "price": 260, "unit": "400g", "image": IMG_ORCHARD, "brix": "12.8°", "weight_grams": 400,
        "tags": ["High Vitamin C", "Low Seed", "Handpicked"],
        "nutrition": [{"label": "Energy", "value": "68 kcal"}, {"label": "Vitamin C", "value": "228 mg"}, {"label": "Fibre", "value": "5 g"}, {"label": "Sugar", "value": "9 g"}],
        "packaging": "Muslin wrapped in vented cane box.",
        "stock": 44, "active": True,
    },
    {
        "name": "Muscat Seedless Grapes", "slug": "muscat-seedless-grapes", "short_name": "Muscat Grapes",
        "origin": "Nashik Vineyard Reserve", "grammage": "500g box",
        "description": "Aromatic Muscat grapes with a floral nose and crisp seedless bite, clipped at optimal Brix and chilled immediately.",
        "price": 299, "unit": "500g", "image": IMG_CITRUS, "brix": "19.2°", "weight_grams": 500,
        "tags": ["Seedless", "Vineyard Reserve", "Ozone Washed"],
        "nutrition": [{"label": "Energy", "value": "69 kcal"}, {"label": "Vitamin K", "value": "15 mcg"}, {"label": "Fibre", "value": "0.9 g"}, {"label": "Sugar", "value": "16 g"}],
        "packaging": "Vented punnet with humidity liner.",
        "stock": 30, "active": True,
    },
    {
        "name": "Blood Orange Sicilian", "slug": "blood-orange-sicilian", "short_name": "Blood Orange",
        "origin": "Imported Sicilian Grove", "grammage": "4 pcs · 700g",
        "description": "Crimson-fleshed Tarocco blood oranges with a berry-citrus complexity, cold-pressed quality grade.",
        "price": 420, "unit": "4 pcs", "image": IMG_CITRUS_CUT, "brix": "13.4°", "weight_grams": 700,
        "tags": ["Imported", "Berry-Citrus Notes", "Juice Grade"],
        "nutrition": [{"label": "Energy", "value": "47 kcal"}, {"label": "Vitamin C", "value": "53 mg"}, {"label": "Fibre", "value": "2.4 g"}, {"label": "Sugar", "value": "9 g"}],
        "packaging": "Tissue wrapped, nested in cane tray.",
        "stock": 20, "active": True,
    },
]

CURATIONS = [
    {"id": "royal", "label": "Royal Berry", "image": IMG_ROYAL},
    {"id": "citrus", "label": "Citrus Bliss", "image": IMG_CITRUS},
    {"id": "tropical", "label": "Tropical Halo", "image": IMG_ORCHARD},
    {"id": "green", "label": "Green Orchard", "image": IMG_AVOCADO},
    {"id": "golden", "label": "Golden Harvest", "image": IMG_TRIO},
    {"id": "wellness", "label": "Wellness Trio", "image": IMG_WELLNESS},
    {"id": "berry", "label": "Berry Harvest", "image": IMG_CHERRY},
    {"id": "emperor", "label": "Grand Emperor", "image": IMG_EMPEROR},
]

PROMISES = [
    {"icon": "droplet", "title": "Ozone Washed", "note": "99.9% Bacteria & Residue Free"},
    {"icon": "zap", "title": "3-Hour Express", "note": "Metro Same-Day Gifting"},
    {"icon": "snowflake", "title": "4°C Cold Chain", "note": "Refrigerated Transit Only"},
    {"icon": "gift", "title": "Artisanal Wicker", "note": "Handcrafted Muslin Tied"},
]

DIFFERENCE = [
    {"icon": "droplet", "title": "100% Ozone Purified", "body": "Every single piece is gently washed with active aqueous ozone, neutralising pesticides and surface microbes while keeping the natural skin intact.", "stat": "0% Chemical Soap"},
    {"icon": "snowflake", "title": "4°C Active Cold-Chain", "body": "Refrigerated intake vans and temperature-controlled dispatch centres halt enzymatic breakdown, preserving crispness and vitamin density.", "stat": "Guaranteed Crispness"},
    {"icon": "leaf", "title": "Zero Chemical Wax", "body": "We never apply petroleum-derived glossing or synthetic shelf-life enhancers. Pure botanical integrity straight from certified ethical growers.", "stat": "Non-GMO & Organic"},
    {"icon": "gift", "title": "Artisan Hand-Woven Wicker", "body": "Presented in reusable heirloom willow baskets lined with unbleached organic muslin, finished with calligraphy greeting notes.", "stat": "Plastic-Free Gifting"},
]

TESTIMONIALS = [
    {"initials": "AR", "name": "Ananya Roy", "meta": "Verified Buyer · New Delhi", "rating": 5,
     "quote": "Ordered The Royal Exotic Basket for our parents' 35th anniversary in South Delhi. The dragon fruit and sweet cherries looked straight out of a painting, and the wicker basket is now a permanent table centrepiece."},
    {"initials": "VM", "name": "Vikram Mehta", "meta": "Managing Partner · Elevate VC", "rating": 5,
     "quote": "We dispatched 150 Grand Emperor Hampers to our senior executive partners across Mumbai and Bengaluru. The cleaning, pristine cold chain meant zero fruit bruising. Unmatched luxury."},
    {"initials": "SK", "name": "Shreya Kulkarni", "meta": "Verified Buyer · Mumbai", "rating": 5,
     "quote": "I customized a wellness box for a friend recovering from surgery. The 3-hour rapid dispatch had it at the hospital while the berries were still chilled and dewy. Truly life-affirming service!"},
]
