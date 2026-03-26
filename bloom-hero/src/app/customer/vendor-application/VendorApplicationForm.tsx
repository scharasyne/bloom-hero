"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";
import { Upload } from "lucide-react";

type Step = 1 | 2 | 3;
type VendorType = "market" | "pop-up";
type VatRegistrationStatus = "vat-registered" | "non-vat-registered";
type YesNo = "yes" | "no";

type VendorApplicationFormProps = {
  initialEmail: string;
  initialPhoneNumber: string;
};

type UploadFieldProps = {
  id: string;
  file: File | null;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  helperText?: string;
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
  { id: 1, label: "Shop Information" },
  { id: 2, label: "Business Information" },
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
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallbackMessage;
}

function digitsOnly(value: string) {
  return value.replace(/\D/g, "");
}

function parsePhoneNumber(value: string) {
  const compact = value.replace(/[\s-]/g, "");

  if (compact.startsWith("+63")) {
    return {
      countryCode: "+63",
      localNumber: digitsOnly(compact.slice(3)),
    };
  }

  if (compact.startsWith("63")) {
    return {
      countryCode: "+63",
      localNumber: digitsOnly(compact.slice(2)),
    };
  }

  const withCodeMatch = compact.match(/^(\+\d{1,4})(\d+)$/);

  if (withCodeMatch) {
    return {
      countryCode: withCodeMatch[1],
      localNumber: digitsOnly(withCodeMatch[2]),
    };
  }

  return {
    countryCode: "+63",
    localNumber: digitsOnly(compact),
  };
}

function UploadField({ id, file, onChange, helperText }: UploadFieldProps) {
  return (
    <div className="space-y-2">
      <input id={id} type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={onChange} className="hidden" />
      <label
        htmlFor={id}
        className="inline-flex cursor-pointer items-center gap-2 rounded border border-[#d4d4d4] bg-white px-4 py-2 text-sm font-semibold text-[#2f2f2f] hover:bg-[#f5f5f5]"
      >
        <Upload size={16} aria-hidden="true" />
        Upload
      </label>
      <p className="text-xs text-[#8a8a8a]">{file ? file.name : "No file selected"}</p>
      {helperText ? <p className="text-xs text-[#8a8a8a]">{helperText}</p> : null}
    </div>
  );
}

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
  const [submittedVendorType, setSubmittedVendorType] = useState<VendorType>("market");

  const [shopName, setShopName] = useState("");
  const [shopAddress, setShopAddress] = useState("");
  const [email, setEmail] = useState(initialEmail);
  const [countryCode, setCountryCode] = useState(initialPhoneParts.countryCode);
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneParts.localNumber);
  const [vendorType, setVendorType] = useState<VendorType>("market");
  const isPopUpVendor = vendorType === "pop-up";

  const [primaryBusinessDocumentType] = useState("DTI Certificate");
  const [governmentIdType, setGovernmentIdType] = useState("");
  const [tin, setTin] = useState("");
  const [vatRegistrationStatus, setVatRegistrationStatus] =
    useState<VatRegistrationStatus | "">("");
