"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import PageHeader from "@/components/common/PageHeader";
import CommonTable from "@/components/common/CommonTable";
import { getAllTransactionsFn } from "@/constants/api";


// --- Type Definition ---
interface Transaction {
  id: string;
  event: {
    title: string;
  };
  amount: number;
  currency: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
  createdAt: string;
  type: "REGISTRATION" | "REFUND";
}

const TransactionHistoryPage = () => {
  const {
    data: transactions,
    isLoading,
    isError,
  } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: getAllTransactionsFn,
  });

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
      price
    );

  const getStatusBadge = (status: Transaction["status"]) => {
    const variants = {
      COMPLETED: "default",
      PENDING: "secondary",
      FAILED: "destructive",
    } as const;
    return <Badge variant={variants[status] || "outline"}>{status}</Badge>;
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell>
            <Skeleton className="h-5 w-32" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-destructive">
            Failed to load transactions.
          </TableCell>
        </TableRow>
      );
    }

    if (!transactions || transactions.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={5} className="text-center text-muted-foreground">
            No transactions found.
          </TableCell>
        </TableRow>
      );
    }

    return transactions.map((tx) => (
      <TableRow key={tx.id}>
        <TableCell className="font-medium">
          {tx?.transactionId.length > 10
            ? tx?.transactionId.slice(0, 10) + "..."
            : tx?.transactionId}
        </TableCell>
        <TableCell>{format(new Date(tx.createdAt), "MMM dd, yyyy")}</TableCell>
        <TableCell>{formatPrice(tx.amount, tx.currency)}</TableCell>
        <TableCell>{getStatusBadge(tx.status)}</TableCell>
        <TableCell className="text-right">{tx.type}</TableCell>
      </TableRow>
    ));
  };

  const tableFields = ["Event", "Date", "Amount", "Status", "Type"];

  return (
    <div className="container mx-auto px-4">
      <PageHeader
        title="Transaction History"
        description="A record of all your payments and registrations."
      />
      <Card>
        <CommonTable
          data={transactions}
          fields={tableFields}
          title="Transaction History"
          description="A record of all your payments and registrations."
        >
          {renderContent()}
        </CommonTable>
      </Card>
    </div>
  );
};

export default TransactionHistoryPage;
