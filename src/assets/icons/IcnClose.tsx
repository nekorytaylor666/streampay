interface IconProps {
  fill?: string;
  classes?: string;
}

const IcnMenu: React.FC<IconProps> = ({ fill, classes }) => (
  <div className={`${classes} flex justify-center items-center`}>
    <svg width="16" height="14" viewBox="0 0 16 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.571429 2.57143H15.4286C15.7143 2.57143 16 2.32143 16 2V0.571429C16 0.285714 15.7143 0 15.4286 0H0.571429C0.25 0 0 0.285714 0 0.571429V2C0 2.32143 0.25 2.57143 0.571429 2.57143ZM0.571429 8.28572H15.4286C15.7143 8.28572 16 8.03572 16 7.71429V6.28571C16 6 15.7143 5.71429 15.4286 5.71429H0.571429C0.25 5.71429 0 6 0 6.28571V7.71429C0 8.03572 0.25 8.28572 0.571429 8.28572ZM0.571429 14H15.4286C15.7143 14 16 13.75 16 13.4286V12C16 11.7143 15.7143 11.4286 15.4286 11.4286H0.571429C0.25 11.4286 0 11.7143 0 12V13.4286C0 13.75 0.25 14 0.571429 14Z"
        fill={fill}
      />
    </svg>
  </div>
);

export default IcnMenu;
