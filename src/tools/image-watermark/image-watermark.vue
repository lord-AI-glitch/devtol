<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const file = ref<File|null>(null);
const imgUrl = ref("");
const watermarkText = ref("© My Brand");
const fontSize = ref(36);
const opacity = ref(60);
const position = ref("br");
const textColor = ref("#ffffff");
const resultUrl = ref<string|null>(null);
const isProcessing = ref(false);
const positionOptions=[
  {label:"Top Left",value:"tl"},{label:"Top Center",value:"tc"},{label:"Top Right",value:"tr"},
  {label:"Middle Left",value:"ml"},{label:"Center",value:"mc"},{label:"Middle Right",value:"mr"},
  {label:"Bottom Left",value:"bl"},{label:"Bottom Center",value:"bc"},{label:"Bottom Right (default)",value:"br"},
  {label:"Tiled",value:"tiled"},
];
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f){file.value=f;imgUrl.value=URL.createObjectURL(f);resultUrl.value=null;}}
async function apply(){
  if(!file.value){message.warning("Upload an image first");return;}
  isProcessing.value=true;
  try{
    const img=new Image();img.src=imgUrl.value;await new Promise(r=>img.onload=r);
    const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext("2d")!;
    ctx.drawImage(img,0,0);
    ctx.globalAlpha=opacity.value/100;
    ctx.fillStyle=textColor.value;
    ctx.font=`bold ${fontSize.value}px Arial`;
    ctx.textBaseline="bottom";
    const tw=ctx.measureText(watermarkText.value).width;
    const th=fontSize.value;
    const pad=16;
    const positions:Record<string,[number,number]>={
      tl:[pad,pad+th],tc:[c.width/2-tw/2,pad+th],tr:[c.width-tw-pad,pad+th],
      ml:[pad,c.height/2],mc:[c.width/2-tw/2,c.height/2],mr:[c.width-tw-pad,c.height/2],
      bl:[pad,c.height-pad],bc:[c.width/2-tw/2,c.height-pad],br:[c.width-tw-pad,c.height-pad],
    };
    if(position.value==="tiled"){
      for(let y=th+pad;y<c.height;y+=th*3)
        for(let x=pad;x<c.width;x+=tw+60)
          ctx.fillText(watermarkText.value,x,y);
    }else{
      const[x,y]=positions[position.value]||positions.br;
      ctx.fillText(watermarkText.value,x,y);
    }
    const blob=await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Failed")),"image/png",1));
    resultUrl.value=URL.createObjectURL(blob);
    message.success("Watermark applied!");
  }catch(e:any){message.error(e.message);}
  finally{isProcessing.value=false;}
}
function download(){if(!resultUrl.value)return;const a=document.createElement("a");a.href=resultUrl.value;a.download="watermarked.png";a.click();}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <c-card title="Upload Image" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select image' }}</p>
        <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="Watermark Settings" mb-4>
      <n-form-item label="Watermark Text"><n-input v-model:value="watermarkText"/></n-form-item>
      <n-form-item label="Font Size"><n-input-number v-model:value="fontSize" :min="8" :max="200"/></n-form-item>
      <n-form-item label="Text Color"><n-color-picker v-model:value="textColor" :show-alpha="false"/></n-form-item>
      <n-form-item :label="`Opacity: ${opacity}%`"><n-slider v-model:value="opacity" :min="5" :max="100"/></n-form-item>
      <n-form-item label="Position"><n-select v-model:value="position" :options="positionOptions"/></n-form-item>
      <c-button :disabled="isProcessing" @click="apply">
        <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? "Applying..." : "Apply Watermark" }}
      </c-button>
    </c-card>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <img :src="resultUrl" style="max-width:100%;border-radius:6px;margin-bottom:12px"/>
      <c-button @click="download">Download Watermarked</c-button>
    </c-card>
  </div>
</template>
