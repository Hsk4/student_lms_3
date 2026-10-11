import { auth } from "@clerk/nextjs/server";

export default async function AdminPage() {
  const { userId } = await auth();

  return (
    <div style={{ padding: "20px" }}>
      <h1>Admin Control Panel</h1>
      <p>This route is hidden and accessible strictly via direct URL by system administrators.</p>
      <p>Logged in Admin User ID: {userId}</p>
    </div>
  );
}