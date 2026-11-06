import type { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

export function NavMain({
  items,
  activePage,
  onNavigate,
}: {
  items: { title: string; url: string; icon: LucideIcon }[]
  activePage: string
  onNavigate: (page: string) => void
}) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-[.16em] text-muted-foreground">
        Manage
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                isActive={activePage === item.title}
                tooltip={item.title}
                className="h-10 data-[active=true]:bg-primary/15 data-[active=true]:font-medium data-[active=true]:text-primary"
                onClick={() => onNavigate(item.title)}
              >
                <item.icon />
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
