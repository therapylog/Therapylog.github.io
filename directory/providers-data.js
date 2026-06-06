// ============================================================
//  THERAPYLOG PARTNER DIRECTORY — DATA FILE
// ============================================================
//
//  TO ADD A PARTNER:
//  1. Use the generator tool (add-partner.html) — fill the form,
//     copy the output, paste it below. (Easiest — no hand-coding.)
//  2. Or copy the template block and fill it in manually.
//
//  KEY FIELDS:
//    types        = array of categories — a business can be MORE THAN ONE.
//                   Options: "clinic", "retailer", "coach"
//                   e.g. a men's clinic that sells peptides = ["clinic","retailer"]
//    typeLabel    = the text shown under the name (free-form)
//    tier         = "featured" (top) | "verified" (badge) | "basic" (no badge)
//    services     = array of tags shown on the card
//    refCode      = their affiliate referral code (for ?ref= links)
//
//  Pricing note: one listing fee per business regardless of how many
//  categories/services they offer. The TIER sets the price, not the
//  number of services.
//
//  Then commit this file to GitHub. The directory updates automatically.
//
// ------------------------------------------------------------
//  TEMPLATE — copy to add a new partner manually:
// ------------------------------------------------------------
//  {
//    id: "unique-slug",
//    name: "Business Name",
//    types: ["clinic", "retailer"],
//    typeLabel: "Men's Clinic + Peptide Supplier",
//    tier: "verified",
//    location: "City, State  —  or  Nationwide / Online",
//    description: "One or two sentences covering everything they offer.",
//    services: ["TRT", "Peptides", "Bloodwork"],
//    products: "BPC-157, TB-500 (optional)",
//    website: "https://example.com",
//    storeUrl: "https://example.com/shop",
//    email: "contact@example.com",
//    phone: "+1 (555) 000-0000",
//    icon: "🏥",
//    verifiedItems: ["License Verified", "COA Verified"],
//    refCode: "examplecode",
//    joined: "2026-06"
//  },
// ------------------------------------------------------------

const PARTNERS = [

  // ⬇⬇⬇  ADD YOUR APPROVED PARTNERS BELOW THIS LINE  ⬇⬇⬇

  // ---- EXAMPLE ENTRIES (delete once you add real partners) ----
  {
    id: "example-clinic-peptides",
    name: "Example Men's Health & Peptides",
    types: ["clinic", "retailer"],
    typeLabel: "Men's Clinic + Peptide Supplier",
    tier: "featured",
    location: "Austin, TX · Telehealth nationwide",
    description: "Full-service men's health clinic offering physician-supervised TRT plus an in-house peptide pharmacy with third-party COAs.",
    services: ["TRT", "HRT", "Peptides", "Bloodwork", "Telehealth"],
    products: "Testosterone, BPC-157, TB-500, Semaglutide, CJC-1295",
    website: "https://example.com",
    storeUrl: "https://example.com/shop",
    email: "hello@example.com",
    phone: "+1 (555) 123-4567",
    icon: "🏥",
    verifiedItems: ["License Verified", "DEA Registered", "COA Verified", "Product Tested"],
    refCode: "examplemensclinic",
    joined: "2026-06"
  },
  {
    id: "example-peptide-co",
    name: "Example Peptide Co.",
    types: ["retailer"],
    typeLabel: "Peptide Supplier",
    tier: "verified",
    location: "Nationwide / Online",
    description: "Research-grade peptides with third-party COAs on every batch. Fast, reliable U.S. shipping.",
    services: ["Peptides", "GLP-1", "Research Compounds"],
    products: "BPC-157, TB-500, CJC-1295, Ipamorelin, Semaglutide, Tirzepatide",
    website: "https://example.com",
    storeUrl: "https://example.com/shop",
    email: "hello@example.com",
    phone: "",
    icon: "⚗️",
    verifiedItems: ["COA Verified", "Product Tested", "Reliable Shipping"],
    refCode: "examplepeptide",
    joined: "2026-06"
  },
  {
    id: "example-coach",
    name: "Example Performance Coaching",
    types: ["coach", "retailer"],
    typeLabel: "ISSA Coach + Peptide Supplier",
    tier: "verified",
    location: "Online / Worldwide",
    description: "IFBB Pro coach specializing in contest prep and body recomposition, with a vetted peptide supply line for clients.",
    services: ["Coaching", "Contest Prep", "Nutrition", "Peptides"],
    products: "",
    website: "https://example-coach.com",
    storeUrl: "https://example-coach.com/coaching",
    email: "coach@example-coach.com",
    phone: "",
    icon: "💪",
    verifiedItems: ["Certified (ISSA)", "IFBB Pro", "Client Results Verified", "COA Verified"],
    refCode: "examplecoach",
    joined: "2026-06"
  },
  // ---- END EXAMPLE ENTRIES ----

  // ⬆⬆⬆  ADD YOUR APPROVED PARTNERS ABOVE THIS LINE  ⬆⬆⬆

];

// Make available to the directory page
if (typeof window !== 'undefined') { window.PARTNERS = PARTNERS; }
