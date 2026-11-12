import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import YAML from 'yaml';
import MarkdownIt from 'markdown-it';
import { getHomePrerenderContent, getLegalPageArticleHtml } from './seo-content-templates.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const distDir = path.join(rootDir, 'dist');

const BASE_URL = process.env.SITE_URL || 'https://devtol.online';

console.log('[SEO Prerender] Starting multi-language static HTML generation for all routes...');

if (!fs.existsSync(distDir)) {
  console.error('[SEO Prerender] Error: dist/ directory does not exist. Run vite build first.');
  process.exit(1);
}

const templateIndexPath = path.join(distDir, 'index.html');
if (!fs.existsSync(templateIndexPath)) {
  console.error('[SEO Prerender] Error: dist/index.html not found.');
  process.exit(1);
}

let baseHtmlTemplate = fs.readFileSync(templateIndexPath, 'utf8');

// Inline critical index.css into HTML to eliminate render-blocking CSS requests
const cssMatch = baseHtmlTemplate.match(/<link rel="stylesheet" href="([^"]*\/assets\/index-[^"]+\.css)">/);
if (cssMatch) {
  const cssHref = cssMatch[1];
  const cssFilePath = path.join(distDir, cssHref.replace(/^\//, ''));
  if (fs.existsSync(cssFilePath)) {
    const cssContent = fs.readFileSync(cssFilePath, 'utf8');
    baseHtmlTemplate = baseHtmlTemplate.replace(cssMatch[0], `<style>${cssContent}</style>`);
    fs.writeFileSync(templateIndexPath, baseHtmlTemplate, 'utf8');
    console.log(`[SEO Prerender] Inlined critical CSS (${cssHref}) to eliminate render-blocking resources!`);
  }
}

// Clean baseHtmlTemplate so it is an unpolluted blank template for all prerendered pages
baseHtmlTemplate = baseHtmlTemplate
  .replace(/\s*<!--\s*International Hreflang[\s\S]*?-->/gi, '')
  .replace(/\s*<link\s+rel="alternate"\s+hreflang="[^"]*"\s+href="[^"]*"\s*\/?>/gi, '')
  .replace(/\s*<!--\s*Dynamic Tool Schema[\s\S]*?-->/gi, '')
  .replace(/\s*<script\s+type="application\/ld\+json">[\s\S]*?<\/script>/gi, '')
  .replace(/<div id="app">[\s\S]*?<\/div>/i, '<div id="app"></div>');

// Initialize markdown renderer
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
});

