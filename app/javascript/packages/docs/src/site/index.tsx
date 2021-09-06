import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

import Docs from './docs';

export default function MainLayout() {
  return (
    <BrowserRouter>
      <Switch>
        <Route
          path={'/:lang?(en|es)?'}
          render={(props) => <Docs {...props} />}
        />

        <Route path={'/'} render={(props) => <Docs {...props} />} />

        <Route render={(_props) => <p>404 not found</p>} />
      </Switch>
    </BrowserRouter>
  );
}
