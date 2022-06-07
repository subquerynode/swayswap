import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { useQueryErrorResetBoundary } from "react-query";
import { Outlet, useLocation, useResolvedPath } from "react-router-dom";

import { useWallet } from "../hooks";

import { Header } from "./Header";

import { FaucetWidget } from "~/systems/Faucet";
import { Skeleton } from "~/systems/UI";
import { Pages } from "~/types";

export function MainLayout() {
  const { reset: resetReactQuery } = useQueryErrorResetBoundary();
  const location = useLocation();
  const path = useResolvedPath(location);
  const wallet = useWallet();
  const isWelcome = path.pathname.includes(Pages.welcome);

  if (isWelcome) {
    return <Outlet />;
  }

  return (
    <main className="mainLayout">
      <Header />
      <div className="mainLayout--wrapper">
        <ErrorBoundary
          onReset={resetReactQuery}
          fallbackRender={({ error, resetErrorBoundary }) => (
            <div
              className="mainLayout--errorContent"
              style={{ textAlign: "center" }}
            >
              Error
              <br />
              {error.message}
              <br />
              <br />
              <button
                className="mainLayout--confirmBtn"
                onClick={resetErrorBoundary}
              >
                Reset
              </button>
            </div>
          )}
        >
          <Suspense fallback={<Skeleton />}>
            <Outlet />
          </Suspense>
        </ErrorBoundary>
      </div>
      {wallet && <FaucetWidget />}
    </main>
  );
}