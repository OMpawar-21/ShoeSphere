import axios from 'axios';

// 1. Configuration
const config = {
  headers: {
    'api_key': 'blt2fe3288bcebfa8ae',
    'authorization': 'cs79dcf239be8c84f3cf29751f', // Management Token yahan dalien
    'Content-Type': 'application/json'
  }
};

// 2. Materials
// const materialsData = [
//   { title: "Primeknit", care: "Machine wash cold in a laundry bag; do not tumble dry." },
//   { title: "Full-Grain Leather", care: "Wipe with a damp cloth; use specialized leather cleaner." },
//   { title: "Recycled Polyester", care: "Wash with similar colors; avoid high heat to preserve fibers." },
//   { title: "Vegan Leather", care: "Clean with mild soap and water; air dry away from sunlight." },
//   { title: "GORE-TEX", care: "Rinse off mud immediately; use a waterproof reviving spray periodically." },
//   { title: "Suede", care: "Use a suede brush only; avoid water contact to prevent staining." },
//   { title: "Breathable Mesh", care: "Hand wash preferred; air dry to maintain shape." },
//   { title: "Parley Ocean Plastic", care: "Cool wash only; helps reduce microplastic shedding." },
//   { title: "Canvas", care: "Spot clean with a soft brush and lukewarm water." },
//   { title: "Nylon", care: "Highly durable; wipe down after use in outdoor conditions." }
// ];

// async function importMaterials() {
//   console.log("🧵 Importing Materials...");
//   const promises = materialsData.map(mat => axios.post(
//     'https://api.contentstack.io/v3/content_types/material/entries',
//     { entry: { title: mat.title, care_instructions: mat.care } },
//     config
//   ));

//   try {
//     const results = await Promise.all(promises);
//     console.log(`✅ Success: ${results.length} Materials created!`);
//   } catch (error) {
//     console.error("❌ Error:", error.response?.data || error.message);
//   }
// }

// importMaterials();

// const ADIDAS_UID = "bltd436587787dd8bb8"; 
// const NIKE_UID = "bltc411e7b6f21982ce";

// // 3. Categories
// const allCategories = [
//   // ADIDAS
//   { title: "Adidas Originals", types: ["Classic Leather", "Retro Suede"], brand: ADIDAS_UID },
//   { title: "Adidas Performance", types: ["Primeknit Runners", "Mesh Trainers"], brand: ADIDAS_UID },
//   { title: "Adidas Terrex", types: ["GORE-TEX Hikers", "Ripstop Trail"], brand: ADIDAS_UID },
//   { title: "Adidas Sustainability", types: ["Parley Ocean", "Recycled Knit"], brand: ADIDAS_UID },
//   { title: "Adidas Stella", types: ["Vegan Trainers", "Eco-Sandals"], brand: ADIDAS_UID },
//   { title: "Adidas Skate", types: ["Vulcanized Canvas", "Suede Lows"], brand: ADIDAS_UID },
//   { title: "Adidas Football", types: ["K-Leather Boots"], brand: ADIDAS_UID },
//   { title: "Adidas Basketball", types: ["Mesh Hoops", "Leather High-Tops"], brand: ADIDAS_UID },
//   { title: "Adidas Outdoor", types: ["Nylon All-Terrain"], brand: ADIDAS_UID },
//   { title: "Adidas Tennis", types: ["Hard Court Mesh"], brand: ADIDAS_UID },
  
//   // NIKE
//   { title: "Nike Heritage", types: ["AF1 Leather", "Dunk Suede"], brand: NIKE_UID },
//   { title: "Nike Running", types: ["Flyknit", "Air Mesh"], brand: NIKE_UID },
//   { title: "Nike ACG", types: ["All-Conditions GORE-TEX", "Nylon Tech"], brand: NIKE_UID },
//   { title: "Nike Move To Zero", types: ["Recycled Grinds", "Eco-Conscious"], brand: NIKE_UID },
//   { title: "Nike Lifestyle", types: ["Vegan Court", "Casual Suede"], brand: NIKE_UID },
//   { title: "Nike SB", types: ["Canvas Jacks", "Suede Dunks"], brand: NIKE_UID },
//   { title: "Nike Elite Football", types: ["Premium Leather Cleats"], brand: NIKE_UID },
//   { title: "Nike Hoops", types: ["Breathable Knit", "Performance Leather"], brand: NIKE_UID },
//   { title: "Nike Training", types: ["Gym Mesh", "CrossFit Leather"], brand: NIKE_UID },
//   { title: "Nike Court", types: ["Tennis Leather", "Mesh Performance"], brand: NIKE_UID }
// ];

