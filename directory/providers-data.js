// ============================================================
//  THERAPYLOG PARTNER DIRECTORY — DATA FILE
// ============================================================
//
//  TO ADD A PARTNER:
//  1. Use the generator tool (add-partner.html) to create the entry, OR
//  2. Copy the template block below, fill it in, and paste it into the
//     PARTNERS array. Keep the comma between entries.
//
//  TIERS:  "featured" = top placement + spotlight
//          "verified" = verified badge + priority
//          "basic"    = standard listing, no badge
//
//  TYPES:  "clinic" | "retailer" | "coach"
//
//  Then commit this file to GitHub. The directory updates automatically.
//
// ------------------------------------------------------------
//  TEMPLATE — copy this to add a new partner:
// ------------------------------------------------------------
//  {
//    id: "unique-slug",
//    name: "Business Name",
//    type: "retailer",
//    typeLabel: "Peptide Supplier",
//    tier: "verified",
//    location: "City, State  —  or  Nationwide / Online",
//    description: "One or two sentences about the business.",
//    services: ["Peptides", "GLP-1", "TRT"],
//    products: "BPC-157, TB-500, Semaglutide (optional)",
//    website: "https://example.com",
//    storeUrl: "https://example.com/shop",
//    email: "contact@example.com",
//    phone: "+1 (555) 000-0000",
//    icon: "⚗️",
//    verifiedItems: ["COA Verified", "License Verified"],
//    joined: "2026-06"
//  },
// ------------------------------------------------------------

const PARTNERS = [

  // ⬇⬇⬇  ADD YOUR APPROVED PARTNERS BELOW THIS LINE  ⬇⬇⬇

  // ---- EXAMPLE ENTRIES (delete these once you add real partners) ----
  {
    id: "example-peptide-co",
    name: "Example Peptide Co.",
    type: "retailer",
    typeLabel: "Peptide Supplier",
    tier: "featured",
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
    joined: "2026-06"
  },
  {
    id: "example-trt-clinic",
    name: "Example Men's Health Clinic",
    type: "clinic",
    typeLabel: "TRT / Men's Health",
    tier: "verified",
    location: "Austin, TX  ·  Telehealth nationwide",
    description: "Physician-supervised testosterone and hormone optimization with comprehensive bloodwork.",
    services: ["TRT", "HRT", "Peptides", "Bloodwork"],
    products: "",
    website: "https://example-clinic.com",
    storeUrl: "https://example-clinic.com",
    email: "info@example-clinic.com",
    phone: "+1 (555) 123-4567",
    icon: "🏥",
    verifiedItems: ["License Verified", "Board Certified", "DEA Registered"],
    joined: "2026-06"
  },
  {
    id: "example-coach",
    name: "Example Performance Coaching",
    type: "coach",
    typeLabel: "Performance Coach",
    tier: "verified",
    location: "Online / Worldwide",
    description: "IFBB Pro coach specializing in contest prep, body recomposition, and evidence-based programming.",
    services: ["Bodybuilding Prep", "Online Coaching", "Nutrition"],
    products: "",
    website: "https://example-coach.com",
    storeUrl: "https://example-coach.com/coaching",
    email: "coach@example-coach.com",
    phone: "",
    icon: "💪",
    verifiedItems: ["Certified (NASM)", "IFBB Pro", "Client Results Verified"],
    joined: "2026-06"
  },
  // ---- END EXAMPLE ENTRIES ----

  // ⬆⬆⬆  ADD YOUR APPROVED PARTNERS ABOVE THIS LINE  ⬆⬆⬆

];

// Make available to the directory page
if (typeof window !== 'undefined') { window.PARTNERS = PARTNERS; }
