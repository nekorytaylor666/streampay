import { HomePage, VestingPage, StreamsPage, MultisigPage, MultipayPage } from "../pages";

export interface Route {
  path: string;
  Component: React.FC;
  redirect?: string;
  label?: string;
  isPrivate?: boolean;
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
    isPrivate: true,
    exact: true,
  },
  {
    path: "/streams",
    Component: StreamsPage,
    label: "Streams",
    isPrivate: true,
    exact: true,
    disabled: false,
  },
  {
    path: "/multisig",
    Component: MultisigPage,
    label: "Multisig",
    isPrivate: true,
    exact: true,
    disabled: true,
  },
  {
    path: "/multipay",
    Component: MultipayPage,
    label: "Multipay",
    isPrivate: true,
    exact: true,
    disabled: true,
  },
];

export default routes;