// async function createAllCategories() {
//   console.log("🚀 Creating 20 specialized categories...");
//   const promises = allCategories.map(cat => axios.post(
//     'https://api.contentstack.io/v3/content_types/category/entries',
//     { 
//       entry: { 
//         title: cat.title, 
//         shoe_type: cat.types, 
//         brand: [{ uid: cat.brand, _content_type_uid: "brand" }] // Reference structure
//       } 
//     },
//     config
//   ));

//   try {
//     const results = await Promise.all(promises);
//     console.log(`✅ Success: ${results.length} Entries created.`);
//   } catch (error) {
//     console.error("❌ Error:", error.response?.data || error.message);
//   }
// }

// createAllCategories();

// 4. Sellers
// const sellersData = [
//   {
//     name: "Footwear World",
//     email: "contact@footwearworld.com",
//     description: "Authorized premium retailer for global sports brands.",
//     phone: "+1-555-0101",
//     address: "123 Sneaker St, New York, NY"
//   },
//   {
//     name: "Elite Sports Hub",
//     email: "support@elitesports.com",
//     description: "Specialist in high-performance running and training gear.",
//     phone: "+1-555-0202",
//     address: "456 Athlete Ave, Chicago, IL"
//   },
//   {
//     name: "The Sole Sanctuary",
//     email: "hello@solesanctuary.com",
//     description: "Boutique seller focusing on classic and limited edition shoes.",
//     phone: "+1-555-0303",
//     address: "789 Heritage Blvd, Los Angeles, CA"
//   },
//   {
//     name: "Urban Kickz",
//     email: "sales@urbankickz.com",
//     description: "Fast-growing urban streetwear and lifestyle shoe distributor.",
//     phone: "+1-555-0404",
//     address: "321 Metro Way, Miami, FL"
//   },
//   {
//     name: "Pro-Track Supplies",
//     email: "info@protrack.com",
//     description: "Dedicated supplier for professional track and field athletes.",
//     phone: "+1-555-0505",
//     address: "654 Stadium Rd, Austin, TX"
//   }
// ];

// async function importSellers() {
//   console.log("🏪 Starting Seller Import...");

//   const promises = sellersData.map(seller => {
//     // Wrapping in 'entry' object to avoid Error 141
//     const data = {
//       entry: {
//         name: seller.name,
//         email: seller.email,
//         description: seller.description,
//         phone: seller.phone,
//         address: seller.address
//       }
//     };
    
//     return axios.post('https://api.contentstack.io/v3/content_types/seller/entries', data, config);
//   });

//   try {
//     const results = await Promise.all(promises);
//     console.log(`✅ Success! ${results.length} Sellers created.`);
//   } catch (error) {
//     // Error handling to see exact API response
//     console.error("❌ Import Failed:", error.response ? error.response.data : error.message);
//   }
// }

// importSellers();

