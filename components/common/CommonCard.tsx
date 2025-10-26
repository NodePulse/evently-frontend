import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface CommonCardProps {
  title: string;
  description?: string;
  content: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

const CommonCard: React.FC<CommonCardProps> = ({
  title,
  description,
  content,
  className = "",
  contentClassName = "",
}) => {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className={`space-y-4 ${contentClassName}`}>{content}</CardContent>
    </Card>
  );
};

export default CommonCard;
