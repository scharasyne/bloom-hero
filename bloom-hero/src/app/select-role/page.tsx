"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldTitle,
} from "@/components/ui/field"
import {
  RadioGroup,
  RadioGroupItem,
} from "@/components/ui/radio-group"

const formSchema = z.object({
  role: z.enum(["admin", "vendor", "customer"]),
  vendor_type: z.enum(["pop-up", "market"]).optional(),
}).refine((data) => {
  if(data.role === "vendor" && !data.vendor_type)
    return false;
  return true;
},{
  message: "Please select a vendor type",
  path: ["vendor_type"],
});

const roles = [
  {
    id: "customer",
    title: "Customer",
    description: "I want to sign up as a customer",
  },
  {
    id: "vendor",
    title: "Vendor",
    description: "I want to sign up as a vendor",
  },
] as const

export default function SelectRolePage() {
  const router = useRouter();
  const supabase = createSupabaseBrowserClient();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      role: "customer"
    },
  })

  const selectedRole = form.watch("role");

  async function onSubmit(values: z.infer<typeof formSchema>){
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return router.push("/sign-up");

    if (values.role === "customer") {
      await supabase.from("customers").insert({ user_id: user.id });
    } else if (values.role === "vendor") {
      await supabase.from("users").update({ role: "vendor" }).eq("id", user.id);
      if(values.vendor_type === "market")
        await supabase.from("vendors").insert({ user_id: user.id, vendor_type: "market" });
      else
        await supabase.from("vendors").insert({ user_id: user.id, vendor_type: "pop-up" });
    }

    if (values.role === "vendor"){
      if(values.vendor_type === "market")
          router.push("/vendor/market/dashboard");
      else if(values.vendor_type === "pop-up")
          router.push("/vendor/pop-up/dashboard");
    }
    else router.push("/customer/dashboard");
  }

  return (
    <div className="flex justify-center items-center h-screen">
    <Card className="w-full sm:max-w-md">
      <CardHeader>
        <CardTitle>Select your desired role</CardTitle>
        <CardDescription>
          See the description of roles.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form id="form-rhf-radiogroup" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="role"
              control={form.control}
              render={({ field, fieldState }) => (
                <FieldSet data-invalid={fieldState.invalid}>
                  <FieldLegend>Role</FieldLegend>
                  <FieldDescription>
                    You may submit requirements later.
                  </FieldDescription>
                  <RadioGroup
                    name={field.name}
                    value={field.value}
                    onValueChange={field.onChange}
                    aria-invalid={fieldState.invalid}
                  >
                    {roles.map((role) => (
                      <FieldLabel
                        key={role.id}
                        htmlFor={`form-rhf-radiogroup-${role.id}`}
                      >
                        <Field
                          orientation="horizontal"
                          data-invalid={fieldState.invalid}
                        >
                          <FieldContent>
                            <FieldTitle>{role.title}</FieldTitle>
                            <FieldDescription>
                              {role.description}
                            </FieldDescription>
                          </FieldContent>
                          <RadioGroupItem
                            value={role.id}
                            id={`form-rhf-radiogroup-${role.id}`}
                            aria-invalid={fieldState.invalid}
                          />
                        </Field>
                      </FieldLabel>
                    ))}
                  </RadioGroup>
                  {
                    selectedRole === "vendor" && (
                      <Controller name="vendor_type"
                      control={form.control}
                      render={({ field, fieldState }) => (
                        <FieldSet data-invalid={fieldState.invalid}>
                          <FieldLegend>Vendor Type</FieldLegend>
                          <RadioGroup
                            name={field.name}
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <FieldLabel htmlFor="vendor-type-popup">
                              <Field orientation="horizontal">
                                <FieldContent>
                                  <FieldTitle>Pop-up</FieldTitle>
                                </FieldContent>
                                <RadioGroupItem value="pop-up" id="vendor-type-popup" />
                              </Field>
                            </FieldLabel>  
                            <FieldLabel htmlFor="vendor-type-market">
                              <Field orientation="horizontal">
                                <FieldContent>
                                  <FieldTitle>Market Stall</FieldTitle>
                                </FieldContent>
                                <RadioGroupItem value="market" id="vendor-type-market" />
                              </Field>
                            </FieldLabel>
                          </RadioGroup>
                          {fieldState.invalid && <FieldError errors={[fieldState.error]} />}
                        </FieldSet>  
                      )}
                      />
                    )
                  }
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </FieldSet>
              )}
            />
          </FieldGroup>
        </form>
      </CardContent>
      <CardFooter>
        <Field orientation="horizontal">
          <Button type="button" variant="outline" onClick={() => form.reset()}>
            Reset
          </Button>
          <Button type="submit" form="form-rhf-radiogroup">
            Save
          </Button>
        </Field>
      </CardFooter>
    </Card>
    </div>
)
}
