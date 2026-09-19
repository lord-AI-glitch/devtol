<script setup lang="ts">
import { computed } from 'vue';
import { IconAlertTriangle, IconBrandWhatsapp, IconRefresh } from '@tabler/icons-vue';
import { useI18n } from 'vue-i18n';

interface Props {
  toolTitle: string;
  toolPath?: string;
  mode?: 'header' | 'floating' | 'banner';
  errorMessage?: string;
}

const props = withDefaults(defineProps<Props>(), {
  toolPath: '',
  mode: 'header',
  errorMessage: '',
});

const emit = defineEmits<{
  (e: 'retry'): void;
}>();

const { t, locale } = useI18n();

const WHATSAPP_PHONE = '201096656588';

const whatsappUrl = computed(() => {
  const currentUrl = typeof window !== 'undefined'
    ? window.location.href
    : `https://devtol.online${props.toolPath}`;

  const title = props.toolTitle || 'Tool';

  let message = '';
  if (props.errorMessage) {
    message = t('toolIssue.whatsappErrorMessage', {
      toolTitle: title,
      url: currentUrl,
      error: props.errorMessage,
    });
  } else {
    message = t('toolIssue.whatsappMessage', {
      toolTitle: title,
      url: currentUrl,
    });
  }

  return `https://wa.me/${WHATSAPP_PHONE}?text=${encodeURIComponent(message)}`;
});

function handleOpenWhatsApp() {
  if (typeof window !== 'undefined') {
    window.open(whatsappUrl.value, '_blank', 'noopener,noreferrer');
  }
}
</script>

<template>
  <!-- 1. Header Mode: Compact icon button next to FavoriteButton -->
  <div v-if="mode === 'header'" class="tool-issue-header">
    <c-tooltip :tooltip="$t('toolIssue.headerTooltip')" position="bottom">
      <c-button
        variant="text"
        circle
        aria-label="Report tool malfunction on WhatsApp"
        class="header-wa-btn"
        @click="handleOpenWhatsApp"
      >
        <IconBrandWhatsapp class="wa-icon" :size="20" stroke-width="2" />
      </c-button>
    </c-tooltip>
  </div>

  <!-- 2. Floating Mode: Compact circular floating button with WhatsApp logo only -->
  <div
    v-else-if="mode === 'floating'"
    class="tool-issue-floating"
  >
    <c-tooltip :tooltip="$t('toolIssue.floatingTooltip')" position="left">
      <a
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="floating-wa-link"
        :aria-label="$t('toolIssue.floatingLabel')"
      >
        <div class="pulse-ring" />
        <IconBrandWhatsapp class="floating-icon" :size="28" stroke-width="2.2" />
      </a>
    </c-tooltip>
  </div>

  <!-- 3. Banner Mode: Comprehensive error boundary fallback UI -->
  <div v-else-if="mode === 'banner'" class="tool-issue-banner">
    <div class="banner-header">
      <div class="icon-badge">
        <IconAlertTriangle :size="28" stroke-width="2" />
      </div>
      <div>
        <h3 class="banner-title">
          {{ $t('toolIssue.errorBannerTitle') }}
        </h3>
        <p class="banner-desc">
          {{ $t('toolIssue.errorBannerDesc') }}
        </p>
      </div>
    </div>

    <div v-if="errorMessage" class="error-details-box">
      <code>{{ errorMessage }}</code>
    </div>

    <div class="banner-actions">
      <a
        :href="whatsappUrl"
        target="_blank"
        rel="noopener noreferrer"
        class="banner-wa-btn"
      >
        <IconBrandWhatsapp :size="20" stroke-width="2.2" />
        <span>{{ $t('toolIssue.chatWhatsApp') }}</span>
      </a>

      <button type="button" class="banner-retry-btn" @click="emit('retry')">
        <IconRefresh :size="18" stroke-width="2" />
        <span>{{ $t('toolIssue.retry') }}</span>
      </button>
    </div>
  </div>
</template>

<style scoped>
/* Header Button Styles */
.tool-issue-header {
  display: inline-flex;
  align-items: center;
}

.header-wa-btn {
  color: #25d366 !important;
  opacity: 0.85;
  transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
}

.header-wa-btn:hover {
  opacity: 1;
  transform: scale(1.1);
  box-shadow: 0 0 12px rgba(37, 211, 102, 0.4);
}

.wa-icon {
  color: #25d366;
}

/* Floating Action Button (FAB) Styles */
.tool-issue-floating {
  position: fixed;
  bottom: 28px;
  inset-inline-end: 28px;
  z-index: 1000;
}

.floating-wa-link {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: #ffffff !important;
  text-decoration: none !important;
  border-radius: 50%;
  box-shadow: 0 4px 18px rgba(18, 140, 126, 0.4), 0 2px 6px rgba(0, 0, 0, 0.18);
  transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.25s ease;
  backdrop-filter: blur(8px);
}

.floating-wa-link:hover {
  transform: translateY(-3px) scale(1.08);
  box-shadow: 0 8px 25px rgba(37, 211, 102, 0.55), 0 4px 12px rgba(0, 0, 0, 0.22);
  color: #ffffff !important;
}

.floating-icon {
  flex-shrink: 0;
  color: #ffffff;
}

.pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(37, 211, 102, 0.55);
  animation: pulse-border 2.5s infinite ease-out;
  pointer-events: none;
}

@keyframes pulse-border {
  0% {
    transform: scale(0.96);
    opacity: 0.8;
  }
  50% {
    transform: scale(1.08);
    opacity: 0;
  }
  100% {
    transform: scale(0.96);
    opacity: 0;
  }
}

@media (max-width: 640px) {
  .tool-issue-floating {
    bottom: 20px;
    inset-inline-end: 18px;
  }
  .floating-wa-link {
    width: 48px;
    height: 48px;
  }
  .floating-icon {
    width: 24px;
    height: 24px;
  }
}

/* Banner Mode Styles */
.tool-issue-banner {
  border-radius: 16px;
  border: 1px solid rgba(239, 68, 68, 0.28);
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(245, 158, 11, 0.04) 100%);
  padding: 24px;
  margin: 16px 0;
  box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.08);
}

.banner-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
}

.icon-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background-color: rgba(239, 68, 68, 0.15);
  color: #ef4444;
  flex-shrink: 0;
}

.banner-title {
  margin: 0 0 6px 0;
  font-size: 18px;
  font-weight: 700;
  color: #ef4444;
}

.banner-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  opacity: 0.85;
}

.error-details-box {
  margin-top: 16px;
  padding: 12px 16px;
  background-color: rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
  font-size: 12px;
  font-family: monospace;
}

.banner-actions {
  margin-top: 20px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: center;
}

.banner-wa-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #25d366;
  background: linear-gradient(135deg, #25d366 0%, #128c7e 100%);
  color: #ffffff !important;
  font-size: 14px;
  font-weight: 600;
  border-radius: 10px;
  text-decoration: none !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 4px 14px rgba(37, 211, 102, 0.4);
}

.banner-wa-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(37, 211, 102, 0.55);
}

.banner-retry-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 9px 18px;
  background: transparent;
  color: inherit;
  font-size: 14px;
  font-weight: 500;
  border-radius: 10px;
  border: 1px solid rgba(160, 160, 160, 0.3);
  cursor: pointer;
  transition: background-color 0.2s ease, border-color 0.2s ease;
}

.banner-retry-btn:hover {
  background-color: rgba(160, 160, 160, 0.15);
  border-color: rgba(160, 160, 160, 0.5);
}
</style>
