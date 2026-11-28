<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';
import { RouterLink, useRoute } from 'vue-router';
import { Heart, Home2, Menu2, ShieldCheck } from '@vicons/tabler';

import { storeToRefs } from 'pinia';
import { computed, defineAsyncComponent, ref, watch } from 'vue';
import HeroGradient from '../assets/hero-gradient.svg?component';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import { useTracker } from '@/modules/tracker/tracker.services';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';

const CommandPalette = defineAsyncComponent(() => import('@/modules/command-palette/command-palette.vue'));

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);

const { tracker } = useTracker();
const { t } = useI18n();
const route = useRoute();

const currentLangPrefix = computed(() => {
  const p = route?.path || '';
  const match = p.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)(?:\/|$)/);
  return match ? `/${match[1]}` : '';
});

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);

// Lazy sidebar menu: on mobile the sider starts collapsed, so the ~122 menu
// items never mount on initial load. The menu mounts the first time the
// sider is opened and stays mounted afterwards (no re-mount cost on later
// toggles). On desktop the sider starts open, so the menu mounts on first
// render exactly as before.
const menuMounted = ref(!styleStore.isMenuCollapsed);
watch(() => styleStore.isMenuCollapsed, (collapsed) => {
  if (!collapsed) {
    menuMounted.value = true;
  }
});
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="hero-wrapper">
        <HeroGradient class="gradient" />
        <div class="text-wrapper">
          <div class="title">
            <span class="brand-dev">Dev</span><span class="brand-tol">Tol</span>
          </div>
          <div class="divider" />
          <div class="subtitle">
            {{ $t('home.subtitle') }}
          </div>
        </div>
      </RouterLink>

      <div class="sider-content">
        <div v-if="styleStore.isSmallScreen" flex flex-col items-center>
          <locale-selector w="90%" />

          <div flex justify-center>
            <NavbarButtons />
          </div>
        </div>

        <CollapsibleToolMenu v-if="menuMounted" :tools-by-category="tools" />
      </div>
    </template>

    <template #content>
      <div class="min-h-full flex flex-col justify-between">
        <div>
          <div mb-6 flex items-center justify-center gap-2>
            <c-button
              circle
              variant="text"
              :aria-label="$t('home.toggleMenu')"
              @click="styleStore.isMenuCollapsed = !styleStore.isMenuCollapsed"
            >
              <NIcon size="25" :component="Menu2" />
            </c-button>

            <c-tooltip :tooltip="$t('home.home')" position="bottom">
              <c-button to="/" circle variant="text" :aria-label="$t('home.home')">
                <NIcon size="25" :component="Home2" />
              </c-button>
            </c-tooltip>

            <CommandPalette />

            <locale-selector v-if="!styleStore.isSmallScreen" />

            <div>
              <NavbarButtons v-if="!styleStore.isSmallScreen" />
            </div>

            <c-tooltip position="bottom" :tooltip="$t('home.support')">
              <c-button
                round
                href="https://buymeacoffee.com/lordrealstx"
                rel="noopener"
                target="_blank"
                class="support-button"
                :bordered="false"
                @click="() => tracker.trackEvent({ eventName: 'Support button clicked' })"
              >
                {{ $t('home.buyMeACoffee') }}
                <NIcon v-if="!styleStore.isSmallScreen" :component="Heart" ml-2 />
              </c-button>
            </c-tooltip>
          </div>

          <slot />
        </div>

        <!-- High-Craft AdSense & Compliance Global Footer -->
        <footer class="site-global-footer mt-20 border-t pb-12 pt-10 transition-colors duration-200">
          <div class="mx-auto max-w-6xl px-4 sm:px-6">
            <!-- Trust Badge: Client-side 100% Security Guarantee -->
            <div class="mb-8 flex flex-col items-center justify-center text-center">
              <div
                class="security-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
              >
                <NIcon size="18" :component="ShieldCheck" class="text-emerald-500" />
                <span>{{ $t('home.footer.securityBadge') }}</span>
              </div>
              <p class="mt-2 max-w-md text-xs text-slate-500 dark:text-slate-400">
                {{ $t('home.footer.securitySubtext') }}
              </p>
            </div>

            <!-- AdSense Compliance Links Navigation -->
            <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-slate-600 font-medium dark:text-slate-300">
              <RouterLink :to="`${currentLangPrefix}/pdf-tools`" class="footer-nav-link text-emerald-600 font-bold dark:text-emerald-400">
                {{ $t('home.footer.pdfTools', 'PDF Tools') }}
              </RouterLink>
              <RouterLink :to="`${currentLangPrefix}/guides`" class="footer-nav-link text-indigo-600 font-bold dark:text-indigo-400">
                {{ $t('home.footer.guides') }}
              </RouterLink>
              <RouterLink :to="`${currentLangPrefix}/about`" class="footer-nav-link">
                {{ $t('home.footer.about') }}
              </RouterLink>
              <RouterLink :to="`${currentLangPrefix}/privacy-policy`" class="footer-nav-link">
                {{ $t('home.footer.privacy') }}
              </RouterLink>
              <RouterLink :to="`${currentLangPrefix}/terms-of-service`" class="footer-nav-link">
                {{ $t('home.footer.terms') }}
              </RouterLink>
              <RouterLink :to="`${currentLangPrefix}/contact`" class="footer-nav-link">
                {{ $t('home.footer.contact') }}
              </RouterLink>
              <RouterLink :to="`${currentLangPrefix}/disclaimer`" class="footer-nav-link">
                {{ $t('home.footer.disclaimer') }}
              </RouterLink>
            </div>

            <!-- Copyright and Open Source Credit -->
            <div class="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
              <p>&copy; {{ new Date().getFullYear() }} DevTol. {{ $t('home.footer.copyright') }}</p>
            </div>
          </div>
        </footer>
      </div>
    </template>
  </MenuLayout>
