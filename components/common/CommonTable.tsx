import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";

interface CommonTableProps {
  title: string;
  description: string;
  fields: string[];
  data: any[];
  children: React.ReactNode;
}

const CommonTable: React.FC<CommonTableProps> = ({
  fields,
  data,
  children,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {fields.map((field, index) => (
            <TableHead key={index}>{field}</TableHead>
          ))}
        </TableRow>
      </TableHeader>
      {/* <TableBody>{renderContent()}</TableBody> */}
      <TableBody>{children}</TableBody>
    </Table>
  );
};

export default CommonTable;
