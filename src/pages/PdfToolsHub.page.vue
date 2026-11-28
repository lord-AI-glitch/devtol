<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';
import { useHead } from '@vueuse/head';
import { NIcon, NInput } from 'naive-ui';
import {
  ArrowLeft,
  ArrowRight,
  ArrowsMinimize,
  Droplet,
  Edit,
  FileDigit,
  FileText,
  Files,
  Fingerprint,
  Photo,
  Scissors,
  Search,
  ShieldCheck,
} from '@vicons/tabler';

const { t, locale } = useI18n();
const route = useRoute();

const isAr = computed(() => locale.value === 'ar');
const currentLangPrefix = computed(() => {
  const p = route?.path || '';
  const match = p.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)(?:\/|$)/);
  return match ? `/${match[1]}` : '';
});

useHead({
  title: isAr.value
    ? 'أدوات PDF أونلاين مجاناً (معالجة محلية 100% بدون خوادم) - DevTol'
    : 'All-in-One Free Client-Side PDF Tools Suite (No Uploads) - DevTol',
  meta: [
    {
      name: 'description',
      content: isAr.value
        ? 'مجموعة أدوات PDF شاملة ومجانية 100%: تعديل نصوص، دمج، تقسيم، ضغط، تحويل صور، وتوقيع رقمي. خصوصية تامة وسرعة فائقة بدون رفع أي ملف إلى أي خادم.'
        : '10 free client-side PDF utilities: Edit text, merge, split, compress, convert images, and e-sign securely. 100% private with zero server uploads.',
    },
  ],
});

const searchQuery = ref('');
const selectedCategory = ref('all');

interface PdfToolItem {
  id: string
  slug: string
  nameEn: string
  nameAr: string
  descEn: string
  descAr: string
  icon: any
  category: 'edit' | 'organize' | 'convert' | 'security'
  badgeEn: string
  badgeAr: string
}

