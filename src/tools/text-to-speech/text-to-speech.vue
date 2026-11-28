<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();
const text = ref('The quick brown fox jumps over the lazy dog.');
const voices = ref<SpeechSynthesisVoice[]>([]);
const selectedVoice = ref('');
const rate = ref(1.0);
const pitch = ref(1.0);
const volume = ref(1.0);
const isSpeaking = ref(false);
const isPaused = ref(false);
function loadVoices() {
  voices.value = window.speechSynthesis.getVoices();
  if (voices.value.length > 0 && !selectedVoice.value) {
    selectedVoice.value = voices.value[0].name;
  }
}
onMounted(() => {
  loadVoices();
  window.speechSynthesis.onvoiceschanged = loadVoices;
});
onUnmounted(() => window.speechSynthesis.cancel());
function speak() {
  if (!text.value) {
    message.warning('Enter some text');
    return;
  }
  if (!('speechSynthesis' in window)) {
    message.error('Speech synthesis not supported in this browser');
    return;
  }
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.value);
  const voice = voices.value.find(v => v.name === selectedVoice.value);
  if (voice) {
    utt.voice = voice;
  }
  utt.rate = rate.value;
  utt.pitch = pitch.value;
  utt.volume = volume.value;
  utt.onstart = () => {
    isSpeaking.value = true;
    isPaused.value = false;
  };
  utt.onend = () => {
    isSpeaking.value = false;
    isPaused.value = false;
  };
  utt.onerror = () => {
    isSpeaking.value = false;
    message.error('Speech error occurred');
  };
  window.speechSynthesis.speak(utt);
}
function pause() {
  window.speechSynthesis.pause();
  isPaused.value = true;
}
function resume() {
  window.speechSynthesis.resume();
  isPaused.value = false;
}
function stop() {
  window.speechSynthesis.cancel();
  isSpeaking.value = false;
  isPaused.value = false;
}
const voiceOptions = () => voices.value.map(v => ({ label: `${v.name} (${v.lang})`, value: v.name }));
</script>

<template>
  <div style="max-width:600px;margin:0 auto">
    <c-card title="Text Input" mb-4>
      <n-input v-model:value="text" type="textarea" :rows="6" placeholder="Enter text to convert to speech..." mb-2 />
      <p text-xs style="color:var(--n-text-color-3)">
        {{ text.length }} characters · ~{{ Math.ceil(text.split(/\s+/).length / 150) }} min read
      </p>
    </c-card>
    <c-card title="Voice Settings" mb-4>
      <n-form-item label="Voice">
        <n-select v-model:value="selectedVoice" :options="voiceOptions()" filterable placeholder="Select voice" style="width:100%" />
      </n-form-item>
      <n-form-item :label="`Speed: ${rate.toFixed(1)}x`">
        <n-slider v-model:value="rate" :min="0.5" :max="2" :step="0.1" />
      </n-form-item>
      <n-form-item :label="`Pitch: ${pitch.toFixed(1)}`">
        <n-slider v-model:value="pitch" :min="0" :max="2" :step="0.1" />
      </n-form-item>
      <n-form-item :label="`Volume: ${Math.round(volume * 100)}%`">
        <n-slider v-model:value="volume" :min="0" :max="1" :step="0.05" />
      </n-form-item>
    </c-card>
    <div flex gap-3>
      <c-button v-if="!isSpeaking" @click="speak">
        ▶ Speak
      </c-button>
      <c-button v-if="isSpeaking && !isPaused" variant="text" @click="pause">
        ⏸ Pause
      </c-button>
      <c-button v-if="isPaused" @click="resume">
        ▶ Resume
      </c-button>
      <c-button v-if="isSpeaking || isPaused" variant="text" @click="stop">
        ⏹ Stop
      </c-button>
    </div>
    <n-alert v-if="voices.length === 0" type="warning" mt-4>
      No voices available. Please check your browser and system TTS settings.
    </n-alert>
  </div>
</template>
