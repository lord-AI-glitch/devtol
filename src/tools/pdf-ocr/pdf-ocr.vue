<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { loadPdfJs } from "@/utils/loadPdfJs";
const message = useMessage();
const file = ref<File|null>(null);
const lang = ref("eng");
const isProcessing = ref(false);
const progress = ref(0);
const result = ref("");
const langOptions = [
  {label:"English",value:"eng"},{label:"Arabic",value:"ara"},
  {label:"French",value:"fra"},{label:"German",value:"deu"},{label:"Spanish",value:"spa"}
];
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f)file.value=f;result.value="";}
async function runOCR(){
  if(!file.value)return;
  isProcessing.value=true;result.value="";progress.value=0;
  try{
    const Tesseract=await import("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js");
    let text="";
    if(file.value.type==="application/pdf"){
      const pdfjsLib = await loadPdfJs();
      const bytes=await file.value.arrayBuffer();
      const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
      for(let i=1;i<=pdf.numPages;i++){
        const page=await pdf.getPage(i);
        const vp=page.getViewport({scale:2});
        const canvas=document.createElement("canvas");
        canvas.width=vp.width;canvas.height=vp.height;
        await page.render({canvasContext:canvas.getContext("2d")!,viewport:vp}).promise;
        const r=await Tesseract.recognize(canvas,lang.value);
        text+="--- Page "+i+" ---\n"+r.data.text+"\n\n";
        progress.value=Math.round(i/pdf.numPages*100);
      }
    }else{
      const r=await Tesseract.recognize(file.value,lang.value,{logger:m=>{if(m.status==="recognizing text")progress.value=Math.round(m.progress*100);}});
      text=r.data.text;
    }
    result.value=text.trim();
    message.success("OCR complete!");
  }catch(err:any){message.error(err?.message||"OCR failed");}
  finally{isProcessing.value=false;}
}
function copy(){navigator.clipboard.writeText(result.value);message.success("Copied!");}
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload File (PDF or Image)" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select PDF or image' }}</p>
        <input ref="fi" type="file" accept=".pdf,image/*" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="OCR Settings" mb-4>
      <n-form-item label="Language">
        <n-select v-model:value="lang" :options="langOptions" style="width:200px"/>
      </n-form-item>
      <c-button :disabled="isProcessing" @click="runOCR">
        <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? `Running OCR... ${progress}%` : 'Extract Text' }}
      </c-button>
    </c-card>
    <n-progress v-if="isProcessing" type="line" :percentage="progress" mb-4/>
    <c-card v-if="result" title="Extracted Text">
      <div flex justify-end mb-2><c-button size="small" @click="copy">Copy Text</c-button></div>
      <n-input type="textarea" :value="result" readonly :rows="15" style="font-family:monospace;font-size:13px"/>
    </c-card>
  </div>
</template>
