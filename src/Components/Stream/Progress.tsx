export default function Progress(props: {
  title: string;
  value: number;
  max: number;
  rtl?: boolean;
}) {
  let { title, value, max, rtl } = props;
  return (
    <>
      <dt>{title}</dt>
      <div className="rounded-sm h-3 bg-gray-900 w-full my-auto">
        <div
          className={
            "max-w-full bg-gradient-to-r from-primary to-secondary rounded-sm h-full " +
            (rtl ? "float-right" : "")
          }
          style={{ width: (value / max) * 100 + "%" }}
        ></div>
      </div>
      <label className="ml-2 text-right truncate">
        ◎{Number(value).toFixed(2)}
        <small className="text-gray-400">/{Number(max).toFixed(2)}</small>
      </label>
    </>
  );
}
