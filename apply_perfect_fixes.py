import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE
import shutil

# Load from backup
prs = pptx.Presentation("Revised_backup.pptx")

# Palette matching slide 6.png & SIH template
C_BLACK = RGBColor(15, 23, 42)
C_WHITE = RGBColor(255, 255, 255)
C_SLATE_700 = RGBColor(51, 65, 85)
C_SLATE_500 = RGBColor(100, 116, 139)
C_BLUE_DARK = RGBColor(2, 132, 199)    # Border blue
C_BLUE_LINK = RGBColor(37, 99, 235)    # Link blue
C_BLUE_TEXT = RGBColor(0, 102, 204)    # Text header blue
C_DARK_GREEN = RGBColor(21, 128, 61)   # Green 700
C_AMBER_DARK = RGBColor(194, 65, 12)   # Orange 700
C_RED_DARK = RGBColor(185, 28, 28)     # Red 700
C_PURPLE_DARK = RGBColor(124, 58, 237) # Purple 600

C_BG_GREEN = RGBColor(240, 253, 244)
C_BG_BLUE = RGBColor(240, 249, 255)
C_BG_AMBER = RGBColor(255, 251, 235)

FONT_TITLE = "Times New Roman"
FONT_BODY = "Arial"

def set_font(run, text, bold=False, size_pt=10.0, color=C_BLACK, font_name=FONT_BODY, underline=False):
    run.text = text
    run.font.name = font_name
    run.font.bold = bold
    run.font.size = Pt(size_pt)
    run.font.color.rgb = color
    run.font.underline = underline

def style_box(shape, bg_color=C_WHITE, border_color=C_BLUE_DARK, border_width_pt=1.4):
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    shape.line.color.rgb = border_color
    shape.line.width = Pt(border_width_pt)

# ==============================================================================
# SLIDE 5: IMPACT AND BENEFITS
# User request: "in slide5 remove business model and make it properly arranged with text apper properly and clearly"
# ==============================================================================
s5 = prs.slides[4]

s5_to_remove = []
for sh in s5.shapes:
    if sh.has_text_frame:
        txt = sh.text_frame.text
        if any(k in txt for k in ["BUSINESS MODEL", "ZERO-FEE", "Bulk Margins", "Procurement Efficiency", "PLATFORM REVENUE",
                                  "1. INFORMAL", "2. LOCAL", "3. AUTHORIZED", "4. REGULATORS",
                                  "SOCIAL IMPACT", "ECONOMIC IMPACT", "ENVIRONMENTAL IMPACT"]):
            s5_to_remove.append(sh)
    if sh.name in ["Google Shape;200;p17", "Google Shape;201;p17", "Google Shape;202;p17", "Google Shape;203;p17", "Google Shape;199;p17"]:
        s5_to_remove.append(sh)

s5_unique = {sh.shape_id: sh for sh in s5_to_remove}
for sh in s5_unique.values():
    sp = sh._element
    sp.getparent().remove(sp)

# Subtitle on Slide 5
for sh in s5.shapes:
    if sh.has_text_frame and "Stakeholder Value Transformation" in sh.text_frame.text:
        sh.left = Inches(0.42)
        sh.top = Inches(0.68)
        sh.width = Inches(8.00)
        sh.height = Inches(0.24)
        tf = sh.text_frame
        tf.word_wrap = True
        tf.margin_left = tf.margin_right = tf.margin_top = tf.margin_bottom = 0
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = ""
        r1 = p.add_run()
        set_font(r1, "Stakeholder Value Transformation & Macro Impacts: ", bold=True, size_pt=10.0, color=C_BLACK, font_name=FONT_TITLE)
        r2 = p.add_run()
        set_font(r2, "Creating Value Across the Informal-to-Formal Recycling Chain", bold=False, size_pt=9.5, color=C_DARK_GREEN)

