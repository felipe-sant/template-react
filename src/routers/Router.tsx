import { lazy, useState } from "react"
import { createBrowserRouter, RouterProvider, type RouteObject } from "react-router-dom"
import MainLayout from "@/layouts/Main.layout"
import ErrorPage from "@/pages/Error.page"
import RequireAuth from "@/routers/RequireAuth"
import { ROUTES } from "@/routers/paths"

const Home = lazy(() => import("@/pages/Home.page"))
const NotFound = lazy(() => import("@/pages/NotFound.page"))
const ProtectedExample = lazy(() => import("@/pages/ProtectedExample.page"))
const Forbidden = lazy(() => import("@/pages/Forbidden.page"))
const ExampleList = lazy(() => import("@/pages/ExampleList.page"))

export const routes: RouteObject[] = [
    {
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                path: ROUTES.home,
                element: <Home />
            },
            {
                path: ROUTES.forbidden,
                element: <Forbidden />
            },
            {
                path: ROUTES.examples,
                element: <ExampleList />
            },
            {
                element: <RequireAuth />,
                children: [
                    {
                        path: ROUTES.protectedExample,
                        element: <ProtectedExample />
                    }
                ]
            },
            {
                path: ROUTES.notFound,
                element: <NotFound />
            }
        ]
    }
]

function Router() {
    const [router] = useState(() => createBrowserRouter(routes))

    return <RouterProvider router={router} />
}

export default Router
