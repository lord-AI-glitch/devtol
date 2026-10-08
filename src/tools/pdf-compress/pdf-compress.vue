<script setup lang="ts">
import { ref, computed } from "vue";
import { useMessage } from "naive-ui";
import { PDFDocument } from "pdf-lib";
import { loadPdfJs } from "@/utils/loadPdfJs";
const message = useMessage();
const file = ref<File|null>(null);
const quality = ref(70);
const isProcessing = ref(false);
const original = ref<{size:number;url:string}|null>(null);
const result = ref<{size:number;url:string}|null>(null);
const savings = computed(()=>{
  if(!original.value||!result.value) return 0;
  return Math.round((1-result.value.size/original.value.size)*100);
});
function fmt(b:number){return b<1048576?(b/1024).toFixed(1)+' KB':(b/1048576).toFixed(2)+' MB';}
async function onFile(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0];
  if(!f)return;
  file.value=f;
  original.value={size:f.size,url:URL.createObjectURL(f)};
  result.value=null;
}
async function compress(){
  if(!file.value)return;
  isProcessing.value=true;
  try{
    // Load pdfjs to render pages to canvas at lower quality
    const pdfjsLib = await loadPdfJs();
    const bytes=await file.value.arrayBuffer();
    const pdfDoc=await pdfjsLib.getDocument({data:bytes}).promise;
    const newPdf=await PDFDocument.create();
    const canvas=document.createElement('canvas');
    const ctx=canvas.getContext('2d')!;
    const scale=quality.value/100*1.5+0.5;
    for(let i=1;i<=pdfDoc.numPages;i++){
      const page=await pdfDoc.getPage(i);
      const vp=page.getViewport({scale});
      canvas.width=vp.width; canvas.height=vp.height;
      await page.render({canvasContext:ctx,viewport:vp}).promise;
      const dataUrl=canvas.toDataURL('image/jpeg',quality.value/100);
      const imgBytes=Uint8Array.from(atob(dataUrl.split(',')[1]),c=>c.charCodeAt(0));
      const img=await newPdf.embedJpg(imgBytes);
      const p=newPdf.addPage([vp.width/scale,vp.height/scale]);
      p.drawImage(img,{x:0,y:0,width:vp.width/scale,height:vp.height/scale});
    }
    const out=await newPdf.save();
    const blob=new Blob([out],{type:'application/pdf'});
    result.value={size:blob.size,url:URL.createObjectURL(blob)};
    message.success('PDF compressed!');
  }catch(err:any){message.error(err?.message||'Compression failed');}
  finally{isProcessing.value=false;}
}
function download(){
  if(!result.value)return;
  const a=document.createElement('a');a.href=result.value.url;a.download='compressed.pdf';a.click();
}
</script>
<template>
  <div style="max-width:600px;margin:0 auto">
    <c-card title="Upload PDF" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:32px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select PDF' }}</p>
        <input ref="fi" type="file" accept=".pdf" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="Compression Settings" mb-4>
      <div mb-2 flex justify-between><span>Quality: {{ quality }}%</span><span text-xs style="color:var(--n-text-color-3)">Lower = smaller file</span></div>
      <n-slider v-model:value="quality" :min="10" :max="100" :step="5" mb-4/>
      <c-button :disabled="isProcessing" @click="compress">
        <n-spin v-if="isProcessing" size="small" mr-2/>
        {{ isProcessing ? 'Compressing...' : 'Compress PDF' }}
      </c-button>
    </c-card>
    <c-card v-if="result" title="Result">
      <n-grid :cols="2" :x-gap="16" mb-3>
        <n-gi><n-statistic label="Original Size" :value="fmt(original!.size)"/></n-gi>
        <n-gi><n-statistic label="Compressed Size" :value="fmt(result.size)"/></n-gi>
      </n-grid>
      <n-tag type="success" mb-3>Saved {{ savings }}%</n-tag>
      <br/>
      <c-button @click="download">Download compressed.pdf</c-button>
    </c-card>
  </div>
</template>
