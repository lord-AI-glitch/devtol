export interface RegexPreset {
  id: string;
  category: 'Web & Net' | 'Security & Auth' | 'Data & Form' | 'Arabic & Regional' | 'Code & Text';
  nameEn: string;
  nameAr: string;
  pattern: string;
  flags: string;
  descriptionEn: string;
  descriptionAr: string;
  testStrings: string[];
  keywords: string[];
}

export interface RegexTokenExplanation {
  token: string;
  type: 'anchor' | 'character-class' | 'quantifier' | 'group' | 'lookaround' | 'literal' | 'meta' | 'flag';
  title: string;
  explanationEn: string;
  explanationAr: string;
}

export interface RegexMatchResult {
  matched: boolean;
  matchCount: number;
  matches: Array<{
    fullMatch: string;
    index: number;
    groups: string[];
  }>;
  error?: string;
}

export const REGEX_PRESETS: RegexPreset[] = [
  {
    id: 'email-rfc',
    category: 'Web & Net',
    nameEn: 'RFC 5322 Standard Email',
    nameAr: 'البريد الإلكتروني المعتمد (RFC 5322)',
    pattern: '^[a-zA-Z0-9.!#$%&\'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$',
    flags: 'i',
    descriptionEn: 'Validates standard email addresses with RFC 5322 compliance.',
    descriptionAr: 'التحقق من صحة عناوين البريد الإلكتروني مع دعم النطاقات الفرعية.',
    testStrings: ['dev@devtol.online', 'user.name+tag@example.co.uk', 'invalid-email@', 'plainaddress'],
    keywords: ['email', 'mail', 'بريد', 'ايميل', 'عنوان بريدي'],
  },
  {
    id: 'strong-password',
    category: 'Security & Auth',
    nameEn: 'Enterprise Strong Password',
    nameAr: 'كلمة مرور قوية (أمان عالي)',
    pattern: '^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,64}$',
    flags: '',
    descriptionEn: 'Min 8 chars: at least 1 uppercase, 1 lowercase, 1 digit, 1 special character.',
    descriptionAr: 'ثمانية خانات كحد أدنى: حرف كبير، حرف صغير، رقم، ورمز خاص.',
    testStrings: ['P@ssw0rd2026!', 'Strong#Pass1', 'weak', 'NoSpecial123'],
    keywords: ['password', 'auth', 'كلمة سر', 'باسورد', 'أمان'],
  },
  {
    id: 'egyptian-phone',
    category: 'Arabic & Regional',
    nameEn: 'Egyptian Mobile Phone Number',
    nameAr: 'رقم الهاتف المحمول المصري (+20)',
    pattern: '^(?:\\+20|0)?1[0125]\\d{8}$',
    flags: '',
    descriptionEn: 'Matches Egyptian mobile numbers (Vodafone, Orange, Etisalat, WE) with or without +20.',
    descriptionAr: 'يطابق أرقام شبكات المحمول المصرية (فودافون، أورنج، اتصالات، وي) مع أو بدون كود مصر.',
    testStrings: ['+201096656588', '01096656588', '01123456789', '01298765432', '01511122233', '0139999999'],
    keywords: ['egypt', 'phone', 'mobile', 'مصر', 'هاتف', 'موبايل', '010', '011', '012', '015', '+20'],
  },
  {
    id: 'egyptian-national-id',
    category: 'Arabic & Regional',
    nameEn: 'Egyptian National ID (14 digits)',
    nameAr: 'الرقم القومي المصري (14 رقم)',
    pattern: '^(2|3)\\d{2}(0[1-9]|1[0-2])(0[1-9]|[12]\\d|3[01])(0[1-4]|[123]\\d|88)\\d{3}\\d{1}$',
    flags: '',
    descriptionEn: 'Validates 14-digit Egyptian National ID matching century, birthdate, and governorate codes.',
    descriptionAr: 'التحقق من صحة الرقم القومي المصري المكون من 14 رقماً وفق معايير القرن وتاريخ الميلاد والمحافظة.',
    testStrings: ['29501010101234', '30205151234567', '12345678901234'],
    keywords: ['national id', 'egypt id', 'رقم قومي', 'بطاقة شخصية', 'مصر'],
  },
  {
    id: 'arabic-text-only',
    category: 'Arabic & Regional',
    nameEn: 'Arabic Script & Letters Only',
    nameAr: 'نصوص وحروف عربية فقط',
    pattern: '^[\\u0600-\\u06FF\\u0750-\\u077F\\u08A0-\\u08FF\\s]+$',
    flags: 'u',
    descriptionEn: 'Matches strings containing strictly Arabic Unicode characters and spaces.',
    descriptionAr: 'يطابق السلاسل النصية التي تحتوي على أحرف وكلمات عربية فقط ومسافات.',
    testStrings: ['مرحبا بكم في منصة ديف تول', 'أحمد محمود', 'Hello World', 'نص مختلط 123'],
    keywords: ['arabic', 'عربي', 'لغة عربية', 'حروف عربية'],
  },
  {
    id: 'ipv4-address',
    category: 'Web & Net',
    nameEn: 'IPv4 Address Validation',
    nameAr: 'التحقق من عنوان IPv4',
    pattern: '^(?:(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)\\.){3}(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)$',
    flags: '',
    descriptionEn: 'Matches valid IPv4 addresses from 0.0.0.0 to 255.255.255.255.',
    descriptionAr: 'يطابق عناوين بروتوكول الإنترنت IPv4 الصحيحة.',
    testStrings: ['192.168.1.1', '10.0.0.1', '255.255.255.255', '999.999.999.999', '192.168.1'],
    keywords: ['ip', 'ipv4', 'address', 'شبكة', 'ايبي', 'عنوان انترنت'],
  },
  {
    id: 'url-https',
    category: 'Web & Net',
    nameEn: 'Secure URL (HTTP / HTTPS)',
    nameAr: 'رابط ويب آمن (URL)',
    pattern: '^https?:\\/\\/(?:www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b(?:[-a-zA-Z0-9()@:%_\\+.~#?&\\/=]*)$',
    flags: 'i',
    descriptionEn: 'Validates web URLs with http or https protocol, domain, and optional path query.',
    descriptionAr: 'التحقق من صحة عناوين الروابط الإلكترونية بمختلف مساراتها.',
    testStrings: ['https://devtol.online/deals', 'http://example.com/path?foo=bar#hash', 'ftp://invalid.com'],
    keywords: ['url', 'link', 'http', 'https', 'رابط', 'موقع'],
  },
  {
    id: 'uuid-v4',
    category: 'Code & Text',
    nameEn: 'UUID Version 4 Identifier',
    nameAr: 'معرف UUID v4 الفريد',
    pattern: '^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$',
    flags: 'i',
    descriptionEn: 'Standard RFC 4122 compliant UUID v4 string with 8-4-4-4-12 hexadecimal structure.',
    descriptionAr: 'معرف فريد قياسي UUID الإصدار الرابع بنظام 8-4-4-4-12.',
    testStrings: ['f47ac10b-58cc-4372-a567-0e02b2c3d479', '123e4567-e89b-12d3-a456-426614174000'],
    keywords: ['uuid', 'guid', 'v4', 'معرف', 'رمز فريد'],
  },
  {
    id: 'slug-string',
    category: 'Code & Text',
    nameEn: 'URL Slug / Clean Path',
    nameAr: 'الرابط المختصر النظيف (URL Slug)',
    pattern: '^[a-z0-9]+(?:-[a-z0-9]+)*$',
    flags: '',
    descriptionEn: 'Kebab-case alphanumeric URL slug with hyphen separators without leading/trailing dashes.',
    descriptionAr: 'سلسلة نصية مختصرة للروابط بأحرف وأرقام صغيرة مفصولة بشرطات.',
    testStrings: ['ai-token-cost-calculator', 'curl-to-code-converter', 'invalid_slug', '-leading-dash'],
    keywords: ['slug', 'kebab', 'url', 'سلاج', 'اسم مختصر'],
  },
  {
    id: 'hex-color',
    category: 'Code & Text',
    nameEn: 'Hexadecimal Color Code (#HEX)',
    nameAr: 'كود اللون السداسي عشري (#HEX)',
    pattern: '^#(?:[0-9a-fA-F]{3,4}|[0-9a-fA-F]{6}|[0-9a-fA-F]{8})$',
    flags: '',
    descriptionEn: 'Matches 3, 4, 6, or 8 digit hex color codes with optional alpha transparency channel.',
    descriptionAr: 'يطابق أكواد الألوان السداسية العشرية (#RGB, #RGBA, #RRGGBB, #RRGGBBAA).',
    testStrings: ['#25d366', '#fff', '#128c7eff', '#GGGGGG', '123456'],
    keywords: ['hex', 'color', 'لون', 'سداسي عشري', '#'],
  },
  {
    id: 'iso-date-yyyy-mm-dd',
    category: 'Data & Form',
    nameEn: 'ISO Date Format (YYYY-MM-DD)',
    nameAr: 'صيغة التاريخ القياسي (YYYY-MM-DD)',
    pattern: '^\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\\d|3[01])$',
    flags: '',
    descriptionEn: 'Matches ISO-8601 calendar date format with two-digit month and day zero-padding.',
    descriptionAr: 'يطابق تاريخ التقويم القياسي الدولي بصيغة السنة-الشهر-اليوم.',
    testStrings: ['2026-09-20', '1995-12-31', '2026-1-1', '2026-13-40'],
    keywords: ['date', 'iso', 'year', 'تاريخ', 'سنة', 'يوم', 'شهر'],
  },
  {
    id: 'credit-card-luhn',
    category: 'Data & Form',
    nameEn: 'Credit Card Number (Visa / MC / Amex)',
    nameAr: 'أرقام البطاقات الائتمانية (فيزا / ماستركارد)',
    pattern: '^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\\d{3})\\d{11})$',
    flags: '',
    descriptionEn: 'Matches major credit card formats (Visa, MasterCard, Amex, Discover, Diners, JCB).',
    descriptionAr: 'التحقق من تنسيق أرقام البطاقات الائتمانية العالمية الرئيسية.',
    testStrings: ['4111111111111111', '5500000000000004', '378282246310005', '1234'],
    keywords: ['card', 'visa', 'mastercard', 'بطاقة', 'فيزا', 'دفع'],
  },
  {
    id: 'html-tags',
    category: 'Code & Text',
    nameEn: 'HTML Opening & Closing Tags',
    nameAr: 'وسوم لغة HTML',
    pattern: '<\\/?([a-zA-Z0-9]+)(?:\\s+[^>]*?)?\\/?>',
    flags: 'g',
    descriptionEn: 'Extracts or removes standard HTML tags including self-closing and attributes.',
    descriptionAr: 'استخراج أو إزالة وسوم HTML من النصوص بما في ذلك الخصائص.',
    testStrings: ['<div class="header">Title</div>', '<img src="test.jpg" />', '<p>Paragraph</p>'],
    keywords: ['html', 'tag', 'وسم', 'كود'],
  },
];