//   const [submitSwornDeclaration, setSubmitSwornDeclaration] = useState<YesNo | "">("");

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
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError || !user || !isMounted) {
          return;
        }

        const { data, error } = await supabase
          .from("vendor_applications")
          .select(
            "shop_name, shop_address, email, phone_number, vendor_type, government_id_type, taxpayer_identification_number, vat_registration_status, primary_business_document_url, government_id_document_url, bir_certificate_url, submission_status"
          )
          .eq("owner_id", user.id)
          .maybeSingle<VendorApplicationDraft>();

        if (error || !data || data.submission_status !== "draft" || !isMounted) {
          return;
        }

        setShopName(data.shop_name ?? "");
        setShopAddress(data.shop_address ?? "");
        setEmail(data.email ?? initialEmail);

        const draftPhoneParts = parsePhoneNumber(data.phone_number ?? "");
        const normalizedDraftLocalNumber = digitsOnly(draftPhoneParts.localNumber).slice(-10);
        setCountryCode(draftPhoneParts.countryCode || "+63");
        setPhoneNumber(normalizedDraftLocalNumber);

        if (data.vendor_type === "market" || data.vendor_type === "pop-up") {
          setVendorType(data.vendor_type);
        }

        setGovernmentIdType(data.government_id_type ?? "");
        setTin(data.taxpayer_identification_number ?? "");

        if (
          data.vat_registration_status === "vat-registered" ||
          data.vat_registration_status === "non-vat-registered"
        ) {
          setVatRegistrationStatus(data.vat_registration_status);
        } else {
          setVatRegistrationStatus("");
        }

        setExistingPrimaryBusinessDocumentUrl(data.primary_business_document_url ?? "");
        setExistingGovernmentIdDocumentUrl(data.government_id_document_url ?? "");
        setExistingBirCertificateUrl(data.bir_certificate_url ?? "");
      } catch {
        // Ignore draft errors and keep editable empty defaults.
      }
    }

    hydrateFromDraft();

    return () => {
      isMounted = false;
    };
  }, [initialEmail, supabase]);

  const onSelectFile =
    (setter: (file: File | null) => void) => (event: ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0] ?? null;
      setter(file);
    };

  const handlePhoneNumberChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPhoneNumber(digitsOnly(event.target.value));
  };

  const handleCountryCodeChange = (event: ChangeEvent<HTMLInputElement>) => {
    const codeDigits = digitsOnly(event.target.value);
    setCountryCode(codeDigits ? `+${codeDigits}` : "+");
  };

  const formattedPhoneNumber = `${countryCode.trim()}${phoneNumber.trim()}`;

  function validateStepOne() {
    if (!shopName.trim()) {
      return "Shop Name is required.";
    }

    if (!shopAddress.trim()) {
      return "Shop Address is required.";
    }

    if (!email.trim()) {
      return "Email is required.";
    }

    if (!phoneNumber.trim()) {
      return "Phone Number is required.";
    }

    if (!/^\+\d{1,4}$/.test(countryCode.trim())) {
      return "Country code must be in format +63.";
    }

    if (!/^\d+$/.test(phoneNumber.trim())) {
      return "Phone Number must contain numbers only.";
    }

    return "";
  }

  function validateStepTwo() {
    if (!governmentIdType) {
      return "Please select a Government ID Type.";
    }

    if (!governmentIdDocumentFile && !existingGovernmentIdDocumentUrl) {
      return "Please upload your Government ID document.";
    }

    if (isPopUpVendor) {
      return "";
    }

    if (!tin.trim()) {
      return "Taxpayer Identification Number (TIN) is required.";
    }

    if (!/^[0-9-]{9,15}$/.test(tin.trim())) {
      return "TIN must be 9 to 15 characters and can only include numbers and dashes.";
    }

    if (!vatRegistrationStatus) {
      return "Please select your VAT registration status.";
    }

    // if (!submitSwornDeclaration) {
    //   return "Please select whether you submit sworn declaration.";
    // }

    if (!primaryBusinessDocumentFile && !existingPrimaryBusinessDocumentUrl) {
      return "Please upload your Primary Business Document.";
    }

    if (!birCertificateFile && !existingBirCertificateUrl) {
      return "Please upload your BIR Certificate of Registration.";
    }

    return "";
  }

  async function uploadDocument(userId: string, file: File, documentType: string) {
    const extension = file.name.split(".").pop() ?? "dat";
    const filePath = `${userId}/vendor-application/${documentType}-${Date.now()}-${crypto.randomUUID()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("vendor-documents")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: true,
        contentType: file.type,
      });

    if (uploadError) {
      throw new Error(
        `Failed to upload ${documentType.replace("-", " ")} document. ${uploadError.message}`
      );
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("vendor-documents").getPublicUrl(filePath);

    return publicUrl;
  }

  async function saveApplicationDraft() {
    setErrorMessage("");
    setStatusMessage("");
    setIsSaving(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message ?? "You need to log in again.");
      }

      const { error } = await supabase.from("vendor_applications").upsert(
        {
          owner_id: user.id,
          shop_name: shopName.trim() || null,
          shop_address: shopAddress.trim() || null,
          email: email.trim() || null,
          phone_number: formattedPhoneNumber || null,
          vendor_type: vendorType,
          business_submission_timing: null,
          primary_business_document_type:
            isPopUpVendor ? null : primaryBusinessDocumentType,
          government_id_type: governmentIdType || null,
          taxpayer_identification_number: isPopUpVendor ? null : tin.trim() || null,
          vat_registration_status:
            isPopUpVendor ? null : vatRegistrationStatus || null,
          submission_status: "draft",
        },
        { onConflict: "owner_id" }
      );

      if (error) {
        throw new Error(error.message);
      }

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
    if (stepOneError) {
      setErrorMessage(stepOneError);
      setCurrentStep(1);
      return;
    }

    const stepTwoError = validateStepTwo();
    if (stepTwoError) {
      setErrorMessage(stepTwoError);
      setCurrentStep(2);
      return;
    }

    setIsSubmitting(true);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error(userError?.message ?? "You need to log in again.");
      }

      let primaryBusinessDocumentUrl = existingPrimaryBusinessDocumentUrl || null;
      let governmentIdDocumentUrl = existingGovernmentIdDocumentUrl || null;
      let birCertificateUrl = existingBirCertificateUrl || null;

      if (governmentIdDocumentFile) {
        governmentIdDocumentUrl = await uploadDocument(
          user.id,
          governmentIdDocumentFile,
          "government-id"
        );
        setExistingGovernmentIdDocumentUrl(governmentIdDocumentUrl);
      }

      if (!isPopUpVendor && primaryBusinessDocumentFile) {
        primaryBusinessDocumentUrl = await uploadDocument(
          user.id,
          primaryBusinessDocumentFile,
          "primary-business-document"
        );
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
          primary_business_document_type:
            isPopUpVendor ? null : primaryBusinessDocumentType,
          primary_business_document_url:
            isPopUpVendor ? null : primaryBusinessDocumentUrl,
          government_id_type: governmentIdType,
          government_id_document_url: governmentIdDocumentUrl,
          taxpayer_identification_number: isPopUpVendor ? null : tin.trim(),
          vat_registration_status:
            isPopUpVendor ? null : vatRegistrationStatus,
          bir_certificate_url: isPopUpVendor ? null : birCertificateUrl,
          submission_status: "submitted",
          submitted_at: new Date().toISOString(),
        },
        { onConflict: "owner_id" }
      );

      if (applicationError) {
        throw new Error(applicationError.message);
      }

      const { error: roleError } = await supabase
        .from("users")
        .update({ role: "vendor", contact_number: formattedPhoneNumber })
        .eq("id", user.id);

      if (roleError) {
        throw new Error(roleError.message);
      }

      const { error: vendorError } = await supabase.from("vendors").upsert(
        {
          owner_id: user.id,
          shop_name: shopName.trim(),
          vendor_type: vendorType,
        },
        { onConflict: "owner_id" }
      );

      if (vendorError) {
        throw new Error(vendorError.message);
      }

      setSubmittedVendorType(vendorType);
      setStatusMessage("Vendor application submitted successfully.");
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
    <section className="rounded-lg border border-[#dedede] bg-white px-4 py-5 shadow-sm sm:px-6 sm:py-7">
      <div className="mx-auto w-full max-w-5xl">
        <ol className="mb-6 grid grid-cols-3 text-center">
          {STEP_ITEMS.map((item) => {
            const isActive = currentStep === item.id;
            const isCompleted =
              item.id === 1 ? stepOneCompleted : item.id === 2 ? stepTwoCompleted : false;
            const showConnector = item.id !== 3;

            return (
              <li key={item.id} className="relative flex flex-col items-center gap-2">
                {showConnector ? (
                  <span
                    className={`absolute left-1/2 top-1.5 h-px w-full ${
                      isCompleted ? "bg-accent" : "bg-[#d6d6d6]"
                    }`}
                  />
                ) : null}
                <span
                  className={`relative z-10 h-3 w-3 rounded-full ${
                    isActive || isCompleted ? "bg-accent" : "bg-[#d6d6d6]"
                  }`}
                />
                <p className={`text-sm ${isActive ? "font-semibold text-[#232323]" : "text-[#9a9a9a]"}`}>
                  {item.label}
                </p>
              </li>
            );
          })}
        </ol>

        <div className="border-t border-[#ececec] pt-6">
          {currentStep === 1 ? (
            <div className="space-y-5">
              <h2 className="text-xl font-semibold text-[#1f1f1f]">Shop Information</h2>

              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                <label className="text-sm font-medium text-[#1f1f1f]">
                  <span className="text-red-600">*</span> Shop Name
                </label>
                <input
                  value={shopName}
                  onChange={(event) => setShopName(event.target.value)}
                  type="text"
                  maxLength={30}
                  className="h-10 rounded border border-[#d4d4d4] px-3 text-sm outline-none focus:border-accent"
                  placeholder="Enter your shop name"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                <label className="text-sm font-medium text-[#1f1f1f]">
                  <span className="text-red-600">*</span> Shop Address
                </label>
                <input
                  value={shopAddress}
                  onChange={(event) => setShopAddress(event.target.value)}
                  type="text"
                  maxLength={100}
                  className="h-10 rounded border border-[#d4d4d4] px-3 text-sm outline-none focus:border-accent"
                  placeholder="Enter pickup or business address"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                <label className="text-sm font-medium text-[#1f1f1f]">
                  <span className="text-red-600">*</span> Email
                </label>
                <input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  maxLength={50}
                  className="h-10 rounded border border-[#d4d4d4] px-3 text-sm outline-none focus:border-accent"
                  placeholder="name@email.com"
                />
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                <label className="text-sm font-medium text-[#1f1f1f]">
                  <span className="text-red-600">*</span> Contact Number
                </label>
                <div className="grid grid-cols-[56px_1fr] gap-2">
                  <input
                    value={countryCode}
                    onChange={handleCountryCodeChange}
                    type="text"
                    inputMode="tel"
                    maxLength={5}
                    className="h-10 rounded border border-[#d4d4d4] px-3 text-sm outline-none focus:border-accent"
                    placeholder="+63"
                  />
                  <input
                    value={phoneNumber}
                    onChange={handlePhoneNumberChange}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={11}
                    className="h-10 rounded border border-[#d4d4d4] px-3 text-sm outline-none focus:border-accent"
                    placeholder="9XXXXXXXXX"
                  />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                <p className="text-sm font-medium text-[#1f1f1f]">
                  <span className="text-red-600">*</span> Shop Type
                </p>
                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-2 rounded border border-[#d7d7d7] px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name="vendorType"
                      checked={vendorType === "pop-up"}
                      onChange={() => setVendorType("pop-up")}
                    />
                    Pop-up
                  </label>
                  <label className="flex items-center gap-2 rounded border border-[#d7d7d7] px-3 py-2 text-sm">
                    <input
                      type="radio"
                      name="vendorType"
                      checked={vendorType === "market"}
                      onChange={() => setVendorType("market")}
                    />
                    Market
                  </label>
                </div>
              </div>
            </div>
          ) : null}

          {currentStep === 2 ? (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-[#1f1f1f]">Business Information</h2>

              <div className="rounded border border-[#9cc1fb] bg-[#eef5ff] px-4 py-3 text-sm text-[#35598f]">
                {isPopUpVendor
                  ? "For pop-up applications, only a valid government ID is required at this stage."
                  : "This information will be used for compliance and invoicing purposes. Please provide accurate details to avoid invoice or tax document issues."}
              </div>

              <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                <label className="text-sm font-medium text-[#1f1f1f]">
                  <span className="text-red-600">*</span> Government ID
                </label>
                <div className="space-y-3">
                  <select
                    value={governmentIdType}
                    onChange={(event) => setGovernmentIdType(event.target.value)}
                    className="h-10 w-full rounded border border-[#d4d4d4] bg-white px-3 text-sm outline-none focus:border-accent"
                  >
                    <option value="">Select Government ID Type</option>
                    {GOVERNMENT_ID_OPTIONS.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  <UploadField
                    id="governmentIdDocument"
                    file={governmentIdDocumentFile}
                    onChange={onSelectFile(setGovernmentIdDocumentFile)}
                  />
                  {existingGovernmentIdDocumentUrl ? (
                    <p className="text-xs text-[#2f6b4f]">Government ID document already uploaded.</p>
                  ) : null}
                </div>
              </div>

              {!isPopUpVendor ? (
                <>
                  <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-center">
                    <label className="text-sm font-medium text-[#1f1f1f]">
                      <span className="text-red-600">*</span> Primary Business Document
                    </label>
                    <div className="space-y-3">
                      <select
                        value={primaryBusinessDocumentType}
                        disabled
                        className="h-10 w-full rounded border border-[#d4d4d4] bg-[#f2f2f2] px-3 text-sm text-[#777777]"
                      >
                        <option>DTI Certificate</option>
                      </select>
                      <UploadField
                        id="primaryBusinessDocument"
                        file={primaryBusinessDocumentFile}
                        onChange={onSelectFile(setPrimaryBusinessDocumentFile)}
                      />
                      {existingPrimaryBusinessDocumentUrl ? (
                        <p className="text-xs text-[#2f6b4f]">Primary business document already uploaded.</p>
                      ) : null}
                    </div>
                  </div>

                  <div className="border-t border-[#ececec] pt-6">
                    <h3 className="text-lg font-semibold text-[#1f1f1f]">Tax Information</h3>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                    <label className="pt-1 text-sm font-medium text-[#1f1f1f]">
                      <span className="text-red-600">*</span> Taxpayer Identification Number (TIN)
                    </label>
                    <div>
                      <input
                        value={tin}
                        onChange={(event) => setTin(event.target.value)}
                        type="text"
                        maxLength={15}
                        className="h-10 w-full rounded border border-[#d4d4d4] px-3 text-sm outline-none focus:border-accent"
                        placeholder="999-999-999-000"
                      />
                      <p className="mt-1 text-xs text-[#8a8a8a]">
                        Use your 9-digit TIN and 3 to 5 digit branch code. If no branch, use 000.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                    <p className="pt-1 text-sm font-medium text-[#1f1f1f]">
                      <span className="text-red-600">*</span> Value Added Tax Registration Status
                    </p>
                    <div className="flex flex-wrap gap-4">
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="vatRegistration"
                          checked={vatRegistrationStatus === "vat-registered"}
                          onChange={() => setVatRegistrationStatus("vat-registered")}
                        />
                        VAT Registered
                      </label>
                      <label className="flex items-center gap-2 text-sm">
                        <input
                          type="radio"
                          name="vatRegistration"
                          checked={vatRegistrationStatus === "non-vat-registered"}
                          onChange={() => setVatRegistrationStatus("non-vat-registered")}
                        />
                        Non-VAT Registered
                      </label>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-[220px_1fr] md:items-start">
                    <label className="pt-1 text-sm font-medium text-[#1f1f1f]">
                      <span className="text-red-600">*</span> BIR Certificate of Registration
                    </label>
                    <div>
                      <UploadField
                        id="birCertificateDocument"
                        file={birCertificateFile}
                        onChange={onSelectFile(setBirCertificateFile)}
                        helperText="Supports JPG, JPEG, PNG, PDF up to 20MB."
                      />
                      {existingBirCertificateUrl ? (
                        <p className="mt-1 text-xs text-[#2f6b4f]">BIR certificate already uploaded.</p>
                      ) : null}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
          ) : null}

          {currentStep === 3 ? (
            <div className="space-y-4 py-6 text-center">
              <h2 className="text-2xl font-semibold text-[#1f1f1f]">Thank you for registering as a vendor.</h2>
              <p className="mx-auto max-w-2xl text-sm text-[#575757]">
                Your application has been submitted successfully. You can now continue to your vendor
                dashboard and start adding products.
              </p>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => router.push(`/vendor/${submittedVendorType}/add-product`)}
                  className="cursor-pointer rounded bg-accent px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#bb3f3a]"
                >
                  Add Product
                </button>
              </div>
            </div>
          ) : null}
        </div>

        {errorMessage ? <p className="mt-5 text-sm text-[#bf312c]">{errorMessage}</p> : null}
        {statusMessage ? <p className="mt-2 text-sm text-[#2f6b4f]">{statusMessage}</p> : null}

        {currentStep !== 3 ? (
          <div className="mt-8 flex items-center justify-between border-t border-[#ececec] pt-6">
            <div>
              {currentStep > 1 ? (
                <button
                  type="button"
                  onClick={() => setCurrentStep((previous) => (previous === 2 ? 1 : previous))}
                  className="cursor-pointer rounded border border-[#d4d4d4] bg-white px-5 py-2 text-sm font-semibold text-[#2f2f2f] hover:bg-[#f5f5f5]"
                >
                  Back
                </button>
              ) : null}
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isSaving || isSubmitting}
                onClick={saveApplicationDraft}
                className="cursor-pointer rounded border border-[#d4d4d4] bg-white px-5 py-2 text-sm font-semibold text-[#2f2f2f] hover:bg-[#f5f5f5] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save"}
              </button>

              {currentStep === 1 ? (
                <button
                  type="button"
                  onClick={() => {
                    const validationError = validateStepOne();

                    if (validationError) {
                      setErrorMessage(validationError);
                      return;
                    }

                    setErrorMessage("");
                    setStatusMessage("");
                    setCurrentStep(2);
                  }}
                  className="cursor-pointer rounded bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-[#bb3f3a]"
                >
                  Next
                </button>
              ) : (
                <button
                  type="button"
                  disabled={isSubmitting || isSaving}
                  onClick={handleFinalSubmit}
                  className="cursor-pointer rounded bg-accent px-5 py-2 text-sm font-semibold text-white hover:bg-[#bb3f3a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  );
}



