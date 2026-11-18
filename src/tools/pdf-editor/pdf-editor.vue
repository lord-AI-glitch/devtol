<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue';
import { useHead } from '@vueuse/head';
import { useMessage } from 'naive-ui';
import { loadPdfJs } from '@/utils/loadPdfJs';

useHead({
  title: 'Free PDF Editor - Find & Replace, Edit Text, Sign & Markup',
  meta: [
    {
      name: 'description',
      content: 'Add visual text overlays, drawings and signatures to PDFs in your browser. Original text remains searchable and extractable. Not for secure redaction or permanent text removal.',
    },
    {
      name: 'keywords',
      content: 'pdf editor, free pdf editor, edit pdf text, find and replace pdf, arabic pdf editor, pdf signature, local fonts pdf, client-side pdf, redact pdf, modify pdf online, no upload pdf editor, تعديل ملفات pdf, تعديل نصوص pdf, بحث واستبدال pdf, تعديل pdf مجاني',
    },
    {
      property: 'og:title',
      content: 'Free PDF Editor - Find & Replace, Edit Text, Sign & Markup'
    },
    {
      property: 'og:description',
      content: 'Add visual text overlays, drawings and signatures to PDFs in your browser. Original text remains searchable and extractable. Not for secure redaction or permanent text removal.'
    }
  ],
});

import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
// @ts-ignore
import { ArabicShaper } from 'arabic-persian-reshaper';
// @ts-ignore
import bidiFactory from 'bidi-js';

const bidi = bidiFactory();

// Helper to normalize text extracted from PDF (convert reversed/presentation glyphs back to readable Arabic)
function normalizeExtractedText(str: string): string {
  if (!str) return '';
  // Check if string contains Arabic presentation forms (FB50-FDFF, FE70-FEFF)
  const hasPresentationForms = /[\uFB50-\uFDFF\uFE70-\uFEFF]/.test(str);
  if (hasPresentationForms) {
    try {
      const unshaped = ArabicShaper.convertArabicBack(str);
      return unshaped.split('').reverse().join('');
    } catch (e) {
      return str;
    }
  }
  return str;
}

// Helper to split text into visual runs (Left-to-Right visual order) for pdf-lib rendering
function getVisualRuns(text: string): { text: string, isRTL: boolean, isArabic: boolean }[] {
  if (!text) return [];
  try {
    const embeddingLevels = bidi.getEmbeddingLevels(text, 'rtl');
    const indices = bidi.getReorderedIndices(text, embeddingLevels);
    const runs: { level: number, indices: number[] }[] = [];
    let currentRun: { level: number, indices: number[] } | null = null;
    
    for (let i = 0; i < indices.length; i++) {
      const logicalIndex = indices[i];
      const level = embeddingLevels.levels[logicalIndex];
      if (!currentRun || currentRun.level !== level) {
        if (currentRun) runs.push(currentRun);
        currentRun = { level, indices: [logicalIndex] };
      } else {
        currentRun.indices.push(logicalIndex);
      }
    }
    if (currentRun) runs.push(currentRun);

    return runs.map(run => {
      const sortedIndices = [...run.indices].sort((a, b) => a - b);
      let logicalString = sortedIndices.map(idx => {
        const char = text[idx];
        if (run.level % 2 === 1) {
          return bidi.getMirroredCharacter(char) || char;
        }
        return char;
      }).join('');
      
      const isRTL = run.level % 2 === 1;
      const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(logicalString);
      
      // If a run is RTL but has no Arabic letters (e.g. just punctuation or symbols),
      // fontkit will treat it as LTR and won't reverse it, so we manually reverse it.
      if (isRTL && !isArabic) {
        logicalString = logicalString.split('').reverse().join('');
      }
      
      return { text: logicalString, isRTL, isArabic };
    });
  } catch (e) {
    console.warn('BiDi processing error, falling back to raw text:', e);
    return [{ text, isRTL: false, isArabic: false }];
  }
}

const message = useMessage();

const file = ref<File | null>(null);
const isLoading = ref(false);
const isSaving = ref(false);
const totalPages = ref(0);
const currentPage = ref(1);
const zoomScale = ref(1.2);

// Tool mode
type ToolMode = 'select' | 'draw' | 'text' | 'rect' | 'whiteout' | 'signature';
const activeTool = ref<ToolMode>('draw');

// Draw options
const strokeColor = ref('#ff0000');
const strokeWidth = ref(3);
const fontColor = ref('#000000');
const fontSize = ref(16);
const textToAdd = ref('');
const textFont = ref<string>('Cairo');

// Replace text feature
const searchText = ref('');
const replacementText = ref('');
const replaceFontFamily = ref<'Amiri' | 'Helvetica' | 'HelveticaBold' | 'TimesRoman' | 'Courier'>('Amiri');
const replaceTextColor = ref('#000000');
const autoMatchSize = ref(true);
const customReplaceFontSize = ref(12);
const replaceScope = ref<'all' | 'current'>('current');
const isReplacing = ref(false);

// Canvas refs
const pdfCanvasRef = ref<HTMLCanvasElement | null>(null);
const drawCanvasRef = ref<HTMLCanvasElement | null>(null);
const isDrawing = ref(false);
const lastX = ref(0);
const lastY = ref(0);

// Storage for per-page drawings/annotations (data URLs)
const pageAnnotations = ref<Record<number, string>>({});

