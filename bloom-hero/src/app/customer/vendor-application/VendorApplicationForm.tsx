"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Upload, CheckCircle2, Info, Check } from "lucide-react";
import { Icon } from "@iconify/react";

type Step = 1 | 2 | 3;
type VendorType = "market" | "pop-up";
type VatRegistrationStatus = "vat-registered" | "non-vat-registered";

type VendorApplicationFormProps = {
  initialEmail: string;
  initialPhoneNumber: string;
};

type UploadFieldProps = {
  id: string;
  label: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
  existingUrl?: string;
};

const GOVERNMENT_ID_OPTIONS = [
  "Unified Multi-Purpose Identification (UMID) card",
  "Social Security System (SSS) card",
  "Government Service Insurance System (GSIS) card",
  "LTO Driver's License",
  "Philippine Postal ID",
  "Philippine Passport",
  "PhilHealth ID",
  "PhilID / ePhilID (PhilSys)",
  "Professional Regulation Commission (PRC) ID",
  "Alien Certification of Registration",
  "Foreign Passport",
] as const;

const STEP_ITEMS: { id: Step; label: string }[] = [
  { id: 1, label: "Shop" },
  { id: 2, label: "Business" },
  { id: 3, label: "Submit" },
];

type VendorApplicationDraft = {
  shop_name: string | null;
  shop_address: string | null;
  email: string | null;
  phone_number: string | null;
  vendor_type: VendorType | null;
  government_id_type: string | null;
  taxpayer_identification_number: string | null;
  vat_registration_status: VatRegistrationStatus | null;
  primary_business_document_url: string | null;
  government_id_document_url: string | null;
  bir_certificate_url: string | null;
  submission_status: string | null;
};