const pdfTools: PdfToolItem[] = [
  {
    id: 'pdf-editor',
    slug: 'pdf-editor',
    nameEn: 'PDF Editor',
    nameAr: 'محرر وتعديل نصوص PDF',
    descEn: 'Edit PDF text directly in your browser, search and replace words, draw, sign, and load custom Arabic fonts.',
    descAr: 'تعديل نصوص PDF مباشرة في المتصفح، بحث واستبدال الكلمات، التوقيع، ودعم كامل للخطوط العربية.',
    icon: Edit,
    category: 'edit',
    badgeEn: 'Full Arabic Support',
    badgeAr: 'دعم كامل للعربية',
  },
  {
    id: 'pdf-merge',
    slug: 'pdf-merge',
    nameEn: 'Merge PDF',
    nameAr: 'دمج ملفات PDF',
    descEn: 'Combine multiple PDF documents into a single organized file in seconds with custom page ordering.',
    descAr: 'دمج وتجميع عدة ملفات PDF في مستند واحد منظم خلال ثوانٍ وبترتيب مخصص للصفحات.',
    icon: Files,
    category: 'organize',
    badgeEn: 'Unlimited Files',
    badgeAr: 'ملفات غير محدودة',
  },
  {
    id: 'pdf-split',
    slug: 'pdf-split',
    nameEn: 'Split PDF',
    nameAr: 'تقسيم واستخراج صفحات PDF',
    descEn: 'Separate PDF pages, extract specific page ranges, or split into individual single-page documents.',
    descAr: 'فصل صفحات الـ PDF، واستخراج نطاقات صفحات محددة، أو تقسيم الملف إلى صفحات مستقلة.',
    icon: Scissors,
    category: 'organize',
    badgeEn: 'Instant Range Split',
    badgeAr: 'استخراج فوري',
  },
  {
    id: 'pdf-compress',
    slug: 'pdf-compress',
    nameEn: 'Compress PDF',
    nameAr: 'ضغط وتصغير حجم PDF',
    descEn: 'Reduce PDF file size significantly while retaining sharp text and graphics. Perfect for job and portal uploads.',
    descAr: 'تصغير حجم ملفات الـ PDF بشكل كبير مع الحفاظ على وضوح النصوص والصور لتسهيل رفعها على المواقع الحكومية والجامعات.',
    icon: ArrowsMinimize,
    category: 'edit',
    badgeEn: 'Reduce to 200KB',
    badgeAr: 'تصغير حتى 200KB',
  },
  {
    id: 'pdf-to-image',
    slug: 'pdf-to-image',
    nameEn: 'PDF to Image',
    nameAr: 'تحويل PDF إلى صور عالية الدقة',
    descEn: 'Convert PDF document pages into high-resolution PNG, JPG, or modern WebP images client-side.',
    descAr: 'تحويل صفحات ملف الـ PDF إلى صور عالية الدقة بصيغة PNG أو JPG أو WebP محلياً في المتصفح.',
    icon: Photo,
    category: 'convert',
    badgeEn: 'PNG & JPG & WebP',
    badgeAr: 'دقة عالية HD',
  },
  {
    id: 'images-to-pdf',
    slug: 'images-to-pdf',
    nameEn: 'Images to PDF',
    nameAr: 'تحويل الصور إلى ملف PDF',
    descEn: 'Assemble multiple JPG, PNG, and WebP images into a clean, standardized PDF document with custom margins.',
    descAr: 'تجميع عدة صور JPG و PNG و WebP في ملف مستند PDF موحد وأنيق مع هوامش مخصصة.',
    icon: FileText,
    category: 'convert',
    badgeEn: 'Multi-Image Batch',
    badgeAr: 'تجميع متعدد للصور',
  },
  {
    id: 'pdf-organize',
    slug: 'pdf-organize',
    nameEn: 'Organize & Rotate PDF',
    nameAr: 'ترتيب وتدوير وحذف صفحات PDF',
    descEn: 'Drag-and-drop page organizer to sort, rotate clockwise/counter-clockwise, or delete unnecessary pages.',
    descAr: 'إعادة ترتيب صفحات الـ PDF بالسحب والإفلات، وتدوير الصفحات المقلوبة، وحذف الصفحات الزائدة بسهولة.',
    icon: Files,
    category: 'organize',
    badgeEn: 'Drag & Drop Sort',
    badgeAr: 'سحب وإفلات تفاعلي',
  },
  {
    id: 'pdf-ocr',
    slug: 'pdf-ocr',
    nameEn: 'OCR Text Extractor',
    nameAr: 'التعرف الضوئي على النصوص (OCR)',
    descEn: 'Extract readable and editable text from scanned PDF documents and invoices using client-side Tesseract.js.',
    descAr: 'استخراج النصوص القابلة للنسخ والتحرير من ملفات الـ PDF الممسوحة ضوئياً والفواتير محلياً عبر Tesseract.js.',
    icon: FileDigit,
    category: 'convert',
    badgeEn: 'Local Tesseract.js',
    badgeAr: 'استخراج نصوص ذكي',
  },
  {
    id: 'pdf-watermark-tool',
    slug: 'pdf-watermark-tool',
    nameEn: 'Watermark PDF',
    nameAr: 'إضافة علامة مائية لـ PDF',
    descEn: 'Add custom text watermarks, stamps, and confidentiality disclaimers to all pages.',
    descAr: 'إضافة علامة مائية نصية وأختام سرية لجميع صفحات المستند.',
    icon: Droplet,
    category: 'edit',
    badgeEn: 'Text & Logo Stamps',
    badgeAr: 'أختام وشعارات',
  },
  {
    id: 'pdf-signature-checker',
    slug: 'pdf-signature-checker',
    nameEn: 'PDF Signature Verifier',
    nameAr: 'فحص التوقيعات الرقمية المشفرة',
    descEn: 'Verify cryptographic digital signatures, X.509 certificates, and tamper integrity in signed documents.',
    descAr: 'التحقق من صحة التوقيعات الرقمية المشفرة وشهادات X.509 وسلامة الوثائق الموقعة من التلاعب.',
    icon: Fingerprint,
    category: 'security',
    badgeEn: 'X.509 Verification',
    badgeAr: 'فحص شهادات التوقيع',
  },
];

