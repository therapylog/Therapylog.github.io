/* Marker guide — the narrative layer for the 100 lab markers.
 *
 * MARKER_REGISTRY in app.html is a PARSING layer: LOINC codes, aliases, unit
 * conversions, assay-method notes. It exists so the scanner can recognise
 * "Testosterone, Serum" on a PDF and convert nmol/L to ng/dL. LAB_REF adds
 * reference and optimal bands. Between them they can tell a user their
 * hematocrit is above range — and nothing about what that means or what to do,
 * which is the actual question.
 *
 * That gap is why lab questions were the second-largest category going to the
 * paid assistant behind compounds. Every entry here is an answer the app can
 * give for free, forever, offline.
 *
 * Depth is deliberately uneven. The markers on every hormone panel get the
 * same treatment a compound gets; MPV and basophils get an honest paragraph.
 * Padding a marker nobody asks about to match the length of one everybody asks
 * about would make the reference worse, not more comprehensive.
 *
 * Field notes:
 *   what     — what the number measures
 *   why      — why it matters on hormone therapy specifically, not in general
 *   read     — how to interpret the value; where lab-normal and optimal differ
 *   high/low — what drives it each way and what is usually done about it
 *   pitfall  — what invalidates the result. This field earns its place: most
 *              "my labs are crazy" questions are a draw-timing or assay
 *              problem, not a physiological one, and saying so costs nothing.
 *   related  — other markers that must be read alongside it
 *
 * Standing framing: these describe what is commonly done and what the
 * literature reports. They are not instructions, and every entry that could be
 * read as one says so. Ranges vary by lab; a single out-of-range value is a
 * reason to look closer, not a diagnosis.
 */
