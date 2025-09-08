import axios from "axios";

const fetchHijriData = async () => {
    try {
        const response = await axios.get("http://api.aladhan.com/v1/gToH");

        return response.data.data;

    } catch (error) {
        console.error("Error fetching Hijri date:", error.message);

        return null;
    }
};

const isAyyamAlBid = async () => {

    const hijriData = await fetchHijriData();

    if (!hijriData) return false;

    const day = parseInt(hijriData.hijri.day);

    return [13, 14, 15].includes(day);
};

const getHijriDate = async () => {
    const hijriData = await fetchHijriData();
    
    if (!hijriData) return null;

    return {
        hijriDay: parseInt(hijriData.hijri.day),
        hijriMonth: parseInt(hijriData.hijri.month.number),
        hijriYear: parseInt(hijriData.hijri.year),
        hijriMonthName: hijriData.hijri.month.en,
        gregorianDay: parseInt(hijriData.gregorian.day),
        gregorianDayName: hijriData.gregorian.weekday.en,
        gregorianMonth: parseInt(hijriData.gregorian.month.number),
        gregorianMonthName: hijriData.gregorian.month.en,
        gregorianYear: parseInt(hijriData.gregorian.year),
    };
};

export {isAyyamAlBid, getHijriDate};