// Interactive Text Layer (Click on original text to edit directly)
interface InteractiveTextItem {
  id: number;
  str: string;
  tx: number;
  ty: number;
  width: number;
  height: number;
  origSize: number;
  fontSize: number;
  pdfLibTy: number;
  fontName?: string;
  fontFamily?: string;
  isModified?: boolean;
  newStr?: string;
}
const currentPageTextItems = ref<InteractiveTextItem[]>([]);
const isInteractiveTextMode = ref(true);
const selectedTextItem = ref<InteractiveTextItem | null>(null);
const showEditModal = ref(false);
const editTextValue = ref('');
const editTextColor = ref('#000000');
const editTextFont = ref<string>('Cairo');
const editTextFontSize = ref(12);

const defaultFontOptions = [
  { label: 'Cairo (عصري ومطابق)', value: 'Cairo' },
  { label: 'Amiri (نسخ / تقليدي)', value: 'Amiri' },
  { label: 'Helvetica (Sans)', value: 'Helvetica' },
  { label: 'Helvetica Bold', value: 'HelveticaBold' },
  { label: 'Times (Serif)', value: 'TimesRoman' },
  { label: 'Courier (Mono)', value: 'Courier' }
];

const fontOptions = computed(() => {
  return [
    { type: 'group', label: 'Default Fonts', key: 'default', children: defaultFontOptions },
    ...(isSystemFontsLoaded.value 
        ? [{ type: 'group', label: 'Your System Fonts', key: 'system', children: systemFonts.value }] 
        : [])
  ];
});

// System fonts capability
const supportsLocalFonts = typeof window !== 'undefined' && 'queryLocalFonts' in window;
const systemFonts = ref<{ label: string, value: string, fontData?: FontData }[]>([]);
const isSystemFontsLoaded = ref(false);

interface FontData {
  family: string;
  fullName: string;
  postscriptName: string;
  blob: () => Promise<Blob>;
}

async function loadSystemFonts() {
  if (!('queryLocalFonts' in window)) {
    message.warning('Your browser does not support Local Font Access API.');
    return;
  }
  try {
    const fonts = await (window as any).queryLocalFonts() as FontData[];
    // Filter and map to unique font families
    const fontMap = new Map<string, FontData>();
    fonts.forEach(f => {
      // Prefer Regular over Italic/Bold if possible, but keep the first seen
      if (!fontMap.has(f.family) || f.fullName.toLowerCase().includes('regular')) {
        fontMap.set(f.family, f);
      }
    });
    
    systemFonts.value = Array.from(fontMap.values()).map(f => ({
      label: `💻 ${f.family}`,
      value: `SYSTEM_${f.postscriptName}`,
      fontData: f
    })).sort((a, b) => a.label.localeCompare(b.label));
    
    isSystemFontsLoaded.value = true;
    message.success(`Loaded ${systemFonts.value.length} system fonts!`);
  } catch (e: any) {
    message.error('Failed to access system fonts. Permission denied?');
  }
}

// Cache custom fonts
let cachedAmiriFontBytes: ArrayBuffer | null = null;
let cachedCairoFontBytes: ArrayBuffer | null = null;

async function getAmiriFontBytes() {
  if (!cachedAmiriFontBytes) {
    const res = await fetch('/Amiri-Regular.ttf');
    cachedAmiriFontBytes = await res.arrayBuffer();
  }
  return cachedAmiriFontBytes;
}

async function getCairoFontBytes() {
  if (!cachedCairoFontBytes) {
    const res = await fetch('/Cairo-Regular.ttf');
    cachedCairoFontBytes = await res.arrayBuffer();
  }
  return cachedCairoFontBytes;
}

function getBrowserFontFamily(fontValue: string) {
  if (fontValue.startsWith('SYSTEM_')) {
    const sysFont = systemFonts.value.find(f => f.value === fontValue);
    if (sysFont && sysFont.fontData) {
      return `"${sysFont.fontData.family}", sans-serif`;
    }
  }
  if (fontValue === 'Helvetica' || fontValue === 'HelveticaBold') return 'Helvetica, Arial, sans-serif';
  if (fontValue === 'TimesRoman') return '"Times New Roman", Times, serif';
  if (fontValue === 'Courier') return 'Courier, monospace';
  return `"${fontValue}", sans-serif`;
}

// Helper to embed proper font (Arabic/Unicode supported)
async function getEmbeddedFont(doc: any, requestedFont: string, sampleText: string) {
  doc.registerFontkit(fontkit);
  
  if (requestedFont.startsWith('SYSTEM_')) {
    const sysFont = systemFonts.value.find(f => f.value === requestedFont);
    if (sysFont && sysFont.fontData) {
      try {
        const blob = await sysFont.fontData.blob();
        const fontBytes = await blob.arrayBuffer();
        return await doc.embedFont(fontBytes);
      } catch (e) {
        console.warn('Failed to embed system font, falling back...', e);
      }
    }
  }

  const hasArabicOrUnicode = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(sampleText);
  
  if (requestedFont === 'Cairo' || (hasArabicOrUnicode && requestedFont !== 'Amiri')) {
    const fontBytes = await getCairoFontBytes();
    return await doc.embedFont(fontBytes);
  }
  if (requestedFont === 'Amiri') {
    const fontBytes = await getAmiriFontBytes();
    return await doc.embedFont(fontBytes);
  }
  if (requestedFont === 'HelveticaBold') return await doc.embedFont(StandardFonts.HelveticaBold);
  if (requestedFont === 'TimesRoman') return await doc.embedFont(StandardFonts.TimesRoman);
  if (requestedFont === 'Courier') return await doc.embedFont(StandardFonts.Courier);
  return await doc.embedFont(StandardFonts.Helvetica);
}