/**
 * Natural language intent matching engine
 */
export function matchNaturalLanguageIntent(query: string): RegexPreset[] {
  if (!query || !query.trim()) {
    return REGEX_PRESETS;
  }

  const normalized = query.toLowerCase().trim();
  const words = normalized.split(/\s+/).filter(Boolean);

  const scored = REGEX_PRESETS.map(preset => {
    let score = 0;

    // Exact matches
    if (preset.nameEn.toLowerCase().includes(normalized)) score += 15;
    if (preset.nameAr.includes(normalized)) score += 15;
    if (preset.descriptionEn.toLowerCase().includes(normalized)) score += 8;
    if (preset.descriptionAr.includes(normalized)) score += 8;

    // Keyword matches
    for (const kw of preset.keywords) {
      if (normalized.includes(kw.toLowerCase())) {
        score += 10;
      }
      for (const w of words) {
        if (kw.toLowerCase().includes(w) || w.includes(kw.toLowerCase())) {
          score += 5;
        }
      }
    }

    return { preset, score };
  });

  return scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .map(item => item.preset);
}

/**
 * Structural Regex Explainer / Tokenizer
 */
export function explainRegexPattern(pattern: string, flags = ''): RegexTokenExplanation[] {
  const explanations: RegexTokenExplanation[] = [];
  if (!pattern) return explanations;

  let i = 0;
  const len = pattern.length;

  while (i < len) {
    const ch = pattern[i];

    // Anchors
    if (ch === '^') {
      explanations.push({
        token: '^',
        type: 'anchor',
        title: 'Start of String / Line',
        explanationEn: 'Asserts the start of the string or beginning of line (in multiline mode).',
        explanationAr: 'يحدد بداية النص أو بداية السطر الحالي.',
      });
      i++;
      continue;
    }

    if (ch === '$') {
      explanations.push({
        token: '$',
        type: 'anchor',
        title: 'End of String / Line',
        explanationEn: 'Asserts the end of the string or end of line (in multiline mode).',
        explanationAr: 'يحدد نهاية النص أو نهاية السطر الحالي.',
      });
      i++;
      continue;
    }

    // Groups & Lookarounds
    if (ch === '(') {
      if (pattern.startsWith('(?=', i)) {
        const close = findMatchingParen(pattern, i);
        const sub = pattern.slice(i, close + 1);
        explanations.push({
          token: sub,
          type: 'lookaround',
          title: 'Positive Lookahead (?=...)',
          explanationEn: `Matches a group after the main expression without including it in the result. Condition: ${sub.slice(3, -1)}`,
          explanationAr: `استشراف إيجابي: يتحقق من وجود النمط التالي دون تضمينه في نتيجة المطابقة. الشرط: ${sub.slice(3, -1)}`,
        });
        i = close + 1;
        continue;
      }

      if (pattern.startsWith('(?!', i)) {
        const close = findMatchingParen(pattern, i);
        const sub = pattern.slice(i, close + 1);
        explanations.push({
          token: sub,
          type: 'lookaround',
          title: 'Negative Lookahead (?!...)',
          explanationEn: `Ensures the expression is NOT followed by this subpattern: ${sub.slice(3, -1)}`,
          explanationAr: `استشراف سلبي: يتأكد من عدم مجيء النمط التالي بعد الموضع الحالي: ${sub.slice(3, -1)}`,
        });
        i = close + 1;
        continue;
      }

      if (pattern.startsWith('(?:', i)) {
        const close = findMatchingParen(pattern, i);
        const sub = pattern.slice(i, close + 1);
        explanations.push({
          token: sub,
          type: 'group',
          title: 'Non-Capturing Group (?:...)',
          explanationEn: `Groups multiple tokens together for quantification without storing the match in a capture group.`,
          explanationAr: `مجموعة غير ملتقطة: تجمع عدة رموز لتطبيق التكرار عليها دون تخزينها كمجموعة مستقلة.`,
        });
        i = close + 1;
        continue;
      }

      const close = findMatchingParen(pattern, i);
      const sub = pattern.slice(i, close + 1);
      explanations.push({
        token: sub,
        type: 'group',
        title: 'Capturing Group (...)',
        explanationEn: `Groups items together and creates a backreference capture group for extraction.`,
        explanationAr: `مجموعة التقاط: تجمع العناصر معاً وتخزنها لاستخراجها واستدعائها لاحقاً.`,
      });
      i = close + 1;
      continue;
    }

    // Character classes [...]
    if (ch === '[') {
      let close = pattern.indexOf(']', i + 1);
      while (close !== -1 && pattern[close - 1] === '\\') {
        close = pattern.indexOf(']', close + 1);
      }
      if (close !== -1) {
        const sub = pattern.slice(i, close + 1);
        const isNegated = sub.startsWith('[^');
        explanations.push({
          token: sub,
          type: 'character-class',
          title: isNegated ? 'Negated Character Set [^...]' : 'Character Set [...]',
          explanationEn: isNegated
            ? `Matches any character NOT present in the specified set: ${sub}`
            : `Matches any single character present in the set: ${sub}`,
          explanationAr: isNegated
            ? `يطابق أي رمز غير موجود في المجموعة المحددة.`
            : `يطابق أي رمز مفرد موجود ضمن هذه المجموعة.`,
        });
        i = close + 1;
        continue;
      }
    }

    // Quantifiers
    if (['+', '*', '?'].includes(ch)) {
      const qMap: Record<string, { en: string; ar: string }> = {
        '+': { en: '1 or more times (greedy)', ar: 'مرة واحدة أو أكثر' },
        '*': { en: '0 or more times (greedy)', ar: 'صفر أو أكثر (اختياري مع التكرار)' },
        '?': { en: '0 or 1 time (optional)', ar: 'صفر أو مرة واحدة (عنصر اختياري)' },
      };
      explanations.push({
        token: ch,
        type: 'quantifier',
        title: `Quantifier '${ch}'`,
        explanationEn: `Matches the preceding token ${qMap[ch].en}.`,
        explanationAr: `يحدد تكرار الرمز السابق: ${qMap[ch].ar}.`,
      });
      i++;
      continue;
    }

    // Range quantifier {min,max}
    if (ch === '{') {
      const close = pattern.indexOf('}', i + 1);
      if (close !== -1) {
        const sub = pattern.slice(i, close + 1);
        explanations.push({
          token: sub,
          type: 'quantifier',
          title: `Range Quantifier ${sub}`,
          explanationEn: `Matches the preceding token within range ${sub}.`,
          explanationAr: `يحدد عدد مرات تكرار الرمز السابق ضمن النطاق ${sub}.`,
        });
        i = close + 1;
        continue;
      }
    }

    // Escaped sequences \d, \w, \s, etc.
    if (ch === '\\' && i + 1 < len) {
      const nextChar = pattern[i + 1];
      const esc = `\\${nextChar}`;
      const escMap: Record<string, { title: string; en: string; ar: string }> = {
        '\\d': { title: 'Digit (\\d)', en: 'Matches any digit (0-9)', ar: 'يطابق أي رقم من 0 إلى 9' },
        '\\D': { title: 'Non-Digit (\\D)', en: 'Matches any character that is not a digit', ar: 'يطابق أي رمز ليس رقماً' },
        '\\w': { title: 'Word Character (\\w)', en: 'Matches any alphanumeric word character (a-z, A-Z, 0-9, _)', ar: 'يطابق أي حرف أو رقم أو شرطة سفلية' },
        '\\W': { title: 'Non-Word Character (\\W)', en: 'Matches any non-word character', ar: 'يطابق أي رمز ليس حرفاً أو رقماً' },
        '\\s': { title: 'Whitespace (\\s)', en: 'Matches whitespace characters (spaces, tabs, newlines)', ar: 'يطابق المسافات والفراغات وعلامات السطر الجديد' },
        '\\S': { title: 'Non-Whitespace (\\S)', en: 'Matches any non-whitespace character', ar: 'يطابق أي رمز غير المسافات' },
        '\\b': { title: 'Word Boundary (\\b)', en: 'Matches a word boundary position', ar: 'يطابق حدود الكلمة' },
      };

      if (escMap[esc]) {
        explanations.push({
          token: esc,
          type: 'meta',
          title: escMap[esc].title,
          explanationEn: escMap[esc].en,
          explanationAr: escMap[esc].ar,
        });
        i += 2;
        continue;
      }

      // Unicode range \uXXXX
      if (nextChar === 'u' && i + 5 < len) {
        const uSeq = pattern.slice(i, i + 6);
        explanations.push({
          token: uSeq,
          type: 'meta',
          title: `Unicode Codepoint ${uSeq}`,
          explanationEn: `Matches specific Unicode character point ${uSeq}.`,
          explanationAr: `يطابق نقطة الرمز في جدول الترميز الموحد Unicode.`,
        });
        i += 6;
        continue;
      }

      // Escaped literal
      explanations.push({
        token: esc,
        type: 'literal',
        title: `Escaped Literal '${nextChar}'`,
        explanationEn: `Escapes special regex character to treat '${nextChar}' as a literal character.`,
        explanationAr: `إلغاء المعنى الخاص للرمز ومطابقته كحرف مجرد '${nextChar}'.`,
      });
      i += 2;
      continue;
    }

    // Dot wildcard
    if (ch === '.') {
      explanations.push({
        token: '.',
        type: 'meta',
        title: 'Any Character (Wildcard .)',
        explanationEn: 'Matches any single character except line breaks (or including line breaks if dotAll flag "s" is active).',
        explanationAr: 'يطابق أي رمز مفرد باستثناء فواصل الأسطر.',
      });
      i++;
      continue;
    }

    // Pipe alternation
    if (ch === '|') {
      explanations.push({
        token: '|',
        type: 'meta',
        title: 'Alternation / OR (|)',
        explanationEn: 'Acts like a boolean OR, matching expression before or after the bar.',
        explanationAr: 'أداة الاختيار (أو - OR)، تطابق التعبير قبل أو بعد الرمز.',
      });
      i++;
      continue;
    }

    // Literal chars
    let literalEnd = i + 1;
    while (literalEnd < len && !'^$()*+?{}[\\]|.'.includes(pattern[literalEnd])) {
      literalEnd++;
    }
    const lit = pattern.slice(i, literalEnd);
    explanations.push({
      token: lit,
      type: 'literal',
      title: `Literal "${lit}"`,
      explanationEn: `Matches the exact string "${lit}" literally.`,
      explanationAr: `يطابق النص الصريح "${lit}" كما هو تماماً.`,
    });
    i = literalEnd;
  }

  // Flags explanation
  if (flags) {
    const flagList = flags.split('');
    const flagMap: Record<string, { title: string; en: string; ar: string }> = {
      g: { title: 'Global (g)', en: 'Find all matches rather than stopping after the first match.', ar: 'البحث الشامل عن جميع التطابقات دون التوقف عند أول نتيجة.' },
      i: { title: 'Case-Insensitive (i)', en: 'Case insensitive match (treats upper and lower case equally).', ar: 'تجاهل حالة الأحرف (مطابقة متساوية بين الحروف الكبيرة والصغيرة).' },
      m: { title: 'Multiline (m)', en: '^ and $ match the beginning/end of each line.', ar: 'الأسطر المتعددة: تجعل ^ و $ تطابق بداية ونهاية كل سطر.' },
      s: { title: 'DotAll (s)', en: 'Allows dot (.) to match newline characters.', ar: 'السماح للرمز (.) بمطابقة علامات السطور الجديدة.' },
      u: { title: 'Unicode (u)', en: 'Treats pattern as a sequence of Unicode code points.', ar: 'معالجة النمط وفق نظام اليونيكود الشامل.' },
    };

    for (const f of flagList) {
      if (flagMap[f]) {
        explanations.push({
          token: `/${f}`,
          type: 'flag',
          title: flagMap[f].title,
          explanationEn: flagMap[f].en,
          explanationAr: flagMap[f].ar,
        });
      }
    }
  }

  return explanations;
}

