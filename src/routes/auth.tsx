import {LoginAuthentication} from "@/pages/login.tsx"
import {RegisterAuthentication} from "@/pages/register.tsx"


export const authRoutes = [
    { path: "login", element: <LoginAuthentication /> },
    { path: "register", element: <RegisterAuthentication /> }
];