<script lang="ts" setup>
import { NIcon, useThemeVars } from 'naive-ui';
import { RouterLink } from 'vue-router';
import { Heart, Home2, Menu2, ShieldCheck } from '@vicons/tabler';

import { storeToRefs } from 'pinia';
import HeroGradient from '../assets/hero-gradient.svg?component';
import MenuLayout from '../components/MenuLayout.vue';
import NavbarButtons from '../components/NavbarButtons.vue';
import { useStyleStore } from '@/stores/style.store';
import { config } from '@/config';
import type { ToolCategory } from '@/tools/tools.types';
import { useToolStore } from '@/tools/tools.store';
import { useTracker } from '@/modules/tracker/tracker.services';
import CollapsibleToolMenu from '@/components/CollapsibleToolMenu.vue';
import AdSenseUnit from '@/components/AdSenseUnit.vue';

const themeVars = useThemeVars();
const styleStore = useStyleStore();
const version = config.app.version;
const commitSha = config.app.lastCommitSha.slice(0, 7);

const { tracker } = useTracker();
const { t } = useI18n();

const toolStore = useToolStore();
const { favoriteTools, toolsByCategory } = storeToRefs(toolStore);

const tools = computed<ToolCategory[]>(() => [
  ...(favoriteTools.value.length > 0 ? [{ name: t('tools.categories.favorite-tools'), components: favoriteTools.value }] : []),
  ...toolsByCategory.value,
]);
</script>

<template>
  <MenuLayout class="menu-layout" :class="{ isSmallScreen: styleStore.isSmallScreen }">
    <template #sider>
      <RouterLink to="/" class="hero-wrapper">
        <HeroGradient class="gradient" />
        <div class="text-wrapper">
          <div class="title">
            DevTool.it
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

        <CollapsibleToolMenu :tools-by-category="tools" />

        <!-- Sidebar Vertical/Rectangle Ad Unit -->
        <div class="px-3 my-4">
          <AdSenseUnit format="rectangle" min-height="250px" />
        </div>


      </div>
    </template>

    <template #content>
      <div class="min-h-full flex flex-col justify-between">
        <div>
          <div flex items-center justify-center gap-2 mb-6>
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

            <command-palette />

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
        <footer class="site-global-footer mt-20 border-t pt-10 pb-12 transition-colors duration-200">
          <div class="mx-auto max-w-6xl px-4 sm:px-6">
            <!-- Trust Badge: Client-side 100% Security Guarantee -->
            <div class="mb-8 flex flex-col items-center justify-center text-center">
              <div
                class="security-badge inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-medium transition-all"
              >
                <NIcon size="18" :component="ShieldCheck" class="text-emerald-500" />
                <span>100% Client-Side Processing &bull; No Server Storage &bull; Private & Secure</span>
              </div>
              <p class="mt-2 text-xs text-slate-500 dark:text-slate-400 max-w-md">
                All data, keys, and tokens are evaluated solely in your local browser sandbox.
              </p>
            </div>

            <!-- AdSense Compliance Links Navigation -->
            <div class="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium text-slate-600 dark:text-slate-300">
              <RouterLink to="/about" class="footer-nav-link">About Us</RouterLink>
              <RouterLink to="/privacy-policy" class="footer-nav-link">Privacy Policy</RouterLink>
              <RouterLink to="/terms-of-service" class="footer-nav-link">Terms of Service</RouterLink>
              <RouterLink to="/contact" class="footer-nav-link">Contact</RouterLink>
              <RouterLink to="/disclaimer" class="footer-nav-link">Disclaimer</RouterLink>
            </div>

            <!-- Copyright and Open Source Credit -->
            <div class="mt-8 text-center text-xs text-slate-400 dark:text-slate-500">
              <p>&copy; {{ new Date().getFullYear() }} IT-Tools. Free and open source under GNU GPLv3 license.</p>
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
      font-size: 25px;
      font-weight: 600;
      letter-spacing: -0.02em;
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