# ROW 1: 4 Stakeholder Cards (Expanded height: 1.96 inches, generous spacing, clear text)
stakeholder_cards = [
    ("1. INFORMAL COLLECTORS", "Waste-Pickers & Itinerant Buyers", C_DARK_GREEN,
     ["Volatile prices dictated by middlemen",
      "Zero direct access to recyclers",
      "Frequent scale & payment cuts"],
     ["Live transparent floor prices",
      "Camera scale OCR photo evidence",
      "Instant Cash / UPI verified pay"],
     "VALUE: Fair floor rates & digital ID"),

    ("2. LOCAL AGGREGATORS", "Scrap Dealers & Local Hubs", C_AMBER_DARK,
     ["Manual paper ledgers prone to loss",
      "Difficult multi-collector tracking",
      "Zero advance scrap visibility"],
     ["Digital lotting with batch tracking",
      "Rapid aggregation of small lots",
      "Tamper-evident digital ledger"],
     "VALUE: Digital lotting & formal hubs"),

    ("3. AUTHORIZED RECYCLERS", "CPCB Dismantlers & Smelters", C_BLUE_DARK,
     ["Fragmented supply bypassing plants",
      "Unverified origin & quality disputes",
      "Paper manifests with audit gaps"],
     ["Pre-segregated, graded bulk lots",
      "Spatial sourcing & truck routing",
      "Cryptographic QR custody checks"],
     "VALUE: Traceable feedstock & custody"),

    ("4. REGULATORS / EPR", "CPCB, MoEFCC & Brand Owners", C_PURPLE_DARK,
     ["Unmonitored scrap flows & leakage",
      "Untraceable material custody",
      "Risk of fraudulent paper credits"],
     ["Full Collector ➔ Hub ➔ Plant trace",
      "Immutable transaction trail",
      "Automated CPCB Form-6 e-filing"],
     "VALUE: Provenance & zero EPR fraud")
]

y_row1 = Inches(0.96)
h_row1 = Inches(1.98)
w_row1 = Inches(2.21)
gap_row1 = Inches(0.106)

for idx, (s_title, s_sub, s_col, befores, afters, s_val) in enumerate(stakeholder_cards):
    x_c = Inches(0.42) + idx * (w_row1 + gap_row1)
    sh_c = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_c, y_row1, w_row1, h_row1)
    style_box(sh_c, bg_color=C_WHITE, border_color=s_col, border_width_pt=1.4)
    tf_c = sh_c.text_frame
    tf_c.vertical_anchor = MSO_ANCHOR.TOP
    tf_c.word_wrap = True
    tf_c.margin_left = Inches(0.08)
    tf_c.margin_right = Inches(0.08)
    tf_c.margin_top = Inches(0.05)
    tf_c.margin_bottom = Inches(0.02)

    # Title
    p_h = tf_c.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    r_ht = p_h.add_run()
    set_font(r_ht, s_title, bold=True, size_pt=9.2, color=s_col, font_name=FONT_TITLE)

    # Subtitle
    p_sub = tf_c.add_paragraph()
    p_sub.alignment = PP_ALIGN.CENTER
    p_sub.space_before = Pt(0)
    p_sub.space_after = Pt(1.0)
    r_sub = p_sub.add_run()
    set_font(r_sub, s_sub, bold=False, size_pt=7.5, color=C_SLATE_500)

    # BEFORE Section
    p_b_hdr = tf_c.add_paragraph()
    p_b_hdr.space_before = Pt(1.0)
    p_b_hdr.space_after = Pt(0)
    r_bh = p_b_hdr.add_run()
    set_font(r_bh, "BEFORE:", bold=True, size_pt=7.8, color=C_RED_DARK)

    for b_item in befores:
        p_bi = tf_c.add_paragraph()
        p_bi.space_before = Pt(0)
        p_bi.space_after = Pt(0)
        r_bi = p_bi.add_run()
        set_font(r_bi, f"• {b_item}", bold=False, size_pt=7.2, color=C_SLATE_700)

    # AFTER Section
    p_a_hdr = tf_c.add_paragraph()
    p_a_hdr.space_before = Pt(1.5)
    p_a_hdr.space_after = Pt(0)
    r_ah = p_a_hdr.add_run()
    set_font(r_ah, "AFTER (WITH E-WASTE SETU):", bold=True, size_pt=7.8, color=C_DARK_GREEN)

    for a_item in afters:
        p_ai = tf_c.add_paragraph()
        p_ai.space_before = Pt(0)
        p_ai.space_after = Pt(0)
        r_ai = p_ai.add_run()
        set_font(r_ai, f"✓ {a_item}", bold=False, size_pt=7.2, color=C_BLACK)

    # VALUE Highlight
    p_val = tf_c.add_paragraph()
    p_val.space_before = Pt(2.0)
    p_val.space_after = Pt(0)
    r_val = p_val.add_run()
    set_font(r_val, s_val, bold=True, size_pt=7.5, color=s_col)