const filteredTools = computed(() => {
  return pdfTools.filter((tool) => {
    const matchesCategory = selectedCategory.value === 'all' || tool.category === selectedCategory.value;
    const q = searchQuery.value.trim().toLowerCase();
    if (!q) {
      return matchesCategory;
    }

    const matchesName = isAr.value
      ? tool.nameAr.toLowerCase().includes(q) || tool.nameEn.toLowerCase().includes(q)
      : tool.nameEn.toLowerCase().includes(q);
    const matchesDesc = isAr.value
      ? tool.descAr.toLowerCase().includes(q) || tool.descEn.toLowerCase().includes(q)
      : tool.descEn.toLowerCase().includes(q);

    return matchesCategory && (matchesName || matchesDesc);
  });
});

const faqs = computed(() => [
  {
    q: isAr.value
      ? 'هل يتم رفع ملفات الـ PDF الخاصة بي إلى أي خوادم أثناء استخدام الأدوات؟'
      : 'Are my PDF files uploaded to any servers during processing?',
    a: isAr.value
      ? 'إطلاقاً وبشكل قاطع. تعمل كافة أدوات الـ PDF في DevTol محلياً بنسبة 100% داخل ذاكرة متصفحك (RAM) عبر WebAssembly و Web Crypto API. ملفاتك وبياناتك لا تخرج من جهازك نهائياً.'
      : 'Never. Every PDF utility on DevTol executes 100% client-side in your local browser sandbox using WebAssembly and the Web Crypto API. Your confidential files never touch an external server.',
  },
  {
    q: isAr.value
      ? 'هل توجد أي حدود يومية لعدد الملفات مثل Smallpdf أو iLovePDF؟'
      : 'Are there any daily usage limits like Smallpdf or iLovePDF?',
    a: isAr.value
      ? 'لا توجد أي قيود أو اشتراكات على الإطلاق. يمكنك دمج، وضغط، وتعديل أي عدد تريده من الملفات مجاناً بالكامل وإلى الأبد، لأن المعالجة تعتمد على جهازك الشخصي ولا تكلفنا خوادم سحابية.'
      : 'Zero limits. Unlike Smallpdf (which restricts you to 2 tasks per day) or Sejda (3 per hour), DevTol gives you unlimited free usage with no subscriptions or paywalls ever.',
  },
  {
    q: isAr.value
      ? 'كيف يدعم محرر PDF اللغة العربية دون تشويه الحروف؟'
      : 'How does the PDF editor support Arabic text without character breaking?',
    a: isAr.value
      ? 'طورنا محرك خطوط متكامل يطبق معايير Unicode BiDi و OpenType Shaping تلقائياً، مما يضمن ظهور الحروف العربية متصلة وفي اتجاهها الصحيح من اليمين إلى اليسار.'
      : 'Our custom PDF editing engine natively supports Unicode BiDi algorithms and OpenType font shaping, ensuring seamless right-to-left text rendering without disjointed glyphs.',
  },
  {
    q: isAr.value
      ? 'هل يمكنني استخدام أدوات الـ PDF بدون اتصال بالإنترنت؟'
      : 'Can I use these PDF tools while offline?',
    a: isAr.value
      ? 'نعم، المنصة مبنية كتطبيق ويب تقدمي (PWA). بمجرد فتح الصفحة، يتم حفظ الأدوات في جهازك وتعمل حتى لو انقطع اتصال الإنترنت كلياً.'
      : 'Yes. DevTol is built as a Progressive Web App (PWA). Once loaded, our Service Worker caches all tools locally, enabling complete offline functionality.',
  },
]);
</script>

