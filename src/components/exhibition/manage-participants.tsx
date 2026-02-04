import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Search, ChevronLeft, ChevronRight, Building2, Loader2, UserPlus, ChevronDown, CheckCircle2, Pencil, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { exhibitionService } from "@/services/exhibitionService";
import { universityParticipationService } from "@/services/university-participation-service";
import { activityProviderService } from "@/services/activity-provider-service";
import { schoolParticipationService } from "@/services/school-participation-service";
import { attendanceService } from "@/services/attendance-service";
import { useUniversityStore } from "@/stores/university-store";
import { useActivityProviderStore } from "@/stores/activity-provider-store";
import { useSchoolParticipationStore } from "@/stores/school-participation-store";
import { useSchoolStore } from "@/stores/school-store";
import { useUsersStore } from "@/stores/users-store";
import { useBoothStore } from "@/stores/booth-store";
import { useDashboardStore } from "@/stores/dashboard-store";
import { ConfirmExhibitionDialog } from "@/components/exhibition/confirm-exhibition-dialog";
import { SetBoothLimitsDialog } from "@/components/exhibition/set-booth-limits-dialog";
import { ChartPieInteractive } from "@/components/charts/chart-pie-interactive";
import { ChartBarStacked } from "@/components/charts/chart-bar-stacked";
import { toast } from "sonner";
import type { ActivityProviderRequestStatus } from "@/types/activity-provider";
import type { SchoolParticipationStatus } from "@/types/school-participation";
import { Textarea } from "@/components/ui/textarea";

const ITEMS_PER_PAGE = 5;