// 5. Site Config
// const detailedSiteConfig = {
//   entry: {
//     title: "Global Site Config - Adidas Inspired",
//     announcement_bar: {
//       text: "SIGN UP & GET 15% OFF | FREE SHIPPING FOR MEMBERS",
//       link: "/membership-signup",
//       bg_color: "#000000"
//     },
//     header: {
//       nav_menu: [
//         {
//           title: "MEN",
//           sub_links: [
//             { label: "All Men's Shoes", url: "/shoes?gender=men" },
//             { label: "Originals", url: "/category/originals" },
//             { label: "Running", url: "/category/performance" },
//             { label: "Football", url: "/category/football" }
//           ]
//         },
//         {
//           title: "WOMEN",
//           sub_links: [
//             { label: "All Women's Shoes", url: "/shoes?gender=women" },
//             { label: "Lifestyle", url: "/category/lifestyle" },
//             { label: "Training & Gym", url: "/category/training" },
//             { label: "Tennis", url: "/category/court" }
//           ]
//         },
//         {
//           title: "SPORTS",
//           sub_links: [
//             { label: "Running", url: "/category/performance" },
//             { label: "Football", url: "/category/football" },
//             { label: "Basketball", url: "/category/basketball" },
//             { label: "Outdoor & Hiking", url: "/category/outdoor" }
//           ]
//         },
//         {
//           title: "COLLECTIONS",
//           sub_links: [
//             { label: "Sustainability (Move to Zero)", url: "/category/sustainable" },
//             { label: "Skateboarding Heritage", url: "/category/skateboarding" },
//             { label: "New Arrivals", url: "/shoes?sort=newest" }
//           ]
//         }
//       ]
//     },
//     footer: {
//       columns: [
//         {
//           title: "PRODUCTS",
//           links: [
//             { link_title: "Shoes", url: "/shoes" },
//             { link_title: "New Arrivals", url: "/new-arrivals" },
//             { link_title: "Release Dates", url: "/releases" },
//             { link_title: "Sale", url: "/sale" }
//           ]
//         },
//         {
//           title: "SPORTS",
//           links: [
//             { link_title: "Running", url: "/category/performance" },
//             { link_title: "Football", url: "/category/football" },
//             { link_title: "Basketball", url: "/category/basketball" },
//             { link_title: "Training", url: "/category/training" }
//           ]
//         },
//         {
//           title: "SUPPORT",
//           links: [
//             { link_title: "Help", url: "/help" },
//             { link_title: "Returns & Refunds", url: "/returns" },
//             { link_title: "Sizing Charts", url: "/size-guide" },
//             { link_title: "Store Finder", url: "/store-locator" }
//           ]
//         },
//         {
//           title: "COMPANY INFO",
//           links: [
//             { link_title: "About Us", url: "/about" },
//             { link_title: "Sustainability", url: "/sustainability" },
//             { link_title: "Press", url: "/press" },
//             { link_title: "Careers", url: "/careers" }
//           ]
//         }
//       ],
//       copyright: "© 2026 ShoeSphere India. All Rights Reserved. Built by OM PAWAR."
//     }
//   }
// };

// async function updateSiteConfig() {
//   console.log("🛠️ Building detailed Adidas-style Global Config...");
//   try {
//     const response = await axios.post(
//       'https://api.contentstack.io/v3/content_types/site_config/entries',
//       detailedSiteConfig,
//       config
//     );
//     console.log("✅ Full Site Config with Mega-Menu created!");
//   } catch (error) {
//     console.error("❌ Error:", error.response ? error.response.data : error.message);
//   }
// }

// updateSiteConfig();

// 6. Shoes
// --- REPLACE THESE WITH YOUR ACTUAL UIDs FROM CONTENTSTACK ---
// const BRANDS = { ADIDAS: 'UID_ADIDAS', NIKE: 'UID_NIKE' };
// const SELLERS = { 
//   FOOTWEAR_WORLD: 'UID_SELLER_1', 
//   ELITE_SPORTS: 'UID_SELLER_2', 
//   SOLE_SANCTUARY: 'UID_SELLER_3', 
//   URBAN_KICKZ: 'UID_SELLER_4', 
//   PRO_TRACK: 'UID_SELLER_5' 
// };
// const MATERIALS = { 
//   LEATHER: 'UID_MAT_1', 
//   PRIMEKNIT: 'UID_MAT_2', 
//   RECYCLED: 'UID_MAT_3', 
//   GORETEX: 'UID_MAT_4', 
//   MESH: 'UID_MAT_5', 
//   SUEDE: 'UID_MAT_6', 
//   CANVAS: 'UID_MAT_7', 
//   NYLON: 'UID_MAT_8' 
// };
// const CATS = {
//   ORIGINALS: 'UID_CAT_1', PERFORMANCE: 'UID_CAT_2', SUSTAINABLE: 'UID_CAT_3',
//   OUTDOOR: 'UID_CAT_4', FOOTBALL: 'UID_CAT_5', BASKETBALL: 'UID_CAT_6',
//   LIFESTYLE: 'UID_CAT_7', SKATE: 'UID_CAT_8', TRAINING: 'UID_CAT_9', COURT: 'UID_CAT_10'
// };

