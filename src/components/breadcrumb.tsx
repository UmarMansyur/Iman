import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "./ui/breadcrumb";
import React from "react";
export default function BreadcrumbNav({
  list,
}: {
  list: { label: string; href: string }[];
}) {
  return (
    <div className="flex items-center justify-between gap-2">
      <h1 className="text-2xl font-bold">{list[0].label}</h1>
      <Breadcrumb>
        <BreadcrumbList>
          {list.map((item, index) => (
            <React.Fragment key={index}>
              {index > 0 && <BreadcrumbSeparator />}
              <BreadcrumbItem>
                <BreadcrumbLink href={item.href}>
                  {item.label}
                </BreadcrumbLink>
              </BreadcrumbItem>
            </React.Fragment>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
