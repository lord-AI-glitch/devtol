type GuideRenderer = (rawMarkdown: string) => string;

let rendererPromise: Promise<GuideRenderer> | null = null;

async function createGuideRenderer(): Promise<GuideRenderer> {
  const [{ default: MarkdownIt }, { default: DomPurify }, { default: hljs }] = await Promise.all([
    import('markdown-it'),
    import('dompurify'),
    import('highlight.js/lib/core'),
    import('highlight.js/styles/atom-one-dark.css'),
  ]);

  const [
    bash,
    c,
    cpp,
    csharp,
    css,
    diff,
    dockerfile,
    go,
    ini,
    java,
    javascript,
    json,
    markdown,
    php,
    powershell,
    python,
    ruby,
    rust,
    scss,
    shell,
    sql,
    typescript,
    xml,
    yaml,
  ] = await Promise.all([
    import('highlight.js/lib/languages/bash'),
    import('highlight.js/lib/languages/c'),
    import('highlight.js/lib/languages/cpp'),
    import('highlight.js/lib/languages/csharp'),
    import('highlight.js/lib/languages/css'),
    import('highlight.js/lib/languages/diff'),
    import('highlight.js/lib/languages/dockerfile'),
    import('highlight.js/lib/languages/go'),
    import('highlight.js/lib/languages/ini'),
    import('highlight.js/lib/languages/java'),
    import('highlight.js/lib/languages/javascript'),
    import('highlight.js/lib/languages/json'),
    import('highlight.js/lib/languages/markdown'),
    import('highlight.js/lib/languages/php'),
    import('highlight.js/lib/languages/powershell'),
    import('highlight.js/lib/languages/python'),
    import('highlight.js/lib/languages/ruby'),
    import('highlight.js/lib/languages/rust'),
    import('highlight.js/lib/languages/scss'),
    import('highlight.js/lib/languages/shell'),
    import('highlight.js/lib/languages/sql'),
    import('highlight.js/lib/languages/typescript'),
    import('highlight.js/lib/languages/xml'),
    import('highlight.js/lib/languages/yaml'),
  ]);

  hljs.registerLanguage('bash', bash.default);
  hljs.registerLanguage('c', c.default);
  hljs.registerLanguage('cpp', cpp.default);
  hljs.registerLanguage('csharp', csharp.default);
  hljs.registerLanguage('css', css.default);
  hljs.registerLanguage('diff', diff.default);
  hljs.registerLanguage('dockerfile', dockerfile.default);
  hljs.registerLanguage('go', go.default);
  hljs.registerLanguage('ini', ini.default);
  hljs.registerLanguage('java', java.default);
  hljs.registerLanguage('javascript', javascript.default);
  hljs.registerLanguage('json', json.default);
  hljs.registerLanguage('markdown', markdown.default);
  hljs.registerLanguage('php', php.default);
  hljs.registerLanguage('powershell', powershell.default);
  hljs.registerLanguage('python', python.default);
  hljs.registerLanguage('ruby', ruby.default);
  hljs.registerLanguage('rust', rust.default);
  hljs.registerLanguage('scss', scss.default);
  hljs.registerLanguage('shell', shell.default);
  hljs.registerLanguage('sql', sql.default);
  hljs.registerLanguage('typescript', typescript.default);
  hljs.registerLanguage('xml', xml.default);
  hljs.registerLanguage('yaml', yaml.default);
  hljs.registerLanguage('html', xml.default);

  const md = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight(str: string, lang: string) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return `<pre class="hljs"><code class="hljs language-${lang}">${hljs.highlight(str, { language: lang, ignoreIllegals: true }).value}</code></pre>`;
        } catch (_) {}
      }
      return `<pre class="hljs"><code class="hljs">${md.utils.escapeHtml(str)}</code></pre>`;
    },
  });

  return (rawMarkdown: string) => {
    const rendered = md
      .render(rawMarkdown.replace(/^\uFEFF/, ''))
      .replace(/<h1(\s[^>]*)?>/gi, '<h2$1>')
      .replace(/<\/h1>/gi, '</h2>');
    return DomPurify.sanitize(rendered, { ADD_ATTR: ['target'] });
  };
}

/**
 * Markdown-it, highlight.js and DOMPurify weigh several hundred KB.
 * Loading them only when a tool page actually has a guide keeps the shared
 * tool bundle small for every other page.
 */
export function getGuideRenderer(): Promise<GuideRenderer> {
  rendererPromise ??= createGuideRenderer();
  return rendererPromise;
}
