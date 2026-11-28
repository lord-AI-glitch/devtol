<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import {
  IconCheck,
  IconCpu,
  IconFileCode,
  IconHelpCircle,
  IconScale,
  IconShieldLock,
  IconX,
} from '@tabler/icons-vue';

const { locale } = useI18n();
const isAr = computed(() => locale.value === 'ar');
</script>

<template>
  <section class="home-editorial-guide mt-16 border-t border-slate-200 pt-12 text-slate-700 dark:border-slate-800 dark:text-slate-300">
    <!-- Arabic Version -->
    <div v-if="isAr" class="space-y-12">
      <!-- Header -->
      <div class="max-w-3xl">
        <div class="mb-3 inline-flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 font-semibold dark:text-emerald-400">
          <n-icon :component="IconShieldLock" size="16" />
          <span>المعايير الهندسية والأمان المؤسسي</span>
        </div>
        <h2 class="text-2xl text-slate-900 font-extrabold tracking-tight sm:text-3xl dark:text-white">
          دليل المطورين الشامل: هندسة المعالجة المحلية والخصوصية التامة في المتصفح
        </h2>
        <p class="mt-3 text-base text-slate-600 leading-relaxed dark:text-slate-400">
          تم تصميم منصة DevTol لتكون بيئة العمل الإنتاجية الأولى للمطورين والمصممين التي تعمل بالكامل داخل رمال المتصفح المعزولة (Browser Sandbox)، دون إرسال أي بايت من بياناتك إلى خوادم خارجية.
        </p>
      </div>

      <!-- Core Principles Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="shadow-xs border border-slate-200 rounded-2xl bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <n-icon :component="IconCpu" size="24" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            حوسبة محلية 100% (Zero-Server)
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            جميع الخوارزميات، وتوليد المفاتيح التشفيرية، وتحويلات JSON وYAML، وفك شفرات JWT تتم محلياً باستخدام محرك V8 الخاص بجهازك، مما يمنع اعتراض البيانات أو تسريبها عبر الشبكة.
          </p>
        </div>

        <div class="shadow-xs border border-slate-200 rounded-2xl bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <n-icon :component="IconFileCode" size="24" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            امتثال صارم لمواصفات RFC
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            كل أداة تتبع معايير هندسية معتمدة: RFC 7519 لرموز JWT، و RFC 4648 لترميز Base64، ومواصفات W3C للـ XML، ومعايير FIPS PUB 180-4 لتشفير SHA-256 و HMAC.
          </p>
        </div>

        <div class="shadow-xs border border-slate-200 rounded-2xl bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <n-icon :component="IconScale" size="24" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            توافق مع لوائح GDPR
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            نظراً لعدم وجود خوادم وسيطة تخزن البيانات الشخصية، فإن استخدام أدوات المنصة يتوافق تلقائياً مع مبدأ "الحماية بالتصميم" (Data Protection by Design).
          </p>
        </div>
      </div>

      <!-- Architectural Comparison Table -->
      <div class="overflow-hidden border border-slate-200 rounded-2xl bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div class="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <h3 class="text-base text-slate-900 font-bold dark:text-white">
            مقارنة معمارية: منصة DevTol في مواجهة مواقع التحويل السحابية التقليدية
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-right text-sm">
            <thead class="bg-slate-100/60 text-xs text-slate-600 uppercase dark:bg-slate-800/80 dark:text-slate-300">
              <tr>
                <th class="px-6 py-3">
                  المعيار الهندسي
                </th>
                <th class="px-6 py-3 text-emerald-600 font-bold dark:text-emerald-400">
                  منصة DevTol (معالجة محلية)
                </th>
                <th class="px-6 py-3 text-slate-500">
                  المحولات السحابية التقليدية
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  نقل البيانات عبر الإنترنت
                </td>
                <td class="flex items-center gap-1.5 px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  <n-icon :component="IconCheck" class="text-emerald-500" />
                  <span>مدخلاتك: صفر بايت تُرفع إلى خوادم DevTol</span>
                </td>
                <td class="flex items-center gap-1.5 px-6 py-4 text-rose-500">
                  <n-icon :component="IconX" />
                  <span>تُرفع بالكامل إلى خوادم غير معلومة</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  حفظ السجلات (Server Logs)
                </td>
                <td class="px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  لا تسجيل على خوادم DevTol — مدخلاتك لا تُرسل إلى خوادم DevTol أبداً
                </td>
                <td class="px-6 py-4 text-slate-500">
                  تُسجل في سجلات الخادم وقواعد البيانات
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  زمن الاستجابة والتأخير
                </td>
                <td class="px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  فوري تقريباً (بدون تأخير الشبكة)
                </td>
                <td class="px-6 py-4 text-slate-500">
                  يعتمد على سرعة رفع الملفات والشبكة
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  العمل في بيئات العمل الحساسة (Air-gapped)
                </td>
                <td class="px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  تعمل دون إنترنت بعد تحميلها (باستثناء الأدوات التي تحتاج تنزيل محرك لأول مرة)
                </td>
                <td class="px-6 py-4 text-slate-500">
                  غير ممكنة وتتطلب اتصالاً دائماً
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="space-y-4">
        <h3 class="flex items-center gap-2 text-xl text-slate-900 font-bold dark:text-white">
          <n-icon :component="IconHelpCircle" class="text-indigo-500" />
          <span>الأسئلة الأكثر شيوعاً حول الأمان والتقنية</span>
        </h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="border border-slate-200 rounded-xl bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 class="mb-2 text-slate-900 font-bold dark:text-white">
              كيف تضمن المنصة عدم وصول بياناتي إلى الخوادم؟
            </h4>
            <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
              يمكنك التحقق من ذلك بنفسك عبر فتح أدوات المطورين في المتصفح (Inspect Element -> Network Tab)؛ ستلاحظ عدم إرسال أي طلبات تحمل بياناتك — الصفحة نفسها تحمّل الخطوط والإعلانات — أثناء استخدامك لأي أداة من أدوات فحص التوكن أو التشفير أو معالجة المستندات.
            </p>
          </div>
          <div class="border border-slate-200 rounded-xl bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 class="mb-2 text-slate-900 font-bold dark:text-white">
              هل يمكن تثبيت واستخدام DevTol بدون اتصال بالإنترنت؟
            </h4>
            <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
              نعم، المنصة مبنية كتطبيق ويب تقدمي (PWA). بمجرد تحميلها لمرة واحدة، يمكنك تثبيتها على نظامك واستخدام الأدوات حتى في وضع عدم الاتصال بالإنترنت (Offline Mode)، باستثناء الأدوات التي تحتاج تنزيل محرك لأول مرة.
            </p>
          </div>
        </div>
      </div>
    </div>

    <!-- English Version -->
    <div v-else class="space-y-12">
      <!-- Header -->
      <div class="max-w-3xl">
        <div class="mb-3 inline-flex items-center gap-2 border border-emerald-500/20 rounded-full bg-emerald-500/10 px-3 py-1 text-xs text-emerald-600 font-semibold dark:text-emerald-400">
          <n-icon :component="IconShieldLock" size="16" />
          <span>Engineering Architecture & Enterprise Security</span>
        </div>
        <h2 class="text-2xl text-slate-900 font-extrabold tracking-tight sm:text-3xl dark:text-white">
          Comprehensive Developer Guide: Client-Side Computing & Zero-Knowledge Architecture
        </h2>
        <p class="mt-3 text-base text-slate-600 leading-relaxed dark:text-slate-400">
          DevTol is engineered from the ground up as a privacy-first web utilities platform where every computation, cryptographic operation, and data serialization executes strictly within your local browser sandbox.
        </p>
      </div>

      <!-- Core Principles Grid -->
      <div class="grid grid-cols-1 gap-6 md:grid-cols-3">
        <div class="shadow-xs border border-slate-200 rounded-2xl bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500">
            <n-icon :component="IconCpu" size="24" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            100% Client-Side Processing
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            All algorithms, cryptographic hashing, JSON/YAML parsing, and JWT verification run locally using your device's V8 or JavaScriptCore runtime, preventing data interception.
          </p>
        </div>

        <div class="shadow-xs border border-slate-200 rounded-2xl bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
            <n-icon :component="IconFileCode" size="24" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            Strict RFC Specifications
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            Every utility complies with canonical international standards: RFC 7519 for JWTs, RFC 4648 for Base64, W3C XML 1.0, and NIST FIPS PUB 180-4 for SHA-256 and HMAC primitives.
          </p>
        </div>

        <div class="shadow-xs border border-slate-200 rounded-2xl bg-white p-6 dark:border-slate-800 dark:bg-slate-900/60">
          <div class="mb-4 h-12 w-12 flex items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
            <n-icon :component="IconScale" size="24" />
          </div>
          <h3 class="mb-2 text-lg text-slate-900 font-bold dark:text-white">
            Enterprise Compliance (GDPR)
          </h3>
          <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
            Because DevTol never receives or retains confidential input strings, development teams can safely format queries and debug tokens without triggering regulatory data breach liabilities.
          </p>
        </div>
      </div>

      <!-- Architectural Comparison Table -->
      <div class="overflow-hidden border border-slate-200 rounded-2xl bg-white dark:border-slate-800 dark:bg-slate-900/40">
        <div class="border-b border-slate-200 bg-slate-50 px-6 py-4 dark:border-slate-800 dark:bg-slate-800/50">
          <h3 class="text-base text-slate-900 font-bold dark:text-white">
            Architectural Comparison: DevTol vs. Traditional Cloud-Hosted Conversion Services
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full text-left text-sm">
            <thead class="bg-slate-100/60 text-xs text-slate-600 uppercase dark:bg-slate-800/80 dark:text-slate-300">
              <tr>
                <th class="px-6 py-3">
                  Engineering Vector
                </th>
                <th class="px-6 py-3 text-emerald-600 font-bold dark:text-emerald-400">
                  DevTol (Client-Side)
                </th>
                <th class="px-6 py-3 text-slate-500">
                  Legacy Cloud Converters
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-200 dark:divide-slate-800">
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  Payload Transmission
                </td>
                <td class="flex items-center gap-1.5 px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  <n-icon :component="IconCheck" class="text-emerald-500" />
                  <span>Your inputs: 0 bytes uploaded to DevTol servers</span>
                </td>
                <td class="flex items-center gap-1.5 px-6 py-4 text-rose-500">
                  <n-icon :component="IconX" />
                  <span>Transmitted to remote cloud servers</span>
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  Server Logging & Storage
                </td>
                <td class="px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  No DevTol server logging — your inputs are never sent to DevTol servers
                </td>
                <td class="px-6 py-4 text-slate-500">
                  Persisted in access logs & databases
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  Execution Latency
                </td>
                <td class="px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  Near-instant (no network round-trip)
                </td>
                <td class="px-6 py-4 text-slate-500">
                  Subject to round-trip latency & quotas
                </td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-slate-900 font-medium dark:text-white">
                  Air-Gapped Workstation Support
                </td>
                <td class="px-6 py-4 text-emerald-600 font-semibold dark:text-emerald-400">
                  Offline capable once loaded (except tools that need a first-time engine download)
                </td>
                <td class="px-6 py-4 text-slate-500">
                  Fails without active internet access
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- FAQ Section -->
      <div class="space-y-4">
        <h3 class="flex items-center gap-2 text-xl text-slate-900 font-bold dark:text-white">
          <n-icon :component="IconHelpCircle" class="text-indigo-500" />
          <span>Frequently Asked Questions Regarding Architecture & Security</span>
        </h3>
        <div class="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div class="border border-slate-200 rounded-xl bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 class="mb-2 text-slate-900 font-bold dark:text-white">
              How can I verify that my data never leaves my browser?
            </h4>
            <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
              Open your browser's Developer Tools (F12 or Inspect -> Network Tab). Perform any conversion, JWT signing, or formatting operation. You will observe zero requests carrying your data — the page itself loads fonts and ads — verifying local execution.
            </p>
          </div>
          <div class="border border-slate-200 rounded-xl bg-white p-5 dark:border-slate-800 dark:bg-slate-900/40">
            <h4 class="mb-2 text-slate-900 font-bold dark:text-white">
              Can DevTol operate completely offline?
            </h4>
            <p class="text-sm text-slate-600 leading-relaxed dark:text-slate-400">
              Yes. DevTol is built as an offline-first Progressive Web App (PWA). Once loaded, assets are cached in local browser storage, allowing utilities to function without an active internet connection — except tools that need a first-time engine download.
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