export default function ManageParticipants() {
    const { id } = useParams<{ id: string }>();
    const {
        universities,
        participations,
        isLoadingParticipations,
        fetchAllUniversities,
        fetchParticipationsByExhibition
    } = useUniversityStore();
    const {
        allProviders,
        providerRequests,
        isLoadingAllProviders,
        isLoadingRequests,
        fetchAllActiveProviders,
        fetchRequestsByExhibition
    } = useActivityProviderStore();
    const {
        schools,
        fetchAllActiveSchools,
        isLoadingSchools
    } = useSchoolStore();
    const {
        exhibitionParticipations: schoolParticipations,
        isLoadingExhibitionParticipations: isLoadingSchoolParticipations,
        fetchParticipationsByExhibition: fetchSchoolParticipations
    } = useSchoolParticipationStore();
    const { fetchAllUsers, getUserById } = useUsersStore();
    const { fetchAvailableBooths } = useBoothStore();
    const { fetchParticipationStats } = useDashboardStore();
    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);

    // Activity Provider search and pagination
    const [providerSearchQuery, setProviderSearchQuery] = useState("");
    const [providerCurrentPage, setProviderCurrentPage] = useState(1);

    // School search and pagination
    const [schoolSearchQuery, setSchoolSearchQuery] = useState("");
    const [schoolCurrentPage, setSchoolCurrentPage] = useState(1);

    // Expander states
    const [universitiesOpen, setUniversitiesOpen] = useState(true);
    const [providersOpen, setProvidersOpen] = useState(false);
    const [schoolsOpen, setSchoolsOpen] = useState(false);

    // Invite dialog state
    const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
    const [selectedUniversityId, setSelectedUniversityId] = useState<number | null>(null);
    const [participationFee, setParticipationFee] = useState<string>("");
    const [responseDeadline, setResponseDeadline] = useState<string>("");
    const [isInviting, setIsInviting] = useState(false);

    // Review dialog state
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [selectedParticipationId, setSelectedParticipationId] = useState<number | null>(null);
    const [confirmationDeadline, setConfirmationDeadline] = useState<string>("");
    const [isReviewing, setIsReviewing] = useState(false);

    // Payment confirmation state
    const [isConfirmingPayment, setIsConfirmingPayment] = useState(false);

    // Exhibition state
    const [exhibitionStatus, setExhibitionStatus] = useState<string>('');

    // Activity Provider states
    const [inviteProviderDialogOpen, setInviteProviderDialogOpen] = useState(false);
    const [selectedProviderId, setSelectedProviderId] = useState<number | null>(null);
    const [providerOrgRequirements, setProviderOrgRequirements] = useState<string>("");
    const [providerResponseDeadline, setProviderResponseDeadline] = useState<string>("");
    const [isInvitingProvider, setIsInvitingProvider] = useState(false);

    const [reviewProviderDialogOpen, setReviewProviderDialogOpen] = useState(false);
    const [selectedProviderRequestId, setSelectedProviderRequestId] = useState<number | null>(null);
    const [providerConfirmationDeadline, setProviderConfirmationDeadline] = useState<string>("");
    const [providerReviewComments, setProviderReviewComments] = useState<string>("");
    const [isReviewingProvider, setIsReviewingProvider] = useState(false);

    // School states
    const [inviteSchoolDialogOpen, setInviteSchoolDialogOpen] = useState(false);
    const [selectedSchoolId, setSelectedSchoolId] = useState<number | null>(null);
    const [schoolResponseDeadline, setSchoolResponseDeadline] = useState<string>("");
    const [isInvitingSchool, setIsInvitingSchool] = useState(false);

    const [acceptSchoolDialogOpen, setAcceptSchoolDialogOpen] = useState(false);
    const [selectedSchoolParticipationId, setSelectedSchoolParticipationId] = useState<number | null>(null);
    const [schoolConfirmationDeadline, setSchoolConfirmationDeadline] = useState<string>("");
    const [isAcceptingSchool, setIsAcceptingSchool] = useState(false);

    // Attendance states
    const [markingAttendanceId, setMarkingAttendanceId] = useState<number | null>(null);
    const [markingAttendanceType, setMarkingAttendanceType] = useState<'university' | 'school' | 'provider' | null>(null);

    // Confirm Exhibition Dialog state
    const [confirmExhibitionDialogOpen, setConfirmExhibitionDialogOpen] = useState(false);

    // Cancellation Dialog state
    const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
    const [cancelTargetId, setCancelTargetId] = useState<number | null>(null);
    const [cancelTargetType, setCancelTargetType] = useState<'university' | 'school' | 'provider' | null>(null);
    const [isCancelling, setIsCancelling] = useState(false);

    // Booth Limits Dialog state
    const [boothLimitsDialogOpen, setBoothLimitsDialogOpen] = useState(false);

    // Fetch universities on mount
    useEffect(() => {
        fetchAllUniversities();
    }, [fetchAllUniversities]);

    // Fetch users on mount
    useEffect(() => {
        fetchAllUsers();
    }, [fetchAllUsers]);

    // Fetch participations for this exhibition
    useEffect(() => {
        if (id) {
            fetchParticipationsByExhibition(parseInt(id));
            fetchRequestsByExhibition(parseInt(id));
            fetchSchoolParticipations(parseInt(id));
        }
    }, [id, fetchParticipationsByExhibition, fetchRequestsByExhibition, fetchSchoolParticipations]);

    // Fetch all active providers on mount
    useEffect(() => {
        fetchAllActiveProviders();
    }, [fetchAllActiveProviders]);

    // Fetch all active schools on mount
    useEffect(() => {
        fetchAllActiveSchools();
    }, [fetchAllActiveSchools]);

    // Fetch exhibition status
    useEffect(() => {
        const fetchExhibitionData = async () => {
            if (!id) return;

            try {
                const exhibition = await exhibitionService.getExhibitionById(parseInt(id));
                setExhibitionStatus(exhibition.status);
            } catch (error) {
                console.error('Failed to fetch exhibition data:', error);
                toast.error("فشل في تحميل بيانات المعرض");
            }
        };

        fetchExhibitionData();
    }, [id]);

    useEffect(() => {
        if (id) {
            fetchAvailableBooths(parseInt(id));
            fetchParticipationStats(parseInt(id));
        }
    }, [id, fetchAvailableBooths, fetchParticipationStats]);


    // Get all participations for this exhibition and enrich with university data
    const participationsArray = Array.from(participations.values()).map(participation => {
        const university = universities.find(u => u.id === participation.universityId);
        return {
            ...participation,
            universityName: university?.name || participation.universityName,
            contactEmail: university?.contactEmail || participation.contactEmail,
            ownerName: university ? (getUserById(university.ownerId)?.name || `معرف: ${university.ownerId}`) : 'غير متوفر'
        };
    });

    const filteredParticipations = participationsArray.filter(participation => {
        const matchesSearch = participation.universityName.includes(searchQuery) ||
            participation.contactEmail.includes(searchQuery);
        return matchesSearch;
    });

    // Helper to check if university can be invited
    // Backend doesn't allow re-inviting universities that already have ANY participation record
    const canInviteUniversity = (universityId: number): boolean => {
        const participation = participations.get(universityId);
        return !participation; // Can only invite if no participation exists at all
    };

    // Check if there are any universities available to invite
    const availableUniversities = universities.filter(uni => canInviteUniversity(uni.id));
    const hasAvailableUniversities = availableUniversities.length > 0;

    // Helper to check if school can be invited
    const canInviteSchool = (schoolId: number): boolean => {
        const participations = schoolParticipations.get(Number(id)) || [];
        return !participations.some(p => p.schoolId === schoolId);
    };

    // Check if there are any schools available to invite
    const availableSchools = schools.filter(school => canInviteSchool(school.id));
    const hasAvailableSchools = availableSchools.length > 0;

    // Pagination
    const totalPages = Math.ceil(filteredParticipations.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentParticipations = filteredParticipations.slice(startIndex, endIndex);

    // Reset to page 1 when filters change
    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'INVITED': 'مدعو',
            'REGISTERED': 'مسجل',
            'ACCEPTED': 'مقبول',
            'REJECTED': 'مرفوض',
            'CONFIRMED': 'مؤكد',
            'CANCELLED': 'ملغي',
            'FINALIZED': 'نهائي'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'INVITED': 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
            'REGISTERED': 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
            'ACCEPTED': 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
            'REJECTED': 'bg-red-500/10 text-red-700 hover:bg-red-500/20',
            'CONFIRMED': 'bg-primary/10 text-primary hover:bg-primary/20',
            'CANCELLED': 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20',
            'FINALIZED': 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20'
        };
        return colors[status] || '';
    };

    const getPaymentStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            'UNPAID': 'غير مدفوع',
            'PAID': 'مدفوع',
            'REFUNDED': 'مسترد'
        };
        return labels[status] || status;
    };

    // Helper function to check if confirmation deadline has passed
    const isConfirmationDeadlinePassed = (deadline: string | null | undefined): boolean => {
        if (!deadline) return false;
        return new Date(deadline) < new Date();
    };

    const handleSearchChange = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleOpenReviewDialog = (participationId: number) => {
        setSelectedParticipationId(participationId);
        setConfirmationDeadline("");
        setReviewDialogOpen(true);
    };

    const handleReview = async (approve: boolean) => {
        if (!id || !selectedParticipationId) return;

        if (approve && !confirmationDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للتأكيد عند القبول");
            return;
        }

        setIsReviewing(true);
        try {
            await universityParticipationService.reviewUniversity(
                selectedParticipationId,
                {
                    approve,
                    confirmationDeadline: confirmationDeadline || undefined
                }
            );

            toast.success(approve ? 'تم قبول المشاركة بنجاح' : 'تم رفض المشاركة');
            setReviewDialogOpen(false);

            // Refresh participations
            await fetchParticipationsByExhibition(parseInt(id));
        } catch (error) {
            console.error('Failed to review:', error);
            toast.error('فشل في مراجعة المشاركة');
        } finally {
            setIsReviewing(false);
        }
    };

    const handleConfirmPayment = async (participationId: number) => {
        if (!id) return;

        setIsConfirmingPayment(true);
        try {
            console.log('Confirming payment for participation ID:', participationId);
            await universityParticipationService.confirmPayment(participationId);
            toast.success('تم تأكيد الدفع بنجاح');

            // Refresh participations
            await fetchParticipationsByExhibition(parseInt(id));
        } catch (error: unknown) {
            console.error('Failed to confirm payment:', error);
            console.error('Full error object:', JSON.stringify(error, null, 2));

            let errorMessage = 'فشل في تأكيد الدفع';

            if (error && typeof error === 'object') {
                const axiosError = error as {
                    response?: {
                        data?: { message?: string; error?: string; };
                        status?: number;
                        statusText?: string;
                    };
                    message?: string;
                };

                if (axiosError.response) {
                    console.error('Response status:', axiosError.response.status);
                    console.error('Response data:', axiosError.response.data);

                    if (axiosError.response.status === 500) {
                        errorMessage = 'خطأ في الخادم (500). يرجى التحقق من: \\n- حالة المشاركة يجب أن تكون ACCEPTED\\n- لم يمر الموعد النهائي للتأكيد\\n- لم يتم تأكيد الدفع مسبقاً';
                    } else {
                        errorMessage = axiosError.response.data?.message
                            || axiosError.response.data?.error
                            || `خطأ ${axiosError.response.status}: ${axiosError.response.statusText}`;
                    }
                } else if (axiosError.message) {
                    errorMessage = axiosError.message;
                }
            }

            toast.error(errorMessage);
        } finally {
            setIsConfirmingPayment(false);
        }
    };

    // NOTE: Organization owners cannot finalize participations
    // Universities must finalize from their own dashboard (Role: UNIVERSITY_ADMIN)
    /*
    const handleFinalizeParticipation = async (participationId: number) => {
        if (!id) return;

        // Validation: Exhibition status must be CONFIRMED
        if (exhibitionStatus !== 'CONFIRMED') {
            toast.error('لا يمكن إتمام المشاركة', {
                description: 'يجب أن تكون حالة المعرض "مؤكد" لإتمام المشاركة'
            });
            return;
        }

        // Validation: Finalization deadline must not be passed
        if (finalizationDeadline && isConfirmationDeadlinePassed(finalizationDeadline)) {
            toast.error('انتهى الموعد النهائي', {
                description: 'تجاوز الموعد النهائي لإتمام المشاركة'
            });
            return;
        }

        setIsFinalizingParticipation(true);
        try {
            console.log('Finalizing participation ID:', participationId);
            await universityParticipationService.finalizeParticipation(participationId);
            toast.success('تم إتمام المشاركة بنجاح');
            
            // Refresh participations
            await fetchParticipationsByExhibition(parseInt(id));
        } catch (error: unknown) {
            console.error('Failed to finalize participation:', error);
            
            let errorMessage = 'فشل في إتمام المشاركة';
            
            if (error && typeof error === 'object') {
                const axiosError = error as { 
                    response?: { 
                        data?: { message?: string; error?: string; };
                        status?: number;
                    }; 
                    message?: string;
                };
                
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.data?.error) {
                    errorMessage = axiosError.response.data.error;
                } else if (axiosError.message) {
                    errorMessage = axiosError.message;
                }
            }
            
            toast.error(errorMessage);
        } finally{
            setIsFinalizingParticipation(false);
        }
    };
    */

    const handleInviteUniversity = async () => {
        if (!id) return;

        if (!selectedUniversityId) {
            toast.error("يرجى اختيار جامعة");
            return;
        }

        const fee = parseFloat(participationFee);
        if (isNaN(fee) || fee <= 0) {
            toast.error("يرجى إدخال رسوم مشاركة صحيحة");
            return;
        }

        if (!responseDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للرد");
            return;
        }

        try {
            setIsInviting(true);
            await universityParticipationService.inviteUniversity(
                parseInt(id),
                selectedUniversityId,
                {
                    participationFee: fee,
                    responseDeadline: responseDeadline || undefined
                }
            );
            toast.success("تم إرسال الدعوة بنجاح");
            setInviteDialogOpen(false);
            // Refresh participations
            if (id) {
                fetchParticipationsByExhibition(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to invite university:', error);
            toast.error("فشل في إرسال الدعوة");
        } finally {
            setIsInviting(false);
        }
    };

    // Activity Provider Helper Functions
    const getProviderStatusLabel = (status: ActivityProviderRequestStatus) => {
        const labels: Record<ActivityProviderRequestStatus, string> = {
            'INVITED': 'مدعو',
            'PROPOSED': 'مقترح',
            'APPROVED': 'مقبول',
            'REJECTED': 'مرفوض',
            'CONFIRMED': 'مؤكد',
            'CANCELLED': 'ملغي',
            'FINALIZED': 'نهائي'
        };
        return labels[status] || status;
    };

    const getProviderStatusColor = (status: ActivityProviderRequestStatus) => {
        const colors: Record<ActivityProviderRequestStatus, string> = {
            'INVITED': 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
            'PROPOSED': 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
            'APPROVED': 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
            'REJECTED': 'bg-red-500/10 text-red-700 hover:bg-red-500/20',
            'CONFIRMED': 'bg-primary/10 text-primary hover:bg-primary/20',
            'CANCELLED': 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20',
            'FINALIZED': 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20'
        };
        return colors[status] || '';
    };

    // Activity Provider Handlers
    const handleInviteProvider = async () => {
        if (!id) return;

        if (!selectedProviderId) {
            toast.error("يرجى اختيار مقدم نشاط");
            return;
        }

        if (!providerResponseDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للرد");
            return;
        }

        try {
            setIsInvitingProvider(true);
            await activityProviderService.inviteProvider(
                parseInt(id),
                selectedProviderId,
                {
                    orgRequirements: providerOrgRequirements || "",
                    responseDeadline: providerResponseDeadline
                }
            );
            toast.success("تم إرسال الدعوة بنجاح");
            setInviteProviderDialogOpen(false);
            // Refresh provider requests
            if (id) {
                fetchRequestsByExhibition(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to invite provider:', error);
            toast.error("فشل في إرسال الدعوة");
        } finally {
            setIsInvitingProvider(false);
        }
    };

    const handleOpenReviewProviderDialog = (requestId: number) => {
        setSelectedProviderRequestId(requestId);
        setProviderConfirmationDeadline("");
        setProviderReviewComments("");
        setReviewProviderDialogOpen(true);
    };

    const handleReviewProvider = async (approve: boolean) => {
        if (!selectedProviderRequestId) return;

        if (approve && !providerConfirmationDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للتأكيد");
            return;
        }

        try {
            setIsReviewingProvider(true);
            await activityProviderService.reviewProposal(
                selectedProviderRequestId,
                {
                    approve,
                    confirmationDeadline: approve ? providerConfirmationDeadline : undefined,
                    comments: providerReviewComments || undefined
                }
            );
            toast.success(approve ? "تم قبول الاقتراح بنجاح" : "تم رفض الاقتراح");
            setReviewProviderDialogOpen(false);
            // Refresh provider requests
            if (id) {
                fetchRequestsByExhibition(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to review provider proposal:', error);
            toast.error("فشل في مراجعة الاقتراح");
        } finally {
            setIsReviewingProvider(false);
        }
    };

    // NOTE: Organization owners cannot finalize provider requests
    // Activity providers must finalize from their own dashboard (Role: ACTIVITY_PROVIDER)
    /*
    const handleFinalizeProviderRequest = async (requestId: number) => {
        // Validation: Exhibition status must be CONFIRMED
        if (exhibitionStatus !== 'CONFIRMED') {
            toast.error('لا يمكن إتمام المشاركة', {
                description: 'يجب أن تكون حالة المعرض "مؤكد" لإتمام المشاركة'
            });
            return;
        }

        // Validation: Finalization deadline must not be passed
        if (finalizationDeadline && isConfirmationDeadlinePassed(finalizationDeadline)) {
            toast.error('انتهى الموعد النهائي', {
                description: 'تجاوز الموعد النهائي لإتمام المشاركة'
            });
            return;
        }

        try {
            setIsFinalizingProviderRequest(true);
            await activityProviderService.finalizeParticipation(requestId);
            toast.success("تم إتمام المشاركة بنجاح");
            // Refresh provider requests
            if (id) {
                fetchRequestsByExhibition(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to finalize provider request:', error);
            
            let errorMessage = 'فشل في إتمام المشاركة';
            
            if (error && typeof error === 'object') {
                const axiosError = error as { 
                    response?: { 
                        data?: { message?: string; error?: string; };
                    }; 
                    message?: string;
                };
                
                if (axiosError.response?.data?.message) {
                    errorMessage = axiosError.response.data.message;
                } else if (axiosError.response?.data?.error) {
                    errorMessage = axiosError.response.data.error;
                } else if (axiosError.message) {
                    errorMessage = axiosError.message;
                }
            }
            
            toast.error(errorMessage);
        } finally {
            setIsFinalizingProviderRequest(false);
        }
    };
    */

    // School Helper Functions
    const getSchoolStatusLabel = (status: SchoolParticipationStatus) => {
        const labels: Record<SchoolParticipationStatus, string> = {
            'INVITED': 'مدعو',
            'REGISTERED': 'مسجل',
            'ACCEPTED': 'مقبول',
            'REJECTED': 'مرفوض',
            'CONFIRMED': 'مؤكد',
            'CANCELLED': 'ملغي',
            'FINALIZED': 'نهائي'
        };
        return labels[status] || status;
    };

    const getSchoolStatusColor = (status: SchoolParticipationStatus) => {
        const colors: Record<SchoolParticipationStatus, string> = {
            'INVITED': 'bg-blue-500/10 text-blue-700 hover:bg-blue-500/20',
            'REGISTERED': 'bg-yellow-500/10 text-yellow-700 hover:bg-yellow-500/20',
            'ACCEPTED': 'bg-green-500/10 text-green-700 hover:bg-green-500/20',
            'REJECTED': 'bg-red-500/10 text-red-700 hover:bg-red-500/20',
            'CONFIRMED': 'bg-primary/10 text-primary hover:bg-primary/20',
            'CANCELLED': 'bg-gray-500/10 text-gray-700 hover:bg-gray-500/20',
            'FINALIZED': 'bg-purple-500/10 text-purple-700 hover:bg-purple-500/20'
        };
        return colors[status] || '';
    };

    // School Handlers
    const handleInviteSchool = async () => {
        if (!id) return;

        if (!selectedSchoolId) {
            toast.error("يرجى اختيار مدرسة");
            return;
        }

        if (!schoolResponseDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للرد");
            return;
        }

        try {
            setIsInvitingSchool(true);
            await schoolParticipationService.inviteSchool(
                parseInt(id),
                selectedSchoolId,
                {
                    responseDeadline: schoolResponseDeadline
                }
            );
            toast.success("تم إرسال الدعوة بنجاح");
            setInviteSchoolDialogOpen(false);
            // Refresh school participations
            if (id) {
                fetchSchoolParticipations(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to invite school:', error);
            toast.error("فشل في إرسال الدعوة");
        } finally {
            setIsInvitingSchool(false);
        }
    };

    const handleOpenAcceptSchoolDialog = (participationId: number) => {
        setSelectedSchoolParticipationId(participationId);
        setSchoolConfirmationDeadline("");
        setAcceptSchoolDialogOpen(true);
    };

    const handleAcceptSchool = async (approve: boolean) => {
        if (!selectedSchoolParticipationId) return;

        if (approve && !schoolConfirmationDeadline) {
            toast.error("يرجى تحديد الموعد النهائي للتأكيد");
            return;
        }

        try {
            setIsAcceptingSchool(true);
            await schoolParticipationService.acceptSchool(
                selectedSchoolParticipationId,
                {
                    approved: approve,
                    confirmationDeadline: approve ? schoolConfirmationDeadline : undefined
                }
            );
            toast.success(approve ? "تم قبول المشاركة بنجاح" : "تم رفض المشاركة");
            setAcceptSchoolDialogOpen(false);
            // Refresh school participations
            if (id) {
                fetchSchoolParticipations(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to accept/reject school:', error);
            toast.error("فشل في مراجعة المشاركة");
        } finally {
            setIsAcceptingSchool(false);
        }
    };

    const handleConfirmExhibitionSuccess = async () => {
        // Refresh exhibition data
        if (!id) return;
        try {
            const exhibition = await exhibitionService.getExhibitionById(parseInt(id));
            setExhibitionStatus(exhibition.status);
        } catch (error) {
            console.error('Failed to refresh exhibition:', error);
        }
    };

    // Attendance handlers
    const handleMarkUniversityAttendance = async (participationId: number) => {
        try {
            setMarkingAttendanceId(participationId);
            setMarkingAttendanceType('university');
            await attendanceService.markUniversityAttendance(participationId);
            toast.success('تم تسجيل حضور الجامعة بنجاح');
            if (id) {
                fetchParticipationsByExhibition(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to mark university attendance:', error);
            toast.error('فشل في تسجيل حضور الجامعة، ربما لأن المعرض لم يبدأ بعد');
        } finally {
            setMarkingAttendanceId(null);
            setMarkingAttendanceType(null);
        }
    };

    const handleMarkSchoolAttendance = async (participationId: number) => {
        try {
            setMarkingAttendanceId(participationId);
            setMarkingAttendanceType('school');
            await attendanceService.markSchoolAttendance(participationId);
            toast.success('تم تسجيل حضور المدرسة بنجاح');
            if (id) {
                fetchSchoolParticipations(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to mark school attendance:', error);
            toast.error('فشل في تسجيل حضور المدرسة، ربما لأن المعرض لم يبدأ بعد');
        } finally {
            setMarkingAttendanceId(null);
            setMarkingAttendanceType(null);
        }
    };

    const handleCancelUniversityParticipation = (participationId: number) => {
        setCancelTargetId(participationId);
        setCancelTargetType('university');
        setCancelDialogOpen(true);
    };

    const handleCancelProviderParticipation = (requestId: number) => {
        setCancelTargetId(requestId);
        setCancelTargetType('provider');
        setCancelDialogOpen(true);
    };

    const handleCancelSchoolParticipation = (participationId: number) => {
        setCancelTargetId(participationId);
        setCancelTargetType('school');
        setCancelDialogOpen(true);
    };

    const handleConfirmCancellation = async () => {
        if (!cancelTargetId || !cancelTargetType) return;

        setIsCancelling(true);
        try {
            if (cancelTargetType === 'university') {
                await universityParticipationService.cancelParticipation(cancelTargetId);
                toast.success('تم إلغاء مشاركة الجامعة بنجاح');
                if (id) {
                    fetchParticipationsByExhibition(parseInt(id));
                }
            } else if (cancelTargetType === 'school') {
                await schoolParticipationService.cancelParticipation(cancelTargetId);
                toast.success('تم إلغاء مشاركة المدرسة بنجاح');
                if (id) {
                    fetchSchoolParticipations(parseInt(id));
                }
            } else {
                await activityProviderService.cancelRequest(cancelTargetId, 'Cancelled by Organizer');
                toast.success('تم إلغاء طلب مزود الأنشطة بنجاح');
                if (id) {
                    fetchRequestsByExhibition(parseInt(id));
                }
            }
            setCancelDialogOpen(false);
        } catch (error) {
            console.error(`Failed to cancel ${cancelTargetType} participation:`, error);
            toast.error('فشل في إلغاء المشاركة');
        } finally {
            setIsCancelling(false);
            setCancelTargetId(null);
            setCancelTargetType(null);
        }
    };

    const handleMarkProviderAttendance = async (requestId: number) => {
        try {
            setMarkingAttendanceId(requestId);
            setMarkingAttendanceType('provider');
            await attendanceService.markProviderAttendance(requestId);
            toast.success('تم تسجيل حضور مزود الأنشطة بنجاح');
            if (id) {
                fetchRequestsByExhibition(parseInt(id));
            }
        } catch (error) {
            console.error('Failed to mark provider attendance:', error);
            toast.error('فشل في تسجيل حضور مزود الأنشطة، ربما لأن المعرض لم يبدأ بعد');
        } finally {
            setMarkingAttendanceId(null);
            setMarkingAttendanceType(null);
        }
    };

    // Get all universities and schools as arrays for the dialog
    const allUniversities = Array.from(participations.values()).flat();
    const allSchools = Array.from(schoolParticipations.values()).flat();

    const isLimitsLocked = exhibitionStatus ? ['PLANNING', 'CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus) : false;

    return (
        <div className="flex-1 flex flex-col">
            {/* Booth Limits & Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
                {/* Stacked Bar Chart - Left */}
                <div>
                    <ChartBarStacked />
                </div>

                {/* Right Column - Booth Limits & Pie Chart */}
                <div className="flex flex-col gap-4">
                    {/* Booth Limits Action Card */}
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <Card
                                    className={`transition-all border-primary/20 ${!isLimitsLocked ? 'cursor-pointer hover:ring-2 hover:ring-primary/20 hover:bg-primary/5' : 'bg-muted/30 opacity-80'}`}
                                    onClick={() => {
                                        if (!isLimitsLocked) {
                                            setBoothLimitsDialogOpen(true);
                                        }
                                    }}
                                >
                                    <CardContent className="px-2 py-0">
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-bold text-foreground">
                                                    تحديد حدود الأماكن
                                                </p>
                                            </div>
                                            <div className={`${!isLimitsLocked ? 'bg-primary/10' : 'bg-muted'} p-1.5 rounded-full`}>
                                                {/* <Building2 className={`w-6 h-6 ${!isLimitsLocked ? 'text-primary' : 'text-muted-foreground'}`} /> */}
                                                {!isLimitsLocked ? (
                                                    <Pencil className="w-3 h-3 text-primary/60" />
                                                ) : (
                                                    <Lock className="w-3 h-3 text-muted-foreground" />
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TooltipTrigger>
                            {isLimitsLocked && (
                                <TooltipContent>
                                    <p>لا يمكنك تعديل الحدود بعد بدء التخطيط</p>
                                </TooltipContent>
                            )}
                        </Tooltip>
                    </TooltipProvider>

                    {/* Pie Chart */}
                    <ChartPieInteractive />
                </div>
            </div>

            {/* Universities Section */}
            <Collapsible open={universitiesOpen} onOpenChange={setUniversitiesOpen} className="mb-4">
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">دعوة الجامعات</CardTitle>
                                <ChevronDown className={`w-5 h-5 transition-transform ${universitiesOpen ? 'transform rotate-180' : ''}`} />
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            {/* Filters */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ابحث عن جامعة أو بريد إلكتروني..."
                                        value={searchQuery}
                                        onChange={(e) => handleSearchChange(e.target.value)}
                                        className="pr-10"
                                    />
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedUniversityId(null);
                                                        setParticipationFee("");
                                                        setResponseDeadline("");
                                                        setInviteDialogOpen(true);
                                                    }}
                                                    className="gap-2"
                                                    disabled={!hasAvailableUniversities || !!(exhibitionStatus && ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus))}
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    إضافة مشارك جديد
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {exhibitionStatus && ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus)
                                                    ? 'لقد قمت بالفعل بتأكيد جميع تفاصيل المعرض، ولا يمكنك إرسال المزيد من الدعوات'
                                                    : !hasAvailableUniversities
                                                        ? 'جميع الجامعات تمت دعوتها بالفعل'
                                                        : 'إضافة جامعة جديدة للمشاركة في المعرض'
                                                }
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Table */}
                            <div className="border rounded-xl overflow-hidden mb-6 flex-1 flex-col">
                                <div className="overflow-x-auto flex-1">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">المعرف</TableHead>
                                                <TableHead className="text-right">اسم الجامعة</TableHead>
                                                <TableHead className="text-right">الحالة</TableHead>
                                                <TableHead className="text-right">الأماكن المعتمدة</TableHead>
                                                <TableHead className="text-right">رسوم المشاركة</TableHead>
                                                <TableHead className="text-right">حالة الدفع</TableHead>
                                                <TableHead className="text-right">تاريخ الدعوة</TableHead>
                                                <TableHead className="text-right">الموعد النهائي</TableHead>
                                                <TableHead className="text-right">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingParticipations ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8">
                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span>جاري تحميل المشاركات...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : currentParticipations.length > 0 ? (
                                                currentParticipations.map((participation) => {
                                                    return (
                                                        <TableRow key={participation.id}>
                                                            <TableCell>
                                                                <Badge variant="outline">{participation.id}</Badge>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="w-4 h-4 text-primary" />
                                                                    <span>{participation.universityName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getStatusColor(participation.status)}>
                                                                    {getStatusLabel(participation.status)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.approvedBoothsCount ? (
                                                                    <Badge variant="secondary">{participation.approvedBoothsCount}</Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.participationFee ? (
                                                                    <span className="text-sm font-medium">${participation.participationFee.toLocaleString()}</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge variant={participation.paymentStatus === 'PAID' ? 'default' : 'outline'}>
                                                                    {getPaymentStatusLabel(participation.paymentStatus || 'UNPAID')}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.invitedAt ? (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(participation.invitedAt).toLocaleDateString('en-US')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.responseDeadline ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className={`text-sm ${isConfirmationDeadlinePassed(participation.responseDeadline)
                                                                            ? 'text-red-600 font-semibold'
                                                                            : 'text-muted-foreground'
                                                                            }`}>
                                                                            {new Date(participation.responseDeadline).toLocaleDateString('en-US')}
                                                                        </span>
                                                                        {isConfirmationDeadlinePassed(participation.responseDeadline) && (
                                                                            <Badge variant="destructive" className="text-xs w-fit">
                                                                                منتهي
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">غير محدد</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    {participation.status === 'REGISTERED' && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleOpenReviewDialog(participation.id)}
                                                                            variant="outline"
                                                                        >
                                                                            مراجعة
                                                                        </Button>
                                                                    )}
                                                                    {participation.status === 'ACCEPTED' && participation.paymentStatus !== 'PAID' && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleConfirmPayment(participation.id)}
                                                                            disabled={isConfirmingPayment || isConfirmationDeadlinePassed(participation.confirmationDeadline)}
                                                                            variant="default"
                                                                            title={isConfirmationDeadlinePassed(participation.confirmationDeadline) ? 'انتهى الموعد النهائي للتأكيد' : ''}
                                                                        >
                                                                            {isConfirmingPayment ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                    جاري...
                                                                                </>
                                                                            ) : isConfirmationDeadlinePassed(participation.confirmationDeadline) ? (
                                                                                'انتهى الموعد'
                                                                            ) : (
                                                                                'تأكيد الدفع'
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                    {/* REMOVED: Universities finalize from their own dashboard */}
                                                                    {participation.status === 'FINALIZED' && !participation.attendedAt && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleMarkUniversityAttendance(participation.id)}
                                                                            disabled={markingAttendanceId === participation.id && markingAttendanceType === 'university'}
                                                                            variant="default"
                                                                        >
                                                                            {markingAttendanceId === participation.id && markingAttendanceType === 'university' ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                    جاري...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CheckCircle2 className="w-4 h-4 ml-2" />
                                                                                    تسجيل الحضور
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                    {participation.attendedAt && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            حضر في: {new Date(participation.attendedAt).toLocaleDateString('en-US')}
                                                                        </span>
                                                                    )}
                                                                    {participation.status !== 'CANCELLED' && (!exhibitionStatus || !['ACTIVE', 'COMPLETED'].includes(exhibitionStatus)) && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => handleCancelUniversityParticipation(participation.id)}
                                                                            disabled={isCancelling}
                                                                        >
                                                                            إلغاء
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد مشاركات'}
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                                        <p className="text-sm text-muted-foreground">
                                            عرض {startIndex + 1} - {Math.min(endIndex, filteredParticipations.length)} من {filteredParticipations.length}
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                disabled={currentPage === 1}
                                                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                <ChevronRight className="w-4 h-4" />
                                                السابق
                                            </button>
                                            <span className="text-sm text-muted-foreground px-2">
                                                صفحة {currentPage} من {totalPages}
                                            </span>
                                            <button
                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                disabled={currentPage === totalPages}
                                                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                            >
                                                التالي
                                                <ChevronLeft className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Activity Providers Section */}
            <Collapsible open={providersOpen} onOpenChange={setProvidersOpen} className="mb-4">
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">دعوة مقدمي الأنشطة</CardTitle>
                                <ChevronDown className={`w-5 h-5 transition-transform ${providersOpen ? 'transform rotate-180' : ''}`} />
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            {/* Filters */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ابحث عن مقدم نشاط..."
                                        value={providerSearchQuery}
                                        onChange={(e) => {
                                            setProviderSearchQuery(e.target.value);
                                            setProviderCurrentPage(1);
                                        }}
                                        className="pr-10"
                                    />
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedProviderId(null);
                                                        setProviderOrgRequirements("");
                                                        setProviderResponseDeadline("");
                                                        setInviteProviderDialogOpen(true);
                                                    }}
                                                    className="gap-2"
                                                    disabled={!!(exhibitionStatus && ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus))}
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    دعوة مقدم نشاط
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {exhibitionStatus && ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus)
                                                    ? 'لقد قمت بالفعل بتأكيد جميع تفاصيل المعرض، ولا يمكنك إرسال المزيد من الدعوات'
                                                    : 'دعوة مقدم نشاط جديد للمشاركة في المعرض'
                                                }
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Table */}
                            <div className="border rounded-xl overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">المعرف</TableHead>
                                                <TableHead className="text-right">اسم مقدم النشاط</TableHead>
                                                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                                <TableHead className="text-right">الحالة</TableHead>
                                                <TableHead className="text-right">الأماكن المقترحة</TableHead>
                                                <TableHead className="text-right">التكلفة</TableHead>
                                                <TableHead className="text-right">تاريخ الدعوة</TableHead>
                                                <TableHead className="text-right">الموعد النهائي</TableHead>
                                                <TableHead className="text-right">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingRequests ? (
                                                <TableRow>
                                                    <TableCell colSpan={9} className="text-center py-8">
                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span>جاري تحميل الطلبات...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (() => {
                                                const exhibitionRequests = Array.from(providerRequests.values()).flat().filter(req => req.exhibitionId === Number(id));
                                                const filteredRequests = exhibitionRequests.filter(req =>
                                                    req.name.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
                                                    req.email.toLowerCase().includes(providerSearchQuery.toLowerCase())
                                                );
                                                const startIndex = (providerCurrentPage - 1) * ITEMS_PER_PAGE;
                                                const endIndex = startIndex + ITEMS_PER_PAGE;
                                                const currentRequests = filteredRequests.slice(startIndex, endIndex);

                                                return currentRequests.length > 0 ? (
                                                    currentRequests.map((request) => (
                                                        <TableRow key={request.id}>
                                                            <TableCell>
                                                                <Badge variant="outline">{request.id}</Badge>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="w-4 h-4 text-primary" />
                                                                    <span>{request.name}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-sm text-muted-foreground">{request.email}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getProviderStatusColor(request.status)}>
                                                                    {getProviderStatusLabel(request.status)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {request.proposedBoothsCount !== null && request.proposedBoothsCount !== undefined ? (
                                                                    <Badge variant="secondary">{request.proposedBoothsCount}</Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {request.totalCost !== null && request.totalCost !== undefined ? (
                                                                    <span className="text-sm font-medium">${request.totalCost.toLocaleString()}</span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {request.invitedAt ? (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(request.invitedAt).toLocaleDateString('en-US')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {request.responseDeadline ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className={`text-sm ${isConfirmationDeadlinePassed(request.responseDeadline)
                                                                            ? 'text-red-600 font-semibold'
                                                                            : 'text-muted-foreground'
                                                                            }`}>
                                                                            {new Date(request.responseDeadline).toLocaleDateString('en-US')}
                                                                        </span>
                                                                        {isConfirmationDeadlinePassed(request.responseDeadline) && (
                                                                            <Badge variant="destructive" className="text-xs w-fit">
                                                                                منتهي
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">غير محدد</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    {request.status === 'PROPOSED' && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleOpenReviewProviderDialog(request.id)}
                                                                            variant="outline"
                                                                        >
                                                                            مراجعة
                                                                        </Button>
                                                                    )}
                                                                    {(request.status === 'CONFIRMED' || request.status === 'FINALIZED') && !request.attendedAt && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleMarkProviderAttendance(request.id)}
                                                                            disabled={markingAttendanceId === request.id && markingAttendanceType === 'provider'}
                                                                            variant="default"
                                                                        >
                                                                            {markingAttendanceId === request.id && markingAttendanceType === 'provider' ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                    جاري...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CheckCircle2 className="w-4 h-4 ml-2" />
                                                                                    تسجيل الحضور
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                    {request.attendedAt && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            حضر في: {new Date(request.attendedAt).toLocaleDateString('en-US')}
                                                                        </span>
                                                                    )}
                                                                    {request.status !== 'CANCELLED' && (!exhibitionStatus || !['ACTIVE', 'COMPLETED'].includes(exhibitionStatus)) && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => handleCancelProviderParticipation(request.id)}
                                                                            disabled={isCancelling}
                                                                        >
                                                                            إلغاء
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                                            {providerSearchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد طلبات'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })()}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {(() => {
                                    const exhibitionRequests = Array.from(providerRequests.values()).flat().filter(req => req.exhibitionId === Number(id));
                                    const filteredRequests = exhibitionRequests.filter(req =>
                                        req.name.toLowerCase().includes(providerSearchQuery.toLowerCase()) ||
                                        req.email.toLowerCase().includes(providerSearchQuery.toLowerCase())
                                    );
                                    const totalPages = Math.ceil(filteredRequests.length / ITEMS_PER_PAGE);
                                    const startIndex = (providerCurrentPage - 1) * ITEMS_PER_PAGE;
                                    const endIndex = startIndex + ITEMS_PER_PAGE;

                                    return totalPages > 1 && (
                                        <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                                            <p className="text-sm text-muted-foreground">
                                                عرض {startIndex + 1} - {Math.min(endIndex, filteredRequests.length)} من {filteredRequests.length}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setProviderCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={providerCurrentPage === 1}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                    السابق
                                                </button>
                                                <span className="text-sm text-muted-foreground px-2">
                                                    صفحة {providerCurrentPage} من {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setProviderCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={providerCurrentPage === totalPages}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    التالي
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Schools Section */}
            <Collapsible open={schoolsOpen} onOpenChange={setSchoolsOpen} className="mb-4">
                <Card>
                    <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-accent/5 transition-colors">
                            <div className="flex items-center justify-between">
                                <CardTitle className="text-lg font-semibold">دعوة المدارس</CardTitle>
                                <ChevronDown className={`w-5 h-5 transition-transform ${schoolsOpen ? 'transform rotate-180' : ''}`} />
                            </div>
                        </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                        <CardContent className="pt-0">
                            {/* Filters */}
                            <div className="flex gap-4 mb-6">
                                <div className="flex-1 relative">
                                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <Input
                                        placeholder="ابحث عن مدرسة..."
                                        value={schoolSearchQuery}
                                        onChange={(e) => {
                                            setSchoolSearchQuery(e.target.value);
                                            setSchoolCurrentPage(1);
                                        }}
                                        className="pr-10"
                                    />
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <span className="inline-block">
                                                <Button
                                                    onClick={() => {
                                                        setSelectedSchoolId(null);
                                                        setSchoolResponseDeadline("");
                                                        setInviteSchoolDialogOpen(true);
                                                    }}
                                                    className="gap-2"
                                                    disabled={!hasAvailableSchools || !!(exhibitionStatus && ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus))}
                                                >
                                                    <UserPlus className="w-4 h-4" />
                                                    دعوة مدرسة
                                                </Button>
                                            </span>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>
                                                {exhibitionStatus && ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(exhibitionStatus)
                                                    ? 'لقد قمت بالفعل بتأكيد جميع تفاصيل المعرض، ولا يمكنك إرسال المزيد من الدعوات'
                                                    : !hasAvailableSchools
                                                        ? 'جميع المدارس تمت دعوتها بالفعل'
                                                        : 'إضافة مدرسة جديدة للمشاركة في المعرض'
                                                }
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>

                            {/* Table */}
                            <div className="border rounded-xl overflow-hidden mb-6">
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader>
                                            <TableRow>
                                                <TableHead className="text-right">المعرف</TableHead>
                                                <TableHead className="text-right">اسم المدرسة</TableHead>
                                                <TableHead className="text-right">البريد الإلكتروني</TableHead>
                                                <TableHead className="text-right">الحالة</TableHead>
                                                <TableHead className="text-right">عدد الطلاب المتوقع</TableHead>
                                                <TableHead className="text-right">تاريخ الدعوة</TableHead>
                                                <TableHead className="text-right">الموعد النهائي</TableHead>
                                                <TableHead className="text-right">الإجراءات</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {isLoadingSchoolParticipations ? (
                                                <TableRow>
                                                    <TableCell colSpan={8} className="text-center py-8">
                                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                                            <Loader2 className="w-5 h-5 animate-spin" />
                                                            <span>جاري تحميل المشاركات...</span>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ) : (() => {
                                                const participations = schoolParticipations.get(Number(id)) || [];
                                                const filteredParticipations = participations.filter(p =>
                                                    p.schoolName.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
                                                    p.contactEmail.toLowerCase().includes(schoolSearchQuery.toLowerCase())
                                                );
                                                const startIndex = (schoolCurrentPage - 1) * ITEMS_PER_PAGE;
                                                const endIndex = startIndex + ITEMS_PER_PAGE;
                                                const currentParticipations = filteredParticipations.slice(startIndex, endIndex);

                                                return currentParticipations.length > 0 ? (
                                                    currentParticipations.map((participation) => (
                                                        <TableRow key={participation.id}>
                                                            <TableCell>
                                                                <Badge variant="outline">{participation.id}</Badge>
                                                            </TableCell>
                                                            <TableCell className="font-medium">
                                                                <div className="flex items-center gap-2">
                                                                    <Building2 className="w-4 h-4 text-primary" />
                                                                    <span>{participation.schoolName}</span>
                                                                </div>
                                                            </TableCell>
                                                            <TableCell>
                                                                <span className="text-sm text-muted-foreground">{participation.contactEmail}</span>
                                                            </TableCell>
                                                            <TableCell>
                                                                <Badge className={getSchoolStatusColor(participation.status)}>
                                                                    {getSchoolStatusLabel(participation.status)}
                                                                </Badge>
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.expectedStudents !== null ? (
                                                                    <Badge variant="secondary">{participation.expectedStudents}</Badge>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.invitedAt ? (
                                                                    <span className="text-sm text-muted-foreground">
                                                                        {new Date(participation.invitedAt).toLocaleDateString('ar')}
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">-</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                {participation.responseDeadline ? (
                                                                    <div className="flex flex-col gap-1">
                                                                        <span className={`text-sm ${isConfirmationDeadlinePassed(participation.responseDeadline)
                                                                            ? 'text-red-600 font-semibold'
                                                                            : 'text-muted-foreground'
                                                                            }`}>
                                                                            {new Date(participation.responseDeadline).toLocaleDateString('ar')}
                                                                        </span>
                                                                        {isConfirmationDeadlinePassed(participation.responseDeadline) && (
                                                                            <Badge variant="destructive" className="text-xs w-fit">
                                                                                منتهي
                                                                            </Badge>
                                                                        )}
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground text-sm">غير محدد</span>
                                                                )}
                                                            </TableCell>
                                                            <TableCell>
                                                                <div className="flex gap-2">
                                                                    {participation.status === 'REGISTERED' && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleOpenAcceptSchoolDialog(participation.id)}
                                                                            variant="outline"
                                                                        >
                                                                            مراجعة
                                                                        </Button>
                                                                    )}
                                                                    {(participation.status === 'CONFIRMED' || participation.status === 'FINALIZED') && !participation.attendedAt && (
                                                                        <Button
                                                                            size="sm"
                                                                            onClick={() => handleMarkSchoolAttendance(participation.id)}
                                                                            disabled={markingAttendanceId === participation.id && markingAttendanceType === 'school'}
                                                                            variant="default"
                                                                        >
                                                                            {markingAttendanceId === participation.id && markingAttendanceType === 'school' ? (
                                                                                <>
                                                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                                    جاري...
                                                                                </>
                                                                            ) : (
                                                                                <>
                                                                                    <CheckCircle2 className="w-4 h-4 ml-2" />
                                                                                    تسجيل الحضور
                                                                                </>
                                                                            )}
                                                                        </Button>
                                                                    )}
                                                                    {participation.attendedAt && (
                                                                        <span className="text-xs text-muted-foreground">
                                                                            حضر في: {new Date(participation.attendedAt).toLocaleDateString('en-US')}
                                                                        </span>
                                                                    )}
                                                                    {(participation.status === 'CANCELLED' || participation.status === 'REJECTED') && (
                                                                        <span className="text-sm text-muted-foreground">-</span>
                                                                    )}
                                                                    {participation.status !== 'CANCELLED' && participation.status !== 'REJECTED' && (!exhibitionStatus || !['ACTIVE', 'COMPLETED'].includes(exhibitionStatus)) && (
                                                                        <Button
                                                                            size="sm"
                                                                            variant="ghost"
                                                                            className="text-red-500 hover:text-red-700 hover:bg-red-50"
                                                                            onClick={() => handleCancelSchoolParticipation(participation.id)}
                                                                            disabled={isCancelling}
                                                                        >
                                                                            إلغاء
                                                                        </Button>
                                                                    )}
                                                                </div>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))
                                                ) : (
                                                    <TableRow>
                                                        <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                                                            {schoolSearchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد مشاركات'}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })()}
                                        </TableBody>
                                    </Table>
                                </div>

                                {/* Pagination */}
                                {(() => {
                                    const participations = schoolParticipations.get(Number(id)) || [];
                                    const filteredParticipations = participations.filter(p =>
                                        p.schoolName.toLowerCase().includes(schoolSearchQuery.toLowerCase()) ||
                                        p.contactEmail.toLowerCase().includes(schoolSearchQuery.toLowerCase())
                                    );
                                    const totalPages = Math.ceil(filteredParticipations.length / ITEMS_PER_PAGE);
                                    const startIndex = (schoolCurrentPage - 1) * ITEMS_PER_PAGE;
                                    const endIndex = startIndex + ITEMS_PER_PAGE;

                                    return totalPages > 1 && (
                                        <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                                            <p className="text-sm text-muted-foreground">
                                                عرض {startIndex + 1} - {Math.min(endIndex, filteredParticipations.length)} من {filteredParticipations.length}
                                            </p>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setSchoolCurrentPage(p => Math.max(1, p - 1))}
                                                    disabled={schoolCurrentPage === 1}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    <ChevronRight className="w-4 h-4" />
                                                    السابق
                                                </button>
                                                <span className="text-sm text-muted-foreground px-2">
                                                    صفحة {schoolCurrentPage} من {totalPages}
                                                </span>
                                                <button
                                                    onClick={() => setSchoolCurrentPage(p => Math.min(totalPages, p + 1))}
                                                    disabled={schoolCurrentPage === totalPages}
                                                    className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                                >
                                                    التالي
                                                    <ChevronLeft className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })()}
                            </div>
                        </CardContent>
                    </CollapsibleContent>
                </Card>
            </Collapsible>

            {/* Filters */}
            <div className="flex gap-4 mb-6" style={{ display: 'none' }}>
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                        placeholder="ابحث عن جامعة أو بريد إلكتروني..."
                        value={searchQuery}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="pr-10"
                    />
                </div>
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="inline-block">
                                <Button
                                    onClick={() => {
                                        setSelectedUniversityId(null);
                                        setParticipationFee("");
                                        setResponseDeadline("");
                                        setInviteDialogOpen(true);
                                    }}
                                    className="gap-2"
                                    disabled={!hasAvailableUniversities}
                                >
                                    <UserPlus className="w-4 h-4" />
                                    إضافة مشارك جديد
                                </Button>
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>
                                {!hasAvailableUniversities
                                    ? 'جميع الجامعات تمت دعوتها بالفعل'
                                    : 'إضافة جامعة جديدة للمشاركة في المعرض'
                                }
                            </p>
                        </TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            {/* Table */}
            <div className="border rounded-xl overflow-hidden mb-6 flex-1 flex-col" style={{ display: 'none' }}>
                <div className="overflow-x-auto flex-1">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="text-right">المعرف</TableHead>
                                <TableHead className="text-right">اسم الجامعة</TableHead>
                                <TableHead className="text-right">الحالة</TableHead>
                                <TableHead className="text-right">الأماكن المعتمدة</TableHead>
                                <TableHead className="text-right">رسوم المشاركة</TableHead>
                                <TableHead className="text-right">حالة الدفع</TableHead>
                                <TableHead className="text-right">تاريخ الدعوة</TableHead>
                                <TableHead className="text-right">الموعد النهائي</TableHead>
                                <TableHead className="text-right">الإجراءات</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoadingParticipations ? (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8">
                                        <div className="flex items-center justify-center gap-2 text-muted-foreground">
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                            <span>جاري تحميل المشاركات...</span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : currentParticipations.length > 0 ? (
                                currentParticipations.map((participation) => {
                                    return (
                                        <TableRow key={participation.id}>
                                            <TableCell>
                                                <Badge variant="outline">{participation.id}</Badge>
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                <div className="flex items-center gap-2">
                                                    <Building2 className="w-4 h-4 text-primary" />
                                                    <span>{participation.universityName}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(participation.status)}>
                                                    {getStatusLabel(participation.status)}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {participation.approvedBoothsCount ? (
                                                    <Badge variant="secondary">{participation.approvedBoothsCount}</Badge>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {participation.participationFee ? (
                                                    <span className="text-sm font-medium">${participation.participationFee.toLocaleString()}</span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={participation.paymentStatus === 'PAID' ? 'default' : 'outline'}>
                                                    {getPaymentStatusLabel(participation.paymentStatus || 'UNPAID')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {participation.invitedAt ? (
                                                    <span className="text-sm text-muted-foreground">
                                                        {new Date(participation.invitedAt).toLocaleDateString('ar')}
                                                    </span>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                {participation.responseDeadline ? (
                                                    <div className="flex flex-col gap-1">
                                                        <span className={`text-sm ${isConfirmationDeadlinePassed(participation.responseDeadline)
                                                            ? 'text-red-600 font-semibold'
                                                            : 'text-muted-foreground'
                                                            }`}>
                                                            {new Date(participation.responseDeadline).toLocaleDateString('ar')}
                                                        </span>
                                                        {isConfirmationDeadlinePassed(participation.responseDeadline) && (
                                                            <Badge variant="destructive" className="text-xs w-fit">
                                                                منتهي
                                                            </Badge>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-muted-foreground text-sm">غير محدد</span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    {participation.status === 'REGISTERED' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleOpenReviewDialog(participation.id)}
                                                            variant="outline"
                                                        >
                                                            مراجعة
                                                        </Button>
                                                    )}
                                                    {participation.status === 'ACCEPTED' && participation.paymentStatus !== 'PAID' && (
                                                        <Button
                                                            size="sm"
                                                            onClick={() => handleConfirmPayment(participation.id)}
                                                            disabled={isConfirmingPayment || isConfirmationDeadlinePassed(participation.confirmationDeadline)}
                                                            variant="default"
                                                            title={isConfirmationDeadlinePassed(participation.confirmationDeadline) ? 'انتهى الموعد النهائي للتأكيد' : ''}
                                                        >
                                                            {isConfirmingPayment ? (
                                                                <>
                                                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                                                    جاري...
                                                                </>
                                                            ) : isConfirmationDeadlinePassed(participation.confirmationDeadline) ? (
                                                                'انتهى الموعد'
                                                            ) : (
                                                                'تأكيد الدفع'
                                                            )}
                                                        </Button>
                                                    )}
                                                    {/* REMOVED: Universities finalize from their own dashboard */}
                                                    {(participation.status === 'CONFIRMED' || participation.status === 'FINALIZED') && (
                                                        <span className="text-sm text-muted-foreground">-</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                                        {searchQuery ? 'لا توجد نتائج للبحث' : 'لا توجد مشاركات'}
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="border-t p-4 flex items-center justify-between bg-muted/20">
                        <p className="text-sm text-muted-foreground">
                            عرض {startIndex + 1} - {Math.min(endIndex, filteredParticipations.length)} من {filteredParticipations.length}
                        </p>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <ChevronRight className="w-4 h-4" />
                                السابق
                            </button>
                            <span className="text-sm text-muted-foreground px-2">
                                صفحة {currentPage} من {totalPages}
                            </span>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="inline-flex items-center gap-1 px-3 py-2 text-sm bg-card border border-border rounded-lg hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                التالي
                                <ChevronLeft className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Invite University Dialog */}
            <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">دعوة جامعة للمشاركة</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر الجامعة وأدخل تفاصيل الدعوة
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        <div className="space-y-2">
                            <Label htmlFor="university" className="text-right block">
                                اختر الجامعة *
                            </Label>
                            <Select
                                value={selectedUniversityId?.toString()}
                                onValueChange={(value) => setSelectedUniversityId(parseInt(value))}
                                disabled={!hasAvailableUniversities}
                            >
                                <SelectTrigger className="text-right">
                                    <SelectValue placeholder={hasAvailableUniversities ? "اختر جامعة..." : "جميع الجامعات تمت دعوتها"} />
                                </SelectTrigger>
                                <SelectContent>
                                    {hasAvailableUniversities ? (
                                        universities.map((university) => {
                                            const canInvite = canInviteUniversity(university.id);
                                            const participation = participations.get(university.id);
                                            const statusLabel = participation
                                                ? ` (${getStatusLabel(participation.status)})`
                                                : '';

                                            return (
                                                <SelectItem
                                                    key={university.id}
                                                    value={university.id.toString()}
                                                    disabled={!canInvite}
                                                >
                                                    {university.name}{statusLabel}
                                                </SelectItem>
                                            );
                                        })
                                    ) : (
                                        <div className="p-4 text-center text-sm text-muted-foreground">
                                            جميع الجامعات تمت دعوتها بالفعل
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                            <p className="text-xs text-muted-foreground">
                                {hasAvailableUniversities
                                    ? 'الجامعات المعطلة سبق دعوتها لهذا المعرض ولا يمكن دعوتها مجدداً'
                                    : 'تمت دعوة جميع الجامعات المتاحة لهذا المعرض'
                                }
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="participationFee" className="text-right block">
                                رسوم المشاركة *
                            </Label>
                            <Input
                                id="participationFee"
                                type="number"
                                min="0"
                                step="0.01"
                                value={participationFee}
                                onChange={(e) => setParticipationFee(e.target.value)}
                                placeholder="أدخل رسوم المشاركة"
                                className="text-right"
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="responseDeadline" className="text-right block">
                                الموعد النهائي للرد *
                            </Label>
                            <Input
                                id="responseDeadline"
                                type="datetime-local"
                                value={responseDeadline}
                                onChange={(e) => setResponseDeadline(e.target.value)}
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                حدد الموعد النهائي الذي يجب على الجامعة الرد قبله
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setInviteDialogOpen(false)}
                            disabled={isInviting}
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleInviteUniversity}
                            disabled={isInviting || !participationFee || !responseDeadline}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isInviting ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 ml-2" />
                                    إرسال الدعوة
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Participation Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">مراجعة مشاركة الجامعة</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر قبول أو رفض المشاركة ويمكنك تحديد موعد نهائي للتأكيد (اختياري)
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        <div className="space-y-2">
                            <Label htmlFor="confirmationDeadline" className="text-right block">
                                الموعد النهائي للتأكيد *
                            </Label>
                            <Input
                                id="confirmationDeadline"
                                type="datetime-local"
                                value={confirmationDeadline}
                                onChange={(e) => setConfirmationDeadline(e.target.value)}
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                حدد الموعد النهائي الذي يجب على الجامعة تأكيد مشاركتها قبله
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setReviewDialogOpen(false)}
                            disabled={isReviewing}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleReview(false)}
                            disabled={isReviewing}
                        >
                            {isReviewing ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الرفض...
                                </>
                            ) : (
                                'رفض'
                            )}
                        </Button>
                        <Button
                            onClick={() => handleReview(true)}
                            disabled={isReviewing || !confirmationDeadline}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isReviewing ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري القبول...
                                </>
                            ) : (
                                'قبول'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite Provider Dialog */}
            <Dialog open={inviteProviderDialogOpen} onOpenChange={setInviteProviderDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">دعوة مقدم نشاط للمشاركة</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر مقدم النشاط وأدخل تفاصيل الدعوة
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        <div className="space-y-2">
                            <Label htmlFor="provider" className="text-right block">
                                اختر مقدم النشاط *
                            </Label>
                            <Select
                                value={selectedProviderId?.toString()}
                                onValueChange={(value) => setSelectedProviderId(parseInt(value))}
                            >
                                <SelectTrigger className="text-right">
                                    <SelectValue placeholder="اختر مقدم نشاط..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingAllProviders ? (
                                        <div className="p-2 text-center text-muted-foreground">
                                            <Loader2 className="w-4 h-4 animate-spin inline-block ml-2" />
                                            جاري التحميل...
                                        </div>
                                    ) : allProviders.length > 0 ? (
                                        allProviders.map((provider) => (
                                            <SelectItem
                                                key={provider.id}
                                                value={provider.id.toString()}
                                            >
                                                {provider.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-center text-muted-foreground">
                                            لا توجد مقدمي أنشطة متاحين
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerRequirements" className="text-right block">
                                متطلبات المنظمة (اختياري)
                            </Label>
                            <Textarea
                                id="providerRequirements"
                                value={providerOrgRequirements}
                                onChange={(e) => setProviderOrgRequirements(e.target.value)}
                                placeholder="أدخل أي متطلبات أو ملاحظات للمقدم..."
                                className="text-right"
                                rows={4}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerResponseDeadline" className="text-right block">
                                الموعد النهائي للرد *
                            </Label>
                            <Input
                                id="providerResponseDeadline"
                                type="datetime-local"
                                value={providerResponseDeadline}
                                onChange={(e) => setProviderResponseDeadline(e.target.value)}
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                حدد الموعد النهائي الذي يجب على مقدم النشاط الرد قبله
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setInviteProviderDialogOpen(false)}
                            disabled={isInvitingProvider}
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleInviteProvider}
                            disabled={isInvitingProvider || !selectedProviderId || !providerResponseDeadline}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isInvitingProvider ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 ml-2" />
                                    إرسال الدعوة
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Review Provider Proposal Dialog */}
            <Dialog open={reviewProviderDialogOpen} onOpenChange={setReviewProviderDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">مراجعة اقتراح مقدم النشاط</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر قبول أو رفض الاقتراح ويمكنك تحديد موعد نهائي للتأكيد وإضافة ملاحظات
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        {selectedProviderRequestId && (() => {
                            const allRequests = Array.from(providerRequests.values()).flat();
                            const request = allRequests.find(r => r.id === selectedProviderRequestId);
                            return request ? (
                                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                    <p className="text-sm font-medium">{request.name}</p>
                                    {request.providerProposal && (
                                        <div className="text-xs text-muted-foreground">
                                            <p className="font-medium">الاقتراح:</p>
                                            <p className="mt-1">{request.providerProposal}</p>
                                        </div>
                                    )}
                                    {request.proposedBoothsCount !== null && (
                                        <p className="text-xs text-muted-foreground">
                                            عدد الأماكن المقترحة: {request.proposedBoothsCount}
                                        </p>
                                    )}
                                    {request.totalCost !== null && (
                                        <p className="text-xs text-muted-foreground">
                                            التكلفة الإجمالية: {request.totalCost} ر.س
                                        </p>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        <div className="space-y-2">
                            <Label htmlFor="providerConfirmationDeadline" className="text-right block">
                                الموعد النهائي للتأكيد *
                            </Label>
                            <Input
                                id="providerConfirmationDeadline"
                                type="datetime-local"
                                value={providerConfirmationDeadline}
                                onChange={(e) => setProviderConfirmationDeadline(e.target.value)}
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                حدد الموعد النهائي الذي يجب على مقدم النشاط تأكيد مشاركته قبله
                            </p>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="providerReviewComments" className="text-right block">
                                ملاحظات (اختياري)
                            </Label>
                            <Textarea
                                id="providerReviewComments"
                                value={providerReviewComments}
                                onChange={(e) => setProviderReviewComments(e.target.value)}
                                placeholder="أضف أي ملاحظات أو تعليقات..."
                                className="text-right"
                                rows={3}
                            />
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setReviewProviderDialogOpen(false)}
                            disabled={isReviewingProvider}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleReviewProvider(false)}
                            disabled={isReviewingProvider}
                        >
                            {isReviewingProvider ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الرفض...
                                </>
                            ) : (
                                'رفض'
                            )}
                        </Button>
                        <Button
                            onClick={() => handleReviewProvider(true)}
                            disabled={isReviewingProvider || !providerConfirmationDeadline}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isReviewingProvider ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري القبول...
                                </>
                            ) : (
                                'قبول'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite School Dialog */}
            <Dialog open={inviteSchoolDialogOpen} onOpenChange={setInviteSchoolDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">دعوة مدرسة للمشاركة</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر المدرسة وحدد الموعد النهائي للرد
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        <div className="space-y-2">
                            <Label htmlFor="school" className="text-right block">
                                اختر المدرسة *
                            </Label>
                            <Select
                                value={selectedSchoolId?.toString()}
                                onValueChange={(value) => setSelectedSchoolId(parseInt(value))}
                            >
                                <SelectTrigger className="text-right">
                                    <SelectValue placeholder="اختر مدرسة..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {isLoadingSchools ? (
                                        <div className="p-2 text-center text-muted-foreground">
                                            <Loader2 className="w-4 h-4 animate-spin inline-block ml-2" />
                                            جاري التحميل...
                                        </div>
                                    ) : availableSchools.length > 0 ? (
                                        availableSchools.map((school) => (
                                            <SelectItem
                                                key={school.id}
                                                value={school.id.toString()}
                                            >
                                                {school.name}
                                            </SelectItem>
                                        ))
                                    ) : (
                                        <div className="p-2 text-center text-muted-foreground">
                                            {schools.length === 0 ? 'لا توجد مدارس متاحة' : 'جميع المدارس تمت دعوتها بالفعل'}
                                        </div>
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="schoolResponseDeadline" className="text-right block">
                                الموعد النهائي للرد *
                            </Label>
                            <Input
                                id="schoolResponseDeadline"
                                type="datetime-local"
                                value={schoolResponseDeadline}
                                onChange={(e) => setSchoolResponseDeadline(e.target.value)}
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground">
                                حدد الموعد النهائي الذي يجب على المدرسة الرد قبله
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setInviteSchoolDialogOpen(false)}
                            disabled={isInvitingSchool}
                        >
                            إلغاء
                        </Button>
                        <Button
                            onClick={handleInviteSchool}
                            disabled={isInvitingSchool || !selectedSchoolId || !schoolResponseDeadline}
                            className="bg-primary hover:bg-primary/90"
                        >
                            {isInvitingSchool ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin ml-2" />
                                    جاري الإرسال...
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-4 h-4 ml-2" />
                                    إرسال الدعوة
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Accept School Dialog */}
            <Dialog open={acceptSchoolDialogOpen} onOpenChange={setAcceptSchoolDialogOpen}>
                <DialogContent className="sm:max-w-[500px]" dir="rtl">
                    <DialogHeader className="text-right">
                        <DialogTitle className="text-right">مراجعة مشاركة المدرسة</DialogTitle>
                        <DialogDescription className="text-right">
                            اختر قبول أو رفض المشاركة ويمكنك تحديد موعد نهائي للتأكيد
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 mt-4" dir="rtl">
                        {selectedSchoolParticipationId && (() => {
                            const allParticipations = Array.from(schoolParticipations.values()).flat();
                            const participation = allParticipations.find(p => p.id === selectedSchoolParticipationId);
                            return participation ? (
                                <div className="bg-muted/50 p-3 rounded-lg space-y-2">
                                    <p className="text-sm font-medium">{participation.schoolName}</p>
                                    {participation.expectedStudents !== null && (
                                        <p className="text-xs text-muted-foreground">
                                            عدد الطلاب المتوقع: {participation.expectedStudents}
                                        </p>
                                    )}
                                </div>
                            ) : null;
                        })()}

                        <div className="space-y-2">
                            <Label htmlFor="schoolConfirmationDeadline" className="text-right block">
                                الموعد النهائي للتأكيد *
                            </Label>
                            <Input
                                id="schoolConfirmationDeadline"
                                type="datetime-local"
                                value={schoolConfirmationDeadline}
                                onChange={(e) => setSchoolConfirmationDeadline(e.target.value)}
                                className="text-right"
                                required
                            />
                            <p className="text-xs text-muted-foreground text-right">
                                حدد الموعد النهائي الذي يجب على المدرسة تأكيد مشاركتها قبله
                            </p>
                        </div>
                    </div>

                    <DialogFooter className="flex gap-2 justify-end mt-4">
                        <Button
                            variant="outline"
                            onClick={() => setAcceptSchoolDialogOpen(false)}
                            disabled={isAcceptingSchool}
                        >
                            إلغاء
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => handleAcceptSchool(false)}
                            disabled={isAcceptingSchool}
                        >
                            {isAcceptingSchool ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري الرفض...
                                </>
                            ) : (
                                'رفض'
                            )}
                        </Button>
                        <Button
                            onClick={() => handleAcceptSchool(true)}
                            disabled={isAcceptingSchool || !schoolConfirmationDeadline}
                            className="bg-green-600 hover:bg-green-700"
                        >
                            {isAcceptingSchool ? (
                                <>
                                    <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                    جاري القبول...
                                </>
                            ) : (
                                'قبول'
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Exhibition Dialog */}
            <ConfirmExhibitionDialog
                open={confirmExhibitionDialogOpen}
                onOpenChange={setConfirmExhibitionDialogOpen}
                exhibitionId={parseInt(id!)}
                universities={allUniversities}
                schools={allSchools}
                onSuccess={handleConfirmExhibitionSuccess}
            />

            {/* Booth Limits Dialog */}
            {id && (
                <SetBoothLimitsDialog
                    exhibitionId={parseInt(id)}
                    open={boothLimitsDialogOpen}
                    onOpenChange={setBoothLimitsDialogOpen}
                />
            )}

            {/* Cancellation Confirmation Dialog */}
            <AlertDialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>هل أنت متأكد من رغبتك في الإلغاء؟</AlertDialogTitle>
                        <AlertDialogDescription>
                            هذا الإجراء سيقوم بإلغاء المشاركة نهائياً.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isCancelling}>تراجع</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleConfirmCancellation();
                            }}
                            disabled={isCancelling}
                            className="bg-accent text-accent-foreground hover:bg-accent/80"
                        >
                            {isCancelling ? <Loader2 className="w-4 h-4 animate-spin" /> : 'نعم، قم بالإلغاء'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Fixed Confirm Exhibition Button - Bottom Left */}
            {exhibitionStatus === 'PLANNING' && (
                <div className="fixed bottom-6 left-6 z-50">
                    <Button
                        onClick={() => setConfirmExhibitionDialogOpen(true)}
                        variant="outline"
                        size="lg"
                        className="bg-muted/80 hover:bg-muted border-muted-foreground/20 text-muted-foreground hover:text-foreground shadow-lg backdrop-blur-sm"
                    >
                        <CheckCircle2 className="w-5 h-5 ml-2" />
                        جاهز لتأكيد المعرض؟
                    </Button>
                </div>
            )}

        </div>
    );

}