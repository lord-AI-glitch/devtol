<script setup lang="ts">
import { ref, computed } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const input = ref("banana\napple\ncherry\napple\nbanana\n\nmango");
const ops = ref(["removeDuplicates","removeBlank","trim"]);
const sortOrder = ref("none");
const opOptions=[{label:"Remove duplicates",value:"removeDuplicates"},{label:"Remove blank lines",value:"removeBlank"},{label:"Trim whitespace",value:"trim"},{label:"Lowercase",value:"lowercase"},{label:"Uppercase",value:"uppercase"}];
const sortOptions=[{label:"No sorting",value:"none"},{label:"A → Z",value:"asc"},{label:"Z → A",value:"desc"},{label:"By length (short first)",value:"len"},{label:"Reverse order",value:"reverse"}];
const result = computed(()=>{
  let lines=input.value.split("\n");
  if(ops.value.includes("trim"))lines=lines.map(l=>l.trim());
  if(ops.value.includes("removeBlank"))lines=lines.filter(l=>l!=="");
  if(ops.value.includes("lowercase"))lines=lines.map(l=>l.toLowerCase());
  if(ops.value.includes("uppercase"))lines=lines.map(l=>l.toUpperCase());
  const before=lines.length;
  if(ops.value.includes("removeDuplicates"))lines=[...new Set(lines)];
  const dupsRemoved=before-lines.length;
  if(sortOrder.value==="asc")lines=[...lines].sort();
  else if(sortOrder.value==="desc")lines=[...lines].sort().reverse();
  else if(sortOrder.value==="len")lines=[...lines].sort((a,b)=>a.length-b.length);
  else if(sortOrder.value==="reverse")lines=[...lines].reverse();
  return{text:lines.join("\n"),lineCount:lines.length,dupsRemoved};
});
function copy(){navigator.clipboard.writeText(result.value.text);message.success("Copied!");}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <n-grid :cols="2" :x-gap="16" mb-4>
      <n-gi>
        <c-card title="Input">
          <n-input type="textarea" v-model:value="input" :rows="12" placeholder="Paste your text lines here..."/>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Output">
          <div flex justify-between items-center mb-2>
            <div flex gap-2>
              <n-tag>{{ result.lineCount }} lines</n-tag>
              <n-tag v-if="result.dupsRemoved>0" type="warning">-{{ result.dupsRemoved }} dups</n-tag>
            </div>
            <c-button size="small" @click="copy">Copy</c-button>
          </div>
          <n-input type="textarea" :value="result.text" readonly :rows="10"/>
        </c-card>
      </n-gi>
    </n-grid>
    <n-grid :cols="2" :x-gap="16">
      <n-gi>
        <c-card title="Operations">
          <n-checkbox-group v-model:value="ops">
            <n-space vertical>
              <n-checkbox v-for="op in opOptions" :key="op.value" :value="op.value" :label="op.label"/>
            </n-space>
          </n-checkbox-group>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Sort Order">
          <n-radio-group v-model:value="sortOrder">
            <n-space vertical>
              <n-radio v-for="s in sortOptions" :key="s.value" :value="s.value" :label="s.label"/>
            </n-space>
          </n-radio-group>
        </c-card>
      </n-gi>
    </n-grid>
  </div>
</template>