let pdfDocInstance: any = null;
let currentRenderTask: any = null;

async function onFileSelected(e: Event) {
  const target = e.target as HTMLInputElement;
  if (!target.files?.[0]) return;
  file.value = target.files[0];
  pageAnnotations.value = {};
  currentPage.value = 1;
  await loadPdf();
}

async function loadPdf() {
  if (!file.value) return;
  isLoading.value = true;
  try {
    const pdfjsLib = await loadPdfJs();
    const arrayBuffer = await file.value.arrayBuffer();
    pdfDocInstance = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    totalPages.value = pdfDocInstance.numPages;
    currentPage.value = 1;
    await nextTick();
    await renderPage(currentPage.value);
    message.success(`PDF Loaded: ${totalPages.value} pages`);
  } catch (err: any) {
    message.error(err?.message || 'Failed to load PDF');
  } finally {
    isLoading.value = false;
  }
}

const pageHistory = ref<Record<number, string[]>>({});

const canUndo = computed(() => {
  return pageHistory.value[currentPage.value]?.length > 0;
});

function saveStateToHistory() {
  if (!drawCanvasRef.value) return;
  if (!pageHistory.value[currentPage.value]) {
    pageHistory.value[currentPage.value] = [];
  }
  // Save current state to history BEFORE the new change is drawn
  const currentData = drawCanvasRef.value.toDataURL('image/png');
  pageHistory.value[currentPage.value].push(currentData);
}

function undoLastAnnotation() {
  if (!canUndo.value) return;
  const history = pageHistory.value[currentPage.value];
  const previousState = history.pop();
  
  if (previousState) {
    pageAnnotations.value[currentPage.value] = previousState;
  } else {
    pageAnnotations.value[currentPage.value] = ''; // blank
  }
  restoreCurrentDrawings();
}

async function saveCurrentDrawings() {
  if (!drawCanvasRef.value) return;
  pageAnnotations.value[currentPage.value] = drawCanvasRef.value.toDataURL('image/png');
}

async function restoreCurrentDrawings() {
  const drawCanvas = drawCanvasRef.value;
  if (!drawCanvas) return;
  const ctx = drawCanvas.getContext('2d');
  if (!ctx) return;
  ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);

  const savedData = pageAnnotations.value[currentPage.value];
  if (savedData) {
    const img = new Image();
    img.onload = () => {
      ctx.drawImage(img, 0, 0);
    };
    img.src = savedData;
  }
}

async function renderPage(pageNum: number) {
  if (!pdfDocInstance) return;
  if (currentRenderTask) {
    currentRenderTask.cancel();
  }

  try {
    const page = await pdfDocInstance.getPage(pageNum);
    const viewport = page.getViewport({ scale: zoomScale.value });
    const pdfCanvas = pdfCanvasRef.value;
    const drawCanvas = drawCanvasRef.value;

    if (!pdfCanvas || !drawCanvas) return;

    pdfCanvas.width = viewport.width;
    pdfCanvas.height = viewport.height;
    drawCanvas.width = viewport.width;
    drawCanvas.height = viewport.height;

    const ctx = pdfCanvas.getContext('2d')!;
    currentRenderTask = page.render({ canvasContext: ctx, viewport });
    await currentRenderTask.promise;
    currentRenderTask = null;

    // Extract text content for direct interactive click-to-edit layer
    const textContent = await page.getTextContent();
    const rawItems: any[] = [];

    for (const item of textContent.items) {
      if (item.str && item.str.trim().length > 0) {
        const origHeight = Math.hypot(item.transform[0], item.transform[1]) || item.height || 12;
        let fontFamily = '';
        if (item.fontName) {
          try {
            const fontObj = page.commonObjs.get(item.fontName);
            fontFamily = fontObj?.name || item.fontName;
          } catch (e) {
            fontFamily = item.fontName;
          }
        }
        rawItems.push({
          str: item.str,
          pdfLibTx: item.transform[4],
          pdfLibTy: item.transform[5],
          origSize: origHeight,
          width: item.width || (origHeight * item.str.length * 0.55),
          height: origHeight,
          fontName: item.fontName,
          fontFamily
        });
      }
    }

    // Sort items by vertical position descending (top-to-bottom), then horizontal (left-to-right)
    rawItems.sort((a, b) => {
      if (Math.abs(a.pdfLibTy - b.pdfLibTy) > 3) {
        return b.pdfLibTy - a.pdfLibTy;
      }
      return a.pdfLibTx - b.pdfLibTx;
    });

    // Merge words/characters that are on the same line and close to each other into full phrases
    const mergedItems: InteractiveTextItem[] = [];
    let idCounter = 0;

    for (const item of rawItems) {
      const last = mergedItems[mergedItems.length - 1];
      // If on the same horizontal baseline (within 3 points) and close enough horizontally
      const sameLine = last && Math.abs(last.pdfLibTy - item.pdfLibTy) <= 3;
      const unscaledLastTx = last ? (last.tx / zoomScale.value) : 0;
      const unscaledLastWidth = last ? (last.width / zoomScale.value) : 0;
      const closeDistance = last && (item.pdfLibTx - (unscaledLastTx + unscaledLastWidth)) <= 15 && (item.pdfLibTx - unscaledLastTx) >= 0;

      if (sameLine && closeDistance) {
        // Append to existing phrase
        last.str += (item.pdfLibTx - (unscaledLastTx + unscaledLastWidth) > 2 ? ' ' : '') + item.str;
        const newTotalWidth = (item.pdfLibTx + item.width) - unscaledLastTx;
        last.width = newTotalWidth * zoomScale.value;
      } else {
        // Start a new text segment
        const tx = item.pdfLibTx * zoomScale.value;
        const ty = viewport.height - (item.pdfLibTy * zoomScale.value) - (item.origSize * zoomScale.value);
        const itemWidth = item.width * zoomScale.value;
        const itemHeight = item.origSize * zoomScale.value;

        mergedItems.push({
          id: idCounter++,
          str: item.str,
          tx,
          ty,
          width: Math.max(itemWidth, 24),
          height: Math.max(itemHeight, 16),
          origSize: item.origSize,
          fontSize: Math.round(item.origSize * zoomScale.value),
          pdfLibTy: item.pdfLibTy,
          fontName: item.fontName,
          fontFamily: item.fontFamily
        });
      }
    }

    currentPageTextItems.value = mergedItems;

    restoreCurrentDrawings();
  } catch (err: any) {
    if (err?.name !== 'RenderingCancelledException') {
      console.error('Render error:', err);
    }
  }
}