function findMatchingParen(str: string, start: number): number {
  let depth = 0;
  for (let i = start; i < str.length; i++) {
    if (str[i] === '\\') {
      i++;
      continue;
    }
    if (str[i] === '(') depth++;
    if (str[i] === ')') {
      depth--;
      if (depth === 0) return i;
    }
  }
  return str.length - 1;
}

/**
 * Executes a test against user input and returns detailed match positions and capture groups
 */
export function testRegex(pattern: string, flags: string, testText: string): RegexMatchResult {
  if (!pattern || !testText) {
    return { matched: false, matchCount: 0, matches: [] };
  }

  try {
    const regex = new RegExp(pattern, flags.includes('g') ? flags : `${flags}g`);
    const matches: Array<{ fullMatch: string; index: number; groups: string[] }> = [];

    let match: RegExpExecArray | null;
    let safeLoopCounter = 0;

    while ((match = regex.exec(testText)) !== null && safeLoopCounter < 1000) {
      safeLoopCounter++;
      matches.push({
        fullMatch: match[0],
        index: match.index,
        groups: match.slice(1),
      });

      // Avoid infinite loops with zero-length matches
      if (match.index === regex.lastIndex) {
        regex.lastIndex++;
      }
    }

    return {
      matched: matches.length > 0,
      matchCount: matches.length,
      matches,
    };
  } catch (err: any) {
    return {
      matched: false,
      matchCount: 0,
      matches: [],
      error: err?.message || 'Invalid regular expression',
    };
  }
}

