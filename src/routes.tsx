import React, { Suspense, lazy } from 'react';
import {Route, BrowserRouter, Switch } from 'react-router-dom';

const Home = lazy(() => import('./pages/Home'));
const CreatePoint = lazy(() => import('./pages/CreatePoint'));

const Routes = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<div className="loader"></div>}>
                <Switch>
                    <Route component={Home} path="/" exact/>
                    <Route component={CreatePoint} path="/create-point"/>
                </Switch>
            </Suspense>
        </BrowserRouter>
    );
}

export default Routes;