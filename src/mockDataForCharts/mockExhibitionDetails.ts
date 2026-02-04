import type { MunicipalityResponse, VenueRequestResponse } from "@/types/municipality";
import type { BoothResponse } from "@/types/booth";
import type { StudentRegistrationResponse } from "@/types/student-registration";
import type { ExhibitionFeedbackResponse } from "@/types/exhibition-feedback";
import type { UniversityParticipationResponse } from "@/types/university";
import type { ActivityProviderRequestResponse } from "@/types/activity-provider";
import type { SchoolParticipationResponse } from "@/types/school-participation";

/**
 * Mock data for specific exhibition: "معرض الإرشاد المهني للطلاب"
 * This data will be merged with real data for demonstration purposes
 */

// Exhibition ID for "معرض الإرشاد المهني للطلاب"
export const CAREER_GUIDANCE_EXHIBITION_ID = 3;

// ==================== STEP 1: Municipality Data ====================
export const mockMunicipalities: MunicipalityResponse[] = [
    {
        id: 101,
        name: "بلدية عمان الكبرى",
        region: "العاصمة",
        contactEmail: "contact@amman.gov.jo",
        contactPhone: "+962-6-4641393",
        ownerId: 1001,
    },
    {
        id: 102,
        name: "بلدية الزرقاء",
        region: "الزرقاء",
        contactEmail: "info@zarqa-muni.gov.jo",
        contactPhone: "+962-5-3984444",
        ownerId: 1002,
    },
    {
        id: 103,
        name: "بلدية إربد الكبرى",
        region: "إربد",
        contactEmail: "contact@irbid-muni.gov.jo",
        contactPhone: "+962-2-7244444",
        ownerId: 1003,
    },
];

export const mockVenueRequests: VenueRequestResponse[] = [
    {
        id: 201,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        venueId: 301,
        venueName: "قاعة الملك حسين الرياضية",
        venueAddress: "عمان - الدوار الرابع",
        status: "APPROVED",
        orgNotes: "نحتاج إلى مساحة كبيرة لاستيعاب 50 جهة مشاركة",
        municipalityResponse: "تمت الموافقة، القاعة متاحة للتواريخ المطلوبة",
        responseDeadline: "2025-12-15T23:59:59",
        requestedAt: "2025-11-20T10:30:00",
        reviewedAt: "2025-11-22T14:20:00",
    },
];

// ==================== STEP 2: Participation Statistics ====================
export const mockParticipationStats = {
    universities: {
        total: 12,
        invited: 15,
        accepted: 12,
        finalized: 10,
    },
    activityProviders: {
        total: 18,
        invited: 22,
        accepted: 18,
        finalized: 15,
    },
    schools: {
        total: 25,
        invited: 30,
        confirmed: 22,
        participated: 25,
    },
};

// Chart data for "إحصائيات المشاركة"
export const mockParticipationChartData = [
    { name: "الجامعات", invited: 15, accepted: 12, finalized: 10 },
    { name: "مقدمو الأنشطة", invited: 22, accepted: 18, finalized: 15 },
    { name: "المدارس", invited: 30, confirmed: 22, participated: 25 },
];

// Chart data for "توزيع الأماكن المتاحة"
export const mockBoothDistributionData = [
    { zone: "القسم A", universities: 8, activityProviders: 12, total: 20 },
    { zone: "القسم B", universities: 6, activityProviders: 10, total: 16 },
    { zone: "القسم C", universities: 4, activityProviders: 8, total: 12 },
];

