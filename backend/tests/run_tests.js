// Simple integration test runner for backend API
// Requires Node 18+ (global fetch). Run from backend/: `node tests/run_tests.js`

const BASE = process.env.BASE || "http://localhost:5000";

function rand() {
  return Date.now().toString().slice(-6);
}

async function ok(res, name) {
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`${name} failed: ${res.status} ${txt}`);
  }
  return res.json().catch(() => ({}));
}

async function run() {
  console.log("Running integration tests against:", BASE);

  const email = `itest+${rand()}@example.com`;
  const password = "Test@1234";

  console.log("1) Registering user:", email);
  // Ensure valid 10-15 digit phone number for Joi validation
  const phone = `9${rand()}${rand()}`; // concatenated to produce 12-14 digits
  await ok(
    await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "IT Test User",
        email,
        phone,
        password,
        accountType: "customer",
      }),
    }),
    "register",
  );

  console.log("2) Logging in user");
  const loginRes = await ok(
    await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, accountType: "customer" }),
    }),
    "login",
  );

  console.log("DEBUG login response:", JSON.stringify(loginRes));
  const token =
    loginRes.token ||
    (loginRes.payload && loginRes.payload.token) ||
    loginRes.token;
  if (!token) throw new Error("login failed: no token returned");

  console.log("3) Requesting OTP (forgot-password)");
  const forgot = await ok(
    await fetch(`${BASE}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),
    "forgot-password",
  );

  let debugOTP =
    (forgot && forgot.payload && forgot.payload.debugOTP) ||
    forgot.debugOTP ||
    (forgot.payload && forgot.payload.debugOTP);

  // If debugOTP not returned, try fetching from debug endpoint (dev only)
  if (!debugOTP) {
    for (let i = 0; i < 6 && !debugOTP; i++) {
      try {
        const r = await fetch(
          `${BASE}/__debug/otp?email=${encodeURIComponent(email)}`,
        );
        if (r.ok) {
          const j = await r.json();
          if (j.otp) debugOTP = j.otp;
        }
      } catch (e) {
        // ignore
      }
      if (!debugOTP) await new Promise((r) => setTimeout(r, 500));
    }
    if (!debugOTP) throw new Error("forgot-password failed: no OTP available");
  }

  if (debugOTP) {
    console.log("4) Verifying OTP using debug value", debugOTP);
    await ok(
      await fetch(`${BASE}/api/auth/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, otp: String(debugOTP) }),
      }),
      "verify-otp",
    );

    console.log("5) Resetting password");
    await ok(
      await fetch(`${BASE}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, newPassword: "NewPass@123" }),
      }),
      "reset-password",
    );

    console.log("6) Logging in with new password");
    await ok(
      await fetch(`${BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          password: "NewPass@123",
          accountType: "customer",
        }),
      }),
      "login-after-reset",
    );
  }

  // Admin flow: create admin user and call protected endpoint
  const adminEmail = `itest-admin+${rand()}@example.com`;
  const adminPass = "Admin@1234";
  console.log("7) Registering admin user:", adminEmail);
  await ok(
    await fetch(`${BASE}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fullName: "IT Admin",
        email: adminEmail,
        phone: `9${rand()}${rand()}`,
        password: adminPass,
        accountType: "admin",
      }),
    }),
    "register-admin",
  );

  console.log("8) Login admin");
  const aLogin = await ok(
    await fetch(`${BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: adminEmail,
        password: adminPass,
        accountType: "admin",
      }),
    }),
    "admin-login",
  );
  const adminToken = aLogin.token || (aLogin.payload && aLogin.payload.token);
  if (!adminToken) throw new Error("admin-login failed: no token returned");

  if (adminToken) {
    console.log("9) Accessing admin-protected orders list");
    await ok(
      await fetch(`${BASE}/api/orders/all`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      }),
      "admin-orders",
    );
  } else {
    console.warn(
      "Admin token not returned; skipping admin-protected endpoint test.",
    );
  }

  console.log("Integration tests completed successfully.");
}

run().catch((err) => {
  console.error("Integration tests failed:", err);
  process.exit(1);
});
