interface IconProps {
  fill?: string;
  classes?: string;
  onClick?: () => void;
}

const IcnArrowDown: React.FC<IconProps> = ({ fill, classes, onClick }) => (
  <svg
    width="14"
    height="8"
    viewBox="0 0 14 8"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={classes}
    onClick={onClick}
  >
    <path
      d="M5.38125 6.77119C5.71875 7.07627 6.28125 7.07627 6.61875 6.77119L11.7188 2.16102C12.0938 1.82203 12.0938 1.31356 11.7188 1.00847L10.8938 0.228814C10.5188 -0.0762712 9.95625 -0.0762712 9.61875 0.228814L5.98125 3.51695L2.38125 0.228814C2.04375 -0.0762712 1.48125 -0.0762712 1.10625 0.228814L0.28125 1.00847C-0.09375 1.31356 -0.09375 1.82203 0.28125 2.16102L5.38125 6.77119Z"
      fill={fill}
    />
  </svg>
);

export default IcnArrowDown;
