import { Link } from "../components";
import { roundAmount } from "../utils/helpers";

interface FinanceFeeProps {
  depositedAmount: number;
  tokenSymbol: string;
}

const FinanceFee: React.FC<FinanceFeeProps> = ({ depositedAmount, tokenSymbol }) => (
  <div className="pb-4">
    <label className="text-white text-base font-bold block mt-6">Streamflow Finance Fee</label>
    <p className="text-gray-light text-xs leading-4 mt-3">
      Streamflow charges 0.25% service fee (
      <span className="font-bold">{` ${roundAmount(
        depositedAmount * 0.0025
      )} ${tokenSymbol} `}</span>
      ) on top of the specified amount, while respecting the given schedule.{" "}
    </p>
    <Link
      title="Learn more."
      url="https://docs.streamflow.finance/help/fees"
      classes="inline-block text-p3 text-blue"
    />
    <p className="text-white text-xs block mt-6">
      Need a custom deal?{" "}
      <Link
        title="Contact us"
        url="https://discord.gg/9yyr8UBZjr"
        classes="inline-block text-p3 text-blue"
      />
    </p>
  </div>
);

export default FinanceFee;
