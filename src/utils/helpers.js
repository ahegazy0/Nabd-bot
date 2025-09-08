export const pickRandom = (arr) => {
    if (!arr || arr.length === 0) return null;
    const index = Math.floor(Math.random() * arr.length);
    return arr[index];
};

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

