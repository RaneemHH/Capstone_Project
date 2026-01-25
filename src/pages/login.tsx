import { Link } from 'react-router-dom';
import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"
import { UserAuthLoginForm } from "@/components/authentication/user-auth-login-form"
import Lottie from 'lottie-react';
import Animation from '@/assets/animations/Login.json';

export function LoginAuthentication() {
    return (
        <>

            <div className="relative overflow-hidden h-dvh w-dvw flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0">
                <Link
                    to="/register"
                    className={cn(
                        buttonVariants({ variant: "ghost" }),
                        "absolute left-4 top-4 md:left-8 md:top-8"
                    )}
                >
                    إنشاء حساب
                </Link>
                <div className="relative hidden h-full flex-col bg-muted p-10 text-primary-foreground dark:border-r lg:flex">
                    <div className="absolute inset-0 bg-primary" />
                    <div className="relative z-20 flex items-center text-lg font-medium">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            className="mr-2 h-6 w-6"
                        >
                            <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
                        </svg>
                        المركز الإسلامي للتوجيه
                    </div>
                    <div>
                        <Lottie
                            className="h-[500px]"
                            animationData={Animation}
                            loop={true}
                        />
                    </div>
                    <div className="relative z-20 mt-auto pb-10">
                        <blockquote className="space-y-2">
                            <p className="text-lg">
                                &ldquo;ساعدني هذا الاختبار في اكتشاف مساري المهني المناسب وفهم نقاط قوتي بشكل أفضل.&rdquo;
                            </p>
                            <footer className="text-sm">أحمد المالكي</footer>
                        </blockquote>
                    </div>
                </div>
                <div className="w-dvw lg:w-full p-8">
                    <div className="mx-auto flex w-full h-dvh flex-col justify-center space-y-6 sm:w-[350px]">
                        <div className="flex flex-col space-y-2 text-center">
                            <h1 className="text-2xl font-semibold tracking-tight">
                                تسجيل الدخول
                            </h1>
                            <p className="text-sm text-muted-foreground">
                                أدخل بريدك الإلكتروني للدخول إلى حسابك
                            </p>
                        </div>
                        <UserAuthLoginForm />
                        <p className="px-8 text-center text-sm text-muted-foreground">
                            بالنقر على متابعة، فإنك توافق على{" "}
                            <Link
                                to="/terms"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                شروط الخدمة
                            </Link>{" "}
                            و{" "}
                            <Link
                                to="/privacy"
                                className="underline underline-offset-4 hover:text-primary"
                            >
                                سياسة الخصوصية
                            </Link>
                            .
                        </p>
                    </div>
                </div>
            </div>
        </>
    )
}
