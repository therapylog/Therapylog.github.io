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

  // ---- No live partners yet. ----
  // The three worked examples that used to sit here rendered on the public
  // /directory page as real listings, carrying verification and DEA markers on
  // an example peptide supplier. Clearly-labelled placeholder data in the source
  // is still a published endorsement once directory/index.html reads
  // window.PARTNERS.
  // The template block above the ADD-PARTNERS line shows the shape; keep new
  // examples commented out.
  //
  // Before adding a real partner, read docs/COMPLIANCE-AUDIT.md C-1. In short:
  // the verification standard has to be published and actually performed, paid
  // placement has to be disclosed as paid, and no listing fee or commission may
  // vary with referral volume (EKRA, 18 U.S.C. 220, reaches cash-pay lab
  // referrals).

  // ⬆⬆⬆  ADD YOUR APPROVED PARTNERS ABOVE THIS LINE  ⬆⬆⬆

];

// Make available to the directory page
if (typeof window !== 'undefined') { window.PARTNERS = PARTNERS; }