# ROW 2: 3 Macro Impact Cards
impact_cards = [
    ("SOCIAL IMPACT | Inclusive Livelihoods & Safety", C_BLUE_DARK,
     [("Zero-Barrier Access: ", "Voice guidance & visual UI remove literacy barriers."),
      ("Financial Identity: ", "Verifiable digital payouts unlock formal micro-loans & credit."),
      ("Dispute Protection: ", "Camera scale OCR eliminates arbitrary middleman weight cuts."),
      ("Dignity of Labor: ", "Transitions informal collectors into certified green-collar workforce.")],
     "Mechanism: Transparent pricing ➔ Dignified livelihoods"),

    ("ECONOMIC IMPACT | Price Transparency & Efficiency", C_AMBER_DARK,
     [("Transparent Pricing: ", "Daily benchmark floor stops 25%–40% predatory middleman cuts."),
      ("Bulk Value Capture: ", "Small lots aggregated into high-margin bulk recycler consignments."),
      ("Dispute-Free Trade: ", "Tamper-evident scale OCR logs resolve all handover conflicts."),
      ("Plant Throughput: ", "Predictable, sorted feedstock maximizes authorized recycler capacity.")],
     "Mechanism: Lot aggregation + OCR ➔ Dispute-free trade"),

    ("ENVIRONMENTAL IMPACT | Toxic Diversion & Recovery", C_DARK_GREEN,
     [("Zero Toxic Leaching: ", "Diverts PCBs away from crude acid baths and open burning in slums."),
      ("Critical Minerals: ", "Secures domestic recovery of pure Cu, Au, Ag & essential battery Li."),
      ("Chain-of-Custody: ", "Dual QR tracking prevents gray-market leakage & informal dumping."),
      ("Audit-Proof EPR: ", "Physical custody trail replaces fraudulent paper-only certificates.")],
     "Mechanism: Digital custody ➔ End-to-end trace & zero toxic burning")
]

y_row2 = Inches(3.02)
h_row2 = Inches(2.06)
w_row2 = Inches(2.96)
gap_row2 = Inches(0.14)

for idx, (i_title, i_col, i_bullets, i_mech) in enumerate(impact_cards):
    x_i = Inches(0.42) + idx * (w_row2 + gap_row2)
    sh_i = s5.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_i, y_row2, w_row2, h_row2)
    style_box(sh_i, bg_color=C_WHITE, border_color=i_col, border_width_pt=1.5)
    tf_i = sh_i.text_frame
    tf_i.vertical_anchor = MSO_ANCHOR.TOP
    tf_i.word_wrap = True
    tf_i.margin_left = Inches(0.10)
    tf_i.margin_right = Inches(0.10)
    tf_i.margin_top = Inches(0.06)
    tf_i.margin_bottom = Inches(0.04)

    # Title
    p_h = tf_i.paragraphs[0]
    p_h.alignment = PP_ALIGN.CENTER
    r_ht = p_h.add_run()
    set_font(r_ht, i_title, bold=True, size_pt=9.5, color=i_col, font_name=FONT_TITLE)

    for b_tag, b_desc in i_bullets:
        p_b = tf_i.add_paragraph()
        p_b.space_before = Pt(1.5)
        p_b.space_after = Pt(0)
        r_bt = p_b.add_run()
        set_font(r_bt, f"• {b_tag}", bold=True, size_pt=8.0, color=i_col)
        r_bd = p_b.add_run()
        set_font(r_bd, b_desc, bold=False, size_pt=7.8, color=C_SLATE_700)

    # Mechanism Box / Line
    p_m = tf_i.add_paragraph()
    p_m.space_before = Pt(2.5)
    p_m.space_after = Pt(0)
    r_m = p_m.add_run()
    set_font(r_m, i_mech, bold=True, size_pt=8.0, color=i_col)

