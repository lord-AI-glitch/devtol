<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();
const input = ref('apple\nBanana\napple\ncherry\n\nbanana\n  spaces  \ncherry');
const ops = ref(['removeDuplicates', 'removeBlank', 'trim']);
const sort = ref('none');
const opOptions = [{ label: 'Remove duplicate lines', value: 'removeDuplicates' }, { label: 'Remove blank lines', value: 'removeBlank' }, { label: 'Trim whitespace', value: 'trim' }, { label: 'Lowercase all', value: 'lowercase' }, { label: 'Uppercase all', value: 'uppercase' }];
const sortOpts = [{ label: 'No sort', value: 'none' }, { label: 'A → Z', value: 'asc' }, { label: 'Z → A', value: 'desc' }, { label: 'By length ↑', value: 'lenAsc' }, { label: 'Random shuffle', value: 'shuffle' }];
const result = computed(() => {
  let lines = input.value.split('\n');
  if (ops.value.includes('trim')) {
    lines = lines.map(l => l.trim());
  }
  if (ops.value.includes('removeBlank')) {
    lines = lines.filter(l => l.length > 0);
  }
  if (ops.value.includes('lowercase')) {
    lines = lines.map(l => l.toLowerCase());
  }
  if (ops.value.includes('uppercase')) {
    lines = lines.map(l => l.toUpperCase());
  }
  const orig = lines.length;
  if (ops.value.includes('removeDuplicates')) {
    const seen = new Set<string>();
    lines = lines.filter((l) => {
      if (seen.has(l)) {
        return false;
      }
      seen.add(l);
      return true;
    });
  }
  const dupsRemoved = orig - lines.length;
  if (sort.value === 'asc') {
    lines = [...lines].sort((a, b) => a.localeCompare(b));
  }
  else if (sort.value === 'desc') {
    lines = [...lines].sort((a, b) => b.localeCompare(a));
  }
  else if (sort.value === 'lenAsc') {
    lines = [...lines].sort((a, b) => a.length - b.length);
  }
  else if (sort.value === 'shuffle') {
    lines = [...lines].sort(() => Math.random() - 0.5);
  }
  return { text: lines.join('\n'), count: lines.length, dupsRemoved };
});
function copy() {
  navigator.clipboard.writeText(result.value.text);
  message.success('Copied!');
}
</script>

<template>
  <div style="max-width:900px;margin:0 auto">
    <n-grid :cols="2" :x-gap="16" mb-4>
      <n-gi>
        <c-card title="Input">
          <n-input v-model:value="input" type="textarea" :rows="14" style="font-family:monospace;font-size:13px" /><p mt-2 text-xs style="color:var(--n-text-color-3)">
            {{ input.split('\n').length }} lines
          </p>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Output">
          <div mb-2 flex items-center justify-between>
            <div flex gap-2>
              <n-tag>{{ result.count }} lines</n-tag>
              <n-tag v-if="result.dupsRemoved > 0" type="warning">
                {{ result.dupsRemoved }} removed
              </n-tag>
            </div>
            <c-button size="small" @click="copy">
              Copy
            </c-button>
          </div>
          <n-input type="textarea" :value="result.text" readonly :rows="11" style="font-family:monospace;font-size:13px" />
        </c-card>
      </n-gi>
    </n-grid>
    <n-grid :cols="2" :x-gap="16">
      <n-gi>
        <c-card title="Operations">
          <n-checkbox-group v-model:value="ops">
            <n-space vertical>
              <n-checkbox v-for="o in opOptions" :key="o.value" :value="o.value" :label="o.label" />
            </n-space>
          </n-checkbox-group>
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Sorting">
          <n-radio-group v-model:value="sort">
            <n-space vertical>
              <n-radio v-for="s in sortOpts" :key="s.value" :value="s.value" :label="s.label" />
            </n-space>
          </n-radio-group>
        </c-card>
      </n-gi>
    </n-grid>
  </div>
</template>
