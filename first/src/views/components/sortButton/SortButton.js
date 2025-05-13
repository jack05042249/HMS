

const sortArr = [
    { value: 'name DESC', label: '↓' },
    { value: 'name ASC', label: '↑' },
    // { value: 'created ASC', label: '↑' },
    // { value: 'created DESC', label: '↓' },
]

const SortButton = ({ sortBy, setSortBy }) => {

    const onChangeHandler = e => {
        const { value } = e.target
        setSortBy(value)
    }
    return (
        <select className='appearance-none outline-none text-[16px]' onChange={onChangeHandler} value={sortBy}>
            {sortArr.map(item => <option
              key={item.value} value={item.value}>{`${item.label}`}</option>)}
        </select>
    )
}

export default SortButton