import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '../ui/accordion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Plus, Edit2, Trash2, GripVertical } from 'lucide-react';
import { useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

export interface Question {
  id: string;
  text: string;
  type: string;
  options?: string[];
}

export interface Section {
  id: string;
  name: string;
  questions: Question[];
}

interface Step3SectionsProps {
  data: Section[];
  onChange: (data: Section[]) => void;
}

export function Step3Sections({ data, onChange }: Step3SectionsProps) {
  const [isAddSectionOpen, setIsAddSectionOpen] = useState<boolean>(false);
  const [isAddQuestionOpen, setIsAddQuestionOpen] = useState<boolean>(false);
  const [sectionName, setSectionName] = useState<string>('');
  const [currentSectionId, setCurrentSectionId] = useState<string>('');
  const [questionText, setQuestionText] = useState<string>('');
  const [questionType, setQuestionType] = useState<string>('');
  const [questionOptions, setQuestionOptions] = useState<string>('');

  const handleAddSection = (): void => {
    if (!sectionName) return;

    const newSection: Section = {
      id: Date.now().toString(),
      name: sectionName,
      questions: [],
    };

    onChange([...data, newSection]);
    setSectionName('');
    setIsAddSectionOpen(false);
  };

  const handleDeleteSection = (id: string): void => {
    onChange(data.filter(section => section.id !== id));
  };

  const handleAddQuestion = (): void => {
    if (!questionText || !questionType || !currentSectionId) return;

    const newQuestion: Question = {
      id: Date.now().toString(),
      text: questionText,
      type: questionType,
      options: questionType === 'multiple-choice' ? questionOptions.split('\n').filter(o => o.trim()) : undefined,
    };

    onChange(
      data.map(section =>
        section.id === currentSectionId
          ? { ...section, questions: [...section.questions, newQuestion] }
          : section
      )
    );

    setQuestionText('');
    setQuestionType('');
    setQuestionOptions('');
    setIsAddQuestionOpen(false);
  };

  const handleDeleteQuestion = (sectionId: string, questionId: string): void => {
    onChange(
      data.map(section =>
        section.id === sectionId
          ? { ...section, questions: section.questions.filter(q => q.id !== questionId) }
          : section
      )
    );
  };

  const questionTypes: Record<string, string> = {
    'multiple-choice': 'اختيار من متعدد',
    'free-text': 'نص حر',
    'yes-no': 'نعم/لا',
    'rating': 'تقييم',
  };

  return (
    <TooltipProvider delayDuration={300}>
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="text-2xl">الأقسام والأسئلة</CardTitle>
          <CardDescription className="text-base">
            قسّم عرضك إلى أقسام، ثم أضف أسئلة لكل قسم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.length > 0 ? (
            <Accordion type="single" collapsible className="space-y-4">
              {data.map((section, index) => (
                <AccordionItem
                  key={section.id}
                  value={section.id}
                  className="border rounded-lg bg-gray-50 px-4"
                >
                  <AccordionTrigger className="hover:no-underline">
                    <div className="flex items-center gap-3 flex-1">
                      <GripVertical className="w-5 h-5 text-gray-400" />
                      <div className="text-right flex-1">
                        <span className="font-semibold">
                          القسم {index + 1}: {section.name}
                        </span>
                        <span className="text-sm text-gray-500 mr-2">
                          ({section.questions.length} سؤال)
                        </span>
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="pb-4">
                    <div className="space-y-3 mt-4">
                      {section.questions.map((question, qIndex) => (
                        <div
                          key={question.id}
                          className="bg-white p-4 rounded-lg border flex items-start gap-3"
                        >
                          <GripVertical className="w-5 h-5 text-gray-400 mt-1 shrink-0" />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <p className="font-medium">
                                {qIndex + 1}. {question.text}
                              </p>
                              <div className="flex gap-1 shrink-0">
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button variant="ghost" size="icon" className="w-8 h-8">
                                      <Edit2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left">
                                    <p>تعديل</p>
                                  </TooltipContent>
                                </Tooltip>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      onClick={() => handleDeleteQuestion(section.id, question.id)}
                                      className="w-8 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </Button>
                                  </TooltipTrigger>
                                  <TooltipContent side="left">
                                    <p>حذف</p>
                                  </TooltipContent>
                                </Tooltip>
                              </div>
                            </div>
                            <p className="text-sm text-gray-500">
                              النوع: {questionTypes[question.type]}
                            </p>
                            {question.options && question.options.length > 0 && (
                              <div className="mt-2 space-y-1">
                                {question.options.map((option, oIndex) => (
                                  <div key={oIndex} className="text-sm text-gray-600 pr-4">
                                    • {option}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}

                      <Dialog open={isAddQuestionOpen} onOpenChange={setIsAddQuestionOpen}>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            className="w-full border-dashed border-2 text-green-600 hover:text-green-700 hover:bg-green-50"
                            onClick={() => setCurrentSectionId(section.id)}
                          >
                            <Plus className="w-5 h-5 ml-2" />
                            أضف سؤال
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>إضافة سؤال جديد</DialogTitle>
                            <DialogDescription>
                              أدخل نص السؤال ونوعه والخيارات إن وجدت
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-4">
                            <div className="space-y-2">
                              <Label htmlFor="question-text">نص السؤال</Label>
                              <Input
                                id="question-text"
                                value={questionText}
                                onChange={(e) => setQuestionText(e.target.value)}
                                placeholder="أدخل نص السؤال هنا"
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="question-type">نوع السؤال</Label>
                              <Select value={questionType} onValueChange={setQuestionType}>
                                <SelectTrigger id="question-type">
                                  <SelectValue placeholder="اختر نوع السؤال" />
                                </SelectTrigger>
                                <SelectContent>
                                  {Object.entries(questionTypes).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                      {label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            {questionType === 'multiple-choice' && (
                              <div className="space-y-2">
                                <Label htmlFor="question-options">
                                  الخيارات (كل خيار في سطر جديد)
                                </Label>
                                <textarea
                                  id="question-options"
                                  value={questionOptions}
                                  onChange={(e) => setQuestionOptions(e.target.value)}
                                  placeholder="الخيار الأول&#10;الخيار الثاني&#10;الخيار الثالث"
                                  className="w-full min-h-[100px] p-2 border rounded-md text-sm"
                                  rows={4}
                                />
                              </div>
                            )}
                          </div>
                          <DialogFooter className="gap-2">
                            <Button
                              variant="outline"
                              onClick={() => setIsAddQuestionOpen(false)}
                            >
                              إلغاء
                            </Button>
                            <Button
                              onClick={handleAddQuestion}
                              disabled={!questionText || !questionType}
                              className="bg-green-500 hover:bg-green-600"
                            >
                              إضافة السؤال
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteSection(section.id)}
                        className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 ml-2" />
                        حذف القسم
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
              <p className="text-gray-500 mb-4">لم يتم إضافة أي أقسام بعد</p>
              <p className="text-sm text-gray-400">
                انقر على "أضف قسم جديد" للبدء
              </p>
            </div>
          )}

          <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
            <DialogTrigger asChild>
              <Button className="w-full bg-green-500 hover:bg-green-600">
                <Plus className="w-5 h-5 ml-2" />
                أضف قسم جديد
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>إضافة قسم جديد</DialogTitle>
                <DialogDescription>
                  أدخل اسم القسم الجديد
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="section-name">اسم القسم</Label>
                  <Input
                    id="section-name"
                    value={sectionName}
                    onChange={(e) => setSectionName(e.target.value)}
                    placeholder="مثال: المعلومات الأساسية"
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={() => setIsAddSectionOpen(false)}
                >
                  إلغاء
                </Button>
                <Button
                  onClick={handleAddSection}
                  disabled={!sectionName}
                  className="bg-green-500 hover:bg-green-600"
                >
                  إضافة القسم
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
}
