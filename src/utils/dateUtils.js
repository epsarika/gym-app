import { isAfter, isBefore } from "date-fns";


// Check if membership is still valid
export const isActive = (endDate) => {
  return isAfter(new Date(endDate), new Date());
};

// Check if membership has expired
export const isExpired = (endDate) => {
  return isBefore(new Date(endDate), new Date());
};