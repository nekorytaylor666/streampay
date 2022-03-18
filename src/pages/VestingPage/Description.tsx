interface DescriptionProps {
  classes?: string;
}

const Description: React.FC<DescriptionProps> = ({ classes }) => (
  <div className={classes}>
    <h3 className="text-white font-bold mb-4">New Vesting</h3>
    <p className={`${classes} mb-1 text-xs text-gray-light font-weight-400 leading-5`}>
      Ideal for token vesting! Set up the amount you want to vest, start-end date, release frequency
      and you’re good to go.
    </p>
    <p className="mb-1 text-xs text-gray-light font-weight-400 leading-5">
      Additionally, you can specify the cliff date and amount when the initial tokens will be
      released to the recipient or set up Transfer and Cancel preferences.
    </p>
  </div>
);

export default Description;
