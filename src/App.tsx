import { createBrowserRouter, Navigate, RouterProvider } from "react-router-dom";
import Welcome from "./pages/welcome.tsx";
import { authRoutes } from "./routes/auth";
// import {MainLayout} from "@/layout/main-layout.tsx";
import UpdateTest from "@/pages/update-test.tsx";
import Dashboard from "@/pages/dashboard.tsx";
import AddTestSheet from "@/components/dashboard/add-test-sheet.tsx";
import AddBaseTestSheet from "@/components/dashboard/add-base-test-sheet.tsx";
import AddMetricSheet from "@/components/dashboard/add-metric-sheet.tsx";
import EditMetricSheet from "@/components/dashboard/edit-metric-sheet.tsx";
import DeleteMetricAlert from "@/components/dashboard/delete-metric-alert.tsx";
import AddEditSectionDialog from "@/components/test-creation/add-edit-section-dialog.tsx";
import { DeleteAlertDialog } from "@/components/test-creation/delete-alert.tsx";
import { useAuthStore } from "@/stores/auth-store.tsx";
import UserHome from "@/pages/user-home.tsx";
import TakeTest from "@/pages/take-test.tsx";
import UserTestResult from "@/pages/user-test-result.tsx";
import LayoutWrapper from "@/layout/layout-wrapper.tsx";
import { Toaster } from "@/components/ui/sonner.tsx";
import BaseTest from "./pages/base-test.tsx";
import Profile from "./pages/profile.tsx";
import Analytics from "./pages/analytics.tsx";
import Attempts from "./pages/attempts.tsx";
import AnalyzePersonality from "./pages/analyze-personality.tsx";
import OrgOwnerExhibitions from "./pages/org-owner-exhibitions.tsx";
import OrgOwnerExhibition from "./pages/org-owner-exhibition.tsx";
import StudentExhibitions from "./pages/student-exhibitions.tsx";
import Municipality from "./components/exhibition/municipality.tsx";

function App() {
    const { accessToken, roles } = useAuthStore();
    console.log("role", roles[0]);
    console.log("accessToken", accessToken);
    const router = createBrowserRouter([
        {
            path: '/',

            children: [
                { index: true, element: <Welcome /> },
                {
                    path: 'profile',
                    element: <LayoutWrapper />,
                    children: [
                        { index: true, element: <Profile /> }
                    ]
                },
                {
                    path: 'dashboard',
                    element:
                        !accessToken ? <Navigate to="/login" replace /> : <LayoutWrapper />,
                    children:
                        roles[0] !== "ORG_OWNER" ? (
                            [
                                { index: true, element: <UserHome /> },
                                { path: "exhibitions", element: <StudentExhibitions /> },
                                { path: "analytics", element: <Analytics /> },
                                { path: "attempts", element: <Attempts /> },
                                { path: "tests/:testId/take/:attemptId", element: <TakeTest /> },
                                { path: "tests/:testId/take/:attemptId/result", element: <UserTestResult /> },
                                { path: ":attemptId/analyze-personality", element: <AnalyzePersonality /> },

                            ]
                        ) : (
                            [
                                {
                                    path: '',
                                    element: <Dashboard />,
                                    children: [
                                        { path: 'addBaseTestSheet', element: <AddBaseTestSheet /> },
                                    ]
                                },
                                { path: 'exhibitions', element: <OrgOwnerExhibitions /> },
                                { path: 'exhibitions/createExhibition', element: <OrgOwnerExhibitions /> },
                                {
                                    path: 'exhibitions/:id',
                                    element: <OrgOwnerExhibition />,
                                    children: [
                                        { path: 'municipality', element: <Municipality /> }
                                    ]
                                },
                                { path: 'analytics', element: <Analytics /> },
                                { path: 'attempts', element: <Attempts /> },
                                { path: ":attemptId/analyze-personality", element: <AnalyzePersonality /> },

                                {
                                    path: 'baseTests/:baseTestId',
                                    element: <BaseTest />,
                                    children: [
                                        { path: 'addMetric', element: <AddMetricSheet /> },
                                        { path: 'editMetric/:metricId', element: <EditMetricSheet /> },
                                        { path: 'deleteMetric/:metricId', element: <DeleteMetricAlert /> },
                                        { path: 'addTestSheet', element: <AddTestSheet /> },
                                    ]
                                },
                                {
                                    path: 'baseTests/:baseTestId/updateTest/:testId',
                                    element: <UpdateTest />,
                                    children: [
                                        { path: 'addSectionDialog', element: <AddEditSectionDialog /> },
                                        { path: 'editSectionDialog/:sectionId', element: <AddEditSectionDialog /> },
                                        { path: 'delete/:type/:id', element: <DeleteAlertDialog /> },
                                    ]
                                },
                            ]
                        ),


                },



            ],
        },
        ...authRoutes,
        { path: '*', element: <h1>404 Not Found</h1> },
    ]);


    return (
        <>
            <RouterProvider router={router} />
            <Toaster position="top-center" richColors />
        </>
    )
}

export default App