const supportedLangs = ['ar', 'de', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh'];

// Load all locales for titles and descriptions
const allLocales = {};
const allLangCodes = ['en', ...supportedLangs];

for (const lang of allLangCodes) {
  const locPath = path.join(rootDir, 'locales', `${lang}.yml`);
  allLocales[lang] = { tools: {}, home: {} };
  if (fs.existsSync(locPath)) {
    try {
      allLocales[lang] = YAML.parse(fs.readFileSync(locPath, 'utf8')) || { tools: {}, home: {} };
    } catch (err) {
      console.warn(`[SEO Prerender] Warning: Could not parse locales/${lang}.yml:`, err.message);
    }
  }
}

const enLocale = allLocales.en;

// Parse tools from src/tools/index.ts
const toolsIndexPath = path.join(rootDir, 'src', 'tools', 'index.ts');
const toolsIndexContent = fs.readFileSync(toolsIndexPath, 'utf8');

const importRegex = /import\s+\{\s*tool\s+as\s+(\w+)\s*\}\s+from\s+['"](\.\/[^'"]+)['"]/g;
const importedModules = new Map();
let importMatch;
while ((importMatch = importRegex.exec(toolsIndexContent)) !== null) {
  importedModules.set(importMatch[1], importMatch[2]);
}

const categorySection = toolsIndexContent.substring(toolsIndexContent.indexOf('export const toolsByCategory'));
const toolTokenRegex = /\b([a-zA-Z0-9_]+)\b/g;
const registeredToolVars = new Set();
let tokenMatch;
while ((tokenMatch = toolTokenRegex.exec(categorySection)) !== null) {
  if (importedModules.has(tokenMatch[1])) {
    registeredToolVars.add(tokenMatch[1]);
  }
}

console.log(`[SEO Prerender] Found ${registeredToolVars.size} tools to prerender across 10 languages.`);

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function extractFaqsFromMarkdown(rawMd) {
  if (!rawMd) return [];
  const faqs = [];
  const regex = /###\s*(?:Q\d+:\s*)?([^\n\?]+\?)\s*\n([\s\S]*?)(?=(?:###|\n---|\n##|\Z))/g;
  let match;
  while ((match = regex.exec(rawMd)) !== null) {
    const q = match[1].trim();
    let a = match[2].trim();
    a = a.replace(/```[\s\S]*?```/g, '').replace(/<[^>]*>/g, '').replace(/[*_#`]/g, '').replace(/\s+/g, ' ').trim();
    if (q && a) {
      faqs.push({
        question: q,
        answer: a.slice(0, 450),
      });
    }
  }
  return faqs;
}

function getLocalizedToolArticleAndFaqs(toolSlug, locTitle, locDesc, lang = 'en') {
  if (lang === 'en') {
    const enMdPath = path.join(rootDir, 'src', 'content', 'tools', `${toolSlug}.md`);
    if (fs.existsSync(enMdPath)) {
      const rawMd = fs.readFileSync(enMdPath, 'utf8');
      return {
        articleHtml: md.render(rawMd),
        faqs: extractFaqsFromMarkdown(rawMd),
      };
    }
  }

  const langMdPath = path.join(rootDir, 'src', 'content', 'tools', lang, `${toolSlug}.md`);
  if (fs.existsSync(langMdPath)) {
    const rawMd = fs.readFileSync(langMdPath, 'utf8');
    return {
      articleHtml: md.render(rawMd),
      faqs: extractFaqsFromMarkdown(rawMd),
    };
  }

  const cleanTitle = escapeHtml(locTitle || toolSlug);
  const cleanDesc = escapeHtml(locDesc || 'Client-side online developer tool');

  const configs = {
    ar: {
      dir: 'rtl',
      h2: `دليل استخدام ومميزات ${cleanTitle}`,
      s1Title: '1. نبذة عن الأداة والغرض الهندسي',
      s1Text: `تم تطوير أداة <strong>${cleanTitle}</strong> ضمن منصة DevTol لتوفير حل هندسي سريع، دقيق، ومستقل للمطورين والمصممين ومسؤولي الأنظمة. تساعدك الأداة على إنجاز مهامك البرمجية والتحويلية دون الحاجة إلى تثبيت برمجيات إضافية أو استخدام خوادم خارجية قد تعرض بياناتك ومفاتيحك البرمجية لمخاطر الاعتراض والتسريب.`,
      s2Title: '2. معمارية الأمان والمعالجة المحلية بنسبة 100% (Zero-Server Architecture)',
      s2Text: `الفارق الجوهري بين DevTol والمنصات السحابية التقليدية هو مبدأ الأمان بالتعريف (Security by Design):`,
      s2Points: [
        '<strong>معالجة داخل المتصفح:</strong> تنفذ جميع العمليات الرياضية والتنسيقية داخل محرك الجافاسكريبت الخاص بجهازك مباشرة.',
        '<strong>انعدام التخزين السحابي:</strong> لا يتم حفظ نصوصك، ملفاتك، أو رموزك على أي قاعدة بيانات أو خادم وسيط.',
        '<strong>توافق صارم مع معايير الويب:</strong> تعتمد الأدوات على مواصفات قياسية معتمدة من W3C و IETF لضمان دقة النتائج بنسبة 100%.',
      ],
      s3Title: '3. خطوات الاستخدام السريع',
      s3Steps: [
        'ضع البيانات أو الملفات المطلوبة في صندوق الإدخال بالأعلى.',
        'حدد الخيارات أو المعاملات المناسبة لاحتياجات مشروعك البرمجي.',
        'تظهر النتيجة فورياً مع إمكانية نسخها للحافظة أو تنزيلها بضغطة زر واحدة.',
      ],
      faqTitle: `4. الأسئلة الشائعة حول ${cleanTitle}`,
      faqs: [
        {
          q: `هل استخدام أداة ${cleanTitle} آمن ومجاني على منصة DevTol؟`,
          a: `نعم، أداة ${cleanTitle} مجانية تماماً بنسبة 100% ولا تتطلب أي تسجيل أو اشتراك. تتم معالجة جميع البيانات محلياً داخل متصفحك دون رفع أي بيانات لخوادم خارجية.`,
        },
        {
          q: `كيف تضمن أداة ${cleanTitle} حماية خصوصية بياناتي وملفاتي؟`,
          a: `تعتمد المنصة معمارية المعالجة المحلية الصفرية (Zero-Server Architecture)، حيث تنفذ خوارزميات الأداة عبر تقنيات WebAssembly و Web Workers مباشرة داخل ذاكرة جهازك.`,
        },
        {
          q: `هل يمكنني استخدام أداة ${cleanTitle} بدون اتصال بالإنترنت؟`,
          a: `نعم، تدعم منصة DevTol تقنية تطبيقات الويب التقدمية (PWA)، وبمجرد فتح الأداة لأول مرة يمكنك تشغيلها بدون اتصال بالإنترنت في أي وقت.`,
        },
      ],
    },
    de: {
      dir: 'ltr',
      h2: `Anleitung und technische Spezifikationen für ${cleanTitle}`,
      s1Title: '1. Funktionsübersicht und technischer Zweck',
      s1Text: `Das Tool <strong>${cleanTitle}</strong> auf der DevTol-Plattform wurde entwickelt, um Softwareentwicklern, Designern und Systemadministratoren eine schnelle, hochpräzise und private Lösung zu bieten. Führen Sie Ihre Berechnungen und Transformationen direkt aus, ohne zusätzliche Software installieren oder vertrauliche Produktionsdaten an externe Server übertragen zu müssen.`,
      s2Title: '2. 100% Client-Side Architektur & Zero-Server Datenschutz',
      s2Text: `Der wesentliche Unterschied zwischen DevTol und herkömmlichen Cloud-Tools liegt im Prinzip "Security by Design":`,
      s2Points: [
        '<strong>Ausführung in der Browser-Sandbox:</strong> Alle Algorithmen laufen lokal über WebAssembly und die V8-Engine Ihres Geräts.',
        '<strong>Keine Cloud-Speicherung:</strong> Weder Tokens noch Passwörter oder Dateien werden auf externen Datenbanken gespeichert.',
        '<strong>Strikte Konformität:</strong> Entwickelt nach anerkannten IETF-, RFC- und W3C-Webstandards.',
      ],
      s3Title: '3. Schnellanleitung zur Verwendung',
      s3Steps: [
        'Geben Sie die Eingabedaten oder Dateien in das obige Formular ein.',
        'Passen Sie die Konfigurationsoptionen an Ihre Projektanforderungen an.',
        'Das Ergebnis wird sofort berechnet und steht zum Kopieren oder Download bereit.',
      ],
      faqTitle: `4. Häufig gestellte Fragen zu ${cleanTitle}`,
      faqs: [
        {
          q: `Ist die Nutzung von ${cleanTitle} auf DevTol sicher und kostenlos?`,
          a: `Ja, ${cleanTitle} ist zu 100% kostenlos und erfordert weder Registrierung noch Abonnement. Alle Daten werden rein lokal im Browser verarbeitet.`,
        },
        {
          q: `Wie schützt ${cleanTitle} die Vertraulichkeit meiner Daten?`,
          a: `Dank der Zero-Server-Architektur verlassen keine Daten Ihren lokalen Arbeitsspeicher; es gibt keinerlei Netzwerkübertragungen an Backend-Server.`,
        },
        {
          q: `Kann ${cleanTitle} auch offline verwendet werden?`,
          a: `Ja, DevTol ist eine Progressive Web App (PWA) und nach dem ersten Laden vollständig ohne aktive Internetverbindung nutzbar.`,
        },
      ],
    },
    es: {
      dir: 'ltr',
      h2: `Guía técnica y especificaciones de ${cleanTitle}`,
      s1Title: '1. Descripción general y propósito técnico',
      s1Text: `La herramienta <strong>${cleanTitle}</strong> en la plataforma DevTol fue desarrollada para ofrecer a desarrolladores, diseñadores y administradores de sistemas una solución rápida, precisa y confidencial. Realice conversiones y cálculos directamente en su navegador sin necesidad de instalar programas adicionales ni exponer datos en servidores externos.`,
      s2Title: '2. Arquitectura 100% del lado del cliente y privacidad Zero-Server',
      s2Text: `A diferencia de los servicios convencionales en la nube, DevTol opera bajo el estándar de seguridad por diseño (Security by Design):`,
      s2Points: [
        '<strong>Ejecución en sandbox local:</strong> Todas las operaciones se ejecutan en la memoria de su navegador mediante WebAssembly y JavaScript.',
        '<strong>Cero almacenamiento remoto:</strong> Sus contraseñas, tokens y archivos nunca se envían a bases de datos en la nube.',
        '<strong>Estándares oficiales:</strong> Cumplimiento estricto de las especificaciones RFC y W3C.',
      ],
      s3Title: '3. Pasos de uso rápido',
      s3Steps: [
        'Pegue los datos o cargue los archivos en el panel superior.',
        'Ajuste los parámetros según las especificaciones de su flujo de trabajo.',
        'El resultado se genera de forma instantánea para copiarlo al portapapeles o descargarlo.',
      ],
      faqTitle: `4. Preguntas frecuentes sobre ${cleanTitle}`,
      faqs: [
        {
          q: `¿Es seguro y gratuito usar ${cleanTitle} en DevTol?`,
          a: `Sí, ${cleanTitle} es 100% gratuito y no requiere registro ni suscripciones. Todo el procesamiento se realiza localmente en su dispositivo.`,
        },
        {
          q: `¿Cómo protege ${cleanTitle} la privacidad de mis archivos y datos?`,
          a: `Gracias a la arquitectura Zero-Server, ningún byte de información se transmite por internet ni se registra en servidores de terceros.`,
        },
        {
          q: `¿Puedo utilizar ${cleanTitle} sin conexión a internet?`,
          a: `Sí, DevTol funciona como una Progressive Web App (PWA) con soporte fuera de línea completo tras la carga inicial.`,
        },
      ],
    },
    fr: {
      dir: 'ltr',
      h2: `Guide d'utilisation et spécifications techniques de ${cleanTitle}`,
      s1Title: `1. Présentation et objectif technique`,
      s1Text: `L'outil <strong>${cleanTitle}</strong> sur la plateforme DevTol est conçu pour fournir aux développeurs, concepteurs et équipes d'ingénierie une solution rapide, précise et totalement confidentielle. Exécutez vos opérations techniques sans installer d'applications tierces ni transmettre vos données à des serveurs distants.`,
      s2Title: `2. Architecture 100% côté client et confidentialité Zero-Server`,
      s2Text: `Contrairement aux outils cloud classiques, DevTol applique le principe de sécurité dès la conception (Security by Design) :`,
      s2Points: [
        `<strong>Traitement local isolé :</strong> Tous les calculs s'effectuent directement dans le navigateur via WebAssembly et Web Workers.`,
        `<strong>Aucun stockage cloud :</strong> Vos jetons, clés secrètes et fichiers ne sont jamais enregistrés sur des serveurs distants.`,
        `<strong>Conformité stricte :</strong> Respect rigoureux des standards de l'IETF, du W3C et des spécifications RFC.`,
      ],
      s3Title: `3. Instructions d'utilisation rapide`,
      s3Steps: [
        `Insérez vos données ou fichiers dans le formulaire ci-dessus.`,
        `Sélectionnez les options adaptées aux exigences de votre projet.`,
        `Le résultat est généré instantanément, prêt à être copié ou téléchargé d'un simple clic.`,
      ],
      faqTitle: `4. Foire aux questions (FAQ) sur ${cleanTitle}`,
      faqs: [
        {
          q: `L'outil ${cleanTitle} est-il gratuit et sécurisé sur DevTol ?`,
          a: `Oui, ${cleanTitle} est 100% gratuit, sans inscription ni abonnement. Tous les traitements s'effectuent exclusivement en local dans votre navigateur.`,
        },
        {
          q: `Comment ${cleanTitle} protège-t-il mes données sensibles ?`,
          a: `Grâce à notre architecture Zero-Server, aucune donnée n'est envoyée sur le réseau ni consignée dans des bases de données distantes.`,
        },
        {
          q: `Est-il possible d'utiliser ${cleanTitle} hors ligne ?`,
          a: `Oui, DevTol est une Progressive Web App (PWA) parfaitement fonctionnelle sans connexion Internet après le premier chargement.`,
        },
      ],
    },
    pt: {
      dir: 'ltr',
      h2: `Guia de utilização e especificações técnicas de ${cleanTitle}`,
      s1Title: '1. Visão geral e objetivo técnico',
      s1Text: `A ferramenta <strong>${cleanTitle}</strong> na plataforma DevTol foi criada para oferecer aos desenvolvedores, designers e engenheiros de software uma solução rápida, exata e segura. Processe conversões e análises diretamente no navegador sem enviar credenciais para a nuvem.`,
      s2Title: '2. Arquitetura 100% do lado do cliente e privacidade Zero-Server',
      s2Text: `Diferente de serviços convencionais na nuvem, o DevTol baseia-se no princípio de segurança por design (Security by Design):`,
      s2Points: [
        '<strong>Execução local no navegador :</strong> Todas as operações ocorrem na memória do dispositivo via WebAssembly e Web Workers.',
        '<strong>Zero armazenamento remoto :</strong> Suas chaves, tokens e documentos nunca são salvos em servidores externos.',
        '<strong>Padrões de engenharia :</strong> Conformidade estrita com as especificações oficiais IETF e W3C.',
      ],
      s3Title: '3. Passo a passo para utilização',
      s3Steps: [
        'Insira os dados ou arquivos no campo acima.',
        'Ajuste as opções conforme a necessidade do seu projeto.',
        'Obtenha o resultado instantaneamente para copiar ou baixar com um clique.',
      ],
      faqTitle: `4. Perguntas frequentes sobre ${cleanTitle}`,
      faqs: [
        {
          q: `O uso de ${cleanTitle} é gratuito e seguro no DevTol?`,
          a: `Sim, ${cleanTitle} é 100% gratuito e não exige cadastro. Todo o processamento ocorre localmente no seu navegador.`,
        },
        {
          q: `Como o ${cleanTitle} garante a segurança dos meus dados?`,
          a: `Com a arquitetura Zero-Server, nenhum dado é transmitido pela rede ou gravado em servidores externos.`,
        },
        {
          q: `Posso usar o ${cleanTitle} sem conexão à internet?`,
          a: `Sim, o DevTol funciona como uma PWA e opera normalmente offline após o carregamento inicial.`,
        },
      ],
    },
    no: {
      dir: 'ltr',
      h2: `Brukerveiledning og tekniske spesifikasjoner for ${cleanTitle}`,
      s1Title: '1. Oversikt og teknisk formål',
      s1Text: `Verktøyet <strong>${cleanTitle}</strong> på DevTol-plattformen er utviklet for å gi programvareutviklere og designere en rask, presis og sikker løsning. Utfør beregninger og konverteringer direkte uten å laste opp sensitive produksjonsdata til eksterne skyservere.`,
      s2Title: '2. 100% klientsidearkitektur og Zero-Server personvern',
      s2Text: `Forskjellen mellom DevTol og tradisjonelle skytjenester er sikkerhet ved design (Security by Design):`,
      s2Points: [
        '<strong>Kjøring i nettleser-sandkasse :</strong> Alt utføres lokalt på enheten via WebAssembly og Web Workers.',
        '<strong>Ingen skylagring :</strong> Passord, tokens og filer lagres aldri på eksterne databaser.',
        '<strong>Bransjestandarder :</strong> Streng overholdelse av IETF- og W3C-spesifikasjoner.',
      ],
      s3Title: '3. Hurtigveiledning for bruk',
      s3Steps: [
        'Lim inn inndata eller last opp fil i feltet over.',
        'Tilpass innstillingene etter dine prosjektbehov.',
        'Resultatet genereres umiddelbart og kan kopieres eller lastes ned med ett klikk.',
      ],
      faqTitle: `4. Ofte stilte spørsmål om ${cleanTitle}`,
      faqs: [
        {
          q: `Er det trygt og gratis å bruke ${cleanTitle} på DevTol?`,
          a: `Ja, ${cleanTitle} er 100% gratis og krever ingen registrering. All databehandling skjer lokalt i nettleseren.`,
        },
        {
          q: `Hvordan beskytter ${cleanTitle} personvernet mitt?`,
          a: `Med Zero-Server-arkitekturen blir ingen data overført over nettverket eller lagret på eksterne servere.`,
        },
        {
          q: `Kan jeg bruke ${cleanTitle} uten internettforbindelse?`,
          a: `Ja, DevTol støtter PWA og fungerer i frakoblet modus etter første innlasting.`,
        },
      ],
    },
    uk: {
      dir: 'ltr',
      h2: `Посібник користувача та технічні характеристики ${cleanTitle}`,
      s1Title: '1. Огляд інструмента та технічне призначення',
      s1Text: `Інструмент <strong>${cleanTitle}</strong> на платформі DevTol розроблено для швидкого, точного та конфіденційного виконання завдань розробників і системних адміністраторів без потреби встановлювати сторонні програми або передавати конфіденційні дані на зовнішні сервери.`,
      s2Title: '2. Архітектура 100% на стороні клієнта та безпека Zero-Server',
      s2Text: `Головна відмінність між DevTol і звичайними хмарними сервісами — це безпека на рівні архітектури (Security by Design):`,
      s2Points: [
        '<strong>Виконання в пісочниці браузера :</strong> Усі операції виконуються локально на пристрої через WebAssembly.',
        '<strong>Відсутність хмарного сховища :</strong> Паролі, токени та файли ніколи не зберігаються на сторонніх серверах.',
        '<strong>Відповідність стандартам :</strong> Суворе дотримання офіційних специфікацій RFC та W3C.',
      ],
      s3Title: '3. Швидкі інструкції з використання',
      s3Steps: [
        'Введіть дані або завантажте файл у поле вище.',
        'Виберіть необхідні параметри для вашого проекту.',
        'Результат обчислюється миттєво і готовий до копіювання чи завантаження в один клік.',
      ],
      faqTitle: `4. Поширені запитання про ${cleanTitle}`,
      faqs: [
        {
          q: `Чи безпечно і безкоштовно використовувати ${cleanTitle} на DevTol?`,
          a: `Так, ${cleanTitle} на 100% безкоштовний і не вимагає реєстрації. Усі обчислення виконуються локально у вашому браузері.`,
        },
        {
          q: `Як ${cleanTitle} захищає конфіденційність моїх даних?`,
          a: `Завдяки архітектурі Zero-Server жоден байт даних не передається через інтернет і не зберігається на сторонніх серверах.`,
        },
        {
          q: `Чи працює ${cleanTitle} без підключення до інтернету?`,
          a: `Так, DevTol підтримує PWA і може працювати в автономному режимі після першого завантаження.`,
        },
      ],
    },
    vi: {
      dir: 'ltr',
      h2: `Hướng dẫn sử dụng và thông số kỹ thuật của ${cleanTitle}`,
      s1Title: '1. Tổng quan và mục đích kỹ thuật',
      s1Text: `Công cụ <strong>${cleanTitle}</strong> trên nền tảng DevTol được phát triển nhằm cung cấp cho các lập trình viên và kỹ sư giải pháp xử lý dữ liệu nhanh chóng, chính xác và bảo mật tối đa. Hoàn thành các tác vụ chuyển đổi mà không cần tải lên bất kỳ máy chủ nào.`,
      s2Title: '2. Kiến trúc 100% phía máy khách & Bảo mật Zero-Server',
      s2Text: `Sự khác biệt cốt lõi giữa DevTol và các dịch vụ đám mây là tiêu chuẩn an toàn ngay từ thiết kế (Security by Design):`,
      s2Points: [
        '<strong>Thực thi trong hộp cát cục bộ :</strong> Mọi tác vụ chạy trực tiếp trong trình duyệt bằng WebAssembly và Web Workers.',
        '<strong>Không lưu trữ đám mây :</strong> Khóa bí mật, token và tài liệu của bạn không bao giờ lưu trên máy chủ bên ngoài.',
        '<strong>Tiêu chuẩn quốc tế :</strong> Tuân thủ nghiêm ngặt các tiêu chuẩn IETF, RFC và W3C.',
      ],
      s3Title: '3. Hướng dẫn sử dụng nhanh',
      s3Steps: [
        'Dán dữ liệu hoặc tải tệp lên khung nhập liệu phía trên.',
        'Tùy chỉnh các tham số theo yêu cầu dự án.',
        'Kết quả được tạo tức thì, sẵn sàng sao chép hoặc tải về một chạm.',
      ],
      faqTitle: `4. Câu hỏi thường gặp về ${cleanTitle}`,
      faqs: [
        {
          q: `Sử dụng ${cleanTitle} trên DevTol có miễn phí và an toàn không?`,
          a: `Có, ${cleanTitle} hoàn toàn miễn phí 100% và không yêu cầu đăng ký. Mọi tác vụ được xử lý hoàn toàn cục bộ trên máy bạn.`,
        },
        {
          q: `Công cụ ${cleanTitle} bảo vệ quyền riêng tư dữ liệu như thế nào?`,
          a: `Nhờ kiến trúc Zero-Server, không có dữ liệu nào được truyền qua mạng hay lưu trữ trên máy chủ bên ngoài.`,
        },
        {
          q: `Tôi có thể sử dụng ${cleanTitle} khi không có mạng không?`,
          a: `Có, DevTol hỗ trợ PWA và hoạt động ngoại tuyến mượt mà sau lần truy cập đầu tiên.`,
        },
      ],
    },
    zh: {
      dir: 'ltr',
      h2: `${cleanTitle} 使用指南与技术规范`,
      s1Title: '1. 工具概述与工程目标',
      s1Text: `DevTol 平台上的 <strong>${cleanTitle}</strong> 工具专为开发者、设计师和系统工程师量身打造，提供快速、精准且极具隐私保护的技术解决方案。无需安装额外软件或将敏感代码与秘钥上传至外部云服务器即可直接完成操作。`,
      s2Title: '2. 100% 客户端本地计算与 Zero-Server 架构',
      s2Text: `DevTol 与传统云端工具的核心差异在于“原生安全设计”（Security by Design）：`,
      s2Points: [
        '<strong>本地沙箱独立运行 :</strong> 所有计算完全依托本地设备的 WebAssembly 和 V8 引擎执行。',
        '<strong>零云端数据留存 :</strong> 任何凭证、密钥与文件绝不保存到外部数据库或服务器。',
        '<strong>行业技术标准 :</strong> 严格遵循 IETF、W3C 和 RFC 官方规范。',
      ],
      s3Title: '3. 快速上手操作流程',
      s3Steps: [
        '在上方的输入框中粘贴待处理数据或上传源文件。',
        '根据项目规范调整参数与格式选项。',
        '处理结果实时生成，支持一键快速复制或下载保存。',
      ],
      faqTitle: `4. 常见问题解答 (${cleanTitle})`,
      faqs: [
        {
          q: `在 DevTol 上使用 ${cleanTitle} 是否完全免费且安全？`,
          a: `是的，${cleanTitle} 100% 永久免费，无需注册或付费订阅。所有数据转换与计算全部在本地浏览器内存中完成。`,
        },
        {
          q: `${cleanTitle} 如何保障我的数据与代码隐私？`,
          a: `得益于 Zero-Server 零服务器架构，任何文件与字符都不会通过网络向外发送，也不存在第三方数据记录风险。`,
        },
        {
          q: `是否可以在无网络（离线）状态下使用 ${cleanTitle}？`,
          a: `完全可以。DevTol 支持渐进式 Web 应用 (PWA) 技术，首次加载后即可在离线环境下正常运行。`,
        },
      ],
    },
  };

  const c = configs[lang] || configs.de;
  const isRtl = c.dir === 'rtl';

  const schemaFaqs = c.faqs.map(item => ({
    question: item.q,
    answer: item.a,
  }));

  const articleHtml = `
    <article class="localized-tool-guide" style="line-height: 1.85; color: #334155; text-align: ${isRtl ? 'right' : 'left'}; direction: ${c.dir};">
      <header style="margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #e2e8f0;">
        <h2 style="font-size: 1.6rem; font-weight: 800; color: #0f172a; margin-bottom: 8px;">${c.h2}</h2>
        <p style="color: #64748b; font-size: 1rem;">${cleanDesc}</p>
      </header>

      <section style="margin-bottom: 28px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 10px;">${c.s1Title}</h3>
        <p>${c.s1Text}</p>
      </section>

      <section style="margin-bottom: 28px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 10px;">${c.s2Title}</h3>
        <p>${c.s2Text}</p>
        <ul style="${isRtl ? 'padding-right: 20px;' : 'padding-left: 20px;'} margin-top: 8px;">
          ${c.s2Points.map(p => `<li>${p}</li>`).join('')}
        </ul>
      </section>

      <section style="margin-bottom: 28px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 10px;">${c.s3Title}</h3>
        <ol style="${isRtl ? 'padding-right: 20px;' : 'padding-left: 20px;'} margin-top: 8px;">
          ${c.s3Steps.map(s => `<li>${s}</li>`).join('')}
        </ol>
      </section>

      <section style="margin-bottom: 24px;">
        <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin-bottom: 12px;">${c.faqTitle}</h3>
        ${c.faqs.map(f => `
          <div style="margin-bottom: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 14px 18px;">
            <strong style="display: block; font-size: 1.05rem; color: #0f172a; margin-bottom: 6px;">${escapeHtml(f.q)}</strong>
            <p style="margin: 0; font-size: 0.95rem; color: #475569;">${escapeHtml(f.a)}</p>
          </div>
        `).join('')}
      </section>
    </article>
  `;

  return { articleHtml, faqs: schemaFaqs };
}

function generatePrerenderedHtml({
  pathSlug,
  title,
  description,
  keywords,
  articleHtml,
  category,
  faqs = [],
  relatedTools = [],
  lang = 'en',
}) {
  const isEn = lang === 'en';
  const canonicalUrl = isEn ? `${BASE_URL}/${pathSlug}` : `${BASE_URL}/${lang}/${pathSlug}`;

  // Localized title & description formatting with high CTR hooks
  let fullTitle = `${title} Online — Free, Fast & Client-Side | DevTol`;
  let fullDesc = `${description}. 100% free, private, and client-side developer tool running locally on DevTol.`;

  if (lang === 'ar') {
    fullTitle = `${title} أونلاين مجاناً (سريع ومحلي 100%) - DevTol`;
    fullDesc = `${description}. أداة مطورين ومصممين مجانية 100% تعمل محلياً داخل المتصفح بأمان وخصوصية تامة على DevTol.`;
  } else if (lang === 'de') {
    fullTitle = `${title} Online Kostenlos (Schnell & Sicher) - DevTol`;
    fullDesc = `${description}. 100% clientseitiges, kostenloses und sicheres Online-Entwicklertool auf DevTol.`;
  } else if (lang === 'es') {
    fullTitle = `${title} Online Gratis (Rápido y Seguro) - DevTol`;
    fullDesc = `${description}. Herramienta online para desarrolladores 100% en el navegador, gratis y segura en DevTol.`;
  } else if (lang === 'fr') {
    fullTitle = `${title} en Ligne Gratuit (Rapide & Sécurisé) - DevTol`;
    fullDesc = `${description}. Outil développeur en ligne 100% côté client, gratuit et sécurisé sur DevTol.`;
  } else if (!isEn) {
    fullTitle = `${title} Online (Free & Private) - DevTol`;
    fullDesc = `${description}. Free, 100% client-side, fast and secure online developer tool on DevTol.`;
  }

  // Generate complete bidirectional hreflang tags
  const hreflangTags = [
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/${pathSlug}" />`,
    `<link rel="alternate" hreflang="en" href="${BASE_URL}/${pathSlug}" />`,
    ...supportedLangs.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}/${pathSlug}" />`),
  ].join('\n    ');

  const isLegalOrEditorial = category === 'InformationPage' || ['about', 'privacy-policy', 'terms-of-service', 'contact', 'disclaimer', 'guides', 'deals', 'pdf-tools'].includes(pathSlug);

  const mainEntityNode = isLegalOrEditorial
    ? {
        '@type': pathSlug === 'about' ? 'AboutPage' : pathSlug === 'contact' ? 'ContactPage' : 'WebPage',
        '@id': `${canonicalUrl}#webpage`,
        'url': canonicalUrl,
        'name': `${title} — DevTol`,
        'description': fullDesc,
        'inLanguage': lang,
        'isPartOf': {
          '@type': 'WebSite',
          '@id': `${BASE_URL}/#website`,
          'name': 'DevTol',
          'url': `${BASE_URL}/`,
        },
      }
    : {
        '@type': 'WebApplication',
        '@id': `${canonicalUrl}#webapp`,
        'url': canonicalUrl,
        'name': `${title} Online`,
        'applicationCategory': 'DeveloperApplication',
        'operatingSystem': 'All',
        'browserRequirements': 'Requires JavaScript. Requires HTML5.',
        'isAccessibleForFree': true,
        'featureList': [
          '100% Client-Side Local Browser Execution',
          'Zero Server Data Transmission or Logging',
          'Offline-Capable Progressive Web App (PWA)',
        ],
        'description': fullDesc,
        'inLanguage': lang,
        'offers': {
          '@type': 'Offer',
          'price': '0',
          'priceCurrency': 'USD',
        },
      };

  const graphNodes = [
    mainEntityNode,
    {
      '@type': 'BreadcrumbList',
      '@id': `${canonicalUrl}#breadcrumb`,
      'itemListElement': [
        {
          '@type': 'ListItem',
          'position': 1,
          'name': isEn ? 'Home' : (allLocales[lang]?.home?.home || 'Home'),
          'item': isEn ? BASE_URL : `${BASE_URL}/${lang}`,
        },
        {
          '@type': 'ListItem',
          'position': 2,
          'name': title,
          'item': canonicalUrl,
        },
      ],
    },
  ];

  if (faqs && faqs.length > 0) {
    graphNodes.push({
      '@type': 'FAQPage',
      '@id': `${canonicalUrl}#faq`,
      'mainEntity': faqs.map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer,
        },
      })),
    });
  }

  const schemaJson = JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': graphNodes,
  });

  let html = baseHtmlTemplate;

  // Replace <html lang="...">
  html = html.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ' dir="ltr"'}`);

  // Replace <title>
  html = html.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(fullTitle)}</title>`);

  // Replace meta name="description"
  html = html.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(fullDesc)}" />`);
  html = html.replace(/<meta\s+itemprop="description"\s+content=".*?"\s*\/?>/i, `<meta itemprop="description" content="${escapeHtml(fullDesc)}" />`);
  html = html.replace(/<meta\s+itemprop="name"\s+content=".*?"\s*\/?>/i, `<meta itemprop="name" content="${escapeHtml(fullTitle)}" />`);

  // Replace Canonical
  html = html.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${canonicalUrl}" />`);

  // Replace OpenGraph
  html = html.replace(/<meta\s+property="og:title"\s+content=".*?"\s*\/?>/i, `<meta property="og:title" content="${escapeHtml(fullTitle)}" />`);
  html = html.replace(/<meta\s+property="og:description"\s+content=".*?"\s*\/?>/i, `<meta property="og:description" content="${escapeHtml(fullDesc)}" />`);
  html = html.replace(/<meta\s+property="og:url"\s+content=".*?"\s*\/?>/i, `<meta property="og:url" content="${canonicalUrl}" />`);

  // Replace Twitter
  html = html.replace(/<meta\s+name="twitter:title"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:title" content="${escapeHtml(fullTitle)}" />`);
  html = html.replace(/<meta\s+name="twitter:description"\s+content=".*?"\s*\/?>/i, `<meta name="twitter:description" content="${escapeHtml(fullDesc)}" />`);

  // Inject hreflangs & dynamic tool JSON-LD schema into head
  const headInjection = `\n    <!-- International Hreflang Network -->\n    ${hreflangTags}\n    <!-- Dynamic Tool Schema.org Structured Data -->\n    <script type="application/ld+json">\n    ${schemaJson.replace(/<\/script/gi, '<\\/script')}\n    </script>\n  </head>`;
  html = html.replace('</head>', headInjection);

  // Related tools navigation for internal link graph & topic clusters
  const relatedHeading = lang === 'ar' ? 'أدوات مطورين ومصممين ذات صلة' : 'Related Online Developer Tools';
  const relatedHtml = (relatedTools && relatedTools.length > 0) ? `
    <nav class="related-tools" style="margin-top: 48px; padding-top: 32px; border-top: 2px solid #e2e8f0;">
      <h3 style="font-size: 1.25rem; font-weight: 700; color: #0f172a; margin: 0 0 16px 0;">${escapeHtml(relatedHeading)}</h3>
      <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
        ${relatedTools.map(rt => `
          <a href="/${rt.slug}" style="display: block; padding: 12px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; text-decoration: none; color: #0f172a;">
            <strong style="display: block; font-size: 0.875rem; color: #059669;">${escapeHtml(rt.title)}</strong>
            <span style="display: block; font-size: 0.75rem; color: #64748b; margin-top: 4px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${escapeHtml(rt.description)}</span>
          </a>
        `).join('')}
      </div>
    </nav>
  ` : '';

  // Inject rich semantic content inside <div id="app"></div>
  const preRenderedContent = `
    <div id="app">
      <main class="seo-prerender-container" style="max-width: 900px; margin: 0 auto; padding: 40px 20px; font-family: system-ui, -apple-system, sans-serif; color: #1e293b;">
        <header style="margin-bottom: 24px; border-bottom: 2px solid #e2e8f0; padding-bottom: 16px;">
          <h1 style="font-size: 2.25rem; font-weight: 800; color: #0f172a; margin: 0 0 8px 0;">${escapeHtml(title)}</h1>
          <p style="font-size: 1.125rem; color: #475569; margin: 0; line-height: 1.5;">${escapeHtml(description)}</p>
        </header>
        ${articleHtml ? `<section class="tool-guide" style="margin-top: 24px; line-height: 1.7;">${articleHtml}</section>` : ''}
        ${relatedHtml}
      </main>
    </div>`;

  html = html.replace(/<div id="app">[\s\S]*?<\/div>/i, preRenderedContent.trim());

  return html;
}

