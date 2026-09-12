<script setup lang="ts">
import { ref, computed } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const dataType = ref("person");
const count = ref(10);
const outputFormat = ref("json");
const typeOptions=[{label:"👤 Person (name, email, phone)",value:"person"},{label:"🏠 Address",value:"address"},{label:"💳 UUID / ID",value:"uuid"},{label:"📅 Date & Time",value:"date"},{label:"📧 Email only",value:"email"},{label:"🔢 Random Number",value:"number"}];
const formatOptions=[{label:"JSON Array",value:"json"},{label:"CSV",value:"csv"},{label:"Plain List",value:"plain"}];
const firstNames=["Alice","Bob","Charlie","Diana","Edward","Fiona","George","Hannah","Ivan","Julia","Kevin","Laura","Mike","Nancy","Oscar","Paula","Quinn","Rachel","Steve","Tina"];
const lastNames=["Smith","Johnson","Williams","Brown","Jones","Garcia","Miller","Davis","Wilson","Moore","Taylor","Anderson","Thomas","Jackson","White","Harris","Martin","Thompson","Lee","Walker"];
const domains=["gmail.com","yahoo.com","outlook.com","hotmail.com","proton.me","icloud.com"];
const cities=["New York","London","Paris","Tokyo","Sydney","Berlin","Toronto","Dubai","Singapore","Amsterdam"];
const streets=["Main St","Oak Ave","Park Blvd","Lake Dr","Maple Ln","Cedar Rd","Elm St","River Way"];
function rand(arr:string[]){return arr[Math.floor(Math.random()*arr.length)];}
function randInt(min:number,max:number){return Math.floor(Math.random()*(max-min+1))+min;}
function uuid(){return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,c=>{const r=Math.random()*16|0;return(c==='x'?r:r&0x3|0x8).toString(16);});}
function generateItem(){
  const fn=rand(firstNames);const ln=rand(lastNames);
  switch(dataType.value){
    case"person":return{name:`${fn} ${ln}`,email:`${fn.toLowerCase()}.${ln.toLowerCase()}@${rand(domains)}`,phone:`+1-${randInt(200,999)}-${randInt(100,999)}-${randInt(1000,9999)}`};
    case"address":return{street:`${randInt(1,9999)} ${rand(streets)}`,city:rand(cities),zip:`${randInt(10000,99999)}`,country:"US"};
    case"uuid":return{id:uuid()};
    case"date":return{date:new Date(Date.now()-Math.random()*1e12).toISOString()};
    case"email":return{email:`${fn.toLowerCase()}${randInt(1,99)}@${rand(domains)}`};
    case"number":return{value:randInt(1,1000000)};
    default:return{};
  }
}
const generated = ref<any[]>([]);
function generate(){generated.value=Array.from({length:count.value},generateItem);}
const output = computed(()=>{
  if(!generated.value.length)return"";
  if(outputFormat.value==="json")return JSON.stringify(generated.value,null,2);
  if(outputFormat.value==="csv"){
    const keys=Object.keys(generated.value[0]);
    return[keys.join(","),...generated.value.map(r=>keys.map(k=>JSON.stringify(r[k]??'')).join(","))].join("\n");
  }
  return generated.value.map(r=>Object.values(r).join(" | ")).join("\n");
});
function copy(){navigator.clipboard.writeText(output.value);message.success("Copied!");}
function download(){const b=new Blob([output.value],{type:"text/plain"});const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=`mock-data.${outputFormat.value==="json"?"json":"csv"}`;a.click();}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <n-grid :cols="3" :x-gap="16" mb-4>
      <n-gi><c-card title="Data Type"><n-select v-model:value="dataType" :options="typeOptions"/></c-card></n-gi>
      <n-gi><c-card title="Count"><n-input-number v-model:value="count" :min="1" :max="1000" style="width:100%"/></c-card></n-gi>
      <n-gi><c-card title="Output Format"><n-select v-model:value="outputFormat" :options="formatOptions"/></c-card></n-gi>
    </n-grid>
    <div flex gap-2 mb-4><c-button @click="generate">Generate Data</c-button></div>
    <c-card v-if="output" title="Generated Data">
      <div flex justify-between mb-2>
        <span text-sm style="color:var(--n-text-color-3)">{{ generated.length }} records</span>
        <div flex gap-2><c-button size="small" @click="copy">Copy</c-button><c-button size="small" @click="download">Download</c-button></div>
      </div>
      <n-input type="textarea" :value="output" readonly :rows="14" style="font-family:monospace;font-size:12px"/>
    </c-card>
  </div>
</template>
