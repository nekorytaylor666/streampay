interface IconProps {
  fill?: string;
  classes?: string;
}

const IcnIncoming: React.FC<IconProps> = ({ fill, classes }) => (
  <div className={`w-10 h-10 ${classes} flex justify-center items-center`}>
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M11.0685 3.30242L11.6492 5.11694L8.38306 8.41935C8.02016 8.74597 8.02016 9.29032 8.38306 9.61693C8.70968 9.97984 9.25403 9.97984 9.58064 9.61693L12.8831 6.35081L14.6976 6.93145C14.9516 7.04032 15.2419 6.96774 15.4597 6.75L17.746 4.46371C18.1452 4.06452 18 3.41129 17.4556 3.22984L15.4597 2.54032L14.7702 0.544355C14.5887 0 13.9355 -0.145161 13.5363 0.254032L11.25 2.54032C11.1048 2.68548 10.996 2.86694 10.996 3.08468C10.996 3.15726 11.0323 3.22984 11.0685 3.30242ZM8.31048 6.78629L10.3427 4.79032L10.2339 4.57258C9.83468 4.46371 9.43548 4.35484 9 4.35484C6.42339 4.35484 4.35484 6.45968 4.35484 9C4.35484 11.5766 6.42339 13.6452 9 13.6452C11.5403 13.6452 13.6452 11.5766 13.6452 9C13.6452 8.56452 13.5363 8.16532 13.4274 7.76613L13.2097 7.65726L11.2137 9.68952C10.9234 10.6331 10.0161 11.3226 9 11.3226C7.69355 11.3226 6.67742 10.3065 6.67742 9C6.67742 7.98387 7.36694 7.07661 8.31048 6.78629ZM17.5645 6.31452L16.2581 7.58468C16.0766 7.80242 15.8226 7.94758 15.5685 8.02016C15.6411 8.34677 15.6774 8.67339 15.6774 9C15.6774 12.7016 12.6653 15.6774 9 15.6774C5.29839 15.6774 2.32258 12.7016 2.32258 9C2.32258 5.33468 5.29839 2.32258 9 2.32258C9.32661 2.32258 9.65323 2.35887 9.97984 2.43145C10.0887 2.17742 10.1976 1.92339 10.4153 1.74194L11.6855 0.435484C10.8508 0.181452 9.94355 0.0362903 9 0.0362903V0C4.02823 0 0 4.06452 0 9C0 13.9718 4.02823 18 9 18C13.9355 18 18 13.9718 18 9C18 8.05645 17.8185 7.14919 17.5645 6.31452Z"
        fill={fill}
      />
    </svg>
  </div>
);

export default IcnIncoming;