
import * as React from "react"
import { Icons } from "@/components/icons.tsx"
import { cn } from "@/lib/utils.ts"
import { Button } from "@/components/ui/button.tsx"
import { Input } from "@/components/ui/input.tsx"
import { Label } from "@/components/ui/label.tsx"
import {signIn} from "@/services/auth-service.ts";
import {useNavigate} from "react-router-dom";

// interface UserAuthFormProps extends React.HTMLAttributes<HTMLDivElement> {}

// export function UserAuthLoginForm({ className, ...props }: UserAuthFormProps) {
export function UserAuthLoginForm({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [email, setEmail] = React.useState<string>("");
    const [password, setPassword] = React.useState<string>("");
    const navigate = useNavigate();

    async function handleLogIn(event: React.SyntheticEvent) {
        try {
            event.preventDefault()
            setIsLoading(true)
            const message = await signIn({
                username: email,
                password: password,

            });
            navigate("/home");
            alert(message)
        } catch (error) {
            alert(error);
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
                        <Label  htmlFor="email">
                            Email
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
                            Password
                        </Label>
                        <Input
                            id="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Enter your password"
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
                        Sign In with Email
                    </Button>
                </div>
            </form>
            <div className="relative">
                <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">
            Or continue with
          </span>
                </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
                <Button variant="outline" type="button" disabled={isLoading}>
                    {isLoading ? (
                        <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Icons.gitHub className="mr-2 h-4 w-4" />
                    )}{" "}
                    GitHub
                </Button>
                <Button variant="outline" type="button" disabled={isLoading}>
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
}
