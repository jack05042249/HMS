const TableCell = ({ className, children, onClick }) => {
  return (
    <th scope='row' className={`px-6 py-4 font-medium ${className}`} onClick={onClick}>
      {children}
    </th>
  );
};

export { TableCell };
