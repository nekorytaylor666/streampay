import {
  HomePage,
  VestingPage,
  AllStreamsPage,
  IncomingStreamsPage,
  OutgoingStreamsPage,
  MultisigPage,
  // DashboardPage,
  NewStreamPage,
} from "../pages";
import {
  // IcnDashboard,
  IcnAllStreams,
  IcnIncoming,
  IcnOutgoing,
  IcnMultisig,
  IcnStream,
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
    path: "/vesting",
    redirect: "/new-vesting",
    Component: VestingPage,
    isPrivate: true,
    exact: true,
  },
  {
    path: "/streams",
    redirect: "/all-streams",
    Component: AllStreamsPage,
    isPrivate: true,
    exact: true,
  },
  {
    path: "/new-vesting",
    Component: VestingPage,
    label: "New Vesting",
    isPrivate: true,
    Icon: IcnStream,
    exact: true,
  },
  {
    path: "/new-stream",
    Component: NewStreamPage,
    label: "New Stream",
    isPrivate: true,
    Icon: IcnStream,
    exact: true,
  },

  // {
  //   path: "/dashboard",
  //   Component: DashboardPage,
  //   label: "Dashboard",
  //   isPrivate: true,
  //   exact: true,
  //   Icon: IcnDashboard,
  // },
  {
    path: "/all-streams",
    Component: AllStreamsPage,
    label: "All Streams",
    isPrivate: true,
    exact: true,
    Icon: IcnAllStreams,
  },
  {
    path: "/incoming",
    Component: IncomingStreamsPage,
    label: "Incoming",
    isPrivate: true,
    exact: true,
    Icon: IcnIncoming,
  },
  {
    path: "/outgoing",
    Component: OutgoingStreamsPage,
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
