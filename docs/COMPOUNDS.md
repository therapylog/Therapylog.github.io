# TherapyLog Compound Inventory

131 unique compounds across 30 classifications.

Every compound is stored once, under its canonical class. Compounds that belong in
more than one class are cross-listed: the extra classes show them with a link to the
full entry (the `alsoIn` field in the app database and in `compounds.json`).

## 💉 Androgens / TRT  
`androgens` · #4ade9a · 3 compounds

_Testosterone-based hormone therapy_

- **Testosterone Cypionate** `tc` — *Test C, TC*
- **Testosterone Enanthate** `te` — *Test E, TE*
- **Progesterone** `progesterone` — *Prometrium, Utrogestan*

## 🔬 Peptides  
`peptides` · #3bc4ff · 20 compounds · 3 cross-listed

_Short-chain amino acids with targeted biological activity_

- **BPC-157** `bpc` — *Body Protection Compound 157*
- **TB-500** `tb5` — *Thymosin Beta-4*
- **CJC-1295** `cjc` — *Mod GRF 1-29 (without DAC)*
- **Ipamorelin** `ipa` — *Ipa, Selective GHRP*
- **Pentadeca Arginate** `pda` — *PDA, PC-15*
- **LL-37** `ll37` — *Cathelicidin, CAMP peptide*
- **AOD-9604** `aod9604` — *Anti-Obesity Drug 9604, HGH Frag 177-191, HGH Fragment 176-191* _(also listed in Additional Peptides)_
- **HGH Fragment 176-191** `hghfrag` — *HGH Frag, Fragment 176-191*
- **Hexarelin** `hexarelin` — *Examorelin, HEX*
- **GHRP-2** `ghrp2` — *Pralmorelin, KP-102*
- **GHRP-6** `ghrp6` — *Growth Hormone Releasing Peptide-6*
- **SS-31** `ss31` — *Elamipretide, MTP-131, Bendavia* _(also listed in Additional Peptides)_
- **Humanin** `humanin` — *HN, Mitochondrial-derived peptide*
- **Pinealon** `pinealon` — *EDR peptide, Glu-Asp-Arg*
- **Thymalin** `thymalin` — *Thymus peptide complex*
- **Vilon** `vilon` — *Lys-Glu, KE dipeptide*
- **Cortagen** `cortagen` — *Ala-Glu-Asp-Pro, AEDP tetrapeptide*
- **Kisspeptin-10** `kissp` — *Metastin, KP-10*
- **ARA-290** `ara290` — *Cibinetide, Helix B peptide*
- **Larazotide** `larazotide` — *AT-1001, INN-202*
- ↗ **Tesamorelin** `tesam` — full entry under GH Secretagogues
- ↗ **Epithalon** `epi` — full entry under Khavinson Bioregulators
- ↗ **KPV** `kpv` — full entry under Anti-Inflammatory Peptides

## ⚗️ GLP-1 / Metabolic  
`glp1` · #f59e0b · 2 compounds

_Metabolic peptides for weight and insulin regulation_

- **Semaglutide** `sema` — *Ozempic, Wegovy*
- **Tirzepatide** `tirz` — *Mounjaro, Zepbound*

## 🧬 GH Secretagogues  
`ghs` · #a78bfa · 3 compounds

_Compounds that stimulate natural growth hormone release_

- **Sermorelin** `serm2` — *GHRH(1-29)*
- **Tesamorelin** `tesam` — *Egrifta, TH9507* _(also listed in Peptides)_
- **MK-677 / Ibutamoren** `mk677` — *Nutrobal*

## 🛡️ Ancillaries — AIs and SERMs  
`ancil` · #f472b6 · 5 compounds

_Side effect management and hormonal balance compounds_

- **Anastrozole** `ai1` — *Arimidex*
- **Tamoxifen** `nolv` — *Nolvadex, Tamox*
- **Clomiphene** `clom` — *Clomid, Enclomiphene*
- **HCG** `hcg2` — *Human Chorionic Gonadotropin*
- **Enclomiphene** `enclo` — *Androxal, Enclomifene, NF-1010* _(also listed in Additional Ancillaries)_

## 🔄 PCT Protocols  
`pct` · #4ade9a · 1 compounds

_Post Cycle Therapy — restoring the natural hormonal axis_

- **Standard PCT — Testosterone Cycle** `pct1` — *HPTA Restart Protocol*

## 💪 Anabolic / AAS  
`aas` · #f87171 · 4 compounds

_Anabolic-androgenic steroids beyond testosterone_

- **Nandrolone Decanoate** `nandro` — *Deca-Durabolin, Deca, NPP*
- **Oxandrolone** `oxan` — *Anavar, Var*
- **Drostanolone** `mast` — *Masteron, Mast E, Mast P*
- **Methenolone** `primo` — *Primobolan, Primo, Primo Depot*

