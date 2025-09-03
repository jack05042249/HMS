const TableHeaderItem = ({ children, width, className = '' }) => {
  const baseClasses = 'px-6 py-3 font-medium whitespace-nowrap';
  const combinedClasses = `${baseClasses} ${className}`.trim();
  
  return (
    <th 
      scope='col' 
      className={combinedClasses}
      style={width ? { width, minWidth: width } : {}}
    >
      {children}
    </th>
  );
};

export { TableHeaderItem };