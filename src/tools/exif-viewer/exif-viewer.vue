<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const file = ref<File|null>(null);
const metadata = ref<Record<string,any>|null>(null);
const isLoading = ref(false);
const strippedUrl = ref<string|null>(null);
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f){file.value=f;metadata.value=null;strippedUrl.value=null;readExif(f);}}
async function readExif(f:File){
  isLoading.value=true;
  try{
    const exifr = await import('exifr');
    const data = await exifr.parse(f, { gps: true, tiff: true, exif: true });
    metadata.value=data||{};
    if(!data||Object.keys(data).length===0)message.info("No EXIF metadata found in this image.");
    else message.success(`Found ${Object.keys(data).length} metadata fields`);
  }catch{message.warning("Could not read EXIF data — image may not contain EXIF metadata.");}
  finally{isLoading.value=false;}
}
async function stripExif(){
  if(!file.value)return;
  const img=new Image(); img.src=URL.createObjectURL(file.value);
  await new Promise(r=>img.onload=r);
  const c=document.createElement("canvas"); c.width=img.naturalWidth; c.height=img.naturalHeight;
  c.getContext("2d")!.drawImage(img,0,0);
  const blob=await new Promise<Blob>((res,rej)=>c.toBlob(b=>b?res(b):rej(new Error("Failed")),"image/jpeg",0.95));
  strippedUrl.value=URL.createObjectURL(blob);
  message.success("EXIF data stripped! New image has no metadata.");
}
function download(){if(!strippedUrl.value)return;const a=document.createElement("a");a.href=strippedUrl.value;a.download="clean_"+file.value!.name.replace(/\.[^.]+$/,".jpg");a.click();}
const gpsLink = ()=>metadata.value?.latitude&&metadata.value?.longitude?`https://maps.google.com/?q=${metadata.value.latitude},${metadata.value.longitude}`:null;
</script>
<template>
  <div style="max-width:700px;margin:0 auto">
    <c-card title="Upload Image" mb-4>
      <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
        <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select image (JPG, TIFF, HEIC)' }}</p>
        <input ref="fi" type="file" accept="image/*" style="display:none" @change="onFile"/>
      </div>
      <n-spin v-if="isLoading" mt-3/>
    </c-card>
    <c-card v-if="metadata!==null" title="EXIF Metadata" mb-4>
      <div v-if="gpsLink()" mb-3>
        <n-tag type="warning">📍 GPS Location Found</n-tag>
        <a :href="gpsLink()!" target="_blank" ml-2 style="font-size:13px">View on Google Maps ↗</a>
      </div>
      <n-empty v-if="Object.keys(metadata!).length===0" description="No EXIF metadata found"/>
      <n-data-table v-else
        :columns="[{title:'Property',key:'key',width:200},{title:'Value',key:'value'}]"
        :data="Object.entries(metadata!).map(([key,value])=>({key,value:String(value)}))"
        :bordered="false" :pagination="{pageSize:20}" size="small"/>
    </c-card>
    <c-card v-if="metadata!==null" title="Privacy Actions">
      <p mb-3 text-sm style="color:var(--n-text-color-3)">Strip all EXIF data by re-encoding the image on canvas:</p>
      <div flex gap-2>
        <c-button @click="stripExif">Strip EXIF & Download</c-button>
        <c-button v-if="strippedUrl" variant="text" @click="download">Download Clean Image</c-button>
      </div>
    </c-card>
  </div>
</template>
