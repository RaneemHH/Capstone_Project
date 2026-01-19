import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { CheckCircle2, Edit, Eye } from 'lucide-react';
import { Badge } from '../ui/badge';
import type { Trait } from './step2-traits.tsx';
import type { Section } from './step3-sections.tsx';

interface Step1Data {
  title: string;
  description: string;
}

interface Step4PreviewProps {
  generalInfo: Step1Data;
  traits: Trait[];
  sections: Section[];
  onEdit: (step: number) => void;
  onPublish: () => void;
}

export function Step4Preview({
  generalInfo,
  traits,
  sections,
  onEdit,
  onPublish,
}: Step4PreviewProps) {
  const totalQuestions = sections.reduce((sum, section) => sum + section.questions.length, 0);

  const checklist = [
    {
      id: 1,
      label: 'تم إدخال العنوان والوصف',
      completed: generalInfo.title.trim() !== '',
    },
    {
      id: 2,
      label: 'تم إعداد الخصائص',
      completed: traits.length > 0,
    },
    {
      id: 3,
      label: 'تم إنشاء الأقسام والأسئلة',
      completed: sections.length > 0 && totalQuestions > 0,
    },
  ];

  const allCompleted = checklist.every(item => item.completed);

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">المعاينة والنشر</CardTitle>
          <CardDescription className="text-base">
            راجع معلومات العرض قبل نشره
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Checklist */}
          <div className="space-y-3">
            <h3 className="font-semibold text-lg mb-4">قائمة المراجعة</h3>
            {checklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center gap-3 p-3 rounded-lg bg-background/50"
              >
                <CheckCircle2
                  className={`w-6 h-6 shrink-0 ${
                    item.completed ? 'text-accent' : 'text-muted-foreground/30'
                  }`}
                />
                <span
                  className={
                    item.completed ? 'text-foreground' : 'text-muted-foreground'
                  }
                >
                  {item.label}
                </span>
              </div>
            ))}
          </div>

          {/* Preview Panel */}
          <div className="border-2 border-border rounded-lg p-6 bg-gradient-to-br from-primary/20 to-secondary/30">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-foreground mb-2">
                  {generalInfo.title || 'عنوان العرض'}
                </h2>
                <p className="text-muted-foreground">
                  {generalInfo.description || 'لا يوجد وصف'}
                </p>
              </div>
              <Eye className="w-6 h-6 text-primary shrink-0" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-1">
                  {sections.length}
                </div>
                <div className="text-sm text-muted-foreground">أقسام</div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-accent mb-1">
                  {totalQuestions}
                </div>
                <div className="text-sm text-muted-foreground">أسئلة</div>
              </div>
              <div className="bg-card p-4 rounded-lg shadow-sm">
                <div className="text-3xl font-bold text-primary mb-1">
                  {traits.length}
                </div>
                <div className="text-sm text-muted-foreground">خصائص</div>
              </div>
            </div>

            {sections.length > 0 && (
              <div className="mt-6 space-y-3">
                <h4 className="font-semibold text-foreground">نظرة عامة على الأقسام:</h4>
                {sections.map((section, index) => (
                  <div
                    key={section.id}
                    className="bg-card p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="shrink-0">
                        {index + 1}
                      </Badge>
                      <span className="font-medium">{section.name}</span>
                    </div>
                    <span className="text-sm text-muted-foreground">
                      {section.questions.length} سؤال
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Edit Links */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(1)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل المعلومات العامة
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(2)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل الخصائص
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEdit(3)}
              className="text-primary hover:text-primary/80 hover:bg-primary/10"
            >
              <Edit className="w-4 h-4 ml-2" />
              تعديل الأقسام والأسئلة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Publish Button */}
      <Card className="border-0 shadow-lg bg-gradient-to-br from-accent/20 to-accent/30">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-xl font-bold text-foreground mb-2">
              هل أنت مستعد للنشر؟
            </h3>
            <p className="text-muted-foreground mb-6">
              بعد النشر، سيكون العرض متاحاً للمستخدمين
            </p>
            <Button
              onClick={onPublish}
              disabled={!allCompleted}
              size="lg"
              className="bg-accent hover:bg-accent/80 text-accent-foreground px-12 py-6 text-lg h-auto"
            >
              <CheckCircle2 className="w-6 h-6 ml-3" />
              نشر العرض
            </Button>
            {!allCompleted && (
              <p className="text-sm text-destructive mt-4">
                يرجى إكمال جميع الخطوات قبل النشر
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
