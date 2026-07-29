import type { HTMLAttributes, ReactNode } from 'react';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
  hoverable?: boolean;
}

function Card({ className = '', children, hoverable = false, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={`
        bg-white rounded-2xl border border-slate-200/80
        shadow-[0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.02)]
        ${hoverable ? 'transition-all duration-200 ease-out hover:shadow-[0_8px_28px_-10px_rgba(15,23,42,0.14),0_1px_2px_rgba(15,23,42,0.04),0_0_0_1px_rgba(15,23,42,0.04)] hover:-translate-y-0.5 hover:border-slate-300/80' : ''}
        p-5 sm:p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

function CardHeader({ className = '', children, ...props }: CardHeaderProps) {
  return (
    <div
      {...props}
      className={`flex justify-between items-center border-b border-slate-100 pb-4 mb-4 -mt-1 ${className}`}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  className?: string;
  children?: ReactNode;
}

function CardTitle({ className = '', children, ...props }: CardTitleProps) {
  return (
    <h3
      {...props}
      className={`font-semibold text-slate-900 text-[15px] tracking-tight ${className}`}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  className?: string;
  children?: ReactNode;
}

function CardDescription({ className = '', children, ...props }: CardDescriptionProps) {
  return (
    <p {...props} className={`text-slate-500 text-sm leading-relaxed ${className}`}>
      {children}
    </p>
  );
}

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

function CardContent({ className = '', children, ...props }: CardContentProps) {
  return <div {...props} className={className}>{children}</div>;
}

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

function CardFooter({ className = '', children, ...props }: CardFooterProps) {
  return (
    <div
      {...props}
      className={`pt-4 mt-4 border-t border-slate-100 flex items-center gap-2 justify-end ${className}`}
    >
      {children}
    </div>
  );
}

interface CardActionsProps extends HTMLAttributes<HTMLDivElement> {
  className?: string;
  children?: ReactNode;
}

function CardActions({ className = '', children, ...props }: CardActionsProps) {
  return <div {...props} className={`flex gap-2 ${className}`}>{children}</div>;
}

export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardActions };
export default Card;
