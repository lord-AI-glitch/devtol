<script setup lang="ts">
import { computed } from 'vue';
import { useHead } from '@vueuse/head';
import { useI18n } from 'vue-i18n';

const { locale } = useI18n();
const isAr = computed(() => locale.value === 'ar');

useHead(computed(() => ({
  title: isAr.value
    ? 'من نحن والمعايير الهندسية التحريرية — DevTol'
    : 'About Us & Editorial Standards — DevTol',
  meta: [
    {
      name: 'description',
      content: isAr.value
        ? 'تعرف على الفريق الهندسي، ورسالة منصة DevTol، وحوسبة الخصوصية المحلية 100%، ومعايير الجودة والاعتماد التحريري E-E-A-T.'
        : 'Learn about the engineering team, mission, privacy-first client-side architecture, and E-E-A-T editorial standards behind DevTol.',
    },
  ],
})));

const teamMembersEn = [
  {
    name: 'DevTol Core Architecture & Engineering Team',
    role: 'Platform Leadership & Systems Engineering',
    bio: 'Senior full-stack and systems engineers specializing in high-performance client-side web computing, WebAssembly compilation, Web Crypto implementations, and distributed edge architectures.',
    focus: 'Vue 3, TypeScript, WebAssembly, Web Crypto API, Edge Networking & Zero-Knowledge Privacy',
  },
  {
    name: 'Security & RFC Compliance Guild',
    role: 'Cryptographic Standards & Verification',
    bio: 'Independent security engineers and technical contributors who audit client-side cryptographic primitives, verify mathematical correctness, and ensure compliance with official IETF RFC and NIST standards.',
    focus: 'RFC 7519 (JWT), RFC 4648 (Base64), RFC 4122/9562 (UUID), FIPS PUB 180-4 (SHA/HMAC Cryptography)',
  },
];

const teamMembersAr = [
  {
    name: 'فريق المعمارية الهندسية الأساسي لمنصة DevTol',
    role: 'القيادة الهندسية وتطوير النظم',
    bio: 'مهندسو نظم وبرمجيات متخصصون في الحوسبة فائقة الأداء من جانب العميل، وترجمة محركات WebAssembly، وتطبيقات Web Crypto، وشبكات الحافة السحابية الموزعة.',
    focus: 'Vue 3، TypeScript، تقنية WebAssembly، واجهات Web Crypto، ومعمارية الخصوصية صفرية المعرفة',
  },
  {
    name: 'فريق تدقيق الأمان والامتثال لمعايير RFC',
    role: 'معايير التشفير والتحقق الرياضي',
    bio: 'مهندسو أمن برمجيات ومراجعون تقنيون مستقلون يدققون خوارزميات التشفير المحلية، ويتحققون من الدقة الحسابية والامتثال للمواصفات القياسية الرسمية لمنظمات IETF و NIST.',
    focus: 'RFC 7519 (رموز JWT)، RFC 4648 (ترميز Base64)، RFC 4122/9562 (معرفات UUID)، FIPS PUB 180-4 (تشفير SHA/HMAC)',
  },
];

const pillarsEn = [
  {
    title: 'Client-Side Privacy First',
    desc: 'All utilities execute strictly within your local browser sandbox. No server transmission, zero logging of confidential secrets.',
    icon: '🔒',
  },
  {
    title: 'Adherence to RFC Standards',
    desc: 'Every algorithm, parser, and generator strictly follows official IETF, POSIX, and NIST technical specifications.',
    icon: '📜',
  },
  {
    title: 'Zero Latency & Offline Capable',
    desc: 'Designed as a responsive Progressive Web Application (PWA) that operates instantly without network dependency.',
    icon: '⚡',
  },
  {
    title: 'E-E-A-T Editorial Integrity',
    desc: 'Technical guides are authored and peer-reviewed by practitioners with real-world engineering and software development experience.',
    icon: '🎓',
  },
];

