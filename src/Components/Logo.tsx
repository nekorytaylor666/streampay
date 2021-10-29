export default function Logo(props: { src: string }) {
  return (
    <div className='mb-8 text-white'>
      <h1 className='text-2xl text-center'>
        <img src={props.src} alt='StreamFlow Finance logo' className='w-10 mr-1 inline-block' />
        Stream<strong>Fl◎w</strong>
      </h1>
    </div>
  );
}