## 🎯 SARMs  
`sarmsclass` · #34d399 · 4 compounds

_Selective Androgen Receptor Modulators — tissue-selective androgens_

- **Ostarine** `osta` — *MK-2866, Enobosarm, GTx-024*
- **Ligandrol** `lgd` — *LGD-4033, VK5211*
- **RAD-140** `rad140` — *Testolone, RAD140*
- **Cardarine** `card` — *GW-501516, GW1516*

## 📈 HGH and IGF-1  
`hghclass` · #a78bfa · 2 compounds

_Growth hormone and insulin-like growth factor compounds_

- **Recombinant HGH** `rhgh` — *Somatropin, rHGH, Human Growth Hormone, Genotropin, Norditropin, Humatrope, Omnitrope, Somatropin (rhGH)* _(also listed in Bodybuilding & PED Compounds)_
- **IGF-1 LR3** `igf1lr3` — *Long R3 IGF-1, Insulin-like Growth Factor 1*

## 🧠 Nootropics and Longevity  
`nootroplonge` · #818cf8 · 2 compounds · 2 cross-listed

_Cognitive enhancement and cellular longevity compounds_

- **NMN / NR (NAD+ Precursors)** `nad` — *Nicotinamide Mononucleotide, Nicotinamide Riboside*
- **Dihexa** `dihexa` — *PNB-0408, HGF Modulator*
- ↗ **Selank** `selank` — full entry under Neurological and Cognitive
- ↗ **Semax** `semax` — full entry under Neurological and Cognitive

## ⚡ Additional Peptides  
`addlpeptides` · #22d3ee · 3 compounds · 4 cross-listed

_Specialized peptides for specific therapeutic targets_

- **Thymosin Alpha-1** `thymalpha` — *Ta1, Zadaxin, Thymalfasin*
- **MOTS-c** `mots` — *Mitochondrial Open Reading Frame Peptide, Humanin analogue*
- **P21** `p21pep` — *P21 peptide, CNTF fragment*
- ↗ **AOD-9604** `aod9604` — full entry under Peptides
- ↗ **SS-31** `ss31` — full entry under Peptides
- ↗ **GHK-Cu** `ghkcu` — full entry under Collagen and Skin Peptides
- ↗ **PT-141** `pt141` — full entry under Sexual Health Peptides

## ⚙️ Additional Ancillaries  
`addlancil` · #fb923c · 3 compounds · 1 cross-listed

_Additional compounds for hormonal management and health optimization_

- **Exemestane** `exemest` — *Aromasin*
- **Cabergoline** `caberg` — *Dostinex, Caber*
- **Dutasteride / Finasteride** `dutast` — *Avodart (Duta), Propecia (Fina), 5-ARIs*
- ↗ **Enclomiphene** `enclo` — full entry under Ancillaries — AIs and SERMs

## 🦋 Thyroid Hormones  
`thyroid` · #22d3ee · 3 compounds

_Thyroid hormone replacement and optimization_

- **Liothyronine (T3)** `t3` — *Cytomel, T3, LT3*
- **Levothyroxine (T4)** `t4` — *Synthroid, Levoxyl, LT4*
- **Natural Desiccated Thyroid** `ndt` — *NDT, Armour Thyroid, NatureThroid, WP Thyroid*

## ⚡ DHEA and Adrenal  
`adrenal` · #fbbf24 · 3 compounds

_Adrenal hormone precursors and optimization_

- **DHEA** `dhea` — *Dehydroepiandrosterone, Prasterone*
- **Pregnenolone** `pregnenolone` — *Preg, Master Hormone, 3β-hydroxy-5-pregnen-20-one*
- **7-Keto DHEA** `keto-dhea` — *7-Keto, 3-acetyl-7-oxo-DHEA*

## ❤️ Metabolic and Cardiovascular  
`metabolic` · #f87171 · 6 compounds · 1 cross-listed

_Compounds for metabolic health, longevity, and cardioprotection_

- **Metformin** `metformin` — *Glucophage, Metformin HCl, Fortamet*
- **Berberine** `berberine` — *Berberine HCl, BBR*
- **Telmisartan** `telmisartan` — *Micardis*
- **Low-Dose Naltrexone** `ldn` — *LDN*
- **VIP** `vip` — *Vasoactive Intestinal Peptide*
- **Insulin** `insulin` — *Humulin R, Novolin R, regular human insulin, insulin lispro, aspart, glargine*
- ↗ **Acarbose** `acarbose` — full entry under Longevity Compounds

## 🔬 Longevity Compounds  
`longevity2` · #818cf8 · 3 compounds

_mTOR inhibitors, sirtuin activators, and evidence-based longevity agents_

