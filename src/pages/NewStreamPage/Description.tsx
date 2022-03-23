interface DescriptionProps {
  classes?: string;
}

const Description: React.FC<DescriptionProps> = ({ classes }) => (
  <div className={classes}>
    <h3 className="text-white font-bold mb-4">New Stream</h3>
    <p className={`mb-1 text-xs text-gray-light font-weight-400 leading-5`}>
      Set up the amount you want to deposit, release amount, release frequency, start date and
      you’re good to go. Additionally, choose Transfer and Cancel preferences.
    </p>
  </div>
);

export default Description;
