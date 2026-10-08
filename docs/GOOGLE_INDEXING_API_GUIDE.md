# دليل تفعيل وتشغيل أتمتة Google Indexing API — DevTol

بروتوكول **Google Indexing API** يتيح إرسال إشعارات مباشرة وخاطفة لمحركات بحث Google لطلب فحص وفهرسة الصفحات فور نشرها أو تحديثها بدون الانتظار لأسابيع لحين مرور عناكب الزحف العادية.

---

## 📋 المتطلبات المسبقة (تُجرى لمرة واحدة فقط — 5 دقائق)

### الخطوة 1: تفعيل الـ API وإنشاء مشروع في Google Cloud Console
1. افتح **[Google Cloud Console](https://console.cloud.google.com/)**.
2. أنشئ مشروعاً جديداً (أو اختر مشروعاً قائماً) وسمّه مثلاً: `DevTol-Indexing`.
3. انتقل إلى **APIs & Services** ثم **Library** (أو ابحث في شريط البحث عن `Web Search Indexing API`).
4. اضغط على **Indexing API** واضغط **Enable (تفعيل)**.

---

### الخطوة 2: إنشاء حساب خدمة (Service Account) ومفتاح التوثيق
1. من القائمة الجانبية في Google Cloud، اذهب إلى **IAM & Admin** -> **Service Accounts**.
2. اضغط **Create Service Account** في الأعلى.
3. أدخل اسماً للحساب (مثلاً `devtol-indexer`)، ثم اضغط **Create and Continue**.
4. في خانة Role (الدور)، اختر **Owner** أو **Editor** ثم اضغط **Done**.
5. ستظهر لك قائمة الحسابات وبجوار الحساب الجديد عنوان بريد إلكتروني يشبه:
   `devtol-indexer@devtol-indexing-xxxx.iam.gserviceaccount.com`
   > ⚠️ **انسخ هذا البريد الإلكتروني، سنحتاجه في الخطوة التالية!**
6. اضغط على الثلاث نقاط بجوار الحساب ثم اختر **Manage keys**.
7. اضغط **Add Key** -> **Create new key** -> اختر نوع المفتاح **JSON** ثم اضغط **Create**.
8. سيتم تحميل ملف JSON إلى جهازك.

---

### الخطوة 3: وضع المفتاح في مشروع DevTol
1. أعد تسمية الملف المُحمّل إلى:
   ```text
   service_account.json
   ```
2. انقل الملف مباشرة إلى المجلد الرئيسي لمشروع DevTol:
   ```text
   E:\مشاريع مهمه\devtol\service_account.json
   ```
   > 🔒 **الأمان:** تم تضمين `service_account*.json` مسبقاً في ملف `.gitignore`، لذا لن يتم رفعه أبداً إلى مستودع Git العام.

---

### الخطوة 4: منح الصلاحية للحساب في Google Search Console
1. افتح **[Google Search Console](https://search.google.com/search-console)**.
2. اختر الموقع: `devtol.online` (أو الخاصية التابعة له).
3. من القائمة الجانبية اليسرى، اضغط على **Settings (الإعدادات)**.
4. اضغط على **Users and permissions (المستخدمون والأذونات)**.
5. اضغط **Add user (إضافة مستخدم)** في الأعلى:
   - في خانة البريد الإلكتروني: الصق إيميل الـ Service Account الذي نسخته في الخطوة 2.
   - في خانة الإذن (Permission): اختر **Owner (مالك)**.
   - اضغط **Add**.

---

## 🚀 طريقة التشغيل والأتمتة

بمجرد وضع ملف `service_account.json`، يمكنك تشغيل الأمر فوراً من موجه الأوامر (Terminal):

### 1. إرسال أفضل وأهم 50 صفحة تلقائياً (بما فيها أدوات PDF والدلائل):
```bash
pnpm run google:index
```

### 2. إرسال عدد مخصص من الصفحات (مثلاً الحد اليومي الأقصى 200 صفحة):
```bash
pnpm run google:index -- --limit=200
```

### 3. إرسال رابط أو روابط محددة بالاسم:
```bash
pnpm run google:index -- https://devtol.online/pdf-tools https://devtol.online/compress-pdf https://devtol.online/ar/pdf-tools
```

---

## 📊 الحدود والكوتا اليومية (Quota)
- تمنح Google افتراضياً **200 رابط يومياً** لكل مشروع مجاناً.
- يقوم السكريبت تلقائياً بترتيب روابط الموقع وفق الأولوية القصوى (الصفحة الرئيسية -> قسم أدوات PDF -> صفحات الدلائل الإرشادية Guides -> الأدوات الأكثر استخداماً).
- يتم تطبيق مهلة خفيفة (100ms) بين كل طلب وآخر لتجنب أي حظر للشبكة.

---

## ⚡ الأتمتة اليومية التلقائية (Daily Cloud & Local Automation)

تم تجهيز نظامين للأتمتة اليومية ليعمل الإرسال تلقائياً دون أي تدخل منك:

### الخيار 1: الأتمتة السحابية عبر GitHub Actions (الأفضل والموصى به 100%)
يعمل في سيرفرات GitHub مجاناً كل يوم في تمام الساعة **06:00 صباحاً بتوقيت القاهرة** حتى وجهازك مغلق:
1. افتح مستودع المشروع على **GitHub**.
2. اذهب إلى **Settings** -> **Secrets and variables** -> **Actions**.
3. اضغط **New repository secret**:
   - الاسم: `GOOGLE_SERVICE_ACCOUNT_KEY`
   - القيمة: افتح ملف `service_account.json`، انسخ محتواه بالكامل والصقه هنا.
   - اضغط **Add secret**.
4. تم تفعيل ملف العمل تلقائياً: [`.github/workflows/daily-indexing.yml`](file:///.github/workflows/daily-indexing.yml).
5. سيقوم GitHub يومياً بـ:
   - فحص خريطة الموقع وتدوير 200 رابط يومياً نحو Google Indexing API.
   - إرسال كامل الـ 1,590 رابط لمحرك Bing و IndexNow.
   - تسجيل تقرير تفصيلي بالروابط المُرسلة وحالتها.

### الخيار 2: الأتمتة المحلية عبر Windows Task Scheduler (على جهاز الكمبيوتر)
إذا أردت تشغيله محلياً على جهازك في خلفية الويندوز يومياً:
1. افتح PowerShell كمسؤول (Run as Administrator) في مجلد المشروع.
2. شغّل الأمر التالي لتسجيل المهمة اليومية (تعمل افتراضياً الساعة 09:00 صباحاً):
   ```powershell
   .\scripts\schedule-daily-indexing.ps1
   ```
3. لتحديد وقت مختلف (مثلاً الساعة 11:30 ليلاً):
   ```powershell
   .\scripts\schedule-daily-indexing.ps1 -Time "23:30"
   ```
4. لحذف المهمة المجدولة لاحقاً في أي وقت:
   ```powershell
   .\scripts\schedule-daily-indexing.ps1 -Uninstall
   ```

