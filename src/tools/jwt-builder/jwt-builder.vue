<script setup lang="ts">
import { computed, ref } from 'vue';
import { useMessage } from 'naive-ui';

const message = useMessage();
const header = ref(JSON.stringify({ alg: 'HS256', typ: 'JWT' }, null, 2));
const payload = ref(JSON.stringify({ sub: '1234567890', name: 'John Doe', iat: Math.floor(Date.now() / 1000), exp: Math.floor(Date.now() / 1000) + 3600 }, null, 2));
const secret = ref('your-256-bit-secret');
const token = ref('');
async function sign() {
  try {
    const h = JSON.parse(header.value);
    const p = JSON.parse(payload.value);
    const b64 = (obj: object) => btoa(JSON.stringify(obj)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const headerB64 = b64(h);
    const payloadB64 = b64(p);
    const data = `${headerB64}.${payloadB64}`;
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey('raw', enc.encode(secret.value), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
    const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
    const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig))).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    token.value = `${data}.${sigB64}`;
    message.success('JWT signed!');
  }
  catch (e: any) { message.error(`Invalid JSON: ${e.message}`); }
}
function copy() {
  navigator.clipboard.writeText(token.value);
  message.success('Copied!');
}
const parts = computed(() => {
  if (!token.value) {
    return null;
  }
  const [h, p] = token.value.split('.');
  try {
    return { header: JSON.parse(atob(h.replace(/-/g, '+').replace(/_/g, '/'))), payload: JSON.parse(atob(p.replace(/-/g, '+').replace(/_/g, '/'))) };
  }
  catch { return null; }
});
</script>

<template>
  <div style="max-width:800px;margin:0 auto">
    <n-grid :cols="2" :x-gap="16" mb-4>
      <n-gi>
        <c-card title="Header (JSON)">
          <n-input v-model:value="header" type="textarea" :rows="5" style="font-family:monospace;font-size:13px" />
        </c-card>
      </n-gi>
      <n-gi>
        <c-card title="Payload (JSON)">
          <n-input v-model:value="payload" type="textarea" :rows="5" style="font-family:monospace;font-size:13px" />
        </c-card>
      </n-gi>
    </n-grid>
    <c-card title="Secret Key" mb-4>
      <n-input v-model:value="secret" placeholder="HMAC-SHA256 secret key" style="font-family:monospace" />
    </c-card>
    <c-button mb-4 @click="sign">
      Sign JWT
    </c-button>
    <c-card v-if="token" title="Generated JWT Token" mb-4>
      <div mb-2 flex justify-between>
        <span text-sm style="color:var(--n-text-color-3)">Copy and use in Authorization header</span><c-button size="small" @click="copy">
          Copy
        </c-button>
      </div>
      <div style="word-break:break-all;font-family:monospace;font-size:12px;background:var(--n-color-modal);padding:12px;border-radius:6px">
        <span style="color:#e06c75">{{ token.split(".")[0] }}</span>.<span style="color:#61afef">{{ token.split(".")[1] }}</span>.<span style="color:#98c379">{{ token.split(".")[2] }}</span>
      </div>
    </c-card>
  </div>
</template>
