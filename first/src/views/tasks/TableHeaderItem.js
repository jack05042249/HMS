const TableHeaderItem = ({ children }) => {
  return (
    <th scope='col' className='px-6 py-3 font-medium whitespace-nowrap'>
      {children}
    </th>
  );
};

export { TableHeaderItem };