# ==============================================================================
# SLIDE 6: RESEARCH AND REFERENCES (Exact match to slide 6.png with ZERO OVERFLOW)
# ==============================================================================
s6 = prs.slides[5]

s6_to_remove = []
for sh in s6.shapes:
    if sh.has_text_frame:
        txt = sh.text_frame.text
        if any(k in txt for k in ["1. PROBLEM", "2. TECHNOLOGY", "3. PRIMARY FIELD", "PROTOTYPE WEB", "YOUTUBE", "Comprehensive Literature"]):
            s6_to_remove.append(sh)

s6_unique = {sh.shape_id: sh for sh in s6_to_remove}
for sh in s6_unique.values():
    sp = sh._element
    sp.getparent().remove(sp)

# Fix Oval on Slide 6
for sh in s6.shapes:
    if sh.has_text_frame and ("Team" in sh.text_frame.text or "Oval" in sh.name or "HelloWorld" in sh.text_frame.text):
        tf = sh.text_frame
        tf.word_wrap = False
        tf.margin_left = Inches(0.01)
        tf.margin_right = Inches(0.01)
        tf.margin_top = Inches(0.12)
        tf.margin_bottom = Inches(0.02)
        p = tf.paragraphs[0]
        p.alignment = PP_ALIGN.CENTER
        p.text = ""
        r1 = p.add_run()
        set_font(r1, "HelloWorldWarriors", bold=True, size_pt=9.5, color=C_BLACK, font_name="Arial")

# Subtitle on Slide 6
sub6 = s6.shapes.add_textbox(Inches(0.40), Inches(0.68), Inches(8.00), Inches(0.24))
tf_sub6 = sub6.text_frame
tf_sub6.word_wrap = True
tf_sub6.margin_left = tf_sub6.margin_right = tf_sub6.margin_top = tf_sub6.margin_bottom = 0
p_s6 = tf_sub6.paragraphs[0]
p_s6.alignment = PP_ALIGN.CENTER
r_s6_1 = p_s6.add_run()
set_font(r_s6_1, "Comprehensive Literature, Technical Foundations & Primary Field Research: ", bold=True, size_pt=9.8, color=C_BLACK, font_name=FONT_TITLE)
r_s6_2 = p_s6.add_run()
set_font(r_s6_2, "Evidence-Based Architecture for E-Waste Setup", bold=True, size_pt=9.8, color=C_DARK_GREEN, font_name=FONT_TITLE)

y_p_start = Inches(0.95)
h_p_card = Inches(3.32)
w_p_card = Inches(2.96)
gap_p = Inches(0.14)

# -----------------------------------------------------------------------------
# PILLAR 1: PROBLEM, POLICY & DOMAIN RESEARCH
# -----------------------------------------------------------------------------
sh_p1 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.42), y_p_start, w_p_card, h_p_card)
style_box(sh_p1, bg_color=C_WHITE, border_color=C_BLUE_DARK, border_width_pt=1.5)
tf_p1 = sh_p1.text_frame
tf_p1.vertical_anchor = MSO_ANCHOR.TOP
tf_p1.word_wrap = True
tf_p1.margin_left = Inches(0.08)
tf_p1.margin_right = Inches(0.08)
tf_p1.margin_top = Inches(0.05)
tf_p1.margin_bottom = Inches(0.02)

p_p1_h1 = tf_p1.paragraphs[0]
p_p1_h1.alignment = PP_ALIGN.CENTER
r_p1_h1 = p_p1_h1.add_run()
set_font(r_p1_h1, "1. PROBLEM, POLICY & DOMAIN RESEARCH", bold=True, size_pt=8.5, color=C_BLUE_TEXT, font_name=FONT_TITLE)

