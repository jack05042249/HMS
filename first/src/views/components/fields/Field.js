const Field = ({ name, htmlFor, children }) => {
  return (
    <div className='flex flex-col gap-2'>
      <label htmlFor={htmlFor} className='text-black text-[14px] font-medium text-left'>
        {name}
      </label>
      <div className='relative'>{children}</div>
    </div>
  );
};

export { Field };
