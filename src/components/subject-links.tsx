import { Link } from "@tanstack/react-router";
import type { ReactNode } from "react";
import type { SubjectId } from "@/lib/subjects";

type Base = {
  subject: SubjectId;
  className?: string;
  children: ReactNode;
};

export function SubjectHomeLink({ subject, className, children }: Base) {
  if (subject === "math") {
    return (
      <Link to="/math" className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/science" className={className}>
      {children}
    </Link>
  );
}

export function StrandLink({
  subject,
  strandId,
  className,
  children,
}: Base & { strandId: string }) {
  if (subject === "math") {
    return (
      <Link to="/math/strand/$strandId" params={{ strandId }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/science/strand/$strandId" params={{ strandId }} className={className}>
      {children}
    </Link>
  );
}

export function PracticeLink({
  subject,
  teks,
  className,
  children,
}: Base & { teks: string }) {
  if (subject === "math") {
    return (
      <Link to="/math/practice/$teks" params={{ teks }} className={className}>
        {children}
      </Link>
    );
  }
  return (
    <Link to="/science/practice/$teks" params={{ teks }} className={className}>
      {children}
    </Link>
  );
}
