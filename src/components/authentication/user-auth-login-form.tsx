
import * as React from "react"
import { Icons } from "@/components/icons.tsx"
import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { signIn } from "@/services/user-profile-service.ts";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth-store.tsx";

// interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

// export function UserAuthLoginForm({ className, ...props }: UserAuthFormProps) {
export function UserAuthLoginForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const navigate = useNavigate();
    const { setToken } = useAuthStore();

    async function handleLogIn(event: React.SyntheticEvent) {
        try {
            event.preventDefault()
            setIsLoading(true)
            const response = await signIn({
                username: email,
                password: password,

            });
            console.log("response", response)
            setToken(response.accessToken, response.refreshToken);
            toast.success("تم تسجيل الدخول بنجاح", {
                description: "مرحباً بك في المنصة",
            });
            navigate("/dashboard");
            console.log("Login response:", response)
        } catch (error) {
            toast.error("فشل تسجيل الدخول", {
                description: error instanceof Error ? error.message : String(error),
            });
        }
        finally {
            setIsLoading(false)
        }
    }
    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleLogIn}>
                <div className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            البريد الإلكتروني
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="name@example.com"
                            type="email"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="password">
                            كلمة المرور
                        </Label>
                        <Input
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="أدخل كلمة المرور"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="email"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <Button disabled={isLoading} type="submit">
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        تسجيل الدخول
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">
                        أو تابع باستخدام
                    </span>
                </div>
            </div>
            <div className="grid grid-cols-1 gap-4">
                <Button variant="outline" type="button" disabled={isLoading} onClick={handleGoogleAuth}>
                    {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.google className="mr-2 h-4 w-4" />
                    )}{" "}
                    Google
                </Button>
            </div>
        </div>
    )
    function handleGoogleAuth() {
        try {
            setIsLoading(true)
            const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
            // Start OAuth at the backend endpoint; backend should be configured to redirect to Google
            window.location.href = `${API_BASE_URL}/oauth2/authorization/google`
        } catch {
            setIsLoading(false)
        }
    }
}