const toolsList = [];

for (const varName of registeredToolVars) {
  const relImport = importedModules.get(varName);
  let toolFilePath = path.join(rootDir, 'src', 'tools', relImport.replace('./', ''), 'index.ts');
  if (!fs.existsSync(toolFilePath)) {
    toolFilePath = path.join(rootDir, 'src', 'tools', `${relImport.replace('./', '')}.ts`);
  }

  if (fs.existsSync(toolFilePath)) {
    const fileContent = fs.readFileSync(toolFilePath, 'utf8');
    const pathMatch = fileContent.match(/path:\s*['"]([^'"]+)['"]/);
    if (!pathMatch) continue;

    const rawPath = pathMatch[1].replace(/^\//, '');
    const toolSlug = rawPath;

    const localeEntry = (enLocale.tools && enLocale.tools[toolSlug]) || {};
    let title = localeEntry.title;
    let description = localeEntry.description;

    const literalNameMatch = fileContent.match(/name:\s*['"]([^'"]+)['"]/);
    if (!title && literalNameMatch) {
      title = literalNameMatch[1];
    }

    const literalDescMatch = fileContent.match(/description:\s*['"]([^'"]+)['"]/);
    if (!description && literalDescMatch) {
      description = literalDescMatch[1];
    }

    if (!title) {
      title = toolSlug
        .split('-')
        .map(w => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ');
    }
    if (!description) {
      description = `Free online ${title} utility. Fast, client-side, and private.`;
    }

    const keywordsMatch = fileContent.match(/keywords:\s*\[([\s\S]*?)\]/);
    let keywords = [];
    if (keywordsMatch) {
      keywords = keywordsMatch[1]
        .split(',')
        .map(k => k.replace(/['"\s]/g, ''))
        .filter(Boolean);
    }

    const articlePath = path.join(rootDir, 'src', 'content', 'tools', `${toolSlug}.md`);
    let articleHtml = '';
    let faqs = [];
    if (fs.existsSync(articlePath)) {
      const rawMd = fs.readFileSync(articlePath, 'utf8');
      articleHtml = md.render(rawMd);
      faqs = extractFaqsFromMarkdown(rawMd);
    }

    toolsList.push({
      slug: toolSlug,
      title,
      description,
      keywords,
      articleHtml,
      faqs,
    });
  }
}

let generatedCount = 0;
const totalTools = toolsList.length;

// 1. Prerender all tools across all 10 languages
for (let i = 0; i < totalTools; i++) {
  const tool = toolsList[i];
  const relatedTools = [
    toolsList[(i - 2 + totalTools) % totalTools],
    toolsList[(i - 1 + totalTools) % totalTools],
    toolsList[(i + 1) % totalTools],
    toolsList[(i + 2) % totalTools],
  ].map(t => ({ slug: t.slug, title: t.title, description: t.description }));

  // 1A. English (Default)
  const enHtml = generatePrerenderedHtml({
    pathSlug: tool.slug,
    title: tool.title,
    description: tool.description,
    keywords: tool.keywords,
    articleHtml: tool.articleHtml,
    category: 'DeveloperApplication',
    faqs: tool.faqs,
    relatedTools,
    lang: 'en',
  });

  const targetDirEn = path.join(distDir, tool.slug);
  if (!fs.existsSync(targetDirEn)) {
    fs.mkdirSync(targetDirEn, { recursive: true });
  }
  fs.writeFileSync(path.join(targetDirEn, 'index.html'), enHtml, 'utf8');
  fs.writeFileSync(path.join(distDir, `${tool.slug}.html`), enHtml, 'utf8');
  generatedCount++;

  // 1B. Localized pages for all supported languages
  for (const lang of supportedLangs) {
    const locDict = allLocales[lang]?.tools?.[tool.slug] || {};
    const locTitle = locDict.title || tool.title;
    const locDesc = locDict.description || tool.description;

    const locData = getLocalizedToolArticleAndFaqs(tool.slug, locTitle, locDesc, lang);

    const localizedHtml = generatePrerenderedHtml({
      pathSlug: tool.slug,
      title: locTitle,
      description: locDesc,
      keywords: tool.keywords,
      articleHtml: locData.articleHtml,
      category: 'DeveloperApplication',
      faqs: locData.faqs,
      relatedTools: relatedTools.map(rt => {
        const rtDict = allLocales[lang]?.tools?.[rt.slug] || {};
        return {
          slug: `${lang}/${rt.slug}`,
          title: rtDict.title || rt.title,
          description: rtDict.description || rt.description,
        };
      }),
      lang,
    });

    const targetDirLang = path.join(distDir, lang, tool.slug);
    if (!fs.existsSync(targetDirLang)) {
      fs.mkdirSync(targetDirLang, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDirLang, 'index.html'), localizedHtml, 'utf8');
    fs.writeFileSync(path.join(distDir, lang, `${tool.slug}.html`), localizedHtml, 'utf8');
    generatedCount++;
  }
}

// 2. Prerender localized homepages (dist/ar/index.html, dist/de/index.html, etc.)
for (const lang of supportedLangs) {
  const homeTargetDir = path.join(distDir, lang);
  if (!fs.existsSync(homeTargetDir)) {
    fs.mkdirSync(homeTargetDir, { recursive: true });
  }

  const locHome = allLocales[lang]?.home || {};
  let homeTitle = `DevTol — Free Online Developer Tools Suite`;
  let homeDesc = locHome.subtitle || 'Handy online tools for developers and IT workers. 100% client-side, secure and free.';

  if (lang === 'ar') {
    homeTitle = 'DevTol — منصة أدوات المطورين والمصممين المجانية (تعمل محلياً 100%)';
    homeDesc = 'مجموعة أدوات برمجية وتصميم مجانية تعمل بالكامل في المتصفح مع حماية تامة للخصوصية وبدون رفع أي ملفات.';
  }

  const homeHreflangs = [
    `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`,
    `<link rel="alternate" hreflang="en" href="${BASE_URL}/" />`,
    ...supportedLangs.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}" />`),
  ].join('\n    ');

  let homeHtml = baseHtmlTemplate;
  homeHtml = homeHtml.replace(/<html\s+lang="[^"]*"/i, `<html lang="${lang}"${lang === 'ar' ? ' dir="rtl"' : ' dir="ltr"'}`);
  homeHtml = homeHtml.replace(/<title>.*?<\/title>/i, `<title>${escapeHtml(homeTitle)}</title>`);
  homeHtml = homeHtml.replace(/<meta\s+name="description"\s+content=".*?"\s*\/?>/i, `<meta name="description" content="${escapeHtml(homeDesc)}" />`);
  homeHtml = homeHtml.replace(/<link\s+rel="canonical"\s+href=".*?"\s*\/?>/i, `<link rel="canonical" href="${BASE_URL}/${lang}" />`);
  homeHtml = homeHtml.replace('</head>', `\n    <!-- International Hreflangs -->\n    ${homeHreflangs}\n  </head>`);

  const homePrerenderBody = getHomePrerenderContent(lang, toolsList);
  homeHtml = homeHtml.replace(/<div id="app">[\s\S]*?<\/div>/i, homePrerenderBody.trim());

  fs.writeFileSync(path.join(homeTargetDir, 'index.html'), homeHtml, 'utf8');
  fs.writeFileSync(path.join(distDir, `${lang}.html`), homeHtml, 'utf8');
  generatedCount += 2;
}

// 3. Update root dist/index.html with home hreflangs & rich prerendered home content
const rootHomeHreflangs = [
  `<link rel="alternate" hreflang="x-default" href="${BASE_URL}/" />`,
  `<link rel="alternate" hreflang="en" href="${BASE_URL}/" />`,
  ...supportedLangs.map(l => `<link rel="alternate" hreflang="${l}" href="${BASE_URL}/${l}" />`),
].join('\n    ');

let rootHomeHtml = baseHtmlTemplate;
const homeSchemaJson = JSON.stringify({
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${BASE_URL}/#website`,
      'url': `${BASE_URL}/`,
      'name': 'DevTol',
      'description': '126+ free, private, client-side online tools for developers & designers.',
      'inLanguage': 'en',
    },
    {
      '@type': 'WebApplication',
      '@id': `${BASE_URL}/#webapp`,
      'name': 'DevTol Suite',
      'url': `${BASE_URL}/`,
      'applicationCategory': 'DeveloperApplication',
      'operatingSystem': 'All',
      'browserRequirements': 'Requires JavaScript. Requires HTML5.',
      'isAccessibleForFree': true,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD',
      },
    },
  ],
});
if (!rootHomeHtml.includes('hreflang="x-default"')) {
  rootHomeHtml = rootHomeHtml.replace('</head>', `\n    <!-- International Hreflangs -->\n    ${rootHomeHreflangs}\n    <!-- Homepage Schema.org Structured Data -->\n    <script type="application/ld+json">\n    ${homeSchemaJson}\n    </script>\n  </head>`);
}
const enHomePrerenderBody = getHomePrerenderContent('en', toolsList);
rootHomeHtml = rootHomeHtml.replace(/<div id="app">[\s\S]*?<\/div>/i, enHomePrerenderBody.trim());
fs.writeFileSync(templateIndexPath, rootHomeHtml, 'utf8');

// 4. Prerender Editorial & Legal pages (English default)
const legalPages = [
  {
    slug: 'guides',
    title: 'Developer Engineering Guides & Technical Architecture',
    description: 'In-depth technical guides for software engineers: JWT security, client-side zero-knowledge privacy, WebP compression algorithms, and SQL formatting standards.',
    titleAr: 'أدلة المطورين الهندسية والمعمارية البرمجية',
    descAr: 'أدلة تقنية وهندسية معمقة للمطورين: أمان JWT، الحوسبة المحلية صفر-معرفة، خوارزميات ضغط WebP، ومعايير تنسيق SQL.',
  },
  {
    slug: 'deals',
    title: 'Developer Deals, Cloud Credits & Partner Perks',
    description: 'Curated developer credits, cloud infrastructure vouchers, and productivity perks for engineering teams.',
    titleAr: 'عروض المطورين وأرصدة السحابة والمكافآت البرمجية',
    descAr: 'أرصدة سحابية وقسائم بنية تحتية مجانية للمطورين والفرق الهندسية.',
  },
  {
    slug: 'pdf-tools',
    title: 'Free PDF Tools Online — 100% Client-Side & Private',
    description: 'Compress, merge, split, convert, and edit PDF documents locally in your browser. Zero file uploads, unlimited tasks, total privacy.',
    titleAr: 'أدوات PDF المجانية أونلاين — حوسبة محلية آمنة 100%',
    descAr: 'ضغط، دمج، تقسيم، تحويل، وتعديل ملفات PDF محلياً داخل متصفحك دون رفع أي ملفات للسيرفر، مجاناً وبلا قيود.',
  },
  {
    slug: 'about',
    title: 'About Us & Editorial Standards',
    description: 'Learn about the engineering team, mission, privacy-first client-side architecture, and E-E-A-T editorial standards behind DevTol.',
    titleAr: 'من نحن ومعايير النشر التحريرية',
    descAr: 'تعرف على الفريق الهندسي ورسالة منصة DevTol ومعايير الحوسبة المحلية الآمنة E-E-A-T.',
  },
  {
    slug: 'privacy-policy',
    title: 'Privacy Policy & Local Data Processing',
    description: 'Read the privacy policy of DevTol. 100% client-side computing guarantees zero transmission or logging of user data.',
    titleAr: 'سياسة الخصوصية والمعالجة المحلية للبيانات',
    descAr: 'سياسة خصوصية DevTol. الحوسبة من جانب العميل بنسبة 100% تضمن عدم تخزين أو نقل أي بيانات.',
  },
  {
    slug: 'terms-of-service',
    title: 'Terms of Service',
    description: 'Terms of service and acceptable usage guidelines for DevTol open-source developer utilities.',
    titleAr: 'شروط الخدمة والاستخدام',
    descAr: 'شروط استخدام أدوات DevTol البرمجية والمفتوحة المصدر.',
  },
  {
    slug: 'contact',
    title: 'Contact Us & Technical Support',
    description: 'Get in touch with DevTol team for feature suggestions, tool contributions, or technical bug reports.',
    titleAr: 'اتصل بنا والدعم الفني',
    descAr: 'تواصل مع فريق DevTol لاقتراح أدوات جديدة أو الإبلاغ عن مشاكل تقنية.',
  },
  {
    slug: 'disclaimer',
    title: 'Disclaimer & RFC Compliance',
    description: 'Disclaimer regarding algorithmic calculations, cryptography tools, and developer utilities on DevTol.',
    titleAr: 'إخلاء المسؤولية والمعايير التقنية',
    descAr: 'إخلاء المسؤولية القانونية والتقنية بشأن أدوات الحساب والتشفير في DevTol.',
  },
];

for (const page of legalPages) {
  for (const lang of allLangCodes) {
    const isEn = lang === 'en';
    const title = (lang === 'ar' && page.titleAr) ? page.titleAr : page.title;
    const description = (lang === 'ar' && page.descAr) ? page.descAr : page.description;

    const pageHtml = generatePrerenderedHtml({
      pathSlug: page.slug,
      title,
      description,
      keywords: ['about', 'privacy', 'terms', 'contact', 'disclaimer', 'devtol', 'guides', page.slug],
      articleHtml: getLegalPageArticleHtml(page.slug, lang),
      category: 'InformationPage',
      lang,
    });

    const pageDir = isEn
      ? path.join(distDir, page.slug)
      : path.join(distDir, lang, page.slug);

    if (!fs.existsSync(pageDir)) {
      fs.mkdirSync(pageDir, { recursive: true });
    }
    fs.writeFileSync(path.join(pageDir, 'index.html'), pageHtml, 'utf8');

    const flatFile = isEn
      ? path.join(distDir, `${page.slug}.html`)
      : path.join(distDir, lang, `${page.slug}.html`);
    const flatDir = path.dirname(flatFile);
    if (!fs.existsSync(flatDir)) {
      fs.mkdirSync(flatDir, { recursive: true });
    }
    fs.writeFileSync(flatFile, pageHtml, 'utf8');
    generatedCount += 2;
  }
}

// 5. Prerender Programmatic Scenario Landing Pages (Docker presets, Color pairs, Date pairs)
const programmaticScenarios = [
  {
    pathSlug: 'docker-run-to-compose/nginx',
    title: 'Convert Docker Run Nginx to Docker Compose YML',
    description: 'Instantly convert Nginx web server docker run command into a clean, production-ready docker-compose.yml file. 100% client-side privacy.',
    keywords: ['docker run to compose nginx', 'convert docker run nginx', 'docker-compose nginx yaml'],
    titleAr: 'تحويل أمر تشغيل Docker Nginx إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل خادم Nginx في دوكر مباشرة إلى ملف docker-compose.yml جاهز للإنتاج بخصوصية تامة محلياً.',
  },
  {
    pathSlug: 'docker-run-to-compose/postgres',
    title: 'Convert Docker Run PostgreSQL to Docker Compose YML',
    description: 'Instantly convert PostgreSQL 16 docker run command into a production-ready docker-compose.yml file with persistent volumes and credentials.',
    keywords: ['docker run postgres to compose', 'convert docker run postgresql', 'docker-compose postgres yaml'],
    titleAr: 'تحويل أمر تشغيل Docker PostgreSQL إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل قاعدة بيانات PostgreSQL 16 إلى ملف docker-compose.yml مع وسائط التخزين الدائمة والمتغيرات.',
  },
  {
    pathSlug: 'docker-run-to-compose/redis',
    title: 'Convert Docker Run Redis to Docker Compose YML',
    description: 'Instantly convert Redis in-memory cache docker run command into a production-ready docker-compose.yml file with AOF persistence.',
    keywords: ['docker run redis to compose', 'convert docker run redis', 'docker-compose redis yaml'],
    titleAr: 'تحويل أمر تشغيل Docker Redis إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل خادم التخزين المؤقت Redis إلى ملف docker-compose.yml جاهز بضغطة واحدة.',
  },
  {
    pathSlug: 'docker-run-to-compose/mysql',
    title: 'Convert Docker Run MySQL to Docker Compose YML',
    description: 'Instantly convert MySQL 8.0 database docker run command into a production-ready docker-compose.yml file with storage and auth.',
    keywords: ['docker run mysql to compose', 'convert docker run mysql', 'docker-compose mysql yaml'],
    titleAr: 'تحويل أمر تشغيل Docker MySQL إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل قاعدة بيانات MySQL 8.0 إلى ملف docker-compose.yml جاهز مع مساحات التخزين وكلمات المرور.',
  },
  {
    pathSlug: 'docker-run-to-compose/mongodb',
    title: 'Convert Docker Run MongoDB to Docker Compose YML',
    description: 'Instantly convert MongoDB NoSQL document database docker run command into a production-ready docker-compose.yml file.',
    keywords: ['docker run mongodb to compose', 'convert docker run mongo', 'docker-compose mongodb yaml'],
    titleAr: 'تحويل أمر تشغيل Docker MongoDB إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل قاعدة بيانات MongoDB إلى ملف docker-compose.yml جاهز للإنتاج بخصوصية تامة.',
  },
  {
    pathSlug: 'docker-run-to-compose/rabbitmq',
    title: 'Convert Docker Run RabbitMQ to Docker Compose YML',
    description: 'Instantly convert RabbitMQ message broker docker run command into a production-ready docker-compose.yml file with management UI ports.',
    keywords: ['docker run rabbitmq to compose', 'convert docker run rabbitmq', 'docker-compose rabbitmq yaml'],
    titleAr: 'تحويل أمر تشغيل Docker RabbitMQ إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل وسيط الرسائل RabbitMQ مع واجهة الإدارة إلى ملف docker-compose.yml جاهز.',
  },
  {
    pathSlug: 'docker-run-to-compose/wordpress',
    title: 'Convert Docker Run WordPress to Docker Compose YML',
    description: 'Instantly convert WordPress CMS docker run command into a production-ready docker-compose.yml file linked to MySQL/MariaDB.',
    keywords: ['docker run wordpress to compose', 'convert docker run wordpress', 'docker-compose wordpress yaml'],
    titleAr: 'تحويل أمر تشغيل Docker WordPress إلى ملف Docker Compose YML',
    descAr: 'حوّل أمر تشغيل موقع ووردبريس إلى ملف docker-compose.yml متكامل مع قاعدة البيانات.',
  },
  {
    pathSlug: 'color-converter/hex-to-rgb',
    title: 'HEX to RGB Color Converter: Instant Hexadecimal to RGB Conversion',
    description: 'Convert HEX color codes (#ffffff) to RGB values (rgb(255, 255, 255)) instantly with live real-time color preview and CSS copy.',
    keywords: ['hex to rgb', 'convert hex to rgb', 'hex color to rgb online'],
    titleAr: 'محول ألوان HEX إلى RGB: تحويل كود الهيكس إلى RGB أونلاين',
    descAr: 'حوّل أكواد الألوان الست عشرية (HEX) إلى قيم RGB فورياً مع معاينة حية ونسخ سريع لـ CSS.',
  },
  {
    pathSlug: 'color-converter/rgb-to-hex',
    title: 'RGB to HEX Color Converter: Instant RGB to Hexadecimal Conversion',
    description: 'Convert RGB color values (255, 255, 255) to clean HEX color codes (#ffffff) instantly with interactive color picker.',
    keywords: ['rgb to hex', 'convert rgb to hex', 'rgb to hex converter online'],
    titleAr: 'محول ألوان RGB إلى HEX: تحويل قيم RGB إلى كود هيكس',
    descAr: 'حوّل قيم ألوان RGB الرقمية إلى كود HEX ست عشري فوري مع منتقي ألوان تفاعلي.',
  },
  {
    pathSlug: 'color-converter/hex-to-hsl',
    title: 'HEX to HSL Color Converter: Convert Hex Codes to HSL Notations',
    description: 'Convert HEX colors to HSL (Hue, Saturation, Lightness) format with live color palette updates and CSS copy.',
    keywords: ['hex to hsl', 'convert hex to hsl', 'hex to hsl converter online'],
    titleAr: 'محول ألوان HEX إلى HSL أونلاين',
    descAr: 'حوّل أكواد HEX إلى نظام HSL (درجة اللون، التشبع، الإضاءة) المناسب لتصميم واجهات المستخدم الحديثة.',
  },
  {
    pathSlug: 'color-converter/rgb-to-hsl',
    title: 'RGB to HSL Color Converter: Convert RGB to Hue, Saturation & Lightness',
    description: 'Convert RGB color values to HSL notation instantly for CSS stylesheet design systems.',
    keywords: ['rgb to hsl', 'convert rgb to hsl', 'rgb to hsl converter online'],
    titleAr: 'محول ألوان RGB إلى HSL أونلاين',
    descAr: 'حوّل قيم ألوان RGB إلى صيغة HSL القياسية لتصميم الويب والـ CSS.',
  },
  {
    pathSlug: 'date-converter/unix-timestamp-to-utc',
    title: 'Unix Timestamp to UTC Converter: Convert Epoch Seconds to Human Date',
    description: 'Convert Unix epoch timestamp seconds or milliseconds into human-readable UTC date and time format instantly.',
    keywords: ['unix timestamp to utc', 'convert epoch to utc', 'unix time to human date'],
    titleAr: 'محول التوقيت الزمني Unix Timestamp إلى UTC أونلاين',
    descAr: 'حوّل ثواني وميلي ثواني توقيت يونكس (Epoch) إلى تاريخ ووقت UTC مقروء للبشر فورياً.',
  },
  {
    pathSlug: 'date-converter/unix-timestamp-to-iso',
    title: 'Unix Timestamp to ISO 8601 Converter: Instant Epoch to ISO Conversion',
    description: 'Convert Unix epoch timestamp into standard ISO 8601 international datetime format (YYYY-MM-DDTHH:mm:ss.sssZ).',
    keywords: ['unix timestamp to iso', 'convert epoch to iso 8601', 'unix to iso string'],
    titleAr: 'محول توقيت يونكس إلى صيغة ISO 8601 العالمية',
    descAr: 'حوّل ثواني توقيت يونكس إلى صيغة ISO 8601 القياسية المتوافقة مع واجهات الـ API.',
  },
  {
    pathSlug: 'date-converter/iso-to-unix-timestamp',
    title: 'ISO 8601 to Unix Timestamp Converter: Convert ISO String to Epoch Seconds',
    description: 'Convert ISO 8601 datetime strings into Unix epoch seconds and milliseconds with instant validation.',
    keywords: ['iso to unix timestamp', 'convert iso 8601 to epoch', 'iso string to timestamp'],
    titleAr: 'محول تاريخ ISO 8601 إلى توقيت يونكس (Unix Timestamp)',
    descAr: 'حوّل نصوص تواريخ ISO 8601 إلى ثواني وميلي ثواني Epoch فورياً وبأمان تام داخل المتصفح.',
  },
  {
    pathSlug: 'compress-pdf/100kb',
    title: 'Compress PDF to 100KB Online Free — 100% Client-Side',
    description: 'Compress PDF files down to 100KB online for job applications, email attachments, and government portals without uploading files.',
    keywords: ['compress pdf to 100kb', 'reduce pdf size 100kb', 'compress pdf online free'],
    titleAr: 'ضغط PDF إلى 100 كيلوبايت أونلاين مجاناً وبأمان تام',
    descAr: 'ضغط ملفات PDF حتى 100 كيلوبايت أونلاين للتقديم على الوظائف والمعاملات الحكومية دون رفع الملفات إلى أي خادم.',
  },
  {
    pathSlug: 'compress-pdf/200kb',
    title: 'Compress PDF to 200KB Online Free — Fast & Private',
    description: 'Reduce PDF file size to 200KB or less locally in your browser. Fast, free, and completely secure.',
    keywords: ['compress pdf to 200kb', 'reduce pdf to 200kb', 'shrink pdf size 200kb'],
    titleAr: 'ضغط PDF إلى 200 كيلوبايت مجاناً أونلاين',
    descAr: 'تقليص حجم ملف PDF إلى 200 كيلوبايت أو أقل محلياً داخل متصفحك بسرعة وأمان وسرية تامة.',
  },
  {
    pathSlug: 'compress-pdf/500kb',
    title: 'Compress PDF to 500KB Online Free — High Quality',
    description: 'Compress PDF documents to under 500KB with crystal-clear text and image quality preserved.',
    keywords: ['compress pdf to 500kb', 'pdf compress under 500kb', 'reduce pdf size'],
    titleAr: 'ضغط ملف PDF إلى 500 كيلوبايت بجودة عالية',
    descAr: 'ضغط مستندات PDF إلى أقل من 500 كيلوبايت مع الحفاظ على وضوح النصوص والصور.',
  },
  {
    pathSlug: 'compress-pdf/1mb',
    title: 'Compress PDF to 1MB Online Free — Instant Local Compression',
    description: 'Shrink large PDF documents down to 1MB instantly without file size limits or paywalls.',
    keywords: ['compress pdf to 1mb', 'reduce pdf to 1mb online', 'shrink large pdf'],
    titleAr: 'ضغط ملفات PDF إلى 1 ميجابايت أونلاين بدون سيرفر',
    descAr: 'تصغير ملفات PDF الكبيرة إلى 1 ميجابايت فورياً دون قيود على الحجم أو اشتراكات مدفوعة.',
  },
  {
    pathSlug: 'merge-pdf/combine-two-pdfs',
    title: 'Combine Two PDF Files Online Free — Instant & Private',
    description: 'Merge and combine two PDF files into one document in seconds. 100% client-side, zero server storage.',
    keywords: ['combine two pdfs', 'merge 2 pdf files', 'join two pdfs online'],
    titleAr: 'دمج ملفين PDF معاً أونلاين مجاناً بخصوصية تامة',
    descAr: 'دمج وتجميع ملفين PDF في مستند واحد خلال ثوانٍ معدودة. معالجة محلية 100% دون تخزين على أي خوادم.',
  },
  {
    pathSlug: 'merge-pdf/merge-scanned-documents',
    title: 'Merge Scanned Documents into One PDF Online',
    description: 'Combine multiple scanned document pages, receipts, and invoices into a single organized PDF file.',
    keywords: ['merge scanned documents', 'combine scanned pdfs', 'merge receipts into pdf'],
    titleAr: 'دمج المستندات والأوراق الممسوحة ضوئياً في ملف PDF واحد',
    descAr: 'تجميع أوراق المستندات الممسوحة ضوئياً والفواتير في ملف PDF واحد منظم وسريع المشاركة.',
  },
  {
    pathSlug: 'pdf-split/extract-pages',
    title: 'Extract Pages from PDF Online Free — Fast Page Extractor',
    description: 'Extract specific single or multiple pages from your PDF document and save as a new PDF file instantly.',
    keywords: ['extract pages from pdf', 'extract pdf page free', 'save single page pdf'],
    titleAr: 'استخراج صفحات محددة من ملف PDF مجاناً أونلاين',
    descAr: 'استخراج صفحة واحدة أو عدة صفحات معينة من ملف PDF وحفظها كمستند جديد فورياً وبأمان.',
  },
  {
    pathSlug: 'pdf-split/split-by-range',
    title: 'Split PDF by Page Range Online Free — Precision Splitting',
    description: 'Divide large PDF documents into smaller parts by custom page ranges (e.g. 1-5, 6-10).',
    keywords: ['split pdf by range', 'split pdf pages range', 'divide pdf into parts'],
    titleAr: 'تقسيم ملف PDF حسب نطاق الصفحات محلياً',
    descAr: 'تقسيم مستندات PDF الكبيرة إلى أجزاء صغيرة وفق نطاقات محددة للصفحات مثل 1-5 و 6-10 بسهولة.',
  },
  {
    pathSlug: 'pdf-to-image/pdf-to-jpg',
    title: 'Convert PDF to JPG High Resolution Online Free',
    description: 'Convert every PDF page into high-quality JPG images. Download individual images or all pages in a ZIP archive.',
    keywords: ['pdf to jpg', 'convert pdf to jpg online', 'export pdf pages as jpg'],
    titleAr: 'تحويل PDF إلى صور JPG عالية الدقة أونلاين مجاناً',
    descAr: 'تحويل صفحات ملف PDF إلى صور JPG عالية الجودة مع إمكانية تنزيل كل صفحة منفردة أو ملف ZIP شامل.',
  },
  {
    pathSlug: 'pdf-to-image/pdf-to-png',
    title: 'Convert PDF to Transparent PNG Online Free',
    description: 'Convert PDF documents to crisp, lossless PNG images locally without uploading documents to external servers.',
    keywords: ['pdf to png', 'convert pdf to png online', 'extract png from pdf'],
    titleAr: 'تحويل صفحات PDF إلى صور PNG عالية الجودة محلياً',
    descAr: 'تحويل صفحات مستند PDF إلى صور بصيغة PNG النقية غير المضغوطة محلياً دون رفع الملفات لخوادم خارجية.',
  },
  {
    pathSlug: 'images-to-pdf/jpg-to-pdf',
    title: 'Convert JPG to PDF Online Free — Combine Photos to PDF',
    description: 'Convert JPG photos and graphics into a clean, compact PDF document. Reorder pages and adjust margins freely.',
    keywords: ['jpg to pdf', 'convert jpg to pdf online', 'combine photos to pdf'],
    titleAr: 'تحويل صور JPG إلى ملف PDF مجاناً أونلاين',
    descAr: 'تحويل الصور الفوتوغرافية JPG إلى مستند PDF احترافي مع إمكانية ترتيب الصفحات وضبط الهوامش بحرية.',
  },
  {
    pathSlug: 'images-to-pdf/png-to-pdf',
    title: 'Convert PNG to PDF Online Free — High Quality PDF Document',
    description: 'Convert lossless PNG graphics and illustrations into professional PDF documents instantly.',
    keywords: ['png to pdf', 'convert png to pdf free', 'make pdf from png images'],
    titleAr: 'تحويل صور PNG إلى مستند PDF عالي الجودة وبلا قيود',
    descAr: 'تحويل صور PNG عالية الدقة والرسومات إلى ملف PDF متكامل فورياً وبدون حدود للاستخدام.',
  },
  {
    pathSlug: 'vs/ilovepdf',
    competitor: 'iLovePDF',
    focusArea: 'PDF Merging, Splitting, Compression & Conversion',
    title: 'DevTol vs iLovePDF — 100% Client-Side Private PDF Alternative',
    description: 'Compare DevTol vs iLovePDF: Process confidential PDFs locally in your browser via WebAssembly with zero server uploads, no file queues, and no daily paywalls.',
    keywords: ['ilovepdf alternative', 'devtol vs ilovepdf', 'private pdf tools no upload', 'client side pdf compressor'],
    titleAr: 'مقارنة DevTol مع iLovePDF — البديل المجاني والآمن 100% بدون رفع ملفات',
    descAr: 'قارن بين DevTol و iLovePDF: دمج وتقسيم وضغط ملفات PDF السرية محلياً داخل متصفحك بدون رفعها لأي سيرفر خارجي وبلا حدود يومية.',
  },
  {
    pathSlug: 'vs/smallpdf',
    competitor: 'Smallpdf',
    focusArea: 'Unlimited Local PDF Processing & Document Security',
    title: 'DevTol vs Smallpdf — Free Unlimited Offline-Capable PDF Suite',
    description: 'Switch from Smallpdf to DevTol for unlimited, zero-upload local PDF compression, splitting, watermarking, and image conversion with zero subscription fees.',
    keywords: ['smallpdf alternative free', 'devtol vs smallpdf', 'unlimited pdf tools no sign up', 'offline pdf converter'],
    titleAr: 'مقارنة DevTol مع Smallpdf — بديل مجاني بلا حدود لمعالجة ملفات PDF محلياً',
    descAr: 'لماذا ينتقل المهندسون والشركات من Smallpdf إلى DevTol لمعالجة وضغط ملفات PDF محلياً في المتصفح مجاناً وبدون قيود يومية.',
  },
  {
    pathSlug: 'vs/cyberchef',
    competitor: 'CyberChef',
    focusArea: 'Web Cryptography, Hashing, Encoding & Security Analysis',
    title: 'DevTol vs CyberChef — Modern Fast Web Cryptography & Encoding Suite',
    description: 'Compare DevTol vs GCHQ CyberChef: Instant, dedicated modular routes for AES/RSA encryption, SHA/Bcrypt hashing, JWT inspection, and Base64 encoding.',
    keywords: ['cyberchef alternative', 'devtol vs cyberchef', 'fast online crypto tools', 'client side hashing tool'],
    titleAr: 'مقارنة DevTol مع CyberChef — أدوات تشفير وتحليل أمني فائقة السرعة',
    descAr: 'مقارنة شاملة بين DevTol و CyberChef في أدوات التشفير وفك الترميز وتحليل الـ JWT محلياً بواجهة عصرية سريعة.',
  },
  {
    pathSlug: 'vs/devutils',
    competitor: 'DevUtils',
    focusArea: 'Cross-Platform Developer Utilities & Offline PWA Execution',
    title: 'DevTol vs DevUtils — Free Cross-Platform Browser Alternative',
    description: 'Experience all the capabilities of macOS DevUtils free in any browser across Windows, Linux, macOS, and mobile with 100% client-side execution.',
    keywords: ['devutils alternative', 'free devutils for windows linux', 'devtol vs devutils', 'offline developer tools pwa'],
    titleAr: 'مقارنة DevTol مع DevUtils — البديل المجاني الشامل لجميع أنظمة التشغيل',
    descAr: 'احصل على جميع مميزات DevUtils مجاناً على ويندوز ولينكس وماك والموبايل عبر المتصفح مع دعم العمل بدون إنترنت.',
  },
  {
    pathSlug: 'vs/jwt-io',
    competitor: 'JWT.io',
    focusArea: 'JSON Web Token Debugging, Key Generation & Auth Security',
    title: 'DevTol vs JWT.io — Private Client-Side JWT Decoder & Key Suite',
    description: 'Decode and inspect JSON Web Tokens (JWT) alongside RSA/HMAC key generation, hash verification, and payload formatting in one zero-telemetry workspace.',
    keywords: ['jwt.io alternative', 'devtol vs jwt.io', 'offline jwt decoder', 'private jwt parser'],
    titleAr: 'مقارنة DevTol مع JWT.io — فحص وتحليل توكن JWT بخصوصية محلية تامة',
    descAr: 'فك تشفير وفحص JSON Web Tokens محلياً مع أكثر من 120 أداة للمطورين في مكان واحد بدون تتبع.',
  },
  {
    pathSlug: 'vs/jsonlint',
    competitor: 'JSONLint',
    focusArea: 'JSON Validation, Formatting, Diffing & Code Generation',
    title: 'DevTol vs JSONLint — Ad-Free JSON Formatter, Diff & TypeScript Generator',
    description: 'Validate, format, minify, compare, and convert JSON into TypeScript interfaces, SQL, YAML, or CSV locally in browser RAM without intrusive ad clutter.',
    keywords: ['jsonlint alternative', 'devtol vs jsonlint', 'private json formatter no upload', 'json to typescript converter'],
    titleAr: 'مقارنة DevTol مع JSONLint — تنسيق وفحص وتحويل JSON بدون إعلانات مزعجة',
    descAr: 'افحص ونسّق وحوّل ملفات JSON الضخمة محلياً إلى TypeScript أو YAML أو CSV بسرعة فائقة وخصوصية تامة.',
  },
  {
    pathSlug: 'vs/regex101',
    competitor: 'Regex101',
    focusArea: 'Regular Expression Testing, Capture Groups & Text Processing',
    title: 'DevTol vs Regex101 — Fast Client-Side Regex Tester & Developer Suite',
    description: 'Test regular expressions locally with real-time match highlighting, capture group inspection, and seamless integration with 120+ text and data utilities.',
    keywords: ['regex101 alternative', 'devtol vs regex101', 'offline regex tester', 'client side regex debugger'],
    titleAr: 'مقارنة DevTol مع Regex101 — اختبار التعبيرات النمطية Regex محلياً وبسرعة',
    descAr: 'اختبر التعبيرات النمطية Regex مع تظليل فوري للنتائج وأدوات معالجة النصوص المدمجة في منصة واحدة.',
  },
  {
    pathSlug: 'vs/base64decode',
    competitor: 'Base64Decode.org',
    focusArea: 'Zero-Upload Base64 String & Binary File Encoding',
    title: 'DevTol vs Base64Decode.org — Private Client-Side Base64 Encoder',
    description: 'Encode and decode Base64 strings, credentials, and binary images strictly inside browser memory without transmitting sensitive production secrets over the network.',
    keywords: ['base64decode alternative', 'devtol vs base64decode', 'private base64 decoder no server', 'client side base64 tool'],
    titleAr: 'مقارنة DevTol مع Base64Decode — تشفير وفك Base64 محلياً بدون سيرفر',
    descAr: 'قم بترميز وفك ترميز نصوص وملفات Base64 الحساسة داخل ذاكرة المتصفح مباشرة دون إرسال بياناتك لأي خادم خارجي.',
  },
];

function buildComparisonArticleHtml(sc, isAr = false) {
  if (!sc.competitor) return '';
  const comp = escapeHtml(sc.competitor);
  const focus = escapeHtml(sc.focusArea || 'Developer & Document Workflows');
  if (isAr) {
    return `
      <section class="seo-comparison-section">
        <h2>لماذا يُعد DevTol البديل الأقوى والأكثر أماناً لـ ${comp}؟</h2>
        <p>عند مقارنة <strong>DevTol</strong> مع <strong>${comp}</strong> في مجال ${focus}، يبرز الفرق الجوهري في المعمارية الأمنية: يعمل DevTol بنسبة 100% داخل متصفحك عبر تقنيات WebAssembly و Web Crypto API دون رفع أي ملف أو كود إلى خوادم خارجية، بينما تعتمد المنصات التقليدية غالباً على المعالجة السحابية أو تفرض قيوداً يومية واشتراكات مدفوعة.</p>
        <table class="seo-comparison-table" border="1" cellpadding="10" cellspacing="0" style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
          <thead>
            <tr>
              <th>المعيار التقني</th>
              <th>DevTol (devtol.online)</th>
              <th>${comp}</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>خصوصية البيانات ومعالجة الملفات</strong></td>
              <td>معالجة محلية 100% داخل ذاكرة المتصفح (Zero Server Upload)</td>
              <td>قد يتطلب رفع الملفات أو مشاركة البيانات عبر السحابة</td>
            </tr>
            <tr>
              <td><strong>التكلفة والحدود اليومية</strong></td>
              <td>مجاني بالكامل 100% وبلا حدود لعدد العمليات أو حجم الملفات</td>
              <td>نسخة مجانية محدودة أو تتطلب اشتراكاً شهرياً للمميزات المتقدمة</td>
            </tr>
            <tr>
              <td><strong>العمل بدون إنترنت (Offline PWA)</strong></td>
              <td>يدعم العمل الكامل بدون اتصال بالإنترنت بعد التحميل الأول</td>
              <td>يتطلب اتصالاً مستمراً بالخادم في معظم العمليات</td>
            </tr>
            <tr>
              <td><strong>عدد الأدوات المدمجة</strong></td>
              <td>أكثر من 124 أداة للمطورين وملفات PDF والتشفير في مكان واحد</td>
              <td>يركز على فئة محدودة من الأدوات</td>
            </tr>
          </tbody>
        </table>
      </section>
    `;
  }
  return `
    <section class="seo-comparison-section">
      <h2>Why Engineers Choose DevTol Over ${comp} for ${focus}</h2>
      <p><strong>DevTol</strong> is a free, open, 100% client-side alternative to <strong>${comp}</strong> designed for software engineers, DevOps teams, and privacy-conscious organizations. While traditional utilities often upload documents to remote cloud buckets, enforce strict daily task limits, or require paid subscriptions, DevTol executes every transformation locally inside your browser using native WebAssembly (WASM), HTML5 Canvas, and the Web Crypto API. Your source code, JWT tokens, production credentials, and confidential PDF contracts never leave your device.</p>
      <table class="seo-comparison-table" border="1" cellpadding="10" cellspacing="0" style="width:100%;border-collapse:collapse;margin:1.5rem 0;">
        <thead>
          <tr>
            <th>Capability &amp; Security Metric</th>
            <th>DevTol (devtol.online)</th>
            <th>${comp}</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td><strong>Data Privacy &amp; Execution Model</strong></td>
            <td>100% Client-Side in Browser RAM (Zero Server Uploads)</td>
            <td>Cloud upload or external third-party processing common</td>
          </tr>
          <tr>
            <td><strong>Pricing &amp; Daily Task Quotas</strong></td>
            <td>100% Free Forever — Unlimited tasks &amp; batch processing</td>
            <td>Freemium paywalls, task timers, or paid desktop licenses</td>
          </tr>
          <tr>
            <td><strong>Offline Air-Gapped Support (PWA)</strong></td>
            <td>Full Offline Progressive Web App support</td>
            <td>Typically requires active internet or OS-specific binary</td>
          </tr>
          <tr>
            <td><strong>Unified Toolchain Breadth</strong></td>
            <td>124+ Developer, Crypto, Network, Data &amp; PDF Tools</td>
            <td>Single-domain utility focus</td>
          </tr>
        </tbody>
      </table>
    </section>
  `;
}

for (const sc of programmaticScenarios) {
  for (const lang of allLangCodes) {
    const isEn = lang === 'en';
    const title = (lang === 'ar' && sc.titleAr) ? sc.titleAr : sc.title;
    const description = (lang === 'ar' && sc.descAr) ? sc.descAr : sc.description;
    const compArticle = buildComparisonArticleHtml(sc, lang === 'ar');
    const compFaqs = sc.competitor ? [
      {
        question: lang === 'ar'
          ? `هل يعتبر DevTol بديلاً مجانياً وآمناً لـ ${sc.competitor}؟`
          : `Is DevTol a completely free and private alternative to ${sc.competitor}?`,
        answer: lang === 'ar'
          ? `نعم، يعمل DevTol مجاناً بنسبة 100% داخل متصفحك عبر تقنية WebAssembly دون رفع أي ملفات أو بيانات إلى أي خادم خارجي.`
          : `Yes. DevTol is 100% free with no daily limits, sign-ups, or paywalls, and runs entirely inside your browser via WebAssembly so your data never leaves your device.`,
      },
      {
        question: lang === 'ar'
          ? `ما الفرق الأمني بين DevTol و ${sc.competitor}؟`
          : `How does DevTol protect sensitive files compared to ${sc.competitor}?`,
        answer: lang === 'ar'
          ? `لا يقوم DevTol بإرسال ملفات PDF أو أكواد البرمجة أو مفاتيح التشفير عبر الشبكة إطلاقاً، بل تتم المعالجة محلياً في الذاكرة العشوائية للمتصفح.`
          : `Unlike cloud-based tools that upload documents to remote servers for processing, DevTol processes all files and tokens locally in browser RAM with zero server telemetry.`,
      },
    ] : [];

    const pageHtml = generatePrerenderedHtml({
      pathSlug: sc.pathSlug,
      title,
      description,
      keywords: sc.keywords,
      articleHtml: compArticle,
      category: 'DeveloperTools',
      faqs: compFaqs,
      lang,
    });

    const targetDir = isEn
      ? path.join(distDir, sc.pathSlug)
      : path.join(distDir, lang, sc.pathSlug);

    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    fs.writeFileSync(path.join(targetDir, 'index.html'), pageHtml, 'utf8');

    const flatFile = isEn
      ? path.join(distDir, `${sc.pathSlug}.html`)
      : path.join(distDir, lang, `${sc.pathSlug}.html`);
    const flatDir = path.dirname(flatFile);
    if (!fs.existsSync(flatDir)) {
      fs.mkdirSync(flatDir, { recursive: true });
    }
    fs.writeFileSync(flatFile, pageHtml, 'utf8');
    generatedCount += 2;
  }
}

console.log(`[SEO Prerender] Successfully generated ${generatedCount} static HTML pages across ${supportedLangs.length + 1} languages in dist/!`);

// Ensure 404.html, _redirects, robots.txt, and sitemap.xml are mirrored from public to dist
const publicDir = path.join(rootDir, 'public');
for (const file of ['404.html', '_redirects', 'robots.txt', 'sitemap.xml']) {
  const src = path.join(publicDir, file);
  const dest = path.join(distDir, file);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`[SEO Prerender] Synced ${file} to dist/`);
  }
}

