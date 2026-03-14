export interface SidebarRailItem {
  id: string;
  to: string;
  label: string;
  labelKey?: string;
  iconPath: string;
  order: number;
}

export interface SidebarPanelItem {
  id: string;
  label: string;
  labelKey?: string;
  to: string;
  iconPath?: string;
}

export interface SidebarPanelGroup {
  id: string;
  railItemId: string;
  title?: string;
  titleKey?: string;
  order: number;
  items: SidebarPanelItem[];
}

export interface SidebarNavigationResponse {
  rail: SidebarRailItem[];
  panelGroups: SidebarPanelGroup[];
  meta: {
    loadedAt: string | null;
  };
}

export function useSidebarNavigation() {
  return useFetch<SidebarNavigationResponse>("/api/apps/navigation", {
    key: "sidebar-navigation"
  });
}
