# IT-Tools Web Platform: Complete Step-by-Step Antigravity Master Prompts Guide
## دليل البرومبتات التفصيلي الشامل لكل مرحلة من مراحل تنفيذ موقع الـ 100+ أداة باستخدام Antigravity AI

---

## 📌 كيفية استخدام هذا الدليل (How to Use This Guide)
هذا المستند يمثل **دليل التشغيل التنفيذي (Execution Master Prompts)** لبناء وإطلاق منصة أدوات المطورين وحاسبات التمويل الموجهة للجمهور العالمي باللغة الإنجليزية. 
تم تصميم البرومبتات لتُنسخ مباشرة وتُدخل في **Antigravity AI**، حيث تم صياغة كل برومبت بدقة مع المعايير الفنية، معايير SEO، وشروط القبول في **Google AdSense** (تجنب رفض *Low Value Content*).

---

## 🚀 المرحلة الأولى: تجهيز البيئة، الهوية، وتخصيص كود القالب (Repository & Frontend Setup)

### 🔹 Prompt 1.1: تحليل كود IT-Tools المفتوح وإضافة خانة المقالات الشارحة (Dynamic Markdown Slot)
> **الهدف:** توجيه الذكاء الاصطناعي لتعديل هيكل مشروع IT-Tools (المبني على Vue 3 / Vite) وتحديد المكان البرمجي الذي سيتم عرض المقال التعليمي فيه أسفل كود كل أداة.

```text
Act as a Senior Vue 3 & Vite Front-End Engineer. I am customizing the open-source "IT-Tools" repository (Vue 3, TypeScript, TailwindCSS / PrimeVue).

Goal: Modify the core Tool Layout component (`/src/components/ToolLayout.vue` or equivalent layout wrapper) to include a dynamic content slot underneath the interactive tool interface for Markdown-rendered SEO content.

Requirements:
1. Locate where the active tool UI component is rendered.
2. Add a dynamic `<div class="seo-article-wrapper mt-12 pt-8 border-t border-gray-200 dark:border-gray-800">` directly below the tool output area.
3. Integrate a lightweight Markdown renderer (such as `markdown-it` or `vue3-markdown-it`) to fetch and display the corresponding `.md` article file from a local content directory (`/src/content/tools/[tool-slug].md`).
4. Ensure full responsive styling, dark/light mode compatibility, clean typography classes for prose (H1, H2, H3, paragraphs, code blocks, tables, callouts).
5. Provide the exact code modifications and file path structure needed to implement this cleanly without breaking existing tool functionalities.
```

---

### 🔹 Prompt 1.2: إنشاء الترويسة والتذييل الاحترافي لـ AdSense (Header & Footer Component)
> **الهدف:** إنشاء هيدر وفوتر متوافقين مع شروط الثقة (E-E-A-T) والسياسات القانونية لجوجل.

```text
Act as a Senior Web Designer and Front-End Developer. Create clean, responsive Vue 3 components for the Site Header and Site Footer of our developer utility platform.

Header Requirements:
- Logo placeholder (Clean typography + SVG icon).
- Top category navigation links: "Converters", "Formatters", "Generators", "Security & Crypto", "Finance Calculators".
- Search Bar placeholder for quick tool lookup.
- Theme Toggle (Dark/Light mode).

Footer Requirements (Critical for Google AdSense Approval):
- Quick links to top categories.
- Essential Compliance Links: "About Us", "Editorial Policy", "Privacy Policy & Cookie Notice", "Terms of Service", "Contact Us", "Disclaimer".
- Copyright statement & security notice ("All computations happen 100% client-side in your browser").

Provide the full Vue 3 template, TypeScript setup script, and TailwindCSS utility classes.
```

---

## 📝 المرحلة الثانية: توليد المقالات الشارحة لـ 100+ أداة (SEO Article Prompts)

هذه البرومبتات مقسمة حسب الفئات الرئيسية للأدوات. قم بتشغيل البرومبت لكل مجموعة من الأدوات للحصول على مقالات متكاملة (1,000+ كلمة لكل أداة).

### 🔹 Prompt 2.1: برومبت أدوات التحويل (Converters Category Master Prompt)
> **الأدوات المغطاة:** Cron Expression, Base64, Color Converter, YAML to JSON, Integer Base Converter.

