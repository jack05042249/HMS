export const QueryParams = {
   generateQueryParams: (obj) => {
    const queryParams = new URLSearchParams();

    for (const key in obj) {
      const value = obj[key];
      if (Array.isArray(value)) {
        value.forEach(item => queryParams.append(key, item));
      } else {
        queryParams.set(key, value);
      }
    }

    return queryParams.toString();
  }
}