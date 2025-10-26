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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { CircleDollarSign, AlertCircle } from "lucide-react";

// Mock API function - in a real app, this would be in @/constants/api
const getTransactionsFn = async (): Promise<Transaction[]> => {
  // Mock data
  const mockTransactions: Transaction[] = [
    {
      id: "txn_1",
      event: { title: "React Conference 2024" },
      amount: 499,
      currency: "INR",
      status: "COMPLETED",
      createdAt: new Date().toISOString(),
      type: "REGISTRATION",
    },
    {
      id: "txn_2",
      event: { title: "Vue.js Workshop" },
      amount: 0,
      currency: "INR",
      status: "COMPLETED",
      createdAt: "2023-10-20T10:00:00Z",
      type: "REGISTRATION",
    },
    {
      id: "txn_3",
      event: { title: "Design Systems Meetup" },
      amount: 150,
      currency: "INR",
      status: "FAILED",
      createdAt: "2023-10-18T14:30:00Z",
      type: "REGISTRATION",
    },
  ];
  // Simulate network delay
  return new Promise((resolve) => setTimeout(() => resolve(mockTransactions), 1000));
};

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
    queryFn: getTransactionsFn,
  });

  const formatPrice = (price: number, currency: string) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency }).format(
      price
    );

  const getStatusBadge = (status: Transaction["status"]) => {
    switch (status) {
      case "COMPLETED":
        return <Badge variant="default">Completed</Badge>;
      case "PENDING":
        return <Badge variant="secondary">Pending</Badge>;
      case "FAILED":
        return <Badge variant="destructive">Failed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => (
        <TableRow key={i}>
          <TableCell><Skeleton className="h-5 w-32" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
          <TableCell><Skeleton className="h-5 w-24" /></TableCell>
          <TableCell><Skeleton className="h-5 w-20" /></TableCell>
        </TableRow>
      ));
    }

    if (isError) {
      return <TableRow><TableCell colSpan={5} className="text-center text-destructive">Failed to load transactions.</TableCell></TableRow>;
    }

    if (!transactions || transactions.length === 0) {
      return <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No transactions found.</TableCell></TableRow>;
    }

    return transactions.map((tx) => (
      <TableRow key={tx.id}>
        <TableCell className="font-medium">{tx.event.title}</TableCell>
        <TableCell>{format(new Date(tx.createdAt), "MMM dd, yyyy")}</TableCell>
        <TableCell>{formatPrice(tx.amount, tx.currency)}</TableCell>
        <TableCell>{getStatusBadge(tx.status)}</TableCell>
        <TableCell className="text-right">{tx.type}</TableCell>
      </TableRow>
    ));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight">Transaction History</h1>
        <p className="text-lg text-muted-foreground mt-2">
          A record of all your payments and registrations.
        </p>
      </header>
      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Event</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Amount</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {renderContent()}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
};

export default TransactionHistoryPage;