- **Rapamycin** `rapamycin` — *Sirolimus, Rapamune, mTOR inhibitor*
- **Acarbose** `acarbose` — *Precose, Glucobay, alpha-glucosidase inhibitor* _(also listed in Metabolic and Cardiovascular)_
- **Resveratrol / Pterostilbene** `resveratrol` — *Trans-resveratrol, RSV, pterostilbene*

## ✨ Collagen and Skin Peptides  
`collagen` · #f9a8d4 · 3 compounds

_Peptides for skin, hair, collagen synthesis, and anti-aging aesthetics_

- **Argireline / Snap-8** `argireline` — *Acetyl hexapeptide-3, Acetyl octapeptide-3*
- **Collagen Peptides** `collagen-pep` — *Hydrolyzed collagen, collagen hydrolysate, types I/II/III*
- **GHK-Cu** `ghkcu` — *Copper Peptide, Glycyl-L-Histidyl-L-Lysine, GHK-Copper, GHK-Cu (Copper Peptide)* _(also listed in Additional Peptides)_

## 🧠 Neurological and Cognitive  
`neuro2` · #c084fc · 4 compounds

_Neuroprotective compounds and cognitive enhancement agents_

- **Cerebrolysin** `cerebrolysin` — *FPF-1070, CERE*
- **NAC / NALT** `nalt` — *N-Acetyl Cysteine, N-Acetyl L-Tyrosine, NAC*
- **Selank** `selank` — *TP-7* _(also listed in Nootropics and Longevity)_
- **Semax** `semax` — *ACTH(4-7)PGP, Heptapeptide* _(also listed in Nootropics and Longevity)_

## 💪 Muscle and Myostatin  
`muscle` · #f87171 · 1 compounds

_Myostatin inhibitors and anabolic support compounds_

- **Follistatin** `follistatin` — *FS-344, FST-344, myostatin inhibitor*

## 🔬 Khavinson Bioregulators  
`khavinson2` · #6ee7b7 · 7 compounds

_Short regulatory peptides targeting specific organs and tissues_

- **Cardiogen** `cardiogen` — *Lys-Glu-Asp-Trp, KEDW tetrapeptide*
- **Ventfort** `ventfort` — *Lys-Glu-Asp, KED tripeptide, vascular bioregulator*
- **Sigumir** `sigumir` — *Ala-Glu-Asp-Gly, AEDG tetrapeptide, cartilage bioregulator*
- **Chonluten** `chonluten` — *Lys-Glu-Asp, bronchial/lung bioregulator*
- **Bonomarlot** `bonomarlot` — *Lys-Glu-Asp-Pro, KEDP tetrapeptide, bone marrow bioregulator*
- **Crystagen** `crystagen` — *Lys-Glu-Asp-Gly, lymphocyte bioregulator*
- **Epithalon** `epi` — *Epithalamin, Epitalon, Epithalone* _(also listed in Peptides)_

## 🔥 Metabolic Peptides  
`metabolic2` · #fb923c · 3 compounds

_Advanced metabolic, appetite regulation, and body composition peptides_

- **Retatrutide** `retatrutide` — *LY3437943, triple G agonist*
- **Cagrilintide** `cagrilintide` — *AM833, amylin analogue*
- **Melanotan II** `mt2` — *MT-2, bremelanotide precursor*

## ❤️ Sexual Health Peptides  
`sexhealth` · #f472b6 · 3 compounds

_Peptides for sexual function, libido, and reproductive health_

- **Kisspeptin-54** `kisspeptin54` — *KP-54, metastin full length*
- **Gonadorelin** `gonadorelin` — *GnRH, LHRH, Factrel, Lutrepulse*
- **PT-141** `pt141` — *Bremelanotide, Vyleesi* _(also listed in Additional Peptides)_

## 🛡️ Anti-Inflammatory Peptides  
`antiinflam` · #34d399 · 4 compounds

_Specialized peptides for systemic inflammation, autoimmunity, and immune regulation_

- **CJC-1295 with DAC** `dac` — *CJC-1295 DAC, Drug Affinity Complex*
- **BPC-157 Systemic Protocol** `bpc157sys` — *BPC-157 oral systemic, extended protocol*
- **TB-500 Systemic Protocol** `tbnouveau` — *Thymosin Beta-4 systemic, TB-500 extended*
- **KPV** `kpv` — *Lys-Pro-Val, Alpha-MSH C-terminal tripeptide, α-MSH(11-13)* _(also listed in Peptides)_

## 🔄 Senolytics and Autophagy  
`senolytics` · #a78bfa · 4 compounds · 1 cross-listed

_Senolytic compounds that clear zombie cells and autophagy inducers for cellular cleanup_

