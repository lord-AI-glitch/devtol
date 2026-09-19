import { createRouter, createWebHistory } from 'vue-router';
import { layouts } from './layouts/index';
import HomePage from './pages/Home.page.vue';
import NotFound from './pages/404.page.vue';
import { tools } from './tools';
import { config } from './config';
import { routes as demoRoutes } from './ui/demo/demo.routes';
import { i18n } from './plugins/i18n.plugin';

export const supportedLangs = ['ar', 'de', 'es', 'fr', 'no', 'pt', 'uk', 'vi', 'zh'] as const;

const toolsRoutes = tools.map(({ path, name, component, ...config }) => ({
  path,
  name,
  component,
  meta: { isTool: true, layout: layouts.toolLayout, name, ...config },
}));

const localizedToolsRoutes = supportedLangs.flatMap(lang =>
  tools.map(({ path, name, component, ...config }) => ({
    path: `/${lang}${path.startsWith('/') ? path : `/${path}`}`,
    name: `${lang}-${name}`,
    component,
    meta: { isTool: true, layout: layouts.toolLayout, name, lang, ...config },
  })),
);

const localizedHomeRoutes = supportedLangs.map(lang => ({
  path: `/${lang}`,
  name: `${lang}-home`,
  component: HomePage,
  meta: { lang },
}));

const localizedDealsRoutes = supportedLangs.map(lang => ({
  path: `/${lang}/deals`,
  name: `${lang}-deals`,
  component: () => import('./pages/Deals.page.vue'),
  meta: { lang },
}));

const toolsRedirectRoutes = tools
  .filter(({ redirectFrom }) => redirectFrom && redirectFrom.length > 0)
  .flatMap(
    ({ path, redirectFrom }) => redirectFrom?.map(redirectSource => ({ path: redirectSource, redirect: path })) ?? [],
  );

const router = createRouter({
  history: createWebHistory(config.app.baseUrl),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage,
    },
    ...localizedHomeRoutes,
    {
      path: '/deals',
      name: 'deals',
      component: () => import('./pages/Deals.page.vue'),
    },
    ...localizedDealsRoutes,
    {
      path: '/about',
      name: 'about',
      component: () => import('./pages/legal/AboutUs.vue'),
    },
    {
      path: '/about-us',
      name: 'about-us',
      component: () => import('./pages/legal/AboutUs.vue'),
    },
    {
      path: '/privacy-policy',
      name: 'privacy-policy',
      component: () => import('./pages/legal/PrivacyPolicy.vue'),
    },
    {
      path: '/privacy',
      name: 'privacy',
      component: () => import('./pages/legal/PrivacyPolicy.vue'),
    },
    {
      path: '/terms-of-service',
      name: 'terms-of-service',
      component: () => import('./pages/legal/TermsOfService.vue'),
    },
    {
      path: '/terms',
      name: 'terms',
      component: () => import('./pages/legal/TermsOfService.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('./pages/legal/ContactUs.vue'),
    },
    {
      path: '/contact-us',
      name: 'contact-us',
      component: () => import('./pages/legal/ContactUs.vue'),
    },
    {
      path: '/disclaimer',
      name: 'disclaimer',
      component: () => import('./pages/legal/Disclaimer.vue'),
    },
    ...toolsRoutes,
    ...localizedToolsRoutes,
    ...toolsRedirectRoutes,
    ...(config.app.env === 'development' ? demoRoutes : []),
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

router.beforeEach((to, _from, next) => {
  const langMatch = to.path.match(/^\/(ar|de|es|fr|no|pt|uk|vi|zh)(\/|$)/);
  if (langMatch) {
    const lang = langMatch[1];
    // @ts-ignore
    i18n.global.locale.value = lang;
  }
  next();
});

export default router;
