import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '../ui/label';
import type { ChangeEvent } from 'react';

interface Step1Data {
  title: string;
  description: string;
}

interface Step1GeneralInfoProps {
  data: Step1Data;
  onChange: (data: Step1Data) => void;
}

export function Step1GeneralInfo({ data, onChange }: Step1GeneralInfoProps) {
  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>): void => {
    onChange({ ...data, title: e.target.value });
  };

  const handleDescriptionChange = (e: ChangeEvent<HTMLTextAreaElement>): void => {
    onChange({ ...data, description: e.target.value });
  };

  return (
    <Card className="border-0 shadow-lg">
      <CardHeader>
        <CardTitle className="text-2xl">المعلومات العامة</CardTitle>
        <CardDescription className="text-base">
          أدخل عنوان واختيار وصف لعرضك الجديد
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="title" className="text-base">
            عنوان العرض <span className="text-destructive">*</span>
          </Label>
          <Input
            id="title"
            value={data.title}
            onChange={handleTitleChange}
            placeholder="أدخل عنوان العرض هنا"
            className="text-base h-12"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-base">
            وصف العرض <span className="text-muted-foreground">(اختياري)</span>
          </Label>
          <Textarea
            id="description"
            value={data.description}
            onChange={handleDescriptionChange}
            placeholder="أدخل وصفاً تفصيلياً للعرض التقديمي"
            className="text-base min-h-[120px] resize-none"
            rows={5}
          />
          <p className="text-sm text-muted-foreground">
            يمكنك إضافة وصف تفصيلي لمساعدة المستخدمين على فهم محتوى العرض
          </p>
        </div>
      </CardContent>
    </Card>
  );
}