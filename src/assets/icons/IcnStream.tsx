interface IconProps {
  fill?: string;
  classes?: string;
}

const IcnAllStreams: React.FC<IconProps> = ({ fill, classes }) => (
  <div className={`w-10 h-10 ${classes} flex justify-center items-center`}>
    <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M0.5 2H13.5C13.75 2 14 1.78125 14 1.5V0.5C14 0.25 13.75 0 13.5 0L0.5 0C0.21875 0 0 0.25 0 0.5L0 1.5C0 1.78125 0.21875 2 0.5 2ZM15.5 5H2.5C2.21875 5 2 5.25 2 5.5V6.5C2 6.78125 2.21875 7 2.5 7H15.5C15.75 7 16 6.78125 16 6.5V5.5C16 5.25 15.75 5 15.5 5ZM13.5 10H0.5C0.21875 10 0 10.25 0 10.5L0 11.5C0 11.7812 0.21875 12 0.5 12H13.5C13.75 12 14 11.7812 14 11.5V10.5C14 10.25 13.75 10 13.5 10Z"
        fill={fill}
      />
    </svg>
  </div>
);

export default IcnAllStreams;