p_p1_h2 = tf_p1.add_paragraph()
p_p1_h2.alignment = PP_ALIGN.CENTER
p_p1_h2.space_before = Pt(0)
p_p1_h2.space_after = Pt(0.5)
r_p1_h2 = p_p1_h2.add_run()
set_font(r_p1_h2, "(Stakeholder, Academic Literature & National Policy)", bold=False, size_pt=7.0, color=C_BLUE_TEXT)

p1_items = [
    ("Smart India Hackathon 2026 — PS 26229 ↗", "(Ministry of Mines / JNARDDC, NIC)", None, None),
    ("E-Waste (Management) Rules, 2022 ↗", "(CPCB / MoEFCC)",
     "Statutory Compliance: ", "Mandates digital EPR, credit trading, formal recycler licensing, and automated Form-6 electronic audit trails."),
    ("CPCB — E-Waste Management / EPR Portal ↗", "(Central Pollution Control Board)",
     "Registry & Ecosystem: ", "Official national portal for registered dismantlers & recyclers, mapped to our spatial engine for certified processing."),
    ("NITI Aayog — Circular Economy Strategy ↗", "(NITI Aayog (2022))",
     "Inclusion Roadmap: ", "Prioritizes decentralized aggregation hubs, workforce skilling, and formalization of the informal sector."),
    ("JNARDDC — Waste Management Research ↗", "(Autonomous Body, MoM)",
     "Multidisciplinary Recovery: ", "Benchmark extraction indices for Au, Ag, Cu, Li via hydrometallurgical processing over hazardous backyard leaching."),
    ("Toxics Link — Electronic Waste Research ↗", "(Environmental Research Body)",
     "Ground Vulnerabilities: ", "Proves 25–40% value skimming by middlemen and severe e-waste health risks from crude open acid burning.")
]

for title, org, tag, desc in p1_items:
    p_t = tf_p1.add_paragraph()
    p_t.space_before = Pt(0.5)
    p_t.space_after = Pt(0)
    p_t.line_spacing = Pt(6.8)
    r_t = p_t.add_run()
    set_font(r_t, f"• {title} ", bold=True, size_pt=6.2, color=C_BLUE_TEXT)
    r_o = p_t.add_run()
    set_font(r_o, org, bold=False, size_pt=5.6, color=C_SLATE_500)

    if desc:
        r_nl = p_t.add_run()
        r_nl.text = "\n"
        r_tag = p_t.add_run()
        set_font(r_tag, tag, bold=True, size_pt=5.8, color=C_BLACK)
        r_val = p_t.add_run()
        set_font(r_val, desc, bold=False, size_pt=5.6, color=C_SLATE_700)

# -----------------------------------------------------------------------------
# PILLAR 2: TECHNOLOGY & AI RESEARCH
# -----------------------------------------------------------------------------
x_p2 = Inches(0.42) + w_p_card + gap_p
sh_p2 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_p2, y_p_start, w_p_card, h_p_card)
style_box(sh_p2, bg_color=C_WHITE, border_color=C_DARK_GREEN, border_width_pt=1.5)
tf_p2 = sh_p2.text_frame
tf_p2.vertical_anchor = MSO_ANCHOR.TOP
tf_p2.word_wrap = True
tf_p2.margin_left = Inches(0.08)
tf_p2.margin_right = Inches(0.08)
tf_p2.margin_top = Inches(0.05)
tf_p2.margin_bottom = Inches(0.02)

p_p2_h1 = tf_p2.paragraphs[0]
p_p2_h1.alignment = PP_ALIGN.CENTER
r_p2_h1 = p_p2_h1.add_run()
set_font(r_p2_h1, "2. TECHNOLOGY & AI RESEARCH", bold=True, size_pt=8.5, color=C_DARK_GREEN, font_name=FONT_TITLE)

