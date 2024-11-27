"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { useParams } from "next/navigation"
import { useTabStore } from "@/stores/tab-store"

interface NavItem {
    title: string
    url?: string
    icon?: LucideIcon
    isActive?: boolean
    expanded?: boolean
    items?: NavItem[]
}

const ReportItemWithTooltip = ({ title, icon: Icon }: { title: string; icon?: LucideIcon }) => (
    <TooltipProvider>
        <Tooltip delayDuration={300}>
            <TooltipTrigger asChild>
                <div className="flex items-center gap-2 w-full">
                    {Icon && <Icon className="h-4 w-4 flex-shrink-0" />}
                    <div className="flex items-center gap-1 min-w-0 flex-1">
                        <span className="truncate">{title}</span>
                    </div>
                </div>
            </TooltipTrigger>
            <TooltipContent side="right" className="max-w-[300px] break-words">
                {title}
            </TooltipContent>
        </Tooltip>
    </TooltipProvider>
)

const RecursiveMenuItem = ({
    item,
    level = 0,
    handleTabChange,
    isTopLevelReports = false
}: {
    item: NavItem;
    level?: number;
    handleTabChange: (id: string, title: string, url?: string) => void;
    isTopLevelReports?: boolean;
}) => {
    const params = useParams();
    const tenantId = params?.tenantId;
    const hasSubItems = item.items && item.items.length > 0;
    const isInitiallyOpen = typeof item.expanded !== 'undefined' ? item.expanded : item.isActive;

    if (isTopLevelReports) {
        return (
            <SidebarMenuItem>
                <div className="w-full">
                    <SidebarMenuButton tooltip={item.title}>
                        {item.icon && <item.icon className="h-4 w-4" />}
                        <span>{item.title}</span>
                    </SidebarMenuButton>
                    <SidebarMenuSub className="pl-2"> 
                        {item.items?.map((subItem) => (
                            <SidebarMenuSubItem key={subItem.title}>
                                <RecursiveMenuItem
                                    item={subItem}
                                    level={level + 1}
                                    handleTabChange={handleTabChange}
                                />
                            </SidebarMenuSubItem>
                        ))}
                    </SidebarMenuSub>
                </div>
            </SidebarMenuItem>
        );
    }

    return (
        <Collapsible
            asChild
            defaultOpen={isInitiallyOpen}
            className="group/collapsible w-full"
        >
            <SidebarMenuItem>
                {!hasSubItems ? (
                    <div
                        onClick={() => handleTabChange(item.title, item.title, `/${tenantId}/${item.url}`)}
                        className="w-full"
                    >
                        <SidebarMenuButton 
                            className="w-full group hover:bg-accent hover:text-accent-foreground"
                        >
                            {isTopLevelReports ? (
                                <ReportItemWithTooltip title={item.title} icon={item.icon} />
                            ) : (
                                <>
                                    {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                                    <span className="flex-1 truncate">{item.title}</span>
                                </>
                            )}
                        </SidebarMenuButton>
                    </div>
                ) : (
                    <>
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip={item.title} className="w-full">
                                {item.icon && <item.icon className="h-4 w-4 flex-shrink-0" />}
                                <span className="flex-1 truncate">{item.title}</span>
                                <ChevronRight className="ml-auto h-4 w-4 flex-shrink-0 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>

                        <CollapsibleContent className="w-full">
                            <SidebarMenuSub>
                                {item.items?.map((subItem) => (
                                    <SidebarMenuSubItem key={subItem.title} className="w-full">
                                        {subItem.items ? (
                                            <RecursiveMenuItem
                                                item={subItem}
                                                level={level + 1}
                                                handleTabChange={handleTabChange}
                                            />
                                        ) : (
                                            <SidebarMenuSubButton asChild>
                                                <div
                                                    onClick={() => handleTabChange(subItem.title, subItem.title, `/${tenantId}/${subItem.url}`)}
                                                    className="flex w-full items-center gap-3 group hover:bg-accent hover:text-accent-foreground px-2 py-1.5 rounded-md"
                                                >
                                                    {level > 0 ? (
                                                        <ReportItemWithTooltip title={subItem.title} icon={subItem.icon} />
                                                    ) : (
                                                        <>
                                                            {subItem.icon && <subItem.icon className="h-4 w-4 flex-shrink-0" />}
                                                            <span className="flex-1 truncate">{subItem.title}</span>
                                                        </>
                                                    )}
                                                </div>
                                            </SidebarMenuSubButton>
                                        )}
                                    </SidebarMenuSubItem>
                                ))}
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </>
                )}
            </SidebarMenuItem>
        </Collapsible>
    );
};

export const NavMain = ({ items }: { items: NavItem[] }) => {
    const { addTab, setActiveTab, tabs } = useTabStore()
    
    const handleTabChange = (id: string, title: string, url?: string) => {
        if (tabs.some(tab => tab.id === id)) {
            setActiveTab(id);
        } else {
            addTab({ 
                id, 
                title,
                url,
                lazyComponent: () => import(`@/app/[tenantId]/(main)/${url}/page`)
            });
        }
    }

    return (
        <SidebarGroup>
            <SidebarGroupLabel>Platform</SidebarGroupLabel>
            <SidebarMenu className="w-full">
                {items.map((item) => (
                    <RecursiveMenuItem
                        key={item.title}
                        item={item}
                        handleTabChange={handleTabChange}
                        isTopLevelReports={item.title === "Raporlar"}
                    />
                ))}
            </SidebarMenu>
        </SidebarGroup>
    );
}

NavMain.displayName = 'NavMain';
