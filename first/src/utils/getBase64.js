const getBase64 = file => {
    return new Promise(resolve => {
        let baseURL = "";
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            baseURL = reader.result;
            resolve(baseURL);
        };
    });
};

export default getBase64