// Detailed participants data for expanders
export const mockUniversityParticipations: UniversityParticipationResponse[] = [
    { id: 501, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 1, universityName: "الجامعة الأردنية", contactEmail: "info@ju.edu.jo", status: "FINALIZED", approvedBoothsCount: 3, boothDetails: null, participationFee: 500, paymentStatus: "PAID", paymentDate: "2026-01-05T10:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-01T14:00:00", confirmedAt: "2026-01-06T10:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 502, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 2, universityName: "جامعة العلوم والتكنولوجيا", contactEmail: "info@just.edu.jo", status: "FINALIZED", approvedBoothsCount: 2, boothDetails: null, participationFee: 350, paymentStatus: "PAID", paymentDate: "2026-01-04T11:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-02T09:00:00", confirmedAt: "2026-01-05T15:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 503, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 3, universityName: "جامعة اليرموك", contactEmail: "info@yu.edu.jo", status: "FINALIZED", approvedBoothsCount: 2, boothDetails: null, participationFee: 350, paymentStatus: "PAID", paymentDate: "2026-01-03T12:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-01T16:00:00", confirmedAt: "2026-01-04T11:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 504, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 4, universityName: "جامعة مؤتة", contactEmail: "info@mutah.edu.jo", status: "ACCEPTED", approvedBoothsCount: 2, boothDetails: null, participationFee: 350, paymentStatus: "UNPAID", paymentDate: null, responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-03T10:00:00", confirmedAt: null, attendedAt: null },
    { id: 505, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 5, universityName: "الجامعة الهاشمية", contactEmail: "info@hu.edu.jo", status: "FINALIZED", approvedBoothsCount: 2, boothDetails: null, participationFee: 350, paymentStatus: "PAID", paymentDate: "2026-01-05T14:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-02T11:00:00", confirmedAt: "2026-01-06T12:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 506, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 6, universityName: "جامعة البلقاء التطبيقية", contactEmail: "info@bau.edu.jo", status: "FINALIZED", approvedBoothsCount: 3, boothDetails: null, participationFee: 500, paymentStatus: "PAID", paymentDate: "2026-01-04T15:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-01T13:00:00", confirmedAt: "2026-01-05T09:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 507, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 7, universityName: "الجامعة الألمانية الأردنية", contactEmail: "info@gju.edu.jo", status: "FINALIZED", approvedBoothsCount: 1, boothDetails: null, participationFee: 200, paymentStatus: "PAID", paymentDate: "2026-01-06T10:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-04T14:00:00", confirmedAt: "2026-01-07T10:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 508, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 8, universityName: "جامعة الزرقاء", contactEmail: "info@zpu.edu.jo", status: "ACCEPTED", approvedBoothsCount: 1, boothDetails: null, participationFee: 200, paymentStatus: "UNPAID", paymentDate: null, responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-05T10:00:00", confirmedAt: null, attendedAt: null },
    { id: 509, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 9, universityName: "جامعة عمان العربية", contactEmail: "info@aau.edu.jo", status: "FINALIZED", approvedBoothsCount: 2, boothDetails: null, participationFee: 350, paymentStatus: "PAID", paymentDate: "2026-01-05T16:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-02T15:00:00", confirmedAt: "2026-01-06T14:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 510, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, universityId: 10, universityName: "جامعة الشرق الأوسط", contactEmail: "info@meu.edu.jo", status: "FINALIZED", approvedBoothsCount: 2, boothDetails: null, participationFee: 350, paymentStatus: "PAID", paymentDate: "2026-01-04T13:00:00", responseDeadline: "2025-12-20T23:59:59", confirmationDeadline: "2026-01-08T23:59:59", invitedAt: "2025-11-25T10:00:00", registeredAt: "2025-12-03T12:00:00", confirmedAt: "2026-01-05T11:00:00", attendedAt: "2026-01-15T09:00:00" },
];

export const mockActivityProviderParticipations: ActivityProviderRequestResponse[] = [
    { id: 601, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 1, name: "مركز التدريب المهني الوطني", email: "info@vocational-center.jo", status: "FINALIZED", orgRequirements: "نبحث عن مركز تدريب مهني متخصص", providerProposal: "نقدم برامج تدريب في مجالات متعددة", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-02T14:00:00", reviewedAt: "2025-12-05T10:00:00", approvedAt: "2025-12-05T10:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 602, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 2, name: "شركة الإبداع التقني", email: "contact@tech-innovation.jo", status: "FINALIZED", orgRequirements: "شركة تقنية متخصصة", providerProposal: "نقدم دورات في البرمجة والتصميم", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-03T10:00:00", reviewedAt: "2025-12-06T11:00:00", approvedAt: "2025-12-06T11:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 603, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 3, name: "أكاديمية القادة الشباب", email: "info@young-leaders.jo", status: "FINALIZED", orgRequirements: "أكاديمية تدريبية", providerProposal: "برامج تطوير القيادة للشباب", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-02T16:00:00", reviewedAt: "2025-12-05T14:00:00", approvedAt: "2025-12-05T14:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 604, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 4, name: "مركز الابتكار والريادة", email: "contact@innovation-center.jo", status: "FINALIZED", orgRequirements: "مركز ريادة أعمال", providerProposal: "دعم رواد الأعمال الشباب", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-04T11:00:00", reviewedAt: "2025-12-07T10:00:00", approvedAt: "2025-12-07T10:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 605, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 5, name: "معهد التدريب الإداري", email: "info@admin-institute.jo", status: "FINALIZED", orgRequirements: "معهد تدريب إداري", providerProposal: "دورات في الإدارة والقيادة", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-03T13:00:00", reviewedAt: "2025-12-06T12:00:00", approvedAt: "2025-12-06T12:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 606, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 6, name: "شركة المستقبل للتكنولوجيا", email: "info@future-tech.jo", status: "APPROVED", orgRequirements: "شركة تكنولوجيا", providerProposal: "حلول تقنية مبتكرة", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-05T14:00:00", reviewedAt: "2025-12-08T10:00:00", approvedAt: "2025-12-08T10:30:00", attendedAt: null },
    { id: 607, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 7, name: "مركز التطوير المهني", email: "contact@career-dev.jo", status: "FINALIZED", orgRequirements: "مركز تطوير مهني", providerProposal: "برامج تطوير المهارات", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-02T17:00:00", reviewedAt: "2025-12-05T15:00:00", approvedAt: "2025-12-05T15:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 608, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 8, name: "أكاديمية التميز", email: "info@excellence-academy.jo", status: "FINALIZED", orgRequirements: "أكاديمية تعليمية", providerProposal: "برامج تعليمية متميزة", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-04T12:00:00", reviewedAt: "2025-12-07T11:00:00", approvedAt: "2025-12-07T11:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 609, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 9, name: "مركز المهارات المتقدمة", email: "contact@advanced-skills.jo", status: "FINALIZED", orgRequirements: "مركز تدريب متخصص", providerProposal: "تدريب على المهارات المتقدمة", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-03T14:00:00", reviewedAt: "2025-12-06T13:00:00", approvedAt: "2025-12-06T13:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 610, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 10, name: "معهد اللغات الحديثة", email: "info@modern-languages.jo", status: "FINALIZED", orgRequirements: "معهد لغات", providerProposal: "دورات لغات متنوعة", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-04T15:00:00", reviewedAt: "2025-12-07T14:00:00", approvedAt: "2025-12-07T14:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 611, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 11, name: "شركة الحلول الذكية", email: "contact@smart-solutions.jo", status: "APPROVED", orgRequirements: "شركة حلول تقنية", providerProposal: "حلول ذكية ومبتكرة", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-05T15:00:00", reviewedAt: "2025-12-08T11:00:00", approvedAt: "2025-12-08T11:30:00", attendedAt: null },
    { id: 612, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 12, name: "مركز الإرشاد المهني", email: "info@career-guidance.jo", status: "FINALIZED", orgRequirements: "مركز إرشاد مهني", providerProposal: "خدمات إرشاد وتوجيه مهني", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-02T18:00:00", reviewedAt: "2025-12-05T16:00:00", approvedAt: "2025-12-05T16:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 613, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 13, name: "أكاديمية البرمجة", email: "contact@coding-academy.jo", status: "FINALIZED", orgRequirements: "أكاديمية برمجة", providerProposal: "تعليم البرمجة للمبتدئين", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-04T13:00:00", reviewedAt: "2025-12-07T12:00:00", approvedAt: "2025-12-07T12:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 614, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 14, name: "مركز التصميم والإبداع", email: "info@design-center.jo", status: "FINALIZED", orgRequirements: "مركز تصميم", providerProposal: "دورات تصميم جرافيك", proposedBoothsCount: 1, totalCost: 150, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-04T16:00:00", reviewedAt: "2025-12-07T15:00:00", approvedAt: "2025-12-07T15:30:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 615, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, providerId: 15, name: "معهد إدارة الأعمال", email: "contact@business-institute.jo", status: "FINALIZED", orgRequirements: "معهد إدارة أعمال", providerProposal: "برامج إدارة الأعمال", proposedBoothsCount: 2, totalCost: 300, responseDeadline: "2025-12-25T23:59:59", orgResponse: "تم القبول", invitedAt: "2025-11-26T10:00:00", proposedAt: "2025-12-03T15:00:00", reviewedAt: "2025-12-06T14:00:00", approvedAt: "2025-12-06T14:30:00", attendedAt: "2026-01-15T09:00:00" },
];

export const mockSchoolParticipations: SchoolParticipationResponse[] = [
    { id: 701, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, schoolId: 1, schoolName: "مدرسة الرشيد الثانوية", contactEmail: "info@rashid-school.jo", status: "FINALIZED", expectedStudents: 45, responseDeadline: "2025-12-28T23:59:59", invitedAt: "2025-11-27T10:00:00", acceptedAt: "2025-12-05T10:00:00", rejectionReason: null, confirmedAt: "2025-12-10T10:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 702, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, schoolId: 2, schoolName: "مدرسة الأميرة عالية", contactEmail: "info@alia-school.jo", status: "FINALIZED", expectedStudents: 38, responseDeadline: "2025-12-28T23:59:59", invitedAt: "2025-11-27T10:00:00", acceptedAt: "2025-12-06T10:00:00", rejectionReason: null, confirmedAt: "2025-12-11T10:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 703, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, schoolId: 3, schoolName: "مدرسة الحسين الثانوية", contactEmail: "info@hussein-school.jo", status: "FINALIZED", expectedStudents: 52, responseDeadline: "2025-12-28T23:59:59", invitedAt: "2025-11-27T10:00:00", acceptedAt: "2025-12-04T10:00:00", rejectionReason: null, confirmedAt: "2025-12-09T10:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 704, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, schoolId: 4, schoolName: "مدرسة الأقصى", contactEmail: "info@aqsa-school.jo", status: "FINALIZED", expectedStudents: 41, responseDeadline: "2025-12-28T23:59:59", invitedAt: "2025-11-27T10:00:00", acceptedAt: "2025-12-05T11:00:00", rejectionReason: null, confirmedAt: "2025-12-10T11:00:00", attendedAt: "2026-01-15T09:00:00" },
    { id: 705, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, schoolId: 5, schoolName: "مدرسة اليوبيل", contactEmail: "info@jubilee-school.jo", status: "FINALIZED", expectedStudents: 35, responseDeadline: "2025-12-28T23:59:59", invitedAt: "2025-11-27T10:00:00", acceptedAt: "2025-12-06T11:00:00", rejectionReason: null, confirmedAt: "2025-12-11T11:00:00", attendedAt: "2026-01-15T09:00:00" },
];

// ==================== STEP 3: Booth Allocations ====================
export const mockBooths: BoothResponse[] = [
    // University Booths - Zone A
    { id: 1, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 1, zone: "A", boothNumber: 1, createdAt: "2025-12-01T10:00:00" },
    { id: 2, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 1, zone: "A", boothNumber: 2, createdAt: "2025-12-01T10:00:00" },
    { id: 3, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 1, zone: "A", boothNumber: 3, createdAt: "2025-12-01T10:00:00" },
    { id: 4, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 2, zone: "A", boothNumber: 4, createdAt: "2025-12-01T10:00:00" },
    { id: 5, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 2, zone: "A", boothNumber: 5, createdAt: "2025-12-01T10:00:00" },
    { id: 6, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 3, zone: "A", boothNumber: 6, createdAt: "2025-12-01T10:00:00" },
    { id: 7, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 3, zone: "A", boothNumber: 7, createdAt: "2025-12-01T10:00:00" },
    { id: 8, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 5, zone: "A", boothNumber: 8, createdAt: "2025-12-01T10:00:00" },
    
    // University Booths - Zone B
    { id: 9, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 5, zone: "B", boothNumber: 1, createdAt: "2025-12-01T10:00:00" },
    { id: 10, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 6, zone: "B", boothNumber: 2, createdAt: "2025-12-01T10:00:00" },
    { id: 11, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 6, zone: "B", boothNumber: 3, createdAt: "2025-12-01T10:00:00" },
    { id: 12, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 6, zone: "B", boothNumber: 4, createdAt: "2025-12-01T10:00:00" },
    { id: 13, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 7, zone: "B", boothNumber: 5, createdAt: "2025-12-01T10:00:00" },
    { id: 14, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 9, zone: "B", boothNumber: 6, createdAt: "2025-12-01T10:00:00" },

    // University Booths - Zone C
    { id: 15, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 9, zone: "C", boothNumber: 1, createdAt: "2025-12-01T10:00:00" },
    { id: 16, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 10, zone: "C", boothNumber: 2, createdAt: "2025-12-01T10:00:00" },
    { id: 17, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 10, zone: "C", boothNumber: 3, createdAt: "2025-12-01T10:00:00" },
    { id: 18, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "UNIVERSITY", universityParticipationId: 4, zone: "C", boothNumber: 4, createdAt: "2025-12-01T10:00:00" },

    // Activity Provider Booths - Zone A
    { id: 19, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 1, zone: "A", boothNumber: 9, createdAt: "2025-12-01T10:00:00" },
    { id: 20, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 1, zone: "A", boothNumber: 10, createdAt: "2025-12-01T10:00:00" },
    { id: 21, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 2, zone: "A", boothNumber: 11, createdAt: "2025-12-01T10:00:00" },
    { id: 22, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 3, zone: "A", boothNumber: 12, createdAt: "2025-12-01T10:00:00" },
    { id: 23, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 3, zone: "A", boothNumber: 13, createdAt: "2025-12-01T10:00:00" },
    { id: 24, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 4, zone: "A", boothNumber: 14, createdAt: "2025-12-01T10:00:00" },
    { id: 25, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 5, zone: "A", boothNumber: 15, createdAt: "2025-12-01T10:00:00" },
    { id: 26, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 5, zone: "A", boothNumber: 16, createdAt: "2025-12-01T10:00:00" },
    { id: 27, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 7, zone: "A", boothNumber: 17, createdAt: "2025-12-01T10:00:00" },
    { id: 28, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 7, zone: "A", boothNumber: 18, createdAt: "2025-12-01T10:00:00" },
    { id: 29, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 8, zone: "A", boothNumber: 19, createdAt: "2025-12-01T10:00:00" },
    { id: 30, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 9, zone: "A", boothNumber: 20, createdAt: "2025-12-01T10:00:00" },
    
    // Activity Provider Booths - Zone B
    { id: 31, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 9, zone: "B", boothNumber: 7, createdAt: "2025-12-01T10:00:00" },
    { id: 32, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 10, zone: "B", boothNumber: 8, createdAt: "2025-12-01T10:00:00" },
    { id: 33, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 12, zone: "B", boothNumber: 9, createdAt: "2025-12-01T10:00:00" },
    { id: 34, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 12, zone: "B", boothNumber: 10, createdAt: "2025-12-01T10:00:00" },
    { id: 35, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 13, zone: "B", boothNumber: 11, createdAt: "2025-12-01T10:00:00" },
    { id: 36, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 14, zone: "B", boothNumber: 12, createdAt: "2025-12-01T10:00:00" },
    { id: 37, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 15, zone: "B", boothNumber: 13, createdAt: "2025-12-01T10:00:00" },
    { id: 38, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 15, zone: "B", boothNumber: 14, createdAt: "2025-12-01T10:00:00" },
    
    // Activity Provider Booths - Zone C
    { id: 39, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 6, zone: "C", boothNumber: 5, createdAt: "2025-12-01T10:00:00" },
    { id: 40, exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID, type: "ACTIVITY_PROVIDER", activityProviderRequestId: 11, zone: "C", boothNumber: 6, createdAt: "2025-12-01T10:00:00" },
];

// ==================== STEP 4: Financial & Student Data ====================
export const mockFinancialSummary = {
    totalRevenue: 87500,
    totalExpenses: 42300,
    netProfit: 45200,
};

// Chart data for "ملخص الإيرادات والمصاريف"
export const mockRevenueExpenseData = [
    { category: "رسوم التسجيل", revenue: 32500, expense: 0 },
    { category: "رسوم الأكشاك", revenue: 45000, expense: 0 },
    { category: "رعاة", revenue: 10000, expense: 0 },
    { category: "الإيجار", revenue: 0, expense: 15000 },
    { category: "التجهيزات", revenue: 0, expense: 12000 },
    { category: "التسويق", revenue: 0, expense: 8500 },
    { category: "الموظفين", revenue: 0, expense: 6800 },
];

// Student statistics (matches StudentStats interface from dashboard-service)
export const mockStudentStats = {
    registered: 952,
    attended: 814,
    noShow: 138,  // registered - attended
    attendanceRate: 85.5,  // (attended / registered) * 100
};

// Chart data for "إحصائيات الطلاب"
export const mockStudentChartData = [
    { status: "مسجلون", count: 952, fill: "hsl(var(--chart-1))" },
    { status: "موافق عليهم", count: 876, fill: "hsl(var(--chart-2))" },
    { status: "حضروا", count: 814, fill: "hsl(var(--chart-3))" },
    { status: "بانتظار الموافقة", count: 76, fill: "hsl(var(--chart-4))" },
];

// Net profit chart data
export const mockNetProfitData = [
    { month: "كانون الثاني", netProfit: 45200 },
];

// Student registrations table data
export const mockStudentRegistrations: StudentRegistrationResponse[] = Array.from({ length: 50 }, (_, i) => {
    return {
        id: 1000 + i,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        exhibitionTitle: "معرض التوجيه المهني",
        studentId: 5000 + i,
        studentName: `الطالب ${i + 1}`,
        studentEmail: `student${i + 1}@school.edu.jo`,
        status: i < 40 ? "REGISTERED" : "PENDING",
        approved: i < 40,
        registeredAt: "2025-12-10T10:00:00",
        approvedAt: i < 40 ? "2025-12-12T14:00:00" : null,
        attendedAt: i < 35 ? "2025-12-15T09:00:00" : null,
    };
});

// ==================== STEP 5: Feedback Data ====================
export const mockFeedbacks: ExhibitionFeedbackResponse[] = [
    {
        id: 1,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5001,
        studentName: "أحمد محمود",
        rating: 5,
        comments: "معرض رائع جداً، استفدت كثيراً من التواصل مع الجامعات ومعرفة التخصصات المتاحة. التنظيم كان ممتازاً والفعاليات متنوعة ومفيدة.",
        createdAt: "2026-01-20T15:30:00",
    },
    {
        id: 2,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5002,
        studentName: "فاطمة علي",
        rating: 5,
        comments: "تجربة مميزة ساعدتني في اختيار مساري الجامعي بشكل أفضل. شكراً للمنظمين على هذا الجهد الرائع.",
        createdAt: "2026-01-20T16:00:00",
    },
    {
        id: 3,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5003,
        studentName: "محمد خالد",
        rating: 4,
        comments: "معرض جيد جداً، المعلومات كانت قيّمة لكن كنت أتمنى وقتاً أطول للتواصل مع ممثلي الجامعات.",
        createdAt: "2026-01-20T16:15:00",
    },
    {
        id: 4,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5004,
        studentName: "سارة أحمد",
        rating: 5,
        comments: "معرض شامل ومنظم بشكل احترافي. حصلت على إجابات لجميع استفساراتي حول الدراسة الجامعية.",
        createdAt: "2026-01-20T16:45:00",
    },
    {
        id: 5,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5005,
        studentName: "يوسف حسن",
        rating: 4,
        comments: "استفدت كثيراً من ورش العمل والأنشطة التفاعلية. معرض مفيد للطلاب الذين يخططون لمستقبلهم.",
        createdAt: "2026-01-20T17:00:00",
    },
    {
        id: 6,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5006,
        studentName: "منى عبدالله",
        rating: 5,
        comments: "معرض ممتاز، ساعدني في التعرف على مختلف التخصصات والفرص المتاحة. أنصح جميع الطلاب بالمشاركة.",
        createdAt: "2026-01-20T17:30:00",
    },
    {
        id: 7,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5007,
        studentName: "عمر سالم",
        rating: 4,
        comments: "تنظيم جيد ومحتوى مفيد. تمنيت لو كان هناك المزيد من الأنشطة العملية والتجريبية.",
        createdAt: "2026-01-20T18:00:00",
    },
    {
        id: 8,
        exhibitionId: CAREER_GUIDANCE_EXHIBITION_ID,
        studentId: 5008,
        studentName: "لينا محمد",
        rating: 5,
        comments: "تجربة غنية بالمعلومات، ساعدتني في فهم متطلبات القبول الجامعي والمنح الدراسية المتاحة.",
        createdAt: "2026-01-21T09:00:00",
    },
];

// Feedback analytics for radar chart
export const mockFeedbackAnalytics = {
    totalFeedbacks: 8,
    averageRating: 4.6,
    feedbacksByRating: {
        "1": 0,
        "2": 0,
        "3": 0,
        "4": 3,
        "5": 5,
    },
};

// Radar chart data (satisfaction metrics)
export const mockRadarChartData = [
    { category: "التنظيم", value: 95 },
    { category: "المحتوى", value: 92 },
    { category: "التواصل", value: 88 },
    { category: "التنوع", value: 90 },
    { category: "الفائدة العامة", value: 94 },
];

// ==================== Merge Functions ====================

/**
 * Merge mock municipalities with real data for specific exhibition
 */
export function getMergedMunicipalities(
    realData: MunicipalityResponse[],
    exhibitionId: number
): MunicipalityResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockMunicipalities];
    }
    return realData;
}

/**
 * Merge mock venue requests with real data for specific exhibition
 */
export function getMergedVenueRequests(
    realData: VenueRequestResponse[],
    exhibitionId: number
): VenueRequestResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockVenueRequests];
    }
    return realData;
}

