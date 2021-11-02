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
  },
  {
    path: "/streams",
    Component: StreamsPage,
    label: "Streams",
  },
  {
    path: "/multisig",
    Component: MultisigPage,
    label: "Multisig",
  },
  {
    path: "/multipay",
    Component: MultipayPage,
    label: "Multipay",
  },
];

export default routes;
