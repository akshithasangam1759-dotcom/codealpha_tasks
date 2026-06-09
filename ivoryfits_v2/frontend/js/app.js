/* ============================================================
   IVORYFITS — Main Frontend JavaScript (v3 — Gender Categories)
   ============================================================ */
const BASE_URL = 'https://ivoryfits.onrender.com';
// ── CATEGORY MAPS ──
const GENDER_CATEGORIES = {
  all: [],
  men: [
    'T-Shirts','Shirts','Hoodies & Sweatshirts','Jackets',
    'Jeans','Trousers','Cargos','Shorts',
    'Co-ord Sets','Activewear','Ethnic Wear','Footwear','Accessories'
  ],
  women: [
    'T-Shirts & Tops','Shirts & Blouses','Hoodies & Sweatshirts','Jackets & Coats',
    'Jeans','Trousers & Pants','Skirts','Shorts','Dresses',
    'Co-ord Sets','Activewear','Ethnic Wear','Footwear','Accessories'
  ],
  kids: [
    'T-Shirts & Tops','Shirts','Hoodies & Sweatshirts','Jackets',
    'Jeans','Trousers & Pants','Shorts','Dresses',
    'Co-ord Sets','Activewear','Ethnic Wear','Nightwear','Footwear','Accessories'
  ],
};

