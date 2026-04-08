import { redirect } from "next/navigation";

type LegacyOrdersRedirectProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function LegacyCustomerOrdersPage({
  searchParams,
}: LegacyOrdersRedirectProps) {
  const params = await searchParams;
  const query = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        query.append(key, item);
      }
      continue;
    }

    if (typeof value === "string") {
      const normalizedValue =
        key === "tab"
          ? value === "to_pay"
            ? "to-pay"
            : value === "to_ship"
              ? "to-ship"
              : value === "to_receive"
                ? "to-receive"
                : value
          : value;
      query.set(key, normalizedValue);
    }
  }

  const queryString = query.toString();
  redirect(queryString ? `/orders?${queryString}` : "/orders");
}

