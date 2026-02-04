import { type ColumnDef } from "@tanstack/react-table";
import { 
  MoreHorizontal,
  ArrowUpDown, 
  Eye,
  Search
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { TestAttemptWithAnswersResponse } from "@/types/test-attempt-with-answers-response.ts";
// import React from "react";
import { useNavigate } from "react-router-dom";

//  type ProductStatus = "معلق" | "نشط" | "غير نشط" | "للبيع" | "مرتد";

//  export type Product = {
//   id: string;
//   email: string;
//   attemptId: string;
//   price: number;
//   stock: string;
//   type: string;
//   status: ProductStatus;
//   avatar: string;
// };


// export const StatusBadge = ({ status }: { status: ProductStatus }) => {
//   const statusStyles: Record<ProductStatus, string> = {
//     "معلق": "bg-status-pending-bg text-status-pending border-0",
//     "نشط": "bg-status-active-bg text-status-active border-0",
//     "غير نشط": "bg-status-inactive-bg text-status-inactive border-0",
//     "للبيع": "bg-status-on-sale-bg text-status-on-sale border-0",
//     "مرتد": "bg-status-bouncing-bg text-status-bouncing border-0",
//   };

//   return (
//     <Badge variant="outline" className={`${statusStyles[status]} font-medium text-xs px-3 py-1 rounded-full`}>
//       {status}
//     </Badge>
//   );
// };

const ActionsCell = ({ attemptId }: { attemptId: number }) => {
  const navigate = useNavigate();
  function handleVeiwPersonalityAnalysis() {
    // Navigate to the analyze-personality page, passing attemptId in state
    navigate(`/dashboard/${attemptId}/analyze-personality`, { state: { attemptId } });
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0 hover:bg-muted mx-auto block">
          <span className="sr-only">فتح القائمة</span>
          <MoreHorizontal className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-45">
        <DropdownMenuItem onClick={() => console.log("View answers")}>
          <Eye className="w-4 h-4 ml-2" />
            عرض الإجابات
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleVeiwPersonalityAnalysis}
          // className="text-destructive focus:text-destructive"
        >
          <Search className="w-4 h-4 ml-2" />
            عرض تحليل الشخصية
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const columns: ColumnDef<TestAttemptWithAnswersResponse>[] = [
  
    {
    accessorKey: "attemptId",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent text-xs font-medium text-muted-foreground w-full justify-center text-center"
      >
        رقم المحاولة
        <ArrowUpDown className="mr-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => (
      <span className="text-muted-foreground text-center w-full block">{row.original.attemptId}</span>
    ),
  },
  {
    accessorKey: "studentName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent text-xs font-medium text-muted-foreground w-full justify-center text-center"
      >
        اسم الطالب
        <ArrowUpDown className="mr-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      return (
        <div className="flex items-center gap-3 justify-center w-full text-center">
          {/* <img
            src={row.original.avatar}
            alt={row.original.studentName}
            className="w-8 h-8 rounded-full object-cover"
          /> */}
          <span className="font-medium text-foreground text-center w-full block">{row.original.studentName}</span>
        </div>
      );
    },
  },

  {
    accessorKey: "testTitle",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent text-xs font-medium text-muted-foreground w-full justify-center text-center"
      >
         اسم الاختبار 
        <ArrowUpDown className="mr-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      // const price = parseFloat(row.getValue("testTitle"));
      // const formatted = new Intl.NumberFormat("ar-SA", {
      //   style: "currency",
      //   currency: "SAR",
      // }).format(price);
      // return <span className="text-foreground">{formatted}</span>;
      return <span className="text-foreground text-center w-full block">{row.original.testTitle}</span>;
    },
  },
  {
    accessorKey: "evaluationResult",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        className="p-0 hover:bg-transparent text-xs font-medium text-muted-foreground w-full justify-center text-center"
      >
        نتيجة التقييم
        <ArrowUpDown className="mr-1 h-3 w-3" />
      </Button>
    ),
    cell: ({ row }) => {
      const result = row.original.evaluationResult.firstMetric + " - " + row.original.evaluationResult.secondMetric + " - " + row.original.evaluationResult.thirdMetric;
      return <span className="text-foreground text-center w-full block">{result}</span>
    },
    
  },
  // {
  //   accessorKey: "type",
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       className="p-0 hover:bg-transparent text-xs font-medium text-muted-foreground"
  //     >
  //       النوع
  //       <ArrowUpDown className="mr-1 h-3 w-3" />
  //     </Button>
  //   ),
  //   cell: ({ row }) => <span className="text-foreground">{row.original.type}</span>,
  // },
  // {
  //   accessorKey: "status",
  //   header: ({ column }) => (
  //     <Button
  //       variant="ghost"
  //       onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
  //       className="p-0 hover:bg-transparent text-xs font-medium text-muted-foreground"
  //     >
  //       الحالة
  //       <ArrowUpDown className="mr-1 h-3 w-3" />
  //     </Button>
  //   ),
  //   cell: ({ row }) => <StatusBadge status={row.original.status} />,
  // },
  {
    id: "actions",
    header: () => <span className="text-xs font-medium text-muted-foreground w-full text-center block">الإجراء</span>,
    cell: ({ row }) => <ActionsCell attemptId={row.original.attemptId} />,
  },
];