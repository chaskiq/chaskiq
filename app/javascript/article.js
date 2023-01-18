import React from 'react';
import Article from '@chaskiq/messenger/src/client_messenger/articles';
import { createRoot } from 'react-dom/client';

// eslint-disable-next-line no-undef
document.addEventListener('DOMContentLoaded', () => {
  const root = createRoot(document.getElementById('main-page'));
  root.render(<Article />);
});
