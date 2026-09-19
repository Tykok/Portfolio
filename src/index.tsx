import React from 'react';
import ReactDOM from 'react-dom/client';

import { hideSeoDocument } from './seo/mount';
import Main from './Main';

import './index.scss';
import './styles/design.css';
import './styles/os.css';

/* Avant le rendu : la page prérendue est visible jusqu'ici, et la laisser
   sous un OS en train d'apparaître produirait un empilement visible. */
hideSeoDocument(document);

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>,
);