// const shoeData = [
//   // 1. Originals
//   { title: "Adidas Superstar", url: "/shoes/adidas-superstar", price: 100, brand: BRANDS.ADIDAS, cat: CATS.ORIGINALS, mat: [MATERIALS.LEATHER], seller: SELLERS.FOOTWEAR_WORLD },
//   { title: "Nike Air Force 1", url: "/shoes/nike-af1", price: 110, brand: BRANDS.NIKE, cat: CATS.ORIGINALS, mat: [MATERIALS.LEATHER], seller: SELLERS.URBAN_KICKZ },
//   // 2. Performance
//   { title: "Adidas Ultraboost Light", url: "/shoes/ultraboost-light", price: 190, brand: BRANDS.ADIDAS, cat: CATS.PERFORMANCE, mat: [MATERIALS.PRIMEKNIT], seller: SELLERS.ELITE_SPORTS },
//   { title: "Nike Air Zoom Pegasus 40", url: "/shoes/pegasus-40", price: 130, brand: BRANDS.NIKE, cat: CATS.PERFORMANCE, mat: [MATERIALS.MESH], seller: SELLERS.PRO_TRACK },
//   // 3. Sustainable
//   { title: "Adidas Stan Smith Parley", url: "/shoes/stan-smith-parley", price: 120, brand: BRANDS.ADIDAS, cat: CATS.SUSTAINABLE, mat: [MATERIALS.RECYCLED], seller: SELLERS.SOLE_SANCTUARY },
//   { title: "Nike Air Max Terrascape", url: "/shoes/air-max-terrascape", price: 150, brand: BRANDS.NIKE, cat: CATS.SUSTAINABLE, mat: [MATERIALS.RECYCLED], seller: SELLERS.FOOTWEAR_WORLD },
//   // 4. Outdoor
//   { title: "Adidas Terrex Free Hiker", url: "/shoes/terrex-hiker", price: 200, brand: BRANDS.ADIDAS, cat: CATS.OUTDOOR, mat: [MATERIALS.GORETEX, MATERIALS.NYLON], seller: SELLERS.PRO_TRACK },
//   { title: "Nike ACG Mountain Fly", url: "/shoes/acg-mountain-fly", price: 180, brand: BRANDS.NIKE, cat: CATS.OUTDOOR, mat: [MATERIALS.GORETEX], seller: SELLERS.ELITE_SPORTS },
//   // 5. Football
//   { title: "Adidas Predator Accuracy", url: "/shoes/predator-accuracy", price: 250, brand: BRANDS.ADIDAS, cat: CATS.FOOTBALL, mat: [MATERIALS.PRIMEKNIT], seller: SELLERS.ELITE_SPORTS },
//   { title: "Nike Mercurial Superfly", url: "/shoes/mercurial-superfly", price: 275, brand: BRANDS.NIKE, cat: CATS.FOOTBALL, mat: [MATERIALS.NYLON], seller: SELLERS.PRO_TRACK },
//   // 6. Basketball
//   { title: "Adidas Dame 8", url: "/shoes/dame-8", price: 140, brand: BRANDS.ADIDAS, cat: CATS.BASKETBALL, mat: [MATERIALS.MESH], seller: SELLERS.URBAN_KICKZ },
//   { title: "Nike LeBron 20", url: "/shoes/lebron-20", price: 200, brand: BRANDS.NIKE, cat: CATS.BASKETBALL, mat: [MATERIALS.MESH, MATERIALS.PRIMEKNIT], seller: SELLERS.ELITE_SPORTS },
//   // 7. Lifestyle
//   { title: "Adidas Gazelle", url: "/shoes/adidas-gazelle", price: 100, brand: BRANDS.ADIDAS, cat: CATS.LIFESTYLE, mat: [MATERIALS.SUEDE], seller: SELLERS.SOLE_SANCTUARY },
//   { title: "Nike Cortez", url: "/shoes/nike-cortez", price: 90, brand: BRANDS.NIKE, cat: CATS.LIFESTYLE, mat: [MATERIALS.LEATHER], seller: SELLERS.URBAN_KICKZ },
//   // 8. Skateboarding
//   { title: "Adidas Busenitz", url: "/shoes/busenitz", price: 85, brand: BRANDS.ADIDAS, cat: CATS.SKATE, mat: [MATERIALS.SUEDE], seller: SELLERS.URBAN_KICKZ },
//   { title: "Nike SB Dunk Low", url: "/shoes/sb-dunk-low", price: 115, brand: BRANDS.NIKE, cat: CATS.SKATE, mat: [MATERIALS.SUEDE, MATERIALS.CANVAS], seller: SELLERS.SOLE_SANCTUARY },
//   // 9. Training
//   { title: "Adidas Dropset 2", url: "/shoes/dropset-2", price: 130, brand: BRANDS.ADIDAS, cat: CATS.TRAINING, mat: [MATERIALS.MESH], seller: SELLERS.ELITE_SPORTS },
//   { title: "Nike Metcon 8", url: "/shoes/metcon-8", price: 130, brand: BRANDS.NIKE, cat: CATS.TRAINING, mat: [MATERIALS.MESH], seller: SELLERS.PRO_TRACK },
//   // 10. Court
//   { title: "Adidas Barricade 13", url: "/shoes/barricade-13", price: 160, brand: BRANDS.ADIDAS, cat: CATS.COURT, mat: [MATERIALS.MESH], seller: SELLERS.PRO_TRACK },
//   { title: "Nike Court Air Zoom", url: "/shoes/court-zoom", price: 150, brand: BRANDS.NIKE, cat: CATS.COURT, mat: [MATERIALS.MESH], seller: SELLERS.ELITE_SPORTS }
// ];