/**
 * Merge mock booths with real data for specific exhibition
 */
export function getMergedBooths(
    realData: BoothResponse[],
    exhibitionId: number
): BoothResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockBooths];
    }
    return realData;
}

/**
 * Merge mock student registrations with real data for specific exhibition
 */
export function getMergedStudentRegistrations(
    realData: StudentRegistrationResponse[],
    exhibitionId: number
): StudentRegistrationResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockStudentRegistrations];
    }
    return realData;
}

/**
 * Merge mock feedbacks with real data for specific exhibition
 */
export function getMergedFeedbacks(
    realData: ExhibitionFeedbackResponse[],
    exhibitionId: number
): ExhibitionFeedbackResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockFeedbacks];
    }
    return realData;
}

/**
 * Merge mock university participations with real data for specific exhibition
 */
export function getMergedUniversityParticipations(
    realData: UniversityParticipationResponse[],
    exhibitionId: number
): UniversityParticipationResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockUniversityParticipations];
    }
    return realData;
}

/**
 * Merge mock activity provider requests with real data for specific exhibition
 */
export function getMergedActivityProviderRequests(
    realData: ActivityProviderRequestResponse[],
    exhibitionId: number
): ActivityProviderRequestResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockActivityProviderParticipations];
    }
    return realData;
}