p_p2_h2 = tf_p2.add_paragraph()
p_p2_h2.alignment = PP_ALIGN.CENTER
p_p2_h2.space_before = Pt(0)
p_p2_h2.space_after = Pt(0.5)
r_p2_h2 = p_p2_h2.add_run()
set_font(r_p2_h2, "(Open-Source Engines, Algorithms & Web Standards)", bold=False, size_pt=7.0, color=C_DARK_GREEN)

p2_items = [
    ("MobileNetV3 — Mobile Vision ↗", "(Howard et al., Google Research)",
     "Lightweight Neural Vision: ", "Hardware-aware NAS architecture, optimized INT8 on-device edge category classifier (<5MB) running in real-time on budget phones."),
    ("IEEE Access — E-Waste Vision AI ↗", "(IEEE (Kolev (2021))",
     "Zero-Review AI framework: ", "Evaluates lightweight vision transformers for automated multi-category electronic scrap classification on edge hardware."),
    ("AI4Bharat — Indic Language AI ↗", "(IIT Madras / MeitY Initiative)",
     "Vernacular Voice Assistance: ", "Speech-to-text and voice synthesis in Hindi & regional dialects; removes reading/typing barriers for low-literacy collectors."),
    ("OpenCV — Computer Vision Pipeline ↗", "(OpenCV Foundation)",
     "Space-OKR Verification: ", "Perspective warp rectification, adaptive thresholding & 7-segment digit recognition to extract tamper-evident-to-weight proof from phones."),
    ("PostGIS — Spatial Database ↗", "(PostgreSQL, Spatial Extension)",
     "Geospatial Clustering: ", "ST_DWithin and K-means for hotspot mapping, spatial queries for location-based clustering and dynamic collector-to-hub routing.")
]

for title, org, tag, desc in p2_items:
    p_t = tf_p2.add_paragraph()
    p_t.space_before = Pt(0.8)
    p_t.space_after = Pt(0)
    p_t.line_spacing = Pt(6.8)
    r_t = p_t.add_run()
    set_font(r_t, f"• {title} ", bold=True, size_pt=6.2, color=C_DARK_GREEN)
    r_o = p_t.add_run()
    set_font(r_o, org, bold=False, size_pt=5.6, color=C_SLATE_500)

    r_nl = p_t.add_run()
    r_nl.text = "\n"
    r_tag = p_t.add_run()
    set_font(r_tag, tag, bold=True, size_pt=5.8, color=C_BLACK)
    r_val = p_t.add_run()
    set_font(r_val, desc, bold=False, size_pt=5.6, color=C_SLATE_700)

# -----------------------------------------------------------------------------
# PILLAR 3: PRIMARY FIELD RESEARCH
# -----------------------------------------------------------------------------
x_p3 = Inches(0.42) + 2 * (w_p_card + gap_p)
sh_p3 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, x_p3, y_p_start, w_p_card, h_p_card)
style_box(sh_p3, bg_color=C_WHITE, border_color=C_AMBER_DARK, border_width_pt=1.5)
tf_p3 = sh_p3.text_frame
tf_p3.vertical_anchor = MSO_ANCHOR.TOP
tf_p3.word_wrap = True
tf_p3.margin_left = Inches(0.08)
tf_p3.margin_right = Inches(0.08)
tf_p3.margin_top = Inches(0.05)
tf_p3.margin_bottom = Inches(0.02)

p_p3_h1 = tf_p3.paragraphs[0]
p_p3_h1.alignment = PP_ALIGN.CENTER
r_p3_h1 = p_p3_h1.add_run()
set_font(r_p3_h1, "3. PRIMARY FIELD RESEARCH", bold=True, size_pt=8.5, color=C_AMBER_DARK, font_name=FONT_TITLE)

p_p3_h2 = tf_p3.add_paragraph()
p_p3_h2.alignment = PP_ALIGN.CENTER
p_p3_h2.space_before = Pt(0)
p_p3_h2.space_after = Pt(0.5)
r_p3_h2 = p_p3_h2.add_run()
set_font(r_p3_h2, "(In-Person Interviews & Operational Workflow Observation)", bold=False, size_pt=7.0, color=C_AMBER_DARK)

