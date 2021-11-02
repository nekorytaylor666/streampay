import { useEffect } from "react";

import { useFormContext } from "../contexts/FormContext";
import Main from "./Main";

const StreamsPage = () => {
  const { setAdvanced } = useFormContext();

  useEffect(() => setAdvanced(false), [setAdvanced]);

  return <Main />;
};

export default StreamsPage;
