const mountingDelay = (someLogic, delay = 50) => {
    return setTimeout(() => someLogic(), delay);
};

export default mountingDelay;
