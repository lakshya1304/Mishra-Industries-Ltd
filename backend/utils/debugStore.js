const store = new Map();

export function setOTP(email, otp) {
  try {
    store.set(email, { otp, ts: Date.now() });
  } catch (e) {
    // noop
  }
}

export function getOTP(email) {
  const v = store.get(email);
  if (!v) return null;
  // expire after 5 minutes
  if (Date.now() - v.ts > 5 * 60 * 1000) {
    store.delete(email);
    return null;
  }
  return v.otp;
}

export default {
  setOTP,
  getOTP,
};