// ── SAMPLE PRODUCT DATA ──
const PRODUCTS = [
  // Women
  { id:1,  gender:'women', name:"Tie Up Dress",         category:"Dresses",           price:699, stock:20,  sizes:["XS","S","M","L"],       description:"A knee-length obsidian gown with subtle black trim. Crafted from premium silk-blend, this piece commands attention at every formal occasion.", badge:"New",         color:"#1a1207", image:"https://images.pexels.com/photos/27958296/pexels-photo-27958296.jpeg" },
  { id:2,  gender:'women', name:"Ivory Silk Slip Dress",       category:"Dresses",           price:799, stock:15, sizes:["XS","S","M","L","XL"],  description:"Effortless luxury in pure ivory silk. The minimal cut make this a wardrobe essential for the modern woman.",              badge:"",            color:"#e8d9c4", image:"./silk.jpeg" },
  { id:3,  gender:'women', name:"Trench Coat",           category:"Jackets & Coats",   price:1050, stock:4,  sizes:["S","M","L","XL"],       description:"A timeless trench coat with a belted waist and structured lapels. Crafted in water-resistant wool-blend.",                    badge:"",            color:"#c4975a", image:"https://images.unsplash.com/photo-1632149933606-fa45623682ee?q=80&w=767&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:4,  gender:'women', name:"Corset Top",       category:"T-Shirts & Tops",   price:399, stock:9,  sizes:["XS","S","M","L"],       description:"Structured corset top with boning and adjustable lacing. A statement piece for elevated evening looks.",                       badge:"Hot",         color:"#111118", image:"https://plus.unsplash.com/premium_photo-1664875849333-798c9e0eaa62?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:5,  gender:'women', name:"Jumpsuit",    category:"Dresses",           price:395, stock:6,  sizes:["XS","S","M","L"],       description:"Deep jumpsuit with a wide-leg silhouette and cowl neckline. The perfect alternative to traditional evening wear.",    badge:"New",         color:"#0d0d1a", image:"https://images.unsplash.com/photo-1768803968289-3b01745ab74c?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:6,  gender:'women', name:" Oversized Shirt",       category:"Shirts & Blouses",  price:450,  stock:20, sizes:["S","M","L","XL","XXL"], description:"Relaxed oversized shirt in natural ivory. Breathable, effortless, and endlessly versatile for warm seasons.",                  badge:"",            color:"#f0e8d8", image:"https://images.unsplash.com/photo-1600508115810-0d733f925812?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:7,  gender:'women', name:"Midi Skirt",          category:"Skirts",            price:415, stock:12, sizes:["XS","S","M","L"],       description:"Elegant pleated midi skirt in champagne satin. Fluid movement, timeless silhouette.",                                                badge:"",            color:"#d4c4a8", image:"https://plus.unsplash.com/premium_photo-1661389374802-8bc55c1df029?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:8,  gender:'women', name:"Wide Leg Linen Trousers",     category:"Trousers & Pants",  price:535, stock:10, sizes:["XS","S","M","L","XL"],  description:"High-waisted wide-leg linen trousers in natural beige. The epitome of relaxed sophistication.",                                       badge:"",            color:"#c8b89a", image:"https://images.unsplash.com/photo-1552902875-9ac1f9fe0c07?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:9,  gender:'women', name:"Floral Salwar Set",           category:"Ethnic Wear",       price:989, stock:8,  sizes:["XS","S","M","L","XL"],  description:"Intricate floral embroidered salwar set in navy blue with flowers. Traditional craftsmanship meets contemporary silhouette.",                    badge:"New",         color:"#c9907a", image:"https://images.unsplash.com/photo-1669194890341-7bb728f39574?q=80&w=735&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:10, gender:'women', name:"Pearl Drop Earrings",         category:"Accessories",       price:265,  stock:30, sizes:["One Size"],              description:"Baroque freshwater pearl drop earrings set in brushed gold vermeil. Understated luxury for every occasion.",                         badge:"",            color:"#f5f0e8", image:"https://plus.unsplash.com/premium_photo-1695792938561-e1123658a0ae?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:11, gender:'women', name:"Gold Chain Necklace Set",     category:"Accessories",       price:289,  stock:25, sizes:["One Size"],              description:"Three-piece layered chain necklace set in 18k gold-plated sterling silver. Pairs beautifully with any neckline.",                   badge:"Best Seller", color:"#2d2010", image:"https://images.unsplash.com/photo-1705326452390-3ecf6070595f?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },
  { id:12, gender:'women', name:"Yoga Fit",          category:"Activewear",        price:479,  stock:18, sizes:["XS","S","M","L","XL"],  description:"High-waisted compression leggings in four-way stretch fabric. Seamless, breathable, sculpting.",                                     badge:"",            color:"#1a1a2e", image:"https://images.unsplash.com/photo-1597297260448-3cc8d0a38388?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D" },

  // Men
  { id:13, gender:'men',   name:"Urban Noir Blazer",           category:"Jackets",           price:595, stock:10, sizes:["S","M","L","XL"],       description:"Structured shoulders meet relaxed silhouette. This oversized blazer in deep noir redefines smart-casual dressing.",                  badge:"",            color:"#1c1c1c", image:"https://images.pexels.com/photos/32478281/pexels-photo-32478281.jpeg" },
  { id:14, gender:'men',   name:"Classic Shirt",        category:"Shirts",            price:310, stock:14, sizes:["S","M","L","XL","XXL"], description:"Crisp premium cotton Oxford shirt in off-white. The foundation of any elevated wardrobe.",                                           badge:"",            color:"#e8e0d4", image:"https://images.pexels.com/photos/34946644/pexels-photo-34946644.jpeg" },
  { id:15, gender:'men',   name:"Regular fit Shacket ",         category:"Jacket",             price:845, stock:16, sizes:["28","30","32","34","36"],"description":"Premium Regular fit Shacket,Classy and Elegent looking best for date nights",                                               badge:"",            color:"#1a2035", image:"./aayuu.jpeg" },
  { id:16, gender:'men',   name:"Black coat",         category:"Jackets",          price:718, stock:10, sizes:["S","M","L","XL"],       description:"Premium Black long mens Coat,polished look,Lightweight",                                badge:"",            color:"#c8b898", image:"https://images.pexels.com/photos/15359758/pexels-photo-15359758.jpeg" },
  { id:17, gender:'men',   name:"Streetwear Hoodie Luxe",      category:"Hoodies & Sweatshirts", price:355, stock:14, sizes:["S","M","L","XL"],  description:"Premium heavyweight cotton hoodie with embroidered gold logo. Soft fleece interior meets fashion-forward design.",                  badge:"New",         color:"#181818", image:"https://images.pexels.com/photos/29746294/pexels-photo-29746294.jpeg" },
  { id:18, gender:'men',   name:"Cargo Utility Trousers",      category:"Cargos",            price:228, stock:12, sizes:["S","M","L","XL"],       description:"High-waisted cargo trousers in technical fabric. Multiple pockets, adjustable straps — utility meets luxury.",                      badge:"",            color:"#2a2a2a", image:"https://images.pexels.com/photos/11716437/pexels-photo-11716437.jpeg" },
  { id:19, gender:'men',   name:"Tailored Kurta",        category:"Ethnic Wear",       price:265, stock:8,  sizes:["S","M","L","XL","XXL"], description:"Handcrafted kurta with subtle embroidery at cuffs. Modern ethnic elegance for festive and casual occasions.",                 badge:"",            color:"#e0d4c0", image:"https://images.pexels.com/photos/17901285/pexels-photo-17901285.jpeg" },
  { id:20, gender:'men',   name:"Gold Cuff Bracelet",          category:"Accessories",       price:675,  stock:18, sizes:["One Size"],              description:"Wide-band sculptural cuff in polished gold. A bold, minimal statement piece that elevates any wrist.",                              badge:"",            color:"#b8922a", image:"https://images.pexels.com/photos/34399146/pexels-photo-34399146.jpeg" },
  { id:21, gender:'men',   name:"Oversized Tee",       category:"T-Shirts",          price:265,  stock:22, sizes:["S","M","L","XL","XXL"], description:"100% organic cotton oversized tee with minimal graphic print. The effortless off-duty staple.",                                     badge:"",            color:"#111111", image:"https://images.pexels.com/photos/27439550/pexels-photo-27439550.jpeg" },
  { id:22, gender:'men',   name:"Shorts",                category:"Shorts",            price:285,  stock:15, sizes:["S","M","L","XL"],       description:"Tailored shorts in premium stretch cotton. Clean lines, confident silhouette.",                                               badge:"",            color:"#b8a88a", image:"https://images.pexels.com/photos/5384586/pexels-photo-5384586.jpeg" },
  { id:23, gender:'men',   name:"Running Performance Set",     category:"Activewear",        price:245, stock:10, sizes:["S","M","L","XL"],       description:"Moisture-wicking co-ord running set. Lightweight, breathable fabric with reflective detailing.",                                    badge:"New",         color:"#0a1628", image:"https://images.pexels.com/photos/36541478/pexels-photo-36541478.jpeg" },
  { id:24, gender:'men',   name:"Suede Chelsea Boots",         category:"Footwear",          price:1299, stock:6,  sizes:["40","41","42","43","44"],"description":"Premium suede Chelsea boots with elasticated panels. Sleek silhouette, Cuban heel.",                                            badge:"",            color:"#4a3020", image:"https://images.pexels.com/photos/30272894/pexels-photo-30272894.jpeg" },

  // Kids
  { id:25, gender:'kids',  name:"Mini Me Floral Dress",        category:"Dresses",           price:365,  stock:12, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Sweet floral print dress in soft cotton. Comfortable, playful, and endlessly adorable.",                                    badge:"New",         color:"#f5c8d0", image:"https://images.pexels.com/photos/15838025/pexels-photo-15838025.jpeg" },
  { id:26, gender:'kids',  name:"Denim Adventure Jacket",      category:"Jackets",           price:478,  stock:10, sizes:["4-5Y","6-7Y","8-9Y","10-11Y"], description:"Classic denim jacket with embroidered details. Built for adventure, styled for everything.",                             badge:"",            color:"#4a6080", image:"https://images.pexels.com/photos/29283074/pexels-photo-29283074.jpeg" },
  { id:27, gender:'kids',  name:"Festive Kurti Set",           category:"Ethnic Wear",       price:395,  stock:8,  sizes:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], description:"Festive kurti pajama set with golden zari work. Perfect for celebrations and special occasions.",                 badge:"New",         color:"#c8901a", image:"https://images.pexels.com/photos/36836754/pexels-photo-36836754.jpeg" },
  { id:28, gender:'kids',  name:"Superhero Hoodie",            category:"Hoodies & Sweatshirts", price:255, stock:15, sizes:["4-5Y","6-7Y","8-9Y","10-11Y"], description:"Cosy fleece hoodie with fun superhero graphic print. Warm, durable, and endlessly cool.",                           badge:"",            color:"#1a3a6a", image:"https://images.pexels.com/photos/5217728/pexels-photo-5217728.jpeg" },
  { id:29, gender:'kids',  name:"Cargo Jogger Set",            category:"Co-ord Sets",       price:472,  stock:12, sizes:["4-5Y","6-7Y","8-9Y","10-11Y"], description:"Matching jogger and cargo pant co-ord set. Practical meets playful.",                                                   badge:"",            color:"#2a3a2a", image:"https://images.pexels.com/photos/15568504/pexels-photo-15568504.jpeg" },
  { id:30, gender:'kids',  name:"Rainbow Sneakers",            category:"Footwear",          price:559,  stock:20, sizes:["UK1","UK2","UK3","UK4"], description:"Colourful rainbow-sole sneakers. Light, bouncy, and endlessly fun.",                                          badge:"Best Seller", color:"#e84060", image:"https://images.pexels.com/photos/26852500/pexels-photo-26852500.png" },
  { id:31, gender:'kids',  name:"Nightwear Set",    category:"Nightwear",         price:245,  stock:18, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Ultra-soft pyjama set in 100% organic cotton. Sweet dreams guaranteed.",                                        badge:"",            color:"#1a1a3a", image:"https://images.pexels.com/photos/20669611/pexels-photo-20669611.jpeg" },
  { id:32, gender:'kids',  name:"Tiny Explorer Tee",           category:"T-Shirts & Tops",   price:235,  stock:25, sizes:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], description:"Breathable cotton tee with fun explorer. Perfect for everyday adventures.",                               badge:"",            color:"#2d8a60", image:"https://images.pexels.com/photos/18020063/pexels-photo-18020063.jpeg" },
  { id:33, gender:'men', name:"Slim Fit Chinos", category:"Trousers", price:899, stock:14, sizes:["S","M","L","XL"], description:"Premium slim-fit chinos in stretch cotton. Clean lines, confident silhouette.", badge:"", color:"#c8b898", image:"https://images.pexels.com/photos/30710544/pexels-photo-30710544.jpeg" },
  { id:34, gender:'men', name:"Linen Summer Shirt", category:"Shirts", price:650, stock:18, sizes:["S","M","L","XL","XXL"], description:"Breathable linen shirt for warm days. Relaxed fit, effortless style.", badge:"New", color:"#e8dcc8", image:"https://images.pexels.com/photos/18665111/pexels-photo-18665111.jpeg" },
  { id:35, gender:'men', name:"Graphic Oversized Tee", category:"T-Shirts", price:450, stock:22, sizes:["S","M","L","XL","XXL"], description:"100% organic cotton oversized tee with bold graphic print.", badge:"", color:"#2a2a2a", image:"https://images.pexels.com/photos/13298299/pexels-photo-13298299.jpeg" },
  { id:36, gender:'men', name:"Denim Jacket", category:"Jackets", price:1299, stock:10, sizes:["S","M","L","XL"], description:"Classic washed denim jacket with a relaxed fit. A wardrobe staple.", badge:"", color:"#4a6080", image:"https://images.pexels.com/photos/17894647/pexels-photo-17894647.jpeg" },
  { id:37, gender:'men', name:"Jogger Sweatpants", category:"Trousers", price:799, stock:16, sizes:["S","M","L","XL"], description:"Soft fleece joggers with tapered leg and elastic waistband.", badge:"", color:"#1a1a1a", image:"https://images.pexels.com/photos/17894647/pexels-photo-17894647.jpeg" },
  { id:38, gender:'men', name:"Polo Ralph shirt", category:"T-Shirts", price:550, stock:20, sizes:["S","M","L","XL","XXL"], description:"Premium pique cotton polo. Smart casual perfection.", badge:"Hot", color:"#1b2a4a", image:"./1234.jpeg" },
  { id:39, gender:'men', name:"Cargo Shorts", category:"Shorts", price:699, stock:12, sizes:["S","M","L","XL"], description:"Utility cargo shorts with multiple pockets. Functional meets stylish.", badge:"", color:"#5a4a30", image:"https://images.pexels.com/photos/18178103/pexels-photo-18178103.jpeg" },
  { id:40, gender:'men', name:"Zip-Up Hoodie", category:"Hoodies & Sweatshirts", price:999, stock:15, sizes:["S","M","L","XL"], description:"Heavyweight zip-up hoodie with kangaroo pocket. Premium fleece interior.", badge:"New", color:"#111111", image:"https://images.pexels.com/photos/20536778/pexels-photo-20536778.jpeg" },
  { id:41, gender:'men', name:"Ethnic Sherwani Set", category:"Ethnic Wear", price:3499, stock:6, sizes:["S","M","L","XL"], description:"Regal sherwani set with intricate embroidery. Perfect for weddings.", badge:"", color:"#2d2010", image:"https://images.pexels.com/photos/18016521/pexels-photo-18016521.jpeg" },
  { id:42, gender:'men', name:"Running Sneakers", category:"Footwear", price:2199, stock:8, sizes:["40","41","42","43","44"], description:"Lightweight performance sneakers with cushioned sole.", badge:"", color:"#f0f0f0", image:"https://images.pexels.com/photos/32145212/pexels-photo-32145212.jpeg" },
  { id:43, gender:'men', name:"Leather Belt", category:"Accessories", price:449, stock:30, sizes:["One Size"], description:"Full-grain leather belt with brushed gold buckle.", badge:"", color:"#3a2010", image:"https://images.pexels.com/photos/31323080/pexels-photo-31323080.jpeg" },
  { id:44, gender:'men', name:"Co-ord Tracksuit", category:"Co-ord Sets", price:799, stock:10, sizes:["S","M","L","XL"], description:"Matching jacket and jogger set in premium terry fabric.", badge:"New", color:"#1a1a2e", image:"https://images.pexels.com/photos/15624580/pexels-photo-15624580.jpeg" },
  { id:45, gender:'women', name:"Floral Maxi Dress", category:"Dresses", price:899, stock:12, sizes:["XS","S","M","L"], description:"Flowing floral maxi dress in chiffon. Effortlessly elegant for any season.", badge:"New", color:"#f5c8d0", image:"https://images.pexels.com/photos/27556462/pexels-photo-27556462.jpeg" },
  { id:46, gender:'women', name:"Crop Blazer", category:"Jackets & Coats", price:1450, stock:8, sizes:["XS","S","M","L"], description:"Structured crop blazer with notch lapels. Power dressing redefined.", badge:"Hot", color:"#1c1c1c", image:"https://images.pexels.com/photos/18659221/pexels-photo-18659221.jpeg" },
  { id:47, gender:'women', name:"High Waist Jeans", category:"Jeans", price:999, stock:20, sizes:["XS","S","M","L","XL"], description:"Classic high-waist straight jeans in premium denim.", badge:"", color:"#1b2a4a", image:"https://images.pexels.com/photos/6856273/pexels-photo-6856273.jpeg" },
  { id:48, gender:'women', name:"Ribbed Knit Top", category:"T-Shirts & Tops", price:499, stock:25, sizes:["XS","S","M","L"], description:"Fitted ribbed knit top in soft stretch fabric.", badge:"", color:"#e8d9c4", image:"https://images.pexels.com/photos/31490951/pexels-photo-31490951.jpeg" },
  { id:49, gender:'women', name:"Mini Skirt", category:"Skirts", price:699, stock:14, sizes:["XS","S","M","L"], description:"Pleated mini skirt in satin finish. Playfully chic.", badge:"New", color:"#f4b8c8", image:"https://images.pexels.com/photos/23484027/pexels-photo-23484027.jpeg" },
  { id:50, gender:'women', name:"Lehenga Set", category:"Ethnic Wear", price:4999, stock:5, sizes:["XS","S","M","L"], description:"Embroidered lehenga choli in rich silk.", badge:"", color:"#8b0000", image:"https://images.pexels.com/photos/16651977/pexels-photo-16651977.jpeg" },
  { id:51, gender:'women', name:"Sports Bra & Leggings Set", category:"Activewear", price:575, stock:18, sizes:["XS","S","M","L","XL"], description:"High-impact sports bra with matching leggings. Built for performance.", badge:"", color:"#1a1a2e", image:"https://images.pexels.com/photos/28774694/pexels-photo-28774694.jpeg" },
  { id:52, gender:'women', name:"Denim Shorts", category:"Shorts", price:599, stock:16, sizes:["XS","S","M","L"], description:"Distressed denim cut-off shorts. Summer essential.", badge:"", color:"#4a6080", image:"https://images.pexels.com/photos/19236844/pexels-photo-19236844.jpeg" },
  { id:53, gender:'women', name:"Block Heel Sandals", category:"Footwear", price:799, stock:10, sizes:["36","37","38","39","40"], description:"Strappy block heel sandals in nude leather.", badge:"", color:"#c8a882", image:"https://images.pexels.com/photos/30471927/pexels-photo-30471927.jpeg" },
  { id:54, gender:'women', name:"Quilted Crossbody Bag", category:"Accessories", price:899, stock:12, sizes:["One Size"], description:"Quilted leather crossbody with gold chain strap.", badge:"Best Seller", color:"#1a1a1a", image:"https://images.pexels.com/photos/13417506/pexels-photo-13417506.jpeg" },
  { id:55, gender:'kids', name:"Dinosaur Print Tee", category:"T-Shirts & Tops", price:199, stock:30, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Fun dinosaur print tee in soft 100% cotton.", badge:"", color:"#2d8a60", image:"https://images.pexels.com/photos/15179151/pexels-photo-15179151.jpeg" },
  { id:56, gender:'kids', name:"Girls Tutu Dress", category:"Dresses", price:299, stock:15, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Adorable tutu dress with layered skirt. Perfect for parties.", badge:"New", color:"#f5c8d0", image:"https://images.pexels.com/photos/16643417/pexels-photo-16643417.jpeg" },
  { id:57, gender:'kids', name:"Boys Chino Pants", category:"Trousers & Pants", price:499, stock:18, sizes:["2-3Y","4-5Y","6-7Y","8-9Y","10-11Y"], description:"Smart slim-fit chinos for little gentlemen.", badge:"", color:"#c8b898", image:"https://images.pexels.com/photos/5560019/pexels-photo-5560019.jpeg" },
  { id:58, gender:'kids', name:"Puffer Vest", category:"Jackets", price:599, stock:12, sizes:["4-5Y","6-7Y","8-9Y","10-11Y"], description:"Lightweight puffer vest for cool days. Easy to layer.", badge:"", color:"#1b2a4a", image:"https://images.pexels.com/photos/9511985/pexels-photo-9511985.jpeg" },
  { id:59, gender:'kids', name:"Graphic Sweatshirt", category:"Hoodies & Sweatshirts", price:549, stock:20, sizes:["4-5Y","6-7Y","8-9Y","10-11Y"], description:"Cosy sweatshirt with fun graphic print.", badge:"", color:"#e8c8a0", image:"https://images.pexels.com/photos/7139814/pexels-photo-7139814.jpeg" },
  { id:60, gender:'kids', name:"Denim Overalls", category:"Trousers & Pants", price:699, stock:14, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Classic denim overalls with adjustable straps.", badge:"", color:"#4a6080", image:"https://images.pexels.com/photos/5560501/pexels-photo-5560501.jpeg" },
  { id:61, gender:'kids', name:"Sneakers", category:"Footwear", price:599, stock:20, sizes:["UK1","UK2","UK3","UK4","UK5"], description:"Fun sneakers kids will love.", badge:"Hot", color:"#e84060", image:"https://images.pexels.com/photos/4987534/pexels-photo-4987534.jpeg" },
  { id:62, gender:'kids', name:"Swim Shorts", category:"Shorts", price:349, stock:25, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Quick-dry swim shorts in fun print.", badge:"", color:"#1b4a8a", image:"https://images.pexels.com/photos/2456029/pexels-photo-2456029.jpeg" },
  { id:63, gender:'kids', name:"School Backpack", category:"Accessories", price:299, stock:15, sizes:["One Size"], description:"Durable school backpack with multiple compartments.", badge:"", color:"#1a1a2e", image:"https://images.pexels.com/photos/8423919/pexels-photo-8423919.jpeg" },
  { id:64, gender:'kids', name:"Princess Gown", category:"Dresses", price:399, stock:28, sizes:["2-3Y","4-5Y","6-7Y","8-9Y"], description:"Magical princess gown with tulle skirt and glitter details.", badge:"New", color:"#9b59b6", image:"https://images.pexels.com/photos/6800543/pexels-photo-6800543.jpeg" },
];

// ── STATE ──
let cart = JSON.parse(localStorage.getItem('iv_cart') || '[]');
let currentGender = 'all';
let currentSubcat = 'all';
let currentSort = 'default';
let maxPrice = 5000;
let currentUser = JSON.parse(localStorage.getItem('iv_user') || 'null');
let orders = JSON.parse(localStorage.getItem('iv_orders') || '[]');
let selectedSize = '';
let selectedProductId = null;
let editingProductId = null;
let adminProducts = JSON.parse(localStorage.getItem('iv_admin_products') || 'null') || [...PRODUCTS];
let wishlist = JSON.parse(localStorage.getItem('iv_wishlist') || '[]');

// ── INIT ──
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  renderProducts();
  updateCartBadge();
  updateAuthBtn();
  initEventListeners();
  initScrollEffects();
  initCounters();
});

// ── THEME ──
function initTheme() {
  const saved = localStorage.getItem('iv_theme') || 'dark';
  document.documentElement.setAttribute('data-theme', saved);
}
document.getElementById('themeToggle').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('iv_theme', next);
});

// ── GENDER FILTER ──
function setGender(gender) {
  currentGender = gender;
  currentSubcat = 'all';
  document.querySelectorAll('.gender-tab').forEach(t => {
    t.classList.toggle('active', t.dataset.gender === gender);
  });
  renderSubcategoryPills(gender);
  renderProducts();
  scrollToSection('products');
}

function renderSubcategoryPills(gender) {
  const row = document.getElementById('subcategoryRow');
  const cats = GENDER_CATEGORIES[gender] || [];
  if (!cats.length) {
    row.innerHTML = `<button class="pill active" onclick="setSubcategory('all',this)">All</button>`;
    return;
  }
  row.innerHTML = `<button class="pill active" onclick="setSubcategory('all',this)">All</button>` +
    cats.map(cat =>
      `<button class="pill" onclick="setSubcategory('${cat.replace(/'/g,"\\'")}',this)">${cat}</button>`
    ).join('');
}

function setSubcategory(cat, btn) {
  currentSubcat = cat;
  document.querySelectorAll('#subcategoryRow .pill').forEach(p => p.classList.remove('active'));
  if (btn) btn.classList.add('active');
  renderProducts();
}

function filterByGenderCat(gender, category) {
  currentGender = gender;
  currentSubcat = category;
  document.querySelectorAll('.gender-tab').forEach(t =>
    t.classList.toggle('active', t.dataset.gender === gender)
  );
  renderSubcategoryPills(gender);
  setTimeout(() => {
    const pills = document.querySelectorAll('#subcategoryRow .pill');
    pills.forEach(p => {
      p.classList.toggle('active', p.textContent.trim() === category);
    });
  }, 50);
  renderProducts();
  scrollToSection('products');
}

// ── SILHOUETTES ──
function getSilhouette(category, size = 'card') {
  const gold = '#c9a96e';
  const goldLight = '#e8c99a';
  const catLower = (category || '').toLowerCase();
  let type = 'casual';
  if (catLower.includes('dress') || catLower.includes('gown') || catLower.includes('jumpsuit') || catLower.includes('skirt') || catLower.includes('saree') || catLower.includes('lehenga')) type = 'evening';
  else if (catLower.includes('ethnic') || catLower.includes('kurta') || catLower.includes('sherwan')) type = 'ethnic';
  else if (catLower.includes('access') || catLower.includes('jewel') || catLower.includes('earring') || catLower.includes('necklace') || catLower.includes('bracelet')) type = 'accessories';
  else if (catLower.includes('active') || catLower.includes('sport') || catLower.includes('yoga') || catLower.includes('running')) type = 'activewear';
  else if (catLower.includes('hoodie') || catLower.includes('jacket') || catLower.includes('coat') || catLower.includes('blazer')) type = 'streetwear';
  else if (catLower.includes('shoe') || catLower.includes('boot') || catLower.includes('footwear') || catLower.includes('sneaker')) type = 'footwear';

  const svgs = {
    evening: `<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:70%;height:85%"><ellipse cx="60" cy="18" rx="11" ry="13" fill="${gold}" opacity="0.75"/><rect x="56" y="30" width="8" height="8" rx="2" fill="${gold}" opacity="0.65"/><path d="M28 42 Q40 36 60 38 Q80 36 92 42 L88 90 Q60 98 32 90 Z" fill="${gold}" opacity="0.55"/><path d="M38 88 Q60 82 82 88 L80 105 Q60 110 40 105 Z" fill="${gold}" opacity="0.5"/><path d="M40 103 Q60 108 80 103 L92 180 Q85 200 60 205 Q35 200 28 180 Z" fill="${gold}" opacity="0.38"/><path d="M30 46 Q16 68 20 95" stroke="${gold}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.45"/><path d="M90 46 Q104 68 100 95" stroke="${gold}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.45"/></svg>`,
    casual: `<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:65%;height:85%"><ellipse cx="60" cy="17" rx="12" ry="14" fill="${gold}" opacity="0.7"/><rect x="56" y="30" width="8" height="7" rx="2" fill="${gold}" opacity="0.6"/><path d="M32 40 Q46 34 60 36 Q74 34 88 40 L92 78 Q74 85 60 83 Q46 85 28 78 Z" fill="${gold}" opacity="0.48"/><path d="M30 76 Q46 82 60 80 Q74 82 90 76 L88 118 Q74 125 60 123 Q46 125 32 118 Z" fill="${gold}" opacity="0.42"/><path d="M32 116 Q44 120 50 118 L44 200 Q38 210 28 205 Q20 200 22 188 Z" fill="${gold}" opacity="0.38"/><path d="M88 116 Q76 120 70 118 L76 200 Q82 210 92 205 Q100 200 98 188 Z" fill="${gold}" opacity="0.38"/><path d="M34 44 Q20 65 24 92" stroke="${gold}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.4"/><path d="M86 44 Q100 65 96 92" stroke="${gold}" stroke-width="7" stroke-linecap="round" fill="none" opacity="0.4"/></svg>`,
    streetwear: `<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:68%;height:85%"><ellipse cx="60" cy="16" rx="12" ry="13" fill="${gold}" opacity="0.72"/><rect x="56" y="28" width="8" height="8" rx="2" fill="${gold}" opacity="0.6"/><path d="M22 38 Q42 30 60 33 Q78 30 98 38 L100 92 Q78 100 60 98 Q42 100 20 92 Z" fill="${gold}" opacity="0.5"/><path d="M24 90 Q42 96 56 94 L54 185 Q50 200 38 198 Q26 196 24 182 Z" fill="${gold}" opacity="0.42"/><path d="M96 90 Q78 96 64 94 L66 185 Q70 200 82 198 Q94 196 96 182 Z" fill="${gold}" opacity="0.42"/><path d="M24 44 Q10 66 14 95" stroke="${gold}" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.45"/><path d="M96 44 Q110 66 106 95" stroke="${gold}" stroke-width="9" stroke-linecap="round" fill="none" opacity="0.45"/></svg>`,
    accessories: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:75%;height:75%"><circle cx="60" cy="60" r="42" fill="none" stroke="${gold}" stroke-width="2.5" opacity="0.5"/><circle cx="60" cy="60" r="30" fill="none" stroke="${gold}" stroke-width="1.5" opacity="0.35"/><polygon points="60,42 68,55 60,62 52,55" fill="${gold}" opacity="0.65"/><polygon points="60,78 68,65 60,62 52,65" fill="${gold}" opacity="0.45"/></svg>`,
    activewear: `<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:65%;height:85%"><ellipse cx="60" cy="16" rx="11" ry="13" fill="${gold}" opacity="0.72"/><rect x="56" y="28" width="8" height="7" rx="2" fill="${gold}" opacity="0.6"/><path d="M35 38 Q50 30 60 32 Q70 30 85 38 L88 78 Q72 86 60 84 Q48 86 32 78 Z" fill="${gold}" opacity="0.5"/><path d="M34 76 Q48 82 60 80 Q72 82 86 76 L85 120 Q72 128 60 126 Q48 128 35 120 Z" fill="${gold}" opacity="0.44"/><path d="M36 118 L30 195 Q36 205 50 202 L60 120 Z" fill="${gold}" opacity="0.4"/><path d="M84 118 L90 195 Q84 205 70 202 L60 120 Z" fill="${gold}" opacity="0.4"/></svg>`,
    ethnic: `<svg viewBox="0 0 120 240" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:68%;height:85%"><ellipse cx="60" cy="17" rx="11" ry="13" fill="${gold}" opacity="0.72"/><rect x="56" y="29" width="8" height="8" rx="2" fill="${gold}" opacity="0.6"/><path d="M36 40 Q50 32 60 35 Q70 32 84 40 L86 100 Q70 108 60 106 Q50 108 34 100 Z" fill="${gold}" opacity="0.48"/><path d="M34 98 Q44 105 50 103 L46 200 Q42 208 32 205 Q24 202 24 190 Z" fill="${gold}" opacity="0.38"/><path d="M86 98 Q76 105 70 103 L74 200 Q78 208 88 205 Q96 202 96 190 Z" fill="${gold}" opacity="0.38"/></svg>`,
    footwear: `<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:10%;left:50%;transform:translateX(-50%);width:80%;height:55%"><path d="M15 60 Q20 30 40 28 Q55 26 65 32 L95 42 Q110 48 108 65 Q106 78 90 80 L20 80 Q10 78 15 60Z" fill="${gold}" opacity="0.45"/><path d="M20 80 L90 80 Q95 80 95 85 L95 90 Q95 95 90 95 L20 95 Q15 95 15 90 L15 85 Q15 80 20 80Z" fill="${gold}" opacity="0.35"/></svg>`,
  };
  return svgs[type] || svgs.casual;
}

function getCollectionSilhouette(category) {
  const gold = '#c9a96e';
  const svgs = {
    evening: `<svg viewBox="0 0 160 320" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:65%;height:80%"><ellipse cx="80" cy="22" rx="16" ry="19" fill="${gold}" opacity="0.65"/><rect x="74" y="40" width="12" height="10" rx="3" fill="${gold}" opacity="0.6"/><path d="M36 54 Q56 44 80 48 Q104 44 124 54 L120 118 Q80 130 40 118 Z" fill="${gold}" opacity="0.5"/><path d="M46 115 Q80 108 114 115 L124 240 Q110 265 80 270 Q50 265 36 240 Z" fill="${gold}" opacity="0.35"/><path d="M38 60 Q18 90 24 128" stroke="${gold}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.4"/><path d="M122 60 Q142 90 136 128" stroke="${gold}" stroke-width="10" stroke-linecap="round" fill="none" opacity="0.4"/></svg>`,
    casual: `<svg viewBox="0 0 160 320" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:65%;height:80%"><ellipse cx="80" cy="20" rx="16" ry="18" fill="#1a1a1a" opacity="0.5"/><rect x="74" y="37" width="12" height="9" rx="3" fill="#1a1a1a" opacity="0.45"/><path d="M44 50 Q62 42 80 45 Q98 42 116 50 L120 108 Q98 116 80 114 Q62 116 40 108 Z" fill="#1a1a1a" opacity="0.38"/><path d="M42 106 Q62 112 80 110 Q98 112 118 106 L116 165 Q98 172 80 170 Q62 172 44 165 Z" fill="#1a1a1a" opacity="0.32"/><path d="M44 163 Q62 168 72 165 L66 270 Q58 282 44 278 Q30 274 30 260 Z" fill="#1a1a1a" opacity="0.3"/><path d="M116 163 Q98 168 88 165 L94 270 Q102 282 116 278 Q130 274 130 260 Z" fill="#1a1a1a" opacity="0.3"/></svg>`,
    streetwear: `<svg viewBox="0 0 160 320" xmlns="http://www.w3.org/2000/svg" style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:65%;height:80%"><ellipse cx="80" cy="20" rx="16" ry="18" fill="${gold}" opacity="0.65"/><rect x="74" y="38" width="12" height="10" rx="3" fill="${gold}" opacity="0.6"/><path d="M26 52 Q52 38 80 42 Q108 38 134 52 L138 122 Q108 134 80 132 Q52 134 22 122 Z" fill="${gold}" opacity="0.48"/><path d="M24 120 Q50 128 72 125 L70 248 Q62 264 46 260 Q30 256 28 240 Z" fill="${gold}" opacity="0.4"/><path d="M136 120 Q110 128 88 125 L90 248 Q98 264 114 260 Q130 256 132 240 Z" fill="${gold}" opacity="0.4"/></svg>`,
  };
  return svgs[category] || svgs.streetwear;
}

// ── RENDER PRODUCTS ──
function renderProducts() {
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = Array(8).fill(`
    <div style="border-radius:12px;overflow:hidden;background:var(--surface)">
      <div class="skeleton skeleton-img"></div>
      <div style="padding:12px">
        <div class="skeleton skeleton-text" style="margin:8px 0"></div>
        <div class="skeleton skeleton-text short"></div>
      </div>
    </div>`).join('');

  setTimeout(() => {
    let filtered = adminProducts.filter(p => {
      if (currentGender !== 'all' && p.gender !== currentGender) return false;
      if (currentSubcat !== 'all' && p.category !== currentSubcat) return false;
      if (p.price > maxPrice) return false;
      return true;
    });
    if (currentSort === 'price-asc') filtered.sort((a,b) => a.price - b.price);
    if (currentSort === 'price-desc') filtered.sort((a,b) => b.price - a.price);

    if (!filtered.length) {
      grid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:4rem;color:var(--text3)">
        <div style="font-size:2rem;margin-bottom:1rem;opacity:0.3">◈</div>
        <p style="font-size:1rem;">No pieces found in this selection.</p>
        <p style="font-size:0.8rem;margin-top:0.5rem;color:var(--text3)">Try a different category or adjust the price range.</p>
      </div>`;
      return;
    }
    grid.innerHTML = filtered.map(p => productCardHTML(p)).join('');
    grid.querySelectorAll('.product-card').forEach(card => {
      card.addEventListener('click', (e) => {
        if (e.target.closest('.overlay-btn')) return;
        openProductModal(parseInt(card.dataset.id));
      });
    });
    grid.querySelectorAll('.add-cart-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        addToCart(parseInt(btn.dataset.id));
      });
    });
    document.querySelectorAll('.product-card').forEach(el => {
      el.classList.add('reveal');
      if (revealObserver) revealObserver.observe(el);
    });
  }, 400);
}

function genGradient(color) {
  const c = color || '#1a1a1a';
  return `linear-gradient(160deg, ${c}ee 0%, ${c}88 100%)`;
}

function productCardHTML(p) {
  const imgContent = p.image
    ? `<img src="${p.image}${p.image && p.image.includes('pexels') ? '?auto=compress&cs=tinysrgb&w=800' : ''}" alt="${p.name}"
          style="width:100%;height:100%;object-fit:cover;display:block;position:absolute;top:0;left:0;"
          onerror="this.style.display='none';this.nextElementSibling.style.display='flex';" />
       <div style="width:100%;height:100%;background:${genGradient(p.color)};position:relative;overflow:hidden;display:none">
         ${getSilhouette(p.category)}
       </div>`
    : `<div style="width:100%;height:100%;background:${genGradient(p.color)};position:relative;overflow:hidden">
         ${getSilhouette(p.category)}
       </div>`;

  return `
  <div class="product-card" data-id="${p.id}">
    <div class="product-img-wrap" style="position:relative;height:320px;overflow:hidden;">
      ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
      ${imgContent}
      <div class="product-overlay">
        <button class="overlay-btn add-cart-btn" data-id="${p.id}">Add to Cart</button>
        <button class="overlay-btn outline" onclick="openProductModal(${p.id})">Quick View</button>
      </div>
    </div>
    <div class="product-info">
      <div class="product-category">${p.category}</div>
      <div class="product-name">${p.name}</div>
      <div class="color-swatches" id="swatches-${p.id}">
        <span class="color-swatch active" data-color="Black" title="Black" onclick="event.stopPropagation();pickColor(this,'${p.id}')"></span>
        <span class="color-swatch" data-color="Navy Blue" title="Navy Blue" onclick="event.stopPropagation();pickColor(this,'${p.id}')"></span>
        <span class="color-swatch" data-color="White" title="White" onclick="event.stopPropagation();pickColor(this,'${p.id}')"></span>
        <span class="color-swatch" data-color="Baby Pink" title="Baby Pink" onclick="event.stopPropagation();pickColor(this,'${p.id}')"></span>
        <span class="color-selected-label" id="color-label-${p.id}">Black</span>
      </div>
      <div class="product-footer">
        <span class="product-price">₹${p.price}</span>
        <span class="product-sizes">${(p.sizes||[]).join(' · ')}</span>
      </div>
    </div>
  </div>`;
}

function injectCollectionFigures() {
  const map = { 'fig-evening': 'evening', 'fig-casual': 'casual', 'fig-street': 'streetwear' };
  Object.entries(map).forEach(([cls, cat]) => {
    document.querySelectorAll(`.${cls}`).forEach(el => {
      el.innerHTML = getCollectionSilhouette(cat);
      el.style.position = 'relative';
    });
  });
}

// ── FILTER CONTROLS ──
document.getElementById('sortSelect').addEventListener('change', e => {
  currentSort = e.target.value;
  renderProducts();
});
document.getElementById('priceRange').addEventListener('input', e => {
  maxPrice = parseInt(e.target.value);
  document.getElementById('priceVal').textContent = '₹' + maxPrice;
  renderProducts();
});

// ── SEARCH ──
document.getElementById('searchBtn').addEventListener('click', () => {
  document.getElementById('searchOverlay').classList.add('active');
  setTimeout(() => document.getElementById('searchInput').focus(), 300);
});
document.getElementById('closeSearch').addEventListener('click', () => document.getElementById('searchOverlay').classList.remove('active'));
document.getElementById('searchInput').addEventListener('input', e => {
  const q = e.target.value.toLowerCase().trim();
  const results = document.getElementById('searchResults');
  if (!q) { results.innerHTML = ''; return; }
  const matches = adminProducts.filter(p =>
    p.name.toLowerCase().includes(q) ||
    p.category.toLowerCase().includes(q) ||
    (p.gender || '').toLowerCase().includes(q) ||
    (p.description || '').toLowerCase().includes(q)
  ).slice(0, 6);
  results.innerHTML = matches.map(p => `
    <div class="search-result-item" onclick="closeSearchAndOpen(${p.id})">
      <div style="width:40px;height:50px;border-radius:6px;overflow:hidden;background:${genGradient(p.color)};position:relative;flex-shrink:0">
        ${p.image ? `<img src="${p.image}" style="width:100%;height:100%;object-fit:cover;position:absolute;top:0;left:0;" onerror="this.style.display='none'"/>` : getSilhouette(p.category)}
      </div>
      <div>
        <div style="font-size:0.88rem;margin-bottom:2px">${p.name}</div>
        <div style="font-size:0.72rem;color:var(--gold)">${p.gender} · ${p.category} · ₹${p.price}</div>
      </div>
    </div>`).join('') || `<div style="color:var(--text3);font-size:0.85rem;padding:1rem">No results for "${q}"</div>`;
});
function closeSearchAndOpen(id) {
  document.getElementById('searchOverlay').classList.remove('active');
  setTimeout(() => openProductModal(id), 300);
}

// ── PRODUCT MODAL ──
function openProductModal(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  selectedProductId = id;
  selectedSize = p.sizes ? p.sizes[0] : 'One Size';
  const overlay = document.getElementById('productModal');

  document.getElementById('modalGallery').innerHTML = p.image
    ? `<div style="width:100%;height:100%;min-height:450px;position:relative;overflow:hidden;border-radius:16px 0 0 16px;">
         <img src="${p.image}${p.image && p.image.includes('pexels') ? '?auto=compress&cs=tinysrgb&w=800' : ''}"
              style="width:100%;height:100%;object-fit:cover;"
              onerror="this.parentElement.innerHTML='<div style=\'width:100%;height:100%;min-height:450px;background:${genGradient(p.color)};position:relative;overflow:hidden;border-radius:16px 0 0 16px;\'>${getSilhouette(p.category, 'large').replace(/'/g,'"')}</div>'" />
       </div>`
    : `<div style="width:100%;height:100%;min-height:450px;background:${genGradient(p.color)};position:relative;overflow:hidden;border-radius:16px 0 0 16px;">
         ${getSilhouette(p.category, 'large')}
       </div>`;

  document.getElementById('modalInfo').innerHTML = `
    <div class="product-category">${p.gender?.toUpperCase()} · ${p.category}</div>
    <h2>${p.name}</h2>
    <div class="modal-price">₹${p.price}</div>
    <p class="modal-desc">${p.description}</p>
    <div>
      <div style="font-size:0.7rem;letter-spacing:0.15em;text-transform:uppercase;color:var(--text3);margin-bottom:0.75rem">Select Size</div>
      <div class="size-options">
        ${(p.sizes||['One Size']).map((s,i) => `<button class="size-btn${i===0?' selected':''}" onclick="selectSize(this,'${s}')">${s}</button>`).join('')}
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn-primary" style="flex:1" onclick="addToCartFromModal()">Add to Cart</button>
      <button class="btn-ghost" onclick="wishlistAdd(${p.id})">♡ Save</button>
    </div>
    <div style="font-size:0.72rem;color:var(--text3);margin-top:0.5rem">In stock: ${p.stock} remaining</div>`;

  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function pickColor(el, productId) {
  const parent = document.getElementById('swatches-' + productId);
  parent.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
  el.classList.add('active');
  const label = document.getElementById('color-label-' + productId);
  if (label) label.textContent = el.dataset.color;
}
function selectSize(btn, size) {
  document.querySelectorAll('.size-btn').forEach(b => b.classList.remove('selected'));
  btn.classList.add('selected'); selectedSize = size;
}
function addToCartFromModal() {
  if (!selectedProductId) return;
  addToCart(selectedProductId, selectedSize);
  closeModal();
}
function wishlistAdd(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  const exists = wishlist.find(w => w.id === id);
  if (!exists) {
    wishlist.push({ id: p.id, name: p.name, price: p.price, image: p.image, color: p.color, category: p.category });
    localStorage.setItem('iv_wishlist', JSON.stringify(wishlist));
  }
  showToast('♡ Saved to wishlist', '✦');
}
document.getElementById('closeModal').addEventListener('click', closeModal);
document.getElementById('productModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeModal(); });
function closeModal() {
  document.getElementById('productModal').classList.remove('active');
  document.body.style.overflow = '';
}

// ── CART ──
function addToCart(id, size) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  const sz = size || (p.sizes ? p.sizes[0] : 'One Size');
  const activeSwatch = document.querySelector(`#swatches-${id} .color-swatch.active`);
  const selectedColor = activeSwatch ? activeSwatch.dataset.color : 'Black';
  const key = `${id}-${sz}-${selectedColor}`;
  const existing = cart.find(i => i.key === key);
  if (existing) existing.qty++;
  else cart.push({ key, id, name:p.name, price:p.price, size:sz, qty:1, color:p.color, category:p.category, gender:p.gender, image:p.image, selectedColor });
  saveCart(); updateCartBadge();
  showToast(`${p.name} added to cart`, '◈');
}
function saveCart() { localStorage.setItem('iv_cart', JSON.stringify(cart)); }
function updateCartBadge() {
  const total = cart.reduce((s,i) => s+i.qty, 0);
  const badge = document.getElementById('cartBadge');
  badge.textContent = total;
  badge.classList.toggle('show', total > 0);
}
function renderCart() {
  const container = document.getElementById('cartItems');
  const footer = document.getElementById('cartFooter');
  if (!cart.length) {
    container.innerHTML = `<div class="empty-cart"><div class="empty-icon">◈</div><p>Your cart is empty</p><span>Add some pieces to get started</span></div>`;
    footer.style.display = 'none'; return;
  }
  footer.style.display = 'block';
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0);
  document.getElementById('cartTotal').textContent = '₹' + total.toFixed(2);
  container.innerHTML = cart.map(item => `
    <div class="cart-item" data-key="${item.key}">
      <div class="cart-item-img">
        ${item.image
          ? `<img src="${item.image}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'" />`
          : `<div style="width:100%;height:100%;background:${genGradient(item.color)};position:relative;overflow:hidden">${getSilhouette(item.category)}</div>`
        }
      </div>
      <div class="cart-item-details">
        <div class="cart-item-name">${item.name}</div>
        <div class="cart-item-meta">Size: ${item.size} · ${item.selectedColor || ''} · ${item.gender||''}</div>
        <div class="cart-item-price">₹${(item.price*item.qty).toFixed(2)}</div>
        <div class="cart-item-actions">
          <button class="qty-btn" onclick="changeQty('${item.key}',-1)">−</button>
          <span class="qty-display">${item.qty}</span>
          <button class="qty-btn" onclick="changeQty('${item.key}',1)">+</button>
          <button class="remove-item" onclick="removeItem('${item.key}')">Remove</button>
        </div>
      </div>
    </div>`).join('');
}
function changeQty(key, delta) {
  const item = cart.find(i => i.key === key);
  if (!item) return;
  item.qty = Math.max(1, item.qty + delta);
  saveCart(); updateCartBadge(); renderCart();
}
function removeItem(key) {
  cart = cart.filter(i => i.key !== key);
  saveCart(); updateCartBadge(); renderCart();
  showToast('Item removed', '◈');
}
document.getElementById('cartBtn').addEventListener('click', openCart);
document.getElementById('closeCart').addEventListener('click', closeCart);
document.getElementById('cartOverlay').addEventListener('click', closeCart);
function openCart() {
  renderCart();
  document.getElementById('cartSidebar').classList.add('open');
  document.getElementById('cartOverlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCart() {
  document.getElementById('cartSidebar').classList.remove('open');
  document.getElementById('cartOverlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ── AUTH ──
document.getElementById('authBtn').addEventListener('click', () => {
  if (currentUser && currentUser.isAdmin) { openAdmin(); return; }
  if (currentUser && !currentUser.isAdmin) { openUserPortal(); return; }
  document.getElementById('authModal').classList.add('active');
  document.body.style.overflow = 'hidden';
});
document.getElementById('closeAuth').addEventListener('click', closeAuth);
document.getElementById('authModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeAuth(); });
function closeAuth() { document.getElementById('authModal').classList.remove('active'); document.body.style.overflow = ''; }
document.getElementById('loginTab').addEventListener('click', () => {
  document.getElementById('loginTab').classList.add('active'); document.getElementById('signupTab').classList.remove('active');
  document.getElementById('loginForm').classList.remove('hidden'); document.getElementById('signupForm').classList.add('hidden');
});
document.getElementById('signupTab').addEventListener('click', () => {
  document.getElementById('signupTab').classList.add('active'); document.getElementById('loginTab').classList.remove('active');
  document.getElementById('signupForm').classList.remove('hidden'); document.getElementById('loginForm').classList.add('hidden');
});

document.getElementById('loginSubmit').addEventListener('click', async () => {
  const email = document.getElementById('loginEmail').value.trim();
  const pass = document.getElementById('loginPassword').value;
  const err = document.getElementById('loginError');
  if (!email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: pass })
    });
    const data = await res.json();
    if (data.error) { err.textContent = data.error; return; }
    currentUser = data.user;
    localStorage.setItem('iv_user', JSON.stringify(currentUser));
    localStorage.setItem('iv_token', data.token);
    updateAuthBtn(); closeAuth();
    showToast(`Welcome back, ${currentUser.name}!`, '◈');
    if (currentUser.isAdmin) setTimeout(openAdmin, 500);
  } catch {
    // fallback for dev without backend
    const isAdmin = email.toLowerCase().includes('admin');
    currentUser = { name: email.split('@')[0], email, isAdmin };
    localStorage.setItem('iv_user', JSON.stringify(currentUser));
    updateAuthBtn(); closeAuth();
    showToast(`Welcome back, ${currentUser.name}!`, '◈');
    if (isAdmin) setTimeout(openAdmin, 500);
  }
});

document.getElementById('signupSubmit').addEventListener('click', async () => {
  const name = document.getElementById('signupName').value.trim();
  const email = document.getElementById('signupEmail').value.trim();
  const pass = document.getElementById('signupPassword').value;
  const err = document.getElementById('signupError');
  if (!name || !email || !pass) { err.textContent = 'Please fill in all fields.'; return; }
  if (!email.includes('@')) { err.textContent = 'Please enter a valid email.'; return; }
  if (pass.length < 6) { err.textContent = 'Password must be at least 6 characters.'; return; }
  try {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password: pass })
    });
    const data = await res.json();
    if (data.error) { err.textContent = data.error; return; }
    currentUser = data.user;
    localStorage.setItem('iv_user', JSON.stringify(currentUser));
    localStorage.setItem('iv_token', data.token);
    updateAuthBtn(); closeAuth();
    showToast(`Welcome to IvoryFits, ${name}!`, '◈');
  } catch {
    currentUser = { name, email, isAdmin: false };
    localStorage.setItem('iv_user', JSON.stringify(currentUser));
    updateAuthBtn(); closeAuth();
    showToast(`Welcome to IvoryFits, ${name}!`, '◈');
  }
});