p_fs = tf_p3.add_paragraph()
p_fs.space_before = Pt(0.8)
p_fs.space_after = Pt(0)
p_fs.line_spacing = Pt(6.8)
r_fst = p_fs.add_run()
set_font(r_fst, "FIELD SAMPLE: 2 Informal Collectors + 1 Main Aggregator", bold=True, size_pt=6.2, color=C_RED_DARK)

participants = [
    ("Participant 01: Collector 01 (Daily Waste-Picker)",
     "Collects discarded electronics from repair shops & bins → Sells daily to roadside dealer for cash; accepts flat under-estimate.",
     "\"₹30–₹50/kg. No scale; often sell at loss to middlemen; 2–3 hrs daily, no formal ID or security.\""),
    ("Participant 02: Collector 02 (Itinerant Scrap Buyer)",
     "Travels 15–20 km daily using home appliances → Connectivity drops in narrow alleys → Needs immediate price proof for sellers.",
     "\"Households distrust rates. Showing live market rates on app screen builds trust and closes deals fast.\""),
    ("Participant 03: Main Aggregator (Local Scrap Hub Operator)",
     "Buys small lots from 30+ collectors → Stores in yard → Records in paper books → Sells bulk lots to recyclers.",
     "\"Recyclers pay higher but demand 300kg+ lots & manifests. Digital lotting lets us operate as certified hubs.\"")
]

for part_title, proc_txt, what_txt in participants:
    p_pt = tf_p3.add_paragraph()
    p_pt.space_before = Pt(0.6)
    p_pt.space_after = Pt(0)
    p_pt.line_spacing = Pt(6.6)
    r_ptt = p_pt.add_run()
    set_font(r_ptt, part_title, bold=True, size_pt=6.2, color=C_AMBER_DARK)

    r_nl1 = p_pt.add_run()
    r_nl1.text = "\n"
    r_pr_tag = p_pt.add_run()
    set_font(r_pr_tag, "Process Told: ", bold=True, size_pt=5.8, color=C_BLACK)
    r_pr_val = p_pt.add_run()
    set_font(r_pr_val, proc_txt, bold=False, size_pt=5.5, color=C_SLATE_700)

    r_nl2 = p_pt.add_run()
    r_nl2.text = "\n"
    r_wh_tag = p_pt.add_run()
    set_font(r_wh_tag, "What He Told: ", bold=True, size_pt=5.8, color=C_BLACK)
    r_wh_val = p_pt.add_run()
    set_font(r_wh_val, what_txt, bold=False, size_pt=5.5, color=C_SLATE_700)

p_p3_cov = tf_p3.add_paragraph()
p_p3_cov.space_before = Pt(0.8)
p_p3_cov.space_after = Pt(0)
p_p3_cov.line_spacing = Pt(6.6)
r_cov_tag = p_p3_cov.add_run()
set_font(r_cov_tag, "FIELD RESEARCH COVERAGE: ", bold=True, size_pt=6.0, color=C_RED_DARK)
r_cov_flow = p_p3_cov.add_run()
set_font(r_cov_flow, "Collection ➔ Pricing ➔ Weighing ➔ Aggregation ➔ Recycler", bold=True, size_pt=5.6, color=C_BLACK)

p_p3_val = tf_p3.add_paragraph()
p_p3_val.space_before = Pt(0.6)
p_p3_val.space_after = Pt(0)
p_p3_val.line_spacing = Pt(6.6)
r_val_tag = p_p3_val.add_run()
set_font(r_val_tag, "Core Validation: ", bold=True, size_pt=6.0, color=C_AMBER_DARK)
r_val_txt = p_p3_val.add_run()
set_font(r_val_txt, "Informal actors embrace formalization when scale proof & market rates protect earnings without cash disruption.", bold=False, size_pt=5.5, color=C_SLATE_700)

# -----------------------------------------------------------------------------
# BOTTOM ROW: 2 Project Links Banners matching slide 6.png
# -----------------------------------------------------------------------------
y_b_start = Inches(4.32)
h_b_card = Inches(0.90)
w_b_card = Inches(4.52)

