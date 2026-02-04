import { z } from "zod";

export const metricSchema = z.object({
    id: z.number(),
    code: z.string(),
    label: z.string(),
    description: z.string().optional(),
});
export type Metric = z.infer<typeof metricSchema>;

export const subQuestionSchema = z.object({
    // id: z.number().optional(),
    id: z.number(),
    subQuestionText: z.string(),
    targetGender: z.enum(["MALE","FEMALE","ALL"]),
    metric: metricSchema,
});
export type subQuestion = z.infer<typeof subQuestionSchema>;

export const questionSchema = z.object({
    id: z.number().optional(),
    questionText: z.string(),
    targetGender: z.enum(["MALE","FEMALE","ALL"]),
    answerType: z.enum(["OPEN","CHECKBOX","SCALE"]),
    //rja3e fhme hay
    groupedSubQuestions: z
        .record(
            z.string(),
            z.array(subQuestionSchema)
        )
        .optional(),
});
export type Question = z.infer<typeof questionSchema>;

export const sectionSchema = z.object({
    id: z.int(),
    title: z.string(),
    questions: z.array(questionSchema),
});
export type Section= z.infer<typeof sectionSchema>;

export const userTestSchema = z.object({
    id: z.int(),
    testId: z.int(),
    testTitle: z.string(),
    testDescription: z.string(),
    sections: z.array(sectionSchema),


});
export type UserTest = z.infer<typeof userTestSchema>;

