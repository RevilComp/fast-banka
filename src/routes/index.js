import { Suspense, lazy } from "react";
import { createBrowserRouter } from "react-router-dom";
import RootLayout from "../components/RootLayout";
import LoginPage from "../pages/Login";
import Loading from "../components/ui/loading/Loading";
import ErrorPage from "../pages/Error";

// * Pages importing
const HomePage = lazy(() => import("../pages/Home"));
const DocsPageBanka = lazy(() => import("../pages/Docs.banka.js"));
const DocsPagePapara = lazy(() => import("../pages/Docs.papara.js"));


const SuccessDepositPage = lazy(() =>
  import("../pages/operationPages/SuccessDeposit")
);

const SuccessWithdrawPage = lazy(() =>
  import("../pages/operationPages/SuccessWithdraw")
);

const RejectionWithdrawPage = lazy(() =>
  import("../pages/operationPages/RejectionWithdraw")
);

const RejectionDepositPage = lazy(() =>
  import("../pages/operationPages/RejectionDeposit")
);

const WaitingWithdrawPage = lazy(() =>
  import("../pages/operationPages/WaitingWithdraw")
);

const WaitingDepositPage = lazy(() =>
  import("../pages/operationPages/WaitingDeposit")
);

const WebsitesPage = lazy(() =>
  import("../pages/finacialTransaction/Websites")
);

const PoolSettingsPage = lazy(() =>
  import("../pages/finacialTransaction/PoolsSettings.js")
);


const TransactionListsPage = lazy(() =>
  import("../pages/finacialTransaction/TransactionLists")
);

const ConsensusPage = lazy(() =>
  import("../pages/finacialTransaction/Consensus")
);

const UsersPage = lazy(() => import("../pages/userSettings/Users"));
const UserCreatePage = lazy(() => import("../pages/userSettings/UserCreate"));
const PlayersPage = lazy(() => import("../pages/definitions/Players"));

const BankAccountsPagePapara = lazy(() =>
  import("../pages/definitions/BankAccounts.papara.js")
);

const BankAccountsPageBanka = lazy(() =>
  import("../pages/definitions/BankAccounts.banka.js")
);

const EditBankAccountPagePapara = lazy(() =>
  import("../pages/definitions/EditBankAccount.papara.js")
);

const EditBankAccountPageBanka = lazy(() =>
  import("../pages/definitions/EditBankAccount.banka.js")
);

const CashDeliveryPage = lazy(() => import("../pages/CashDelivery"));

export const router = createBrowserRouter([
  {
    path: "/",
    element: <RootLayout />,
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: (
          <Suspense fallback={<Loading />}>
            <HomePage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/Home").then((module) => module.loader({ request })),
      },

      {
        path: "success-deposit",
        element: (
          <Suspense fallback={<Loading />}>
            <SuccessDepositPage />
          </Suspense>
        ),
      },

      {
        path: "rejection-deposit",
        element: (
          <Suspense fallback={<Loading />}>
            <RejectionDepositPage />
          </Suspense>
        ),
      },

      {
        path: "success-withdraw",
        element: (
          <Suspense fallback={<Loading />}>
            <SuccessWithdrawPage />
          </Suspense>
        ),
      },

      {
        path: "rejection-withdraw",
        element: (
          <Suspense fallback={<Loading />}>
            <RejectionWithdrawPage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/operationPages/RejectionWithdraw").then((module) =>
            module.loader({ request })
          ),
      },

      {
        path: "waiting-deposit",
        element: (
          <Suspense fallback={<Loading />}>
            <WaitingDepositPage />
          </Suspense>
        ),
      },

      {
        path: "waiting-withdraw",
        element: (
          <Suspense fallback={<Loading />}>
            <WaitingWithdrawPage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/operationPages/WaitingWithdraw").then((module) =>
            module.loader({ request })
          ),
      },

      {
        path: "logs",
        element: (
          <Suspense fallback={<Loading />}>
            <TransactionListsPage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/finacialTransaction/TransactionLists").then(
            (module) => module.loader({ request })
          ),
      },

      {
        path: "create-user",
        element: (
          <Suspense fallback={<Loading />}>
            <UserCreatePage />
          </Suspense>
        ),
      },

      {
        path: "edit-bank-account",
        element: (
          <Suspense fallback={<Loading />}>
            {process.env.REACT_APP_PAPARA_ENABLED === "true" ? (
              <EditBankAccountPagePapara />
            ) : (
              <EditBankAccountPageBanka />
            )}
          </Suspense>
        ),
      
        loader: ({ request }) =>
          import(`../pages/definitions/EditBankAccount.${process.env.REACT_APP_PAPARA_ENABLED === "true" ? "papara" : "banka"}.js`).then((module) =>
            module.loader({ request })
          ),
      },
      

      {
        path: "consensus",
        element: (
          <Suspense fallback={<Loading />}>
            <ConsensusPage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/finacialTransaction/Consensus").then((module) =>
            module.loader({ request })
          ),
      },

      {
        path: "bank-accounts",
        element: (
          <Suspense fallback={<Loading />}>
            {process.env.REACT_APP_PAPARA_ENABLED === "true" ? (
              <BankAccountsPagePapara />
            ) : (
              <BankAccountsPageBanka />
            )}
          </Suspense>
        ),
      
        loader: ({ request }) =>
          import(`../pages/definitions/BankAccounts.${process.env.REACT_APP_PAPARA_ENABLED === "true" ? "papara" : "banka"}.js`).then((module) =>
            module.loader({ request })
          ),
      },

      {
        path: "users",
        element: (
          <Suspense fallback={<Loading />}>
            <UsersPage />
          </Suspense>
        ),
      },

      {
        path: "players",
        element: (
          <Suspense fallback={<Loading />}>
            <PlayersPage />
          </Suspense>
        ),
      },

      {
        path: "websites",
        element: (
          <Suspense fallback={<Loading />}>
            <WebsitesPage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/finacialTransaction/Websites").then((module) =>
            module.loader({ request })
          ),
      },

      {
        path: "pools",
        element: (
          <Suspense fallback={<Loading />}>
              <PoolSettingsPage/>
          </Suspense>
        ),
      
        loader: ({ request }) =>
          import(`../pages/finacialTransaction/PoolsSettings.js`).then((module) =>
            module.loader({ request })
          ),
      },

      {
        path: "cash-delivery",
        element: (
          <Suspense fallback={<Loading />}>
            <CashDeliveryPage />
          </Suspense>
        ),

        loader: ({ request }) =>
          import("../pages/CashDelivery").then((module) =>
            module.loader({ request })
          ),
      },
    ],
  },
  {
    path: "/login",
    element: <LoginPage />,
    action: ({ request }) =>
      import("../pages/Login").then((module) => module.action({ request })),
  },
  {
    path: "/docs",
    element: process.env.REACT_APP_PAPARA_ENABLED === "true" ? (
      <DocsPagePapara />
    ) : (
      <DocsPageBanka />
    )
  }  
]);
