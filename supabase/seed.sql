-- ==============================================================================
-- FORGE 3D - SUPABASE POSTGRESQL INITIAL SEED DATA
-- Run this in the Supabase SQL Editor after running schema.sql
-- ==============================================================================

-- 1. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('industrial-fdm', 'Industrial 3D Printers', 'industrial-3d-printers', 'High-temperature, dual-extrusion systems designed for demanding engineering thermoplastics and continuous manufacturing.', 'Production Grade', '/images/categories/cat_industrial_fdm.jpg', '["Raise3D","Intamsys","CreatBot"]'::jsonb, 1)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('large-format', 'Large Format (LFAM) & Pellet', 'large-format-printers', 'Meter-scale build envelopes and direct pellet extrusion systems for rapid tooling, maritime, and architectural fabrication.', 'Meter Scale', '/images/categories/cat_large_format.jpg', '["Modix","CreatBot","Massivit"]'::jsonb, 2)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('high-temp', 'High-Temperature PEEK / Ultem', 'high-temperature-printers', 'Up to 500°C hotends with active 150°C heated chambers engineered specifically for PEEK, PEKK, and ULTEM 9085 aerospace parts.', 'Aerospace Class', '/images/categories/cat_high_temp.jpg', '["Intamsys","CreatBot","Apium"]'::jsonb, 3)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('sls-powder', 'SLS Powder Bed Fusion', 'sls-powder-printers', 'Supportless selective laser sintering for functional end-use nylon parts, complex lattice geometries, and batch production.', 'Support-Free', '/images/categories/cat_sls_powder.jpg', '["Formlabs","Sinterit"]'::jsonb, 4)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('resin-sla', 'Resin (SLA / DLP / LCD)', 'resin-sla-printers', 'Sub-micron accuracy and glass-smooth surface finish for dental prosthetics, precision tooling, and microfluidics.', 'High Precision', '/images/categories/cat_resin_sla_v2.jpg', '["Formlabs","Phrozen","Elegoo"]'::jsonb, 5)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('scanners', 'Industrial 3D Scanners', '3d-scanners', 'Metrology-grade handheld blue-laser and optical scanning systems for reverse engineering and automated QC inspection.', 'Metrology Grade', '/images/categories/cat_scanners.jpg', '["Shining 3D","Scantech","Creaform"]'::jsonb, 6)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('materials', 'Engineering Filaments & Resins', 'materials', 'Carbon-fiber reinforced filaments, PEEK pellets, flame-retardant polymers, and castable photopolymers.', 'Certified Formulations', '/images/categories/cat_materials.jpg', '["BASF Forward AM","Polymaker","Kimya"]'::jsonb, 7)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.categories (id, name, slug, description, badge, image, popular_brands, display_order)
VALUES ('accessories', 'Ancillaries & Post-Processing', 'accessories-post-processing', 'Industrial material dryers, automated vapor smoothing units, ultrasonic wash tanks, and HEPA extraction systems.', 'Turnkey Support', '/images/categories/cat_accessories.jpg', '["Drywise","Polymaker","AMT"]'::jsonb, 8)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;