/**
 * Generates copyable production code snippets in 6 major programming languages
 */
export function generateCodeSnippets(pattern: string, flags: string): Record<string, string> {
  const cleanPattern = pattern.replace(/\\/g, '\\\\');

  return {
    javascript: `// JavaScript / TypeScript
const regex = /${pattern}/${flags};
const text = "sample test string";

// Test matching (boolean)
const isValid = regex.test(text);

// Extract all matches
const matches = [...text.matchAll(regex)];
matches.forEach(match => {
  console.log('Found:', match[0], 'at index:', match.index);
});`,

    python: `# Python 3
import re

pattern = r"${pattern}"
flags = ${flags.includes('i') ? 're.IGNORECASE' : '0'}${flags.includes('m') ? ' | re.MULTILINE' : ''}${flags.includes('s') ? ' | re.DOTALL' : ''}
text = "sample test string"

# Check match
if re.search(pattern, text, flags):
    print("Match found!")

# Find all occurrences
matches = re.findall(pattern, text, flags)
print(f"Total matches: {len(matches)}")`,

    golang: `// Go (Golang)
package main

import (
	"fmt"
	"regexp"
)

func main() {
	pattern := \`${pattern}\`
	re := regexp.MustCompile(pattern)
	text := "sample test string"

	// Check if matches
	matched := re.MatchString(text)
	fmt.Printf("Matched: %v\\n", matched)

	// Find all string matches
	results := re.FindAllString(text, -1)
	fmt.Printf("Matches found: %v\\n", results)
}`,

    php: `<?php
// PHP
$pattern = '/${pattern}/${flags}';
$text = "sample test string";

// Match check
if (preg_match($pattern, $text)) {
    echo "Match found!\n";
}

// Extract all matches
preg_match_all($pattern, $text, $matches);
print_r($matches[0]);
?>`,

    java: `// Java
import java.util.regex.Pattern;
import java.util.regex.Matcher;

public class RegexExample {
    public static void main(String[] args) {
        String patternStr = "${cleanPattern}";
        Pattern pattern = Pattern.compile(patternStr);
        String text = "sample test string";

        Matcher matcher = pattern.matcher(text);
        while (matcher.find()) {
            System.out.println("Found match: " + matcher.group() + " at " + matcher.start());
        }
    }
}`,

    csharp: `// C# (.NET)
using System;
using System.Text.RegularExpressions;

class Program {
    static void Main() {
        string pattern = @"${pattern}";
        string text = "sample test string";

        bool isMatch = Regex.IsMatch(text, pattern);
        Console.WriteLine($"Is Match: {isMatch}");

        MatchCollection matches = Regex.Matches(text, pattern);
        foreach (Match match in matches) {
            Console.WriteLine($"Match: {match.Value} at index {match.Index}");
        }
    }
}`,
  };
}
