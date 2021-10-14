export default function Logo(props: { src: string }) {
  return (
    <div className="mb-8 text-white">
      <h1 className="text-2xl text-center">
        <img
          src={props.src}
          alt="StreamFlow Finance logo"
          className="w-7 inline"
        />
        Stream<strong>Flow</strong>
      </h1>
    </div>
  );
}