</template>

<style lang="less" scoped>
.support-button {
  background: #312E81;
  background: linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #4338CA 100%);
  color: #fff !important;
  transition: padding ease 0.2s, box-shadow ease 0.2s !important;

  &:hover {
    color: #fff;
    padding-left: 30px;
    padding-right: 30px;
    box-shadow: 0 4px 14px rgba(49, 46, 129, 0.4);
  }
}

.footer {
  text-align: center;
  color: #838587;
  margin-top: 20px;
  padding: 20px 0;
}

.sider-content {
  padding-top: 160px;
  padding-bottom: 200px;
}

.hero-wrapper {
  position: absolute;
  display: block;
  left: 0;
  width: 100%;
  z-index: 10;
  overflow: hidden;

  .gradient {
    margin-top: -65px;
  }

  .text-wrapper {
    position: absolute;
    left: 0;
    width: 100%;
    text-align: center;
    top: 16px;
    color: #fff;

    .title {
      font-size: 26px;
      font-weight: 700;
      letter-spacing: -0.03em;
      font-family: 'JetBrains Mono', monospace, -apple-system, BlinkMacSystemFont, sans-serif;

      .brand-dev {
        color: #ffffff;
      }

      .brand-tol {
        color: #34d399;
        text-shadow: 0 0 16px rgba(52, 211, 153, 0.45);
      }
    }

    .divider {
      width: 50px;
      height: 2px;
      border-radius: 4px;
      background-color: v-bind('themeVars.primaryColor');
      margin: 0 auto 5px;
    }

    .subtitle {
      font-size: 16px;
      opacity: 0.85;
    }
  }
}

.site-global-footer {
  border-color: #e2e8f0;

  :global(.dark) & {
    border-color: #282845;
    background-color: #0F0F23;
  }
}

.security-badge {
  background-color: #f1f5f9;
  color: #334155;
  border: 1px solid #e2e8f0;

  :global(.dark) & {
    background-color: #1B1B30;
    color: #e2e8f0;
    border-color: #282845;
  }
}

.footer-nav-link {
  transition: color 0.15s ease-in-out;
  text-decoration: none;

  &:hover {
    color: #F97316;
  }
}
</style>