function getErrorMessage(error: unknown, fallbackMessage: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallbackMessage;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function parsePhoneNumber(value: string) {
  const compact = value.replace(/[\s-]/g, "");
  if (compact.startsWith("+63")) return { countryCode: "+63", localNumber: digitsOnly(compact.slice(3)) };
  if (compact.startsWith("63")) return { countryCode: "+63", localNumber: digitsOnly(compact.slice(2)) };
  const withCodeMatch = compact.match(/^(\+\d{1,4})(\d+)$/);
  if (withCodeMatch) return { countryCode: withCodeMatch[1], localNumber: digitsOnly(withCodeMatch[2]) };
  return { countryCode: "+63", localNumber: digitsOnly(compact) };
}

// ── UI Primitives ──────────────────────────────────────────────────────────────

function FormField({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#2D2926]">{label}</label>
      {children}
      {hint && <p className="text-[11px] text-[#A39E96]">{hint}</p>}
    </div>
  );
}

function UploadField({ id, label, file, onChange, helperText, existingUrl }: UploadFieldProps) {
  const hasFile = !!file;
  const hasExisting = !!existingUrl && !file;
  const isEmpty = !file && !existingUrl;

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-[#2D2926]">{label}</label>
      <label
        htmlFor={id}
        className={`flex h-12 w-full cursor-pointer items-center gap-3 rounded-xl border-2 border-dashed px-4 text-sm transition-all
          ${hasFile ? "border-[#2f6b4f] bg-[#2f6b4f]/5 text-[#2f6b4f]" :
            hasExisting ? "border-[#2f6b4f] bg-[#2f6b4f]/5 text-[#2f6b4f]" :
            "border-[#E8E4DE] bg-[#F9F8F6] text-[#6D6863] hover:border-[#D24B46] hover:bg-white hover:text-[#D24B46]"}`}
      >
        {hasFile || hasExisting ? (
          <Check size={15} className="shrink-0" />
        ) : (
          <Upload size={15} className="shrink-0" />
        )}
        <span className="truncate text-xs font-semibold">
          {hasFile ? file!.name : hasExisting ? "File already uploaded — click to replace" : "Browse file…"}
        </span>
      </label>
      <input id={id} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onChange} className="hidden" />
      {helperText && <p className="text-[11px] text-[#A39E96]">{helperText}</p>}
    </div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

export default function VendorApplicationForm({
  initialEmail,
  initialPhoneNumber,
}: VendorApplicationFormProps) {
  const initialPhoneParts = parsePhoneNumber(initialPhoneNumber);
  const router = useRouter();
  const supabase = useMemo(() => createSupabaseBrowserClient(), []);

  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [statusMessage, setStatusMessage] = useState("");

  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const raw = digitsOnly(initialPhoneParts.localNumber);
  const [phoneNumber, setPhoneNumber] = useState(raw.slice(-10));
  const [vendorType, setVendorType] = useState<VendorType>("market");
  const isPopUpVendor = vendorType === "pop-up";

  const [primaryBusinessDocumentType] = useState("DTI Certificate");
  const [governmentIdType, setGovernmentIdType] = useState("");
  const [tin, setTin] = useState("");
  const [vatRegistrationStatus, setVatRegistrationStatus] = useState<VatRegistrationStatus | "">("");

  const [primaryBusinessDocumentFile, setPrimaryBusinessDocumentFile] = useState<File | null>(null);
  const [governmentIdDocumentFile, setGovernmentIdDocumentFile] = useState<File | null>(null);
  const [birCertificateFile, setBirCertificateFile] = useState<File | null>(null);

  const [existingPrimaryBusinessDocumentUrl, setExistingPrimaryBusinessDocumentUrl] = useState("");
  const [existingGovernmentIdDocumentUrl, setExistingGovernmentIdDocumentUrl] = useState("");
  const [existingBirCertificateUrl, setExistingBirCertificateUrl] = useState("");

  useEffect(() => {
    let isMounted = true;
    async function hydrateFromDraft() {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        if (userError || !user || !isMounted) return;

        const { data, error } = await supabase
          .from("vendor_applications")
          .select("shop_name, shop_address, email, phone_number, vendor_type, government_id_type, taxpayer_identification_number, vat_registration_status, primary_business_document_url, government_id_document_url, bir_certificate_url, submission_status")
          .eq("owner_id", user.id)
          .maybeSingle<VendorApplicationDraft>();

        if (error || !data || data.submission_status !== "draft" || !isMounted) return;

        setShopName(data.shop_name ?? "");
        setShopAddress(data.shop_address ?? "");
        setEmail(data.email ?? initialEmail);

        const raw = digitsOnly(data.phone_number ?? "");
        const local10 = raw.replace(/^63/, "").slice(-10);
        setPhoneNumber(local10);

        if (data.vendor_type === "market" || data.vendor_type === "pop-up") setVendorType(data.vendor_type);

        setGovernmentIdType(data.government_id_type ?? "");
        setTin(data.taxpayer_identification_number ?? "");

        if (data.vat_registration_status === "vat-registered" || data.vat_registration_status === "non-vat-registered") {
          setVatRegistrationStatus(data.vat_registration_status);
        } else {
          setVatRegistrationStatus("");
        }

        setExistingPrimaryBusinessDocumentUrl(data.primary_business_document_url ?? "");
        setExistingGovernmentIdDocumentUrl(data.government_id_document_url ?? "");
        setExistingBirCertificateUrl(data.bir_certificate_url ?? "");
      } catch {
        // Ignore draft errors
      }
    }
    hydrateFromDraft();
    return () => { isMounted = false; };
  }, [initialEmail, supabase]);

  const onSelectFile = (setter: (file: File | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
    setter(event.target.files?.[0] ?? null);
  };

  const handlePhoneNumberChange = (e: ChangeEvent<HTMLInputElement>) => setPhoneNumber(digitsOnly(e.target.value));
  const formattedPhoneNumber = `+63${phoneNumber.trim()}`;

  function validateStepOne() {
    if (!shopName.trim()) return "Shop Name is required.";
    if (!shopAddress.trim()) return "Shop Address is required.";
    if (!email.trim()) return "Email is required.";
    if (!phoneNumber.trim()) return "Phone Number is required.";
    if (!/^\d{10}$/.test(phoneNumber.trim())) return "Phone Number must be exactly 10 digits.";
    return "";
  }

  function validateStepTwo() {
    if (!governmentIdType) return "Please select a Government ID Type.";
    if (!governmentIdDocumentFile && !existingGovernmentIdDocumentUrl) return "Please upload your Government ID document.";
    if (isPopUpVendor) return "";
    if (!tin.trim()) return "Taxpayer Identification Number (TIN) is required.";
    if (!/^[0-9-]{9,15}$/.test(tin.trim())) return "TIN must be 9 to 15 characters and can only include numbers and dashes.";
    if (!vatRegistrationStatus) return "Please select your VAT registration status.";
    if (!primaryBusinessDocumentFile && !existingPrimaryBusinessDocumentUrl) return "Please upload your Primary Business Document.";
    if (!birCertificateFile && !existingBirCertificateUrl) return "Please upload your BIR Certificate of Registration.";
    return "";
  }

  async function uploadDocument(userId: string, file: File, documentType: string) {
    const extension = file.name.split(".").pop() ?? "dat";
    const filePath = `${userId}/vendor-application/${documentType}-${Date.now()}-${crypto.randomUUID()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from("vendor-documents").upload(filePath, file, { cacheControl: "3600", upsert: true, contentType: file.type });
    if (uploadError) throw new Error(`Failed to upload ${documentType.replace("-", " ")} document. ${uploadError.message}`);
    const { data: { publicUrl } } = supabase.storage.from("vendor-documents").getPublicUrl(filePath);
    return publicUrl;
  }

  async function saveApplicationDraft() {
    setErrorMessage("");
    setStatusMessage("");
    setIsSaving(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message ?? "You need to log in again.");
      const { error } = await supabase.from("vendor_applications").upsert(
        {
          owner_id: user.id,
          shop_name: shopName.trim() || null,
          shop_address: shopAddress.trim() || null,
          email: email.trim() || null,
          phone_number: formattedPhoneNumber || null,
          vendor_type: vendorType,
          business_submission_timing: null,
          primary_business_document_type: isPopUpVendor ? null : primaryBusinessDocumentType,
          government_id_type: governmentIdType || null,
          taxpayer_identification_number: isPopUpVendor ? null : tin.trim() || null,
          vat_registration_status: isPopUpVendor ? null : vatRegistrationStatus || null,
          submission_status: "draft",
        },
        { onConflict: "owner_id" }
      );
      if (error) throw new Error(error.message);
      setStatusMessage("Draft saved successfully.");
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to save draft."));
    } finally {
      setIsSaving(false);
    }
  }

  async function handleFinalSubmit() {
    setErrorMessage("");
    setStatusMessage("");
    const stepOneError = validateStepOne();
    if (stepOneError) { setErrorMessage(stepOneError); setCurrentStep(1); return; }
    const stepTwoError = validateStepTwo();
    if (stepTwoError) { setErrorMessage(stepTwoError); setCurrentStep(2); return; }
    setIsSubmitting(true);
    try {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      if (userError || !user) throw new Error(userError?.message ?? "You need to log in again.");

      let primaryBusinessDocumentUrl = existingPrimaryBusinessDocumentUrl || null;
      let governmentIdDocumentUrl = existingGovernmentIdDocumentUrl || null;
      let birCertificateUrl = existingBirCertificateUrl || null;

      if (governmentIdDocumentFile) {
        governmentIdDocumentUrl = await uploadDocument(user.id, governmentIdDocumentFile, "government-id");
        setExistingGovernmentIdDocumentUrl(governmentIdDocumentUrl);
      }
      if (!isPopUpVendor && primaryBusinessDocumentFile) {
        primaryBusinessDocumentUrl = await uploadDocument(user.id, primaryBusinessDocumentFile, "primary-business-document");
        setExistingPrimaryBusinessDocumentUrl(primaryBusinessDocumentUrl);
      }
      if (!isPopUpVendor && birCertificateFile) {
        birCertificateUrl = await uploadDocument(user.id, birCertificateFile, "bir-certificate");
        setExistingBirCertificateUrl(birCertificateUrl);
      }

      const { error: applicationError } = await supabase.from("vendor_applications").upsert(
        {
          owner_id: user.id,
          shop_name: shopName.trim(),
          shop_address: shopAddress.trim(),
          email: email.trim(),
          phone_number: formattedPhoneNumber,
          vendor_type: vendorType,
          business_submission_timing: null,
          primary_business_document_type: isPopUpVendor ? null : primaryBusinessDocumentType,
          primary_business_document_url: isPopUpVendor ? null : primaryBusinessDocumentUrl,
          government_id_type: governmentIdType,
          government_id_document_url: governmentIdDocumentUrl,
          taxpayer_identification_number: isPopUpVendor ? null : tin.trim(),
          vat_registration_status: isPopUpVendor ? null : vatRegistrationStatus,
          bir_certificate_url: isPopUpVendor ? null : birCertificateUrl,
          submission_status: "submitted",
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "owner_id" }
      );
      if (applicationError) throw new Error(applicationError.message);

      const { error: roleError } = await supabase.from("users").update({ role: "customer", contact_number: formattedPhoneNumber }).eq("id", user.id);
      if (roleError) throw new Error(roleError.message);

      const { error: vendorError } = await supabase.from("vendors").upsert({ owner_id: user.id, shop_name: shopName.trim(), vendor_type: vendorType }, { onConflict: "owner_id" });
      if (vendorError) throw new Error(vendorError.message);
      setCurrentStep(3);
      router.refresh();
    } catch (error) {
      setErrorMessage(getErrorMessage(error, "Failed to submit vendor application."));
    } finally {
      setIsSubmitting(false);
    }
  }

  const stepOneCompleted = currentStep > 1;
  const stepTwoCompleted = currentStep > 2;

  return (
    <section className="mx-auto max-w-2xl rounded-2xl border border-[#E8E4DE] bg-white p-8 shadow-lg shadow-black/5 sm:p-10">

      {/* ── Progress Stepper ── */}
      <nav className="mb-10">
        <ol className="flex items-center">
          {STEP_ITEMS.map((item, idx) => {
            const isActive = currentStep === item.id;
            const isCompleted = item.id === 1 ? stepOneCompleted : item.id === 2 ? stepTwoCompleted : false;
            return (
              <li key={item.id} className="relative flex flex-1 flex-col items-center">
                {idx !== 0 && (
                  <div
                    className={`absolute right-1/2 top-4 -z-10 h-[2px] w-full transition-colors duration-500 ${
                      isCompleted ? "bg-[#D24B46]" : "bg-[#E8E4DE]"
                    }`}
                  />
                )}
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full border-2 text-xs font-bold transition-all duration-300 ${
                    isActive || isCompleted
                      ? "border-[#D24B46] bg-[#D24B46] text-white"
                      : "border-[#E8E4DE] bg-white text-[#A39E96]"
                  }`}
                >
                  {isCompleted ? <Check size={14} strokeWidth={3} /> : item.id}
                </div>
                <span
                  className={`mt-2 text-[10px] font-semibold uppercase tracking-widest transition-colors ${
                    isActive ? "text-[#2D2926]" : "text-[#A39E96]"
                  }`}
                >
                  {item.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      <div className="min-h-[400px]">

        {/* ── Step 1: Shop Information ── */}
        {currentStep === 1 && (
          <div className="space-y-7">
            <header>
              <h2 className="text-2xl font-bold text-[#2D2926]">Shop Information</h2>
              <p className="mt-1 text-sm text-[#6D6863]">Tell us a bit about your floral business.</p>
            </header>

            <div className="grid gap-5">
              <FormField label="Shop Name *">
                <input
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  maxLength={30}
                  className="input-style"
                  placeholder="e.g. Bloom & Wild"
                />
              </FormField>

              <FormField label="Shop Address *">
                <input
                  value={shopAddress}
                  onChange={(e) => setShopAddress(e.target.value)}
                  maxLength={100}
                  className="input-style"
                  placeholder="Enter pickup or business address"
                />
              </FormField>

              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Email Address *">
                  <input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    maxLength={50}
                    className="input-style"
                    placeholder="name@email.com"
                  />
                </FormField>

                <FormField label="Contact Number *" hint="Enter your 10-digit number after +63">
                  {/* Unified phone field — prefix fused with input */}
                  <div className="flex h-12 w-full overflow-hidden rounded-xl border border-[#E8E4DE] bg-[#F9F8F6] transition-all focus-within:border-[#D24B46] focus-within:bg-white focus-within:shadow-[0_0_0_4px_rgba(195,74,68,0.08)]">
                    <span className="flex items-center border-r border-[#E8E4DE] bg-[#F0EDEA] px-4 text-sm font-semibold text-[#6D6863] select-none">
                      +63
                    </span>
                    <input
                      value={phoneNumber}
                      onChange={(e) => {
                        const digits = digitsOnly(e.target.value).slice(0, 10);
                        setPhoneNumber(digits);
                      }}
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      maxLength={10}
                      className="min-w-0 flex-1 bg-transparent px-4 text-sm text-[#2D2926] placeholder:text-[#A39E96] focus:outline-none"
                      placeholder="9XXXXXXXXX"
                    />
                  </div>
                </FormField>
              </div>

              {/* Shop Type */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-[#2D2926]">Shop Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {(["market", "pop-up"] as VendorType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setVendorType(type)}
                      className={`relative rounded-xl border-2 p-4 text-left transition-all ${
                        vendorType === type
                          ? "border-[#D24B46] bg-[#D24B46]/5"
                          : "border-[#E8E4DE] bg-white hover:border-[#D24B46]/40"
                      }`}
                    >
                      {vendorType === type && (
                        <span className="absolute right-3 top-3 flex h-5 w-5 items-center justify-center rounded-full bg-[#D24B46] text-white">
                          <Check size={11} strokeWidth={3} />
                        </span>
                      )}
                      <p className="pr-6 text-sm font-bold capitalize text-[#2D2926]">
                        {type === "market" ? "Market" : "Pop-Up"}
                      </p>
                      <p className="mt-0.5 text-xs text-[#6D6863]">
                        {type === "market" ? "Permanent storefront" : "Occasional seller"}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Step 2: Business Information ── */}
        {currentStep === 2 && (
          <div className="space-y-7">
            <header>
              <h2 className="text-2xl font-bold text-[#2D2926]">Business Details</h2>
              <p className="mt-1 text-sm text-[#6D6863]">Provide the necessary documents for verification.</p>
            </header>

            <div className="flex items-start gap-3 rounded-xl border border-[#D24B46]/15 bg-[#D24B46]/5 p-4 text-sm text-[#2D2926]">
              <Info className="mt-0.5 shrink-0 text-[#D24B46]" size={16} />
              <p className="leading-relaxed">
                {isPopUpVendor
                  ? "For pop-up applications, only a valid government ID is required at this stage."
                  : "Accurate details ensure smooth payouts and compliance with local tax regulations."}
              </p>
            </div>

            <div className="grid gap-6">
              {/* Government ID — always shown */}
              <div className="grid gap-5 sm:grid-cols-2">
                <FormField label="Government ID Type *">
                  <div className="relative">
                    <select
                      value={governmentIdType}
                      onChange={(e) => setGovernmentIdType(e.target.value)}
                      className="input-style appearance-none pr-10"
                    >
                      <option value="">Select an ID type</option>
                      {GOVERNMENT_ID_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>{opt}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
                      <Icon icon="material-symbols:keyboard-arrow-down-rounded" width={20} height={20} className="text-[#A39E96]" />
                    </div>
                  </div>
                </FormField>

                <UploadField
                  id="governmentIdDocument"
                  label="Government ID Document *"
                  file={governmentIdDocumentFile}
                  onChange={onSelectFile(setGovernmentIdDocumentFile)}
                  helperText="JPG, PNG, or PDF — max 20 MB"
                  existingUrl={existingGovernmentIdDocumentUrl}
                />
              </div>

              {/* Market-only fields */}
              {!isPopUpVendor && (
                <div className="space-y-6 border-t border-[#E8E4DE] pt-6">
                  <div className="grid gap-5 sm:grid-cols-2">
                    <FormField label="Primary Business Document *">
                      <input
                        value="DTI Certificate"
                        readOnly
                        className="input-style cursor-not-allowed bg-[#F0EDEA] text-[#A39E96]"
                      />
                    </FormField>
                    <UploadField
                      id="primaryBusinessDocument"
                      label="Upload DTI Certificate *"
                      file={primaryBusinessDocumentFile}
                      onChange={onSelectFile(setPrimaryBusinessDocumentFile)}
                      helperText="JPG, PNG, or PDF — max 20 MB"
                      existingUrl={existingPrimaryBusinessDocumentUrl}
                    />
                  </div>

                  <div className="space-y-5 border-t border-[#E8E4DE] pt-5">
                    <h3 className="text-base font-bold text-[#2D2926]">Tax Information</h3>

                    <div className="grid gap-5 sm:grid-cols-2">
                      <FormField
                        label="Taxpayer Identification Number (TIN) *"
                        hint="Your 9-digit TIN + 3–5 digit branch code"
                      >
                        <input
                          value={tin}
                          onChange={(e) => setTin(e.target.value)}
                          maxLength={15}
                          className="input-style"
                          placeholder="999-999-999-000"
                        />
                      </FormField>

                      <FormField label="VAT Registration Status *">
                        <div className="flex h-12 gap-2">
                          {(["vat-registered", "non-vat-registered"] as VatRegistrationStatus[]).map((st) => (
                            <button
                              key={st}
                              type="button"
                              onClick={() => setVatRegistrationStatus(st)}
                              className={`flex h-full flex-1 items-center justify-center rounded-xl border-2 text-xs font-semibold transition-all ${
                                vatRegistrationStatus === st
                                  ? "border-[#D24B46] bg-[#D24B46]/5 text-[#D24B46]"
                                  : "border-[#E8E4DE] bg-white text-[#6D6863] hover:border-[#D24B46]/40"
                              }`}
                            >
                              {st === "vat-registered" ? "VAT Registered" : "Non-VAT"}
                            </button>
                          ))}
                        </div>
                      </FormField>
                    </div>

                    <UploadField
                      id="birCertificateDocument"
                      label="BIR Certificate of Registration *"
                      file={birCertificateFile}
                      onChange={onSelectFile(setBirCertificateFile)}
                      helperText="JPG, PNG, or PDF — max 20 MB"
                      existingUrl={existingBirCertificateUrl}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Step 3: Success ── */}
        {currentStep === 3 && (
          <div className="flex flex-col items-center py-14 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#D24B46]/10 text-[#D24B46]">
              <CheckCircle2 size={36} />
            </div>
            <h2 className="text-2xl font-bold text-[#2D2926]">Application Submitted!</h2>
            <p className="mt-3 max-w-sm text-sm leading-relaxed text-[#7A7774]">
              Your application is now under review. Our admin team will verify your documents within{" "}
              <strong className="text-[#2D2926]">24–48 hours</strong> and notify you once approved.
            </p>
            <button
              type="button"
              onClick={() => router.push("/")}
              className="mt-8 rounded-full bg-[#2D2926] px-8 py-3 text-sm font-bold text-white shadow-md transition-all hover:bg-black active:scale-95"
            >
              Back to Home
            </button>
          </div>
        )}
      </div>

      {/* ── Error / Status Messages ── */}
      {errorMessage && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-[#D24B46]/20 bg-[#D24B46]/5 px-4 py-3 text-sm font-semibold text-[#D24B46]">
          <Icon icon="material-symbols:error-outline-rounded" width={18} />
          {errorMessage}
        </div>
      )}
      {statusMessage && (
        <div className="mt-4 flex items-center gap-2 rounded-xl border border-[#2f6b4f]/20 bg-[#2f6b4f]/5 px-4 py-3 text-sm font-semibold text-[#2f6b4f]">
          <Check size={16} />
          {statusMessage}
        </div>
      )}

      {/* ── Navigation Buttons ── */}
      {currentStep !== 3 && (
        <div className="mt-8 flex items-center justify-between border-t border-[#E8E4DE] pt-6">
          <button
            type="button"
            onClick={() => setCurrentStep((prev) => (prev === 2 ? 1 : prev))}
            className={`text-sm font-semibold text-[#A39E96] transition-colors hover:text-[#2D2926] ${
              currentStep === 1 ? "invisible" : ""
            }`}
          >
            ← Back
          </button>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isSaving || isSubmitting}
              onClick={saveApplicationDraft}
              className="rounded-full border border-[#E8E4DE] px-5 py-2.5 text-sm font-semibold text-[#6D6863] transition-colors hover:bg-[#F9F8F6] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSaving ? "Saving…" : "Save Draft"}
            </button>

            {currentStep === 1 ? (
              <button
                type="button"
                onClick={() => {
                  const err = validateStepOne();
                  if (err) { setErrorMessage(err); return; }
                  setErrorMessage("");
                  setStatusMessage("");
                  setCurrentStep(2);
                }}
                className="rounded-full bg-[#D24B46] px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-[#D24B46]/20 transition-all hover:bg-[#A53A35] active:scale-95"
              >
                Next Step →
              </button>
            ) : (
              <button
                type="button"
                disabled={isSubmitting || isSaving}
                onClick={handleFinalSubmit}
                className="rounded-full bg-[#D24B46] px-8 py-2.5 text-sm font-bold text-white shadow-md shadow-[#D24B46]/20 transition-all hover:bg-[#A53A35] active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? "Submitting…" : "Submit Application"}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Input styles */}
      <style>{`
        .input-style {
          width: 100%; height: 3rem;
          border-radius: 0.75rem;
          border: 1.5px solid #E8E4DE;
          background-color: #F9F8F6;
          padding: 0 1rem;
          font-size: 0.875rem;
          color: #2D2926;
          transition: all 0.18s ease;
          outline: none;
          font-family: inherit;
        }
        .input-style:focus {
          border-color: #D24B46;
          background-color: white;
          box-shadow: 0 0 0 4px rgba(195,74,68,0.08);
        }
        .input-style::placeholder { color: #A39E96; }
        .input-style:disabled,
        .input-style[readonly] { background-color: #F0EDEA; color: #A39E96; cursor: not-allowed; }
      `}</style>
    </section>
  );
}
