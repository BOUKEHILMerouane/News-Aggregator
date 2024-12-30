import React, { useState, useEffect } from "react";

const DateSelector = ({ onDateChange, onClear }) => {
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const isValidDate = (date) => /^\d{4}-\d{2}-\d{2}$/.test(date);

    useEffect(() => {
        const savedStartDate = localStorage.getItem("start_date") || "";
        const savedEndDate = localStorage.getItem("end_date") || "";

        setStartDate(isValidDate(savedStartDate) ? savedStartDate : "");
        setEndDate(isValidDate(savedEndDate) ? savedEndDate : "");
    }, []);

    const handleStartDateChange = (e) => {
        const value = e.target.value;
        setStartDate(value);
        localStorage.setItem("start_date", value);
        onDateChange("start", value); // Notify parent
    };

    const handleEndDateChange = (e) => {
        const value = e.target.value;
        setEndDate(value);
        localStorage.setItem("end_date", value);
        onDateChange("end", value); // Notify parent
    };

    const handleClear = () => {
        setStartDate("");
        setEndDate("");
        localStorage.removeItem("start_date");
        localStorage.removeItem("end_date");
        onClear();
    };

    return (
        <div className="relative bg-white dark:bg-gray-800 shadow-md rounded-lg p-4 w-64">
            <h3 className="text-lg font-bold dark:text-white capitalize">
                Date Range
            </h3>
            <div className="flex flex-col space-y-2 mt-2">
                <div className="flex flex-col">
                    <label className="dark:text-gray-300 text-sm">Start Date</label>
                    <input
                        type="date"
                        value={startDate}
                        onChange={handleStartDateChange}
                        className="border dark:border-gray-700 p-2 rounded-md dark:bg-gray-900 dark:text-white focus:outline-none"
                    />
                </div>
                <div className="flex flex-col">
                    <label className="dark:text-gray-300 text-sm">End Date</label>
                    <input
                        type="date"
                        value={endDate}
                        onChange={handleEndDateChange}
                        className="border dark:border-gray-700 p-2 rounded-md dark:bg-gray-900 dark:text-white focus:outline-none"
                    />
                </div>
            </div>
            <button
                onClick={handleClear}
                className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-md w-full font-semibold mt-4"
            >
                Clear
            </button>
        </div>
    );
};

export default DateSelector;
