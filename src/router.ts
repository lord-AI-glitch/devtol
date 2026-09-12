import { createRouter, createWebHistory } from 'vue-router';
import { layouts } from './layouts/index';
import HomePage from './pages/Home.page.vue';
import NotFound from './pages/404.page.vue';
import { tools } from './tools';
import { config } from './config';
import { routes as demoRoutes } from './ui/demo/demo.routes';

const toolsRoutes = tools.map(({ path, name, component, ...config }) => ({
  path,
  name,
  component,
  meta: { isTool: true, layout: layouts.toolLayout, name, ...config },
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
    ...toolsRedirectRoutes,
    ...(config.app.env === 'development' ? demoRoutes : []),
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFound },
  ],
});

export default router;
