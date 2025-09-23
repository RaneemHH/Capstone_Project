import {createBrowserRouter, RouterProvider} from "react-router-dom";
import Welcome from "./pages/welcome.tsx";
import { authRoutes } from "./routes/auth";
import {MainLayout} from "@/layout/main-layout.tsx";

function App() {

    const router = createBrowserRouter([
        {path:'/',
        element:<MainLayout/>,
           children:[
               {index: true, element:<Welcome />}
           ],
        },
        ...authRoutes,
        {path:'*', element:<h1>404 Not Found</h1>},
    ]);


    return (
    <>
        <RouterProvider router={router}/>
    </>
  )
}

export default App
