<script setup lang="ts">
import { ref } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const activeTab = ref("encrypt");
const plaintext = ref("");
const password = ref("");
const ciphertext = ref("");
const decryptInput = ref("");
const decryptPassword = ref("");
const decryptOutput = ref("");
const isProcessing = ref(false);
async function getKey(pw:string,salt:Uint8Array){
  const enc=new TextEncoder();
  const keyMat=await crypto.subtle.importKey("raw",enc.encode(pw),"PBKDF2",false,["deriveKey"]);
  return crypto.subtle.deriveKey({name:"PBKDF2",salt,iterations:100000,hash:"SHA-256"},keyMat,{name:"AES-GCM",length:256},false,["encrypt","decrypt"]);
}
async function encrypt(){
  if(!plaintext.value||!password.value){message.warning("Enter text and password");return;}
  isProcessing.value=true;
  try{
    const salt=crypto.getRandomValues(new Uint8Array(16));
    const iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await getKey(password.value,salt);
    const enc=new TextEncoder();
    const encrypted=await crypto.subtle.encrypt({name:"AES-GCM",iv},key,enc.encode(plaintext.value));
    const combined=new Uint8Array(salt.length+iv.length+encrypted.byteLength);
    combined.set(salt,0);combined.set(iv,16);combined.set(new Uint8Array(encrypted),28);
    ciphertext.value=btoa(String.fromCharCode(...combined));
    message.success("Encrypted!");
  }catch(e:any){message.error(e.message);}
  finally{isProcessing.value=false;}
}
async function decrypt(){
  if(!decryptInput.value||!decryptPassword.value){message.warning("Enter ciphertext and password");return;}
  isProcessing.value=true;
  try{
    const combined=Uint8Array.from(atob(decryptInput.value),c=>c.charCodeAt(0));
    const salt=combined.slice(0,16);const iv=combined.slice(16,28);const data=combined.slice(28);
    const key=await getKey(decryptPassword.value,salt);
    const decrypted=await crypto.subtle.decrypt({name:"AES-GCM",iv},key,data);
    decryptOutput.value=new TextDecoder().decode(decrypted);
    message.success("Decrypted!");
  }catch{message.error("Decryption failed — wrong password or corrupted data");}
  finally{isProcessing.value=false;}
}
function copy(t:string){navigator.clipboard.writeText(t);message.success("Copied!");}
</script>
<template>
  <div style="max-width:600px;margin:0 auto">
    <n-tabs v-model:value="activeTab" type="card" mb-4>
      <n-tab-pane name="encrypt" tab="🔒 Encrypt">
        <c-card>
          <n-form-item label="Plaintext"><n-input type="textarea" v-model:value="plaintext" :rows="5" placeholder="Enter text to encrypt..."/></n-form-item>
          <n-form-item label="Password"><n-input v-model:value="password" type="password" placeholder="Strong password"/></n-form-item>
          <c-button :disabled="isProcessing" @click="encrypt">Encrypt</c-button>
          <div v-if="ciphertext" mt-4>
            <div flex justify-between mb-1><span text-sm font-semibold>Encrypted (Base64)</span><c-button size="small" @click="copy(ciphertext)">Copy</c-button></div>
            <n-input type="textarea" :value="ciphertext" readonly :rows="4" style="font-family:monospace;font-size:12px"/>
          </div>
        </c-card>
      </n-tab-pane>
      <n-tab-pane name="decrypt" tab="🔓 Decrypt">
        <c-card>
          <n-form-item label="Encrypted Text (Base64)"><n-input type="textarea" v-model:value="decryptInput" :rows="4" style="font-family:monospace;font-size:12px"/></n-form-item>
          <n-form-item label="Password"><n-input v-model:value="decryptPassword" type="password" placeholder="Password used to encrypt"/></n-form-item>
          <c-button :disabled="isProcessing" @click="decrypt">Decrypt</c-button>
          <div v-if="decryptOutput" mt-4>
            <div flex justify-between mb-1><span text-sm font-semibold>Decrypted Text</span><c-button size="small" @click="copy(decryptOutput)">Copy</c-button></div>
            <n-input type="textarea" :value="decryptOutput" readonly :rows="4"/>
          </div>
        </c-card>
      </n-tab-pane>
    </n-tabs>
    <c-alert type="info">Uses AES-256-GCM with PBKDF2 key derivation. 100% client-side — your data never leaves the browser.</c-alert>
  </div>
</template>
