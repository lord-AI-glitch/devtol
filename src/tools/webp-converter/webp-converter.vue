<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const mode = ref<"webp-to"|"to-webp">("webp-to");
const file = ref<File|null>(null);
const outFormat = ref("png");
const outFormatOptions=[{label:"PNG",value:"png"},{label:"JPEG",value:"jpeg"}];
const quality = ref(85);
const resultUrl = ref<string|null>(null);
const isProcessing = ref(false);
const modeOptions=[{label:"WebP → PNG/JPG",value:"webp-to"},{label:"PNG/JPG → WebP",value:"to-webp"}];
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f){file.value=f;resultUrl.value=null;}}
async function convert(){
  if(!file.value)return; isProcessing.value=true;
  try{
    const img=new Image(); img.src=URL.createObjectURL(file.value);
    await new Promise(r=>img.onload=r);
    const c=document.createElement("canvas"); c.width=img.naturalWidth; c.height=img.naturalHeight;
    c.getContext("2d")!.drawImage(img,0,0);
    const fmt=mode.value==="webp-to"?"image/"+outFormat.value:"image/webp";
    const blob=await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Conversion failed")),fmt,quality.value/100));
    resultUrl.value=URL.createObjectURL(blob);
    message.success("Converted!");
  }catch(e:any){message.error(e.message);}
  finally{isProcessing.value=false;}
}
function download(){
  if(!resultUrl.value)return;
  const ext=mode.value==="webp-to"?outFormat.value:"webp";
  const a=document.createElement("a");a.href=resultUrl.value;a.download=`converted.${ext}`;a.click();
}
</script>
<template>
  <div style="max-width:600px;margin:0 auto">
    <c-card title="Conversion Mode" mb-4>
      <n-radio-group v-model:value="mode">
        <n-radio-button v-for="m in modeOptions" :key="m.value" :value="m.value" :label="m.label"/>
      </n-radio-group>
    </c-card>
    <c-card title="Upload Image" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : mode==="webp-to" ? "Click to select WebP image" : "Click to select PNG/JPG image" }}</p>
        <input ref="fi" type="file" :accept="mode==='webp-to'?'image/webp':'image/png,image/jpeg'" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="Settings" mb-4>
      <n-form-item v-if="mode==='webp-to'" label="Output Format"><n-select v-model:value="outFormat" :options="outFormatOptions" style="width:140px"/></n-form-item>
      <n-form-item :label="`Quality: ${quality}%`"><n-slider v-model:value="quality" :min="10" :max="100"/></n-form-item>
      <c-button :disabled="isProcessing" @click="convert">
        <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? "Converting..." : "Convert" }}
      </c-button>
    </c-card>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <img :src="resultUrl" style="max-width:100%;border-radius:6px;margin-bottom:12px"/>
      <c-button @click="download">Download</c-button>
    </c-card>
  </div>
</template>
