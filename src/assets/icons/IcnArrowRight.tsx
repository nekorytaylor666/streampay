interface IconProps {
  fill?: string;
  classes?: string;
  onClick?: () => void;
}

const IcnDashboard: React.FC<IconProps> = ({ fill, classes, onClick }) => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classes}
    onClick={onClick}
  >
    <path
      d="M7.79584 7.52921C8.06805 7.24055 8.06805 6.75945 7.79584 6.47079L1.92817 0.216495C1.62571 -0.072165 1.17202 -0.072165 0.899811 0.216495L0.204159 0.954181C-0.0680529 1.24284 -0.0680529 1.72394 0.204159 2.04467L4.862 6.98396L0.204159 11.9553C-0.0680529 12.2761 -0.0680529 12.7572 0.204159 13.0458L0.899811 13.7835C1.17202 14.0722 1.62571 14.0722 1.92817 13.7835L7.79584 7.52921Z"
      fill={fill}
    />
  </svg>
);

export default IcnDashboard;
