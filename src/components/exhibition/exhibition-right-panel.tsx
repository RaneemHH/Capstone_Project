import Lottie from "lottie-react";
import Animation1 from "@/assets/animations/loading_place.json";
import Animation2 from "@/assets/animations/Search.json";
import Animation3 from "@/assets/animations/exhibition_review.json";
import Animation4 from "@/assets/animations/Love_Emoji.json";

interface ExhibitionRightPanelProps {
    currentStep: number;
}

export default function ExhibitionRightPanel({ currentStep }: ExhibitionRightPanelProps) {
    // Render different content based on the current step
    const renderStepInfo = () => {
        switch (currentStep) {
            case 1:
                return {
                    stepLabel: "الخطوة 1",
                    title: "اختيار البلدية",
                    description: "اختر البلدية التي ترغب في إقامة المعرض فيها. يمكنك البحث حسب الاسم أو تصفية النتائج حسب الموقع.",
                    didYouKnow: "يجب الحصول على موافقة البلدية قبل إقامة أي معرض عام. تأكد من تقديم الطلب قبل 30 يوماً على الأقل من تاريخ المعرض."
                };
            case 2:
                return {
                    stepLabel: "الخطوة 2",
                    title: "إدارة المشاركين",
                    description: "أضف وأدر المشاركين في المعرض. يمكنك دعوة الطلاب والمنظمات للمشاركة في الفعالية.",
                    didYouKnow: "يمكنك إضافة عدد غير محدود من المشاركين. تأكد من تحديد الأدوار والصلاحيات لكل مشارك بشكل واضح."
                };
            case 3:
                return {
                    stepLabel: "الخطوة 3",
                    title: "التأكيد والجدولة",
                    description: "راجع الملخص المالي والجدول الزمني للمعرض. تأكد من تأكيد جميع التفاصيل قبل البدء.",
                    didYouKnow: "يتم حساب الإيرادات والمصروفات تلقائياً بناءً على رسوم الجامعات وتكاليف مقدمي الأنشطة."
                };
            case 4:
                return {
                    stepLabel: "الخطوة 4",
                    title: "التعليقات والتقييم",
                    description: "بعد انتهاء المعرض، يمكنك مراجعة التعليقات والتقييمات من المشاركين.",
                    didYouKnow: "التعليقات والتقييمات تساعد في تحسين تجربة المعارض المستقبلية."
                };

            default:
                return {
                    stepLabel: "الخطوة 1",
                    title: "اختيار البلدية",
                    description: "اختر البلدية التي ترغب في إقامة المعرض فيها.",
                    didYouKnow: "يجب الحصول على موافقة البلدية قبل إقامة أي معرض عام."
                };
        }
    };

    const stepInfo = renderStepInfo();

    // Select animation based on current step
    const getAnimation = () => {
        switch (currentStep) {
            case 1:
                return Animation1;
            case 2:
                return Animation2;
            case 3:
                return Animation3;
            case 4:
                return Animation4;
            default:
                return Animation4;
        }
    };

    return (
        <div className="hidden lg:flex relative lg:w-[30%] bg-[var(--panel-bg)] p-6 lg:p-8 flex-col">
            {/* Step Info */}
            <div className="mb-6">
                <p className="text-xs font-semibold text-primary tracking-wider mb-1">
                    {stepInfo.stepLabel}
                </p>
                <h2 className="text-xl font-bold text-foreground mb-4">
                    {stepInfo.title}
                </h2>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                    {stepInfo.description}
                </p>
            </div>

            {/* Illustration */}
            <div className="mb-6 flex justify-center items-center flex-grow">
                <div className={currentStep === 1 ? "bg-white w-80 aspect-square rounded-full border-4 border-primary/20 p-4 bg-primary/5 overflow-hidden flex items-center justify-center" : "w-80"}>
                    <Lottie
                        className="w-full h-full"
                        animationData={getAnimation()}
                        loop={true}
                    />
                </div>
            </div>

            {/* Did You Know Section */}
            <div className="mt-auto">
                <p className="text-xs font-bold text-foreground tracking-wide mb-2">
                    هل تعلم:
                </p>
                <p className="text-xs text-muted-foreground leading-relaxed mb-6">
                    {stepInfo.didYouKnow}
                </p>
                <p className="text-xs text-muted-foreground">
                    أسئلة؟{" "}
                    <a href="#" className="text-primary font-medium hover:underline">
                        تواصل مع خدمة العملاء.
                    </a>
                </p>
            </div>
        </div>
    );
}
