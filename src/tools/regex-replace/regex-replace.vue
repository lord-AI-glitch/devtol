<script setup lang="ts">
import { ref, computed } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const input = ref("Hello World! Hello JavaScript!");
const pattern = ref("Hello");
const replacement = ref("Hi");
const flags = ref(["g"]);
const flagOptions=[{label:"g - Global",value:"g"},{label:"i - Case Insensitive",value:"i"},{label:"m - Multiline",value:"m"},{label:"s - Dot All",value:"s"}];
const result = computed(()=>{
  try{
    const re=new RegExp(pattern.value,flags.value.join(""));
    const output=input.value.replace(re,replacement.value);
    const matches=[...input.value.matchAll(new RegExp(pattern.value,flags.value.includes("g")?flags.value.join(""):flags.value.join("")+"g"))];
    return{output,matchCount:matches.length,error:null};
  }catch(e:any){return{output:"",matchCount:0,error:e.message};}
});
function copy(){navigator.clipboard.writeText(result.value.output);message.success("Copied!");}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <n-grid :cols="2" :x-gap="16" mb-4>
      <n-gi>
        <c-card title="Regex Pattern">
          <n-input v-model:value="pattern" placeholder="Enter regex pattern" mb-2 style="font-family:monospace"/>
          <n-checkbox-group v-model:value="flags">
            <n-space><n-checkbox v-for="f in flagOptions" :key="f.value" :value="f.value" :label="f.label"/></n-space>
          </n-checkbox-group>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Replacement">
          <n-input v-model:value="replacement" placeholder="Replacement string" style="font-family:monospace"/>
          <p mt-2 text-xs style="color:var(--n-text-color-3)">Use $1, $2 for capture groups</p>
        </c-card>
      </n-gi>
    </n-grid>
    <c-card title="Input Text" mb-4>
      <n-input type="textarea" v-model:value="input" :rows="6" style="font-family:monospace"/>
    </c-card>
    <c-alert v-if="result.error" type="error" mb-4>Invalid regex: {{ result.error }}</c-alert>
    <c-card v-if="!result.error" title="Output">
      <div flex justify-between items-center mb-2>
        <n-tag type="info">{{ result.matchCount }} match(es) replaced</n-tag>
        <c-button size="small" @click="copy">Copy</c-button>
      </div>
      <n-input type="textarea" :value="result.output" readonly :rows="6" style="font-family:monospace"/>
    </c-card>
  </div>
</template>
