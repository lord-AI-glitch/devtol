<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const file = ref<File|null>(null);
const lang = ref("eng");
const isProcessing = ref(false);
const progress = ref(0);
const result = ref("");
const confidence = ref(0);
const langOptions=[{label:"English",value:"eng"},{label:"Arabic",value:"ara"},{label:"French",value:"fra"},{label:"German",value:"deu"},{label:"Spanish",value:"spa"},{label:"Chinese (Simplified)",value:"chi_sim"}];
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f){file.value=f;result.value="";}}
function dataURLtoUrl(f:File):Promise<string>{return new Promise(r=>{const reader=new FileReader();reader.onload=e=>r(e.target!.result as string);reader.readAsDataURL(f);});}
async function runOCR(){
  if(!file.value)return;
  isProcessing.value=true;result.value="";progress.value=0;
  try{
    const Tesseract=await import("https://cdn.jsdelivr.net/npm/tesseract.js@5/dist/tesseract.esm.min.js");
    const r=await Tesseract.recognize(file.value,lang.value,{logger:(m:any)=>{if(m.status==="recognizing text")progress.value=Math.round(m.progress*100);}});
    result.value=r.data.text.trim();
    confidence.value=Math.round(r.data.confidence);
    message.success(`OCR complete! Confidence: ${confidence.value}%`);
  }catch(e:any){message.error(e?.message||"OCR failed");}
  finally{isProcessing.value=false;}
}
function copy(){navigator.clipboard.writeText(result.value);message.success("Copied!");}
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload Image" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:32px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select image (PNG, JPG, WebP, TIFF)' }}</p>
        <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="Settings" mb-4>
      <n-form-item label="Language"><n-select v-model:value="lang" :options="langOptions" style="width:220px"/></n-form-item>
      <c-button :disabled="isProcessing" @click="runOCR">
        <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? `Recognizing... ${progress}%` : "Extract Text" }}
      </c-button>
    </c-card>
    <n-progress v-if="isProcessing" type="line" :percentage="progress" mb-4/>
    <c-card v-if="result" title="Extracted Text">
      <div flex justify-between items-center mb-2>
        <n-tag :type="confidence>80?'success':confidence>60?'warning':'error'">Confidence: {{ confidence }}%</n-tag>
        <c-button size="small" @click="copy">Copy</c-button>
      </div>
      <n-input type="textarea" :value="result" readonly :rows="12" style="font-size:14px"/>
    </c-card>
  </div>
</template>
