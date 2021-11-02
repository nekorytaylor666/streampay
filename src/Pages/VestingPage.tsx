import { useEffect } from "react";

import { useFormContext } from "../contexts/FormContext";
import Main from "./Main";

const VestingPage = () => {
  const { setAdvanced } = useFormContext();

  useEffect(() => setAdvanced(true), [setAdvanced]);

  return <Main />;
};

export default VestingPage;
