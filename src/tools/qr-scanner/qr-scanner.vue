<script setup lang="ts">
import { ref, onUnmounted } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const activeTab = ref("upload");
const file = ref<File|null>(null);
const isScanning = ref(false);
const isProcessing = ref(false);
const result = ref<string|null>(null);
const resultType = ref("");
const videoRef = ref<HTMLVideoElement|null>(null);
const stream = ref<MediaStream|null>(null);
let scanInterval: ReturnType<typeof setInterval>|null=null;
function detectType(text:string):string{
  if(/^https?:\/\//i.test(text))return"URL";
  if(/^WIFI:/i.test(text))return"WiFi";
  if(/^BEGIN:VCARD/i.test(text))return"vCard";
  if(/^mailto:/i.test(text))return"Email";
  return"Text";
}
function onFile(e:Event){
  const f=(e.target as HTMLInputElement).files?.[0];if(!f)return;
  file.value=f;result.value=null;decodeFromFile(f);
}
async function decodeFromFile(f:File){
  isProcessing.value=true;
  try{
    const mod = await import("https://esm.sh/jsqr@1.4.0");
    const jsQR = (mod as any).default || mod;
    const img=new Image();img.src=URL.createObjectURL(f);await new Promise(r=>img.onload=r);
    const c=document.createElement("canvas");c.width=img.naturalWidth;c.height=img.naturalHeight;
    const ctx=c.getContext("2d")!;ctx.drawImage(img,0,0);
    const imageData=ctx.getImageData(0,0,c.width,c.height);
    const code=jsQR(imageData.data,imageData.width,imageData.height);
    if(code){result.value=code.data;resultType.value=detectType(code.data);message.success("QR Code decoded!");}
    else{message.warning("No QR code found in this image");}
  }catch(e:any){message.error(e?.message||"Failed to decode QR code");}
  finally{isProcessing.value=false;}
}
async function startCamera(){
  try{
    stream.value=await navigator.mediaDevices.getUserMedia({video:{facingMode:"environment"}});
    if(videoRef.value){videoRef.value.srcObject=stream.value;await videoRef.value.play();}
    isScanning.value=true;
    const mod = await import("https://esm.sh/jsqr@1.4.0");
    const jsQR = (mod as any).default || mod;
    const c=document.createElement("canvas");
    scanInterval=setInterval(()=>{
      if(!videoRef.value||videoRef.value.readyState!==4)return;
      c.width=videoRef.value.videoWidth;c.height=videoRef.value.videoHeight;
      const ctx=c.getContext("2d")!;ctx.drawImage(videoRef.value,0,0);
      const data=ctx.getImageData(0,0,c.width,c.height);
      const code=jsQR(data.data,data.width,data.height);
      if(code){result.value=code.data;resultType.value=detectType(code.data);stopCamera();message.success("QR Code scanned!");}
    },300);
  }catch{message.error("Camera access denied or not available");}
}
function stopCamera(){
  if(scanInterval)clearInterval(scanInterval);
  stream.value?.getTracks().forEach(t=>t.stop());
  isScanning.value=false;
}
onUnmounted(stopCamera);
function copy(){if(result.value){navigator.clipboard.writeText(result.value);message.success("Copied!");}}
</script>
<template>
  <div style="max-width:600px;margin:0 auto">
    <n-tabs v-model:value="activeTab" type="card" mb-4>
      <n-tab-pane name="upload" tab="📁 Scan from Image">
        <c-card>
          <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:32px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
            <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select image with QR code' }}</p>
            <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile"/>
          </div>
          <n-spin v-if="isProcessing" mt-3/>
        </c-card>
      </n-tab-pane>
      <n-tab-pane name="camera" tab="📷 Use Camera">
        <c-card>
          <div v-if="!isScanning" text-center>
            <c-button @click="startCamera">Start Camera Scanner</c-button>
          </div>
          <div v-else>
            <video ref="videoRef" style="width:100%;border-radius:8px;background:#000" playsinline/>
            <div mt-3 text-center><c-button variant="text" @click="stopCamera">Stop Camera</c-button></div>
            <p mt-2 text-sm text-center style="color:var(--n-text-color-3)">Scanning for QR codes...</p>
          </div>
        </c-card>
      </n-tab-pane>
    </n-tabs>
    <c-card v-if="result" title="Decoded Result" style="border:1px solid var(--n-success-color)">
      <div flex gap-2 items-center mb-3>
        <n-tag type="info">{{ resultType }}</n-tag>
        <c-button size="small" @click="copy">Copy</c-button>
      </div>
      <div style="word-break:break-all;background:var(--n-color-modal);padding:12px;border-radius:6px;font-family:monospace;font-size:14px">{{ result }}</div>
      <div v-if="resultType==='URL'" mt-3>
        <a :href="result" target="_blank" rel="noopener noreferrer">Open URL ↗</a>
      </div>
    </c-card>
  </div>
</template>
