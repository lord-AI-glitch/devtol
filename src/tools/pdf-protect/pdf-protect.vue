<script setup lang="ts">
import { useHead } from '@vueuse/head';

useHead({ meta: [{ name: 'robots', content: 'noindex, nofollow' }] });
</script>

<template>
  <c-alert type="warning" data-test-id="pdf-security-unavailable">
    <strong>PDF password protection is unavailable.</strong>
    <p>
      The previous implementation did not encrypt PDF files or apply passwords.
      Files downloaded from it are not password-protected. Do not rely on those files
      to protect sensitive information.
    </p>
    <p>
      Uploads and downloads are disabled until real encryption and password verification
      are implemented and tested. Use a trusted PDF encryption application instead.
    </p>
  </c-alert>
</template>
