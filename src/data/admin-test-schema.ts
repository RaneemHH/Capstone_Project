import { z } from "zod";

export const metricSchema = z.object({
    id: z.number(),
    code: z.string(),
    label: z.string(),
    description: z.string().optional(),
});

export const subQuestionSchema = z.object({
    id: z.number(),
    subQuestionText: z.string(),
    targetGender: z.enum(["MALE","FEMALE","ALL"]),
    metric: metricSchema,
})
export type subQuestion = z.infer<typeof subQuestionSchema>;
export type Metric = z.infer<typeof metricSchema>;

export const questionSchema = z.object({
    id: z.number().optional(),
    questionText: z.string(),
    targetGender: z.enum(["MALE","FEMALE","ALL"]),
    answerType: z.enum(["OPEN","CHECKBOX","SCALE"]),
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

export const adminTestSchema = z.object({
    id: z.int(),
    title: z.string(),
    description: z.string(),
    versionName: z.string().optional(),
    baseTestId: z.number().optional(),
    status: z.enum(["PUBLISHED","DRAFT"]),
    active: z.boolean(),
    sections: z.array(sectionSchema),
});
export type AdminTest = z.infer<typeof adminTestSchema>;

