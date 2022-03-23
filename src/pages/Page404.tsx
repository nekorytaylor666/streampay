import { Link } from "react-router-dom";

import { Button } from "../components";

const Page404: React.FC = () => (
  <div className="text-white flex justify-center items-center flex-col flex-grow pt-10 pb-20 md:pb-56">
    <h1 className="text-5xl md:text-6xl mb-1">404</h1>
    <p className="text-base">This page does not exists.</p>
    <Link to="/new-vesting">
      <Button
        background="blue"
        classes="mt-4 md:mt-6 px-6 py-3 text-xl md:px-12 md:py-4 md:text-2xl"
      >
        Go Home
      </Button>
    </Link>
  </div>
);

export default Page404;