function openTextEditor(item: InteractiveTextItem) {
  selectedTextItem.value = item;
  // Automatically normalize reversed PDF presentation glyphs to natural readable Arabic
  editTextValue.value = normalizeExtractedText(item.str);
  editTextFontSize.value = Math.max(9, Math.round(item.origSize * 0.95));

  // Font detection and recommendation
  const fn = (item.fontFamily || item.fontName || '').toLowerCase();
  if (fn) {
    if (fn.includes('serif') || fn.includes('times') || fn.includes('traditional') || fn.includes('naskh') || fn.includes('amiri') || fn.includes('sakkal')) {
      editTextFont.value = 'Amiri';
      message.info(`Detected font: ${item.fontFamily || item.fontName}. Recommended: "Amiri".`);
    } else if (fn.includes('sans') || fn.includes('arial') || fn.includes('kufi') || fn.includes('ge_ss') || fn.includes('boutros') || fn.includes('frutiger') || fn.includes('cairo') || fn.includes('tahoma') || fn.includes('segoe')) {
      editTextFont.value = 'Cairo';
      message.info(`Detected font: ${item.fontFamily || item.fontName}. Recommended: "Cairo".`);
    } else {
      editTextFont.value = 'Cairo'; // Default fallback
      message.info(`Detected font: ${item.fontFamily || item.fontName}. Selected default: "Cairo".`);
    }
  }

  showEditModal.value = true;
}

async function applyDirectTextEdit() {
  if (!selectedTextItem.value || !file.value) return;
  const item = selectedTextItem.value;
  const newText = editTextValue.value;
  showEditModal.value = false;
  isLoading.value = true;

  try {
    const bytes = await file.value.arrayBuffer();
    const pdfLibDoc = await PDFDocument.load(bytes);
    const pdfLibPage = pdfLibDoc.getPage(currentPage.value - 1);

    // Font selection with Unicode/Arabic fallback
    const font = await getEmbeddedFont(pdfLibDoc, editTextFont.value, newText || item.str);

    // Color conversion
    const hex = editTextColor.value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
    const color = rgb(r, g, b);

    // PDF original coordinates
    const unscaledTx = item.tx / zoomScale.value;
    const unscaledTy = item.pdfLibTy;
    const unscaledWidth = item.width / zoomScale.value;
    const unscaledHeight = item.origSize;

    // 1. Mask original text with clean white rectangle (extended slightly to ensure full coverage)
    pdfLibPage.drawRectangle({
      x: unscaledTx - 2,
      y: unscaledTy - 4,
      width: unscaledWidth + 6,
      height: unscaledHeight + 8,
      color: rgb(1, 1, 1),
    });

    // 2. Draw newly edited text at exact position with Arabic shaping & BiDi
    if (newText) {
      const computedFontSize = editTextFontSize.value || Math.max(8, Math.round(unscaledHeight));
      
      const runs = getVisualRuns(newText);
      let totalWidth = 0;
      for (const run of runs) {
        totalWidth += font.widthOfTextAtSize(run.text, computedFontSize);
      }

      // Calculate anchor X
      const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(newText);
      let startX = unscaledTx;
      if (isArabic) {
        // If the new text is shorter or longer than the box, anchor it from the right side of the original text
        startX = Math.max(unscaledTx, (unscaledTx + unscaledWidth) - totalWidth);
      }

      let currentX = startX;
      for (const run of runs) {
        if (!run.text) continue;
        pdfLibPage.drawText(run.text, {
          x: currentX,
          y: unscaledTy,
          size: computedFontSize,
          font,
          color,
        });
        currentX += font.widthOfTextAtSize(run.text, computedFontSize);
      }
    }

    const modifiedBytes = await pdfLibDoc.save();
    const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
    file.value = new File([blob], file.value.name, { type: 'application/pdf' });
    await loadPdf();
    message.success(`Text updated directly in PDF!`);
  } catch (err: any) {
    message.error('Failed to update text: ' + (err?.message || 'Error'));
  } finally {
    isLoading.value = false;
  }
}

async function goToPage(page: number) {
  if (page < 1 || page > totalPages.value || page === currentPage.value) return;
  saveCurrentDrawings();
  currentPage.value = page;
  await renderPage(currentPage.value);
}

const startX = ref(0);
const startY = ref(0);
let drawSnapshot: ImageData | null = null;

