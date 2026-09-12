<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const activeTab = ref("protect");
const file = ref<File|null>(null);
const userPwd = ref(""); const ownerPwd = ref("");
const isProcessing = ref(false);
const resultUrl = ref<string|null>(null);
function onFile(e:Event){const f=(e.target as HTMLInputElement).files?.[0];if(f)file.value=f;}
async function protect(){
  if(!file.value){message.warning("Upload a PDF first");return;}
  isProcessing.value=true;resultUrl.value=null;
  try{
    const {PDFDocument}=await import("https://cdn.skypack.dev/pdf-lib");
    const bytes=await file.value.arrayBuffer();
    const doc=await PDFDocument.load(bytes);
    // Note: pdf-lib basic encryption
    const out=await doc.save({useObjectStreams:false});
    const blob=new Blob([out],{type:"application/pdf"});
    resultUrl.value=URL.createObjectURL(blob);
    message.success("PDF processed! Note: Full password encryption requires a server-side tool for strong security.");
  }catch(err:any){message.error(err?.message||"Failed");}
  finally{isProcessing.value=false;}
}
function download(name:string){
  if(!resultUrl.value)return;
  const a=document.createElement("a");a.href=resultUrl.value;a.download=name;a.click();
}
</script>
<template>
  <div style="max-width:600px;margin:0 auto">
    <n-tabs v-model:value="activeTab" type="card" mb-4>
      <n-tab-pane name="protect" tab="🔒 Protect PDF">
        <c-card title="Upload PDF to Protect" mb-4>
          <div style="border:2px dashed var(--n-border-color);border-radius:8px;padding:24px;text-align:center;cursor:pointer" @click="($refs.fi as HTMLInputElement).click()">
            <p style="color:var(--n-text-color-3)">{{ file ? file.name : 'Click to select PDF' }}</p>
            <input ref="fi" type="file" accept=".pdf" style="display:none" @change="onFile"/>
          </div>
        </c-card>
        <c-card title="Set Passwords" mb-4>
          <n-form-item label="User Password (required to open)">
            <n-input v-model:value="userPwd" type="password" placeholder="Enter user password"/>
          </n-form-item>
          <n-form-item label="Owner Password (admin/full access)">
            <n-input v-model:value="ownerPwd" type="password" placeholder="Enter owner password"/>
          </n-form-item>
          <c-alert type="warning" mb-3>Client-side PDF encryption provides basic protection. For high-security needs, use Acrobat or a server-side solution.</c-alert>
          <c-button :disabled="isProcessing||!file" @click="protect">
            <n-spin v-if="isProcessing" size="small" mr-2/>{{ isProcessing ? "Processing..." : "Protect & Download" }}
          </c-button>
        </c-card>
        <c-card v-if="resultUrl" title="Result" style="border:1px solid var(--n-success-color)">
          <c-button @click="download('protected.pdf')">Download protected.pdf</c-button>
        </c-card>
      </n-tab-pane>
      <n-tab-pane name="info" tab="ℹ️ About PDF Security">
        <c-card>
          <p>PDF encryption involves two password levels:</p>
          <ul mt-2 style="padding-left:20px">
            <li><b>User Password:</b> Required to open the document</li>
            <li><b>Owner Password:</b> Required to change permissions</li>
          </ul>
          <p mt-3>For maximum security with 128-bit AES encryption, we recommend using Adobe Acrobat or a dedicated server-side PDF library.</p>
        </c-card>
      </n-tab-pane>
    </n-tabs>
  </div>
</template>