```text
Act as a Senior Systems Engineer and Technical Writer. Write a 1,000+ word technical guide in English for an online utility called "[INSERT_TOOL_NAME_HERE]".

Target Audience: Software developers, DevOps engineers, and IT administrators.
Primary Tone: Authoritative, practical, highly educational, and clear.

Structure the guide strictly as follows:
1. Title & Subtitle: High-intent SEO title featuring "[INSERT_TOOL_NAME_HERE]".
2. Quick Overview & Key Benefits (150 words): Define what the tool does, emphasizing 100% browser-based processing and privacy.
3. How to Use Step-by-Step (200 words): Clear, numbered instructions with practical input/output examples.
4. Technical Under the Hood (300 words): Detailed explanation of the underlying algorithm, specifications, data formats, or mathematical logic. Include code/syntax examples.
5. Real-World Use Cases (200 words): 3 practical scenarios faced by professionals in production environments.
6. Frequently Asked Questions (FAQs) (200 words): 4 common technical questions formatted in clear Q&A style.
7. Technical Accuracy Notice: Short statement verifying the tool's adherence to official standards.

Generate the article in clean Markdown syntax with H2/H3 headings.
```

---

### 🔹 Prompt 2.2: برومبت أدوات التنسيق والتدقيق (Formatters & Validators Master Prompt)
> **الأدوات المغطاة:** JSON Formatter, SQL Prettifier, XML Validator, HTML/CSS Minifier.

```text
Act as a Senior Full-Stack Developer and Technical SEO Content Writer. Generate a comprehensive 1,000+ word technical guide in Markdown for the "[INSERT_TOOL_NAME_HERE]" tool.

Key Requirements:
- Focus heavily on data formatting standards, syntax validation rules, edge-case error troubleshooting, and performance benefits.
- Explain why client-side formatting is essential for protecting sensitive credentials and confidential API responses.
- Include a comparison section: "Manual Formatting vs. Automated Browser Utilities".
- Include 4-5 schema-ready FAQs answering queries like "Why is my JSON invalid?", "How does client-side formatting preserve data security?", etc.
- Output pure Markdown suitable for direct inclusion under our tool UI.
```

---

### 🔹 Prompt 2.3: برومبت أدوات التوليد والهويات الرقمية (Generators Master Prompt)
> **الأدوات المغطاة:** UUID v4 Generator, Hash Generator (SHA256/MD5), Password Generator, QR Code Generator.

```text
Act as a Cybersecurity Expert and Technical Author. Write a detailed 1,000+ word technical manual for the "[INSERT_TOOL_NAME_HERE]" tool.

Focus Areas:
1. Cryptographic/Algorithmic principles behind [INSERT_TOOL_NAME_HERE] (e.g., randomness entropy, collision probability, RFC standards).
2. Step-by-step custom options configuration guide (length, character sets, bulk generation).
3. Security considerations: Client-side PRNG (Pseudo-Random Number Generator) security vs Server-Side generation.
4. Production application examples in web databases, API tokenization, and authentication.
5. 4 Detailed FAQs.

Ensure word count exceeds 1,000 words in polished Markdown.
```

---

### 🔹 Prompt 2.4: برومبت أدوات الأمن والتشفير (Security & Cryptography Master Prompt)
> **الأدوات المغطاة:** JWT Decoder, RSA Key Pair Generator, HMAC Generator, AES Encryption/Decryption.

```text
Act as a DevSecOps Lead and Security Educator. Draft an in-depth 1,200-word security guide for our online "[INSERT_TOOL_NAME_HERE]" utility.

Key Directives:
- Explain the payload, header, and signature structure (for JWTs) or cryptographic keys/ciphers (for RSA/AES).
- Emphasize the critical security advantage: "Zero-Knowledge Architecture - Keys & Secret Tokens Never Leave Local Memory".
- Walk through debugging common authentication errors and signature validation failures.
- Provide step-by-step instructions on verifying tokens and generating keys securely.
- Include 5 FAQs regarding token expiry, algorithm support, and secret storage best practices.
```

---

## 💰 المرحلة الثالثة: إضافة حاسبات التمويل ذات الـ CPC العالي (High-CPC Finance Calculators)

### 🔹 Prompt 3.1: بناء حاسبة الرهن العقاري (Vue 3 Component + 1,200 Word Guide)
> **الهدف:** بناء مكون حاسبة رهن عقاري كامل مع المقال المالي لجذب أعلى أسعار نقرة إعلانية (CPC $2.00 - $30.00+).

```text
Act as a Financial Software Engineer and Fintech Content Specialist.

Task: Build a complete, responsive Mortgage & Amortization Calculator component in Vue 3 (TypeScript + TailwindCSS), along with a 1,200-word financial guide in Markdown.

Component Specifications:
1. Inputs: Home Price ($), Down Payment ($ or %), Interest Rate (%), Loan Term (Years), Property Tax (%), Home Insurance ($/yr).
2. Outputs: Monthly Principal & Interest Payment, Total Interest Paid, Interactive Amortization Table (Yearly/Monthly breakdown).
3. Logic: Standard monthly amortization formula $M = P \frac{r(1+r)^n}{(1+r)^n - 1}$.

SEO Guide Specifications (1,200+ words Markdown):
1. Title: "Online Mortgage Calculator with Amortization Schedule".
2. Detailed breakdown of mortgage payment components (PITI: Principal, Interest, Taxes, Insurance).
3. Mathematical formula step-by-step breakdown.
4. Strategies for lowering total loan interest (extra payments, refinancing).
5. 5 Detailed FAQs on mortgage rates and loan qualification.
```

