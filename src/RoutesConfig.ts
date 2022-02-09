import { VestingPage, StreamsPage, MultipayPage, MultisigPage, HomePage } from "./pages";

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
    Component: HomePage,
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