const pillarsAr = [
  {
    title: 'أولوية مطلقة للخصوصية المحلية',
    desc: 'تُنفّذ كافة الأدوات داخل رمال المتصفح المعزولة في جهازك. انعدام تام لنقل البيانات إلى خوادم وسيطة، وصفر تسجيل للمفاتيح الحساسة.',
    icon: '🔒',
  },
  {
    title: 'امتثال صارم لمواصفات RFC القياسية',
    desc: 'كل خوارزمية، ومحلل نصوص، ومولد برمجي يتبع بدقة المواصفات الرسمية لمنظمات IETF و POSIX و NIST العالمية.',
    icon: '📜',
  },
  {
    title: 'سرعة فائقة وعمل بدون إنترنت',
    desc: 'تم بناء المنصة كتطبيق ويب تقدمي (PWA) فوري الاستجابة يعمل بكفاءة تامة دون الحاجة لاتصال مستمر بالشبكة.',
    icon: '⚡',
  },
  {
    title: 'معايير النشر والجودة التحريرية E-E-A-T',
    desc: 'تتم كتابة ومراجعة الأدلة الهندسية بواسطة ممارسين تقنيين يمتلكون خبرة برمجية وإنتاجية عملية مثبتة.',
    icon: '🎓',
  },
];
</script>

