import { VestingPage, StreamsPage, MultipayPage, MultisigPage } from "./pages";

export interface Route {
  path: string;
  Component: React.FC;
  redirect?: string;
  label?: string;
  exact?: boolean;
}

const routes: Route[] = [
  {
    path: "/",
    redirect: "/vesting",
    Component: VestingPage,
    exact: true,
  },
  {
    path: "/vesting",
    Component: VestingPage,
    label: "Vesting",
    exact: true,
  },
  {
    path: "/streams",
    Component: StreamsPage,
    label: "Streams",
    exact: true,
  },
  {
    path: "/multisig",
    Component: MultisigPage,
    label: "Multisig",
    exact: true,
  },
  {
    path: "/multipay",
    Component: MultipayPage,
    label: "Multipay",
    exact: true,
  },
];

export default routes;
