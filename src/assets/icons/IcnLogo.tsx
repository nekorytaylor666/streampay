interface IconProps {
  fill?: string;
  classes?: string;
}

const IcnLogo: React.FC<IconProps> = ({ fill, classes }) => (
  <div className={`${classes} flex justify-center items-center`}>
    <svg width="30" height="30" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.4983 0C2.0132 0 0 2.0132 0 4.4983H18V0H4.4983Z" fill={fill} />
      <path
        d="M13.4983 6.74904H0C0 9.23414 2.0132 11.2473 4.4983 11.2473H17.9966C18 8.76564 15.9834 6.74904 13.4983 6.74904Z"
        fill={fill}
      />
      <path d="M8.9966 18H4.4983C2.0132 18 0 15.9834 0 13.5016H8.9966V18Z" fill={fill} />
    </svg>
  </div>
);

export default IcnLogo;