// Canvas Drawing Listeners
function startDraw(e: MouseEvent) {
  if (activeTool.value === 'select') return;
  const canvas = drawCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (activeTool.value === 'text') {
    if (!textToAdd.value.trim()) {
      message.warning('Type text in the input box first');
      return;
    }
  }

  saveStateToHistory();

  isDrawing.value = true;
  startX.value = x;
  startY.value = y;
  lastX.value = x;
  lastY.value = y;
  
  // Save a snapshot of the current canvas for drag preview
  drawSnapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);

  if (activeTool.value === 'text') {
    ctx.font = `${fontSize.value * zoomScale.value}px ${getBrowserFontFamily(textFont.value)}`;
    ctx.fillStyle = fontColor.value;
    ctx.textBaseline = 'middle';
    ctx.fillText(textToAdd.value, x, y);
  }
}

function onDraw(e: MouseEvent) {
  if (!isDrawing.value) return;
  const canvas = drawCanvasRef.value;
  if (!canvas) return;
  const rect = canvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  if (activeTool.value === 'whiteout' || activeTool.value === 'rect' || activeTool.value === 'text') {
    // Restore previous state so we only draw the current preview shape
    if (drawSnapshot) {
      ctx.putImageData(drawSnapshot, 0, 0);
    }
    
    if (activeTool.value === 'text') {
      ctx.font = `${fontSize.value * zoomScale.value}px ${getBrowserFontFamily(textFont.value)}`;
      ctx.fillStyle = fontColor.value;
      ctx.textBaseline = 'middle';
      ctx.fillText(textToAdd.value, x, y);
    } else {
      const width = x - startX.value;
      const height = y - startY.value;
      
      if (activeTool.value === 'whiteout') {
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(startX.value, startY.value, width, height);
      } else if (activeTool.value === 'rect') {
        ctx.strokeStyle = strokeColor.value;
        ctx.lineWidth = strokeWidth.value;
        ctx.strokeRect(startX.value, startY.value, width, height);
      }
    }
    return;
  }

  if (activeTool.value === 'draw' || activeTool.value === 'signature') {
    ctx.beginPath();
    ctx.moveTo(lastX.value, lastY.value);
    ctx.lineTo(x, y);
    ctx.strokeStyle = activeTool.value === 'signature' ? '#000080' : strokeColor.value;
    ctx.lineWidth = activeTool.value === 'signature' ? 2 : strokeWidth.value;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastX.value = x;
    lastY.value = y;
  }
}

function stopDraw() {
  if (isDrawing.value) {
    isDrawing.value = false;
    drawSnapshot = null;
    saveCurrentDrawings();
  }
}

function clearCurrentPageAnnotations() {
  saveStateToHistory();
  const canvas = drawCanvasRef.value;
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
  delete pageAnnotations.value[currentPage.value];
  message.info('Annotations cleared for this page');
}

// Find & Replace Text Layer (Using PDF-LIB + Canvas visual masking)
async function executeFindAndReplace() {
  if (!file.value || !searchText.value.trim()) {
    message.warning('Enter text to search for');
    return;
  }
  isReplacing.value = true;
  try {
    const bytes = await file.value.arrayBuffer();
    const pdfLibDoc = await PDFDocument.load(bytes);
    
    // Embed chosen font with Unicode/Arabic fallback
    const font = await getEmbeddedFont(pdfLibDoc, replaceFontFamily.value, replacementText.value || searchText.value);

    // Convert hex color to rgb
    const hex = replaceTextColor.value.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16) / 255 || 0;
    const g = parseInt(hex.substring(2, 4), 16) / 255 || 0;
    const b = parseInt(hex.substring(4, 6), 16) / 255 || 0;
    const textColor = rgb(r, g, b);

    const startPage = replaceScope.value === 'current' ? currentPage.value : 1;
    const endPage = replaceScope.value === 'current' ? currentPage.value : pdfDocInstance.numPages;

    let matchCount = 0;
    for (let i = startPage; i <= endPage; i++) {
      const page = await pdfDocInstance.getPage(i);
      const textContent = await page.getTextContent();
      const pdfLibPage = pdfLibDoc.getPage(i - 1);

      for (const item of textContent.items) {
        if (item.str && item.str.toLowerCase().includes(searchText.value.toLowerCase())) {
          matchCount++;
          const tx = item.transform[4];
          const ty = item.transform[5];
          const itemWidth = item.width || 60;
          const origSize = Math.hypot(item.transform[0], item.transform[1]) || item.height || 12;

          // Mask old text precisely with white background
          pdfLibPage.drawRectangle({
            x: tx - 1,
            y: ty - 2,
            width: itemWidth + 2,
            height: origSize + 4,
            color: rgb(1, 1, 1),
          });

          // Compute font size: either auto-matched to original item height or custom user size
          const finalSize = autoMatchSize.value ? Math.round(origSize) : customReplaceFontSize.value;

          // Draw replacement text with Arabic shaping & BiDi
          if (replacementText.value) {
            const runs = getVisualRuns(replacementText.value);
            const computedFontSize = Math.max(8, finalSize);
            
            let totalWidth = 0;
            for (const run of runs) {
              totalWidth += font.widthOfTextAtSize(run.text, computedFontSize);
            }

            const isArabic = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/.test(replacementText.value);
            let startX = tx;
            if (isArabic) {
              startX = Math.max(tx, (tx + itemWidth) - totalWidth);
            }

            let currentX = startX;
            for (const run of runs) {
              if (!run.text) continue;
              pdfLibPage.drawText(run.text, {
                x: currentX,
                y: ty,
                size: computedFontSize,
                font,
                color: textColor,
              });
              currentX += font.widthOfTextAtSize(run.text, computedFontSize);
            }
          }
        }
      }
    }

    if (matchCount === 0) {
      message.warning(`No matches found for "${searchText.value}" in selected scope.`);
      return;
    }

    const modifiedBytes = await pdfLibDoc.save();
    const blob = new Blob([modifiedBytes], { type: 'application/pdf' });
    file.value = new File([blob], file.value.name, { type: 'application/pdf' });
    await loadPdf();
    message.warning(`Applied ${matchCount} visual overlay(s). Original text remains searchable and extractable; this is not redaction.`);
  } catch (err: any) {
    message.error('Replace failed: ' + (err?.message || 'Error'));
  } finally {
    isReplacing.value = false;
  }
}

