/**
 * One-time script to create an admin user in Supabase.
 * Run with: node create-admin.mjs
 * Delete this file after use.
 */

const SUPABASE_URL = "https://kgoavivchdouhhqfwwje.supabase.co";
const SERVICE_ROLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imtnb2F2aXZjaGRvdWhocWZ3d2plIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3NDAwODk0NywiZXhwIjoyMDg5NTg0OTQ3fQ.HDWPQr8K_Wk1zRs8rcmEYep5c9EJREm0b3_cnsOpjhQ";

const ADMIN_EMAIL = "thaddevstudios@gmail.com";
const ADMIN_PASSWORD = "Admin@2026!";
const ADMIN_NAME = "Admin";

async function main() {
  console.log(`\nCreating admin user: ${ADMIN_EMAIL}\n`);

  // Step 1: Create the user via Supabase Auth Admin API
  const createRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
    },
    body: JSON.stringify({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      user_metadata: { full_name: ADMIN_NAME, role: "admin" },
      email_confirm: true,
    }),
  });

  const createData = await createRes.json();

  if (!createRes.ok) {
    // If user already exists, try to find them
    if (createData?.msg?.toLowerCase().includes("already") || createData?.message?.toLowerCase().includes("already")) {
      console.log("User already exists. Fetching existing user...");
      
      // List users to find this one
      const listRes = await fetch(`${SUPABASE_URL}/auth/v1/admin/users?page=1&per_page=50`, {
        headers: {
          Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
          apikey: SERVICE_ROLE_KEY,
        },
      });
      const listData = await listRes.json();
      const existing = listData.users?.find(u => u.email === ADMIN_EMAIL);
      
      if (existing) {
        // Update their password and ensure admin role
        await fetch(`${SUPABASE_URL}/auth/v1/admin/users/${existing.id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY,
          },
          body: JSON.stringify({
            password: ADMIN_PASSWORD,
            user_metadata: { full_name: ADMIN_NAME, role: "admin" },
            email_confirm: true,
          }),
        });

        // Update profile to admin
        await fetch(`${SUPABASE_URL}/rest/v1/profiles?id=eq.${existing.id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
            apikey: SERVICE_ROLE_KEY,
            Prefer: "return=minimal",
          },
          body: JSON.stringify({ role: "admin", full_name: ADMIN_NAME }),
        });

        console.log("✅ Existing user updated to admin role.");
        console.log(`\n── Admin Credentials ──`);
        console.log(`   Email:    ${ADMIN_EMAIL}`);
        console.log(`   Password: ${ADMIN_PASSWORD}`);
        console.log(`   Login at: /admin/login\n`);
        return;
      }
    }

    console.error("❌ Failed to create user:", JSON.stringify(createData, null, 2));
    process.exit(1);
  }

  const userId = createData.id;
  console.log(`✅ User created with ID: ${userId}`);

  // Step 2: Upsert profile with admin role
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/profiles`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
      apikey: SERVICE_ROLE_KEY,
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify({
      id: userId,
      full_name: ADMIN_NAME,
      role: "admin",
    }),
  });

  if (!profileRes.ok) {
    const profileErr = await profileRes.text();
    console.error("⚠️  Profile upsert issue (user still created):", profileErr);
  } else {
    console.log("✅ Profile set to admin role.");
  }

  console.log(`\n══════════════════════════════════`);
  console.log(`  ✅ Admin Account Created!`);
  console.log(`══════════════════════════════════`);
  console.log(`   Email:    ${ADMIN_EMAIL}`);
  console.log(`   Password: ${ADMIN_PASSWORD}`);
  console.log(`   Login at: /admin/login`);
  console.log(`══════════════════════════════════\n`);
}

main().catch(err => {
  console.error("Fatal error:", err);
  process.exit(1);
});
