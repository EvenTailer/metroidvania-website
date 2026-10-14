import React from 'react';
import { Provider } from 'react-redux';
import { App } from '../App';
import { store } from '../store';

export function Providers() {
  return (
    <React.StrictMode>
      <Provider store={store}>
        <App />
      </Provider>
    </React.StrictMode>
  );
}
