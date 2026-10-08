<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
import { PDFDocument, rgb, StandardFonts, degrees } from "pdf-lib";
const message = useMessage();
const file = ref<File|null>(null);
const text = ref("CONFIDENTIAL");
const opacity = ref(30);
const fontSize = ref(48);
const position = ref("center");
const isProcessing = ref(false);
const resultUrl = ref<string|null>(null);
const posOptions=[{label:"Center Diagonal",value:"center"},{label:"Top",value:"top"},{label:"Bottom",value:"bottom"},{label:"Tiled",value:"tiled"}];
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f)file.value=f;}
async function addWatermark(){
  if(!file.value||!text.value){message.warning("Upload PDF and enter watermark text");return;}
  isProcessing.value=true;resultUrl.value=null;
  try{
    const bytes=await file.value.arrayBuffer();
    const doc=await PDFDocument.load(bytes);
    const font=await doc.embedFont(StandardFonts.HelveticaBold);
    const alpha=opacity.value/100;
    for(const page of doc.getPages()){
      const {width,height}=page.getSize();
      const textWidth=font.widthOfTextAtSize(text.value,fontSize.value);
      if(position.value==="center"||position.value==="tiled"){
        const x=width/2-textWidth/2;
        const y=height/2;
        page.drawText(text.value,{x,y,size:fontSize.value,font,color:rgb(0.7,0.7,0.7),opacity:alpha,rotate:degrees(position.value==="center"?-45:0)});
        if(position.value==="tiled"){
          for(let ty=100;ty<height;ty+=120)
            for(let tx=0;tx<width;tx+=textWidth+40)
              page.drawText(text.value,{x:tx,y:ty,size:fontSize.value*0.6,font,color:rgb(0.75,0.75,0.75),opacity:alpha*0.6,rotate:degrees(-30)});
        }
      }else if(position.value==="top"){
        page.drawText(text.value,{x:width/2-textWidth/2,y:height-fontSize.value-20,size:fontSize.value,font,color:rgb(0.7,0.7,0.7),opacity:alpha});
      }else{
        page.drawText(text.value,{x:width/2-textWidth/2,y:20,size:fontSize.value,font,color:rgb(0.7,0.7,0.7),opacity:alpha});
      }
    }
    const out=await doc.save();
    const blob=new Blob([out],{type:"application/pdf"});
    resultUrl.value=URL.createObjectURL(blob);
    message.success("Watermark added!");
  }catch(err:any){message.error(err?.message||"Failed");}
  finally{isProcessing.value=false;}
}
function download(){if(!resultUrl.value)return;const a=document.createElement("a");a.href=resultUrl.value;a.download="watermarked.pdf";a.click();}
</script>
<template>
  <div style="max-width:600px;margin:0 auto">
    <c-card title="Upload PDF" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select PDF' }}</p>
        <input ref="fi" type="file" accept=".pdf" style="display:none" @change="onFile"/>
      </div>
    </c-card>
    <c-card v-if="file" title="Watermark Settings" mb-4>
      <n-form-item label="Watermark Text"><n-input v-model:value="text" placeholder="e.g. CONFIDENTIAL"/></n-form-item>
      <n-form-item label="Font Size"><n-input-number v-model:value="fontSize" :min="12" :max="120"/></n-form-item>
      <n-form-item label="Position"><n-select v-model:value="position" :options="posOptions"/></n-form-item>
      <n-form-item label="Opacity: {{ opacity }}%"><n-slider v-model:value="opacity" :min="5" :max="100"/></n-form-item>
      <c-button :disabled="isProcessing" @click="addWatermark">
        <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? "Processing..." : "Add Watermark" }}
      </c-button>
    </c-card>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <div flex gap-2 items-center justify-between>
        <span>✅ Watermark added to all pages</span>
        <c-button @click="download">Download watermarked.pdf</c-button>
      </div>
    </c-card>
  </div>
</template>
