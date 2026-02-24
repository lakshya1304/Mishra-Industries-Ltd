

export default function error(
  res = null,
  msg = "Something went wrong",
  code = 400,
  payload = {},
  extra = {},
) {
  let data = {
    message: process.env.MODE === "dev" ? msg : "Something broke",
    statusCode: code,
    payload: payload,
    success: false,
    stack: process.env.MODE === "dev" ? new Error(msg).stack : null,
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