/**
 * Merge mock school participations with real data for specific exhibition
 */
export function getMergedSchoolParticipations(
    realData: SchoolParticipationResponse[],
    exhibitionId: number
): SchoolParticipationResponse[] {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return [...realData, ...mockSchoolParticipations];
    }
    return realData;
}

/**
 * Get mock data for specific exhibition
 */
export function getMockDataForExhibition(exhibitionId: number) {
    if (exhibitionId === CAREER_GUIDANCE_EXHIBITION_ID) {
        return {
            municipalities: mockMunicipalities,
            venueRequests: mockVenueRequests,
            participationStats: mockParticipationStats,
            participationChartData: mockParticipationChartData,
            boothDistributionData: mockBoothDistributionData,
            universityParticipations: mockUniversityParticipations,
            activityProviderParticipations: mockActivityProviderParticipations,
            schoolParticipations: mockSchoolParticipations,
            booths: mockBooths,
            financialSummary: mockFinancialSummary,
            revenueExpenseData: mockRevenueExpenseData,
            studentStats: mockStudentStats,
            studentChartData: mockStudentChartData,
            netProfitData: mockNetProfitData,
            studentRegistrations: mockStudentRegistrations,
            feedbacks: mockFeedbacks,
            feedbackAnalytics: mockFeedbackAnalytics,
            radarChartData: mockRadarChartData,
        };
    }
    return null;
}
