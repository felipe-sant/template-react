import { Route, BrowserRouter, Routes as Switch } from "react-router-dom";
import Home from "@/pages/Home.page";
import NotFound from "@/pages/NotFound.page";

function Router() {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" element={<Home />} />
                <Route path="*" element={<NotFound />} />
            </Switch>
        </BrowserRouter>
    );
}

export default Router