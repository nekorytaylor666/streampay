interface IconProps {
  fill?: string;
  classes?: string;
}

const IcnMultisig: React.FC<IconProps> = ({ fill, classes }) => (
  <div className={`w-10 h-10 ${classes} flex justify-center items-center`}>
    <svg width="24" height="14" viewBox="0 0 24 14" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M23.3964 4.65501C21.4451 4.80103 18.6682 6.66272 17.2798 7.28329C16.1915 7.75784 15.2159 8.15938 14.4279 8.15938C13.5648 8.15938 13.4522 7.57532 13.6023 6.26118C13.6398 5.96915 14.0526 3.37737 12.0262 3.48689C11.0506 3.55989 9.58708 4.39948 5.64692 8.08637L7.22299 4.32648C8.34875 1.55218 5.19662 -1.22211 2.34469 0.566577L0.280797 1.91722C0.01812 2.06324 -0.0944561 2.42827 0.0931707 2.72031L0.731102 3.70591C0.918728 3.96144 1.29398 4.07095 1.55666 3.88843L3.73313 2.46478C4.44611 2.02673 5.27167 2.72031 4.97147 3.45038L1.29398 12.4303C1.0313 13.0144 1.40656 14 2.41974 14C2.71994 14 3.02015 13.8905 3.2453 13.6715C4.82136 12.1383 9.06173 8.15938 11.1631 6.51671C11.0881 7.57532 11.0881 8.67044 11.9512 9.58303C12.5141 10.2036 13.3396 10.4956 14.3903 10.4956C15.7412 10.4956 16.9421 9.98458 18.2554 9.40051C19.4938 8.88946 21.9704 7.13727 23.4339 7.02776C23.7717 6.99126 23.9968 6.73573 23.9968 6.4437V5.27558C24.0343 4.94704 23.7341 4.65501 23.3964 4.65501Z"
        fill={fill}
      />
    </svg>
  </div>
);

export default IcnMultisig;