function updateAuthBtn() {
  const btn = document.getElementById('authBtn');
  btn.style.color = currentUser ? 'var(--gold)' : '';
  btn.title = currentUser ? (currentUser.isAdmin ? 'Admin Panel' : `Hi, ${currentUser.name}`) : 'Login';
}

// ── USER PORTAL ──
function openUserPortal() {
  function renderPortalOrders() {
  const container = document.getElementById('portal-orders-list');
  const allOrders = JSON.parse(localStorage.getItem('iv_orders') || '[]');
  
  // Filter only this user's orders
  const myOrders = allOrders.filter(o => 
    o.shipping?.email?.toLowerCase() === currentUser?.email?.toLowerCase()
  );
  
  if (!myOrders.length) {
    container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text3)">
      <div style="font-size:2rem;margin-bottom:1rem;opacity:0.3">◈</div>
      <p style="font-size:0.88rem;">No orders yet. Start shopping!</p>
    </div>`;
    return;
  }
  container.innerHTML = [...myOrders].reverse().map(o => `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:10px;padding:1.25rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem">
        <div>
          <div style="font-size:0.78rem;color:var(--gold);letter-spacing:0.08em">#${o.id}</div>
          <div style="font-size:0.7rem;color:var(--text3);margin-top:2px">${new Date(o.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
        </div>
        <span style="font-size:0.65rem;padding:3px 10px;border-radius:20px;background:${o.status==='Shipped'?'rgba(78,205,164,0.1)':'rgba(201,169,110,0.1)'};color:${o.status==='Shipped'?'#4ecda4':'var(--gold)'};border:1px solid ${o.status==='Shipped'?'rgba(78,205,164,0.3)':'rgba(201,169,110,0.3)'};letter-spacing:0.08em;text-transform:uppercase">${o.status}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text2);margin-bottom:0.75rem;line-height:1.5">
        ${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.9rem;color:var(--gold)">₹${parseFloat(o.total).toFixed(2)}</span>
        <span style="font-size:0.7rem;color:var(--text3)">${o.shipping?.city || ''}</span>
      </div>
    </div>`).join('');
}
  // pre-fill profile
  if (currentUser) {
    document.getElementById('portalName').value = currentUser.name || '';
    document.getElementById('portalEmail').value = currentUser.email || '';
    document.getElementById('portalInitial').textContent = (currentUser.name || 'U')[0].toUpperCase();
    document.getElementById('portalUserName').textContent = currentUser.name || '';
    document.getElementById('portalUserSub').textContent = currentUser.email || '';
  }
  showPortalSection('orders', document.querySelector('.portal-nav-item'));
  document.getElementById('userPortalModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeUserPortal() {
  document.getElementById('userPortalModal').classList.remove('active');
  document.body.style.overflow = '';
}
function showPortalSection(id, el) {
  document.querySelectorAll('.portal-section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.portal-nav-item').forEach(n => n.classList.remove('active'));
  document.getElementById('portal-' + id).classList.add('active');
  if (el) el.classList.add('active');
}
function renderPortalOrders() {
  const container = document.getElementById('portal-orders-list');
  const myOrders = JSON.parse(localStorage.getItem('iv_orders') || '[]');
  if (!myOrders.length) {
    container.innerHTML = `<div style="text-align:center;padding:3rem;color:var(--text3)">
      <div style="font-size:2rem;margin-bottom:1rem;opacity:0.3">◈</div>
      <p style="font-size:0.88rem;">No orders yet. Start shopping!</p>
    </div>`;
    return;
  }
  container.innerHTML = [...myOrders].reverse().map(o => `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:10px;padding:1.25rem;margin-bottom:1rem">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:0.75rem">
        <div>
          <div style="font-size:0.78rem;color:var(--gold);letter-spacing:0.08em">#${o.id}</div>
          <div style="font-size:0.7rem;color:var(--text3);margin-top:2px">${new Date(o.date).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}</div>
        </div>
        <span style="font-size:0.65rem;padding:3px 10px;border-radius:20px;background:${o.status==='Shipped'?'rgba(78,205,164,0.1)':'rgba(201,169,110,0.1)'};color:${o.status==='Shipped'?'#4ecda4':'var(--gold)'};border:1px solid ${o.status==='Shipped'?'rgba(78,205,164,0.3)':'rgba(201,169,110,0.3)'};letter-spacing:0.08em;text-transform:uppercase">${o.status}</span>
      </div>
      <div style="font-size:0.8rem;color:var(--text2);margin-bottom:0.75rem;line-height:1.5">
        ${o.items.map(i => `${i.name} × ${i.qty}`).join(', ')}
      </div>
      <div style="display:flex;justify-content:space-between;align-items:center">
        <span style="font-size:0.9rem;color:var(--gold)">₹${parseFloat(o.total).toFixed(2)}</span>
        <span style="font-size:0.7rem;color:var(--text3)">${o.shipping?.city || ''}</span>
      </div>
    </div>`).join('');
}
function renderPortalWishlist() {
  const container = document.getElementById('portal-wishlist-grid');
  wishlist = JSON.parse(localStorage.getItem('iv_wishlist') || '[]');
  if (!wishlist.length) {
    container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:3rem;color:var(--text3)">
      <div style="font-size:2rem;margin-bottom:1rem;opacity:0.3">♡</div>
      <p style="font-size:0.88rem;">No saved items yet.</p>
    </div>`;
    return;
  }
  container.innerHTML = wishlist.map(w => `
    <div style="background:var(--surface);border:1px solid var(--border2);border-radius:10px;overflow:hidden">
      <div style="height:110px;overflow:hidden;position:relative;background:${genGradient(w.color)}">
        ${w.image ? `<img src="${w.image}" style="width:100%;height:100%;object-fit:cover;" onerror="this.style.display='none'"/>` : getSilhouette(w.category)}
      </div>
      <div style="padding:0.85rem">
        <div style="font-size:0.82rem;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${w.name}</div>
        <div style="font-size:0.78rem;color:var(--gold);margin-bottom:0.6rem">₹${w.price}</div>
        <div style="display:flex;gap:6px">
          <button onclick="addToCart(${w.id})" style="flex:1;background:var(--gold);color:#0a0a0a;border:none;padding:6px;border-radius:5px;font-size:0.65rem;letter-spacing:0.08em;text-transform:uppercase;cursor:pointer">Add to Cart</button>
          <button onclick="removeFromWishlist(${w.id})" style="background:transparent;border:1px solid var(--border2);color:var(--text3);padding:6px 8px;border-radius:5px;font-size:0.7rem;cursor:pointer">✕</button>
        </div>
      </div>
    </div>`).join('');
}
function removeFromWishlist(id) {
  wishlist = wishlist.filter(w => w.id !== id);
  localStorage.setItem('iv_wishlist', JSON.stringify(wishlist));
  renderPortalWishlist();
  showToast('Removed from wishlist', '◈');
}
function savePortalProfile() {
  const name = document.getElementById('portalName').value.trim();
  const phone = document.getElementById('portalPhone').value.trim();
  const city = document.getElementById('portalCity').value.trim();
  if (currentUser) {
    currentUser.name = name;
    currentUser.phone = phone;
    currentUser.city = city;
    localStorage.setItem('iv_user', JSON.stringify(currentUser));
    document.getElementById('portalInitial').textContent = name[0].toUpperCase();
    document.getElementById('portalUserName').textContent = name;
    updateAuthBtn();
  }
  showToast('Profile saved ✦', '◈');
}
function portalSignOut() {
  currentUser = null;
  localStorage.removeItem('iv_user');
  localStorage.removeItem('iv_token');
  updateAuthBtn();
  closeUserPortal();
  showToast('Signed out successfully', '◈');
}

// ── CHECKOUT ──
document.getElementById('checkoutBtn').addEventListener('click', openCheckout);
document.getElementById('closeCheckout').addEventListener('click', closeCheckout);
document.getElementById('checkoutModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeCheckout(); });
function openCheckout() {
  if (!cart.length) { showToast('Your cart is empty', '◈'); return; }
  closeCart();
  ['step1','step2','step3'].forEach((s,i) => {
    document.getElementById(s).classList.toggle('hidden', i !== 0);
  });
  if (currentUser) {
    document.getElementById('shipName').value = currentUser.name || '';
    document.getElementById('shipEmail').value = currentUser.email || '';
  }
  document.getElementById('checkoutModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
function closeCheckout() { document.getElementById('checkoutModal').classList.remove('active'); document.body.style.overflow = ''; }
document.getElementById('nextStep').addEventListener('click', () => {
  const vals = ['shipName','shipEmail','shipAddress','shipCity'].map(id => document.getElementById(id).value.trim());
  if (vals.some(v => !v)) { showToast('Please fill in all shipping fields', '◈'); return; }
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0);
  document.getElementById('orderSummary').innerHTML = cart.map(i => `<div class="order-summary-item"><span>${i.name} × ${i.qty}</span><span>₹${(i.price*i.qty).toFixed(2)}</span></div>`).join('');
  document.getElementById('orderTotal').textContent = '₹' + total.toFixed(2);
  document.getElementById('step1').classList.add('hidden');
  document.getElementById('step2').classList.remove('hidden');
});
document.getElementById('placeOrder').addEventListener('click', () => {
  const orderId = 'IVF-' + Date.now().toString(36).toUpperCase();
  const total = cart.reduce((s,i) => s+i.price*i.qty, 0);
  const order = { id:orderId, items:[...cart], total, shipping:{
    name: document.getElementById('shipName').value,
    email: document.getElementById('shipEmail').value,
    address: document.getElementById('shipAddress').value,
    city: document.getElementById('shipCity').value,
  }, date: new Date().toISOString(), status:'Processing' };
  orders.push(order);
  localStorage.setItem('iv_orders', JSON.stringify(orders));
  fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify(order) }).catch(()=>{});
  cart = []; saveCart(); updateCartBadge();
  document.getElementById('orderNum').textContent = `Order #${orderId}`;
  document.getElementById('step2').classList.add('hidden');
  document.getElementById('step3').classList.remove('hidden');
  showToast('Order placed successfully!', '◈');
});

// ── ADMIN ──
function openAdmin() {
  if (!currentUser?.isAdmin) { showToast('Admin access required', '◈'); return; }
  renderAdminProducts(); renderAdminOrders();
  document.getElementById('adminModal').classList.add('active');
  document.body.style.overflow = 'hidden';
}
document.getElementById('closeAdmin').addEventListener('click', () => { document.getElementById('adminModal').classList.remove('active'); document.body.style.overflow = ''; });
document.getElementById('adminModal').addEventListener('click', e => { if (e.target === e.currentTarget) { document.getElementById('adminModal').classList.remove('active'); document.body.style.overflow = ''; } });
document.querySelectorAll('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    document.querySelectorAll('.admin-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(tab.dataset.tab).classList.remove('hidden');
  });
});
function renderAdminProducts() {
  document.getElementById('adminProductsList').innerHTML = adminProducts.map(p => `
    <div class="admin-product-row">
      <div class="admin-product-row-info"><strong>${p.name}</strong><br><span>₹${p.price} · ${p.gender} · ${p.category} · Stock: ${p.stock}</span></div>
      <div class="admin-row-actions">
        <button class="admin-action-btn" onclick="editProduct(${p.id})">Edit</button>
        <button class="admin-action-btn del" onclick="deleteProduct(${p.id})">Delete</button>
      </div>
    </div>`).join('');
}
function renderAdminOrders() {
  const stored = JSON.parse(localStorage.getItem('iv_orders') || '[]');
  document.getElementById('adminOrdersList').innerHTML = !stored.length
    ? `<p style="color:var(--text3);padding:1rem">No orders yet.</p>`
    : stored.map(o => `<div class="admin-product-row"><div class="admin-product-row-info"><strong>#${o.id}</strong><br><span>${o.shipping?.name} · ₹${parseFloat(o.total||0).toFixed(2)} · ${o.status}</span></div><div class="admin-row-actions"><button class="admin-action-btn" onclick="updateOrderStatus('${o.id}')">Mark Shipped</button></div></div>`).join('');
}
function updateOrderStatus(id) {
  const stored = JSON.parse(localStorage.getItem('iv_orders') || '[]');
  const o = stored.find(x => x.id === id);
  if (o) { o.status = 'Shipped'; localStorage.setItem('iv_orders', JSON.stringify(stored)); renderAdminOrders(); showToast('Order marked as shipped', '◈'); }
}
document.getElementById('addProductBtn').addEventListener('click', () => {
  editingProductId = null;
  document.getElementById('productFormTitle').textContent = 'Add Product';
  ['pName','pPrice','pDesc','pImage','pStock'].forEach(id => document.getElementById(id).value = '');
  document.getElementById('productFormModal').classList.add('active');
});
document.getElementById('closeProductForm').addEventListener('click', () => document.getElementById('productFormModal').classList.remove('active'));
function editProduct(id) {
  const p = adminProducts.find(x => x.id === id);
  if (!p) return;
  editingProductId = id;
  document.getElementById('productFormTitle').textContent = 'Edit Product';
  document.getElementById('pName').value = p.name;
  document.getElementById('pPrice').value = p.price;
  document.getElementById('pGender').value = p.gender || 'women';
  document.getElementById('pCategory').value = p.category;
  document.getElementById('pDesc').value = p.description;
  document.getElementById('pImage').value = p.image || '';
  document.getElementById('pStock').value = p.stock;
  document.getElementById('productFormModal').classList.add('active');
}
function deleteProduct(id) {
  if (!confirm('Delete this product?')) return;
  adminProducts = adminProducts.filter(p => p.id !== id);
  localStorage.setItem('iv_admin_products', JSON.stringify(adminProducts));
  renderAdminProducts(); renderProducts();
  showToast('Product deleted', '◈');
  fetch(`/api/products/${id}`, { method:'DELETE' }).catch(()=>{});
}
document.getElementById('saveProduct').addEventListener('click', () => {
  const name = document.getElementById('pName').value.trim();
  const price = parseFloat(document.getElementById('pPrice').value);
  const gender = document.getElementById('pGender').value;
  const category = document.getElementById('pCategory').value;
  const description = document.getElementById('pDesc').value.trim();
  const stock = parseInt(document.getElementById('pStock').value) || 0;
  const image = document.getElementById('pImage').value.trim();
  if (!name || !price) { showToast('Name and price are required', '◈'); return; }
  const genderColors = { men:'#1c1c1c', women:'#e8d9c4', kids:'#f5c8d0' };
  if (editingProductId) {
    const p = adminProducts.find(x => x.id === editingProductId);
    if (p) Object.assign(p, { name, price, gender, category, description, stock, image });
    showToast('Product updated', '◈');
  } else {
    const newId = Math.max(...adminProducts.map(p => p.id), 0) + 1;
    adminProducts.push({ id:newId, name, price, gender, category, description, stock, image, sizes:['XS','S','M','L'], badge:'New', color:genderColors[gender]||'#1a1a1a' });
    showToast('Product added', '◈');
  }
  localStorage.setItem('iv_admin_products', JSON.stringify(adminProducts));
  document.getElementById('productFormModal').classList.remove('active');
  renderAdminProducts(); renderProducts();
});