---

### 🔹 Prompt 3.2: بناء حاسبة الفائدة المركبة (Compound Interest Calculator)
> **الهدف:** أداة تمويل وتخطيط ادخار ذات أرباح إعلانات مرتفعة.

```text
Act as a Fintech Developer and Investment Writer. Create a Vue 3 Compound Interest Calculator component and a 1,000-word comprehensive investment guide.

Component Features:
- Inputs: Initial Investment ($), Monthly Contribution ($), Annual Interest Rate (%), Investment Horizon (Years), Compounding Frequency (Annually, Semi-Annually, Quarterly, Monthly).
- Outputs: Final Future Balance, Total Principal Deposited, Total Interest Earned, Year-by-Year Growth Table.

Markdown Article Content:
- The Power of Compound Interest & Time Value of Money ($A = P(1 + r/n)^{nt}$).
- Real-world comparisons: Simple Interest vs. Compound Interest.
- Detailed user walkthrough and financial planning strategies.
- 5 High-search-volume FAQs.
```

---

### 🔹 Prompt 3.3: بناء حاسبة أرباح أدسنس (Google AdSense Revenue Calculator)
> **الهدف:** أداة تجذب أصحاب المواقع والمدونات، وتزيد من معدل التفاعل داخل الموقع.

```text
Act as a Digital Monetization Analyst and Full-Stack Developer. Build a Vue 3 AdSense Revenue Estimator Component and a 1,000-word publisher monetization guide.

Component Features:
- Inputs: Daily Pageviews, Average Click-Through Rate (CTR %), Average Cost Per Click (CPC $), or Niche Category Selection (Automated RPM estimation).
- Outputs: Estimated Daily Earnings, Monthly Earnings, Yearly Revenue.

Markdown Article Content:
- How AdSense Monetization Works (CPM vs. CPC vs. Page RPM).
- Industry benchmarks for RPM/CPC across top niches (Finance, Tech, Lifestyle, Legal).
- Actionable guide: "How to Increase Your AdSense Revenue and Fix Low Value Content Warnings".
- 5 Monetization FAQs.
```

---

## 🛡️ المرحلة الرابعة: توليد صفحات الامتثال والسياسات (E-E-A-T & Compliance Pages)

### 🔹 Prompt 4.1: صفحة "من نحن" وسياستنا التحريرية (About Us & Editorial Policy)
> **الهدف:** بناء ثقة جوجل وإثبات الخبرة التقنية (E-E-A-T).

```text
Act as a Compliance Specialist and Tech Lead. Write a comprehensive 800-word "About Us & Editorial Principles" page for our global web utility platform "[YOUR_PLATFORM_NAME]".

Content Requirements:
1. Our Mission: Providing high-speed, free, browser-native utilities that empower developers, system admins, and businesses worldwide.
2. Privacy & Zero-Data-Collection Guarantee: Detailed technical explanation of how client-side WebAssembly/JavaScript execution ensures zero user data hits external servers.
3. Engineering Quality Standards: How our tools are tested against official RFC and W3C standards.
4. About the Engineering Team: Professional bio overview emphasizing software architecture experience.
5. Contact & Support Information.

Generate in clean, authoritative English formatted in Markdown.
```

---

### 🔹 Prompt 4.2: صفحة سياسة الخصوصية والكوكيز (AdSense-Compliant Privacy Policy)
> **الهدف:** استيفاء الشروط القانونية الصارمة لبرنامج Google AdSense وقوانين GDPR/CCPA.

```text
Act as an Internet Privacy Lawyer and AdSense Policy Consultant. Write a complete, legally compliant Privacy Policy & Cookie Declaration for our website "[YOUR_PLATFORM_NAME]".

Must Include Clauses For:
1. Log Files and Local Storage usage (Client-Side execution notice).
2. Google AdSense & DoubleClick DART Cookies (Third-party advertising notice and personalized ad opting-out links via Google Ads Settings).
3. GDPR (European Privacy Rights) and CCPA (California Consumer Privacy Act) compliance disclosures.
4. Third-Party Links & Analytics disclosures.
5. How users can contact us regarding privacy queries.

Output formatted in Markdown with clear sections.
```