<template>
  <div class="about-container" :dir="isAr ? 'rtl' : 'ltr'">
    <div class="about-card">
      <!-- Header -->
      <div class="text-center mb-10">
        <h1 class="text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {{ isAr ? 'عن منصة DevTol' : 'About DevTol' }}
        </h1>
        <p class="text-lg text-primary font-medium mt-2">
          {{ isAr
            ? 'حرفية هندسية، وحوسبة محلية آمنة، وأدوات إنتاجية متقدمة للمطورين والمصممين'
            : 'Engineering Craftsmanship, Privacy-First Architecture & Rigorous Developer Utilities'
          }}
        </p>
      </div>

      <!-- Content (Arabic) -->
      <div v-if="isAr" class="space-y-8 text-slate-600 dark:text-neutral-300 leading-relaxed text-right">
        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">رسالتنا وهويتنا الهندسية</h2>
          <p>
            تأسست <strong>منصة DevTol</strong> لحل معضلة متجذرة في بيئات تطوير البرمجيات المعاصرة: انتشار مواقع الأدوات السحابية المليئة بالإعلانات المزعجة، والتي تتطلب رفع شفرات المطورين، واستعلامات قواعد البيانات، ورموز التوكن الحساسة إلى خوادم سحابية مجهولة لمعالجتها.
          </p>
          <p class="mt-3">
            في بيئات العمل التقنية والمؤسسية، يترتب على استخدام المحولات السحابية التقليدية مخاطر جسيمة تتعلق بتسريب البيانات ومخالفة لوائح حماية البيانات والخصوصية مثل GDPR و HIPAA. ولذا، صُممت منصة DevTol وفق فلسفة معمارية صارمة: <strong>المعالجة المحلية الكاملة من جانب العميل بنسبة 100%</strong>. من خلال تسخير أحدث إمكانيات محركات المتصفحات الحديثة، وتقنيات WebAssembly و Web Workers و Web Crypto API، تتم كافة العمليات الحسابية والتشفيرية محلياً في ذاكرة جهازك المؤقتة وتتبخر بمجرد إغلاق الصفحة دون أن تلامس خوادم خارجية.
          </p>
          <p class="mt-3">
            انطلاقاً من الاحترام البالغ لمجتمع البرمجيات الحرة ومبادرات المصادر المفتوحة التي قدمت حجر الأساس الأول لبعض أدوات الويب (مثل مشروع it-tools تحت ترخيص MIT)، قام الفريق الهندسي في DevTol بإعادة بناء المنصة بالكامل، وتوسيعها بأكثر من 30 أداة حصرية مطورة خصيصاً للمنصة (مثل حاسبات استهلاك نماذج الذكاء الاصطناعي، ونماذج تقدير عوائد الإعلانات البرمجية، ومجموعة أدوات معالجة ملفات PDF محلياً، ومحللات استعلامات SQL متعددة اللهجات)، مدعومة بتوثيق هندسي عميق بعشر لغات عالمية.
          </p>
        </section>

        <!-- Pillars Grid -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div v-for="p in pillarsAr" :key="p.title" class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/60 flex flex-col">
            <div class="text-3xl mb-2">{{ p.icon }}</div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{{ p.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-neutral-400">{{ p.desc }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">الالتزام بمعايير الجودة والمصداقية التحريرية (E-E-A-T)</h2>
          <p>
            امتثالاً لدليل مقيمي جودة البحث الصادر عن جوجل <strong>E-E-A-T (الخبرة، التخصص، المصداقية، والموثوقية)</strong>، تلتزم منصة DevTol بتوفير توثيق هندسي رصين ومدقق علمياً يصاحب كل أداة برمجية:
          </p>
          <div class="bg-slate-100 dark:bg-neutral-800/40 p-5 rounded-lg border border-slate-200 dark:border-neutral-700/70 mt-3 space-y-2">
            <p><strong>الخبرة العملية (Experience):</strong> محتوانا الهندسي يكتبه ويراجعه ممارسون تقنيون ذوو خبرة ميدانية في بناء وإدارة البنى السحابية الموزعة وبوابات التحقق وقواعد البيانات الإنتاجية.</p>
            <p><strong>التخصص العلمي (Expertise):</strong> تتم مراجعة كافة المعادلات الرياضية ومقتطفات الشفرات بالرجوع المباشر إلى وثائق RFC الرسمية (مثل IETF RFC 7519 لرموز JWT، و RFC 4648 لترميز Base64، و RFC 4122/9562 لمعرفات UUID، ومعايير POSIX IEEE 1003.1 لجدولة المهام).</p>
            <p><strong>المصداقية والأثر (Authoritativeness):</strong> تحظى أدواتنا بانتشار وثقة مجتمعات المطورين والفرق الهندسية حول العالم بفضل شفافيتها وسرعتها الفائقة.</p>
            <p><strong>الموثوقية والشفافية (Trustworthiness):</strong> الشفرات البرمجية متاحة للاطلاع والمراجعة تحت ترخيص MIT المفتوح، مما يمكن مسؤولي الأمان من فحص منطق التنفيذ والاطمئنان التام لخلوه من أي جمع للبيانات.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">الهيكل الهندسي وفريق الإشراف الفني</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="m in teamMembersAr" :key="m.name" class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ m.name }}</h3>
              <p class="text-xs text-primary font-semibold mb-2">{{ m.role }}</p>
              <p class="text-sm text-slate-600 dark:text-neutral-300 mb-3">{{ m.bio }}</p>
              <div class="text-xs text-slate-500 dark:text-neutral-400">
                <span class="font-semibold text-slate-600 dark:text-neutral-300">نطاق التركيز:</span> {{ m.focus }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">الشفافية وقنوات التواصل المباشرة</h2>
          <p>
            نؤمن بأن أدوات المطورين يجب أن تكون آمنة، وشفافة، وقابلة للتدقيق. نرحب دائماً بملاحظاتكم، واقتراحات إضافة أدوات جديدة، وتقارير الإفصاح الأمني المسؤول عبر قنوات التواصل المباشرة الموضحة في صفحة الاتصال:
            <a href="/contact" class="text-primary font-medium hover:underline mx-1">صفحة اتصل بنا</a>
            أو عبر البريد الرسمي:
            <a href="mailto:support@devtol.online" class="text-primary font-medium hover:underline mx-1">support@devtol.online</a>.
          </p>
        </section>
      </div>

      <!-- Content (English) -->
      <div v-else class="space-y-8 text-slate-600 dark:text-neutral-300 leading-relaxed text-left">
        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Our Mission & Engineering Pedigree</h2>
          <p>
            <strong>DevTol</strong> was engineered to solve a pervasive problem in modern software engineering: the proliferation of cloud-dependent, ad-saturated, and privacy-invasive web utilities.
          </p>
          <p class="mt-3">
            Traditional online converters routinely upload proprietary code, internal database queries, confidential API tokens, and sensitive customer records to remote backend servers for processing. This creates catastrophic data leakage liabilities, unauthorized logging, and violations of regulatory frameworks such as GDPR and HIPAA.
          </p>
          <p class="mt-3">
            DevTol operates on a zero-compromise architectural premise: <strong>100% Local Client-Side Execution</strong>. By leveraging modern browser engines, WebAssembly compilation, Web Workers, and the Web Crypto API, all data transformations execute strictly in your workstation's volatile memory and vanish upon closing the tab without touching external servers.
          </p>
          <p class="mt-3">
            While proudly honoring open-source software foundations (including foundational utilities derived from the open-source it-tools MIT ecosystem), DevTol has been completely re-architected, optimized, and expanded into an enterprise-grade developer platform. We have built over 30 bespoke custom utilities—including AI token pricing calculators, programmatic AdSense revenue estimation engines, local PDF manipulation suites, and multi-dialect SQL analyzers—complemented by exhaustive technical documentation across 10 languages.
          </p>
        </section>

        <!-- Pillars Grid -->
        <section class="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div v-for="p in pillarsEn" :key="p.title" class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/60 border border-slate-200 dark:border-neutral-700/60 flex flex-col">
            <div class="text-3xl mb-2">{{ p.icon }}</div>
            <h3 class="text-lg font-semibold text-slate-900 dark:text-white mb-1">{{ p.title }}</h3>
            <p class="text-sm text-slate-500 dark:text-neutral-400">{{ p.desc }}</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Commitment to E-E-A-T & Editorial Standards</h2>
          <p>
            In alignment with Google's <strong>E-E-A-T (Experience, Expertise, Authoritativeness, and Trustworthiness)</strong> quality guidelines, our platform provides authoritative, fact-checked, and deeply technical documentation accompanying every utility:
          </p>
          <div class="bg-slate-100 dark:bg-neutral-800/40 p-5 rounded-lg border border-slate-200 dark:border-neutral-700/70 mt-3 space-y-2">
            <p><strong>Experience:</strong> Our editorial materials are authored and reviewed by practicing engineers with hands-on production experience managing cloud microservices, authentication gateways, and distributed databases.</p>
            <p><strong>Expertise:</strong> Technical specifications, formulas, and code snippets are cross-referenced directly against canonical RFCs (e.g., IETF RFC 7519 for JWTs, RFC 4648 for Base64, RFC 4122/9562 for UUIDs, and POSIX IEEE 1003.1 for crontab syntax).</p>
            <p><strong>Authoritativeness:</strong> DevTol is recognized across the developer community with thousands of weekly active sessions and production deployments worldwide.</p>
            <p><strong>Trustworthiness:</strong> Complete source code transparency under the open-source MIT License, allowing security auditors to inspect algorithmic logic and verify zero telemetry.</p>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-4">Engineering Leadership & Advisory Guild</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div v-for="m in teamMembersEn" :key="m.name" class="p-5 rounded-lg bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700">
              <h3 class="text-lg font-bold text-slate-900 dark:text-white">{{ m.name }}</h3>
              <p class="text-xs text-primary font-semibold mb-2">{{ m.role }}</p>
              <p class="text-sm text-slate-600 dark:text-neutral-300 mb-3">{{ m.bio }}</p>
              <div class="text-xs text-slate-500 dark:text-neutral-400">
                <span class="font-semibold text-slate-600 dark:text-neutral-300">Key Focus:</span> {{ m.focus }}
              </div>
            </div>
          </div>
        </section>

        <section>
          <h2 class="text-2xl font-bold text-slate-900 dark:text-white mb-3">Transparency & Direct Communication</h2>
          <p>
            We believe developer tools must remain auditable, transparent, and responsive. We actively welcome tool suggestions, pull requests, and responsible security disclosures through our
            <a href="/contact" class="text-primary font-medium hover:underline mx-1">Contact Page</a>
            or directly via our official engineering mailbox:
            <a href="mailto:support@devtol.online" class="text-primary font-medium hover:underline mx-1">support@devtol.online</a>.
          </p>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.about-container {
  max-width: 950px;
  margin: 40px auto;
  padding: 0 20px 80px;
}

.about-card {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
  border-radius: 14px;
  padding: 40px;
}

:global(.dark) .about-card {
  background: rgba(24, 24, 28, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: none;
}

.text-primary {
  color: #10b981;
}
</style>