// async function importAllShoes() {
//   console.log("👟 Starting Bulk Import of 20 Synchronized Shoes...");
  
//   const promises = shoeData.map(shoe => {
//     const data = {
//       entry: {
//         title: shoe.title,
//         url: shoe.url,
//         price: shoe.price,
//         size: ["UK 7", "UK 8", "UK 9", "UK 10"],
//         weight: "320g",
//         brand_ref: [{ uid: shoe.brand, _content_type_uid: "brand" }],
//         category_ref: [{ uid: shoe.cat, _content_type_uid: "category" }],
//         material_ref: shoe.mat.map(m => ({ uid: m, _content_type_uid: "material" })),
//         seller_ref: [{ uid: shoe.seller, _content_type_uid: "seller" }],
//         testimonials: [{ uid: "UID_TESTIMONIAL_PLACEHOLDER", _content_type_uid: "testimonial" }] // Mandatory ref
//       }
//     };
//     return axios.post('https://api.contentstack.io/v3/content_types/shoes/entries', data, config);
//   });

//   try {
//     const results = await Promise.all(promises);
//     console.log(`✅ Success! Created ${results.length} shoes.`);
//   } catch (error) {
//     console.error("❌ Error:", error.response ? error.response.data : error.message);
//   }
// }

// importAllShoes();