- **Fisetin** `fisetin` — *7,3',4'-flavon-3-ol, senolytic flavonoid*
- **Quercetin** `quercetin` — *Quercetin dihydrate, senolytic flavonoid*
- **Dasatinib** `dasatinib` — *Sprycel, senolytic Rx, BCR-ABL inhibitor*
- **Spermidine** `spermidine` — *Spermidine trihydrochloride, polyamine, N-(3-Aminopropyl)putrescine*
- ↗ **Urolithin A** `urolithin` — full entry under Performance and Recovery

## 💊 Supplements and Nutraceuticals  
`supps` · #34d399 · 4 compounds

_Evidence-based supplements for longevity, metabolic health, and performance_

- **Taurine** `taurine` — *2-aminoethanesulfonic acid*
- **Alpha-Lipoic Acid (ALA)** `ala` — *ALA, R-ALA, thioctic acid*
- **Oxytocin** `oxytocin` — *OT, bonding hormone, Pitocin (Rx)*
- **NAD+ IV Protocol** `nad-iv` — *NAD+ infusion, intravenous NAD, NMN IV equivalent*

## 🌙 Sleep and Neurological  
`sleep-neuro` · #818cf8 · 3 compounds

_Sleep optimization peptides and neurological compounds_

- **DSIP** `dsip` — *Delta Sleep-Inducing Peptide, DSIP nonapeptide*
- **Glycine** `glycine-supp` — *Aminoacetic acid, glycine powder*
- **Lithium Orotate** `lithium-or` — *Micro-dose lithium, lithium orotate supplement*

## ⚡ Performance and Recovery  
`performance` · #f59e0b · 4 compounds

_Compounds for athletic performance, recovery, and body composition_

- **Creatine Monohydrate** `creatine` — *Creatine, Cr, creatine monohydrate*
- **Urolithin A** `urolithin` — *UA, Mitopure, ellagitannin metabolite* _(also listed in Senolytics and Autophagy)_
- **Alpha-Ketoglutarate (AKG)** `akglutarate` — *alpha-ketoglutaric acid, calcium AKG, AAKG*
- **Testosterone Pellets** `testpellets` — *Testopel, subcutaneous pellet implant, BHRT pellets*

## ✨ Longevity Supplements  
`longevity3` · #34d399 · 2 compounds

_Evidence-based longevity supplements for healthspan extension_

- **Glycine and NAC (GlyNAC)** `akg2` — *GlyNAC, glycine plus NAC combination*
- **Melatonin (Therapeutic)** `melatonin-ther` — *High-dose melatonin, Pierpaoli protocol*

## ⚗️ Additional Compounds  
`newcompounds` · #a78bfa · 9 compounds

_Extended compound library — AAS, SARM variants, and specialized compounds_

- **5-Amino-1MQ** `amino1mq` — *5-Amino-1-methylquinolinium, AMQ*
- **Estriol** `estriol` — *E3, Oestriol*
- **YK-11** `yk11` — *YK11, Myostatin inhibitor SARM*
- **Andarine** `andarine` — *S-4, GTx-007*
- **Proviron** `proviron` — *Mesterolone, 1-Methyl-DHT*
- **Stanozolol** `stanozolol` — *Winstrol, Winny, Stan*
- **Nandrolone Phenylpropionate** `npp` — *NPP, Durabolin, Short Deca*
- **Testosterone Propionate** `tprop` — *Test Prop, TP*
- **Boldenone Undecylenate** `boldenone` — *Equipoise, EQ, Bold*

## 🏋️ Bodybuilding & PED Compounds  
`bbcompounds` · #ef4444 · 13 compounds · 1 cross-listed

_Anabolic steroids, blends, HGH, and side-effect management for performance users_

- **Trenbolone Acetate** `trenace` — *Tren A, Fina*
- **Trenbolone Enanthate** `trenenan` — *Tren E*
- **Methandrostenolone** `dianabol` — *Dianabol, Dbol, D-bol*
- **Oxymetholone** `anadrol` — *Anadrol, A-bombs, Drol*
- **Chlorodehydromethyltestosterone** `turinabol` — *Turinabol, Tbol, Oral Turinabol*
- **Drostanolone Enanthate** `mastenan` — *Masteron Enanthate, Mast E*
- **Methenolone Acetate (Oral)** `primooral` — *Primobolan Oral, Oral Primo*
- **Testosterone Suspension** `testsusp` — *Test Susp, Aqueous Testosterone*
- **Sustanon 250 (Testosterone Blend)** `sustanon` — *Sustanon, Sust, Test Blend*
- **SLU-PP-332** `slupp332` — *SLU-PP-332, Exercise Mimetic*
- **Raloxifene** `raloxifene` — *Evista*
- **Isotretinoin** `isotretinoin` — *Accutane, Roaccutane, Tretinoin (oral)*
- **Bromocriptine** `caberbromo` — *Parlodel, Bromo*
- ↗ **Recombinant HGH** `rhgh` — full entry under HGH and IGF-1

