import os
import yaml

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
LOCALES_DIR = os.path.join(ROOT, 'locales')

with open(os.path.join(LOCALES_DIR, 'en.yml'), 'r', encoding='utf-8') as f:
    en_data = yaml.safe_load(f)

en_tools = en_data.get('tools', {})

# Translation patterns and mappings for the 124 tools
# Title and Description builders for each target language
LANGS = ['de', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh']

# Dictionary of specialized translations for newer / core tools
CUSTOM_TRANSLATIONS = {
    'ai-token-cost-calculator': {
        'de': ('KI-Token- & LLM-Kostenrechner', 'Berechnen Sie Token für Prompts und vergleichen Sie Live-Preise für OpenAI, Anthropic, Gemini und DeepSeek.'),
        'es': ('Calculadora de costo de tokens de IA y LLM', 'Estime tokens y compare precios en tiempo real para OpenAI, Anthropic, Gemini y DeepSeek.'),
        'fr': ('Calculateur de coût des tokens IA et LLM', 'Estimez les tokens et comparez les tarifs en direct pour OpenAI, Anthropic, Gemini et DeepSeek.'),
        'no': ('AI-token- og LLM-kostnadskalkulator', 'Beregn tokens og sammenlign priser for OpenAI, Anthropic, Gemini og DeepSeek.'),
        'pt': ('Calculadora de custo de tokens de IA e LLM', 'Calcule tokens de prompt e compare preços em tempo real para OpenAI, Anthropic, Gemini e DeepSeek.'),
        'uk': ('Калькулятор вартості токенів ШІ та LLM', 'Оцінюйте токени та порівнюйте ціни в реальному часі для OpenAI, Anthropic, Gemini та DeepSeek.'),
        'vi': ('Máy tính chi phí mã thông báo AI & LLM', 'Ước tính token và so sánh giá theo thời gian thực cho OpenAI, Anthropic, Gemini và DeepSeek.'),
        'zh': ('AI Token 与大模型成本计算器', '估算 Prompt Token 数量并实时比对 OpenAI、Anthropic、Gemini 和 DeepSeek 的使用成本。'),
    },
    'curl-to-code-converter': {
        'de': ('cURL-zu-Code-Konverter', 'Konvertieren Sie cURL-Befehle in sauberen Code für Python, JavaScript, Go, PHP, Rust und Java.'),
        'es': ('Conversor de cURL a código', 'Convierta comandos cURL en código limpio para Python, JavaScript, TypeScript, Go, PHP y Rust.'),
        'fr': ('Convertisseur cURL en code', 'Convertissez des commandes cURL en code propre pour Python, JavaScript, TypeScript, Go et PHP.'),
        'no': ('cURL-til-kode-konverterer', 'Konverter cURL-kommandoer til ren kode i Python, JavaScript, TypeScript, Go og PHP.'),
        'pt': ('Conversor de cURL para código', 'Converta comandos cURL em código limpo para Python, JavaScript, TypeScript, Go e PHP.'),
        'uk': ('Конвертер cURL у код', 'Перетворюйте команди cURL на чистий код для Python, JavaScript, Go, PHP та Rust.'),
        'vi': ('Trình chuyển đổi cURL sang mã', 'Chuyển đổi lệnh cURL thành mã nguồn sạch cho Python, JavaScript, Go và PHP.'),
        'zh': ('cURL 转代码生成器', '将 cURL 命令一键转换为 Python、JavaScript、TypeScript、Go、Rust 和 PHP 生产代码。'),
    },
    'ai-regex-generator-explainer': {
        'de': ('KI-Regex-Generator & Struktur-Erklärer', 'Erstellen Sie reguläre Ausdrücke mit natürlicher Sprache und testen Sie Muster interaktiv.'),
        'es': ('Generador y explicador de Regex con IA', 'Genere expresiones regulares con lenguaje natural y analice su estructura en tiempo real.'),
        'fr': ('Générateur et explicatif de Regex par IA', 'Générez des expressions régulières avec du langage naturel et testez les correspondances.'),
        'no': ('AI Regex-generator og strukturforklarer', 'Generer regulære uttrykk fra naturlig språk og analyser mønsterstrukturer.'),
        'pt': ('Gerador e explicador de Regex com IA', 'Gere expressões regulares a partir de linguagem natural e teste padrões ao vivo.'),
        'uk': ('Генератор і пояснювач Regex на основі ШІ', 'Створюйте регулярні вирази за допомогою природної мови та аналізуйте їх структуру.'),
        'vi': ('Trình tạo và giải thích Regex bằng AI', 'Tạo biểu thức chính quy bằng ngôn ngữ tự nhiên và phân tích cấu trúc trực tiếp.'),
        'zh': ('AI 正则表达式生成与解析器', '使用自然语言提示词快速生成正则表达式，结构化拆解规则并实时测试匹配。'),
    },
    'pdf-compress': {
        'de': ('PDF komprimieren', 'Verringern Sie die PDF-Dateigröße lokal in Ihrem Browser bei bester Qualität.'),
        'es': ('Comprimir PDF', 'Reduzca el tamaño de sus archivos PDF localmente en su navegador manteniendo la máxima calidad.'),
        'fr': ('Compresser un PDF', 'Réduisez la taille de vos fichiers PDF localement dans votre navigateur sans perte de qualité.'),
        'no': ('Komprimer PDF', 'Reduser størrelsen på PDF-filer lokalt i nettleseren med bevart kvalitet.'),
        'pt': ('Comprimir PDF', 'Reduza o tamanho de arquivos PDF diretamente no navegador mantendo alta qualidade.'),
        'uk': ('Стиснути PDF', 'Зменшуйте розмір файлів PDF локально у браузері зі збереженням високої якості.'),
        'vi': ('Nén PDF', 'Giảm dung lượng tệp PDF trực tiếp trong trình duyệt với chất lượng tối ưu.'),
        'zh': ('压缩 PDF 文件', '在本地浏览器中高效压缩 PDF 文档体积，保持清晰画质且文件绝不上云。'),
    },
    'pdf-merge': {
        'de': ('PDF zusammenführen', 'Kombinieren Sie mehrere PDF-Dateien in ein einziges Dokument – schnell und sicher.'),
        'es': ('Unir PDF', 'Combine múltiples documentos PDF en un solo archivo de forma rápida y segura.'),
        'fr': ('Fusionner des PDF', 'Combinez plusieurs fichiers PDF en un seul document rapidement et en toute sécurité.'),
        'no': ('Slå sammen PDF', 'Kombiner flere PDF-filer til ett enkelt dokument raskt og sikkert.'),
        'pt': ('Juntar PDF', 'Combine vários arquivos PDF em um único documento de forma rápida e segura.'),
        'uk': ('Об’єднати PDF', 'Об’єднуйте кілька файлів PDF в один документ швидко та безпечно.'),
        'vi': ('Ghép nối PDF', 'Kết hợp nhiều tệp PDF thành một tài liệu duy nhất nhanh chóng và bảo mật.'),
        'zh': ('合并 PDF 文件', '将多个 PDF 文件快速合并为一个完整文档，支持自由调整页面次序。'),
    },
    'pdf-split': {
        'de': ('PDF teilen', 'Trennen Sie Seiten oder Bereiche aus Ihrem PDF-Dokument lokal ab.'),
        'es': ('Dividir PDF', 'Extraiga páginas o rangos de páginas de su documento PDF de forma independiente.'),
        'fr': ('Diviser un PDF', 'Extrayez des pages spécifiques ou des plages de pages de votre document PDF.'),
        'no': ('Del opp PDF', 'Pakk ut sider eller sideområder fra PDF-dokumentet ditt lokalt.'),
        'pt': ('Dividir PDF', 'Extraia páginas ou intervalos de páginas do seu documento PDF com facilidade.'),
        'uk': ('Розділити PDF', 'Видобувайте сторінки або діапазони сторінок із вашого PDF-документа.'),
        'vi': ('Tách PDF', 'Trích xuất các trang hoặc khoảng trang từ tài liệu PDF một cách dễ dàng.'),
        'zh': ('拆分 PDF 文件', '按单页或自定义页码范围提取 PDF 页面，精准分割生成新文档。'),
    },
    'pdf-editor': {
        'de': ('PDF-Editor', 'Bearbeiten Sie Text, fügen Sie Anmerkungen und Formen hinzu – 100% Client-seitig.'),
        'es': ('Editor de PDF', 'Edite texto, agregue anotaciones y dibuje en documentos PDF directamente en su navegador.'),
        'fr': ('Éditeur de PDF', 'Modifiez le texte, ajoutez des annotations et formes sur vos PDF dans le navigateur.'),
        'no': ('PDF-redigerer', 'Rediger tekst, legg til merknader og tegn på PDF-dokumenter i nettleseren.'),
        'pt': ('Editor de PDF', 'Edite texto, adicione anotações e formas em seus arquivos PDF no navegador.'),
        'uk': ('Редактор PDF', 'Редагуйте текст, додавайте анотації та форми у файли PDF прямо в браузері.'),
        'vi': ('Trình chỉnh sửa PDF', 'Chỉnh sửa văn bản, thêm ghi chú và hình vẽ vào tệp PDF ngay trong trình duyệt.'),
        'zh': ('在线 PDF 编辑器', '在浏览器内直接编辑 PDF 文本、添加高亮批注与形状，完全保护私密性。'),
    },
    'images-to-pdf': {
        'de': ('Bilder zu PDF', 'Konvertieren Sie JPG, PNG und WebP-Bilder in ein professionelles PDF-Dokument.'),
        'es': ('Imágenes a PDF', 'Convierta imágenes JPG, PNG y WebP en un documento PDF limpio y ordenado.'),
        'fr': ('Images en PDF', 'Convertissez vos photos et images JPG, PNG en un document PDF professionnel.'),
        'no': ('Bilder til PDF', 'Konverter JPG-, PNG- og WebP-bilder til et ryddig PDF-dokument.'),
        'pt': ('Imagens para PDF', 'Converta fotos JPG, PNG e WebP em um documento PDF profissional.'),
        'uk': ('Зображення в PDF', 'Перетворюйте зображення JPG, PNG та WebP на якісний документ PDF.'),
        'vi': ('Hình ảnh sang PDF', 'Chuyển đổi hình ảnh JPG, PNG và WebP thành tài liệu PDF chuyên nghiệp.'),
        'zh': ('图片转 PDF', '将 JPG、PNG、WebP 等图片批量转换为整洁的 PDF 文档。'),
    },
    'pdf-to-image': {
        'de': ('PDF zu Bild', 'Konvertieren Sie PDF-Seiten in hochauflösende JPG- oder PNG-Bilder.'),
        'es': ('PDF a imagen', 'Convierta páginas de PDF en imágenes JPG o PNG de alta resolución.'),
        'fr': ('PDF en image', 'Convertissez chaque page de votre PDF en images JPG ou PNG haute résolution.'),
        'no': ('PDF til bilde', 'Konverter PDF-sider til høyoppløselige JPG- eller PNG-bilder.'),
        'pt': ('PDF para imagem', 'Converta páginas de PDF em imagens JPG ou PNG de alta resolução.'),
        'uk': ('PDF у зображення', 'Перетворюйте сторінки PDF на високоякісні зображення JPG або PNG.'),
        'vi': ('PDF sang hình ảnh', 'Chuyển đổi các trang PDF thành hình ảnh JPG hoặc PNG độ nét cao.'),
        'zh': ('PDF 转图片', '将 PDF 文档每一页高清转换为 JPG 或透明 PNG 图片，支持打包下载。'),
    },
    'image-compressor': {
        'de': ('Bildkomprimierer', 'Komprimieren Sie PNG, JPG und WebP mit maximaler Speicherersparnis und ohne Qualitätsverlust.'),
        'es': ('Compresor de imágenes', 'Comprima imágenes JPG, PNG y WebP reduciendo el peso sin perder nitidez.'),
        'fr': ('Compresseur d\'images', 'Réduisez le poids de vos images JPG, PNG et WebP tout en préservant la netteté.'),
        'no': ('Bildekomprimerer', 'Komprimer JPG-, PNG- og WebP-bilder med minimalt tap av kvalitet.'),
        'pt': ('Compressor de imagens', 'Comprima imagens JPG, PNG e WebP com máxima redução de tamanho sem perder nitidez.'),
        'uk': ('Компресор зображень', 'Стискайте зображення JPG, PNG і WebP зі збереженням високої якості.'),
        'vi': ('Trình nén hình ảnh', 'Nén ảnh JPG, PNG và WebP giảm dung lượng tối đa mà vẫn giữ độ nét cao.'),
        'zh': ('图片在线压缩工具', '高效压缩 JPG、PNG 和 WebP 图片体积，自研算法保留最佳视觉质量。'),
    },
    'webp-converter': {
        'de': ('WebP-Konverter', 'Konvertieren Sie Bilder blitzschnell nach und von WebP für schnellere Ladezeiten.'),
        'es': ('Conversor WebP', 'Convierta imágenes hacia y desde el formato moderno WebP para acelerar su sitio web.'),
        'fr': ('Convertisseur WebP', 'Convertissez des images vers et depuis WebP pour accélérer le chargement web.'),
        'no': ('WebP-konverterer', 'Konverter bilder til og fra WebP for raskere innlasting på nett.'),
        'pt': ('Conversor WebP', 'Converta imagens de e para WebP para melhorar o desempenho do seu site.'),
        'uk': ('Конвертер WebP', 'Перетворюйте зображення у та з формату WebP для прискорення завантаження сайтів.'),
        'vi': ('Trình chuyển đổi WebP', 'Chuyển đổi hình ảnh sang và từ định dạng WebP giúp tối ưu tốc độ trang web.'),
        'zh': ('WebP 图片格式转换器', '在 WebP 与 PNG/JPG 之间极速互相转换，显著优化网站加载速度。'),
    },
    'markdown-to-html': {
        'de': ('Markdown zu HTML', 'Konvertieren Sie Markdown-Texte sofort in sauberes, valides HTML.'),
        'es': ('Markdown a HTML', 'Convierta texto Markdown en código HTML limpio y estructurado al instante.'),
        'fr': ('Markdown en HTML', 'Convertissez instantanément du texte Markdown en code HTML propre et valide.'),
        'no': ('Markdown til HTML', 'Konverter Markdown-tekst til ren og gyldig HTML umiddelbart.'),
        'pt': ('Markdown para HTML', 'Converta texto Markdown em código HTML limpo e estruturado instantaneamente.'),
        'uk': ('Markdown у HTML', 'Миттєво перетворюйте текст Markdown на чистий та валідний HTML.'),
        'vi': ('Markdown sang HTML', 'Chuyển đổi văn bản Markdown thành mã HTML sạch ngay lập tức.'),
        'zh': ('Markdown 转 HTML 转换器', '即时将 Markdown 文本解析转换为结构整洁的标准 HTML 网页代码。'),
    },
}

def translate_fallback(slug, en_title, en_desc, lang):
    # Specialized generic patterns based on keywords in title
    name = en_title
    clean_name = name.replace(' converter', '').replace(' generator', '').replace(' calculator', '').replace(' parser', '')
    
    if lang == 'es':
        if 'converter' in en_title.lower():
            title = f"Conversor de {clean_name}"
            desc = f"Herramienta online para convertir {clean_name} de forma rápida y segura en el navegador."
        elif 'generator' in en_title.lower():
            title = f"Generador de {clean_name}"
            desc = f"Genere {clean_name} al instante con privacidad 100% del lado del cliente."
        elif 'calculator' in en_title.lower():
            title = f"Calculadora de {clean_name}"
            desc = f"Calcule {clean_name} con total precisión y rapidez en su navegador."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"Formateador de {clean_name}"
            desc = f"Formatee y ordene {clean_name} de manera clara y profesional."
        else:
            title = f"Herramienta {clean_name}"
            desc = f"Utilidad profesional de {clean_name} para desarrolladores y diseñadores."
            
    elif lang == 'fr':
        if 'converter' in en_title.lower():
            title = f"Convertisseur de {clean_name}"
            desc = f"Outil en ligne pour convertir {clean_name} rapidement et en toute sécurité."
        elif 'generator' in en_title.lower():
            title = f"Générateur de {clean_name}"
            desc = f"Générez {clean_name} instantanément avec confidentialité 100% côté client."
        elif 'calculator' in en_title.lower():
            title = f"Calculateur de {clean_name}"
            desc = f"Calculez {clean_name} avec précision et rapidité dans votre navigateur."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"Formateur de {clean_name}"
            desc = f"Formatez et embellissez {clean_name} de manière claire et professionnelle."
        else:
            title = f"Outil {clean_name}"
            desc = f"Utilitaire professionnel de {clean_name} pour développeurs et concepteurs."
            
    elif lang == 'pt':
        if 'converter' in en_title.lower():
            title = f"Conversor de {clean_name}"
            desc = f"Ferramenta online para converter {clean_name} de forma rápida e segura no navegador."
        elif 'generator' in en_title.lower():
            title = f"Gerador de {clean_name}"
            desc = f"Gere {clean_name} instantaneamente com privacidade 100% no cliente."
        elif 'calculator' in en_title.lower():
            title = f"Calculadora de {clean_name}"
            desc = f"Calcule {clean_name} com precisão e rapidez no navegador."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"Formatador de {clean_name}"
            desc = f"Formate e embeleze {clean_name} de forma organizada e limpa."
        else:
            title = f"Ferramenta {clean_name}"
            desc = f"Utilitário profissional de {clean_name} para desenvolvedores e designers."

    elif lang == 'de':
        if 'converter' in en_title.lower():
            title = f"{clean_name}-Konverter"
            desc = f"Online-Tool zum schnellen und sicheren Konvertieren von {clean_name} im Browser."
        elif 'generator' in en_title.lower():
            title = f"{clean_name}-Generator"
            desc = f"Erstellen Sie {clean_name} sofort und mit 100% Client-seitigem Datenschutz."
        elif 'calculator' in en_title.lower():
            title = f"{clean_name}-Rechner"
            desc = f"Berechnen Sie {clean_name} präzise und schnell direkt im Browser."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"{clean_name}-Formatierer"
            desc = f"Formatieren und verschönern Sie {clean_name} übersichtlich und sauber."
        else:
            title = f"{clean_name}-Tool"
            desc = f"Professionelles {clean_name}-Tool für Entwickler und Designer."

    elif lang == 'no':
        if 'converter' in en_title.lower():
            title = f"{clean_name}-konverterer"
            desc = f"Online verktøy for å konvertere {clean_name} raskt og trygt i nettleseren."
        elif 'generator' in en_title.lower():
            title = f"{clean_name}-generator"
            desc = f"Generer {clean_name} umiddelbart med 100% klientside personvern."
        elif 'calculator' in en_title.lower():
            title = f"{clean_name}-kalkulator"
            desc = f"Beregn {clean_name} nøyaktig og raskt i nettleseren."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"{clean_name}-formaterer"
            desc = f"Formater og gjør {clean_name} oversiktlig og ren."
        else:
            title = f"{clean_name}-verktøy"
            desc = f"Praktisk {clean_name}-verktøy for utviklere og designere."

    elif lang == 'uk':
        if 'converter' in en_title.lower():
            title = f"Конвертер {clean_name}"
            desc = f"Онлайн-інструмент для швидкого та безпечного перетворення {clean_name} у браузері."
        elif 'generator' in en_title.lower():
            title = f"Генератор {clean_name}"
            desc = f"Створюйте {clean_name} миттєво зі 100% конфіденційністю на стороні клієнта."
        elif 'calculator' in en_title.lower():
            title = f"Калькулятор {clean_name}"
            desc = f"Обчислюйте {clean_name} точно та швидко прямо у браузері."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"Форматувальник {clean_name}"
            desc = f"Форматуйте та впорядковуйте {clean_name} чисто та зручно."
        else:
            title = f"Інструмент {clean_name}"
            desc = f"Професійний інструмент {clean_name} для розробників і дизайнерів."

    elif lang == 'vi':
        if 'converter' in en_title.lower():
            title = f"Trình chuyển đổi {clean_name}"
            desc = f"Công cụ trực tuyến chuyển đổi {clean_name} nhanh chóng và an toàn trong trình duyệt."
        elif 'generator' in en_title.lower():
            title = f"Trình tạo {clean_name}"
            desc = f"Tạo {clean_name} tức thì với quyền riêng tư 100% phía máy khách."
        elif 'calculator' in en_title.lower():
            title = f"Máy tính {clean_name}"
            desc = f"Tính toán {clean_name} chính xác và nhanh chóng trong trình duyệt của bạn."
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"Trình định dạng {clean_name}"
            desc = f"Định dạng và làm đẹp {clean_name} rõ ràng và chuyên nghiệp."
        else:
            title = f"Công cụ {clean_name}"
            desc = f"Tiện ích {clean_name} chuyên nghiệp cho lập trình viên và nhà thiết kế."

    elif lang == 'zh':
        if 'converter' in en_title.lower():
            title = f"{clean_name} 转换器"
            desc = f"在浏览器中安全快速转换 {clean_name} 的在线开发工具。"
        elif 'generator' in en_title.lower():
            title = f"{clean_name} 生成器"
            desc = f"即时生成 {clean_name}，100% 本地计算保护隐私。"
        elif 'calculator' in en_title.lower():
            title = f"{clean_name} 计算器"
            desc = f"在浏览器中精确高效计算 {clean_name}。"
        elif 'format' in en_title.lower() or 'prettify' in en_title.lower():
            title = f"{clean_name} 格式化美化工具"
            desc = f"格式化并整理 {clean_name} 结构，清晰易读。"
        else:
            title = f"{clean_name} 工具"
            desc = f"面向开发者与设计人员的实用 {clean_name} 本地工具。"
    else:
        title = en_title
        desc = en_desc

    return title, desc

# Update all locale files
for lang in LANGS:
    loc_file = os.path.join(LOCALES_DIR, f"{lang}.yml")
    with open(loc_file, 'r', encoding='utf-8') as f:
        data = yaml.safe_load(f) or {}

    if 'tools' not in data:
        data['tools'] = {}

    tools_dict = data['tools']
    updated_count = 0

    for slug, en_entry in en_tools.items():
        if slug == 'categories':
            continue
        
        # Check if already present and has both title and description
        existing = tools_dict.get(slug)
        if existing and isinstance(existing, dict) and existing.get('title') and existing.get('description'):
            continue

        # Look up in custom dictionary or use fallback pattern
        en_t = en_entry.get('title', slug)
        en_d = en_entry.get('description', '')

        if slug in CUSTOM_TRANSLATIONS and lang in CUSTOM_TRANSLATIONS[slug]:
            t, d = CUSTOM_TRANSLATIONS[slug][lang]
        else:
            t, d = translate_fallback(slug, en_t, en_d, lang)

        tools_dict[slug] = {
            'title': t,
            'description': d
        }
        updated_count += 1

    with open(loc_file, 'w', encoding='utf-8') as f:
        yaml.dump(data, f, allow_unicode=True, sort_keys=False)

    print(f"[{lang}.yml] Successfully updated {updated_count} tools. Total tools now: {len(tools_dict)}")

print("All locale files populated successfully!")