<template>
  <div class="pdf-hub-container" :dir="isAr ? 'rtl' : 'ltr'">
    <!-- 1. Hero Section -->
    <header class="pdf-hub-hero">
      <div class="mb-4 inline-flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 font-semibold dark:text-emerald-400">
        <NIcon size="16" :component="ShieldCheck" />
        <span>{{ isAr ? 'معالجة محلية 100% داخل المتصفح • بدون خوادم • مجاني للأبد' : '100% Client-Side Processing • Zero Server Uploads • Forever Free' }}</span>
      </div>

      <h1 class="text-3xl text-slate-900 font-extrabold leading-tight tracking-tight sm:text-5xl dark:text-white">
        {{ isAr ? 'أدوات PDF الاحترافية والمجانية' : 'All-in-One Free Online PDF Suite' }}
      </h1>

      <p class="mx-auto mt-4 max-w-2xl text-base text-slate-600 leading-relaxed sm:text-lg dark:text-slate-300">
        {{ isAr
          ? 'مجموعة متكاملة من 10 أدوات لتعديل ودمج وضغط وتأمين ملفات الـ PDF بأقصى سرعة وأمان مطلق دون رفع أي ملف إلى أي خادم خارجي.'
          : 'High-performance developer-grade PDF suite. Edit, merge, split, compress, and sign documents locally in your browser with zero latency and zero privacy risks.'
        }}
      </p>

      <!-- Instant Search & Category Pills -->
      <div class="mx-auto mt-8 max-w-xl">
        <NInput
          v-model:value="searchQuery"
          round
          size="large"
          clearable
          :placeholder="isAr ? 'ابحث عن أداة PDF (مثال: دمج، ضغط، تحويل، توقيع)...' : 'Search PDF tools (e.g. merge, compress, image, sign)...'"
          class="shadow-sm"
        >
          <template #prefix>
            <NIcon :component="Search" class="text-slate-400" />
          </template>
        </NInput>

        <div class="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
          <button
            class="rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="selectedCategory === 'all' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'"
            @click="selectedCategory = 'all'"
          >
            {{ isAr ? 'جميع الأدوات (10)' : 'All Tools (10)' }}
          </button>
          <button
            class="rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="selectedCategory === 'edit' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'"
            @click="selectedCategory = 'edit'"
          >
            {{ isAr ? 'التعديل والضغط' : 'Edit & Compress' }}
          </button>
          <button
            class="rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="selectedCategory === 'organize' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'"
            @click="selectedCategory = 'organize'"
          >
            {{ isAr ? 'الدمج والتقسيم' : 'Merge & Organize' }}
          </button>
          <button
            class="rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="selectedCategory === 'convert' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'"
            @click="selectedCategory = 'convert'"
          >
            {{ isAr ? 'تحويل الصور والـ OCR' : 'Convert & OCR' }}
          </button>
          <button
            class="rounded-lg px-3 py-1.5 font-medium transition-all"
            :class="selectedCategory === 'security' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-100 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-neutral-700'"
            @click="selectedCategory = 'security'"
          >
            {{ isAr ? 'الأمان والتشفير' : 'Security & Protect' }}
          </button>
        </div>
      </div>
    </header>

    <!-- 2. Tools Grid -->
    <main class="pdf-tools-grid-section mt-12">
      <div v-if="filteredTools.length === 0" class="py-16 text-center">
        <p class="text-base text-slate-500 dark:text-slate-400">
          {{ isAr ? 'لم يتم العثور على أداة مطابقة لبحثك.' : 'No PDF tools match your search criteria.' }}
        </p>
      </div>

      <div v-else class="grid grid-cols-1 gap-5 lg:grid-cols-3 sm:grid-cols-2">
        <RouterLink
          v-for="tool in filteredTools"
          :key="tool.id"
          :to="`${currentLangPrefix}/${tool.slug}`"
          class="group pdf-tool-card flex flex-col justify-between border rounded-2xl p-5 transition-all duration-200"
          :class="isAr ? 'text-right' : 'text-left'"
        >
          <div>
            <div class="mb-3 flex items-center justify-between gap-3">
              <div class="h-12 w-12 flex items-center justify-center border border-emerald-500/20 rounded-xl bg-emerald-500/10 text-emerald-600 transition-transform group-hover:scale-105 dark:text-emerald-400">
                <NIcon size="24" :component="tool.icon" />
              </div>
              <span class="rounded-md bg-slate-100 px-2.5 py-1 text-[11px] text-slate-600 font-semibold tracking-wider uppercase dark:bg-neutral-800 dark:text-slate-300">
                {{ isAr ? tool.badgeAr : tool.badgeEn }}
              </span>
            </div>

            <h3 class="mb-1.5 text-lg text-slate-900 font-bold transition-colors dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">
              {{ isAr ? tool.nameAr : tool.nameEn }}
            </h3>

            <p class="line-clamp-3 text-xs text-slate-500 leading-relaxed sm:text-sm dark:text-slate-400">
              {{ isAr ? tool.descAr : tool.descEn }}
            </p>
          </div>

          <div class="mt-4 flex items-center justify-between border-t border-slate-100 pt-3 text-xs text-emerald-600 font-semibold dark:border-neutral-800 dark:text-emerald-400">
            <span>{{ isAr ? 'فتح الأداة وتجربتها' : 'Open Free Tool' }}</span>
            <NIcon size="16" :component="isAr ? ArrowLeft : ArrowRight" class="transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1" />
          </div>
        </RouterLink>
      </div>
    </main>

    <!-- 3. Security Comparison Matrix (DevTol vs Traditional Giants) -->
    <section class="mt-20 border-t border-slate-200 pt-12 dark:border-neutral-800">
      <div class="mx-auto mb-10 max-w-2xl text-center">
        <h2 class="text-2xl text-slate-900 font-extrabold sm:text-3xl dark:text-white">
          {{ isAr ? 'لماذا تتفوق DevTol على iLovePDF و Smallpdf؟' : 'Why DevTol Outperforms Traditional Cloud Tools' }}
        </h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {{ isAr
            ? 'مقارنة هندسية عملية توضح الفارق الجذري بين الحوسبة في المتصفح ورفع ملفاتك إلى خوادم وسيطة.'
            : 'An architectural breakdown comparing client-side local computing against legacy server-upload tools.'
          }}
        </p>
      </div>

      <div class="overflow-x-auto border border-slate-200 rounded-xl bg-white shadow-sm dark:border-neutral-800 dark:bg-neutral-900/60">
        <table class="w-full text-sm" :class="isAr ? 'text-right' : 'text-left'">
          <thead>
            <tr class="border-b border-slate-200 bg-slate-50 dark:border-neutral-700 dark:bg-neutral-800/80">
              <th class="p-4 text-slate-900 font-bold dark:text-white">
                {{ isAr ? 'المعيار التقني' : 'Engineering Metric' }}
              </th>
              <th class="bg-emerald-50/50 p-4 text-emerald-600 font-bold dark:bg-emerald-950/20 dark:text-emerald-400">
                {{ isAr ? 'منصة DevTol المحلية' : 'DevTol Client-Side' }}
              </th>
              <th class="p-4 text-slate-500 font-bold dark:text-slate-400">
                {{ isAr ? 'المنافسون التقليديون (iLovePDF / Smallpdf)' : 'Legacy Cloud Converters' }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 dark:divide-neutral-800">
            <tr>
              <td class="p-4 text-slate-800 font-semibold dark:text-slate-200">
                {{ isAr ? 'خصوصية البيانات وسرية المستندات' : 'Data Privacy & Security' }}
              </td>
              <td class="bg-emerald-50/30 p-4 text-emerald-600 font-bold dark:bg-emerald-950/10 dark:text-emerald-400">
                {{ isAr ? '100% في المتصفح (صفر بايت يُرفع للسحابة)' : '100% Client-Side (0 Bytes Uploaded)' }}
              </td>
              <td class="p-4 text-red-500 dark:text-red-400">
                {{ isAr ? 'يتم رفع ملفاتك بالكامل إلى خوادم وسيطة' : 'Files are uploaded to remote third-party cloud' }}
              </td>
            </tr>
            <tr>
              <td class="p-4 text-slate-800 font-semibold dark:text-slate-200">
                {{ isAr ? 'القيود اليومية والاشتراكات' : 'Daily Limits & Paywalls' }}
              </td>
              <td class="bg-emerald-50/30 p-4 text-emerald-600 font-bold dark:bg-emerald-950/10 dark:text-emerald-400">
                {{ isAr ? 'غير محدود مجاناً للأبد وبدون تسجيل' : 'Unlimited Free Tasks Forever (No Paywalls)' }}
              </td>
              <td class="p-4 text-slate-600 dark:text-slate-400">
                {{ isAr ? 'قيد مهمتين يومياً (Smallpdf) أو 3 في الساعة (Sejda)' : 'Strict daily caps (2 tasks/day on Smallpdf, 3/hour on Sejda)' }}
              </td>
            </tr>
            <tr>
              <td class="p-4 text-slate-800 font-semibold dark:text-slate-200">
                {{ isAr ? 'دعم النصوص والخطوط العربية' : 'Arabic & RTL Font Shaping' }}
              </td>
              <td class="bg-emerald-50/30 p-4 text-emerald-600 font-bold dark:bg-emerald-950/10 dark:text-emerald-400">
                {{ isAr ? 'دعم كامل وتشابك صحيح للحروف' : 'Native Unicode BiDi & OpenType Arabic' }}
              </td>
              <td class="p-4 text-red-500 dark:text-red-400">
                {{ isAr ? 'حروف مقطعة ومعكوسة تماماً' : 'Scrambled and disjointed Arabic characters' }}
              </td>
            </tr>
            <tr>
              <td class="p-4 text-slate-800 font-semibold dark:text-slate-200">
                {{ isAr ? 'زمن الاستجابة والتنفيذ' : 'Execution Speed & Latency' }}
              </td>
              <td class="bg-emerald-50/30 p-4 text-emerald-600 font-bold dark:bg-emerald-950/10 dark:text-emerald-400">
                {{ isAr ? 'فوري محلياً (0.5 إلى 2 ثانية)' : 'Near-Instant Local CPU (0.5s - 2s)' }}
              </td>
              <td class="p-4 text-slate-600 dark:text-slate-400">
                {{ isAr ? 'بطيء (يعتمد على سرعة الرفع والتحميل وطوابير السيرفر)' : 'Slow (dependent on upload/download and server queues)' }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>

    <!-- 4. FAQ Accordion -->
    <section class="mt-20 border-t border-slate-200 pt-12 dark:border-neutral-800">
      <div class="mx-auto mb-10 max-w-xl text-center">
        <h2 class="text-2xl text-slate-900 font-extrabold sm:text-3xl dark:text-white">
          {{ isAr ? 'الأسئلة الشائعة حول أدوات الـ PDF' : 'Frequently Asked Questions' }}
        </h2>
        <p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
          {{ isAr ? 'إجابات مباشرة وشفافة حول الأمان، وسرعة المعالجة، والترخيص.' : 'Clear answers regarding security, privacy, and unlimited usage.' }}
        </p>
      </div>

      <div class="mx-auto max-w-3xl space-y-4">
        <div
          v-for="(faq, idx) in faqs"
          :key="idx"
          class="border border-slate-200 rounded-xl bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900/60"
        >
          <h3 class="mb-2 flex items-center gap-2 text-base text-slate-900 font-bold dark:text-white">
            <span class="text-sm text-emerald-500 font-mono">#{{ idx + 1 }}</span>
            <span>{{ faq.q }}</span>
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            {{ faq.a }}
          </p>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.pdf-hub-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 20px 80px;
}

.pdf-hub-hero {
  text-align: center;
}

.pdf-tool-card {
  background: #ffffff;
  border-color: #e2e8f0;
}

:global(.dark) .pdf-tool-card {
  background: rgba(24, 24, 28, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
}

.pdf-tool-card:hover {
  border-color: #10b981;
  box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.1);
}
</style>
