<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { loadPdfJs } from "@/utils/loadPdfJs";
import { createZipBlob } from "@/utils/zip";

const message = useMessage();
const file = ref<File|null>(null);
const format = ref<"png"|"jpeg">("png");
const isProcessing = ref(false);
const progress = ref(0);
const previews = ref<string[]>([]);
async function onFile(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0]; if(!f)return;
  file.value=f; previews.value=[];
}
async function convert(){
  if(!file.value)return;
  isProcessing.value=true; progress.value=0; previews.value=[];
  try{
    const pdfjsLib = await loadPdfJs();
    const bytes=await file.value.arrayBuffer();
    const pdf=await pdfjsLib.getDocument({data:bytes}).promise;
    const imgs:string[]=[];
    for(let i=1;i<=pdf.numPages;i++){
      const page=await pdf.getPage(i);
      const vp=page.getViewport({scale:2});
      const canvas=document.createElement("canvas");
      canvas.width=vp.width; canvas.height=vp.height;
      await page.render({canvasContext:canvas.getContext("2d")!,viewport:vp}).promise;
      imgs.push(canvas.toDataURL("image/"+format.value,0.92));
      progress.value=Math.round(i/pdf.numPages*100);
    }
    previews.value=imgs;
    message.success(`Converted ${pdf.numPages} pages!`);
  }catch(err:any){message.error(err?.message||"Conversion failed");}
  finally{isProcessing.value=false;}
}
async function downloadAll(){
  if(previews.value.length===0)return;
  const files = previews.value.map((d, i) => {
    const b64 = d.split(",")[1];
    const binStr = atob(b64);
    const u8 = new Uint8Array(binStr.length);
    for (let j = 0; j < binStr.length; j++) u8[j] = binStr.charCodeAt(j);
    return {
      name: `page-${String(i+1).padStart(3,"0")}.${format.value}`,
      data: u8
    };
  });
  const blob = createZipBlob(files);
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "pdf-pages.zip";
  a.click();
}
function downloadOne(dataUrl:string,i:number){
  const a=document.createElement("a");a.href=dataUrl;a.download=`page-${i+1}.${format.value}`;a.click();
}
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload PDF" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:32px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select PDF' }}</p>
        <input ref="fi" type="file" accept=".pdf" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="Settings" mb-4>
      <div flex gap-4 items-center mb-4>
        <span>Output Format:</span>
        <n-radio-group v-model:value="format">
          <n-radio value="png">PNG</n-radio>
          <n-radio value="jpeg">JPG</n-radio>
        </n-radio-group>
      </div>
      <c-button :disabled="isProcessing" @click="convert">
        <n-spin v-if="isProcessing" size="small" mr-2/>
        {{ isProcessing ? `Converting... ${progress}%` : 'Convert to Images' }}
      </c-button>
    </c-card>
    <n-progress v-if="isProcessing" type="line" :percentage="progress" mb-4/>
    <c-card v-if="previews.length>0" title="Pages">
      <c-button mb-4 @click="downloadAll">Download All as ZIP</c-button>
      <n-grid :cols="3" :x-gap="8" :y-gap="8">
        <n-gi v-for="(img,i) in previews" :key="i">
          <div style="border:1px solid var(--n-border-color);border-radius:6px;overflow:hidden;cursor:pointer" @click="downloadOne(img,i)">
            <img :src="img" style="width:100%;display:block"/>
            <p style="text-align:center;font-size:11px;padding:4px">Page {{i+1}}</p>
          </div>
        </n-gi>
      </n-grid>
    </c-card>
  </div>
</template>
