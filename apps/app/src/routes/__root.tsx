import type { FC } from "react";

import { TanStackDevtools } from "@tanstack/react-devtools";
import { FormDevtoolsPanel } from "@tanstack/react-form-devtools";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtoolsPanel } from "@tanstack/react-query-devtools";
import { createRootRoute, Outlet, redirect } from "@tanstack/react-router";
import { TanStackRouterDevtoolsPanel } from "@tanstack/react-router-devtools";

import { ErrorComponent } from "@/components/ui/Error";
import { Toaster } from "@/components/ui/Toaster";
import { queryClient } from "@/lib/query-client";
import { getLocale, shouldRedirect } from "@/paraglide/runtime";

export const RootLayout: FC = () => {
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <Outlet />
        <Toaster />
        <TanStackDevtools
          plugins={[
            {
              name: "TanStack Router",
              render: <TanStackRouterDevtoolsPanel />,
            },
            {
              name: "TanStack Query",
              render: <ReactQueryDevtoolsPanel />,
            },
            {
              name: "TanStack Form",
              render: <FormDevtoolsPanel />,
            },
          ]}
        />
      </QueryClientProvider>
    </>
  );
};

export const Route = createRootRoute({
  beforeLoad: async ({ location }) => {
    document.documentElement.setAttribute("lang", getLocale());

    const decision = await shouldRedirect({ url: location.href });

    if (decision.redirectUrl) {
      throw redirect({ href: decision.redirectUrl.href });
    }
  },
  component: RootLayout,
  errorComponent: ErrorComponent,
});
