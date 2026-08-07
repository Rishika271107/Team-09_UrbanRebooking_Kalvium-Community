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
    <div className="flex flex-col gap-6 lg:gap-8 pb-10">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Profile Management</h1>
        <p className="text-slate-500">Manage your account settings and saved addresses.</p>
      </div>
      <ProfileClient user={user} addresses={addresses} />
    </div>
  );
}