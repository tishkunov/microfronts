declare module 'react_app1/CatalogApp' {
  import { ComponentType } from 'react';
  const CatalogApp: ComponentType<any>;
  export default CatalogApp;
}

declare module 'react_app2/CartApp' {
  import { ComponentType } from 'react';
  const CartApp: ComponentType<any>;
  export default CartApp;
}

declare module 'vue_app/AdminApp' {
  import { DefineComponent } from 'vue';
  const AdminApp: DefineComponent<{}, {}, any>;
  export default AdminApp;
}

// Legacy declarations for backwards compatibility
declare module 'reactApp1/ChartComponent' {
  import { ComponentType } from 'react';
  const ChartComponent: ComponentType<any>;
  export default ChartComponent;
}

declare module 'reactApp2/CounterComponent' {
  import { ComponentType } from 'react';
  const CounterComponent: ComponentType<any>;
  export default CounterComponent;
}

declare module 'vueApp/FormComponent' {
  import { DefineComponent } from 'vue';
  const FormComponent: DefineComponent<{}, {}, any>;
  export default FormComponent;
}

