import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import Lottie from "lottie-react";
import Animation from "@/assets/animations/Submarine_periscope.json";
import logo from "@/assets/images/logo.jpg";

export default function Welcome() {

    return (
        <div className="min-h-screen bg-gradient-to-b from-secondary/30 to-background">
            <nav className="container mx-auto px-4 py-6" dir="rtl">
                <div className="flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-3 group">
                        <img
                            src={logo}
                            alt="logo"
                            className="h-12 w-12 rounded-full object-cover border-2 border-background shadow-lg group-hover:scale-110 transition-transform"
                        />
                        <span className="font-bold text-foreground hidden sm:block">
                            المركز الإسلامي للتوجيه
                        </span>
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/login" className="text-foreground/70 hover:text-primary transition-colors font-medium">
                            تسجيل الدخول
                        </Link>
                        <Link to="/register">
                            <Button
                                size="default"
                                className="rounded-lg"
                            >
                                ابدأ الآن
                            </Button>
                        </Link>
                    </div>
                </div>
            </nav>
            <section className="container mx-auto px-4 py-16 md:py-0">
                <div className="grid md:grid-cols-2 gap-12 items-center">
                    <div className="text-center md:text-right space-y-6" dir="rtl">
                        <h1 className="text-5xl md:text-6xl font-bold text-foreground leading-tight">
                            اكتشف شخصيتك
                            <span className="block text-primary mt-2">المهنية الآن</span>
                        </h1>
                        <p className="text-xl text-foreground/70 leading-relaxed">
                            اختبار هولاند المهني يساعدك على فهم نقاط قوتك واهتماماتك وأفضل المسارات المهنية التي تناسب شخصيتك الفريدة
                        </p>
                    </div>
                    <div className="relative">
                        <div className="absolute inset-0 bg-primary/20 rounded-full blur-3xl opacity-30 animate-pulse"></div>
                            <Lottie 
                                animationData={Animation} 
                                loop={true}
                            />                                    
                    </div>
                </div>
            </section>
        </div>
    );
}