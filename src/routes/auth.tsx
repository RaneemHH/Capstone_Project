import {LoginAuthentication} from "@/pages/login.tsx"
import {RegisterAuthentication} from "@/pages/register.tsx"
import OAuth2Callback from "@/pages/oauth2-callback.tsx"


export const authRoutes = [
    { path: "login", element: <LoginAuthentication /> },
    { path: "register", element: <RegisterAuthentication /> },
    { path: "oauth2/callback", element: <OAuth2Callback /> }
];
