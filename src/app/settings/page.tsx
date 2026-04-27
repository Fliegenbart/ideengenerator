import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { ProfileForm } from "@/components/settings/profile-form";
import { getFounderProfile } from "@/lib/demo-store";

export default async function SettingsPage() {
  const profile = await getFounderProfile();

  return (
    <>
      <header>
        <h1 className="font-heading text-3xl font-semibold">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Founder fit changes how ideas are ranked and explained.
        </p>
      </header>
      <Alert>
        <AlertTitle>Auth abstraction</AlertTitle>
        <AlertDescription>
          This MVP uses a demo user locally. The auth boundary is ready to swap to
          Auth.js or Clerk-compatible session lookup.
        </AlertDescription>
      </Alert>
      <ProfileForm profile={profile} />
    </>
  );
}
