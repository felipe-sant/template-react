import { Route, BrowserRouter, Routes as Switch } from "react-router-dom";
import Home from "../pages/home";
import NotFound from "../pages/notFound";

export default function Routers() {
  return (
    <BrowserRouter>
      <Switch>
        <Route path="/" element={<Home />} />
        <Route path="*" element={<NotFound />} />
      </Switch>
    </BrowserRouter>
  );
}