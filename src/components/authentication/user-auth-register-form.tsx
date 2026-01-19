import * as React from "react"
import { Icons } from "@/components/icons.tsx"
import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import { signUp } from "@/services/user-profile-service.ts";

// interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

// export function UserAuthRegisterForm({ className, ...props }: UserAuthFormProps) {
export function UserAuthRegisterForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [name, setName] = React.useState<string>("");
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");

    async function handleSignUp(event: React.SyntheticEvent) {
        try {
            event.preventDefault()
            setIsLoading(true)
            const message = await signUp({
                name: name,
                email: email,
                password: password,
                gender: "FEMALE",
                // roles: "ROLE_USER",
            });
            setIsLoading(false)
            alert(message)
            // setTimeout(() => {
            //     setIsLoading(false)
            // }, 3000)
            console.log("Sign up success:", message);
        } catch (error) {
            console.error("Sign up failed:", error);
            alert(error);
            setIsLoading(false);
        }
    }
    return (
        <div className={cn("grid gap-6", className)} {...props}>
            <form onSubmit={handleSignUp}>
                <div className="grid gap-2">
                    <div className="grid gap-2">
                        <Label htmlFor="name">
                            الاسم
                        </Label>
                        <Input
                            id="name"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="أدخل اسمك"
                            type="name"
                            autoCapitalize="none"
                            autoComplete="name"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="email">
                            البريد الإلكتروني
                        </Label>
                        <Input
                            id="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
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
                            onChange={(event) => setPassword(event.target.value)}
                            placeholder="أدخل كلمة المرور"
                            type="password"
                            autoCapitalize="none"
                            autoComplete="current-password"
                            autoCorrect="off"
                            disabled={isLoading}
                        />
                    </div>
                    <Button disabled={isLoading} type="submit">
                        {isLoading && (
                            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        إنشاء حساب
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
                <Button variant="outline" type="button" disabled={isLoading}
                    onClick={handleGoogleAuth}>
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



