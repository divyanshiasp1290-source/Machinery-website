export const industrySolutions = [
  {
    id: 'aerospace-defense',
    title: 'Aerospace & Defense',
    tagline: 'Flight-Ready Polymers & High-Strength Metal Replacement',
    description: 'Reduce aircraft weight and replace long-lead-time titanium brackets with certified PEEK, PEKK, and ULTEM 9085 additive components. Fully compliant with FAR 25.853 flame, smoke, and toxicity standards.',
    image: '/images/solutions/sol_aerospace.jpg',
    stats: [
      { label: 'Weight Reduction', value: 'Up to 60%' },
      { label: 'Lead Time Cut', value: '14 Weeks -> 4 Days' },
      { label: 'Compliance', value: 'FAR 25.853 FST' }
    ],
    applications: [
      'Interior cabin ducting & air management components',
      'Electronic sensor housings and lightweight brackets',
      'Drone airframe structures and propeller spars',
      'Specialized maintenance & overhaul (MRO) ground fixtures'
    ],
    recommendedMachines: ['intamsys-funmat-pro-610-ht', 'formlabs-fuse-1-plus-30w']
  },
  {
    id: 'automotive-motorsport',
    title: 'Automotive & Motorsport',
    tagline: 'Trackside Prototyping, Jigs, Fixtures & Custom Aerodynamics',
    description: 'Accelerate lap times and streamline vehicle assembly lines. Fabricate carbon-fiber reinforced end-use air ducts, rapid wind tunnel models, and custom welding fixtures overnight.',
    image: '/images/solutions/sol_automotive.jpg',
    stats: [
      { label: 'Cost Per Jig', value: '-75% vs CNC' },
      { label: 'Turnaround Time', value: '< 24 Hours' },
      { label: 'Max Temperature', value: '250°C Engine Bay' }
    ],
    applications: [
      'Brake cooling ducts and custom aerodynamic splitters',
      'Ergonomic shop-floor robotic gripper fingers (EOAT)',
      'Assembly alignment jigs with embedded steel bushings',
      'Full-scale interior cockpit and dashboard validation mockups'
    ],
    recommendedMachines: ['raise3d-pro3-plus', 'modix-big-120z', 'freescan-combo-scanner']
  },
  {
    id: 'manufacturing-tooling',
    title: 'Manufacturing & Tooling',
    tagline: 'On-Demand Bridge Tooling, Rapid Molds & Production Line Jigs',
    description: 'Transform traditional factory operations with digital inventory. Prevent expensive production line stoppages by 3D printing custom replacement gears, nests, and thermoforming molds within hours.',
    image: '/images/solutions/sol_tooling.jpg',
    stats: [
      { label: 'Uptime Gain', value: '+99.2%' },
      { label: 'Tool Weight Reduction', value: '45%' },
      { label: 'ROI Payback', value: '< 3 Months' }
    ],
    applications: [
      'Vacuum thermoforming and silicone casting mold cores',
      'End-of-arm robotic tooling (EOAT) with internal air channels',
      'Go/No-Go quality inspection gauges and metrology nests',
      'Low-volume short-run functional replacement parts'
    ],
    recommendedMachines: ['creatbot-d600-pro-2', 'formlabs-fuse-1-plus-30w']
  },
  {
    id: 'medical-dental',
    title: 'Medical & Dental',
    tagline: 'Biocompatible Patient-Specific Guides & Class IIa Devices',
    description: 'Sterilizable surgical cutting guides, dental aligner models, and patient-tailored prosthetic sockets engineered with ISO 10993 and USP Class VI biocompatible certified resins and laser sintered nylon.',
    image: '/images/solutions/sol_medical_v2.jpg',
    stats: [
      { label: 'Surgical Prep Time', value: '-35%' },
      { label: 'Resolution', value: 'Sub-50 Microns' },
      { label: 'Certification', value: 'ISO 13485 & 10993' }
    ],
    applications: [
      'Autoclavable surgical drill templates and osteotomy guides',
      'Orthodontic dental study models and clear aligner masters',
      'Ergonomic prosthetics with custom lattice shock absorption',
      'Microfluidic diagnostic chips with optical clarity'
    ],
    recommendedMachines: ['formlabs-form-4b', 'formlabs-fuse-1-plus-30w']
  }
];

export const valueProps = [
  {
    title: 'UK Certified Technical Engineers',
    description: 'Direct access to factory-certified additive manufacturing specialists who install, calibrate, and service machines on your factory floor.',
    icon: 'Wrench'
  },
  {
    title: 'Consultative 3D Printing Audit',
    description: 'We evaluate your CAD drawings and parts catalogue to determine ROI, material suitability, and cycle-time savings before you invest.',
    icon: 'ClipboardCheck'
  },
  {
    title: 'Comprehensive UK Spare Parts & Consumables',
    description: 'Over 2,000 SKUs held in our UK logistics warehouse for guaranteed next-day dispatch to keep your production lines running.',
    icon: 'PackageCheck'
  },
  {
    title: 'Bespoke Turnkey Integration',
    description: 'Full end-to-end deployment including ventilation, material drying, post-processing wash/cure stations, and staff training.',
    icon: 'Settings'
  },
  {
    title: 'Metrology & Benchmark Part Testing',
    description: 'Send us your challenging CAD model; we will 3D print benchmark specimens and provide dimensional CMM inspection reports prior to purchase.',
    icon: 'Scan'
  },
  {
    title: 'Flexible Business Finance & Leasing',
    description: 'Tax-efficient capital equipment leasing and hire purchase options tailored for UK manufacturing businesses and educational institutions.',
    icon: 'ShieldCheck'
  }
];
