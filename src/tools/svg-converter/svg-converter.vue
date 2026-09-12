<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const activeTab = ref("upload");
const svgCode = ref(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">\n  <circle cx="50" cy="50" r="40" fill="#4F9CFF"/>\n  <text x="50" y="55" text-anchor="middle" font-size="24" fill="white">SVG</text>\n</svg>`);
const file = ref<File|null>(null);
const outFormat = ref("png");
const scale = ref(2);
const bgColor = ref("#ffffff");
const resultUrl = ref<string|null>(null);
const isProcessing = ref(false);
const formatOptions=[{label:"PNG",value:"png"},{label:"JPEG",value:"jpeg"},{label:"WebP",value:"webp"}];
const scaleOptions=[{label:"1x",value:1},{label:"2x",value:2},{label:"3x",value:3},{label:"4x",value:4}];
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;file.value=f;const reader=new FileReader();reader.onload=ev=>{svgCode.value=ev.target!.result as string;};reader.readAsText(f);}
async function convert(){
  isProcessing.value=true; resultUrl.value=null;
  try{
    const svg=svgCode.value;
    const blob=new Blob([svg],{type:"image/svg+xml"});
    const url=URL.createObjectURL(blob);
    const img=new Image(); img.src=url; await new Promise(r=>img.onload=r);
    const w=(img.naturalWidth||300)*scale.value; const h=(img.naturalHeight||300)*scale.value;
    const c=document.createElement("canvas"); c.width=w; c.height=h;
    const ctx=c.getContext("2d")!;
    if(outFormat.value==="jpeg"){ctx.fillStyle=bgColor.value;ctx.fillRect(0,0,w,h);}
    ctx.drawImage(img,0,0,w,h);
    const result=await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Conversion failed")),"image/"+outFormat.value,0.95));
    resultUrl.value=URL.createObjectURL(result);
    URL.revokeObjectURL(url);
    message.success("Converted successfully!");
  }catch(e:any){message.error(e.message);}
  finally{isProcessing.value=false;}
}
function download(){if(!resultUrl.value)return;const a=document.createElement("a");a.href=resultUrl.value;a.download=`converted.${outFormat.value}`;a.click();}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <n-tabs v-model:value="activeTab" type="card" mb-4>
      <n-tab-pane name="upload" tab="📁 Upload SVG File">
        <c-card>
          <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
            <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select .svg file' }}</p>
            <input ref="fi" type="file" accept=".svg,image/svg+xml" style="display:none" @change="onFile"/>
          </div>
        </c-card>
      </n-tab-pane>
      <n-tab-pane name="code" tab="💻 Paste SVG Code">
        <c-card><n-input type="textarea" v-model:value="svgCode" :rows="10" style="font-family:monospace;font-size:12px"/></c-card>
      </n-tab-pane>
    </n-tabs>
    <c-card title="Export Settings" mb-4>
      <n-grid :cols="3" :x-gap="12">
        <n-gi><n-form-item label="Format"><n-select v-model:value="outFormat" :options="formatOptions"/></n-form-item></n-gi>
        <n-gi><n-form-item label="Scale"><n-select v-model:value="scale" :options="scaleOptions"/></n-form-item></n-gi>
        <n-gi v-if="outFormat==='jpeg'"><n-form-item label="Background"><n-color-picker v-model:value="bgColor" :show-alpha="false"/></n-form-item></n-gi>
      </n-grid>
    </c-card>
    <c-button :disabled="isProcessing||!svgCode" mb-4 @click="convert">
      <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? "Converting..." : "Convert SVG" }}
    </c-button>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <img :src="resultUrl" style="max-width:100%;border-radius:6px;margin-bottom:12px"/>
      <c-button @click="download">Download .{{ outFormat }}</c-button>
    </c-card>
  </div>
</template>
