import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { getUserById } from "@/services/user.service";
import { getUserAddresses } from "@/services/address.service";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const userId = session.user.id;
  const [user, addresses] = await Promise.all([
    getUserById(userId),
    getUserAddresses(userId),
  ]);

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-bold text-slate-900">Profile &amp; Settings</h1>
      <ProfileClient user={user} addresses={addresses} />
    </div>
  );
}
