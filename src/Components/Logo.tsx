export default function Logo(props: { src: string }) {
  return (
    <div className="mb-8 text-white">
      <img
        src={props.src}
        alt="StreamFlow Finance logo"
        className="w-20 mx-auto"
      />
      <h1 className="text-2xl text-center">
        Stream<strong>Flow</strong>
      </h1>
    </div>
  );
}
