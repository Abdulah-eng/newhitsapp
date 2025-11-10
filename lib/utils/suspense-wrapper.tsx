import { Suspense, ReactNode } from "react";

export function withSuspense<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  return function SuspenseWrappedComponent(props: P) {
    return (
      <Suspense
        fallback={
          fallback || (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500"></div>
            </div>
          )
        }
      >
        <Component {...props} />
      </Suspense>
    );
  };
}

