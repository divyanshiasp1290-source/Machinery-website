export const blogs = [
  {
    id: 1,
    slug: 'large-format-pellet-extrusion-tooling',
    title: 'How Large-Format Pellet 3D Printing (LFAM) Cuts Tooling Costs by 75%',
    category: 'Case Studies',
    tag: 'Large Format (LFAM)',
    date: '18 May 2024',
    readTime: '6 min read',
    author: 'Callum Wright',
    authorRole: 'Senior Additive Applications Specialist',
    image: '/images/spotlight/lfam_pellet_extrusion.jpg',
    summary: 'Direct pellet extrusion eliminates filament processing costs while accelerating deposit rates up to 5kg/hour for automotive and composite autoclave mandrels.',
    content: `
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
    `
  },
  {
    id: 2,
    slug: 'replacing-cnc-titanium-with-carbon-peek',
    title: 'Replacing CNC Milled Titanium with Carbon-PEEK in Aerospace Ducting',
    category: 'Materials Science',
    tag: 'High-Temperature',
    date: '02 May 2024',
    readTime: '8 min read',
    author: 'Dr. Alistair Vance',
    authorRole: 'Aerospace Materials Consultant',
    image: '/images/solutions/sol_aerospace.jpg',
    summary: 'How high-temperature additive manufacturing with 300°C chamber heating enables lightweight aerospace structural brackets with UL94 V-0 flame certification.',
    content: `
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
    `
  },
  {
    id: 3,
    slug: 'metrology-3d-scanning-automotive-inspection',
    title: 'Metrology 3D Scanning for Automated Automotive Quality Inspection',
    category: 'Quality Control',
    tag: '3D Scanning',
    date: '21 April 2024',
    readTime: '5 min read',
    author: 'Sarah Jenkins',
    authorRole: 'Metrology Systems Director',
    image: '/images/services/serv_metrology_inspection.jpg',
    summary: 'Replacing traditional contact probe CMMs with 26-laser handheld blue optical metrology scanners for 100% surface deviation heat maps.',
    content: `
### Moving Beyond Slow Coordinate Measuring Machines (CMMs)
Standard tactile probe CMMs remain the industry standard for specific critical hole diameters, but they suffer from severe throughput constraints and provide zero visual feedback on complex freeform body panel curvatures.

### Blue Laser Scanning in Action
By deploying the Shining 3D FreeScan UE Pro metrology scanner:
1. **Speed**: Captures 1,850,000 points per second across shiny stamped sheet metal without spray matting agents.
2. **Volumetric Accuracy**: Up to 0.02mm + 0.015mm/m traceable to VDI/VDE 2634 Part 3 standards.
3. **Automated Heat Maps**: Geomagic Control X generates 3D colour deviation reports comparing as-manufactured parts directly against master CAD within 90 seconds.

### Case Study Outcome
Inspection cycle times for automotive stamped suspension subframes decreased from 45 minutes per part to 6 minutes, permitting 100% line inspection instead of 5% statistical sampling.
    `
  },
  {
    id: 4,
    slug: 'sls-powder-bed-batch-production',
    title: 'Selective Laser Sintering (SLS): When to Scale from FDM to Powder Bed',
    category: 'Technology Comparison',
    tag: 'SLS Powder',
    date: '11 April 2024',
    readTime: '7 min read',
    author: 'Callum Wright',
    authorRole: 'Senior Additive Applications Specialist',
    image: '/images/categories/cat_sls_powder.jpg',
    summary: 'A technical and financial breakdown of transitioning from support-constrained FDM printing to high-density 3D nesting SLS powder production.',
    content: `
### Support Constraints in Additive Manufacturing
Filament-based FDM/FFF printing is peerless for large, relatively straightforward geometry. However, when manufacturing intricate electronic enclosures with undercuts, deep channels, and internal snap-fits, manual support removal consumes significant labour.

### The SLS Powder Advantage
SLS (Selective Laser Sintering) employs a bed of unsintered PA12 or PA11 nylon powder that acts as continuous self-support:
- **Infinite Geometric Freedom**: Internal lattice dampers, enclosed fluidic channels, and pre-assembled mechanical linkages print without support structures.
- **3D Nesting Capacity**: Stack hundreds of small parts in all three dimensions throughout the entire vertical build cylinder.
- **Isotropic Mechanical Strength**: SLS components exhibit nearly identical mechanical characteristics across X, Y, and Z axes, avoiding interlaminar delamination risks.

### Financial Crossover Point
At batch volumes between 50 and 5,000 components, SLS demonstrates lower per-part costs than injection moulding tooling and lower labour cost than FDM printing.
    `
  },
  {
    id: 5,
    slug: 'moisture-control-engineering-filaments-drywise',
    title: 'Moisture Control in Engineering Filaments: Why Inline Drying is Crucial',
    category: 'Technical Guides',
    tag: 'Materials & Ancillaries',
    date: '29 March 2024',
    readTime: '4 min read',
    author: 'Marcus Reid',
    authorRole: 'Materials Science Lead',
    image: '/images/products/prod_drywise_dryer.jpg',
    summary: 'Hygroscopic polymers like PA-CF, PEEK, and TPU degrade within 2 hours of ambient air exposure. Here is how inline active drying guarantees zero voids.',
    content: `
### The Hidden Saboteur: Moisture Absorption
Technical polymers such as Polyamide (Nylon), Carbon-reinforced Nylon, and Thermoplastic Polyurethane (TPU) are aggressively hygroscopic. At 50% relative humidity, a fresh spool of PA-CF can absorb 2% moisture by weight in less than 3 hours.

### What Happens Inside the Nozzle
When moist filament enters a 260°C - 300°C melt zone:
1. Absorbed water flash-boils into steam bubbles instantly.
2. The expanding steam causes characteristic popping and uneven extrusion flow.
3. Microscopic steam voids remain trapped in the extruded bead, causing severe tensile strength degradation of up to 45%.

### The Solution: Active Inline Filament Conditioning
Traditional convection drying ovens require 8 to 24 hours of pre-baking. In contrast, the Drywise inline active drying system dries the filament in real-time immediately before it enters the extruder, delivering calibrated <0.05% moisture content straight to the nozzle.
    `
  },
  {
    id: 6,
    slug: 'rapid-marine-prototyping-modix-big',
    title: 'Case Study: Full-Scale Marine Hull Prototyping with Modix BIG-120X',
    category: 'Case Studies',
    tag: 'Maritime',
    date: '14 March 2024',
    readTime: '6 min read',
    author: 'Callum Wright',
    authorRole: 'Senior Additive Applications Specialist',
    image: '/images/categories/cat_large_format.jpg',
    summary: 'A Portsmouth naval design firm reduced physical towing tank prototype build times from 3 months to 9 days using meter-scale 3D printing.',
    content: `
### The Challenge: Hydrodynamic Validation at Scale
Naval architects testing novel high-efficiency bulbous bow geometries required full-dimension 1.2-metre test hulls for tow-tank hydrodynamic turbulence validation. Hand-shaping foam blanks and applying fiberglass reinforcement took weeks and introduced human dimensional discrepancies.

### The Additive Approach
Deploying the Modix BIG-120X with its 1,200 x 600 x 640 mm build envelope enabled printing the hull section in one contiguous block using high-impact PETG-CF.

### Results & Verification
- **Build Time**: 76 continuous print hours using a 1.0mm volcano nozzle.
- **Accuracy**: Checked with blue laser scanning to ensure within ±0.35mm across the entire 1.2m length.
- **Cost**: £210 in raw materials versus £4,800 quoted by external patternmakers.
    `
  }
];

export const blogCategories = [
  'All Articles',
  'Case Studies',
  'Materials Science',
  'Quality Control',
  'Technology Comparison',
  'Technical Guides'
];