// Export / Download Modified PDF
async function saveAndDownload() {
  if (!file.value) return;
  saveCurrentDrawings();
  isSaving.value = true;
  try {
    const fileBytes = await file.value.arrayBuffer();
    const pdfLibDoc = await PDFDocument.load(fileBytes);

    for (let i = 1; i <= totalPages.value; i++) {
      const annotationData = pageAnnotations.value[i];
      if (annotationData) {
        const page = pdfLibDoc.getPage(i - 1);
        const { width, height } = page.getSize();
        const pngImageBytes = Uint8Array.from(atob(annotationData.split(',')[1]), c => c.charCodeAt(0));
        const pngImage = await pdfLibDoc.embedPng(pngImageBytes);
        page.drawImage(pngImage, {
          x: 0,
          y: 0,
          width,
          height,
        });
      }
    }

    const finalBytes = await pdfLibDoc.save();
    const blob = new Blob([finalBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `edited_${file.value.name}`;
    a.click();
    URL.revokeObjectURL(url);
    message.success('Modified PDF downloaded successfully!');
  } catch (err: any) {
    message.error(err?.message || 'Failed to export PDF');
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div style="max-width: 950px; margin: 0 auto">
    <c-alert type="warning" mb-4 data-test-id="pdf-editor-safety-warning">
      All text edits, replacements and covering marks are visual overlays only.
      The original text remains searchable, copyable and extractable in the downloaded PDF.
      This editor does not securely redact or permanently remove information.
      Do not use it to hide sensitive data before sharing a document.
    </c-alert>
    <!-- Upload Section -->
    <c-card title="Upload PDF to Edit" mb-4>
      <div
        style="border: 2px dashed var(--n-border-color); border-radius: 8px; padding: 28px; text-align: center; cursor: pointer"
        @click="($refs.fi as HTMLInputElement).click()"
      >
        <p style="color: var(--n-text-color-3)">
          {{ file ? `${file.name} (${totalPages} pages)` : 'Click to select or drop a PDF file here' }}
        </p>
        <input ref="fi" type="file" accept=".pdf" style="display: none" @change="onFileSelected" />
      </div>
      <n-spin v-if="isLoading" mt-3 />
    </c-card>

    <template v-if="file && totalPages > 0">
      <!-- Toolbar & Operations -->
      <c-card title="PDF Editor Tools" mb-4>
        <n-tabs type="line" animated>
          <!-- Tab 1: Visual Annotate & Draw -->
          <n-tab-pane name="visual" tab="✏️ Visual Markup & Signature">
            <div flex flex-wrap gap-3 items-center mb-4>
              <span text-sm font-semibold>Tool:</span>
              <n-button-group size="small">
                <n-button :type="activeTool === 'select' ? 'primary' : 'default'" @click="activeTool = 'select'">
                  👆 Select / Edit Text
                </n-button>
                <n-button :type="activeTool === 'draw' ? 'primary' : 'default'" @click="activeTool = 'draw'">
                  🖊️ Pen
                </n-button>
                <n-button :type="activeTool === 'signature' ? 'primary' : 'default'" @click="activeTool = 'signature'">
                  ✍️ Signature
                </n-button>
                <n-button :type="activeTool === 'text' ? 'primary' : 'default'" @click="activeTool = 'text'">
                  🔤 Add Text
                </n-button>
                <n-button :type="activeTool === 'whiteout' ? 'primary' : 'default'" @click="activeTool = 'whiteout'">
                  ⬜ Whiteout
                </n-button>
                <n-button :type="activeTool === 'rect' ? 'primary' : 'default'" @click="activeTool = 'rect'">
                  ⬛ Box
                </n-button>
              </n-button-group>

              <!-- Pen controls -->
              <div v-if="activeTool === 'draw'" flex gap-2 items-center>
                <span text-xs>Color:</span>
                <input type="color" v-model="strokeColor" style="width: 28px; height: 28px; border: none; cursor: pointer" />
                <span text-xs>Size:</span>
                <n-input-number v-model:value="strokeWidth" size="tiny" :min="1" :max="20" style="width: 70px" />
              </div>

              <!-- Text controls -->
              <div v-if="activeTool === 'text'" flex gap-2 items-center>
                <n-input v-model:value="textToAdd" size="small" placeholder="Click canvas to place text" style="width: 150px" />
                <n-select
                  v-model:value="textFont"
                  size="small"
                  style="width: 130px"
                  :options="fontOptions"
                  virtual-scroll
                />
                <input type="color" v-model="fontColor" style="width: 28px; height: 28px; border: none; cursor: pointer" />
                <n-input-number v-model:value="fontSize" size="tiny" :min="10" :max="48" style="width: 70px" />
              </div>

              <div flex gap-2 items-center>
                <c-button size="small" variant="text" @click="undoLastAnnotation" :disabled="!canUndo">
                  ↩️ Undo
                </c-button>
                <c-button size="small" variant="text" @click="clearCurrentPageAnnotations">
                  🧹 Clear Page
                </c-button>
              </div>
            </div>
            <p text-xs text-slate-400 mb-2>
              💡 Click and drag directly on the page canvas below to draw, sign, or click to stamp text/whiteout.
            </p>
          </n-tab-pane>

          <!-- Tab 2: Find & Replace Text -->
          <n-tab-pane name="replace" tab="🔍 Find & Replace Text">
            <c-alert type="warning" mb-3 data-test-id="pdf-overlay-warning">
              Visual overlay only: the original text remains in the PDF and can still be searched,
              copied or extracted. This is not permanent text removal or secure redaction.
              Do not use this operation to hide sensitive information.
            </c-alert>
            <div grid grid-cols-1 md:grid-cols-2 gap-3 mb-3>
              <n-form-item label="Original Text to Find">
                <n-input v-model:value="searchText" placeholder="Word or phrase to find..." />
              </n-form-item>
              <n-form-item label="New Replacement Text">
                <n-input v-model:value="replacementText" placeholder="New text..." />
              </n-form-item>
            </div>

            <div flex flex-wrap gap-4 items-center mb-4 p-3 rounded-lg border border-slate-200 bg-slate-50>
              <div flex items-center gap-2>
                <span text-xs font-semibold>Scope:</span>
                <n-radio-group v-model:value="replaceScope" size="small">
                  <n-radio-button value="current">Current Page ({{ currentPage }})</n-radio-button>
                  <n-radio-button value="all">All Pages</n-radio-button>
                </n-radio-group>
              </div>

              <div flex items-center gap-2>
                <span text-xs font-semibold>Font:</span>
                <div flex flex-col gap-1>
                  <n-select
                    v-model:value="replaceFontFamily"
                    size="small"
                    style="width: 140px"
                    :options="fontOptions"
                    virtual-scroll
                  />
                  <n-button v-if="!isSystemFontsLoaded && supportsLocalFonts" size="tiny" type="primary" dashed @click="loadSystemFonts">
                    Load System Fonts
                  </n-button>
                </div>
              </div>

              <div flex items-center gap-2>
                <span text-xs font-semibold>Color:</span>
                <input type="color" v-model="replaceTextColor" style="width: 28px; height: 28px; border: none; cursor: pointer" />
              </div>

              <div flex items-center gap-2>
                <n-checkbox v-model:checked="autoMatchSize">
                  Auto-match original font size
                </n-checkbox>
                <n-input-number
                  v-if="!autoMatchSize"
                  v-model:value="customReplaceFontSize"
                  size="tiny"
                  :min="8"
                  :max="36"
                  style="width: 70px"
                />
              </div>
            </div>

            <c-button :disabled="isReplacing" @click="executeFindAndReplace">
              <n-spin v-if="isReplacing" size="small" mr-2 />
              {{ isReplacing ? 'Applying overlay...' : `Apply Visual Overlay to ${replaceScope === 'current' ? 'Current Page' : 'All Pages'}` }}
            </c-button>
          </n-tab-pane>
        </n-tabs>
      </c-card>

      <!-- Page Viewer & Canvas Area -->
      <c-card mb-4>
        <!-- Page Navigation Bar -->
        <div flex justify-between items-center mb-4 flex-wrap gap-2>
          <div flex gap-2 items-center>
            <c-button size="small" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">
              ◀ Prev Page
            </c-button>
            <span text-sm font-semibold>Page {{ currentPage }} of {{ totalPages }}</span>
            <c-button size="small" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">
              Next Page ▶
            </c-button>
          </div>

          <div flex gap-2 items-center>
            <c-button size="small" @click="zoomScale = Math.max(0.8, zoomScale - 0.2); renderPage(currentPage)">
              ➖ Zoom Out
            </c-button>
            <span text-xs>{{ Math.round(zoomScale * 100) }}%</span>
            <c-button size="small" @click="zoomScale = Math.min(2.0, zoomScale + 0.2); renderPage(currentPage)">
              ➕ Zoom In
            </c-button>

            <c-button :disabled="isSaving" @click="saveAndDownload">
              <n-spin v-if="isSaving" size="small" mr-2 />
              💾 Save & Download PDF
            </c-button>
          </div>
        </div>

        <c-alert type="warning" mb-3 data-test-id="pdf-download-safety-warning">
          Before sharing: this download retains original text under visual edits and covering marks.
          It is not a securely redacted document.
        </c-alert>
        <!-- Document Canvas Container -->
        <div
          class="canvas-viewport"
          style="position: relative; overflow: auto; max-height: 750px; display: flex; justify-content: center; background: #0B0B18; border-radius: 8px; padding: 16px"
        >
          <div style="position: relative; box-shadow: 0 4px 20px rgba(0,0,0,0.5)">
            <!-- Base PDF Render Canvas -->
            <canvas ref="pdfCanvasRef" style="display: block; background: #ffffff"></canvas>

            <!-- Interactive Text Layer (Click to edit text directly) -->
            <div
              v-if="isInteractiveTextMode"
              style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none"
            >
              <div
                v-for="item in currentPageTextItems"
                :key="item.id"
                class="interactive-text-item"
                :style="{
                  position: 'absolute',
                  left: `${item.tx}px`,
                  top: `${item.ty}px`,
                  width: `${item.width}px`,
                  height: `${item.height}px`,
                  pointerEvents: activeTool === 'select' ? 'auto' : 'none',
                  cursor: 'pointer',
                }"
                @click="openTextEditor(item)"
              >
                <div class="hover-outline"></div>
              </div>
            </div>

            <!-- Overlay Drawing/Annotation Canvas -->
            <canvas
              ref="drawCanvasRef"
              style="position: absolute; top: 0; left: 0; touch-action: none"
              :style="{
                cursor: activeTool === 'select' ? 'default' : 'crosshair',
                pointerEvents: activeTool === 'select' ? 'none' : 'auto',
              }"
              @mousedown="startDraw"
              @mousemove="onDraw"
              @mouseup="stopDraw"
              @mouseleave="stopDraw"
            ></canvas>
          </div>
        </div>
      </c-card>

      <!-- Direct Text Edit Modal -->
      <n-modal v-model:show="showEditModal" preset="card" title="✏️ Edit PDF Text Layer" style="max-width: 500px">
        <div v-if="selectedTextItem">
          <div mb-3>
            <span text-xs text-slate-500>Original Text:</span>
            <div p-2 mt-1 rounded bg-slate-100 border border-slate-200 text-slate-800 text-sm font-mono dir="auto">
              {{ normalizeExtractedText(selectedTextItem.str) }}
            </div>
          </div>

          <n-form-item label="New Text:">
            <n-input v-model:value="editTextValue" placeholder="Type new text here..." dir="auto" />
          </n-form-item>

          <div v-if="selectedTextItem?.fontFamily || selectedTextItem?.fontName" mb-3 p-3 bg-blue-50 rounded border border-blue-200>
            <div flex items-start gap-2>
              <div text-blue-500 text-lg>💡</div>
              <div text-xs text-blue-800 leading-relaxed>
                <span font-semibold block mb-1>تم اكتشاف خط: {{ selectedTextItem.fontFamily || selectedTextItem.fontName }}</span>
                بناءً على الخط الأصلي، تم تحديد أقرب خط متاح لك تلقائياً للحفاظ على شكل المستند.
              </div>
            </div>
          </div>

          <div grid grid-cols-3 gap-3 mb-4>
            <n-form-item label="Font Style:">
              <div flex flex-col gap-1 w-full>
                <n-select
                  v-model:value="editTextFont"
                  size="small"
                  :options="fontOptions"
                  virtual-scroll
                />
                <n-button v-if="!isSystemFontsLoaded && supportsLocalFonts" size="tiny" type="primary" dashed @click="loadSystemFonts">
                  Load Local Fonts
                </n-button>
              </div>
            </n-form-item>

            <n-form-item label="Font Size:">
              <n-input-number v-model:value="editTextFontSize" size="small" :min="6" :max="72" />
            </n-form-item>

            <n-form-item label="Color:">
              <input type="color" v-model="editTextColor" class="w-full h-8 cursor-pointer rounded" />
            </n-form-item>
          </div>

          <div flex justify-end gap-2>
            <n-button @click="showEditModal = false">Cancel</n-button>
            <n-button type="primary" @click="applyDirectTextEdit">Update Text</n-button>
          </div>
        </div>
      </n-modal>
    </template>

    <!-- SEO Rich Content Section -->
    <div mt-12 mb-8 style="max-width: 900px; margin-left: auto; margin-right: auto; line-height: 1.6; color: var(--n-text-color-3)">
      <h2 text-xl font-bold mb-4 style="color: var(--n-text-color-1)">The Best Free PDF Editor Online</h2>
      <p mb-4>
        Welcome to the most advanced, 100% free client-side PDF editor. Unlike other services, <strong>we never upload your PDF files to our servers</strong>. All processing, text editing, and PDF manipulation happens securely inside your own web browser, ensuring your private and confidential documents remain yours alone.
      </p>

      <h3 text-lg font-bold mt-6 mb-2 style="color: var(--n-text-color-1)">Advanced Features & Arabic Support</h3>
      <ul style="list-style-type: disc; padding-left: 20px;" mb-4>
        <li mb-2><strong>Direct Text Editing:</strong> Click any text in your PDF to instantly modify it. We detect the original font and offer the closest match.</li>
        <li mb-2><strong>Full Arabic & RTL Support:</strong> Seamlessly edit, find, and replace Arabic text. The editor handles complex BiDi shaping, ligatures, and right-to-left logical rendering perfectly.</li>
        <li mb-2><strong>Local System Fonts:</strong> Load your own installed operating system fonts (like Times New Roman, Arial, Cairo) directly into the browser to match the PDF's native typography perfectly.</li>
        <li mb-2><strong>Visual text overlays:</strong> Cover words visually and add replacement text. The original text remains extractable. This is not secure redaction.</li>
        <li mb-2><strong>Sign & Markup:</strong> Add electronic signatures, draw with the pen tool, or insert text boxes and whiteouts anywhere on the page.</li>
      </ul>

      <h3 text-lg font-bold mt-6 mb-2 style="color: var(--n-text-color-1)">Why use our Client-Side PDF Editor?</h3>
      <p>
        Most free PDF editors require you to upload your sensitive documents to a third-party cloud server, putting your data privacy at risk. DevTol's PDF Editor utilizes modern WebAssembly (WASM) and HTML5 Canvas technologies to decode, render, and repackage your PDF entirely on your machine. This guarantees zero data transmission, blazing fast performance, and no file size limits.
      </p>
    </div>
  </div>
</template>

<style scoped lang="less">
.canvas-viewport {
  border: 1px solid var(--n-border-color);
}

.interactive-text-item {
  position: absolute;
  transition: background 0.15s ease;

  &:hover .hover-outline {
    border: 1px dashed #38bdf8;
    background-color: rgba(56, 189, 248, 0.15);
    width: 100%;
    height: 100%;
    border-radius: 2px;
  }
}
</style>
