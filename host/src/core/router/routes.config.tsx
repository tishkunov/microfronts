import { lazy } from 'react';
import { RouteObject } from 'react-router-dom';
import VueWrapper from '../../components/VueWrapper';

// Lazy load microfrontends (only entry points)
export const CatalogApp = lazy(() => import('react_app1/CatalogApp'));
export const CartApp = lazy(() => import('react_app2/CartApp'));

// Vue component wrapper
const AdminAppWrapper = () => (
  <VueWrapper componentLoader={() => import('vue_app/AdminApp')} />
);

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <CatalogApp />,
  },
  {
    path: '/cart',
    element: <CartApp />,
  },
  {
    path: '/admin',
    element: <AdminAppWrapper />,
  },
];

