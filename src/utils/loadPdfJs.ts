// Helper to load pdfjs from the local static asset only (no CDN fallback)
export async function loadPdfJs(): Promise<any> {
  const w = window as any;
  if (w.pdfjsLib) {
    return w.pdfjsLib;
  }

  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = '/pdf.min.js';
    script.onload = () => {
      if (w.pdfjsLib) {
        w.pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.js';
        resolve(w.pdfjsLib);
      }
      else {
        reject(new Error('PDF.js failed to load properly.'));
      }
    };
    script.onerror = () => {
      // No CDN fallback: the local PDF.js bundle is part of the site.
      // A silent CDN load would break the "no third-party requests" promise.
      reject(new Error('Failed to load the local PDF engine. Please check your connection and reload the page. / تعذّر تحميل محرك PDF المحلي. تحقق من اتصالك وأعد تحميل الصفحة.'));
    };
    document.head.appendChild(script);
  });
}
