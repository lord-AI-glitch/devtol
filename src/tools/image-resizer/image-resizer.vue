<script setup lang="ts">
import { ref, computed } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const file = ref<File|null>(null);
const imgSrc = ref("");
const origW = ref(0); const origH = ref(0);
const newW = ref(0); const newH = ref(0);
const lockRatio = ref(true);
const cropX = ref(0); const cropY = ref(0); const cropW = ref(100); const cropH = ref(100);
const outFormat = ref("image/png");
const activeTab = ref("resize");
const resultUrl = ref<string|null>(null);
const isProcessing = ref(false);
const formatOptions=[{label:"PNG",value:"image/png"},{label:"JPEG",value:"image/jpeg"},{label:"WebP",value:"image/webp"}];
const aspectPresets=[{label:"Free",value:null},{label:"16:9",value:16/9},{label:"1:1",value:1},{label:"4:3",value:4/3},{label:"9:16",value:9/16},{label:"4:5",value:4/5}];
const selectedAspect = ref<number|null>(null);
async function onFile(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0]; if(!f)return; file.value=f;
  const url=URL.createObjectURL(f); imgSrc.value=url;
  const img=new Image(); img.src=url; await new Promise(r=>img.onload=r);
  origW.value=img.naturalWidth; origH.value=img.naturalHeight;
  newW.value=img.naturalWidth; newH.value=img.naturalHeight;
  cropW.value=img.naturalWidth; cropH.value=img.naturalHeight; resultUrl.value=null;
}
function onWChange(){if(lockRatio.value&&origW.value)newH.value=Math.round(newW.value*origH.value/origW.value);}
function onHChange(){if(lockRatio.value&&origH.value)newW.value=Math.round(newH.value*origW.value/origH.value);}
function applyAspect(ratio:number|null){
  selectedAspect.value=ratio;
  if(ratio&&origW.value){cropH.value=Math.min(origH.value,Math.round(cropW.value/ratio));}
}
async function process(){
  if(!file.value)return; isProcessing.value=true;
  try{
    const img=new Image(); img.src=imgSrc.value; await new Promise(r=>img.onload=r);
    const c=document.createElement("canvas");
    if(activeTab.value==="resize"){c.width=newW.value;c.height=newH.value;c.getContext("2d")!.drawImage(img,0,0,newW.value,newH.value);}
    else{c.width=cropW.value;c.height=cropH.value;c.getContext("2d")!.drawImage(img,cropX.value,cropY.value,cropW.value,cropH.value,0,0,cropW.value,cropH.value);}
    const blob=await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Failed")),outFormat.value,0.92));
    resultUrl.value=URL.createObjectURL(blob);
    message.success("Image processed!");
  }catch(e:any){message.error(e.message);}
  finally{isProcessing.value=false;}
}
function download(){if(!resultUrl.value)return;const ext=outFormat.value.split("/")[1];const a=document.createElement("a");a.href=resultUrl.value;a.download=`image.${ext}`;a.click();}
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload Image" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? `${file.name} (${origW}x${origH})` : 'Click to select image' }}</p>
        <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <n-tabs v-if="file" v-model:value="activeTab" type="card" mb-4>
      <n-tab-pane name="resize" tab="📐 Resize">
        <c-card>
          <n-form-item label="Width (px)"><n-input-number v-model:value="newW" :min="1" :max="10000" @update:value="onWChange" style="width:180px"/></n-form-item>
          <n-form-item label="Height (px)"><n-input-number v-model:value="newH" :min="1" :max="10000" @update:value="onHChange" style="width:180px"/></n-form-item>
          <n-form-item><n-checkbox v-model:checked="lockRatio" label="Lock aspect ratio"/></n-form-item>
        </c-card>
      </n-tab-pane>
      <n-tab-pane name="crop" tab="✂️ Crop">
        <c-card>
          <p mb-2 text-sm style="color:var(--n-text-color-3)">Aspect Ratio Presets:</p>
          <div flex gap-2 mb-3 flex-wrap>
            <c-button v-for="p in aspectPresets" :key="String(p.value)" size="small" :variant="selectedAspect===p.value?'filled':'ghost'" @click="applyAspect(p.value)">{{ p.label }}</c-button>
          </div>
          <n-grid :cols="2" :x-gap="12">
            <n-gi><n-form-item label="X"><n-input-number v-model:value="cropX" :min="0" :max="origW" style="width:100%"/></n-form-item></n-gi>
            <n-gi><n-form-item label="Y"><n-input-number v-model:value="cropY" :min="0" :max="origH" style="width:100%"/></n-form-item></n-gi>
            <n-gi><n-form-item label="Width"><n-input-number v-model:value="cropW" :min="1" :max="origW" style="width:100%"/></n-form-item></n-gi>
            <n-gi><n-form-item label="Height"><n-input-number v-model:value="cropH" :min="1" :max="origH" style="width:100%"/></n-form-item></n-gi>
          </n-grid>
        </c-card>
      </n-tab-pane>
    </n-tabs>
    <c-card v-if="file" title="Output Format" mb-4>
      <n-select v-model:value="outFormat" :options="formatOptions" style="width:160px"/>
    </c-card>
    <c-button v-if="file" :disabled="isProcessing" mb-4 @click="process">
      <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? "Processing..." : activeTab==="resize" ? "Resize Image" : "Crop Image" }}
    </c-button>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <img :src="resultUrl" style="max-width:100%;border-radius:6px;margin-bottom:12px"/>
      <c-button @click="download">Download</c-button>
    </c-card>
  </div>
</template>
