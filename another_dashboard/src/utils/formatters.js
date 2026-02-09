export const formatCurrency = (amount, currency = "AED") => {
  const formatted = (amount / 1).toFixed(2);
  return `${formatted} ${currency.toUpperCase()}`;
};

export const formatDate = (date) => {
  if (!date) return "-";
  return date;
};

export const formatDateTime = (date) => {
  if (!date) return "-";
  return date;
};

export const truncateText = (text, maxLength = 50) => {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};

export const formatPhoneNumber = (phone) => {
  if (!phone) return "-";
  return phone.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
};

export const getInitials = (name) => {
  if (!name) return "?";
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};
