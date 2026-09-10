
import React, { useEffect, useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { format } from "date-fns";

const DateTime = ({ setDate }) => {
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    if (selectedDate) {
      const formattedDate = format(
        selectedDate,
        "yyyy-MM-dd'T'HH:mm:ssXXX"
      );

      setDate(formattedDate.slice(0, 19) + "Z");
    }
  }, [selectedDate, setDate]);

  return (
    <DatePicker
      selected={selectedDate}
      onChange={(date) => setSelectedDate(date)}
      showTimeSelect
      timeIntervals={15}
      timeFormat="HH:mm"
      dateFormat="MMMM d, yyyy h:mm aa"
      placeholderText="Select any date and time"
    />
  );
};

export default DateTime;

