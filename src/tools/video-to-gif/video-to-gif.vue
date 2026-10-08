<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const file = ref<File|null>(null);
const videoUrl = ref("");
const startTime = ref(0);
const endTime = ref(5);
const width = ref(480);
const fps = ref(10);
const isProcessing = ref(false);
const progress = ref(0);
const resultUrl = ref<string|null>(null);
const fpsOptions=[{label:"5 FPS (small)",value:5},{label:"10 FPS (balanced)",value:10},{label:"15 FPS (smooth)",value:15}];
function onFile(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;
  file.value=f;videoUrl.value=URL.createObjectURL(f);resultUrl.value=null;
  endTime.value=5;
}
async function generate(){
  if(!file.value){message.warning("Upload a video first");return;}
  if(endTime.value-startTime.value>10){message.warning("Max duration is 10 seconds for performance");return;}
  isProcessing.value=true;progress.value=0;resultUrl.value=null;
  try{
    const video=document.createElement("video");
    video.src=videoUrl.value;video.muted=true;
    await new Promise(r=>{video.onloadedmetadata=r;});
    const duration=Math.min(endTime.value-startTime.value,10);
    const frames:ImageData[]=[];
    const canvas=document.createElement("canvas");
    const scale=width.value/video.videoWidth;
    canvas.width=width.value;canvas.height=Math.round(video.videoHeight*scale);
    const ctx=canvas.getContext("2d")!;
    const frameCount=Math.floor(duration*fps.value);
    const frameInterval=duration/frameCount;
    for(let i=0;i<frameCount;i++){
      video.currentTime=startTime.value+i*frameInterval;
      await new Promise(r=>{video.onseeked=r;});
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      frames.push(ctx.getImageData(0,0,canvas.width,canvas.height));
      progress.value=Math.round((i+1)/frameCount*80);
    }
    // Use gifenc for fast client-side GIF encoding
    const { GIFEncoder, quantize, applyPalette } = await import("https://esm.sh/gifenc@1.0.3");
    const gif = GIFEncoder();
    const delay = Math.round(1000 / fps.value);
    for (const frame of frames) {
      const palette = quantize(frame.data, 256);
      const index = applyPalette(frame.data, palette);
      gif.writeFrame(index, canvas.width, canvas.height, { palette, delay });
    }
    gif.finish();
    const bytes = gif.bytes();
    const blob = new Blob([bytes], { type: "image/gif" });
    resultUrl.value = URL.createObjectURL(blob);
    progress.value = 100;
    message.success("GIF created!");
  }catch(e:any){message.error(e?.message||"Failed to generate GIF. Try a shorter clip.");}
  finally{isProcessing.value=false;}
}
function download(){if(!resultUrl.value)return;const a=document.createElement("a");a.href=resultUrl.value;a.download="animated.gif";a.click();}
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload Video" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select MP4, WebM, or MOV' }}</p>
        <input ref="fi" type="file" accept="video/*" style="display:none" @change="onFile"/>
      </div>
      <video v-if="videoUrl" :src="videoUrl" controls style="width:100%;margin-top:12px;border-radius:6px"/>
    </c-card>
    <c-card v-if="file" title="GIF Settings" mb-4>
      <n-grid :cols="2" :x-gap="12">
        <n-gi><n-form-item label="Start Time (sec)"><n-input-number v-model:value="startTime" :min="0" :step="0.5" style="width:100%"/></n-form-item></n-gi>
        <n-gi><n-form-item label="End Time (sec, max +10)"><n-input-number v-model:value="endTime" :min="startTime+0.5" :step="0.5" style="width:100%"/></n-form-item></n-gi>
        <n-gi><n-form-item label="Output Width (px)"><n-input-number v-model:value="width" :min="100" :max="1280" :step="20" style="width:100%"/></n-form-item></n-gi>
        <n-gi><n-form-item label="Frame Rate"><n-select v-model:value="fps" :options="fpsOptions"/></n-form-item></n-gi>
      </n-grid>
      <c-alert type="info" mt-2 mb-3>Max 10 seconds. Longer clips significantly increase file size and processing time.</c-alert>
      <c-button :disabled="isProcessing" @click="generate">
        <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? `Generating GIF... ${progress}%` : 'Generate GIF' }}
      </c-button>
    </c-card>
    <n-progress v-if="isProcessing" type="line" :percentage="progress" mb-4/>
    <c-card v-if="resultUrl" style="border:1px solid var(--n-success-color)">
      <img :src="resultUrl" style="max-width:100%;border-radius:6px;margin-bottom:12px"/>
      <c-button @click="download">Download animated.gif</c-button>
    </c-card>
  </div>
</template>
