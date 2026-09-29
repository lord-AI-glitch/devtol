<script setup lang="ts">
import { ref, computed } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';
import {
  IconBook,
  IconShieldCheck,
  IconCpu,
  IconDatabase,
  IconPhoto,
  IconRegex,
  IconCalendar,
  IconClock,
  IconUser,
  IconArrowRight,
  IconArrowLeft,
  IconChevronDown,
  IconChevronUp,
} from '@tabler/icons-vue';

const { locale } = useI18n();
const isAr = computed(() => locale.value === 'ar');

useHead(computed(() => ({
  title: isAr.value
    ? 'أدلة ومقالات المطورين الهندسية — DevTol'
    : 'Developer Engineering Guides & Technical Architecture — DevTol',
  meta: [
    {
      name: 'description',
      content: isAr.value
        ? 'أدلة تقنية وهندسية متعمقة للمطورين: أمان توكنات JWT، هندسة الخصوصية في المتصفح، خوارزميات ضغط الصور، وتنسيق استعلامات SQL ومعايير RFC.'
        : 'In-depth technical and architectural guides for software engineers: JWT security, client-side zero-knowledge privacy, WebP compression algorithms, and SQL formatting standards.',
    },
    { property: 'og:title', content: isAr.value ? 'أدلة ومقالات المطورين الهندسية — DevTol' : 'Developer Engineering Guides — DevTol' },
    { property: 'og:type', content: 'article' },
  ],
})));

interface Guide {
  id: string;
  category: string;
  icon: any;
  color: string;
  readTime: string;
  date: string;
  author: string;
  titleEn: string;
  titleAr: string;
  excerptEn: string;
  excerptAr: string;
  contentEn: string;
  contentAr: string;
}

const activeGuideId = ref<string | null>(null);

function toggleGuide(id: string) {
  activeGuideId.value = activeGuideId.value === id ? null : id;
}

