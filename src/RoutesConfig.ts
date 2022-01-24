import { VestingPage, StreamsPage, MultipayPage, MultisigPage } from "./pages";

export interface Route {
  path: string;
  Component: React.FC;
  redirect?: string;
  label?: string;
  exact?: boolean;
  disabled?: boolean;
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
    disabled: true,
  },
  {
    path: "/multisig",
    Component: MultisigPage,
    label: "Multisig",
    exact: true,
    disabled: true,
  },
  {
    path: "/multipay",
    Component: MultipayPage,
    label: "Multipay",
    exact: true,
    disabled: true,
  },
];

export default routes;