module.exports = {

  /* ---------------- hormones ---------------- */

  tott: {
    what: 'Total testosterone — all testosterone in serum, both the fraction bound to SHBG and albumin and the small free fraction.',
    why: 'The headline number on TRT, and the one most people fixate on. It is also the least informative of the three testosterone measures on its own, because most of what it counts is bound and biologically unavailable.',
    read: 'Most labs run roughly 264–916 ng/dL for adult men. Treated men are commonly targeted into the upper half. What matters more than the absolute number is where it sits relative to your free testosterone and SHBG, and whether symptoms track it. A total of 900 with SHBG of 80 can feel worse than a total of 550 with SHBG of 25.',
    high: 'On TRT, usually dose, injection frequency or draw timing rather than anything pathological. Supraphysiologic totals raise hematocrit and estradiol conversion. If genuinely high off-treatment, an androgen-secreting source is the rare consideration.',
    low: 'Untreated low total testosterone splits into primary (testicular — LH and FSH high) and secondary (pituitary/hypothalamic — LH and FSH low or inappropriately normal). That distinction changes the treatment entirely, which is why LH and FSH belong on the same panel. On TRT, a low total means dose, absorption, injection technique or an ester-timing artifact.',
    pitfall: 'Draw timing dominates. Testosterone peaks in the morning, so a same-day comparison against a previous afternoon draw is not a real change. On injections, trough (immediately before the next dose) is the standard comparison point — a peak draw two days post-injection will read dramatically higher and means nothing without saying so. Immunoassay and LC-MS/MS diverge; do not trend across a method switch.',
    related: ['freet', 'shbg', 'e2', 'lh', 'fsh', 'bioavailt']
  },

  freet: {
    what: 'Free testosterone — the small unbound fraction, typically 1–3% of total, that is immediately available to tissue.',
    why: 'Symptoms track free testosterone far better than total. This is the number that explains why two people with identical totals feel completely different.',
    read: 'Roughly 50–210 pg/mL by direct assay in adult men, though ranges vary widely by method. Calculated free T (Vermeulen equation, from total T, SHBG and albumin) is generally considered more reliable than direct analog immunoassay, which is known to be inaccurate. If your lab reports a direct free T, treat it as approximate.',
    high: 'Usually low SHBG rather than high total. High free T with a normal total is the classic low-SHBG picture and can produce androgenic side effects — oily skin, acne, shedding — at a total that looks unremarkable.',
    low: 'High SHBG binding it up, or genuinely low total. Low free T with a high-normal total is the most common reason someone feels untreated on paper-adequate TRT. Addressing SHBG (or dosing pattern) matters more than raising the dose here.',
    pitfall: 'Direct analog free T assays are poorly standardised and can be materially wrong. If a result contradicts symptoms, ask whether the lab calculated it or measured it, and get SHBG and albumin so it can be calculated.',
    related: ['tott', 'shbg', 'bioavailt']
  },

  bioavailt: {
    what: 'Bioavailable testosterone — the free fraction plus the loosely albumin-bound fraction, which also dissociates readily at tissue.',
    why: 'Arguably the most physiologically meaningful of the three testosterone measures, since albumin-bound testosterone is functionally available even though it is not free.',
    read: 'Typically reported around 110–575 ng/dL in adult men. Read it the same way as free testosterone: relative to symptoms rather than against a population range.',
    high: 'Same drivers as high free testosterone — usually low SHBG or a high dose.',
    low: 'High SHBG or low total. Same reasoning as free testosterone.',
    pitfall: 'Requires albumin to calculate. If albumin was not drawn, the number is an assumption.',
    related: ['tott', 'freet', 'shbg', 'albumin']
  },

  shbg: {
    what: 'Sex hormone binding globulin — the liver-made protein that binds testosterone and estradiol tightly and controls how much stays free.',
    why: 'The single most useful modifier on any hormone panel, and the most commonly ignored. SHBG is why the same dose produces completely different free levels in different people.',
    read: 'Roughly 10–57 nmol/L in adult men. Low SHBG means more free hormone per unit of total and often suits less frequent dosing; high SHBG means the opposite and frequently responds to more frequent, smaller injections. Neither is a disease by itself.',
    high: 'Thyroid excess, liver disease, oestrogen, ageing, low body fat, some anticonvulsants, and calorie restriction. High SHBG blunts free testosterone and is a common reason someone feels flat despite a strong total.',
    low: 'Insulin resistance and metabolic syndrome are the big ones — low SHBG is a recognised marker of insulin resistance and worth taking seriously as a metabolic signal, not just a dosing variable. Also obesity, androgen use, hypothyroidism, and glucocorticoids.',
    pitfall: 'Genuinely low SHBG makes total testosterone look deceptively adequate and free testosterone look alarming. Reading either in isolation gives the wrong answer.',
    related: ['tott', 'freet', 'insulin', 'e2']
  },

  e2: {
    what: 'Estradiol (E2) — the primary oestrogen, produced in men mainly by aromatisation of testosterone in fat and other tissue.',
    why: 'Necessary, not an enemy. Estradiol drives libido, erectile function, bone density, joint comfort and mood in men. Both ends of the range cause problems, and crashing it is generally worse than running it a little high.',
    read: 'In men, use a sensitive assay (LC-MS/MS); the standard immunoassay is designed for female ranges and reads unreliably at male concentrations. Sensitive male ranges typically run about 8–35 pg/mL, but treated men often sit above that and feel fine. The ratio to testosterone and the presence of symptoms matter far more than the number.',
    high: 'Higher testosterone dose, more body fat (more aromatase), alcohol, and some compounds. Symptoms worth acting on are water retention, nipple sensitivity, emotional lability and blood pressure. An elevated number with no symptoms is usually not a reason to medicate.',
    low: 'Aromatase inhibitors are the usual cause, and over-suppression is common and unpleasant — joint pain, dry joints, dead libido, anhedonia, and long-term bone density loss. Crashed E2 often gets mistaken for low testosterone.',
    pitfall: 'Assay choice is the single biggest source of confusion here. A non-sensitive immunoassay in a man can read substantially high and trigger unnecessary AI use. Confirm which assay was run before acting on the number.',
    related: ['tott', 'shbg', 'estrone']
  },

  lh: {
    what: 'Luteinising hormone — the pituitary signal that tells the testes to produce testosterone.',
    why: 'Splits low testosterone into primary and secondary, which is the fork that determines treatment. Also the marker that shows how suppressed you are and how recovery is going.',
    read: 'Roughly 1.7–8.6 IU/L in adult men. On exogenous testosterone, expect it near zero — that is the expected pharmacology, not a finding. Off treatment, a low or normal LH with low testosterone points to a pituitary/hypothalamic cause; a high LH with low testosterone points to the testes.',
    high: 'Primary testicular failure, or the rebound during a SERM-based restart. Clomiphene and enclomiphene raise LH deliberately.',
    low: 'Exogenous testosterone (expected), and otherwise pituitary suppression from prolactin excess, opioids, glucocorticoids, severe stress or energy deficit.',
    pitfall: 'Measuring LH while on TRT tells you almost nothing except that the TRT is working as designed. It is informative before treatment and during a restart, not during steady-state therapy.',
    related: ['fsh', 'tott', 'prolactin']
  },

  fsh: {
    what: 'Follicle-stimulating hormone — the pituitary signal driving Sertoli cell function and sperm production.',
    why: 'The fertility half of the pituitary picture. Read with LH.',
    read: 'Roughly 1.5–12.4 IU/L in adult men. Suppressed on exogenous testosterone, like LH.',
    high: 'Primary testicular failure, particularly with impaired spermatogenesis. An isolated high FSH with normal testosterone can indicate Sertoli-cell damage with intact Leydig function.',
    low: 'Exogenous androgens, or the same pituitary causes as low LH.',
    pitfall: 'Same as LH — near-zero on TRT is expected and not a result to act on. If fertility is the concern, a semen analysis answers the question that FSH only gestures at.',
    related: ['lh', 'tott']
  },

  prolactin: {
    what: 'Prolactin — a pituitary hormone that, when elevated in men, suppresses the gonadal axis and blunts sexual function.',
    why: 'A specific, treatable cause of dead libido and erectile trouble that gets misattributed to estradiol constantly. Also the marker to check before escalating AI use for symptoms that are actually prolactin-driven.',
    read: 'Roughly 4–15 ng/mL in adult men. Mild elevation is common and often benign; substantial elevation warrants investigation rather than immediate treatment.',
    high: '19-nor compounds (nandrolone, trenbolone) are the common cause in this population. Otherwise: prolactinoma, hypothyroidism, antipsychotics and some antidepressants, stress, and recent nipple stimulation. Persistent unexplained elevation warrants pituitary imaging rather than empirical dopamine agonist use.',
    low: 'Rarely clinically significant on its own.',
    pitfall: 'Prolactin rises with stress, sleep, food and even the venepuncture itself. A single mildly high result should be repeated, fasting and rested, before anyone treats it. Macroprolactin — a biologically inactive complex — can also produce a falsely high result and is worth excluding.',
    related: ['tott', 'e2', 'tsh']
  },

  dht: {
    what: 'Dihydrotestosterone — a more potent androgen converted from testosterone by 5-alpha reductase in skin, prostate and hair follicles.',
    why: 'Drives the androgenic side of therapy: libido and erectile function on one side, hair loss, acne and prostate growth on the other. Explains why two people at the same testosterone level have very different side effect profiles.',
    read: 'Roughly 30–85 ng/dL in adult men, and it rises proportionally on TRT. Transdermal delivery raises it disproportionately because skin is rich in 5-alpha reductase.',
    high: 'Transdermal testosterone, high total testosterone, and individual 5AR activity. Associated with shedding in genetically susceptible people and with prostate symptoms.',
    low: 'Finasteride or dutasteride, which is the point of taking them. Very low DHT has its own costs — libido, erectile quality and mood are all reported to suffer in some people, and post-finasteride symptoms are a real and contested topic worth understanding before starting.',
    pitfall: 'Suppressing DHT to protect hair is a trade, not a free action. Understand both sides before committing.',
    related: ['tott', 'psa']
  },

  dheas: {
    what: 'DHEA sulphate — the adrenal androgen precursor, and the most stable measure of adrenal androgen output.',
    why: 'An upstream substrate for testosterone and oestrogen. Declines steadily with age and is a common supplement target.',
    read: 'Highly age-dependent — roughly 100–500 mcg/dL in adult men, falling substantially each decade. Compare against age-matched rather than the whole adult range.',
    high: 'Supplementation is the usual cause. Markedly high warrants exclusion of an adrenal source.',
    low: 'Ageing, chronic stress, adrenal insufficiency, and glucocorticoid use.',
    pitfall: 'DHEA-S is preferred over plain DHEA because it is far more stable through the day. Supplemental DHEA aromatises, so it can raise estradiol as well as testosterone.',
    related: ['cortam', 'tott', 'androstenedione']
  },

  cortam: {
    what: 'Morning cortisol — the adrenal stress hormone, measured at its daily peak.',
    why: 'Chronically elevated cortisol opposes much of what hormone therapy is for: it is catabolic, worsens insulin sensitivity, suppresses the gonadal axis and wrecks sleep. Low cortisol is a different and more urgent problem.',
    read: 'Roughly 6–23 mcg/dL drawn at 8am. Timing is not optional — cortisol falls through the day, so an afternoon draw against a morning range is meaningless.',
    high: 'Acute stress, illness, poor sleep, aggressive dieting, overtraining, and exogenous steroids. Genuinely and persistently high warrants investigation for Cushing syndrome.',
    low: 'Adrenal insufficiency is the concern, and it can be life-threatening. Suppression from exogenous glucocorticoids is the common cause. Persistently low morning cortisol with fatigue, low blood pressure and salt craving is a see-a-doctor finding, not a supplement problem.',
    pitfall: 'A single random cortisol is nearly uninterpretable. Draw it at 8am, note the time on the result, and understand that acute stress including a difficult blood draw will raise it.',
    related: ['cortisolpm', 'dheas', 'tott']
  },

  cortisolpm: {
    what: 'Afternoon or evening cortisol — the trough of the daily rhythm.',
    why: 'Read against the morning value it shows whether the diurnal curve is intact. A flattened curve is a more useful finding than either number alone.',
    read: 'Typically about half the morning value by late afternoon. A PM value close to the AM value suggests a flattened rhythm.',
    high: 'Disrupted sleep, shift work, chronic stress, late training, evening stimulants.',
    low: 'Expected — this is the trough.',
    pitfall: 'Only interpretable alongside a same-day morning draw and the exact collection times.',
    related: ['cortam']
  },

  progesterone: {
    what: 'Progesterone — present in men at low levels as a precursor, and a primary therapeutic hormone in female protocols.',
    why: 'Central to female hormone therapy and to cycle tracking. In men it is mostly a precursor, though it has some 5-alpha reductase inhibition and neurosteroid activity.',
    read: 'In men, typically under 1.4 ng/mL. In cycling women it varies enormously by cycle phase, so the phase must be recorded for the number to mean anything at all.',
    high: 'Supplementation, and in women the luteal phase.',
    low: 'In women, anovulation or the follicular phase. In men, rarely acted on in isolation.',
    pitfall: 'A progesterone level on a cycling woman without a cycle day attached is uninterpretable.',
    related: ['e2', 'pregnenolone']
  },

  estrone: {
    what: 'Estrone (E1) — a weaker oestrogen that interconverts with estradiol and is produced substantially in adipose tissue.',
    why: 'A reservoir that can convert back to estradiol, which is why oestrogen control sometimes fails to track estradiol alone, particularly at higher body fat.',
    read: 'Roughly 10–60 pg/mL in adult men. Rarely ordered and rarely necessary.',
    high: 'Higher body fat, higher aromatisation, oral oestrogen.',
    low: 'Aromatase inhibition.',
    pitfall: 'Not a first-line marker. Order it when the estradiol picture does not fit the symptoms, not routinely.',
    related: ['e2']
  },

  androstenedione: {
    what: 'Androstenedione — an adrenal and gonadal androgen precursor sitting upstream of both testosterone and oestrone.',
    why: 'Useful when working out whether an androgen excess is adrenal or gonadal in origin.',
    read: 'Roughly 40–150 ng/dL in adult men.',
    high: 'Adrenal hyperplasia, PCOS in women, supplementation, and adrenal tumours in rare cases.',
    low: 'Adrenal suppression, glucocorticoid use.',
    pitfall: 'Rises with the same stressors as other adrenal steroids; interpret with DHEA-S and cortisol rather than alone.',
    related: ['dheas', 'tott']
  },

  pregnenolone: {
    what: 'Pregnenolone — the most upstream steroid hormone, from which the rest of the steroid cascade is built.',
    why: 'Popular as a supplement on the theory that it lifts everything downstream. The evidence for that in practice is thin.',
    read: 'Assay standardisation is poor and reference ranges vary considerably between labs. Interpret cautiously.',
    high: 'Supplementation.',
    low: 'Statins, ageing, and glucocorticoid use are proposed contributors; the clinical significance of an isolated low value is not well established.',
    pitfall: 'Between weak assay standardisation and unclear clinical meaning, this is a marker that generates more concern than it resolves.',
    related: ['dheas', 'progesterone']
  },

  aldosterone: {
    what: 'Aldosterone — the adrenal hormone controlling sodium retention and, through it, blood volume and pressure.',
    why: 'Relevant when blood pressure rises on therapy and the usual explanations do not fit.',
    read: 'Highly posture- and sodium-dependent; usually interpreted as a ratio to renin rather than alone.',
    high: 'Primary hyperaldosteronism is an under-diagnosed and treatable cause of resistant hypertension, particularly with low potassium.',
    low: 'Adrenal insufficiency, some antihypertensives.',
    pitfall: 'Posture, sodium intake and several common blood pressure medications all shift it. Testing needs specific preparation to be meaningful — this is one to run with a physician rather than order independently.',
    related: ['potassium', 'sodium']
  },

  pth: {
    what: 'Parathyroid hormone — the primary regulator of calcium, working with vitamin D and the kidneys.',
    why: 'Read with calcium and vitamin D. Relevant to bone density, which matters on long-term hormone therapy.',
    read: 'Roughly 15–65 pg/mL. Never interpretable without a simultaneous calcium.',
    high: 'Primary hyperparathyroidism (with high calcium), or secondary to vitamin D deficiency or kidney disease (with normal or low calcium). The distinction matters.',
    low: 'Hypoparathyroidism, high calcium from another source.',
    pitfall: 'PTH without calcium drawn at the same time cannot be interpreted at all.',
    related: ['calcium', 'vitd', 'phos']
  },

  /* ---------------- CBC ---------------- */

  hct: {
    what: 'Hematocrit — the percentage of blood volume made up of red cells.',
    why: 'The most important safety marker on testosterone therapy. Testosterone stimulates erythropoiesis, and the resulting rise in hematocrit is the most common reason a TRT protocol has to be changed.',
    read: 'Roughly 38.3–48.6% in adult men. Many clinicians act above 52–54%; the exact threshold varies and the trend matters as much as the value. Rising steadily across draws is more concerning than one high reading.',
    high: 'Testosterone dose and delivery method — injections raise it more than gels. Also sleep apnoea (a major and frequently missed contributor), smoking, dehydration, altitude, and diuretics. Sustained elevation raises blood viscosity and thrombotic risk.',
    low: 'Bleeding, iron deficiency, chronic disease, over-frequent donation, and haemodilution. Low hematocrit on TRT is unusual enough to look for a separate cause.',
    pitfall: 'Dehydration inflates it — a draw after a fasted morning weights session with no water reads higher than reality. Hydrate normally before the draw. Also: a high hematocrit falsely lowers HbA1c, so metabolic screening becomes unreliable at the same time.',
    related: ['hgb', 'rbc', 'ferritin', 'hba1c']
  },

  hgb: {
    what: 'Haemoglobin — the oxygen-carrying protein in red cells, measured as concentration.',
    why: 'Moves with hematocrit and carries the same TRT-related meaning. Roughly a third of the hematocrit value.',
    read: 'Roughly 13.2–16.6 g/dL in adult men. Read alongside hematocrit rather than alone.',
    high: 'Same drivers as high hematocrit.',
    low: 'Anaemia from any cause. The MCV points at which kind — low suggests iron deficiency, high suggests B12 or folate.',
    pitfall: 'Same hydration caveat as hematocrit.',
    related: ['hct', 'rbc', 'mcv', 'ferritin']
  },

  rbc: {
    what: 'Red blood cell count — how many red cells per volume.',
    why: 'The third member of the red cell trio. Adds little beyond hematocrit and haemoglobin in this context.',
    read: 'Roughly 4.35–5.65 million/uL in adult men.',
    high: 'Same as hematocrit — testosterone-driven erythrocytosis being the common one here.',
    low: 'Anaemia, bleeding, marrow suppression.',
    pitfall: 'Interpret with the indices (MCV, MCH) rather than alone; the count says how many, not whether they are normal.',
    related: ['hct', 'hgb', 'mcv']
  },

  wbc: {
    what: 'White blood cell count — total circulating immune cells.',
    why: 'General screen for infection, inflammation and marrow problems.',
    read: 'Roughly 3.4–10.8 thousand/uL. The differential matters more than the total.',
    high: 'Infection, inflammation, stress, glucocorticoids, and hard recent exercise. Markedly and persistently high needs proper investigation.',
    low: 'Viral infection, some medications, marrow suppression, and autoimmune causes. Persistently low warrants follow-up.',
    pitfall: 'Rises transiently after intense training and with acute stress, including the draw itself.',
    related: ['neut', 'lymph', 'crp']
  },

  plt: {
    what: 'Platelet count — the cells responsible for clotting.',
    why: 'Relevant to bleeding and clotting risk, which matters alongside a raised hematocrit.',
    read: 'Roughly 150–450 thousand/uL.',
    high: 'Inflammation, iron deficiency, and marrow disorders. High platelets with a high hematocrit compounds thrombotic risk.',
    low: 'Some medications, liver disease, autoimmune destruction, and heavy alcohol use. Markedly low is a bleeding risk and needs prompt attention.',
    pitfall: 'Clumping in the tube produces a falsely low count; a repeat in a different tube type resolves it.',
    related: ['hct', 'mpv']
  },

  mcv: {
    what: 'Mean corpuscular volume — the average size of a red cell.',
    why: 'The most useful single index for working out what kind of anaemia is present.',
    read: 'Roughly 79–97 fL. Low is microcytic, high is macrocytic.',
    high: 'B12 or folate deficiency, alcohol, hypothyroidism, and some medications. Raised MCV is one of the more reliable quiet markers of heavy drinking.',
    low: 'Iron deficiency and thalassaemia trait.',
    pitfall: 'A normal MCV can hide combined deficiencies pulling in opposite directions — iron deficiency plus B12 deficiency can average out to normal.',
    related: ['hgb', 'ferritin', 'b12', 'folate']
  },

  neut: { what: 'Neutrophils — the percentage of white cells that are neutrophils, the first responders to bacterial infection.', why: 'The largest fraction of the differential; shifts point toward bacterial infection or stress.', read: 'Roughly 40–70% of white cells. The absolute count is more meaningful than the percentage.', high: 'Bacterial infection, stress, glucocorticoids, and acute exercise.', low: 'Viral infection, some drugs, and marrow suppression. A very low absolute neutrophil count is a genuine infection risk.', pitfall: 'Percentages shift when any other line changes; always read the absolute count alongside.', related: ['wbc', 'neutabs'] },

  lymph: { what: 'Lymphocytes — the percentage of white cells that are lymphocytes, the adaptive immune line.', why: 'Shifts opposite to neutrophils in most acute illness.', read: 'Roughly 20–45% of white cells.', high: 'Viral infection and some chronic conditions.', low: 'Acute stress, glucocorticoids, and some infections.', pitfall: 'Same percentage-versus-absolute caveat as neutrophils.', related: ['wbc', 'lymphabs'] },

  neutabs: { what: 'Absolute neutrophil count — neutrophils per volume rather than as a percentage.', why: 'The number that actually determines infection risk.', read: 'Roughly 1.4–7.0 thousand/uL. Below about 1.5 is neutropenia; below 0.5 is a serious infection risk.', high: 'Bacterial infection, stress, glucocorticoids.', low: 'Needs investigation, particularly if persistent. Benign ethnic neutropenia is common and harmless but is a diagnosis of exclusion.', pitfall: 'The percentage can look normal while the absolute count is low.', related: ['neut', 'wbc'] },

  lymphabs: { what: 'Absolute lymphocyte count — lymphocytes per volume.', why: 'More meaningful than the percentage for assessing immune status.', read: 'Roughly 0.7–3.1 thousand/uL.', high: 'Viral infection, some lymphoproliferative conditions.', low: 'Glucocorticoids, acute stress, and persistent low counts warrant investigation.', pitfall: 'Falls with acute stress including a difficult blood draw.', related: ['lymph', 'wbc'] },

  rdw: { what: 'Red cell distribution width — how variable red cell size is.', why: 'Rises early in developing deficiency, sometimes before the MCV moves, and is independently associated with cardiovascular outcomes.', read: 'Roughly 11.5–15.4%.', high: 'Mixed or developing deficiency, recent bleeding, and recovering anaemia. A high RDW with a normal MCV suggests something is changing.', low: 'Not clinically significant.', pitfall: 'Frequently ignored, though it is one of the more useful early signals on a CBC.', related: ['mcv', 'ferritin'] },

  mch: { what: 'Mean corpuscular haemoglobin — average haemoglobin content per red cell.', why: 'Tracks with MCV and adds modest resolution to anaemia classification.', read: 'Roughly 26.6–33.0 pg.', high: 'Macrocytic anaemia.', low: 'Iron deficiency, thalassaemia.', pitfall: 'Rarely adds anything beyond MCV.', related: ['mcv', 'mchc'] },

  mchc: { what: 'Mean corpuscular haemoglobin concentration — haemoglobin concentration within red cells.', why: 'Mostly a quality-control index; genuine abnormalities are uncommon.', read: 'Roughly 31.5–35.7 g/dL.', high: 'Spherocytosis, or a lipaemic sample producing a spurious result.', low: 'Iron deficiency.', pitfall: 'An unexpectedly high MCHC is more often a sample problem than a real finding.', related: ['mch', 'mcv'] },

  mpv: { what: 'Mean platelet volume — average platelet size.', why: 'Larger platelets are younger and more active. Occasionally informative alongside the platelet count.', read: 'Roughly 7.5–12.5 fL.', high: 'Increased platelet turnover.', low: 'Marrow production problems.', pitfall: 'Drifts with time in the tube before analysis, so minor variation is not meaningful.', related: ['plt'] },

  mono: { what: 'Monocytes — the white cell line that becomes tissue macrophages.', why: 'Rises in chronic inflammation and recovery phases.', read: 'Roughly 2–12% of white cells.', high: 'Chronic infection, inflammation, and recovery from acute infection.', low: 'Rarely significant alone.', pitfall: 'Small absolute numbers mean percentage swings look larger than they are.', related: ['wbc', 'crp'] },

  eos: { what: 'Eosinophils — white cells involved in allergic and parasitic responses.', why: 'A useful pointer toward allergy, atopy or drug reaction.', read: 'Roughly 0–5% of white cells.', high: 'Allergy, asthma, drug reactions, and parasitic infection. Markedly high warrants investigation.', low: 'Not clinically significant.', pitfall: 'Suppressed by glucocorticoids, which can mask an allergic picture.', related: ['wbc'] },

  baso: { what: 'Basophils — the rarest white cell line, involved in histamine release.', why: 'Rarely informative; occasionally relevant to myeloproliferative disorders.', read: 'Roughly 0–3% of white cells.', high: 'Uncommon; persistent elevation can point to a myeloproliferative process.', low: 'Not clinically significant.', pitfall: 'Counts are so small that a percentage change usually reflects counting noise.', related: ['wbc'] },

  /* ---------------- hepatic ---------------- */

  alt: {
    what: 'Alanine aminotransferase — an enzyme concentrated in liver cells, released when they are damaged.',
    why: 'The more liver-specific of the two transaminases, and the primary marker for hepatic strain from oral compounds.',
    read: 'Roughly 7–56 U/L, though many labs use ranges now considered too permissive. Read alongside AST and, critically, GGT.',
    high: 'Oral 17-alpha-alkylated compounds are the serious concern in this population and can cause genuine hepatotoxicity. But by far the most common cause of a mildly raised ALT here is resistance training — muscle damage releases both transaminases. Also fatty liver, alcohol, and many medications.',
    low: 'Not clinically significant.',
    pitfall: 'This is the most misread pair on the panel. A hard training session in the days before a draw routinely produces ALT and AST in the 60–100 range in healthy lifters. GGT is the tiebreaker: raised transaminases with a normal GGT usually points to muscle, while raised transaminases with a raised GGT points to the liver. Rest 72 hours before drawing if the question matters.',
    related: ['ast', 'ggt', 'ck', 'alkphos']
  },

  ast: {
    what: 'Aspartate aminotransferase — an enzyme present in liver, but also heavily in skeletal and cardiac muscle.',
    why: 'Less liver-specific than ALT, which is exactly what makes the pair informative together.',
    read: 'Roughly 10–40 U/L. The AST:ALT ratio carries information — a ratio above 2 is classically associated with alcohol-related liver injury.',
    high: 'Muscle damage from training is the most common cause here. Also liver injury, alcohol, and cardiac events.',
    low: 'Not clinically significant.',
    pitfall: 'Same training artifact as ALT, more pronounced because AST is more abundant in muscle. Check CK alongside — a high CK with high AST confirms a muscle source.',
    related: ['alt', 'ck', 'ggt']
  },

  ggt: {
    what: 'Gamma-glutamyl transferase — a biliary enzyme that is not present in skeletal muscle.',
    why: 'The single most useful marker for settling the "is my raised ALT from lifting or from my liver" question, which is one of the most common lab questions in this population.',
    read: 'Roughly 9–48 U/L.',
    high: 'Alcohol (it is sensitive to it), biliary obstruction, fatty liver, and enzyme-inducing medications. Raised GGT alongside raised transaminases makes a hepatic source much more likely.',
    low: 'Not clinically significant.',
    pitfall: 'Frequently omitted from basic panels, which is a shame given how much interpretive work it does. Ask for it if you use orals or have unexplained transaminase elevation.',
    related: ['alt', 'ast', 'alkphos']
  },

  alkphos: { what: 'Alkaline phosphatase — an enzyme from liver, bile ducts and bone.', why: 'Distinguishes biliary from hepatocellular patterns, and reflects bone turnover.', read: 'Roughly 44–121 U/L. Higher in adolescents and in healing fractures.', high: 'Biliary obstruction, bone turnover, and some medications. GGT helps distinguish liver from bone origin.', low: 'Zinc deficiency, malnutrition, and hypothyroidism.', pitfall: 'A raised alk phos with a normal GGT suggests bone rather than liver.', related: ['ggt', 'calcium', 'vitd'] },

  albumin: { what: 'Albumin — the main plasma protein, made by the liver.', why: 'A marker of hepatic synthetic function and nutritional status, and a required input for calculated free testosterone.', read: 'Roughly 3.5–5.5 g/dL.', high: 'Usually dehydration rather than anything else.', low: 'Liver disease, inflammation, malnutrition, and kidney loss. Low albumin lowers total calcium without lowering the physiologically active ionised calcium.', pitfall: 'Needed to calculate free and bioavailable testosterone. Without it, those values are estimates built on an assumed albumin.', related: ['tprot', 'globulin', 'freet', 'calcium'] },

  tprot: { what: 'Total protein — albumin plus globulins.', why: 'A crude screen; the split between the two fractions is where the information is.', read: 'Roughly 6.0–8.5 g/dL.', high: 'Dehydration, chronic inflammation, and paraproteinaemia.', low: 'Malnutrition, liver disease, and protein loss.', pitfall: 'A normal total can hide a low albumin offset by a high globulin.', related: ['albumin', 'globulin', 'agratio'] },

  globulin: { what: 'Globulin — total protein minus albumin, comprising immune and transport proteins.', why: 'Rises with chronic inflammation and immune activation.', read: 'Roughly 2.0–3.5 g/dL.', high: 'Chronic inflammation, infection, and paraproteinaemia if markedly raised.', low: 'Immune deficiency, and protein loss.', pitfall: 'A calculated value, so it inherits any error in albumin or total protein.', related: ['albumin', 'tprot', 'agratio'] },

  agratio: { what: 'Albumin to globulin ratio.', why: 'A summary of the protein picture; a falling ratio suggests inflammation or liver dysfunction.', read: 'Usually about 1.1–2.5.', high: 'Rarely of concern.', low: 'Chronic inflammation, liver disease, or paraproteinaemia — worth investigating if persistently low.', pitfall: 'Derived, so it adds nothing that reading albumin and globulin separately does not.', related: ['albumin', 'globulin'] },

  tbili: { what: 'Total bilirubin — the pigment from red cell breakdown, cleared by the liver.', why: 'Screens for haemolysis and for hepatic or biliary problems.', read: 'Roughly 0.1–1.2 mg/dL.', high: 'Gilbert syndrome is common, benign and affects several percent of people — it produces a mildly raised unconjugated bilirubin that rises with fasting, stress or illness and means nothing. Also haemolysis, biliary obstruction, and liver disease.', low: 'Not clinically significant.', pitfall: 'A mildly raised total bilirubin with everything else normal, rising when you fast, is usually Gilbert syndrome and causes a great deal of unnecessary alarm. The direct fraction distinguishes it.', related: ['dbili', 'alt', 'alkphos'] },

  dbili: { what: 'Direct (conjugated) bilirubin — the fraction the liver has already processed.', why: 'Splits a raised total bilirubin into pre-hepatic and hepatic/post-hepatic causes.', read: 'Roughly 0.0–0.3 mg/dL.', high: 'Biliary obstruction or hepatocellular disease. A raised direct fraction is more concerning than a raised total alone.', low: 'Not clinically significant.', pitfall: 'The value that separates benign Gilbert syndrome from something needing attention.', related: ['tbili', 'alkphos', 'ggt'] },

  ldh: { what: 'Lactate dehydrogenase — an enzyme present in nearly every tissue.', why: 'A very non-specific marker of cell turnover or damage.', read: 'Roughly 122–222 U/L.', high: 'Haemolysis, muscle damage, tissue injury, and some malignancies. Raised after hard training like the transaminases.', low: 'Not clinically significant.', pitfall: 'So non-specific that an isolated elevation rarely changes anything. A haemolysed sample raises it artefactually.', related: ['ast', 'ck'] },

  /* ---------------- lipids ---------------- */

  apob: {
    what: 'Apolipoprotein B — one molecule sits on every atherogenic particle, so this counts particles directly.',
    why: 'The best single lipid marker for cardiovascular risk, and the one that matters most in this population because anabolic use degrades the lipid picture in ways LDL-C alone understates.',
    read: 'Roughly under 90 mg/dL for general risk, with lower targets for higher-risk individuals. Where ApoB and LDL-C disagree, ApoB is the one to believe.',
    high: 'Anabolic steroid use — particularly orals — is a strong driver, along with insulin resistance, genetics and diet. Elevated ApoB is the mechanism by which long-term AAS use damages cardiovascular health, and it is frequently the marker that moves first.',
    low: 'Generally favourable. Very low warrants no concern in most contexts.',
    pitfall: 'Not on standard lipid panels; ask for it. Discordance between a normal LDL-C and a high ApoB is common and is exactly the situation where relying on the standard panel gives false reassurance.',
    related: ['ldl', 'nonhdl', 'ldlp', 'lpa']
  },

  ldl: { what: 'LDL cholesterol — the cholesterol carried in low-density lipoproteins, usually calculated rather than measured.', why: 'The conventional risk marker, and the one most people know. Adequate, but ApoB is better.', read: 'Optimal is generally considered under 100 mg/dL, with lower targets at higher risk.', high: 'Anabolic use (especially orals), saturated fat intake, genetics, hypothyroidism, and insulin resistance.', low: 'Generally favourable.', pitfall: 'Usually calculated by the Friedewald equation, which becomes unreliable when triglycerides are high or the sample is not fasting. If triglycerides are above about 400 mg/dL the calculated LDL is not trustworthy.', related: ['apob', 'nonhdl', 'trig'] },

  hdl: { what: 'HDL cholesterol — cholesterol in high-density lipoproteins.', why: 'The marker most dramatically suppressed by anabolic steroid use, particularly orals, where it can be driven very low.', read: 'Roughly above 40 mg/dL in men, with higher generally better — though the causal picture is more complicated than the correlation suggests.', high: 'Exercise, alcohol in moderation, and genetics.', low: 'Oral anabolic compounds crush HDL, sometimes to single digits. Also insulin resistance, smoking, and inactivity.', pitfall: 'Raising HDL pharmacologically has not shown the benefit the correlation implies, so treat a suppressed HDL as a signal about what is causing it rather than a target to medicate.', related: ['apob', 'trig', 'nonhdl'] },

  trig: { what: 'Triglycerides — circulating fat, largely from diet and hepatic production.', why: 'A sensitive marker of insulin resistance and metabolic health, and it interferes with LDL calculation when high.', read: 'Under 150 mg/dL is normal; many aiming for metabolic health target under 100. Must be fasting to interpret.', high: 'Insulin resistance, alcohol, refined carbohydrate intake, and a non-fasting sample. Very high levels carry pancreatitis risk.', low: 'Generally favourable; very low can accompany malabsorption.', pitfall: 'Highly sensitive to the last meal and to alcohol in the preceding days. A non-fasting triglyceride is close to uninterpretable and invalidates the calculated LDL alongside it.', related: ['ldl', 'hdl', 'insulin', 'glucose'] },

  nonhdl: { what: 'Non-HDL cholesterol — total cholesterol minus HDL, capturing all atherogenic particles.', why: 'A better risk marker than LDL-C alone and, unlike LDL-C, valid on a non-fasting sample. A good free proxy when ApoB is unavailable.', read: 'Generally targeted about 30 mg/dL above the LDL target, so under roughly 130 mg/dL for general risk.', high: 'Same drivers as high ApoB.', low: 'Generally favourable.', pitfall: 'Requires no extra test — it is arithmetic from a standard panel, and it is more informative than the LDL value most people read instead.', related: ['apob', 'ldl', 'chol'] },

  chol: { what: 'Total cholesterol — all cholesterol across all particles.', why: 'The least informative lipid number, since it sums favourable and unfavourable fractions together.', read: 'Roughly under 200 mg/dL conventionally, but the breakdown matters far more than the total.', high: 'Can reflect high LDL, high HDL, or both. Uninterpretable without the fractions.', low: 'Rarely a concern in itself.', pitfall: 'A "good" total cholesterol can conceal a poor ApoB, and a "high" total can be driven by favourable HDL. Do not act on this number alone.', related: ['ldl', 'hdl', 'nonhdl', 'apob'] },

  lpa: { what: 'Lipoprotein(a) — a genetically determined atherogenic particle.', why: 'An independent cardiovascular risk factor that is almost entirely genetic and largely unaffected by lifestyle. Worth measuring once.', read: 'Usually under 30 mg/dL or under 75 nmol/L, though units vary and are not interchangeable.', high: 'Genetic. Elevated Lp(a) raises risk independently and shifts how aggressively other modifiable risk factors should be managed.', low: 'Favourable.', pitfall: 'Because it is genetic and stable, it needs measuring only once in a lifetime for most people — but that once is genuinely worth doing, and most people never have it done.', related: ['apob', 'ldl'] },

  apoa1: { what: 'Apolipoprotein A1 — the main structural protein of HDL particles.', why: 'A more direct measure of HDL particle number than HDL cholesterol.', read: 'Roughly above 120 mg/dL in men. The ApoB:ApoA1 ratio is a useful summary risk figure.', high: 'Generally favourable.', low: 'Falls sharply with oral anabolic use, alongside HDL.', pitfall: 'Adds most value as part of the ApoB:ApoA1 ratio rather than alone.', related: ['hdl', 'apob'] },

  ldlp: { what: 'LDL particle number — a direct count of LDL particles, usually by NMR.', why: 'Like ApoB, it captures risk that LDL cholesterol misses when particles are small and numerous.', read: 'Interpreted against percentile-based targets that vary by lab and method.', high: 'Insulin resistance, anabolic use, and genetics. High particle number with normal LDL cholesterol is the classic discordance.', low: 'Favourable.', pitfall: 'ApoB gives essentially the same information more cheaply and with better standardisation. Choose one.', related: ['apob', 'smallldl', 'ldl'] },

  smallldl: { what: 'Small dense LDL particles — the subfraction most associated with atherogenesis.', why: 'Rises with insulin resistance and hypertriglyceridaemia.', read: 'Reported against method-specific reference ranges.', high: 'Insulin resistance, high triglycerides, and metabolic syndrome.', low: 'Favourable.', pitfall: 'Largely redundant once ApoB and triglycerides are known.', related: ['ldlp', 'apob', 'trig'] },

  omega3: { what: 'Omega-3 index — EPA and DHA as a percentage of red cell membrane fatty acids.', why: 'A stable measure of long-term omega-3 status, reflecting months rather than recent intake.', read: 'Generally above 8% is considered desirable; below 4% is low.', high: 'High intake of fatty fish or supplementation.', low: 'Low intake. Common on Western diets.', pitfall: 'Reflects red cell membranes, so it changes slowly — do not expect a supplement started last week to show up.', related: ['trig'] },

  /* ---------------- metabolic ---------------- */

  glucose: {
    what: 'Fasting glucose — blood sugar after an overnight fast.',
    why: 'The basic metabolic screen, and directly relevant here: growth hormone secretagogues, MK-677 and exogenous GH all worsen glucose handling, while GLP-1 agonists improve it.',
    read: 'Under 100 mg/dL is normal, 100–125 is prediabetic range, 126 and above on repeat testing meets the diabetes threshold. A single value is a screen, not a diagnosis.',
    high: 'Insulin resistance, GH and secretagogue use, glucocorticoids, poor sleep, acute stress, and an incomplete fast.',
    low: 'Excess insulin, prolonged fasting, and in this population insulin or aggressive GLP-1 dosing. Symptomatic hypoglycaemia is an urgent problem.',
    pitfall: 'Fasting means fasting — coffee with milk, or a fast under eight hours, invalidates it. Fasting glucose is also the least sensitive of the three metabolic markers; HbA1c and fasting insulin catch problems earlier.',
    related: ['hba1c', 'insulin', 'cpeptide']
  },

  hba1c: {
    what: 'Glycated haemoglobin — the fraction of haemoglobin with glucose attached, reflecting average blood sugar over roughly the preceding three months.',
    why: 'Averages out the day-to-day noise that makes single glucose readings unreliable. The standard measure of long-term glycaemic control.',
    read: 'Under 5.7% is normal, 5.7–6.4% prediabetic, 6.5% and above meets the diabetes threshold. Many aiming for metabolic optimisation target the low 5s.',
    high: 'Sustained hyperglycaemia. Also falsely raised by anything that extends red cell lifespan, such as iron deficiency anaemia.',
    low: 'Genuinely good control — or falsely low from anything that shortens red cell lifespan.',
    pitfall: 'This is the trap specific to this population. HbA1c depends on red cells living about 120 days. On TRT with a raised hematocrit and increased red cell turnover, or after a blood donation, HbA1c reads falsely low and can mask real dysglycaemia. If hematocrit is high or you donate regularly, trust fasting insulin and glucose over HbA1c.',
    related: ['glucose', 'insulin', 'hct']
  },

  insulin: {
    what: 'Fasting insulin — how much insulin the pancreas is producing to hold glucose at its fasting level.',
    why: 'The earliest of the metabolic markers to move. Insulin rises to compensate for resistance long before glucose or HbA1c drift, so a normal glucose with a high insulin is a real finding that the standard panel misses entirely.',
    read: 'Often reported as normal up to 25 uIU/mL, but that range reflects the population rather than health; many working on metabolic optimisation aim under 8. Combine with glucose to compute HOMA-IR.',
    high: 'Insulin resistance, and in this context GH, secretagogues and MK-677. Also the mechanism linking low SHBG to metabolic dysfunction.',
    low: 'Good insulin sensitivity, prolonged fasting, or impaired pancreatic output — the last needs C-peptide to distinguish.',
    pitfall: 'Frequently left off standard panels, which is why insulin resistance goes undetected for years. Ask for it explicitly.',
    related: ['glucose', 'hba1c', 'shbg', 'cpeptide']
  },

  cpeptide: {
    what: 'C-peptide — released in equal amounts to insulin when the pancreas makes it, but not present in injected insulin.',
    why: 'Distinguishes insulin the body made from insulin that was administered — the one marker that separates endogenous from exogenous.',
    read: 'Roughly 0.8–3.9 ng/mL fasting. Interpret against a simultaneous glucose.',
    high: 'Insulin resistance with a compensating pancreas, or an insulin-secreting tumour in rare cases.',
    low: 'Reduced pancreatic output. Low C-peptide with high measured insulin means the insulin is exogenous.',
    pitfall: 'Renally cleared, so kidney impairment raises it independently of pancreatic function.',
    related: ['insulin', 'glucose']
  },

  /* ---------------- prostate ---------------- */

  psa: {
    what: 'Prostate specific antigen — a protein produced by prostate tissue, benign and malignant alike.',
    why: 'The standard prostate safety monitor on testosterone therapy. Testosterone does not appear to cause prostate cancer on current evidence, but it can accelerate an existing one, so a baseline before starting and periodic monitoring after is the accepted practice.',
    read: 'Commonly under 4.0 ng/mL, but interpretation is age-dependent and the trend matters more than the absolute value. A rise of more than about 1.4 ng/mL within a year, or any rise crossing a threshold, is what prompts referral rather than a single reading.',
    high: 'Benign prostatic hyperplasia, prostatitis, recent ejaculation, cycling, catheterisation, digital rectal examination, and prostate cancer. Most elevated PSA is not cancer, but sorting that out is a urologist question and not one to resolve by waiting.',
    low: 'Finasteride and dutasteride roughly halve PSA. This matters enormously: if you take a 5AR inhibitor, your PSA must be doubled to compare against standard thresholds, or a real problem will be missed.',
    pitfall: 'Ejaculation within 48 hours, cycling, and a recent DRE all raise it. Abstain for two days and draw before any examination. And the 5AR inhibitor halving effect is the single most consequential PSA pitfall in this population.',
    related: ['dht', 'tott']
  },

  /* ---------------- growth ---------------- */

  igf1: {
    what: 'Insulin-like growth factor 1 — produced by the liver in response to growth hormone, and the practical proxy for GH status.',
    why: 'GH itself is pulsatile and essentially unmeasurable on a random draw. IGF-1 is stable, so it is what actually gets used to assess GH secretagogues, peptides and exogenous GH.',
    read: 'Strongly age-dependent — always compare against an age-matched range or the reported Z-score, never the whole adult range. Many using GH secretagogues aim for the upper end of age-matched.',
    high: 'GH or secretagogue use, and acromegaly at the pathological end. Sustained high IGF-1 carries theoretical concerns around tissue growth and is not a "more is better" marker.',
    low: 'GH deficiency, poor nutrition, liver disease, hypothyroidism, and poorly controlled diabetes. IGF-1 falls in energy deficit, so a low value in someone dieting hard may reflect the diet rather than the axis.',
    pitfall: 'Nutritional status affects it substantially, so a value taken mid-cut understates GH axis function. Age-matching is not optional — a value that is normal for the whole adult range may be markedly low or high for your decade.',
    related: ['igfbp3', 'glucose', 'insulin']
  },

  igfbp3: {
    what: 'IGF binding protein 3 — the main carrier for IGF-1, itself GH-dependent.',
    why: 'Read as a ratio to IGF-1 it indicates how much IGF-1 is actually free and active. Adds resolution when IGF-1 alone does not fit the picture.',
    read: 'Age-dependent like IGF-1. Usually interpreted as the IGF-1 to IGFBP-3 ratio.',
    high: 'GH excess.',
    low: 'GH deficiency, malnutrition, liver disease.',
    pitfall: 'Rarely necessary. IGF-1 alone answers most questions; add this when results are inconsistent.',
    related: ['igf1']
  },

  /* ---------------- thyroid ---------------- */

  tsh: {
    what: 'Thyroid stimulating hormone — the pituitary signal telling the thyroid to produce hormone.',
    why: 'The screening test for thyroid function, and an inverse one: it rises when thyroid output is low. Thyroid dysfunction mimics low testosterone closely enough that it belongs on any fatigue workup.',
    read: 'Roughly 0.45–4.5 mIU/L, though many clinicians consider the upper end of that range too permissive and target 1–2.5. Interpret with free T4 — TSH alone cannot distinguish a pituitary problem from a thyroid one.',
    high: 'Primary hypothyroidism, usually Hashimoto thyroiditis in developed countries — check TPO antibodies. Also recovery from illness and biotin interference.',
    low: 'Hyperthyroidism, excess thyroid replacement, and central hypothyroidism where the pituitary itself is underactive.',
    pitfall: 'Biotin supplements — common in hair and nail products, often at high doses — interfere with many thyroid immunoassays and can produce a picture that looks like hyperthyroidism. Stop biotin for 48–72 hours before drawing. TSH also varies diurnally, running higher in early morning.',
    related: ['ft4', 'ft3', 'tpo']
  },

  ft4: { what: 'Free thyroxine — the unbound fraction of the main circulating thyroid hormone.', why: 'The confirmatory test alongside TSH. A high TSH with a low free T4 is overt hypothyroidism; a high TSH with a normal free T4 is subclinical.', read: 'Roughly 0.82–1.77 ng/dL.', high: 'Hyperthyroidism or over-replacement.', low: 'Hypothyroidism. Low free T4 with a low or normal TSH points to a pituitary cause.', pitfall: 'Same biotin interference as TSH.', related: ['tsh', 'ft3', 'rt3'] },

  ft3: { what: 'Free triiodothyronine — the unbound fraction of the biologically active thyroid hormone.', why: 'T4 is largely a prohormone; T3 does the work. Symptoms track free T3 better than free T4 in some people.', read: 'Roughly 2.0–4.4 pg/mL.', high: 'Hyperthyroidism, T3-containing replacement.', low: 'Hypothyroidism, and impaired T4-to-T3 conversion which can occur in illness, energy deficit and chronic stress.', pitfall: 'Falls in dieting and illness as a normal adaptive response — a low free T3 mid-cut is often the diet, not the thyroid.', related: ['ft4', 'rt3', 'tsh'] },

  rt3: { what: 'Reverse T3 — an inactive isomer produced when T4 is converted down the alternate path.', why: 'Proposed as a marker of impaired conversion under stress or illness. Its clinical utility is genuinely contested.', read: 'Roughly 9.2–24.1 ng/dL. Often interpreted as a free T3 to reverse T3 ratio.', high: 'Acute illness, energy deficit, high cortisol, and severe stress.', low: 'Not clinically significant.', pitfall: 'Mainstream endocrinology largely does not use this marker and considers a raised reverse T3 an appropriate adaptation rather than a treatable problem. Treat claims built on it with appropriate scepticism.', related: ['ft3', 'ft4', 'cortam'] },

  tpo: { what: 'Thyroid peroxidase antibodies — autoantibodies against a thyroid enzyme.', why: 'Identifies autoimmune thyroid disease, which is the most common cause of hypothyroidism.', read: 'Usually under about 9 IU/mL; positive indicates autoimmunity.', high: 'Hashimoto thyroiditis, and sometimes Graves disease. A positive result with a normal TSH predicts future hypothyroidism and justifies periodic monitoring.', low: 'Normal.', pitfall: 'A positive antibody with normal thyroid function is not a disease requiring treatment — it is a reason to check thyroid function periodically.', related: ['tsh', 'tgab', 'ft4'] },

  tgab: { what: 'Thyroglobulin antibodies — autoantibodies against the thyroid storage protein.', why: 'A second autoimmune thyroid marker, occasionally positive when TPO is not.', read: 'Usually under about 1 IU/mL.', high: 'Autoimmune thyroid disease.', low: 'Normal.', pitfall: 'Adds little beyond TPO in most cases; useful when suspicion is high and TPO is negative.', related: ['tpo', 'tsh'] },

  t4total: { what: 'Total T4 — bound plus free thyroxine.', why: 'Largely superseded by free T4, since it moves with binding protein changes rather than thyroid function.', read: 'Roughly 4.5–12.0 mcg/dL.', high: 'Hyperthyroidism, or raised binding proteins from oestrogen.', low: 'Hypothyroidism, or reduced binding proteins.', pitfall: 'Oestrogen raises thyroid binding globulin and therefore total T4 without changing thyroid status. Free T4 avoids this entirely.', related: ['ft4', 'tsh'] },

  t3total: { what: 'Total T3 — bound plus free triiodothyronine.', why: 'Same binding-protein limitation as total T4.', read: 'Roughly 71–180 ng/dL.', high: 'Hyperthyroidism, T3 supplementation.', low: 'Hypothyroidism, impaired conversion, illness.', pitfall: 'Prefer free T3 for the same reason.', related: ['ft3', 'ft4'] },

  /* ---------------- renal ---------------- */

  creat: {
    what: 'Creatinine — a muscle breakdown product cleared by the kidneys, used as the standard kidney function proxy.',
    why: 'The default renal marker, and one that systematically misleads in muscular people. This population is exactly the group in which it fails.',
    read: 'Roughly 0.76–1.27 mg/dL. But creatinine is produced in proportion to muscle mass, so a heavily muscled person will run higher without any kidney impairment at all.',
    high: 'Reduced kidney function — or simply more muscle. Also dehydration, high protein intake, creatine supplementation, and recent intense training.',
    low: 'Low muscle mass, and pregnancy.',
    pitfall: 'The single most common false alarm in this population. A muscular lifter taking creatine, drawing blood dehydrated after training, will produce a creatinine that looks like early kidney disease and is nothing of the sort. Cystatin C is not muscle-dependent and settles the question — ask for it before accepting a kidney diagnosis based on creatinine alone.',
    related: ['egfr', 'cystatinc', 'bun', 'ck']
  },

  egfr: { what: 'Estimated glomerular filtration rate — a calculated estimate of kidney filtering capacity.', why: 'The number that gets used to stage kidney disease. It is calculated from creatinine, so it inherits every one of creatinine\'s limitations.', read: 'Above 90 mL/min/1.73m2 is normal; 60–89 mildly reduced; below 60 sustained defines chronic kidney disease.', high: 'Normal.', low: 'Reduced kidney function — or, very commonly here, high muscle mass inflating creatinine and deflating the estimate.', pitfall: 'A muscular person can be told they have stage 2 or 3 kidney disease purely from a creatinine-based eGFR. A cystatin C-based eGFR is the appropriate next step before accepting that. Do not stop training or panic on a creatinine-based eGFR alone.', related: ['creat', 'cystatinc', 'bun'] },

  cystatinc: { what: 'Cystatin C — a protein filtered by the kidneys whose level does not depend on muscle mass.', why: 'The answer to the creatinine problem. For anyone with substantial muscle mass, this is the more accurate kidney marker by a wide margin.', read: 'Roughly 0.6–1.0 mg/L. Used to compute a cystatin C-based eGFR.', high: 'Genuinely reduced kidney function. Also raised by thyroid dysfunction, glucocorticoids, and obesity.', low: 'Normal.', pitfall: 'Not on standard panels — ask for it specifically. If creatinine or eGFR has ever flagged, this is the test that tells you whether it was real.', related: ['creat', 'egfr'] },

  bun: { what: 'Blood urea nitrogen — a nitrogen waste product from protein metabolism.', why: 'Reflects both kidney function and protein intake and hydration, which limits it as a kidney marker.', read: 'Roughly 6–24 mg/dL. The BUN:creatinine ratio helps separate dehydration from intrinsic kidney problems.', high: 'Dehydration, high protein intake, gastrointestinal bleeding, and reduced kidney function. High protein diets routinely raise BUN without any pathology.', low: 'Low protein intake, liver disease, and overhydration.', pitfall: 'A raised BUN in someone eating 250g of protein a day and training fasted is usually diet and hydration, not kidneys.', related: ['creat', 'egfr'] },

  /* ---------------- chemistry ---------------- */

  sodium: { what: 'Sodium — the main extracellular electrolyte, tightly regulated and central to fluid balance.', why: 'Relevant to blood pressure and to water retention on hormone therapy.', read: 'Roughly 134–144 mmol/L. The body defends this range tightly, so deviations are meaningful.', high: 'Dehydration, and rarely excess mineralocorticoid.', low: 'Overhydration, some diuretics, and SIADH. Severe or rapidly falling sodium is a medical emergency and can cause seizures.', pitfall: 'Very high blood glucose or triglycerides can produce a falsely low sodium reading.', related: ['potassium', 'chloride', 'aldosterone'] },

  potassium: { what: 'Potassium — the main intracellular electrolyte, critical to cardiac and muscle function.', why: 'Narrow safe range and direct cardiac consequences at both ends.', read: 'Roughly 3.5–5.2 mmol/L.', high: 'Kidney impairment, potassium-sparing diuretics, ACE inhibitors, and severe tissue damage. Genuinely high potassium is a cardiac emergency.', low: 'Diuretics, vomiting or diarrhoea, and low intake.', pitfall: 'The most common cause of a high potassium result is haemolysis in the sample — a difficult draw or a clenched fist releases potassium from red cells. An unexpected high potassium in a well person should be repeated before anyone acts.', related: ['sodium', 'magnesium', 'creat'] },

  calcium: { what: 'Calcium — mostly skeletal, with the small serum fraction tightly regulated by PTH and vitamin D.', why: 'Read with PTH and vitamin D. Relevant to bone health on long-term therapy.', read: 'Roughly 8.7–10.2 mg/dL. Must be corrected for albumin, since about half is albumin-bound.', high: 'Hyperparathyroidism, malignancy, excess vitamin D, and thiazide diuretics. Persistent hypercalcaemia needs investigation.', low: 'Vitamin D deficiency, hypoparathyroidism, kidney disease, and low albumin.', pitfall: 'Low albumin lowers total calcium without lowering the active ionised fraction. Correct for albumin or measure ionised calcium before treating.', related: ['albumin', 'pth', 'vitd', 'phos'] },

  magnesium: { what: 'Magnesium — a cofactor in hundreds of enzymatic reactions including muscle and cardiac function.', why: 'Commonly low, commonly supplemented, and relevant to sleep, cramps and blood pressure.', read: 'Roughly 1.6–2.3 mg/dL — but serum magnesium is a poor reflection of total body stores, since most is intracellular.', high: 'Kidney impairment, and excessive supplementation.', low: 'Poor intake, diuretics, alcohol, GI losses, and proton pump inhibitors.', pitfall: 'A normal serum magnesium does not rule out deficiency. RBC magnesium reflects stores better if the question matters.', related: ['calcium', 'potassium'] },

  chloride: { what: 'Chloride — an extracellular anion that moves with sodium and participates in acid-base balance.', why: 'Mostly interpreted as part of the anion gap rather than alone.', read: 'Roughly 96–106 mmol/L.', high: 'Dehydration and metabolic acidosis.', low: 'Vomiting, and some diuretics.', pitfall: 'Rarely informative in isolation.', related: ['sodium', 'bicarb'] },

  bicarb: { what: 'Bicarbonate — the main buffer in the acid-base system.', why: 'Screens for metabolic acidosis and alkalosis.', read: 'Roughly 20–29 mmol/L.', high: 'Metabolic alkalosis, vomiting, and diuretics.', low: 'Metabolic acidosis, kidney disease, and prolonged ketogenic dieting.', pitfall: 'Falls if the sample sits before analysis.', related: ['chloride', 'sodium'] },

  phos: { what: 'Phosphorus — a mineral partnering calcium in bone and central to cellular energy.', why: 'Read with calcium, PTH and vitamin D as part of the bone panel.', read: 'Roughly 2.5–4.5 mg/dL.', high: 'Kidney impairment, and excess vitamin D.', low: 'Hyperparathyroidism, refeeding syndrome, and antacid use.', pitfall: 'Rises with haemolysis and falls after eating carbohydrate — draw fasting.', related: ['calcium', 'pth', 'vitd'] },

  uricacid: { what: 'Uric acid — the end product of purine metabolism.', why: 'Relevant to gout risk, and rises with high protein intake, diuretics and some anabolic use.', read: 'Roughly 3.7–8.6 mg/dL in men.', high: 'High purine intake, alcohol, diuretics, dehydration, kidney impairment, and rapid weight loss. High uric acid predicts gout and is associated with hypertension.', low: 'Rarely a concern.', pitfall: 'Rises during aggressive dieting as tissue breaks down, so a cut can push it up transiently.', related: ['creat', 'egfr'] },

  ck: {
    what: 'Creatine kinase — an enzyme released from damaged muscle.',
    why: 'The marker that explains most unexplained transaminase elevations in people who train. Confirms whether a raised AST and ALT came from muscle rather than liver.',
    read: 'Roughly 39–308 U/L, but lifters routinely run well above that with no pathology at all. Values in the thousands after an unaccustomed heavy session are common.',
    high: 'Recent intense or eccentric training, and this population lives here. Also statins, and rhabdomyolysis at the dangerous end — very high CK with dark urine and severe muscle pain is a medical emergency.',
    low: 'Low muscle mass.',
    pitfall: 'Drawing after training makes CK, AST, ALT and LDH all rise together, producing a panel that looks like liver disease. Rest 72 hours before a draw if liver interpretation matters.',
    related: ['ast', 'alt', 'creat', 'ldh']
  },

  amylase: { what: 'Amylase — a digestive enzyme from pancreas and salivary glands.', why: 'Screens for pancreatitis, which is relevant on GLP-1 agonists where pancreatitis is a recognised though uncommon risk.', read: 'Roughly 25–125 U/L.', high: 'Pancreatitis, salivary gland problems, and kidney impairment. Lipase is more specific.', low: 'Rarely significant.', pitfall: 'Less specific than lipase; a raised amylase alone does not establish pancreatitis.', related: ['lipase'] },

  lipase: { what: 'Lipase — a pancreatic digestive enzyme.', why: 'The more specific pancreatic marker, and the one that matters on GLP-1 therapy.', read: 'Roughly 0–60 U/L, though ranges vary widely by method.', high: 'Pancreatitis. GLP-1 agonists can raise lipase modestly without pancreatitis, which complicates interpretation. Severe persistent abdominal pain radiating to the back with a raised lipase needs urgent assessment.', low: 'Rarely significant.', pitfall: 'An asymptomatic mild elevation on a GLP-1 is common; severe abdominal pain with any elevation is not something to monitor at home.', related: ['amylase'] },

  /* ---------------- inflammation ---------------- */

  crp: { what: 'High-sensitivity C-reactive protein — an acute phase protein and the standard marker of systemic inflammation.', why: 'Both a cardiovascular risk marker and a general inflammation signal. The high-sensitivity assay is the one that matters for risk stratification.', read: 'Under 1.0 mg/L is low cardiovascular risk, 1–3 average, above 3 high. Above 10 usually means an acute process rather than baseline risk.', high: 'Any infection or injury, obesity, poor sleep, and recent hard training. Chronically elevated hs-CRP is a real cardiovascular signal.', low: 'Favourable.', pitfall: 'A single high value after a cold or a hard session says nothing about baseline risk. Repeat when well and rested before drawing conclusions.', related: ['esr', 'fibrinogen', 'apob'] },

  homocysteine: { what: 'Homocysteine — an amino acid intermediate that accumulates when B-vitamin dependent metabolism is impaired.', why: 'Associated with cardiovascular and cognitive risk, and directly responsive to B12, folate and B6 status.', read: 'Roughly under 15 umol/L conventionally, though many target under 10.', high: 'B12, folate or B6 deficiency, MTHFR variants, kidney impairment, and hypothyroidism.', low: 'Not a concern.', pitfall: 'Lowering homocysteine with B vitamins has not reliably reduced cardiovascular events in trials, so treat it as a marker of B-vitamin status more than a target in itself.', related: ['b12', 'folate'] },

  fibrinogen: { what: 'Fibrinogen — a clotting protein that is also an acute phase reactant.', why: 'Contributes to both inflammation assessment and thrombotic risk, which matters alongside a raised hematocrit.', read: 'Roughly 200–400 mg/dL.', high: 'Inflammation, infection, smoking, and oestrogen. Combined with a high hematocrit it compounds clotting risk.', low: 'Liver disease, and consumptive coagulopathy.', pitfall: 'Rises non-specifically with any inflammation, so interpret alongside CRP.', related: ['crp', 'hct', 'plt'] },

  esr: { what: 'Erythrocyte sedimentation rate — how fast red cells settle, an indirect inflammation measure.', why: 'An older, slower-moving inflammation marker. Largely superseded by CRP but still used.', read: 'Roughly under 15–20 mm/hr in men, rising with age.', high: 'Inflammation, infection, anaemia, and pregnancy.', low: 'Polycythaemia — and this matters here, because a high hematocrit lowers ESR and can mask inflammation.', pitfall: 'Responds much more slowly than CRP, and is affected by red cell count. On TRT with a high hematocrit, a normal ESR is less reassuring than it looks.', related: ['crp', 'hct'] },

  /* ---------------- vitamins and minerals ---------------- */

  vitd: { what: 'Vitamin D, measured as 25-hydroxyvitamin D — the storage form and the correct one to test.', why: 'Involved in bone health, immune function and, on some evidence, testosterone production. Very commonly deficient.', read: 'Under 20 ng/mL is deficient, 20–29 insufficient, 30–100 sufficient. Many target 40–60.', high: 'Over-supplementation. Genuine toxicity is uncommon but causes hypercalcaemia.', low: 'Limited sun exposure, darker skin, obesity (it sequesters in fat), malabsorption, and northern latitudes in winter.', pitfall: 'Test 25-hydroxy, not 1,25-dihydroxy — the active form is tightly regulated and can look normal in deficiency, which makes it the wrong test.', related: ['calcium', 'pth', 'phos'] },

  ferritin: { what: 'Ferritin — the iron storage protein, and the best single measure of total body iron stores.', why: 'Directly relevant on TRT: repeated blood donation to manage hematocrit depletes iron, and low ferritin causes fatigue that gets misread as inadequate testosterone.', read: 'Roughly 30–400 ng/mL in men. Below 30 indicates depleted stores; many feel best above 50–100.', high: 'Iron overload and haemochromatosis, but also — importantly — inflammation, since ferritin is an acute phase reactant. Also liver disease and alcohol.', low: 'Iron deficiency, blood loss, and frequent donation. This is common in men managing hematocrit by donating and is a frequent cause of unexplained fatigue on otherwise well-managed TRT.', pitfall: 'Because ferritin rises with inflammation, a normal ferritin does not exclude iron deficiency if CRP is elevated. Check iron saturation alongside. And if you donate blood regularly, check ferritin — you can be iron deficient with a perfectly normal hematocrit.', related: ['iron', 'ironsat', 'tibc', 'hct', 'crp'] },

  iron: { what: 'Serum iron — circulating iron bound to transferrin at the moment of the draw.', why: 'Part of the iron panel, but far too variable to interpret alone.', read: 'Roughly 38–169 mcg/dL.', high: 'Recent supplementation, haemochromatosis, and haemolysis.', low: 'Deficiency, inflammation, and normal daily variation.', pitfall: 'Swings substantially through the day and rises sharply after an iron supplement. Draw fasting, in the morning, and having held supplements — and never interpret it without ferritin and saturation.', related: ['ferritin', 'tibc', 'ironsat', 'transferrin'] },

  tibc: { what: 'Total iron binding capacity — how much iron transferrin could carry.', why: 'Rises in iron deficiency as the body upregulates transport. Part of the panel needed to compute saturation.', read: 'Roughly 250–450 mcg/dL.', high: 'Iron deficiency.', low: 'Inflammation, malnutrition, and iron overload.', pitfall: 'Only meaningful alongside serum iron and ferritin.', related: ['iron', 'ferritin', 'ironsat'] },

  ironsat: { what: 'Iron saturation — serum iron as a percentage of TIBC.', why: 'The most useful single number on the iron panel for distinguishing deficiency from overload, and it holds up when ferritin is confounded by inflammation.', read: 'Roughly 15–55%. Below 20% suggests deficiency; sustained above 45–50% raises the question of overload.', high: 'Haemochromatosis and iron overload — worth taking seriously, since untreated overload damages liver, heart and pancreas.', low: 'Iron deficiency.', pitfall: 'The number to trust when ferritin is unreliable because CRP is up.', related: ['iron', 'tibc', 'ferritin'] },

  transferrin: { what: 'Transferrin — the protein that transports iron in blood.', why: 'Closely related to TIBC and largely interchangeable with it.', read: 'Roughly 200–360 mg/dL.', high: 'Iron deficiency.', low: 'Inflammation, liver disease, and malnutrition.', pitfall: 'Redundant if TIBC was measured.', related: ['tibc', 'iron'] },

  b12: { what: 'Vitamin B12 — required for red cell production and neurological function.', why: 'Deficiency causes fatigue and neurological symptoms that overlap heavily with low testosterone.', read: 'Roughly 232–1245 pg/mL, though the lower end of that range is widely considered inadequate — symptoms occur in the 200–400 range and many target above 500.', high: 'Supplementation, and rarely liver disease or myeloproliferative conditions.', low: 'Poor intake (particularly on plant-based diets), metformin, proton pump inhibitors, and absorption problems including pernicious anaemia.', pitfall: 'Serum B12 is an imperfect measure of functional status. If symptoms suggest deficiency with a low-normal B12, methylmalonic acid is the more sensitive test.', related: ['folate', 'mcv', 'homocysteine'] },

  folate: { what: 'Folate — a B vitamin required alongside B12 for red cell production and methylation.', why: 'Deficiency causes macrocytic anaemia indistinguishable from B12 deficiency on a CBC.', read: 'Roughly above 3.0 ng/mL in serum; red cell folate reflects longer-term status better.', high: 'Supplementation. High folate with low B12 can mask the haematological signs of B12 deficiency while neurological damage continues.', low: 'Poor intake, alcohol, malabsorption, and some medications.', pitfall: 'Supplementing folate without checking B12 can hide a B12 deficiency until neurological damage is established. Check both.', related: ['b12', 'mcv', 'homocysteine'] },

  zinc: { what: 'Zinc — a mineral involved in testosterone synthesis, immune function and wound healing.', why: 'Popular supplement in this population on the basis of its role in testosterone production. Genuine deficiency does impair testosterone; supplementing beyond repletion does not raise it further.', read: 'Roughly 60–130 mcg/dL, though serum zinc reflects status poorly.', high: 'Over-supplementation. Sustained high zinc intake induces copper deficiency, which causes its own anaemia and neurological problems.', low: 'Poor intake, malabsorption, and heavy sweating.', pitfall: 'Serum zinc is a weak measure of body stores. And high-dose zinc supplementation over months depletes copper — if you take zinc long term, take it with copper or check both.', related: ['tott'] },

};
