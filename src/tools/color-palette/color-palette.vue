<script setup lang="ts">
import { ref, watch, computed } from "vue";
import { useMessage } from "naive-ui";
const message = useMessage();
const hex = ref("#4F9CFF");
const formats = ref<any>(null);
const isLoading = ref(false);
async function analyze(){
  isLoading.value=true;
  try{
    const chroma=(await import("https://cdn.skypack.dev/chroma-js")).default;
    const c=chroma(hex.value);
    const [r,g,b]=c.rgb();
    const [h,s,l]=c.hsl();
    const [hv,sv,v]=c.hsv();
    const [cc,m,y,k]=c.cmyk();
    const wcagW=chroma.contrast(c,"white");
    const wcagB=chroma.contrast(c,"black");
    const palette={
      complementary:[chroma.hsl((h*360+180)%360,s,l).hex()],
      triadic:[chroma.hsl((h*360+120)%360,s,l).hex(),chroma.hsl((h*360+240)%360,s,l).hex()],
      analogous:[chroma.hsl((h*360-30+360)%360,s,l).hex(),chroma.hsl((h*360+30)%360,s,l).hex()],
    };
    formats.value={
      hex:hex.value.toUpperCase(),
      rgb:`rgb(${r},${g},${b})`,
      hsl:`hsl(${Math.round(h*360)},${Math.round(s*100)}%,${Math.round(l*100)}%)`,
      hsv:`hsv(${Math.round(hv*360)},${Math.round(sv*100)}%,${Math.round(v*100)}%)`,
      cmyk:`cmyk(${Math.round(cc*100)}%,${Math.round(m*100)}%,${Math.round(y*100)}%,${Math.round(k*100)}%)`,
      wcagWhite:{ratio:wcagW.toFixed(2),pass:wcagW>=4.5?"AA":"Fail"},
      wcagBlack:{ratio:wcagB.toFixed(2),pass:wcagB>=4.5?"AA":"Fail"},
      palette,
    };
  }catch(e:any){message.error(e.message);}
  finally{isLoading.value=false;}
}
watch(hex,analyze,{immediate:true});
function copy(v:string){navigator.clipboard.writeText(v);message.success("Copied: "+v);}
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <c-card mb-4>
      <div flex gap-4 items-center>
        <div :style="{width:'80px',height:'80px',background:hex,borderRadius:'12px',flexShrink:0}"/>
        <div flex-1>
          <n-form-item label="Color (HEX)">
            <n-input v-model:value="hex" placeholder="#4F9CFF" style="font-family:monospace;width:160px" maxlength="7"/>
          </n-form-item>
        </div>
        <n-color-picker v-model:value="hex" :show-alpha="false" style="width:40px"/>
      </div>
    </c-card>
    <n-spin v-if="isLoading" size="small" mb-4/>
    <template v-if="formats">
      <n-grid :cols="2" :x-gap="16" mb-4>
        <n-gi v-for="(val,key) in {HEX:formats.hex,RGB:formats.rgb,HSL:formats.hsl,HSV:formats.hsv,CMYK:formats.cmyk}" :key="key">
          <c-card>
            <div flex justify-between items-center>
              <div><p text-xs style="color:var(--n-text-color-3)">{{ key }}</p><p font-mono font-semibold>{{ val }}</p></div>
              <c-button size="small" variant="ghost" @click="copy(val as string)">Copy</c-button>
            </div>
          </c-card>
        </n-gi>
      </n-grid>
      <n-grid :cols="2" :x-gap="16" mb-4>
        <n-gi><c-card title="WCAG vs White"><n-tag :type="Number(formats.wcagWhite.ratio)>=4.5?'success':'error'">Contrast: {{ formats.wcagWhite.ratio }}:1 — {{ formats.wcagWhite.pass }}</n-tag></c-card></n-gi>
        <n-gi><c-card title="WCAG vs Black"><n-tag :type="Number(formats.wcagBlack.ratio)>=4.5?'success':'error'">Contrast: {{ formats.wcagBlack.ratio }}:1 — {{ formats.wcagBlack.pass }}</n-tag></c-card></n-gi>
      </n-grid>
      <c-card title="Color Palette">
        <div v-for="(colors,type) in formats.palette" :key="type" mb-4>
          <p text-sm mb-2 font-semibold style="text-transform:capitalize">{{ type }}</p>
          <div flex gap-2>
            <div v-for="c in colors" :key="c" :style="{background:c,width:'60px',height:'60px',borderRadius:'8px',cursor:'pointer'}" :title="c" @click="copy(c)"/>
          </div>
        </div>
      </c-card>
    </template>
  </div>
</template>
