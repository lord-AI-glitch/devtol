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

const dockerTool = tools.find(t => t.path === '/docker-run-to-docker-compose-converter');
const colorTool = tools.find(t => t.path === '/color-converter');
const dateTool = tools.find(t => t.path === '/date-converter');

const programmaticRoutes = [
  {
    path: '/docker-run-to-docker-compose-converter/:preset',
    name: 'docker-run-preset',
    component: dockerTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dockerTool?.name },
  },
  {
    path: '/docker-run-to-compose/:preset',
    name: 'docker-run-to-compose-preset',
    component: dockerTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dockerTool?.name },
  },
  {
    path: '/color-converter/:pair',
    name: 'color-converter-pair',
    component: colorTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: colorTool?.name },
  },
  {
    path: '/date-converter/:pair',
    name: 'date-converter-pair',
    component: dateTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dateTool?.name },
  },
  {
    path: '/date-time-converter/:pair',
    name: 'date-time-converter-pair',
    component: dateTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dateTool?.name },
  },
];

const localizedProgrammaticRoutes = supportedLangs.flatMap(lang => [
  {
    path: `/${lang}/docker-run-to-docker-compose-converter/:preset`,
    name: `${lang}-docker-run-preset`,
    component: dockerTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dockerTool?.name, lang },
  },
  {
    path: `/${lang}/docker-run-to-compose/:preset`,
    name: `${lang}-docker-run-to-compose-preset`,
    component: dockerTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dockerTool?.name, lang },
  },
  {
    path: `/${lang}/color-converter/:pair`,
    name: `${lang}-color-converter-pair`,
    component: colorTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: colorTool?.name, lang },
  },
  {
    path: `/${lang}/date-converter/:pair`,
    name: `${lang}-date-converter-pair`,
    component: dateTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dateTool?.name, lang },
  },
  {
    path: `/${lang}/date-time-converter/:pair`,
    name: `${lang}-date-time-converter-pair`,
    component: dateTool?.component,
    meta: { isTool: true, layout: layouts.toolLayout, name: dateTool?.name, lang },
  },
]);

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
    ...programmaticRoutes,
    ...localizedProgrammaticRoutes,
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
