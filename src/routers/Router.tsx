import { Route, BrowserRouter, Routes as Switch } from "react-router-dom";
import Home from "@/pages/Home.page";
import NotFound from "@/pages/NotFound.page";

export function AppRoutes() {
    return (
        <Switch>
            <Route path="/" element={<Home />} />
            <Route path="*" element={<NotFound />} />
        </Switch>
    );
}

function Router() {
    return (
        <BrowserRouter>
            <AppRoutes />
        </BrowserRouter>
    );
}

export default Router
