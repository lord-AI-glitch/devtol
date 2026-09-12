<script setup lang="ts">
import { ref, computed } from "vue";
const input = ref("");
const stats = computed(()=>{
  const text=input.value;
  const words=text.trim()===''?0:text.trim().split(/\s+/).length;
  const chars=text.length;
  const charsNoSpace=text.replace(/\s/g,"").length;
  const sentences=(text.match(/[.!?]+/g)||[]).length;
  const paragraphs=text.trim()===''?0:text.trim().split(/\n\s*\n/).length;
  const readingTime=Math.ceil(words/200);
  // Keyword density
  const wordMap:Record<string,number>={};
  if(words>0){
    const stopWords=new Set(["the","a","an","and","or","but","in","on","at","to","for","of","with","by","from","is","are","was","were","be","been","being","have","has","had","do","does","did","will","would","could","should","may","might","shall","can","this","that","these","those","i","you","he","she","it","we","they","me","him","her","us","them"]);
    for(const w of text.toLowerCase().match(/\b[a-z]+\b/g)||[]){
      if(!stopWords.has(w)&&w.length>2)wordMap[w]=(wordMap[w]||0)+1;
    }
  }
  const keywords=Object.entries(wordMap).sort((a,b)=>b[1]-a[1]).slice(0,10).map(([word,count])=>({word,count,density:((count/Math.max(words,1))*100).toFixed(1)}));
  return{words,chars,charsNoSpace,sentences,paragraphs,readingTime,keywords};
});
</script>
<template>
  <div style="max-width:800px;margin:0 auto">
    <c-card mb-4>
      <n-input type="textarea" v-model:value="input" :rows="10" placeholder="Paste or type your text here..." style="font-size:14px"/>
    </c-card>
    <n-grid :cols="3" :x-gap="12" :y-gap="12" mb-4>
      <n-gi><c-card><n-statistic label="Words" :value="stats.words"/></c-card></n-gi>
      <n-gi><c-card><n-statistic label="Characters" :value="stats.chars"/></c-card></n-gi>
      <n-gi><c-card><n-statistic label="Chars (no spaces)" :value="stats.charsNoSpace"/></c-card></n-gi>
      <n-gi><c-card><n-statistic label="Sentences" :value="stats.sentences"/></c-card></n-gi>
      <n-gi><c-card><n-statistic label="Paragraphs" :value="stats.paragraphs"/></c-card></n-gi>
      <n-gi><c-card><n-statistic label="Reading Time" :value="stats.readingTime + ' min'"/></c-card></n-gi>
    </n-grid>
    <c-card v-if="stats.keywords.length>0" title="Top Keywords">
      <n-data-table :columns="[{title:'Word',key:'word'},{title:'Count',key:'count',width:80},{title:'Density',key:'density',width:100,render:r=>r.density+'%'}]" :data="stats.keywords" :bordered="false" size="small"/>
    </c-card>
  </div>
</template>
