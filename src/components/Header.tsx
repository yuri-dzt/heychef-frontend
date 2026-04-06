import React, { Fragment } from 'react';
import { ChevronRightIcon } from 'lucide-react';
interface HeaderProps {
  title: string;
  breadcrumbs?: {
    label: string;
    href?: string;
  }[];
  actions?: React.ReactNode;
}
export function Header({ title, breadcrumbs, actions }: HeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
      <div>
        {breadcrumbs && breadcrumbs.length > 0 &&
        <nav className="flex items-center text-sm text-text-muted mb-1">
            {breadcrumbs.map((crumb, index) =>
          <Fragment key={index}>
                {index > 0 && <ChevronRightIcon className="w-4 h-4 mx-1" />}
                {crumb.href ?
            <a
              href={crumb.href}
              className="hover:text-primary transition-colors">
              
                    {crumb.label}
                  </a> :

            <span className="text-text-secondary">{crumb.label}</span>
            }
              </Fragment>
          )}
          </nav>
        }
        <h1 className="text-2xl md:text-3xl font-bold text-text-primary tracking-tight">
          {title}
        </h1>
      </div>
      {actions && <div className="flex items-center gap-3">{actions}</div>}
    </div>);

}