// ── CHATBOT ──
document.getElementById('chatFab').addEventListener('click', () => document.getElementById('chatbotPanel').classList.toggle('open'));
document.getElementById('closeChatbot').addEventListener('click', () => document.getElementById('chatbotPanel').classList.remove('open'));
document.getElementById('chatSend').addEventListener('click', sendChatMessage);
document.getElementById('chatInput').addEventListener('keydown', e => { if (e.key === 'Enter') sendChatMessage(); });
function sendChatMessage() {
  const input = document.getElementById('chatInput');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';
  appendMessage(msg, 'user');
  const typingId = appendTyping();
  fetch('/api/chat', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ message:msg }) })
    .then(r => r.json())
    .then(data => { removeTyping(typingId); appendMessage(data.reply || "I'm here to help!", 'bot'); })
    .catch(() => { removeTyping(typingId); appendMessage(getMockReply(msg), 'bot'); });
}
function getMockReply(msg) {
  const m = msg.toLowerCase();
  if (m.includes('men') || m.includes('man')) return "Our Men's collection features premium Shirts, Hoodies, Cargos, Ethnic Wear and more. Click 👨 Men in the navbar or use the filter above the shop! ✦";
  if (m.includes('women') || m.includes('woman')) return "Our Women's collection has Dresses, Ethnic Wear, Tops, Skirts and much more. Click 👩 Women in the navbar to browse! ✦";
  if (m.includes('kid') || m.includes('child') || m.includes('baby')) return "Our Kids section has everything from Ethnic Wear to Nightwear and Activewear! Click 🧒 Kids in the navbar. ✦";
  if (m.includes('size')) return "Sizing runs true to standard EU/US. Between sizes? Size up. Each product page has a detailed breakdown.";
  if (m.includes('return') || m.includes('refund')) return "Free returns within 30 days. Items must be unworn with tags attached.";
  if (m.includes('ship') || m.includes('deliver')) return "Standard shipping 3–5 days. Express 1–2 days. Free shipping on orders over ₹500.";
  if (m.includes('ethnic') || m.includes('kurta') || m.includes('saree') || m.includes('lehenga')) return "Our Ethnic Wear spans all genders! Men's Kurtas & Sherwanis, Women's Sarees, Kurtis & Lehengas, and Kids' Festive Sets. All beautifully curated. ✨";
  if (m.includes('hello') || m.includes('hi')) return "Hello darling! I'm your IvoryFits stylist. Ask me about Men, Women or Kids collections, sizing, shipping, or let me build you the perfect look. ✨";
  return "Great question! Tell me more — the occasion, who it's for (Men/Women/Kids), and I'll make a personal recommendation. ✨";
}
function appendMessage(text, role) {
  const msgs = document.getElementById('chatMessages');
  const div = document.createElement('div');
  div.className = `chat-msg ${role}`;
  div.innerHTML = `<div class="msg-bubble">${text.replace(/\n/g,'<br>')}</div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
}
function appendTyping() {
  const msgs = document.getElementById('chatMessages');
  const id = 'typing-' + Date.now();
  const div = document.createElement('div');
  div.className = 'chat-msg bot'; div.id = id;
  div.innerHTML = `<div class="msg-bubble"><div class="typing-indicator"><span></span><span></span><span></span></div></div>`;
  msgs.appendChild(div); msgs.scrollTop = msgs.scrollHeight;
  return id;
}
function removeTyping(id) { document.getElementById(id)?.remove(); }

// ── TOAST ──
function showToast(message, icon = '◈') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `<span class="toast-icon">${icon}</span><span>${message}</span>`;
  container.appendChild(toast);
  setTimeout(() => { toast.classList.add('out'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ── SCROLL & REVEAL ──
function scrollToSection(id) { document.getElementById(id)?.scrollIntoView({ behavior:'smooth' }); }

let revealObserver;
function initScrollEffects() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.style.background = window.scrollY > 80
      ? (document.documentElement.getAttribute('data-theme') === 'light' ? 'rgba(248,245,240,0.98)' : 'rgba(10,10,10,0.98)')
      : '';
    const sections = ['home','collections','products','about'];
    let active = 'home';
    for (const s of sections) {
      const el = document.getElementById(s);
      if (el && window.scrollY >= el.offsetTop - 120) active = s;
    }
    document.querySelectorAll('.nav-link').forEach(l => {
      const href = l.getAttribute('href');
      l.classList.toggle('active', href === `#${active}`);
    });
  });
  revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('visible'); revealObserver.unobserve(e.target); } });
  }, { threshold: 0.08 });
  document.querySelectorAll('.collection-card, .section-header, .trend-stat, .about-text, .about-visual').forEach(el => {
    el.classList.add('reveal');
    revealObserver.observe(el);
  });
  injectCollectionFigures();
}

// ── COUNTERS ──
function initCounters() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const target = parseInt(el.dataset.target);
      let current = 0;
      const step = Math.ceil(target / 60);
      const timer = setInterval(() => {
        current = Math.min(current + step, target);
        el.textContent = current.toLocaleString();
        if (current >= target) clearInterval(timer);
      }, 25);
      observer.unobserve(el);
    });
  }, { threshold: 0.5 });
  document.querySelectorAll('.stat-num').forEach(el => observer.observe(el));
}

// ── HAMBURGER ──
function initEventListeners() {
  document.getElementById('hamburger').addEventListener('click', () => document.getElementById('navLinks').classList.toggle('open'));
  document.querySelectorAll('.nav-link').forEach(link => link.addEventListener('click', () => document.getElementById('navLinks').classList.remove('open')));
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      ['searchOverlay','productModal','authModal','checkoutModal','adminModal','productFormModal','userPortalModal'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.classList.remove('active');
      });
      document.body.style.overflow = '';
    }
  });
}