---

### 🔹 Prompt 4.3: صفحة شروط الاستخدام وإخلاء المسؤولية (Terms of Service & Disclaimer)

```text
Act as a Corporate Legal Counsel. Write a formal Terms of Service and Disclaimer agreement for a free web tools and financial calculators site "[YOUR_PLATFORM_NAME]".

Key Disclaimers:
1. Financial Disclaimer: Explicit notice that financial calculators are for educational and estimation purposes only and do not constitute certified financial or legal advice.
2. Technical "As-Is" Warranties: Disclaimer of liability for any uptime interruption or data parsing errors.
3. Intellectual Property statement.
4. Acceptable Usage terms.

Output in professional Markdown.
```

---

## 🎯 المرحلة الخامسة: التهيئات البرمجية لـ SEO وأماكن الإعلانات والنشر (SEO & Deployment)

### 🔹 Prompt 5.1: توليد خريطة الموقع والـ Schema تلقائياً (Dynamic Sitemap & JSON-LD Schema)
> **الهدف:** مساعدة روبوتات جوجل على أرشفة الـ 100+ أداة فوراً.

```text
Act as a Technical SEO Engineer. Write a Node.js build script (`/scripts/generate-seo.js`) for our Vue 3 Vite project that automatically runs before deployment.

Script Tasks:
1. Read all tool routes and content files from `/src/content/tools/`.
2. Generate an XML Sitemap (`/public/sitemap.xml`) including all tool URLs, priority tags (0.8 - 1.0), and `<lastmod>` timestamps.
3. Generate a dynamic `robots.txt` file allowing full search indexing and linking to the sitemap.
4. Inject `SoftwareApplication` and `WebApplication` Schema.org JSON-LD structured data into the HTML head of each tool page.

Provide the complete Node.js script code and package execution instructions.
```

---

### 🔹 Prompt 5.2: أتمتة أماكن الإعلانات بدون تشويه تجربة المستخدم (AdSense Ad Placements)
> **الهدف:** وضع الشفرات الإعلانية بذكاء لتحقيق أعلى CTR دون التسبب في نقرات غير مقصودة أو رفض الموقع.

```text
Act as an AdSense Optimization Specialist and Front-End Developer.

Show us how to integrate Google AdSense responsive ad units into our Vue 3 Tool Layout without violating AdSense User Experience policies:

1. Top Ad Banner: Placed below tool title, above input controls (Leaderboard 728x90 or Responsive).
2. Sidebar Ad Unit: Sticky responsive rectangle (300x250) for desktop views.
3. In-Content Ad Unit: Placed dynamically inside the Markdown SEO article (after the 2nd H2 section).

Provide the Vue 3 component wrapper (`<AdSenseUnit />`) with handling for ad-blockers, layout shift prevention (CLS optimization), and environment checks (showing placeholder boxes in development mode).
```

---

### 🔹 Prompt 5.3: دليل النشر المجاني والسريع على Cloudflare Pages / Vercel

```text
Act as a DevOps Engineer. Provide a step-by-step deployment guide for deploying our Vue 3 IT-Tools platform to Cloudflare Pages or Vercel for FREE:

1. Build command configuration (`npm run build`).
2. Custom Domain setup (`.com` DNS records: CNAME / A records).
3. SSL/TLS Certificate configuration.
4. Cache Headers & HTTP/2 optimization.
5. Post-launch Google Search Console submission checklist.
```

---

## 📊 ملخص المخرجات وجدول المتابعة (Project Execution Checklist)

| المرحلة | المهام الرئيسية | الحالة | الأدوات المستعملة |
| :--- | :--- | :---: | :--- |
| **المرحلة 1** | استنساق الكود + توفير خانة المقالات الشارحة + الهيدر والفوتر | 🟩 جاهز | Vue 3 + Antigravity (Prompt 1.1, 1.2) |
| **المرحلة 2** | توليد المقالات الـ 100 للمطورين (Converters, Formatters, etc.) | 🔄 قيد التنفيذ | Antigravity (Prompts 2.1 - 2.4) |
| **المرحلة 3** | برومبتات وتطوير حاسبات التمويل ذات الـ CPC العالي | 🟩 جاهز | Vue 3 + Antigravity (Prompts 3.1 - 3.3) |
| **المرحلة 4** | توليد صفحات الثقة (About, Privacy, Terms, Disclaimer) | 🟩 جاهز | Antigravity (Prompts 4.1 - 4.3) |
| **المرحلة 5** | توليد Sitemap + Schema + إعلانات AdSense + النشر | 🟩 جاهز | Node.js + Cloudflare Pages (Prompts 5.1 - 5.3) |

---
