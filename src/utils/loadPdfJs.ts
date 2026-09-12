// Helper to load pdfjs from local static asset or fallback CDN
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
      } else {
        reject(new Error('PDF.js failed to load properly.'));
      }
    };
    script.onerror = () => {
      // Fallback to cdnjs if local fails
      const fallbackScript = document.createElement('script');
      fallbackScript.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
      fallbackScript.onload = () => {
        if (w.pdfjsLib) {
          w.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
          resolve(w.pdfjsLib);
        } else {
          reject(new Error('PDF.js CDN fallback failed to initialize.'));
        }
      };
      fallbackScript.onerror = () => reject(new Error('Failed to load PDF.js from local and CDN.'));
      document.head.appendChild(fallbackScript);
    };
    document.head.appendChild(script);
  });
}
