export const getValuesFromElement = (id) => {
    const inputElements = document.querySelectorAll(`#${id} input,select`)
    const data = {}
    let missed
    for (const input of inputElements) {
        const { id, value } = input
        if (!value && id !== 'mobile') {
            missed = id
            continue
        }
        data[id] = value
    }
    return { data, missed }
}