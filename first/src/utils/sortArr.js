import { sortBy } from 'lodash'

const sortArr = (arr, sortByValue) => {
    if (!arr?.length) return arr
    switch (sortByValue) {
        case 'name ASC': return sortBy(arr, arr[0].fullName ? 'fullName' : 'name')
        case 'name DESC': return sortBy(arr, arr[0].fullName ? 'fullName' : 'name').reverse()
        case 'created DESC': return sortBy(arr, 'id').reverse()
        default: return arr
    }
}

export default sortArr