const guides: Guide[] = [
  {
    id: 'jwt-security-best-practices',
    category: 'Security & Cryptography',
    icon: IconShieldCheck,
    color: 'emerald',
    readTime: '8 min read',
    date: 'September 2026',
    author: 'DevTol Security Engineering Team',
    titleEn: 'The Definitive Guide to JWT Security: Cryptographic Verification & RFC 7519 Compliance',
    titleAr: 'الدليل الهندسي الشامل لأمان رموز JWT: التحقق التشفيري والامتثال لمعيار RFC 7519',
    excerptEn: 'Learn how JSON Web Tokens work under the hood, why algorithm confusion attacks happen, and how to verify cryptographic signatures strictly client-side.',
    excerptAr: 'تعرف على البنية العميقة لرموز JWT، وكيفية تجنب ثغرات التوقيع التشفيري (Algorithm Confusion)، ولماذا يجب فحص التوكنات محلياً دون تسريبها للخوادم.',
    contentEn: `### 1. The Architectural Structure of a JSON Web Token
JSON Web Tokens (JWT), standardized under IETF RFC 7519, are compact, URL-safe representations of claims transferred between two parties. Every standard compact JWT is partitioned into three Base64URL-encoded segments delimited by periods (\`.\`):

\`\`\`
[ Header (Base64URL) ] . [ Payload Claims (Base64URL) ] . [ Cryptographic Signature ]
\`\`\`

1. **JOSE Header**: Specifies the token type (\`typ: "JWT"\`) and cryptographic algorithm used to sign the token (\`alg\`), such as \`HS256\` (HMAC SHA-256 symmetric), \`RS256\` (RSA SHA-256 asymmetric), or \`ES256\` (ECDSA).
2. **Payload Claims**: Contains identity metadata, permissions, and security lifecycle parameters. These include Registered Claims defined by RFC 7519:
   - \`iss\` (Issuer): Identifies the authorization authority.
   - \`sub\` (Subject): Identifies the unique principal/user ID.
   - \`aud\` (Audience): Restricts the intended recipient services.
   - \`exp\` (Expiration Time): Unix epoch timestamp after which the token is invalid.
   - \`nbf\` (Not Before) & \`iat\` (Issued At): Temporal validity boundaries.
3. **Cryptographic Signature**: Calculated by hashing the encoded header and payload with a cryptographic secret or private key. The signature prevents tampering; modifying even a single character in the payload invalidates the signature verification mathematically.

### 2. Critical Security Vulnerabilities to Avoid
- **The "alg: none" Vulnerability**: Early naive JWT verification libraries allowed attackers to craft malicious payloads, set \`"alg": "none"\`, omit the signature, and bypass authentication completely. Always enforce an explicit algorithm whitelist on your backend verifiers.
- **HMAC / RSA Key Confusion**: If a backend expects an RSA public key for verification, attackers can sometimes pass the public key string to an HMAC verification routine as the secret, forging valid signatures.
- **Client-Side Secret Leakage**: Never paste production JWT signing secrets into public cloud-based debuggers. DevTol executes JWT parsing and signature calculation 100% within your local browser sandbox, guaranteeing your production signing secrets never leave your workstation.`,
    contentAr: `### 1. الهيكل المعماري لرموز JSON Web Token
تعتبر رموز JWT، المعتمدة رسمياً بموجب معيار IETF RFC 7519، وسيلة مدمجة وآمنة لنقل البيانات والادعاءات الرقمية بين الأطراف. يتكون أي رمز JWT قياسي من ثلاثة أجزاء مفصولة بنقاط (\`.\`):

\`\`\`
[ ترويسة JOSE ] . [ البيانات والادعاءات Payload ] . [ التوقيع الرقمي التشفيري ]
\`\`\`

1. **الترويسة (Header)**: تحدد نوع الرمز والخوارزمية التشفيرية المستخدمة (\`alg\`)، مثل \`HS256\` أو \`RS256\`.
2. **البيانات (Payload)**: تحتوي على بيانات المستخدم والصلاحيات ومحددات الصلاحية الزمنية وفق معايير RFC، مثل تاريخ الانتهاء (\`exp\`)، والمُصدر (\`iss\`)، والمعرّف (\`sub\`).
3. **التوقيع التشفيري (Signature)**: يُحسب عبر تشفير الترويسة والبيانات بمفتاح سري. تعديل حرف واحد في البيانات يبطل التوقيع التشفيري فوراً.

### 2. أهم المحاذير الأمنية
- **ثغرة alg: none**: يجب على المطورين إلغاء قبول الخوارزميات غير المحددة في الواجهات الخلفية (Backend Whitelisting).
- **أمان فحص التوكن**: تجنب لصق رموز التوكن الحساسة أو المفاتيح السرية في مواقع فحص سحابية؛ في DevTol تتم عملية الفك والتحقق محلياً 100% داخل المتصفح بأمان مطلق.`,
  },
  {
    id: 'client-side-privacy-architecture',
    category: 'Architecture & Privacy',
    icon: IconCpu,
    color: 'indigo',
    readTime: '7 min read',
    date: 'September 2026',
    author: 'Corentin Thomasset & DevTol Architecture Board',
    titleEn: 'Client-Side Zero-Knowledge Architecture: Why Modern Engineering Teams Avoid Cloud Converters',
    titleAr: 'هندسة الحوسبة المحلية صفرية المعرفة: لماذا تتجنب الفرق الهندسية المحولات السحابية',
    excerptEn: 'An architectural deep-dive into how WebAssembly, the Web Crypto API, and browser sandboxes allow developers to execute data transformations with zero server exposure.',
    excerptAr: 'نظرة هندسية معمقة حول كيفية توظيف تقنيات WebAssembly و Web Crypto API لمعالجة البيانات الحساسة محلياً دون إرسالها للخوادم.',
    contentEn: `### 1. The Hidden Risks of Cloud-Hosted Utilities
For over a decade, developers searching for quick tools—such as formatting a JSON payload, generating a bcrypt hash, or decoding a Base64 string—routinely copied sensitive data and pasted it into third-party web tools. 

In enterprise environments, this practice introduces severe corporate liabilities:
- **Accidental PII Exposure**: Configuration files and JSON dumps routinely contain live user email addresses, billing metadata, and internal IP addresses.
- **Secret & Key Leakage**: API tokens, database connection strings, and RSA private keys pasted into cloud formatters are stored in web server access logs, reverse proxies, and third-party caching layers.
- **Regulatory Non-Compliance**: Transmitting personal data to unvetted cloud hosts directly violates GDPR Article 25 (Data Protection by Design and by Default) and HIPAA physical safeguards.

### 2. The Modern Browser as an Execution Sandbox
Modern web browsers (Chromium, Firefox, WebKit) have evolved into high-performance execution environments:
- **Web Crypto API (SubtleCrypto)**: Provides hardware-accelerated cryptographic primitives directly through native browser engine C++ implementations. Operations like SHA-256, HMAC, and AES encryption execute in sub-millisecond timeframes without third-party network roundtrips.
- **WebAssembly (Wasm)**: Allows compiled binary engines (C, Rust, Go) to run at near-native speeds inside the browser. DevTol leverages Wasm for intensive operations like client-side PDF document manipulation and image quantization.
- **Web Workers**: Enables asynchronous multi-threading, keeping the user interface completely responsive during heavy algorithmic calculations like large text diffs or massive JSON parsing.

By designing DevTol as a 100% client-side platform, we prove that developer productivity and zero-compromise enterprise security can coexist seamlessly.`,
    contentAr: `### 1. المخاطر الخفية للمحولات السحابية التقليدية
لسنوات طويلة، اعتاد المطورون نسخ البيانات الحساسة (مثل استعلامات قواعد البيانات، أو شفرات التوكن، أو ملفات التكوين) ولصقها في مواقع تحويل سحابية سريعة. يترتب على ذلك مخاطر جسيمة:
- تسريب السجلات ومفاتيح الوصول في خوادم وسيطة غير مؤمنة.
- انتهاك معايير الخصوصية العالمية مثل GDPR و HIPAA نتيجة نقل بيانات العملاء لخوادم مجهولة.

### 2. المتصفح الحديث كبيئة تشغيل معزولة وفائقة الأمان
توظف منصة DevTol أحدث إمكانيات محركات الويب الحديثة:
- **واجهة Web Crypto API**: تنفيذ خوارزميات التشفير والتجزئة (SHA, HMAC, AES) عبر معالج جهازك مباشرة بأعلى سرعة وأمان.
- **تقنية WebAssembly**: تشغيل محركات برمجية مجمعة من Rust و C داخل المتصفح لمعالجة ملفات PDF وضغط الصور محلياً.
- **انعدام المسار الخلفي (Zero Backend Retention)**: بياناتك تظل حكراً على ذاكرة جهازك المؤقتة، وتتبخر بمجرد إغلاق لسان المتصفح.`,
  },
  {
    id: 'sql-formatting-standards',
    category: 'Databases & Infrastructure',
    icon: IconDatabase,
    color: 'amber',
    readTime: '6 min read',
    date: 'September 2026',
    author: 'DevTol Database Architecture Guild',
    titleEn: 'The Database Engineer\'s SQL Formatting & Style Guide: Readability, AST Normalization & Query Optimization',
    titleAr: 'دليل مهندس قواعد البيانات لتنسيق وصياغة استعلامات SQL: المعايير، سهولة القراءة، وتحليل خطط التنفيذ',
    excerptEn: 'Best practices for organizing complex relational queries, formatting Common Table Expressions (CTEs), and optimizing execution plan readability.',
    excerptAr: 'أفضل الممارسات البرمجية لهندسة استعلامات SQL المعقدة، وتنسيق التعبيرات الجدولية العامة (CTEs)، وتبسيط قراءة خطط التنفيذ البرمجية.',
    contentEn: `### 1. Why SQL Formatting is an Engineering Discipline
In relational database systems, SQL is declarative: it defines *what* data to retrieve, leaving *how* to retrieve it to the query planner. However, poorly formatted SQL code—with arbitrary line breaks, inconsistent casing, and unaligned join predicates—creates severe engineering friction:
- **Obfuscated Query Logic**: Developers miss missing join conditions (causing catastrophic Cartesian cross-joins).
- **Hard-to-Audit Pull Requests**: Unformatted SQL creates massive noisy diffs in Git history.
- **Complex EXPLAIN Plan Debugging**: Identifying bottlenecks in 500-line stored procedures is impossible when subqueries are crammed into single lines.

### 2. The Core Rules of Idiomatic SQL Formatting
1. **Keyword Capitalization**: Reserve uppercase strictly for ANSI SQL keywords (\`SELECT\`, \`FROM\`, \`WHERE\`, \`LEFT JOIN\`, \`GROUP BY\`, \`ORDER BY\`). Keep user-defined identifiers (tables, columns) in snake_case.
2. **Left-Aligned Primary Clauses**: Align major clauses to create a clear vertical visual spine down the left edge of the query.
3. **Independent Predicate Lines**: In \`WHERE\` and \`HAVING\` clauses, place each boolean predicate (\`AND\`, \`OR\`) on its own indented line to facilitate commenting out conditions during debugging.
4. **Common Table Expressions (CTEs)**: Prefer CTEs (\`WITH\` clauses) over deeply nested subqueries to improve modularity and execution readability.`,
    contentAr: `### 1. أهمية التنسيق القياسي لاستعلامات SQL
تعتبر لغة SQL لغة تصريحية تعبر عن منطق استرجاع البيانات. كتابة استعلامات غير منسقة يؤدي إلى:
- صعوبة اكتشاف الأخطاء البرمجية (مثل نسيان شروط الربط مما يسبب Cartesian Joins).
- صعوبة مراجعة التغييرات (Code Reviews) في منصات التحكم بالإصدارات Git.

### 2. القواعد الذهبية لتنسيق استعلامات SQL
1. **توحيد حالة الأحرف**: استخدام الحروف الكبيرة للكلمات المفتاحية المحجوزة (\`SELECT, FROM, WHERE, JOIN\`).
2. **محاذاة العبارات الأساسية**: وضع كل عبارة رئيسية على سطر مستقل لتحقيق تسلسل بصري واضح.
3. **فصل الشروط المنطقية**: وضع كل شرط (\`AND, OR\`) في سطر منفصل لتسهيل التجربة والتصحيح.
4. **استخدام التعبيرات الجدولية (CTEs)**: تفضيل استخدام \`WITH\` على الاستعلامات الفرعية المتداخلة المعقدة.`,
  },
  {
    id: 'image-compression-algorithms',
    category: 'Web Performance & Media',
    icon: IconPhoto,
    color: 'sky',
    readTime: '7 min read',
    date: 'September 2026',
    author: 'DevTol Web Performance Team',
    titleEn: 'Mastering Client-Side Image Compression: Canvas Quantization, Lossless WebP & Core Web Vitals',
    titleAr: 'هندسة ضغط الصور محلياً في المتصفح: تحسين مؤشرات Core Web Vitals وتوفير استهلاك البيانات',
    excerptEn: 'An algorithmic explanation of image compression in the browser, color quantization, and how proper WebP optimization elevates Largest Contentful Paint (LCP) scores.',
    excerptAr: 'شرح خوارزميات ضغط الصور داخل المتصفح، وتحويلها لصيغة WebP الحديثة، وأثر ذلك المباشر على تحسين سرعة تحميل الموقع ومؤشر LCP.',
    contentEn: `### 1. Images as the Primary Bottleneck of Web Performance
According to HTTP Archive data, images account for more than 50% of the total byte weight of average web pages. Unoptimized hero banners, large PNG screenshots, and legacy JPEG assets are the single largest contributor to slow **Largest Contentful Paint (LCP)** scores in Google's Core Web Vitals.

### 2. How Client-Side Browser Compression Works
DevTol's Image Compressor and WebP Converter utilize the browser's native **HTML5 Canvas 2D Context** and WebAssembly decoders:
1. **Rasterization**: The source image file is loaded into an in-memory \`ImageBitmap\` or \`HTMLImageElement\`.
2. **Dimension Constraints**: If the image exceeds optimal display resolutions (e.g., 4K or 8K mobile camera uploads), dimensions are scaled with high-quality bicubic interpolation.
3. **Quantization & Encoding**: The image data is re-encoded using \`canvas.toBlob('image/webp', quality)\`. WebP's predictive coding compresses spatial frequency data with dramatically higher efficiency than legacy JPEG, achieving 30% to 50% smaller file sizes at identical visual fidelity.
4. **Zero Server Roundtrip**: Because the entire process happens in GPU/CPU memory on the client, large 20MB photos are compressed in milliseconds without consuming cellular data or exposing personal photos to cloud storage buckets.`,
    contentAr: `### 1. الصور كأكبر عائق لسرعة الويب
تشير إحصائيات الويب العالمية إلى أن الصور تمثل أكثر من 50% من إجمالي حجم صفحات الإنترنت. استخدام صور غير مضغوطة هو السبب الرئيسي لتراجع مؤشر **Largest Contentful Paint (LCP)** في تقييمات جوجل.

### 2. خوارزميات الضغط المحلي في المتصفح
يعتمد ضاغط الصور ومحول WebP في DevTol على تقنيات المتصفح المتقدمة:
1. **المعالجة عبر الـ Canvas**: فك تشفير الصورة محلياً وتحجيم أبعادها بدقة رياضية متناهية.
2. **الترميز الحديث (WebP Encoding)**: استبدال صيغ JPEG القديمة بصيغة WebP ذات الكفاءة العالية التي توفر من 30% إلى 50% من حجم الملف مع الحفاظ التام على جودة المشاهدة.
3. **سرعة وفورية تامة**: معالجة صور بحجم 20 ميجابايت تتم في أجزاء من الثانية محلياً دون رفعها لأي مخدم خارجي.`,
  },
  {
    id: 'regex-optimization-redos-prevention',
    category: 'Software Engineering',
    icon: IconRegex,
    color: 'rose',
    readTime: '6 min read',
    date: 'September 2026',
    author: 'DevTol Runtime & Compilers Working Group',
    titleEn: 'The Modern Regular Expressions Guide: Engine Mechanics, Optimization & ReDoS Prevention',
    titleAr: 'دليل التعبيرات النمطية (Regex): هندسة المحركات، تحسين الأداء، والوقاية من هجمات ReDoS',
    excerptEn: 'Deep-dive into NFA backtracking mechanics, catastrophic backtracking vulnerabilities, and how to write high-throughput, secure regular expressions.',
    excerptAr: 'فهم عميق لآليات عمل محركات التعبيرات النمطية، وكيفية تجنب ثغرات التراجع الكارثي (Catastrophic Backtracking) وحماية الخوادم من التوقف.',
    contentEn: `### 1. How Regular Expression Engines Execute
Most programming runtimes (JavaScript V8, Python, PCRE, Java) implement Non-deterministic Finite Automaton (NFA) engines. NFAs are expressive and support advanced features like lookaheads, lookbehinds, and backreferences, but they rely on **backtracking** when a match branch fails.

### 2. Understanding Regular Expression Denial of Service (ReDoS)
When an expression contains nested quantifiers with overlapping match paths (such as \`^(a+)+$\` or \`([a-zA-Z0-9]+)*\`), the number of execution steps required to reject an invalid string scales **exponentially** ($O(2^n)$):
- For a matching string of 20 characters: ~20 steps.
- For a non-matching string of 30 characters: Over 1,000,000,000 backtracking evaluations!
This causes the JavaScript event loop or backend CPU core to spike to 100% utilization, freezing the application.

### 3. Best Practices for High-Performance Regex
1. **Anchor Your Expressions**: Always use \`^\` (start of string) and \`$\` (end of string) where applicable to prevent the engine from re-testing the pattern at every character offset.
2. **Avoid Overlapping Alternatives**: Ensure alternatives in \`(...|...)\` are mutually exclusive.
3. **Prefer Native String Methods**: For simple substring lookups or prefix checks, standard methods like \`str.startsWith()\` or \`str.includes()\` are up to 10x faster than compiling regular expressions.`,
    contentAr: `### 1. كيف تعمل محركات التعبيرات النمطية
تعتمد معظم لغات البرمجة على محركات NFA التي تتميز بالمرونة ولكنها تعتمد على خاصية **التراجع (Backtracking)** عند فشل مسار المطابقة.

### 2. خطورة هجمات ReDoS (تعطيل الخدمة عبر Regex)
عند كتابة تعبير نمطي يحتوي على مضاعفات متداخلة غير منضبطة (مثل \`^(a+)+$\`)، يتضاعف عدد خطوات المعالجة بشكل أسي ($O(2^n)$) عند محاولة فحص نص غير مطابق، مما يؤدي إلى تجميد معالج الخادم أو المتصفح بنسبة 100%.

### 3. نصائح الأداء والأمان
1. **تثبيت البداية والنهاية**: استخدام الرمزين \`^\` و \`$\` لتحديد نطاق البحث ومنع تكرار الفحص عبر النص.
2. **استخدام الدوال النصية المباشرة**: في عمليات البحث البسيطة، استخدام \`includes\` أو \`startsWith\` أسرع بعدة أضعاف من بناء تعبير نمطي معقد.`,
  },
];
</script>

