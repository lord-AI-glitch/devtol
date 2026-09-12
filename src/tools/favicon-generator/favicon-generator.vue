<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const activeTab = ref("upload");
const file = ref<File|null>(null);
const imgUrl = ref("");
const letterText = ref("A");
const bgColor = ref("#4F9CFF");
const textColor = ref("#FFFFFF");
const sizes = [16,32,48,96,128,180,192,256,512];
const previews = ref<{size:number;url:string}[]>([]);
const isProcessing = ref(false);
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f){file.value=f;imgUrl.value=URL.createObjectURL(f);previews.value=[];}}
async function drawSize(src:HTMLImageElement|null,size:number):Promise<string>{
  const c=document.createElement("canvas");c.width=size;c.height=size;
  const ctx=c.getContext("2d")!;
  if(src){ctx.drawImage(src,0,0,size,size);}
  else{
    ctx.fillStyle=bgColor.value;ctx.fillRect(0,0,size,size);
    ctx.fillStyle=textColor.value;ctx.font=`bold ${Math.round(size*0.55)}px Arial`;
    ctx.textAlign="center";ctx.textBaseline="middle";ctx.fillText(letterText.value[0]||"A",size/2,size/2);
  }
  return c.toDataURL("image/png");
}
async function generate(){
  isProcessing.value=true;previews.value=[];
  try{
    let img:HTMLImageElement|null=null;
    if(activeTab.value==="upload"&&imgUrl.value){img=new Image();img.src=imgUrl.value;await new Promise(r=>img!.onload=r);}
    previews.value=await Promise.all(sizes.map(async s=>({size:s,url:await drawSize(img,s)})));
    message.success("All icon sizes generated!");
  }catch(e:any){message.error(e.message);}
  finally{isProcessing.value=false;}
}
async function downloadAll(){
  if(!previews.value.length)return;
  const JSZip=(await import("https://cdn.skypack.dev/jszip")).default;
  const zip=new JSZip();
  const folder=zip.folder("favicons")!;
  for(const{size,url}of previews.value){
    const b64=url.split(",")[1];
    folder.file(`favicon-${size}x${size}.png`,b64,{base64:true});
  }
  folder.file("index.html",`<!-- Add to <head> -->\n<link rel="icon" sizes="32x32" href="favicon-32x32.png">\n<link rel="icon" sizes="16x16" href="favicon-16x16.png">\n<link rel="apple-touch-icon" sizes="180x180" href="favicon-180x180.png">\n<link rel="icon" sizes="192x192" href="favicon-192x192.png">\n<link rel="icon" sizes="512x512" href="favicon-512x512.png">`);
  const blob=await zip.generateAsync({type:"blob"});
  const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download="favicons.zip";a.click();
}
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <n-tabs v-model:value="activeTab" type="card" mb-4>
      <n-tab-pane name="upload" tab="📁 Upload Image">
        <c-card>
          <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
            <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select image (square recommended)' }}</p>
            <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile"/>
          </div>
        </c-card>
      </n-tab-pane>
      <n-tab-pane name="text" tab="✏️ Text Icon">
        <c-card>
          <n-form-item label="Letter/Text (1-2 chars)"><n-input v-model:value="letterText" maxlength="2" style="width:100px;font-size:24px;font-weight:bold"/></n-form-item>
          <n-form-item label="Background Color"><n-color-picker v-model:value="bgColor" :show-alpha="false"/></n-form-item>
          <n-form-item label="Text Color"><n-color-picker v-model:value="textColor" :show-alpha="false"/></n-form-item>
        </c-card>
      </n-tab-pane>
    </n-tabs>
    <div flex gap-2 mb-4>
      <c-button :disabled="isProcessing" @click="generate">
        <n-spin v-if="isProcessing" size="small" mr-2/>Generate All Sizes
      </c-button>
    </div>
    <c-card v-if="previews.length>0" title="Generated Icons">
      <c-button mb-4 @click="downloadAll">Download All as ZIP</c-button>
      <div flex flex-wrap gap-3>
        <div v-for="p in previews" :key="p.size" style="text-align:center">
          <img :src="p.url" :style="{width:Math.min(p.size,64)+'px',height:Math.min(p.size,64)+'px',border:'1px solid var(--n-border-color)',borderRadius:'6px'}"/>
          <p style="font-size:11px;margin-top:4px">{{ p.size }}px</p>
        </div>
      </div>
    </c-card>
  </div>
</template>
