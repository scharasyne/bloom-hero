import { getCustomerProfilePage } from "@/features/customers/queries/getCustomerProfilePage";
import {
  CustomerProfilePageView,
  CustomerProfileSignInView,
} from "@/features/customers/components/CustomerProfilePageView";

export default async function CustomerProfilePage() {
  const profile = await getCustomerProfilePage();

  if (!profile.authenticated) {
    return <CustomerProfileSignInView />;
  }

  return <CustomerProfilePageView profile={profile} />;
}
