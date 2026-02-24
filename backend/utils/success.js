
export default function success(
  res = null,
  msg = "Successful",
  code = 200,
  payload = {},
  extra = {},
) {
  let data = {
    message: msg,
    statusCode: code,
    payload: payload,
    success: true,
    extra,
  };

  if (res && typeof res.status === "function" && typeof res.json === "function") {
    return res.status(code).json(data);
  } else {
    // Fallback: log error if res is not available
    console.error("[err] No valid response object provided:", data);
    // Optionally, throw or return the error data
    return data;
  }
}