// 7. Testimonials
// const testimonials = [
//   { name: "Arjun Mehta", rating: 5, feedback: "Superstar is a classic! Perfect fit." },
//   { name: "Sarah Jenkins", rating: 4, feedback: "AF1s are very comfortable for daily wear." },
//   { name: "Liam Wilson", rating: 5, feedback: "Ultraboost feels like walking on clouds." },
//   { name: "Priya Sharma", rating: 5, feedback: "Great support for long-distance running." },
//   { name: "David Chen", rating: 4, feedback: "Love the recycled materials in Stan Smith." },
//   { name: "Emma Thompson", rating: 5, feedback: "Terrascape design is unique and durable." },
//   { name: "Carlos Rodriguez", rating: 5, feedback: "Terrex kept my feet dry in muddy trails." },
//   { name: "Sophie Muller", rating: 4, feedback: "Nike ACG has great traction and style." },
//   { name: "Kevin Varma", rating: 5, feedback: "Predator accuracy is insane on the pitch." },
//   { name: "James Bond", rating: 5, feedback: "Mercurials are incredibly light and fast." },
//   { name: "Aisha Khan", rating: 4, feedback: "Dame 8 has excellent grip on the court." },
//   { name: "Marcus Jordan", rating: 5, feedback: "LeBron 20 is elite for performance." },
//   { name: "Rohan Das", rating: 5, feedback: "Gazelle suede is premium quality." },
//   { name: "Lily Evans", rating: 3, feedback: "Cortez looks cool but runs a bit narrow." },
//   { name: "Tyler White", rating: 5, feedback: "Busenitz is the best for skateboarding." },
//   { name: "Chloe Bennett", rating: 5, feedback: "Dunk Low colorways are always on point." },
//   { name: "Siddharth Malhotra", rating: 4, feedback: "Stable base for heavy gym lifting." },
//   { name: "Jessica Ng", rating: 5, feedback: "Metcons are the king of training shoes." },
//   { name: "Vikram Singh", rating: 4, feedback: "Barricades offer great lateral support." },
//   { name: "Elena Rossi", rating: 5, feedback: "Air Zoom Court is sharp and responsive." }
// ];

// async function importTestimonials() {
//   console.log("💬 Creating 20 Testimonials in Contentstack...");

//   const promises = testimonials.map(t => {
//     return axios.post('https://api.contentstack.io/v3/content_types/testimonial/entries', {
//       entry: {
//         title: t.name, // Customer Name
//         feedback: t.feedback, // Customer Feedback
//         rating: t.rating // 1 to 5 Rating
//       }
//     }, config);
//   });

//   try {
//     const results = await Promise.all(promises);
//     console.log(`✅ Success! Created ${results.length} Testimonials.`);
    
//     // Sabhi naye Testimonials ke UIDs print karein taaki aap unhe Shoes mein link kar sakein
//     results.forEach(res => {
//       console.log(`Name: ${res.data.entry.title} | UID: ${res.data.entry.uid}`);
//     });
//   } catch (error) {
//     console.error("❌ Error:", error.response ? error.response.data : error.message);
//   }
// }

// importTestimonials();


// 8. Homepage
// const homepageEntry = {
//   entry: {
//     url: "/", // Homepage root URL
//     title: "ShoeSphere | Beyond Boundaries", // Page Title
//     hero_section: {
//       headline: "END PLASTIC WASTE. OWN THE GAME.", // Adidas-inspired bold headline
//       sub_headline: "Experience the next generation of performance with our sustainable collection.", // Detailed sub-headline
//       cta_button: {
//         cta_text: "SHOP NEW ARRIVALS",
//         cta_link: "/shoes"
//       }
//     },
//     featured_shoes: [
//       // Yahan un 20 shoes mein se best performers ke UIDs dalein
//       { uid: "UID_ADIDAS_SUPERSTAR", _content_type_uid: "shoes" },
//       { uid: "UID_NIKE_AF1", _content_type_uid: "shoes" },
//       { uid: "UID_ADIDAS_ULTRABOOST", _content_type_uid: "shoes" },
//       { uid: "UID_NIKE_PEGASUS", _content_type_uid: "shoes" }
//     ]
//   }
// };

// async function createHomepage() {
//   console.log("🏠 Creating Detailed Homepage Entry...");
//   try {
//     const response = await axios.post(
//       'https://api.contentstack.io/v3/content_types/homepage/entries',
//       homepageEntry,
//       config
//     );
//     console.log("✅ Success! Homepage created with Hero Section and Featured Shoes.");
//   } catch (error) {
//     console.error("❌ Error:", error.response ? error.response.data : error.message);
//   }
// }

// createHomepage();