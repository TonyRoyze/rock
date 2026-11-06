import { ClipboardList, Trophy, Users } from "lucide-react"

import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const items = [
  { title: "Students", url: "#students", icon: Users },
  { title: "Event registration", url: "#event-registration", icon: ClipboardList },
  { title: "Tournaments", url: "#tournaments", icon: Trophy },
]

export function AppSidebar({
  page,
  onNavigate,
}: {
  page: string
  onNavigate: (page: string) => void
}) {
  return (
    <Sidebar variant="inset" collapsible="offcanvas" className="border-0 bg-sidebar">
      <SidebarHeader className="p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="h-auto gap-3 py-2 hover:bg-transparent"
              onClick={() => onNavigate("Students")}
            >
              <img src="/logo.png" alt="ROCK" className="size-9 shrink-0 object-contain" />
              <span className="grid min-w-0 text-left leading-tight">
                <span className="truncate text-sm font-semibold tracking-wide">ROCK</span>
                <span className="truncate text-xs text-muted-foreground">School athletics</span>
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={items} activePage={page} onNavigate={onNavigate} />
      </SidebarContent>
    </Sidebar>
  )
}