-- 2. BRANDS
INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('raise3d', 'Raise3D', 'Industrial FDM & Metal FFF', 'USA / Global', 'Tier 1 Platinum UK Partner', 'Reliable, flexible, industrial production 3D printing ecosystem.', 'RAISE3D', 'border-red-500 text-red-600', 'Raise3D manufactures award-winning industrial dual-extrusion 3D printers, including the Pro3 Series, E2CF for carbon fibre, and the MetalFuse metal FFF sintering system. Known for rock-solid reliability and ideaMaker slicing software.', '["Dual independent extruders","Automated bed leveling","HEPA air filtration","Metal 316L/17-4PH capability"]'::jsonb, 'https://raise3d.com', '/brands/raise3d.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('intamsys', 'INTAMSYS', 'High-Temperature & PEEK Systems', 'Germany / Global', 'Authorized UK Industrial Partner', 'World leaders in high-performance functional materials 3D printing.', 'INTAMSYS', 'border-blue-600 text-blue-700', 'Specialists in high-temperature 3D printers engineered specifically for PEEK, PEKK, ULTEM, and PPS. Featuring chambers heated up to 300°C and 500°C hotends for aerospace and medical applications.', '["300°C heated chamber","500°C liquid-cooled hotends","Thermal annealing built-in","Aerospace compliant"]'::jsonb, 'https://intamsys.com', '/brands/intamsys.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('modix', 'Modix', 'Large-Format (LFAM) & Pellet', 'Israel / Global', 'Official UK Distributor', 'Heavy-duty meter-scale 3D printers for manufacturing and automotive.', 'MODIX', 'border-amber-600 text-amber-700', 'Modix supplies heavy-duty, meter-scale 3D printers from 600mm up to 2-metre build envelopes. Available with dual direct drive extruders or direct pellet extrusion heads for massive cost savings.', '["Up to 1,200 x 600 x 640 mm build","High-flow pellet extrusion","Duet32 32-bit controllers","Hiwin motion rails"]'::jsonb, 'https://modix3d.com', '/brands/modix.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('formlabs', 'Formlabs', 'SLA Resin & SLS Powder Systems', 'USA', 'Authorized UK Partner', 'Professional stereolithography and selective laser sintering.', 'FORMLABS', 'border-indigo-600 text-indigo-700', 'Pioneers in high-precision stereolithography (Form 4) and benchtop SLS powder bed fusion (Fuse 1+ 30W). Delivering production-grade biocompatible and engineering parts with exceptional surface quality.', '["Sub-micron detail","LFD fast print technology","Automated wash & cure","BioMed certified resins"]'::jsonb, 'https://formlabs.com', '/brands/formlabs.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('shining-3d', 'Shining 3D', 'Metrology & Handheld 3D Scanners', 'Global', 'Official UK Metrology Partner', 'High-precision 3D digitizing, laser scanning and inspection solutions.', 'SHINING 3D', 'border-emerald-600 text-emerald-700', 'From the versatile EinScan series to the ultra-precise FreeScan UE blue-laser metrology scanners. Providing sub-0.02mm inspection accuracy for aerospace, reverse engineering, and automotive quality control.', '["Blue laser technology","Up to 0.02mm accuracy","1.85 million pts/sec speed","CAD inspection heatmaps"]'::jsonb, 'https://shining3d.com', '/brands/shining-3d.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('creatbot', 'CreatBot', 'High-Temperature & Large Format FDM', 'Global', 'Authorized UK Distributor', 'Massive build volume combined with 420°C high-temp extruders.', 'CREATBOT', 'border-orange-600 text-orange-700', 'CreatBot designs and manufactures large enclosed industrial 3D printers including the D600 Pro 2 and F430. Capable of processing carbon fibre, nylon, polycarbonate, and large-scale architectural parts.', '["600 x 600 x 600 mm build","420°C high-temp hotends","Auto-shutdown on finish","Direct drive filament feeds"]'::jsonb, 'https://creatbot.com', '/brands/creatbot.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('basf-forward-am', 'BASF Forward AM', 'Advanced Engineering Materials', 'Germany', 'Authorized UK Materials Partner', 'Industrial-grade polymer formulations backed by chemical science.', 'BASF Forward AM', 'border-cyan-600 text-cyan-700', 'BASF Forward AM creates high-performance 3D printing filaments, resins, and metal feeds. Notable lines include Ultrafuse 316L stainless steel, PAHT CF15 carbon-filled nylon, and flexible TPU.', '["Ultrafuse metal filaments","Carbon-reinforced nylon","Industrial consistency","ISO 9001 certified"]'::jsonb, 'https://forward-am.com', '/brands/basf-forward-am.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('polymaker', 'Polymaker', 'High-Performance Filaments & Pellets', 'Global', 'Authorized UK Stockist', 'Comprehensive portfolio of engineered 3D printing polymers.', 'POLYMAKER', 'border-purple-600 text-purple-700', 'Polymaker produces engineering filaments including PolyMide PA6-CF, PolyMax high-impact polymers, and large-format pellet feeds. High dimensional consistency and continuous lot testing.', '["Warp-free formulations","High modulus carbon fiber","Extensive color palette","Spool-to-spool consistency"]'::jsonb, 'https://polymaker.com', '/brands/polymaker.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

INSERT INTO public.brands (id, name, category, origin, status, tagline, logo_text, badge_color, description, features, website, logo_image)
VALUES ('drywise', 'Drywise', 'Active Inline Filament Dryers', 'European Union', 'Official UK Partner', 'Active inline drying for hygroscopic engineering filaments.', 'DRYWISE', 'border-teal-600 text-teal-700', 'Drywise by Thought3D brings game-changing active inline drying to 3D printing. Dries nylon, PEEK, and TPU on-the-fly directly as it feeds into the printer, eliminating porosity and layer delamination.', '["Dries filament in real-time","Pre-programmed material profiles","Smart humidity sensor","Universal printer mount"]'::jsonb, 'https://drywise.co', '/brands/drywise.png')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;


-- 3. PRODUCTS
INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'raise3d-pro3-plus',
  'Raise3D Pro3 Plus Dual-Extrusion Industrial 3D Printer',
  'raise3d-pro3-plus',
  'Raise3D',
  'industrial-fdm',
  'Industrial 3D Printers',
  'FFF / FDM Dual Extrusion',
  6495,
  NULL,
  false,
  '£',
  'In Stock - Dispatched within 24h',
  true,
  15,
  '1-2 Days (UK Mainland)',
  'R3D-PRO3P-001',
  4.9,
  28,
  '["/images/products/prod_raise3d_pro3.jpg","/images/categories/cat_industrial_fdm.jpg"]'::jsonb,
  '{"buildVolume":"300 × 300 × 605 mm","maxNozzleTemp":"300°C","heatedBed":"120°C","layerResolution":"0.01 - 0.25 mm","extruder":"Independent Dual Extruder (IDEX)","materials":"PLA, ABS, PETG, PC, TPU, Carbon-Fiber PA"}'::jsonb,
  'The Raise3D Pro3 Plus represents the gold standard in industrial-grade desktop additive manufacturing. Engineered for demanding engineering applications, batch production, and large prototypes with an impressive 605mm Z-axis height.',
  '["Interchangeable Hotends with click-and-lock modular swap mechanism","Built-in EVE Smart Assistant for automated troubleshooting and preventative maintenance","Integrated HEPA air filtration with active carbon canister for safe shop-floor operation","Flexible steel build plate with magnetic adhesion system for easy part removal","Auto-bed leveling with 63-point high-resolution probe matrix"]'::jsonb,
  '{"Build Volume (Dual)":"300 × 300 × 605 mm","Print Head System":"Independent Dual Extruder (IDEX)","Filament Diameter":"1.75 mm","Max Hotend Temp":"300°C","Max Bed Temp":"120°C (Silicone heated)","Layer Height":"10 - 250 microns","Chamber Type":"Fully Enclosed with Air Circulation","Air Filtration":"HEPA Filter with Activated Carbon","Connectivity":"Wi-Fi, Ethernet, USB 2.0","Interface":"7-inch Full Color Industrial Touchscreen","Camera":"HD Live Monitoring Camera Built-in"}'::jsonb,
  '["Carbon Fiber PA","Polycarbonate (PC)","ABS","ASA","PETG","TPU 95A","PVA Water-Soluble Support"]'::jsonb,
  '12 Months Onsite Manufacturer Warranty + UK Priority Support',
  true,
  'Best Seller'
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'intamsys-funmat-pro-610-ht',
  'INTAMSYS FUNMAT PRO 610 HT High-Temp Industrial 3D Printer',
  'intamsys-funmat-pro-610-ht',
  'INTAMSYS',
  'high-temp',
  'High-Temperature PEEK / Ultem',
  'Industrial High-Temp FFF',
  34950,
  NULL,
  false,
  '£',
  'In Stock UK - Dispatched within 24h',
  true,
  15,
  '3-4 Weeks (Custom Commissioning)',
  'INT-FMP610-HT',
  5,
  14,
  '["/images/products/prod_intamsys_610ht.jpg","/images/categories/cat_high_temp.jpg"]'::jsonb,
  '{"buildVolume":"610 × 508 × 508 mm","maxNozzleTemp":"500°C","heatedChamber":"300°C Active Thermal Constant","layerResolution":"0.05 - 0.5 mm","extruder":"Liquid-Cooled Dual 500°C Hotends","materials":"PEEK, PEKK, ULTEM 9085, PPSU, PC, Carbon-PEEK"}'::jsonb,
  'A heavyweight industrial production powerhouse designed specifically for aerospace, defense, and high-performance automotive applications. Delivers continuous manufacturing in functional polymers without warping or layer delamination.',
  '["300°C Active Thermal Chamber eliminating internal stress in ultra-polymers","Liquid-cooled dual extruders reaching 500°C continuous operating temperature","High-capacity active filament drying chambers keeping moisture below 0.05%","Industrial CNC-grade linear guide rails with digital servo motors","Comprehensive open-material architecture for qualified aerospace polymers"]'::jsonb,
  '{"Build Volume":"610 × 508 × 508 mm (157 Litres)","Nozzle Temperature":"Up to 500°C (Dual Extruders)","Chamber Temperature":"Constant 300°C (Active Forced Convection)","Build Platform Temp":"Up to 300°C Magnetic Ceramic Glass","Cooling System":"Closed-Loop Liquid Chiller Unit","Filament Storage":"2x Active Molecular Sieve Heated Chambers","Motors & Kinematics":"High-Torque AC Servo Drives + C7 Ball Screws","Power Supply":"3-Phase 400V 32A Industrial Feed"}'::jsonb,
  '["PEEK","Carbon-PEEK","PEKK","ULTEM 9085 (Flame Retardant)","ULTEM 1010","PPSU","PEI","Polycarbonate"]'::jsonb,
  '24 Months Complete UK Onsite Service SLA Included',
  true,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'modix-big-120z',
  'Modix BIG-120Z Large-Scale Meter-Height Industrial 3D Printer',
  'modix-big-120z',
  'Modix',
  'large-format',
  'Large Format (LFAM) & Pellet',
  'Meter-Scale FFF',
  9950,
  NULL,
  false,
  '£',
  'In Stock UK Warehouse',
  true,
  15,
  '3-5 Business Days',
  'MDX-BIG-120Z',
  4.8,
  19,
  '["/images/products/prod_modix_120z.jpg","/images/spotlight/lfam_pellet_extrusion.jpg"]'::jsonb,
  '{"buildVolume":"600 × 600 × 1200 mm","maxNozzleTemp":"400°C Griffin Ultra High Flow","heatedBed":"120°C Dual Zone (Cast Aluminum)","layerResolution":"0.1 - 0.8 mm","extruder":"Griffin High-Flow Extruder (Up to 1.2mm Nozzle)","materials":"PLA, PETG, ABS, ASA, Carbon Fiber PA"}'::jsonb,
  'The Modix BIG-120Z offers an extraordinary 1.2-meter vertical build envelope, making it the premier choice for full-scale automotive body components, mannequins, architecture models, and tooling jigs.',
  '["Towering 1200 mm continuous vertical build volume","Heavy-duty aluminum profile frame with Hiwin motion guide rails","Griffin High-Flow extruder melting up to 100g of material per hour","Dual-zone heated cast aluminum bed with auto-calibration probe","Active crash detector and optical filament runout sensor"]'::jsonb,
  '{"Print Volume":"600 × 600 × 1200 mm","Extruder":"Griffin High-Flow SuperVolcano Option","Filament Runout":"Optical Dual-Sensor System","Chamber Enclosure":"Secondary Insulated Aluminum Composite Panels","Bed Leveling":"100-Point High Resolution Surface Mapping","Controller":"32-Bit Duet3D RepRap Firmware with Web Interface"}'::jsonb,
  '["PETG","Carbon Fiber PETG","ABS","ASA","PLA Tough","Polypropylene (PP)"]'::jsonb,
  '1 Year Warranty + Direct Modix Engineer Line',
  true,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'formlabs-fuse-1-plus-30w',
  'Formlabs Fuse 1+ 30W Industrial SLS 3D Printing System',
  'formlabs-fuse-1-plus-30w',
  'Formlabs',
  'sls-powder',
  'SLS Powder Bed Fusion',
  'Selective Laser Sintering (SLS)',
  24900,
  NULL,
  false,
  '£',
  'In Stock - Demo Units in Showroom',
  true,
  15,
  '5-7 Days Delivery & Onsite Commissioning',
  'FL-FUSE1P-30W',
  5,
  31,
  '["/images/products/prod_formlabs_fuse1.jpg","/images/categories/cat_sls_powder.jpg"]'::jsonb,
  '{"buildVolume":"165 × 165 × 300 mm","laserSource":"30W Ytterbium Fiber Laser","scanSpeed":"Up to 12.5 m/s Galvo System","layerResolution":"110 Microns","materials":"Nylon 12, Nylon 11, Carbon-Fiber Nylon, TPU 90A","supportStructure":"Zero Supports Needed (Self-Supporting Powder)"}'::jsonb,
  'The Fuse 1+ 30W brings high-throughput industrial selective laser sintering to production environments. Produce rugged, lightweight, supportless end-use mechanical components with unbeatable turnaround times.',
  '["Powerful 30W Ytterbium fiber laser with precision galvanometer scanning","Zero support structures required—stack parts in 3D throughout the build chamber","Nitrogen purging environment option for maximum elongation and mechanical toughness","Up to 70% powder refresh rate for low total cost per part","Integrated Fuse Sift powder handling station for automated sifting and recovery"]'::jsonb,
  '{"Build Volume":"165 × 165 × 300 mm","Laser Type":"30W Ytterbium Fiber Laser (1064 nm)","Laser Spot Size":"200 Microns","Scan Velocity":"Up to 12,500 mm/s","Inert Gas":"Active Nitrogen Purge System Option","Internal Heating":"Quartz Radiant Heaters with Closed-Loop Thermal Cam"}'::jsonb,
  '["Nylon 12 Powder","Nylon 11 Powder","Nylon 11 CF (Carbon Fiber)","TPU 90A Flexible Powder"]'::jsonb,
  'Formlabs Dental & Medical Certified Partner Support',
  true,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'formlabs-form-4b',
  'Formlabs Form 4B High-Speed Precision Photopolymer 3D Printer',
  'formlabs-form-4b',
  'Formlabs',
  'resin-sla',
  'Resin (SLA / DLP / LCD)',
  'Low Force Display (LFD) Photopolymer',
  4999,
  NULL,
  false,
  '£',
  'In Stock - Ready to Ship',
  true,
  15,
  'Next Day UK Dispatch',
  'FL-FORM4B-SYS',
  4.9,
  42,
  '["/images/products/prod_formlabs_form4b_v2.jpg","/images/categories/cat_resin_sla_v2.jpg"]'::jsonb,
  '{"buildVolume":"200 × 125 × 210 mm","printSpeed":"Up to 100 mm/hour Vertical","pixelSize":"50 Microns (4K Mono LCD)","materials":"30+ Biocompatible, Engineering & Dental Resins","accuracy":"Sub-micron ±0.15% Precision"}'::jsonb,
  'Powered by next-generation Low Force Display (LFD) engine, the Form 4B prints up to 5 times faster than conventional SLA systems while delivering stunning surface quality and biocompatible certification.',
  '["Next-Gen Low Force Display engine achieves ultra-fast 100 mm/h throughput","Validated for medical, dental, and ISO 10993 biocompatible device production","Light Processing Unit (LPU 4) delivers 50-micron uniform optical exposure","Automated resin dispensing and automatic tank level sensing","Quick-release build platform with flexible peel-off spring steel"]'::jsonb,
  '{"Build Dimensions":"200 × 125 × 210 mm","Print Speed":"Full height print in under 2 hours","XY Resolution":"50 Microns","Laser / Light Engine":"High-Power Uniform UV Backlight Array (405nm)","Resin Dispensing":"Dual Smart Cartridge Auto-Pump System"}'::jsonb,
  '["Tough 2000 Resin","Clear Resin","Flame Retardant Resin","BioMed Amber Resin","Castable Wax 40"]'::jsonb,
  '1 Year Full Formlabs Pro Service Plan',
  true,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'freescan-combo-scanner',
  'FreeScan Combo Metrology-Grade Hybrid Dual-Laser 3D Scanner',
  'freescan-combo-scanner',
  'Shining 3D',
  'scanners',
  'Industrial 3D Scanners',
  'Dual-Laser + Infrared Photogrammetry',
  18500,
  NULL,
  false,
  '£',
  'Demo Booking Available UK-Wide',
  true,
  15,
  '3-5 Days with Training Included',
  'SH3D-FSC-MET01',
  5,
  16,
  '["/images/products/prod_freescan_combo.jpg","/images/categories/cat_scanners.jpg"]'::jsonb,
  '{"accuracy":"Up to 0.02 mm (ISO 17025 Certified)","scanSpeed":"1,860,000 Points/Second","lightSource":"26 Blue Laser Lines + Single Line + VCSEL IR","weight":"620 g Ultralight Ergonomic Body","applications":"First Article Inspection, Reverse Engineering, Metrology"}'::jsonb,
  'The FreeScan Combo combines 26 crossed blue laser lines with deep-hole single laser and VCSEL infrared scanning. Delivers lab-grade metrology inspection on shiny, black, and reflective metallic surfaces without spray.',
  '["Certified volumetric accuracy up to 0.02 mm under VDI/VDE 2634 Part 3","Scans black and mirror-finish chrome surfaces without messy anti-reflective spray","Hybrid blue laser + infrared technology handles micro details and massive assemblies","Weighs only 620 grams for fatigue-free shop-floor mobile inspection","Export directly to Geomagic Control X, SolidWorks, and Siemens NX"]'::jsonb,
  '{"Volumetric Accuracy":"0.020 mm + 0.033 mm/m","Laser Lines":"26 Cross Blue + 7 Parallel + 1 Single Fine Line","Scan Rate":"1,860,000 measurements/sec","Working Distance":"300 mm","Depth of Field":"200 mm - 700 mm","Software":"FreeScan Control & Inspection Suite"}'::jsonb,
  '["Cast Iron","Polished Chrome","Carbon Fiber Weaves","Machined Billet Aluminum","Stamped Sheet Metal"]'::jsonb,
  'Includes 1-Day In-Person Onsite UK Training & Calibration Certificate',
  true,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'creatbot-d600-pro-2',
  'CreatBot D600 Pro 2 Large-Volume Dual Extruder 3D Printer',
  'creatbot-d600-pro-2',
  'CreatBot',
  'large-format',
  'Large Format (LFAM) & Pellet',
  'Large Format High-Temp FFF',
  13990,
  NULL,
  false,
  '£',
  'In Stock (UK Warehouse)',
  true,
  15,
  '3-4 Days Heavy Freight',
  'CB-D600P2-01',
  4.8,
  22,
  '["/images/products/prod_creatbot_d600.jpg","/images/categories/cat_industrial_fdm.jpg"]'::jsonb,
  '{"buildVolume":"600 × 600 × 600 mm","maxNozzleTemp":"420°C","heatedChamber":"70°C Active Thermal Circulation","heatedBed":"100°C Cast Aluminum Platform","materials":"PLA, ABS, Carbon PA, PC, Nylon, TPU"}'::jsonb,
  'The updated CreatBot D600 Pro 2 is the workhorse of industrial rapid tooling. Boasting a massive 600x600x600 mm build volume, auto-rising dual nozzles, and 70°C heated chamber, it is ideal for full-scale automotive jigs and fixtures.',
  '["Huge 216-liter enclosed build volume for monolithic industrial parts","Auto-rising dual hotends prevent mechanical collision during dual-material printing","420°C hotends capable of extruding high-strength engineering composites","Servo motor drive system with closed-loop positioning accuracy","Built-in filament drying compartment maintaining optimal moisture levels"]'::jsonb,
  '{"Build Volume":"600 × 600 × 600 mm","Max Hotend Temp":"420°C (Dual Hotends)","Bed Temperature":"Up to 100°C","Chamber Heated":"70°C Active Convection System","Print Speed":"Up to 150 mm/s","Filament Diameter":"1.75 mm"}'::jsonb,
  '["Carbon Fiber Nylon","Polycarbonate","ABS","ASA","PETG","PLA-ST","PVA"]'::jsonb,
  '1 Year UK Onsite Service + Telephone Support',
  false,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'basf-ultrafuse-316l',
  'BASF Ultrafuse 316L Metal 3D Printing Filament (3.0kg Spool)',
  'basf-ultrafuse-316l',
  'BASF Forward AM',
  'materials',
  'Engineering Filaments & Resins',
  'Bound Metal Deposition (FDM Metal)',
  385,
  NULL,
  false,
  '£',
  'In Stock',
  true,
  15,
  'Next Day UK Delivery',
  'BASF-316L-3KG',
  4.9,
  37,
  '["/images/products/prod_basf_316l.jpg","/images/categories/cat_materials.jpg"]'::jsonb,
  '{"weight":"3.0 kg","diameter":"1.75 mm / 2.85 mm","alloy":"Austenitic Stainless Steel 316L (1.4404)","process":"Standard FFF Printer -> Catalytic Debinding & Sintering","density":">98.5% Sintered Metal Density"}'::jsonb,
  'Transform standard desktop and industrial FFF 3D printers into metal manufacturing machines. Ultrafuse 316L consists of 90% metal powder in a catalytic polymer binder matrix, ready for industrial debinding and sintering into solid stainless steel.',
  '["True 316L stainless steel components printed on standard FFF hardware","High corrosion resistance and marine-grade mechanical performance","Official UK debinding & sintering partner service available","Eliminates need for costly laser powder metal systems","Uniform shrinkage calculation provided via BASF slicer profile"]'::jsonb,
  '{"Material":"Stainless Steel 316L + Polyolefin Binder","Nozzle Temp":"230°C - 250°C","Bed Temp":"90°C - 120°C","Tensile Strength":"561 MPa (After sintering)","Yield Strength":"251 MPa"}'::jsonb,
  '["Compatible with Raise3D Pro3, Intamsys, and Ultimaker S5/S7"]'::jsonb,
  'BASF Quality Verified Lot Certificate Included',
  false,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'polymaker-polymide-pa6-cf',
  'Polymaker PolyMide PA6-CF Carbon Fiber Filament (2.0kg)',
  'polymaker-polymide-pa6-cf',
  'Polymaker',
  'materials',
  'Engineering Filaments & Resins',
  'Carbon Fiber Reinforced Composite',
  119,
  NULL,
  false,
  '£',
  'In Stock (High Volume Available)',
  true,
  15,
  'Next Day UK Delivery',
  'PM-PA6CF-2000',
  5,
  54,
  '["/images/products/prod_polymaker_pa6cf.jpg","/images/categories/cat_materials.jpg"]'::jsonb,
  '{"weight":"2.0 kg Spool","fiberContent":"20% Chopped Carbon Fiber by Weight","heatDeflection":"215°C HDT @ 0.45 MPa","tensileStrength":"105 MPa","technology":"Warp-Free Fiber Matrix Technology"}'::jsonb,
  'PolyMide PA6-CF is engineered for high stiffness, extreme thermal resistance, and exceptional layer bonding. Ideal for functional automotive brackets, drone arms, and manufacturing jigs.',
  '["20% chopped carbon fiber loading yields metal-replacement strength","Heat deflection temperature of 215°C after standard annealing","Patented Warp-Free technology reduces shrinkage on standard print beds","Matte industrial finish with invisible layer lines","Abrasion-resistant hardened steel nozzle recommended"]'::jsonb,
  '{"Base Resin":"Polyamide 6 (Nylon 6)","Nozzle Temp":"280°C - 300°C","Bed Temp":"30°C - 50°C","Bending Modulus":"8400 MPa","Impact Strength":"11.8 kJ/m²"}'::jsonb,
  '["FDM Printers with Hardened Steel / Ruby Nozzle"]'::jsonb,
  'Vacuum Sealed with Desiccant & Humidity Indicator',
  false,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'drywise-inline-dryer',
  'Drywise Inline Active Filament Drying System for Industrial FDM',
  'drywise-inline-dryer',
  'Drywise',
  'accessories',
  'Ancillaries & Post-Processing',
  'Inline Desiccant Drying',
  1650,
  NULL,
  false,
  '£',
  'In Stock',
  true,
  15,
  '1-2 Days Dispatch',
  'DW-INLINE-01',
  4.9,
  23,
  '["/images/products/prod_drywise_dryer.jpg","/images/categories/cat_accessories.jpg"]'::jsonb,
  '{"compatibility":"Nylons, PEEK, ULTEM, TPU, PVA","speed":"Active In-Line Drying As You Print","cycleTime":"Print Ready in under 45 Minutes","filamentDiameter":"1.75 mm / 2.85 mm Options"}'::jsonb,
  'Eliminate moisture-related defects in hygroscopic engineering materials without waiting 12 hours for oven baking. Drywise dries filament on-the-fly as it feeds into your printer hotend.',
  '["Patented in-line desiccant chamber removes moisture in 45 minutes","Smart humidity sensors continuously monitor filament moisture output","Eliminates oozing, popping, stringing, and weak inter-layer bonding","Automated pre-heating and material profile selection","Compatible with any open-material FDM / FFF 3D printer"]'::jsonb,
  '{"Desiccant":"Regenerative Molecular Sieve","Sensor Suite":"Input & Output RH Humidity Transducers","Display":"OLED Status Screen with Push-Wheel Control","Power Consumption":"Average 120W"}'::jsonb,
  '["PA6","PA12","Carbon Fiber Nylon","PEEK","ULTEM","TPU","PVA"]'::jsonb,
  '2 Year Factory Warranty',
  false,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'einscan-pro-hd',
  'EinScan Pro HD Multi-Functional Handheld 3D Scanner Package',
  'einscan-pro-hd',
  'Shining 3D',
  'scanners',
  'Industrial 3D Scanners',
  'Structured Light Handheld Scanner',
  6850,
  NULL,
  false,
  '£',
  'In Stock - Fast Dispatch',
  true,
  15,
  'Next Day UK Delivery',
  'SH3D-EIN-PROHD',
  4.8,
  29,
  '["/images/products/prod_einscan_prohd.jpg","/images/categories/cat_scanners.jpg"]'::jsonb,
  '{"accuracy":"Up to 0.04 mm in Fixed Scan Mode","scanRate":"3,000,000 Points/Second","lightSource":"LED Structured Light + High Definition Camera","modes":"Handheld Rapid, Handheld HD, Fixed Industrial (Turntable)"}'::jsonb,
  'The EinScan Pro HD delivers high-resolution scanning of dark or casting surfaces with rich geometric detail. Includes Solid Edge SHINING 3D Edition CAD software for reverse engineering.',
  '["High-definition multi-stripe projection for fine edge resolution","Versatile 4-in-1 scanning modes (Handheld HD, Handheld Rapid, Fixed, Auto-Turntable)","Captures dark and metallic surfaces without developer sprays","Includes Solid Edge Shining 3D Edition CAD software package","Export directly to watertight mesh (STL, OBJ, PLY, 3MF)"]'::jsonb,
  '{"Point Distance":"0.2 mm - 3.0 mm","Single Shot Accuracy":"Up to 0.04 mm","Camera Speed":"10 FPS","Turntable Payload":"5 kg Automatic Turntable Included","Interface":"USB 3.0 High Speed"}'::jsonb,
  '["Automotive Parts","Industrial Tooling","Art & Sculptures","Medical Splints"]'::jsonb,
  '1 Year Warranty + UK Support & Software Upgrades',
  false,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;

INSERT INTO public.products (
  id, name, slug, brand, category_id, category_name, technology, price, sale_price,
  quote_only, currency, availability, in_stock, stock_quantity, lead_time, sku,
  rating, reviews_count, images, short_specs, description, key_features, tech_specs,
  suitable_materials, warranty, is_featured, badge
) VALUES (
  'intamsys-peek-cf',
  'INTAMSYS ULTRAX Carbon-PEEK Aerospace Polymer Filament (1kg)',
  'intamsys-peek-cf',
  'INTAMSYS',
  'materials',
  'Engineering Filaments & Resins',
  'Carbon Fiber Reinforced High-Temp Polymer',
  495,
  NULL,
  false,
  '£',
  'In Stock UK Warehouse',
  true,
  15,
  'Next Day UK Delivery',
  'INT-ULTRAX-1KG',
  5,
  18,
  '["/images/products/prod_intamsys_peekcf.jpg","/images/categories/cat_materials.jpg"]'::jsonb,
  '{"weight":"1.0 kg Spool","fiberContent":"15% High-Modulus Carbon Fiber","continuousTemp":"250°C Operating Temperature","tensileStrength":"130 MPa","resistance":"High Chemical, Gamma Radiation & Aviation Fuel Resistance"}'::jsonb,
  'Engineered for extreme environments in aerospace, defense, and subsea oil & gas exploration. Combines the chemical inertness of polyetheretherketone (PEEK) with the torsional rigidity of aerospace-grade carbon fiber.',
  '["Continuous service temperature up to 250°C (Short term up to 300°C)","Resistance to jet fuel, hydraulic fluids, acids, and radiation","Direct metal replacement for CNC titanium and aluminum parts","Requires 420°C - 450°C hotend and 120°C+ heated chamber","Batch certified with full traceability documents"]'::jsonb,
  '{"Hotend Temp":"420°C - 450°C","Chamber Temp":"120°C - 160°C","Bed Temp":"140°C - 160°C","Glass Transition (Tg)":"143°C","Melting Temp (Tm)":"343°C"}'::jsonb,
  '["FUNMAT PRO 410, FUNMAT PRO 610 HT, CreatBot F430/D600"]'::jsonb,
  'Lot Verified Certificate of Analysis',
  false,
  ''
) ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, price = EXCLUDED.price, stock_quantity = EXCLUDED.stock_quantity;


-- 4. BLOG POSTS
INSERT INTO public.blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
VALUES (
  'blog-1',
  'large-format-pellet-extrusion-tooling',
  'How Large-Format Pellet 3D Printing (LFAM) Cuts Tooling Costs by 75%',
  'Case Studies',
  'Large Format (LFAM)',
  '18 May 2024',
  '6 min read',
  'Callum Wright',
  'Senior Additive Applications Specialist',
  '/images/spotlight/lfam_pellet_extrusion.jpg',
  'Direct pellet extrusion eliminates filament processing costs while accelerating deposit rates up to 5kg/hour for automotive and composite autoclave mandrels.',
  '
### Executive Summary
Traditional tooling for composite autoclave layup and vacuum forming typically involves multi-week CNC milling lead times of aluminum billets or dense tooling board. Direct Pellet Extrusion (LFAM) transforms this workflow by depositing thermoplastic pellets directly into oversized near-net-shape tools in hours rather than weeks.

### The Problem: Extended CNC Tooling Bottlenecks
For motorsport and maritime composite teams, waiting 4 to 8 weeks for external CNC toolmakers introduces substantial scheduling vulnerability. Furthermore, machining large blocks produces up to 85% material waste in swarf.

### The Additive Solution
Utilising the Modix BIG-Meter LFAM platform equipped with high-throughput pellet extrusion heads:
- **Direct Pellet Savings**: Raw polymer pellets (such as 20% Carbon-Reinforced PETG or PPS) cost between £6/kg and £18/kg, compared to £45 - £95/kg for spooled filament.
- **Deposit Rate**: Output reaches up to 5.5 kg/hour, completing large meter-scale autoclave mandrels in less than 28 hours.
- **Near-Net Shape Finish**: A quick 1.5-hour CNC skim pass achieves sub-millimetre aerodynamic tolerance with Ra 0.8 surface finish.

### Return on Investment (ROI)
The UK composite manufacturer reported a 74.2% cost saving on their first six tool sets, amortising the equipment investment in under 5 months of continuous deployment.
    ',
  'published',
  true
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

INSERT INTO public.blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
VALUES (
  'blog-2',
  'replacing-cnc-titanium-with-carbon-peek',
  'Replacing CNC Milled Titanium with Carbon-PEEK in Aerospace Ducting',
  'Materials Science',
  'High-Temperature',
  '02 May 2024',
  '8 min read',
  'Dr. Alistair Vance',
  'Aerospace Materials Consultant',
  '/images/solutions/sol_aerospace.jpg',
  'How high-temperature additive manufacturing with 300°C chamber heating enables lightweight aerospace structural brackets with UL94 V-0 flame certification.',
  '
### The Weight Reduction Imperative in Aerospace
In commercial and military aviation, reducing weight translates directly into reduced fuel burn or expanded payload capability. Historically, titanium Ti-6Al-4V has been the default material for hot-air ECS environmental control ducting and engine nacelle brackets.

### The High-Performance Thermoplastic Alternative
With the introduction of the INTAMSYS FUNMAT PRO 610HT, engineers can reliably print continuous carbon-reinforced PEEK (Polyetheretherketone) and PEKK inside an actively heated 300°C chamber.

#### Key Engineering Metrics:
- **Density**: PEEK (1.30 g/cm³) vs Titanium (4.43 g/cm³) — yielding an immediate **68% weight reduction**.
- **Continuous Service Temperature**: Stable operation up to 250°C, with intermittent thermal spikes exceeding 300°C.
- **Flammability & Smoke**: Natural UL94 V-0 rating, complying with FAR 25.853 aerospace flammability standards.
- **Chemical Immunity**: Impervious to jet aviation fuels (Jet A-1), hydraulic fluids (Skydrol), and aggressive de-icing glycols.

### Validated Tensile Strength
Annealed Carbon-PEEK samples fabricated with a 0.2mm layer height exhibited ultimate tensile strengths exceeding 105 MPa with interlaminar shear strength matching compression-moulded benchmarks.
    ',
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

INSERT INTO public.blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
VALUES (
  'blog-3',
  'metrology-3d-scanning-automotive-inspection',
  'Metrology 3D Scanning for Automated Automotive Quality Inspection',
  'Quality Control',
  '3D Scanning',
  '21 April 2024',
  '5 min read',
  'Sarah Jenkins',
  'Metrology Systems Director',
  '/images/services/serv_metrology_inspection.jpg',
  'Replacing traditional contact probe CMMs with 26-laser handheld blue optical metrology scanners for 100% surface deviation heat maps.',
  '
### Moving Beyond Slow Coordinate Measuring Machines (CMMs)
Standard tactile probe CMMs remain the industry standard for specific critical hole diameters, but they suffer from severe throughput constraints and provide zero visual feedback on complex freeform body panel curvatures.

### Blue Laser Scanning in Action
By deploying the Shining 3D FreeScan UE Pro metrology scanner:
1. **Speed**: Captures 1,850,000 points per second across shiny stamped sheet metal without spray matting agents.
2. **Volumetric Accuracy**: Up to 0.02mm + 0.015mm/m traceable to VDI/VDE 2634 Part 3 standards.
3. **Automated Heat Maps**: Geomagic Control X generates 3D colour deviation reports comparing as-manufactured parts directly against master CAD within 90 seconds.

### Case Study Outcome
Inspection cycle times for automotive stamped suspension subframes decreased from 45 minutes per part to 6 minutes, permitting 100% line inspection instead of 5% statistical sampling.
    ',
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

INSERT INTO public.blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
VALUES (
  'blog-4',
  'sls-powder-bed-batch-production',
  'Selective Laser Sintering (SLS): When to Scale from FDM to Powder Bed',
  'Technology Comparison',
  'SLS Powder',
  '11 April 2024',
  '7 min read',
  'Callum Wright',
  'Senior Additive Applications Specialist',
  '/images/categories/cat_sls_powder.jpg',
  'A technical and financial breakdown of transitioning from support-constrained FDM printing to high-density 3D nesting SLS powder production.',
  '
### Support Constraints in Additive Manufacturing
Filament-based FDM/FFF printing is peerless for large, relatively straightforward geometry. However, when manufacturing intricate electronic enclosures with undercuts, deep channels, and internal snap-fits, manual support removal consumes significant labour.

### The SLS Powder Advantage
SLS (Selective Laser Sintering) employs a bed of unsintered PA12 or PA11 nylon powder that acts as continuous self-support:
- **Infinite Geometric Freedom**: Internal lattice dampers, enclosed fluidic channels, and pre-assembled mechanical linkages print without support structures.
- **3D Nesting Capacity**: Stack hundreds of small parts in all three dimensions throughout the entire vertical build cylinder.
- **Isotropic Mechanical Strength**: SLS components exhibit nearly identical mechanical characteristics across X, Y, and Z axes, avoiding interlaminar delamination risks.

### Financial Crossover Point
At batch volumes between 50 and 5,000 components, SLS demonstrates lower per-part costs than injection moulding tooling and lower labour cost than FDM printing.
    ',
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

INSERT INTO public.blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
VALUES (
  'blog-5',
  'moisture-control-engineering-filaments-drywise',
  'Moisture Control in Engineering Filaments: Why Inline Drying is Crucial',
  'Technical Guides',
  'Materials & Ancillaries',
  '29 March 2024',
  '4 min read',
  'Marcus Reid',
  'Materials Science Lead',
  '/images/products/prod_drywise_dryer.jpg',
  'Hygroscopic polymers like PA-CF, PEEK, and TPU degrade within 2 hours of ambient air exposure. Here is how inline active drying guarantees zero voids.',
  '
### The Hidden Saboteur: Moisture Absorption
Technical polymers such as Polyamide (Nylon), Carbon-reinforced Nylon, and Thermoplastic Polyurethane (TPU) are aggressively hygroscopic. At 50% relative humidity, a fresh spool of PA-CF can absorb 2% moisture by weight in less than 3 hours.

### What Happens Inside the Nozzle
When moist filament enters a 260°C - 300°C melt zone:
1. Absorbed water flash-boils into steam bubbles instantly.
2. The expanding steam causes characteristic popping and uneven extrusion flow.
3. Microscopic steam voids remain trapped in the extruded bead, causing severe tensile strength degradation of up to 45%.

### The Solution: Active Inline Filament Conditioning
Traditional convection drying ovens require 8 to 24 hours of pre-baking. In contrast, the Drywise inline active drying system dries the filament in real-time immediately before it enters the extruder, delivering calibrated <0.05% moisture content straight to the nozzle.
    ',
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;

INSERT INTO public.blogs (id, slug, title, category, tag, date, read_time, author, author_role, image, summary, content, status, is_featured)
VALUES (
  'blog-6',
  'rapid-marine-prototyping-modix-big',
  'Case Study: Full-Scale Marine Hull Prototyping with Modix BIG-120X',
  'Case Studies',
  'Maritime',
  '14 March 2024',
  '6 min read',
  'Callum Wright',
  'Senior Additive Applications Specialist',
  '/images/categories/cat_large_format.jpg',
  'A Portsmouth naval design firm reduced physical towing tank prototype build times from 3 months to 9 days using meter-scale 3D printing.',
  '
### The Challenge: Hydrodynamic Validation at Scale
Naval architects testing novel high-efficiency bulbous bow geometries required full-dimension 1.2-metre test hulls for tow-tank hydrodynamic turbulence validation. Hand-shaping foam blanks and applying fiberglass reinforcement took weeks and introduced human dimensional discrepancies.

### The Additive Approach
Deploying the Modix BIG-120X with its 1,200 x 600 x 640 mm build envelope enabled printing the hull section in one contiguous block using high-impact PETG-CF.

### Results & Verification
- **Build Time**: 76 continuous print hours using a 1.0mm volcano nozzle.
- **Accuracy**: Checked with blue laser scanning to ensure within ±0.35mm across the entire 1.2m length.
- **Cost**: £210 in raw materials versus £4,800 quoted by external patternmakers.
    ',
  'published',
  false
) ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, content = EXCLUDED.content;


-- 5. COUPONS
INSERT INTO public.coupons (id, code, discount_type, discount_value, min_order_amount, max_uses, is_active)
VALUES 
  ('cp_001', 'FORGE10', 'percentage', 10, 1000, 500, true),
  ('cp_002', 'ENTERPRISE500', 'fixed', 500, 5000, 100, true)
ON CONFLICT (code) DO NOTHING;


-- 6. SITE SETTINGS & COMPANY DETAILS
INSERT INTO public.site_settings (key, value)
VALUES 
  ('company_details', '{
    "company_name": "SOFT 3D Spółka z o.o.",
    "legal_form": "Spółka z o.o.",
    "address": "ul. Mokotowska 61 lok. 17, 00-542 Warszawa Poland",
    "city": "Warszawa",
    "postal_code": "00-542",
    "country": "Poland",
    "krs": "0000370365",
    "nip": "7010268819",
    "regon": "142683598",
    "email": "contact@soft3d.pl",
    "phone": "+48 22 123 45 67"
  }'::jsonb),
  ('general', '{
    "companyName": "SOFT 3D Spółka z o.o.",
    "phone": "+48 22 123 45 67",
    "email": "contact@soft3d.pl",
    "address": "ul. Mokotowska 61 lok. 17, 00-542 Warszawa Poland",
    "krs": "0000370365",
    "nip": "7010268819",
    "regon": "142683598"
  }'::jsonb),
  ('ecommerce', '{"currency":"£","currencySymbol":"£","taxRate":23,"freeShippingThreshold":250,"allowGuestCheckout":true}'::jsonb)
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;


-- 7. ADMINISTRATOR USER SETUP
-- Email: divyanshiasp1290@gmail.com
-- Password: Admin@2026
-- Role: admin
DO $$
DECLARE
  v_user_id UUID;
BEGIN
  -- 1. Check if user already exists in auth.users
  SELECT id INTO v_user_id FROM auth.users WHERE email = 'divyanshiasp1290@gmail.com';

  IF v_user_id IS NULL THEN
    v_user_id := gen_random_uuid();
    
    INSERT INTO auth.users (
      instance_id,
      id,
      aud,
      role,
      email,
      encrypted_password,
      email_confirmed_at,
      invited_at,
      confirmation_token,
      confirmation_sent_at,
      recovery_token,
      recovery_sent_at,
      email_change_token_new,
      email_change,
      email_change_sent_at,
      last_sign_in_at,
      raw_app_meta_data,
      raw_user_meta_data,
      is_super_admin,
      created_at,
      updated_at,
      phone,
      phone_confirmed_at,
      phone_change,
      phone_change_token,
      phone_change_sent_at,
      email_change_token_current,
      email_change_confirm_status,
      banned_until,
      reauthentication_token,
      reauthentication_sent_at,
      is_sso_user,
      deleted_at
    ) VALUES (
      '00000000-0000-0000-0000-000000000000',
      v_user_id,
      'authenticated',
      'authenticated',
      'divyanshiasp1290@gmail.com',
      crypt('Admin@2026', gen_salt('bf')),
      now(),
      NULL,
      '',
      NULL,
      '',
      NULL,
      '',
      '',
      NULL,
      now(),
      '{"provider":"email","providers":["email"]}'::jsonb,
      '{"first_name":"Divyanshi","last_name":"Admin","role":"admin","company":"SOFT 3D Spółka z o.o."}'::jsonb,
      false,
      now(),
      now(),
      NULL,
      NULL,
      '',
      '',
      NULL,
      '',
      0,
      NULL,
      '',
      NULL,
      false,
      NULL
    );
  ELSE
    -- Fix all tokens to empty string so GoTrue scanner doesn't crash on NULL
    UPDATE auth.users
    SET 
      encrypted_password = crypt('Admin@2026', gen_salt('bf')),
      email_confirmed_at = COALESCE(email_confirmed_at, now()),
      confirmation_token = COALESCE(confirmation_token, ''),
      recovery_token = COALESCE(recovery_token, ''),
      email_change_token_new = COALESCE(email_change_token_new, ''),
      email_change_token_current = COALESCE(email_change_token_current, ''),
      email_change = COALESCE(email_change, ''),
      phone_change = COALESCE(phone_change, ''),
      phone_change_token = COALESCE(phone_change_token, ''),
      reauthentication_token = COALESCE(reauthentication_token, ''),
      raw_app_meta_data = '{"provider":"email","providers":["email"]}'::jsonb,
      raw_user_meta_data = '{"first_name":"Divyanshi","last_name":"Admin","role":"admin","company":"SOFT 3D Spółka z o.o."}'::jsonb,
      updated_at = now()
    WHERE id = v_user_id;
  END IF;

  -- 2. Ensure auth.identities entry exists
  DELETE FROM auth.identities WHERE user_id = v_user_id;
  INSERT INTO auth.identities (
    id,
    user_id,
    identity_data,
    provider,
    provider_id,
    last_sign_in_at,
    created_at,
    updated_at
  ) VALUES (
    v_user_id::text,
    v_user_id,
    json_build_object('sub', v_user_id::text, 'email', 'divyanshiasp1290@gmail.com')::jsonb,
    'email',
    v_user_id::text,
    now(),
    now(),
    now()
  );

  -- 3. Ensure profile exists with administrator role
  INSERT INTO public.profiles (
    id,
    email,
    first_name,
    last_name,
    company,
    role,
    is_active,
    updated_at
  ) VALUES (
    v_user_id,
    'divyanshiasp1290@gmail.com',
    'Divyanshi',
    'Admin',
    'SOFT 3D Spółka z o.o.',
    'admin',
    true,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    first_name = EXCLUDED.first_name,
    last_name = EXCLUDED.last_name,
    company = EXCLUDED.company,
    role = 'admin',
    is_active = true,
    updated_at = now();

END $$;
