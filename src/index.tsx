import React from 'react';
import ReactDOM from 'react-dom/client';

import Main from './Main';

import './index.scss';
import './styles/design.css';
import './styles/os.css';

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