<template>
  <div class="guides-container max-w-5xl mx-auto px-4 sm:px-6 py-10">
    <!-- Breadcrumb -->
    <nav class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 mb-6">
      <RouterLink :to="isAr ? '/ar' : '/'" class="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
        {{ isAr ? 'الرئيسية' : 'Home' }}
      </RouterLink>
      <span>/</span>
      <span class="text-slate-900 dark:text-white font-medium">
        {{ isAr ? 'أدلة ومقالات المطورين' : 'Developer Guides' }}
      </span>
    </nav>

    <!-- Page Header -->
    <div class="mb-12">
      <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 mb-3">
        <n-icon :component="IconBook" size="16" />
        <span>{{ isAr ? 'مركز المعرفة التحريرية والهندسة البرمجية' : 'Engineering Knowledge Hub & Architecture' }}</span>
      </div>
      <h1 class="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        {{ isAr ? 'أدلة المطورين والمقالات المعمارية' : 'Developer Engineering Guides & Technical Articles' }}
      </h1>
      <p class="mt-3 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-3xl leading-relaxed">
        {{ isAr 
          ? 'مقالات وأدلة هندسية متعمقة موثقة بأمثلة الكود ومعايير RFC لمساعدة المطورين والمصممين على بناء أنظمة ويب آمنة وعالية الأداء مع ضمان الخصوصية التامة.' 
          : 'Authoritative, in-depth technical guides with code examples, RFC specifications, and architectural analysis to help engineers build fast, compliant, and privacy-first web systems.' 
        }}
      </p>
    </div>

    <!-- Guides List -->
    <div class="space-y-6">
      <article
        v-for="guide in guides"
        :key="guide.id"
        class="guide-card rounded-2xl border transition-all duration-200 overflow-hidden"
        :class="activeGuideId === guide.id
          ? 'border-indigo-500/40 bg-white dark:bg-slate-900/90 shadow-lg ring-1 ring-indigo-500/20'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs'"
      >
        <!-- Card Header (Clickable) -->
        <div
          class="p-6 cursor-pointer select-none"
          @click="toggleGuide(guide.id)"
        >
          <div class="flex items-center gap-3 mb-3 flex-wrap">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <n-icon :component="guide.icon" size="14" />
              <span>{{ guide.category }}</span>
            </span>

            <span class="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
              <n-icon :component="IconClock" size="14" />
              <span>{{ guide.readTime }}</span>
            </span>

            <span class="inline-flex items-center gap-1 text-xs text-slate-400 font-mono">
              <n-icon :component="IconCalendar" size="14" />
              <span>{{ guide.date }}</span>
            </span>
          </div>

          <h2 class="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white leading-snug">
            {{ isAr ? guide.titleAr : guide.titleEn }}
          </h2>

          <p class="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-400 leading-relaxed">
            {{ isAr ? guide.excerptAr : guide.excerptEn }}
          </p>

          <div class="mt-4 flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800/80">
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <n-icon :component="IconUser" size="15" />
              <span>{{ guide.author }}</span>
            </div>

            <div class="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400">
              <span>{{ activeGuideId === guide.id ? (isAr ? 'إخفاء المقال الكامل' : 'Collapse Article') : (isAr ? 'قراءة المقال الكامل' : 'Read Full Guide') }}</span>
              <n-icon :component="activeGuideId === guide.id ? IconChevronUp : IconChevronDown" size="16" />
            </div>
          </div>
        </div>

        <!-- Expanded Full Content -->
        <div
          v-if="activeGuideId === guide.id"
          class="px-6 pb-8 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40"
        >
          <div class="prose dark:prose-invert max-w-none text-slate-700 dark:text-slate-300 leading-relaxed text-sm sm:text-base space-y-4 pt-4">
            <div
              class="whitespace-pre-line"
              v-html="(isAr ? guide.contentAr : guide.contentEn).replace(/### (.*?)\n/g, '<h3 class=\x22text-lg sm:text-xl font-bold text-slate-900 dark:text-white mt-6 mb-2\x22>$1</h3>').replace(/```([\s\S]*?)```/g, '<pre class=\x22p-4 rounded-xl bg-slate-900 text-slate-100 text-xs sm:text-sm font-mono overflow-x-auto my-3\x22><code>$1</code></pre>')"
            ></div>
          </div>

          <div class="mt-8 pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <span class="text-xs text-slate-400">
              {{ isAr ? 'المحتوى منشور ومراجع من قِبل الفريق الهندسي لـ DevTol' : 'Published and peer-reviewed by DevTol Engineering Team' }}
            </span>
            <button
              class="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
              @click="toggleGuide(guide.id)"
            >
              {{ isAr ? '↑ العودة للأعلى' : '↑ Back to top' }}
            </button>
          </div>
        </div>
      </article>
    </div>
  </div>
</template>

<style scoped>
.guides-container {
  contain: content;
}
</style>
