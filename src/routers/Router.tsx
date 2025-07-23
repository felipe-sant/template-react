import { Route, BrowserRouter, Routes as Switch } from "react-router-dom";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import { Provider } from "react-redux"
import store from "../store/store";

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" element={
                    <Provider store={store}>
                        <Home />
                    </Provider>
                } />
                <Route path="*" element={<NotFound />} />
            </Switch>
        </BrowserRouter>
    );
}

export default Router