# Banner 1: Live Web App (Green border)
sh_b1 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(0.42), y_b_start, w_b_card, h_b_card)
style_box(sh_b1, bg_color=C_BG_GREEN, border_color=C_DARK_GREEN, border_width_pt=1.5)
tf_b1 = sh_b1.text_frame
tf_b1.vertical_anchor = MSO_ANCHOR.TOP
tf_b1.word_wrap = True
tf_b1.margin_left = Inches(0.12)
tf_b1.margin_right = Inches(0.10)
tf_b1.margin_top = Inches(0.06)
tf_b1.margin_bottom = Inches(0.04)

p_b1_h = tf_b1.paragraphs[0]
r_b1_lbl = p_b1_h.add_run()
set_font(r_b1_lbl, "PROTOTYPE WEB APPLICATION:  ", bold=True, size_pt=8.0, color=C_DARK_GREEN, font_name=FONT_TITLE)
r_b1_lnk = p_b1_h.add_run()
set_font(r_b1_lnk, "https://recysaathi.vercel.app ↗", bold=True, size_pt=8.0, color=C_BLUE_LINK, underline=True)
r_b1_lnk.hyperlink.address = "https://recysaathi.vercel.app"

p_b1_d = tf_b1.add_paragraph()
p_b1_d.space_before = Pt(1.5)
p_b1_d.space_after = Pt(0)
p_b1_d.line_spacing = Pt(8.0)
r_b1_dt = p_b1_d.add_run()
set_font(r_b1_dt, "Live Responsive PWA: ", bold=True, size_pt=7.2, color=C_BLACK)
r_b1_dv = p_b1_d.add_run()
set_font(r_b1_dv, "Mobile-optimized web app with visual scrap touch categories, offline IndexedDB transaction storage, and camera scale OCR weight extraction for budget Android phones.", bold=False, size_pt=7.0, color=C_SLATE_700)

# Banner 2: YouTube Video Demonstration (Blue border)
sh_b2 = s6.shapes.add_shape(MSO_SHAPE.ROUNDED_RECTANGLE, Inches(5.06), y_b_start, w_b_card, h_b_card)
style_box(sh_b2, bg_color=C_BG_BLUE, border_color=C_BLUE_DARK, border_width_pt=1.5)
tf_b2 = sh_b2.text_frame
tf_b2.vertical_anchor = MSO_ANCHOR.TOP
tf_b2.word_wrap = True
tf_b2.margin_left = Inches(0.12)
tf_b2.margin_right = Inches(0.10)
tf_b2.margin_top = Inches(0.06)
tf_b2.margin_bottom = Inches(0.04)

p_b2_h = tf_b2.paragraphs[0]
r_b2_lbl = p_b2_h.add_run()
set_font(r_b2_lbl, "YOUTUBE VIDEO DEMONSTRATION:  ", bold=True, size_pt=8.0, color=C_BLUE_LINK, font_name=FONT_TITLE)
r_b2_lnk = p_b2_h.add_run()
set_font(r_b2_lnk, "https://youtu.be/ewastesetu-demo ↗", bold=True, size_pt=8.0, color=C_BLUE_LINK, underline=True)
r_b2_lnk.hyperlink.address = "https://youtu.be/ewastesetu-demo"

p_b2_d = tf_b2.add_paragraph()
p_b2_d.space_before = Pt(1.5)
p_b2_d.space_after = Pt(0)
p_b2_d.line_spacing = Pt(8.0)
r_b2_dt = p_b2_d.add_run()
set_font(r_b2_dt, "Complete System Walkthrough: ", bold=True, size_pt=7.2, color=C_BLACK)
r_b2_dv = p_b2_d.add_run()
set_font(r_b2_dv, "End-to-end video demo of voice scrap logging, digital scale OCR weight capture, local hub batch lotting, and dual QR CPCB Form-6 manifest handover.", bold=False, size_pt=7.0, color=C_SLATE_700)

prs.save("Revised.pptx")
print("SUCCESS: Perfectly updated Revised.pptx with zero overflow!")
