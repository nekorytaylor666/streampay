import {
  HomePage,
  VestingPage,
  StreamsPage,
  MultisigPage,
  DashboardPage,
  NewStreamPage,
} from "../pages";
import {
  IcnDashboard,
  IcnAllStreams,
  IcnIncoming,
  IcnOutgoing,
  IcnMultisig,
} from "../assets/icons";

export interface Route {
  path: string;
  Component: React.FC;
  redirect?: string;
  label?: string;
  isPrivate?: boolean;
  exact?: boolean;
  disabled?: boolean;
  Icon?: React.FC<{
    fill?: string;
    classes?: string;
  }>;
}

const routes: Route[] = [
  {
    path: "/",
    Component: HomePage,
    exact: true,
  },
  {
    path: "/new-vesting",
    Component: VestingPage,
    label: "New Vesting",
    isPrivate: true,
    exact: true,
  },
  {
    path: "/new-stream",
    Component: NewStreamPage,
    label: "New Stream",
    isPrivate: true,
    exact: true,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
    label: "Dashboard",
    isPrivate: true,
    exact: true,
    Icon: IcnDashboard,
  },
  {
    path: "/all-streams",
    Component: StreamsPage,
    label: "All Streams",
    isPrivate: true,
    exact: true,
    Icon: IcnAllStreams,
  },
  {
    path: "/incoming",
    Component: DashboardPage,
    label: "Incoming",
    isPrivate: true,
    exact: true,
    Icon: IcnIncoming,
  },
  {
    path: "/outgoing",
    Component: DashboardPage,
    label: "Outgoing",
    isPrivate: true,
    exact: true,
    Icon: IcnOutgoing,
  },
  {
    path: "/multisig-wallet",
    Component: MultisigPage,
    label: "Multisig Wallet",
    isPrivate: true,
    exact: true,
    disabled: true,
    Icon: IcnMultisig,
  },
];

export default routes;
