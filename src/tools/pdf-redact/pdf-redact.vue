<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });
</script>

<template>
  <c-alert type="warning" data-test-id="pdf-security-unavailable">
    <strong>PDF text redaction is unavailable.</strong>
    <p>
      The previous implementation did not remove or hide sensitive text.
      Files downloaded from it still contain the original information, even if marked
      REDACTED. Do not share those files as redacted documents.
    </p>
    <p>
      Uploads and downloads are disabled until irreversible redaction and output
      verification are implemented and tested. Use a trusted PDF redaction application
      and verify that sensitive text cannot be searched, copied or recovered.
    </p>
  </c-alert>
</template>
