<script setup lang="ts">
import { ref, computed } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const input = ref('name: John\nage: 30\ncity: "New York"\nhobbies:\n  - reading\n  - coding');
const outputMode = ref("format");
const modeOptions=[{label:"Format & Validate",value:"format"},{label:"Convert to JSON",value:"json"}];
const result = computed(async()=>null);
const syncResult = ref<{text:string;error:string|null;valid:boolean}>({text:"",error:null,valid:true});
async function process(){
  try{
    const jsyaml=await import("https://cdn.skypack.dev/js-yaml");
    const parsed=jsyaml.load(input.value);
    syncResult.value={
      text:outputMode.value==="json"?JSON.stringify(parsed,null,2):jsyaml.dump(parsed,{indent:2,lineWidth:80}),
      error:null,valid:true
    };
    message.success("Valid YAML ✓");
  }catch(e:any){
    syncResult.value={text:"",error:e.message,valid:false};
  }
}
function copy(){navigator.clipboard.writeText(syncResult.value.text);message.success("Copied!");}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <n-grid :cols="2" :x-gap="16" mb-4>
      <n-gi>
        <c-card title="YAML Input">
          <n-input type="textarea" v-model:value="input" :rows="14" style="font-family:monospace;font-size:13px" placeholder="Paste your YAML here..."/>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Output">
          <div flex gap-2 mb-2>
            <n-radio-group v-model:value="outputMode" size="small">
              <n-radio-button v-for="m in modeOptions" :key="m.value" :value="m.value" :label="m.label"/>
            </n-radio-group>
          </div>
          <c-alert v-if="syncResult.error" type="error" mb-2>{{ syncResult.error }}</c-alert>
          <n-input v-if="syncResult.text" type="textarea" :value="syncResult.text" readonly :rows="11" style="font-family:monospace;font-size:13px"/>
          <div mt-2 flex justify-between>
            <n-tag v-if="syncResult.valid&&syncResult.text" type="success">✓ Valid YAML</n-tag>
            <c-button v-if="syncResult.text" size="small" @click="copy">Copy</c-button>
          </div>
        </c-card>
      </n-gi>
    </n-grid>
    <div flex gap-2>
      <c-button @click="process">Validate & Format</c-button>
    </div>
  </div>
</template>
